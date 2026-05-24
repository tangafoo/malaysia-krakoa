<script lang="ts">
	import XPWindow from '$lib/components/XPWindow.svelte';
	import CommentCard from '$lib/components/CommentCard.svelte';
	import CopyLinkShare from '$lib/components/CopyLinkShare.svelte';
	import { PUBLIC_SITE_URL } from '$env/static/public';
	import { page } from '$app/stores';

	let { data } = $props();

	const ogDesc = $derived(
		data.comment.content.length > 160
			? data.comment.content.slice(0, 157) + '…'
			: data.comment.content
	);
	const author = $derived(data.comment.name?.trim() || 'Anonymous Fan');

	const siteUrl = PUBLIC_SITE_URL || 'https://marvelfansforfeige.com';
	const canonical = $derived(`${siteUrl}/comment/${data.comment.id}`);
	const ogImage = $derived(`${siteUrl}/api/og/${data.comment.id}`);

	const jsonLd = $derived(
		JSON.stringify({
			'@context': 'https://schema.org',
			'@type': 'DiscussionForumPosting',
			headline: `${author}'s message to Kevin Feige`,
			articleBody: data.comment.content,
			datePublished: data.comment.created_at,
			url: canonical,
			author: { '@type': 'Person', name: author },
			interactionStatistic: [
				{
					'@type': 'InteractionCounter',
					interactionType: 'https://schema.org/LikeAction',
					userInteractionCount: data.comment.upvotes
				},
				{
					'@type': 'InteractionCounter',
					interactionType: 'https://schema.org/DislikeAction',
					userInteractionCount: data.comment.downvotes
				}
			]
		})
	);
</script>

<svelte:head>
	<title>{author}'s message to Kevin Feige · marvelfansforfeige.com</title>
	<meta name="description" content={ogDesc} />
	<link rel="canonical" href={canonical} />
	<meta property="og:type" content="article" />
	<meta property="og:url" content={canonical} />
	<meta property="og:title" content={`${author}'s message to Kevin Feige`} />
	<meta property="og:description" content={ogDesc} />
	<meta property="og:image" content={ogImage} />
	<meta property="og:site_name" content="marvelfansforfeige.com" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={`${author}'s message to Kevin Feige`} />
	<meta name="twitter:description" content={ogDesc} />
	<meta name="twitter:image" content={ogImage} />
	<!-- JSON-LD structured data. jsonLd is JSON.stringify'd, so no XSS risk. -->
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html '<script type="application/ld+json">' + jsonLd + '</' + 'script>'}
</svelte:head>

<XPWindow title="Message Permalink — marvelfansforfeige.com" icon="🔗">
	<CommentCard comment={data.comment} showPermalink={false} />
	<div class="font-tahoma mt-3 flex items-center justify-between gap-2 text-xs text-[#404040]">
		<a href="/comments" class="text-xp-blue underline">← Back to all messages</a>
		<CopyLinkShare href={$page.url.href} />
	</div>
</XPWindow>
