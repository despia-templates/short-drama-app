# jse/server: `await` inside a TERNARY branch silently yields a non-ok result

**One line.** `const pool = cond ? await data.show.list(A) : await data.show.list(B)` returns
a value whose `.ok` is falsy — no throw, no log, no rejected envelope, just no data.

**Environment.** `dev@92b844b0`, server action body. Isolated in the short-drama flagship
while building a "More like this" rail.

**Symptom.** The related rail came back EMPTY for a genre with two live shows. Nothing in the
logs, nothing in the response, and the surrounding action returned `ok`.

**Isolated.** With the identical `let pool` and the same two calls written as an if/else with
statement-level `await`, the rail fills correctly:

```js
// WRONG — silently yields something whose .ok is falsy
const pool = genre === '' ? await data.show.list(all) : await data.show.list(byGenre)

// RIGHT — identical calls, identical arguments
let pool
if (genre === '') { pool = await data.show.list(all) }
else              { pool = await data.show.list(byGenre) }
```

Every other `await` in that file is a plain assignment, which is why nothing else in the app
hit it.

**Why this one is expensive.** It is a silent wrong answer inside a server action — the layer
that prices things and grants entitlements. A conditional fetch is an ordinary shape; an
author has no reason to suspect the conditional rather than the query, and the natural
debugging path (log the query, check the rows, check the policy) never reaches the cause.

**The ask, in order of preference.**
1. Support `await` in a conditional expression.
2. Failing that, make it a **lint error**. A hard stop is strictly better than a silent wrong
   answer in the money path.

A conformance row should pin whichever is chosen.
