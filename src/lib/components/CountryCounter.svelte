<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import XPWindow from './XPWindow.svelte';
	import { MARVEL_LOCATIONS, REAL_COUNTRIES, countryDisplay } from '$lib/country-data';
	import { sounds } from '$lib/sounds.svelte';

	type TopCountry = { country_code: string; visitor_count: number };

	let {
		visitorCountry,
		topCountries
	}: {
		visitorCountry: string | null;
		topCountries: TopCountry[];
	} = $props();

	let overrideOpen = $state(false);
	let searchTerm = $state('');
	let submitting = $state(false);
	let errorMsg = $state<string | null>(null);
	let overrideEl: HTMLDivElement | undefined = $state();
	let toggleEl: HTMLButtonElement | undefined = $state();
	let searchInputEl: HTMLInputElement | undefined = $state();

	const visitorVisual = $derived(visitorCountry ? countryDisplay(visitorCountry) : null);

	const filteredReal = $derived.by(() => {
		const q = searchTerm.trim().toLowerCase();
		if (!q) return REAL_COUNTRIES;
		return REAL_COUNTRIES.filter((c) => c.name.toLowerCase().includes(q));
	});

	const filteredMarvel = $derived.by(() => {
		const q = searchTerm.trim().toLowerCase();
		if (!q) return MARVEL_LOCATIONS;
		return MARVEL_LOCATIONS.filter((m) => m.name.toLowerCase().includes(q));
	});

	$effect(() => {
		if (!overrideOpen) return;
		// Wait for the conditional block to paint, then bring the dropdown into view
		// with breathing room. Manual scrollBy so we can add a margin below — the
		// built-in scrollIntoView flush-aligns the edge with the viewport.
		requestAnimationFrame(() => {
			if (overrideEl) {
				const rect = overrideEl.getBoundingClientRect();
				const margin = 32;
				const overflowBottom = rect.bottom + margin - window.innerHeight;
				if (overflowBottom > 0) {
					window.scrollBy({ top: overflowBottom, behavior: 'smooth' });
				} else if (rect.top < 0) {
					window.scrollBy({ top: rect.top - margin, behavior: 'smooth' });
				}
			}
			searchInputEl?.focus({ preventScroll: true });
		});
		const onDown = (e: PointerEvent) => {
			const target = e.target as Node | null;
			if (!target) return;
			if (overrideEl?.contains(target)) return;
			if (toggleEl?.contains(target)) return;
			overrideOpen = false;
		};
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') overrideOpen = false;
		};
		document.addEventListener('pointerdown', onDown);
		document.addEventListener('keydown', onKey);
		return () => {
			document.removeEventListener('pointerdown', onDown);
			document.removeEventListener('keydown', onKey);
		};
	});

	async function pick(code: string) {
		if (submitting) return;
		submitting = true;
		errorMsg = null;
		try {
			const res = await fetch('/api/country-override', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ country_code: code })
			});
			const body = await res.json().catch(() => ({}));
			if (!res.ok) {
				sounds.play('error');
				errorMsg = body.error ?? 'Could not update location.';
				return;
			}
			overrideOpen = false;
			searchTerm = '';
			await invalidateAll();
		} catch {
			sounds.play('error');
			errorMsg = 'Network error. Try again.';
		} finally {
			submitting = false;
		}
	}
</script>

