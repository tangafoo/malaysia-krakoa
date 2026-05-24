# CLAUDE.md

Notes for future Claude sessions working on this repo. Read this first.

## What this is

**marvelfansforfeige.com** — a fan-letter guestbook for Kevin Feige, built after Thunderbolts\* by a Malaysian Marvel fan. Visitors leave short messages, upvote/downvote each other's takes, and a "hot" algorithm surfaces the best ones. Heavy retro/2000s aesthetic — Windows XP/Vista UI chrome (titlebars, bevels, taskbar), iTunes-visualizer dark backdrop with Infinity-Stone blob glows behind everything.

Live on Cloudflare Pages. Domain: marvelfansforfeige.com.

## Stack

- **SvelteKit 2** (Svelte 5 runes — `$state`, `$props`, `$derived`, snippets). No legacy stores or `export let`.
- **Tailwind v4** via `@tailwindcss/vite`. Tailwind v4 quirks worth remembering:
  - Important modifier is now a **suffix**: `bg-red-500!`, NOT the old `!bg-red-500` (silently no-ops).
  - Preflight sets `cursor: default` on `<button>` — opt back in with `cursor-pointer` explicitly.
- **Cloudflare Pages adapter** (`@sveltejs/adapter-cloudflare`). All server routes run on Workers — keep them lean, no heavy Node-only deps.
- **Supabase** for data (Postgres + RLS). Server-side via `@supabase/supabase-js` using the service role.
- **PostHog** for analytics (initialized client-side in `+layout.svelte`).
- **TMDB API** for the MCU Spotlight panel (`src/lib/server/tmdb.ts`).
- **OpenAI moderation** for comment screening (`src/lib/server/moderation.ts`).
- **GSAP** for the backdrop blob animation. Loaded via dynamic import (`await import('gsap')`) so it's never SSR-evaluated.

**daisyUI was removed** — the project doesn't use any daisyUI component classes; the XP/Vista look is all bespoke CSS in `src/app.css` plus per-component Tailwind. Don't reintroduce daisyUI.

## Repo layout

```
src/
  app.css                       Global styles incl. .xp-bevel, .xp-bevel-inset,
                                .xp-titlebar, .xp-marquee-track, .crt-screen.
                                Body bg is #050510 (deep space).
  app.html                      Sets favicon (svg + png fallback) + viewport meta.
  app.d.ts                      App.Locals etc.
  lib/
    feige-quote.ts              quoteOfTheDay() — deterministic daily rotation.
    date.ts                     Date helpers (formatReleaseDate, etc.).
    types.ts                    RankedComment + other shared TS types.
    supabase.ts                 Browser client (if any). Most usage is server.
    data/feige-quotes.json      Pool of Kevin Feige quotes.
    assets/                     Stone PNGs (mind/space/reality/power/time/sould).
                                Note "sould" misspelling — keep as-is, it matches the file.
                                Also kevin_feige.jpg used by KevinTooltip.
    components/                 All UI primitives — see "Components" below.
    server/
      supabase.ts               getServerSupabase() — service-role client.
      hash.ts                   getClientIp() + voterHash(ip, ua) — used for rate limiting.
      moderation.ts             OpenAI moderation wrapper.
      tmdb.ts                   getLatestMCU() — Spotlight data.
  routes/
    +layout.svelte              DarkBackdrop, Taskbar, HitCounter, Marquee, footer.
    +layout.server.ts           Loads totalCount for the marquee.
    +page.svelte                Home: Compose + Top 5 + Quote + MCU Spotlight (4 XPWindows).
    +page.server.ts             Loads top 5 (hot), spotlight, user's refreshed-quote-of-day.
                                Actions.submit → moderated comment insert with rate limit.
    comments/                   "All Messages" page with sort options (hot/new/top/controversial).
    comment/[id]/               Single message permalink with OG metadata.
    about/                      About page + donate (Ko-fi: ko-fi.com/ctgfoo).
    admin/                      Admin moderation queue (auth-gated by admin_emails table).
    sitemap.xml/                Generated sitemap.
    api/
      vote/                     POST: upvote/downvote a comment.
      spotlight-vote/           POST: heart / broken-heart the MCU Spotlight.
      quote-refresh/            POST: refresh quote-of-the-day (once per user per day).
      og/                       Dynamic OG image generator (workers-og).
supabase/migrations/            Numbered SQL migrations. Apply with `supabase db push`.
static/                         favicon.svg, favicon.png, robots.txt,
                                .well-known/appspecific/com.chrome.devtools.json (silences a dev-only Chrome probe).
```

