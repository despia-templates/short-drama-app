# server/data: an explicit null field value fails the whole data.create statement

**One line.** `data.<entity>.create({ …, field: null })` answers `ok:false` while the
identical create with the key omitted succeeds — a nullable column cannot be written as
null explicitly.

**Environment.** Measured on `dev@92b844b0`, re-verified 2026-08-29 evening at `dev@ae0669ad`
(`git diff --stat` over the relevant packages between the two: empty). Consumer: the
short-drama flagship template (`despia-templates/short-drama-app`) with `file:` deps on the
checkout's `OpenSource/Web/packages/*`, probes run against a freshly rebuilt `dist/`.
Filed under the template program's no-hacks law: the template ships a labeled bridge where
one exists, and the bridge dies when this lands.

**Repro** (declaredHandler + Postgres provider, entity `ledger` with nullable
`expires timestamptz`):

```js
const withNull = await dsx.module.data.ledger.create({ kind:'bonus', amount:5, source:'probe', ref:'null-field', expires: null })
const without  = await dsx.module.data.ledger.create({ kind:'bonus', amount:5, source:'probe', ref:'no-field' })
return { withExplicitNull: withNull.ok, withKeyOmitted: without.ok }
// → {"withExplicitNull":false,"withKeyOmitted":true}
```

**Analysis guess.** The JSE null crossing the seam is the NSNull sentinel; by the time
`buildStatement` parameterises it, the placeholder's type can't be inferred (or the value
isn't normalised to SQL NULL), and the insert fails. `allowedValues` keeps the key, so the
failure is downstream of the allowlist.

**Impact.** Every author writing the natural `expires: cond ? date : null` hits a silent
`ok:false`; the template's spend-ledger rows failed until the key was omitted per-branch.

**The ask.** Normalise NSNull/undefined to SQL NULL at the repo boundary (or type the
placeholder), and add a corpus row — "explicit null equals omitted key" is what every JS
author will assume.
