<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { getBrowserSupabase } from '$lib/supabase';

	let { initialPeak = 0 }: { initialPeak?: number } = $props();

	let count = $state(0);
	let connected = $state(false);
	let peak = $state(initialPeak);

	const atAllTimeHigh = $derived(connected && count > 0 && count >= peak);

	$effect(() => {
		if (!browser || count <= peak) return;
		const newPeak = count;
		peak = newPeak;
		fetch('/api/presence-record', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ count: newPeak })
		})
			.then((r) => r.json())
			.then((data) => {
				if (typeof data.peak === 'number' && data.peak > peak) peak = data.peak;
			})
			.catch(() => {});
	});

	onMount(() => {
		if (!browser) return;
		const supabase = getBrowserSupabase();
		const presenceKey = crypto.randomUUID();
		const channel = supabase.channel('mfff:online', {
			config: { presence: { key: presenceKey } }
		});

		channel
			.on('presence', { event: 'sync' }, () => {
				const state = channel.presenceState();
				count = Object.keys(state).length;
				connected = true;
			})
			.subscribe(async (status) => {
				if (status === 'SUBSCRIBED') {
					await channel.track({ online_at: new Date().toISOString() });
				}
			});

		return () => {
			channel.unsubscribe();
		};
	});
</script>

<div class="relative inline-block">
	<div
		class="xp-bevel bg-xp-gray inline-flex items-center gap-1 px-1.5 py-0.5 sm:gap-2 sm:px-2 sm:py-1"
	>
		<span class="font-tahoma text-[10px] font-bold uppercase sm:text-xs">Online</span>
		<span
			class="crt-screen xp-bevel-inset px-1 py-0.5 text-sm tracking-widest tabular-nums sm:px-2 sm:text-2xl"
		>
			{connected ? String(count).padStart(3, '0') : '---'}
		</span>
	</div>

	{#if atAllTimeHigh}
		<div
			class="font-tahoma absolute top-full left-0 mt-1 text-[10px] font-bold whitespace-nowrap text-yellow-300 sm:text-xs"
			style="text-shadow: 0 0 4px #fbbf24, 0 0 8px #f59e0b, 1px 1px 0 #000;"
		>
			✨ all-time high
		</div>
	{/if}
</div>
