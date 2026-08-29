# article 10: VerticalPlayerStack has no web facet

**One line.** `Custom/VerticalPlayerStack` (shelf: open) is the vertical short-drama player —
DSX UI, Swift/Kotlin trust cores — and has no `web/` twin, so the one surface a fully-SSR
drama storefront needs most renders nowhere on the web.

**Environment.** Measured on `dev@92b844b0`, re-verified 2026-08-29 evening at `dev@ae0669ad`
(`git diff --stat` over the relevant packages between the two: empty). Consumer: the
short-drama flagship template (`despia-templates/short-drama-app`) with `file:` deps on the
checkout's `OpenSource/Web/packages/*`, probes run against a freshly rebuilt `dist/`.
Filed under the template program's no-hacks law: the template ships a labeled bridge where
one exists, and the bridge dies when this lands.

**Observed.** `ClosedSource/DSX/Modules/Custom/VerticalPlayerStack/` contains `dsx.json`,
`Components/**` (player + paywall in DSX), `swift/`, `kotlin/` — no `web/` directory, no
`web` block in the manifest, so export-presence gating correctly reports the capability
absent on web.

**Impact.** The flagship template had to author its own web player screen
(`Components/Watch.dsx`: `<video>` + chrome + paywall over the same `/wallet` seams). That
screen is honest template code, but it means the paid-gate trust behaviour exists twice —
once in the module's trust core for native, once in template markup for web — which is the
exact divergence Article 10 exists to prevent.

**Suggested direction.** A `web/index.js` twin over the primitives the module already
composes (`<video>`, `<pager>`, `<sheet>`), reusing the same payload contract
(`episodes[]`, `locked`, `cost`, access polling) and the same events. The template's
`Watch.dsx` can serve as the reference for what the web face must cover, then be deleted
in favour of the module.
