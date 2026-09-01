# Production-readiness audit — the short-drama template

**Audited:** 2026-09-01, against the working tree at `main` (19 components, 7 server documents,
32 routes, 14 entities). Gates at audit time: `lint` 0/0/0 · `check:styles` 0 problems ·
`review` 0 failures / 70 palette waivers · `build` 275 files, 4 spend ceilings. **All five
static gates are green and the template is not production-ready.** Everything below is a
runtime, contractual or product-completeness defect that no source-reading gate can see —
which is precisely the class `scripts/verify.mjs` was written to catch, and the class it does
not yet cover.

No file in this repository was modified to produce this document.

---

## 1 · The interpretation

The founder's brief: *"finalize the whole drama app to be a template that has everything a
production-ready drama app needs and all the details are prod ready — no mock data, no memory
state, no hardcode, fully finalized."*

Read literally, that brief forbids the thing a template most needs: content on first run. So it
must be read as three separate prohibitions, and the audit separates them accordingly.

| The brief says | What it actually forbids | What stays legitimate |
|---|---|---|
| **no mock data** | Fabricated content that the app presents as real, and fabricated content on a path a real deployment reaches. A view count nobody increments rendered beside a real title as social proof is mock data. A comment author hardcoded to `'You'` is mock data. | **Seeded demo content behind an explicit, documented step.** `scripts/seed.mjs` writes 14 shows / 352 episodes *through the admin routes*, idempotently, and `dsx.json` declares `"demo": { "seeded": true, "resettable": true }`. That is a template doing its job. The `catalogue.mjs` manifest is the fork point, exactly as designed. |
| **no memory state** | State a real deployment would silently lose: anything held in a JS variable rather than an entity, anything that resets on process restart, anything the declared backend promises and the fold never honours. | **Per-mount UI state** (`<variable>` — that is what it is for) and the **app-wide `global.cache*` stale-then-fresh stashes**, which are a deliberate, documented answer to a filed framework gap (§6.30) and are correctly scoped per endpoint. `scripts/serve.mjs` is the LOCAL dev origin and is allowed to be local — but only where its local-ness does not silently define the production shape. |
| **no hardcode** | Values a real deployment *must* change and cannot find, values duplicated so they can drift, and values that encode this demo's identity rather than the adopter's. | **Measured design constants** (gutter 86, poster 3:4, panel 416). AGENTS.md is explicit that these come from measurement; they are the template's product, not its debt. What is debt is that they are re-derived by copy in 12 files. |

**One more line the brief implies and does not say.** "Production-ready" for *this* category
means shippable to the App Store and Google Play. Three of the blockers below exist only under
that reading — account deletion, UGC moderation, and subscription/restore semantics — and they
are non-negotiable review gates, not opinions.

**The template's own law applies throughout.** AGENTS.md: a framework limitation is never worked
around silently — file it, bridge it loudly, or degrade per Article 7 *with the degradation named
in the UI*. Several findings below are Article 7 violations rather than framework gaps: the gap
is filed, the bridge exists, and the UI does not name it.

---

## 2 · Findings

### 2.1 · Mock / fake / placeholder data

