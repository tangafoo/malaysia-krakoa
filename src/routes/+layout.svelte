<script lang="ts">
	import '../app.css';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { PUBLIC_POSTHOG_KEY, PUBLIC_POSTHOG_HOST } from '$env/static/public';
	import Taskbar from '$lib/components/Taskbar.svelte';
	import HitCounter from '$lib/components/HitCounter.svelte';
	import Marquee from '$lib/components/Marquee.svelte';
	import DarkBackdrop from '$lib/components/DarkBackdrop.svelte';
	import PresenceCounter from '$lib/components/PresenceCounter.svelte';

	let { children, data } = $props();

	onMount(async () => {
		if (!browser || !PUBLIC_POSTHOG_KEY) return;
		const { default: posthog } = await import('posthog-js');
		posthog.init(PUBLIC_POSTHOG_KEY, {
			api_host: PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
			capture_pageview: true,
			capture_pageleave: true,
			persistence: 'localStorage+cookie'
		});
	});
</script>

<svelte:head>
	<title>Marvel Fans for Feige</title>
	<meta
		name="description"
		content="A guestbook of love letters to Kevin Feige from Marvel fans worldwide. Inspired by Thunderbolts*."
	/>
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="marvelfansforfeige.com" />
	<meta property="og:title" content="Marvel Fans for Feige" />
	<meta
		property="og:description"
		content="The singular message Marvel fans want to send to Kevin Feige."
	/>
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Marvel Fans for Feige" />
	<meta
		name="twitter:description"
		content="The singular message Marvel fans want to send to Kevin Feige."
	/>
</svelte:head>

<DarkBackdrop />
<div class="font-tahoma relative z-10 min-h-screen text-black">
	<Taskbar />

	<div class="mx-auto mt-3 max-w-6xl px-3">
		<div class="xp-bevel bg-xp-gray flex flex-wrap items-stretch gap-2 p-2 shadow-lg">
			<HitCounter count={data.totalCount} label="MESSAGES" digits={6} />
			<PresenceCounter initialPeak={data.peakOnline} />
			<div class="min-w-0 flex-1">
				<Marquee>
					<span>
						★ NEW! ★ {data.totalCount} fans have written to Kevin Feige ★ marvelfansforfeige.com ★ Thunderbolts*
						was the best ★ Keep the MCU dream alive ★
					</span>
				</Marquee>
			</div>
		</div>
	</div>

	<main class="mx-auto max-w-6xl px-3 py-4 sm:py-6">
		{@render children()}
	</main>
	<footer class="mx-auto max-w-6xl px-3 py-6 text-center">
		<div class="xp-bevel bg-xp-tan font-tahoma inline-block px-3 py-2 text-xs">
			Built with love by a 🇲🇾 fan ✦ <a href="/about" class="text-xp-blue underline">About</a>
		</div>
	</footer>
</div>
