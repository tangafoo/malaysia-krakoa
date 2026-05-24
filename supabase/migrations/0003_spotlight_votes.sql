-- Spotlight sentiment voting: ❤️ / 💔 on the current MCU release.
-- One heart or broken-heart per voter per spotlight_key (TMDB movie id).

create table if not exists spotlight_votes (
  id uuid primary key default gen_random_uuid(),
  spotlight_key text not null,
  sentiment smallint not null check (sentiment in (-1, 1)),
  voter_hash text not null,
  voter_cookie text not null,
  created_at timestamptz not null default now(),
  unique (spotlight_key, voter_hash),
  unique (spotlight_key, voter_cookie)
);
create index if not exists spotlight_votes_key_idx on spotlight_votes(spotlight_key);

-- Aggregated counts per spotlight_key
create or replace view spotlight_sentiment_counts as
select
  spotlight_key,
  sum(case when sentiment = 1 then 1 else 0 end)::int as hearts,
  sum(case when sentiment = -1 then 1 else 0 end)::int as broken_hearts
from spotlight_votes
group by spotlight_key;

-- RLS: server-only writes (service role bypasses); public can read aggregated view
alter table spotlight_votes enable row level security;

-- The view can be read by anyone; underlying table is locked down.
grant select on spotlight_sentiment_counts to anon, authenticated;
