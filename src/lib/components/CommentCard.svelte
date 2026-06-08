<script lang="ts">
	import type { Comment } from '$lib/types';
	import { formatCommentDate } from '$lib/date';
	import { primaryByKey, secondaryByKey } from '$lib/flairs';
	import { sounds } from '$lib/sounds.svelte';
	import XPButton from './XPButton.svelte';
	import FlairPill from './FlairPill.svelte';

	let {
		comment,
		rank,
		showPermalink = true,
		onVote
	}: {
		comment: Comment;
		rank?: number;
		showPermalink?: boolean;
		onVote?: (vote: 1 | -1) => void;
	} = $props();

	let upvotes = $state(comment.upvotes);
	let downvotes = $state(comment.downvotes);
	let voted = $state<1 | -1 | null>(null);
	let error = $state('');

	async function vote(v: 1 | -1) {
		if (voted) return;
		error = '';
		const optimisticUp = upvotes;
		const optimisticDown = downvotes;
		if (v === 1) upvotes += 1;
		else downvotes += 1;
		voted = v;
		try {
			const res = await fetch('/api/vote', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ comment_id: comment.id, vote_type: v })
			});
			if (!res.ok) {
				const body = await res.json().catch(() => ({}));
				if (res.status === 409) {
					error = 'Already voted from this device';
				} else {
					error = body.error ?? 'Vote failed';
				}
				upvotes = optimisticUp;
				downvotes = optimisticDown;
				voted = null;
				sounds.play('error');
				return;
			}
			const data = (await res.json()) as { upvotes: number; downvotes: number };
			upvotes = data.upvotes;
			downvotes = data.downvotes;
			onVote?.(v);
		} catch {
			upvotes = optimisticUp;
			downvotes = optimisticDown;
			voted = null;
			error = 'Network error';
			sounds.play('error');
		}
	}

	const displayName = $derived(comment.name?.trim() || 'Anonymous Fan');
	const sentAt = $derived(formatCommentDate(comment.created_at));
	const primaryFlair = $derived(primaryByKey(comment.primary_flair));
	const secondaryFlair = $derived(secondaryByKey(comment.secondary_flair));
</script>

<article class="xp-bevel bg-white">
	<header
		class="font-tahoma flex flex-wrap items-center gap-x-2 gap-y-1 border-b border-[#7a9bc4] bg-gradient-to-b from-[#dcebff] to-[#a4c4eb] px-2 py-1 text-xs"
	>
		<span aria-hidden="true" class="leading-none">💌</span>
		{#if rank}
			<span class="bg-red-600 px-1.5 py-0.5 font-bold text-white">#{rank}</span>
		{/if}
		<span class="text-xp-blue font-bold">{displayName}</span>
		<span class="text-[#404060]">· {sentAt}</span>
		{#if primaryFlair}
			{#if showPermalink}
				<a
					href={`/comments?primary=${primaryFlair.key}`}
					class="hover:opacity-80"
					aria-label={`Filter by ${primaryFlair.label}`}
				>
					<FlairPill flair={primaryFlair} colored />
				</a>
			{:else}
				<FlairPill flair={primaryFlair} colored />
			{/if}
		{/if}
		{#if secondaryFlair}
			{#if showPermalink}
				<a
					href={`/comments?secondary=${secondaryFlair.key}`}
					class="hover:opacity-80"
					aria-label={`Filter by ${secondaryFlair.label}`}
				>
					<FlairPill flair={secondaryFlair} colored />
				</a>
			{:else}
				<FlairPill flair={secondaryFlair} colored />
			{/if}
		{/if}
		<div class="flex-1"></div>
		{#if showPermalink}
			<a href={`/comment/${comment.id}`} class="text-xp-blue underline hover:text-[#0044b6]">link</a
			>
		{/if}
	</header>

	<div class="bg-white px-3 py-2">
		<p class="font-tahoma text-sm leading-snug whitespace-pre-wrap text-black">
			{comment.content}
		</p>
	</div>

	<footer class="bg-xp-gray flex items-center gap-2 border-t border-[#808080] px-2 py-1">
		<XPButton onclick={() => vote(1)} disabled={!!voted} ariaLabel="Upvote">
			<span class="text-base leading-none">👍</span>
			<span class="font-tahoma tabular-nums">{upvotes}</span>
		</XPButton>
		<XPButton onclick={() => vote(-1)} disabled={!!voted} ariaLabel="Downvote">
			<span class="text-base leading-none">👎</span>
			<span class="font-tahoma tabular-nums">{downvotes}</span>
		</XPButton>
		<div class="flex-1"></div>
		{#if error}
			<span class="font-tahoma text-xs text-red-700">{error}</span>
		{/if}
	</footer>
</article>
