# Stacked sheets — a `<sheet>` presented over a presented `<sheet>`

Research + design, written to be implemented without the author. Every claim below is either
cited to a file and line, or explicitly marked as *unmeasured — probe first*. Nothing here was
eyeballed.

---

> ## ⟡ RE-MEASURED 2026-09-01 on dev@71155a18, and the template SHIPPED two nested drawers
>
> This document was written before anything was built on it. It was mostly right and it is
> still the design record — but four of its claims did not survive a live probe, and its §6
> recommendation was overtaken by a defect it did not know about. Read this box first.
>
> **1. The nested sheet WORKS today, on the plain flat presentation.** A `<sheet>` declared
> inside a presented `<sheet>`'s slot presents as a real second level with no engine work at
> all. Probed on a throwaway two-sheet component and then on two shipped surfaces at 375×812:
> parent level 1 / child level 2, z 10001 / 10002, the parent's portal scope `inert` **and**
> `aria-hidden`, Escape closing exactly one level, focus restored to the exact control that
> opened the child, one document scroll lock across both and released on the last close, each
> level running its own detents, and drag-to-dismiss owning the top card only (a 176px pull on
> the child's grabber wrote `--dsx-sheet-drag: 88px` mid-gesture and dismissed to the parent).
> §2.2 predicted the ledger; what it under-sold is that this is **enough to ship on**.
> `Components/Watch.dsx` and `Components/parts/PlansSheet.dsx` each carry one now.
>
> **2. §2.3 S1a is FIXED upstream.** The `@media (min-width: 48rem)` rule no longer overwrites
> the drag channel — `overlay-controls.ts:1985` now spells
> `transform: translateX(-50%) translateY(var(--dsx-sheet-drag, 0px))`. The tablet/desktop
> sheet follows the finger. S1b (`--dsx-scrim-drag` written and read by nothing) is still open.
>
> **3. §1.3(c) is confirmed and it is the ONE gap that matters.** Closing a parent leaves the
> child presented and orphaned at level 1 with its `present` key still true — measured, the
> store reads `p=0 c=1`. That is the whole state half, and it is cheap: see PLAN.md §6.95.
> The template bridges it by hand (`closeDrawer`, `closePlans`) and says so at each site.
>
> **4. §4.3's note about routing was RIGHT, and it is worse than a note.** Three shipped
> surfaces in this template pushed a route from inside an open sheet and left the sheet
> painted over the new screen: the player's drawer, the search overlay and the house ad —
> the last of which went on playing its video behind the paywall it had just sent you to.
> All three are fixed by closing the sheet in an action before the push. This deserves to be
> Stage 1, not Stage 6.
>
> **5. §6.1's recommendation is overturned for the genre tag, on evidence it did not have.**
> Its case was sound — the desktop panel has no sheet, the in-sheet depth stack already ships,
> a `full` child hides the parent it is stacked on, and a sheet has no URL. But it was arguing
> against a *route that worked*, and the route did not work: the push left the drawer over
> /browse. What shipped answers each objection rather than ignoring it. The desktop panel
> (≥1120) keeps the route, because there is no drawer there to stack on and /browse/:genre is
> a page with room; the phone and tablet lanes get the level. The child is `detents="content"`,
> not `full`, so it hugs its result set instead of covering the parent for nothing. And the
> URL affordance stays reachable from inside the level — a "See all in {genre}" row closes
> both sheets and pushes. §6.1(5)'s real warning — that Watch is the riskiest screen to debut
> a second presentation on, because a playing `<video>` once killed presentation there
> (`Sheet.swift:395–404`) — is unresolved on device and is the one thing left to check.
>
> Everything below is unedited.

---

**Sources read (read-only; all were being edited concurrently by other agents):**

| File | What it settles |
|---|---|
| `~/despia_dsx/despia-framework/ClosedSource/DSX/Modules/Mandatory/Foundation/Components/Structure/Sheet/swift/Sheet.swift` | the iOS lane, 764 lines |
| `~/despia_dsx/despia-framework/OpenSource/Web/packages/dom/src/overlay-controls.ts` | the web lane, 1909 lines (factory + the whole overlay CSS) |
| `~/despia_dsx/despia-framework/OpenSource/Web/packages/dom/src/theme.ts` | `--dsx-radius-sheet: 20px` (482); `.dsx-frame` (663) |
| `~/despia_dsx/despia-framework/OpenSource/Web/packages/dom/src/router.ts` | frame planes, chain sheets, and the fact that routing ignores overlays |
| `~/despia_dsx/despia-framework/OpenSource/Web/packages/dom/src/present.ts` | the *other* presentation machine (`dsx.component.present`) and its already-pinned chain topology |
| `~/despia_dsx/despia-framework/OpenSource/Web/packages/server/src/render.ts` | SSR of `<sheet>` (499–535) |
| `~/despia_dsx/despia-framework/OpenSource/Web/packages/dom/oracle/{overlay-controls,media-surfaces,application-controls}-browser.ts` | the measurement harness, and the existing **modal-over-sheet** precedent |
| `~/despia_dsx/despia-framework/OpenSource/Documentation/reference/StackReference.md` | the declared `<sheet>` contract (616–650) |
| `Components/Watch.dsx` | the actual call site |

---

## 0. The verdict, up front

Three findings decide the shape of this document.

1. **The web already stacks a second modal over a sheet correctly** — level ledger, z-order,
   `inert`, per-level Escape, focus restore. It is not theoretical: it is pinned by an oracle
   that runs today (`oracle/media-surfaces-browser.ts:453–472`, a lightbox opened over a
   `.dsx-sheet-layer`, asserting `sheetLevel === "1"`, `lightboxLevel === "2"`,
   `backgroundInert`, and that the first Escape closes only the top). What is missing is not
   the *machinery*, it is the **presentation**: the card-stack look, the touch policy, and the
   state cascade.

2. **The web sheet does not do the iOS card-stack at level 1 either.** On iOS a single sheet
   scales the presenter back and rounds its corners; on web the app frame sits flat behind a
   dimmed, blurred scrim (`overlay-controls.ts:1515–1530`). So "make stacking feel native" is
   not a level-2 feature. It is a level-*n* feature, and it changes how **every existing DSX
   sheet in every DSX app** looks. That is the real scope, and it should be priced honestly.

3. **For the template's genre tag specifically, the nested sheet is the wrong instrument** —
   not because it is hard, but because the *same screen already ships the right one*, and
   because the desktop lane cannot host a sheet at all. See §6. The framework feature is still
   worth building; it should just not be gated on this tap.

---

## 1. What iOS gives you free

### 1.1 How a `<sheet>` presents today

`SheetElement.body` (`Sheet.swift:36–138`) returns a `SheetAnchor` — an inert **zero-size**
view (`Color.clear.frame(width: 0, height: 0)`, lines 366 / 374 / 385) carrying the presentation
modifier:

* `mode="cover"` → `.fullScreenCover(isPresented:onDismiss:)` (380)
* everything else → `.sheet(isPresented:onDismiss:) { sheetBody }` (386)
* macCatalyst takes its own branch (361–369) → `.sheet` + `MacSheetContent` / `presentationSizing`.

The content is `dsx.slot()` wrapped in `paddedSlot` (99–105) and passed as an
**escaping closure** `content: () -> AnyView` (127–131). SwiftUI evaluates that closure only
when the presentation actually happens. **This laziness is the single most important fact
for nesting**: the slot's view tree — and therefore any nested `<sheet>`'s own anchor — does
not exist until the parent is presented.

### 1.2 Nesting: what UIKit does with no help from DSX

A `<sheet>` written inside another `<sheet>`'s children compiles to a `SheetElement` inside the
parent's slot. Its `SheetAnchor` therefore lives in the **presented** hosting controller's view
hierarchy, so `.sheet(isPresented:)` attaches to the *presented* view controller. UIKit then
presents modally **from** that controller, and the system stacks the two cards. Everything
below comes free, with zero DSX code:

| Behaviour | Owner | Note |
|---|---|---|
| The presenter card scales back and its corners round | `UISheetPresentationController` | the "card stack" |
| A dimming view over the presenter | UIKit | tap = dismiss the top card only |
| Swipe-to-dismiss routed to the **top** card only | UIKit | the parent's pan is not reachable |
| The parent's scroll offsets are preserved | UIKit | the view is retained, not rebuilt |
| Detents on the child, independent of the parent's | `presentationDetents` (705) | `.medium` / `.large` / `.height(h)` |
| Keyboard avoidance for the top card | UIKit | |
| `accessibilityViewIsModal` on the presented card | UIKit | the presenter leaves the a11y tree |
| Dismissing the parent tears down the whole chain | UIKit | `dismiss(animated:)` takes everything above |

DSX's own per-sheet machinery is per-*anchor* and therefore already re-entrant:

* `@State private var shown` (326) is per-anchor, so the nested anchor gets its own identity-
  stable presentation flag. **This matters more here than anywhere else in the app.** The
  comment at 318–325 records that a presentation driven straight off the computed store
  binding *never completed* while a `<video>` ticked position 4×/s — "every sheet on the Watch
  surface was dead during playback". The genre stack would live on exactly that surface, one
  level deeper. The `@State` fix covers it, but this is the highest-risk screen in the app to
  debut a second presentation on, and Stage 6 of the plan tests it on device for that reason.
* `SheetEdgeFade` (584–687) holds `@SwiftUI.State` and a preference key **inside the
  presentation closure** (the comment at 668–671 explains why: publisher and reader must be
  one hosting controller). Nesting gives each level its own fade. Correct by construction.
* `MeasuredSheetContent` / `CardSheetContent` (689–763) each hold their own `selection` and
  `contentHeight` `@State`. Per level. Correct.
* `SheetAnchor.contentDetent` (434–444) caps a `content` detent at 90 % of the **key window's**
  height (436–443), not the parent card's. That is right: a stacked `.large` card is
  window-height, it is not inset inside its parent.

### 1.3 What DSX gets wrong today, precisely

Four defects, all in state rather than pixels.

**(a) The child's `present` key is never written false when the chain is torn down.**
`.onDisappear` (340–344) only `NSLog`s. There is no `present.wrappedValue = false`. When the
parent dismisses, UIKit destroys the child's hosting controller; the child's `@State shown`
dies with it, but the DSX store key stays `true`.

**(b) …which makes the child auto-present the next time the parent opens.**
`.onAppear { shown = present.wrappedValue }` (334–339). Reopen the drawer and the genre sheet
is instantly back, unasked. This is a user-visible bug, not a theoretical one.

**(c) The web lane has the mirror-image hole, from the other side.** `bindPresentation`'s
disposer (`overlay-controls.ts:677–684`) calls `detachDocumentListeners`, `deactivateLayer` and
`portal.unmount()` — it never calls `api.writeBack(present, false)` and never fires
`dismiss`. Worse: on web, **closing the parent does not close the child at all**. The child's
controller is untouched; its portal scope is a body-level sibling, not a descendant. You get an
orphan level-1 modal floating over the app with its parent gone. iOS at least tears it down.

**(d) A nested child can be opened with no parent on web, and cannot on iOS.**
The web sheet factory mounts its children eagerly — `api.children(content, boundedChildren(node))`
at line 907 runs at factory time regardless of `present` — so the nested controller's
`present` binding is live from mount. Setting the child key true with the parent closed opens a
lone level-1 sheet. On iOS the anchor does not exist (§1.1), so the same write does nothing…
until the parent opens, at which point (b) fires it. **Same markup, three different outcomes.**

**(e) Unknown — probe before designing around it.** Does SwiftUI fire the *child's*
`onDismiss` when an ancestor sheet is dismissed? The probe is already in the code: the DEBUG
`NSLog("[dsx.sheet] onDismiss fires key=%@", key)` at **`Sheet.swift:133`**. Present both,
set the parent key false, read the console. Do not guess this; the whole Stage-1 cascade
design branches on the answer.

### 1.4 Where iOS is *not* free

* **macCatalyst** (361–369) presents a Mac form sheet; a second `.sheet` from inside one is a
  second form sheet with no card-stack idiom. `MacSheetContent`'s `presentationSizing`
  (465–477) has no stacked policy. Desktop parity is an open question, not a solved one.
* **Android**: `ClosedSource/DSX/Modules/Mandatory/Foundation/Components/Structure/Sheet/`
  contains **only** a `swift/` directory in this checkout. `StackReference.md:1143` documents
  the mapping to Compose `ModalBottomSheet`, which has no stacked-card presentation of its own.
  Treat Android as needing the *same* authored transform the web lane needs. Confirm with the
  Android engine owner before Stage 3 lands.

---

## 2. What the web lane must reproduce

### 2.1 The parts that exist

`modalParts("sheet")` (`overlay-controls.ts:717–735`) builds:

```
span.dsx-overlay-host.dsx-sheet-host          display: contents            (1504)
└ div.dsx-overlay-layer.dsx-sheet-layer       position: fixed; inset: 0    (1506–1512)
                                              z-index: calc(10000 + level) (1509)
  ├ div.dsx-overlay-scrim                     inset: 0; rgb(0 0 0 / .32)   (1515–1520)
  │                                           + backdrop-filter blur(8px)  (1524–1530)
  └ section.dsx-overlay-panel.dsx-sheet-panel role=dialog aria-modal=true  (729–731)
    ├ button.dsx-sheet-grabber                role=slider                  (880–882)
    ├ header.dsx-sheet-chrome
    ├ div.dsx-sheet-content                   THE scroll viewport          (1722–1735)
    └ div.dsx-sheet-fade                      absolute, bottom: 0, 64px    (1736–1751)
```

`layerPortal` (425–494) reparents the **layer** into a `div.dsx-overlay-portal-scope` appended
to `document.body`, copying every `--dsx-*` custom property, `dir`, `writing-mode` and
`color-scheme` off the original home element (435–456) so author tokens survive the move.
`home` is captured once at bind time (426) and the layer goes back there on unmount (489).

`bindPresentation` (532–703) owns open/close, the document-capture `keydown`/`focusin`
listeners (600–611), the Tab cycle (576–594), the dismiss write-back (671), and focus restore
on a `setTimeout(…, 0)` guarded against a newer layer (659–665).

The coordinator (298–395) owns the stack: `activeLayers`, `refreshBackgroundLock()`,
`activateLayer`, `deactivateLayer`, `isTopLayer`.

The drag block (999–1075) is the gestural half: `canStartFrom` (1023–1028) implements the iOS
rule that a downward drag owns the sheet only when the content is already at scrollTop 0;
`setOffset` (1009–1014) writes `--dsx-sheet-drag`; `settle` (1060–1074) calls the **pure**
release policy `sheetRelease` (839–860).

### 2.2 What already works when a second modal opens over a sheet

Traced through the code, and confirmed by the lightbox oracle:

* **Level & z-order.** `activateLayer` pushes and writes `--dsx-overlay-level = activeLayers.length`
  (376). Parent 1, child 2 → z 10001 / 10002 (1509). `deactivateLayer` recompacts the ledger
  (386–389) so closing the parent first does not leave a hole.
* **Parent goes inert.** `refreshBackgroundLock` (322–367) finds the **topmost** modal (327–331),
  builds `foregroundBranches` from that modal and every layer *above* it (348–355) — the parent
  layer is at `modalIndex − 1` and is therefore **excluded** — then walks up from the child's
  layer inerting every non-foreground sibling (356–366). The parent's portal scope is a
  body-level sibling of the child's, so it gets `inert = true` **and** `aria-hidden="true"`
  (314–320). That is exactly the iOS semantic.
* **Escape per level.** `onKey` returns unless `isTopLayer(layer)` (563). Both listeners are
  installed; only the top acts.
* **Focus restore across levels.** The child's `restoreFocus` is whatever was focused when it
  opened (622–623) — the tapped tag inside the parent panel. The guard at 662–663 (`if the top
  layer does not contain the target, skip`) evaluates *after* `restoreBackground()` has already
  un-inerted the parent, and the parent **is** now the top layer and **does** contain the tag →
  it restores. Correct, by a hair; do not refactor those two lines without re-reading this.
* **Depth ceiling.** `OVERLAY_LIMITS.maxOpenDepth = 16` (27), refusal at 371–374. Two is fine.

### 2.3 What must be added — the stacked-presentation spec

Everything in this section is new work. Numbers marked ⌀ are placeholders to be replaced by
Stage 0's measurements.

**(S1) The parent card scales back.**
Constraint: `.dsx-sheet-panel` already spends two of the three CSS transform channels.

| Channel | Current owner | Line |
|---|---|---|
| `translate` (individual property) | the entry animation `@keyframes dsx-sheet-up { from { translate: 0 100%; } }` | 1872 |
| `transform` | the live drag `translateY(var(--dsx-sheet-drag, 0px))` | 1626 |
| `scale` (individual property) | **free** | — |

So the stack rides `scale`, non-uniformly, with `transform-origin: 50% 100%` (bottom-pinned —
a bottom-anchored panel must never lift off the screen edge and reveal scrim beneath it):

```css
.dsx-sheet-panel { transform-origin: 50% 100%; transition: … , scale var(--dsx-dur-base) var(--dsx-ease); }
.dsx-sheet-panel[data-dsx-stacked="true"] { scale: var(--dsx-sheet-stack-sx, 1) var(--dsx-sheet-stack-sy, 1); }
```

with the two factors written inline by the coordinator from the panel's live box:

```
sx = (W − 2·INSET) / W          INSET = ⌀ pt, measured in Stage 0
sy = (H − DROP)   / H           DROP  = ⌀ pt, the top-edge drop
```

Two independent factors, because iOS's side inset and top drop are **not** in the ratio a
uniform scale would produce, and a uniform scale about any origin can only hit one of them.
The distortion at these magnitudes (≈0.95 / ≈0.99) makes the 20 px radius (`theme.ts:482`)
elliptical by well under a pixel; if Stage 0 measures a radius change on iOS, drive it with a
third property rather than compensating the scale.

**(S1a) Blocking bug this exposes — fix it in the same pass.**
`@media (min-width: 48rem) { .dsx-sheet-panel:not([data-dsx-mode="cover"]) { … transform: translateX(-50%); } }`
at **line 1883** has specificity (0,2,0) against line 1626's (0,1,0), so on every viewport
≥ 768 px it **overwrites the drag channel entirely**: `--dsx-sheet-drag` is inert and the
tablet/desktop sheet does not follow the finger. `sheetRelease` still runs, so the detent
still changes and dismissal still fires — the sheet just teleports instead of dragging. Fix by
moving the centring into a variable so there is exactly one `transform` declaration:

```css
.dsx-sheet-panel { transform: translateX(var(--dsx-sheet-center, 0px)) translateY(var(--dsx-sheet-drag, 0px)); }
@media (min-width: 48rem) { .dsx-sheet-panel:not([data-dsx-mode="cover"]) { --dsx-sheet-center: -50%; } }
```

**(S1b) Second dead code path, same block.** `setOffset` writes `--dsx-scrim-drag` (1013) and
`clearOffset` removes it (1017) — **nothing in the stylesheet reads it** (grep across the whole
`OpenSource/Web` tree returns only those two writes). The comment above it promises "the scrim
thins as the sheet leaves"; it does not. Wire it (`.dsx-overlay-scrim { opacity: var(--dsx-scrim-drag, 1); }`)
or delete it — but the stacked design *needs* it wired, because the parent's un-stack has to
track the child's drag (S5).

**(S2) The scrim stack.**
Today the child paints a second full-viewport scrim: dim **plus** `backdrop-filter: blur(8px)
saturate(1.12)` (1524–1530). Two consequences, both wrong:

* the app behind is blurred twice (compounding), and
* the **parent card** is blurred, which iOS never does — iOS *dims* the presenter, it does not
  defocus it.

Spec: a scrim whose layer is not the bottom-most modal drops the backdrop filter and carries
the measured stacked dim only.

```css
.dsx-overlay-scrim[data-dsx-stacked="true"] { backdrop-filter: none; -webkit-backdrop-filter: none;
                                              background: rgb(0 0 0 / var(--dsx-scrim-stacked-alpha, ⌀)); }
```

The coordinator stamps `data-dsx-stacked` in `refreshBackgroundLock`, where the modal index is
already computed (327–331).

**(S3) Z-order.** No change. The ledger is already right (§2.2). One rider to document: the
parent panel carries a `transform`, which makes it a **containing block for `position: fixed`
descendants** — already true today (1626), so this is not a regression, but any author who
writes `position: fixed` inside a sheet is positioning against the panel, not the viewport.

**(S4) The parent's scroll.**
`.dsx-sheet-content` is the scroll viewport (1722–1735) with `overscroll-behavior: contain`
(1726). While the child is up the parent is `inert` and fully covered by the child's scrim, so
no pointer reaches it. Two belt-and-braces additions, because `inert`'s interaction with
compositor-thread scrolling is not something to bet a fidelity claim on:

* `.dsx-sheet-panel[data-dsx-stacked="true"] .dsx-sheet-content { overflow: hidden; }` — the
  same trick the drag already uses at line 1631, so the idiom is established. The scroll
  **offset is preserved** across an `overflow` toggle (it is clamped, not reset — verify with
  the probe in §5 Stage 4; if a clamp is observed on a short panel, save/restore `scrollTop`).
* the `pointerdown` handler at 1030 gains `if (!isTopLayer(layer)) return;`.

**(S5) Touch — the part the founder called out.** The full policy:

| Gesture | Where it lands | What must happen |
|---|---|---|
| Drag starting on the **child's** grabber or chrome | child panel | child follows the finger; `sheetRelease` decides on release. Unchanged (1023–1028). |
| Drag starting on the **child's** content, downward, `scrollTop <= 0` | child panel | child follows. Unchanged. |
| Drag starting on the child's content, upward or scrolled | child content | scrolls the child. Unchanged (1051 returns early). |
| Drag starting on the **exposed parent** | the **child's scrim** (inset: 0, higher z) | **nothing moves.** iOS's dimming view carries only a tap recognizer. |
| **Fling** on the exposed parent | child's scrim | nothing. No momentum, no dismissal. |
| **Tap** on the exposed parent | child's scrim | dismiss the **child only**; the parent stays open at its detent. |
| Tap on the parent's own grabber/close | unreachable (`inert`) | nothing. |

Two code changes fall out:

1. **The scrim's dismissal must be a tap, not a click.** `scrim.addEventListener("click", () =>
   controller.dismiss("outside"))` at line 962 fires after a slow *drag* that begins and ends on
   the scrim — browsers still synthesise a click. iOS does not dismiss on that. Replace with a
   pointerdown/pointerup pair carrying a slop budget (reuse `CONTEXT_MENU_PRESS.slopPx = 10`,
   already exported from this same file at line 1419 for the long-press recognizer) and a
   same-target check.
2. **The parent un-stacks live with the child's drag.** This is the single detail that makes a
   stack read as native rather than as two overlapping rectangles. As the child travels down,
   the parent's `sx`/`sy` interpolate back toward 1. Implementation: the child's `setOffset`
   (1009–1014) additionally writes a normalised progress onto the layer below —

   ```
   progress = 1 − clamp(max(dy,0) / panel.offsetHeight, 0, 1)     // 1 = fully stacked
   ```

   and the parent's factors become `1 − (1 − sx)·progress`, `1 − (1 − sy)·progress`. The
   parent's `scale` transition must be suppressed while the child is dragging (mirror line
   1630's `[data-dsx-dragging]` idiom, keyed off the child's state via a coordinator call).

**(S6) The dismissal cascade.** Closing a parent closes its declared descendants, on every
lane, writing each `present` key false and firing each `on:dismiss`. This semantic is **already
pinned** for the *other* presentation plane — `Conformance/router/present.json`: *"dismissing a
CHAIN entry takes its later chain descendants and spares every overlay"*. Reuse the words; the
two planes must not disagree about what a stack is.

---

## 3. The hard parts

### 3.1 Focus trap and restore across two levels

**Status: already correct, and fragile.** Every controller installs its own document-capture
`keydown`/`focusin` (600–611) and self-suppresses unless `isTopLayer` (563, 597). The Tab cycle
(576–594) is hand-rolled rather than delegated to the browser's tab order, deliberately —
"Safari/WebKit may omit buttons from native Tab order even though they are programmatically
focusable" (589–591). That hand-rolling is what makes two levels work at all: the child's cycle
enumerates `focusables(child panel)` only.

The fragile seam is **restore ordering** (§2.2, last bullet): `deactivateLayer` →
`refreshBackgroundLock` → `restoreBackground` must run *before* the `setTimeout(…, 0)` at 659,
or the guard at 662–663 sees a still-inert parent. Today it does, synchronously, inside
`setOpen(false)`. **Add a regression test for this exact ordering** — it is invisible from the
source and one `queueMicrotask` away from breaking.

One real gap: `focusables()` (402–417) filters on `hidden`, `inert`, `aria-hidden` and computed
`display`/`visibility`, but **not** on `scale: 0`-style transforms or on being behind another
layer. Not an issue for a stack (the child's own panel is never transformed away), but if S1
ever animates a panel to `scale: 0`, its focusables stay focusable.

### 3.2 `inert` on the parent

`lockSibling` (314–320) sets **both** `element.inert = true` and `aria-hidden="true"`, and
`restoreBackground` (306–312) restores the *prior* value of each rather than blindly clearing —
which is what makes nesting safe (the parent was already inert-restored correctly when the
child was locked over it, because `changedBackground` is keyed by element and the whole map is
replayed on every refresh).

Three things to know:

* `inert` is applied to the parent's **portal scope**, not to the panel. `.dsx-overlay-portal-scope`
  is `display: contents` (1505). An `inert` attribute on a `display: contents` element still
  propagates to descendants (inertness is a subtree property, not a layout one) — but it is
  worth an explicit assertion in the oracle rather than an assumption, because `display: contents`
  has burned several a11y features historically.
* `inert` is **not** a scroll lock. The spec makes an inert subtree non-focusable, untargetable
  by pointer events, and hidden from a11y; it says nothing about compositor-driven panning.
  Hence S4's `overflow: hidden`.
* `inert` support: Safari 15.5+, all evergreen. `focusables()` reads `current.inert` directly
  (406) with no fallback, so the codebase has already taken this dependency.

### 3.3 Scroll locking without layout shift

`refreshBackgroundLock` sets `document.documentElement.style.overflow = "hidden"` once when the
first modal opens (333–342) and restores it when the last closes. The classic hazard — the
document scrollbar disappears and the page under the scrim jumps ~15 px — **does not fire
inside a DSX application**, and the reason is worth writing down so nobody "fixes" it:

The built shell puts `[data-dsx-root]` at `position: fixed; inset: 0 0 auto 0; width: 100vw;
height: 100dvh; overflow: hidden; overscroll-behavior: none` (read out of `dist/index.html`),
and `.dsx-frame` is `position: absolute; inset: 0; overflow: hidden` (`theme.ts:663–682`). The
document never scrolls, so there is never a document scrollbar to remove. The `overflow: hidden`
write is a **no-op safety net for embedders** whose host element is not a fixed root.

Where it *is* real: the oracle harness itself (`overlay-controls-browser.ts:55` —
`.overlay-harness { … min-height: 100vh; … }`), and any embedded DSX surface inside an ordinary
scrolling page. For those, the lock must compensate:

```ts
const gutter = window.innerWidth - document.documentElement.clientWidth;   // BEFORE the lock
if (gutter > 0) document.documentElement.style.paddingRight = `${gutter}px`;
```

restored alongside `savedDocumentOverflow`. Prefer this to `scrollbar-gutter: stable`, which
would reserve the gutter permanently for every embedder. The oracle at line 118 already asserts
`overflow === "hidden"`; extend it to assert the compensated width is unchanged.

### 3.4 iOS Safari viewport and `dvh` during presentation

The sheet CSS is `dvh`-driven throughout: `max-height: calc(100dvh − env(safe-area-inset-top) −
8px)` (1618), `height: 50dvh` for `half` (1634), `calc(100dvh − …)` for `full` (1635),
`90dvh` for `content` (1633), `100dvh` for `cover` (1643). Three problems, all of which the
second level makes worse because the parent's stacked geometry is derived from the panel's box:

1. **The URL bar.** `dvh` re-resolves as Safari's URL bar collapses and expands, *including
   mid-gesture*. A drag that starts at `50dvh` can land against a different `50dvh`.
2. **The software keyboard.** `dvh` does **not** shrink for the keyboard; `visualViewport` does.
   The framework already knows this — `boot.ts:157–174` seeds `dsx.screen.height` from
   `window.visualViewport?.height ?? window.innerHeight` and re-seeds on `visualViewport.resize`.
   So `dsx.screen.height` is keyboard-aware while the sheet's own CSS is not: the comments sheet
   (`Components/Watch.dsx:1008–1041`, with a `<textfield>` at 1035) puts its input under the
   keyboard at the `half` detent.
3. **The layout-viewport offset.** When the keyboard opens, iOS Safari scrolls the *layout*
   viewport, and `position: fixed` layers go with it — a fixed overlay can end up partly
   off-screen.

Fix, in the coordinator rather than per-sheet:

```ts
const vv = window.visualViewport;
const sync = () => {
  if (anyLayerDragging) return;                       // never resize mid-gesture
  root.style.setProperty("--dsx-sheet-vh", `${(vv?.height ?? innerHeight) / 100}px`);
  root.style.setProperty("--dsx-vv-top",  `${vv?.offsetTop ?? 0}px`);
};
```

and swap every `Ndvh` in the sheet block for `calc(N * var(--dsx-sheet-vh, 1dvh))`, with the
layer pinned at `top: var(--dsx-vv-top, 0px)`. `1dvh` as the fallback keeps SSR and no-JS
identical to today. **Freeze `--dsx-sheet-vh` for the duration of any drag** — that is the
whole point.

### 3.5 Nested `<dialog>` vs the portal

**Recommendation: keep the portal. Do not move `<sheet>` to `dialog.showModal()`.**

What the top layer would buy: a browser-owned strict stack, a free per-level `::backdrop`, and
painting above any author `z-index` (the current ceiling is a finite `10000 + level`, 1509).

What it would cost — four things the codebase already depends on:

1. **The plane order breaks.** `present.ts:8–12` documents a three-plane host contract (content
   frames z 10+, the overlay plane z 500, chain frames z 1000+) and `overlay-controls.ts`
   coordinates six overlay tags plus the Drawer (`application-controls.ts:955`) and the Lightbox
   (`media-surfaces.ts:1652`) through **one** `--dsx-overlay-level` ledger. Moving only `<sheet>`
   into the top layer would put every sheet unconditionally above every popover and menu,
   regardless of presentation order. That contradicts `deactivateLayer`'s compaction guarantee
   (386–389) and the oracle that pins it (`application-controls-browser.ts:245–263`).
2. **`showModal()`'s inert is blanket; DSX's is branch-scoped.** `refreshBackgroundLock`'s
   `foregroundBranches` (348–355) deliberately exempts layers opened *above* the active modal —
   "a menu or popover launched from a Drawer" — so a non-modal flyout over a modal stays live.
   The browser's top-layer inertness has no such exemption.
3. **Escape doubles up.** `<dialog>` fires a close request per dialog; the existing handler
   (562–574) is a single document-capture listener with a per-surface veto hook
   (`beforeEscape`, 571 — the lightbox zoom lock is its caller). Reconciling the two is more
   code than the top layer saves.
4. **`::backdrop` cannot do S1/S2.** There is exactly one backdrop per dialog, it cannot be
   selectively de-blurred per level, and it cannot be transformed in step with a parent card.

The portal already delivers the one genuinely hard thing (`layerPortal.syncScope`, 435–456:
tokens, `dir`, `writing-mode`, `color-scheme`, plus a `prefers-color-scheme` listener at
472–473 for an open portalled overlay). Ship the stack on it.

*If* the z-index ceiling ever becomes a real problem, the escape hatch already exists:
`--dsx-overlay-z-index` is a custom property with a `10000` fallback, so an embedder raises it
without a code change.

### 3.6 Generalising the detent maths to two panels

**There is nothing to generalise.** `sheetRelease` (839–860) is a pure function of
`{ dy, velocity, height, index, count }` — all per-panel. Each level runs its own instance over
its own `detents` array and its own `detentIndex`. The `FLICK = 0.5 px/ms` and
`TRAVEL = max(48, height·0.25)` constants are relative to that panel's own height, so a `content`-
detent child over a `full` parent already behaves correctly.

What *does* need a rule is **gesture routing**, and it is one line: the top layer owns every
pointer (S4/S5). The parent's handlers are unreachable by `inert` + scrim; the explicit
`isTopLayer` guard makes that a contract instead of a side effect.

The one genuinely new piece of maths is S5's un-stack interpolation, and it is deliberately
*not* in `sheetRelease` — it is presentation, not policy. Put it in a second pure function
beside it so the corpus can pin it too:

```ts
export function stackProgress(dy: number, height: number): number {
  return 1 - Math.min(Math.max(dy, 0) / Math.max(height, 1), 1);
}
```

### 3.7 Accessibility

| Concern | Today | Stacked requirement |
|---|---|---|
| `role` / `aria-modal` | `dialog` + `aria-modal="true"` per panel (729–730) | unchanged — **both** panels keep it; the parent is additionally `aria-hidden` via its scope, which is what removes it from the tree |
| Labelling | `aria-labelledby` → the `<h2 class="dsx-sheet-title">` (873–874) | a stacked child **must** declare `title=` or the panel is an unlabelled dialog. Make the linter say so for a nested sheet specifically; an unlabelled level-1 sheet is survivable, an unlabelled level-2 is disorienting. |
| Screen-reader order | portal scopes are appended to `body` in open order (479) | DOM order = stack order. Correct for free. |
| Escape | per-level, top only (563) | unchanged. Assert **both** levels in the oracle: first Escape closes the child and leaves the parent's `present` true; second closes the parent. (The lightbox oracle at `media-surfaces-browser.ts:467–472` is the template for this assertion.) |
| The grabber | `role="slider"`, `aria-valuenow/min/max/text` (880–882, 966–974) — the comment at 877–879 records why a bare button carrying `aria-value*` is an axe-critical violation | the child gets its own slider with its own range. Nothing shared. |
| The stacked parent | — | must be `aria-hidden`; verify via the a11y tree, not via `inert` alone |
| Reduced motion | animations and transitions dropped (1892–1895) | **add `scale` to the reduce list.** A card that scales back under `prefers-reduced-motion` should snap, not travel. |
| Forced colors | scrim → `rgb(0 0 0 / .6)`, panels get a `CanvasText` border (1896–1899) | the stacked parent is only distinguishable by its border in forced-colors; the scale still applies, which is enough |

---

## 4. The DSX surface

### 4.1 Nesting **is** the declaration. No new attribute.

A `<sheet>` written inside another `<sheet>`'s slot is a stacked sheet. That is what iOS
already does for free (§1.2), it is the only spelling that keeps one markup for every renderer,
and it adds nothing to the attribute table in `StackReference.md:619–632`.

**The rule that must be documented and linted:** a stacked sheet is declared **inside its
parent's children**, never as a sibling. Two `<sheet>` tags side by side at a screen root are
not a stack on iOS — both anchors live in the *screen's* hierarchy, and a view controller can
present only one thing at a time, so the second silently does nothing. On web the same markup
produces two independent level-1 modals. This is a lint rule, not a runtime one:

> `dsx lint`: *two `<sheet>` elements are siblings and their `present` keys can be true at
> once; a sheet presented over a sheet must be declared inside the first sheet's children.*

### 4.2 State: two keys, and the cascade is the engine's job

```xml
<variable as="drawer">return false</variable>          <!-- level 1 -->
<variable as="genreOpen">return false</variable>       <!-- level 2 -->
<variable as="genre">return ''</variable>              <!-- the payload -->
```

The author writes `on:dismiss` per level, as today. The author does **not** write
"and also close the child" — S6 makes closing a parent close its descendants and write their
keys false, on every lane, exactly as `Conformance/router/present.json` already specifies for
the chain plane. An author-side cascade is the thing the house law calls a silent workaround.

### 4.3 The exact markup — the template's genre-tag case

Drop-in for `Components/Watch.dsx`. The tags in the drawer's Synopsis tab are currently **inert
text** (`Watch.dsx:886–889`) while the same tags in the desktop panel already route
(`Watch.dsx:787–796`) — so this is the change that closes that drift.

Head additions (respecting the linted head order: attributes → expects → events → api →
variables plain → variables computed → formulas → actions → watch → style):

```xml
<!-- the genre level's data. Same endpoint the Browse screen uses
     (Components/Browse.dsx:20 → server/catalog.dsx:249 GET /catalog/browse/:genre),
     so the payload shape is already known: { active, genres, tags, items[], total }. -->
