# jse: stored null is truthy — `!w` is false and `if (w)` enters on a null

**One line.** Within one runtime, a literal null and a stored null disagree about
truthiness: `!null` → `true`, but `let w = null; !w` → `false` and `if (w)` ENTERS.

**Environment.** Measured on `dev@92b844b0`, re-verified 2026-08-29 evening at `dev@ae0669ad`
(`git diff --stat` over the relevant packages between the two: empty). Consumer: the
short-drama flagship template (`despia-templates/short-drama-app`) with `file:` deps on the
checkout's `OpenSource/Web/packages/*`, probes run against a freshly rebuilt `dist/`.
Filed under the template program's no-hacks law: the template ships a labeled bridge where
one exists, and the bridge dies when this lands.

**Repro** (declaredHandler, no browser, no data provider):

```js
const h = declaredHandler({ name: "t", body: `
  let w = null
  const literal = !null
  const stored = !w
  let branch = 'not-entered'
  if (w) { branch = 'ENTERED-ON-NULL' }
  return { literal: literal, stored: stored, branch: branch }
`, inputs: {} });
await h({}, ctx)
// → {"literal":true,"stored":false,"branch":"ENTERED-ON-NULL"}
```

**Analysis.** A stored null is the NSNull sentinel, and `truthy()`
(`packages/kernel/src/jse/values.ts`) returns `true` for it (the "arrays, dicts, lambdas,
NSNull" arm), while a literal `null` hits the `v === null` arm and is falsy. Every
`if (x)` / `if (!x)` null-guard in an action silently misbehaves — in the template this
surfaced as a wallet that was never created (`if (!w) { create }` skipped) with no error
anywhere.

**The ask.** The conformance corpus is silent on this (only `!0` is pinned). Whatever the
Swift reference says stored-null truthiness IS, pin it in `Conformance/jse/` and make all
runners agree with the literal form — the intra-runtime disagreement is the defect even if
NSNull-truthy is the chosen semantic. Interim authoring idiom (in the template's
AGENTS.md): absence checks are `x == null`, never `!x`.
