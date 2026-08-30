# packages/runtime: a declared web package is unreachable unless it declares `boot: true` — this silently disabled Stripe

**One line.** A declared package is imported by the bootloader ONLY when `boot` is true, and
there is no lazy `dsx:package/<scheme>` import anywhere in the runtime — so a package with a
perfectly good web entry answers not-ok forever, because nothing ever imported it.

**Environment.** `dev@92b844b0`, `ClosedSource/DSX/Modules/Core/*/dsx.json` · CLI `build.ts` ·
the web bootloader. Isolated in the short-drama flagship wiring the player's Share control.

**Two layers, and the second is the dangerous one.**

**(a) A complete implementation with no manifest entry.** Core/SocialShare has shipped a
complete web facet since 1.0 — `web/index.js`, the Web Share API with a clipboard fallback,
resolving the same `{ completed, activityType }` as the native lanes — and its `dsx.json`
never declared `web.entry`. The CLI only emits a browser chunk for a package that declares one
(`build.ts`: `if (pkg.entry === undefined) continue`), so every web build had no chunk and
`has('share') === false` while the implementation sat there complete. Fixed by declaring the
entry.

**(b) That was half.** Measured after (a): chunk served 200, import map carried
`dsx:package/share`, and `share.url` **still** answered not-ok — because a declared package is
imported by the bootloader only when `boot` is true, and there is no lazy import path.

**This silently disabled Stripe too.** Core/Payments/Stripe declares an entry, did not declare
boot, and so could not be dispatched from a browser. The web checkout would have failed the
first time anyone set `STRIPE_KEY` and pressed Buy — and **no gate would have caught it**,
because the server refuses first when the key is unset, so the only test that ever ran was the
refusal path. Both modules now boot.

**The ask.** The build already emits an import-map entry for every declared package. The bus
should dynamic-import `dsx:package/<scheme>` on first call, and `boot: true` should be an
optimisation (eager-load this one) rather than the only way to be reachable.

Until then, **any module a template declares without boot is dead weight that fails at the
worst possible moment** — the first time a real key is configured and a real user presses the
button.

**Suggested guard in the meantime.** `despia build` could warn when a package declares
`web.entry` and not `boot`: the combination is, today, always a mistake.
