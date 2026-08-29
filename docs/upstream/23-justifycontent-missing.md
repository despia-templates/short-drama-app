# layout: `justifyContent` is not in the attribute vocabulary, while `alignItems` is

**One line.** `BRIDGE_ATTRS` carries `alignItems` but **not** `justifyContent`, so the most
common layout operation in a stack — centering on the MAIN axis — has no attribute
spelling, and the adjacent, similarly-named `alignItems` silently does the other axis.

**Environment.** `dev@62fa4952`. Cost: episode-grid cells in the short-drama flagship that
looked "not fully centered" to the app's owner. The author (me) wrote
`<style as="epCell" alignItems="center"/>` expecting centering and got cross-axis only.

**The trap, precisely.** In a `vstack`, `alignItems="center"` centers horizontally; the
vertical centering the author almost always also wants needs `justify-content`, which has
no attribute — you must either drop to `style="justify-content: center"` or know that
`align="center"` (a *different* attribute) expands to `align-items` + `justify-items` +
`justify-content` via `ALIGN_MAP`. Two attributes whose names differ by one word do very
different things, and the more discoverable-looking one is the weaker one.

**Why this bites agents especially.** `alignItems` reads as "the general alignment
attribute" to anyone who knows flexbox loosely; `align` reads like its abbreviation. The
vocabulary rewards knowing that `align` is the powerful one — which is learnable only from
`cssmap.ts`, not from the reference table.

**Suggested direction (any one closes it):**
1. add `justifyContent` to `BRIDGE_ATTRS` (it maps 1:1, no semantics to invent);
2. and/or have lint notice `alignItems=` on a stack whose children are centered-looking and
   suggest `align=` — or more simply, document the pair together in StackReference with the
   axis each one moves, since today `alignItems` is listed without its partner.

The naming is the real defect; the missing attribute is just what makes it unrecoverable.
