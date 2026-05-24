import { json, type RequestHandler } from '@sveltejs/kit';
import { getServerSupabase } from '$lib/server/supabase';
import { getClientIp, voterHash } from '$lib/server/hash';

const COOKIE_NAME = 'mfff_voter';
const ONE_YEAR = 60 * 60 * 24 * 365;

function ensureCookie(cookies: import('@sveltejs/kit').Cookies): string {
	let id = cookies.get(COOKIE_NAME);
	if (!id) {
		id = crypto.randomUUID();
		cookies.set(COOKIE_NAME, id, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: true,
			maxAge: ONE_YEAR
		});
	}
	return id;
}

export const POST: RequestHandler = async ({ request, cookies, getClientAddress }) => {
	const body = (await request.json().catch(() => null)) as {
		spotlight_key?: string;
		sentiment?: number;
	} | null;
	if (!body || !body.spotlight_key || (body.sentiment !== 1 && body.sentiment !== -1)) {
		return json({ error: 'Bad request' }, { status: 400 });
	}

	const ip = getClientIp(request.headers) || getClientAddress();
	const ua = request.headers.get('user-agent') ?? '';
	const hash = await voterHash(ip, ua);
	const cookieId = ensureCookie(cookies);

	const supabase = getServerSupabase();

	const { error } = await supabase.from('spotlight_votes').insert({
		spotlight_key: body.spotlight_key,
		voter_hash: hash,
		voter_cookie: cookieId,
		sentiment: body.sentiment
	});

	if (error) {
		if (error.code === '23505') {
			return json({ error: 'Already voted' }, { status: 409 });
		}
		console.error('spotlight vote insert failed', error);
		return json({ error: 'Vote failed' }, { status: 500 });
	}

	const { data } = await supabase
		.from('spotlight_sentiment_counts')
		.select('*')
		.eq('spotlight_key', body.spotlight_key)
		.maybeSingle();

	return json({
		hearts: data?.hearts ?? 0,
		broken_hearts: data?.broken_hearts ?? 0
	});
};
