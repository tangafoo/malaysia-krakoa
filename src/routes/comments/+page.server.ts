import type { ServerLoad } from '@sveltejs/kit';
import { getServerSupabase } from '$lib/server/supabase';
import { PRIMARY_KEYS, SECONDARY_KEYS, basePrimaryFlairsByPopularity } from '$lib/flairs';
import type { RankedComment, SortKey } from '$lib/types';

const PAGE_SIZE = 20;

const SORT_COLUMN: Record<SortKey, { column: string; ascending: boolean }> = {
	hot: { column: 'hot_score', ascending: false },
	new: { column: 'created_at', ascending: false },
	top: { column: 'upvotes', ascending: false },
	controversial: { column: 'controversy_score', ascending: false }
};

export const load: ServerLoad = async ({ url }) => {
	const sortParam = (url.searchParams.get('sort') ?? 'hot') as SortKey;
	const sort: SortKey = sortParam in SORT_COLUMN ? sortParam : 'hot';
	const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10) || 1);
	const q = (url.searchParams.get('q') ?? '').trim();
	const primaryRaw = url.searchParams.get('primary') ?? '';
	const secondaryRaw = url.searchParams.get('secondary') ?? '';
	const primary = PRIMARY_KEYS.has(primaryRaw) ? primaryRaw : '';
	const secondary = SECONDARY_KEYS.has(secondaryRaw) ? secondaryRaw : '';

	const from = (page - 1) * PAGE_SIZE;
	const to = from + PAGE_SIZE - 1;

	const supabase = getServerSupabase();
	const { column, ascending } = SORT_COLUMN[sort];

	let query = supabase
		.from('ranked_comments')
		.select('*', { count: 'exact' })
		.order(column, { ascending });
	if (q) {
		query = query.ilike('content', `%${q}%`);
	}
	if (primary) {
		query = query.eq('primary_flair', primary);
	}
	if (secondary) {
		query = query.eq('secondary_flair', secondary);
	}
	const { data, count } = await query.range(from, to);

	const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

	const [primaryUsage, secondaryUsage] = await Promise.all([
		supabase
			.from('comments')
			.select('primary_flair')
			.eq('status', 'approved')
			.not('primary_flair', 'is', null),
		supabase
			.from('comments')
			.select('secondary_flair')
			.eq('status', 'approved')
			.not('secondary_flair', 'is', null)
	]);

	const primaryCounts: Record<string, number> = {};
	for (const row of (primaryUsage.data ?? []) as { primary_flair: string | null }[]) {
		if (row.primary_flair) {
			primaryCounts[row.primary_flair] = (primaryCounts[row.primary_flair] ?? 0) + 1;
		}
	}
	const secondaryCounts: Record<string, number> = {};
	for (const row of (secondaryUsage.data ?? []) as { secondary_flair: string | null }[]) {
		if (row.secondary_flair) {
			secondaryCounts[row.secondary_flair] = (secondaryCounts[row.secondary_flair] ?? 0) + 1;
		}
	}

	const orderedPrimaryFlairKeys = basePrimaryFlairsByPopularity(primaryCounts).map((f) => f.key);

	return {
		comments: (data ?? []) as RankedComment[],
		page,
		totalPages,
		total: count ?? 0,
		sort,
		q,
		primary,
		secondary,
		orderedPrimaryFlairKeys,
		primaryCounts,
		secondaryCounts
	};
};
