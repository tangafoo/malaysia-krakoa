<script lang="ts">
	import XPWindow from './XPWindow.svelte';
	import supremeKree from '$lib/assets/supreme-intelligence-kree.webp';
	import { formatDistanceToNow } from 'date-fns';

	type SummaryShape = {
		top_summary: string;
		controversial_summary: string;
		overall_summary: string;
		comments_analyzed: number;
		model: string;
		generated_at: string;
	} | null;

	let { summary }: { summary: SummaryShape } = $props();

	type Tab = 'top' | 'controversial' | 'overall';
	let active = $state<Tab>('overall');

	const tabs: { key: Tab; label: string; icon: string }[] = [
		{ key: 'overall', label: 'ALL', icon: '✨' },
		{ key: 'top', label: 'TOP', icon: '🔥' },
		{ key: 'controversial', label: 'CONTROVERSIAL', icon: '🃏' }
	];

	const body = $derived(
		summary
			? active === 'top'
				? summary.top_summary
				: active === 'controversial'
					? summary.controversial_summary
					: summary.overall_summary
			: ''
	);

	const generatedLabel = $derived(
		summary ? formatDistanceToNow(new Date(summary.generated_at), { addSuffix: true }) : ''
	);

	let helpOpen = $state(false);
	let helpWrapEl: HTMLDivElement | undefined = $state();

	$effect(() => {
		if (!helpOpen) return;
		const onClick = (e: MouseEvent) => {
			if (helpWrapEl && !helpWrapEl.contains(e.target as Node)) helpOpen = false;
		};
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') helpOpen = false;
		};
		document.addEventListener('click', onClick);
		document.addEventListener('keydown', onKey);
		return () => {
			document.removeEventListener('click', onClick);
			document.removeEventListener('keydown', onKey);
		};
	});
</script>

<XPWindow
	title="Kree Supreme Intelligence - Supremor"
	icon="🧠"
	titlebarVariant="green"
	bodyClass="bg-neutral-350!"
>
	<div class="flex flex-col gap-3">
		<!-- Tabs + help -->
		<div class="flex flex-wrap items-center justify-between gap-2">
			<div role="tablist" aria-label="Summary view" class="flex flex-wrap gap-1 text-xs">
				{#each tabs as t (t.key)}
					<button
						type="button"
						role="tab"
						aria-selected={active === t.key}
						onclick={() => (active = t.key)}
						class="kree-tab"
					>
						<span aria-hidden="true">{t.icon}</span>
						{t.label}
					</button>
				{/each}
			</div>

			<div bind:this={helpWrapEl} class="relative">
				<button
					type="button"
					onclick={(e) => {
						e.stopPropagation();
						helpOpen = !helpOpen;
					}}
					aria-label="What is the Supreme Intelligence?"
					aria-expanded={helpOpen}
					class="kree-help-btn"
				>
					?
				</button>
				{#if helpOpen}
					<div role="tooltip" class="kree-help-popup">
						AI synthesis of every piece of fanmail sent to Kevin Feige. The Kree oracle reads the
						room so you don't have to. Can you change the sentiment?
					</div>
				{/if}
			</div>
		</div>

		<!-- Kree screen -->
		<div class="xp-bevel-inset rounded-xl bg-black p-2">
			<div class="kree-screen min-h-[220px] p-4">
				<!-- Ghostly Supreme Intelligence head: absolute, low-opacity, screen-blend so the green
				     glow eats into the phosphor field. Cropped intentionally so it lurks. -->
				<img
					src={supremeKree}
					alt=""
					aria-hidden="true"
					class="kree-ghost pointer-events-none select-none"
				/>

				<div class="mb-2 flex items-center justify-between text-xs uppercase opacity-80">
					<span>Analyzed: {summary?.comments_analyzed}</span>
					<span>Last cycle: {generatedLabel}</span>
				</div>

				{#if summary}
					{#key active}
						<p class="text-xl leading-snug tracking-wide">
							{body}
						</p>
					{/key}
					<div
						class="mt-4 flex flex-wrap items-center justify-between gap-2 text-[10px] uppercase opacity-70"
					>
						<span>◉ Transmission · Channel 428</span>
						<span class="animate-pulse text-lg text-emerald-300!">● LIVE</span>
					</div>
				{:else}
					<p class="text-xl leading-snug tracking-wide opacity-90">
						The Supreme Intelligence is calibrating. Send fanmail to feed the collective.
					</p>
					<div class="mt-4 text-[10px] uppercase opacity-70">Awaiting first transmission…</div>
				{/if}
			</div>
		</div>

		<p class="font-tahoma text-[10px] text-[#404040]">Refreshed Daily.</p>
	</div>
</XPWindow>
