<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { primaryByKey, type PrimaryFlair } from '$lib/flairs';
	import XPWindow from './XPWindow.svelte';
	import XPButton from './XPButton.svelte';

	let { stoneKey }: { stoneKey: string } = $props();

	const STORAGE_KEY = 'mff-stone-greeted';

	let show = $state(false);
	const stone = $derived(primaryByKey(stoneKey) as PrimaryFlair | undefined);

	onMount(() => {
		if (!browser || !stone) return;
		try {
			if (localStorage.getItem(STORAGE_KEY) !== 'yes') {
				show = true;
			}
		} catch {
			// localStorage unavailable — skip the greeting entirely.
		}
	});

	function dismiss() {
		try {
			localStorage.setItem(STORAGE_KEY, 'yes');
		} catch {
			// Ignore — they just see the popup again next visit.
		}
		show = false;
	}
</script>

{#if show && stone}
	<div
		class="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
		role="dialog"
		aria-modal="true"
		aria-labelledby="stone-greeting-title"
	>
		<div class="w-full max-w-md">
			<XPWindow title="✨ Welcome, Marvel Fan ✨" icon="🪄">
				<div class="flex flex-col items-center gap-3 py-2 text-center">
					{#if stone.iconImg}
						<img
							src={stone.iconImg}
							alt={stone.label}
							class="xp-bevel-inset flair-shimmer h-32 w-32 bg-black object-contain p-2"
						/>
					{/if}
					<h2 id="stone-greeting-title" class="font-pixelify text-2xl leading-tight text-black">
						You are fated to the<br />
						<span class="font-bokor text-3xl text-[#3a2a1a]">{stone.label}</span>
					</h2>
					<p class="font-tahoma max-w-xs text-sm text-[#404040]">
						The stone will reveal itself when it chooses to.
					</p>
					<XPButton variant="primary" onclick={dismiss}>Begin</XPButton>
				</div>
			</XPWindow>
		</div>
	</div>
{/if}
