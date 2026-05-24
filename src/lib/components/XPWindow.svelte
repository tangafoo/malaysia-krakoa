<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		title,
		icon = '',
		children,
		actions,
		titleClass = '',
		bodyClass = ''
	}: {
		title: string;
		icon?: string;
		children: Snippet;
		actions?: Snippet;
		titleClass?: string;
		bodyClass?: string;
	} = $props();
</script>

<div class="xp-bevel bg-xp-gray flex flex-col overflow-hidden rounded-lg shadow-lg">
	<div class="xp-titlebar flex items-center gap-2 px-1.5 py-1 {titleClass}">
		{#if icon}
			<span aria-hidden="true" class="text-base leading-none">{icon}</span>
		{/if}
		<span class="font-tahoma flex-1 truncate text-sm">{title}</span>
		<div class="flex gap-1">
			{#if actions}{@render actions()}{/if}
			<button
				type="button"
				aria-label="Minimize"
				class="xp-bevel font-tahoma bg-xp-gray flex h-5 w-5 items-center justify-center rounded-sm pb-1 text-sm font-bold text-black"
			>
				_
			</button>
			<button
				type="button"
				aria-label="Maximize"
				class="xp-bevel font-tahoma bg-xp-gray flex h-5 w-5 items-center justify-center rounded-sm text-xs font-bold text-black"
			>
				□
			</button>
			<button
				type="button"
				aria-label="Close"
				class="xp-bevel font-tahoma flex h-5 w-5 items-center justify-center rounded-sm bg-[#dc4c40] text-xs font-bold text-white"
			>
				✕
			</button>
		</div>
	</div>
	<div class="bg-xp-tan p-3 {bodyClass}">
		{@render children()}
	</div>
</div>
