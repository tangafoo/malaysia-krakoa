import { json, type RequestHandler } from '@sveltejs/kit';
import { getServerSupabase } from '$lib/server/supabase';
import { getClientIp, voterHash } from '$lib/server/hash';
import { quoteOfTheDay } from '$lib/feige-quote';
import quotes from '$lib/data/feige-quotes.json';

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
	const ip = getClientIp(request.headers) || getClientAddress();
	const ua = request.headers.get('user-agent') ?? '';
	const hash = await voterHash(ip, ua);

	const today = new Date().toISOString().slice(0, 10);

	// Pick a random quote — exclude today's default so the user actually gets something new.
	const todays = quoteOfTheDay();
	const pool = quotes.filter((q) => q.quote !== todays.quote);
	const next = pool[Math.floor(Math.random() * pool.length)];

	const supabase = getServerSupabase();
	const { error } = await supabase.from('quote_refreshes').insert({
		submitter_hash: hash,
		refresh_date: today,
		quote_text: next.quote,
		quote_source: next.source
	});

	if (error) {
		if (error.code === '23505') {
			// Already refreshed today — return what they got the first time.
			const { data } = await supabase
				.from('quote_refreshes')
				.select('quote_text, quote_source')
				.eq('submitter_hash', hash)
				.eq('refresh_date', today)
				.maybeSingle();
			return json(
				{
					error: "You've already refreshed today",
					quote: data?.quote_text,
					source: data?.quote_source
				},
				{ status: 429 }
			);
		}
		console.error('quote refresh insert failed', error);
		return json({ error: 'Could not refresh' }, { status: 500 });
	}

	return json({ quote: next.quote, source: next.source });
};
