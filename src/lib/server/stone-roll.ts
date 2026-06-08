import { STONE_KEYS } from '$lib/flairs';
import type { PrimaryFlairKey } from '$lib/flairs';

export const STONE_DROP_RATE = 0.1;

async function sha256(input: string): Promise<DataView> {
	const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
	return new DataView(buf);
}

// Each visitor is permanently assigned one stone, derived from their submitter
// hash only (no date). So a single person only ever sees that one stone in the
// composer — never all six. ~1/6 of visitors map to each stone.
export async function assignedStone(submitterHash: string): Promise<PrimaryFlairKey> {
	const view = await sha256(`${submitterHash}::stone-assignment`);
	const pick = view.getUint32(0, false);
	return STONE_KEYS[pick % STONE_KEYS.length];
}

export async function rollDailyStone(
	submitterHash: string,
	dateUtc: string
): Promise<PrimaryFlairKey | null> {
	const view = await sha256(`${submitterHash}::stone-day::${dateUtc}`);
	const roll = view.getUint32(0, false) / 0xffffffff;
	if (roll >= STONE_DROP_RATE) return null;
	return assignedStone(submitterHash);
}

export function todayUtc(): string {
	return new Date().toISOString().slice(0, 10);
}