| # | Item | file:line | Sev | Production needs |
|---|---|---|---|---|
| M1 | **Every comment is authored by `'You'`.** The insert hardcodes the display name, so a whole thread renders as one person talking to themselves. | `server/social.dsx:58`; rendered `Components/Watch.dsx:1267` | **BLOCKER** | A display name from the verified identity. The token contract (`docs/auth.md:11-18`) carries only `sub`; add a `name`/`picture` claim, or a `profile` entity (`ownership="owner"`) the viewer writes once and `listComments` joins. Never the client's word. |
| M2 | **`likes` is stored, rendered, and can never change.** The entity declares the column, the sheet prints "N likes", and no action increments it — every row reads "0 likes" forever. | field `server/social.dsx:15`; read `server/social.dsx:40`; rendered `Components/Watch.dsx:1269` | MAJOR | Either a `likeComment` action + a `commentlike` entity (`ownership="owner"`, one row per viewer per comment, which is also the de-dupe) and a tappable heart, or delete the column and the line. A counter nobody can move is decoration pretending to be signal. |
| M3 | **View counts and ratings are invented and never increment.** `METRICS` is a hand-keyed table; `show.views`/`show.rating` are seeded from it and rendered as social proof in four places. | source `scripts/catalogue.mjs:26-42`; stored `server/catalog.dsx:17-18`; rendered `Components/App.dsx:136-141`, `Components/Show.dsx:118-124`, `Components/Watch.dsx:209-214`, `Components/Browse.dsx:119-123` | MAJOR | The honesty note exists (`scripts/catalogue.mjs:20-25`) and is repeated **on the operator screen** (`Components/Admin.dsx:196`) — where no viewer sees it. Production needs a real counter: increment `views` on an entitled episode start (a `<route>` on the declared backend, debounced per session), and derive `rating` from a real review entity or drop it. The wire shape is already right; only the writer is missing. |
| M4 | **The offline demo seed paints a fake wallet, a fake ledger and fake rewards tasks on every non-App-Store native build, and the disclosure pill reaches one screen at one breakpoint.** `global.cacheWallet = {coins:320, bonus:45}` and a two-row ledger are seeded whenever `os != 'web'` and `env != 'appstore'` — so TestFlight, ad-hoc and enterprise builds all show fabricated money. The Article 7 pill lives inside a row gated `wide == false` on Home only. | seed `Components/parts/DemoSeed.dsx:9-23` (wallet `:18`, ledger `:22`, rewards `:21`); pill `Components/App.dsx:360-363` inside `Components/App.dsx:341` | **BLOCKER** (Article 7) | Two fixes. (a) **Never seed viewer-scoped money** — restrict the seed to the five public content keys (`cacheHome`, `cacheBrowse`, `cacheShow`, `cacheDiscover`, `cacheCatalog`) and let the wallet render its honest em dash. (b) **Move the disclosure to the chrome**, not a screen: a `global.demoSeeded` band in `TabBar`/`TopNav` (both already carry `chrome="true"`) so it appears on every screen and every width. |
| M5 | **The demo seed's rewards and ledger rows are the wrong shape** — invented rather than captured, so the native demo lane paints fields the server never returns. Tasks are `{id:'t1', title:'Finish any episode'}` against the server's `watch3`/`firstFavorite`; ledger rows carry `label`/`at` against the server's `source`/`created_at`; the inbox row's `kind:"news"` is not in the declared vocabulary (`push \| banner`). | invented `scripts/gen-demo-state.mjs:54-69`; emitted `Components/parts/DemoSeed.dsx:20-22`; real shapes `server/engage.dsx:84-87`, `server/wallet.dsx:216-218`, `server/admin.dsx:16-17` | MAJOR | The file's own header (`scripts/gen-demo-state.mjs:40-47`) states the rule it then breaks: *"a field name is a contract, capture or copy it."* Capture these three from an authenticated origin (mint a viewer token, hit `/rewards/state`, `/wallet/ledger`, `/social/notices`) instead of writing them by hand. |
| M6 | **The `firstFavorite` task always reports `progress: 0`,** even for a viewer who has favorites — the claim guard reads the real table but the progress display does not. | `server/engage.dsx:86` vs the real check `server/engage.dsx:140-143` | MINOR | One bounded `favorite.list({limit:1})` in `rewardsState`, the same read `claimTask` already does. |
| M7 | **A permanent unread dot on the VIP tab.** The badge is unconditional markup, so every viewer on every launch sees news that does not exist. | `Components/parts/TabBar.dsx:47` | MAJOR | Bind it to something true, or delete it. `Components/Notices.dsx` has no read-state at all (see S6), so there is currently nothing to bind — which is the real finding. |
| M8 | **Operator-created shows get a hardcoded placeholder poster and hero, and there is no way to change them.** Every show created from the Manage screen points at two fixed SVGs; no upload, no URL field, no edit form. | `Components/Admin.dsx:79` | MAJOR | An artwork URL field on the create form at minimum; a real deployment needs an upload lane (the framework's `files` plane) writing to R2/S3 and storing the returned URL. |
| M9 | **The Manage screen's genre picker is three hardcoded chips** (Romance / Fantasy / Revenge) against a catalogue that carries eight genres and derives them correctly everywhere else. "Fantasy" is not in the catalogue at all. | `Components/Admin.dsx:227-229`; the correct derivation `server/catalog.dsx:95-102`, consumed `Components/Browse.dsx:191-195` | MAJOR | Bind the chips to `browseCatalog`'s `genres` (already served, already counted), plus a free-text field for a new one. |
| M10 | **The house ad creative is a demo drama clip.** The rewarded placement plays `/media/heiress.mp4` — one of the three episode stand-ins — under an "AD" tag. | `Components/parts/AdGate.dsx:52`; tagged `Components/parts/AdGate.dsx:262` | MINOR | An actual house creative for the VIP offer the sheet already sells (`Components/parts/AdGate.dsx:273-275`), or make `creative` a server fact so an operator sets it without a build. |
| M11 | **Three MP4s stand in for 352 episodes**, mapped 5/4/5 across 14 shows, described as "Blender Foundation open-movie MP4s (CC-BY)" with **no attribution file anywhere in the repo** and no `public/media` gitignore entry. | mapping `scripts/catalogue.mjs` (`media:` field, 3 distinct values); claim `scripts/seed.mjs:5`; assets `public/media/{alpha,bride,heiress}.mp4` | MAJOR | CC-BY requires attribution. Add `public/media/CREDITS.md` naming each film, author and licence URL, and reference it from README. Separately: decide whether 3 MB of binary belongs in a template repo or behind a fetch step. |
| M12 | **Template branding is baked into the shipped footer.** | `Components/App.dsx:716-717` ("© 2026 Short Drama — the Despia DSX flagship template"), `:714` and `Components/parts/TopNav.dsx:111` (the `ShortDrama` wordmark) | MINOR | An adopter must not ship "the Despia DSX flagship template" in their footer. Move brand strings to one place (see H10) and make the copyright line a config value. |

### 2.2 · In-memory / process-local state

Split as instructed. **Local-origin-only is not a defect** — `scripts/serve.mjs` is the dev
origin and is allowed to be local. It becomes a defect only where its local-ness silently
defines the production shape (S3, S4).

**Declared-backend defects — state a real deployment loses or never had**

| # | Item | file:line | Sev | Production needs |
|---|---|---|---|---|
| S1 | **Bonus coins are promised to expire in 7 days and never expire.** Every grant writes an `expires` timestamp; the wallet fold that spends them never reads it; nothing decrements `wallet.bonus` on expiry. The product copy states the rule to the customer in two places. | column `server/wallet.dsx:22`; written `server/engage.dsx:107-108`, `:124-125`, `:150-151`; the spend fold that ignores it `server/wallet.dsx:198-209`; the promise `Components/Profile.dsx:255`, `:281`, `:303` | **BLOCKER** | A sweeper. There is no scheduled-job grammar in this repo's server documents, so the honest shapes are: (a) compute the live bonus balance **on read** in `walletState` — sum unexpired bonus ledger rows rather than trusting the cached fold — and let `unlockEpisode`/`unlockSeries` spend against that; or (b) an `expireBonus` action on an internal route driven by cron. (a) is preferable: it needs no scheduler and makes the ledger the single source of truth, which is what `server/wallet.dsx:3-4` already claims it is. **RESOLVED 2026-09-01, AND NOT THIS WAY — DO NOT IMPLEMENT THE SWEEPER.** Both shapes above expire money someone paid for: `bonus` is not a purely-granted bucket, because a coin pack's "+5% free" is credited there by `settleOrder`. App Store 3.1.1 forbids expiring purchased currency, so the capability was REMOVED instead — the column, all three grant writes, and the payload field. The three copy claims followed (PLAN.md §6.85), and `verify` asserts all four. |
| S2 | **Every "once per day / once per episode" guard is a read-then-write race with no unique constraint behind it.** The generated migration emits plain `create index`, never `unique`. Two concurrent check-ins, spins, task claims, ad grants or unlocks each pass the duplicate check and each grant. | guards `server/engage.dsx:94-95`, `:115-116`, `:134-135`, `:167-169`, `server/wallet.dsx:174-175`; indexes `server/generated/migration.sql:37,54,105,188,211,298` (all non-unique) | **BLOCKER** | Unique constraints are the only correct fix, and §6.38 (no transaction seam) means application code cannot substitute for one. Add them in `server/policies.local.sql` beside the existing comment-policy addendum — it is already the sanctioned place for an app-level DDL bridge, already re-runnable, and already labelled as dying when upstream lands: `unique (owner_id, day)` on `dsx_checkin`/`dsx_spin`/`dsx_adview`, `unique (owner_id, day, task)` on `dsx_taskclaim`, `unique (owner_id, episode)` on `dsx_unlock`, `unique (intent)` on `dsx_order`. Then file the upstream ask: `<index unique="true">`. |
| S3 | **Notice read-state does not exist.** The server comment says read-state is "the CLIENT's memory (a lastSeen timestamp)". No such timestamp is written anywhere in the app. So no notice is ever read, and M7's permanent dot has nothing it could ever bind to. | claim `server/social.dsx:23`; the inbox `Components/Notices.dsx` (no write of any kind) | MAJOR | Either a `lastSeen` on a `profile` entity (one write per visit, cheap) or accept per-viewer receipts. Pick one and make the TabBar dot read it. |
| S4 | **Notice audience segments are stored and never applied.** The operator picks All / VIP / Lapsed; the route is `auth="none"` and returns every row to every caller; the inbox never filters. A notice composed for "VIP" is published to the world. | stored `server/admin.dsx:121`, `Components/Admin.dsx:104`; returned unfiltered `server/social.dsx:26-31`, route `server/social.dsx:66`; unfiltered inbox `Components/Notices.dsx:105` | MAJOR | Move `listNotices` to `auth="required"`, read the caller's wallet for `vip`, and filter `segment` server-side. The client comment at `server/social.dsx:22-23` proposes client-side filtering — that is not a segment, it is a suggestion. |
| S5 | **`walletState` computes `unlockedCapped` and no screen reads it.** The 100-row ceiling on the unlock list is detected and then thrown away, so a viewer past 100 unlocks silently sees paid episodes re-lock with no explanation. | computed `server/wallet.dsx:48`; consumers: none (grep across `Components/`) | MAJOR | Either render it (a banner on Show/Watch: "showing your 100 most recent unlocks") or replace it with real paging (see G3). Detecting a truncation and discarding the flag is worse than not detecting it. |
| S6 | **Watch progress is saved only on an episode change, and the swipe path saves the wrong episode.** `saveNow` has exactly two call sites. Closing the app mid-episode persists nothing, so Continue Watching's resume bar is only ever accurate for episodes the viewer navigated away from. Worse: `rest` fires from the pager's `on:change`, i.e. **after** `page` has already moved, so `epId` and `cur` already name the *incoming* episode while `time` is mid-transition — the outgoing episode's position is never recorded and the incoming one gets an arbitrary value. `go` calls it before the change and is correct. | action `Components/Watch.dsx:383-386`; correct call `:400`; suspect call `:411-417` bound at `:659` | MAJOR | (a) Capture the outgoing episode explicitly in `rest` (mirror `page`/`epId` into a `prev*` variable before the pager writes, or move the save into `on:change`'s predecessor). **Probe this on a running origin before changing it** — AGENTS.md's rule; the reading above is from source. (b) Add a periodic save: a `<watch>` on `dsx.variable.time` that posts every ~15 s of playback, and a save on `goBack`. |
| S7 | **The client's optimistic favourite override is never reconciled.** `favTouched` wins over the server payload for the life of the mount, so a POST that succeeded locally and later disagreed with a refetch keeps showing the local answer. | `Components/Watch.dsx:72`, `:259-263`; `Components/Show.dsx:29`, `:67-71` | MINOR | Clear `favTouched` in the `favs` block's `on:success`, so the server's answer resumes authority the moment it lands. |
| S8 | **The spend and rate planes have no durable store configured in the hosted lane.** `createHost` is passed `spend: spendBudgets` and no spend store; `RateLimitSeam.store` is never filled. The framework is explicit that an in-memory counter on an isolate fleet is "a FALSE STATEMENT in the security posture". | `scripts/serve.mjs:167-172`; the framework's warning `OpenSource/Web/packages/server/src/ratelimit.ts:5-13` | MAJOR | Locally this is fine (one process). For Cloudflare, the counters must ride the Postgres store — the migration already emits `dsx_rate_counter` (`server/generated/migration.sql:332`) and `dsx_event`. Verify what `despia deploy cloudflare` wires and document it; a ceiling that resets per isolate is not a ceiling. |

