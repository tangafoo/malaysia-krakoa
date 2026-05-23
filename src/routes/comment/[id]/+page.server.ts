import { error, type ServerLoad } from '@sveltejs/kit';
import { getServerSupabase } from '$lib/server/supabase';
import type { Comment } from '$lib/types';

export const load: ServerLoad = async ({ params }) => {
	const supabase = getServerSupabase();
	const { data } = await supabase
		.from('comments')
		.select('*')
		.eq('id', params.id!)
		.eq('status', 'approved')
		.maybeSingle();
	if (!data) {
		throw error(404, 'Message not found');
	}
	return { comment: data as Comment };
};
