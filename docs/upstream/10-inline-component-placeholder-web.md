# web: head-declared <component as=…> renders a literal "<Name>?" placeholder

**One line.** An inline component declared in a head (`<component as="Chip">…</component>`)
renders as the text `<Chip>?` wherever it is invoked — in row templates and standalone —
while FILE components work everywhere (including row scope resolving into attributes).

**Environment.** Measured on `dev@92b844b0`, re-verified 2026-08-29 evening at `dev@ae0669ad`
(`git diff --stat` over the relevant packages between the two: empty). Consumer: the
short-drama flagship template (`despia-templates/short-drama-app`) with `file:` deps on the
checkout's `OpenSource/Web/packages/*`, probes run against a freshly rebuilt `dist/`.
Filed under the template program's no-hacks law: the template ships a labeled bridge where
one exists, and the bridge dies when this lands.

**Repro** (probe route, SSR origin, clean build):

```xml
<head>
  <component as="Chip">
    <text value="CHIP:{{ dsx.attribute.label }}" color="#FF2D55" fontSize="15"/>
  </component>
</head>
<Chip label="outside"/>            → renders the literal text "<Chip>?"
<list bind="…"><Chip label="{{ item.genre }}"/></list> → "<Chip>?" per row
```

File-component control (same page): `<ProbeChip label="{{ item.genre }}"/>` as a row
template renders `FILECHIP:Alpha` / `FILECHIP:Beta` correctly, and standalone too — so
component-in-row-scope is fine; only the HEAD-DECLARED registration path is broken on this
renderer. Lint resolves the inline name without complaint, so the failure is silent until
runtime.

**The ask.** Register head-declared components on the web renderer (dsx-anatomy's "parts"
slot promises them), or fail the build/lint if the web twin genuinely doesn't support them
yet — the `<Chip>?` placeholder ships to production silently today.