## Components

All in `src/lib/components/`:

- **XPWindow** — the canonical panel. Has rounded corners + shadow, min/max/close buttons. Props: `title`, `icon?`, `actions?` snippet, `bodyClass?`, `titleClass?`, `onMaximize?: () => void`, `maximized?: boolean`. Minimize is local state inside XPWindow (no callback needed); maximize is opt-in per consumer. When `onMaximize` is unset, that button is disabled/decorative.
- **XPButton** — XP-style button. Renders `<a>` if `href` set, else `<button>`. Variants: `default | primary | danger`.
- **Taskbar** — sticky blue XP taskbar with nav links + clock. No "Start" button (was removed).
- **HitCounter** — green CRT-style numeric counter (`crt-screen` class).
- **PresenceCounter** — live online-now count (Supabase realtime channel).
- **Marquee** — the stylized scrolling-text widget with chrome (used in the layout header). Always scrolls.
- **OverflowMarquee** — minimal primitive: only animates when content's `scrollWidth > clientWidth`. Used by XPWindow titles so long titles scroll on mobile while short ones stay static. ResizeObserver-driven.
- **CommentCard** — message card with vote buttons + permalink + share.
- **SpotlightVote** — ❤️ / 💔 voter for the MCU Spotlight.
- **DarkBackdrop** — fixed-position fullscreen background. Renders six `<StoneGlow>` units + a vignette overlay. Has `isolate` + `transform-gpu` for layer promotion (critical for perf — see Gotchas).
- **StoneGlow** — single blob unit: a `mix-blend-mode: screen` radial-gradient glow + a stone PNG centered on top. Animates via `gsap.ticker` using **Lissajous curves** (parametric `sin(ax·t)`, `sin(ay·t)`) so each stone traces a unique weaving path, plus an independent **depth cycle** that drives `opacity` (NOT blur — blur is static, see Gotchas) for a "closer/farther" illusion. Different `ax:ay` ratios across stones give them different shapes; shared global clock makes them feel like they're "talking" as patterns sync and desync.
- **CopyLinkShare** — share menu for comment permalinks.
- **KevinTooltip** — hover/tap "Kevin Feige" anywhere and his face pops up. Uses `position: fixed` to escape `overflow-hidden` containers. Hover-vs-tap detected via `matchMedia('(hover: hover)')` so mobile gets click-to-toggle without sticky-hover bugs. Scroll dismisses. Tooltip element renders Kevin's image with a Vista-style xp-bevel frame.

## Database schema (Supabase)

Migrations live in `supabase/migrations/`. **Applied manually via the Supabase Web SQL Editor**, not via the CLI — open the project in the Supabase dashboard, paste the file contents into the SQL Editor, run. The numbered filenames (`0001_init.sql`, `0002_...`, etc.) are just for ordering and historical record; the dashboard doesn't track which have been applied.

- **comments** — id, name?, content, status (`approved|pending|removed`), upvotes, downvotes, submitter_hash, moderation_flags, created_at.
- **votes** — comment_id, voter_hash, voter_cookie, vote_type (1 | -1). PK (comment_id, voter_hash) enforces one vote per visitor per comment.
- **ranked_comments** (view) — comments + computed `hot_score` and `controversy_score`. ⚠ **Hot algorithm is buggy** — `(upvotes - downvotes) / power(age + 2, 1.5)` returns 0 for ALL unvoted comments, so ties happen at zero and the result effectively sorts by Postgres' natural row order ≈ newest first. To fix properly, use the Reddit-style formula: `sign(score) * log(max(abs(score), 1)) + epoch/45000`.
- **admin_emails** — allowlist for the moderation UI.
- **spotlight_votes** + **spotlight_sentiment_counts** (view) — hearts/broken-hearts per TMDB id.
- **quote_refreshes** — submitter_hash + refresh_date (PK) — enforces one quote refresh per visitor per day.

## Conventions / preferences

