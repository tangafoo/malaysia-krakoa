<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

	// Neon blobs — iTunes/Music visualizer vibe.
	// Layered with mix-blend-mode: screen so overlaps glow brighter.
	const blobs = [
		{ color: '#ff006e', size: 720, left: '12%', top: '18%' }, // hot pink
		{ color: '#8338ec', size: 820, left: '78%', top: '12%' }, // electric purple
		{ color: '#3a86ff', size: 760, left: '50%', top: '50%' }, // bright blue
		{ color: '#06ffa5', size: 640, left: '20%', top: '78%' }, // cyber green
		{ color: '#ffbe0b', size: 700, left: '85%', top: '72%' }, // gold
		{ color: '#ff4d00', size: 760, left: '50%', top: '92%' } // orange-red
	];

	const blobEls: HTMLDivElement[] = [];

	onMount(async () => {
		if (!browser) return;
		try {
			const { gsap } = await import('gsap');
			blobEls.forEach((el) => {
				if (!el) return;
				gsap.set(el, {
					xPercent: (Math.random() - 0.5) * 80,
					yPercent: (Math.random() - 0.5) * 80
				});
				const animateNext = () => {
					gsap.to(el, {
						xPercent: (Math.random() - 0.5) * 120,
						yPercent: (Math.random() - 0.5) * 120,
						scale: 0.65 + Math.random() * 0.9,
						duration: 8 + Math.random() * 8,
						ease: 'sine.inOut',
						onComplete: animateNext
					});
				};
				animateNext();
			});
		} catch {
			// GSAP unavailable — blobs sit at their CSS positions, still visible
		}
	});
</script>

<div
	class="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#050510]"
	aria-hidden="true"
>
	{#each blobs as blob, i (i)}
		<div
			bind:this={blobEls[i]}
			class="absolute -translate-x-1/2 -translate-y-1/2 rounded-full will-change-transform"
			style="
				left: {blob.left};
				top: {blob.top};
				width: {blob.size}px;
				height: {blob.size}px;
				background: radial-gradient(circle, {blob.color} 0%, transparent 70%);
				filter: blur(80px);
				mix-blend-mode: screen;
				opacity: 0.95;
			"
		></div>
	{/each}
	<div
		class="absolute inset-0"
		style="background: radial-gradient(ellipse at center, transparent 35%, rgba(5, 5, 16, 0.55) 100%);"
	></div>
</div>
