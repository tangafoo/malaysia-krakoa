<script lang="ts">
	import type { Snippet } from 'svelte';
	let { children }: { children: Snippet } = $props();
</script>

<div class="xp-bevel-inset overflow-hidden bg-black py-1 text-yellow-300">
	<div class="xp-marquee-track font-vt323 text-xl">
		{@render children()}
	</div>
</div>
