# dx/dev-lane: two ways the local lane silently misleads (precaching SW; static shell ignores the deep-linked path)

**One line.** Two independent dev-lane behaviours make correct code look broken (or broken
code look fine) with no signal — one cost this template a full false-defect cycle that is
now a public retraction in its ledger.

**Environment.** Measured on `dev@92b844b0`, re-verified 2026-08-29 evening at `dev@ae0669ad`
(`git diff --stat` over the relevant packages between the two: empty). Consumer: the
short-drama flagship template (`despia-templates/short-drama-app`) with `file:` deps on the
checkout's `OpenSource/Web/packages/*`, probes run against a freshly rebuilt `dist/`.
Filed under the template program's no-hacks law: the template ships a labeled bridge where
one exists, and the bridge dies when this lands.

**A. The precaching service worker on dev origins.** `despia build` emits `dsx-sw.js`;
once a browser registers it against `localhost`, later rebuilds serve fresh SSR HTML while
the SW replays the stale bundle. Style tokens are per-build identifiers, so fresh markup
meets an old stylesheet and every rule silently resolves to nothing — which presents as
"padding attributes don't emit on web". Three framework defects were filed from that
window and later retracted after clean-room probes (the template's PLAN.md §6.13a keeps
the correction of record). Ask: refuse SW registration on loopback origins (or emit a
no-op SW in dev), and/or make `despia doctor` flag "a service worker is registered against
a dev origin". This failure class is undetectable from source, which is exactly when
tooling has to speak.

**B. The dev static shell ignores the deep-linked path.** On `despia dev` (5273), a direct
load of ANY non-entry route — including long-standing ones — renders the ENTRY component:
`GET /show/<id>` → Home, title and all; `history.pushState('/probe/xyz') + reload` → Home.
The registry served by the same origin lists the route. SPA navigation from Home works;
only cold loads mis-resolve, so page-refresh during iteration silently loses your place
and any param-route screen is untestable on the dev lane (this template had to verify
param routes against its SSR origin instead). Ask: on boot, resolve `location.pathname`
against the route table before adopting the pre-rendered entry shell.