<api as="genreList" url="/catalog/browse/{{ dsx.variable.genre }}"
     skip="dsx.variable.genre == ''"
     on:success="global.cacheBrowse = genreList.data"/>

<variable as="genreOpen">return false</variable>
<variable as="genre">return ''</variable>

<!-- stale-then-fresh with the ID GUARD the house rule requires: the shared /catalog/browse
     stash is keyed by endpoint, so handing back a cached payload for a DIFFERENT genre is
     the "show B borrows show A's art" defect. -->
<variable as="genreView" computed="true">
  if (genreList.data != null) { return genreList.data }
  const cached = global.cacheBrowse
  if (cached == null) { return null }
  return cached.active == dsx.variable.genre ? cached : null
</variable>

<action as="openGenre">
  dsx.variable.genre = args.name
  dsx.variable.genreOpen = true
</action>
```

The tap target — replacing the two dead `<text>` rows at `Watch.dsx:886–889`, and matching the
panel lane's `showTags` flow (792–796) so the two lanes finally render the same pieces:

```xml
<hstack class="tagRow">
  <text value="{{ detail.data == null ? '' : detail.data.show.genre }}" class="tag"
        a11yTrait="button" a11yLabel="Browse {{ detail.data == null ? '' : detail.data.show.genre }}"
        on:tap="dsx.action.openGenre({ name: detail.data.show.genre })"/>
  <text value="Series" class="tag"/>
