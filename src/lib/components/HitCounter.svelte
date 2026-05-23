<script lang="ts">
	let {
		count,
		label = 'VISITORS',
		digits = 6
	}: { count: number; label?: string; digits?: number } = $props();
	const padded = $derived(String(count).padStart(digits, '0'));
</script>

<div class="xp-bevel bg-xp-gray inline-flex items-center gap-2 px-2 py-1">
	<span class="font-tahoma text-xs font-bold uppercase">{label}</span>
	<span class="crt-screen xp-bevel-inset px-2 py-0.5 text-2xl tracking-widest">{padded}</span>
</div>
