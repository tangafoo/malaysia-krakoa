import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	// workers-og ships a .wasm that Node can't load — keep it external for SSR
	// (Cloudflare Workers runtime supports WASM natively at runtime)
	ssr: {
		external: ['workers-og']
	},
	optimizeDeps: {
		exclude: ['workers-og']
	}
});
