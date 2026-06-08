import type { LayoutServerLoad } from './$types';
import { getServerSupabase } from '$lib/server/supabase';
import { getClientIp, voterHash } from '$lib/server/hash';
import { assignedStone } from '$lib/server/stone-roll';

export const load: LayoutServerLoad = async ({ request, getClientAddress }) => {
	const supabase = getServerSupabase();
	const ip = getClientIp(request.headers) || getClientAddress();
	const ua = request.headers.get('user-agent') ?? '';

	const [commentsRes, peakRes, hash] = await Promise.all([
		supabase.from('comments').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
		supabase.from('presence_record').select('peak').eq('id', 1).maybeSingle(),
		voterHash(ip, ua)
	]);

	const stoneKey = await assignedStone(hash);

	return {
		totalCount: commentsRes.count ?? 0,
		peakOnline: peakRes.data?.peak ?? 0,
		assignedStoneKey: stoneKey
	};
};