**Local-origin-only — allowed, and correctly labelled**

| Item | file:line | Verdict |
|---|---|---|
| The whole `/internal/admin/*` ops plane (hand-written handlers, `reach: []`, host-gated) | `scripts/serve.mjs:64-165` | **Allowed** — the sanctioned bridge for §6.7 (no service authority for declared actions), loudly documented at `scripts/serve.mjs:24-33`. But see A4: it never reaches production, and the app depends on it. |
| Reading `inputs=` back out of the `.dsx` source at boot to repair the MCP tool schemas | `scripts/serve.mjs:184-194` | **Allowed** — the §6.15b bridge, one source of truth, dies when the row carries `inputs`. |
| Re-reading `dist/registry.json` on mtime change and logging it | `scripts/serve.mjs:199-232` | **Allowed** — the §6.39 mitigation, and the right one. |
| Refusing to serve `dsx-sw.js` under `DSX_DEV_NO_SW=1` | `scripts/serve.mjs:277-281` | **Allowed** — §6.13a's standing rule. |
| UA-sniffing `*.svg` → `*.png` for non-`Mozilla` clients, `readFileSync` per request, `cache-control: no-store` | `scripts/serve.mjs:288-310` | **Allowed locally**, but the production plan ("a one-line CDN rule") exists only in a code comment. See H12. |
| `global.*` caches and `global.recentSearches` dying on reload | `Components/parts/SearchOverlay.dsx:80-92` and every `cache*` key | **Allowed** — §6.33 (no cross-platform KV) is filed and the reasoning against a web-only `localStorage` fork is correct. Consequence to accept: on native, Continue Watching is empty on every cold launch until the fetch lands. |

### 2.3 · Hardcoded values a deployment must change

| # | Item | file:line | Sev | Production needs |
|---|---|---|---|---|
| H1 | **`App.json` `host` is a placeholder origin.** Correct and deliberate (a device cannot reach `localhost`, and §6.45 means the export ships no assets) — and there is no gate that catches shipping it. | `App.json:4`, note `:2` | MAJOR | A `preflight`/`verify` assertion that refuses to export a native lane while `host` contains `example.com`. The check is three lines and the failure mode is a native build that renders nothing. |
| H2 | **Three copies of the price table, with drifting ids and a contradictory "best" flag.** `storeCatalog` serves `vip_weekly`/`coins_500`; `createCheckout` inlines the same table again to price the charge; `rewardsState` serves a **third** copy with ids `weekly`/`p500` that no `createCheckout` sku matches. The store says *yearly* is best; rewards says *monthly*. | `server/store.dsx:32-46`, `:58-70`; `server/engage.dsx:65-77` | **BLOCKER** | The `rewardsState` copy is unreachable dead weight — no component reads `vipTiers` or `coinPacks` (grep). Delete it. Then collapse the remaining two: `createCheckout` should read the same declared table `storeCatalog` returns. The inlining comment (`server/store.dsx:53-57`) justifies avoiding a *cross-action hop* — a shared `<variable>` or a constant in the same document head is not a hop. As it stands the display price and the charged price are two literals that can diverge silently. |
| H3 | **Prices are pre-formatted USD strings with no currency field, and `currency=usd` is hardcoded in the Stripe call.** | `server/store.dsx:34-44` (`price: '$11.99'`), `:86` | MAJOR | A `currency` field on every row and a locale-aware formatter on the client, or Stripe Price objects looked up by id (which also removes the drift in H2). A template that cannot sell outside the US is not a template. |
| H4 | **`BULK_OFF = 20` is declared twice** — once in the quote, once in the charge. The quote and the charge are the two things that must never disagree, and this is exactly how they will. | `server/wallet.dsx:59` and `server/wallet.dsx:108` | MAJOR | One constant in the document head, read by both. |
| H5 | **The rewards economy is declared twice each.** Check-in curve `[5,10,15,20,25,30,60]` at `:43` and `:100`; spin prizes at `:81` and `:117`; `AD_CAP`/`AD_REWARD` named at `:60-61` and then written as bare `10`/`15` literals in the grant at `:169-170`; task rewards `{watch3:15, firstFavorite:10}` at `:132` against the same numbers at `:85-86`. | `server/engage.dsx` as cited | MAJOR | Hoist to the document head. The file's own header claims these are "server facts an admin surface can render, never client constants" — they are server facts written down twice, which is the same failure one layer down. |
| H6 | **Episode defaults are written four times in two languages.** `free_until: 8`, `duration: 75`, `price: 60` in the declared action; the identical three in the internal twin; `freeUntil: 3`/`price: 60` again in the Manage screen's create calls; and `60 coins` again in a button label. | `server/admin.dsx:68`, `:92-93`; `scripts/serve.mjs:100`, `:123-124`; `Components/Admin.dsx:79`, `:85`, `:239` | MAJOR | `scripts/verify.mjs:9-11` records that this exact divergence already shipped once (two columns dropped in the twin, every show reporting 0 views). Defaults belong in one table the twin imports. |
| H7 | **The rewarded-ad watch requirement is a client constant and is never verified server-side.** The client decides 15 seconds elapsed and then asks for a coin; `grantAdReward` grants on that word alone. | requirement `Components/parts/AdGate.dsx:109`, `:115`; grant `server/engage.dsx:161-178` | MAJOR | The server comment (`server/engage.dsx:155-160`) names the right answer — an SSV callback — and calls it future work. Until then the daily cap (10) is the only real defence, which is stated honestly; but the reward value and the duration should at least be server facts the client renders (`adReward` already is; the 15 s is not). |
| H8 | **The 30-episode range page is hardcoded in two places that must agree.** The pill builder pages by 30; the tap handler divides by 30 to recover the index. | `Components/Watch.dsx:288-298` and `:962` | MINOR | One constant. |
| H9 | **The breakpoint vocabulary is copy-pasted into twelve files.** `bp`, `wide`, `gutter`, `shell` (and often `railShell`) are re-derived identically in App, Show, Store, Profile, MyList, Rewards, Vip, Browse, Notices, Admin, SearchOverlay, Discover — plus `panel` at 1120 in Watch. | `Components/App.dsx:41-98`, `Components/Show.dsx:87-151`, `Components/Store.dsx:53-74`, `Components/Profile.dsx:79-94`, `Components/MyList.dsx:51-79`, `Components/Rewards.dsx:62-77`, `Components/Vip.dsx:55-78`, `Components/Browse.dsx:67-87`, `Components/Notices.dsx:18-33`, `Components/Admin.dsx:48-63`, `Components/parts/SearchOverlay.dsx:28-57`, `Components/Discover.dsx:36-49`, `Components/Watch.dsx:117-133` | MAJOR | AGENTS.md says "responsive is one vocabulary per screen" — it is one vocabulary, thirteen times. Changing a breakpoint or a gutter is a thirteen-file edit an adopter will get wrong. Extract to `<formula>`s in a shared file component, or accept the duplication and add a gate that asserts the thirteen copies are byte-identical. |
| H10 | **The brand accent `#FF2C55` is a raw literal in twelve files** and the review gate waives it 70 times rather than tokenising it. Same for the gold `#F6B63D`/`#F7C948` pair and the surface `#141419`. | every component; waivers enumerated by `npm run review` | MAJOR | §6.16 is filed (review R4 needs a brand-palette valve) and that is the right upstream ask — but the *template-side* problem is that an adopter re-skinning this app edits 70 sites. A `<style>` token layer or `dsx.global.strings`-style palette variable would make the re-skin a one-file change, which is the whole promise of a template. |
| H11 | **Local-lane addresses baked into scripts.** `BASE = http://localhost:8787` in the seeder and the demo-state generator; `CDN = "/media"`; `PORT ?? 8787`. | `scripts/seed.mjs:17`, `:32`; `scripts/gen-demo-state.mjs:15`; `scripts/serve.mjs:45` | MINOR | All three already read an env override. Fine as-is; call out in README that `BASE` is how you seed a hosted deployment — except that today you cannot (see A4). |
| H12 | **The art format negotiation exists only in the dev origin, and its production replacement is a sentence in a comment.** Native clients need PNG (ImageIO cannot decode SVG); every payload carries `.svg`. | `scripts/serve.mjs:288-310` | MAJOR | Ship the CDN rule as an artefact — a `_redirects`/Worker rule in the emitted Cloudflare lane, or a `wrangler` snippet in README — not as prose inside a dev script. Without it, every native production build shows blank posters and the failure is silent. |
| H13 | **The scheme `shortdrama` is the component namespace, the deep-link scheme and the prefix of all thirteen route component names.** Renaming the app is a coordinated edit across `dsx.json`, `App.json` and every `dsx.config.json` route. | `dsx.json:3`; `App.json:8`; `dsx.config.json` routes `:8,17,26,…` | MINOR | Document the rename as a checklist in README, or provide `scripts/rename.mjs`. An adopter will hit this in the first ten minutes. |

