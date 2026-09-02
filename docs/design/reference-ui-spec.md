# Reference UI spec — the target look, measured (2026-09-02)

The founder supplied twenty phone screenshots of the app this template must match screen for
screen ("this is how they should have the UX / UI"). Agents cannot see those images; this file
is the single source of truth transcribed from them. Every number below was read off 601×1306
screenshots of a 390×847pt iPhone (1px = 0.649pt) and is quoted in **pt, ±2**. Where two
readings disagreed the larger one is kept and marked `~`. Colours are eyeballed to the nearest
system tone; when the app's own palette (`Components/parts/Theme.dsx`) has a named tone within
ΔE of the sample, use the named tone — never a new raw hex (the `check:styles` gate refuses it).

**What we copy and what we do not.** Layout, hierarchy, spacing, type ramp, motion and the
information architecture are copied 1:1. The reference's brand marks, its logo, its "V ORIGINAL"
badge art, its show titles and posters are NOT copied: badges carry OUR mark and the word
"ORIGINAL"; art is our own catalogue. Two of the twenty shots belong to a second app ("Shorts":
pink brand, floating pill tab bar, a paywall with social proof and a star rating). Those are
NOT the target; they are noted at the end as optional inspiration only.

**Engine law still applies.** If a screen needs something the renderer cannot do (a playback
rate, a subtitle track list, a long-press-to-scrub gesture, a Live Activity), the engine gets the
capability and the corpus row; the template never fakes it with a workaround. PLAN.md §6 records
every gap found.

---

## −1 · The custom-UI law (founder, 2026-09-02): NO native theming, anywhere

"Drama apps come with custom UI — Netflix, DramaBox, ReelShort — 1:1 on web, iOS and Android."
This app is `design: "custom"` and that means the SAME pixels on every lane, drawn by the DSX
design, never by the platform's theme:

- **No platform chrome.** No system navigation bar, no Material action bar or app bar, no
  system tab bar tint, no Material colour roles reaching the page (`background`/`surface` are
  the app's tokens, §0). System bars are transparent over the app's ground, icons follow the
  ground's luminance. Splash is the app's own brand screen on both platforms.
- **No platform controls.** Toggles, checkboxes, pickers, segmented tabs, sliders, text fields,
  alerts, toasts, menus and option lists are the DSX custom-design components with the geometry
  below — never `UISwitch`, never an M3 `Switch`, never a Material dialog, never a system menu
  picker, never a native alert. A selection list is a sheet of rows with a check (§3d).
- **Sheets are the app's.** Bottom sheets keep the presentation mechanics (detents, drag to
  dismiss, cascade) but paint the app's chrome identically: panel fill, top radius 20, a grabber
  36×4 `#48484A` centred 8pt below the top edge, dim `rgba(0,0,0,.6)` behind, no system tint.
- **Fonts and icons are the app's** on every lane (Inter via the registry; unified icon paths).
- **If a lane leaks the platform look, the ENGINE is wrong**, not the markup: the fix goes into
  the custom-design lane of that renderer with a pixel-parity corpus row, and PLAN.md §6 records
  it. Comparing the three lanes side by side on the same screen is part of every gate.