- **No daisyUI**. The XP/Vista aesthetic is bespoke. Use `.xp-bevel`, `.xp-bevel-inset`, `.xp-titlebar`, etc.
- **Snippets over slots**. Svelte 5 way. Snippets named verbs (`composer`, `top5`, `quote`, `spotlight`) on the home page.
- **Rune state, not stores**, unless you need cross-component reactivity.
- **No comments explaining "what"** — code is self-explanatory. Only comment "why" when it's non-obvious (e.g., the SSR `typeof window` guard in KevinTooltip).
- **Server-side rate limiting via `voterHash(ip, ua)`** — same pattern across votes, comments, spotlight votes, and quote refreshes. PK uniqueness in the table enforces it. Look for Postgres error code `23505` to detect dupes.
- **Dynamic-import GSAP**: `await import('gsap')` inside `onMount`. Never top-level import — would SSR-eval the package and may fail on Cloudflare Workers runtime.
- **Tooltip / popup elements that escape `overflow-hidden`** containers should use `position: fixed` with measured rect coords, not portals (Svelte 5 has no built-in portal).

## Aesthetic / design language

- **Color palette:**
  - `--color-xp-blue: #0058e9` (titlebars / nav)
  - `--color-xp-tan: #ece9d8` (window body)
  - `--color-xp-gray: #d4d0c8` (buttons / chrome)
  - Body bg: `#050510` (deep space)
  - Stone blobs: hot pink, electric purple, bright blue, cyber green, gold, orange-red — saturated neons
- **Fonts:** Tahoma (UI), Pixelify Sans (display), VT323 (CRT counter), Bokor (Quote of the Day blockquote — also used by favicon), Coral Pixels (accent), Ballet, Kings.
- **Window controls:** `_` minimize, `□` maximize → `❐` restore, `✕` close. Minimize is functional (collapses body); maximize is wired only on the MCU Spotlight (toggles compact ↔ expanded poster layout).
- **Transitions:** custom `aero()` transition for the MCU Spotlight expand/restore — opacity + scale + blur, cubicOut easing. Sequential timing via `in:` + `out:` with matched delays so layouts swap cleanly without overlap.

## Gotchas (you WILL trip on these)

- **`mix-blend-mode: screen` + per-frame `filter: blur(...)` mutation = browser meltdown.** The original StoneGlow animated blur every frame; pages flickered + slowed during scroll/nav. Fix: animate `opacity` (GPU-composited, free) and keep blur static. `DarkBackdrop` adds `isolate` + `transform-gpu` to contain compositing.
- **`onDestroy` runs on SSR teardown** — it's the one Svelte lifecycle that fires server-side. Any `window`/`document` reference inside it must be guarded with `typeof window !== 'undefined'` or `browser` from `$app/environment`.
- **Tailwind v4 `!bg-foo` is silently broken** — use `bg-foo!` (suffix). Old codebases ported from v3 often have this bug.
- **Mobile sticky-hover** — pure `mouseenter`/`mouseleave` traps tooltips open on iOS Safari. Gate hover handlers with `window.matchMedia('(hover: hover)').matches` and add a parallel `onclick` toggle for touch devices.
- **Negative z-index + body background**: `-z-10` on a fixed element with a `body { background: #050510 }` rule can render the element behind the body bg in some compositing scenarios. Prefer `z-0` (or no z) on the backdrop and `relative z-10` on content above it.
- **SvelteKit `<svelte:head><title>` from a child page doesn't auto-restore the layout's `<title>` when you navigate away.** Every page should declare its own `<svelte:head><title>` explicitly. The home page's title is `Marvel Fans for Feige`.
- **Title overrides:** The layout `<title>` is just a default. Child pages override and unmount their override on navigation — but they DON'T restore the parent title. Always set explicitly.
- **A11y warnings on `<span onclick>`** — Svelte 5 flags this with two warnings. Convert to `<button type="button">` styled flat (`border-0 bg-transparent p-0`) to inherit keyboard support and silence both.
- **Chrome DevTools probes** for `/.well-known/appspecific/com.chrome.devtools.json` on every dev session. Stub file in `static/` returns 200 with `{}`. Harmless either way; it's a local-dev-only noise filter.

## Common commands

```bash
pnpm dev              # local dev server on :5173
pnpm build            # production build (Cloudflare adapter output)
pnpm preview          # serve the built output locally
pnpm check            # svelte-check (types)
pnpm lint             # prettier + eslint
pnpm format           # prettier write
# Migrations are NOT applied via CLI. See "Applying migrations" below.
```

## External references (saved in user memory)

The user maintains a memory file with project context, infra references, and decisions. Look in `~/.claude/projects/-Users-tangafoo-malaysia-krakoa/memory/` if you need infra URLs (Cloudflare, Supabase, PostHog, TMDB) or background on stack decisions.
