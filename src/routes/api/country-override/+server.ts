import { json, type RequestHandler } from '@sveltejs/kit';
import { getServerSupabase } from '$lib/server/supabase';
import { getClientIp, voterHash } from '$lib/server/hash';
import { COUNTRY_CODE_SET } from '$lib/country-data';

const THROTTLE_MS = 60_000;

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
	const body = (await request.json().catch(() => null)) as { country_code?: string } | null;
	const code = String(body?.country_code ?? '').toUpperCase();
	if (!COUNTRY_CODE_SET.has(code)) {
		return json({ error: 'Invalid country.' }, { status: 400 });
	}

	const ip = getClientIp(request.headers) || getClientAddress();
	const ua = request.headers.get('user-agent') ?? '';
	const hash = await voterHash(ip, ua);

	const supabase = getServerSupabase();

	// Throttle: only block if there's already an override on this hash within the
	// last minute. First-time overrides (whether the row was IP-captured by the
	// layout or doesn't exist yet) always go through.
	const { data: existing } = await supabase
		.from('visitor_countries')
		.select('updated_at, is_override')
		.eq('submitter_hash', hash)
		.maybeSingle();

	if (existing?.is_override) {
		const lastMs = new Date(existing.updated_at).getTime();
		if (Date.now() - lastMs < THROTTLE_MS) {
			return json({ error: 'Slow down, agent. Try again in a minute.' }, { status: 429 });
		}
	}

	const { error } = await supabase.from('visitor_countries').upsert(
		{
			submitter_hash: hash,
			country_code: code,
			is_override: true,
			updated_at: new Date().toISOString()
		},
		{ onConflict: 'submitter_hash' }
	);

	if (error) {
		console.error('country override upsert failed', error);
		return json({ error: 'Could not update location.' }, { status: 500 });
	}

	return json({ ok: true, country_code: code });
};
