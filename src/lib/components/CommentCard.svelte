<script lang="ts">
	import type { Comment } from '$lib/types';
	import XPButton from './XPButton.svelte';

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
		}
	}

	const displayName = $derived(comment.name?.trim() || 'Anonymous Fan');
	const sentAt = $derived(new Date(comment.created_at).toLocaleString());
</script>

<article class="xp-bevel bg-white">
	<header
		class="font-tahoma flex items-center gap-2 border-b border-[#808080] bg-gradient-to-b from-[#ece9d8] to-[#d4d0c8] px-2 py-1 text-xs"
	>
		{#if rank}
			<span class="bg-red-600 px-1.5 py-0.5 font-bold text-white">#{rank}</span>
		{/if}
		<span class="font-bold">From: {displayName}</span>
		<span class="text-[#404040]">· {sentAt}</span>
		<div class="flex-1"></div>
		{#if showPermalink}
			<a href={`/comment/${comment.id}`} class="text-xp-blue underline hover:text-[#3493ff]">link</a
			>
		{/if}
	</header>

	<div class="px-3 py-3">
		<p class="font-tahoma text-base leading-snug whitespace-pre-wrap text-black">
			{comment.content}
		</p>
	</div>

	<footer class="bg-xp-tan flex items-center gap-2 border-t border-[#808080] px-2 py-1.5">
		<XPButton onclick={() => vote(1)} disabled={!!voted} ariaLabel="Upvote">
			<span class="text-base leading-none">👍</span>
			<span class="font-tahoma tabular-nums">{upvotes}</span>
		</XPButton>
		<XPButton onclick={() => vote(-1)} disabled={!!voted} ariaLabel="Downvote">
			<span class="text-base leading-none">👎</span>
			<span class="font-tahoma tabular-nums">{downvotes}</span>
		</XPButton>
		<span class="font-tahoma flex-1 text-xs text-[#404040]">
			Score: <strong class="tabular-nums">{upvotes - downvotes}</strong>
		</span>
		{#if error}
			<span class="font-tahoma text-xs text-red-700">{error}</span>
		{/if}
	</footer>
</article>
