<script lang="ts">
	import XPWindow from '$lib/components/XPWindow.svelte';
	import XPButton from '$lib/components/XPButton.svelte';
	import KevinTooltip from '$lib/components/KevinTooltip.svelte';
</script>

<svelte:head>
	<title>About — marvelfansforfeige.com</title>
	<meta
		name="description"
		content="Why this site exists: after Thunderbolts*, a Malaysian Marvel fan built a guestbook for Kevin Feige. Made with SvelteKit, Supabase, Tailwind, and love."
	/>
	<meta property="og:title" content="About marvelfansforfeige.com" />
	<meta
		property="og:description"
		content="A love letter project from a Malaysian Marvel fan to Kevin Feige."
	/>
</svelte:head>

<div class="flex flex-col gap-4 lg:grid lg:grid-cols-3">
	<div class="lg:col-span-2">
		<XPWindow title="About — readme.txt" icon="📖">
			<div class="font-tahoma flex flex-col gap-3 text-sm leading-relaxed">
				<p>Hi!</p>
				<p>
					I'm a Marvel fan. After watching <em>Thunderbolts*</em> and seeing such a mid reaction
					(even tho it's such a great movie!!) - I felt that <KevinTooltip
						><strong>Kevin Feige</strong></KevinTooltip
					> (<a
						href="https://en.wikipedia.org/wiki/Kevin_Feige"
						target="_blank"
						rel="noreferrer"
						class="text-xp-blue underline">wiki</a
					>) might be a bit sad with all that "Marvel fatigue" talk.
				</p>
				<p>
					marvelfansforfeige.com is a small corner of the web where fans everywhere can leave short
					messages to the OG creative director of Marvel.
				</p>
				<p>
					Click <a href="/comments" class="text-xp-blue underline">All Messages</a> to read ALL comments,
					and upvote the takes you agree with.
				</p>
				<hr />
				<ul class="list-disc pl-5">
					<li>
						Be thoughtful - hateful & off-topic speech will get picked up by AI moderation
						(hopefully).
					</li>
					<li>No accounts. Just names (optional) and messages.</li>
					<li>One vote per device.</li>
				</ul>

				<h3 class="font-pixelify mt-2 text-lg">Contribute 🔨</h3>
				<p class="font-tahoma text-sm">
					Found a bug? Have a feature request? Feel free to reach out! <a
						href="mailto:chevaliertgf@gmail.com"
						class="text-xp-blue underline">hotelindiigo@gmail.com</a
					>
				</p>

				<h3 class="font-pixelify mt-2 text-lg">Built with</h3>
				<p>
					SvelteKit · Tailwind · DaisyUI · Supabase · OpenAI moderation · TMDB · Cloudflare Pages.
				</p>

				<div class="mt-3">
					<XPButton href="/" variant="primary">← Back to home</XPButton>
				</div>
			</div>
		</XPWindow>
	</div>

	<aside class="flex flex-col gap-3">
		<XPWindow title="Support — tip.exe" icon="💛">
			<p class="font-tahoma text-sm">
				Made from a Malaysian fan who wants to keep this site alive. If it made you smile, throw a
				coffee my way.
			</p>
			<div class="mt-3 flex">
				<a
					href="https://ko-fi.com/ctgfoo"
					target="_blank"
					rel="noreferrer"
					class="font-coral-pixels ml-auto inline-block max-w-fit rounded-full border-2 border-amber-500 bg-gradient-to-br from-amber-500 via-yellow-200 to-amber-500 px-4 text-2xl font-bold italic shadow-md hover:scale-105"
				>
					Tip
				</a>
			</div>
		</XPWindow>

		<XPWindow title="Credits" icon="✨">
			<p class="font-tahoma text-xs leading-relaxed">
				Movie data via <a
					class="text-xp-blue underline"
					href="https://themoviedb.org"
					target="_blank"
					rel="noreferrer">TMDB</a
				>. This product uses the TMDB API but is not endorsed or certified by TMDB.
			</p>
		</XPWindow>
	</aside>
</div>
