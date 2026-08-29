# router/layout: no way to keep chrome (a tab bar) OUTSIDE the animated route frames

**One line.** Every route mounts a full-size opaque `.dsx-frame`, so any persistent chrome
— a bottom tab bar, a global header — has to be authored *inside each screen*, which means
it is duplicated per screen and it **travels with the route transition** instead of
standing still. There is no layout/shell slot between the router host and the frames.

**Environment.** `dev@62fa4952`, building the short-drama flagship. Reported by the app's
owner as "the Home / Discover / Rewards / My List / Me bar should be fixed, it should not
move with a router animation because it's a global element" — which is exactly right.

**What exists today and why none of it covers this.**
- `<tabs>` / `<tabview>` is a single-document container: panes are children, not routes.
  Using it for the five destinations gives a persistent bar but forfeits the route table
  (deep links, SSR per tab, guards, per-tab stacks).
- The root plan (`entry.surfaces`) mounts frame zero, and routes push opaque frames *over*
  it, so chrome in the entry is covered rather than persistent.
- Per-route `motion: "none"` (what the template now uses for its five tab roots) stops the
  bar from sliding, which is the right behaviour for lateral tab moves — but it is a
  workaround for the missing concept, not the concept. It cannot help a header that must
  persist across a *push*.

**What every comparable stack has.** Next.js `layout.tsx` (a segment layout wrapping its
children), React Router `<Outlet>`, SwiftUI `TabView` hosting a `NavigationStack` per tab,
Android's `Scaffold` + nested nav graph. In each, chrome is declared once and the routed
content changes underneath it.

**Suggested direction.** A layout row in the route table:

```jsonc
{ "path": "/",         "component": "shortdrama.Home",    "layout": "shortdrama.AppShell" }
{ "path": "/rewards",  "component": "shortdrama.Rewards", "layout": "shortdrama.AppShell" }
```

where the layout component mounts ONCE at the router host, renders its own chrome, and
receives the routed frame in a slot. Routes sharing a layout reuse the instance (no
remount, no re-fetch, no transition); a route with a different layout swaps it. That also
gives the native lanes their natural mapping (TabView / Scaffold) and makes the web lane
behave like the framework everyone will compare it to.

Related: this is the same architectural seam as #233 (what the entry frame is *for*).
Deciding "the plan owns the root" versus "the table owns layout" would settle both.
