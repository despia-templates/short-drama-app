# Monetization — what an adopter configures

This template sells two things: a **VIP pass** (a dated pass, one charge, no auto-renewal)
and **coin packs**. Both are granted by the server and only by the server; the client never
credits a coin. Where the money moves depends on the lane, and the lane is picked by
capability, never by convenience:

| Lane | Purchase | Verified by | Restore |
|---|---|---|---|
| iOS / Android app | StoreKit 2 / Google Play Billing, through **Core/Store** with the RevenueCat provider | `POST /store/native` asks RevenueCat's REST API; the RevenueCat **webhook** grants the same transaction if that call is lost | `store.restore` + `POST /store/restore/native` |
| Web storefront | Stripe (Core/Payments/Stripe) | `POST /store/settle` asks Stripe | `POST /store/restore` |

App Store 3.1.1 names in-game currencies and premium-content unlocks as in-app-purchase
products, so coins and the VIP pass may **not** be sold through Stripe inside a native build;
Stripe is legal on the web storefront only. `Components/parts/BuyButton.dsx` is the one file
that decides: `has('store')` → the store, `os == 'web'` → Stripe, otherwise a one-line refusal
and nothing charged. Every purchase surface in the app (the Membership page, the coin store)
buys through that one control.

**The founder's laws, which every line below obeys.** No coin grant ever originates from the
client — every credit comes from a server-to-server exchange this backend verified. The client
is never handed a long-lived or unscoped token. Restore works without a login: both restore
routes need a *subject* (an anonymous device session has one), never a human. `npm run verify`
asserts all three over a booted origin.

---

## 1 · Create the products (App Store Connect and Play Console)

The product ids are the `productId` field on every row of `storeCatalog` in
`server/store.dsx`. They default to the sku, so a fresh clone needs these nine, all
**consumable**:

| productId | What | List price |
|---|---|---|
| `vip_pass_7` | 7-day VIP pass | $11.99 |
| `vip_pass_30` | 30-day VIP pass | $24.99 |
| `vip_pass_365` | 365-day VIP pass | $199.99 |
| `coins_500` … `coins_10000` | the six coin packs | $4.99 … $99.99 |

Create each as a **consumable** in App Store Connect (In-App Purchases) and as a **one-time
product** in Play Console (Monetize → Products → In-app products). Use the same id on both
stores. If you already have store ids, change `productId` on the row — leave `id` alone, it is
the order row's key and the Stripe lane's lookup. The store's localized tier is what the
customer pays; `cents` is the list price the web charges and the entitlement record support
reads.

**Why consumables, and why no auto-renewal.** The backend grants a dated pass —
`vip_until = (current expiry or now) + days` — and nothing in it renews or cancels. A
non-renewing product has no renewal, grace-period, billing-retry or refund lifecycle to stay
in step with, which is what lets a bearer-authenticated webhook be *sufficient*. If you change
the pass to an auto-renewing subscription you also take on RevenueCat's `INITIAL_PURCHASE` /
`RENEWAL` / `EXPIRATION` events in `storeEvent`, a `subscriptions` read in `settleNative`, and
a manage/cancel surface (`store.manage`) on the Membership page. That is a real product
decision, not a config flag, and the Membership page's footnote prints the server's own note
for the selected plan so the page can never describe a product the server does not sell.

## 2 · RevenueCat

1. Create a RevenueCat project with an iOS app and an Android app; import the products above
   (Products → Import from App Store Connect / Play Console). No offering or entitlement is
   needed — every product is a consumable, and the server grants from its own table.
2. **Public SDK keys** (Project → API keys → *Public app-specific API keys*, `appl_…` and
   `goog_…`): the client SDK is configured from the RevenueCat **package's own `config.json`**
   — `apiKey` (iOS) and `androidApiKey` (Android) in
   `Core/RevenueCat/config.json` beside the framework checkout this project points its
   `packages` at (`dsx.config.json`). The native exports fold that file into
   `KernelTables.configByScheme["revenuecat"]`; there is no app-side override yet (the ask is
   PLAN.md §6.141, so an adopter does not have to edit a package to configure it).
3. **The secret key** (Project → API keys → *Secret API keys*, `sk_…`): `REVENUECAT_KEY` in the
   server's environment (`.env.local` locally). It is a full-account credential and must never
   reach a client — the server uses it once per purchase, server-to-server, on
   `GET /v1/subscribers/<subject>`.
4. **The webhook**: RevenueCat → Integrations → Webhooks → URL
   `https://<your origin>/webhooks/revenuecat`, Authorization header = a long random value
   you also set as `REVENUECAT_WEBHOOK_SECRET` on the server. The receiver is
   `verify="bearer"` (RevenueCat echoes the value; there is no body signature) and it
   enqueues; the `drain-store-events` worker grants `NON_RENEWING_PURCHASE` events through
   the same granter `POST /store/native` uses, on the same ledger lock, so a purchase can
   never be credited twice.