</hstack>
<flow class="tagFlow" bind="dsx.variable.showTags" key="name" spacing="6" lineSpacing="6"
      visible-if="dsx.variable.showTags.length > 0">
  <text value="{{ item.name }}" class="tagSoft" a11yTrait="button"
        a11yLabel="Browse {{ item.name }}"
        on:tap="dsx.action.openGenre({ name: item.name })"/>
</flow>
```

And the stacked sheet itself — **inside** the drawer's slot, as the last child of the drawer's
root `<vstack>` (i.e. after `Watch.dsx:926`, before the `</vstack></scroll></sheet>` at 927–929):

```xml
<!-- LEVEL 2 — declared inside its parent's slot, which is what makes it a stack.
     `title=` is not decoration here: a stacked dialog without an accessible name is
     disorienting, and the linter enforces it for a nested sheet. -->
<sheet present="dsx.variable.genreOpen" detents="full" background="#141414"
       title="{{ dsx.variable.genre }}" close="leading"
       on:dismiss="dsx.variable.genreOpen = false">
  <scroll grow="true" style="flex: 1; min-height: 0">
    <vstack alignItems="stretch" spacing="14">
      <text value="{{ dsx.variable.genreView == null ? '' : dsx.variable.genreView.total }} series"
            class="drawerSub" visible-if="dsx.variable.genreView != null"/>
      <grid bind="dsx.variable.genreView.items" key="id" columns="3" spacing="12" scroll="false">
        <vstack class="card" on:tap="dsx.action.goShow({ id: item.id })"
                a11yGroup="true" a11yTrait="button"
                a11yLabel="{{ item.title }}, {{ item.episodes }} episodes">
          <image src="{{ item.poster }}" contentFit="cover" a11yHidden="true"
                 style="width: 100%; aspect-ratio: 3/4; border-radius: 8px; object-fit: cover"/>
          <text value="{{ item.title }}" class="cardTitle" lineLimit="2"
                style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden"/>
        </vstack>
      </grid>
    </vstack>
  </scroll>
