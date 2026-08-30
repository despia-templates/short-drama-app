# router: only `push` animated — `replace`/`reset` hard-cut, and a per-route override could not name the two lanes

**One line.** Tab bars navigate with `reset`, and `reset` had no transition at all — so the
most frequent navigation in any tabbed app was the one with no motion.

**Status.** Both halves fixed upstream in this pass. Filed for the record.

**Environment.** `dev@92b844b0`, `packages/dom/src/router.ts` · `motion.ts`. Measured in the
short-drama flagship from "all route changes should have fade animation on desktop".

**(a) `navigatePath` called `animatePush` for `push` only.** `replace` and `reset` discarded
the top frame and mounted the next one with no transition.

Fix: `discardTop(hold)` keeps the outgoing element painted while the incoming frame runs the
neutral opacity animation over it. The held element is already unmounted, so it is a dead
painting — `aria-hidden`, `pointer-events: none`, removed on a timer.

TRANSFORM families are deliberately excluded from this path: a replace has no spatial story,
and iOS push geometry over a discarded stack reads as a glitch.

**(b) A per-route `motion` was one word for both lanes, and `"none"` always won.** So the only
way to stop a tab root sliding on a phone — where the tab bar would ride the transition — also
killed its desktop crossfade.

Fix: `motion` now accepts `{ mobile, wide }`. A bare string still means both lanes; a lane
left unnamed follows the lane default; an unknown word follows the lane default too, rather
than reaching the DOM as a family class.

**Verified.** Five tab switches each run one 160ms opacity animation at 1440 with
`transform: none` on every frame and the global bar pinned at `[0, 64]`, and **zero**
animations at 375.
