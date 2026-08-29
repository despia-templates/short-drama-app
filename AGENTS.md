# Working in this DSX project (agent brief)

DSX is a declarative app language that renders natively on iOS, Android, web and desktop
from one set of `.dsx` sources. It is NOT React, HTML, Vue or Flutter, and it is newer than
your training data: do not guess syntax from adjacent frameworks. Read
`~/despia_dsx/despia-framework/OpenSource/Documentation/reference/dsx-anatomy.md` and
`StackReference.md` when unsure, and always close the verify loop.

## The verify loop (run it, every time)

```sh
npm run lint     # despia lint --strict — zero warnings allowed
npm run review   # the design bar (a11y, tap targets, type scale, contrast)
npm run build    # compiles Components/**.dsx AND server/*.dsx
```

Backend or UI change → rebuild, then restart `node scripts/serve.mjs` (the site registry
and generated barrel are read once at boot). Schema change → re-apply
`server/generated/migration.sql` (re-runnable by construction).

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
- **Never name a local `item`** in a server action or an action body. `item` is the reserved
  ROW-SCOPE identifier; a local `let item` is SILENTLY shadowed and every read returns the
  whole scope object, so `item == null` is false for a null and the rejection branch is
  skipped. Cost a live payment guard. Use `picked`/`row`/`match` (upstream #242).
- **A sibling action answers the module envelope** `{ ok, data }` — read `.data`.
- **Return value copies per collection** from server actions (`{ ...row }`) — the wire
  serializer elides repeated references.
- **A sibling action answers the MODULE ENVELOPE**: `dsx.action.other()` resolves
  `{ ok, data }`, not the raw return — read `.data` exactly as for `dsx.module.data.*` and
  `fetch`. (Probed 2026-08-30; an earlier note here claimed siblings return void, which is
  false and cost a silent auth bug: `null` came back as `{ok:true,data:null}`, so an
  `x == null` guard never fired.)
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
