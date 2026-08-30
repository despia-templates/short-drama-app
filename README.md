# Short Drama — the official DSX short-drama template

[![gates](https://github.com/despia-templates/short-drama-app/actions/workflows/ci.yml/badge.svg)](https://github.com/despia-templates/short-drama-app/actions/workflows/ci.yml)

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

  **No access to the private framework repo?** The public Apache-2.0 drop
  (`despia-native/despia`) mirrors the same tree — but it is the *contents* of `OpenSource/`
  with no wrapping directory, so it is cloned **into** `OpenSource`:

  ```sh
  git clone https://github.com/despia-native/despia despia_dsx/despia-framework/OpenSource
  ```

  Cloning it one level higher lands every package where nothing looks for it; the preflight
  catches that case by name. The drop carries no `ClosedSource/`, so run
  `node scripts/ci-open-drop.mjs` once to drop the Stripe and SocialShare packages — it
  prints exactly what that degrades. This is the path CI runs on every push, so it is the
  path that stays working.
- **Stripe web checkout** builds against the `Core/Payments/Stripe` module from the full
  Despia distribution (`ClosedSource/`). Without it, drop `"stripe"` from `modules` and
  the `packages` entry in `dsx.config.json`: everything else builds, and the Store shows
  the server's honest refusal instead of a payment sheet.

## Run it locally

```sh
npm install                       # preflight checks the layout first and prints any fix
createdb shortdrama_dev
cp .env.local.example .env.local  # set DSX_DATABASE_URL and DSX_JWT_SECRET (both required);
                                  # add STRIPE_KEY/STRIPE_PUBLISHABLE (test mode) for checkout
npm run build                     # compiles Components/**.dsx AND server/*.dsx → dist/, server/generated/
psql -d shortdrama_dev -f server/generated/migration.sql   # re-runnable by construction
psql -d shortdrama_dev -f server/policies.local.sql        # the app's policy addendum (PLAN.md §6.25)
npm run session                   # mints the LOCAL viewer + operator JWTs (reads .env.local)
npm run serve                     # one origin: SSR site + API @ :8787 (stays in the foreground)
```

Then, **in a second terminal**:

```sh
npm run seed                      # 14 demo shows, 352 episodes, via the admin routes; idempotent
```

Open http://localhost:8787 — Home, `/discover`, `/browse` (and `/browse/:genre`), `/vip`,
`/store`, `/rewards`, `/list`, `/profile`, `/notices`, `/show/:id`, `/watch/:show/:idx`, and
the operator bridge at `/admin`. Search is an OVERLAY on every screen, not a route. `npm run serve` sets `DSX_DEV_NO_SW=1` so the local origin never installs the
precaching service worker — a stale bundle against fresh SSR is the classic "correct
markup looks broken" trap (PLAN.md §6.13a — the item is retracted as a *layout* defect; its service-worker
finding is the part that stands).

**The numbers on the storefront are demo values.** Every series carries a view count and a
rating (home hero, detail screen, browse cards). They are seeded from `scripts/catalogue.mjs`
and nothing increments them — there is no telemetry in this template. A real deployment
replaces that table with its own counter; the wire shape (`show.views`, `show.rating`) is
unchanged.

**Typography.** `despia build` resolves the framework's bundled Inter, copies it to
`dist/fonts/` (OFL licence travelling with the bytes) and links it from every page, so the
served site and the static export render in the same face rather than whatever the OS
supplies. Nothing to configure.

**Reset the demo:** `dropdb shortdrama_dev && createdb shortdrama_dev`, re-apply the
migration and the addendum, re-run `npm run seed`. The seed converges the database onto
`scripts/catalogue.mjs` (idempotent by title), and `scripts/gen-art.mjs` regenerates all
key art deterministically from the same manifest.

**Gates** (all five must pass before a change is done — CI runs the same five):

```sh
npm run lint          # despia lint --strict — zero warnings
npm run check:styles  # every style property, and every icon, against the framework catalogs
npm run review        # the design bar (a11y, tap targets, type scale, palette)
npm run build         # compiles Components/**.dsx AND server/*.dsx
npm run verify        # BEHAVIOURAL: boots an origin and asserts payloads, SSR content, money authority
```

The first three read the source; `verify` runs the thing. It boots its own server on a spare
port, then asks the questions a human would — does every route answer, does the SSR html carry
real content, do the payloads still have the fields the screens read, is an anonymous unlock
refused. Three defects shipped in one week that every static gate passed, because each was a
runtime disagreement rather than bad source; `scripts/verify.mjs` names all three at the top.

A UI or backend change means **rebuild, then restart `npm run serve`** — the site registry is
read at boot. (The dev origin now reloads it when `dist/` changes and says so, because a page
served from an older build than the bundle beside it wears the wrong styles *silently* —
PLAN.md §6.39.)

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
where a bridge exists it is labeled in place and dies when the upstream lands. **40 ledger
entries: 38 measured findings, every one filed as an upstream issue, and 2 retracted where
they stood rather than quietly deleted.** The issue bodies live in `docs/upstream/`, one
file per finding, each with its repro and its measurement.

Nine are still open and are the ones a DSX author is most likely to hit: the api cache dies
with the mount (§6.30), `await` in a ternary silently yields a non-ok result (§6.31), a route
param is unreadable from a `<variable>` initializer (§6.32), there is no cross-platform
key-value storage (§6.33), `<video>` can select neither a rendition nor a track (§6.36), a
declared web package needs `boot: true` to be reachable at all (§6.37), there is no
transaction seam for a multi-row spend (§6.38), atomic style ids are positional and
unversioned (§6.39), and a hydrated `<scroll>` never gets its scroll plane, so `on:scroll`
is inert on the page a viewer lands on (§6.40).

## Localisation

This build ships **one locale**, and the Profile screen says so rather than offering a picker
that cannot deliver.

Two different things hide behind "language" in this category:

- **Content language** — the dubbed audio and the subtitle track. Unreachable today:
  `<video>` can select neither a rendition nor a track (PLAN.md §6.36, issue 270), so a picker
  would change nothing about what plays.
- **UI language** — the app's own chrome. Reachable, and the seam is declared:
  `dsx.global.strings.*` is the framework's white-label plane (defaults ⊕ `global.strings` ⊕
  per-call payload, so one write re-skins every adopting module). To localise this template,
  write that global at boot and read `{{ global.strings.x }}` at each of the ~180 literals in
  `Components/`.

What this template will not do is ship the control with one locale behind it. A dropdown that
switches to Spanish and returns a half-Spanish app is the same defect as the priced quality
ladder that was deleted from the player: a control that promises something it does not do.
