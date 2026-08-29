# review: R3 (type scale) has no project type-ramp declaration — a measured brand ramp cannot pass

**One line.** `despia review` R3 warns for any `fontSize` off the built-in iOS ramp
(11 12 13 15 16 17 20 22 24 28 34), and there is no way to declare a project's own type
ramp — so an app whose typography is measured off its category reference (nav links 18/700,
section headings 24/700, card text 14, hero 32) fails the gate for being *consistent with
its design*, which is the opposite of what the rule is protecting.

**Environment.** Measured at `dev@ae0669ad` while building the short-drama flagship
(`despia-templates/short-drama-app`) to a 1:1 reference of the category's live web apps.

**Observed.** The reference storefronts use a 14 / 18 / 24 / 32 ramp. Those are not
arbitrary sliders — they are the design, applied consistently across every screen. R3
flags 14, 18 and 32 on every file that carries them, and the "nearest is 13/17/34"
suggestion would *break* the 1:1 match the design requires. There is no `appearance`, no
project ramp, and no per-file opt-out.

**Sibling ask.** This is the same shape as the palette gap filed as #230 (R4 has no
brand-palette valve). One project-level **design-system declaration** would close both:

```jsonc
// dsx.config.json
"design": {
  "palette": { "brand": "#E52E2E", "coin": "#F6B63D", "surface": "#141419" },
  "typeRamp": [11, 12, 13, 14, 15, 16, 17, 18, 20, 22, 24, 28, 32, 34]
}
```

R3 then counts sizes outside the declared ramp, R4 counts hexes outside the declared
palette, and both rules keep their full sprawl protection while the reviewer finally
understands what the project's system *is*. Bonus: the palette could surface in the style
vocabulary (`color="brand"`), which is the real design-system win.

**Template bridge (dies when this lands).** `scripts/review.mjs` waives an R3 finding only
when the size is in the declared ramp, and an R4 finding only when every hex is in the
declared palette — anything outside either declaration still fails the build. Both waivers
print loudly with this issue's reference on every run.
