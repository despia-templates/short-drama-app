# Feature parity — what a production short-drama app needs, and what this template has

> Researched 2026-09-01 against ReelShort, DramaBox, ShortMax, GoodShort, NetShort, DramaWave,
> PineDrama, GoodShort, MoboReels, Kalos TV, HoneyReels, FlexTV and My Drama, plus the current
> App Review Guidelines, Play policy centre, and the EU Accessibility Act. Template claims are
> cited `file:line`; category claims carry a source. Where nothing could be verified this
> document says **not found** rather than guessing.
>
> This supersedes nothing. `docs/research/short-drama-ux.md` is the founding research and
> `docs/product/spec.md` the founding spec; §1 below lists the eleven places where measurement
> has since contradicted them, because a template that quietly deletes a wrong claim teaches
> the next reader nothing.

---

## 0 · How to read this

**Evidence tiers.** `[P]` primary — an operator's own store listing, terms, help centre, or a
live DOM/CSS measurement of its web product. `[S]` secondary — SEO and affiliate pricing
guides, which contradict each other constantly and are never load-bearing alone. `[R]`
reference architecture — "build a DramaBox clone" dev-shop blueprints, useful for shape and
worthless as evidence of a real price.

**Template claims** are `Components/X.dsx:NN` or `server/X.dsx:NN`, read at HEAD on 2026-09-01.

**A warning about line numbers.** This repo was under concurrent edit while the research ran,
and eight of the defects originally found in §4 were fixed underneath it. Every citation below
was re-verified against HEAD at the end of the pass, and §4 records what was fixed as well as
what remains — but treat a line number as a pointer, not a promise, and re-grep before acting.

**Severity.** `BLOCKER` — the app is rejected, removed, or visibly broken. `TABLE STAKES` — an
app without it reads as unfinished. `DIFFERENTIATOR` — nobody in the category has it, and
shipping it is a reason to choose this template. `PARITY` — the template already matches or
beats the category; listed so nobody "fixes" it.

---

## 1 · Eleven corrections to this repo's own research

Eight of these change what should be built. All were measured, not recalled.

| # | What the founding docs say | What is actually true |
|---|---|---|
| 1 | "Player drawer: subtitle track, dub track, quality" (`docs/product/spec.md:63`) | **No app in the category has a subtitle on/off toggle, a subtitle-language picker, or an audio/dub picker.** Dubbing is a *catalogue axis*: DramaBox ships "Ruling Over All I See (DUBBED)" as a **separate title**; NetShort and GoodShort put a "Dubbed" ribbon on the poster. You pick your dub before you press play. [P — three independent listings] |
| 2 | "Hold-2× speed" (`docs/research/short-drama-ux.md:27`) | **Not found in any app.** The TikTok long-press-for-2× convention does not carry over. `Watch.dsx:450` declares `holdStart` and wires it to nothing — correctly, as it turns out. |
| 3 | "Coin packs $0.99 → $99.99" (`docs/product/spec.md:87`) | **No $0.99 tier exists on any listing.** Real entry points: ShortMax $3.49, ReelShort/DramaBox/GoodShort $4.99. [P — US App Store IAP lists] |
| 4 | "VIP weekly 7.99 · annual 129.99" (`docs/product/spec.md:92`) | Real weekly VIP is **$19.99** on ReelShort, NetShort and GoodShort's top tier; ShortMax $9.99/$19.99; DramaBox $5.99/$17.99/$19.99. $19.99/week is $1,039/year. [P] |
| 5 | "The category's player rail is built around [comments]" (`server/social.dsx:1-2`) | **ReelShort, DramaBox and GoodShort have no comments at all** — `/comment/i` is false against the full rendered HTML of all three, and neither action rail carries a comment glyph. The only comment surfaces in the category are DramaWave's **danmaku** (bullet comments over the video) and PineDrama's TikTok-shaped rail. **This template's comment thread is ahead of the market leaders, not level with them.** [P — live DOM] |
| 6 | "Range pills 1-30 · 31-60" | Measured on ReelShort web, the chunk is **50**: a 62-episode show renders `1 - 50` / `51 - 62` plus an "All Episodes ›" affordance, as plain text with **no chip background**, differentiated by weight and opacity alone. [P] **Already corrected in code during this pass** (`Watch.dsx:287-299`); the plain-text-no-chip styling is not yet applied. |
| 7 | "detail panel 416" (`AGENTS.md`, `Watch.dsx:124-132`) | 416 is right for **ReelShort**. ShortMax's is `width:30%; max-width:480px; min-width:320px`, and its collapse breakpoint is **1024**, not 1120. Also: **the two-column layout lives on the web, not on tablets** — ReelShort's iPad build is the phone player stretched. |
| 8 | "Downloads (per-show groups, storage meter)" in My List (`docs/product/spec.md:74`) | **Five apps advertise offline download in their own store copy** — ShortMax, NetShort, DramaWave, MoboReels, GoodShort — and **ReelShort and DramaBox are silent**. It is a challenger differentiator, not a leader feature. [P] |
| 9 | "Top 10 ranked shelf" and a Ranking tab | Correct as a **rail**. **No app ships a rankings destination with a daily/weekly toggle** — the only time-boxed chart found anywhere is FlickReels' `7-Day Star`. This template's phone `Ranking` tab (`App.dsx:352`) is already above the category. |
| 10 | "Coming Soon with premiere reminders" | Found on GoodShort's iPad rail ("Remind Me") and My Drama; **not found on any ReelShort or DramaBox surface**. Optional, not table stakes. |
| 11 | "no cross-platform key-value storage" (`PLAN.md §6.33`, `docs/upstream/32-no-kv-storage.md`) | **Stale — the module exists.** See §6A. This is the single largest unlock in this document. |

---

## 2 · The category's actual feature set

Condensed to what the evidence supports. Anything absent from this list was searched for and
not found.