### 2.4 · Dev-only seams on the production path

| # | Item | file:line | Sev | What the production shape must be |
|---|---|---|---|---|
| A1 | **`/dev-session.json` IS the authentication mechanism, in nine screens.** Every authenticated call reads a bearer token out of a static JSON file fetched from the origin. In a real deployment that file does not exist → `session.data` is null → `authHeaders` returns `{}` → every wallet, rewards, viewer and store call goes out unauthenticated. Worse, `signedOut` is defined as `session.error != null` (`Profile.dsx:39`, `Rewards.dsx:54`, `MyList.dsx:34`), so the app's own "not signed in" state is *the 404 on that file* — and there is no sign-in affordance anywhere to resolve it. The three "signed out" cards offer a **"Reload session"** button that re-fetches the missing file. | `Components/App.dsx:22`, `Components/Watch.dsx:30`, `Components/Show.dsx:20`, `Components/Store.dsx:21`, `Components/Vip.dsx:16`, `Components/Profile.dsx:15`, `Components/Rewards.dsx:24`, `Components/MyList.dsx:7`, `Components/Admin.dsx:11` | **BLOCKER** | `docs/auth.md` is excellent and states the contract correctly — the gap is that **no code implements it**. The production shape, precisely: **(i)** one `<AuthSeam>` file component owning the session, replacing nine copies of the `session` block and nine copies of `authHeaders`; **(ii)** it fetches the adopter's session endpoint (same JSON shape) or reads the IdP SDK's token; **(iii)** the IdP must mint **HS256 signed with `DSX_JWT_SECRET`**, `sub` a **UUID** (owner RLS stores `owner_id uuid` — a non-UUID subject fails every owned read), plus `iat`/`exp`; RS256/JWKS needs either Supabase's project-JWT-secret mode, a ~30-line token-exchange endpoint, or the filed upstream ask; **(iv)** a real signed-out state with a **sign-in** control, distinct from a network error; **(v)** a sign-out action that nulls `cacheWallet`, `cacheFavs`, `cacheContinue`, `cacheLedger`, `cacheRewards` in the same breath as the token (`docs/auth.md:52-62` specifies this and notes there is nothing to wire it to yet — A3 is that nothing). |
| A2 | **The operator `service_role` JWT is served to the browser and written into the deploy artefact.** `Components/Admin.dsx` reads `session.data.operator.token` from the same public file; `scripts/dev-session.mjs` writes that file to **both** `public/` and `dist/`. `dist/` is the deploy output. `npm run session && npm run deploy` publishes a full-write service-role token at a guessable URL. `.gitignore` covers `public/dev-session.json` — it does not govern the deploy artefact. | read `Components/Admin.dsx:32-35`; written `scripts/dev-session.mjs:39-41`; the prose warning that nothing enforces `docs/auth.md:48-50` | **BLOCKER** | Stop writing to `dist/`. Then: the operator token must never transit the client — the Manage surface authenticates the operator through the same IdP as everyone else and the `service_role` claim comes from the IdP, per `docs/auth.md:70-73`. Add a `preflight`/`verify` assertion that fails if `dist/dev-session.json` exists. |
| A3 | **There is no sign-in, no sign-out, and no account deletion.** Zero occurrences of any of them across `Components/`. | grep: `Components/**` | **BLOCKER** | Sign-in and sign-out fall out of A1. Account deletion is an independent store requirement (App Store 5.1.1(v)) and needs a declared action that deletes the caller's `wallet`, `ledger`, `unlock`, `progress`, `favorite`, `checkin`, `spin`, `taskclaim`, `adview` and `comment` rows — all `ownership="owner"` except `comment`, whose owner-write policy already exists at `server/policies.local.sql:34-36`. |
| A4 | **The Manage surface and the seeder only exist against `node scripts/serve.mjs`.** Both talk exclusively to `/internal/admin/*`, which is hand-written in the dev origin. `despia deploy cloudflare` emits the **declared** routes; the ops twins do not travel. So on any hosted deployment `/admin` renders and every call fails — and the failure card blames authority (*"These routes require operator authority"*), which is a misdiagnosis that will cost an adopter an afternoon. `scripts/seed.mjs` cannot seed a hosted deployment for the same reason. | consumers `Components/Admin.dsx:12-18`, `scripts/seed.mjs:34,57,63,78,93,98`; the only implementation `scripts/serve.mjs:64-165`; deploy lane `README.md:133-141` | **BLOCKER** | Point the Manage screen at the **declared** `/admin/*` routes (`server/admin.dsx:127-133`), which do deploy — accepting that their writes are refused by RLS until §6.7 lands, and **saying so in the UI** rather than in a 404. Then the local twins become a dev accelerator rather than the only implementation. At minimum: detect the absence and name it (`"the internal ops twins are a local-origin feature — this deployment serves the declared routes"`). |
| A5 | **The MCP face is reached by file path into `node_modules`** because the package exports no `./mcp-face`. Correct as a loud local bridge (§6.15c), but the Cloudflare lane has no equivalent, so "manage your app from ChatGPT" is a local-only claim while `Components/Admin.dsx:258` presents it as a property of "this deployment". | `scripts/serve.mjs:31-33`, `:195-198`; the claim `Components/Admin.dsx:256-260` | MAJOR | Say which lane serves `/mcp`. The honesty is already the template's habit; this one line is out of step with it. |

### 2.5 · Missing production concerns

**Authorization** — the most serious findings in the audit are here.

