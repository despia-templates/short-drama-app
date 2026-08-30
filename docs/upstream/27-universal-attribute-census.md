# reference/lint: the universal-attribute census omitted seven DOCUMENTED attributes, and nothing tests that it agrees with the reference

**One line.** `Documentation/reference/stack-elements.json` listed 30 universal attributes;
`href`, `shared`, `sharedMode`, `sharedAnim`, `sharedOrder`, `lockOrientation` and
`dismissEdge` were missing — all seven documented as universal, and `href` honoured by
`mount.ts` and demonstrably navigating.

**Status.** Census fixed upstream in this pass (now 37). The deeper ask below is open.

**Environment.** `dev@92b844b0`. Found when a CLI rebuild exposed a newer linter against the
stale census and **29 valid `href` usages in the short-drama flagship became hard errors**.

**Why this is worse than a missing row.** The census is not documentation — it is the
linter's idea of what the language allows. So a hand-maintained JSON file, sitting beside the
reference it encodes, was deciding that a documented, implemented, working attribute was
illegal. An app author's only signal is a lint error telling them their correct markup is
wrong, and the natural response is to delete the correct markup.

**The open ask.** There is no test proving the census and the reference agree. Both are
maintained by hand, in the same repo, describing the same thing. A generator (reference →
census) or a conformance test (every attribute documented as universal appears in the census,
and vice versa) removes the whole class.

**Note for whoever picks this up.** `href` is worth a second look on its own: it is the
anchor attribute on every element, it emits a real `<a>` on web, and it is the documented way
to spell a declarative push. An app that cannot use it loses crawlability.
