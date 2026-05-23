<script lang="ts">
	import XPWindow from '$lib/components/XPWindow.svelte';
	import XPButton from '$lib/components/XPButton.svelte';
</script>

<svelte:head>
	<title>About — marvelfansforfeige.com</title>
</svelte:head>

<div class="flex flex-col gap-4 lg:grid lg:grid-cols-3">
	<div class="lg:col-span-2">
		<XPWindow title="About — readme.txt" icon="📖">
			<div class="font-tahoma flex flex-col gap-3 text-sm leading-relaxed">
				<p>
					Hi! I'm a Marvel fan from Malaysia. After watching <em>Thunderbolts*</em> and seeing the
					discourse around it — a great movie that just couldn't escape the "Marvel fatigue"
					narrative — I felt that <strong>Kevin Feige</strong> might be a bit sad.
				</p>
				<p>
					So I built this site. A small corner of the web where fans from anywhere can leave a short
					message of support, and the most-loved messages float to the top. Maybe one day Mr. Feige
					stumbles upon it and sees that there are still a lot of us cheering him on.
				</p>
				<p>
					It's also a focus group of sorts — what does the global fan community actually want to
					say? Click <a href="/comments" class="text-xp-blue underline">All Messages</a> to read everything
					and upvote the takes you agree with.
				</p>
				<h3 class="font-pixelify mt-2 text-lg">House rules</h3>
				<ul class="list-disc pl-5">
					<li>Be kind. Hateful or off-topic stuff gets filtered.</li>
					<li>No accounts. Just names (optional) and messages.</li>
					<li>One vote per device — be honest, this is a love letter.</li>
				</ul>

				<h3 class="font-pixelify mt-2 text-lg">Built with</h3>
				<p>
					SvelteKit · Tailwind · DaisyUI · Supabase · OpenAI moderation · TMDB · PostHog ·
					Cloudflare Pages. All open source, all small. The XP look is a love letter to the era that
					grew up on Spider-Man 2.
				</p>

				<div class="mt-3">
					<XPButton href="/" variant="primary">← Back to home</XPButton>
				</div>
			</div>
		</XPWindow>
	</div>

	<aside class="flex flex-col gap-3">
		<XPWindow title="Support — donate.exe" icon="💛">
			<p class="font-tahoma text-sm">
				Made from a Malaysian fan who wants to keep this site alive. If it made you smile, throw a
				coffee my way.
			</p>
			<div class="mt-3 text-center">
				<a
					href="https://ko-fi.com/"
					target="_blank"
					rel="noreferrer"
					class="font-pixelify inline-block max-w-fit rounded-full border-2 border-amber-500 bg-gradient-to-br from-amber-500 via-yellow-200 to-amber-500 px-6 py-1.5 text-lg font-bold italic shadow-md hover:scale-105"
				>
					Donate
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
