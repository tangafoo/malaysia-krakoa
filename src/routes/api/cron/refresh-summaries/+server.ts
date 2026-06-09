import { json, error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { getServerSupabase } from '$lib/server/supabase';
import { generateSummaries } from '$lib/server/summarize';

// Triggered by a Cloudflare cron (or any scheduler). Protected by a bearer secret.
//   curl -X POST -H "authorization: Bearer $CRON_SECRET" https://marvelfansforfeige.com/api/cron/refresh-summaries
export async function POST({ request }) {
	const secret = env.CRON_SECRET;
	const auth = request.headers.get('authorization') ?? '';
	if (!secret || auth !== `Bearer ${secret}`) {
		throw error(401, 'unauthorized');
	}

	const summary = await generateSummaries();
	if (!summary) {
		return json({ ok: false, reason: 'no_summary_generated' }, { status: 503 });
	}

	const supabase = getServerSupabase();
	const { data, error: insertErr } = await supabase
		.from('comment_summaries')
		.insert(summary)
		.select()
		.single();

	if (insertErr) {
		console.error('[refresh-summaries] insert failed', insertErr);
		throw error(500, 'insert failed');
	}

	return json({ ok: true, summary: data });
}
