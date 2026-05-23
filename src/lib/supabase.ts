import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY } from '$env/static/public';

let _client: SupabaseClient | null = null;

export function getBrowserSupabase(): SupabaseClient {
	if (!_client) {
		_client = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
			auth: {
				persistSession: true,
				detectSessionInUrl: true,
				flowType: 'implicit'
			}
		});
	}
	return _client;
}
