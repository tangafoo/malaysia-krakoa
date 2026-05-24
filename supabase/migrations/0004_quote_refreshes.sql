-- Per-user "refresh the quote of the day" tracking.
-- One refresh per submitter_hash per day, enforced by the composite primary key.
-- Same hashing scheme as votes/comments (voterHash of IP + UA).

create table if not exists quote_refreshes (
  submitter_hash text not null,
  refresh_date   date not null default current_date,
  quote_text     text not null,
  quote_source   text not null,
  created_at     timestamptz not null default now(),
  primary key (submitter_hash, refresh_date)
);

create index if not exists quote_refreshes_date_idx on quote_refreshes (refresh_date);

alter table quote_refreshes enable row level security;
-- Server writes/reads via the service-role client; no public policies needed.
