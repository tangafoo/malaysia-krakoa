import { json, type RequestHandler } from '@sveltejs/kit';
import { getServerSupabase } from '$lib/server/supabase';

export const POST: RequestHandler = async ({ request }) => {
	const body = (await request.json().catch(() => null)) as { count?: number } | null;
	if (!body || typeof body.count !== 'number' || body.count < 0 || body.count > 10000) {
		return json({ error: 'Bad request' }, { status: 400 });
	}

	const supabase = getServerSupabase();
	const { data: row } = await supabase
		.from('presence_record')
		.select('peak')
		.eq('id', 1)
		.maybeSingle();

	const oldPeak = row?.peak ?? 0;
	if (body.count <= oldPeak) {
		return json({ peak: oldPeak, isNewRecord: false });
	}

	const { error } = await supabase
		.from('presence_record')
		.upsert({ id: 1, peak: body.count, achieved_at: new Date().toISOString() });

	if (error) {
		console.error('presence_record upsert failed', error);
		return json({ peak: oldPeak, isNewRecord: false }, { status: 500 });
	}

	return json({ peak: body.count, isNewRecord: true });
};
