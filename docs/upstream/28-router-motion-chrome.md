# router: motion has one knob too few for GLOBAL CHROME — a persistent bar rides every transition

**One line.** An app whose global bar switches at 768 (top bar replacing tab bar) had no way
to say so, so tablet widths ran the phone's iOS push **with the desktop bar mounted** and the
bar slid in from the right with the page.

**Status.** Both halves fixed upstream in this pass. Filed for the record and for the
template-side law at the bottom, which is worth documenting.

**Environment.** `dev@92b844b0`, `packages/dom/src/motion.ts` · `router.ts`. Measured in the
short-drama flagship from "the top bar should not move with page route changes".

**Two gaps, one symptom.**

**(a) `masterDetailBreakpoint` answered two unrelated questions** — where a master pane pins,
and where phone motion stops. These are not the same number for any app whose chrome switches
at a different width than its layout does. Fix: `motionBreakpoint`, defaulting to
`masterDetailBreakpoint`, so every existing app is byte-identical.

**(b) `wide` could only say `"none"` or `"same"`**, when the useful shape is a phone that
PUSHES while wide viewports CROSSFADE. Fix: `wide` accepts a family name; an unknown word
degrades to `"none"` (the config plane is cast, not validated).

**Why opacity is the whole answer on the wide lane.** The neutral family animates the
INCOMING frame's opacity while the frame beneath stays opaque and untransformed. A bar that
both frames paint identically therefore composites to a **constant** — it does not move and
it does not dip — and only the pixels that genuinely differ (an active link's tint)
cross-dissolve. Measured at 1440 and 900: one 160ms opacity animation, `transform: none` on
every frame, the bar at `[0, 0, width]` in every sample.

**Why the mobile lane needs a different answer.** No compositing trick saves chrome inside a
transforming frame. A pushed detail screen must not mount the tab bar at all — this is
UIKit's `hidesBottomBarWhenPushed`, and every reference app in the category agrees.

**Template-side law, worth adding to the docs.** `<TopNav>` must be the FIRST child of an
UNPADDED wrapper. A page style carrying `paddingTop` pushes the global bar off y=0 — measured
16px on one route and 12px on another against 0 everywhere else — so a route change visibly
DROPPED the bar. The padding belongs below the bar, on the content.

**Related.** The `chrome` universal attribute (`data-dsx-chrome`) landed alongside this so a
bar can mark itself once and no caller can forget; `motionTargets()` then animates the
frame's content and walks past the bar at every level.
