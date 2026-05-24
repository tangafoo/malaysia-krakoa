<script lang="ts">
	import XPButton from './XPButton.svelte';

	let {
		spotlightKey,
		initialHearts = 0,
		initialBrokenHearts = 0
	}: {
		spotlightKey: string;
		initialHearts?: number;
		initialBrokenHearts?: number;
	} = $props();

	let hearts = $state(initialHearts);
	let brokenHearts = $state(initialBrokenHearts);
	let voted = $state<1 | -1 | null>(null);
	let error = $state('');

	async function vote(sentiment: 1 | -1) {
		if (voted) return;
		error = '';
		const prevHearts = hearts;
		const prevBroken = brokenHearts;
		if (sentiment === 1) hearts += 1;
		else brokenHearts += 1;
		voted = sentiment;

		try {
			const res = await fetch('/api/spotlight-vote', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ spotlight_key: spotlightKey, sentiment })
			});
			if (!res.ok) {
				const body = await res.json().catch(() => ({}));
				if (res.status === 409) error = 'Already reacted from this device';
				else error = body.error ?? 'Vote failed';
				hearts = prevHearts;
				brokenHearts = prevBroken;
				voted = null;
				return;
			}
			const data = (await res.json()) as { hearts: number; broken_hearts: number };
			hearts = data.hearts;
			brokenHearts = data.broken_hearts;
		} catch {
			hearts = prevHearts;
			brokenHearts = prevBroken;
			voted = null;
			error = 'Network error';
		}
	}
</script>

<div class="flex flex-wrap items-center gap-2">
	<span class="font-tahoma text-xs font-bold text-[#404040] uppercase">How do you feel?</span>
	<XPButton onclick={() => vote(1)} disabled={!!voted} ariaLabel="Heart">
		<span class="text-base leading-none">❤️</span>
		<span class="font-tahoma tabular-nums">{hearts}</span>
	</XPButton>
	<XPButton onclick={() => vote(-1)} disabled={!!voted} ariaLabel="Broken heart">
		<span class="text-base leading-none">❤️‍🩹</span>
		<span class="font-tahoma tabular-nums">{brokenHearts}</span>
	</XPButton>
	{#if error}
		<span class="font-tahoma text-xs text-red-700">{error}</span>
	{/if}
</div>
