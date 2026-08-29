# standalone server compile: <webhook> is not in the vocabulary

**One line.** `writing-a-backend.md` documents `<webhook as=… queue=… secret=… idField=…/>`
as the whole receiver, but the standalone compiler rejects the tag, so a standalone project
cannot declare the RevenueCat/Stripe receiver the docs promise.

**Environment.** Measured on `dev@92b844b0`, re-verified 2026-08-29 evening at `dev@ae0669ad`
(`git diff --stat` over the relevant packages between the two: empty). Consumer: the
short-drama flagship template (`despia-templates/short-drama-app`) with `file:` deps on the
checkout's `OpenSource/Web/packages/*`, probes run against a freshly rebuilt `dist/`.
Filed under the template program's no-hacks law: the template ships a labeled bridge where
one exists, and the bridge dies when this lands.

**Repro.** Add `<webhook as="revenuecat" queue="purchases" secret="RC_HOOK" idField="ref"/>`
to a standalone `server/*.dsx` → `despia build` aborts (unknown tag).
`packages/cli/src/server-document.ts` `BODY_TAGS = { route, worker, tool }` — no `webhook`
(the monorepo emitter `prepare_server.rb` has it).

**Impact.** The flagship template's coin-pack purchases (RevenueCat webhook → queue →
idempotent credit) are specified but cannot be declared outside the monorepo; the local
lane documents the gap instead.

**Suggested direction.** Port the `webhook` row into `server-document.ts`'s closed
vocabulary + the emitted route/queue shapes — the receiver, tolerance window, HMAC and
replay refusal already exist in `packages/server/src/webhook.ts`.
