# server/data: a declared action cannot span a TRANSACTION, so a multi-row spend cannot be atomic

**One line.** Every data-module call runs in its own transaction, so "unlock all 14 remaining
episodes for 448 coins" — N ledger rows, N unlock rows and one wallet debit, for ONE payment —
has no way to be all-or-nothing.

**Environment.** `dev@92b844b0`, `packages/server/src/postgres.ts` · the data module. Hit in
the short-drama flagship building bulk unlock.

**Why it is this way, and why that part is right.** `postgres.ts` sets the caller identity
with `set_config(..., true)`, which is **transaction-scoped**. That is exactly why one
request's identity can never leak into another's, and it is the reason there is no seam for
wrapping several calls in one transaction. The isolation is correct. The absence is a
consequence of it, not an oversight.

**What it costs an app.** The tempting shape —

```
debit the basket total
then grant N unlock rows
```

— is the one that double-charges on retry, because a failure after the debit leaves the
viewer poorer and un-entitled, and a retry debits again.

**What this template does instead: idempotent rather than atomic.** The fold runs per EPISODE
— ledger row, wallet debit, unlock row, one at a time, in the same order the single unlock
uses. A failure half way leaves K episodes paid for and OWNED, and the rest untouched; a retry
charges only the remainder. The cost is 3N writes for a basket that could be 3 + N.

**The ask.** A declared way to say "these writes commit together": a `<transaction>` block in
an action body, or a repo-level `batch([...])` — with the identity `set_config` hoisted to the
enclosing transaction so the isolation property is preserved rather than traded away.

**Why it matters beyond one template.** Until it lands, every multi-row spend in every DSX app
has to be designed around the absence, and the shape most authors will reach for first is the
one that double-charges.
