-- marvelfansforfeige.com initial schema
-- Run this in Supabase SQL editor once after creating the project.

-- 1. comments table -------------------------------------------------------
create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  name text,
  content text not null check (char_length(content) between 1 and 500),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  upvotes int not null default 0,
  downvotes int not null default 0,
  moderation_flags jsonb,
  submitter_hash text not null,
  created_at timestamptz not null default now()
);
create index if not exists comments_status_idx on comments(status);
create index if not exists comments_created_idx on comments(created_at desc);
create index if not exists comments_submitter_idx on comments(submitter_hash, created_at desc);

-- 2. votes table ----------------------------------------------------------
create table if not exists votes (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references comments(id) on delete cascade,
  voter_hash text not null,
  voter_cookie text not null,
  vote_type smallint not null check (vote_type in (-1, 1)),
  created_at timestamptz not null default now(),
  unique (comment_id, voter_hash),
  unique (comment_id, voter_cookie)
);
create index if not exists votes_comment_idx on votes(comment_id);

-- 3. admin allowlist ------------------------------------------------------
create table if not exists admin_emails (
  email text primary key
);
insert into admin_emails(email)
values ('chevaliertgf@gmail.com')
on conflict do nothing;

-- 4. ranking view ---------------------------------------------------------
create or replace view ranked_comments as
select
  c.*,
  ((c.upvotes - c.downvotes)::numeric
    / power((extract(epoch from (now() - c.created_at)) / 3600 + 2), 1.5)) as hot_score,
  (least(c.upvotes, c.downvotes)::numeric
    * power(c.upvotes + c.downvotes + 1, 0.5)) as controversy_score
from comments c
where c.status = 'approved';

-- 5. trigger: bump upvotes/downvotes on insert ---------------------------
create or replace function bump_vote() returns trigger as $$
begin
  if new.vote_type = 1 then
    update comments set upvotes = upvotes + 1 where id = new.comment_id;
  else
    update comments set downvotes = downvotes + 1 where id = new.comment_id;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists votes_bump on votes;
create trigger votes_bump
  after insert on votes
  for each row execute function bump_vote();

-- 6. row level security ---------------------------------------------------
alter table comments enable row level security;
alter table votes enable row level security;
alter table admin_emails enable row level security;

-- SECURITY DEFINER helper: checks whether the current JWT belongs to an
-- allowlisted admin. Bypasses RLS when reading admin_emails, so policies
-- can call this without triggering recursion.
create or replace function is_admin() returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists(
    select 1 from admin_emails
    where email = coalesce(auth.jwt() ->> 'email', '')
  );
$$;
grant execute on function is_admin() to anon, authenticated;

-- public can read approved comments
drop policy if exists "read approved" on comments;
create policy "read approved" on comments
  for select using (status = 'approved');

-- admins (any session with email in allowlist) can read everything + update status
drop policy if exists "admin read all" on comments;
create policy "admin read all" on comments
  for select using (is_admin());

drop policy if exists "admin update status" on comments;
create policy "admin update status" on comments
  for update using (is_admin());

-- admin_emails: RLS enabled + no SELECT policy → only is_admin() can read it
-- (via SECURITY DEFINER). No client can list admins directly. Intentional.
