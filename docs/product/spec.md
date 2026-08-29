# Product spec — the short-drama app

> The screens, flows and numbers. Research grounding: `../research/short-drama-ux.md`.
> Trust boundaries and data shapes: `../architecture/backend.md`. Everything user-facing is
> white-label config (Article 4 discipline): strings via attributes/locale tables, colors via
> theme facts, numbers via module/template config — a fork should be a config edit.

## 0 · Responsive contract (web)

One codebase, three shapes, derived from the live `dsx.screen.width`:

| | phone `<768` | tablet `768–1119` | desktop `≥1120` |
|---|---|---|---|
| Navigation | bottom `<TabBar>` | top `<TopNav>` | top `<TopNav>` |
| Screen gutter | 16 | 24 | 32 |
| Content shell | full width | centred, per-screen max | centred (Home/My List 1240 · Show 900 · Rewards/Profile 720 · Manage 1100) |
| Poster rail card | 108×162 | 132×198 | 152×228 |
| Home hero | 196 | 300 | 400 |
| Show key art | 250 | 340 | 420 |
| Episode grid | 5 cols | 8 | 10 |
| Favorites grid | 3 cols | 5 | 7 |
| Player (Watch/Discover) | full bleed | centred 9:16 stage | centred 9:16 stage |

The player rule is the one worth stating: a vertical 9:16 feed stretched across a 1280px
window is a phone layout in a big frame, so wide viewports get a centred column capped at
`min(460, screenHeight × 0.52)` on black — the presentation every short-video site
converged on for desktop.

## 1 · Surfaces

One catalogue, three surfaces, no native chrome anywhere:

- **Phone (iOS/Android)** — the full product. Custom UI only: SystemBars consumed for
  immersive player (bars hidden, safe-areas respected), MenuBar unused. Every screen is
  template-owned DSX; the player + paywall are `VerticalPlayerStack`.
- **Web (SSR)** — the same product, Netflix-shaped where hover/width exist. SSR via `<api>`
  blocks; streaming shell for the feed. SEO: every show and episode has a canonical route.
- **Admin (Manage View)** — rfcs/0003. Not a tab in the consumer app; a declared surface
  mounted by the Despia dashboard / mobile app / MCP.

## 2 · Navigation

```
Tabs: Home · Discover · Rewards · My List · Profile
Overlays: Player (full-screen, owns system bars) · Paywall sheet · Search
Web adds: header nav + footer; tabs collapse into it ≥768px
```

### Home
Hero pager (3–5 curated) → shelf rows: Continue Watching (resume), New Releases, Top 10
(ranked badges), per-genre rows, Coming Soon (bell → premiere reminder + calendar entry).
Web: same rows as horizontal scrollers; hero is LCP-optimized poster + preloaded HLS init.

### Discover
Vertical pager of trailers/EP1s, autoplaying muted → sound on first gesture. Overlay: title,
genre chips, ❤ favorite, share, "Watch now" → player at EP1 (or resume point). Infinite,
server-curated (`feed` route: editorial slots + popularity + genre affinity; the algorithm is
a server document — inspectable, tunable in admin — not a black box).

### Player (VerticalPlayerStack)
Payload from `show.play` route: episodes[] with per-episode `locked`/`cost`, resume position
server-side. Gestures: tap pause · hold 2× · swipe up next/down previous · scrub with frame
strip. Drawer: episode grid (lock badges), speed (0.75–2×), subtitle track, dub track, quality.
Paywall sheet (module-owned, white-labeled): unlock face (price hero, balance pill,
Unlock / Get-Coins capsules with ad counter, auto-unlock toggle, VIP slab) and store face
(coin packs grid + Restore). Events stream to template JS → analytics + progress sync.

### Rewards
Check-in calendar (7-day escalation, day-30 milestone; restore-streak via ad, 1/month) ·
task list (one-shot + daily; claim buttons) · rewarded-ad slots ("+8 coins", counter 0/10) ·
spin wheel (free spin badge; prize table rendered from server config). Every grant animates
into the wallet pill (bonus coins, 7-day expiry noted inline).

### My List — Continue Watching · Favorites · Downloads (per-show groups, storage meter,
remove/all) · History. Downloads UI reads `verticalplayer.downloads()` catalog.

### Profile — wallet (balances + ledger), VIP card (status/renew/manage), transactions,
language (content + UI locale), notification preferences (per-segment toggles!), linked
account (Auth: Apple/Google/email OTP; guest-first — wallet attaches to device, merge on
sign-in), support, legal.

## 3 · The economy (defaults; all server config, all admin-editable)

| Knob | Default |
|---|---|
| Episode price | 60 coins; per-show override; EP1–8 free |
| Coin packs | 0.99/100 · 4.99/550 · 9.99/1200 · 19.99/2600 · 49.99/7000 · 99.99/15000 (first purchase ×2) |
| Bonus coins | earned currency; spend-first; expire 7d |
| Rewarded ad | +8 bonus coins; 10/day cap; 3-ads-per-unlock counter |
| Check-in | 5·10·15·20·25·30·60; day-30 = 200 |
| Spin wheel | 1 free/day; prizes 10–100 bonus + 24h-VIP rare; odds server-declared |
| VIP | weekly 7.99 · annual 129.99; whole catalogue, zero coin walls, ad-free |
| Premiere drip | 5 eps/day at 20:00 local for launching shows |

Trust rule: **the server is the only wallet.** Client shows optimistic balances; every spend,
grant, and unlock is a server decision (VerticalPlayerStack already polls/reconciles).

## 4 · Notifications, Live Activities, widgets

Declared as data (segments/templates in the backend; composable in admin — rfcs/0003 §7):
push segments per research §5 with per-user opt-outs mirrored in Profile; Live Activities:
premiere countdown, batch-download progress, streak guard; Widgets: Continue Watching,
streak+wallet glance; Quick Actions + Spotlight show indexing; share links = web URLs
(`https://{host}/s/{show}` → app when installed, SSR page otherwise).

## 5 · Definition of done (per Article 10)

Every row above lands on **all** renderers or carries a named degradation in this file.
Currently named: web has no AdMob rewarded lane (tasks/purchases substitute; the Get-Coins
capsule hides on web); Live Activities are Apple-lane (Android twin = ongoing notification
via OneSignal, the module's own degradation).
