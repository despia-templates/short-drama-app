# Bare-icon tap controls: 22pt targets pass review, and there is no hit-slop primitive

**Filed:** 2026-08-31 · **Framework:** despia-framework `dev@e7f77604` · **Severity:** medium (UX)

## What happens

`<image icon="chevron.left" iconSize="22" on:tap="…" a11yTrait="button"/>` — the player-chrome
back idiom — hit-tests exactly its 22×22pt glyph on native. Measured on an iPhone 17 Pro sim:
a tap at (40, 87) against an icon spanning x=16..38 misses by 2pt and falls through to the
pager below; the same reach on a phone-sized thumb misses most of the time. A/B probe: the
identical chrome over a plain stack vs over a pager both hit at the glyph's center and both
miss 2pt outside it — no hit-stealing anywhere, just a mouse-sized target on a touch screen.

## Two asks

1. **`despia review` should flag it.** The design gate already owns tap targets, but an
   icon-only `on:tap` image sails through at 22pt. Rule shape: any element carrying a tap
   handler whose rendered box is under 44×44pt (Apple HIG / Material's 48dp) is a finding,
   with the padding fix named.

2. **A hit-slop primitive.** The template fix — `paddingV="11" paddingH="11"` on the icon —
   grows the box visually as well as hit-wise, which shifts layout. Native toolkits solve
   this without moving pixels (UIKit pointSize/`UIButton` insets, RN `hitSlop`, Compose
   `minimumInteractiveComponentSize`). A `hitSlop="11"` universal attribute (or an automatic
   44pt floor on tap controls, layout untouched) would make the correct thing free on every
   renderer.

## Template state meanwhile

The Watch back chevrons carry the 11pt padding (44pt targets); the rest of the app's icon
taps are being swept the same way. The paddings are honest but visible — the primitive would
let the design stay measured while the hit area stays human.
