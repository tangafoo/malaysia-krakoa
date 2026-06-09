import { fail, type Actions, type ServerLoad } from '@sveltejs/kit';
import { getServerSupabase } from '$lib/server/supabase';
import { getClientIp, voterHash } from '$lib/server/hash';
import { moderate } from '$lib/server/moderation';
import { getMCUSpotlights } from '$lib/server/tmdb';
import { getLatestSummary } from '$lib/server/summarize';
import { quoteOfTheDay } from '$lib/feige-quote';
import {
	basePrimaryFlairsByPopularity,
	PRIMARY_KEYS,
	SECONDARY_KEYS,
	type PrimaryFlairKey
} from '$lib/flairs';
import { rollDailyStone, todayUtc } from '$lib/server/stone-roll';
import type { RankedComment } from '$lib/types';

export const load: ServerLoad = async ({ request, getClientAddress }) => {
	const supabase = getServerSupabase();

	const ip = getClientIp(request.headers) || getClientAddress();
	const ua = request.headers.get('user-agent') ?? '';
	const hash = await voterHash(ip, ua);
	const today = new Date().toISOString().slice(0, 10);

	const [topRes, totalRes, spotlights, refreshRes, flairUsageRes, summary] = await Promise.all([
		supabase.from('ranked_comments').select('*').order('hot_score', { ascending: false }).limit(3),
		supabase.from('comments').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
		getMCUSpotlights(),
		supabase
			.from('quote_refreshes')
			.select('quote_text, quote_source')
			.eq('submitter_hash', hash)
			.eq('refresh_date', today)
			.maybeSingle(),
		supabase
			.from('comments')
			.select('primary_flair')
			.eq('status', 'approved')
			.not('primary_flair', 'is', null),
		getLatestSummary()
	]);

	const primaryCounts: Record<string, number> = {};
	for (const row of (flairUsageRes.data ?? []) as { primary_flair: string | null }[]) {
		if (row.primary_flair) {
			primaryCounts[row.primary_flair] = (primaryCounts[row.primary_flair] ?? 0) + 1;
		}
	}

	const composerPrimaryFlairKeys: PrimaryFlairKey[] = basePrimaryFlairsByPopularity(
		primaryCounts
	).map((f) => f.key);
	const rolledStoneKey = await rollDailyStone(hash, todayUtc());
	if (rolledStoneKey) {
		composerPrimaryFlairKeys.push(rolledStoneKey);
	}

	const spotlightKeys = spotlights.map((s) => (s.tmdb_id ? String(s.tmdb_id) : null));
	const knownKeys = spotlightKeys.filter((k): k is string => k !== null);
	const countsByKey = new Map<string, { hearts: number; broken_hearts: number }>();
	if (knownKeys.length > 0) {
		const { data } = await supabase
			.from('spotlight_sentiment_counts')
			.select('*')
			.in('spotlight_key', knownKeys);
		for (const row of data ?? []) {
			countsByKey.set(row.spotlight_key, {
				hearts: row.hearts ?? 0,
				broken_hearts: row.broken_hearts ?? 0
			});
		}
	}
	const spotlightCounts = spotlightKeys.map((key) =>
		key ? (countsByKey.get(key) ?? { hearts: 0, broken_hearts: 0 }) : null
	);

	const quote = refreshRes.data
		? { quote: refreshRes.data.quote_text, source: refreshRes.data.quote_source }
		: quoteOfTheDay();

	return {
		top3: (topRes.data ?? []) as RankedComment[],
		totalCount: totalRes.count ?? 0,
		quote,
		quoteRefreshedToday: !!refreshRes.data,
		spotlights,
		spotlightCounts,
		composerPrimaryFlairKeys,
		summary
	};
};

export const actions: Actions = {
	submit: async ({ request, getClientAddress }) => {
		const form = await request.formData();
		const name = (form.get('name')?.toString() ?? '').trim().slice(0, 40) || null;
		const content = (form.get('content')?.toString() ?? '').trim();
		const primaryRaw = (form.get('primary_flair')?.toString() ?? '').trim();
		const secondaryRaw = (form.get('secondary_flair')?.toString() ?? '').trim();
		const primary_flair = PRIMARY_KEYS.has(primaryRaw) ? primaryRaw : null;
		const secondary_flair = SECONDARY_KEYS.has(secondaryRaw) ? secondaryRaw : null;

		if (content.length < 1 || content.length > 500) {
			return fail(400, { name, content, error: 'Message must be 1–500 characters.' });
		}

		const ip = getClientIp(request.headers) || getClientAddress();
		const ua = request.headers.get('user-agent') ?? '';
		const hash = await voterHash(ip, ua);

		const supabase = getServerSupabase();

		// Rate limit: max 3 submissions per submitter_hash in last 10 minutes
		const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
		const { count } = await supabase
			.from('comments')
			.select('*', { count: 'exact', head: true })
			.eq('submitter_hash', hash)
			.gte('created_at', tenMinAgo);

		if ((count ?? 0) >= 3) {
			return fail(429, {
				name,
				content,
				error: "Slow down! You're posting too fast. Try again in a few minutes."
			});
		}

		const moderation = await moderate(content);
		const status = moderation.flagged ? 'pending' : 'approved';
		const moderation_flags = moderation.flagged ? moderation.categories : null;

		const { error } = await supabase.from('comments').insert({
			name,
			content,
			status,
			submitter_hash: hash,
			moderation_flags,
			primary_flair,
			secondary_flair
		});

		if (error) {
			console.error('insert comment failed', error);
			return fail(500, { name, content, error: 'Could not save your message. Try again.' });
		}

		return {
			success: true,
			pending: moderation.flagged,
			message: moderation.flagged
				? "Your message is in the queue. We'll review it shortly!"
				: 'Your message is live ✨'
		};
	}
};
