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
| accent (teal) | `#4ADFB4` | current-episode outline + equaliser, timer ring, "(Required)", checkbox, widget CTA (`#6EE7C5` on the widget) |
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
A dark card (`#0E0E10`, radius 20): poster 72×108 radius 8 left; "Currently Watching" 13 ink-3;
title 20 bold ink 2 lines; "EP.1" 13 ink-3; teal button `#6EE7C5`, h 44, radius 12, "▶ Continue
Watching" 17 bold `#000` (deep link `/watch/<show>/<idx>`); the app mark 24pt top-right in a
`#1C1C1E` tile. iOS: a Live Activity while an episode is in progress and a Lock Screen /
Home widget after; Android: a Glance widget. Through the framework's Widgets / Live Activity
lanes (Core/Widgets, Core/OneSignalLiveActivity, `StackActivity.swift`, `:glance`).

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
