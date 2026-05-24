<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { getBrowserSupabase } from '$lib/supabase';

	let count = $state(0);
	let connected = $state(false);

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
