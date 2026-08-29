# jse: mutation through a bracket read with a variable key is a silent no-op

**One line.** `by[g].push(x)` (computed member) writes nothing — length stays 0 — while
literal paths (`by.k.push(x)`, `a.b.c.push(x)`) mutate correctly.

**Environment.** Measured on `dev@92b844b0`, re-verified 2026-08-29 evening at `dev@ae0669ad`
(`git diff --stat` over the relevant packages between the two: empty). Consumer: the
short-drama flagship template (`despia-templates/short-drama-app`) with `file:` deps on the
checkout's `OpenSource/Web/packages/*`, probes run against a freshly rebuilt `dist/`.
Filed under the template program's no-hacks law: the template ships a labeled bridge where
one exists, and the bridge dies when this lands.

**Repro** (declaredHandler):

```js
// C1: the real-world shape (group-by loop)
const rows = [{ genre: 'A', id: 1 }, { genre: 'A', id: 2 }, { genre: 'B', id: 3 }]
const by = {}
for (const s of rows) {
  const g = s.genre
  if (by[g] == null) { by[g] = [] }
  by[g].push(s)
}
return { a: by.A.length, b: by.B.length }   // → {"a":0,"b":0}

// C2: minimal
const by = {}; const g = 'k'; by[g] = []; by[g].push('x')
return { len: by[g].length }                 // → {"len":0}

// C3: literal path — WORKS
const outer = { inner: {} }; outer.inner.list = []; outer.inner.list.push('x')
return { len: outer.inner.list.length }      // → {"len":1}
```

**Impact.** The classic group-by loop returns empty groups with no error; in the template
this made every home-shelf rail empty until the write-back idiom
(`by[g] = (by[g] == null ? [] : by[g]).concat([s])`) replaced the push.

**The ask.** Either make computed-member mutation write back like literal-member mutation
does (the surprising half is the inconsistency), or make the runner/lint refuse the
mutating call on a bracket read loudly. Silent length-0 is the worst outcome.
