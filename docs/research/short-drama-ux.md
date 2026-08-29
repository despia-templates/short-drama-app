# Short-drama UX research — the feature matrix and what we adopt

> Researched 2026-08-29 against ReelShort, DramaBox, NetShort, DramaWave, ShortMax, GoodShort,
> FlexTV. Two kinds of rows below: **standard** (ship it, users expect it) and **deliberate
> deviation** (we do it differently, with the reason recorded). Sources at the end.

## 1 · Market shape (why these mechanics exist)

- ReelShort + DramaBox ≈ **70% of global short-drama in-app spend**; both are coin-first
  businesses with ad-subsidized free tiers.
- The unit: a **series of 60–90 second vertical episodes**, typically 60–100 episodes,
  engineered around per-episode cliffhangers. First 5–10 episodes free, the rest gated.
- Completing one series typically costs **$37–47** in coins at ReelShort pricing; the top
  complaint class is double monetization (paying subscribers still hitting coin walls).
  We adopt the economy but fix the trust failure: **VIP means no coin walls, ever** (§4).

## 2 · The canonical IA (identical across every major app — adopt verbatim)

| Tab | Contents |
|---|---|
| **Home / Shows** | hero carousel, "New Releases", "Trending", "Top 10" ranked shelf, genre shelves (CEO, revenge, werewolf, time-travel…), "Coming Soon" with premiere reminders |
| **Discover / For You** | full-screen vertical swipe feed of trailers/first-episodes; tap → show; swipe up → next; the TikTok muscle |
| **Rewards** | daily check-in calendar, task list ("watch 3 episodes", "enable notifications", "follow TikTok"), rewarded-ad slots, spin-the-wheel |
| **My List** | continue watching (resume position), favorites, downloads, history |
| **Profile** | wallet (coins + bonus coins, ledger), VIP status, transactions, language, settings, support |

Player surface (on top of any tab): vertical pager, tap-to-pause, hold-2× speed, scrub with
frame preview, episode-grid drawer, speed control, subtitles/dubbing selector, share, favorite,
report. The paywall is a sheet over the player, never a navigation.

## 3 · The engagement loop (standard; numbers are our defaults, all config)

- **Check-in streak**: escalating 7-day calendar (5·10·15·20·25·30·**60** bonus coins), day-30
  milestone 200; a missed day resets; one **streak-restore** per month via rewarded ad. Push
  + Live Activity guard at streak-risk hour (user-set, default 20:00 local).
- **Rewarded ads**: 5–10 coins per completed view, **daily cap 10 ads**, per-episode-unlock cap
  visible as a counter under the CTA (the DramaBox "5 ads ≈ 1 episode" ratio is the market
  norm — we default to 3 for dignity; config). Every grant is **SSV-verified server-side**;
  client callback grants optimistic UI only (architecture/backend.md §5).
- **Spin the wheel**: 1 free spin/day + 1 per rewarded ad (cap 3); prize table config
  (coins 10–100, bonus-coin multipliers, 24h VIP taste); odds server-declared, logged,
  and printed in the admin surface — never client-side.
- **Tasks**: one-shot (bind push, first follow, first share) and daily (watch N episodes).
  All grants land as **bonus coins** (expiring currency) — the industry keeps purchased and
  earned currency separate; so do we (§4).
- **First-recharge double** + limited-time coin offers with countdowns; win-back offer for
  lapsed viewers (push segment).

## 4 · The economy (standard shape, one deliberate fix)

- Two balances: **coins** (purchased, non-expiring) and **bonus coins** (earned, expire in
  7 days — expiry push at T-24h). Bonus coins spend first.
- Episode price: 50–70 coins (~$0.50–0.80 effective); per-show override; early episodes free
  (default 8); **premiere drip**: N new episodes/day at a set hour (creates the return habit).
