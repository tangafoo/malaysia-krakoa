<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<div data-theme="retro" class="mx-auto flex min-h-screen max-w-6xl items-center">
	{@render children()}
</div>

<style lang="postcss">
	@reference "tailwindcss";
</style>
