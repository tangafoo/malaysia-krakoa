<script lang="ts">
	import kevinFeige from '$lib/assets/kevin_feige.jpg';
	import type { Snippet } from 'svelte';
	import { onDestroy } from 'svelte';
	import { fade } from 'svelte/transition';

	let { children }: { children: Snippet } = $props();

	let triggerEl: HTMLButtonElement | undefined = $state();
	let visible = $state(false);
	let top = $state(0);
	let left = $state(0);

	function show() {
		if (!triggerEl) return;
		const rect = triggerEl.getBoundingClientRect();
		top = rect.top - 8;
		left = rect.left + rect.width / 2;
		visible = true;
		window.addEventListener('scroll', hide, { passive: true, once: true });
	}
	function hide() {
		visible = false;
		window.removeEventListener('scroll', hide);
	}

	function isHoverDevice() {
		return window.matchMedia('(hover: hover)').matches;
	}

	function onEnter() {
		if (isHoverDevice()) show();
	}
	function onLeave() {
		if (isHoverDevice()) hide();
	}
	function onTap() {
		if (isHoverDevice()) return;
		if (visible) hide();
		else show();
	}

	onDestroy(() => {
		if (typeof window !== 'undefined') {
			window.removeEventListener('scroll', hide);
		}
	});
</script>

<button
	type="button"
	bind:this={triggerEl}
	onmouseenter={onEnter}
	onmouseleave={onLeave}
	onfocus={onEnter}
	onblur={onLeave}
	onclick={onTap}
	class="cursor-help border-0 bg-transparent p-0 underline decoration-dotted underline-offset-2"
>
	{@render children()}
</button>

{#if visible}
	<span
		aria-hidden="true"
		transition:fade={{ duration: 300 }}
		class="pointer-events-none fixed z-[100] w-32 -translate-x-1/2 -translate-y-full"
		style="top: {top}px; left: {left}px;"
	>
		<span class="xp-bevel block bg-white p-1 shadow-lg">
			<img src={kevinFeige} alt="" class="block w-full" />
		</span>
	</span>
{/if}
