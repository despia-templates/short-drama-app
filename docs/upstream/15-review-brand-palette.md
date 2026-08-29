# review: R4 (hex-count) has no brand-palette valve — a pinned-dark media app cannot pass honestly

**One line.** `despia review` R4 warns at ≥3 distinct raw hexes per file, and the framework
offers no way to declare a brand palette or pin an appearance — so an app whose category
standard is a permanently dark surface (drama/media storefronts: the stage is black in
light mode too) fails the gate precisely by doing the right thing.

**Environment.** Measured at `dev@ae0669ad` while restyling the short-drama flagship
template to the category look (`despia-templates/short-drama-app`).

**Observed.** Semantic tokens are the rule's suggested fix, but with no appearance pin
they resolve by OS scheme: `label` on the storefront's black stage becomes black-on-black
in light mode. So the correct engineering for this category is a small fixed palette of
raw hexes (stage, surface ramp, brand red, coin gold, on-media ink) — used consistently,
which is exactly what R4 cannot distinguish from sprawl. Eleven of the template's twelve
screens warn; every hex is one of ~15 deliberate palette entries.

**Template bridge (dies when this lands).** `scripts/review.mjs` wraps
`despia review --strict` and waives ONLY R4 findings whose every hex is in the declared
palette — an off-palette hex still fails, so the sprawl protection stays armed. The
waiver prints loudly on every run with this issue's reference.

**Suggested direction (either closes it):**
1. a palette declaration the reviewer honors — e.g. project-level design tokens
   (`dsx.config.json: { "palette": { "brand": "#FF2D55", … } }`) with R4 counting only
   hexes OUTSIDE the declared set; the tokens could also surface in the style vocabulary
   (`color="palette.brand"`), which is the real design-system win;
2. an appearance pin (`"appearance": "dark"`) that makes semantic tokens stable, so a
   media app can go tokens-first without light-mode breakage — R4's advice then works.
