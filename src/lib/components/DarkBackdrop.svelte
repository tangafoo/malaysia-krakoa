<script lang="ts">
	import StoneGlow from './StoneGlow.svelte';
	import mindStone from '$lib/assets/mindstone.png';
	import spaceStone from '$lib/assets/spacestone.png';
	import realityStone from '$lib/assets/realitystone.png';
	import powerStone from '$lib/assets/powerstone.png';
	import timeStone from '$lib/assets/timestone.png';
	import soulStone from '$lib/assets/souldstone.png';

	// Each stone gets a unique Lissajous (ax:ay) ratio so their paths weave through
	// each other — different shapes sharing one global clock.
	const stones = [
		{
			color: '#ff006e',
			size: 720,
			left: '12%',
			top: '18%',
			stone: realityStone,
			ax: 1,
			ay: 2,
			period: 50,
			phaseX: 0,
			phaseY: Math.PI / 2,
			depthPeriod: 10,
			depthPhase: 0
		},
		{
			color: '#8338ec',
			size: 820,
			left: '78%',
			top: '12%',
			stone: powerStone,
			ax: 2,
			ay: 3,
			period: 52,
			phaseX: 0.5,
			phaseY: 0,
			depthPeriod: 16,
			depthPhase: 1.3
		},
		{
			color: '#3a86ff',
			size: 760,
			left: '50%',
			top: '50%',
			stone: spaceStone,
			ax: 3,
			ay: 2,
			period: 56,
			phaseX: Math.PI / 3,
			phaseY: Math.PI / 4,
			depthPeriod: 16,
			depthPhase: 2.1
		},
		{
			color: '#06ffa5',
			size: 640,
			left: '20%',
			top: '78%',
			stone: timeStone,
			ax: 3,
			ay: 4,
			period: 67,
			phaseX: 1.7,
			phaseY: 0.3,
			depthPeriod: 18,
			depthPhase: 0.8
		},
		{
			color: '#ffbe0b',
			size: 700,
			left: '85%',
			top: '72%',
			stone: mindStone,
			ax: 2,
			ay: 5,
			period: 60,
			phaseX: 0.9,
			phaseY: 1.2,
			depthPeriod: 15,
			depthPhase: 3.0
		},
		{
			color: '#ff4d00',
			size: 760,
			left: '50%',
			top: '92%',
			stone: soulStone,
			ax: 4,
			ay: 3,
			period: 60,
			phaseX: 2.0,
			phaseY: 0.7,
			depthPeriod: 12,
			depthPhase: 1.8
		}
	];
</script>

<div
	class="pointer-events-none fixed inset-0 isolate z-0 transform-gpu overflow-hidden bg-[#050510]"
	aria-hidden="true"
>
	{#each stones as s (s.stone)}
		<StoneGlow {...s} />
	{/each}
	<div
		class="absolute inset-0"
		style="background: radial-gradient(ellipse at center, transparent 35%, rgba(5, 5, 16, 0.55) 100%);"
	></div>
</div>