| # | Item | file:line | Sev | Production needs |
|---|---|---|---|---|
| G1 | **The paywall does not protect the media.** `showDetail` returns `video_url` for **every** episode, free and paid alike, on an `auth="none"` route. The client hides the locked ones; the URLs are in the JSON payload and in the SSR HTML. `curl /catalog/show/:id \| jq '.episodes[].video'` returns every paid episode's URL, and `public/media/*.mp4` is served with no auth. Entitlement is enforced in markup. | leak `server/catalog.dsx:183`, route `server/catalog.dsx:248`; the client-side gate `Components/Watch.dsx:685-686` | **BLOCKER** | Omit `video` from the payload for episodes the caller is not entitled to, and serve the URL from an **authenticated, per-episode, short-lived** endpoint (`GET /wallet/play/:episode`, `auth="required"`, re-checking free/VIP/unlock exactly as `unlockEpisode` does) that returns a signed CDN URL. The trust-shape claim in `README.md:155-164` — *"the player mounts a source only for entitled episodes"* — is true of the player and false of the API. |
| G2 | **Any signed-in viewer can read the whole catalogue including drafts through the admin routes.** `show` is `public-read`, whose SELECT policy is `using (true)`; `adminStats` and `adminListShows` are reads, so a plain viewer token passes both the route's `auth="required"` and RLS. Public reads filter `state: 'live'` in **application code**, not in a policy — so the admin reads bypass the filter and return unpublished titles, their artwork and their free-episode windows. The same holds over `/mcp`. | policy `server/generated/migration.sql:250-251`; the reads `server/admin.dsx:26-41`, `:43-56`; routes `server/admin.dsx:127-128`; tools `server/admin.dsx:135-136` | **BLOCKER** | The declared-grammar answer does not exist yet (§6.2 / §6.7 — no `auth="role:…"`). The bridge that does: move these two reads behind the internal route plane the writes already use, or add an explicit role check in the action body reading the verified claim. Either way, embargoed content must not be one authenticated request away. |
| G3 | **No pagination anywhere. Every read is `limit: 100` with no cursor, and the ceiling is silent.** A deployment with more than 100 live shows loses everything past the 100th from Home, Browse, Discover, Search and the Manage table. A series past 100 episodes cannot be listed, quoted or bulk-unlocked — `unlockSeries` explicitly "sells what this page can see". For a category whose shows run 60–100 episodes and whose catalogues run into the thousands, this is a hard product ceiling. | `server/catalog.dsx:40,51,91,129,148,154,179,202,204,222,236`; `server/wallet.dsx:43,62,68,114,126,216`; `server/viewer.dsx:32,50,73`; `server/social.dsx:26,36,48`; `server/admin.dsx:27-29,44,49`; the admission `server/wallet.dsx:112-113` | **BLOCKER** | §6.20 is filed and correct, and the template has done the honest half (per-parent bounded reads, the `capped` flags). The missing half is a **cursor the template implements itself**: `list({ filters: { …, idx: { gt: cursor } } })` if the filter grammar supports comparison, or keyset paging by `created_at`. Plus "Load more" on Browse, ranged fetching in the player drawer (the range pills already exist and already promise it), and paging on the Manage table. Where a total is genuinely unknowable, render "100+" — which `Components/Admin.dsx:70` already does and no other screen does. |
| G4 | **No rate limiting at all, on any route.** The grammar exists and is supported: `RouteRow.rate` is parsed once at host construction, `rate_limited` is a declared host error, and the migration already emits `dsx_rate_counter`. The template declares zero limits. Concrete exposures: `/store/checkout` (each call creates a Stripe PaymentIntent — 25,000 of them exhausts the day's Stripe egress ceiling and takes payments down for **every** customer); `/catalog/search` (`auth="none"`, 1 + N reads up to 25 per call — the cheapest way to burn the `data:reads` ceiling); `/social/comment` (spam). | absent from all 32 routes in `server/*.dsx`; the grammar `OpenSource/Web/packages/server/src/host.ts:72,366`; the counter table `server/generated/migration.sql:332`; documented spelling `<route rate="600/m">` | **BLOCKER** | Declare limits on the money and write paths at minimum: checkout, settle, unlock, unlockseries, comment, and the four rewards grants. Then confirm S8 — an undeclared store makes a declared limit a false statement. |
| G5 | **No Stripe idempotency key, and `settleOrder` is a read-then-write race.** `createCheckout` POSTs without an `Idempotency-Key`, so a retried checkout creates a second PaymentIntent. `settleOrder` checks `status === 'paid'` and then writes — two concurrent settles both pass and both grant. Nothing verifies the confirmed amount matches the order's `amount_cents`. | `server/store.dsx:88-95`, `:118-135`, `:150-151` | **BLOCKER** | An `Idempotency-Key` header keyed on the order id. `unique (intent)` on `dsx_order` (S2) plus a conditional update as the settle lock. And assert `res.data.amount === row.data.amount_cents` before granting. The screen-level recovery card (`Components/Store.dsx:232-237`) is well designed and correct — it just retries into a racy settle. |

**States, retries, and the shape of failure**

| # | Item | file:line | Sev | Production needs |
|---|---|---|---|---|
| G6 | **`wallet.error` is read on exactly one screen.** Six screens fetch `/wallet/state`; only Profile distinguishes a failed read from a pending one. On the other five a failed wallet read is indistinguishable from "you own nothing": Watch locks the entire series with no message (`wallet.data == null → epLocked true`), Show shows a padlock on every paid episode, Store's balance pill silently vanishes, Vip shows an em dash forever, Rewards shows a null balance. §6.30's law is implemented for content and not for money. | the one correct instance `Components/Profile.dsx:44-50`; the five gaps `Components/Watch.dsx:31,247-254`, `Components/Show.dsx:21,159-163`, `Components/Store.dsx:23,220`, `Components/Vip.dsx:17,155`, `Components/Rewards.dsx:26,78-81` | **BLOCKER** | Profile's `walletFailed` computed is the model — port it to all five, with a retry. A screen about money that cannot tell "we could not ask" from "you have none" will produce support tickets and refunds. |
| G7 | **The Continue Watching rail has no error and no empty state.** `continue.error` is read nowhere in App.dsx; the rail is gated on `items.length > 0`, so a failed fetch and an empty list both render as the section not existing. | `Components/App.dsx:23-24`, gate `:491` | MAJOR | MyList handles this correctly (`Components/MyList.dsx:40-48`) — port `listFailed`/`listLoading` to Home. |
| G8 | **`Show.dsx`'s lock formula ignores VIP.** Watch's twin checks `wallet.data.vip == true`; Show's does not. A paying VIP member sees a padlock on every paid episode on the series page. | `Components/Show.dsx:159-163` vs the correct twin `Components/Watch.dsx:332-337` | MAJOR | Add the VIP branch. Two formulas that must agree and do not is exactly the class of bug `scripts/verify.mjs` exists for — add an assertion. |
| G9 | **A failed search is presented as "no results".** `runSearch` sets `results = []` on failure and the status line then reads *"Nothing matches that yet — try a genre like Romance or Revenge."* There is no error state and no error state for the Hot Movie list either. | `Components/parts/SearchOverlay.dsx:68-75`, `:41-46`; the ungated grid `:184` | MAJOR | A third state and a retry. Telling a viewer their query matched nothing when the server was down is a lie the app tells about its own catalogue. |
| G10 | **`Show.dsx` renders `0` coins while the wallet is loading**, breaking the rule Profile and PersonalNav both state explicitly ("render an em dash, never a fake 0 — a '0' on a screen about money is a claim, and while loading it is a false one"). | `Components/Show.dsx:394`; the rule `Components/Profile.dsx:10-11`, `Components/parts/PersonalNav.dsx:18` | MINOR | Em dash. |
| G11 | **`PersonalNav` is mounted with no data on My List**, so the sidebar permanently reads "Signed out" with em dashes for a viewer who is signed in with coins, right beside the content that proves otherwise. | `Components/MyList.dsx:129` vs the correct mount `Components/Profile.dsx:188-190` | MAJOR | Pass `uid`/`coins`/`bonus`/`vip`. My List does not fetch the wallet today; either add the block or accept the sidebar rendering a genuinely unknown state rather than a wrong one. |
| G12 | **No offline state anywhere.** `despia build` emits a precaching service worker (the dev origin disables it deliberately), so a production build has a cache and no screen ever says "you are offline" — every failure reads as a server error. | absent across `Components/`; the SW `scripts/serve.mjs:272-281` | MAJOR | Ask the capability plane and render an offline branch on the error cards. On native, the demo-seed machinery (M4) is a first-frame story that could become an honest offline story if it were fed by the real cache rather than a capture. |
| G13 | **No analytics events of any kind.** Zero occurrences. The template's entire thesis is a monetization funnel — hero → detail → free episodes → paywall → coins/VIP — and there is no way to observe a single step of it. | grep: `Components/**`, `server/**` | MAJOR | The events a drama app cannot ship without: `episode_start`, `episode_complete`, `paywall_view`, `unlock_attempt`/`unlock_success` (with the price), `checkout_start`/`purchase_success` (with the sku and cents), `checkin`, `ad_complete`, `signup`. Server-side for the money events (they are already the server's word); client-side for the view events. |
| G14 | **Push notifications are a string in a database row.** `kind: 'push'` is stored and nothing sends anything. `dsx.config.json` lists only `stripe` and `share` modules — no OneSignal. No permission prompt, no token registration, no notification deep-link handler. The Manage screen tells the operator "OneSignal delivers it in the hosted lane". | claim `Components/Admin.dsx:105`; stored `server/admin.dsx:121`; modules `dsx.config.json:174-177` | **BLOCKER** (as a claim) | Either wire it (module, permission prompt, token entity, a send on notice creation, a deep-link route) or change the copy to say the notice lands in the in-app inbox and nothing else — which is what `README.md:145-147` correctly says and the Manage screen contradicts. |
| G15 | **The UGC surface has no moderation and no reporting.** No profanity filter, no report action, no block, no delete-own-comment, no operator moderation queue, no published contact. Reads are `auth="none"`. The only validation is trim + 500 characters. | `server/social.dsx:53-62`, route `:65`; the composer `Components/Watch.dsx:1275-1281` | **BLOCKER** | App Store 1.2 requires all four: a filter, a report mechanism, a block mechanism, and published contact info. The owner-write policy needed for delete-own already exists (`server/policies.local.sql:34-36`); the report/block entities do not. |
| G16 | **Client-side input validation is absent everywhere.** The comment field has no maxlength and no counter, so 800 characters produce a server rejection after the fact. The Manage forms validate only that a title is non-empty: the video URL accepts any string and is stored straight into `<video src>` with no scheme allowlist; `Number(epIdx)` turns a typo into `NaN` which the twin silently floors to episode 1, overwriting EP 1. No server-side length caps on show title, synopsis or tags. | `Components/Watch.dsx:1277`; `Components/Admin.dsx:224-225`, `:238`, `:245-246`, `:85`; server `server/admin.dsx:58-73`, twin `scripts/serve.mjs:94-134`, index fallback `scripts/serve.mjs:118` | MAJOR | Length caps and a live counter on the comment field; an `https:` scheme allowlist and a length cap on the video URL; reject a non-finite episode index instead of defaulting it; server-side length caps on every text column. |
| G17 | **Accessibility gaps the review gate does not model.** (a) `★`/`☆` used as a tap-target icon — a font-dependent glyph with no per-platform twin, which is the thing AGENTS.md forbids; `check:styles` only inspects `icon=` so it passes. (b) Sub-44 pt tap targets on `<text on:tap>` controls: the Manage row's `+ EP` and state chip (~6–9 pt padding), the player's range pills (bare text, no padding), the Browse chips (~33 pt tall) — §6.54 names this class and only the back chevrons were fixed. (c) The 7-day check-in cells carry colour state and no per-cell `a11yLabel`, so a screen reader hears "+5 D1" with no indication of done/next/future. (d) No `prefers-reduced-motion` handling anywhere, despite a 1890° wheel spin, scale transitions on every card and spring transforms in the player — the Rewards comment *claims* a reduced-motion viewer is served and nothing implements it. (e) Caption colours at `rgba(255,255,255,0.45)` on `#141419` compute to roughly 4.0:1, under the 4.5:1 floor, and `review.mjs` checks tap targets, type scale and palette — not contrast. | (a) `Components/Admin.dsx:211`; (b) `Components/Admin.dsx:212-216`, `Components/Watch.dsx:960-962`, `Components/Browse.dsx:188-201`; (c) `Components/Rewards.dsx:307-313`; (d) claim `Components/Rewards.dsx:147-149`, motion `Components/Rewards.dsx:103`, `Components/App.dsx:169`, `Components/Watch.dsx:888`; (e) `Components/Profile.dsx:157`, `Components/MyList.dsx:103`, `Components/Notices.dsx:71`, `Components/parts/TabBar.dsx:13` | MAJOR | (a) a catalog icon (`star`/`star.fill`, both mapped). (b) padding to 44 pt, per §6.54's own remedy. (c) a computed `a11yLabel` per cell. (d) a reduced-motion capability read gating the wheel, the lifts and the springs. (e) raise the caption alpha to ~0.62 and add a contrast rule to `review.mjs` — the template ships its own gate, so this is a template fix, not an upstream ask. |
| G18 | **Not one user-facing string is translatable.** Roughly 180+ literals in markup, plus four hand-rolled English number formatters (`… + 'M'`), ISO date slicing as a date format, and pre-formatted `$` price strings from the server. | formatters `Components/App.dsx:136-141`, `Components/Show.dsx:118-124`, `Components/Watch.dsx:209-214`, `Components/Browse.dsx:119-123`; dates `Components/Profile.dsx:63`, `Components/Notices.dsx:46`; prices `server/store.dsx:34-44` | MAJOR | This is the **best-documented gap in the repo** — `Components/Profile.dsx:333-350` and `README.md:236-256` both state the seam (`dsx.global.strings.*`), why the picker is absent, and what an adopter must do. It is correctly *named*; it is not *done*. For a template meant to be forked worldwide, "the localisation story is a paragraph" is a MAJOR gap even though the honesty is exemplary. Landing it also solves H10 and M12: one strings table, one palette, one brand. |
| G19 | **`verify.mjs` never exercises an authenticated path.** The behavioural gate proves the public catalogue, SSR, art negotiation, and that money routes refuse an anonymous caller — and stops there. Nothing tests a successful unlock, a double unlock, an insufficient balance, VIP bypass, the ad cap, the check-in streak, the bulk quote matching the bulk charge, or a settle replay. | `scripts/verify.mjs:74-192` | MAJOR | Mint a viewer token in-process (the minting logic is 8 lines, `scripts/dev-session.mjs:24-31`) and assert the money invariants. Every blocker in §2.5 that is a *behaviour* — G1, G5, G8, S2 — is one assertion away from being caught, which is the argument the file's own header makes. |

