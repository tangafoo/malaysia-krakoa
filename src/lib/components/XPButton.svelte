<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		type = 'button',
		variant = 'default',
		disabled = false,
		onclick,
		href,
		children,
		class: extraClass = '',
		ariaLabel,
		dataClickSound
	}: {
		type?: 'button' | 'submit' | 'reset';
		variant?: 'default' | 'primary' | 'danger';
		disabled?: boolean;
		onclick?: (e: MouseEvent) => void;
		href?: string;
		children: Snippet;
		class?: string;
		ariaLabel?: string;
		dataClickSound?: string;
	} = $props();

	const variantBg = {
		default: 'bg-xp-gray text-black',
		primary: 'bg-gradient-to-b from-[#5db4e8] to-[#2b8df0] text-white',
		danger: 'bg-gradient-to-b from-[#e88c5d] to-[#c25a2b] text-white'
	}[variant];
</script>

{#if href}
	<a
		{href}
		aria-label={ariaLabel}
		data-click-sound={dataClickSound}
		class="xp-bevel xp-button font-tahoma inline-flex items-center justify-center gap-1 px-3 py-1 text-sm font-bold no-underline {variantBg} {extraClass}"
	>
		{@render children()}
	</a>
{:else}
	<button
		{type}
		{disabled}
		aria-label={ariaLabel}
		data-click-sound={dataClickSound}
		{onclick}
		class="xp-bevel xp-button font-tahoma inline-flex items-center justify-center gap-1 px-3 py-1 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-60 {variantBg} {extraClass}"
	>
		{@render children()}
	</button>
{/if}