- Coin packs $0.99 → $99.99 with bonus escalation; **first-purchase 100% bonus**.
- **Auto-unlock next episode** toggle (persisted per show) — the single highest-friction
  reducer in the category; VerticalPlayerStack already models it.
- Subscriptions via RevenueCat: weekly VIP + annual VIP. **Deviation (recorded):** VIP unlocks
  the entire catalogue — no coin spend while subscribed. The category's #1 store-review
  complaint is VIP-plus-coins double billing; an official Despia template does not ship a
  dark pattern. Ad-free is included in VIP; rewarded ads remain available for bonus-coin tasks.

## 5 · Notifications (standard) and Live Activities (our differentiator)

**Push (OneSignal), all segments declared in the backend, all admin-composable:**
new-episode drop (per followed show), premiere reminder (opt-in from Coming Soon), streak
guard, bonus-coin expiry, first-recharge offer expiry, win-back (7d inactive), price-drop /
weekend event. Deep links: `app://show/{id}/ep/{n}`, `app://rewards`, `app://wallet`.

**Live Activities (OneSignalLiveActivity — no major drama app ships these today; we do):**
1. **Premiere countdown** — "EP 41–45 tonight 20:00", updates to "LIVE" at drop;
2. **Download progress** — batch "download season" progress on lock screen;
3. **Streak guard** — evening compact Activity when a streak is at risk.

**Widgets** (Core/Widgets): Continue-Watching (small/medium), streak + wallet glance.
**Quick actions**: Continue watching, Rewards, Search. **Spotlight**: shows indexed.

## 6 · Web (SSR) — the category is weak here; we are not

ReelShort/NetShort web exists mostly as SEO + watch-first-episodes funnels; apps carry the
business. Our web app is **the full product**: SSR shelves (Netflix layout), show pages with
per-episode SEO routes (schema.org `TVSeries`/`TVEpisode`), the same wallet/rewards (web
rewarded ads excluded — AdMob rewarded is app-only; web substitutes tasks + direct purchase
via web payments), and the vertical player (upstream item: VerticalPlayerStack web facet).
Deep links unify: every share URL is a web URL that opens the app when installed.

## 7 · Honesty ledger

| Claim | Status |
|---|---|
| Coin/episode gating, check-in, tasks, rewarded ads, spin wheel, drip releases | **Industry standard** — verified across ReelShort/DramaBox/NetShort |
| "All popular drama apps use Live Activities" | **Not supported by evidence** — they use push + widgets; Live Activities is *our* differentiator and is marketed as such |
| VIP-with-no-coin-walls | **Deviation** from ReelShort/DramaBox double monetization, on purpose |
| Web parity | **Deviation** — the category treats web as a funnel; we ship the full product |

## Sources

- [Filmustage — ReelShort vs DramaBox 2026](https://filmustage.com/blog/short-drama-apps-compared-reelshort-vs-dramabox-in-2026/)
- [Unstar — 5 short drama apps ranked 2026](https://unstar.app/blog/reelshort-dramabox-shortmax-goodshort-flextv-short-drama-apps-ranked-2026)
- [Oyelabs — ReelShort vs DramaBox UX patterns](https://oyelabs.com/reelshort-vs-dramabox-what-keeps-users-watching/)
- [ReelPulse — DramaBox coins, check-ins, spin wheel](https://reelpulse.net/guides/dramabox-coins)
- [Vodlix — short-drama platform monetization 2026](https://vodlix.com/blog/top-short-drama-platforms-and-how-they-monetize)
- [NetShort web](https://netshort.com/) · [DramaWave — App Store](https://apps.apple.com/us/app/dramawave-dramas-reels/id6670430706)
- [AdMob SSV — validate rewarded ads](https://support.google.com/admob/answer/9603226?hl=en) · [iOS SSV](https://developers.google.com/admob/ios/ssv)
- [RevenueCat — granting ad rewards with SSV](https://www.revenuecat.com/docs/ad-monetization/rewards)
