-- "Supreme Intelligence" daily digest. Append-only: every cron run inserts a new row;
-- pages read the latest by generated_at desc. Keeping history is cheap and lets us
-- audit drift in tone over time.
create table if not exists comment_summaries (
  id uuid primary key default gen_random_uuid(),
  top_summary text not null,
  controversial_summary text not null,
  overall_summary text not null,
  comments_analyzed int not null default 0,
  model text not null default 'unknown',
  generated_at timestamptz not null default now()
);

create index if not exists comment_summaries_generated_at_idx
  on comment_summaries(generated_at desc);

alter table comment_summaries enable row level security;
-- Server writes/reads via the service-role client; no public policies needed.
