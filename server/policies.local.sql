-- policies.local.sql — the app's OWN policy addendum, applied AFTER the generated
-- migration (which is generated and never hand-edited). Re-runnable by construction.
--
-- UPSTREAM (PLAN.md §6.25): the ownership vocabulary has three words — owner
-- (own-read/own-write), public-read (all-read/SERVICE-write), service — and no word for
-- the shape every comment, review and post table has: ALL-READ, OWN-WRITE. The emitter's
-- public-read is deliberately service-write-only (correct for the catalogue: without it,
-- any signed-in viewer could insert a `state='live'` show row and appear on the
-- storefront), so a viewer's postComment is impossible through the generated policies.
-- Measured 2026-08-30: create through the user scope was denied by RLS; the action
-- surfaced it as {reason:'conflict'}.
--
-- Until `ownership="public-read-own-write"` (or equivalent) exists upstream, this file
-- grants comment AUTHORS their own rows — insert/update/delete where owner_id is the
-- verified subject; reading stays the generated public policy. Scoped to dsx_comment
-- alone. DIES the day the upstream word lands: delete this file and re-apply the
-- generated migration.

-- the generated public-read column has no default (owner tables get `default auth.uid()`),
-- so a user-scope insert would land owner_id NULL and fail the check below
alter table dsx_comment alter column owner_id set default auth.uid();

drop policy if exists dsx_comment_owner_write on dsx_comment;
create policy dsx_comment_owner_write on dsx_comment
  for insert with check (owner_id = auth.uid());

drop policy if exists dsx_comment_owner_update on dsx_comment;
create policy dsx_comment_owner_update on dsx_comment
  for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists dsx_comment_owner_delete on dsx_comment;
create policy dsx_comment_owner_delete on dsx_comment
  for delete using (owner_id = auth.uid());