</sheet>
```

with

```xml
<action as="goShow">
  dsx.variable.genreOpen = false
  dsx.variable.drawer = false
  dsx.module.route.push({ path: '/show/' + args.id })
</action>
```

**Note the two explicit closes in `goShow`, and why they are not optional today.** `router.ts`
has no awareness of `activeLayers` — grep it: neither `activateLayer`, `deactivateLayer` nor
`dsx-overlay-layer` appears anywhere in the file. Page frames sit at `z = 10 + frames.length`
(`router.ts:679`), overlay layers at `10000 + level` (`overlay-controls.ts:1509`), and `href`
navigation (`mount.ts:1226–1245`) does not consult the overlay ledger either. So a `route.push`
from inside an open sheet **leaves that sheet painted over the newly pushed screen**. This is
not hypothetical: `Components/parts/SearchOverlay.dsx:185` and `:219` route with a bare
`href="/show/{{ item.id }}"` out of a `mode="cover"` sheet with no close (the close action at
105–108 is only wired to the ✕ and to Escape). Stage 6 of the plan makes the router own this so
authors stop having to remember; until then, the explicit closes stay.

### 4.4 The alternative surface, for completeness

`dsx.component.present({ as: 'sheet' })` (`present.ts`) is a *different* machine: a route-level
chain frame with a `#sheet=<Name>` URL fragment (`router.ts:1398–1400`), a dismissal topology
already pinned across three runtimes (`Conformance/router/present.json`), and real Back-button
integration. It is a genuinely attractive answer to "open a browsable surface over the player"
— **except on web, where a chain sheet has no sheet presentation at all**: `mountFrame` stamps
`dsx-frame-sheet` (`router.ts:666`) and the only CSS for that class in the entire tree is…
none (`grep -rn dsx-frame-sheet` → the stamp at `router.ts:666` plus two behavioural reads at
`router.ts:1083` and `:1309`, and **zero** style rules; `theme.ts:697` styles `.dsx-frame-cover`
and nothing styles the sheet tier). It renders as a full frame — the `#sheet=<Name>` history
integration at `router.ts:1398` is real, the drawer look is not.
So today it fails the "feel perfectly native on web" bar harder than `<sheet>` does.
Worth fixing eventually; not the vehicle for this feature.

