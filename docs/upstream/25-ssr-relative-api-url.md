# ssr: a root-relative `<api url="/x">` cannot be fetched during SSR, so every seeded page shipped empty

**One line.** `executeApiForSSR` passed the authored url straight to `fetch`, so
`url="/catalog/discover"` — the exact spelling the reference documents — threw server-side,
failed open, and seeded **nothing**: every route's SSR pass ran and was useless.

**Status.** Fixed upstream in this pass. Filed for the record and for the conformance row.

**Environment.** `dev@92b844b0`, `kernel/src/api.ts` · `server/src/page-render.ts` ·
`server/src/render.ts` · `server/src/live.ts`. Found in the short-drama flagship chasing
"the first clip loads for half a second".

**What happened.** There is no document to resolve a root-relative url against on the server,
so `new Request("/catalog/discover")` throws. The SSR path caught it and continued — the
correct failure mode for a page render — which meant the symptom was not an error but an
absence. `curl /discover` returned a spinner, **zero `<video>` tags** and no titles; the
browser hydrated, then fetched, then painted.

The origin was available the whole time: `live.ts` already holds `new URL(req.url)`. It was
simply never threaded down to the fetch.

**Measured.**

| | before | after |
|---|---|---|
| `<video>` tags in the feed's SSR html | 0 | 14 |
| first media request | 194ms | 75ms |

**Fix applied.** An `origin` option on the SSR path: `kernel/src/api.ts` resolves a leading
`/` against it, and `page-render.ts` / `render.ts` / `live.ts` pass it down.

**Suggested follow-up.** A conformance row that renders a page whose only `<api>` is
root-relative and asserts the seeded payload is present in the html. The defect was invisible
to every existing gate because a page that seeds nothing is still a valid page.
