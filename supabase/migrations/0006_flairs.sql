alter table comments
  add column if not exists primary_flair text,
  add column if not exists secondary_flair text;

create index if not exists comments_primary_flair_idx
  on comments(primary_flair)
  where status = 'approved' and primary_flair is not null;

create index if not exists comments_secondary_flair_idx
  on comments(secondary_flair)
  where status = 'approved' and secondary_flair is not null;

-- `c.*` now includes primary_flair / secondary_flair, which shifts the column
-- positions of hot_score / controversy_score in the view. Postgres refuses to
-- rename columns under `CREATE OR REPLACE VIEW`, so we drop and recreate.
drop view if exists ranked_comments;

create view ranked_comments as
select
  c.*,
  ((c.upvotes - c.downvotes)::numeric
    / power((extract(epoch from (now() - c.created_at)) / 3600 + 2), 1.5)) as hot_score,
  (least(c.upvotes, c.downvotes)::numeric
    * power(c.upvotes + c.downvotes + 1, 0.5)) as controversy_score
from comments c
where c.status = 'approved';