---

## 5. Staged implementation plan

Every stage is independently shippable and independently verified **by measurement** — pixel
probes, DOM reads and a11y-tree reads, never eyeballing. The web verification command is
`npm run browser:overlays` (`OpenSource/Web/package.json` → `node packages/dom/oracle/overlay-controls-browser.ts`),
which drives the fixture at `overlay-controls-browser.ts:23–27` through Playwright.

---

### Stage 0 — Calibration. No code.

**Do:** build a two-level probe on the iOS simulator (a throwaway component: a `<sheet
detents="full">` containing a `<sheet detents="full">`), present both, and capture:

* the presenting card's **side inset** and **top-edge drop** in points, from a screenshot at a
  known scale — or, better, by reading `presentingViewController.view.transform` and
  `layer.cornerRadius` in the debugger;
* the **dim alpha** over the presenting card (sample a pixel over a known-color parent);
* the presentation **duration** and **easing** (frame-step a screen recording);
* the presenting card's **corner radius** while stacked.

Then answer three behavioural questions on device, because the whole of Stage 1 branches on them:

| Probe | How |
|---|---|
| Does the child's `on:dismiss` fire when the parent is dismissed? | present both, set the parent key false, read the DEBUG `NSLog` already at `Sheet.swift:133` |
| Does a stale child key auto-present on parent reopen? | set child true, close parent, reopen parent, watch (`Sheet.swift:334–339` predicts yes) |
| Does a tap on the exposed parent dismiss the child, or nothing? | tap the visible sliver |

