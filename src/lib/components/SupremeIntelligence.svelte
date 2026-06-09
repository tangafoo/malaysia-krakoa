<script lang="ts">
	import XPWindow from './XPWindow.svelte';
	import supremeKree from '$lib/assets/supreme-intelligence-kree.webp';

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
	let active = $state<Tab>('top');

	const tabs: { key: Tab; label: string; icon: string }[] = [
		{ key: 'top', label: 'TOP TAKES', icon: '🔥' },
		{ key: 'controversial', label: 'DISSENT', icon: '🃏' },
		{ key: 'overall', label: 'THE COLLECTIVE', icon: '🌌' }
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

	const generatedLabel = $derived.by(() => {
		if (!summary) return '';
		const d = new Date(summary.generated_at);
		const now = new Date();
		const diffMs = now.getTime() - d.getTime();
		const hrs = Math.floor(diffMs / (1000 * 60 * 60));
		if (hrs < 1) return 'just now';
		if (hrs < 24) return `${hrs}h ago`;
		const days = Math.floor(hrs / 24);
		return `${days}d ago`;
	});
</script>

<XPWindow title="Supreme Intelligence — K.E.V.I.N. transmissions" icon="🧠" titlebarVariant="green">
	<div class="flex flex-col gap-3">
		<!-- Tabs -->
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

		<!-- Kree screen -->
		<div class="xp-bevel-inset bg-black p-2">
			<div class="kree-screen min-h-[220px] p-4">
				<!-- Ghostly Supreme Intelligence head: absolute, low-opacity, screen-blend so the green
				     glow eats into the phosphor field. Cropped intentionally so it lurks. -->
				<img
					src={supremeKree}
					alt=""
					aria-hidden="true"
					class="kree-ghost pointer-events-none select-none"
				/>

				<div class="mb-2 flex items-center justify-between text-[10px] uppercase opacity-80">
					<span>◉ Transmission · Channel 0058</span>
					<span class="animate-pulse">● LIVE</span>
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
						<span>Synthesis: {summary.comments_analyzed} signals analyzed</span>
						<span>Last cycle: {generatedLabel}</span>
					</div>
				{:else}
					<p class="text-xl leading-snug tracking-wide opacity-90">
						The Supreme Intelligence is calibrating. Send messages to feed the collective.
					</p>
					<div class="mt-4 text-[10px] uppercase opacity-70">Awaiting first transmission…</div>
				{/if}
			</div>
		</div>

		<p class="font-tahoma text-[10px] text-[#404040]">
			Daily synthesis of fan signals. Refreshes once per Earth-cycle.
		</p>
	</div>
</XPWindow>
