<script lang="ts">
	import { enhance } from '$app/forms';
	import XPWindow from '$lib/components/XPWindow.svelte';
	import XPButton from '$lib/components/XPButton.svelte';
	import CommentCard from '$lib/components/CommentCard.svelte';

	let { data, form } = $props();

	let submitting = $state(false);
	let content = $state('');
	let name = $state('');
	const maxLen = 500;
	const remaining = $derived(maxLen - content.length);
</script>

<section class="grid grid-cols-1 gap-4 lg:grid-cols-3">
	<!-- Composer + top 5 (left, 2 cols) -->
	<div class="flex flex-col gap-4 lg:col-span-2">
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
						Message for Kevin Feige
						<span class="font-normal text-[#404040]">({remaining} chars left)</span>
					</span>
					<textarea
						name="content"
						bind:value={content}
						maxlength={maxLen}
						required
						rows="4"
						placeholder="Dear Kevin..."
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
						Spam &amp; hate filtered by AI moderation.
					</span>
					<XPButton type="submit" variant="primary" disabled={submitting || !content.trim()}>
						{submitting ? 'Sending…' : 'Send to Kevin'}
					</XPButton>
				</div>
			</form>
		</XPWindow>

		<XPWindow title="Top 5 Messages — Hot Right Now" icon="🔥">
			{#if data.top5.length === 0}
				<p class="font-tahoma py-4 text-center text-sm text-[#404040]">
					No messages yet. Be the first to send one!
				</p>
			{:else}
				<div class="flex flex-col gap-2">
					{#each data.top5 as comment, i (comment.id)}
						<CommentCard {comment} rank={i + 1} />
					{/each}
				</div>
				<div class="mt-3 text-right">
					<XPButton href="/comments" variant="default">See all messages →</XPButton>
				</div>
			{/if}
		</XPWindow>
	</div>

	<!-- Right column: spotlight + quote + hit counter -->
	<aside class="flex flex-col gap-4">
		<XPWindow title="Quote of the Day" icon="💡">
			<blockquote class="font-ballet text-2xl leading-snug text-[#3a2a1a]">
				"{data.quote.quote}"
			</blockquote>
			<p class="font-tahoma mt-2 text-right text-xs font-bold">— {data.quote.source}</p>
		</XPWindow>

		<XPWindow title="MCU Spotlight" icon="🎬">
			<div class="flex gap-3">
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
						Released {data.spotlight.release_date}
					</p>
					<p class="font-tahoma mt-1 line-clamp-5 text-sm">{data.spotlight.overview}</p>
				</div>
			</div>
		</XPWindow>
	</aside>
</section>