**Files touched:** none in the framework. **Output:** a new
`OpenSource/Conformance/overlay/sheet-stack.json` carrying the measured constants, so all three
renderers read the same numbers and none of them hardcodes taste.
**Milestone:** the JSON exists and the three probe answers are written into it as comments.

---

### Stage 1 — State truth: the dismissal cascade.

No pixels. This is the stage that makes nested sheets *correct* rather than *pretty*, and it is
worth shipping alone.

**Web** (`overlay-controls.ts`): give the layer coordinator a parent link. `layerPortal` already
captures `home` (426); derive the owning layer at bind time with
`home.closest(".dsx-overlay-layer")` and register the pair. In `setOpen(false)` (644), before
`deactivateLayer`, close every registered descendant controller **top-down**, each firing its
own `dismiss` and write-back (671). Also fix the disposer at 677–684 to write back false when a
still-open layer is disposed.

**iOS** (`Sheet.swift`): in `.onDisappear` (340–344), if `shown` is true, write
`present.wrappedValue = false` and run `dismiss` — guarded so a normal swipe-dismiss (which
already went through the `shown` change at 351–356) does not double-fire.

**Corpus:** extend `Conformance/router/present.json`'s chain rule, or add the equivalent to the
new `overlay/sheet-stack.json`, so the semantic is one sentence in one place.

