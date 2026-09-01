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
| **Profile** `/profile` | Identity, wallet, transaction ledger, **a real language picker over thirteen shipped locales**, Manage, Account |
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
paid episode's URL in the payload, is a shipped locale complete. Several defects have shipped
here that every static gate passed, because each was a runtime disagreement rather than bad
source; `scripts/verify.mjs` names them at the top.

Two smaller tools, not gates:

```sh
node scripts/theme.mjs                    # the palette: every named tone and where it is painted
node scripts/strings.mjs                  # locale coverage per language
node scripts/strings.mjs --write pt-br    # refresh a locale table against the current source
node scripts/strings.mjs --unreachable    # the strings the localisation seam cannot reach
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

**Native: RevenueCat, and the backend is built and waiting.** App Store 3.1.1 names in-game
currencies and premium-content unlocks as in-app-purchase products, so coins and the VIP pass
may **not** be sold through Stripe inside an iOS or Android build; Stripe is legal on the web
storefront only. The server half is done: `POST /store/native` verifies a transaction against
RevenueCat's own API (a single server-to-server GET — RevenueCat has already validated the
receipt with Apple or Google, so the app never parses one), and a `verify="bearer"` webhook at
`/webhooks/revenuecat` receives renewal, cancellation and refund into the same single granter.
Two secrets turn it on, both documented in `.env.local.example`: `REVENUECAT_KEY` (**never
reaches a client — it is a full-account credential**) and `REVENUECAT_WEBHOOK_SECRET` (a shared
value RevenueCat echoes; paste the same string into its dashboard).

**What is NOT wired, and it is not a choice.** The client half needs `Core/Store`, and adding
that module to `dsx.config.json` **aborts the build**: the package ships 20 Paywall components
and one of them mounts `<shared.VipCard>`, which nothing in the module tree defines. Tried
2026-09-01, recorded verbatim in `dsx.config.json`. So `has('store')` is false on every lane and
the purchase surfaces **refuse on native and say why**, rather than falling back to a card sheet
that would be a rejection. Re-add the package the day it compiles; nothing else changes.

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

**This template is written in English and it ships in thirteen languages, because in DSX those
are the same sentence.** Localisation is gettext-shaped: apps are written in English, the
**English source string is the key**, and the kernel resolves it at the display points — a text
value or its inner text, a button label, a field placeholder — live, static markup included.
Nothing is annotated and nothing is rewritten. Not one literal in `Components/**` was converted
to ship these tables.

A locale is one file: `Strings.<lowercase-bcp47>.json` at the repo root, flat
`{ "Sign in": "Iniciar sesión" }`. **File presence is the declaration** — `despia build` folds
every one it finds into the registry. Switching is one state write, `global.locale`, and the
Profile screen's Language row does exactly that.

### What ships

Twelve tables plus the English source, chosen by this category's revenue rather than by speaker
count — the markets ReelShort, DramaBox and ShortMax actually operate in:

| tier | locales |
|---|---|
| 1 | `es` Español · `pt-br` Português (Brasil) · `ja` 日本語 · `de` Deutsch · `fr` Français |
| 2 | `ko` 한국어 · `zh-hant` 繁體中文 · `id` Bahasa Indonesia · `th` ไทย · `it` Italiano |
| 3 | `tr` Türkçe · `vi` Tiếng Việt |

**`zh-Hans` is deliberately absent.** The category does not ship Simplified Chinese as a locale;
it ships a separate domestic app under a separate licence, which is a different product, not a
translation.

**`ar` is deliberately absent too, and this one is a gap rather than a decision.** Arabic needs
the RTL layout plane — mirrored leading/trailing, mirrored chevrons, mirrored progress fills,
bidi-correct interpolation — and this build has none of it. A locale that renders every string
correctly inside a layout that runs the wrong way is not a partial translation, it is a broken
app; the honest move is to ship it the day the layout plane lands, not before.

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

Two that were left over budget on purpose, because the control has the room: fr
`Supprimer mon commentaire` (25 against a 23.8 guideline, in a full-width sheet row) and
id `Baru di sini?` (13 against 12.6 — every shorter option meant something else).

Where we are least confident, in order:

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
and Android — with fourteen rows: **Device language** first, then twelve endonyms and English.

- Every language is named **in itself** (`Deutsch`, `日本語`, `Tiếng Việt`), because a Japanese
  reader hunting for German is looking for `Deutsch`. The rows are DATA
  (`Components/parts/Theme.dsx languageRows()`), which is why thirteen endonyms do not enter
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
| **244 viewer** | product copy — what a locale is measured against, and all twelve are at 100% |
| **43 operator** | rendered only by the Manage surface: an internal tool, deliberately English |
| **17 developer** | copy that cites a source path, a config key or a ledger entry. Translating "set `authSignInUrl` in App.json `consts`" makes the instruction *wrong* in the target language |
| **258 unreachable** | the seam's real boundary, listed by `--unreachable` rather than guessed |

That last row is the honest part. Three things the seam does not reach, each needing a
different answer: **a11y labels** (the kernel localizes display points only, so a screen reader
hears English on a Spanish device — an upstream ask), **interpolated composites** (`EP 1–{{ n }}
Free` renders `EP 1–5 Free`, which no table can hold; the scheduled Translate module owns that
tier), and **copy the server sends** (prices, rejection messages, notice bodies — they localize
server-side).

**A ternary is not a composite, and getting that wrong cost 29 strings.** `bindDisplay`
localizes the string it *renders*, so `<text value="{{ favOn ? 'Saved' : 'Save' }}">` looks up
`Saved` or `Save` and hits the table — measured, that control reads `Liste` in German today.
The extractor used to file every interpolated value as unreachable, so twelve complete locales
all showed English on `Follow`, `Claim`, `See plans` and `Restore purchases`. It now pulls the
literal arms of a ternary when the attribute is exactly one hole and each arm is a whole
literal; a concatenation fragment still is not a rendered form and stays out.

The **known next tier**, named rather than quietly skipped: a display bound to
`{{ dsx.variable.vipLine }}` renders one of the literal sentences that computed returns, so the
seam would hit those too — roughly 25 strings, listed by `--unreachable`. Following a computed's
returns needs a rule that cannot mistake an enum key or a CSS string for copy, and a half-safe
rule puts junk in twelve tables, so it waits.

**A half-locale cannot ship, and neither can a fake one.** `npm run verify` reads the built
registry and fails if a shipped locale is missing one viewer string, if the picker offers a
language whose table nobody wrote (or ships a table nobody can select), if a locale is missing
from the device-row map, or if more than 30% of a table's values are byte-identical to their
English key — because completeness is a count, and a count is satisfiable by pasting the key
into the value 244 times. Adding a language is: write the table, add the row and the tag in
`Theme.dsx`, add the device-row label, run the gates.

Numbers and dates are locale **formatting**, not translation: `compactCount()` and
`shortDate()` in `Components/parts/Theme.dsx` run through `Intl` and read the same
`global.locale`. What is still out of reach is **content** language — the dubbed audio and the
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
| **Analytics sink** | The funnel is wired; no module can be loaded (§6.92) | The Funnel card on `/admin` |
| **Rewarded ads** | Mediation SDKs are native-lane; the web serves a real house creative with a watch requirement and a server-verified grant | `parts/AdGate.dsx` names its lane |
| **Push** | Notices queue and land in the in-app inbox; nothing is delivered to a device | The Manage composer, and Notices |
| **Moderator remedy** | An operator can read the queue and cannot hide a comment: a declared action carries no service authority (§6.7), so the token is scoped like a viewer's — measured, `POST /social/comment/delete` answers 403 | The moderation queue card |
| **Content language** | `<video>` can select neither a rendition nor a track (§6.36) | The Language row |
| **Arabic and every RTL locale** | No RTL layout plane in this build: mirrored leading/trailing, chevrons, progress fills, bidi interpolation | The Localisation section above — the locale is withheld rather than shipped broken |
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
| env | `REVENUECAT_KEY`, `REVENUECAT_WEBHOOK_SECRET` | the native store lane |

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
