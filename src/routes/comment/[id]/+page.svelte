<script lang="ts">
	import XPWindow from '$lib/components/XPWindow.svelte';
	import XPButton from '$lib/components/XPButton.svelte';
	import CommentCard from '$lib/components/CommentCard.svelte';
	import { browser } from '$app/environment';

	let { data } = $props();

	const ogDesc = $derived(
		data.comment.content.length > 160
			? data.comment.content.slice(0, 157) + '…'
			: data.comment.content
	);
	const author = $derived(data.comment.name?.trim() || 'Anonymous Fan');

	async function share() {
		const url = browser ? window.location.href : '';
		try {
			if (navigator.share) {
				await navigator.share({ title: 'Marvel fans for Feige', text: ogDesc, url });
			} else {
				await navigator.clipboard.writeText(url);
				alert('Link copied to clipboard');
			}
		} catch {
			/* user dismissed */
		}
	}
</script>

<svelte:head>
	<title>{author}'s message to Kevin Feige</title>
	<meta property="og:title" content={`${author}'s message to Kevin Feige`} />
	<meta property="og:description" content={ogDesc} />
	<meta property="og:type" content="article" />
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content={`${author}'s message to Kevin Feige`} />
	<meta name="twitter:description" content={ogDesc} />
</svelte:head>

<XPWindow title="Message Permalink — marvelfansforfeige.com" icon="🔗">
	<CommentCard comment={data.comment} showPermalink={false} />
	<div class="font-tahoma mt-3 flex items-center justify-between gap-2 text-xs text-[#404040]">
		<a href="/comments" class="text-xp-blue underline">← Back to all messages</a>
		<XPButton onclick={share}>📋 Share this</XPButton>
	</div>
</XPWindow>
