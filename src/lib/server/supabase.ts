import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { SUPABASE_SECRET_KEY } from '$env/static/private';

/**
 * Server-side Supabase client using the service-role key.
 * Bypasses RLS — only ever import this from `$lib/server/*` files.
 */
let _client: SupabaseClient | null = null;

export function getServerSupabase(): SupabaseClient {
	if (!_client) {
		_client = createClient(PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY, {
			auth: { persistSession: false, autoRefreshToken: false }
		});
	}
	return _client;
}
