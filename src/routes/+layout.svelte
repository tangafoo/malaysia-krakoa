<script lang="ts">
	import '../app.css';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { PUBLIC_POSTHOG_KEY, PUBLIC_POSTHOG_HOST } from '$env/static/public';
	import Taskbar from '$lib/components/Taskbar.svelte';
	import HitCounter from '$lib/components/HitCounter.svelte';
	import Marquee from '$lib/components/Marquee.svelte';

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
	<title>marvelfansforfeige.com — fan letters for Kevin</title>
	<meta
		name="description"
		content="A guestbook of love letters to Kevin Feige from Marvel fans worldwide. Inspired by Thunderbolts*."
	/>
	<meta property="og:title" content="Marvel fans for Feige" />
	<meta
		property="og:description"
		content="The singular message Marvel fans want to send to Kevin Feige."
	/>
</svelte:head>

<div data-theme="retro" class="font-tahoma min-h-screen text-black">
	<Taskbar />

	<div class="mx-auto mt-3 max-w-6xl px-3">
		<div class="xp-bevel bg-xp-gray flex flex-wrap items-stretch gap-2 p-2">
			<HitCounter count={data.totalCount} label="MESSAGES" digits={6} />
			<div class="xp-bevel bg-xp-gray inline-flex items-center gap-2 px-2 py-1 opacity-70">
				<span class="font-tahoma text-xs font-bold uppercase">Online</span>
				<span class="crt-screen xp-bevel-inset px-2 py-0.5 text-2xl tracking-widest">--</span>
				<span class="font-tahoma text-[10px] text-[#404040]">(soon™)</span>
			</div>
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
			Best viewed in <span class="font-bold">Internet Explorer 6</span>. ✦ Made with love by a
			Malaysian fan. ✦ <a href="/about" class="text-xp-blue underline">About</a>
		</div>
	</footer>
</div>
