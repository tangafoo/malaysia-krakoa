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
	<g fill="#dc2626" stroke="#1a0606" stroke-width="0.6" stroke-linejoin="round">
		<ellipse cx="12" cy="13" rx="3.6" ry="4" />
		<circle cx="12" cy="9" r="2.2" />
		<path d="M12 11 L6 7 L3 8.5" fill="none" stroke-linecap="round" stroke-width="1.4" />
		<path d="M12 11 L18 7 L21 8.5" fill="none" stroke-linecap="round" stroke-width="1.4" />
		<path d="M12 13 L4 13 L2 16" fill="none" stroke-linecap="round" stroke-width="1.4" />
		<path d="M12 13 L20 13 L22 16" fill="none" stroke-linecap="round" stroke-width="1.4" />
		<path d="M12 15 L5 17.5 L4 20.5" fill="none" stroke-linecap="round" stroke-width="1.4" />
		<path d="M12 15 L19 17.5 L20 20.5" fill="none" stroke-linecap="round" stroke-width="1.4" />
	</g>
	<g fill="#fff">
		<circle cx="11" cy="9" r="0.5" />
		<circle cx="13" cy="9" r="0.5" />
	</g>
</svg>
