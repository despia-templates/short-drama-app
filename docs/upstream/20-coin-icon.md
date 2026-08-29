# icons: the shared catalog has no generic coin/token glyph

**One line.** `Conformance/icons/sf-map.json` (107 icons) offers `bitcoinsign.circle.fill`
and `dollarsign.circle.fill` but no currency-neutral **coin/token**, so every app with a
virtual currency must label its coins as Bitcoin or as US dollars — both wrong.

**Environment.** `dev@62fa4952`, short-drama flagship. Every coin balance, price, pack and
reward in the app needs this glyph; the template shipped `bitcoinsign.circle.fill` until
its owner (correctly) called it out, and `dollarsign.circle.fill` is only the least-wrong
substitute.

**Why it matters beyond one template.** Virtual-currency coins are near-universal in the
categories DSX templates target (short drama, games, social, loyalty). The icon appears in
the wallet, the paywall, the store, the ledger and the nav.

**Suggested direction.** Add a neutral token to the subset — SF has `circlebadge.fill` /
`creditcard.circle.fill` nearby, and Material has `toll` / `paid` / `monetization_on`,
whose FILL instance reads as a generic coin. `toll` is the closest three-way match. One
row in the map, plus the Boxicons web path and the Material name.
