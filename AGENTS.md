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
- **Return value copies per collection** from server actions (`{ ...row }`) — the wire
  serializer elides repeated references.
- **`api.send(payload)`** — the payload is the body; do not wrap in `{ body: … }`.
- **Repeaters are `list`/`grid`/`pager`/`flow` only** (bind on the repeater, single child =
  row template). Nesting works; FILE components work as row templates with `item.*`
  resolving into their attributes. Inline `<component as=>` does NOT render on web today
  (placeholder — PLAN.md §6.12); use a file component. The external-overlay pattern for
  pager captions remains good design (a caption bound to the resting index doesn't move),
  but it is a choice, not a workaround.
- **Full-bleed = screen facts**: `width="{{ dsx.screen.width }}" height="{{ dsx.screen.height }}"`
  per layer. The style vocabulary has no `vh`/`position`; one unknown property drops the
  whole `style=""`.
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
