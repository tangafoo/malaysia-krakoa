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
	<circle cx="12" cy="12" r="10" fill="#facc15" stroke="#1a1a1a" stroke-width="1.5" />
	<path
		d="M6.5 6.5 L17.5 17.5 M17.5 6.5 L6.5 17.5"
		stroke="#1a1a1a"
		stroke-width="3"
		stroke-linecap="square"
		fill="none"
	/>
</svg>
