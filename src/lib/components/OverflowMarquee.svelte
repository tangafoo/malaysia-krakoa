<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		children,
		duration = '15s',
		class: extraClass = ''
	}: {
		children: Snippet;
		duration?: string;
		class?: string;
	} = $props();

	let containerEl: HTMLDivElement | undefined = $state();
	let contentEl: HTMLDivElement | undefined = $state();
	let overflowing = $state(false);

	$effect(() => {
		if (!containerEl || !contentEl) return;
		const check = () => {
			if (!containerEl || !contentEl) return;
			overflowing = contentEl.scrollWidth > containerEl.clientWidth + 1;
		};
		check();
		const ro = new ResizeObserver(check);
		ro.observe(containerEl);
		ro.observe(contentEl);
		return () => ro.disconnect();
	});
</script>

<div bind:this={containerEl} class="overflow-hidden {extraClass}">
	<div
		bind:this={contentEl}
		class="inline-block whitespace-nowrap"
		class:xp-marquee-track={overflowing}
		style={overflowing ? `animation-duration: ${duration}` : ''}
	>
		{@render children()}
	</div>
</div>
