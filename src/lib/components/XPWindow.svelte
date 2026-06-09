<script lang="ts">
	import type { Snippet } from 'svelte';
	import OverflowMarquee from './OverflowMarquee.svelte';

	let {
		title,
		icon = '',
		children,
		actions,
		titleClass = '',
		bodyClass = '',
		titlebarVariant = 'blue',
		onMaximize,
		maximized = false
	}: {
		title: string;
		icon?: string;
		children: Snippet;
		actions?: Snippet;
		titleClass?: string;
		bodyClass?: string;
		titlebarVariant?: 'blue' | 'green';
		onMaximize?: () => void;
		maximized?: boolean;
	} = $props();

	let collapsed = $state(false);
</script>

<div class="xp-bevel bg-xp-gray flex flex-col overflow-hidden rounded-lg shadow-lg">
	<div
		class="xp-titlebar xp-titlebar-{titlebarVariant} flex items-center gap-2 px-1.5 py-1 {titleClass}"
	>
		{#if icon}
			<span aria-hidden="true" class="text-base leading-none">{icon}</span>
		{/if}
		<div class="font-tahoma min-w-0 flex-1 text-sm">
			<OverflowMarquee duration="12s">{title}</OverflowMarquee>
		</div>
		<div class="flex gap-1">
			{#if actions}{@render actions()}{/if}
			<button
				type="button"
				onclick={() => (collapsed = !collapsed)}
				data-click-sound="minimize"
				aria-label={collapsed ? 'Restore' : 'Minimize'}
				aria-pressed={collapsed}
				class="xp-bevel xp-button font-tahoma bg-xp-gray flex h-5 w-5 cursor-pointer items-center justify-center rounded-sm text-xs font-bold text-black {collapsed
					? ''
					: 'pb-1 text-sm'}"
			>
				{collapsed ? '▢' : '_'}
			</button>
			<button
				type="button"
				onclick={onMaximize}
				disabled={!onMaximize}
				data-click-sound={onMaximize ? undefined : 'click2'}
				aria-label={maximized ? 'Restore' : 'Maximize'}
				aria-pressed={maximized}
				class="xp-bevel font-tahoma bg-xp-gray flex h-5 w-5 items-center justify-center rounded-sm text-xs font-bold text-black {onMaximize
					? 'cursor-pointer'
					: ''}"
			>
				{maximized ? '❐' : '□'}
			</button>
			<button
				type="button"
				data-click-sound="click2"
				aria-label="Close"
				class="xp-bevel font-tahoma flex h-5 w-5 items-center justify-center rounded-sm bg-[#dc4c40] text-xs font-bold text-white"
			>
				✕
			</button>
		</div>
	</div>
	{#if !collapsed}
		<div class="bg-xp-tan p-3 {bodyClass}">
			{@render children()}
		</div>
	{/if}
</div>
