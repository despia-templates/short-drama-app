# Target architecture — the founder's plan, and where the build actually stands

Recorded 2026-09-01. This is the plan as handed down, annotated against what is true in the
repo today. It is a target, not a description: several rows below say NOT BUILT, and saying so
is the point of writing it down.

## The correction that heads the plan

> "Earlier discussion assumed Stripe for coin purchases. That is wrong for the in-app path.
> Coin packs sold inside an iOS or Android app are digital content and **must** go through
> StoreKit and Google Play Billing. Stripe is only legal on the web store."

This matches App Store Guideline 3.1.1 verbatim, whose parenthetical names both of this app's
primitives — "subscriptions, in-game currencies". The template ships Stripe on every lane
today, which is a rejection inside an iOS build. RevenueCat is the chosen bridge: both stores,
one webhook.

## Layers

| Layer | Choice | Operated by us | Status here |
|---|---|---|---|
| Client | DSX native UI | yes | BUILT |
| Video delivery | Cloudflare Stream | no | NOT BUILT — media is served flat by the dev origin, now entitlement-gated in front of the bytes |
| Hot path (progress, counters, playback tokens) | Workers + Durable Objects | no | NOT BUILT — progress writes go straight to the declared backend |
| State, catalog, money | Postgres (Supabase) | no | PARTIAL — the declared backend is Postgres-shaped with RLS; not a Supabase project |
| Purchase verification | RevenueCat webhook | no | UNBLOCKED, not wired — `<webhook>` landed today (framework dev@c551fc0f) with a `bearer` scheme for exactly this |

## The one money rule

> "No coin grant ever originates from the client. Every credit comes from a server-to-server
> callback we verify." — coin pack via RevenueCat, rewarded ad via AdMob SSV with the signature
> checked against Google's public key, daily bonus from the server clock with a
> once-per-UTC-day idempotency key. "A client-trusted grant of any kind will be farmed within
> a week of launch."

Where the build stands: grants are server-side and idempotency landed today (ledger-row-as-lock,
eleven uniqueness constraints, Stripe idempotency key). The two INBOUND callbacks — RevenueCat
and AdMob SSV — do not exist yet. `<webhook>` is the seam they land on.

## Anonymous-first revenue, which changes the auth model

> "restore purchases should work anonymously, no login needed. The majority of revenue of our
> app will come from non-logged-in users. When a user upgrades we will show a dialog 'protect
> your assets, login to keep watching and not lose access to your shows'. Apple on iOS
> (secondary on Android), Google, Facebook, and continue with email."

This SUPERSEDES the earlier instruction that purchases require identity. Sign-in is an upsell
after the purchase, never a gate in front of it. It needs a durable anonymous subject, which is
why a Supabase auth capability with anonymous sessions AND account linking is being built as a
framework module rather than as app code.

## Phase 0 is a gate, not a task

> "Nothing else starts until this passes." Four pass criteria: swipe-to-first-frame under
> 200ms on a mid-tier Android over Fast 3G, measured gesture-end to first rendered frame;
> reusable pooled player instances (previous/current/next, promote not construct);
> DSX-controllable prefetch of the next two with cancel-in-flight; no main-thread construction
> during the gesture.
>
> "If it fails: the gap is in the runtime, not the app. File against despia-framework and treat
> the player component work as a V4 blocker. Do not work around it in app code."

NOT RUN. The template's player is a `<pager>` over episodes with `active=` gating one live clip;
whether it meets any of the four criteria is unmeasured, and the 200ms number has never been
put on a device. This is the highest-value unmeasured claim in the project.

## Data model

The plan's schema is close to what the declared backend already expresses, with three
differences worth naming rather than quietly reconciling:

- `episode_unlocks` is HASH PARTITIONED (16 ways) on day one. "10M users at 30 unlocks each is
  300M rows and repartitioning a live table is a weekend nobody wants." The declared `<entity>`
  grammar has no partitioning vocabulary — this is a framework gap, not a schema preference.
- `wallets.balance` is explicitly a CACHE and `wallet_ledger` is the source of truth, with a
  nightly reconciliation job that alerts on any drift ("if drift is ever non-zero, something is
  writing the balance outside a transaction and that is a P1"). The template has the ledger and
  the balance; it has no reconciliation job.
- Every mutating call carries a CLIENT-GENERATED idempotency key. Today the server derives keys
  (order id, ledger ref). Client-generated is stronger against the retry case the plan names:
  "a lost response on an unlock request must never cost the user coins twice."

## Video

Cloudflare Stream, direct creator upload, UID on the episode row. **2-second segments,
independent segments enabled** — "the single most common cause of slow startup and they cannot
be compensated for anywhere else in the stack." Playback authorization is a Worker that verifies
the JWT, does one PK lookup against `episode_unlocks`, and signs a Stream token scoped to that
UID with a 2-minute TTL. "Never hand the client a long-lived or unscoped token."

The template now does the same SHAPE at a smaller scale: an entitled `/wallet/play/:episode`
endpoint mints a 5-minute playback ticket and the origin refuses the bytes without one. The
production answer (CloudFront/Stream/Mux signed URLs) is written at the gate.

Migration trigger off Stream is recorded as a number, not a feeling: when monthly Stream
delivery cost exceeds ~3x the projected cost of our own ladder in R2.

## Client

Three pooled player instances, promote on swipe, never construct during the gesture. Prefetch
the next two, cancel in flight on fast scroll — "uncancelled prefetch on a fast scroller burns
the user's data plan and generates support tickets that read like bugs."

Progress: never a heartbeat. Flush on pause, episode end, and app background only, into a
Durable Object keyed by user, batched to Postgres on a timer. "Writing progress straight to the
primary means tuning autovacuum inside a month." The template currently writes progress
directly and has no DO tier.

## What this document is for

Three of the plan's phases are gates with numeric criteria (200ms first frame; zero ledger drift
under 100 parallel unlocks on one wallet; flat Postgres write rate under a simulated 1000-user
session). None has been run. When someone claims a phase is done, it is done against these
numbers or it is not done — "a phase is not done at 95%".
