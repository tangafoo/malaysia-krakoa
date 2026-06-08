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
		d="M12 2 L22 20 L2 20 Z"
		fill="#15803d"
		stroke="#0a3d1b"
		stroke-width="1.4"
		stroke-linejoin="round"
	/>
	<path d="M7 17 L17 17" stroke="#fde047" stroke-width="2.4" stroke-linecap="round" />
	<text
		x="12"
		y="16"
		text-anchor="middle"
		font-family="Impact, sans-serif"
		font-size="9"
		font-weight="900"
		fill="#fde047"
		stroke="#0a3d1b"
		stroke-width="0.4">A</text
	>
</svg>
