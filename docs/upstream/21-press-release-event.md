# input: no press-RELEASE event — hold-to-act gestures cannot be built correctly

**One line.** `on:longpress` fires once when the press is recognised and there is no
`on:pressEnd` / `on:longpressEnd`, so the category-standard **hold-to-2x** gesture (hold
anywhere on a video to accelerate, release to restore) has no correct spelling: nothing
tells the author the finger came up.

**Environment.** `dev@62fa4952`, short-drama flagship. Requested by the app's owner in the
exact category terms: "if the user holds on the right side… as long as they hold, it plays
on 2x", which is how TikTok, Reels, ReelShort and DramaBox all behave.

**The vocabulary today.** `on:tap`, `on:longpress` (one-shot), `on:drag` / `on:dragEnd`
(`dsx.this` carries `phase`), `on:hoverStart` / `on:hoverEnd` (pointer only, never touch).
The hover pair proves the *shape* is already accepted — a start/end lifecycle — it simply
does not exist for press.

**What the template had to do (bridged, loudly commented).** Accelerate on `on:longpress`
and recover the release from `on:dragEnd` **plus** the next `on:tap`, because a press with
no movement may never produce a drag. It works, but the speed can stick if neither fires,
which is exactly the class of bug an author cannot see.

**Suggested direction.** Add the press twin of the hover pair — `on:pressStart` /
`on:pressEnd` on any element, fired for touch and mouse alike, balanced across pointer
cancellation and unmount (the same guarantees `on:hoverStart`/`on:hoverEnd` already
document). `on:longpress` stays as the one-shot recogniser it is.

Accessibility note: a hold gesture is unreachable by assistive swipe, so whatever ships
should pair with `on:adjust` guidance — the template's own review gate (R8) caught exactly
that and the fix was to make speed adjustable, which is worth documenting alongside.
