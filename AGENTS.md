# Working in this DSX project (agent brief)

DSX is a declarative app language that renders natively on iOS, Android, web and desktop
from one set of `.dsx` sources. It is NOT React, HTML, Vue or Flutter, and it is newer than
your training data: do not guess syntax from adjacent frameworks. Read
`~/despia_dsx/despia-framework/OpenSource/Documentation/reference/dsx-anatomy.md` and
`StackReference.md` when unsure, and always close the verify loop.

## The verify loop (run it, every time)

```sh
npm run lint          # despia lint --strict — zero warnings allowed
npm run check:styles  # every style property, and every icon, against the framework catalogs
npm run review        # the design bar (a11y, tap targets, type scale, contrast)
npm run build         # compiles Components/**.dsx AND server/*.dsx
npm run verify        # BEHAVIOURAL: boots an origin, asserts payloads, SSR content, authority
```

The first three read the SOURCE; `verify` runs the thing. Three defects shipped in one week
that every static gate passed, because each was a runtime disagreement rather than bad source —
`scripts/verify.mjs` names all three at the top. A change is not done until all five are green.

Backend or UI change → rebuild, then restart `node scripts/serve.mjs` (the site registry
and generated barrel are read once at boot; the origin now reloads its registry when `dist/`
changes and LOGS it, because a stale SSR sheet corrupts styling silently — PLAN.md §6.39).
Schema change → re-apply `server/generated/migration.sql` (re-runnable by construction).

## This project's layout

| Path | What it is |
|---|---|
| `Components/**/*.dsx` | the screens; file basename = component name (`shortdrama.<Name>`) |
| `server/*.dsx` | the declared backend: entities (RLS), actions, routes, `<tool>` MCP rows |
| `scripts/serve.mjs` | LOCAL origin: SSR site + API + the host-gated internal admin twins (see PLAN.md §6.7) |
| `scripts/dev-session.mjs` | the auth-provider seam: mints local viewer/operator JWTs |
| `scripts/seed.mjs` | demo catalogue, seeded through the admin routes |
| `docs/`, `PLAN.md` | the founding program docs; §6 is the upstream ledger — read before "fixing" anything odd |

## House idioms (learned against dev@92b844b0 — see PLAN.md §6 items 6–13)

- **Absence checks are `x == null`** (never `!x` on possibly-null values — stored null is
  NSNull and its truthiness is inconsistent today). Boolean flags may use `!x`.
- **Bracket-read mutation is a silent no-op**: `byKey[k].push(v)` (variable key) writes
  nothing; write back `byKey[k] = (byKey[k] == null ? [] : byKey[k]).concat([v])`.
  Literal paths (`obj.list.push(v)`) work.
- **Never pass `field: null` in `data.create` values** — omit the key.
- **There is NO dynamic module dispatch, and both workarounds fail SILENTLY as success.**
  `dsx.module.data[name]` (a bracket read on the module namespace) resolves the WHOLE
  expression to null, so `await` yields null, every `.ok` reads false, and a loop over table
  names does nothing and returns success. Passing the table object into a lambda —
  `count(dsx.module.data.favorite)` — is worse: the call succeeds and returns ZERO rows,
  because the object loses the caller's RLS scope travelling as a value. Probed on a live
  origin: literal path 5 rows · bracket read NULL · via-lambda 0. Name every entity literally,
  even when that means unrolling twelve near-identical blocks. Verbose beats a sweep that lies.
- **No apostrophe in a `//` comment inside an action body.** The lint balance check counts
  quotes without skipping comments, so one "the route's own ceiling" makes the body report
  `unbalanced (){}[] or unterminated string` and points at the action, not the comment.
- **A request gets 64 module calls** (`ACTION_CALL_CAP`; a spec can lower it, never raise it),
  so anything that touches a row per iteration must be BOUNDED AND RESUMABLE — return a
  `done` flag and let the caller loop. A blown budget is a 503 with the work half-finished:
  measured, an account deletion removed 20 unlocks and abandoned the wallet. And size the
  route's `rate=` to the SWEEP, not to the intent — `3/h` on a one-decision action locked the
  viewer out of finishing their own deletion on pass two.
