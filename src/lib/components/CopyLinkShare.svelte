<script lang="ts">
	import { onMount } from 'svelte';
	import XPButton from './XPButton.svelte';

	let { href }: { href: string } = $props();

	let open = $state(false);
	let copied = $state(false);
	let menuRef: HTMLDivElement | undefined = $state();

	async function copyLink() {
		try {
			await navigator.clipboard.writeText(href);
			copied = true;
			setTimeout(() => {
				copied = false;
				open = false;
			}, 1500);
		} catch {
			copied = false;
		}
	}

	onMount(() => {
		function onClickOutside(e: MouseEvent) {
			if (!open) return;
			if (menuRef && !menuRef.contains(e.target as Node)) open = false;
		}
		document.addEventListener('click', onClickOutside);
		return () => document.removeEventListener('click', onClickOutside);
	});
</script>

<div bind:this={menuRef} class="relative inline-block">
	<XPButton onclick={() => (open = !open)}>
		<span class="text-base leading-none">🔗</span>
		<span>Share</span>
	</XPButton>
	{#if open}
		<div
			class="xp-bevel absolute right-0 z-20 mt-1 min-w-[160px] bg-white py-1 shadow-md"
			role="menu"
		>
			<button
				type="button"
				role="menuitem"
				onclick={copyLink}
				class="font-tahoma flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-[#316ac5] hover:text-white"
			>
				<span class="text-base leading-none">{copied ? '✓' : '📋'}</span>
				<span>{copied ? 'Copied!' : 'Copy link'}</span>
			</button>
		</div>
	{/if}
</div>