**Verified by:**
* a new oracle case: open parent → open child → set the *parent's* key false → assert both store
  keys are false, both `dismiss` counters incremented exactly once, `activeLayers` empty,
  `document.documentElement.style.overflow` restored, and focus back on the original trigger;
* iOS: the `Sheet.swift:133` NSLog fires for both keys, once each;
* `npm run browser:overlays` green.

**Could regress:** double-fired `dismiss` handlers (an author's `on:dismiss` that decrements a
counter or posts an analytics event). Catch it with a counter assertion, not a boolean.

---

### Stage 2 — Gating: a child cannot present without its parent.

**Web:** `setOpen(true)` on a controller whose registered parent layer is closed → refuse,
`console.warn`, and write the key back false. That is honest and immediate.

**iOS:** Stage 1 removes the only *accidental* path into this state (a stale true key), because
the cascade now clears it. A key deliberately set true while the parent is closed still defers
until the parent opens — that is a consequence of the slot's laziness (§1.1) and is documented
rather than engineered away.

**Lint:** the sibling-`<sheet>` rule from §4.1.

**Files:** `overlay-controls.ts`; the CLI's lint rules; `StackReference.md:616–650`.
**Verified by:** an oracle case (set the child key true with the parent closed → no
`.dsx-sheet-layer` becomes visible, the key reads false, one warning); a lint fixture with two
sibling sheets that must fail.
**Could regress:** a legitimate pattern where a sheet is declared inside another sheet purely
for scoping but presented independently. Grep the demo corpus and this template first — today
there are none (`grep -rn "<sheet" Components/` → six real tags — `AdGate.dsx:248`,
`SearchOverlay.dsx:144`, `Watch.dsx:852 / 932 / 1008`, `PlansSheet.dsx:204` — all top-level).

---

### Stage 3 — The stack, visually.

Web only. `overlay-controls.ts` CSS + a `restack()` in the coordinator, called from
`refreshBackgroundLock` where the modal index already exists (327–331).

Lands: S1 (the `scale` channel), **S1a (the ≥48rem transform override bug at line 1883)**,
**S1b (the dead `--dsx-scrim-drag` at 1013)**, S2 (the stacked scrim), S3's documentation rider.

**Verified by pixel probes** in the oracle, against the Stage 0 constants:

```js
const box = (s) => document.querySelector(s).getBoundingClientRect();
// with only the parent open
const before = box(".dsx-sheet-panel");
// with the child open
const parent = document.querySelectorAll(".dsx-sheet-panel")[0].getBoundingClientRect();
// assert: (before.width - parent.width) / 2  ==  INSET  ± 0.5
// assert: parent.top - before.top            ==  DROP   ± 0.5
// assert: parent.bottom                      ==  before.bottom  ± 0.5   (bottom-pinned)
// assert: getComputedStyle(childScrim).backdropFilter === "none"
```

Plus the S1a regression, which is a *new* assertion of behaviour that has never worked:

```js
// at width 1024, drag the panel 40px down and read the live transform
// assert: the panel's DOMMatrix has m41 ≈ -width/2 (centring) AND m42 ≈ 40 (the drag)
```

**Could regress:** *every existing sheet in every DSX app.* The transform declaration changes,
the desktop centring changes mechanism, and a new `scale` channel appears. Catch it with
(a) the existing mobile width assertion at `overlay-controls-browser.ts:295–303`, extended with
a desktop width + centre assertion; (b) a screenshot diff of the demo's sheet fixtures via
`oracle/screenshot-demo.ts`; (c) `oracle/element-geometry-parity-browser.ts` if any sheet
geometry is pinned there.

---

### Stage 4 — Touch parity.

`overlay-controls.ts` only. Lands S4 (`isTopLayer` guard on `pointerdown` at 1030; parent
content `overflow: hidden` while stacked) and S5 (scrim tap-with-slop replacing the raw click at
962; the live un-stack; `stackProgress` as a pure exported function beside `sheetRelease`).

**Verified by** Playwright pointer sequences, reading state rather than looking:

