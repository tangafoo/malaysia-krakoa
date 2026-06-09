<script lang="ts">
	let {
		count,
		label = 'VISITORS',
		digits = 6
	}: { count: number; label?: string; digits?: number } = $props();
	const padded = $derived(String(count).padStart(digits, '0'));
</script>

<div
	class="xp-bevel bg-xp-gray inline-flex items-center gap-1 px-1.5 py-0.5 sm:gap-2 sm:px-2 sm:py-1"
>
	<span class="font-tahoma text-[10px] font-bold uppercase sm:text-xs">{label}</span>
	<span class="crt-screen xp-bevel-inset px-1 py-0.5 text-sm tracking-widest sm:px-2 sm:text-2xl">
		{padded}
	</span>
</div>
