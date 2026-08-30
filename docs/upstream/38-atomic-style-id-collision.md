# web/ssr: atomic style ids are POSITIONAL and UNVERSIONED, so a stale html page silently wears another element's styles

**One line.** A compiled page's styles are atomic classes numbered by position —
`[data-dsx~="a517"] { … }` — emitted **twice** into one namespace: once into the SSR html from
the server's registry, once at runtime into `<style id="dsx-app-css">` by the client bundle.
Nothing ties the two together, so when they disagree the ids still MATCH and the cascade
quietly hands each element somebody else's declarations.

**Environment.** `dev@92b844b0` / `dsx@0.1`, web renderer + `page-render.ts`. Measured in the
short-drama flagship after one forgotten server restart.

**What it looks like when it fires.** Add one styled element anywhere earlier in the app and
every id after it shifts by one. Measured on this template:

```xml
<hstack chrome="true" class="nav" style="width: 100%; position: sticky; top: 0; z-index: 50">
```

rendered **32×64 instead of 1440×64**. The client's `a517` was the 32px logo square; the SSR
sheet's `a517` was the bar. The nav wore `width: 32px` from one sheet and `height: 64px` from
the other, and the entire top bar collapsed — links overflowing, the CTA pill jammed into the
wordmark.

**There is no signal of any kind.** No console warning. No hydration-mismatch report. No
error. The page simply looks wrong, and every element after the divergence point is equally
wrong. Two sheets, both valid, both applying.

**Why this is a production problem and not a dev annoyance.** Locally it is a forgotten
restart. Behind a CDN or a service worker it is the **normal state of affairs**: a cached html
document routinely outlives the bundle it was rendered against. `despia build` already emits a
precaching SW, so a DSX app can ship into this by default. It is the same class of trap as the
stale-SW finding filed earlier, one layer down and considerably harder to see — that one made
correct markup look broken, this one makes *unrelated* markup look broken.

**The ask.**

1. **Give the sheet an identity.** Hash the emitted declaration set and stamp it on both faces
   — `<style id="dsx-app-css" data-dsx-sheet="…">` and a matching attribute in the SSR shell.
2. **On mismatch, do not merge.** The client re-renders its own sheet and drops the server's,
   and says so once in the console.
3. **Longer term:** content-addressed ids (`a-7f3c91`) remove the class of bug outright, at
   some cost in bytes and gzip ratio.

**Bridge in the template meanwhile.** `scripts/serve.mjs` re-reads `dist/registry.json` when
its mtime changes and rebuilds the site handler, so the local origin can never serve an html
page from an older build than the bundle beside it — and logs when it reloads. That covers the
dev lane; it cannot cover a CDN.
