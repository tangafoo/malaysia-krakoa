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
		comment_id?: string;
		vote_type?: number;
	} | null;
	if (!body || !body.comment_id || (body.vote_type !== 1 && body.vote_type !== -1)) {
		return json({ error: 'Bad request' }, { status: 400 });
	}

	const ip = getClientIp(request.headers) || getClientAddress();
	const ua = request.headers.get('user-agent') ?? '';
	const hash = await voterHash(ip, ua);
	const cookieId = ensureCookie(cookies);

	const supabase = getServerSupabase();

	const { error } = await supabase.from('votes').insert({
		comment_id: body.comment_id,
		voter_hash: hash,
		voter_cookie: cookieId,
		vote_type: body.vote_type
	});

	if (error) {
		if (error.code === '23505') {
			return json({ error: 'Already voted' }, { status: 409 });
		}
		if (error.code === '23503') {
			return json({ error: 'Comment not found' }, { status: 404 });
		}
		console.error('vote insert failed', error);
		return json({ error: 'Vote failed' }, { status: 500 });
	}

	const { data } = await supabase
		.from('comments')
		.select('upvotes,downvotes')
		.eq('id', body.comment_id)
		.maybeSingle();

	return json({ upvotes: data?.upvotes ?? 0, downvotes: data?.downvotes ?? 0 });
};