### 2.6 · The four spend ceilings

`npm run build` reports *"4 spend ceiling(s)"*. **None of them is authored by this template.**
They are the framework's guarded-default profile: the spend plane is default-on, and the
`<budget>` grammar exists and is unused here. The emitted table:

| # | Budget | Window | Max | Where it comes from | Correct for production? |
|---|---|---|---|---|---|
| 1 | `data:reads` | day | 2,500,000 | framework default | **No — this is the first ceiling a real deployment trips, and it will trip early.** The 100-row cap with no `count` op forces an N+1 read on every catalogue query: `homeShelves` is 1 + N (one episode list per show), `browseCatalog` is 1 + N, `discoverFeed` is 1 + N, `searchShows` is 1 + N (up to 25), and `continueWatching` is up to 1 + 3N (a show get, an episode get and an episode list per progress row, up to 12) — roughly **37 reads for one Continue Watching call**. One Home load is therefore ~50 reads at the demo's 14 shows and ~140 at a 100-show catalogue. That puts the ceiling at roughly 18,000–50,000 home loads per day. A drama app at that traffic is *just getting started*, and when the ceiling trips the whole catalogue refuses. |
| 2 | `data:writes` | day | 500,000 | framework default | **Probably fine, with one caveat.** Writes are progress saves, unlocks, ledger rows and rewards. The caveat is `unlockSeries`, which is 3N writes for one basket by design (§6.38: no transaction seam) — a 100-episode bulk unlock is 300 writes. Fine at this scale; worth stating. |
| 3 | `egress:api.stripe.com` | day | 25,000 | derived from `<egress host="api.stripe.com"/>` at `server/store.dsx:15` | **Correct as a number, unsafe as configured.** Two Stripe calls per completed purchase means ~12,500 purchases/day — comfortable. But `createCheckout` fires a PaymentIntent creation on **every buy tap**, abandoned or not, and there is no rate limit (G4). One authenticated viewer can burn the day's Stripe budget in minutes and take payments down for every customer. The ceiling is correct; the missing per-caller limit under it is the defect. |
| 4 | `requests` | day | 250,000 | framework default | **Understated relative to the app's own shape.** A single cold Home load is 3 HTTP requests (`/catalog/home`, `/dev-session.json`, `/viewer/continue`) plus assets; the player adds 4 more; every screen refetches on mount because `<api cache>` dies with the mount (§6.30). 250,000 requests is on the order of 25,000–40,000 sessions. It will trip alongside #1. |

