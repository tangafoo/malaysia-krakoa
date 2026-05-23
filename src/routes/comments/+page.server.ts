import type { ServerLoad } from '@sveltejs/kit';
import { getServerSupabase } from '$lib/server/supabase';
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
	const { data, count } = await query.range(from, to);

	const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

	return {
		comments: (data ?? []) as RankedComment[],
		page,
		totalPages,
		total: count ?? 0,
		sort,
		q
	};
};
