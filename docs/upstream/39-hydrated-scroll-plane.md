# web/ssr: a HYDRATED `<scroll>` never gets its scroll plane — `on:scroll` is inert on the page a viewer lands on

**One line.** A server-rendered screen's outermost `<scroll>` comes out of hydration with no
`applyScrollBehaviour` at all — no `data-dsx-scroll-axis`, no inline `overflow`, none of the
scroll-linked custom properties, and no `on:scroll` / `on:scrollEnd` / `on:reachEnd` dispatch.
The identical component mounted by a client-side route change has every one of them.

**Environment.** `dev@621b8dc5`, `packages/dom/src/scroll.ts` (`applyScrollBehaviour`) ·
`elements.ts` (the `scroll` factory) · the hydration path. Measured in the short-drama
flagship while giving the top bar a scroll-aware scrim.

**Repro — one document, two mount paths.**

1. Load `/` fresh (server-rendered). Read the screen's root scroller:

   ```js
   const root = document.querySelector('.dsx-scroll.scroller')
   root.getAttribute('style')                  // ""      ← nothing applied
   root.getAttribute('data-dsx-scroll-axis')   // null
   ```

   Every **nested** `<scroll>` in the very same page is fine:

   ```
   overflow: hidden auto; overscroll-behavior: auto; --scroll-y: 0; --scroll-progress: 0; …
   data-dsx-scroll-axis="vertical"
   ```

   So the element factory is running for children and not for the hydrated root.

2. From that page, click a nav link to another route (client-side navigation). Read the
   incoming screen's root scroller: full plane, axis attribute, custom properties, handlers.

**Isolated against the obvious suspect.** Removing `on:scroll` from the markup entirely does
not change the outcome — the root scroller is still bare. The handler is not what suppresses
the attach.

**Why this one is expensive.** It is invisible in development. An author adds `on:scroll`,
navigates around their running app, watches it work, and ships a feature that is dead on every
cold load and every shared link — which is every first impression the app will ever make.
Nothing errors; the same code works on the second navigation. It also silently disables
`snap=`, `contentInset=`, `indicators=` and `reachEnd`-driven infinite scroll on exactly the
page where infinite scroll matters most.

**The ask.** Hydration must run the element factory's post-mount behaviour for a matched
element, or `<scroll>` must re-attach on adopt. A conformance row should pin *"a
server-rendered `<scroll>` publishes its plane on the first frame"* — the SSR path is the one
no browser test currently covers.

**Bridge in the template meanwhile.** `<TopNav>` does not drive its scrim from scroll.
`overArt` is a static per-caller attribute defaulting to *solid*, and the transparent lane
carries a gradient scrim so the links stay legible over whatever passes beneath. Three lines
to make it scroll-aware the day the plane hydrates.

**Note on measuring this.** rAF is paused in a non-composited preview pane, and
`onScrollEvent` defers to `env.requestFrame` — so "the handler never fired" is not evidence on
its own. The evidence above is the *absence of the inline style and the axis attribute*, which
`applyScrollBehaviour` writes synchronously at attach time and which no frame throttling can
explain.
