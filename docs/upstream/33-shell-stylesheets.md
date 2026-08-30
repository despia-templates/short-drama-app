# build/shell: the bundled face was unreachable — no app built by `despia build` could link a stylesheet into its head

**One line.** The framework SHIPS Inter and `--dsx-font` names "InterVariable" first, but no
app could link `inter.css`, so every DSX app rendered in whatever face the OS supplied.

**Status.** CLOSED — both halves fixed upstream in this pass. Filed for the record; the
measurement is worth keeping.

**Environment.** `dev@92b844b0`, `server/src/page-render.ts` (`ShellOptions`) and the CLI's
static export. Measured in the short-drama flagship against the reference sites.

**Why the gap existed, and why it was defensible.** The token sheet is deliberately asset-free
— it is inlined into SSR heads, injected at boot, adopted into shadow roots and handed to a
WKWebView: four different base URLs. So `inter.css` correctly says "a surface links this file
once". Every surface could. Except an app built by `despia build`: `ShellOptions` carried
appName, theme, importMap, mainSrc, lang and manifestHref — and no way to add a `<link>`.

**Measured before the fix.**

- `document.fonts` — **empty**.
- A width probe: "InterVariable" and "Inter" resolved *identically to the default serif*.
  Every glyph fell through to system-ui.
- The type ramp names 400/500/600/700, and the static system faces on Windows 10 and the
  common Linux fontconfig **cannot draw 500 or 600**. So the app was asking for weights its
  font did not have, and rendered a different face on every OS — which also makes a
  template's own screenshots irreproducible.

**Fix applied.** `ShellOptions.stylesheets?: readonly string[]`, emitted as
`<link rel="stylesheet">` *before* the inline token sheet. Every face in the bundled sheet is
`font-display: swap`, so a 404 still shows fallback text immediately.

**Second half, which is the one that mattered for deployment.** A hand-written host could pass
the option; `despia build`'s static export could not, so the *deployed* build still had no
face while the local origin looked correct. Now `resolveFontsDir` locates the bundled face,
the build copies it to `dist/fonts` and writes `stylesheets: ["/fonts/inter.css"]` into
`registry.shell` — which BOTH lanes read (`live.ts` spreads it, `exportStatic` emits the
link).

**Verified after.** Live page and static export both link `/fonts/inter.css`; the latin face
reports `loaded`; latin-ext stays deferred by unicode-range; InterVariable measures distinctly
from both system-ui and serif.
