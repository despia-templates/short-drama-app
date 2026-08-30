# distribution: the public Apache-2.0 drop mirrors a branch BEHIND `dev`, so the documented fallback cannot build a template written against `dev`

**One line.** `despia-native/despia` is the open drop of the same tree and is the checkout the
short-drama template's README and preflight both name for anyone without access to the private
repo — but it is not equivalent, and a clean clone built against it fails with **38 hard lint
errors** on markup that is correct and shipping.

**Environment.** Measured 2026-08-30 by the template's first CI run, which is exactly what CI
is for. Framework `dev@621b8dc5`; drop at its latest mirror commit the same morning.

**The measurement.**

| | `dev` | the drop |
|---|---|---|
| `Documentation/reference/stack-elements.json` universal attributes | **38** | **30** |
| `href` | present | missing |
| `chrome`, `shared`, `sharedMode`, `sharedAnim`, `sharedOrder`, `lockOrientation`, `dismissEdge` | present | missing |

The census is what the linter enforces, so the drop rejects a documented, implemented,
working attribute. Result on a real template: **38 errors**, plus notices on `chrome=`,
`shared=` and `dismissEdge=`. This is the census corrected upstream in the
universal-attribute-census issue — the fix is in `dev` and has not reached the drop.

**Two more gaps, structural rather than stale.**

1. The drop carries no `ClosedSource/`, so `Core/Payments/Stripe` and `Core/SocialShare` cannot
   be configured. Every `dsx.module.stripe` call then warns — a failure under `--strict`.
2. The drop's ROOT is the contents of `OpenSource/` (`Web/`, `Documentation/`, `Conformance/`
   sit at the top level). The obvious `git clone … despia_dsx/despia-framework` therefore lands
   every package one directory above where a template's `file:` deps look, and npm answers with
   ENOENT and no hint of the cause. It must be cloned INTO `OpenSource`.

**Why it matters.** The drop is the ONLY lane for anyone outside the private repo, and the
template program's whole point is that a stranger can clone a template and build it. Right
now they cannot, and the only way to discover that is to build and read 38 errors about
markup that is correct.

**The ask, in order of value.**

1. **Mirror `dev`**, or publish a second drop that tracks it, so the open lane can build what
   the templates are written against.
2. **Say in the drop's README which branch it mirrors** and how far behind it may be.
3. **Publish the `@despia-native/*` packages to npm.** That retires the sibling-checkout
   convention, this issue, and the layout trap in (2) all at once.

**Bridge in the template meanwhile.** CI builds against `dev` with a read token and *skips*
rather than failing when the token is absent — a red badge for a missing credential is noise.
`scripts/preflight.mjs` catches the one-level-too-high layout by name and prints the fix, and
the README states plainly that the drop lags and what that costs.
