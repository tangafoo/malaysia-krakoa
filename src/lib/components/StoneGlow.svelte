<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

	let {
		color,
		left,
		top,
		size = 720,
		stone,
		stoneSize = 120,
		// Lissajous path params — x = radiusX·sin(ax·t + phaseX), y = radiusY·sin(ay·t + phaseY).
		// Different ax:ay ratios across stones produce the weaving / "talking" effect.
		ax = 1,
		ay = 2,
		radiusX = 40,
		radiusY = 35,
		phaseX = 0,
		phaseY = Math.PI / 2,
		period = 24,
		// Independent depth cycle — drives scale + blur so the stone reads as moving forward / back.
		depthPeriod = 10,
		depthPhase = 0
	}: {
		color: string;
		left: string;
		top: string;
		size?: number;
		stone: string;
		stoneSize?: number;
		ax?: number;
		ay?: number;
		radiusX?: number;
		radiusY?: number;
		phaseX?: number;
		phaseY?: number;
		period?: number;
		depthPeriod?: number;
		depthPhase?: number;
	} = $props();

	let wrapperEl: HTMLDivElement | undefined = $state();
	let glowEl: HTMLDivElement | undefined = $state();

	onMount(() => {
		if (!browser || !wrapperEl) return;
		let tick: (() => void) | null = null;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		let gsapRef: any = null;
		let cancelled = false;

		(async () => {
			try {
				const { gsap } = await import('gsap');
				if (cancelled || !wrapperEl) return;
				gsapRef = gsap;
				const wrapper = wrapperEl;
				const glow = glowEl;
				const TAU = Math.PI * 2;

				tick = () => {
					const t = performance.now() / 1000;
					const angle = (t / period) * TAU;
					const x = radiusX * Math.sin(ax * angle + phaseX);
					const y = radiusY * Math.sin(ay * angle + phaseY);

					const dAngle = (t / depthPeriod) * TAU + depthPhase;
					const z = 0.5 + 0.5 * Math.sin(dAngle); // 0..1
					const scale = 0.7 + z * 0.5; // 0.7..1.2
					const opacity = 0.55 + z * 0.4; // 0.55..0.95 — closer = brighter (GPU-cheap alt to animating blur)

					gsap.set(wrapper, { xPercent: x, yPercent: y, scale });
					if (glow) gsap.set(glow, { opacity });
				};
				gsap.ticker.add(tick);
			} catch {
				// GSAP unavailable — stones sit at CSS positions
			}
		})();

		return () => {
			cancelled = true;
			if (gsapRef && tick) gsapRef.ticker.remove(tick);
		};
	});
</script>

<div
	bind:this={wrapperEl}
	class="absolute -translate-x-1/2 -translate-y-1/2 will-change-transform"
	style="left: {left}; top: {top}; width: {size}px; height: {size}px;"
>
	<div
		bind:this={glowEl}
		class="absolute inset-0 rounded-full will-change-[opacity]"
		style="
			background: radial-gradient(circle, {color} 0%, transparent 70%);
			filter: blur(80px);
			mix-blend-mode: screen;
			opacity: 0.95;
			transform: translateZ(0);
		"
	></div>
	<img
		src={stone}
		alt=""
		aria-hidden="true"
		class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 object-contain"
		style="width: {stoneSize}px; height: {stoneSize}px;"
	/>
</div>
