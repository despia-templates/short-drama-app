# web: `lineLimit=` is INERT — it emits no CSS, so every clamped text wraps instead

**One line.** `lineLimit` is documented on `<text>` and honoured by both native renderers,
but the web bridge emits nothing for it: it is not in `BRIDGE_ATTRS` and appears nowhere in
`cssmap.ts` or `mount.ts`. Every `lineLimit="1"` in every DSX web app silently wraps.

**Environment.** `dev@62fa4952`. Found while a card rail's one-line titles rendered as two
and three lines in the short-drama flagship; the app's owner reported it from screenshots.

**Repro.**
```xml
<vstack style="width: 150px">
  <text value="Reborn: The Alpha's Revenge" lineLimit="1"/>
</vstack>
```
Web: wraps to 2 lines (measured 42px tall at 14px/21px line-height). Expected: one line,
ellipsised. Adding `style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis"`
fixes it — which is what the template now carries on every card title, as a bridge.

**Why it is the worst kind of gap.** It is silent AND it is a lie of omission: the
attribute exists, lints clean, is documented, works on iOS and Android, and does nothing
here. An author (or an agent) reading the reference has no way to learn this except by
measuring rendered pixels.

**Suggested direction.** Emit from the bridge:
- `lineLimit="1"` → `white-space: nowrap; overflow: hidden; text-overflow: ellipsis`
- `lineLimit="n"` (n>1) → `display: -webkit-box; -webkit-line-clamp: n; -webkit-box-orient:
  vertical; overflow: hidden` (universally supported, including Firefox since 68)

and add `lineLimit` to `BRIDGE_ATTRS` so the reactive path folds it too. Worth a
conformance row, since the three renderers now disagree.
