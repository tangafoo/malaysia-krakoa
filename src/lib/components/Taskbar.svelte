<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	let time = $state('--:--');

	onMount(() => {
		const tick = () => {
			const d = new Date();
			time = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
		};
		tick();
		const id = setInterval(tick, 30_000);
		return () => clearInterval(id);
	});

	const navLinks = [
		{ href: '/', label: 'Home', icon: '🏠' },
		{ href: '/comments', label: 'All Messages', icon: '💬' },
		{ href: '/about', label: 'About', icon: '📖' }
	];
</script>

<div
	class="xp-bevel sticky top-0 z-50 flex h-9 items-center gap-1 bg-gradient-to-b from-[#3493ff] via-[#0058e9] to-[#0044b6] px-1"
>
	<a
		href="/"
		class="xp-bevel font-pixelify flex h-7 items-center gap-1 rounded-r-full bg-gradient-to-b from-[#5db4e8] via-[#74a224] to-[#5a8019] px-3 text-sm font-bold text-white no-underline"
		aria-label="Start"
	>
		<span class="text-base">⊞</span> Start
	</a>

	{#each navLinks as link (link.href)}
		<a
			href={link.href}
			class="xp-bevel font-tahoma flex h-7 items-center gap-1 px-2 text-xs font-bold text-black no-underline {$page
				.url.pathname === link.href
				? 'xp-bevel-inset bg-xp-gray'
				: 'bg-xp-gray'}"
		>
			<span>{link.icon}</span>
			<span class="hidden sm:inline">{link.label}</span>
		</a>
	{/each}

	<div class="flex-1"></div>

	<div class="xp-bevel-inset font-tahoma bg-xp-gray flex h-7 items-center gap-1 px-2 text-xs">
		<span aria-hidden="true">🔊</span>
		<span aria-hidden="true">📡</span>
		<span class="font-bold tabular-nums">{time}</span>
	</div>
</div>
