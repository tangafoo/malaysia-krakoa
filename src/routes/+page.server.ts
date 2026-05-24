import { fail, type Actions, type ServerLoad } from '@sveltejs/kit';
import { getServerSupabase } from '$lib/server/supabase';
import { getClientIp, voterHash } from '$lib/server/hash';
import { moderate } from '$lib/server/moderation';
import { getLatestMCU } from '$lib/server/tmdb';
import { quoteOfTheDay } from '$lib/feige-quote';
import type { RankedComment } from '$lib/types';

export const load: ServerLoad = async ({ request, getClientAddress }) => {
	const supabase = getServerSupabase();

	const ip = getClientIp(request.headers) || getClientAddress();
	const ua = request.headers.get('user-agent') ?? '';
	const hash = await voterHash(ip, ua);
	const today = new Date().toISOString().slice(0, 10);

	const [topRes, totalRes, spotlight, refreshRes] = await Promise.all([
		supabase.from('ranked_comments').select('*').order('hot_score', { ascending: false }).limit(3),
		supabase.from('comments').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
		getLatestMCU(),
		supabase
			.from('quote_refreshes')
			.select('quote_text, quote_source')
			.eq('submitter_hash', hash)
			.eq('refresh_date', today)
			.maybeSingle()
	]);

	let spotlightCounts: { hearts: number; broken_hearts: number } | null = null;
	if (spotlight.tmdb_id) {
		const { data } = await supabase
			.from('spotlight_sentiment_counts')
			.select('*')
			.eq('spotlight_key', String(spotlight.tmdb_id))
			.maybeSingle();
		spotlightCounts = data ?? { hearts: 0, broken_hearts: 0 };
	}

	const quote = refreshRes.data
		? { quote: refreshRes.data.quote_text, source: refreshRes.data.quote_source }
		: quoteOfTheDay();

	return {
		top3: (topRes.data ?? []) as RankedComment[],
		totalCount: totalRes.count ?? 0,
		quote,
		quoteRefreshedToday: !!refreshRes.data,
		spotlight,
		spotlightCounts
	};
};

export const actions: Actions = {
	submit: async ({ request, getClientAddress }) => {
		const form = await request.formData();
		const name = (form.get('name')?.toString() ?? '').trim().slice(0, 40) || null;
		const content = (form.get('content')?.toString() ?? '').trim();

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

		const { error } = await supabase
			.from('comments')
			.insert({ name, content, status, submitter_hash: hash, moderation_flags });

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
