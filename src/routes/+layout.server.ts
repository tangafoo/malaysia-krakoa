import type { LayoutServerLoad } from './$types';
import { getServerSupabase } from '$lib/server/supabase';

export const load: LayoutServerLoad = async () => {
	const supabase = getServerSupabase();
	const [commentsRes, peakRes] = await Promise.all([
		supabase.from('comments').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
		supabase.from('presence_record').select('peak').eq('id', 1).maybeSingle()
	]);
	return {
		totalCount: commentsRes.count ?? 0,
		peakOnline: peakRes.data?.peak ?? 0
	};
};