<XPWindow title="Visitors" icon="🌐">
	<div class="flex flex-col gap-3">
		<div class="xp-bevel-inset rounded-lg bg-white/80 px-3 py-2">
			<section class="flex items-start justify-between">
				<div class="flex flex-col justify-between gap-1">
					<div class="font-coral-pixels text-[10px] tracking-wide text-[#404040] uppercase">
						Choose <span class="underline underline-offset-1">Your</span> Location
					</div>
					{#if visitorVisual}
						<div class="font-bokor mt-0.5 flex items-center gap-2 text-2xl text-black">
							<span class="tracking-wider!">{visitorVisual.label}</span>
							<svg
								class="signal-dot"
								viewBox="0 0 12 12"
								aria-hidden="true"
								xmlns="http://www.w3.org/2000/svg"
							>
								<polygon points="6,1 11,10.5 1,10.5" />
							</svg>
						</div>
					{:else}
						<div class="font-pixelify mt-0.5 text-base text-[#404040] italic">
							Somewhere in the multiverse…
						</div>
					{/if}
					<div>
						<button
							bind:this={toggleEl}
							type="button"
							onclick={() => (overrideOpen = !overrideOpen)}
							class="cursor-pointer border-0 bg-transparent p-0 text-xs text-[#0058e9] underline hover:text-[#003a9e]"
						>
							{overrideOpen ? 'Cancel ▴' : 'Change location? ▾'}
						</button>
					</div>
				</div>
				<span aria-hidden="true" class="text-8xl">{visitorVisual?.visual}</span>
			</section>
		</div>

		{#if overrideOpen}
			<div bind:this={overrideEl} class="xp-bevel-inset flex flex-col gap-2 bg-white p-2">
				<input
					bind:this={searchInputEl}
					bind:value={searchTerm}
					placeholder="Search countries (or realms)…"
					class="xp-bevel-inset font-tahoma bg-white px-2 py-1 text-sm"
					data-click-sound="none"
				/>
				{#if errorMsg}
					<div class="font-tahoma bg-[#ffdddd] px-2 py-1 text-xs text-red-800">
						⚠ {errorMsg}
					</div>
				{/if}
				<div class="max-h-64 overflow-y-auto pr-1">
					{#if filteredMarvel.length > 0}
						<div
							class="font-tahoma sticky top-0 bg-[#ece9d8] px-1 py-0.5 text-[10px] font-bold tracking-wider text-[#404040] uppercase"
						>
							Multiverse
						</div>
						<ul class="flex flex-col">
							{#each filteredMarvel as m (m.code)}
								<li>
									<button
										type="button"
										disabled={submitting}
										onclick={() => pick(m.code)}
										class="font-tahoma flex w-full cursor-pointer items-center gap-2 border-0 bg-transparent px-2 py-1 text-left text-sm hover:bg-[#dcdcc8] disabled:cursor-wait"
									>
										<span aria-hidden="true" class="text-base">{m.emoji}</span>
										<span>{m.name}</span>
									</button>
								</li>
							{/each}
						</ul>
					{/if}
					{#if filteredReal.length > 0}
						<div
							class="font-tahoma sticky top-0 bg-[#ece9d8] px-1 py-0.5 text-[10px] font-bold tracking-wider text-[#404040] uppercase"
						>
							Earth
						</div>
						<ul class="flex flex-col">
							{#each filteredReal as c (c.code)}
								<li>
									<button
										type="button"
										disabled={submitting}
										onclick={() => pick(c.code)}
										class="font-tahoma flex w-full cursor-pointer items-center gap-2 border-0 bg-transparent px-2 py-1 text-left text-sm hover:bg-[#dcdcc8] disabled:cursor-wait"
									>
										<span aria-hidden="true" class="text-base">{countryDisplay(c.code).visual}</span
										>
										<span>{c.name}</span>
									</button>
								</li>
							{/each}
						</ul>
					{/if}
					{#if filteredMarvel.length === 0 && filteredReal.length === 0}
						<p class="font-tahoma px-2 py-3 text-center text-xs text-[#404040]">
							No locations match "{searchTerm}".
						</p>
					{/if}
				</div>
			</div>
		{/if}

		<div>
			<div class="font-tahoma flex items-baseline justify-between gap-2">
				<h3 class="font-coral-pixels text-xs font-bold tracking-wide text-[#404040] uppercase">
					Most Popular Destinations
				</h3>
			</div>

			{#if topCountries.length === 0}
				<p class="font-tahoma py-3 text-center text-xs text-[#404040]">Calibrating signal…</p>
			{:else}
				<ol class="mt-1.5 flex flex-col gap-1">
					{#each topCountries as row, i (row.country_code)}
						{@const v = countryDisplay(row.country_code)}
						<li
							class="font-tahoma flex items-center gap-2 border-b border-dashed border-[#cfcfb8] py-1 text-sm last:border-b-0"
						>
							<span class="font-bokor w-4 text-right text-xs font-bold text-[#404040]"
								>{i + 1}.</span
							>
							<span aria-hidden="true" class="text-base">{v.visual}</span>
							<span class="flex-1 truncate">{v.label}</span>
							<span class="text-[#404040] tabular-nums">{row.visitor_count}</span>
						</li>
					{/each}
				</ol>
			{/if}
		</div>
	</div>
</XPWindow>

<style>
	.signal-dot {
		display: inline-block;
		width: 10px;
		height: 10px;
		fill: darkgreen;
		filter: drop-shadow(0 0 4px rgba(173, 255, 47, 0.7));
		animation: signal-blink 3s ease-in-out infinite;
	}
	@keyframes signal-blink {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.3;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.signal-dot {
			animation: none;
		}
	}
</style>
