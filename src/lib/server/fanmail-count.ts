import type { SupabaseClient } from '@supabase/supabase-js';

// Module-level cache for the approved-fanmail count rendered by the layout
// marquee + HitCounter. Cloudflare Workers reuse warm isolates so cache hit
// rate is high under steady traffic. Cold isolates pay the COUNT cost once.
//
// Bust via bustApprovedCountCache() after any action that changes the approved
// count (new fanmail submission, admin approval of a pending row).
let approvedCountCache: { value: number; ts: number } | null = null;
const APPROVED_COUNT_TTL_MS = 60_000;

export async function getApprovedCommentCount(supabase: SupabaseClient): Promise<number> {
	if (approvedCountCache && Date.now() - approvedCountCache.ts < APPROVED_COUNT_TTL_MS) {
		return approvedCountCache.value;
	}
	const { count } = await supabase
		.from('comments')
		.select('*', { count: 'exact', head: true })
		.eq('status', 'approved');
	const value = count ?? 0;
	approvedCountCache = { value, ts: Date.now() };
	return value;
}

export function bustApprovedCountCache(): void {
	approvedCountCache = null;
}
