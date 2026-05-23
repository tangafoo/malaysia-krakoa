import { DAILY_HASH_SALT } from '$env/static/private';

/**
 * Hashes IP + UA + salt into a stable opaque identifier.
 * Used for soft dedup of votes/submissions without storing PII.
 */
export async function voterHash(ip: string, ua: string): Promise<string> {
	const input = `${ip}::${ua}::${DAILY_HASH_SALT}`;
	const buf = new TextEncoder().encode(input);
	const digest = await crypto.subtle.digest('SHA-256', buf);
	return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function getClientIp(headers: Headers): string {
	return (
		headers.get('cf-connecting-ip') ??
		headers.get('x-forwarded-for')?.split(',')[0].trim() ??
		headers.get('x-real-ip') ??
		'0.0.0.0'
	);
}
