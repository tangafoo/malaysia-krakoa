<script lang="ts">
	import type { PrimaryFlair, SecondaryFlair } from '$lib/flairs';

	let {
		flair,
		selected = false,
		interactive = false,
		colored = false,
		count,
		onclick
	}: {
		flair: PrimaryFlair | SecondaryFlair;
		selected?: boolean;
		interactive?: boolean;
		colored?: boolean;
		count?: number;
		onclick?: () => void;
	} = $props();

	const isPrimary = $derived('color' in flair);
	const rare = $derived(isPrimary && (flair as PrimaryFlair).rare === true);
</script>

{#snippet body(sizeClass: string)}
	{#if rare}
		<span aria-hidden="true" class="text-[10px] leading-none">✨</span>
	{/if}
	{#if isPrimary}
		{@const pf = flair as PrimaryFlair}
		{#if pf.icon}
			{@const Icon = pf.icon}
			<Icon class={sizeClass} />
		{:else if pf.iconImg}
			<img src={pf.iconImg} alt="" class="{sizeClass} object-contain" />
		{/if}
	{:else}
		<span aria-hidden="true">{(flair as SecondaryFlair).emoji}</span>
	{/if}
	<span>{flair.label}</span>
	{#if typeof count === 'number'}
		<span class="opacity-70">({count})</span>
	{/if}
	{#if rare}
		<span aria-hidden="true" class="text-[10px] leading-none">✨</span>
	{/if}
{/snippet}

{#if interactive}
	<button
		type="button"
		{onclick}
		aria-pressed={selected}
		class="font-tahoma inline-flex cursor-pointer items-center gap-1 border px-1.5 py-0.5 text-xs leading-none transition {rare
			? 'flair-shimmer'
			: ''} {selected
			? isPrimary
				? `${(flair as PrimaryFlair).color} ring-1 ring-black/30`
				: 'bg-xp-blue border-xp-blue text-white'
			: 'xp-bevel bg-xp-tan border-transparent hover:bg-white'}"
	>
		{@render body('h-4 w-4')}
	</button>
{:else}
	<span
		class="font-tahoma inline-flex items-center gap-1 border px-1.5 py-0.5 text-[11px] leading-none {rare
			? 'flair-shimmer'
			: ''} {colored
			? isPrimary
				? `${(flair as PrimaryFlair).color} ring-1 ring-black/30 text-black`
				: 'bg-xp-blue border-xp-blue text-white'
			: 'xp-bevel-inset border-transparent bg-white text-black'}"
	>
		{@render body('h-3.5 w-3.5')}
	</span>
{/if}
