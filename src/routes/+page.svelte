<script lang="ts">
	import { enhance } from '$app/forms';
	import XPWindow from '$lib/components/XPWindow.svelte';
	import XPButton from '$lib/components/XPButton.svelte';
	import CommentCard from '$lib/components/CommentCard.svelte';
	import SpotlightVote from '$lib/components/SpotlightVote.svelte';
	import KevinTooltip from '$lib/components/KevinTooltip.svelte';
	import { cubicOut } from 'svelte/easing';
	import { formatReleaseDate } from '$lib/date';

	// Aero-style window transition: scales from 92%, fades, comes into focus from blur.
	// Pure 2000s Vista / WPF vibe.
	function aero(_node: Element, { delay = 0, duration = 250 } = {}) {
		return {
			delay,
			duration,
			easing: cubicOut,
			css: (t: number) => `
				opacity: ${t};
				transform: scale(${0.92 + 0.08 * t});
				filter: blur(${(1 - t) * 6}px);
			`
		};
	}

	let { data, form } = $props();

	let submitting = $state(false);
	let content = $state('');
	let name = $state('');
	let spotlightExpanded = $state(false);
	let currentQuote = $state(data.quote);
	let quoteRefreshed = $state(data.quoteRefreshedToday);
	let refreshingQuote = $state(false);

	async function refreshQuote() {
		if (quoteRefreshed || refreshingQuote) return;
		refreshingQuote = true;
		try {
			const res = await fetch('/api/quote-refresh', { method: 'POST' });
			const body = await res.json();
			if (res.ok) {
				currentQuote = { quote: body.quote, source: body.source };
				quoteRefreshed = true;
			} else if (res.status === 429) {
				if (body.quote) currentQuote = { quote: body.quote, source: body.source };
				quoteRefreshed = true;
			}
		} finally {
			refreshingQuote = false;
		}
	}
	const maxLen = 500;
	const remaining = $derived(maxLen - content.length);

	function onTextareaKeydown(e: KeyboardEvent) {
		if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
			e.preventDefault();
			const formEl = (e.currentTarget as HTMLTextAreaElement).form;
			formEl?.requestSubmit();
		}
	}
</script>

<svelte:head>
	<title>Marvel Fans for Feige</title>
</svelte:head>

