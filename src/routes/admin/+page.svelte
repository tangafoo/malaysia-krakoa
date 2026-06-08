<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { getBrowserSupabase } from '$lib/supabase';
	import { PUBLIC_SITE_URL } from '$env/static/public';
	import XPWindow from '$lib/components/XPWindow.svelte';
	import XPButton from '$lib/components/XPButton.svelte';
	import FlairPill from '$lib/components/FlairPill.svelte';
	import { primaryByKey, secondaryByKey } from '$lib/flairs';
	import type { Comment } from '$lib/types';

	let email = $state('');
	let session = $state<{ user: { email?: string } } | null>(null);
	let loading = $state(true);
	let sendingLink = $state(false);
	let linkSent = $state(false);
	let pending = $state<Comment[]>([]);
	let actionError = $state('');

	onMount(async () => {
		if (!browser) return;
		const supabase = getBrowserSupabase();
		const { data } = await supabase.auth.getSession();
		session = data.session;
		if (session) await loadPending();
		loading = false;
		supabase.auth.onAuthStateChange((_event, s) => {
			session = s;
			if (s) loadPending();
			else pending = [];
		});
	});

	async function loadPending() {
		const supabase = getBrowserSupabase();
		const { data, error } = await supabase
			.from('comments')
			.select('*')
			.eq('status', 'pending')
			.order('created_at', { ascending: false });
		if (error) {
			actionError = error.message;
			return;
		}
		pending = (data ?? []) as Comment[];
	}

	async function sendLink(e: SubmitEvent) {
		e.preventDefault();
		sendingLink = true;
		actionError = '';
		const supabase = getBrowserSupabase();
		const { error } = await supabase.auth.signInWithOtp({
			email,
			options: {
				emailRedirectTo: `${PUBLIC_SITE_URL || window.location.origin}/admin`
			}
		});
		sendingLink = false;
		if (error) {
			actionError = error.message;
			return;
		}
		linkSent = true;
	}

	async function setStatus(id: string, status: 'approved' | 'rejected') {
		const supabase = getBrowserSupabase();
		const { error } = await supabase.from('comments').update({ status }).eq('id', id);
		if (error) {
			actionError = error.message;
			return;
		}
		pending = pending.filter((c) => c.id !== id);
	}

	async function signOut() {
		await getBrowserSupabase().auth.signOut();
	}
</script>

<svelte:head>
	<title>Admin — marvelfansforfeige.com</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<XPWindow title="Admin — Moderation Queue" icon="🛡️">
	{#if loading}
		<p class="font-tahoma py-6 text-center text-sm">Loading…</p>
	{:else if !session}
		<form onsubmit={sendLink} class="flex flex-col gap-3">
			<p class="font-tahoma text-sm">
				Admin access is restricted to allowlisted emails. Enter your email to receive a magic link.
			</p>
			<input
				type="email"
				bind:value={email}
				required
				placeholder="you@example.com"
				class="xp-bevel-inset font-tahoma bg-white px-2 py-1 text-base"
			/>
			{#if linkSent}
				<div class="xp-bevel-inset bg-[#ddffdd] px-2 py-1 text-sm">
					✓ Check your inbox for the magic link.
				</div>
			{/if}
			{#if actionError}
				<div class="xp-bevel-inset bg-[#ffdddd] px-2 py-1 text-sm text-red-800">{actionError}</div>
			{/if}
			<XPButton type="submit" variant="primary" disabled={sendingLink}>
				{sendingLink ? 'Sending…' : 'Send magic link'}
			</XPButton>
		</form>
	{:else}
		<div class="font-tahoma mb-3 flex items-center justify-between text-xs">
			<span>Signed in as <strong>{session.user.email ?? '?'}</strong></span>
			<XPButton onclick={signOut}>Sign out</XPButton>
		</div>
		{#if actionError}
			<div class="xp-bevel-inset bg-[#ffdddd] px-2 py-1 text-sm text-red-800">{actionError}</div>
		{/if}
		{#if pending.length === 0}
			<p class="font-tahoma py-6 text-center text-sm text-[#404040]">
				🎉 Inbox zero — no pending messages to review.
			</p>
		{:else}
			<ul class="flex flex-col gap-2">
				{#each pending as c (c.id)}
					<li class="xp-bevel bg-white p-2">
						<div class="font-tahoma flex flex-wrap items-center gap-2 text-xs">
							<strong>{c.name?.trim() || 'Anonymous Fan'}</strong>
							<span class="text-[#404040]">{new Date(c.created_at).toLocaleString()}</span>
							{#if c.primary_flair}
								{@const pf = primaryByKey(c.primary_flair)}
								{#if pf}<FlairPill flair={pf} />{/if}
							{/if}
							{#if c.secondary_flair}
								{@const sf = secondaryByKey(c.secondary_flair)}
								{#if sf}<FlairPill flair={sf} />{/if}
							{/if}
						</div>
						<p class="font-tahoma mt-1 text-sm whitespace-pre-wrap">{c.content}</p>
						{#if c.moderation_flags}
							<details class="mt-1 text-xs">
								<summary class="cursor-pointer text-[#404040]">moderation flags</summary>
								<pre class="bg-xp-tan mt-1 overflow-x-auto p-1 text-xs">{JSON.stringify(
										c.moderation_flags,
										null,
										2
									)}</pre>
							</details>
						{/if}
						<div class="mt-2 flex gap-2">
							<XPButton variant="primary" onclick={() => setStatus(c.id, 'approved')}>
								✓ Approve
							</XPButton>
							<XPButton variant="danger" onclick={() => setStatus(c.id, 'rejected')}>
								✕ Reject
							</XPButton>
						</div>
					</li>
				{/each}
			</ul>
		{/if}
	{/if}
</XPWindow>
