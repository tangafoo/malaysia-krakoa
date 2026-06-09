<script lang="ts">
	import XPWindow from '$lib/components/XPWindow.svelte';
	import XPButton from '$lib/components/XPButton.svelte';
	import CommentCard from '$lib/components/CommentCard.svelte';
	import HitCounter from '$lib/components/HitCounter.svelte';
	import FlairPill from '$lib/components/FlairPill.svelte';
	import SupremeIntelligence from '$lib/components/SupremeIntelligence.svelte';
	import {
		SECONDARY_FLAIRS,
		primaryByKey,
		secondaryByKey,
		type PrimaryFlairKey,
		type SecondaryFlairKey
	} from '$lib/flairs';
	import { SORT_LABELS, type SortKey } from '$lib/types';
	import { goto } from '$app/navigation';
	import { page as pageStore } from '$app/stores';

	let { data } = $props();

	let q = $state(data.q);

	function buildUrl(partial: Record<string, string | number>) {
		const params = new URLSearchParams($pageStore.url.search);
		for (const [k, v] of Object.entries(partial)) {
			if (!v && v !== 0) params.delete(k);
			else params.set(k, String(v));
		}
		return `/comments?${params.toString()}`;
	}

	function setSort(s: SortKey) {
		goto(buildUrl({ sort: s, page: 1 }));
	}

	function search(e: SubmitEvent) {
		e.preventDefault();
		goto(buildUrl({ q, page: 1 }));
	}

	function togglePrimary(key: PrimaryFlairKey) {
		goto(buildUrl({ primary: data.primary === key ? '' : key, page: 1 }));
	}

	function toggleSecondary(key: SecondaryFlairKey) {
		goto(buildUrl({ secondary: data.secondary === key ? '' : key, page: 1 }));
	}

	const activePrimaryFlair = $derived(primaryByKey(data.primary));
	const activeSecondaryFlair = $derived(secondaryByKey(data.secondary));
	const orderedPrimaryFlairs = $derived(
		data.orderedPrimaryFlairKeys.map((k) => primaryByKey(k)).filter((f) => !!f)
	);

	const sortKeys: SortKey[] = ['hot', 'new', 'top', 'controversial'];

	// Marvel-flavored personalities per filter.
	const filterStyle: Record<
		SortKey,
		{ icon: string; inactiveBg: string; inactiveText: string; activeText: string }
	> = {
		hot: {
			icon: '🔥',
			inactiveBg: 'bg-gradient-to-b from-[#ff8c5e] to-[#dc2626]',
			inactiveText: 'text-white',
			activeText: 'text-[#dc2626]'
		},
		new: {
			icon: '✨',
			inactiveBg: 'bg-gradient-to-b from-[#5db4e8] to-[#2b8df0]',
			inactiveText: 'text-white',
			activeText: 'text-[#0058e9]'
		},
		top: {
			icon: '🏆',
			inactiveBg: 'bg-gradient-to-b from-[#fde047] to-[#d97706]',
			inactiveText: 'text-[#7c2d12]',
			activeText: 'text-[#a16207]'
		},
		controversial: {
			icon: '🃏',
			inactiveBg: 'bg-gradient-to-b from-[#86efac] to-[#16a34a]',
			inactiveText: 'text-white',
			activeText: 'text-[#16a34a]'
		}
	};
</script>

<svelte:head>
	<title>All messages to Kevin Feige · marvelfansforfeige.com</title>
	<meta
		name="description"
		content="Browse every message Marvel fans have sent to Kevin Feige. Sort by hot, new, top, or controversial. Upvote the takes you agree with."
	/>
	<meta property="og:title" content="All messages to Kevin Feige" />
	<meta property="og:description" content="Every Marvel fan letter, sortable and upvotable." />
</svelte:head>

<XPWindow title="All Messages to Kevin — Browse &amp; Vote" icon="📂">
	<div class="flex flex-wrap items-center gap-2 border-b border-[#808080] pb-2">
		{#each sortKeys as s (s)}
			{@const style = filterStyle[s]}
			<button
				type="button"
				onclick={() => setSort(s)}
				class="xp-bevel font-tahoma inline-flex cursor-pointer items-center gap-1 px-3 py-1 text-sm font-bold {data.sort ===
				s
					? `xp-bevel-inset bg-white ${style.activeText}`
					: `${style.inactiveBg} ${style.inactiveText}`}"
			>
				<span aria-hidden="true">{style.icon}</span>
				{SORT_LABELS[s]}
			</button>
		{/each}

		<form onsubmit={search} class="ml-auto flex items-center gap-1">
			<input
				bind:value={q}
				placeholder="Search messages…"
				class="xp-bevel-inset font-tahoma bg-white px-2 py-1 text-sm"
			/>
			<XPButton type="submit">Search</XPButton>
		</form>
	</div>

	<div class="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-[#808080] pb-2">
		<span class="font-tahoma text-xs font-bold text-[#404040]">Filter:</span>
		{#each orderedPrimaryFlairs as flair (flair.key)}
			<FlairPill
				{flair}
				interactive
				selected={data.primary === flair.key}
				count={data.primaryCounts[flair.key] ?? 0}
				onclick={() => togglePrimary(flair.key)}
			/>
		{/each}
		<span class="font-tahoma text-xs text-[#808080]">·</span>
		{#each SECONDARY_FLAIRS as flair (flair.key)}
			<FlairPill
				{flair}
				interactive
				selected={data.secondary === flair.key}
				count={data.secondaryCounts[flair.key] ?? 0}
				onclick={() => toggleSecondary(flair.key)}
			/>
		{/each}
	</div>

	<div class="my-2 flex flex-wrap items-center gap-3">
		<HitCounter count={data.total} label="TOTAL" digits={5} />
		<p class="font-tahoma text-xs text-[#404040]">
			Sorted by <strong>{SORT_LABELS[data.sort]}</strong>{#if data.q}, searched <em>"{data.q}"</em
				>{/if}{#if activePrimaryFlair || activeSecondaryFlair}, filtered by
				{#if activePrimaryFlair}<strong>{activePrimaryFlair.label}</strong
					>{/if}{#if activePrimaryFlair && activeSecondaryFlair}
					·
				{/if}{#if activeSecondaryFlair}<strong>{activeSecondaryFlair.label}</strong>{/if}{/if}.
		</p>
	</div>

	{#if data.comments.length === 0}
		<p class="font-tahoma py-6 text-center text-sm text-[#404040]">
			No messages match.
			{#if data.q}
				<a href="/comments" class="text-xp-blue underline">Clear search</a>
			{/if}
		</p>
	{:else}
		<div class="columns-1 gap-3 sm:columns-2">
			{#each data.comments as comment (comment.id)}
				<div class="mb-3 break-inside-avoid">
					<CommentCard {comment} />
				</div>
			{/each}
		</div>

		<nav class="font-tahoma mt-4 flex items-center justify-center gap-2 text-sm">
			{#if data.page > 1}
				<XPButton href={buildUrl({ page: data.page - 1 })}>« Prev</XPButton>
			{/if}
			<span>
				Page <strong>{data.page}</strong> of <strong>{data.totalPages}</strong>
			</span>
			{#if data.page < data.totalPages}
				<XPButton href={buildUrl({ page: data.page + 1 })}>Next »</XPButton>
			{/if}
		</nav>
	{/if}
</XPWindow>

<div class="mt-4">
	<SupremeIntelligence summary={data.summary} />
</div>