- **Never name a local `item`** in a server action or an action body. `item` is the reserved
  ROW-SCOPE identifier; a local `let item` is SILENTLY shadowed and every read returns the
  whole scope object, so `item == null` is false for a null and the rejection branch is
  skipped. Cost a live payment guard. Use `picked`/`row`/`match` (upstream #242).
- **A sibling action answers the module envelope** `{ ok, data }` — read `.data`.
- **A PUBLIC declared action CANNOT WRITE, and cannot reach service scope.** `repoFor().create/
  update/delete` calls `mustWrite()`, which throws `forbidden` the moment the caller has no
  identity — so an `auth="none"` route's declared body cannot insert a row (measured, before RLS
  is even consulted), and no declared action ever gets `serviceRepo()` (it "cannot be obtained
  from a HostContext", repo.ts). A public endpoint that must write with service authority — a
  device-registration mint, the ops twins — is a hand-written handler in `scripts/serve.mjs`
  (the provider origin), NOT a `<server>` action, pending the upstream word (§6.128 / §6.7).
- **Return value copies per collection** from server actions (`{ ...row }`) — the wire
  serializer elides repeated references.
- **A sibling action answers the MODULE ENVELOPE**: `dsx.action.other()` resolves
  `{ ok, data }`, not the raw return — read `.data` exactly as for `dsx.module.data.*` and
  `fetch`. (Probed 2026-08-30; an earlier note here claimed siblings return void, which is
  false and cost a silent auth bug: `null` came back as `{ok:true,data:null}`, so an
  `x == null` guard never fired.)
- **THE LOCALIZATION SEAM READS WHAT AN INTERPOLATION RENDERS, so a ternary over literals IS
  translatable.** `bindDisplay` is `localize(interpolate(expr))`, in that order — so
  `<text value="{{ favOn ? 'Saved' : 'Save' }}">` looks up `Saved` or `Save` and hits the
  table (measured: it renders `Liste` under `global.locale = 'de'`). What is genuinely out of
  reach is a CONCATENATION — `EP 1–{{ n }} Free` renders `EP 1–5 Free`, which no table can
  hold. Treating the two the same left 29 strings untranslated in twelve complete locales,
  including `Follow`, `Claim` and the VIP card's `See plans`. `scripts/strings.mjs`
  `ternaryLiterals()` is the rule: one hole, whole attribute, each arm a bare literal.
- **AN EVENT PAYLOAD ARRIVES FLAT, so a declared action input names the key BARE.**
  `<action as="failed" message="message">` reads the payload's `message`;
  `message="event.message"` reads NOTHING — there is no `event` plane, the miss resolves to
  the NSNull sentinel, and `callAction` stores it (`?? NSNull`) rather than erroring. The
  cost is invisible: NSNull is truthy, `== null` is false, and it stringifies `<null>`, so
  the guard passes and the toast says `<null>`. Five sites shipped with the wrong spelling
  and no gate saw one of them (found 2026-09-01, when a cookie came back
  `uiLocale=%3Cnull%3E`). The runner spreads the payload into the handler scope and passes
  that scope as the callee's caller scope, so the bare name is the only spelling that
  resolves — `dsx.this.message` is the documented alternative inside a handler BODY.
- **`api.send(payload)`** — the payload is the body; do not wrap in `{ body: … }`.
- **Never ship an emoji as an icon.** An emoji is a font-dependent glyph with no
  per-platform twin, no tint, and no a11y story; every icon comes from the shared catalog
  (`Conformance/icons/sf-map.json`) so ONE name resolves to Boxicons / SF Symbols /
  Material Symbols. `button` carries `icon` OR `label`, never both — an icon+text control
  is an `hstack` with `on:tap` + `a11yGroup="true"` + an `a11yLabel`.
- **Design numbers come from MEASUREMENT, not taste.** The category reference was read
  live in the browser (nav 80px transparent sticky · gutter 86 · poster 3:4 at radius 16 ·
  rail gap 18 · section head 24/700 at 0.8 · card text 14 · brand red #E52E2E · hero 480 ·
  detail panel 416 with a 6-col episode grid of 64×46 cells at radius 8). Re-measure
  before changing one.
- **Truncating a flex child needs the CSS trio on web** (`white-space: nowrap; overflow:
  hidden; text-overflow: ellipsis`) beside `lineLimit=` — `lineLimit` alone wraps once the
  child is `flex: 1; min-width: 0`. Native honours `lineLimit`; the trio is the web twin.
  AND the column holding the text needs `alignItems="stretch"`: a vstack's default cross
  alignment HUGS, so a nowrap text sizes to its intrinsic width and sails past the parent
  (measured: 321px of title in a 263px column, the trio present and useless because the
  box itself never shrank). Multi-line clamps are the box trio (`display: -webkit-box;
  -webkit-line-clamp: N; -webkit-box-orient: vertical; overflow: hidden`).
- **Repeaters are `list`/`grid`/`pager`/`flow` only** (bind on the repeater, single child =
  row template). Nesting works; FILE components work as row templates with `item.*`
  resolving into their attributes. Inline `<component as=>` does NOT render on web today
  (placeholder — PLAN.md §6.12); use a file component. The external-overlay pattern for
  pager captions remains good design (a caption bound to the resting index doesn't move),
  but it is a choice, not a workaround.
- **Full-bleed = screen facts**: `width="{{ dsx.screen.width }}" height="{{ dsx.screen.height }}"`
  per layer (width via `style="width: 100%"`, never a captured screen fact).
- **Compound style lists are ONE computed value used as the WHOLE attribute.**
  `style="{{ chunk }}; extras"` silently DROPS the chunk — the parser splits on `;`
  first and discards the colon-less `{{ var }}` fragment; only the whole-attribute
  spelling (`style="{{ oneComputedList }}"`) gets the declaration-list door. Single-value
  holes inside one declaration (`maxWidth: {{ n }}px`) are fine. (Measured; upstream lint ask filed.)
- **On web, `style=""` has NO property whitelist** (`mapStyleValue` passes unmapped
  properties through) — transforms, shadows, borders, transitions all work as
  progressive enhancement. Native drops unknown declarations per-declaration, so
  anything load-bearing still needs an attr/class fallback.
- **A transformed or filtered sibling paints ABOVE later plain siblings** (CSS stacking
  contexts): any overlay layered over a poster that carries `transform:`/`filter:` needs
  explicit `zIndex` on its style class (the badgeWrap/chromeLayer pattern).
- **`<grid>` sizes its DIRECT children** — wrap a cell in a `zstack` and the column
  width is lost. Keep the cell as the direct child; overlay inside it via
  `position: absolute` (web enhancement, flow fallback native).
- **A declared rejection reaches `api` results as `{ ok:false, status, data:{reason,message} }`**
  — read `r.data.message` for the toast; `r.error` is transport-only (timeout/network/parse).
- **Fixed-size `<image>` needs style px** (`style="width: 120px; height: 180px"`) beside the
  attrs; `<video>` honors its attrs.
- **Route params** are `vars.id` — in markup AND in action bodies (both verified).
- **CTAs are `<button on:tap="dsx.module.route.push({ path: … })">`** when they need a
  background; `href` containers are for cards/links whose text stays plain.
- **Style the documented way**: layout attributes (`padding`, `spacing`, `align`,
  `alignItems`, `grow`) work inline on every renderer; `style="padding: 16px"` is the
  CSS-string alternative; `style="card"` applies a built-in named preset; and a repeated
  look becomes a `<style as="…">` class referenced with `class=`. All four are correct —
  pick by repetition, not by superstition.
- **Responsive is one vocabulary per screen.** `dsx.screen.width` IS live (a computed
  variable re-derives as the window changes), so each screen derives `bp`
  (phone <768 · tablet <1120 · desktop) once and every responsive number reads from it.
  Wide viewports mount `<TopNav>`; phones mount `<TabBar>`.
- **Interpolate a VALUE, not a CSS chunk.** `style="{{ someCssString }}"` applies only
  sometimes; `maxWidth="{{ n }}"` plus a static `style` is reliable. And `justify-self` is
  not in the CSS bridge — an unknown property drops the whole `style=""`, so centre with
  the parent's `alignItems` instead.
- **`dsx.screen.*` sizing is for HEIGHT.** Sizing a full-bleed layer with
  `width="{{ dsx.screen.width }}"` pins it to whatever the window was at mount — a desktop
  pane then renders the video at 959px inside a 697px pager. Widths are `style="width: 100%"`;
  reach for a screen fact only where a real pixel HEIGHT is needed.
- **A horizontal rail's TRACK is `width: max-content`**, never the page shell's `width: 100%`.
  The shell recipe caps the track at the scroller and the rows eat the difference: measured,
  150px posters rendered at 72.25px and every badge wrapped one letter per line. The gutter
  is the track's padding, both sides. (The framework half of this — horizontal collection
  rows are `flex: none` — landed in `theme.ts` this pass; PLAN.md §6.19.)
- **`list` clamps `limit` to 100 and says nothing.** `repo.ts LIST_LIMIT` is deliberate
  policy, but there is no truncation flag, no cursor and no `count` op, so a read past 100
  rows is unreachable and a caller cannot tell a full page from a complete set. NEVER write
  `limit: 1000`. Read per-parent (one bounded query per show), and where a total is genuinely
  wanted, render "100+" and say why. Cost a shipped storefront where every show past the
  100th episode row displayed "EP 0" (PLAN.md §6.20).
- **A nested column stack is `align-self: stretch`, which silently defeats the parent's
  `alignItems`.** The web sheet stretches a column stack inside a column stack ("a form is a
  block"), and CSS makes a stretch with a DEFINITE cross size behave as `flex-start` — so a
  fixed-size child lands at the leading edge while its siblings stay centred. Five instances
  in this template, all invisible from source. When a sized box must sit where its parent
  says, write `align-self: center` on it (PLAN.md §6.21).
- **A `<video>` establishes its own stacking context**, so a later plain sibling does not
  reliably paint over it — the same law as a transformed sibling. Any chrome over a clip
  needs an explicit `zIndex`.
- **A `<sheet>` re-parents its content into an overlay portal**, which pauses any `<video>`
  inside it; a two-way `paused=` binding then latches that pause forever. Re-assert the
  intent (a `<watch>` on `paused`), bound the retries, and give the viewer a tap target when
  the browser is genuinely refusing autoplay (PLAN.md §6.23). `<sheet inset>` is declared and
  ignored on web, so a full-bleed sheet still needs a named bridge (PLAN.md §6.22).
- **A NESTED `<sheet>` is declared inside its parent's CHILDREN, and it works — but you own
  the cascade and the router does not know it exists** (PLAN.md §6.95). Nesting IS the
  declaration: on iOS the sheet slot is an escaping closure, so the child's anchor only
  exists while the parent is presented and UIKit stacks the two cards. Two `<sheet>` tags as
  SIBLINGS are not a stack — a view controller presents one thing at a time, so the second
  silently does nothing. What the engine already gives you, measured: level ledger (1/2),
  z 10001/10002, the parent's portal scope `inert` + `aria-hidden`, per-level Escape, focus
  restored to the control that opened the child, one scroll lock across both, per-level
  detents, and drag-to-dismiss on the top card only. What it does NOT: (1) **closing a parent
  leaves the child open**, orphaned at level 1 with its key still true — so a sheet with a
  child closes through ONE action that clears the child first, and every writer of the
  parent's key goes through it; (2) **`route.push` from inside any sheet leaves it painted
  over the new screen** — the router never consults the overlay ledger, so every navigation
  out of a sheet closes the sheet first, in an action. Three shipped surfaces here had defect
  (2) before it was measured. Also: a stacked child MUST carry `title=` (it is the panel's
  accessible name) and a back affordance that says where it goes — the system `close=` control
  dismisses the top card but cannot name the level below it.
- **A nested sheet has to BEAT a route push, not just differ from it.** A sheet keeps the
  viewer in place; a route takes them somewhere. Use the level when there is live state behind
  it worth preserving — a playing episode, a half-made purchase decision, a drawer's detent
  and scroll. Use the route when the destination is a real page that should own the frame and
  wants a URL (a show, a browse result, a benefits page). In this template the player's genre
  chips and the plans sheet's "what you get" earned levels; the search results, the ad's
  paywall link and the desktop panel's chips are routes, and each says why in place.
- **A route param is readable in markup, in a computed and in an action body — NOT in a plain
  `<variable>` initializer.** An initializer runs before the param is in scope and reads empty,
  so `/browse/Revenge` server-rendered "All series" with no error anywhere. Seed from a
  `computed="true"` instead (PLAN.md §6.32a). And declare the PARAMETERISED route before its
  bare sibling: with `/browse` first, `/browse/Revenge` rendered the right screen but wrote
  `/browse` into history, so a reload showed something else (§6.32b).
- **`await` is a STATEMENT, never a ternary branch.** `x = c ? await f() : await g()` returns
  something whose `.ok` is falsy — silently, in a server action. Isolated against the identical
  if/else, which works (PLAN.md §6.31).
- **JSE `+` is TOTAL ARITHMETIC, so `'' + n` is the NUMBER n, not a string.** Building a
  zero-pad the JS way (`let ss = '' + sec; if (sec < 10) { ss = '0' + ss }`) yields 4, not
  "04", and the clock renders "0:4" — on BOTH lanes, so it is a language law and not a
  renderer bug. Grow the string from an anchor that can never parse as a number
  (`let out = m + ':'` then `out = out + '0'` then `out + sec`); every later `+` is then a
  concatenation. Same family as the ternary rule below — prefer statements.
- **A repeater row is a DICT, never a scalar.** `item` is the reserved row SCOPE, so a `<list>`
  bound to an array of strings renders "[object Object]" and collapses to one row under
  `key="index"`. Store `[{ term: 'x' }]` and read `item.term`.
- **A player is a TWO-COLUMN surface when the window can hold one — ON THE WEB.** Re-measured
  live 2026-09-01, and two claims here were wrong. (1) The panel is not a fixed 416: ShortMax's
  web player computes `width: 30%; max-width: 480px; min-width: 320px`, and its collapse
  breakpoint is **1024px**, not 1120. (2) "Every reference player" overstated it — ReelShort's
  and DramaWave's **iPad** builds are the phone player STRETCHED into a 4:3 frame, same rail,
  same title row, no second column. The two-column pattern is a WEB pattern; on tablets the
  category mostly does not bother. Keep our tablet lane two-column because it is better, but
  do not cite the category as authority for it. The panel content order IS confirmed live:
  breadcrumb → episode title → creator → counts → plot → tag pills → range pills → grid.
  Cell geometry has TWO idioms, not one: ReelShort draws 64.33×46 numeric cells, 6 columns,
  gap 6; ShortMax draws 40×40 cells, 5 columns, gap 4. Both at **radius 8**. The current cell
  is never a flat fill — ReelShort paints a radial gradient of #FF3D5D at 34% anchored to the
  cell's bottom-right (96% 92%), ShortMax a #0006 wash with a 1px hairline and an orange glow.
  Range pills chunk at **50** on both. A "free until ep N" caption appears nowhere in the
  category: the reader infers the boundary from where the padlocks start (ours labels it —
  a deliberate, honest divergence, not a miss). The old text put the episode grid in a
  persistent 416px right panel beside the clip — breadcrumb, episode title, tags, plot, counts, range pills,
  6-col grid — and collapses to the bottom drawer only when the window cannot fit both. A
  9:16 clip alone on a 1440px desktop is two black voids and a list nobody can see without
  opening a sheet. Both lanes render the SAME pieces (`ranges`, `visibleEps`, `gridLocked`)
  so they cannot drift, and the drawer TRIGGER goes inert in the panel lane rather than
  opening a duplicate list.
- **A data screen paints STALE-THEN-FRESH, never blank.** `<api cache>` is keyed by the
  per-mount store and dies with the screen (PLAN.md §6.30), so a tab revisit refetches from
  zero — measured 103ms of empty rails on localhost, 300–600ms on a real network. Every data
  block therefore stashes its payload app-wide (`on:success="global.cacheX = block.data"`) and
  every READ goes through one computed (`if (block.data != null) { return block.data } return
  global.cacheX`). One key per ENDPOINT, not per screen, so the five screens reading
  `/wallet/state` share a cache. Two rules that come with it: an error branch must also test
  the view is empty (a failed refresh must not throw a dead end over good content), and a
  stash keyed by a route param needs an ID GUARD or show B borrows show A's art.
- **Global chrome never rides a route transition.** THREE halves now. (0) Mark the bar
  `chrome="true"` on its own root (TopNav/TabBar do it once, so no caller can forget): the
  opacity family then animates the frame's content and leaves the bar alone, walking down to
  it and animating its siblings at every level — measured, the bar holds opacity 1 while the
  page goes 0.32 → 1. Nesting is fine; the bar does NOT have to be a direct child. (1) `<TopNav>` must be the
  FIRST child of an UNPADDED wrapper: a `page` style carrying `paddingTop` pushes the bar off
  y=0 (measured 16px on Store, 12px on Notices, against 0 everywhere else), so a route change
  visibly drops the bar — put that padding on the content BELOW the bar, which also leaves the
  phone lane, where no bar renders, pixel-identical. (2) A PUSHED route mounts no tab bar: the
  phone lane transforms the whole frame, so chrome inside it slides in with the page and no
  compositing trick can save it (UIKit calls this `hidesBottomBarWhenPushed`). Tab roots keep
  their bar and are `motion: "none"`, so it never moves there either. Wide viewports crossfade
  (`router.wide: "dsx"` + `motionBreakpoint` matching the app's own chrome breakpoint), and the
  neutral family is opacity-only over an OPAQUE under-frame — so a bar both frames paint
  identically composites STILL, while only a changed active tint cross-dissolves (PLAN.md §6.29).
- **Ask the CAPABILITY plane before the platform.** `has('scheme')` answers "can I",
  `os` answers "which words" (`ios · android · web · macos · windows · linux`), `env` answers
  "which channel". A lane picked by `os == 'web'` first sends a build that DOES have the
  module down the fallback for no reason — see `Components/parts/AdGate.dsx`.
- **Art is authored at the ratio it is displayed at.** A 2:3 poster in a 3:4 frame under
  `object-fit: cover` loses a quarter of its height, and one 16:9 hero cannot serve both a
  3:1 desktop band and a 0.75:1 phone frame — generate both (`scripts/gen-art.mjs`).
- **Purge the service worker before you trust a local measurement.** `despia build` emits a
  precaching SW; a stale bundle against fresh SSR HTML makes correct markup look broken
  (this cost a full redesign once — PLAN.md §6.13a). `npm run serve` sets `DSX_DEV_NO_SW=1`
  so the local origin never serves one.
- **A `<formula>` is read by BARE NAME in an interpolation** — `style="{{ coverCell }}"`, never
  `style="{{ dsx.formula.coverCell(item.rank) }}"`. Inside a repeater the formula's declared
  inputs (`r="item.rank"`) bind from the row scope automatically. The call spelling produces
  nothing, the whole `style=""` is then empty, and the element falls back to intrinsic size:
  measured, 78×104 poster cells rendered at 360×480 and ate the entire hero band. The linter
  does not catch it.
- **A markup attribute arrives as a STRING; `default=` is a JSE EXPRESSION.** `overArt="true"`
  is four characters, `default="false"` is the boolean, and `dsx.attribute.overArt == true` is
  therefore false for the caller who wrote the obvious thing. Either interpolate a real value
  (`overArt="{{ true }}"`) or accept both spellings in the consumer — and prefer the latter,
  because a component cannot make its callers remember.
- **A HYDRATED `<scroll>` has no scroll plane** (PLAN.md §6.40): a server-rendered screen's
  outermost scroller comes back with no `data-dsx-scroll-axis`, no inline `overflow`, none of
  the scroll-linked custom properties and no `on:scroll` dispatch — while the identical
  component mounted by a client-side route change has all of it. So a scroll-driven affordance
  works everywhere except the page a viewer LANDS on. Design it static, or verify it on a cold
  load specifically. (Nested scrollers are fine; only the hydrated root is affected.)
- **Restart `npm run serve` after every build, and know why.** Atomic style ids are POSITIONAL
  and the SSR html and the client bundle each carry their own copy of the same id namespace
  (PLAN.md §6.39). One stale sheet does not fail loudly — it hands elements each other's
  declarations. Measured: the top nav rendered 32×64 instead of 1440×64, wearing the logo
  square's width and the bar's height. The dev origin now reloads its registry when `dist/`
  changes and logs it, so trust the log rather than your memory.
- **Every icon must be in `OpenSource/Conformance/icons/sf-map.json`, and `check:styles`
  now proves it.** A name outside the catalog often still renders on web — Boxicons has plenty
  the catalog does not map — which is exactly what makes the defect invisible: it looks right
  in the browser and the glyph is missing on iOS and Android. Two shipped here before the gate
  existed (`eye` beside every view count, `rectangle.stack` in three empty states).
- **Art is cropped by the FRAME, so check the frame's ratio before choosing the asset.** A 9:16
  stage showing 3:4 art under `cover` loses a quarter of the width — and if the asset bakes its
  title, the reader gets "y Cold Campus Prince". Assets with baked type can only go in frames
  authored for them; a frame of any other ratio takes an untyped asset (`hero_tall`) and lets
  the markup carry the words.

- **Layout in `style=""` is WEB-ONLY, and the fix is ADDITIVE.** The native renderers drop an
  unmapped declaration per-declaration, so `flex: 1`, `width: 100%`, `min-height: 0` and
  friends simply do not exist off web: measured on an iPhone 17 Pro, the entry screen booted,
  registered all 18 components, routed and fetched its data, and rendered near-blank because
  no box had a size. The catalog has a cross-platform twin for nearly all of it — `grow`
  (`true`/`width`/`height`), `width`/`height`/`minHeight`/`maxWidth`, `aspectRatio`, `padding*`,
  `spacing`, `align`/`alignItems`, `gradient*`, `zIndex`, `opacity`, `scale`.
  **Add the attribute, keep the CSS.** Verified both ways on the same build: with
  `grow="true"` AND `style="flex: 1; min-height: 0"` on the root scroller, web still measures
  1440×900 and native finally gets a box. Removing the CSS in favour of the attribute alone
  REGRESSED the web (the page hugged its content instead of filling the window), so a port
  that swaps is a port that breaks the shipped lane; a port that adds is free. The one
  exception with no attribute twin today is `position: absolute` overlays (main-axis
  alignment landed 2026-09-02, dev@6c5f185a: `justify-content: flex-start|center|flex-end`
  reaches the Compose stack and a column's fixed frame — the old upstream #238), which need a `zstack` + `align` fallback beneath
  the web enhancement. `lineLimit` already works natively, so the nowrap/ellipsis trio and the
  `-webkit-line-clamp` box are correct as they stand — they are the web twins of an attribute
  that is already there. PLAN.md §6.43 counts what remains: 252 structural declarations.

- **A SCREEN ROOT is `grow="true" spacing="0"`, and its `min-height` rides `:web`.**
  `min-height: {{ dsx.screen.height }}px` is the WEB body-height mechanism; on native it
  forces window height into the safe region and the spill carries the tab bar into the
  home-indicator zone (measured 34pt). A native route frame already proposes the safe
  region — `grow="true"` fills it. The vstack default spacing (8, both lanes) plus a
  zero-size seed child used to be a 14pt phantom above the scroller; the engine no longer
  gives a registration-only mount a stack slot, so `spacing="0"` on a root is now a design
  decision rather than a workaround (keep it — a screen root has no gap to declare).
  Safe-area clearance itself belongs to the INSET PLANE on every lane (the native frame,
  the web `.dsx-frame` env() padding) — never to a screen's own padding.
- **A progress fill is COMPUTED PX or a MEASURED track — never `width: N%`.** The native
  bridge drops non-100 percent lengths silently (upstream #281): the web shows a 64% fill,
  the device shows an empty track. Statically-sized track → compute the px in the hole
  (`width: {{ Math.round(trackW * pct / 100) }}px`); fluid track → the reference's seek
  idiom (`measure="dsx.variable.bar"` + `width="{{ Math.round(bar.width * pos) }}"`).
- **Overlays may trust `height: 100%` and computed styles on native now.** Two engine fixes
  (dev@4526ef24): the whole-attribute computed spelling reaches the native bridge (it was
  silently inert — a fixed-size overlay collapsed to its 3px child), and a zstack sizes from
  its NON-greedy children only, so a `height:100%` scrim covers the band instead of
  inflating it 2.2×. If an overlay drifts on device, rebuild the export before porting
  anything — the recipe itself is sound.
- **A CAPPED, CENTERED column is `grow="width"` + `maxWidth` + `align:native="center"`.**
  `flex: 1` is dead natively (never-bridged) — the column HUGS and sits leading; grow is its
  twin. The cap now bounds grow (dev@0c73f390), and `align:native` folds (the gate once
  probed only style:/class: keys). Web keeps `margin: auto` + `flex: 1`; the suffix keeps it
  byte-true. Probe-measured: 0..199 → 101..301 in a 402 viewport.
- **A variable font's weights live on `wght`, and the engine drives it from CSS now**
  (dev@1c251901): declare the axes in `Fonts/DSXFontRegistry.json` (`"axes": {"wght": [100,900],
  "opsz": [14,32]}`) and every `fontWeight`/`font-weight` just works natively; `opsz` tracks the
  point size automatically (CSS `font-optical-sizing: auto` parity) — never pin it in the
  registry. One face file, the whole ramp.
- **Distributions and margins are BRIDGED now** (dev@7d649625/38f94bdd): `justify-content:
  space-between|around|evenly` distributes natively with exact CSS ratios, and `margin-*`
  applies outside fills — negative `margin-top` is the sanctioned pull-under (the hero-
  under-transparent-nav recipe). Two riders: `auto` margins still center via the parent,
  and a component root's z-index does not escape its instance natively — when a sibling
  will overlap a mounted component, put `zIndex` ON THE MOUNT TAG.
- **THE SAFE-AREA LAW: full-bleed surfaces pay the insets back through the FACTS.** A
  screen that owns the whole window (`ignoreSafeArea="true"` root) pads its chrome with
  `{{ dsx.screen.safeTop + N }}` / `safeBottom` — published on every lane (iOS window
  insets; web resolved env(), 0 in a browser tab, real in a standalone PWA). Never a
  device constant, never window-height stages inside the safe region (the EP pill spilled
  off-screen). Overlays and paywalls balance their inner padding the same way.
  THE TAB-ROOT COROLLARY, and it is the opposite of the obvious fix: SHARED CHROME HAS ONE
  GEOMETRY AND SCREENS CONFORM TO IT. A tab bar must read nothing about the safe area. The
  frame already proposes the safe region, so the bar is clear of the indicator by
  construction, and the only way its captions land at two different heights is a screen
  handing it a different box.
  Measured, both halves. Discover sized its stage `dsx.screen.height - 70` and its pager
  carried `ignoreSafeArea`, so the column got all 874pt; stage 804 + bar 70 filled the window
  exactly, inside a frame offering 781 — the bar sat in the last 70, which contains the 34pt
  indicator, and the captions clipped. The tempting fix — pass the inset to the bar so it pays
  it back — WAS TRIED AND IS WRONG: it made the bar 104pt on that screen against 70
  everywhere else, so the captions stopped clipping and started SHIFTING as you changed tabs.
  Compensating in the shared component turns a clip into a drift.
  The fix is that the screen conforms, in three parts. (1) No `ignoreSafeArea` on a pager whose
  sibling is chrome — that attribute belongs only to a screen owning the WHOLE window and
  paying every inset back itself (Watch does exactly that, and mounts no tab bar, §6.29).
  (2) Height comes from the SAFE REGION, and the engine publishes it: **`dsx.screen.safeHeight`
  / `safeWidth`** are the window minus its insets, clamped at zero, identical on all three
  renderers. Never rebuild it out of `screen.height` and four insets — never mind
  `screen.height` alone. (3) **A screen that must know a shared bar's height ASKS it**
  (`measure=` on the mount) rather than typing the number a second time. That last one is not
  pedantry: `chromeH = 70` against a bar that measures 65 was the final 5pt of this drift, and
  it survived a round of fixing precisely because 70 looks like a decision rather than a guess.
  Measured on an iPhone 17 Pro, probe-free, VIP-badge fiducial across Home / For You / My List /
  Profile: spread **4.67pt → 0.00pt**, bar bottom 839.7 against a safe edge of 840.
  Any screen deriving a height from `dsx.screen.height` while chrome shares its column, or
  hard-coding a shared component's size, is making one of these mistakes.
- **Icons are UNIFIED here** (App.json `icons: "unified"`, dev@37e1c82c): native draws the
  web's own 24×24 Boxicons paths — same geometry, same em-box, so icon spacing is
  pixel-true. `position: absolute` + edge insets and `filter: blur(N)` are bridged now;
  image placeholders paint CLEAR (an img without pixels paints nothing on web — no white
  boxes over transparent art). The seek bar is the reference scrubber
  (custom-ux.md PlayerScrubber): track/fill/thumb off one `measure=` box, drag = seek.
- **`flex: 1` fills natively now** (dev@bff4c16d) — a DIRECT stack child's raw inline
  `flex: 1`/`flex-grow: n` re-renders with a synthetic grow on the parent's axis, own
  fills expanding with the box. One rider left: only raw literals (a computed flex hugs —
  spell `grow=` there).
- **THE COMPONENT BOUNDARY CARRIES THE FILL NOW, and a registration is not a flex item.**
  The old note here said a boundary hides the inner flex from the row, so put `grow="width"`
  on the mount tag. That was a workaround for an engine gap and the gap is closed: a mount's
  resolved grow reaches the template ROOT as a synthetic default, so the component's own
  background widens with the box (measured on an iPhone 17 Pro: `<SignInCard/>` painted
  16.00–361.67 inside a correct 16.00–385.67 frame; it now paints 16.00–385.67, the same as
  the plain card beside it, and the same as web). A `grow=` still on a mount tag is harmless
  and now redundant. Two siblings landed with it: a component's `<head>` registers at
  INSTANCE BIRTH, so a route change no longer paints one classless frame (the tab bar's
  captions used to sit 9.33pt low for exactly one frame after every navigation — its own
  `paddingTop`, missing), and a mount that renders nothing (`<Theme/>`, `<Analytics/>`, the
  `width="0" height="0"` idiom) takes no stack slot, so a spaced column stops paying a gap on
  both sides of nothing (measured 40.00 in a column declaring 20.00; now 20.00 on both lanes).
  `zIndex` ON THE MOUNT TAG is unaffected and still the rule.
- **Probe before you generalise.** If a property "doesn't work", reproduce it in a throwaway
  one-element component first. Three framework defects were once filed from one bad
  measurement; all three were false.
- **Head order** is canonical and linted: attributes → expects → events → api → variables
  (plain, then computed) → formulas → actions → watch → style.

## The law

This template is AI training data and the reference for thousands to come. A framework
limitation is NEVER worked around silently: file it (PLAN.md §6), bridge it loudly in
place, or degrade per Article 7 with the degradation named in the UI (the Rewards ads card
is the model). `npm run lint` and `npm run review` gate every merge.

- **A COLUMN INSIDE A HORIZONTAL ROW HUGS WITH `width="fit"`.** A `vstack` of label + rule
  inside an `hstack` inside a horizontal `<scroll>` was proposed a SHARE of the viewport on iOS
  and truncated its label ("Pic…", "Ra…") while the web's `width: max-content` track let it
  hug; `width="fit"` (the catalog's hug primitive) sizes the column to its content on every
  lane. Measured on the Home tab strip, iPhone 17 Pro.
- **AN OVERLAY ROW THAT MUST NOT COLLIDE IS ONE ROW WITH `justify-content: space-between`,
  never two absolutely-positioned siblings.** Two corner overlays on a 116pt cell ("ORIGINAL"
  bottom-left, the play count bottom-right) overlapped; one `left: 6px; right: 6px` row that
  distributes cannot. Both native absolute planes had a sizing divergence for exactly that
  spelling (PLAN.md §6.137, §6.141) — fixed upstream, so the spelling is now the same pixels
  on three lanes.
- **A CHROME-LESS `<sheet>` NAMES ITSELF WITH `a11yLabel=`.** A sheet that draws its own heading
  (no `title=`) had no accessible name on the web; the universal attribute now names the panel
  (dev@4fd3b2a7). The native halves are filed (PLAN.md §6.138) — declare it anyway, so the day
  they land nothing in the template changes.
- **REMIND ME IS THREE HALVES AND THE TOAST SAYS WHICH ONES LANDED.** Core/Notify asks the
  permission, server/reminders.dsx keeps the row, Core/LocalPush `send` schedules the one-shot —
  and only on the lanes whose `send` outlives the page: the web facet is a page timer, so a
  premiere days out is never armed there (PLAN.md §6.139). Ask `has('localpush')` first, then
  `os`, and never report a notification you did not arm.