**What production needs, concretely:**

1. **Declare the budgets explicitly** rather than inheriting defaults, so the numbers are visible
   in `server/*.dsx` and the deploy receipt: `<budget of="data:reads" per="day" max="…"/>` and
   siblings, sized to the adopter's plan. A number nobody chose is a number nobody will
   understand when it trips.
2. **Fix the read amplification first** — the ceiling is only alarming because of the N+1.
   Denormalise `episode_count` onto `show` (written by the admin upsert, which already touches
   both) and `homeShelves`, `browseCatalog`, `discoverFeed` and `searchShows` all collapse from
   1 + N to 1. That is a ~14× reduction on the hot path and it also removes the §6.20 workaround
   from four actions.
3. **No screen distinguishes a spend refusal from any other failure.** The host answers
   `spend_capped` with `x-dsx-spend-budget` headers; every error card in the app renders "The
   catalogue is unavailable." An operator will not know their deployment hit a ceiling — they
   will think their database is down. Surface the reason.
4. **Confirm the durable spend store in the hosted lane** (S8). A ceiling counted per isolate is
   not a ceiling.

---

## 3 · Blocker roll-up

Twelve blockers, grouped by what they break.

| | Blocker | Anchor |
|---|---|---|
| 1 | Paid episode URLs are served to anonymous callers — the paywall protects the player, not the media | G1 · `server/catalog.dsx:183` |
| 2 | The auth seam is a static JSON file; nine screens depend on it; there is no sign-in | A1 · `Components/App.dsx:22` +8 |
| 3 | A `service_role` token is served to the browser and written into `dist/` | A2 · `scripts/dev-session.mjs:39-41` |
| 4 | Draft/embargoed catalogue readable by any signed-in viewer via the admin reads | G2 · `server/admin.dsx:26-56` |
| 5 | Bonus coins are promised to expire and never do — *closed 2026-09-01 by deleting the capability, not by building the sweeper this audit recommended* | S1 · `server/wallet.dsx:22` + `server/engage.dsx:108` |
| 6 | Every daily/once-only guard is a TOCTOU race — no unique constraints exist | S2 · `server/generated/migration.sql:37,54,105,188,211,298` |
| 7 | No Stripe idempotency key; `settleOrder` can grant twice; the amount is never verified | G5 · `server/store.dsx:88,118-135` |
| 8 | No rate limiting on any route, including checkout — a supported grammar, undeclared | G4 · all 32 routes |
| 9 | No pagination past 100 rows — a hard product ceiling on catalogue and episode count | G3 · `server/catalog.dsx:40` +25 |
| 10 | VIP sells three features that do not exist, as an "auto-renewing" plan that is a one-off charge, with no Restore Purchases | M-VIP · `Components/Vip.dsx:25-27`, `server/store.dsx:35-36`, `Components/parts/PlansSheet.dsx:196` |
| 11 | UGC has no author identity and no moderation; no sign-out, no account deletion; no privacy/terms/support links anywhere | M1 + G15 + A3 · `server/social.dsx:58` |
| 12 | The Manage surface and the seeder only work against the local dev origin | A4 · `Components/Admin.dsx:12-18` |

**Two blockers deserve their own paragraph because they are single-sentence product lies.**

*The VIP paywall.* `Components/Vip.dsx:25-27` sells **"1080p high quality"** (the player's own
options sheet says *"Adaptive — one rendition in this build"* at `Components/Watch.dsx:1180`, and
§6.36 records that `<video>` can select neither a rendition nor a track), **"Offline downloads"**
(no download exists anywhere in the app — the player's Download rail item at
`Components/Watch.dsx:756` routes to `/vip`, i.e. it sells the feature it is pretending to be),
and **"No ads"** (`<AdGate>` is mounted unconditionally at `Components/Rewards.dsx:322` with no
VIP branch). `Components/parts/PlansSheet.dsx:196` reprints "1080p, no ads" on every tier card.
Separately, `server/store.dsx:35-36` and `server/engage.dsx:67-68` label the plans **"Auto-renew.
Cancel anytime."** while `createCheckout` creates a plain one-off PaymentIntent and `settleOrder`
stamps a fixed `vip_until` — there is no subscription object, no renewal, no cancel path and no
Restore Purchases (an App Store 3.1.1 requirement). Three of those four claims are also on the
one screen whose stated job is trust (`Components/Vip.dsx:5-8`). Every one is either a feature to
build or a line to delete, and deleting is legitimate: this template's own precedent is the
priced quality ladder it removed rather than shipped inert.

*The legal surface.* Zero occurrences of privacy, terms, support or contact anywhere in
`Components/`. The footer at `Components/App.dsx:719-735` has BROWSE / EARN / ACCOUNT columns and
links "Manage this app" — the operator surface — to every viewer. A subscription app cannot be
submitted to either store without a privacy policy link, terms, and support contact.

---

## 4 · The remediation plan

Six waves. Each is independently shippable, each ends green on all five gates, and each names the
files it touches. Waves 1–3 are the blocker set; 4–6 are what turns a correct app into a
production template.

### Wave 1 — Close the money and trust holes

Nothing else matters while paid content is free to anyone with `curl` and the wallet can be
double-credited. This wave is server-only; no screen changes.

- **G1** — drop `video` from `showDetail` for unentitled episodes; add `GET /wallet/play/:episode`
  (`auth="required"`) re-running the free/VIP/unlock check and returning a short-lived URL.
  `Components/Watch.dsx` gains one `<api>` and reads it instead of `item.video`.
- **G5** — `Idempotency-Key` on the Stripe POST; assert `amount === amount_cents` before granting;
  make the settle lock conditional on the `unique (intent)` constraint from S2.
- **S2** — unique constraints in `server/policies.local.sql`, beside the existing comment
  addendum, with the same "dies when upstream lands" labelling. File the `<index unique>` ask.
- **G4** — `rate=` on `/store/checkout`, `/store/settle`, `/wallet/unlock`, `/wallet/unlockseries`,
  `/social/comment`, and the four `/rewards/*` grants.
