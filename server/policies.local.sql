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


-- ═══════════════════════════════════════════════════════════════════════════════════════
-- UNIQUENESS — the second thing the generated migration cannot say, and the more dangerous
-- one.
--
-- UPSTREAM (PLAN.md §6.83): `<index on="…">` is the whole index grammar. It takes ONE
-- attribute, it emits `create index if not exists`, and `on="a b"` makes two SEPARATE
-- single-column indexes rather than one composite. So the emitter can express neither
-- UNIQUE nor COMPOSITE, which are exactly the two properties every guard below needs. The
-- ask is `<index unique="true" on="owner_id day"/>`.
--
-- WHY THIS IS NOT OPTIONAL. Every "once per day", "once per episode", "once per order"
-- rule in this backend was a read-then-write: list, decide, write. A declared action has no
-- transaction seam — postgres.ts sets the caller identity per STATEMENT, and there is no
-- way to wrap several (PLAN.md §6.38) — so two requests that arrive together both read
-- "not yet" and both write. Measured consequence, per guard: two check-ins on one day, two
-- free spins, two claims of the same task, two ad grants inside the ten-a-day cap, two
-- charges for one episode, two grants for one payment. Application code cannot fix this.
-- Only the database can, and only with a unique index.
--
-- The server actions were rewritten to match: each one now WRITES ITS MARKER FIRST, checks
-- `.ok`, and grants nothing if the marker was refused. The index is the lock; the `if` that
-- remains above it is only there to produce a friendly message on the common path.
--
-- RE-RUNNABLE, like everything in this file: `create unique index if not exists`. Note the
-- one thing that is NOT idempotent about it — if a database already contains duplicate rows
-- from before this file existed, index creation FAILS, loudly, naming the table. That is the
-- correct behaviour: the duplicates are double-granted coins and they need a human decision,
-- not a silent `on conflict do nothing`. De-duplicate, then re-apply.
--
-- DIES the day `<index unique>` lands upstream: move each one onto its entity and delete the
-- block.

-- one wallet per viewer. Two concurrent first-time calls used to create two wallet rows and
-- split the balance between them, because `wallet.list({limit:1})` then returns whichever
-- Postgres feels like. Every ensure-wallet fold in the backend now re-reads on conflict.
create unique index if not exists dsx_wallet_owner_uniq on dsx_wallet (owner_id);

-- one check-in per viewer per day; one free spin per viewer per day
create unique index if not exists dsx_checkin_owner_day_uniq on dsx_checkin (owner_id, day);
create unique index if not exists dsx_spin_owner_day_uniq    on dsx_spin (owner_id, day);

-- one claim per viewer per task per day
create unique index if not exists dsx_taskclaim_owner_day_task_uniq on dsx_taskclaim (owner_id, day, task);

-- REWARDED ADS ARE NOT ONCE A DAY — the declared cap is ten (engage.dsx AD_CAP), so
-- `unique (owner_id, day)` would be WRONG here: it would silently reduce the lane to one ad
-- a day and break the product rule it was meant to protect. The unit of uniqueness is the
-- POSITION within the day: two concurrent grants both compute seq = n + 1, and exactly one
-- row lands.
create unique index if not exists dsx_adview_owner_day_seq_uniq on dsx_adview (owner_id, day, seq);

-- one unlock per viewer per episode. This is the money one: with the grant now written
-- BEFORE the debit (wallet.dsx), the loser of the race is refused here and charges nothing.
create unique index if not exists dsx_unlock_owner_episode_uniq on dsx_unlock (owner_id, episode);

-- one progress row per viewer per episode. Duplicates are not merely untidy: rewardsState
-- counts progress rows to drive the "watch 3 episodes today" task, so a duplicate row is a
-- free claim.
create unique index if not exists dsx_progress_owner_episode_uniq on dsx_progress (owner_id, episode);

-- one favorite row per viewer per show. Two rows made the heart un-clearable: the next tap
-- deleted one and the other kept it filled.
create unique index if not exists dsx_favorite_owner_show_uniq on dsx_favorite (owner_id, show);

