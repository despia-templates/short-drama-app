# api: `cache="swr(...)"` cannot survive a MOUNT, so the cache's most valuable case is unreachable

**One line.** The cache is `apiCaches: WeakMap<ReactiveStore, Map<key, entry>>` and `mount.ts`
does `const store = new ReactiveStore()` **per component mount** — so the cache is born and
dies with the screen, and leaving a tab and coming back refetches from zero no matter what
`cache=` says.

**Environment.** `dev@92b844b0`, `packages/dom/src/api.ts` · `mount.ts`. Measured in the
short-drama flagship from "page change reloads data and flashes".

**The policy itself is right and complete.** `swr(fresh, stale)` serves the cached body
immediately and revalidates in the background (`fire()` → `serveCached(entry)` then
`network(req, { refreshing: true })`), `refreshing` is a distinct state from `loading`, and
stale data survives a failed refetch. Nothing about the semantics needs changing. It is the
SCOPE that makes it unreachable.

**Measured.** Tab away from Home and back: `/catalog/home` and `/viewer/continue` both hit the
network again, and the screen painted **empty rails for 103ms** on localhost — tap to content,
instrumented with a MutationObserver. (rAF and short timers are throttled while a preview pane
is not composited, which cost two false readings before the instrument was validated.) On a
real network that is a 300–600ms blank on every tab revisit.

**Why a template cannot just patch it.** `Conformance/api/api-blocks.json` runs the same
fixtures on iOS and Android, and the header calls the cache "per-surface" deliberately. Moving
the scope is a cross-platform contract change, so it is a framework decision.

**The ask.** Key the api cache in APP scope (`DSXState`) rather than the surface store,
keeping the per-surface LRU bound and the existing identity key
(`method + url + headers + body + expect + cookie`). The cookie term already prevents
cross-session bleed.

**Bridge in the template meanwhile** (loudly, in every data screen): the last good payload is
stashed app-wide by `on:success="global.cacheX = block.data"`, and one computed per block
returns `block.data` when present and the stash otherwise — stale-then-fresh, never blank.
One key per ENDPOINT, not per screen, so the five screens reading `/wallet/state` share a
cache and a wallet fetched on Profile makes the Store's coin chip instant.

Two rules that come with the bridge and are easy to get wrong:
- an error branch must also test that the view is empty, or a failed refresh throws a dead
  end over good content;
- a stash keyed by a route param needs an ID GUARD, or show B borrows show A's art.

Verified by holding every response 1500ms: all five tab screens paint before the response, a
failed refresh keeps the content, and no error panel covers good data. The day the cache scope
lands upstream, all of this collapses back to one `cache=` attribute per block.
