# Percent lengths have no native twin

**Filed:** 2026-08-31 · **Framework:** despia-framework `dev@4526ef24` · **Severity:** medium

## What happens

The DSX-CSS native bridge deliberately drops non-`100%` percent lengths (`width: 64%`,
`height: 30%`): there is no attribute twin, and SwiftUI has no parent-relative frame
primitive short of `GeometryReader`. `100%` maps to `grow`; everything else vanishes
per-declaration.

Probe (one element, iPhone 17 Pro sim):

```xml
<stack style="width: 220px; height: 6px; background: rgba(255,255,255,0.25)">
  <stack style="width: 64%; height: 6px; background: #FF2C55"/>
</stack>
```

Web: a 141px red fill. Native: no fill at all — the child hugs to zero width. Silent.

## Why it matters

The percent fill is the canonical progress idiom — every storefront's continue-watching
rail, every player's seek bar. The web lane renders it; the native lane renders the track
and no fill, which reads as "no progress" rather than as a missing feature.

## What the template does meanwhile (the sanctioned ports)

- Track width statically known → compute the px in the interpolation:
  `style="width: {{ Math.round(trackW * item.pct / 100) }}px"`.
- Track fluid → the reference's own seek idiom: `measure="dsx.variable.bar"` on the track,
  `width="{{ Math.round(dsx.variable.bar.width * pos) }}"` on the fill.

Both render identically on web, so the port is not a fork — but every author will hit the
silent version first.

## The ask

Either lane is acceptable; silence is not:

1. **A real twin** — bridge `N%` to a parent-relative frame (the `measure` machinery
   already publishes live sizes; a bridged internal attr + one deferred read could do it
   without GeometryReader in user space), or
2. **A loud drop** — the bridge DEBUG-logs every percent declaration it discards, naming
   the element, so the port above is discoverable in one build instead of one screenshot
   session.
