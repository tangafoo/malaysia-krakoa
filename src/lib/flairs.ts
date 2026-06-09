import type { Component } from 'svelte';
import SpideyIcon from './components/icons/SpideyIcon.svelte';
import XMenIcon from './components/icons/XMenIcon.svelte';
import DaredevilIcon from './components/icons/DaredevilIcon.svelte';
import DoomsdayIcon from './components/icons/DoomsdayIcon.svelte';
import mindstone from './assets/mindstone.png';
import spacestone from './assets/spacestone.png';
import realitystone from './assets/realitystone.png';
import powerstone from './assets/powerstone.png';
import timestone from './assets/timestone.png';
import soulstone from './assets/souldstone.png';

export type PrimaryFlairKey =
	| 'spidey'
	| 'x-men-97'
	| 'daredevil'
	| 'doomsday'
	| 'stone-mind'
	| 'stone-space'
	| 'stone-reality'
	| 'stone-power'
	| 'stone-time'
	| 'stone-soul';

export type SecondaryFlairKey = 'suggestion' | 'fanmail' | 'thoughts';

export interface PrimaryFlair {
	key: PrimaryFlairKey;
	label: string;
	icon?: Component;
	iconImg?: string;
	color: string;
	ogHex: string;
	ogTextHex: string;
	rare?: boolean;
}

export interface SecondaryFlair {
	key: SecondaryFlairKey;
	label: string;
	emoji: string;
	ogHex: string;
	ogTextHex: string;
}

export const PRIMARY_FLAIRS: PrimaryFlair[] = [
	{
		key: 'spidey',
		label: 'Spidey',
		icon: SpideyIcon,
		color: 'bg-red-100 border-red-500',
		ogHex: '#dc2626',
		ogTextHex: '#ffffff'
	},
	{
		key: 'x-men-97',
		label: "X-Men '97",
		icon: XMenIcon,
		color: 'bg-yellow-100 border-yellow-600',
		ogHex: '#facc15',
		ogTextHex: '#000000'
	},
	{
		key: 'daredevil',
		label: 'Daredevil',
		icon: DaredevilIcon,
		color: 'bg-red-100 border-red-900',
		ogHex: '#7f1d1d',
		ogTextHex: '#ffffff'
	},
	{
		key: 'doomsday',
		label: 'Avengers: Doomsday',
		icon: DoomsdayIcon,
		color: 'bg-green-100 border-green-700',
		ogHex: '#15803d',
		ogTextHex: '#ffffff'
	},
	{
		key: 'stone-mind',
		label: 'Mind Stone',
		iconImg: mindstone,
		color: 'bg-yellow-50 border-yellow-400',
		ogHex: '#fde047',
		ogTextHex: '#000000',
		rare: true
	},
	{
		key: 'stone-space',
		label: 'Space Stone',
		iconImg: spacestone,
		color: 'bg-blue-50 border-blue-500',
		ogHex: '#3b82f6',
		ogTextHex: '#ffffff',
		rare: true
	},
	{
		key: 'stone-reality',
		label: 'Reality Stone',
		iconImg: realitystone,
		color: 'bg-red-50 border-red-500',
		ogHex: '#ef4444',
		ogTextHex: '#ffffff',
		rare: true
	},
	{
		key: 'stone-power',
		label: 'Power Stone',
		iconImg: powerstone,
		color: 'bg-purple-50 border-purple-500',
		ogHex: '#a855f7',
		ogTextHex: '#ffffff',
		rare: true
	},
	{
		key: 'stone-time',
		label: 'Time Stone',
		iconImg: timestone,
		color: 'bg-emerald-50 border-emerald-500',
		ogHex: '#10b981',
		ogTextHex: '#ffffff',
		rare: true
	},
	{
		key: 'stone-soul',
		label: 'Soul Stone',
		iconImg: soulstone,
		color: 'bg-orange-50 border-orange-500',
		ogHex: '#f97316',
		ogTextHex: '#ffffff',
		rare: true
	}
];

export const STONE_KEYS: PrimaryFlairKey[] = PRIMARY_FLAIRS.filter((f) => f.rare).map((f) => f.key);

export const SECONDARY_FLAIRS: SecondaryFlair[] = [
	{ key: 'suggestion', label: 'Suggestion', emoji: '💡', ogHex: '#0ea5e9', ogTextHex: '#ffffff' },
	{ key: 'fanmail', label: 'Fanmail', emoji: '💌', ogHex: '#ec4899', ogTextHex: '#ffffff' },
	{ key: 'thoughts', label: 'Thoughts', emoji: '🧠', ogHex: '#7c3aed', ogTextHex: '#ffffff' }
];

export const PRIMARY_KEYS: Set<string> = new Set(PRIMARY_FLAIRS.map((f) => f.key));
export const SECONDARY_KEYS: Set<string> = new Set(SECONDARY_FLAIRS.map((f) => f.key));

export const primaryByKey = (k: string | null | undefined): PrimaryFlair | undefined =>
	k ? PRIMARY_FLAIRS.find((f) => f.key === k) : undefined;

export const secondaryByKey = (k: string | null | undefined): SecondaryFlair | undefined =>
	k ? SECONDARY_FLAIRS.find((f) => f.key === k) : undefined;

export function basePrimaryFlairsByPopularity(counts: Record<string, number>): PrimaryFlair[] {
	const base = PRIMARY_FLAIRS.filter((f) => !f.rare);
	return [...base].sort((a, b) => {
		const ca = counts[a.key] ?? 0;
		const cb = counts[b.key] ?? 0;
		if (cb !== ca) return cb - ca;
		return base.indexOf(a) - base.indexOf(b);
	});
}
