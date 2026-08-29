# server/jse: after calling a sibling action that declares `inputs`, the caller's next assignment binds THE SCOPE OBJECT

**One line.** `const found = await dsx.action.pick({ sku })` returns correctly, but the very
next `const item = found.data` binds the **caller's whole local scope dict** instead of the
value — silently, with no error — so every guard on it is wrong and every field read is
`undefined`.

**Environment.** `dev@2616f891` (`packages/server/dist/actions.js` `declaredHandler`).
Found while building real Stripe checkout in the short-drama flagship: an unknown SKU passed
its `item == null` guard and reached the payment provider.

**Minimal repro** (no DB, no network, no browser):

```js
const siblings = {
  pick: { name: "pick", inputs: { sku: "sku" },        // <-- the trigger: DECLARED inputs
          body: "if (sku === 'good') { return { cents: 1 } }\nreturn null" },
};
const h = declaredHandler({ name: "t", inputs: { sku: "sku" }, siblings, body: `
  const found = await dsx.action.pick({ sku: sku })
  const item  = found.data
  return { found: found, item: item, isNull: item == null }
`});
await h({ sku: "bad" }, ctx);
```

```jsonc
// actual
{ "found": { "ok": true, "data": null },                    // correct
  "item":  { "sku": "bad", "found": null, "item": null },   // ← THE CALLER'S SCOPE
  "isNull": false }                                          // ← so the null guard never fires
// expected
{ "found": { "ok": true, "data": null }, "item": null, "isNull": true }
```

**Scope of the defect.**
- Triggers on a sibling that **declares `inputs`** and is called with an argument dict.
  A sibling with `inputs: {}` behaves correctly — verified side by side.
- Corrupts both `found.data` and `found.ok ? found.data : null`; the ternary is not the
  cause (ternary assignment is correct everywhere else — verified).
- `found` itself is always correct. Only the *subsequent* assignment is wrong.
- The bound object is a **stale snapshot** of the caller's scope (its `found` key is `null`
  even though `found` was already assigned), which points at the frame/scope handed to the
  sibling being reused for the caller's next binding.

**Why this one is expensive.** It is silent, it only appears with the input-passing sibling
pattern the backend guide teaches, and it turns absence checks inside out: `item == null` is
`false` for a null, so a rejection path is skipped and execution continues into code that
charges money. In the template it let an unpriced SKU reach `POST /v1/payment_intents`.

**Suggested direction.** Scope/frame isolation on the sibling dispatch in `declaredHandler`:
the callee's argument frame must not alias the caller's binding target. A conformance row
should pin "a sibling with inputs returns its value, and the caller's next binding is that
value" for all three runtimes.

Workaround in the template meanwhile: no sibling-with-inputs call whose result is assigned —
the price lookup is inlined into the caller, with a comment pointing here.
