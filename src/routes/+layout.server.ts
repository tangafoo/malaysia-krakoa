import type { LayoutServerLoad } from './$types';
import { getServerSupabase } from '$lib/server/supabase';

export const load: LayoutServerLoad = async () => {
	const supabase = getServerSupabase();
	const { count } = await supabase
		.from('comments')
		.select('*', { count: 'exact', head: true })
		.eq('status', 'approved');
	return { totalCount: count ?? 0 };
};
