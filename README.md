# Short Drama — the official DSX short-drama template

[![gates](https://github.com/despia-templates/short-drama-app/actions/workflows/ci.yml/badge.svg)](https://github.com/despia-templates/short-drama-app/actions/workflows/ci.yml)

A ReelShort/DramaBox-class vertical drama app in pure DSX — 28 components and 7 server
documents, one source, native on iOS, Android, web and desktop. SSR web storefront
(Popular / New / Ranking), a TikTok-style For-You feed, a full-screen vertical player with
a **server-enforced coin paywall**, VIP, a rewards loop (check-in streaks, capped rewarded
ads, the wheel, tasks), comments with the four UGC-safety controls the stores require, a
notifications inbox, account deletion, and a **Manage View** operator surface — all over one
declared backend (`server/*.dsx`: 17 entities with Postgres RLS, 45 routes, 6 MCP tools and
one inbound webhook). The founding program docs live in [PLAN.md](PLAN.md) and `docs/`.

**Status: a complete local slice, production-shaped, with every gap named where you meet
it.** Every flow runs against real Postgres with real RLS and verified JWTs — nothing is
mocked, and money is never granted on the client's word. Where a lane cannot be delivered
today the app says so *in the UI* rather than in a comment; §"What is honestly degraded"
lists every one of them, and each is filed in PLAN.md §6.

---

## What actually ships

| Surface | What is real |
|---|---|
| **Home** `/` | Hero pager, phone tab row Popular / New / Ranking, Continue Watching with a resume bar, New Release, a TOP rail with ranked numerals, per-genre shelves, footer |
| **Discover** `/discover` | Vertical pager over EP 1 of every live show, muted autoplay, caption bound to the resting index |
| **Browse** `/browse`, `/browse/:genre` | Genre and tag chips derived from the catalogue with counts, filtered grid |
| **Show** `/show/:id` | Key art, plot, tags, a 6-column episode grid, My List, and a **bulk series unlock at a server-priced quote** |
| **Watch** `/watch/:show/:idx` | Vertical pager over episodes, drag scrubber off one measured box, speed, subtitles and PiP as real `<video>` booleans, a right rail, the range-pill drawer, a **persistent two-column panel ≥1120**, the paywall sheet, comments with report / block / delete-own, and a safety-filter level |
| **Store** `/store` | Server price table, Stripe PaymentIntent, an **idempotent settle with a recovery card**, restore |
| **VIP** `/vip` | Masthead, benefits (every claim true), free-with-VIP rail, plans sheet, an honest restore row |
| **Rewards** `/rewards` | 7-day check-in curve, the wheel (server-declared prize table), tasks, rewarded ads capped per day and **VIP-gated**, with the App Store 2.5.18 report-this-ad seam |
| **My List** `/list` | History rail with resume, favourites grid |
| **Profile** `/profile` | Identity, wallet, transaction ledger, **a real language picker over fourteen shipped locales**, Manage, Account |
| **Account** `/account`, `/auth/:pane` | Sign in / sign up / sign out, restore purchases, terms, privacy, support, **and account deletion that provably empties the account** |
| **Notices** `/notices` | Operator broadcast inbox |
| **Manage** `/admin` | Catalogue table, create show, add episode, notice composer, the MCP tool list, **a moderation queue**, and a funnel readout |
| **Search** | An overlay on every screen, not a route |

**The trust shape, which is why this template exists.** The client never decides anything
about money or entitlement. Every grant, spend and unlock is a ledger row plus a wallet fold
on the server; a paid episode's media URL is not in any anonymous payload and the player
fetches a short-lived play ticket per episode; entitlement is granted only after Stripe
confirms, through a settle the UI can always safely retry; a viewer probing the operator
routes gets a 404 indistinguishable from an absent route. The Manage bridge and the MCP tool
rows are projections of the same declared actions — UI, AI and HTTP share one contract.

---

## Run it locally

**Requirements:** Node ≥ 22.18, a local PostgreSQL you can `createdb` against, and the
framework checkout built as a sibling of this repo (see "The framework checkout" below).

```sh
npm install                       # a preflight checks the layout first and prints any fix
createdb shortdrama_dev
cp .env.local.example .env.local  # set DSX_DATABASE_URL and DSX_JWT_SECRET (both required)
npm run build                     # compiles Components/**.dsx AND server/*.dsx
psql -d shortdrama_dev -f server/generated/migration.sql   # re-runnable by construction
psql -d shortdrama_dev -f server/policies.local.sql        # the app's policy addendum
npm run session                   # mints the LOCAL viewer + operator JWTs (reads .env.local)
npm run serve                     # one origin: SSR site + API @ :8787 (foreground)
```

Then, **in a second terminal**:

```sh
npm run seed                      # 14 demo shows, 352 episodes, via the admin routes; idempotent
```

Open <http://localhost:8787>. **Reset the demo** with `dropdb shortdrama_dev && createdb
shortdrama_dev`, re-apply both SQL files and re-seed; the seed converges the database onto
`scripts/catalogue.mjs` (idempotent by title) and `scripts/gen-art.mjs` regenerates every
piece of key art deterministically from the same manifest.

### The gates

All five must pass before a change is done, and CI runs the same five.

```sh
npm run lint          # despia lint --strict — zero warnings
npm run check:styles  # every style property, every icon, and every colour against its name
npm run review        # the design bar (a11y, tap targets, type scale, palette)
npm run build         # compiles Components/**.dsx AND server/*.dsx
npm run verify        # BEHAVIOURAL: boots an origin, signs in, spends money, races itself
```

The first three read the source; `verify` runs the thing. It boots its own origin on a spare
port, then asks the questions a human would — does every route answer, does the SSR html
carry real content, is an anonymous unlock refused, does a double settle grant twice, is a
paid episode's URL in the payload, is a shipped locale complete, does an Arabic plural carry
every category its language can select. Several defects have shipped
here that every static gate passed, because each was a runtime disagreement rather than bad
source; `scripts/verify.mjs` names them at the top.

Two smaller tools, not gates:

```sh
node scripts/theme.mjs                    # the palette: every named tone and where it is painted
node scripts/strings.mjs                  # locale coverage per language
node scripts/strings.mjs --write pt-br    # refresh a locale table against the current source
node scripts/strings.mjs --unreachable    # the strings the localisation seam cannot reach
node scripts/strings.mjs --server         # the copy the BACKEND sends to a display point
node scripts/strings.mjs --components     # which component attributes a caller may fill with copy
```

**A UI or backend change means rebuild, then restart `npm run serve`** — the site registry is
read at boot. (The dev origin reloads it when `dist/` changes and says so, because a page
served from an older build than the bundle beside it wears the wrong styles *silently* —
PLAN.md §6.39.) `npm run serve` also sets `DSX_DEV_NO_SW=1` so the local origin never installs
the precaching service worker; a stale bundle against fresh SSR is the classic "correct markup
looks broken" trap.

### The framework checkout

The DSX packages are not on npm yet, so `package.json` resolves them by this layout:

```
<parent>/
  despia_dsx/despia-framework/    # git clone, then: cd OpenSource/Web && npm install && npm run build
  short-drama-app/                # this repo
```

A checkout elsewhere: symlink it (`ln -s /path/to/checkout/.. ../despia_dsx`) — the
preflight's `DSX_FRAMEWORK_DIR` override covers the scripts, but npm's `file:` deps read only
the relative path.

**No access to the private framework repo?** There is a public Apache-2.0 drop
(`despia-native/despia`). Two things to know first. It is the *contents* of `OpenSource/` with
no wrapping directory, so it is cloned **into** `OpenSource` (the preflight catches the other
case by name):

```sh
git clone https://github.com/despia-native/despia despia_dsx/despia-framework/OpenSource
```

And **the drop lags the `dev` branch this template is written against** — measured 2026-08-30,
its attribute census listed 30 universal attributes where `dev` listed 38, missing `href`, so
a clean build failed with 38 lint errors on markup that was correct and shipping. It also
carries no `ClosedSource/`, so Stripe and SocialShare cannot be configured
(`node scripts/ci-open-drop.mjs` removes them and prints what that degrades). Filed as
[issue 275](https://github.com/despia-native/despia-framework/issues/275).

---

## The auth seam

`Components/parts/AuthSeam.dsx` is the identity boundary: **one file owns the session for the
whole app**, and every screen mounts it instead of carrying its own. The contract is one
shape:

```
provider → { viewer: { sub, token, name?, email? }, operator?: { sub, token } }
```

`sub` must be a **UUID** (owner RLS stores `owner_id uuid`) and the token an **HS256 JWS
signed with `DSX_JWT_SECRET`**. That is the only thing the backend knows about identity: **the
server verifies, it never issues.**

Four keys in `App.json` `consts` are the swap point, and a local build may override them in
`dsx.config.json` `consts` without touching the file that ships:

| key | what it is |
|---|---|
| `authSessionUrl` | GET → the payload above. Called at boot when a session is expected. Defaults to the local provider. |
| `authSignInUrl` | POST `{ email, password }` → the same payload. **Set this and the credential form becomes real**; leave it unset and the screen says so instead of accepting any password. |
| `authSignUpUrl` | POST → the same payload. |
| `authSignOutUrl` | POST → anything; the client drops its token either way. |

Locally, `scripts/dev-session.mjs` **is** the provider: it mints a viewer (no role) and an
operator (`role: service_role`) into `.dev-session.json` at the repo root (gitignored), and the
dev origin serves it at `/dev-session.json` — but only to a loopback, `.local` or RFC1918 host,
and never under `NODE_ENV=production`.

**Guest browsing is the default, on purpose.** App Store 5.1.1(v): if an app has no significant
account-based features, let people use it without a login. Home, Discover, Browse, every show
page and every free episode work with no account at all — and so does *buying*, because a
purchase needs a subject and an anonymous session is a subject. Sign-in is the upsell after the
money lands, never the toll in front of it.

**Why the token is not persisted.** Only the DECISION rides a cookie (`in` | `guest`); the token
itself lives in memory and is re-fetched from the provider on every cold start. That is how a
real IdP session works, and it keeps a bearer JWT out of a JavaScript-readable cookie.

The exact token contract, and what swapping in Clerk / Supabase / your own IdP requires, is in
[docs/auth.md](docs/auth.md).

**One thing that bit hard enough to gate.** `.dev-session.json` used to live in `public/`, and
`scripts/dev-session.mjs` also wrote a copy into `dist/`. `despia build` copies `public/` into
`dist/`, and `dist/` is what `npm run deploy` uploads — so **both** paths published a full-write
`service_role` JWT at a guessable URL on every deployment. `.gitignore` covered them, which is
exactly what made it look handled. `npm run build` now fails if any privileged token appears in
the output (`scripts/dist-guard.mjs`, wired as `postbuild`) and `npm run verify` asserts it
again. A rule that is only written down is a rule that ships broken once.

---

## The payment lane

**There are two, and the platform decides which — not this app's convenience.**

**Web: Stripe, and it is real.** `server/store.dsx` creates the PaymentIntent server-side with
an idempotency key, the client opens the payment sheet through `Core/Payments/Stripe`, and the
grant happens in `settleOrder`, which is idempotent (the order row is the lock) and verifies
the confirmed amount against the order before it credits anything. The Store's recovery card
exists because money Stripe confirmed and the server has not yet granted must never be a dead
end. Set `STRIPE_KEY` and `STRIPE_PUBLISHABLE` (test mode) in `.env.local`; leave them unset and
the Store shows the server's honest refusal instead of a payment sheet.

**Native: StoreKit and Play Billing through RevenueCat, and it is wired.** App Store 3.1.1
names in-game currencies and premium-content unlocks as in-app-purchase products, so coins and
the VIP pass are sold through the platform store inside an iOS or Android build; Stripe is legal
on the web storefront only. `Core/Store` and `Core/RevenueCat` are configured packages; the one
purchase control, `Components/parts/BuyButton.dsx`, picks the lane by capability (`has('store')`
first, `os == 'web'` second) and calls `store.checkout` with the RevenueCat provider, the
catalogue row's store product id, and the viewer's subject as the app user id — the platform's
purchase sheet is the only platform surface in the flow. The grant is the server's on both lanes:
`POST /store/native` verifies the transaction against RevenueCat's REST API (a single
server-to-server GET; RevenueCat has already validated the receipt with Apple or Google, so the
app never parses one), and a `verify="bearer"` webhook at `/webhooks/revenuecat` grants the same
transaction into the same single granter if that call is lost — one ledger lock, so nothing is
credited twice. `/membership` is the plan page (the store's localized prices on a device, the
server's list on the web); `ShortDrama.storekit` is the simulator's store, generated from the
price table. **Everything an adopter configures is one page: [docs/monetization.md](docs/monetization.md)**
— the two public SDK keys, the two server secrets (`REVENUECAT_KEY`, never to a client;
`REVENUECAT_WEBHOOK_SECRET`), the product ids on the catalogue rows, and sandbox testing.

**What is honestly still upstream.** The native exports fold a project's `Modules/` and its
lockfile, not yet the `packages` list this web build honours (PLAN.md §6.115; an engine agent is
landing the fold), so `has('store')` is false on a device build until it lands and the purchase
control shows one line — "In-app purchases are not available in this build" — and charges
nothing. A module's `config.json` (the RevenueCat SDK keys) has no app-side override yet
(§6.141), so today they are set in the package.

**Restore: two routes, one verb, and neither asks who you are.** App Store 3.1.1 wants a restore
mechanism, and the founder's constraint is sharper than the guideline — it has to work with **no
login**, because most of this product's revenue comes from viewers who never make an account.
`auth="required"` verifies a *token*; it does not ask for a human behind it, so both routes are
reachable by an anonymous session. Neither takes an argument naming a purchase: the caller id is
read server-side off a row the caller owns.

| Lane | Route | Asks | Recovers |
|---|---|---|---|
| Web | `POST /store/restore` | Stripe, about orders this backend opened | a charge Stripe confirmed that never got granted |
| Native | `POST /store/restore/native` | RevenueCat, about what this subject owns | a store purchase that was paid for and never landed |

A native build runs **both**, because a viewer who bought on the web storefront and came back on
their phone has an unsettled order on the same account. Both sweeps are bounded and resumable —
twenty Stripe reads, five native grants against the 64-call cap — and both report `done`, so the
row can say "tap again" instead of reporting a half-finished restore as finished.

**What restore cannot do, on any lane, and why that is the answer rather than a gap.** Apple keys
a receipt to an **Apple ID** and Google keys a purchase token to a **Google account** — never to
a device — so the platform genuinely can recognise a returning buyer with no app login. But every
product here is a **consumable**: StoreKit leaves consumables out of `currentEntitlements`, Play
stops returning a purchase token once a pack is *consumed* (which it must be, or the viewer can
never buy another), and replaying one would be wrong even where RevenueCat still remembers it —
a consumable was **delivered**. Someone who bought 1,000 coins and spent 400 holds a balance of
600, not a 1,000-coin receipt, so re-granting mints fresh coins on every reinstall.
`unique (intent)` in `server/policies.local.sql` refuses that by design. **A reinstall is an
identity problem, not a purchase problem** — the coins are safe on the subject that bought them,
and the job is reaching that subject. `parts/RestoreRow.dsx` says this on screen, per lane, and
`npm run verify` fails if the line leaves `/store` or `/vip`.

**The one client half that is missing.** `<AuthSeam>` `publishGuest` publishes
`{ ok: false, headers: {} }`, so this build mints **no anonymous session** and a guest carries no
token — both routes would 401. The server is ready for the anonymous buyer; the seam is not. The
row names which half is missing rather than firing a call that cannot succeed, and the checklist
below carries the row.

---

## Analytics

`Components/parts/Analytics.dsx` declares the funnel — ten events, at the boundaries a drama
app actually turns on:

```
app_open · show_detail_viewed · episode_started · paywall_shown · episode_completed
unlock_attempted · unlock_succeeded · purchase_started · purchase_completed · restore
```

`episode_started` and `paywall_shown` are the **same boundary seen twice** — a viewer arriving
at an episode either gets the clip or gets the wall — so the ratio between them is the paywall
conversion, and nothing else in the app measures it. `purchase_completed` fires on the
**settle**, never the tap: money Stripe confirmed and the server granted, counted once even
when the recovery card retries.

The transport is `dsx.module.posthog.capture` — the framework's own product-analytics verb —
chosen by capability (`has('posthog')`), never by platform, with `Core/Consent` as the gate.
**Ids and numbers only**: a show id, an episode id, an index, a price, a sku, a lane. Never a
subject, an email, a display name, a comment body or a search term, and `identify()` is
deliberately never called.

**Nothing can reach a sink today, and the Manage screen says so in those words.** Both
`Core/PostHog` and `Core/Consent` ship a complete `web/index.js` and neither manifest declares a
`web.entry`, so the CLI emits no chunk and `has()` is false on every web build — the identical
defect `Core/SocialShare` records about itself and has since had fixed. Filed as PLAN.md §6.92,
three lines per manifest. Until it lands every event drains to `dsx.log`, the framework
diagnostic spine, which is a drain and not a transport: open devtools, walk the funnel, and
watch it.

---

## Localisation

**This template is written in English and it ships in fourteen languages, one of which runs
right to left, because in DSX those are the same sentence.** Localisation is gettext-shaped: apps are written in English, the
**English source string is the key**, and the kernel resolves it at the display points — a text
value or its inner text, a button label, a field placeholder — live, static markup included.
Nothing is annotated and nothing is rewritten. Not one literal in `Components/**` was converted
to ship these tables.

A locale is one file: `Strings.<lowercase-bcp47>.json` at the repo root, flat
`{ "Sign in": "Iniciar sesión" }`. **File presence is the declaration** — `despia build` folds
every one it finds into the registry. Switching is one state write, `global.locale`, and the
Profile screen's Language row does exactly that.

### What ships

Thirteen tables plus the English source, chosen by this category's revenue rather than by
speaker count — the markets ReelShort, DramaBox and ShortMax actually operate in:

| tier | locales |
|---|---|
| 1 | `es` Español · `pt-br` Português (Brasil) · `ja` 日本語 · `de` Deutsch · `fr` Français |
| 2 | `ko` 한국어 · `zh-hant` 繁體中文 · `id` Bahasa Indonesia · `th` ไทย · `it` Italiano |
| 3 | `tr` Türkçe · `vi` Tiếng Việt · `ar` العربية |

**`zh-Hans` is deliberately absent.** The category does not ship Simplified Chinese as a locale;
it ships a separate domestic app under a separate licence, which is a different product, not a
translation.

**`ar` is Modern Standard Arabic, and that is a market decision rather than a linguistic one.**
A dialect would read better to the readers who speak it and foreign to everyone else: Egyptian
in the Gulf, Gulf in the Maghreb. MSA is what every regional streaming service ships its chrome
in for exactly that reason, and this category sells across all three markets at once. Where MSA
would sound stiff, the copy leans on the imperative — اشحن · شاهد · افتح — which is how the
category's own Arabic apps talk and is a register MSA carries perfectly well.

**Arabic was held back from the twelve-locale pass on purpose, and this is what changed.** The
framework's direction plane now decides layout direction from the same locale the string tables
read (an app pin over `global.locale` over the device; script subtag over language) and applies
it at every root — `dir`+`lang` on the document element on web, `.environment(\.layoutDirection)`
on iOS, `LocalLayoutDirection` on Compose. The web's `:dir(rtl)` sheets and logical properties
had existed for a while and were dead because nothing set the attribute. What that plane does
and does not reach is measured below rather than assumed.

### What RTL actually does, measured

Not "it looks mirrored". Every number below is a live reading in Chrome at 390px with
`global.locale = 'ar'` restored from the cookie on a cold load, against the identical reading
in English.

| claim | measured |
|---|---|
| the document turns | `<html dir="rtl" lang="ar">`, `getComputedStyle(body).direction === 'rtl'` |
| nothing overflows | `documentElement.scrollWidth` 390 = `clientWidth` 390 on Home, Browse, Store, VIP, Rewards, Profile, My List, Notices, Account and Show. Zero elements outside a horizontal scroller escape the viewport |
| no Arabic string clips or wraps | a sweep of every leaf text node carrying Arabic on those nine screens: 0 clipped, 0 wrapped to a second line. (English demo *titles* still ellipsise, identically in both directions — that is the design) |
| the tab bar reverses | DOM order Home/For You/VIP/My List/Profile lands at x-centres **354 · 275 · 195 · 115 · 36**; the mirror image of English. Widest caption الرئيسية at 38px against the 58px box |
| the top nav reverses | at 1440: wordmark x 1189, links 1097 → 1051 → 976 → 916 → 832 → 750, Get-Coins CTA at x 86 |
| rails start at the right | both Home rails compute `direction: rtl` with `scrollLeft 0` at rest and their first child at x −1640 / −1790 — the track hangs off to the left and the reader starts at the right edge |
| the episode grid reverses | EP 1 at the right of each row, EP 5 at the left, reading right to left |
| a back chevron turns | `chevron.right` at x 362 in a 390 viewport (English: `chevron.left` at x 22) |
| a menu-row chevron turns | nine disclosure chevrons render `chevron.left` at x 19 |
| numerals stay Latin | `Intl.NumberFormat('ar')` gives `2.6` and `1,880` — bare `ar` is `latn` in current CLDR, so the app never mixes digit systems. The date carries its own RLM marks (`1‏/9‏/2026`) |
| Latin runs read correctly inside Arabic | `EP 1–5 Free` renders `EP 1–5 Free`; the RTL paragraph does not disturb a Latin-initial run |
| the bottom sheet mirrors | the episode drawer's poster sits right, its CTA left, its tabs right-to-left; the panel itself is full-width, so it has no leading edge to mirror |

**Two bidi defects were found this way and fixed**, both on the episode grid head, both caught
by a per-character `Range` sweep rather than by looking at a screenshot:

- `1 - {{ n }}` rendered **`19 - 1`**. A spaced hyphen between two numbers takes the RTL
  paragraph level and the numbers swap — a range that is *wrong*, not merely odd. `1-{{ n }}`
  renders `1-19`, and the player drawer's own range pills had always spelled it that way.
- `{{ n }} free` rendered **`free 5`** (a leading number takes the paragraph level too), and it
  was untranslatable besides. Split into two `hstack` children so `free` becomes a static key
  the seam reaches: measured in Arabic, `5` at x 49 and `مجانية` at x 16 — "5 مجانية" read
  right to left.

**And here is what still does not mirror.** Every one is filed with its measurement; none is
papered over.

| what | where it bites | whose |
|---|---|---|
| **The player seek bar** | the fill anchors at the LEFT and grows away from the reader's start edge; the thumb lands at **x 471–485 in a 390px viewport** — 95px past the end of its own track, off-screen. `transformOrigin="leading"` compiles to the physical `left center` while `align="leading"` compiles to the logical `start`, and `offsetX` has no logical twin | engine — §6.104 |
| **The episode drawer's tab underline** | same cause: the rail's `align="leading"` mirrors, the rule's `offsetX` does not, so it sits at x 375–426 under the *other* tab and half off the panel | engine — §6.104 |
| **A `<pager>`'s page order** | index 0 stays at the left in Arabic; the engine pins the viewport `dir="ltr"` deliberately ("one scroll-coordinate model in every engine") and mirrors only the keyboard intent. The hero's prev/next chevrons are the app's only two icons pinned physical, so they agree with the control they drive | engine, by design — §6.103 |
| **An Arabic *device* that never opened the picker** | gets a mirrored layout from the engine and 34 unmirrored chevrons from the app, because the resolved direction is not readable from DSX and `global.locale` is empty exactly when the device is deciding | engine — §6.102 |
| **Content in a language the chrome is not** | an English synopsis inside an Arabic frame puts its full stop at the left edge, and a truncated Latin title clips its *start* (`... Billionaire Twin`). Correct per the bidi algorithm, wrong for the reader. A web-only `unicode-bidi: plaintext` would fix ordering and split the column's alignment, so it was not half-done | engine — §6.106 |
| **A sign or a number at the START of a string** | `+5%` renders `5%+` and `500 coins + 25 bonus` renders `coins + 25 bonus 500` — six of each on the coin-pack grid, measured by per-character sweep. The prices are fine (`$11.99` sweeps as `$11.99`), so this is not "numbers break in RTL": it is specifically a leading sign or digit with no strong character before it. Same fix as the row above; the markup half is fixable today by splitting | engine — §6.108 |
| **Six counted strings** | want a plural group and cannot have one, because their display points are server-rendered and the SSR renderer emits raw ICU | engine — §6.101 |

### These translations have not been reviewed by a native speaker

**They are model-generated.** Say this out loud in your own README if you adopt them, and get
them reviewed before you take money in a market. They were produced against the category's own
vocabulary (coins, unlock, episode counters, VIP, top-up — the words ReelShort and DramaBox use
in each market rather than the words a dictionary offers), they were checked in a browser for
clipping and wrapping at 390px, and they are good enough to demonstrate the plane and to start
from. They are not a substitute for a linguist.

### What had to be shortened, and for which control

The tab bar is the tightest thing in the app: `Components/parts/TabBar.dsx` gives each slot
`width="66" paddingH="4"` at `fontSize="11"` with no `lineLimit`, so the caption box is
**58px** and an over-long caption *wraps* rather than clipping. Measured live at 390px, the
widest caption any locale produces is ja `マイページ` at 55.0. These are the strings that had
to give, with the faithful longer form each one displaced:

| locale | key | shipped | rejected |
|---|---|---|---|
| de | `Home` | Start | Startseite (10, tab bar) |
| de | `My List` | Liste | Meine Liste (11, tab bar — the full form survives on the `My list` sibling) |
| de | `Save` / `Saved` | Merken / Gemerkt | Speichern / Gespeichert (the *state* arm is 11 against a 9-char rail) |
| de | `Speed` · `Playback Speed` | Tempo · Wiedergabetempo | Geschwindigkeit · Wiedergabegeschwindigkeit |
| de | `Show less` | Weniger lesen | Weniger anzeigen (16) |
| fr | `Save` / `Saved` | Garder / Gardé | Enregistrer / Enregistré (11/12) |
| fr | `Add days` | Prolonger | Ajouter des jours (a 129px pill against English's 84) |
| fr | `Earn free` · `Get coins` | Gagner · Recharger | Pièces gratuites · Obtenir des pièces (a nowrap 2-up pill row) |
| fr | `See plans` | Nos offres | Voir les offres (15) |
| ja | `My List` | リスト | マイリスト (5 glyphs, tab bar) |
| ja | `Get Coins` | チャージ | コインをチャージ (kept for `Top up coins`) |
| ko | `Profile` | 내 정보 | 마이페이지 (kept for `Personal Center`) |
| pt-br, it | `My List` | Lista | Minha lista · La mia lista |
| tr | `Home` | Anasayfa | Ana Sayfa (the space is a wrap point) |
| tr | `Saved` · `Following` | Kayıtlı · Takipte | Kaydedildi · Takip ediliyor |
| tr | `Restore purchases` | Alımları geri yükle | Satın Alınanları Geri Yükle (Apple TR's own, 27) |
| vi | `For You` · `My List` | Cho bạn · Danh sách | Dành cho bạn · Danh sách của tôi |
| ar | `For You` | لك | مقترح لك (the two-letter form is what the category's own Arabic builds use) |
| ar | `Profile` | حسابي | مركزي الشخصي (kept nothing — `Personal Center` took صفحتي) |
| ar | `Get coins` | اشحن | اشحن عملات (the lowercase key is the nowrap 2-up pill row; the title-case `Get Coins` keeps the full form in the top nav) |
| ar | `Hot` · `Popular` | رائج · شائع | الأكثر رواجًا · الأكثر شعبية (both are chips) |
| ar | `LEGAL` | قانوني | الشؤون القانونية (a section header, not a page title) |

Two that were left over budget on purpose, because the control has the room: fr
`Supprimer mon commentaire` (25 against a 23.8 guideline, in a full-width sheet row) and
id `Baru di sini?` (13 against 12.6 — every shorter option meant something else).

Where we are least confident, in order:

0. **`ar` Arabic, and it is now the weakest of the fourteen** — for two reasons that have
   nothing to do with the layout. First, MSA is a *register* decision as much as a dialect one,
   and consumer entertainment is exactly where MSA is hardest to keep punchy; a native editor
   would rewrite half the CTAs shorter. Second, the plural forms are the only place in this
   corpus where grammar is doing real work — the paucity plural under `few` (`بقيت 3 أحرف`,
   feminine-singular verb) and the accusative *tamyīz* under `many` (`بقي 11 حرفًا`) are correct
   by rule, and rules are exactly what a machine gets right while sounding wrong. Everything
   else in the table is one sentence at a time; those six forms are one sentence per count.
1. **`th` Thai** — the most distant from the rest and the hardest to self-check: word breaking
   is implicit, so caption widths were verified by measurement rather than by reading, and the
   register (polite-neutral, no ค่ะ/ครับ particles in chrome) is a judgement call.
2. **`ko` Korean** — particle selection (은/는, 이/가, 을/를) is correct by rule but a native ear
   catches unnatural sequences a rule does not; the politeness level is consistent, which is the
   part machine Korean usually fails.
3. **`vi` Vietnamese and `tr` Turkish** — smaller reference corpus in this category, so the
   coin/unlock vocabulary (`Xu`, `Jeton`) follows the local app convention rather than a
   verified in-market string.
4. **The long legal and deletion paragraphs in every locale** — App Store 5.1.1(v) copy about
   what a deletion destroys is the copy where a mistranslation is most expensive, and it is the
   copy furthest from the punchy consumer register the rest of the app is written in.

### The switcher

Profile's Language row is a real `<picker>` — a `<select>` on the web, the system menu on iOS
and Android — with fifteen rows: **Device language** first, then thirteen endonyms and English.

- Every language is named **in itself** (`Deutsch`, `日本語`, `Tiếng Việt`), because a Japanese
  reader hunting for German is looking for `Deutsch`. The rows are DATA
  (`Components/parts/Theme.dsx languageRows()`), which is why fourteen endonyms do not enter
  the string corpus — and also the only thing they could be, since a choice control's option
  labels never reach the localization seam (PLAN.md §6.98).
- **The device row is the default and it is real.** The kernel ladder is `global.locale` →
  device language → `en`, so an app that has never been switched is already following the
  device. Writing a tag at boot to make the control look decided would delete that step;
  picking the device row clears the choice and hands the ladder back.
- **The choice is remembered in the cookie jar** — the only declared cross-platform storage
  grammar there is, because §6.33 (no key-value plane) is still open. It survives reloads and
  deep links; it does **not** survive quitting the browser, because the web cookie writer emits
  no `max-age` and there is no way to ask for one (PLAN.md §6.100). The row says so in the UI.
- **A device set to `pt-PT` or `zh-TW` will not find these tables on its own.** The kernel tries
  the full tag and then the bare language and nothing between, so `zh-tw` → `zh` misses a
  `zh-hant` table (PLAN.md §6.99). Bare-language locales are fine (`de-AT` → `de`). Until that
  lands, those two are reachable through the picker rather than through the device.

### What a locale is measured against

`node scripts/strings.mjs` classifies the corpus mechanically, so a coverage number means
something:

| | |
|---|---|
| **304 viewer** | product copy — what a locale is measured against, and all thirteen are at 100%. Seven of them are the SERVER's words, and fifteen are copy a screen hands a component (both below) |
| **45 operator** | rendered only by the Manage surface: an internal tool, deliberately English |
| **17 developer** | copy that cites a source path — the server's `reason` field is one of them, a config key or a ledger entry. Translating "set `authSignInUrl` in App.json `consts`" makes the instruction *wrong* in the target language |
| **273 unreachable** | the seam's real boundary, listed by `--unreachable` rather than guessed |

That last row is the honest part. Two things the seam does not reach, each needing a
different answer: **a11y labels and sheet chrome titles** (the kernel localizes display points
only, so a screen reader hears English on a Spanish device — and `<sheet title=>` is *visible*
copy at a display point this app does not own, measured and filed as PLAN.md §6.168), and
**interpolated composites** (`EP 1–{{ n }} Free` renders `EP 1–5 Free`, which no table can hold;
the scheduled Translate module owns that tier).

### The price list is the server's words, and it is the same plane

**It used to be a third thing on that list, and that was wrong twice over.** Plan names, the
term notes and `BEST VALUE` are fields on the rows `server/store.dsx storeCatalog` returns —
deliberately, because a price list with two copies is the drift that file exists to prevent.
Nothing extracted a server file, so all thirteen tables reported 248/248 and a Japanese reader
still bought in English off the screen closest to the money. The note here said server copy
"localizes server-side". It does not, and it does not need to.

**Under gettext the server is already sending keys.** The English source string *is* the key,
so "the backend sends English" and "the backend sends a translation key" are one sentence. The
display point does not care where its template came from: `localizeTemplate` normalizes
`{{ item.note }}` to `{0}`, misses, renders the hole, and then looks up **the rendered form** —
the seam's legacy door. So the string the server sent hits the table exactly the way `Save`
does, and the fix was a *corpus*, not a mechanism.

**Every lane, the same way** — the standing parity goal, checked by reading rather than assumed:

| lane | where the legacy door lives |
|---|---|
| web | `kernel/src/strings.ts` `localizeTemplate` |
| iOS | `Engine/iOS/DSXStrings.swift` — same comment, same ordering |
| Android | `engine/Strings.kt` — likewise |

One table, one ladder (`global.locale` → device → `en`), the client resolving and the server
never learning a locale. **SSR needs no special case**: `server/src/render.ts` holds no
reference to `DSXStrings` on purpose — *"the server is rendering for MANY locales at once and
knows exactly one of them: the one the app is AUTHORED in"* — so a route serves English and
`bindDisplay` swaps the translation in at mount, for a markup key and a server key identically.

**Which fields are copy is DECLARED** (`scripts/strings.mjs` `SERVER_COPY`), because nothing can
infer that a row's `label` is a name and its `id` is a sku. `price` and `bonus` are deliberately
absent — `$11.99` and `+5%` are formatted numbers, which localise through `Intl` at the point of
formatting. `reason` is declared and still comes out English, because it cites `REVENUECAT_KEY`
and a source path and `classify()` files it *developer* by the same rule it applies to markup.

**What was rejected.** *Per-request resolution on the server* (`Accept-Language`, or a locale
argument) is right for a crawler or an email, and this app sends neither; against it, the header
is a browser fact, so the native lanes would need an explicit argument and the one plane would
immediately be two — and `render.ts` refuses the shape structurally, because `exportStatic`
writes ONE document per route and every reader is served it. *Moving the copy into markup* and
returning only prices and identifiers re-creates the drift, and hard-codes three tiers into a
screen whose tier set is operator data; the only thing it was buying is what the plane above
gives the server for free.

**The cost, named rather than discovered later:** the key set grows with the operator's rows —
a fourth tier is two more keys in thirteen tables. One ICU template would collapse all six into
one, and PLAN.md §6.101 has that door shut while the Store is a server-rendered route. So the
gate makes the cost loud: `npm run verify` boots an origin, calls `/store/catalog`, and requires
every shipped locale to answer the words that came back — plus a second assertion that the
extractor can *see* every word the wire sends, which is the door source-reading structurally
cannot close (a key that leaves the corpus leaves the tables merely *stale*, and stale has never
been a failure). Both were proved by making them fail. PLAN.md §6.107.

### And the copy a screen hands a component, which is the same plane again

**A third tier missed the tables for the same reason, and the fix is not the same at all.**
`<SignInCard title="Purchases land on an account">` is a markup literal on the screen that
mounts it; it renders at `<text value="{{ dsx.attribute.title }}">` inside the child, one hop
away, so the kernel resolves it through the very same legacy door. Only the extractor cared:
`title` sat in the unreachable list, no rule ever read a caller's attribute, and thirteen tables
reported 100% while `/store` showed two English sentences at 390px under `uiLocale=ja`.

**This one is DERIVED, not declared, and that is the difference from `SERVER_COPY`.** A store
row is data — nothing in it says which field a screen prints, so that tier needs a manifest and
pays for it. A component is *source*, and the child already declares where each attribute lands,
in the markup it needs for its own sake:

```
<attribute as="title" default="'Sign in to continue'"/>   ← the name
<text value="{{ dsx.attribute.title }}" class="title"/>   ← the display point
```

`componentDisplayAttrs()` reads that pair out of every file in `Components/**`, so the manifest
writes itself and there is no second list to drift: delete the `<text>` and the attribute stops
being copy on the next run; add one and every caller's string joins the corpus. The redesign
proved it without an edit — the rule found **15 attributes on 7 components** (`SignInCard`,
`LinkPrompt`, `ContactRow`, `PlanCard`, `CoverCard`, `BuyButton`, `SearchOverlay`) where the
pass that wrote it had seen 4 on 2.

It cannot confuse `<sheet title=>` with a mount's `title=`, because the map is keyed by
**component**: `sheet` is a kernel tag with no template here, so it stays unreachable (§6.168),
and `Skeleton` — capitalised, mounted 25 times, a framework global with no file — is the control
case. The read is deliberately tight, the *whole* display value and a *bare* attribute read,
which is what keeps `{{ today }}/{{ cap }} today` and a bound show title out of thirteen tables:
a mount that passes `{{ item.title }}` is an interpolation and files as unreachable, a mount that
passes a literal is copy. `node scripts/strings.mjs --components` prints what it derived.

**The gate had to read the artefact rather than the html, and the measurement is why.** Not one
of these strings appears in the SSR body of *any* route: every mount sits behind a signed-out
condition or a sheet, and `render.ts` correctly drops a node whose `visible-if` is falsy. So
`npm run verify` fetches `/registry.json` off the booted origin — what the browser actually boots
from — walks the compiled component trees, resolves each mount tag through the registry's own
`globalPool`, and requires every locale to answer the copy a mount hands a child; a second
assertion requires the extractor to *see* every such string the origin ships, which is what a
stale `dist/` breaks (§6.39). Proved by injection: blanking the display points fails the paired
positive while every negative passes vacuously at zero, and swapping one served mount string
leaves all thirteen source-reading coverage gates green while both live assertions go red.

**A ternary is not a composite, and getting that wrong cost 29 strings.** `bindDisplay`
localizes the string it *renders*, so `<text value="{{ favOn ? 'Saved' : 'Save' }}">` looks up
`Saved` or `Save` and hits the table — measured, that control reads `Liste` in German today.
The extractor used to file every interpolated value as unreachable, so twelve complete locales
all showed English on `Follow`, `Claim`, `See plans` and `Restore purchases`. It now pulls the
literal arms of a ternary when the attribute is exactly one hole and each arm is a whole
literal; a concatenation fragment still is not a rendered form and stays out.

**The server already sends keys, and nobody was reading them.** Plan names, term notes and
`BEST VALUE` are fields on the rows `server/store.dsx storeCatalog` returns — deliberately, so
the price a screen *displays* and the price a card is *charged* are one literal. Under gettext
the English source string *is* the key, so "the backend sends English" and "the backend sends a
translation key" are the same sentence; the client display point resolves it exactly as it
resolves `Sign in`. `SERVER_COPY` in `scripts/strings.mjs` declares which fields are copy,
because a row is `{ id, label, price, cents }` and no rule can tell a name from a sku without
being told.

**And copy a caller hands a component reaches a display point one hop away.**
`<SignInCard title="Purchases land on an account">` is a literal in `Store.dsx`; it renders at
`<text value="{{ dsx.attribute.title }}">` inside the child, so the table hits. `title` sat in
the unreachable list, no rule read a caller's attribute, and thirteen tables reported 100%
while `/store` showed two English sentences in Japanese — fifteen strings across seven
`<SignInCard>` mounts and two `<ContactRow>` mounts.

This one is **derived, not declared**, and that is the difference from `SERVER_COPY`. A store
row is data; a component is source, and the child already says where each attribute lands:

```
<attribute as="title" default="'Sign in to continue'"/>   ← the name
<text value="{{ dsx.attribute.title }}" class="title"/>   ← the display point
```

`componentDisplayAttrs()` reads that pair out of every file in `Components/**`, so the manifest
writes itself and there is no second list to drift — delete the `<text>` and the attribute stops
being copy on the next run. It also cannot confuse `<sheet title=>` with `<SignInCard title=>`,
because the map is keyed by **component**: `sheet` is a kernel tag with no template here, so it
stays unreachable, and `Skeleton` — capitalised, mounted 25 times, a framework global — is never
in the map either. The read is tight on purpose: the attribute must be the *whole* display value
and a *bare* read, which keeps AdGate's `{{ today }}/{{ cap }} today` and PersonalNav's UID out
of thirteen tables. `node scripts/strings.mjs --components` prints what it derived.

### The plural plane, and why Arabic is the reason it exists

Three of those 247 keys are **message templates** rather than sentences:

```
{0, plural, one {# character left} other {# characters left}}
```

The template *is* the table key, holes intact; one entry serves every value of `n`, the count
resolves after the table hit, and each locale picks its own CLDR category. English is correct
with no table at all, because the source string is already a complete plural message.

**Ten of the fourteen locales never need more than two forms. Arabic needs six** —
zero/one/two/few (n%100 = 3–10)/many (11–99)/other — and a `{{ n == 1 ? … : … }}` ternary can
express exactly two. Worse, the ternary this replaced could not even be *translated*: the
extractor lifts a whole branch literal but never a concatenation fragment, so twelve tables
carried `Flagged by 1 reader` and every count above one stayed English in every language.

The comment composer's 500-character budget reaches all six **by typing**, which is why it
carries the demonstration. Measured live at 390px with locale `ar`:

| left | category | rendered |
|---|---|---|
| 0 | zero | لم يبقَ أي حرف |
| 1 | one | بقي حرف واحد |
| 2 | two | بقي حرفان |
| 3 | few | بقيت 3 أحرف |
| 11 | many | بقي 11 حرفًا |
| 100+ | other | بقي 100 حرف |

**Only three display points converted, and the reason is the ceiling, not the appetite.** The
message tier lives in the client mount; the SSR renderer does not run it. Probed with one
caption on `/show` before believing it: the delivered HTML carried
`{dsx.variable.freeCount, plural, one {# free} other {# free}}` *verbatim*, replaced only when
the bundle hydrated. So the three groups live in sheets that mount on a tap and appear nowhere
in a server-rendered body — and `npm run verify` asserts that confinement over the delivered
bytes of seven routes, so the next author who writes one at a server-rendered point is told.
Six further counted strings are named in PLAN.md §6.101 and wait for that gap:
`1-{{ n }}` and the free count on the grid head, `EP 1 — {{ n }} episodes`,
`Unlock all {{ n }} remaining episodes`, `All {{ n }} Episodes` and `{{ n }} day streak`.

Two gates guard the three that shipped, because one is not enough. A **category** gate asserts
every category the locale's CLDR rule can actually select is declared — the wanted set is swept
out of the kernel rather than typed — and a **distinctness** gate asserts Arabic's six render as
six different strings. Deleting `two` from one entry proved they are not redundant: the category
gate failed and the distinctness gate did not, because the fallback to `other` still produced
six different strings.

The **known next tier**, named rather than quietly skipped: a display bound to
`{{ dsx.variable.vipLine }}` renders one of the literal sentences that computed returns, so the
seam would hit those too — roughly 25 strings, listed by `--unreachable`. Following a computed's
returns needs a rule that cannot mistake an enum key or a CSS string for copy, and a half-safe
rule puts junk in thirteen tables, so it waits.

**A half-locale cannot ship, and neither can a fake one.** `npm run verify` reads the built
registry and fails if a shipped locale is missing one viewer string, if the picker offers a
language whose table nobody wrote (or ships a table nobody can select), if a locale is missing
from the device-row map, or if more than 30% of a table's values are byte-identical to their
English key — because completeness is a count, and a count is satisfiable by pasting the key
into the value 270 times. It also fails if a plural entry is short a category its language can
select, or if Arabic's six forms are not six distinct strings, or if any server-rendered route
carries a raw message template. Adding a language is: write the table, add the row and the tag
in `Theme.dsx`, add the device-row label, run the gates.

**Everything above reads source — which is exactly the gate the last two tiers walked past — so
two more assertions ask a BOOTED origin what words it actually puts in front of a reader.** One
reads `/store/catalog` and requires every locale to answer the price list on the wire. The other
reads `/registry.json`, the artefact the browser boots from, walks the compiled component trees
and requires every locale to answer the copy a mount hands a child. That second one had to read
the artefact rather than the html: measured, not one of the fifteen mount strings appears in the
SSR body of *any* of the fifteen routes, because every mount sits behind a signed-out condition
or a sheet, and `render.ts` correctly drops a node whose `visible-if` is falsy. Both are paired
with an `unseen` check in the other direction — a word the origin ships that the extractor
cannot see from source never reaches a translator, and a stale `dist/` is precisely that
(PLAN.md §6.39). Proved by injection: blanking the display points fails the paired positive
while every negative passes vacuously at zero, and swapping one served mount string leaves all
thirteen source-reading coverage gates green at 270/270 while both live assertions go red.

Numbers and dates are locale **formatting**, not translation: `compactCount()` and
`shortDate()` in `Components/parts/Theme.dsx` run through `Intl` and read the same
`global.locale`. Measured in Arabic, `Intl` keeps Latin digits for a bare `ar` (`2.6`, `1,880`)
— current CLDR makes `latn` the default numbering system for the language without a region —
so the app never mixes digit systems against the episode numbers, which are plain `String(n)`.
An `ar-EG` device would get Arabic-Indic digits from `Intl` and Latin ones from those, which is
the shape of a defect worth knowing about before you add a regional table. What is still out of reach is **content** language — the dubbed audio and the
subtitle track — because `<video>` can select neither a rendition nor a track (PLAN.md §6.36).
The Language row says so instead of implying it covers them.

---

## One vocabulary, one palette

`Components/parts/Theme.dsx` is the app's presentation vocabulary, declared once as an
app-wide function library and mounted as the **first child** of every screen:

- **breakpoints and layout** — `bpOf` · `isWide` · `gutterOf` · `shellOf` · `railShellOf` ·
  `panelAt`. Phone < 768 · tablet < 1120 · desktop. This used to be a byte-identical block in
  fifteen files, so changing the desktop gutter was a fifteen-file edit.
- **the palette** — 38 tones named by their JOB (`brand`, `coin`, `surfaceCard`, `onGold`), so
  a re-skin is a value change and never a rename.
- **formatting** — `compactCount` · `shortDate` · `activeLocale`.

Every colour a screen writes in **markup** calls a tone by name. Every colour inside a
`<style as="…">` declaration is still a literal, because **a `<style>` attribute cannot carry
an interpolation** — the compiler drops the declaration silently (measured; PLAN.md §6.91). So
those literals are **checked mirrors** rather than second sources: `npm run check:styles` fails
on any hex in `Components/**` that Theme.dsx does not name, and `npm run review` reads the same
table for its brand-palette waiver. Run `node scripts/theme.mjs` to see every tone and where it
is painted.

---

## What is honestly degraded, and where you meet it

Every one of these is named **in the UI** at the point a user or an operator would otherwise
assume it worked. That is Article 7 of the program law, and it is the habit this template is
most trying to teach.

| Lane | State | Where it says so |
|---|---|---|
| **Native in-app purchase** | The backend is built; the client module aborts the build upstream | `Components/Store.dsx` and `parts/PlansSheet.dsx` refuse and explain |
| **Restore for an anonymous buyer** | Both restore routes take a subject rather than a login and are ready for one; `<AuthSeam>` mints no anonymous session, so a guest has no token to send (§6.86) | `parts/RestoreRow.dsx` names the missing half and offers the sign-in that works today |
| **Restoring a consumable after a reinstall** | Not possible on any lane, by platform design and by product truth — the value was delivered, and `unique (intent)` refuses a replay | `parts/RestoreRow.dsx`'s per-lane ceiling line, asserted by `verify` on `/store` and `/vip` |
| **Analytics sink** | The funnel is wired; no module can be loaded (§6.92) | The Funnel card on `/admin` |
| **Rewarded ads** | Mediation SDKs are native-lane; the web serves a real house creative with a watch requirement and a server-verified grant | `parts/AdGate.dsx` names its lane |
| **Push** | Notices queue and land in the in-app inbox; nothing is delivered to a device | The Manage composer, and Notices |
| **Moderator remedy** | An operator can read the queue and cannot hide a comment: a declared action carries no service authority (§6.7), so the token is scoped like a viewer's — measured, `POST /social/comment/delete` answers 403 | The moderation queue card |
| **Content language** | `<video>` can select neither a rendition nor a track (§6.36) | The Language row |
| **The player seek bar and the drawer tab underline, in RTL** | `transformOrigin="leading"` compiles to the physical `left` and `offsetX` has no logical twin, so a measured-box affordance travels the wrong way: the seek thumb renders at x 471 in a 390px viewport, the tab rule under the wrong tab (§6.104) | The Localisation section's *what still does not mirror* table |
| **An Arabic device that never opened the picker** | The resolved layout direction is not readable from DSX and `global.locale` is empty exactly when the device is deciding, so the app cannot turn its own chevrons (§6.102) | Same table; `Theme.dsx isRtl()` says it in the code |
| **Six counted strings that want a plural** | The message tier is client-only; a `{n, plural, …}` group at a server-rendered display point ships raw ICU in the HTML (§6.101) | The plural section above names all six; `npm run verify` fails if one moves |
| **Content in a language the chrome is not** | No per-string text direction, so an English synopsis in an Arabic frame puts its full stop on the left and truncates from the front (§6.106) | The *what still does not mirror* table |
| **A sign or a number at the start of a string** | `+5%` reads `5%+` in Arabic and a count-led phrase throws its number to the far end; a fully translated app still shows it (§6.108) | The *what still does not mirror* table |
| **A remembered language** | No key-value plane (§6.33), and the cookie the choice rides is a SESSION cookie with no way to ask for durability (§6.100) | The Language row says it forgets when you quit |
| **`pt-PT` and `zh-TW` devices** | The table ladder tries the full tag then the bare language and nothing between, so a script-qualified table is unreachable from the device step (§6.99) | The Localisation section; the picker reaches them explicitly |
| **Playback quality** | One rendition in this build | The player's options sheet |
| **Demo media** | CC-licensed sample clips stand in for episodes; the hosted lane swaps `video_url` to a CDN, which is a seed change and not a code change | The Manage screen |
| **View counts and ratings** | Seeded demo values; nothing increments them | The Manage screen |

---

## Deploying

`despia build` emits a complete Cloudflare Workers lane into `deploy/cloudflare/` (gitignored —
it regenerates every build): a wrangler manifest and a worker that serves the site and the whole
route table from one deploy. `npm run deploy` runs `despia deploy cloudflare`, which walks
provisioning and prints the `wrangler secret put` commands the server needs. The hosted database
is any Postgres with the migration and `server/policies.local.sql` applied.

**Before you deploy, set these** — all of them are seams the template deliberately leaves empty,
because a placeholder reads as a wired integration:

| Where | Key | Why |
|---|---|---|
| `App.json` `consts` | `authSessionUrl`, `authSignInUrl`, `authSignUpUrl`, `authSignOutUrl` | your identity provider |
| `App.json` `consts` | `termsUrl`, `privacyUrl` | both stores require them in-app beside a paid plan |
| `App.json` `consts` | `supportUrl` | App Store 1.2 requires published contact info for an app with comments |
| `App.json` | `host` | the native lane has no origin of its own |
| env | `DSX_JWT_SECRET`, `DSX_DATABASE_URL` | required |
| env | `STRIPE_KEY`, `STRIPE_PUBLISHABLE` | the web storefront |
| env | `REVENUECAT_KEY` | the native store lane **and its restore** — with it unset, `POST /store/restore/native` refuses out loud rather than answering "nothing to restore" to someone who has paid |
| env | `REVENUECAT_WEBHOOK_SECRET` | the inbound half; paste the same value into the RevenueCat dashboard |
| RevenueCat | product ids matching `storeCatalog` (`vip_pass_7/30/365`, `coins_500`…`coins_10000`) | `grantStore` refuses a sku the price table does not sell, so a product created in App Store Connect and not here fails loudly in the drain rather than crediting a guess |
| RevenueCat | `app_user_id` = the DSX subject | it is what `settleNative` and `restoreNative` look the caller up by, and what stops viewer A redeeming viewer B's receipt |
| `<AuthSeam>` | an anonymous session, if you want restore and checkout to work without a login | the routes already accept one; the client does not mint one (§6.86). Until it does, a guest is sent to sign-in and told why |
| Sandbox | one real sandbox purchase through `POST /store/native` before submitting | the RevenueCat read was written from the documented shape and has never run against a live account; every branch fails closed, so a wrong field guess refuses a legitimate purchase |

---

## The native lane

`despia export ios` and `despia export android` turn this project into a real Xcode / Android
Studio project — kernel vendored, every component bundled, nothing withheld.

```sh
npx despia export ios --out ../shortdrama-ios
npx despia export android --out ../shortdrama-android
```

**The native lane renders — proven end-to-end.** All the screens were staged as fixtures into
the framework's own parity corpus and run through its hosted iOS capture plane: every screen
parsed, and the capture measured **830 nodes, 775 with a real non-zero box** — Home alone is 116
nodes, 112 sized, with the root at 390×844. What is still dark in a *bare exported* app is
tracked on [issue 278](https://github.com/despia-native/despia-framework/issues/278): the same
components inside a `despia export` build render nothing while the host view measures 402×874,
foreground-active and visible. Until it lands the native lane is "builds, boots, and renders
under the framework's harness", not "ships".

**`App.json` is the native half of the contract.** The web lane is same-origin by construction;
the native lane has no origin, so `host` is what a root-relative `<api url="/x">` — and every
`<image src="/posters/…">` — resolves against. It is deliberately **not** `localhost`: a device
cannot reach your laptop by that name, and the export ships no assets of its own
([issue 279](https://github.com/despia-native/despia-framework/issues/279)), so the origin serves
the art as well as the data. To test against a local server use your machine's LAN address and
add an ATS exception — the generated Info.plist declares none.

**Tablets are already in scope.** The export builds universal with all four iPad orientations,
and the app's own breakpoints put iPad portrait on the tablet lane and iPad Pro landscape on the
desktop lane — the same vocabulary the web uses, no second layout.

---

## Known framework items

Everything discovered while building this template is filed in [PLAN.md](PLAN.md) §6 — per the
program's no-hacks law, none of it is worked around silently: where a bridge exists it is
labelled in place and dies when the upstream lands. **94 numbered entries, every one measured, and 34 of them
marked RESOLVED, CORRECTED or RETRACTED in place rather than deleted.** The issue bodies live in
`docs/upstream/`, one file per finding, each with its repro and its measurement.

The most recent four, and the ones a DSX author is most likely to hit:

- **§6.91** — a `<style as="…">` attribute cannot carry an interpolation; the declaration is
  dropped silently, with no error and no lint warning. This is why a design token cannot reach
  a named style class.
- **§6.92** — `Core/PostHog`, `Core/Consent` and `Core/Telemetry` each ship a complete web facet
  that no build can load, because their manifests declare no `web.entry`.
- **§6.93** — a bracket write whose key contains a dot is stored as a nested path. Every ad
  report in the moderation queue read a null flag count, because every creative path ends in
  `.mp4`.
- **§6.94** — a `<functions global="true">` body is the expression tier: `dsx.log`,
  `dsx.module.*` and every `global.*` write are silent no-ops there, while the identical
  statements in an `<action>` body work.

Older ones still open and still worth knowing: the api cache dies with the mount (§6.30),
`await` in a ternary silently yields a non-ok result (§6.31), a route param is unreadable from a
`<variable>` initializer (§6.32), `<video>` can select neither a rendition nor a track (§6.36),
there is no transaction seam for a multi-row spend (§6.38), atomic style ids are positional and
unversioned (§6.39), and a hydrated `<scroll>` never gets its scroll plane (§6.40).

---

## Typography and art

`despia build` resolves the framework's bundled Inter, copies it to `dist/fonts/` (the OFL
licence travelling with the bytes) and links it from every page, so the served site and the
static export render in the same face rather than whatever the OS supplies. Nothing to
configure.

Key art is generated deterministically from `scripts/catalogue.mjs` by `scripts/gen-art.mjs`, at
the ratio each frame displays: a 2:3 poster in a 3:4 frame under `object-fit: cover` loses a
quarter of its height, so both are generated rather than one being stretched.
