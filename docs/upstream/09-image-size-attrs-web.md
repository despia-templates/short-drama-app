# web: <image> width/height attributes don't emit — <video>'s do

**One line.** `<image src="…" width="60" height="90"/>` renders at its container/intrinsic
size (measured 911×300); the same attributes on `<video>` emit real dimensions.

**Environment.** Measured on `dev@92b844b0`, re-verified 2026-08-29 evening at `dev@ae0669ad`
(`git diff --stat` over the relevant packages between the two: empty). Consumer: the
short-drama flagship template (`despia-templates/short-drama-app`) with `file:` deps on the
checkout's `OpenSource/Web/packages/*`, probes run against a freshly rebuilt `dist/`.
Filed under the template program's no-hacks law: the template ships a labeled bridge where
one exists, and the bridge dies when this lands.

**Repro** (probe route, SSR origin, no service worker, fresh build verified by nonce):

```xml
<image src="/posters/bride-poster.svg" width="60" height="90" radius="8"/>
```
→ rendered `clientWidth × clientHeight` = **911×300**. The template bridges with
`style="width: 60px; height: 90px"` beside the attrs on every fixed-size image.

For contrast, `<video … width="{{ dsx.screen.width }}" height="{{ dsx.screen.height }}">`
emitted exact pixel dimensions in the same page (the media-surface path applies its size
attrs).

**The ask.** Map `<image>`'s `width`/`height`/size keywords onto the emitted style the way
the media surfaces already do — a fixed-size poster grid is the most common image use in
any catalogue UI, and StackReference documents the attributes on the element.
