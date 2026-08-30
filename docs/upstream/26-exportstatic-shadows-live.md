# site handler: `exportStatic`'s DATALESS export permanently shadows live SSR seeding

**One line.** `dsx build` prerenders each route with no API host running, so every exported
file holds that route's null-data branch — and `createSiteHandler` served those files
**before** the page handler, so on a running server the empty exports permanently shadowed
the live render and seeding could never reach a browser.

**Status.** Fixed upstream in this pass. Filed for the record.

**Environment.** `dev@92b844b0`, `server/src/site.ts` · `exportStatic`. Short-drama flagship.

**What the exports actually contain** (re-measured with the API host stopped):

- `/vip` — its headings and a wallet reading `— coins`
- `/discover` — the string `Loading the feed`
- routes with no declared loading state — an empty shell

That is correct behaviour for a dataless prerender. The defect is the ORDER: a static file
that says "Loading the feed" answered before the live renderer that would have produced the
feed, and it did so on every request for the life of the process.

**Why it hid.** Both lanes return a 200 with plausible html. Nothing errors. The only tell is
that the page's content never appears in `view-source`, which is exactly the thing an SSR
feature exists to guarantee and the thing no gate was asserting.

**Fix applied.** Route paths (exact, non-pattern) go to the live renderer first —
`preferLivePages`, default true, with an opt-out for a CDN-shaped deployment whose exports
are authoritative. Assets are untouched: they are route paths in no route table.

**Suggested follow-up.** Pair this with the conformance row asked for in the SSR-origin
issue: assert that a running origin serves the *seeded* html for a route that also exists as
a static export.
