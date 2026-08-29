# Short Drama — the official DSX short-drama template

A ReelShort/DramaBox-class vertical drama app in pure DSX: SSR web storefront, TikTok-style
discover feed, a full-screen vertical player with a server-enforced coin paywall, a rewards
loop (check-in streaks, spin the wheel, daily tasks), and a **Manage View** operator surface
— all over one declared backend (`server/*.dsx`: entities with RLS, actions, routes, MCP
tools). The founding program docs live in [PLAN.md](PLAN.md) and `docs/`.

**Status: working local slice.** Every flow below runs against real Postgres with real RLS
and verified JWTs — nothing is mocked. Hosted lanes (Cloudflare deploy, AdMob SSV,
RevenueCat, OneSignal, the native apps) are specified in `docs/` and land next.

## Run it locally

Prereqs: Node ≥ 22.18, PostgreSQL running locally, the `despia-framework` checkout this
repo's `package.json` points at (dev branch).

```sh
npm install
createdb shortdrama_dev
npx despia build                                   # compiles app + server documents
psql -d shortdrama_dev -f server/generated/migration.sql
cp .env.local.example .env.local                   # then edit if you like
node scripts/dev-session.mjs                       # mints the LOCAL viewer + operator JWTs
node scripts/serve.mjs                             # one origin: SSR site + API @ :8787
node scripts/seed.mjs                              # 3 demo shows × 8 episodes, via admin routes
```

Open http://localhost:8787 — Home, `/discover`, `/rewards`, `/list`, `/profile`,
`/show/:id`, `/watch/:show/:idx`, and the operator bridge at `/admin`.

### The two local identities

`scripts/dev-session.mjs` is the **auth-provider seam**: it mints a viewer (no role) and an
operator (`role: service_role`) into `public/dev-session.json`. A real deployment replaces
this file with its identity provider (Clerk, Supabase auth, …) — the server only ever
verifies (`DSX_JWT_SECRET`, HS256). Subjects must be UUIDs (owner-scoped RLS stores
`owner_id uuid`).

### What is honestly degraded on web, by design

- **Rewarded ads** — AdMob is native-lane; the Rewards screen says so and web earns through
  check-ins, tasks and the wheel.
- **Coin packs / VIP** — RevenueCat is native-lane; web checkout is on the roadmap.
- **Push / Live Activities** — OneSignal journeys ride the hosted lane; notices queue in the
  admin surface meanwhile.
- **Demo media** — three CC-licensed sample clips in `public/media/` stand in for episodes;
  the hosted lane swaps `video_url` to Cloudflare Stream HLS (the CDN base is data, so the
  swap is a seed change, not a code change).

## The trust shape (why this template exists)

The client never decides anything about money or entitlement. Every grant, spend and unlock
is a ledger row + a wallet fold on the server (`server/wallet.dsx`, `server/engage.dsx`);
the player mounts a source only for entitled episodes; a viewer probing the operator routes
gets a 404 indistinguishable from an absent route (the host's internal gate). The Manage
bridge (`/admin`) and the MCP tool rows in `server/admin.dsx` are projections of the same
declared actions — UI, AI and HTTP share one contract.

## Known framework items

Everything discovered while building this slice is filed in [PLAN.md](PLAN.md) §6 (items
6–13) — per the program's no-hacks law, none of them is worked around silently in template
code; where a bridge exists (the serve-script's internal admin twins, the `== null` idiom,
external overlays for pager rows) it is labeled in place and dies when the upstream lands.
