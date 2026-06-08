<script lang="ts">
	let { class: cls = '' }: { class?: string } = $props();
</script>

<svg
	viewBox="0 0 24 24"
	xmlns="http://www.w3.org/2000/svg"
	class={cls}
	aria-hidden="true"
	role="img"
>
	<path
		d="M4 18 C 4 10, 7 6, 12 6 C 17 6, 20 10, 20 18 L 16 15 L 12 18 L 8 15 Z"
		fill="#7f1d1d"
		stroke="#3d0a0a"
		stroke-width="1"
		stroke-linejoin="round"
	/>
	<path
		d="M3 8 C 5 3, 8 4, 9 7 M21 8 C 19 3, 16 4, 15 7"
		fill="none"
		stroke="#7f1d1d"
		stroke-width="2.2"
		stroke-linecap="round"
	/>
	<text
		x="12"
		y="15"
		text-anchor="middle"
		font-family="Impact, sans-serif"
		font-size="6"
		font-weight="900"
		fill="#fde047"
		stroke="#3d0a0a"
		stroke-width="0.3">DD</text
	>
</svg>