| Probe | Assertion |
|---|---|
| `elementFromPoint` over the exposed parent, child open | returns an element inside `.dsx-sheet-layer` at level 2 (the child's scrim) |
| pointerdown on the scrim → move 60 px → up | **no** dismissal; both `present` keys unchanged; no `--dsx-sheet-drag` written on either panel |
| pointerdown on the scrim → up within slop | child key false, parent key **true**, exactly one `dismiss` |
| drag the child's grabber down 40 px, sample mid-gesture | parent's computed `scale` has moved measurably toward `1 1`; on release-to-dismiss it reaches `1 1` |
| touch-scroll over the parent's content area, child open | parent `.dsx-sheet-content.scrollTop` unchanged |
| scrollTop preservation | scroll the parent's content to 200, open child, close child, assert `scrollTop === 200` (this is the clamp risk from S4 — if it fails, save/restore) |
| the whole flow with `prefers-reduced-motion: reduce` | no `scale` transition; final geometry identical |

**Could regress:** the existing single-sheet drag (the `isTopLayer` guard fires for a lone
sheet too — it is top, so it passes, but assert it); `content` scrolling on touch (the panel's
`touch-action: none` at 1627 is survived today only because the touch-action walk terminates at
the scrolling `.dsx-sheet-content`; do not add `touch-action` anywhere in this stage without
re-probing touch scroll on a real device).

---

### Stage 5 — Viewport truth on iOS Safari.

`overlay-controls.ts`: `--dsx-sheet-vh` / `--dsx-vv-top` from `visualViewport`, frozen during
any drag; every `Ndvh` in the sheet CSS block becomes `calc(N * var(--dsx-sheet-vh, 1dvh))`.

**Verified by** the real-device lane, not a desktop emulation: `npm run browser:matrix`, plus a
manual iOS Safari pass reading `getBoundingClientRect()` on the panel with the keyboard open
(the template's comments sheet, `Watch.dsx:1008–1041`, is the fixture — its `<textfield>` at
1035 must stay above the keyboard at the `half` detent).
**Could regress:** SSR/no-JS first paint. The `1dvh` fallback keeps it byte-identical; assert
that `packages/server/test/overlay-controls-render.test.ts` output is unchanged.

---

### Stage 6 — Routing owns the overlay ledger.

`router.ts` + an exported `closeAllLayers()` from `overlay-controls.ts`. A `push` / `reset` /
`pop` closes every open modal layer first (firing each `dismiss`), so a sheet can never paint
over a screen pushed from inside it.

**Verified by** an oracle case: open a sheet, click an `href` inside it, assert
`activeLayers.length === 0`, the new frame is the top paint at `elementFromPoint(width/2, height/2)`,
and the sheet's `present` key is false. Then re-run against `Components/parts/SearchOverlay.dsx`,
which exhibits the defect today.
**Could regress:** an author who *wants* a persistent overlay across a route change (a mini
player). None exist in this template; check the demo corpus. If one does, the rule needs an
opt-out attribute and this stage grows.

---

### Stage 7 — Docs, lint, a11y.

`StackReference.md:616–650` gains the nesting rule, the sibling prohibition, the `title=`
requirement for a stacked child, and the cascade semantic. `AGENTS.md` gains a house-idiom
bullet. Run `npx axe` over the two-level fixture in both schemes and under `forced-colors`.
Add `scale` to the `prefers-reduced-motion` list at 1892–1895.

---

### Template-side verification (this repo)

After the framework work lands and the template adopts it: `npm run lint` → `npm run
check:styles` → `npm run review` → `npm run build` → **restart `node scripts/serve.mjs`** (the
positional-atomic-style-id hazard, AGENTS.md) → `npm run verify`, then a browser measurement of
the drawer at 390 px and 1440 px, reading the panel boxes rather than looking at them.

---

## 6. Recommendation

### 6.1 For the genre tag: do not open a nested sheet. Push a level **inside** the drawer.

The case, in order of weight:

**(1) The desktop lane cannot host a sheet, and the two lanes are already required to match.**
On a wide viewport the Watch screen renders the episode drawer as a **persistent 416 px right
panel** (`Watch.dsx:763–848`), not a sheet — and the house law is explicit that both lanes
render the same pieces "so they cannot drift apart in behaviour" (AGENTS.md; `Watch.dsx:766–767`).
A nested sheet has no meaning in a persistent panel. An in-panel level does: the panel swaps its
body for the genre grid and shows a back control, exactly as the drawer does. One behaviour,
two containers.

**(2) The pattern already ships, eighty lines below the call site.** The options sheet at
`Watch.dsx:932–1005` is one `<sheet detents="content">` whose content swaps between a root view
and a `speed` sub-view driven by `dsx.variable.sheet`, with a back chevron at line 993. That is
the house's existing answer to "a second level inside a sheet". It works on every renderer
today, needs zero engine work, and is what iOS itself does far more often than sheet-over-sheet
(a `NavigationStack` inside a sheet).

**(3) The one thing a stack buys is invisible in this case.** A stacked sheet's advantage over
an in-sheet push is that a sliver of the parent stays visible. A genre grid wants a `full`
detent, which covers the parent completely. You would pay for the whole card-stack apparatus and
then hide the thing it renders.

**(4) Apple's own guidance is against it,** and the reference players agree: ReelShort,
DramaBox and Netflix all reach a genre browse through a navigation level, never a second card.

**(5) It debuts the riskiest possible feature on the riskiest possible screen.**
`Sheet.swift:318–325` records, in the code, that a presentation on the Watch surface was already
killed once by that screen's 4×/s position publisher. A second presentation over the first, on
the same screen, is where you least want the first bug.

**(6) A nested sheet has no URL.** The desktop tag routes to `/browse/:genre` today
(`Watch.dsx:789`, `795`) — shareable, back-navigable, and the reason `Browse.dsx:24–33` reads
the route param through a computed. A phone-lane sheet would have none of that, so the same tap
would produce a shareable link on desktop and a dead end on phone. That is a worse divergence
than the one this feature is meant to fix.

**The concrete recommendation for this tap:** wire both drawer tag rows to an in-drawer genre
level — reuse the `dsx.variable.sheet == ''` / `== 'speed'` idiom, with a back chevron and the
`/catalog/browse/:genre` payload — and wire the desktop panel's tags to the same level rather
than to `route.push`, so the two lanes are one behaviour. If a viewer wants the full Browse
screen, put a "See all in {genre}" row at the bottom of the level that does the push.

### 6.2 The case against my own recommendation

Three arguments, and they are not weak:

* **Founder's instinct on continuity is right.** A route push tears the viewer out of the
  episode. Even with the clip preserved, the *drawer's* state — its detent, its scroll, its
  selected tab — is lost, and short-drama viewers are in a loop-tight session where that
  friction is expensive. A stacked sheet loses nothing.
* **The in-sheet push inherits the parent's detent.** The drawer is `detents="half,full"`
  (`Watch.dsx:852`); a genre grid landing at `half` is cramped. Rebinding `detents` to `"full"`
  when the level opens *does* work on web (the rebind at `overlay-controls.ts:975–980` matches
  the prior token, fails to find `half`, and lands on index 0 = `full`), but the iOS behaviour
  when `selection` (`Sheet.swift:694`, `705`) holds a detent that has left the set is
  **unprobed**. A stacked sheet sidesteps the question entirely by owning its own detents.
* **This is a template that trains other builders.** "We wanted a stacked sheet and shipped a
  tab swap because the framework could not do it" is the outcome the house law exists to
  prevent. If stacked sheets are the right primitive, the honest move is to build them.

**How to hold both:** build the feature, ship the tap on the cheaper mechanism, and let the
template adopt the stack once it is real. Stages 0–2 are worth doing *regardless* of which
mechanism the genre tag uses — they fix live bugs (§1.3 a–d) that any nested sheet in any DSX
app hits today. Stages 3–5 are the fidelity work, and they should be scheduled against the fact
that they change how **every** DSX sheet looks, not against one tag in one drawer.

If the founder still wants the stack for this tap after reading §6.1 — build Stages 0–4 first,
land the template change last, and accept that the desktop panel lane will need the in-panel
level anyway. Which is the tell.

---

## Appendix A — the oracle fixture

Add to `overlay-controls-browser.ts`'s fixture component (beside the existing sheet at 23–27):

```xml
<button class="stack-trigger" label="Open drawer" on:tap="dsx.variable.showParent = true"/>
<sheet class="parent-sheet" present="showParent" detents="half,full" title="Parent"
       on:dismiss="dsx.variable.parentDismissals = dsx.variable.parentDismissals + 1">
  <button class="open-child" label="Open child" on:tap="dsx.variable.showChild = true"/>
  <scroll class="parent-scroll" style="height: 200px">
    <vstack><text value="row"/><!-- ×40 --></vstack>
  </scroll>
  <sheet class="child-sheet" present="showChild" detents="full" title="Child"
         on:dismiss="dsx.variable.childDismissals = dsx.variable.childDismissals + 1">
    <button class="child-done" label="Done" on:tap="dsx.variable.showChild = false"/>
  </sheet>
</sheet>
```

## Appendix B — the state matrix every stage must keep true

| Action | parent `present` | child `present` | parent dismiss count | child dismiss count | `activeLayers` | focus |
|---|---|---|---|---|---|---|
| open parent | true | false | 0 | 0 | 1 | first focusable in parent |
| open child | true | true | 0 | 0 | 2 | first focusable in child |
| Escape | true | false | 0 | 1 | 1 | the control that opened the child |
| Escape again | false | false | 1 | 1 | 0 | the drawer trigger |
| (from 2 open) tap the exposed parent | true | false | 0 | 1 | 1 | the opening control |
| (from 2 open) set parent key false | false | false | 1 | 1 | 0 | the drawer trigger |
| (from 2 open) drag the child past its lowest detent | true | false | 0 | 1 | 1 | the opening control |
| set child key true, parent closed | false | false | 0 | 0 | 0 | unchanged, one warning |
| route push from inside the child (Stage 6) | false | false | 1 | 1 | 0 | the new frame |