- ~~**S1** — compute the live bonus balance from unexpired ledger rows in `walletState`, and spend
  against that in both unlock actions.~~ **Superseded.** Doing this would have expired purchased
  value (a pack's "+5% free" lands in `bonus`) and been the App Store 3.1.1 rejection. The expiry
  capability was deleted instead; see S1 and PLAN.md §6.85.
- **G2** — gate `adminStats`/`adminListShows` behind the internal route plane (or an in-body role
  check), so drafts stop leaking.
- **G19** — extend `scripts/verify.mjs` with an in-process viewer token and assertions for every
  item above, plus G8. This is the wave's real deliverable: the invariants become gated.

*Touches:* `server/catalog.dsx`, `server/store.dsx`, `server/wallet.dsx`, `server/admin.dsx`,
`server/policies.local.sql`, `scripts/verify.mjs`, `Components/Watch.dsx`. Plus PLAN.md §6 for the
`<index unique>` ask.

### Wave 2 — The auth seam becomes real

The single highest-leverage wave: it deletes nine copies of a dev artefact and gives the template
the one thing an adopter cannot write themselves from the docs.

- **A1** — one `<AuthSeam>` file component owning the session and `authHeaders`; every screen
  mounts it instead of declaring its own pair. Point it at a configurable session endpoint, with
  `/dev-session.json` as the documented local default rather than the hardcoded one.
- **A3** — a real signed-out state with a **sign-in** control (distinct from a network error), a
  **sign-out** action that nulls the five viewer-scoped cache keys named in `docs/auth.md:52-62`,
  and an **account deletion** action deleting the caller's rows across all ten owned entities.
- **A2** — stop writing `dist/dev-session.json`; move the operator identity behind the same seam;
  add a `scripts/preflight.mjs` assertion that fails if the file is present in `dist/`.
- **H1** — the same preflight refuses a native export while `App.json` `host` says `example.com`.

*Touches:* new `Components/parts/AuthSeam.dsx`; `Components/{App,Watch,Show,Store,Vip,Profile,Rewards,MyList,Admin}.dsx`;
`scripts/dev-session.mjs`, `scripts/preflight.mjs`; `server/viewer.dsx` (the delete action);
`docs/auth.md`.

### Wave 3 — Stop selling what does not exist

Pure honesty work. Cheap, and it is the difference between a submittable app and a rejected one.

- **VIP claims** — implement or delete each of the three. Recommended: delete "1080p" and "Offline
  downloads"; **implement** "No ads" (a `vip` branch around `<AdGate>` in `Components/Rewards.dsx`
  and around the player's ad surfaces) — it is one condition and it is the benefit a member
  actually notices.
- **Subscription semantics** — either build renewal (Stripe Subscriptions + a webhook, blocked by
  §6.6 in a standalone compile, so a hosted-lane integration with the gap named) or relabel every
  tier as a one-off pass and remove "Auto-renew. Cancel anytime." from all four sites. Add
  **Restore Purchases** either way.
- **M1 + G15** — a real comment author from the verified identity; report, block, delete-own, and
  a length-capped composer.
- **G14** — wire push or change the Manage copy to match `README.md:145-147`.
- **S4** — apply notice segments server-side.
- **Legal** — a footer column and a Profile section with Privacy, Terms and Support, plus the
  subscription disclosure block the stores require beside the price.
- **M4** — restrict the demo seed to public content keys; move the Article 7 pill into the chrome.
- **G8, G6** — VIP in `Show.dsx`'s lock formula; Profile's `walletFailed` pattern on all five
  remaining wallet screens.

*Touches:* `Components/{Vip,Store,Show,Watch,Rewards,Profile,App}.dsx`,
`Components/parts/{PlansSheet,AdGate,DemoSeed,TabBar}.dsx`, `server/{store,engage,social,admin}.dsx`,
`scripts/gen-demo-state.mjs`.

### Wave 4 — Scale past 100 rows

The wave that turns a demo catalogue into a catalogue.

- **G3** — a keyset cursor on every list read; "Load more" on Browse; ranged fetching in the player
  drawer (the range pills already promise it); paging on the Manage table; "100+" wherever a total
  is genuinely unknowable.
- **Spend #1/#2** — denormalise `episode_count` onto `show`, written by the admin upsert and its
  twin together. Collapses four actions from 1 + N to 1 and removes the §6.20 workaround from each.
- **S5** — render `unlockedCapped`, or delete it once paging makes it moot.
- **Declare `<budget>` rows explicitly** and surface `spend_capped` distinctly in every error card.
- **S8** — confirm and document the durable spend/rate store in the Cloudflare lane.
- **A4** — point the Manage screen at the declared `/admin/*` routes so it survives a deploy; keep
  the internal twins as the local accelerator; make `scripts/seed.mjs` work against a hosted `BASE`.

*Touches:* `server/{catalog,wallet,admin,social,viewer}.dsx`, `scripts/serve.mjs`,
`scripts/seed.mjs`, `Components/{Browse,Watch,Show,Admin}.dsx`, `README.md`.

### Wave 5 — One vocabulary, one palette, one strings table

The fork-ergonomics wave. Every item here is currently a multi-file edit for an adopter.

- **H9** — extract the breakpoint vocabulary from thirteen copies.
- **H10 + M12** — a palette layer; brand strings out of markup.
- **G18** — route every literal through `dsx.global.strings.*`; real number, date and currency
  formatting; a `currency` field on the price rows (**H3**).
- **H2, H4, H5, H6, H8** — one price table (delete the dead third copy in `rewardsState`), one
  `BULK_OFF`, one rewards economy, one episode-defaults table shared with the twin, one range size.
- **H13** — a rename checklist or `scripts/rename.mjs`.

*Touches:* nearly every file, mechanically. Best done as one atomic pass with `verify` green on
both sides.

### Wave 6 — The remaining production surface

- **G13** — the analytics event set, server-side for money, client-side for views.
- **S6** — periodic progress saves and a save on exit; **probe the `rest` ordering on a running
  origin first**, then fix it.
- **G12** — offline states; **G7** — Continue Watching's error/empty; **G9** — search's error state;
  **G11** — PersonalNav's data on My List; **G10** — the em dash; **S7** — reconcile `favTouched`.
- **G16** — client and server input validation everywhere.
- **G17** — the accessibility set, including a contrast rule added to `scripts/review.mjs`.
- **M2, M3, M6, M7, S3** — real likes or no likes; a real view counter; real task progress; a real
  unread signal backed by real read-state.
- **M8, M9** — artwork upload and derived genre chips on the Manage screen.
- **M5, M10, M11** — captured demo shapes; a real house creative; the CC-BY credits file.
- **H12** — ship the art-negotiation CDN rule as an artefact, not a comment.

---

## 5 · What is already right

Recorded because a work order that lists only defects misrepresents the codebase, and because
these are the patterns the remediation must not break.

The **trust shape is architecturally correct**: the client never prices, never grants, never
computes a balance; `unlockSeries` chooses idempotent-over-atomic and documents exactly why the
tempting shape double-charges (`server/wallet.dsx:93-105`); the Stripe settle-recovery card
(`Components/Store.dsx:228-237`) is a piece of design most production apps do not have. The
**stale-then-fresh discipline** (§6.30) is implemented consistently across every content screen,
with the ID guards the law warns about, on Show, Watch and Browse. **`Components/Profile.dsx` and
`Components/Notices.dsx` are the state model** — five states, honest em dashes, real retries — and
most of §2.5's state findings are simply "port Profile's pattern here". The **honesty habit is
real and unusual**: the language row that refuses to ship a picker it cannot back, the quality
readout that says "one rendition in this build", the AdGate lane note that names an undeclared
module face rather than guessing a call, the Manage screen's "100+" rather than a confident lie.
`PLAN.md` §6 is a genuinely excellent engineering artefact — 79 entries, every one measured, three
retracted in place rather than deleted.

The gap this audit describes is not carelessness. It is that the template has been built to a very
high bar for *rendering* and *architecture*, and has not yet been walked end-to-end as a **product
someone deploys, sells through, and submits to a store**. Waves 1–3 are that walk.
