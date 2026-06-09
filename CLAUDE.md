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
- **OpenAI moderation** for comment screening (`src/lib/server/moderation.ts`) **and daily Supreme Intelligence summaries** (`src/lib/server/summarize.ts`, model `gpt-4o-mini`, JSON-mode chat completions).
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
    flairs.ts                   Flair catalog (PRIMARY_FLAIRS, SECONDARY_FLAIRS) + helpers.
                                Single source of truth for keys, labels, colors, OG hexes,
                                icons. See "Flair system" below.
    sounds.svelte.ts            Web Audio sounds singleton + localStorage mute toggle.
                                See "Sound system" below.
    data/feige-quotes.json      Pool of Kevin Feige quotes.
    assets/                     Stone PNGs (mind/space/reality/power/time/sould).
                                Note "sould" misspelling — keep as-is, it matches the file.
                                Also kevin_feige.jpg used by KevinTooltip.
    components/                 All UI primitives — see "Components" below.
    components/icons/           Inline SVG icon components for the 4 base primary flairs
                                (Spidey, X-Men '97, Daredevil, Doomsday). Each accepts a
                                `class` prop for sizing. Stones use PNG assets, not SVGs.
    server/
      supabase.ts               getServerSupabase() — service-role client.
      hash.ts                   getClientIp() + voterHash(ip, ua) — used for rate limiting
                                AND as the deterministic input for stone identity.
      moderation.ts             OpenAI moderation wrapper.
      summarize.ts              generateSummaries() → calls OpenAI chat completions
                                (gpt-4o-mini, JSON mode) to produce top/controversial/overall
                                digests of approved comments. getLatestSummary() → reads the
                                latest row from comment_summaries for SSR.
      tmdb.ts                   getLatestMCU() — Spotlight data.
      stone-roll.ts             assignedStone(hash) → permanent 1-of-6 stone per visitor.
                                rollDailyStone(hash, dateUtc) → that stone or null (10% gate).
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
      cron/refresh-summaries/   POST: rebuild Supreme Intelligence summaries; gated by
                                `authorization: Bearer $CRON_SECRET`. Appends one
                                comment_summaries row per call.
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
- **FlairPill** — renders a primary or secondary flair. Three modes: static (default — xp-bevel-inset chrome on white), interactive (button with selected/unselected XP states, used in composer + `/comments` filter), and `colored` (static but with the flair's brand color — used everywhere visible flairs render: inline composer header pill, CommentCard, etc). Accepts `count?` to append `(N)`. Auto-renders the ✨ sparkle prefix/suffix + flair-shimmer CSS for rare stones.
- **ClickSound** — invisible singleton component mounted once in `+layout.svelte`. Attaches a document-level `pointerdown` listener that fires sounds via Web Audio API. Skips body/text; matches `button, a, [role=button], input[type=...], summary, label, [data-click-sound]`. Reads `data-click-sound="<key>"` on the closest interactive element for sound overrides; `data-click-sound="none"` opts out entirely.
- **StoneGreeting** — first-visit modal greeting the visitor with their fated Infinity Stone identity. Dismissal persisted in localStorage key `mff-stone-greeted`. Reads `data.assignedStoneKey` from layout context.
- **SupremeIntelligence** — XPWindow wrapping a Kree-hologram CRT screen (`.kree-screen` in `app.css`). Three tabs — TOP TAKES / DISSENT / THE COLLECTIVE — render the corresponding fields of the latest `comment_summaries` row. Renders a "calibrating…" empty state if no row yet. Used on both `/` and `/comments`. Visuals: dark teal radial bg, phosphor-green VT323 text, vertical scan sweep, subtle flicker. Designed after Captain Marvel's Supreme Intelligence.

## Database schema (Supabase)

Migrations live in `supabase/migrations/`. **Applied manually via the Supabase Web SQL Editor**, not via the CLI — open the project in the Supabase dashboard, paste the file contents into the SQL Editor, run. The numbered filenames (`0001_init.sql`, `0002_...`, etc.) are just for ordering and historical record; the dashboard doesn't track which have been applied.

- **comments** — id, name?, content, status (`approved|pending|removed`), upvotes, downvotes, submitter_hash, moderation_flags, created_at, **primary_flair**, **secondary_flair** (both nullable text, added in `0006_flairs.sql`).
- **votes** — comment_id, voter_hash, voter_cookie, vote_type (1 | -1). PK (comment_id, voter_hash) enforces one vote per visitor per comment.
- **ranked_comments** (view) — comments + computed `hot_score` and `controversy_score`. ⚠ **Hot algorithm is buggy** — `(upvotes - downvotes) / power(age + 2, 1.5)` returns 0 for ALL unvoted comments, so ties happen at zero and the result effectively sorts by Postgres' natural row order ≈ newest first. To fix properly, use the Reddit-style formula: `sign(score) * log(max(abs(score), 1)) + epoch/45000`.
- **admin_emails** — allowlist for the moderation UI.
- **spotlight_votes** + **spotlight_sentiment_counts** (view) — hearts/broken-hearts per TMDB id.
- **quote_refreshes** — submitter_hash + refresh_date (PK) — enforces one quote refresh per visitor per day.
- **comment_summaries** — id, top_summary, controversial_summary, overall_summary, comments_analyzed, model, generated_at. Append-only — every cron run inserts a new row; pages query `order by generated_at desc limit 1`. Index on `generated_at desc`.

⚠ **Migration gotcha for views**: `0006_flairs.sql` had to `DROP VIEW + CREATE VIEW` for `ranked_comments` instead of `CREATE OR REPLACE VIEW`. Because the source table (`comments`) gained new columns, the `c.*` expansion shifts column positions in the view output, and Postgres refuses to rename existing view columns with `CREATE OR REPLACE`. Drop-and-recreate is safe — the view holds no rows; `hot_score` / `controversy_score` are computed per query (which is also why hot_score decays with time naturally).

## Flair system (`src/lib/flairs.ts` is the source of truth)

Two flair fields on every comment, both optional:

- **`primary_flair`** — which MCU project the message is about. Ships with 4 base flairs (`spidey`, `x-men-97`, `daredevil`, `doomsday`) rendered as inline SVG components, **plus** 6 Infinity Stones (`stone-mind`, `stone-space`, `stone-reality`, `stone-power`, `stone-time`, `stone-soul`) rendered with the existing PNG assets and treated as `rare: true` (✨ sparkle + `flair-shimmer` animation).
- **`secondary_flair`** — tone of the message: `suggestion`, `fanmail`. Plain `{emoji, label}`.

**Composer ordering**: base primary flairs are sorted by **popularity** (count of approved comments using each key), computed in the page load function. Composer popularity helper: `basePrimaryFlairsByPopularity(counts)`. Secondary flairs use a fixed order.

**Infinity Stone mechanic — "fated to one stone"**:

- Each visitor is permanently assigned **one** stone via `assignedStone(submitter_hash)` (SHA-256 over `${hash}::stone-assignment`, mod 6). They will _only ever_ see that one stone — they will never see the others' in their composer.
- Each day, a 10% gate decides if their stone appears in their composer: `rollDailyStone(hash, dateUtc)` — deterministic SHA-256 over `${hash}::stone-day::${date}` so refreshes don't reroll today, but tomorrow's a fresh chance.
- On first visit, `StoneGreeting` modal greets the visitor with their assigned stone identity. Layout server load computes `assignedStoneKey` and ships it in layout data. Popup dismissed = localStorage `mff-stone-greeted=yes`.
- The roll rate constant is `STONE_DROP_RATE` in `stone-roll.ts`. Edit there to tune.

**Cross-load serialization gotcha**: SvelteKit's `load` data is serialized with devalue, which can't stringify functions. `PrimaryFlair.icon` is a Svelte component (function under the hood), so server `load` functions must return `PrimaryFlairKey[]` (plain strings), and pages rehydrate via `primaryByKey()`. Same goes for OG image: the renderer (`api/og/[id]/+server.ts`) uses the catalog's `ogHex`/`ogTextHex` literals because workers-og can't run Svelte components.

**Where flairs render**:

- Composer (home) — interactive pill rows for primary + secondary; selected flair also rendered colored inline next to "(N chars left)".
- CommentCard — colored pills in header; when `showPermalink` is true they wrap in a `/comments?primary=<key>` link for click-to-filter.
- `/comments` — second filter row below sort buttons with counts; clicking toggles `?primary=` / `?secondary=` URL params; filters compose.
- OG image (`api/og/[id]/+server.ts`) — colored pill badges using `ogHex`/`ogTextHex` literals (no SVGs — Satori SVG support is finicky; PNGs not embedded either).
- Admin queue — pills shown inline with author/date so moderators see how the submitter tagged the message.

## Sound system (`src/lib/sounds.svelte.ts`)

Web Audio API click sound layer, mmm.page-style. Single decoded buffer per sound, fired via cheap `AudioBufferSourceNode` per click — zero latency, overlapping rapid clicks work fine.

**Six named sounds** (files at `static/sounds/xp-<key>.mp3`; missing files silently no-op):

| Key        | When                                                                         |
| ---------- | ---------------------------------------------------------------------------- |
| `click`    | Default — any clickable element                                              |
| `click2`   | Decorative/fake buttons (XPWindow ✕ close, ⬜ maximize when no `onMaximize`) |
| `error`    | Form validation fail, vote fail, network errors                              |
| `minimize` | XPWindow `_` minimize button                                                 |
| `send`     | Successful message submit                                                    |
| `clear`    | Composer Clear button                                                        |

**Wiring conventions**:

- `<ClickSound />` is mounted once in `+layout.svelte` and handles global pointerdown.
- Use `data-click-sound="<key>"` on any element to override the default click. `data-click-sound="none"` opts out entirely (used on the taskbar mute toggle so it doesn't make a sound when muting).
- `XPButton` forwards a `dataClickSound?: string` prop down to the rendered button/anchor's `data-click-sound` attribute.
- Programmatic playback: `sounds.play('error')` from anywhere. The composer enhance callback uses `sounds.play('send')` on success and `sounds.play('error')` on fail. CommentCard's vote-fail also plays error.

**Velocity-aware** (Ableton-pad feel):

- On touch / Apple Pencil: real `PointerEvent.pressure` (0–1, non-flat) maps to volume range 0.12–0.57.
- On mouse: pressure always reports 0.5 (no hardware velocity), so we humanize with random volume + ±8% pitch jitter.
- Either way the default click is humanized so rapid clicks never sound mechanical.

**Taskbar 🔊 toggle**: persists to localStorage key `xp-sounds`. The button itself has `data-click-sound="none"` so toggling is silent.

## Environment

- `VOTER_HASH_SALT` — secret salt for `voterHash(ip, ua)`. Stable across deploys (despite the old name `DAILY_HASH_SALT` suggesting rotation — there's no rotation logic). **If you ever change this value, every existing visitor's hash resets**: votes lose dedup history, stone identities change, rate-limit counts reset. Treat it as a permanent secret.
- `CRON_SECRET` — bearer token gating `/api/cron/refresh-summaries`. Generate with `openssl rand -hex 32`. Add to Cloudflare Pages env vars and to whatever scheduler hits the endpoint. Rotating it only requires updating the scheduler config — no user-visible impact.

## Daily summary cron

The Supreme Intelligence digest refreshes via an external POST to `/api/cron/refresh-summaries`. The Pages adapter doesn't expose scheduled handlers cleanly, so pick a scheduler:

1. **Cloudflare Worker cron trigger** (preferred): a tiny sibling Worker with `[triggers] crons = ["0 6 * * *"]` that calls the endpoint with the bearer token.
2. **External cron** (cron-job.org, EasyCron, GitHub Actions schedule): point a POST at the URL with the `authorization: Bearer $CRON_SECRET` header daily.

Manual test:

```bash
curl -X POST -H "authorization: Bearer $CRON_SECRET" \
  https://marvelfansforfeige.com/api/cron/refresh-summaries
```

Each call appends one row to `comment_summaries`. Cost per call: a single `gpt-4o-mini` chat completion summarizing ≤50 recent comments + top 3 hot + top 5 controversial (fractions of a cent).

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
- **`load` data must be JSON-serializable** — `PrimaryFlair.icon` is a Svelte component (function), so server `load` can't return full flair objects. Return `PrimaryFlairKey[]` strings and rehydrate via `primaryByKey()` on the page. Same trap for any other type that smuggles a function reference.
- **`CREATE OR REPLACE VIEW` + new columns in source table** = error 42P16 "cannot change name of view column". Drop and recreate instead — views hold no data, computed columns regenerate per query.

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
