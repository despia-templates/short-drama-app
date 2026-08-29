# Short Drama — the official DSX short-drama template

A ReelShort/DramaWave-class vertical drama app in pure DSX: SSR web storefront (Popular /
New / Ranking), TikTok-style For-You feed, a full-screen vertical player with a
server-enforced coin paywall, **real Stripe web checkout**, VIP, a rewards loop (check-in
streaks, capped rewarded ads, the wheel, tasks), comments, a notifications inbox, and a
**Manage View** operator surface — all over one declared backend (`server/*.dsx`: entities
with RLS, actions, routes, MCP tools). The founding program docs live in [PLAN.md](PLAN.md)
and `docs/`.

**Status: working local slice, production-shaped.** Every flow runs against real Postgres
with real RLS and verified JWTs — nothing is mocked, and money is never granted on the
client's word. The native lanes (iOS/Android apps, AdMob, RevenueCat, OneSignal) are
specified in `docs/` and land with the framework's native template lane.

## Requirements

- **Node ≥ 22.18** and a local **PostgreSQL** you can `createdb` against.
- **The framework checkout, built, as a sibling of this repo** — the DSX packages are not
  on npm yet, so `package.json` resolves them by the layout below (`npm install` runs a
  preflight that names anything missing):

  ```
  <parent>/
    despia_dsx/despia-framework/    # git clone, then: cd OpenSource/Web && npm install && npm run build
    short-drama-app/                # this repo
  ```

  A checkout elsewhere: symlink it (`ln -s /path/to/checkout/.. ../despia_dsx`) — the
  preflight's `DSX_FRAMEWORK_DIR` override covers the scripts, but npm's `file:` deps
  read only the relative path.
- **Stripe web checkout** builds against the `Core/Payments/Stripe` module from the full
  Despia distribution (`ClosedSource/`). Without it, drop `"stripe"` from `modules` and
  the `packages` entry in `dsx.config.json`: everything else builds, and the Store shows
  the server's honest refusal instead of a payment sheet.

## Run it locally

```sh
npm install                       # preflight checks the layout first and prints any fix
createdb shortdrama_dev
cp .env.local.example .env.local  # set DSX_JWT_SECRET; add STRIPE_KEY/STRIPE_PUBLISHABLE (test mode) for checkout
npm run build                     # compiles Components/**.dsx AND server/*.dsx → dist/, server/generated/
psql -d shortdrama_dev -f server/generated/migration.sql   # re-runnable by construction
npm run session                   # mints the LOCAL viewer + operator JWTs (reads .env.local)
npm run serve                     # one origin: SSR site + API @ :8787 (stays in the foreground)
```

Then, **in a second terminal**:

```sh
npm run seed                      # 14 demo shows, 352 episodes, via the admin routes; idempotent
```

Open http://localhost:8787 — Home, `/discover`, `/vip`, `/store`, `/rewards`, `/list`,
`/profile`, `/notices`, `/show/:id`, `/watch/:show/:idx`, and the operator bridge at
`/admin`. `npm run serve` sets `DSX_DEV_NO_SW=1` so the local origin never installs the
precaching service worker — a stale bundle against fresh SSR is the classic "correct
markup looks broken" trap (PLAN.md §6.13a).

**Reset the demo:** `dropdb shortdrama_dev && createdb shortdrama_dev`, re-apply the
migration, re-run `npm run seed`. The seed converges the database onto
`scripts/catalogue.mjs` (idempotent by title), and `scripts/gen-art.mjs` regenerates all
key art deterministically from the same manifest.

**Gates** (all must pass before a change is done):

```sh
npm run lint          # despia lint --strict — zero warnings
npm run review        # the design bar (a11y, tap targets, type scale, palette)
npm run check:styles  # every style property against the framework catalog
```

### The two local identities (the auth seam)

`scripts/dev-session.mjs` is the **auth-provider seam**: it mints a viewer (no role) and
an operator (`role: service_role`) into `public/dev-session.json`, which the screens fetch
as their session. A real deployment replaces that file's role with an identity provider —
the server only ever **verifies**. The exact token contract, and what swapping in
Clerk/Supabase/your IdP actually requires, is written down in
[docs/auth.md](docs/auth.md).

### Deploying

`despia build` emits a complete Cloudflare Workers lane into `deploy/cloudflare/`
(gitignored — it regenerates every build): a wrangler manifest and a worker that serves
the site and the whole route table from one deploy. `npm run deploy` runs
`despia deploy cloudflare`, which walks provisioning (it prints the `wrangler secret put`
commands for the env the server needs). The hosted database is any Postgres with the
migration applied.

### What is honestly degraded on web, by design

- **Rewarded ads** — mediation SDKs are native-lane; the web serves a real house creative
  with a watch requirement and a server-verified grant, and the card names its lane
  (`Components/parts/AdGate.dsx` — capability first, platform second).
- **Native store billing** — RevenueCat rides the native lane; the web sells through
  Stripe with server-created PaymentIntents and idempotent settlement.
- **Push / Live Activities** — OneSignal journeys ride the hosted lane; notices queue in
  the admin surface and land in the in-app inbox meanwhile.
- **Demo media** — CC-licensed sample clips in `public/media/` stand in for episodes; the
  hosted lane swaps `video_url` to Cloudflare Stream HLS (the CDN base is data, so the
  swap is a seed change, not a code change).

## The trust shape (why this template exists)

The client never decides anything about money or entitlement. Every grant, spend and
unlock is a ledger row + a wallet fold on the server (`server/wallet.dsx`,
`server/engage.dsx`, `server/store.dsx`); entitlement is granted only after Stripe
confirms, through an idempotent settle the UI can always safely retry; the player mounts
a source only for entitled episodes; a viewer probing the operator routes gets a 404
indistinguishable from an absent route (the host's internal gate). The Manage bridge
(`/admin`) and the MCP tool rows in `server/admin.dsx` are projections of the same
declared actions — UI, AI and HTTP share one contract.

## Known framework items

Everything discovered while building this template is filed in [PLAN.md](PLAN.md) §6 —
per the program's no-hacks law, none of it is worked around silently in template code;
where a bridge exists it is labeled in place and dies when the upstream lands. CI gates
land the day the packages publish to npm (the sibling-checkout requirement is the only
thing keeping them out of a public runner).
