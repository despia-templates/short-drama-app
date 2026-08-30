# web/router: the ENTRY component is mounted on every route, in addition to the route's own component

**One line.** On any non-entry route the client mounts TWO `.dsx-frame`s — the entry
component's and the matched route's — so every page renders the home screen's entire
markup beside its own, even though SSR emitted only the correct component.

**Environment.** Measured 2026-08-29 at `dev@ae0669ad` on a production-shaped local origin
(`@despia-native/server` `createSiteHandler` over `despia build` output, service worker disabled,
fresh tab). **Not** the `despia dev` lane — this is the shipped bootloader.

**Repro.**
```
GET /rewards        (SSR)   → body contains Rewards only; "Continue Watching" absent ✓
open /rewards in a fresh tab (client) →
  [...document.querySelectorAll('.dsx-frame')]
    .map(f => f.querySelector('[data-dsx-owner]').getAttribute('data-dsx-owner'))
  → ["App", "Rewards"]                       // App is the entry, and it should not be here
  document.body.innerText.includes('Continue Watching') → true
```
Same on `/show/:id`, `/list`, `/profile` — every route in the table. The entry frame is
mounted FIRST, so the real page renders below a full copy of the home screen.

**Not caused by the consumer.** Verified by `git stash` — the behaviour is identical on the
template's previous commit, whose screens have a completely different structure. It also
reproduces with the route's own component rendering perfectly *inside* its own frame, so
routing itself resolves correctly; the defect is that the entry mount is never replaced.

**Impact.** Every deep link and every SPA navigation to a non-entry route shows duplicated
UI (two navs, the home rails, two tab bars). It is the single most visible defect in a
multi-route DSX web app, and it is invisible from source and from SSR output — which is
why the template only caught it by diffing the SSR body against the live DOM.

**Relationship to #228.** #228's part B described this as "the dev static shell ignores the
deep-linked path" — that framing was too narrow and named the wrong lane. This is the
accurate report: the shipped client bootloader ADDS the entry frame on every route.
Suggest closing #228B in favour of this.

**Suggested direction.** On boot, resolve `location.pathname` against the route table and
mount exactly one frame — the matched route's (falling back to the entry only when nothing
matches). If the entry frame is intentional as an app shell, it must be a *shell* the route
renders into, never a sibling that paints its own screen.
