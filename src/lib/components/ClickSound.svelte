<script lang="ts">
	import { onMount } from 'svelte';
	import { sounds, SOUND_KEYS, type SoundKey } from '$lib/sounds.svelte';

	const VALID_KEYS = new Set<SoundKey>(SOUND_KEYS);

	onMount(() => {
		sounds.hydrate();
		sounds.init();

		function onPointerDown(e: PointerEvent) {
			const t = e.target as Element | null;
			const el = t?.closest<HTMLElement>(
				'button, a, [role="button"], input[type="submit"], input[type="button"], input[type="checkbox"], input[type="radio"], summary, label, [data-click-sound]'
			);
			if (!el) return;
			const override = el.getAttribute('data-click-sound');
			if (override === 'none') return;
			if (override && VALID_KEYS.has(override as SoundKey)) {
				sounds.play(override as SoundKey);
				return;
			}
			sounds.click(e.pressure);
		}

		document.addEventListener('pointerdown', onPointerDown, true);
		return () => document.removeEventListener('pointerdown', onPointerDown, true);
	});
</script>