**First run.** No genre picker, no gender picker, no age gate, no signup wall. ReelShort mints
a guest UID before any interaction — loading `reelshort.com/dashboard` anonymously returns
`Guest / UID:1431103871 / Account Balance / 0 Coins 0 Bonus / Top Up / Wallet / My List &
History / Feedback / Log in` [P]. DramaBox "opens straight onto a content tab". A genre picker
does exist in the category (My Drama's `My Preferences`) but sits **behind login** as
post-registration personalisation. The wall is economic, not identity-based: you hit a coin
paywall, never a login screen. Registration is *bought* — ReelShort offers 20 coins to sign
in, My Drama gives 50 (deliberately half an episode, at 99 coins each).

**Auth.** Guest play including guest *spending*. ReelShort web renders Facebook (primary),
then Google · TikTok · Email in unlabelled icon buttons; the Email route is passwordless OTP.
Apple's JS SDK loads on the page but no Apple button rendered in an anonymous session — almost
certainly platform-conditional. DramaBox: Facebook, Google, Apple. Phone/SMS OTP: not found
anywhere. The category's worst documented defect: logging out mints a **new** guest UID and the
old account is gone, and logging in with a *different* provider than last time creates a fresh
account with no progress — My Drama documents this and warns "your current guest account will
be lost"; recovery is an email to support.

**Coins.** Two ledgers everywhere: purchased and bonus, visible in the UI as separate numbers.
Per-episode price normalises to **$0.20–$0.60**; a full 70–90 episode series is **$37–$47** at
ReelShort's own published maths, ~$18 on the best whale bundle. Bonus ladder scales 5% → 100%
(ReelShort $4.99/500+25 through $99.99/10,000+10,000), so the top tier is half the unit price
of the bottom. GoodShort is the exception with a flat $0.00998/coin at every tier and no bonus
at all. **Which balance is spent first is published by nobody** — the silence is itself the
finding. **No app sells a season pass or a bulk unlock**; the answer to "buy the whole thing"
is the subscription.

**VIP is two different products wearing one name.** ReelShort commits in writing on its own
listing: "While your subscription is active, you can watch all tv mini series for free" [P].
HoneyReels sells the opposite, also verbatim: "1050 Coins + 630 Bonus will be immediately
issued… The maximum you can receive from purchasing the subscription is 1050 Coins + 1050
Bonus" — a coin bundle with a ceiling. Kalos TV sells both side by side, which is exactly why
its reviewers report 90–95 coins per episode *while subscribed*. **DramaBox, GoodShort and
ShortMax disclose auto-renewal terms and nothing else** — no statement of what the membership
grants. That silence correlates precisely with the "paid VIP, still paywalled" complaints.

**Earn.** Rewarded ads 6–20/day at 2–30 coins (ShortMax 6 × 25 = 150/day [P]; DramaBox 15 × 2
= 30/day [S]); check-in streaks that reset on a missed day, with a hidden earnings cap; tasks
including social follows and — against store policy — **rating the app for coins**; referral
gated on the invitee completing an action, not on install. Rewarded video is a **funnel into
coin purchases, not a revenue line**: ~5B impressions in 2024 across three apps, and ad revenue
is 7.4% of category revenue.

**Player.** Bottom-anchored right rail of 2–4 icon+count items (bookmark and heart dominate;
**bookmark is the dominant metric**, ~19:1 over likes on ReelShort), bottom-left title block
with genre pills, and a full-width bottom bar carrying `EP.n / EP.total ›` as the drawer
trigger. Playback speed: published multipliers only on Kalos TV (0.75×–2×) and MoboReels
(0.5×–2×); **ShortMax deliberately kills speed and quality on web** with
`[class*=playbackrate]{display:none!important}` over its own xgplayer build. PiP: ShortMax
only. **Casting: nobody** — no app in the set ships a TV app (Play device chips read `Phone,
Tablet, Chromebook` on all nine resolvable packages), and DramaBox actively blocks it "for
copyright reasons". Gesture grammar beyond swipe-up-to-advance and tap-to-clear-chrome: not
found.

**Episode drawer.** ReelShort web, measured live: 6 columns, cells 64.33×46 at radius 8, gap 6,
`rgba(255,255,255,0.1)`, bare episode number only. Locks are a 16×14 padlock pinned to the
cell's **top-right corner**; the cell body is not dimmed. The current episode is a
**corner-anchored radial gradient**, not a fill or border —
`radial-gradient(145% 140% at 96% 92%, rgba(255,61,93,.34), rgba(255,61,93,.16) 24%, transparent 76%)`
over an unchanged `background-color` — which is why a naive port renders a flat grey cell.
GoodShort uses the other idiom entirely: a 265px panel of 70×121 poster thumbnails, no range
pills, all 62 episodes rendered. **The free/paid boundary is never labelled anywhere in the
category** — the reader infers it from where padlocks begin.

**Social.** Comments: essentially absent (see correction 5). Likes: public and scoped to the
**show**, not the episode. Share: a plain canonical URL — Facebook/X/Reddit/WhatsApp/Copy on
GoodShort; **no watermarked-clip share anywhere**. Show star ratings: **none** — the category
uses ranking and heat counts; the 4.7–4.9 store averages are OS-level review prompts. Creator
or actor profiles: none, despite in-house production with recurring casts. Gift/tip: none —
coins flow user → platform only.

**Notifications.** My Drama is the only app that publishes its taxonomy, and it is a clean
three-way split under "Get Caught Up": **New Releases · New Rewards · News & Updates**.
ReelShort has a `Notifications` row on the profile screen; its contents are undocumented.

**Support.** **Neither ReelShort nor DramaBox operates a help centre.** No FAQ, no knowledge
base, no chat — a single support email each, and ReelShort's Apple-mandated support URL
resolves to "in-app Profile > Feedback". NetShort has a 9-question FAQ; My Drama has a real
Intercom help centre with ~96 articles and is the category's reference implementation.

**Settings.** The verified union across all apps is thin, and that thinness is the finding:
account deletion, clear cache, notification toggles, UI language, a personalised-recommendation
switch, playback speed, and profile fields. **Not found in any app: an autoplay toggle, a data
saver, a download-over-Wi-Fi-only toggle, a default-playback-speed setting, or a subtitle
language selector.** Video quality is a VIP entitlement, not a user setting.

**Ratings.** The App Store averages are compromised. ReelShort 4.7/483K on Apple against
1.4/226 on Trustpilot (84% one-star); GoodShort 4.9/516K against 1.6 (94% one-star); ShortMax
4.6/172K against 1.2 (99% one-star). ShortMax's BBB file carries a formal Pattern of Complaints
alert: **145 complaints in three years, 143 unanswered**. A GoodShort App Store review is
titled "Just doing this for 10 bonus coins". The mechanism is visible in the data.

---

## 3 · What this template has today

Routes (`dsx.config.json:5-121`): `/` `/discover` `/vip` `/store` `/rewards` `/list` `/profile`
`/notices` `/browse` `/browse/:genre` `/show/:id` `/watch/:show/:idx` `/admin`.

Phone tabs (`parts/TabBar.dsx`): Home · For You · VIP · My List · Profile.
Wide nav (`parts/TopNav.dsx:79-84`): Home · For You · Browse · VIP · Rewards · My List, plus
search, profile and a Get Coins CTA.

| Surface | What is real |
|---|---|
| **Home** `App.dsx` | Hero pager; phone tab row Popular/New/Ranking (`:343-353`); Continue Watching (`:493`); New Release (`:529`); TOP with giant ranked numerals (`:571`); per-genre shelves with View all (`:612`); footer |
| **Discover** `Discover.dsx` | Vertical pager over EP1 of each live show, muted autoplay, caption overlay bound to the resting index, Watch Full Episode CTA (`:155`), mute toggle. **No like, save or share on the feed** |
| **Browse** `Browse.dsx` | Genre + tag chips derived from the catalogue with counts (`server/catalog.dsx:90` `browseCatalog`), filtered grid |
| **Show** `Show.dsx` | Key art, Play EP 1, plot, tags, 6-col episode grid, My List toggle (`:187`), **bulk series unlock with a server-priced quote** (`:367`, `server/wallet.dsx:198` quote / `:247` charge), More like this (`:483`) |
| **Watch** `Watch.dsx` | Vertical pager over episodes; tap-to-pause; drag scrubber off one measured box; speed 0.75/1/1.25/1.5 (`:87-92`); `subtitles` and `pip` as real `<video>` booleans; right rail bookmark · comments · share; `EP.n / EP.N` drawer pill; ranged 6-col grid; **persistent 416px right panel ≥1120**; paywall sheet with price, Get coins, Earn free, balance, auto-unlock (`:69`, `:429`); comment sheet; URL tracks the episode |
| **Store** `Store.dsx` | Server price table (`server/store.dsx:31` `storeCatalog`), Stripe PaymentIntent, idempotent settle with a recovery card, and a `/store/restore` route (`server/store.dsx:383`) |
| **VIP** `Vip.dsx` | Masthead, benefits list (`:64-70` — every claim now true), free-with-VIP rail, an honest Restore row that names what it can and cannot do (`:343-351`), plans via `PlansSheet` |
| **Rewards** `Rewards.dsx` | 7-day check-in curve 5·10·15·20·25·30·60, spin wheel (1/day, server-declared prize table), two tasks, rewarded ads capped at 10/day via `parts/AdGate.dsx` — **VIP-gated** (`:392`) and carrying the App Store 2.5.18 report seam (`parts/AdGate.dsx:105-109`) |
| **My List** `MyList.dsx` | "History" rail = continue watching with a resume bar and `EP.n / EP.N` (`:181`); favourites grid |
| **Profile** `Profile.dsx` | Identity, one gold VIP card raising `PlansSheet`, coins + bonus, transaction ledger with five states, menu: My List & History, Notifications, Rewards, Language (honestly disabled, `:351-358`), Manage this app |
| **Notices** `Notices.dsx` | Operator broadcast inbox, four states, no read receipts |
| **Search** `parts/SearchOverlay.dsx` | Cover-sheet overlay, recent searches (session-scoped, `:89-92`), ranked "Hot Movie" list, result grid |
| **Backend** `server/*.dsx` | `show` `episode` (public-read) · `wallet` `ledger` `unlock` `playticket` `progress` `favorite` `checkin` `spin` `taskclaim` `adview` `order` (owner, RLS) · `comment` `notice` (public-read) · 6 MCP `<tool>` rows · a rate limit on every route · a TTL play-source seam at `/wallet/play/:episode` |

**Trust shape, already correct.** The client never decides entitlement: `epLocked` reads
`/wallet/state` (`Watch.dsx:247-254`), a locked page never mounts a `src` (`Watch.dsx:692`),
every spend is a checked ledger row plus a wallet fold, and coins are granted only after Stripe
confirms (`server/store.dsx:213` `settleOrder`). Bulk unlock is idempotent-not-atomic **and says so**
(`server/wallet.dsx:234`) because a declared action cannot span a transaction (§6.38).

---

## 4 · Defects in what already ships

These are not gaps. They are things the template currently *claims* and does not do. They come
first because a monetisation reference that overstates its own product is the one failure mode
this template exists to avoid, and because every one of them is cheap to fix.

### Fixed while this research was running

Recorded because an implementer needs to know they are done, and because the pattern is worth
seeing: every one was a sell surface that had drifted from what the player actually does.

- **The VIP benefits list is now true.** It read Unlimited viewing · 1080p high quality ·
  Offline downloads · No ads, of which only the first was real. It now reads Every episode
  unlocked · Your coins stay yours · No ads (`Vip.dsx:64-70`), and `PlansSheet`'s perk row
  changed from "1080p, no ads" to "Every episode at 0 coins, no ads"
  (`parts/PlansSheet.dsx:195-201`) with the reasoning kept in place.
- **"No ads" became true** — `AdGate` is now VIP-gated (`Rewards.dsx:392`).
- **The Download control is gone from the player**, so it no longer routes to a `/vip` page
  selling a feature that does not exist.
- **Bonus-coin expiry was removed server-side** — the 7-day `expires` stamps are gone from
  check-in, spin and task, and the reasoning cites Apple 3.1.1 (`server/engage.dsx:18`,
  `server/wallet.dsx:14,23`).
- **`AdGate` grew the App Store 2.5.18 report seam** (`parts/AdGate.dsx:80-109`).
- **Every route gained a rate limit**, and a `playticket` TTL entity plus
  `/wallet/play/:episode` now stand between an entitled viewer and a source URL.

### Still open

| # | Defect | Evidence | Fix |
|---|---|---|---|
| D2 | **Every comment is authored "You".** `server/social.dsx:58` hardcodes `author: 'You'` and `Watch.dsx` renders `item.author` | Two viewers see each other's comments attributed to themselves | Carry a display name from the verified subject once auth exists (§7, T1) |
| D3 | **Comments show a like count with no way to like.** `server/social.dsx:15` declares `likes`, `:40` returns it, the sheet renders "N likes" — and no action increments it | — | Ship the like, or drop the count |
| D4 | **Resume position is stored, displayed, and never applied.** `server/viewer.dsx` writes `position`, `continueWatching` returns it, `MyList.dsx:175` draws a resume bar from it, and **`Watch.dsx` never sets `<video start=>`** | `start` is in the element census; grep for `start=` in `Watch.dsx` returns nothing | One attribute (§7, T10) |
| D5 | **Auto-unlock still defaults on and spends without confirmation.** `Watch.dsx:69` is `return true`; `Watch.dsx:429` spends on episode end the moment the balance covers it | This is the category's sharpest dark pattern, shipped. See §5, item 1 | Default off; persist per show |
| D6 | **Restore is a local refresh wearing the word "Restore".** `Vip.dsx:351` calls `wallet.refresh()`, while `/store/restore` → `restoreOrders` exists unused (`server/store.dsx:383`) | The row's own comment is honest about the limit, which is the right instinct — but the server verb it needs is already there, and `dsx.module.store.restore` is the native half | Wire the row to the route, then to the module on native (§7, T5) |
| D7 | **The comment thread is never seeded**, so every demo thread is empty | `scripts/seed.mjs` contains no comment rows | Seed a handful per show |
| D8 | **The coin ladder is ReelShort's whale curve, verbatim.** `server/store.dsx:44` and `server/engage.dsx:110` both sell $99.99 → 10,000 + 10,000 bonus (+100%) | The exact top rung of the measured ReelShort ladder, where the top tier costs half per coin what the entry tier does | See §5, "Also rejected" |

---

## 5 · What this template must deliberately NOT copy

The category's mechanics are proven; several of them are proven *because* they are extractive.
This template is AI training data and a reference thousands will copy, so each rejection is
recorded with the evidence and the honest alternative.

### 1. Auto-unlock ON by default, spending without confirmation — **and the template ships it today**

`Watch.dsx:69` is `<variable as="autoUnlock">return true</variable>`, and `Watch.dsx:429` spends
on episode end with no confirmation the moment the balance covers it.

What the category does: default enabled, buried at **Profile → My Wallet → Detail** on
ReelShort — a spending control filed under playback preferences, four levels deep, where nobody
looking for a spending control will find it. DramaBox reviewers: "It automatically goes to the
next episode and then uses all your coins." Users summarise it as "people fall asleep watching
and wake up broke"; a ComplaintsBoard filing describes an auto-purchase feature charging varying
amounts per episode without disclosure. **Every hands-on guide's first instruction is to turn it
off before watching anything.** That is the tell.

**The honest version.** Default **off**. Keep the toggle exactly where it already is — on the
paywall, next to the price, which is the one placement the category gets wrong. Persist the
choice per show (§6A). Show a running "spent on this series" line while it is on. And re-consent
after a run of N unattended unlocks, because the failure mode is a phone in a pocket, not a
decision.

### 2. Expiring coins

Apple 3.1.1, verbatim: *"Any credits or in-game currencies purchased via in-app purchase may not
expire."* 3.2.1(iii) allows rental content to expire and says *"all other items and services may
not expire."* The only lawful escape is renting specific content ("this episode for 48 hours"),
not expiring a balance.

The category expires earned coins in 7 days (My Drama documents it verbatim) and — per its own
terms — reserves more: ReelShort's Terms §L claim *"the absolute right … to manage, regulate,
control, modify or eliminate Virtual Currency"*, make all sales final, and forfeit everything on
termination or after one year of inactivity. Trustpilot: *"The coins expire so you can't really
build a reserve"*; *"they took the remaining 400+ I had left."*

**The honest version.** Delete expiry entirely. The server half of this landed during the
research — the stamps are gone and `server/engage.dsx:18` cites 3.1.1 as the reason. The two
Profile claims survive (D1), and the `expires` column is still declared. Coins you earned are
coins you have; the only thing being removed is a promise to take something away.

### 3. Cancellation friction and off-store billing

The category has largely moved billing off the app stores. ReelShort's guest web store is
$11.99 against $19.99 on iOS, and roughly half its projected margin expansion is attributed to
direct billing. The consumer cost is structural: the subscription never appears in the OS
subscription list, so the OS cancel path and the Apple refund path both disappear. *"All payment
methods are off app…making it hard to cancel"*; *"there's no way to unsubscribe unless you email
them."* ReelShort's terms say cancellation is in-app and *"effective immediately"*; BBB
complaints from 2026 say the in-app unsubscribe button *"unsubscribes the user from the app but
continues to charge a weekly fee."*

**The honest version, and the economics that justify it.** Ship Apple IAP and Play Billing as
the primary rail on native **even where the injunctions now permit link-out**. In the US, Apple
currently charges 0% on link-outs pending a cost-based rate, and Google's alternative billing
saves the **5% billing fee, not the 20–25% service fee** — about 50 cents on a $9.99 pack, in
exchange for inheriting PCI-DSS, refunds, disputes, tax and (from 1 Oct 2026 on Play)
transaction reporting within 24 hours. Then ship a **Manage subscription** row that deep-links
to the OS subscription page — Google names its absence a violation outright, and
`dsx.module.store.manage` already exists.

### Also rejected, with reasons

| Pattern | Why not |
|---|---|
| **Countdown timers, urgency banners, "first recharge ×2"** | Both leaders "pre-wire discount bumps and urgency timers". `docs/product/spec.md:87` still specifies first-purchase double. The template currently ships **none** of it — keep it that way, and delete the line from the spec |
| **Coins for app reviews** | GoodShort's "Just doing this for 10 bonus coins" is a store-policy violation and it is why the 4.9 average means nothing. `docs/research/short-drama-ux.md:23` lists "rate the app" as a task; it must not become one |
| **A per-day free-episode throttle plus wait timers** | ReelShort caps free viewing at 5 episodes/day then imposes a 24-hour wait; free unlocks regenerate over "sometimes hours", explicitly to make paying feel faster. The template's `free_until` is a *per-series* gate with no clock, which is the honest half of the pattern |
| **Undisclosed and varying per-episode price** | Measured 52–72 coins on one ReelShort account, and a ShortMax reviewer: *"You can't check to see how much the episodes cost before you start watching."* The template prices per episode server-side and shows the number at the paywall — it should also show it **before** the first tap (§7, X4) |
| **The whale ladder to +100% bonus** | D8. A tier where the top pack costs half per coin what the entry pack does is a design that only pays off on the person least able to judge it. Cap the curve — the measured GoodShort ladder is flat at every tier and it is a shipping business |
| **Guest identity that evaporates on logout** | My Drama: logging out mints a new UID; a different provider next time creates a fresh account with no progress; recovery is an email. The honest version is explicit account linking that carries the wallet, and a named warning before any path that cannot be undone |
| **A paid spin wheel** | The template's wheel is free, once a day, with a server-declared prize table returned to the client (`server/engage.dsx:81`) — which is the right shape. Keep it free: Apple 3.1.1 requires odds disclosure for randomised items **purchased**, and declaring loot boxes forces 18+ in Brazil and 16+ in Australia. Publish the odds anyway |
| **A subscription that grants a lump of coins** | Google, verbatim: subscriptions *"may not be used to offer what are effectively one-time benefits… (for example, SKUs that provide lump sum in-app credits/currency)"*. Apple explicitly permits it. This template's VIP grants `vip_until` and unlimited access (`server/store.dsx:151`), so it is already on the right side of the sharpest divergence between the two stores — do not "improve" it into a coin bundle |

---

## 6 · Framework capabilities: three corrections and what is genuinely missing

Per the house law, a limitation is filed and never worked around. Two entries in the ledger have
gone stale in the template's favour, and one new blocker deserves promoting.

### A. `PLAN.md §6.33` is stale — a cross-platform key-value store exists

`docs/upstream/32-no-kv-storage.md` asks for *"a declared `storage` module … `get(key)`,
`set(key, value)`, `remove(key)`, `keys()` — mapping to UserDefaults, SharedPreferences and
localStorage"*. That module is **`Core/Basics/ValueStore` v1.0.0**:

- scheme `writevalue`, **aliases `readvalue` and `storage`**;
- keyed actions `get · set · remove · keys · clear · multiGet · multiSet`, all lanes;
- context facts `available` (false only where the browser refuses site data) and `count`;
- `web/`, `swift/` and `kotlin/` facets all present;
- the kernel registers `dsx.json` aliases as extra schemes routed to the same module
  (`OpenSource/Web/packages/kernel/src/bus.ts:564-568`), so `dsx.module.storage.*` should
  resolve.

The module's own note says why the ledger missed it: *"this is the AsyncStorage of the
framework, and it was unfindable under a scheme spelled `writevalue`."* It appears in **neither**
`OpenSource/Documentation/reference/` nor `OpenSource/Conformance/` outside a legacy verb table.

**Amend the filing** from "no KV storage exists" to "KV storage exists and is uncatalogued", and
**probe before building on it** — `AGENTS.md` is explicit that three framework defects were once
filed from one bad measurement. A one-element probe component settles it in minutes.

This unblocks, at once: persisted auto-unlock preference, recent searches surviving a reload,
default playback speed, a dismissed-banner flag, guest continue-watching, an onboarding-seen
flag, and the notification-preference mirror.

### B. AdMob's rewarded face is declared now

`parts/AdGate.dsx:35-45` says the rewarded face *"is still a legacy registry alias… There is no
declared action to call, so this file does not invent one."* The current manifest declares
`rewarded` with args `{ user_id, custom_data }` on iOS and Android — **exactly the two fields
AdMob server-side verification needs**, plus a full error vocabulary including
`consent_pending` and `consent_required`. `dsx.action.playNetwork` is already the single place
the call lands. Re-measure, then wire it and delete the note.

### C. Still missing, and now load-bearing

| Item | Status | What it now blocks |
|---|---|---|
| **`<webhook>` in the standalone server compile** (§6.6, issue 217) | Open. `packages/cli/src/server-document.ts:32-43` accepts `entity · secret · egress · budget` in head and `route · worker · tool` in body — no `webhook` | **Promote to production blocker.** Without an inbound receiver there is no App Store Server Notification, no Play RTDN and no RevenueCat webhook — so a subscription cannot handle renewal, cancellation, refund, billing-retry, grace period or chargeback. A subscription app that only learns about money when the client asks is not a subscription app |
| **`<video>` has no `quality` and no `track`** (§6.36, issue 270) | Open. Census: `active · audio · autoplay · bind · buffering · duration · gravity · loop · muted · nowArtist · nowPlaying · nowTitle · paused · pip · preview · reload · remoteSkip · scrubbing · speed · src · start · subtitles · time` | Was a UX gap; is now also **EU Accessibility Act** exposure. EN 301 549 requires the user to *control the display and use* of accessibility components. A subtitles boolean with no on/off surface and no language choice does not meet that |
| **`list` clamps to 100, no `count`, no cursor** (§6.20) | Open | Comments (`server/social.dsx:48` already renders "99+"), the notice inbox, the ledger, and any catalogue past 100 shows. Every read-heavy surface in a production deployment |
| **No transaction seam** (§6.38, issue 272) | Open | Bulk unlock is idempotent-not-atomic and says so. Correct handling; still a gap |
| **No asset lane in the native export** (§6.45, issue 279) | Open | Compounds offline download: nothing ships with the binary, so there is no offline first frame even before a download feature exists |
| **`VerticalPlayerStack` has no web facet** (§6.1, issue 215) | Open | Its `download · downloads · removeDownload` verbs are the category twin, and unreachable from a template that must render on web. `Core/Downloads` is observe-only (`list`); `Core/Files.download` is the general verb |
| **The shared icon catalog is 107 names and lacks the ones these surfaces need** | **New — file it** | `Conformance/icons/sf-map.json` has no `flag` (report content — an Apple 1.2 requirement), no `envelope` (contact support), no `questionmark.circle` (help), no `doc.text` (legal), no `hand.thumbsup` (like), no `bell.badge`/`bell.slash` (notification prefs), no `clock.arrow.circlepath` (history), no block-user glyph, and still no speech bubble (already filed as #235). Substitutes exist for some (`exclamationmark.triangle.fill`, `info.circle.fill`, `gearshape`, `trash`, `lock.shield`, `arrow.clockwise`), but a UGC-safety surface with no flag glyph is a real hole |

### D. Present and unused — free wins

| Capability | Where | What it gives |
|---|---|---|
| `<video start=>` | element census | Resume to the second (D4) |
| `<video nowPlaying nowTitle nowArtist remoteSkip on:remoteNext on:remotePrev>` | element census | Lock-screen and Control Centre transport, background audio metadata. Nobody in the category has it |
| `<route schedule=>` and `<worker queue=>` | `server-document.ts:41-42` | Cron and queues in the declared backend: VIP-expiry notices, premiere drip, new-episode push fan-out |
| `Core/Store` — `restore · manage · entitlements · subscription · refund · receipts · paywall` | module manifest | Every native store obligation in §8 |
| `Core/Auth/OAuth` v1.6.0, `Core/Clerk` (`authview · userprofile · signout · token`), `Core/Passkeys` | module manifests | The whole auth gap |
| `Core/Notify` (`permission · channels · categories · badge · schedule`), `Core/OneSignal`, `pushrouting` | module manifests | Push, per-category toggles, deep links |
| `Core/Consent`, `Core/WebPlatform/AppTracking` | module manifests | GDPR/UMP consent and ATT, both prerequisites for a mediation SDK |
| `Core/PostHog` / `Core/Telemetry` | module manifests | The funnel this template cannot currently see |
| `Core/Spotlight`, `Core/Widgets`, `Core/QuickActions`, `Core/Orientation` | module manifests | Indexed shows, continue-watching widget, landscape |

---

## 7 · The gap table

### Table stakes — an app without this looks unfinished, or cannot ship

| # | Feature | What the category does | This template today | Gap | Sev | Size |
|---|---|---|---|---|---|---|
| **T1** | **Sign in / sign out / account** | Guest UID minted before any interaction [P, measured on `reelshort.com/dashboard`]; then Facebook · Google · TikTok · email-OTP, Apple conditionally. Registration is bought with coins, never demanded | **No auth UI exists.** `scripts/dev-session.mjs` writes a static pre-minted viewer token to `public/dev-session.json`; every screen reads it through one `authHeaders` computed. `Profile.dsx:197-202` offers only "Reload session". `docs/auth.md:60` says outright: "This template has no sign-out surface" | Everything | **BLOCKER** | L |
| **T2** | **In-app account deletion** | DramaBox: Profile > Settings > Account Deletion. GoodShort routes to customer service (non-compliant). ReelShort: not documented | Nothing | Apple 5.1.1(v) hard rejection; Google requires it too. Guest accounts are explicitly in scope | **BLOCKER** | M |
| **T3** | **Web account-deletion URL** | Not found on any app in scope | Nothing | Google requires a Play Console URL field *in addition to* in-app | **BLOCKER** | S |
| **T4** | **Terms of Use + Privacy Policy, in the app and on the paywall** | Every app has them on the website; ReelShort's login modal links both | **Zero occurrences in `Components/`** | Apple: *"your app and App Store metadata must include links to your Terms of Use and Privacy Policy"*, and both must appear on the subscription purchase screen (3.1.2) | **BLOCKER** | S |
| **T5** | **Restore purchases** | Not found as a profile row in any app | **Partial**: an honest Restore row exists on `/vip` (`Vip.dsx:343-351`) that calls `wallet.refresh()`, and `/store/restore` exists unused (`server/store.dsx:383`) | Apple 3.1.1 requires a restore mechanism; 3.1.2 requires sign-in-or-restore *on the purchase screen* — so it also has to appear in `PlansSheet`. `dsx.module.store.restore` is the native half | **BLOCKER** | S |
| **T6** | **Manage subscription** | Off-store billing means most have none — which is the complaint | `PlansSheet` shows "Manage" (`Profile.dsx:235`) but it reopens the same sheet | Google names the absence of an easy online cancel a violation. `dsx.module.store.manage` exists | **BLOCKER** | S |
| **T7** | **UGC safety: report, block, filter, contact** | Comments barely exist in the category, so it barely arises — but this template **has** comments | `server/social.dsx` has no report, no block, no moderation queue, no profanity filter, and there is no published contact | Apple 1.2 requires all four plus action within 24 hours, and an EULA the user agrees to. Shipping comments without them is a rejection | **BLOCKER** | M |
| **T8** | **IAP on native, not Stripe** | Universal | `Store.dsx` and `PlansSheet` call Stripe on every lane; README documents RevenueCat as the native lane but nothing wires it | Selling coins through Stripe inside an iOS build is a 3.1.1 violation. The lane must be picked by capability, as `AdGate.dsx` already does for ads | **BLOCKER** | M |
| **T9** | **Settings screen** | Verified union: account deletion, clear cache, notification toggles, UI language, personalised-recommendation switch | No settings screen at all; `Profile.dsx:314-365` is a five-row menu | A production app with no settings reads as a demo | TABLE STAKES | M |
| **T10** | **Resume to the stored position** | Category is episode-granular; resume-to-second is documented by nobody | Stored, returned, drawn as a progress bar — **never applied** (D4) | One attribute. The bar currently promises something the player does not do | TABLE STAKES | XS |
| **T11** | **Push notifications** | My Drama's three toggles: New Releases · New Rewards · News & Updates. New-episode alerts are the category's core retention loop | `Notices.dsx` is a read-only operator broadcast inbox with no read state. No registration, no permission prompt, no per-viewer targeting, no deep links | The `notice` entity already carries `segment` (`server/admin.dsx:16`) and nothing consumes it | TABLE STAKES | L |
| **T12** | **Help / support / contact** | Email-only is the category norm; ReelShort's support URL points back into the app | Nothing | Apple 1.2 requires published contact info for a UGC app. A Feedback row plus an email is at parity | TABLE STAKES | S |
| **T13** | **Comment identity and moderation basics** | n/a | D2, D3 | Display name from the verified subject; a like that works or no count | TABLE STAKES | S |
| **T14** | **Analytics** | Assumed universal; DramaBox's privacy policy declares "records of push notification activation" as collected | None. `Admin.dsx:196` states plainly that view counts are demo values and "no telemetry is collected" | You cannot tune a paywall you cannot measure. `Core/PostHog` exists | TABLE STAKES | M |
| **T15** | **Consent + ATT** | Required by the ad lane | Neither wired | The moment AdMob ships, ATT and UMP consent are prerequisites — and AdMob's own error vocabulary includes `consent_pending`/`consent_required` | TABLE STAKES | S |
| **T16** | **Age gate** | **No app has one**, and their declared minimum ages contradict their store ratings (ReelShort terms 18+, Apple 13+; DramaBox terms 12+, Apple 18+) | None | Not a category gap — a *rating strategy* requirement. See §8 | TABLE STAKES | S |

### Differentiators — nobody in the category has these

| # | Feature | Evidence it is absent | Shape |
|---|---|---|---|
| **X1** | **Comments at all** | `/comment/i` false on ReelShort, DramaBox and GoodShort's rendered HTML; no comment glyph on either action rail | **Already shipped.** Finish it (T7, T13) rather than assuming it is table stakes |
| **X2** | **Bulk series unlock** | No season pass in any App Store IAP list in the category | **Already shipped** (`server/wallet.dsx:247` `unlockSeries`), server-priced, idempotent. Do not remove it |
| **X3** | **A rankings destination with a real time window** | Only FlickReels time-boxes anything (`7-Day Star`); no daily/weekly toggle anywhere | The `Ranking` tab already exists (`App.dsx:352`); add Today / This week |
| **X4** | **Price shown before the first tap** | *"You can't check to see how much the episodes cost before you start watching"* [P, ShortMax review]; and the free/paid boundary is unlabelled everywhere | `Show.dsx` already knows `free_until` and per-episode `price`. One line: "EP 1–3 free, then 60 coins each" |
| **X5** | **Reasoned recommendations** | "Because you watched" and "Others also watched" appear in **zero** apps | `showDetail` already returns `related`; label the rail with the reason |
| **X6** | **Clear and delete watch history** | No app documents a clear-history control or per-item delete; My Drama silently caps history at 20 | A delete on the continue-watching card and a Clear all in Settings |
| **X7** | **Lock-screen transport and background audio** | Not found | `<video nowPlaying nowTitle nowArtist remoteSkip>` — attributes that already exist |
| **X8** | **Accessibility Nutrition Labels with Captions declared** | ReelShort, DramaBox and ShortMax all show "The developer has not yet indicated which accessibility features this app supports" | Declaring Captions is free on a product page and nobody in the category has done it |
| **X9** | **Honest VIP** | The category's #1 complaint class is paid-VIP-still-paywalled; three of four leaders do not even state what the membership grants | **Already the template's stated deviation.** Now make the benefits list true (D1) |
| **X10** | **A three-state library: Following / History / Reminder** | Only DramaBox has all three | `favorite` exists; a `remind` row and a `reminder` worker are small |
| **X11** | **Trending search terms** | Only GoodShort — 25 keyword chips plus a rotating hot title as the field's placeholder | `SearchOverlay` already has Recent and Hot Movie; terms are a server-derived list |

---

## 8 · DSX shapes for each gap

Head order per `AGENTS.md`: attributes → expects → events → api → variables (plain, then
computed) → formulas → actions → watch → style.

**T1 · Auth.** New `Components/Account.dsx` at `/account`, plus a `<SignInSheet>` in
`Components/parts/` mounted by Profile, My List, Rewards and the paywall — the four surfaces
that currently render a signed-out card. Provider buttons call `dsx.module.oauth` (or
`dsx.module.clerk.authview` for a hosted flow); the token replaces the `<api as="session">`
fetch of `/dev-session.json` in all nine screens that carry it. Server: a new
`server/identity.dsx` with a `profile` entity (`display_name`, `avatar`, `locale`) owner-scoped,
and a `linkGuest` action that moves `wallet`, `unlock`, `progress` and `favorite` rows from the
guest subject to the authenticated one in one direction only. **Sign-out must null the five
viewer cache keys** — `cacheWallet`, `cacheFavs`, `cacheContinue`, `cacheLedger`, `cacheRewards`
— in the same action that drops the token; `docs/auth.md:52-62` already specifies this and notes
there is nothing to wire it to yet. Framework: none missing.

**T2/T3 · Account deletion.** `server/identity.dsx` action `deleteAccount` that cascades every
owner-scoped entity and returns a receipt; a `/account/delete` route for the web URL Play
Console requires; a Profile row → confirm sheet that states, in words, that the coin balance
goes with it (Apple: an unspent balance is not a reason to refuse deletion). Deletion must be
self-service — this app is not a 5.1.1(ix) regulated industry. Framework: none missing.

**T4 · Legal.** Two new routes `/legal/terms` and `/legal/privacy` rendering markdown-shaped
content from a server action so an adopter edits data, not markup; links in `Profile.dsx`'s menu
card and — required — in `PlansSheet` beneath the tier list. Icon: `info.circle.fill` and
`lock.shield` are in the catalog; `doc.text` is not (§6C).

**T5/T6/T8 · Store lane.** One new `Components/parts/BuyGate.dsx` on the `AdGate` pattern —
capability first, platform second: `has('store')` → `dsx.module.store.checkout`, else
`has('stripe')` → the current path, else a named refusal. `restore` and `manage` become two rows
in the new Settings screen and one row on `PlansSheet`. `server/store.dsx` gains a
`grantFromReceipt` action so both rails converge on the single writer the file's header already
promises. Framework: **`<webhook>` (§6C)** — without it, renewal, cancellation and refund cannot
be received, so the subscription is one-way. This is the one gap here that cannot be worked
around in template code.

**T7 · UGC safety.** `server/social.dsx` gains: a `report` entity (owner-scoped:
`comment`, `reason`, `note`), a `block` entity (owner-scoped: `subject`), a `hidden` boolean on
`comment`, a word-list filter in `postComment` before the create, and `listComments` filtering
both `hidden` rows and rows authored by anyone the caller has blocked. UI: a long-press or
overflow on each comment row raising an action sheet (Report · Block), a one-line EULA
acknowledgement above the composer, and a Contact row in Settings. Admin: a moderation queue in
`Admin.dsx` reading the `report` rows, and an `adminHideComment` action beside the existing
operator verbs. Framework: **no `flag` glyph** — `exclamationmark.triangle.fill` is the least-bad
substitute until one lands (§6C).

**T9 · Settings.** New `Components/Settings.dsx` at `/settings`, pushed from Profile. Rows:
Notifications (per-category toggles), Playback (default speed, autoplay next), Downloads (if
built), Language (keep the honest disabled row from `Profile.dsx:351-358`), Clear cache, Clear
watch history, Restore purchases, Manage subscription, Help, Terms, Privacy, Delete account,
Version. Persistence: `dsx.module.storage.multiSet` in one write, `multiGet` on mount (§6A) —
the manifest is explicit that twelve keys read one at a time is twelve round trips.

**T10 · Resume.** `Watch.dsx`: add a `resumeAt` computed that reads the stored position for the
current episode and returns 0 for anything else, then `start="{{ dsx.variable.resumeAt }}"` on
the `<video>`. Guard it to the episode the viewer arrived on so a swipe to episode 4 does not
inherit episode 3's offset. XS.

**T11 · Push.** `dsx.module.notify.permission` behind a **primer** — never the cold OS prompt,
and never gated on a reward (Apple 5.1.2(i) forbids compensating a user for enabling
notifications). `dsx.module.onesignal.login` binds the subject so the `segment` field on
`notice` finally means something. Categories map to My Drama's verified three: New Releases ·
New Rewards · News & Updates. Server: a `subscription` entity (subject, category, enabled) and
**a `<worker>` on a `<route schedule=>`** (§6D) that fans out new-episode notices per follower.
Deep links land on `/watch/:show/:idx` and `/rewards`, which already exist.

**T14/T15 · Analytics and consent.** `dsx.module.consent` gates `dsx.module.posthog.capture`;
`dsx.module.apptracking.request` runs only after the consent answer, and only from a screen that
explains why. Events worth having are the funnel this template is about: `paywall_shown`,
`unlock_started`, `unlock_completed`, `bulk_offer_shown`, `vip_sheet_opened`, `ad_completed`,
`checkin_claimed`.

**T16/X-rating · Age gate.** A one-time date-of-birth or 16+/18+ confirmation stored via
`dsx.module.storage` and mirrored to the profile row once signed in, plus a Parental Controls
declaration in App Store Connect. This is what holds the rating at 16+ instead of 18+ — see §9.

**X3 · Ranking window.** `homeShelves` gains a `window` input (`today` | `week`) and the
`Ranking` tab gains two pills. Requires a real view counter, which `Admin.dsx:196` correctly
says does not exist yet.

**X4 · Price before the tap.** `Show.dsx`, under the title: `EP 1–{{ free_until }} free, then
{{ price }} coins each`. Both facts are already in the `showDetail` payload.

**X6 · History control.** `server/viewer.dsx` gains `deleteProgress(episode)` and
`clearProgress()`; the continue-watching card gets a delete affordance and Settings gets Clear
all. `trash` is in the icon catalog.

**X7 · Lock-screen transport.** Four attributes on the existing `<video>`:
`nowPlaying="true" nowTitle="{{ episode.title }}" nowArtist="{{ show.title }}" remoteSkip="true"`,
plus `on:remoteNext="dsx.action.next()"`. XS.

**D1 · Expiry — CLOSED 2026-09-01.** All three Profile claims are gone. The last one was the
conditional this table dismissed as harmless (*"simply falls silent now"*), and that reading was
the mistake: an unreachable promise is one payload change from a live one, so it was deleted
rather than left. `verify` now asserts the COPY beside the behaviour — no display string may
claim an expiry unless it negates one — read through the app's own display-point extractor.

**D5 · Auto-unlock.** `Watch.dsx:69` → `return false`; read and write the per-show preference
through `dsx.module.storage` keyed on the show id; add a "spent on this series" line beside the
toggle while it is on. S.

**D6 · Restore.** Point `Vip.dsx:351` at `/store/restore`, add the same row to `PlansSheet`
(3.1.2 requires it on the purchase screen), and route it through `dsx.module.store.restore`
inside the `BuyGate` capability check. S.

---

## 9 · Store-submission readiness

### Hard blockers — the app is rejected or removed

| # | Blocker | Store | Template status |
|---|---|---|---|
| 1 | **No in-app account deletion** (5.1.1(v)). Deactivation is insufficient; a web link may only *finish* a flow the app initiates, and must be a direct link to the completion page. Self-service is mandatory — short drama is not a 5.1.1(ix) regulated industry | Apple | **Missing** (T2) |
| 2 | **No web account-deletion URL** in the Play Console field. In-app deletion alone is non-compliant, because a user must be able to delete without re-downloading the app | Google | **Missing** (T3) |
| 3 | **No Terms of Use / Privacy Policy links** in the app and in store metadata. Privacy violations are Apple's largest 2025 rejection bucket at 443,000+ | Both | **Missing** (T4) |
| 4 | **Coins or VIP sold outside IAP / Play Billing.** The US link-out carve-out is **anti-steering, not an IAP exemption** — the purchase must complete on your website, never in a payment sheet inside the app | Both | **At risk** (T8): Stripe is called on every lane |
| 5 | **No restore mechanism** (3.1.1), and no sign-in-or-restore on the purchase screen (3.1.2) | Apple | **Partial** (T5, D6): a local-refresh Restore exists on `/vip`; the route it needs is unused and `PlansSheet` has no row |
| 6 | **Subscription purchase screen** must show name, duration, and the **full renewal price as the most prominent pricing element** — an annual plan leads with the annual charge, not a per-week equivalent | Both | **Partial**: `PlansSheet` shows label, price and note; no duration statement, no legal links, no restore |
| 7 | **UGC without filter, report, block and published contact**, and without an EULA the user agrees to. Reports must be actioned within 24 hours | Apple 1.2 | **Missing** (T7) — and the template ships comments |
| 8 | **Purchased currency that expires** (3.1.1) | Apple | **Compliant, both halves** — the stamps were removed mid-research and the three UI claims followed (D1). Nothing in the schema, the grants, the payload or the copy expires a balance, and `verify` asserts all four |
| 9 | **Age rating questionnaire unanswered** — the revised system (13+/16+/18+ added, 12+/17+ removed) went live and the response deadline of 31 Jan 2026 has passed; submissions are blocked until it is answered | Apple | Not applicable to source, but must be done at submission |
| 10 | **No reviewer test account** funded with coins and an active subscription | Both | Not present; a paywalled catalogue bounces without one |
| 11 | **`targetSdkVersion` < 36 or Play Billing Library < 8** — both deadlines passed 31 Aug 2026, extension window closes 1 Nov 2026 | Google | Build config |
| 12 | **DSA trader status** — EU apps without verified trader details have been removed since 17 Feb 2025 | Apple EU | Deployment |
| 13 | **A subscription whose benefit is a lump of coins** — Google forbids it verbatim; Apple permits it | Google | **Compliant already** — VIP grants unlimited access (`server/store.dsx:151`) |

### Enforcement risk — ships, then gets pulled or forced to change

- **Data safety / App Privacy mismatch.** The moment a mediation SDK lands, `AD_ID` is merged
  into the manifest by the SDK whether or not you declare it, so "Device or other IDs" must be
  declared. This is Google's most-enforced discrepancy. Note also that video watch history is
  **Usage Data · Product Interaction**, not Browsing History.
- **Privacy manifest.** `PrivacyInfo.xcprivacy` with required-reason API declarations has been a
  hard submission gate since 1 May 2024, and almost every app touches `UserDefaults` — which
  `dsx.module.storage` will (§6A).
- **Ad placement.** Google forbids ads "during the beginning of a content segment", and its
  Made-for-Ads rule names interstitials placed after consecutive **swipes** — which is exactly
  this player's gesture. The template's ads are opt-in rewarded only (`parts/AdGate.dsx`), which
  is expressly exempted; keep it that way.
- **Never gate a reward on a permission.** Apple 5.1.2(i) forbids requiring a user to enable
  push, location or tracking "in order to receive monetary or other compensation". The rewards
  task list must never include "enable notifications" — `docs/research/short-drama-ux.md:23` and `:43`
  currently list exactly that.
- **Rewarded-ad chrome.** Apple 2.5.18 requires clear ad labelling, a large close control, and
  an in-app "report this ad" affordance. `AdGate`'s house creative has none of the three.

### Legal, not store policy

- **EU Accessibility Act**, applicable to services since 28 June 2025, binds non-EU companies,
  and catches this app twice: as an e-commerce service (selling coins in-app is unambiguously
  in scope) and as a service providing access to audiovisual media. The standard is EN 301 549
  v3.2.1, which incorporates **WCAG 2.1 AA in full**; Clause 11 governs mobile apps. Two
  consequences specific to this product:
  - **SC 1.2.5 Audio Description (Level AA) requires an audio-description track for all
    prerecorded video**, and a transcript does not satisfy it. For a catalogue of thousands of
    one-minute episodes this is a content-production obligation. **No app in the category does
    it.** It is by far the largest compliance cost identified in this research.
  - The user must be able to **control the display and use** of accessibility components — which
    is precisely what `<video>`'s missing `track` selection blocks (§6C). The framework gap is
    now a compliance item, not only a UX one.
  - Microenterprise exemption is <10 employees **and** ≤ €2m; disproportionate burden must be
    documented, not asserted. Penalties run roughly €60k–€900k by Member State; no fines had been
    issued anywhere as of early 2026, and Dutch enforcement is expected H2 2026.
- **US state App Store Accountability Acts** — Texas in effect, Utah from 6 May 2026, Louisiana
  from 1 July 2026. **Decide the age rating before launch**: in Texas, changing it later can count
  as a "significant change" and trigger the parental-consent flow.
- **Apple blocks 18+ downloads in Australia, Brazil and Singapore** without verified adulthood,
  since 24 Feb 2026. That makes 16+ versus 18+ a commercial decision, not a cosmetic one.

### The rating call

A romance/revenge catalogue will answer "Frequent" to Mature or Suggestive Themes, which puts
the floor at **16+**. Frequent Sexual Content or Nudity, or Frequent Realistic Violence, pushes
it to **18+**; Graphic Sexual Content or prolonged sadistic violence returns **Unrated**, which
cannot be published. The incumbents split — ReelShort 13+, DramaBox and ShortMax 18+ on Apple,
while **the identical DramaBox catalogue rates Teen on Google**. Plan for two different answers
to the same content. Holding 16+ is worth real engineering: declare Parental Controls and Age
Assurance under In-App Controls, and gate the most explicit titles behind the age gate (T16).

### Accessibility: what is honest

Searching the entire App Review Guidelines for "accessib", "VoiceOver", "Dynamic Type" and
"captions" returns **one passing documentation link and no rejection criterion**. Accessibility
is not an App Store rejection risk. What *is* real: **Accessibility Nutrition Labels** are
voluntary today and Apple has announced they will become required, inaccuracy is enforceable
under Guideline 2.3, and **no app in this category has filled them in**. Declaring **Captions**
is free and differentiating (X8). The genuine obligation is the EAA, and it is legal rather than
store-enforced.

This template already runs `npm run review` — the framework's a11y, tap-target, type-scale and
contrast gate — on every merge, which is above the category floor by a wide margin. That is the
right foundation for the labels; it is not by itself EN 301 549 conformance.

---

## 10 · Suggested order

1. **Finish the honesty pass** — D1, D3, D5, D8. Mostly removals, no new surfaces. D5
   (auto-unlock default) is the one that matters most: it is the category's sharpest dark
   pattern and the template currently ships it.
2. **The store blockers that need no auth** — T4 legal, T12 contact, T5/T6/T8 the store lane
   (D6 is the first half of T5), and the `PlansSheet` disclosure fields.
3. **Probe `dsx.module.storage`** (§6A) in a throwaway one-element component. Everything in
   step 4 depends on the answer, and the house rule is to probe before generalising.
4. **Auth** — T1, then T2/T3 on top of it, then D4 and T13. This is the keystone: seven other
   gaps are unreachable without a real subject.
5. **T7 UGC safety** — required the moment comments ship to a store, and the moderation queue
   fits naturally beside the existing operator verbs.
6. **T9 Settings**, absorbing T10, X6, X7 and the restore/manage rows.
7. **T11 push**, which is where `<route schedule=>` and `<worker>` first earn their place.
8. **T14/T15 analytics and consent**, then the AdMob rewarded lane (§6B) on top of the consent
   answer.
9. **The differentiators** — X3, X4, X5, X8, X10, X11 — in whatever order the demo wants.
10. **File the three new upstream items**: the icon catalog gaps, the `<webhook>` promotion to
    production blocker, and the amendment to `docs/upstream/32-no-kv-storage.md`.

---

## Sources

Category claims are drawn from the following. Live measurements were taken 2026-09-01.

**Store listings, terms and help centres (primary)** —
`apps.apple.com/us/app/reelshort-stream-drama-tv/id1636235979` ·
`.../dramabox-stream-drama-shorts/id6445905219` · `.../shortmax-short-dramas-tv/id6464002625` ·
`.../goodshort-short-dramas-hub/id6448176203` · `.../netshort-popular-dramas-tv/id6504849169` ·
`apps.apple.com/app/id6477434409` (HoneyReels, the verbatim coin-stipend subscription) ·
`apps.apple.com/app/id6463394851` (Kalos TV) · `itunes.apple.com/lookup?id=…&country=us` for full
descriptions and language fields · `reelshort.com/user-agreement.html` (§L virtual-currency
forfeiture, §E cancellation, §O one-year inactivity, §U arbitration) ·
`support.dramaboxdb.com/privacy.html` and `/terms.html` · `goodshort.com/privacy-policy` ·
`netshort.com/faq` · `intercom.help/mydrama_helpcenter/en/` (the category's only real help centre —
coin system, 7-day bonus expiry, login and guest-account loss, notification toggles, history cap,
account deletion).

**Live product measurement** — `reelshort.com` (guest dashboard, login modal, search, episode
player: 6-col 64.33×46 grid, `1 - 50`/`51 - 62` range pills, `.EpisodePage_tabs_active__` radial
gradient, corner padlock, rail counts by SVG path, `/comment/i` false) · `shorttv.live` (ShortMax
two-column panel geometry, dual-lane markup, xgplayer speed/quality suppression) ·
`goodshort.com` (265px thumbnail drawer, faceted taxonomy, share row, trending keywords) ·
`dramabox.com/browse` (52 flat tags) · `flickreels.net` · Google Play device chips for nine
packages.

**Reviews and complaint aggregators** — App Store review feeds for all four leaders (52–72
coins/ep, 5 free/day then a 24h wait, 6 ads × 25 coins, "can't check how much episodes cost",
"Just doing this for 10 bonus coins", DramaBox casting blocked, half-screen iPad, subtitle/audio
mismatch) · Trustpilot for ReelShort, ShortMax, GoodShort, DramaBox · BBB files for Crazy Maple
Studio and ShortMax Innovations (the 145/143 Pattern of Complaints) · ComplaintsBoard ·
PissedConsumer.

**Press and analysts** — TechCrunch (Jan 2026, "microdramas… kind of suck"; Apr 2024 Appfigures
data) · Our Culture (Aug 2026, the casino framing, wait timers, no cooling-off) · NPR (Mar 2025) ·
Sensor Tower state-of-short-drama 2025 and 2026 · Appfigures · MPA via Yahoo Finance · RevenueCat
(weekly = 88.5% of recurring revenue; 5.5% payer conversion; 1.8% six-month retention) · Naavik ·
AppsFlyer · Adapty · adjoe.

**Apple policy** — `developer.apple.com/app-store/review/guidelines/` (1.2, 2.5.18, 3.1.1,
3.1.1(a), 3.1.2, 3.1.3(a), 3.2.1(iii), 3.2.2(x), 4.8, 5.1.1(v)/(ix), 5.1.2(i)) ·
`/support/offering-account-deletion-in-your-app/` · `/support/reader-apps/` ·
`/app-store/subscriptions/` · `/app-store/app-privacy-details/` ·
`/app-store/user-privacy-and-data-use/` · `/support/third-party-SDK-requirements/` ·
`/help/app-store-connect/reference/age-ratings` · the Accessibility Nutrition Labels and VoiceOver
criteria help pages · developer news `?id=ks775ehf` (24 Jul 2025, revised age ratings),
`?id=f5zj08ey` (24 Feb 2026, the 18+ download block), `?id=zqyk1ct6` (18 Aug 2026, EU CTC) ·
Apple Newsroom, May 2026 App Review statistics.

**Google policy** — Play policy centre on Payments, Subscriptions (the "sustained or recurring
value" clause), Ads (the rewarded-ads exemption and Made for Ads), Content Ratings, Inappropriate
Content (the catalogue-app carve-out), User Data (account deletion), Families · Play Console help
on Data safety, account deletion, content rating, target API level, `AD_ID` manifest merging, and
the US alternative-billing fee tables · `developer.android.com/google/play/billing/deprecation-faq`.

**Court record** — Ninth Circuit Epic v. Google (31 Jul 2025) and the 12 Sep 2025 order · SCOTUS
dockets 25A354 and 25-521 (cert dismissed 9 Mar 2026) · Apple v. Epic No. 25-1311 (cert granted
30 Jun 2026, briefing Sep/Nov 2026).

**EU** — Directive (EU) 2019/882 (Arts. 2, 3, 4(5), 14, 31; Annex I Section IV) · EN 301 549
v3.2.1 · WCAG 2.1 SC 1.2.5 Understanding document.

**Framework** — `ClosedSource/DSX/Modules/Core/Basics/ValueStore/dsx.json` ·
`.../Core/AdMob/dsx.json` · `.../Core/Store/dsx.json` · `.../Core/Notify/dsx.json` ·
`.../Core/Downloads/dsx.json` · `.../Custom/VerticalPlayerStack/dsx.json` ·
`OpenSource/Documentation/reference/stack-elements.json` (the `<video>` census) ·
`OpenSource/Web/packages/cli/src/server-document.ts` (the accepted server tags) ·
`OpenSource/Web/packages/kernel/src/bus.ts` (alias registration) ·
`OpenSource/Conformance/icons/sf-map.json` (107 names).