{#snippet composer()}
	<XPWindow title="Compose Message for Kevin.exe" icon="✉️">
		<form
			method="POST"
			action="?/submit"
			class="flex flex-col gap-3"
			use:enhance={() => {
				submitting = true;
				return async ({ update, result }) => {
					await update({ reset: false });
					submitting = false;
					if (result.type === 'success') {
						content = '';
						name = '';
					}
				};
			}}
		>
			<label class="font-tahoma flex flex-col gap-1 text-sm">
				<span class="font-bold"
					>Your name <span class="font-normal text-[#404040]">(optional)</span></span
				>
				<input
					name="name"
					bind:value={name}
					maxlength="40"
					placeholder="Anonymous Fan"
					class="xp-bevel-inset font-tahoma bg-white px-2 py-1 text-base"
				/>
			</label>

			<label class="font-tahoma flex flex-col gap-1 text-sm">
				<span class="font-bold">
					Message for <KevinTooltip>Kevin Feige</KevinTooltip>
					<span class="font-normal text-[#404040]">({remaining} chars left)</span>
				</span>
				<textarea
					name="content"
					bind:value={content}
					maxlength={maxLen}
					required
					rows="4"
					placeholder="Dear Kevin..."
					onkeydown={onTextareaKeydown}
					class="xp-bevel-inset font-tahoma bg-white px-2 py-1 text-base"
				></textarea>
			</label>

			{#if form?.error}
				<div class="xp-bevel-inset bg-[#ffdddd] px-2 py-1 text-sm text-red-800">
					⚠ {form.error}
				</div>
			{/if}
			{#if form?.success}
				<div class="xp-bevel-inset bg-[#ddffdd] px-2 py-1 text-sm text-green-900">
					✓ {form.message}
				</div>
			{/if}

			<div class="flex items-center justify-between gap-2">
				<span class="font-tahoma text-xs text-[#404040]">
					The Watcher sees all 👀. ⌘+Enter to send.
				</span>
				<XPButton type="submit" variant="primary" disabled={submitting || !content.trim()}>
					{submitting ? 'Sending…' : 'Send'}
				</XPButton>
			</div>
		</form>
	</XPWindow>
{/snippet}

{#snippet top3()}
	<XPWindow title="Top 3 Messages for Kevin" icon="🔥">
		{#if data.top3.length === 0}
			<p class="font-tahoma py-4 text-center text-sm text-[#404040]">
				No messages yet. Be the first to send one!
			</p>
		{:else}
			<div class="flex flex-col gap-3">
				{#each data.top3 as comment, i (comment.id)}
					<CommentCard {comment} rank={i + 1} />
				{/each}
			</div>
			<div class="mt-3 text-right">
				<XPButton href="/comments" variant="default">See all messages →</XPButton>
			</div>
		{/if}
	</XPWindow>
{/snippet}

{#snippet quote()}
	<XPWindow title="Quote of the Day" icon="💡">
		<blockquote class="font-bokor text-3xl leading-snug text-[#3a2a1a]">
			"{currentQuote.quote}"
		</blockquote>
		<p class="font-coral-pixels mt-2 text-right text-sm font-bold">— {currentQuote.source}</p>
		<div class="mt-3 text-right">
			<XPButton onclick={refreshQuote} disabled={quoteRefreshed || refreshingQuote}>
				{quoteRefreshed ? '✓ Refreshed today' : refreshingQuote ? 'Refreshing…' : '🔄 New quote'}
			</XPButton>
		</div>
	</XPWindow>
{/snippet}

{#snippet spotlight()}
	<XPWindow
		title="Latest MCU Release"
		icon="🎬"
		maximized={spotlightExpanded}
		onMaximize={() => (spotlightExpanded = !spotlightExpanded)}
	>
		{#if spotlightExpanded}
			<div
				in:aero={{ duration: 250, delay: 200 }}
				out:aero={{ duration: 200 }}
				class="flex flex-col gap-3"
			>
				{#if data.spotlight.poster_url}
					<div class="xp-bevel-inset flex justify-center bg-black p-2">
						<img
							src={data.spotlight.poster_url}
							alt={data.spotlight.title}
							class="w-full max-w-xs"
						/>
					</div>
				{/if}
				<div>
					<h3 class="font-pixelify text-xl leading-tight">{data.spotlight.title}</h3>
					<p class="font-tahoma text-xs text-[#404040]">
						Released {formatReleaseDate(data.spotlight.release_date)}
					</p>
					<p class="font-tahoma mt-2 text-sm">{data.spotlight.overview}</p>
				</div>
			</div>
		{:else}
			<div in:aero={{ duration: 250, delay: 200 }} out:aero={{ duration: 200 }} class="flex gap-3">
				{#if data.spotlight.poster_url}
					<img
						src={data.spotlight.poster_url}
						alt={data.spotlight.title}
						class="xp-bevel-inset h-32 w-auto bg-black"
					/>
				{/if}
				<div class="flex-1">
					<h3 class="font-pixelify text-lg leading-tight">{data.spotlight.title}</h3>
					<p class="font-tahoma text-xs text-[#404040]">
						Released {formatReleaseDate(data.spotlight.release_date)}
					</p>
					<p class="font-tahoma mt-1 line-clamp-5 text-sm">{data.spotlight.overview}</p>
				</div>
			</div>
		{/if}
		{#if data.spotlight.tmdb_id}
			<div class="mt-3 border-t border-[#808080] pt-2">
				<SpotlightVote
					spotlightKey={String(data.spotlight.tmdb_id)}
					initialHearts={data.spotlightCounts?.hearts ?? 0}
					initialBrokenHearts={data.spotlightCounts?.broken_hearts ?? 0}
				/>
			</div>
		{/if}
	</XPWindow>
{/snippet}

<!-- Desktop layout: 2-col grid, composer/top3 left, quote/spotlight stacked right -->
<section class="hidden gap-4 lg:grid lg:grid-cols-3">
	<div class="flex flex-col gap-4 lg:col-span-2">
		{@render composer()}
		{@render top3()}
	</div>
	<aside class="flex flex-col gap-4">
		{@render quote()}
		{@render spotlight()}
	</aside>
</section>

<!-- Mobile layout: single column, composer → spotlight → top 5 → quote -->
<section class="flex flex-col gap-6 lg:hidden">
	{@render composer()}
	{@render spotlight()}
	{@render top3()}
	{@render quote()}
</section>