-- one playback ticket per viewer per episode — this is what keeps the ticket table the size
-- of the unlock table instead of growing once per play. playSource refreshes the row's
-- expiry rather than inserting a second.
create unique index if not exists dsx_playticket_owner_episode_uniq on dsx_playticket (owner_id, episode);

-- ONE ORDER PER STRIPE INTENT — PARTIAL, and the `where` is load-bearing. createCheckout now
-- writes the order row BEFORE calling Stripe (an idempotency key has to exist before the
-- request it protects), so a row is briefly `intent = ''`. Without the predicate every
-- pre-intent row in the deployment would collide on the empty string and the second
-- concurrent checkout would fail for no reason.
create unique index if not exists dsx_order_intent_uniq
  on dsx_order (intent) where intent is not null and intent <> '';

-- THE PAYMENT GRANT, EXACTLY ONCE. `settleOrder` has no compare-and-swap available
-- (`data.update` takes an id and values, never a predicate), so the read-then-write on
-- `status === 'paid'` could be passed by two concurrent settles and grant twice. The lock is
-- the LEDGER ROW the grant has to write anyway: `ref` is now the ORDER ID (it used to be the
-- sku, which repeats across purchases and could never be unique), and the grant writes the
-- ledger FIRST — a refused insert means someone already settled this order.
-- `kind` is in the key because a coin pack legitimately writes TWO rows for one order: the
-- purchased coins (kind='coin') and the pack's free bonus (kind='bonus').
-- PARTIAL, so it constrains only the two grant sources: 'unlock', 'checkin', 'spin', 'task'
-- and 'ad' rows have their own uniqueness upstream (or, for unlock_series, legitimately
-- repeat a ref across kinds) and must not be caught by this.
create unique index if not exists dsx_ledger_grant_once
  on dsx_ledger (owner_id, kind, source, ref) where source in ('pack', 'vip');

-- one block per viewer per subject. The unblock path reads the row and deletes it, so a
-- duplicate would make a block un-clearable the same way a duplicate favorite made the heart
-- un-clearable; and `blockAuthor` relies on the refused insert to answer "already blocked".
create unique index if not exists dsx_block_owner_subject_uniq on dsx_block (owner_id, subject);


-- ═══════════════════════════════════════════════════════════════════════════════════════
-- THE REPORT TABLE — the same all-read/own-write shape as dsx_comment, for the same missing
-- upstream word (§6.25), and one index that is doing more work than it looks.
--
-- WHY THE TABLE IS ALL-READ AT ALL: a declared action never runs as service_role (§6.7), so
-- an owner-scoped report table would be invisible to the operator queue AND to the flag
-- tally the thread read computes. `server/social.dsx` names this trade in full. The gateway
-- (`reach=""` on /social/reports) is what keeps a viewer out of the queue.
alter table dsx_report alter column owner_id set default auth.uid();

drop policy if exists dsx_report_owner_write on dsx_report;
create policy dsx_report_owner_write on dsx_report
  for insert with check (owner_id = auth.uid());

-- a reporter may withdraw their own report; nobody may edit anyone else
drop policy if exists dsx_report_owner_update on dsx_report;
create policy dsx_report_owner_update on dsx_report
  for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists dsx_report_owner_delete on dsx_report;
create policy dsx_report_owner_delete on dsx_report
  for delete using (owner_id = auth.uid());

-- ONE REPORT PER REPORTER PER TARGET, and this index is the ONLY thing that makes the
-- community flag threshold mean "three distinct people" rather than "three taps". Without
-- it, one account can hide any comment for everyone by reporting it three times.
--
-- The coalesce is because there are two kinds of target and only one of them is a row: a
-- comment report carries `target` (uuid) and an ad report carries `subject` (text). A plain
-- `(owner_id, target)` would leave every ad report unconstrained, because Postgres treats
-- NULLs as distinct and every ad row has target NULL.
create unique index if not exists dsx_report_owner_target_uniq
  on dsx_report (owner_id, kind, coalesce(target::text, subject));
