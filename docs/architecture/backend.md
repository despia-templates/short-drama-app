# Backend architecture — declared, in the `<server>` grammar

> Everything below is the landed backend-authoring grammar (despia-framework
> `architecture/proposals/backend-authoring.md`, LANDED 2026-08-12): `<entity>` rows with
> ownership, `<action>` bodies in the one action grammar, `<route>`/`<worker>` rows,
> `<secret>`/`<egress>` gates. No TypeScript handlers. If a need below cannot be said in the
> grammar, that is an upstream conversation (PLAN.md §6), not an escape hatch.

## 1 · Deployment lane

- **Hosted (default)**: Despia editor → Cloudflare OAuth → Workers deploy (the existing
  one-button lane; `@despia-native/server` bootloader-workers + deploy-emit).
- **Media**: masters → R2; **Cloudflare Stream** encodes → HLS. The template stores only
  `asset` rows with a `playbackBase`; **no Stream API shape leaks into app code** — swap the
  encode worker and the same template runs on any HLS origin (self-host lane, rfcs/0004 §3).
- **Locked episodes**: signed playback tokens (Stream signed URLs hosted; HMAC-signed URL
  worker self-hosted), minted by `show.play` only for entitled episodes. The manifest URL a
  client holds for a locked episode is useless without entitlement.

## 2 · Entities (the schema head, one server document per domain)

| Document | Entities |
|---|---|
| `catalog.dsx` | `show` (title, synopsis, genres, poster, trailer, state: draft/scheduled/live, dripPolicy) · `episode` (show, index, asset, freeUntilIndex?, price?, state) · `asset` (r2Key, streamId, playbackBase, duration, status) |
| `viewer.dsx` | `viewer` (identity-linked; locale, pushPrefs, vipUntil) · `progress` (viewer+episode, position, ownership=owner) · `favorite` · `download-grant` |
| `wallet.dsx` | `wallet` (coins, bonusCoins) · `ledger` (append-only: source, amount, currency, expiry, ref) · `unlock` (viewer+episode, price paid) |
| `engage.dsx` | `checkin` (viewer, day, streak) · `task` + `task-claim` · `spin` (prizeTable version, result) · `ad-receipt` (SSV transaction_id UNIQUE, adUnit, rewardItem, state) |
| `campaign.dsx` | `segment` · `push-campaign` (template, audience, schedule, state) · `offer` (firstRecharge, winback; window) |
| `events.dsx` | `event` (append-only product analytics; **retention: 48h raw → rollup**, the emergency-recovery window rfcs/0003 §8) · `rollup` (daily aggregates the admin cards read) |

Ownership: viewer-plane entities are `ownership="owner"` (RLS); catalogue is public-read,
admin-write (**needs role-gated auth — upstream item PLAN.md §6.2**).

## 3 · Routes (the contract surface)

```dsx
<route method="GET"  path="/catalog/home"        action="homeShelves"  auth="none"  reach="web, app"/>
<route method="GET"  path="/catalog/feed"        action="discoverFeed" auth="none"/>
<route method="GET"  path="/show/:id"            action="showDetail"   auth="none"/>   <!-- SSR page data -->
<route method="POST" path="/show/:id/play"       action="playPayload"  auth="required"/> <!-- entitlements + signed URLs + resume -->
<route method="POST" path="/episode/:id/unlock"  action="unlockEpisode" auth="required"/>
<route method="POST" path="/wallet/iap"          action="revenuecatWebhook" auth="webhook"/> <!-- HMAC -->
<route method="GET"  path="/rewards/state"       action="rewardsState" auth="required"/>
<route method="POST" path="/rewards/checkin"     action="checkin"      auth="required"/>
<route method="POST" path="/rewards/spin"        action="spin"         auth="required"/>
<route method="POST" path="/rewards/task/:id"    action="claimTask"    auth="required"/>
<route method="GET"  path="/ads/ssv"             action="admobSsv"     auth="none"/>   <!-- AdMob GET callback, signature-verified -->
```

Admin routes mirror these per entity (declared CRUD) behind the admin role; Manage View
(rfcs/0003) consumes them — it never gets a second, parallel API.

## 4 · Workers (queues + cron)

| Worker | Trigger | Job |
|---|---|---|
| `encodeAsset` | queue on asset upload | R2 master → Stream encode → asset.status=ready |
| `dripRelease` | cron hourly | flip scheduled episodes live per show dripPolicy; enqueue `pushEpisodeDrop` |
| `pushFanout` | queue | segment resolve → OneSignal REST (egress api.onesignal.com); Live Activity updates ride the same worker |
| `expireBonus` | cron daily | expire bonus-coin ledger rows; enqueue T-24h warning push |
| `streakGuard` | cron per-hour bucket | at viewer's guard hour: streak-at-risk push/Activity |
| `rollupEvents` | cron hourly | fold `event` 48h window into `rollup`; prune raw beyond 48h |
| `reconcileIap` | queue (RevenueCat webhook) | idempotent entitlement + coin-pack credit by event id |

All idempotency via the grammar's `idempotencyKey` — DB-enforced, per the landed infra.

## 5 · The two money trust-chains

**IAP (coins/VIP):** client buys via RevenueCat (player paywall `buy` or store) → RevenueCat
webhook (HMAC) → `reconcileIap` credits wallet / sets vipUntil → client polls reconcile
(`verticalplayer.refresh()`). Client-side purchase success is UI, never a grant.

**Rewarded ads:** client shows AdMob rewarded → optimistic +8 UI → **AdMob SSV GET callback**
→ `admobSsv` verifies signature against Google's rotated public keys (cache ≤24h), enforces
`transaction_id` uniqueness + daily cap → writes `ad-receipt` + ledger. Unverified optimistic
balance decays on next `rewards/state`. (Refs: AdMob SSV docs; RevenueCat ad-rewards pattern.)

## 6 · SSR + SEO (web)

Shelves/show/episode pages resolve their `<api>` blocks SSR-side (`executeSsrApis`; failed
block degrades to client fetch). Streaming shell for the discover feed. Per-episode canonical
routes render `TVSeries`/`TVEpisode` JSON-LD; sitemap route generated from live shows;
posters via the asset plane with responsive variants.

## 7 · Realtime

Wallet + entitlement changes publish on the landed realtime plane; the open player's
`refresh()` is triggered by it (drop the polling loop where realtime is available; keep
reconcile-on-foreground as the fallback — Article 7 shape).
