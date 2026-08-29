# server/wire: toWire's seen-set nulls repeated references — a DAG is not a cycle

**One line.** `toWire()` adds every object to its `seen` WeakSet and never releases it when
the subtree completes, so any value referenced twice in one response serializes once and
then becomes `null`.

**Environment.** Measured on `dev@92b844b0`, re-verified 2026-08-29 evening at `dev@ae0669ad`
(`git diff --stat` over the relevant packages between the two: empty). Consumer: the
short-drama flagship template (`despia-templates/short-drama-app`) with `file:` deps on the
checkout's `OpenSource/Web/packages/*`, probes run against a freshly rebuilt `dist/`.
Filed under the template program's no-hacks law: the template ships a labeled bridge where
one exists, and the bridge dies when this lands.

**Repro** (declaredHandler):

```js
const row = { id: 'r1', title: 'Same Row' }
return { first: row, second: row, list: [row, row] }
// wire → {"first":{"id":"r1","title":"Same Row"},"second":null,"list":[null,null]}
```

**Source.** `packages/server/src/actions.ts` `toWire(value, depth, seen)`: `seen.add(obj)`
with no removal after walking children — the guard that should detect "on the current
path" (a cycle) instead detects "seen anywhere" (a DAG).

**Impact.** Any action that composes one row into several rails (`hero` + `latest` +
`trending` from one query) ships nulls to the client with no warning; the template now
returns `{ ...row }` copies per collection as the idiom, which is easy to forget and
invisible when forgotten.

**The ask.** Release on subtree exit (`seen.delete(obj)` after the walk) so only true
cycles are cut, or document copy-per-occurrence as a hard law and lint for it. The
depth bound already caps pathological nesting either way.