**The app user id.** The client passes the viewer's subject (`global.auth.sub`, a UUID) as
`externalId` / `appAccountToken`; RevenueCat keys the purchase to it as `app_user_id`; the
server reads the same value off the wallet row the caller owns. One identifier on all three
legs — and an anonymous device session has one, which is what makes buying and restoring
without a login work.

## 3 · Stripe (the web storefront only)

`STRIPE_KEY` and `STRIPE_PUBLISHABLE` (test mode) in `.env.local`. Leave them unset and the
web store shows the server's honest refusal instead of a payment sheet. Nothing about Stripe
reaches a native build.

## 4 · Sandbox and simulator testing

**The simulator, day one.** `ShortDrama.storekit` at the app root is a StoreKit
configuration file generated from the price table (`node scripts/storekit.mjs`; `npm run
verify` fails if it drifts). It describes the nine consumables to Xcode's local StoreKit
store, so a purchase runs with no App Store Connect account and no sandbox Apple ID. The iOS
export ships the file and points the shared scheme's launch action at it (`despia export
ios`, open the workspace, Run) — the scheme carries the `StoreKitConfigurationFileReference`
Xcode itself would write, so nothing is edited by hand.

**Sandbox purchases are refused by default — on purpose.** A sandbox transaction is free and
infinitely repeatable, so `settleNative`, the webhook drain and `restoreNative` all skip one
(`is_sandbox` / `environment !== 'PRODUCTION'`); granting it would be a coin faucet for every
TestFlight tester. On a **development** origin set `REVENUECAT_ALLOW_SANDBOX=1` and the same
three paths grant sandbox transactions, so you can watch the coins land. Never set it on
production.

A StoreKit-configuration purchase never reaches RevenueCat's servers, so with the local
store the purchase sheet, the unified envelope and the client flow can be exercised, and the
server-side grant needs a real sandbox purchase (a sandbox Apple ID on a device, or Play's
licence testers) plus `REVENUECAT_ALLOW_SANDBOX=1`.

## 5 · The surfaces

- **`/membership`** (`Components/Membership.dsx`) — the plan page: three cards from the
  catalogue, the store's localized price on a device (`store.catalog`), the selected outline,
  the "% OFF" badge derived from the row's own cents, the benefit rows, the gold CTA, the
  footnote, Restore · Terms · Privacy. The crown on Home, the player's unlock pill and every
  "see plans" door open it (`Theme.dsx membershipPath()`).
- **`/store`** — the coin packs, through the same control.
- **Restore** (`Components/parts/RestoreRow.dsx`) — runs both sweeps a build can ask and
  reports what landed; needs a subject, not a login.
- **Terms and Privacy** — `termsUrl` / `privacyUrl` in `App.json consts`; the pages name the
  gap until they are set.

## 6 · The export licence gate (`despia-entitlement.json`)

`Core/Store`, `Core/RevenueCat`, `Core/Payments/Stripe`, `Core/PostHog` and `Core/IdentityVault`
are premium-shelf packages, and `despia export ios|android` **refuses** to fold them unless a
`despia-entitlement.json` sits beside `dsx.config.json` (the framework's D5 rule: an open-only
project exports freely forever; a project shipping premium source carries a licence). The CLI
checks the file's `appId` (the bundle id the export builds under — `com.example.shortdrama` by
default, or the `--bundle-id` you pass), its `platform` (each platform is its own licence, so an
iOS and an Android export each want their own file) and its `majorVersion`. The CLI does **not**
verify the signature — the runtime's Ed25519 check on the device does — so for local development
an **unsigned** file is enough to export and run on a simulator:

```json
{ "appId": "com.example.shortdrama", "platform": "ios", "majorVersion": 4,
  "licenseId": "local-dev (unsigned; the runtime licence module decides)" }
```

Swap `"platform": "android"` for the Android export. **Never commit this file** — `.gitignore`
lists it — and a release (TestFlight, an internal Play track, the stores) needs a **signed**
entitlement from <https://despia.com/license>, whose `appId` covers your real bundle id and its
documented child suffixes.

## 7 · What `npm run verify` asserts

Every catalogue row names a store product id; the reference-price arithmetic holds; the
StoreKit configuration sells exactly the origin's products at the table's prices; the
Membership page is server-rendered with every plan and no refusal; both restore routes answer
a device session and refuse a caller with no token; a crafted restore body grants nothing; a
replayed settle grants nothing twice; and the price list the origin sends is translated in
every shipped locale.
