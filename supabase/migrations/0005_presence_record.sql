-- All-time high record for concurrent online viewers.
-- Single-row table; everyone reads/writes (id = 1).

create table if not exists presence_record (
  id            smallint primary key default 1,
  peak          integer not null default 0,
  achieved_at   timestamptz not null default now(),
  constraint presence_record_singleton check (id = 1)
);

insert into presence_record (id, peak) values (1, 0) on conflict (id) do nothing;

alter table presence_record enable row level security;
-- Server (service role) handles all reads/writes; no public policies.
