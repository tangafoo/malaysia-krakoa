-- Aggregate view for the composer's "Flair:" row popularity ordering.
-- Replaces the row-by-row scan in +page.server.ts (which fetched every
-- approved comment's primary_flair and tallied client-side, scaling O(N)).
-- Postgres does the GROUP BY in one shot; the page reads ≤ ~10 rows.
create or replace view public.primary_flair_counts as
  select primary_flair, count(*)::int as comment_count
  from public.comments
  where status = 'approved' and primary_flair is not null
  group by primary_flair;
