import type { LayoutServerLoad } from './$types';
import { getServerSupabase } from '$lib/server/supabase';
import { getClientIp, voterHash } from '$lib/server/hash';
import { assignedStone } from '$lib/server/stone-roll';
import { getApprovedCommentCount } from '$lib/server/fanmail-count';
import { COUNTRY_CODE_SET } from '$lib/country-data';

export const load: LayoutServerLoad = async ({ request, getClientAddress, platform }) => {
	const supabase = getServerSupabase();
	const ip = getClientIp(request.headers) || getClientAddress();
	const ua = request.headers.get('user-agent') ?? '';

	const [totalCount, peakRes, hash] = await Promise.all([
		getApprovedCommentCount(supabase),
		supabase.from('presence_record').select('peak').eq('id', 1).maybeSingle(),
		voterHash(ip, ua)
	]);

	const stoneKey = await assignedStone(hash);

	// Idempotent first-visit capture. INSERT with on-conflict-do-nothing; if the
	// visitor's row already exists (overridden or not), this is a cheap no-op.
	const cfCountry = platform?.cf?.country as string | undefined;
	if (cfCountry && COUNTRY_CODE_SET.has(cfCountry)) {
		const insertPromise = supabase
			.from('visitor_countries')
			.insert({ submitter_hash: hash, country_code: cfCountry })
			.then(
				() => {},
				() => {}
			);
		// On Cloudflare, push the insert past the response so it doesn't block nav.
		// In dev or other adapters, just await it.
		const ctx = (platform as { context?: { waitUntil?: (p: PromiseLike<unknown>) => void } })
			?.context;
		if (ctx?.waitUntil) ctx.waitUntil(insertPromise);
		else await insertPromise;
	}

	return {
		totalCount,
		peakOnline: peakRes.data?.peak ?? 0,
		assignedStoneKey: stoneKey
	};
};
