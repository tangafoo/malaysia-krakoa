-- Per-visitor country counter for the "Worldwide Fanbase" XPWindow.
-- One row per submitter_hash. country_code = effective country (either Cloudflare's
-- IP-detected ISO 3166-1 alpha-2 OR a manual user override). is_override = true
-- means the user picked it; future IP-detected visits will not clobber that choice.
-- Marvel-fictional locations use codes in the X[A-Z] user-assignable space (XW, XK,
-- XS, XL, XM, XG, XA, XR, XD, XQ) — handled at the application layer.
create table if not exists public.visitor_countries (
  submitter_hash text primary key,
  country_code   text not null check (length(country_code) = 2),
  is_override    boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists visitor_countries_country_idx
  on public.visitor_countries (country_code);

create or replace view public.visitor_country_counts as
  select country_code, count(*)::int as visitor_count
  from public.visitor_countries
  where country_code not in ('XX', 'T1', '')
  group by country_code;

alter table public.visitor_countries enable row level security;
-- Service-role writes/reads via getServerSupabase() bypass RLS.
-- No public policies — visitors never touch this table from the browser directly.
