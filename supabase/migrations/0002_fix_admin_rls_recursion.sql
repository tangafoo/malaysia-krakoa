-- Fix: infinite recursion in admin_emails RLS policy.
--
-- The original migration's policies on `comments` did:
--   auth.jwt() ->> 'email' in (select email from admin_emails)
-- which forces a SELECT on admin_emails, which itself had a SELECT policy
-- that also queries admin_emails → recursion.
--
-- Solution: a SECURITY DEFINER function bypasses RLS when it reads
-- admin_emails. Policies call is_admin() instead of inlining the subquery.

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

-- Replace recursive policies on `comments` with non-recursive ones.
drop policy if exists "admin read all" on comments;
create policy "admin read all" on comments
  for select using (is_admin());

drop policy if exists "admin update status" on comments;
create policy "admin update status" on comments
  for update using (is_admin());

-- Drop the recursive policy on admin_emails. With RLS enabled and no SELECT
-- policy, no client can read admin_emails directly — only is_admin() can,
-- via SECURITY DEFINER. That's the design we wanted.
drop policy if exists "admin read allowlist" on admin_emails;

-- Grant execute on is_admin() to all roles (authenticated + anon).
-- The function's own body is what enforces security.
grant execute on function is_admin() to anon, authenticated;