Custom control geometry (measured on the reference's More sheet and permission sheet):
- **Toggle**: track 51×31, radius 15.5; off `#39393D`, on gold `#F5C518` (a members-only
  toggle carries the crown 14 to its left); knob 27 white with shadow `0 2 4 rgba(0,0,0,.3)`,
  2pt inset; 0.2s ease.
- **Checkbox**: 20×20, radius 5; on = accent fill with a white check 12; off = 1.5pt `#48484A`
  outline on card fill.
- **Check mark (selected row)**: 16pt ink glyph, trailing, row 52.
- **Text field** (search): §1 geometry; focus ring none, caret ink, clear button 16 ink-3.
- **Segmented/tab strip**: labels 17 semibold, 2pt underline, no pill.
- **Slider/seek**: track 4 `rgba(255,255,255,.3)`, fill ink, thumb 14 white (the player).
- **Toast**: card fill, radius 10, 13 ink, padding 10×14, centred 88pt above the safe bottom,
  1.5s.
- **Alert / confirm**: a centred card 300 wide, radius 16, panel fill, title 17 semibold,
  body 15 ink-2, buttons as 48pt rows separated by hairlines — never the system alert.

## 0 · Palette and type ramp (shared by every screen)

| token | value | used for |
|---|---|---|
| bg | `#000000` | every screen ground |
| panel | `#141414` | sheets, coming-soon card panels |
| card | `#1C1C1E` | plan cards, checkbox card, search field |
| chip | `#2C2C2E` | genre chips, episode cells, Remind Me (inline), icon tiles |
| ink | `#FFFFFF` | titles, active labels, prices |
| ink-2 | `#C7C7CC` | synopsis body, locked episode numbers |
| ink-3 | `#8E8E93` | secondary labels, inactive tabs, footnotes |
| accent (ReelShort pink/red) | `#FF2C55` | the founder's call, 2026-09-02: the reference app is teal here, ReelShort's pink/red is what this template wears — current-episode outline + equaliser, timer ring, "(Required)", checkbox, the tab-bar coin callout (white figures), the selected plan outline and the saved bookmark; the Live Activity / widget CTA is `#FF3D5D` (ReelShort's own player pink) with white ink |
| gold | `#F5C518` | crown, plan titles, "% OFF" badges, unlock pill text; CTA fill `#F5D33D` |
| gold-dim | `#3B3410` | unlock pill fill |
| hot red | `#E0342C` | HOT / NEW badges |
| select green | `#8DD35F` | the selected plan card's outline |
| hairline | `rgba(255,255,255,0.12)` | dividers |

Type (SF Pro on iOS, Inter elsewhere — the app's registered face): **22 bold** section headings ·
**20 bold** sheet titles · **17 semibold** tabs, row titles, episode titles · **17 bold** the
player's "EP.1" · **15** body and card titles (semibold when a title) · **13** secondary · **12**
rail labels and footnotes · **11 bold** badges. Body line height 20 (15pt) / 18 (13pt).

Radii: cards 12 · posters 6 (grid) / 8 (rail, sheet poster) · chips 6 · buttons 12 (48pt) and
14 (52pt CTA) · pills fully round. Horizontal gutter **14pt** on Home, **16pt** in sheets and
the player. Section gap 24pt. Tab bar 56pt + safe bottom.

---

## 1 · Home (tab "Hot")

Top to bottom, left gutter 14:

1. **Search bar row** (y 62–102): field x 14→334, h 40, radius 12, fill card; magnifier 16pt
   ink-3 inset 12; placeholder 15pt ink-3 = a rotating trending title ("Falling Into a Dangerous
   Love"), never the word "Search". Right of it, 12pt gap, the **crown button**: gold crown 22pt,
   no background, tap → the Membership page (§6).
2. **Tabs row** (y 110–134): `Hot · New · Picks · Ranking · Anime · Categories`, 17 semibold,
   active ink / inactive ink-3, 20pt between labels, horizontally scrollable, active underline
   2pt ink, width = label, 6pt under the baseline. `Anime` and `Categories` may be dropped if the
   catalogue has no such facets; keep `Hot New Picks Ranking` at minimum.
3. **"Trending Now"** 22 bold, 24pt above, 16pt below.
4. **Grid**: 3 columns, gap 7, card width (390−28−14)/3 ≈ 116; poster **2:3** → 174 tall,
   radius 6. Overlays: top-right badge `HOT` or `NEW` — hot red fill, 11 bold ink, padding
   6×2, radius 4, inset 6; bottom-left `ORIGINAL` mini badge — our mark 10pt + "ORIGINAL"
   10pt uppercase ink, on a 56pt bottom scrim `rgba(0,0,0,.6→0)`; bottom-right flame icon 12 +
   view count "757K" 13 semibold ink. Below the poster: title 15 semibold ink, max 2 lines,
   6pt top; genre 13 ink-3, 2pt top. Rows 20pt apart.
5. **Tab bar** (§8).

## 2 · Home (tab "New")

1. **"Coming soon"** 22 bold. Horizontal rail, left inset 14, card gap 8, cards **113 wide**
   on a panel (`#141414`, radius 12, no padding above the poster): poster 2:3 radius 8 with the
   ORIGINAL badge bottom-left; title 15 semibold, ONE line, ellipsis; genre 13 ink-3; then
   **Remind Me** inline button: full card width minus 8pt insets, h 32, radius 8, fill chip,
   label 15 semibold ink. Tap on the poster → the coming-soon sheet (§2a); tap Remind Me → §2b.
2. **"New Titles"** 22 bold. Vertical list, rows 16pt apart: poster 81×127 radius 6 (NEW badge,
   ORIGINAL, flame count as in §1); right column (12pt gap): title 16 bold ink one line; chips
   row (`CEO`, `Enemies to Lovers` …): fill chip, 12 ink, padding 8×4, radius 6, gap 6, one
   line, overflow clipped; synopsis 13 ink-3, 2 lines, ellipsis.

### 2a · Coming-soon sheet
`half,full` detents, panel fill, grabber. Content centred: poster 110×165 radius 8 (ORIGINAL
badge); title 20 bold, 2 lines; chips row centred (as §2); synopsis 15 ink-2 centred, line
height 22, 4 lines then "…"; **Remind Me** button: full width (16pt insets), h 48, radius 12,
fill ink, label 17 semibold `#000` with a bell icon 16 leading.

### 2b · Notification-permission sheet (NESTED over 2a — both cards visible, the parent dimmed)
`content` detent: bell illustration 64pt (a real asset, not an emoji glyph); title 20 bold
centred, two lines: `'{{ title }}'` / `Don't miss the release!`; subtitle 15 ink-3 "To receive
notifications, turn on the settings below."; a card (fill card, radius 12, padding 16) with a
teal checkbox 20 + "Allow notifications" 15 ink + "(Required)" 15 accent; white **Remind Me**
(as 2a); "Maybe next time" 15 ink-3 centred, 16pt below. Confirm → schedule a local
notification for the release date (Core/LocalPush) and record the reminder server-side.

## 3 · Player

Full-bleed bg; the clip (9:16) vertically CENTRED between the top chrome and the bottom meta,
letterboxed; safe-area insets paid back through the screen facts.

- **Top chrome** (y safeTop+12): back chevron 20 ink at x 16; "EP.1" 17 bold ink at x 44.
  Top-right (x 352): the **Watch Mission** hourglass 28pt with a 2pt accent progress ring; tap →
  §3c. Chrome fades with the rail when the viewer taps the stage (existing behaviour).
- **Right rail** (right inset 16, bottom of the last item 200 above the safe bottom, item gap
  24): `Save` (bookmark), `Episodes` (layers), `Share` (square.and.arrow.up), `More` (ellipsis)
  — icons 26 ink, labels 12 semibold ink, 4pt under the icon. Saved state paints the bookmark
  filled in a lime tint `#C6E36A` (the reference's saved colour).
- **Bottom meta** (left 16, right edge 100 to clear the rail): title 17 bold ink one line + "›"
  chevron 14 ink-3 (→ the show page); synopsis 13 ink-2 two lines with a trailing "More" 13
  semibold ink (→ the Details tab of §3b); hairline divider full width 12pt below; then the
  **unlock pill**: fill gold-dim, text gold 14 semibold, crown 14 leading, "Unlock Unlimited
  Watching", h 40, radius 20, padding 16 — left-aligned; 34pt above the safe bottom. Hidden
  for members.
- **Hold-to-2×**: long-press anywhere on the stage → rate 2.0, chrome/rail/meta hide, a centred
  overlay "2.0x ▶▶▶" 15 semibold ink at y 70; the subtitle line (if any) stays centred at 58% of
  the height, 20 semibold ink with a soft shadow. Release → 1.0×.
- **Subtitles** render as one centred line at 58% height, 20 semibold ink, shadow
  `0 1 2 rgba(0,0,0,.8)`, when the viewer picked a track (§3d).

### 3a · More sheet (`content`)
Rows 52pt, title 17 ink left, value 15 ink-3 right, chevron 12: `Playback Speed · 1.0x ›`,
`Subtitles · English ›`, `Video Quality · Auto(720p) ›`, `Mini View (PIP mode) 👑 · toggle`
(the crown is the gold icon, and the toggle is members-only: a non-member's tap shows the
small toast "Mini view (PIP mode) is for members only." for 1.5s); hairline; `Report` 17 ink-3.
Each `›` row opens a NESTED sheet (§3d) over this one.

### 3b · Episodes sheet (`half,full`)
Grabber; the show's **title art** centred (~180×80, the show's logo image; fallback: title 20
bold); "Romance · Billionaire" 15 ink-3 (genres joined with " · "); tabs `Episodes | Details`
17 semibold, underline 2 ink under the active one, 24pt apart, left 16; 16pt below:
- **Episodes**: range chips `1-40(Completed)` 15 bold ink (one chip per 50 when longer, the
  active one ink and the others ink-3); grid **5 columns**, gap 8, cells 65×38 radius 8 fill
  chip, number 17 bold ink; the CURRENT cell: 1.5pt accent outline, no number, an accent
  equaliser glyph (three bars); LOCKED cells: number ink-2 and a 10pt lock icon top-right ink-3;
  free-until boundary is where the locks start (no caption).
- **Details**: synopsis 15 ink-2, line height 22; 24pt gap; "More Like This" 20 bold; a 3-column
  poster grid exactly as §1 (title 15, genre 13).

### 3c · Watch Mission sheet (`content`)
Hourglass icon 44 (asset); "Watch Mission ⓘ" 20 bold (ⓘ 16 ink-3 → a tooltip with the rules);
body 15 ink-3 "Earn bonus coins at 5, 10, 20 & 30 mins! You can get up to 70 coins daily to
unlock premium episodes."; outlined **Hide Timer** button (1pt hairline border, radius 12, h 48,
label 17 semibold ink); footnote 12 ink-3 "Timer hides automatically but reappears when you
restart the app." The ACCRUAL IS SERVER-SIDE: the client reports heartbeats, the server counts
watched minutes and grants at 5/10/20/30 with a 70/day cap (the founder's law: no client grant).

### 3d · Option sheets (nested over 3a, `content`)
Title 20 bold left 16; rows 52pt, 17 ink, a trailing check 16 ink on the current value:
- **Playback Speed**: `1.0x (Basic)` · `1.25x` · `1.5x` · `2.0x`.
- **Subtitles**: `English`, `日本語`, `한국어`, `Español`, `Bahasa Indonesia`, `Português`, `ภาษาไทย`,
  `اللغة العربية`, `繁體中文`, `简体中文` — the tracks the asset actually carries, in their own
  language names (endonyms, never translated).
- **Video Quality**: `Auto(720p)` · `720p` · `480p` · `240p` — the variants the stream carries.

## 4 · Show detail (route `/show/:id`)
Not in the reference set; keep ours, but restyle it with §0 tokens and reuse the §3b Details
block (synopsis + More Like This) so the two agree.

## 5 · My List
Keep the structure; under a device session it is a real list (see the device-identity work in
PLAN.md), grid cells as §1. Empty state: bookmark 44 ink-3, "Nothing saved yet" 17 semibold,
"Tap Save on any episode" 15 ink-3.

## 6 · Membership page (route `/membership`, pushed; also opened by the crown and by the unlock pill)
- Nav: back chevron left 16; **centred** title "Membership Subscription" 17 semibold ink.
- **Plan cards** (16 gutter, gap 10, fill card, radius 12, padding 16; the SELECTED card has a
  1.5pt select-green outline): title 13 semibold gold (`Weekly Membership`); price row: `AED
  69.99` 22 bold ink + `/1 Week` 13 ink-3 (+ the struck original `AED 259.98` 13 ink-3 when
  discounted); description 13 ink-3 ("Watch all episodes unlimited for a week!"); a 3D gold
  crown 40pt right-aligned; a corner badge `50% OFF` gold fill, `#000` 11 bold, radius 6,
  overhanging the top-right corner by 4pt. Three plans: Weekly (selected by default), Monthly
  (50% OFF), Annual (68% OFF). Prices and periods come from the STORE CATALOG (StoreKit / Play
  localized price strings), never typed in markup.
- **"Membership Rewards"** 17 bold, 24 above; rows 14pt apart: icon tile 36 (fill chip,
  radius 8, icon 18 ink) + label 15 ink: `Unlimited dramas` · `Watch ad-free` · `Gift a free
  viewing pass to a friend ›` · `Mini View (PIP mode) available` · `More membership perks coming
  soon`.
- **CTA**: full width, h 52, radius 14, fill `#F5D33D`, label 17 bold `#000` "Unlock for AED
  69.99" (the selected plan's localized price); 8pt below: "Selected Plan: Weekly Membership ·
  Auto-Renewal" 12 ink-3 centred; then `Restore · Terms of Use · Privacy Policy` 12 ink-3.
- The purchase is a REAL in-app purchase through Core/Store (RevenueCat provider): checkout →
  StoreKit / Play Billing → the RevenueCat webhook grants the entitlement server-side → the
  client refreshes `/wallet/state`. No refusal cards, no "purchasing is off" notes anywhere.

## 7 · Live Activity / widget — "Currently Watching"
A dark card (`#0E0E10`, radius 16, padding 14 × 10): poster 72×108 radius 8 left, a 12pt gap; "Currently Watching" 12 ink-3; the title 20 bold, two lines; `EP.n` 12 ink-3 (column spacing 2); top-right a 20pt tile (`#1C1C1E`, radius 6, padding 3) holding the 14pt app mark; the CTA pill full-width at the bottom of the column — `#FF3D5D` (ReelShort's player pink, the founder's accent call) radius 10, 7pt vertical padding, "▶︎ Continue Watching" 14 bold white — so the card is about 1.2× the poster height and the button about a third of it, the reference's proportions. The first cut (radius 20, padding 16, a 42pt button with 17pt ink, a 36pt tile) read "too chunky" beside the reference on 2026-09-02 and these are the re-measured numbers. The whole card deep-links to `/watch/<show>/<idx>`. iOS: a Live Activity while an episode is in progress and a Lock Screen / Home widget after; Android: a Glance widget. Through the framework's Widgets / Live Activity lanes (Core/Widgets, Core/OneSignalLiveActivity, `StackActivity.swift`, `:glance`).

## 8 · Tab bar (five tabs, replaces Home / For You / VIP / My List / Profile)
`Home` (house) · `Explore` (play.circle — the vertical feed) · `My List` (bookmark) · `Rewards`
(a coin-stack icon with a teal callout bubble above it showing the claimable coins, e.g.
`+2230`) · `My Page` (person). Icons 24, labels 11; active ink, inactive ink-3; h 56 + safe.
VIP leaves the bar: it lives in the crown button, the unlock pills and the Membership page.
`Rewards` is a tab root: daily check-in, the Watch Mission progress, ad rewards (the existing
Rewards surfaces re-homed). `My Page` is the current Profile, restyled with §0.

---

## Appendix — "Shorts" (the other app; inspiration only, not the target)
Floating pill tab bar with a separate round search button; a hero carousel with `▶ Play` +
`+ My list`; a gold "Unlock all series for 1 week · AED 79.99 · Claim Now" promo card; a
"continue watching" mini bar above the tabs; a paywall with live social proof ("Amelia just
bought a Monthly VIP"), a 4.7★ rating line, a poster fan, and `Privacy policy · Terms of use ·
Restore` footer links. If the team wants social proof or ratings on §6 later, this is the shape.

## 9 · Rewards — the industry-standard page (founder's reference set, 2026-09-02, 20 shots from DramaBox "Reward coins / Member Points", iDrama "Rewards / VIP Points", NetShort VIP/Store)

All numbers in pt, read off 1206×2622 iPhone captures (÷3). Ours keeps the ReelShort pink accent
(`accent()` #FF2C55) wherever the references use their brand pink/teal/green gradients; gold
(`crownGold()` / coin gold) for amounts and coins; **no native theming, custom UI on all three lanes**.

### 9.0 · Frame
- Route `/rewards` is a tab root (tab bar stays). Header row 44 tall under the safe top: back
  chevron 20 at x 26 (pops); TWO TABS centred as a segmented text pair — "Reward coins" (17 bold,
  ink) and "Member Points" (17, ink-3) 24 apart, the active tab underlined by a 26×2 bar (ink, radius
  1) 6 below the text. Swiping between tabs is a `<pager>`; the underline follows the resting index.
- A "Rules" pill hugs the RIGHT SCREEN EDGE at y 108 (below the header): 48×31, radius 16 on its
  two left corners only, bg rgba(255,255,255,0.12), label 15 ink; tap → the Rules sheet (9.6).
- Page bg #0E0E0E; content inset 16; section gap 28.

### 9.1 · Balance hero (tab 1)
- Left: the coin balance as a 40pt bold GOLD number at x 31, y 118 (baseline), "Balance" 15
  ink-3 below (8 gap). Right: a decorative illustration (a 3D coin with a check + sparkles, generated
  asset `public/assets/rewards-hero.png`, 2:1, ~230×160 at the right edge, 40% opacity gradient into
  the page). The hero band is 105→183 (78 tall) and reads as part of the page, not a card.

### 9.2 · Check-in card
- Card 16 inset, radius 16, bg #1A1A1A, padding 16, at y 186; title "You've checked in for {n} day!"
  17 regular ink with `{n}` in gold; 16 below: SEVEN CELLS in one row, each 44×82, radius 8, bg
  #262626, gap 5 (fills 368): "+10" 15 bold ink (gold on the current cell), a 19pt coin glyph
  (catalog icon `dollarsign.circle.fill` in gold; the claimed cell shows a check in ink-3), the label
  "Today" / "Day 2"…"Day 7" 13 ink-3. Claimed cells dim to 40% ink; the current cell carries a
  1pt accent outline. Amounts: 10·20·20·10·10·25·40 (server-owned; the UI reads them).
- 16 below the cells: the CHECK-IN BUTTON, full card width, 47 tall, radius 8, bg accent, label
  "Check in" 20 semibold white; disabled (already checked in today) → bg rgba(255,44,85,0.35),
  label "Checked in ✓". Card bottom padding 16.
- After a successful check-in → the SUCCESS MODAL (9.5).

### 9.3 · "Earn Rewards" task list (tab 1)
- Section title "Earn Rewards" 17 semibold at y 441 (28 below the card). Then ROW CARDS, one per
  task, 74 tall, radius 12, bg #161616, 12 apart, padding 16:
  · a 44 round icon tile (bg #2A2A2A) with a 19pt catalog glyph in WARM GOLD (#F6D27A);
  · title 17 regular ink at x 83; subtitle 15 ink-3 with the amount in gold, e.g. "+ 60 Reward coins",
    or a progress "(0/15)" 15 ink-3 after the title;
  · trailing ACTION PILL 75×31, radius 8, bg accent, label 15 semibold white: Sign In · Claim · Link ·
    Watch · Follow · Go · Invite. A done task shows the pill as rgba(255,44,85,0.2) with "Done" in accent.
- The rows, top to bottom (every grant is SERVER-VERIFIED — no client-originated credit, per the
  monetisation law; rows whose completion the server cannot verify grant NOTHING and say so):
  1. Login with any account — "+ 60 Reward coins" — Sign In → the auth seam; granted by the server
     when a device links an account (once per account).
  2. Turn on push notifications — "+ 60 Reward coins" — Claim → `notify.permission()`; granted when
     the server receives the device's push token (once per device).
  3. Earn rewards (0/15) — "Watch a video to earn 20 coins" — Watch → the rewarded-ad lane
     (Article 7 degradation named on the web, as today).
  4. Watch for 5 mins — "+ 10 Reward coins" and Watch for 15 mins — "+ 20" — Go → `/discover`;
     granted by the watch-mission ledger (server ticks).
  5. Invite friends — "Earn up to 500 coins daily" — Invite → the share sheet with a referral link;
     granted when the invitee's device completes its first server-verified watch minute.
  6. Follow us on Facebook / YouTube / TikTok / Instagram — subtitle "Help us grow" — Follow → opens
     the link. NO coins: a follow cannot be verified server-side, so the reference's "+20" is a
     client-trusted grant we deliberately do not make (say so in the ledger, PLAN.md).
  7. Share with friends — "Help us grow" — Go → the share sheet; no coins, same reason.
- Footer: "This activity is not affiliated with Apple Inc." 15 ink-3 centred, 40 below the last row
  (App Store 3.1.1 wording for reward promotions); the tab bar clearance below.
- The existing Watch Mission card, ad card and Spin the wheel: fold the Watch Mission into rows 3–4
  (keep the mission ring/state on the player); keep Spin the wheel as a card AFTER the task list
  ("Spin the wheel" 17 semibold, the wheel as today) — it is a server-owned grant already.

### 9.4 · "Member Points" (tab 2)
- Hero: "Daily Rewards" 24 bold ink at x 16, y 118; right: a points pill "⚡ {points} ›" (18 semibold,
  gem glyph in the accent) — points = the membership points balance (server, new field on the
  wallet). The band behind the header carries a pink→purple gradient wash (accent at 30% → #6A2A7A
  at 20% → transparent, 200 tall).
- Card "Your Membership Day {n}" (17 semibold centred, radius 16, bg #1A1A1A, padding 16): a 5-node
  TIMELINE (Day n-2 · Day n-1 · Today · Day n+1 · Day n+2): labels 15 (Today in accent), 22pt gem
  glyphs on a 3pt track (#3A3A3A); claimed days = gem in accent, unclaimed past days = a grey "sad"
  glyph with "Unclaimed" 13 ink-3, an accent ▾ 8 under Today. Non-members see the same card with
  "Become a member to claim daily points" and a "See plans" pill (→ /membership).
- Rows (same row-card recipe as 9.3): "Daily Draw" (+?? — a random 5–50 points, Claim, once a day),
  "Watch & Earn" (+50, "Watch for 30 Minutes", Claim when the mission ledger says 30 min today).
- "Recommendations / More ›" — a 3-poster row (poster 3:4 radius 8, title 15 ink below, 1 line).
- "Enable Push Notifications" row (+30, "Get daily rewards and must-see content.", Open).
- "Redeem Points" 24 bold; subtitle "This redemption extends your membership period only.
  Auto-renewal stays the same." 15 ink-3 with a ⓘ 20 at the right; cards (radius 16, bg #1A1A1A,
  padding 20): a 72 square tile (accent→#7A2A50 gradient, "+1" / "+5" 28 bold white over a small
  gem), "1-Day Membership Extension" 20 ink 2 lines, "⚡ 500" 15 gold; trailing "Redeem" pill 108×40
  radius 8 (bg #2A2A2A + ink-3 label when unaffordable; accent + white when affordable). Server
  route `POST /rewards/redeem` extends `vipUntil` by the days and debits the points — idempotent per
  day+card.
- "Coming Soon" band: full-bleed gradient (#3A1030 → #0E0E0E), title 24 bold, a date "09/03" 15,
  a 1pt track with an accent ▶ marker, then the coming-soon rail (poster 3:4 with a "Remind Me"
  pill 113×35 radius 18, bg rgba(255,255,255,0.15), alarm glyph 16 + 15 semibold) — reuse the Home
  "Coming soon" rail + its permission sheet (§2a/2b).

### 9.5 · Success modal (after check-in / claim)
- The page dims 60%; a centred card 314 wide, radius 20, bg #1A1A1A, padding 24, with a 87pt coin
  illustration (`rewards-coin.png`, generated) overlapping the top edge by 44; "Success" 22 bold
  centred; "Congratulations on getting {n} coins" 15 ink; 20 below: a full-width 47 CTA, radius 24,
  gradient accent→#FF6A3D, label "Watch Ad to earn 30 coins" 17 semibold white with an "AD" glyph
  (hidden on lanes without the ad module — Article 7: the card then ends with a "Done" pill).
  Dismiss on scrim tap; a ⊗ 28 below the card. `<sheet>` mode card, `a11yLabel="Reward received"`.

### 9.6 · Rules sheet
- Bottom sheet (`detents="content"`, top radius 20, bg #1A1A1A): a chevron-down 24 at the left,
  "Rules" 20 bold centred; the rules as a numbered list 17 ink, 1.35 leading, 16 inset:
  1 check in once per day (a missed day restarts the cycle), 2 coins unlock episodes (history under
  My Page → Transaction History), 3 the earliest-expiring bonus is spent first, then coins, 4 check-in
  and daily tasks reset at 00:00 in the viewer's time zone, 5 the operator's right of final
  interpretation. A full-width 47 "Got It" pill (accent) closes it.

### 9.7 · Enable-notification modal (from rows 2 / 9.4)
- Centred card 314 wide, radius 20: a 120-tall phone mock at the top (the app name + an "Allow
  notifications" toggle ON, on a #2A2A2A plate), "Enable Notification" 20 semibold, three benefit
  columns (glyph 44 + label 15: "New Shows" · "Bonus Rewards" · "Promos"), a full-width "Enable" 47
  pill (accent) → `notify.permission()`; ⊗ below. Reuse §2b's permission copy and the same module.

## 10 · Store / VIP / Membership polish (NetShort + iDrama references)
- Membership cards (`/membership`, `/store`): the selected card wears a 1.5 gold border (#F6B63D) AND
  a countdown badge "05:59:59" (13 semibold white on accent, radius 8 on the outer corner only)
  pinned to its top-right when a limited offer is live (server field `offerEndsAt`; hidden otherwise);
  card body: plan name 20 semibold gold, price 32 bold gold + "/week" 17 ink-3, "Auto renew, Cancel
  anytime" (subscriptions) or "One charge, no auto-renewal" (passes) 15 ink-3, then a 2×2 BENEFITS
  GRID (glyph 18 + label 15: Unlimited viewing · Ad-Free · 1080P quality · Download), 20 padding.
- Coin packs: 2×2 cards radius 12, "🪙 2500" 24 bold + "+300" 17 ink-3, price 17 ink-3 below.
- "Tips:" 17 semibold + numbered 15 ink-3 lines (recharge instructions: 1 free and paid content,
  2 coins/bonus/membership unlock, 3 the pass covers everything while active, 4 benefits within 24h
  per the store's order status, 5–6 the renewal and cancellation rules) — copy per lane: App Store on
  iOS, Google Play on Android, "your card" on the web.
- A PAYMENT ROW above the sticky CTA on native: "🍎 Apple" / "▶ Google Play" outlined pill (1pt
  accent border, radius 12, 48 tall); web: "Card (Stripe)". Then the sticky CTA "Pay now" /
  "Subscribe Now" 52 tall radius 26 accent, "Auto-renewal·Cancel anytime" 13 ink-3 under it (subs).
- VIP page header: "Restore" pill top-right (15, rgba(255,255,255,0.12), radius 8) → restore
  purchases (works anonymous); the member state line "Visitor · VIP expired on {date}" / "VIP until
  {date}" 15 ink-3 under a 72 avatar tile.
- "Good Bargain" corner badge (13 semibold white on an accent→#FF6A3D gradient, radius 8 on the outer
  corner) on the best-value plan.
- The "Surprise — Limited Time Offer" modal (a gold coupon card with the offer price, "Subscribe Now —
  {intro} for 1st week, then {price} per week", legal lines) is OPTIONAL and server-driven
  (`offer` on `/store/plans`); implement the surface, show it only when the server sends an offer.

## 11 · Browse list rows (genre page reference)
- `/browse/:genre`: header with the genre title centred; chips "Trending" (accent-tinted: bg
  rgba(255,44,85,0.18), label accent) | "Latest" (ink-3) at y 120; then LIST ROWS 20 apart: poster
  118×157 radius 8 with a play-count badge "▶ 67.4M" (13 semibold white, bottom-right, 8 inset) and
  an optional "Hot" tag (accent, 13, top-right); to the right: title 20 semibold ink 2 lines,
  synopsis 15 ink-3 3 lines clamped, meta row 15 ink-3 — "Betrayal, Doctor" left, "52 Episodes"
  right. Keep the 3-column grid for `/browse` (all series); the genre page uses these rows.
