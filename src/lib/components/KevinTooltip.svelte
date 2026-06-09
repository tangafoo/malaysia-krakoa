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
	// Small grace period before hiding so the user can move into the popup to click the wiki link.
	let hideTimer: ReturnType<typeof setTimeout> | null = null;

	function show() {
		if (!triggerEl) return;
		const rect = triggerEl.getBoundingClientRect();
		top = rect.top - 8;
		left = rect.left + rect.width / 2;
		visible = true;
		if (hideTimer) {
			clearTimeout(hideTimer);
			hideTimer = null;
		}
		window.addEventListener('scroll', hide, { passive: true, once: true });
	}
	function hide() {
		visible = false;
		if (hideTimer) {
			clearTimeout(hideTimer);
			hideTimer = null;
		}
		window.removeEventListener('scroll', hide);
	}
	function scheduleHide() {
		if (hideTimer) clearTimeout(hideTimer);
		hideTimer = setTimeout(hide, 180);
	}
	function cancelHide() {
		if (hideTimer) {
			clearTimeout(hideTimer);
			hideTimer = null;
		}
	}

	function isHoverDevice() {
		return window.matchMedia('(hover: hover)').matches;
	}

	function onEnter() {
		if (isHoverDevice()) show();
	}
	function onLeave() {
		if (isHoverDevice()) scheduleHide();
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
		if (hideTimer) clearTimeout(hideTimer);
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
		transition:fade={{ duration: 300 }}
		onmouseenter={cancelHide}
		onmouseleave={scheduleHide}
		role="tooltip"
		class="fixed z-[100] w-32 -translate-x-1/2 -translate-y-full"
		style="top: {top}px; left: {left}px;"
	>
		<span class="xp-bevel block bg-white p-1 shadow-lg">
			<img src={kevinFeige} alt="" class="block w-full" />
			<a
				href="https://en.wikipedia.org/wiki/Kevin_Feige"
				target="_blank"
				rel="noreferrer"
				class="font-tahoma block px-1 pt-1 pb-0.5 text-center text-[10px] text-[#0058e9] underline hover:text-[#003a9e]"
			>
				find out more →
			</a>
		</span>
	</span>
{/if}
