<script lang="ts">
	import XPWindow from '$lib/components/XPWindow.svelte';
	import XPButton from '$lib/components/XPButton.svelte';
	import CommentCard from '$lib/components/CommentCard.svelte';
	import HitCounter from '$lib/components/HitCounter.svelte';
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

	const sortKeys: SortKey[] = ['hot', 'new', 'top', 'controversial'];
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
			<button
				type="button"
				onclick={() => setSort(s)}
				class="xp-bevel font-tahoma px-3 py-1 text-sm font-bold {data.sort === s
					? 'xp-bevel-inset bg-white'
					: 'bg-xp-gray'}"
			>
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

	<div class="my-2 flex items-center gap-3">
		<HitCounter count={data.total} label="TOTAL" digits={5} />
		<p class="font-tahoma text-xs text-[#404040]">
			Sorted by <strong>{SORT_LABELS[data.sort]}</strong>{#if data.q}, filtered by <em
					>"{data.q}"</em
				>{/if}.
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
		<div class="flex flex-col gap-2">
			{#each data.comments as comment, i (comment.id)}
				<div class={i % 2 === 0 ? 'bg-[#f4f1e1]' : 'bg-[#e8e3cf]'}>
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
