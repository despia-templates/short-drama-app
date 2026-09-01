# short-drama-app — the founding plan

> **Status: BUILT — production-shaped local slice.** Eighteen components, seven server
> documents, 32 routes, 14 entities; Stripe web checkout, the coin economy, the earn loop
> and the Manage surface all run against real Postgres with real RLS. Five gates run green
> on every change — `lint · check:styles · review · build · verify` — the last of which boots
> the origin and asserts payload shapes, SSR content and money authority. This file is the
> spine; every document under `docs/` hangs off it, and §6 below is the measured upstream
> ledger: 45 entries — 43 measured findings, every one filed upstream, and 2 retracted
> where they stood rather than quietly deleted. When a decision here conflicts with the
> framework, the framework wins and this file gets a correction — never the other way around.
>
> Source of truth for the framework: `despia-native/despia-framework` **dev branch**
> (locally `~/despia_dsx/despia-framework`; the tree stood at `92b844b0` when §6 items 1–25
> were measured and at `621b8dc5` at the close of 2026-08-30 — each item names what it was
> read against). The public `despia-native/despia` is the Apache-2.0 open drop of the same
> tree. Facts below were read from that tree, not assumed.

## 1 · What this repo will become

The **official DSX short-drama template**: a ReelShort/DramaBox-class vertical drama app —
web (fully SSR, Netflix-style shelves), iOS + Android native (custom UI, no native chrome),
and a declared backend (database, workers, streaming CDN) — plus the **first project Admin
Surface** (docs/rfcs/0003), so the person operating the app manages shows, coins, campaigns
and push from the Despia dashboard, the Despia mobile app, or their own AI via MCP.

It is also the **founding artifact of the template program**: the repo where the template
standard (rfcs/0001), the governance model (rfcs/0002) and the licensing/self-hosting story
(rfcs/0004) are proven on a real product before they are ratified upstream.

## 2 · The laws this template is built under

1. **No hacks, ever.** A framework limitation discovered while building this template is
   *filed and fixed in despia-framework*, or shipped as a documented Article 7 degradation —
   never worked around in template code. The template is downstream of the constitution.
   (Already-known upstream items live in §6.)
2. **Templates are AI training data.** Every line of DSX here will be read by agents building
   DSX apps later. Idiomatic, constitution-clean, commented like the framework's own
   components (the `Paywall.dsx` register: intent, hierarchy, white-label discipline) — or it
   does not merge.
3. **One feature, every platform** (Article 10). The web app is not a landing page for the
   native app; it is the same catalogue, player, wallet and rewards, SSR'd. A capability gap
   on any renderer is an upstream defect, not a template footnote.
4. **The template owns no engine.** UI = template-owned `.dsx` over primitives + consumed
   modules. Trust decisions (entitlements, coin spend, ad rewards) = server documents +
   module trust cores (VerticalPlayerStack, RevenueCat, AdMob SSV). The web view is never
   the state machine.
5. **The client gets a surface, the developer gets the repo.** Admin capability ships as
   declared Manage contributions (rfcs/0003), not as a second hand-rolled dashboard app.

## 3 · The document map

| Doc | What it settles |
|---|---|
| `docs/positioning.md` | The doctrine (owner-stated 2026-08-29): the category map, App View + Manage View, the canonical lines, the claims ledger, and what the doctrine binds this program to. Read first. |
| `docs/research/short-drama-ux.md` | The industry feature matrix (ReelShort, DramaBox, NetShort, DramaWave, ShortMax, GoodShort) and exactly which mechanics we adopt, with the honesty ledger (what is industry standard vs. what is our differentiator). |
| `docs/product/spec.md` | The app: screens, flows, coin economy, ads, notifications, live activities, widgets, deep links — numbers included (episode pricing, streak curve, ad caps). |
| `docs/architecture/backend.md` | Entities, server documents, workers, streaming CDN, AdMob SSV, push fanout, analytics — all in the landed `<server>` grammar. |
| `docs/rfcs/0001-dsx-template-standard.md` | What makes a repo an *official DSX template*: manifest grammar, quality gates, agent/editor/CLI/MCP ergonomics. **Upstream target: despia-framework.** |
| `docs/rfcs/0002-template-governance.md` | The org, the submission flow, issues, contributions, fleet maintenance at thousands-of-templates scale, dev→client handoff. **Upstream target: despia-templates org + platform.** |
| `docs/rfcs/0003-project-admin-surfaces.md` | Manage View: how any project declares a scoped, mobile-first, MCP-projectable admin surface — DSX in DSX in DSX. **Upstream target: despia-framework (studio-apps successor rev).** |
| `docs/rfcs/0004-licensing-self-hosting-deploy.md` | Shelf disclosure (open vs premium modules), self-hosting lanes, and the deploy-with-Despia link contract (Cloudflare OAuth). **Upstream target: despia-platform (private) + framework docs.** |

## 4 · What the framework already gives us (verified on dev@92b844b0)

- **`Custom/VerticalPlayerStack`** — the vertical short-drama player already exists: DSX UI
  (player + paywall), thin Swift/Kotlin trust core, episodes payload, coin gate/auto-spend,
  RevenueCat `buy`, AdMob rewarded `getcoins`, offline downloads, **server as source of truth
  for access + credits**. `shelf: open`, platforms `phone, desktop` — **no web facet yet** (§6.1).
- **Backend authoring LANDED** — `<server>` documents: `<entity>` (ownership/RLS), `<action>`
  (the one action grammar), `<route>`, `<worker>` (queues + cron + idempotency), `<secret>`,
  `<egress>`; deployed via the Workers bootloader (`@despia-native/server`), with identity, declared
  CRUD, webhooks (HMAC), realtime, rate limits, tracing, one-button deploy.
- **Despia Apps (studio-apps, PROPOSED v1 2026-08-28)** — registry packages contributing DSX
  components into closed slots (`studio.panel`, `studio.rail`, `dashboard.card`, `tool`,
  `automation`) under closed grants, budgets, signed approvals. rfcs/0003 composes this; it
  does not compete with it.
- **`Core/MCP` + `facets.mcp` + MCP Apps** — any module action opts into the app's local MCP
  server; `mutates` rows are approval-gated; a `ui` row renders a `.dsx` component as the
  tool's face. The server side has `mcp-face.ts`. The admin-via-ChatGPT story is a projection,
  not a build.
- **The registry (W1–W6 LANDED)** — git tags are truth, `packages.json` is submission,
  discovery is generated. Templates ride the identical model (rfcs/0002).
- **Shelves** — `shelf: open` (85 modules) vs `shelf: premium` (34: AdMob, RevenueCat,
  OneSignal, OneSignalLiveActivity, Stream, PowerSync…). The licensing story in rfcs/0004 is a
  *disclosure* of this existing fact, not a new mechanism.
- **Modules this template consumes** — VerticalPlayerStack, NativeVideo, AdMob, RevenueCat,
  OneSignal (+LiveActivity), Widgets, QuickActions, SocialShare, Downloads, Spotlight.

## 5 · Build order (each phase gated by the previous)

| Phase | Deliverable | Gate |
|---|---|---|
| 0 | This plan + RFCs reviewed by owner; upstream items (§6) filed | Owner sign-off; issues exist |
| 1 | Backend: entities + server documents + seed catalogue (3 licensed-free demo shows) deployed to Workers | `dsx build` green; SSV round-trip proven with AdMob test ads |
| 2 | Web app: SSR shelves, show page, SEO routes, wallet, rewards center | Lighthouse/AA gates; SSR verified with JS disabled |
| 3 | Native app: VerticalPlayerStack integration, discover feed, rewards, downloads | Conformance corpus green on all renderers; device pass |
| 4 | Engagement: push segments, live activities, widgets, check-in/spin/tasks | OneSignal journeys fire on device; SSV-gated grants only |
| 5 | Admin surface: Manage contributions + AdminKit components + MCP projection | Client can run the app for a week without the Studio |
| 6 | Template polish: `template` manifest block, setup steps, `despia shot` assets, docs, AGENTS.md | rfcs/0001 checklist 100%; deploy-link dry run |

## 6 · Upstream items (the no-hacks ledger — file these, do not absorb them)

1. **VerticalPlayerStack web facet.** → filed: https://github.com/despia-native/despia-framework/issues/215 — No `web/` twin exists; the SSR web app needs the same
   player/paywall behaviour. Article 10: supported, polyfilled, or platform-limited-with-named-
   degradation. The fix belongs in the module (a `web/index.js` twin over `<video>`/`<pager>`),
   not as a template-side fork.
2. **Role-gated auth in the server grammar.** → filed: https://github.com/despia-native/despia-framework/issues/216 — `<route auth="required">` exists; the Manage
   plane needs `role`-scoped routes/actions (owner / admin / operator vs. end user). Verify
   against `full-stack.md` identity claims first; if absent, propose `auth="role:<name>"` +
   `<role>` declaration upstream.
3. **Manage View itself** (rfcs/0003) — new slots + the project-scoped residence. This is
   a framework RFC by definition; the template only *consumes* it. Interim (Phase 5 before
   ratification): the same components mount as an ordinary in-app route behind the admin role —
   grammar-compatible, so the move to Manage slots is a manifest edit, not a rewrite.
4. **Template manifest block** (rfcs/0001 §3) — `dsx.json "template"` key read by
   CLI/editor/registry; validator computes consumed shelves. Needs a framework-side validator
   twin exactly like studio-apps' two-validators-one-corpus pattern.
5. **Deploy-link contract** (rfcs/0004 §4) — `despia.com/new?template=…` + Cloudflare OAuth:
   lands in despia-platform (private). The template declares; the platform executes.

### Filed from the implementation slice (measured on dev@92b844b0; re-verified 2026-08-29
### evening at dev@ae0669ad — no relevant framework sources changed between the two, and
### every browser-era claim was re-tested in a clean room per §6.13a's rule; three claims
### died there and are marked RETRACTED where they stood)

6. **`<webhook>` parity in the standalone server compile** → filed: https://github.com/despia-native/despia-framework/issues/217 — — the monorepo grammar has it;
   `server-document.ts` aborts on it. Blocks the RevenueCat receiver outside the monorepo.
7. **Operator/service authority for declared actions** → filed: https://github.com/despia-native/despia-framework/issues/216 — — `repoFor` pins user scope and
   `serviceRepo` is deliberately unreachable from documents, so no `<server>`-grammar path
   can write a public-read entity. The Manage bridge runs on host-gated internal TS twins
   (scripts/serve.mjs) until `auth="role:…"`/an authority word lands. This is §6.2's
   server-side face and RFC 0003 §5's concrete blocker.
8. **Stored-null truthiness diverges within the TS runner** → filed: https://github.com/despia-native/despia-framework/issues/218 — — clean-room probe
   (declaredHandler, no browser): `{"literal":true,"stored":false,"branch":"ENTERED-ON-NULL"}`
   — literal `!null` is true, stored `!w` is false, and `if (w)` ENTERS on a null. The
   corpus is silent; the intra-runtime disagreement is the defect. Idiom: `x == null`.
9. **JSE value-semantics defects, refined by clean-room probes (2026-08-29 evening):** → filed: https://github.com/despia-native/despia-framework/issues/219 (a) + https://github.com/despia-native/despia-framework/issues/220 (c) —
   (a) mutation through a BRACKET read with a variable key is a silent no-op —
   `by[g].push(x)` leaves length 0 — while literal paths work (`by.k.push(x)` and
   `a.b.c.push(x)` both land). Write-back (`by[g] = by[g].concat([x])`) is the idiom.
   (b) ~~2-arg `Array.map((v, i) => …)` misbinds~~ **RETRACTED** — probe returns
   `[{"i":0,"v":"a"},…]` correctly; the rewards-calendar collapse was the §6.13a
   stale-bundle window. (c) explicit `field: null` in `data.create` values fails the
   whole statement — probe: `{"withExplicitNull":false,"withKeyOmitted":true}`.
10. **Wire serializer elides repeated dict references as null** → filed: https://github.com/despia-native/despia-framework/issues/221 — — `toWire`
    (`packages/server/src/actions.ts`) adds every object to its `seen` WeakSet and never
    releases it after the subtree, so the cycle guard treats a DAG as a cycle. Probe: a
    handler returning `{ first: row, second: row, list: [row, row] }` serializes as
    `{"first":{…},"second":null,"list":[null,null]}`. Fix shape: release on subtree exit.
11. **`<api>` `send()` posts its argument verbatim** → filed: https://github.com/despia-native/despia-framework/issues/222 — — `packages/kernel/src/api.ts`
    `send(args)` does `req["body"] = args`, so the documented `send({ body: X })`
    (web/05-api-blocks.md) posts `{"body":{…}}`. Docs/impl divergence, pick one.
12. **Web renderer — the two claims that SURVIVED clean-room re-testing** → filed: https://github.com/despia-native/despia-framework/issues/223 (image) + https://github.com/despia-native/despia-framework/issues/224 (inline component) — (everything else
    in this row's earlier form was a §6.13a-class artifact and is retracted below):
    - `<image>` `width=`/`height=` attributes do not emit — a 60×90 request rendered
      911×300; `<video>`'s size attributes DO emit. Style px beside the attrs is the bridge.
    - a head-declared inline component (`<component as="Chip">…`) renders a literal
      `<Chip>?` placeholder wherever invoked — in row templates and standalone alike.
      FILE components work everywhere, including row scope resolving into their
      attributes (`<ProbeChip label="{{ item.genre }}"/>` renders correctly per row).
    **Retracted after clean probes**: nested repeater `item.*` scope (works), per-node
    text styles in `<pager>` rows (compute correctly), `zstack` align/width/height attrs
    (a 120×80 `align="bottomLeading"` zstack renders exactly that), file-component attrs
    in row templates (work), and accent inheritance inside `href` containers (a `color=`
    attr computes as authored). The absent style-vocabulary words (`vh`, `position`,
    `conic-gradient`) are documented catalog DESIGN, not defects.
13a. **RETRACTED — there was no layout-plane defect.** An earlier revision of this ledger
    claimed three of them (inline layout attributes inert on web, `<style>` class names
    app-global, `grow` never emitting). All three were re-tested in isolation with a probe
    component and all three are FALSE: `padding="16" spacing="12" align="center"` emit
    correctly as attributes, the `style="…"` CSS string works, named classes are
    document-scoped (two components declaring the same class name each keep their own
    values), and every spelling agrees.

    **The actual cause was the local dev loop, not the renderer.** `despia build` emits a
    service worker that PRECACHES the bundle. The SSR HTML was served fresh by the
    restarted origin while the browser's service worker kept replaying a stale `main.js`;
    style tokens are per-build identifiers, so fresh markup carrying token `a35` met an
    old stylesheet that had never heard of it, and every rule silently resolved to
    nothing. The symptom — "padding attributes do not emit" — was a measurement artifact.

    Two lessons kept as standing rules, because they are what actually cost the time:
    - **Diagnose in isolation before generalising.** A one-component probe would have
      falsified all three claims in minutes; instead a whole UI was rewritten around them.
    - **Kill the service worker in the local lane** (`scripts/serve.mjs` now refuses to
      serve `dsx-sw.js` when `DSX_DEV_NO_SW=1`, which `npm run serve` sets), so a stale
      bundle can never again masquerade as a framework defect.

    The dev-lane asks distilled from this row (plus the dev deep-link fallback) are
    filed as https://github.com/despia-native/despia-framework/issues/228.

    Nothing in this row is a semantics item. It stays in the ledger as the correction of
    record, because a template that silently deleted a wrong claim would teach the next
    reader nothing.

14. **RETRACTED — `vars.*` resolves in action bodies too.** Clean-room probe on a routed
    screen (`/probe/:id`): markup `{{ vars.id }}` AND an action body reading `vars.id` both
    yield the param. The 400s that produced this claim were inside the §6.13a stale-bundle
    window. The mirror-at-boot pattern in Watch.dsx is now a style choice, not a necessity.

15. **The MCP face, measured end-to-end (2026-08-29).** → filed: https://github.com/despia-native/despia-framework/issues/225 (a) · https://github.com/despia-native/despia-framework/issues/226 (b) · https://github.com/despia-native/despia-framework/issues/227 (c) — `<tool>` rows in `server/admin.dsx`
    do serve: `initialize` ✅, `tools/list` ✅ with `destructiveHint` correctly set from
    `mutates=`, and `tools/call` ✅ for read tools (`adminStats` returns real counters as
    text + `structuredContent`). Three defects sit on top of that, in severity order:

    a. **A declared rejection reaches an agent as an empty SUCCESS.** The same action, same
       identity: `POST /admin/notice` answers `403 {"reason":"forbidden","message":"operator
       authority required"}`, while `tools/call adminNotice` answers
       `result:{content:[{text:"(empty)"}]}` with **no `isError`** and no `onError`
       callback. An agent is told a refused mutation worked. This is the worst failure
       mode for the "manage your app from ChatGPT" story and cannot be bridged downstream —
       it is inside the face.
    b. **The standalone `<tool>` emit omits `inputs`,** so every tool advertises an empty
       `inputSchema` and arguments are dropped. Bridged locally by reading the actions'
       declared `inputs=` back out of the documents at boot (`scripts/serve.mjs`) — the row
       should carry it, and the bridge dies when it does.
    c. **`@despia-native/server` exports no way to serve them.** `despia build` emits `mcpTools`
       into the standalone barrel, but the package export map has no `"./mcp-face"`, and
       `bootloader-node`'s `serve()` consumes the MONOREPO artifact shape rather than this
       barrel. A standalone project can declare `<tool>` rows it has no supported way to
       serve; the local origin reaches the built file by path, loudly.

    Consequence for this template: the six declared tools are correct and the read tools are
    genuinely usable by an agent today. The mutating ones are blocked by §6.7 (no service
    authority for declared actions) and their refusal is invisible per (a), so the Manage
    screen and README say exactly that rather than promising a working write path.

16. **CORRECTED 2026-09-01 — `Core/Store` CAN be built; the blocker was the CLI's component
    pool, and it is fixed (`despia-framework dev@15b93a53`).** The original entry here
    read "no DSX app can ship in-app purchase today" on the strength of

        Core/Store/Components/core/PaywallVIP.dsx:18:
          error: <shared.VipCard>: no global component 'VipCard'

    and concluded the file was missing from the package. It is not missing.
    `VipCard.dsx` is at `Mandatory/Foundation/Components/Core/VipCard.dsx`, along with the
    whole `shared.*` family (Avatar, Banner, Callout, Card, Chip, EmptyState, FAB, VipCard).
    Two CLI facts explain the error, and both are about the POOL, not the module:

      · Foundation declares NO scheme, so its components belong to the global (null) scope —
        exactly what `<shared.X>` requires. But `dsx lint` folds only the roots listed in
        `dsx.config.json` `packages`, and Foundation is not one of them. It is `mandatory:
        true`, so it always ships in the EXPORT while never entering the LINT pool. Adding it
        to `packages` resolves VipCard immediately.
      · That then exposed the real bug. `foldPackage`, which folds a CONFIGURED root, read
        only the package's `.dsx` files; the Swift scan that publishes a Swift-defined global
        (`override class var tag: String { "SystemFAB" }`) lived exclusively in
        `foldPackageTree`. So configuring Foundation reported `<SystemFAB>` and
        `<SystemSettingsRow>` unresolved even though both are declared in Swift beside the
        markup mounting them. `lint_dsx.rb`, which walks the whole tree, always resolved them
        — so the two linters disagreed and the TypeScript one refused documents the real one
        accepts. `foldPackage` now walks its root for Swift globals too.

    Measured after the fix, with `Mandatory/Foundation` and `Core/Store` both configured:
    **109 files, 0 errors.** The module is sound.

    WHAT REMAINS BEFORE THE TEMPLATE TURNS IAP ON, and it is a scoping question rather than a
    blocker: configuring a package makes `dsx lint` lint that package's own files, so
    Foundation's three pre-existing warnings (`dsx.module.haptic` and `dsx.module.dom`
    unconfigured, an `aria-pressed` census notice) enter an app gate that allows zero
    warnings. Either those get configured/fixed, or lint scopes findings to app files and uses
    packages for resolution only. Until that is settled the template keeps Stripe on web and
    names the native gap on the purchase surface — which is what it does today.

17. **The linter reads identifiers out of `//` comments inside an action body (2026-09-01).**
    Same family as the apostrophe rule already in AGENTS.md, and it costs the same way. A
    comment explaining what a seam WILL call —

    ```
    // What belongs here is: dsx.module.store.checkout({ product: sku })
    // ...configure Core/Store in dsx.config.json
    ```

    — produces `unknown namespace 'dsx.config'` and `dsx.module.store — no CONFIGURED package
    claims scheme 'store'`, i.e. two warnings against a zero-warning gate, for two lines of
    prose. Measured here; the workaround is to write the identifier without its engine prefix
    (`store.checkout(…)`, "the packages list"), or to move the paragraph into the `<!-- -->`
    comment above the action, which is not scanned. Worth fixing upstream because the
    incentive it creates is exactly backwards: it prices documenting an unavailable module
    higher than silently leaving the gap unexplained.

## 7 · Decision log

- **2026-08-29 · Custom UI everywhere, no native chrome.** ReelShort/DramaBox/NetShort all use
  fully custom UI; this template is the flagship proof that DSX renders pixel-unified custom
  UI on iOS/Android/Web. MenuBar/SystemBars consumed for immersion (hidden bars in player),
  not for chrome.
- **2026-08-29 · Live Activities are a differentiator, not an industry copy.** The big drama
  apps run on push + widgets; none ships meaningful Live Activities today. We ship them
  (premiere countdown, download progress, streak-guard) via OneSignalLiveActivity and say so
  honestly in marketing.
- **2026-08-29 · Cloudflare lane: Workers + D1/Postgres-adapter + R2 + Stream.** The server
  package already emits a Workers deploy; Stream is the managed HLS lane for the hosted flow.
  Self-hosters get the R2+HLS static lane documented in rfcs/0004 (no Stream lock-in in
  template code: the CDN base is config, Article 4 style).
- **2026-08-29 · Demo content must be licensed-free.** Three seed "shows" produced for the
  template (or public-domain footage re-cut), vertical 9:16, ~8×60–90s episodes each — enough
  to exercise gates (free eps, locked eps, premiere drip) without rights risk.

16. **Review R4 (hex-count) has no brand-palette valve** → filed: https://github.com/despia-native/despia-framework/issues/230 —
    (found 2026-08-29, restyling to the category look at dev@ae0669ad). `despia review`
    warns at ≥3 raw hexes/file; with no palette declaration and no appearance pin,
    a pinned-dark media storefront cannot go tokens-first (light-mode label on a black
    stage) and cannot pass honestly. Bridge: `scripts/review.mjs` waives R4 ONLY for
    hexes inside the declared brand palette — off-palette hexes still fail; prints the
    waiver + this row on every run; dies when upstream lands.

17. **A bare `{{ var }}` fragment in a compound style attribute is silently discarded**
    → filed: https://github.com/despia-native/despia-framework/issues/231 — (measured during the ReelShort-look pass at dev@ae0669ad).
    `parseStyleAttr` splits on `;` before interpolation, so `style="{{ shell }}; height: 100%"`
    drops the shell while the extras apply; the whole-attribute spelling is a first-class
    door. Idiom adopted (AGENTS.md): compound lists are ONE computed value.

18. **Review R3 (type scale) has no project type-ramp declaration** → filed: https://github.com/despia-native/despia-framework/issues/232 —
    (found 2026-08-29 building 1:1 to the category reference at dev@ae0669ad). The measured
    brand ramp (14/18/24/32) is the design, applied consistently; R3 only knows the iOS
    ramp. Sibling of §6.16 — one `design: { palette, typeRamp }` declaration closes both.
    Bridge: `scripts/review.mjs` waives only declared-ramp sizes; anything else still fails.

19. **A horizontal `<list>`'s rows SHRINK instead of scrolling** → filed: https://github.com/despia-native/despia-framework/issues/249 — FIXED UPSTREAM in this
    pass (found 2026-08-30, seeding the demo catalogue to 14 shows). `.dsx-list` had a rule
    making a VERTICAL collection stretch its cross axis, with a comment explaining that a
    horizontal collection is deliberately untouched — but nothing governed the horizontal
    collection's MAIN axis, so its rows kept the web's `flex-shrink: 1`. Measured on a 375pt
    phone: a rail of `width: 150px` posters rendered them at **72.25px** each, `getComputed
    Style().width` reporting the squeezed number, so `object-fit: cover` cropped art nobody
    authored and every badge wrapped one letter per line. `ScrollView(.horizontal)` and
    `LazyRow` both keep the row's size and scroll the content. Fix landed in
    `packages/dom/src/theme.ts`: `.dsx-list[data-dsx-axis="horizontal"] > .dsx-row > *
    { flex: none; }`, in `dsx-elements` so `grow="width"` still wins from `dsx-attrs`.
    Template-side sibling: a rail TRACK is `width: max-content`, never the page shell's
    `width: 100%` (which caps it at the scroller and makes the rows eat the difference).

20. **`list` clamps `limit` to 100 silently — no truncation flag, no cursor, no count** → filed: https://github.com/despia-native/despia-framework/issues/250 —
    (measured 2026-08-30 with 14 shows / 352 episodes). `repo.ts` `LIST_LIMIT = 100` is
    correct policy — the comment "an unbounded list is a data-exfiltration primitive and a
    DoS" is right — but `Math.min(LIST_LIMIT, want)` is the whole of it: a caller asking for
    1000 gets 100 and is told nothing. `RepoQuery` has no `offset`/`cursor` and no `count`
    op, so rows past the first page are **unreachable by any supported spelling**. Live
    consequence in this template: `homeShelves` counted episodes with one
    `episode.list({ limit: 1000 })`, the read stopped at row 100, and every show past it
    rendered "EP 0" on a shipped storefront. Nothing failed. Asks: (a) `list` reports
    truncation the way the DOM collection already does (`data-dsx-truncated`); (b) a cursor
    or offset; (c) a `count` op. Template-side: every read is now per-show and inside the
    ceiling, and the Manage screen renders "100+" rather than a confident lie.

21. → filed: https://github.com/despia-native/despia-framework/issues/251 — **A column stack nested in a column stack is given `align-self: stretch`, which
    silently defeats the parent's `align-items`** (measured 2026-08-30, five separate
    instances in this template). `globals.ts` ("a form is a block") stretches
    `.dsx-stack:not(.dsx-hstack):not(.dsx-zstack)` children of a column, and its comment
    says "an authored width still wins". The width does win — the POSITION does not: CSS
    says a stretch with a definite cross size behaves as `flex-start`, so a fixed-size child
    lands at the leading edge while its siblings stay centred. Measured: the 30pt VIP tab gem
    sat 14px left of the tab centre under `alignItems="center"` while its caption was
    centred; the player rail's Download anchor grew to the rail's full 51px and put its icon
    at the left edge. Proposed fix — swap `align-self: stretch` for `width: 100%` in those
    rules: identical filling for an auto-width block, and `align-self` stays `auto` so the
    parent's `align-items` keeps governing a child that has its own size. Third case of the
    same family as #238 (the alignment vocabulary misleading authors).

22. **`<sheet inset>` is declared and ignored by the web renderer** → filed: https://github.com/despia-native/despia-framework/issues/252 — (measured 2026-08-30).
    `stack-elements.json` declares `inset` on `<sheet>` (number, default 14);
    `.dsx-sheet-content` keeps `padding: 12px 16px 16px` regardless and no sheet-inset custom
    property is emitted. A full-bleed cover sheet — a rewarded ad, a lightbox, a media viewer
    — has no supported spelling. Bridged loudly in `Components/parts/AdGate.dsx`: the
    declared `inset="0"` STAYS on the tag and the layer cancels the pad, so the bridge is a
    no-op the day the renderer honours it.

23. → filed: https://github.com/despia-native/despia-framework/issues/253 — **A `<video>` inside a `<sheet>` is paused by the overlay portal, and a two-way
    `paused=` binding latches that pause forever** (measured 2026-08-30). The sheet
    re-parents its content into an overlay portal; moving a `<video>` in the DOM pauses it in
    every browser. `media-surfaces.ts` treats any non-internal `pause` as authored and writes
    `true` back through the binding, so the clip can never restart; drop the binding instead
    and nothing retries, so it stalls at t≈0.16. Ask: `pauseInternally`'s `ignoreNextPause`
    discipline should cover a re-parent (or the portal should restore playback), the way it
    already covers the renderer's own pauses. Bridged in `AdGate.dsx` by re-asserting the
    product rule ("a rewarded ad is not pausable") through a bounded `<watch>`, with a
    tap-to-play fallback when the browser is genuinely refusing autoplay.

24. **Core/AdMob has no declared REWARDED face** → filed: https://github.com/despia-native/despia-framework/issues/254 — (found 2026-08-30 building the ads lane).
    The banner face is fully declared — `dsx.module.admob.banner`, `<admob.Banner/>`,
    `<admob.Native/>`, `Conformance/inline-surfaces/admob.json` — but rewarded video is still
    only the legacy registry alias `displayrewardedad`
    (`architecture/proposals/legacy-package.md` lists it as pending declaration), so there is
    no action an app may call. Rewarded video is the earn lane the entire short-drama
    category runs on. `AdGate.dsx` refuses to guess one: `dsx.action.playNetwork` is the
    single place the real call lands, the card says out loud that the lane is unavailable,
    and the house creative runs meanwhile.

25. → filed: https://github.com/despia-native/despia-framework/issues/255 — **The ownership vocabulary has no word for ALL-READ / OWN-WRITE** (measured
    2026-08-30 when the first real comment refused to post). `owner` is own-read/own-write,
    `public-read` is all-read/SERVICE-write (deliberate, and right for the catalogue —
    with an owner-write policy any signed-in viewer could insert a `state='live'` show
    row onto the storefront), `service` is service-only. The shape every comment, review
    and post table has — anyone reads the thread, the author writes their own row — is
    unspellable, so `postComment` failed RLS and surfaced as `{reason:'conflict'}` with
    nothing naming the cause. Two asks: (a) an `ownership="public-read-own-write"` (or
    equivalent) that emits the public select + owner-scoped insert/update/delete + the
    `owner_id default auth.uid()` column the owner tables already get; (b) the repo's
    create error should carry WHICH policy refused, because "conflict" cost a bisection.
    Bridge: `server/policies.local.sql` — the app's own addendum, applied beside the
    generated migration, scoped to dsx_comment, loudly labeled, dies when the word lands.

26. → filed: https://github.com/despia-native/despia-framework/issues/260 — **A root-relative `<api url="/x">` cannot be fetched during SSR** — fixed
    upstream in this pass (measured 2026-08-30 chasing "the first clip loads for half a
    second"). `executeApiForSSR` passed the authored url straight to `fetch`, so the exact
    spelling the reference documents (`url="/catalog/discover"`) threw server-side — there is
    no document to resolve it against — failed open, and seeded NOTHING. Every route's SSR
    pass ran and was useless: `curl /discover` returned a spinner, zero `<video>` tags and no
    titles, and the browser hydrated, then fetched, then painted. The origin was available
    the whole time (`live.ts` holds `new URL(req.url)`), it was simply never threaded.
    Fix: an `origin` option on the SSR path (`kernel/src/api.ts` resolves a leading `/`
    against it; `page-render.ts` / `render.ts` / `live.ts` pass it down). Measured after:
    14 `<video>` tags in the feed's SSR HTML, first media request **194ms → 75ms**.

27. → filed: https://github.com/despia-native/despia-framework/issues/261 — **`exportStatic`'s DATALESS export shadows live SSR seeding** — fixed
    upstream in this pass (same session). `dsx build` prerenders route HTML with no API host
    running, so each file holds that route's null-data branch — a spinner where the component
    declares a loading state, an empty shell otherwise (re-measured with the server stopped:
    Vip exports its headings and a wallet reading "— coins"; Discover exports "Loading the
    feed"). `createSiteHandler` served files BEFORE the page handler, so on a running server
    those files permanently shadowed the live render and seeding could never reach a browser.
    Fix: route paths (exact, non-pattern) go to the live renderer first — `preferLivePages`,
    default true, opt-out for a CDN-shaped deployment whose exports are authoritative.
    Assets are untouched, being route paths in no route table.

28. → filed: https://github.com/despia-native/despia-framework/issues/262 — **The universal-attribute census omitted seven DOCUMENTED attributes** —
    fixed upstream in this pass. `Documentation/reference/stack-elements.json` listed 30
    universal attributes; `href`, `shared`, `sharedMode`, `sharedAnim`, `sharedOrder`,
    `lockOrientation` and `dismissEdge` were missing, though all are documented as universal
    and `href` is honoured by `mount.ts` and demonstrably navigates. A CLI rebuild exposed a
    newer linter against the stale census and 29 valid `href` usages became hard errors —
    i.e. the census, not the reference, was deciding what the language allows. Census now 37.
    The deeper ask: this file is hand-maintained beside the reference it encodes, with no
    test proving the two agree.

29. → filed: https://github.com/despia-native/despia-framework/issues/263 — **Router motion has one knob too few for GLOBAL CHROME** — fixed upstream
    in this pass (measured 2026-08-30, from "the top bar should not move with page route
    changes"). Two separate gaps, one symptom:
    (a) `masterDetailBreakpoint` answered TWO unrelated questions — where a master pane pins,
        and where phone motion stops. An app whose global bar switches at 768 (top bar
        replacing tab bar) had no way to say so, so tablet widths ran the phone's iOS push
        WITH the desktop bar mounted; the bar lives inside the animating frame, so it slid in
        from the right with the page. Fix: `motionBreakpoint`, defaulting to
        `masterDetailBreakpoint` so every existing app is byte-identical.
    (b) `wide` could only say `"none"` or `"same"`, when the useful shape is a phone that
        PUSHES while wide viewports CROSSFADE. Fix: `wide` accepts a family name; an unknown
        word degrades to `"none"` (the config plane is cast, not validated).
    Why this is the whole answer on the wide lane: the neutral family animates the INCOMING
    frame's opacity while the frame beneath stays opaque and untransformed, so a bar both
    frames paint identically composites to a CONSTANT — it does not move and it does not dip;
    only the pixels that genuinely differ (an active link's tint) cross-dissolve. Measured at
    1440 and 900: one 160ms opacity animation, `transform: none` on every frame, the bar at
    `[0, 0, width]` in every sample. On the MOBILE lane no compositing trick can save chrome
    inside a transforming frame, so a pushed detail screen must not mount the tab bar at all
    (UIKit's `hidesBottomBarWhenPushed`; every reference short-drama app agrees) — done here
    for /store, /notices, /show/:id and /admin, each of which already owns a back affordance.
    Template-side sibling law: **`<TopNav>` must be the first child of an UNPADDED wrapper.**
    A `page` style carrying `paddingTop` pushes the global bar off y=0 — measured 16px on
    Store and 12px on Notices against 0 everywhere else, so a route change visibly DROPPED
    the bar. The padding belongs below the bar, on the content.

30. → filed: https://github.com/despia-native/despia-framework/issues/264 — **`<api cache="swr(...)">` cannot survive a MOUNT, so the cache's most valuable case is
    unreachable** — (measured 2026-08-30, from "page change reloads data and
    flashes"). The policy is right and complete: `swr(fresh, stale)` serves the cached body
    immediately and revalidates in the background (`fire()` → `serveCached(entry)` then
    `network(req, { refreshing: true })`), `refreshing` is a distinct state from `loading`,
    and stale data survives a failed refetch. But the cache is
    `apiCaches: WeakMap<ReactiveStore, Map<key, entry>>`, and `mount.ts` does
    `const store = new ReactiveStore()` **per component mount** — so the cache is born and
    dies with the screen. Leaving a tab and coming back therefore refetches from zero no
    matter what `cache=` says, which is precisely the case a cache exists for. Measured on
    this app: tab away from Home and back, `/catalog/home` + `/viewer/continue` both hit the
    network again and the screen painted EMPTY RAILS for **103ms** on localhost (tap to
    content, MutationObserver — rAF and short timers are throttled while the preview pane is
    not composited, which cost two false readings before the instrument was validated).
    On a real network that is a 300–600ms blank.
    The ask: key the api cache in APP scope (DSXState) rather than the surface store, keeping
    the per-surface LRU bound and the existing identity key (method+url+headers+body+expect+
    cookie) — the cookie term already prevents cross-session bleed. It is a cross-platform
    contract change (`Conformance/api/api-blocks.json` runs the same fixtures on iOS/Android
    and the header calls the cache "per-surface" deliberately), so it is a framework decision,
    not a template one — hence filed, not patched.
    Bridge, loudly, in every data screen: the last good payload is stashed in the app-wide
    store (`global.cache*`) by `on:success`, and one computed per block (`homeView`,
    `walletView`, …) returns `block.data` when present and the stash otherwise, so the first
    paint is stale-then-fresh and never blank. `/wallet/state` is read by five screens and
    shares ONE key, so a wallet fetched on Profile makes the Store's coin chip instant.
    Verified by holding every response 1500ms: all five tab screens paint before the response,
    a failed refresh keeps the content, and no error panel covers good data. The Show stash is
    ID-GUARDED — a different show must never borrow the last one's art. Viewer-scoped keys
    must be cleared when the viewer changes (docs/auth.md); the day the cache scope lands
    upstream, all of this collapses to one `cache=` attribute per block.

31. → filed: https://github.com/despia-native/despia-framework/issues/265 — **`await` inside a TERNARY branch silently yields a non-ok result (server action)** —
    (isolated 2026-08-30 building the related rail). `const pool = cond ? await
    data.show.list(A) : await data.show.list(B)` returned a value whose `.ok` was falsy, so a
    "More like this" rail came back EMPTY for a genre with two live shows — no throw, no log,
    no rejected envelope, just no data. ISOLATED: with the identical `let pool` and the same
    two calls written as an if/else with statement-level `await`, the rail fills correctly.
    Every other await in this file is a plain assignment, which is why nothing else hit it.
    The ask: either support `await` in a conditional expression or make it a LINT ERROR — a
    silent wrong answer in the money/catalogue path is the worst of the three outcomes.

32. → filed: https://github.com/despia-native/despia-framework/issues/266 — **Route params are not readable from a plain `<variable>` initializer, and a bare route
    listed before its parameterised sibling captures the URL** — (both measured
    2026-08-30 building Browse). Two separate route-table surprises, one screen:
    (a) `<variable as="active">return vars.genre …</variable>` read EMPTY at mount, so
        /browse/Revenge server-rendered "All series". The same `vars.genre` interpolates
        correctly in markup and resolves in a computed — moving the read into a
        `computed="true"` fixed it outright. AGENTS.md documents params "in markup AND in
        action bodies"; a plain initializer runs before the param is in scope and nothing
        says so.
    (b) With `/browse` declared BEFORE `/browse/:genre`, navigating to /browse/Revenge
        rendered the RIGHT screen (genre bound, 2 series) but wrote the history URL as
        `/browse` — so a reload or a shared link showed something different from what the
        viewer was looking at. Declaring the parameterised route first fixed it. A table
        whose ORDER changes which URL is written, while the content comes from another
        route, should be either order-independent or a validation error.

33. → filed: https://github.com/despia-native/despia-framework/issues/267 — **No declared cross-platform key-value storage** — (found 2026-08-30 adding
    recent searches). `global.*` is in-memory and dies with the page; the module catalogue has
    no `storage`/`prefs`/`kv` scheme, and the skills' "Haptics, storage, camera: everything
    native is a module call" names a capability that has no module. So anything a template
    wants to remember across launches — recent searches, a playback-speed preference, an
    onboarding-seen flag — has no portable home. Reaching for web localStorage would make one
    renderer behave differently from the other three, which Article 7 forbids without a named
    degradation. Recent searches are therefore session-scoped and say so in place.

34. → filed: https://github.com/despia-native/despia-framework/issues/268 — **The bundled face was unreachable: no app could link a stylesheet into its head** —
    FIXED UPSTREAM in this pass (measured 2026-08-30 against the sites the founder rated
    GREAT). The framework SHIPS Inter (`OpenSource/Type`, subsetted variable, 124KB, OFL) and
    `--dsx-font` names "InterVariable" FIRST — but the token sheet is deliberately asset-free
    (it is inlined into SSR heads, injected at boot, adopted into shadow roots and handed to a
    WKWebView: four base URLs), so `inter.css` says "a surface links this file once". Every
    surface could, except an app built by `despia build`: `ShellOptions` carried appName,
    theme, importMap, mainSrc, lang and manifestHref, and no way to add a `<link>`. Measured
    on this template: `document.fonts` EMPTY, and a width probe showed "InterVariable" and
    "Inter" resolving identically to the default serif, i.e. every glyph fell through to
    system-ui. The type ramp names 400/500/600/700 while the static system faces on Windows 10
    and the common Linux fontconfig answer cannot draw 500 or 600 — so the app was asking for
    weights its font did not have, and rendered a different face on every OS (which also makes
    a template's own screenshots irreproducible). Fix: `ShellOptions.stylesheets?: string[]`,
    emitted as `<link rel="stylesheet">` before the inline token sheet; every face in the
    bundled sheet is `font-display: swap`, so a 404 still shows fallback text immediately.
    Template side: `public/type/` carries the face with its LICENCE and DERIVATION per the OFL,
    and `scripts/serve.mjs` passes `stylesheets: ["/type/inter.css"]`. Verified after: the
    latin face reports `loaded`, latin-ext stays deferred by unicode-range, and InterVariable
    measures distinctly from both system-ui and serif.
    CLOSED 2026-08-30, both halves. The remaining ask — that `despia build`'s static export
    reach the same option rather than it living only in a hand-written host — landed in the
    CLI while this template was being finished: `resolveFontsDir` locates the bundled face,
    the build copies it to `dist/fonts` and writes `stylesheets: ["/fonts/inter.css"]` into
    `registry.shell`, which BOTH lanes read (`live.ts` spreads it; `exportStatic` emits the
    link). The template's own `public/type` copy and its `serve.mjs` override are gone with
    it — they worked only on the local origin and shipped the face a second time under a
    different path. Verified: live page and static export both link /fonts/inter.css, and
    `document.fonts` reports InterVariable loaded.

35. → filed: https://github.com/despia-native/despia-framework/issues/269 — **Only `push` animated: a `replace`/`reset` hard-cut, and a route override could not name
    the two lanes** — FIXED UPSTREAM in this pass (measured 2026-08-30 from "all route changes
    should have fade animation on desktop"). Two gaps behind one symptom — a desktop app that
    cross-dissolved its pushed routes and hard-cut every tab switch.
    (a) `navigatePath` called `animatePush` for `push` only; `replace` and `reset` discarded
        the top frame and mounted the next one with no transition at all. Tab bars use
        `reset`, so the most frequent navigation in the app was the one with no motion. Fix:
        `discardTop(hold)` keeps the outgoing element painted (already unmounted, so it is a
        dead painting — `aria-hidden`, `pointer-events: none`, removed on a timer) while the
        incoming frame runs the neutral opacity animation over it. TRANSFORM families are
        deliberately excluded: a replace has no spatial story, and iOS push geometry over a
        discarded stack reads as a glitch.
    (b) A per-route `motion` was one word for both lanes, and `"none"` always won — so the
        only way to stop a tab root sliding on a phone (where the tab bar would ride the
        transition) also killed its desktop crossfade. `motion` now accepts
        `{ mobile, wide }`; a bare string still means both lanes, a lane left unnamed follows
        the lane default, and an unknown word follows it too rather than reaching the DOM as
        a family class. Verified: five tab switches each run one 160ms opacity animation at
        1440 with `transform: none` on every frame and the bar pinned at [0, 64], and ZERO
        animations at 375.

### Learned from the FOUR sites the founder rated poorly (2026-08-30) — anti-patterns, audited
### against this template rather than admired from a distance:
    · **any-reel** opens straight into a grid with NO hero, ~126px cards seven across, a
      ragged 7+2 row, an EMOJI in a section heading, a header with no navigation, and a badge
      on every single card. We had the last one: 14 of 14 demo shows carried a kicker, so the
      badge was decoration, not signal. Now 6 of 14, each tied to something true.
    · **flickreels** renders an EMPTY page between header and footer — the client-render-with-
      no-SSR failure this session already designed out (§6.26/§6.27/§6.30).
    · **shortly.show** has no hero, no poster art at all, inconsistent heading casing
      ("Top Series" / "New series"), and two overlays covering content on first paint.
    · **netshort** is a visual clone of ReelShort — which is why this template measures the
      category and then makes its own decisions, rather than copying one competitor's skin.
    The two that landed on us were badge soup and metric drift: the METRICS table was keyed on
    slugs I invented rather than read, so six shows silently shared one fallback number. Both
    fixed; the second is a reminder that demo data deserves the same verification as code.

36. → filed: https://github.com/despia-native/despia-framework/issues/270 — **`<video>` can select neither a RENDITION nor a TRACK** — (measured
    2026-08-30 auditing the player). The element census gives `<video>` `subtitles` and `pip`
    as booleans — both real, both now bound — but nothing to choose a quality rendition or an
    audio/subtitle LANGUAGE. This template had shipped a 240p–1080p ladder and an
    eleven-language picker against those absent attributes, so a viewer chose "1080p" or
    "Tamil" and got whatever the asset happened to be. Worse, 1080p carried a VIP tag: a
    paywall on a control with no effect, which is the one thing a monetisation reference must
    never demonstrate. Both are removed; Quality survives as a disabled readout naming what
    the build does (Article 7, the AdGate precedent). The ask: `quality`/`track` on `<video>`
    with a typed absence when the source is a single rendition, so an app can offer the
    control the whole category offers instead of deleting it.

37. → filed: https://github.com/despia-native/despia-framework/issues/271 — **A declared web package is unreachable unless it declares `boot: true`** — the manifest
    half FIXED UPSTREAM in this pass, the runtime half open (isolated 2026-08-30
    wiring the player's Share control). Two layers:
    (a) Core/SocialShare has shipped a complete web facet since 1.0 — `web/index.js`, the Web
        Share API with a clipboard fallback, resolving the same `{ completed, activityType }`
        as the native lanes — and its `dsx.json` never declared `web.entry`. The CLI only
        emits a browser chunk for a package that declares one (`build.ts`: `if (pkg.entry ===
        undefined) continue`), so every web build had no chunk and `has('share') === false`
        while the implementation sat there complete. Fixed by declaring the entry.
    (b) That was half. A declared package is imported by the bootloader ONLY when `boot` is
        true, and there is no lazy `dsx:package/<scheme>` import anywhere in the runtime.
        Measured after (a): chunk served 200, import map carried `dsx:package/share`, and
        `share.url` still answered not-ok because nothing had ever imported it. **This
        silently disabled STRIPE too** — it declares an entry, did not declare boot, and so
        could not be dispatched from a browser: the web checkout would have failed the first
        time anyone set STRIPE_KEY and pressed Buy, which no gate would have caught because
        the server refuses first when the key is unset. Both modules now boot.
        The ask: the build already emits an import-map entry for every declared package, so
        the bus should dynamic-import `dsx:package/<scheme>` on first call and `boot: true`
        should be an optimisation rather than the only way to be reachable. Until then, any
        module a template declares without boot is dead weight that fails at the worst moment.

38. → filed: https://github.com/despia-native/despia-framework/issues/272 — **A declared action cannot span a TRANSACTION, so a multi-row spend cannot be atomic** —
    (hit 2026-08-30 building bulk unlock). Every data-module call runs in its
    own transaction: `postgres.ts` sets the caller identity with `set_config(..., true)`,
    which is transaction-scoped, so one request's identity can never leak — correct, and the
    reason there is no seam for wrapping several calls. But "unlock all 14 remaining episodes
    for 448 coins" is N ledger rows, N unlock rows and a wallet debit for ONE payment, and
    there is no way to make that all-or-nothing.
    The template's answer is to be IDEMPOTENT rather than atomic: the fold runs per EPISODE —
    ledger, wallet, unlock row, one at a time, the same order the single unlock uses — so a
    failure half way leaves K episodes paid for and owned and the rest untouched, and a retry
    charges only the remainder. The tempting shape (debit the basket, then grant N rows) is
    the one that double-charges on retry, so it is not used. The cost is 3N writes for a
    basket that could be 3 + N.
    The ask: a declared way to say "these writes commit together" — `<transaction>` around a
    block in an action body, or a repo-level `batch([...])`. Until then every multi-row spend
    in every DSX app has to be designed around the absence, and most authors will reach for
    the shape that double-charges.

39. → filed: https://github.com/despia-native/despia-framework/issues/273 — **Atomic style ids are POSITIONAL and UNVERSIONED, so a stale html page silently wears
    another element's styles** — (measured 2026-08-30, from one forgotten
    server restart while building the hero carousel). A compiled page's styles are emitted as
    atomic classes numbered by position — `[data-dsx~="a517"] { … }` — and the SAME namespace
    is written TWICE: once into the SSR html from the server's registry, once at runtime into
    `<style id="dsx-app-css">` by the client bundle. Nothing ties the two together. Add one
    styled element anywhere earlier in the app and every id after it shifts by one, at which
    point the two sheets still agree on the SELECTORS and disagree on what they mean.
    The failure is silent and total. Measured: `<hstack chrome="true" class="nav"
    style="width: 100%; …">` rendered **32×64 instead of 1440×64**, because the client's
    `a517` was the 32px logo square while the SSR sheet's `a517` was the bar — so the nav
    inherited `width: 32px` from one sheet and `height: 64px` from the other, and the whole
    top bar collapsed. No console warning, no hydration-mismatch report, no error: the page
    simply looked broken, and every element after the divergence point was equally wrong.
    Locally this is a forgotten restart. In production it is the normal state of affairs
    behind a CDN or a service worker, where a cached html document routinely outlives the
    bundle it was rendered against — which is the same class of trap as §6.13a, one layer
    down. `despia build` already emits a precaching SW, so a DSX app can ship into it by
    default.
    The ask: give the sheet an identity. Hash the emitted declaration set and stamp it on
    both faces (`<style id="dsx-app-css" data-dsx-sheet="…">` and a matching attribute in
    the SSR shell); on mismatch the client re-renders its own sheet and drops the server's
    rather than merging into it, and says so once in the console. Content-addressed ids
    (`a-7f3c91`) would remove the class of bug outright at some cost in bytes.
    Bridged in the template meanwhile: `scripts/serve.mjs` re-reads `dist/registry.json` when
    its mtime changes and rebuilds the site handler, so the local origin can never serve an
    html page from an older build than the bundle beside it — and logs when it does.

40. → filed: https://github.com/despia-native/despia-framework/issues/274 — **A HYDRATED `<scroll>` never gets its scroll plane, so `on:scroll` is inert on the page a
    viewer LANDS on** — (measured 2026-08-30 giving the top bar a scroll-aware scrim). A
    server-rendered screen's outermost `<scroll>` comes out of hydration with **no**
    `applyScrollBehaviour`: no `data-dsx-scroll-axis`, no inline `overflow`, none of the
    scroll-linked custom properties, and no `on:scroll` / `on:scrollEnd` / `on:reachEnd`
    dispatch at all. The IDENTICAL component mounted by a client-side route change has every
    one of them.
    Measured on one document, both ways. Fresh load of `/`: the root scroller reports
    `style=""` and `data-dsx-scroll-axis=null`, while every nested rail in the same page
    reports `overflow: hidden auto; overscroll-behavior: auto; …` and its full plane — so the
    element factory clearly runs for children and not for the hydrated root. Click a nav link
    to `/browse` and the root scroller of the incoming screen has the complete plane. Isolated
    against the obvious suspect: removing `on:scroll` entirely does not change the outcome, so
    the handler is not what suppresses the attach.
    Why it is expensive: it is invisible in development. An author adds `on:scroll`, navigates
    around their running app, sees it work, and ships a feature that is dead on every cold
    load and every shared link — which is every first impression the app will ever make.
    Nothing errors, and the same code works on the second navigation.
    The ask: hydration must run the element factory's post-mount behaviour for a matched
    element, or `<scroll>` must re-attach on adopt. A conformance row should pin "a
    server-rendered `<scroll>` publishes its plane on the first frame", since the SSR path is
    the one no browser test currently covers.
    Bridged in the template: `<TopNav>` does NOT drive its scrim from scroll. `overArt` is a
    static per-caller attribute, and the transparent lane carries a gradient scrim so the
    links stay legible over whatever passes beneath. Three lines to make it scroll-aware the
    day the plane hydrates.

41. → filed: https://github.com/despia-native/despia-framework/issues/275 — **The public Apache-2.0 drop mirrors a branch BEHIND `dev`, so the documented fallback
    cannot build a template written against `dev`** — (measured 2026-08-30 by CI's first run,
    which is exactly what CI is for). `despia-native/despia` is the open drop of the same
    tree and is the checkout this template's README and preflight both name for anyone
    without access to the private repo. It is not equivalent: its
    `Documentation/reference/stack-elements.json` lists **30** universal attributes where
    `dev` lists **38**, missing `href`, `chrome`, `shared`, `sharedMode`, `sharedAnim`,
    `sharedOrder`, `lockOrientation` and `dismissEdge` — the census corrected in §6.28. Since
    the census is what the linter enforces, a clean clone built against the drop produced
    **38 hard errors** on markup that is correct and shipping today, plus notices on
    `chrome=`, `shared=` and `dismissEdge=`.
    Two more things the drop cannot do, both structural rather than stale: it carries no
    `ClosedSource/`, so Stripe and SocialShare cannot be configured and every
    `dsx.module.stripe` call warns (a failure under `--strict`); and its root is the CONTENTS
    of `OpenSource/`, so it must be cloned INTO `OpenSource` or nothing resolves — a trap
    `scripts/preflight.mjs` now catches by name.
    The ask, in order of value: (a) mirror `dev`, or publish a second drop that tracks it, so
    the open lane can build what the templates are written against; (b) say in the drop's
    README which branch it mirrors and how far behind it may be, because right now the only
    way to find out is to build and read 38 errors; (c) publish the `@despia-native/*`
    packages to npm, which retires the whole sibling-checkout convention and this item with
    it.
    Bridged in the template: CI builds against `dev` with a read token and SKIPS rather than
    failing when the token is absent; the README says the drop lags and what that costs.

42. → filed: https://github.com/despia-native/despia-framework/issues/277 — **The native lane:
    four export defects, each of which alone makes `despia export ios` produce an app that
    cannot run** — all four FIXED UPSTREAM in this pass (`dev@0ea4481e`), measured 2026-08-30
    taking this template through `despia export ios` for the first time. In sequence:
    (a) components were collected NON-RECURSIVELY while the web build walks the tree, so
        `Components/parts/` — nav bar, tab bar, search overlay, ad gate, plans sheet — was
        silently absent: `despia build` says 18 components, `despia export` said 12;
    (b) the generated bridging header imports `DSXObjCException.h`, which the export copies
        into `Kernel/` and never puts on `HEADER_SEARCH_PATHS`, so every export failed to
        compile;
    (c) `GENERATE_INFOPLIST_FILE = NO` means the generated plist is the whole plist, and it
        declared no `CFBundleExecutable` / `CFBundleIdentifier` / `CFBundleName` /
        `CFBundlePackageType` — an unlaunchable bundle, reported as
        `AppIntentsSSUTraining … Unable to parse Info.plist`, which points nowhere near it;
    (d) the generated `AppDelegate` never called `ModuleRegistry.shared.boot()` — the class
        walk that installs the build tables, documented as "call synchronously at the very top
        of didFinishLaunching". The component table was therefore empty when the Router
        resolved frame 0, and EVERY exported app booted to the kernel's red
        `<scheme.Entry/> failed to render` card. The Android twin does not have this bug: its
        generated Application registers components explicitly instead of relying on the walk.
    The diagnostics compound (d): the panel behind that card reports "No issues — every shipped
    template parsed and registered", which is true and useless, because zero templates failed to
    parse when zero were ever loaded. Distinguishing "nothing failed" from "nothing was loaded"
    is a follow-up ask in the filing.
    Verified after: 18 components exported, `xcodebuild` BUILD SUCCEEDED, the app launches, the
    entry component mounts, and `<api url="/catalog/home">` resolves against the App.json origin
    and reaches a live server (observed on an instrumented origin). The template now ships
    `App.json` — identity plus the origin the native lane resolves root-relative API urls
    against, which the web lane gets for free from being same-origin.

43. **The template's LAYOUT lives in CSS, and does not survive the native renderers** — a
    template debt, measured rather than fixed. IT IS NOT WHY THE NATIVE APP IS BLANK — see §6.44,
    which supersedes the conclusion this item originally drew. `style=""` on web has
    no property whitelist, and this template used that door for STRUCTURE as well as decoration:
    **252 `style=` attributes across all 18 components carry a structural declaration** — `flex`,
    `width`, `height`, `min-height`, `position`, `object-fit`, `overflow`, `justify-content`,
    `aspect-ratio`. AGENTS.md already states the law — "native drops unknown declarations
    per-declaration, so anything load-bearing still needs an attr/class fallback" — and the web
    lane being the only target meant it was never enforced.
    Measured consequence: with the export fixed, the iOS app boots, registers all 18 components,
    resolves the entry surface and fetches its data, and renders a near-blank screen with two
    black bands, because the boxes that should carry the layout have no size. The data plane,
    the routing host and the component table are all fine.
    The work is a port, not a patch: re-express those 252 declarations as layout ATTRIBUTES
    (`grow`, `width`, `height`, `padding`, `spacing`, `alignItems`) that every renderer honours,
    keep the genuinely web-only ones (gradients, `backdrop-filter`, `-webkit-line-clamp`) as
    progressive enhancement over an attribute fallback, and re-measure the web at 375/1000/1440
    so the shipped storefront does not regress. Per-screen counts are in the item above's
    filing; App.dsx (52) and Watch.dsx (51) are two fifths of it on their own.
    THE PORT IS ADDITIVE, which is the finding that de-risks it. Measured both ways on one
    build: `grow="true"` BESIDE `style="flex: 1; min-height: 0"` leaves the web at 1440x900 and
    finally gives native a box; replacing the CSS with the attribute REGRESSED the web (the page
    hugged its content instead of filling the window). So the work is "add the attribute, keep
    the CSS", never a swap — no risk to the shipped storefront on any of the 252 sites. Two have
    no attribute twin today: main-axis centring (`justify-content`, upstream #238) and
    `position: absolute` overlays, which need a `zstack` + `align` fallback under the web
    enhancement. The line-clamp trios are already correct — they are the web twins of
    `lineLimit`, which native honours.
    Started: `App.dsx`'s root (screen + scroller) carries `grow="true"` now, and the iOS app
    went from near-blank to real full-width boxes. Not finished: the rails, images and text
    columns below it still size in CSS, so the phone lane paints boxes without content.

44. → filed: https://github.com/despia-native/despia-framework/issues/278 — **An exported iOS app
    renders a BLANK SCREEN for a minimal valid component** — measured 2026-08-30 with a CONTROL,
    after §6.43 wrongly concluded the blank native screens were this template's CSS debt. They are
    not. A whole project of three files and one component — `<vstack background="#FF0000"
    grow="true">` with a text and a coloured box, **no `style=` anywhere** — lints clean, exports,
    builds, launches, and shows nothing. Reduced to a single `<text/>` as the entire document:
    also nothing. There is no smaller case.
    Instrumented in the generated AppDelegate, everything upstream of the render is provably
    correct: `channel=simulator isTest=yes`, `stackComponents=1 (name=Probe scheme=probe)`,
    `entry.surfaces=1 view=probe.Probe id=probe.Probe timeoutMs=15000`, and
    `StackComponents.resolve("probe.Probe") = FOUND`. So the defect is at or after RouterHost's
    frame-0 mount.
    NARROWED, and the headline is good news: THE RENDERER IS FINE AND SO IS THIS TEMPLATE.
    All 18 real screens were staged into `OpenSource/Conformance/parity/fixtures/` and run
    through the framework's OWN iOS capture plane (`RuntimeParityTests`, the hosted XCTest the
    parity contract uses): TEST SUCCEEDED, every screen parsed, and the capture measured **830
    nodes, 775 with a non-zero box** — App 116/112, Profile 91/83, Rewards 85/83, Watch 60/55.
    Spot-checked against the source: root vstack 390x844, scroll 390x732, TopNav 390x80, the
    logo box 29x29 and the active tab dash 18x3 — the authored numbers, laid out correctly at
    390pt. So the iOS renderer, the element set, the attribute plane and component resolution
    all work on a large real app.
    The defect is the BARE EXPORT. Mounting the identical way the harness does —
    `StackSurface(root:webView:) -> windowRootController`, which is also how the export's own
    ANDROID host mounts — still renders nothing inside the exported app, while the host view
    measures 402x874, subviews=1, hidden=no, alpha=1, scene foregroundActive, app active. A
    plain SwiftUI blue banner placed behind it paints, so window, scene and hosting are
    exonerated: the DSX surface mounts, sizes, paints its background, and produces no content.
    The one remaining difference is the environment — the harness runs inside `Runtime.app`
    with the full module catalog; the export reports `0 module(s)`. Something the render path
    needs is registered by the host catalog rather than the kernel, which no first-party app
    could ever notice because every first-party app IS Runtime.app.
    What makes it expensive: it is SILENT. No diagnostic card (correctly — the tag resolves, so
    `flagsUnresolved` never fires), no kernel log despite `isTest`, no router-settle or
    root.failed trace, and the 15s settle timeout produces nothing at 34s either. Every
    diagnostic the kernel owns reports healthy while the screen is empty. `Package.swift` declares
    no `testTarget`, so the Swift kernel has no automated render coverage — and the Android host
    mounts `StackRootView` directly, bypassing the Router entirely, so the twins never exercise
    the same path.
    THE LESSON FOR THIS LEDGER: §6.43 was written from one measurement and no control, which is
    exactly what "probe before you generalise" exists to prevent. The CSS debt is real and still
    worth paying — 252 declarations that genuinely do not cross over — but it explains none of
    the blank.
    RESOLVED 2026-08-31 (`despia-framework dev@69581687`): the bisect walked the kernel down to
    the answer, and it was neither the renderer nor the Router. "Every leaf, control and
    container is now a component" (raw()'s own header) — `<vstack>`/`<text>`/`<image>` are
    GlobalStackComponent swift lanes in `Modules/Mandatory/Foundation` (shelf: open), folded
    into Runtime.app by prepare_config.rb and into NO export. Every element resolved to nil and
    fell through the TRANSPARENT lowercase fallback: children recurse (bodies evaluate), nothing
    draws, and no diagnostic fires because `flagsUnresolved` covers Capitalized tags only. The
    export now folds the element library — 64 native lanes, satellite backends excluded exactly
    as Runtime.app's own target excludes them, skips cascading and LOUD. Verified: the probe
    renders through the full boot path; THIS APP's phone chrome renders on an iPhone 17 Pro and
    the iPad Pro 13" mounts the DESKTOP lane (TopNav + footer) — `dsx.screen.width` firing
    on-device from one source. What remains dark is the content the 252 css declarations size:
    §6.43's port, now the only thing between the native lane and parity. The Android host has
    the same hole (tracked on 278); `<DSXView>` and Dom-coupled lanes are named skips.

45. → filed: https://github.com/despia-native/despia-framework/issues/279 — **The export has no
    ASSET LANE, so a native app cannot ship its own images, fonts or media** — (measured
    2026-08-30). `despia export` bundles the kernel, `Components/**.dsx`, `App.json`,
    `EngineConfig.json` and `runtime.js`, and nothing from `public/`. This template's 44 poster
    and hero SVGs, its bundled Inter face and its demo clips are all invisible to the native
    lane, so every one is a network fetch and there is no offline first frame.
    It also forces the origin question: with no bundled art, a simulator or device needs a
    REACHABLE origin just to draw a poster, and `localhost` is not reachable from a device. The
    template's `App.json` therefore ships a placeholder https origin rather than a lie, and the
    README names the LAN-address route for local testing along with the ATS exception the
    generated Info.plist does not declare.

46. RESOLVED 2026-08-31 (`despia-framework dev@7514f068`) — **The full-bleed host canvas never
    read the legacy named-class background layer**, so `<style as="screen" background="#000000">`
    — the ordinary way a page states its canvas — left the systemBackground white above the
    content: measured, a 14pt white strip at y=0 on an all-black app (iPhone 17 Pro). The
    resolver read `store.classes`, which fills only when a head RENDERS — after the first canvas
    resolution, with nothing republishing — so the fix reads the class background from the
    resolved template's own head, which is static and timing-proof. Exports also adopted the
    UIScene lifecycle (scene manifest + SceneDelegate) in the same pass. After: canvas black to
    pixel 0,0 on phone and tablet, content still safe-area-inset.

47. RESOLVED 2026-08-31 (`despia-framework dev@4526ef24`) — **The whole-attribute computed style
    was silently inert on native.** The engine's inline-style door opened on a literal `:` in
    the RAW attribute — and `style="{{ dsx.variable.posterBox }}"` has no colon until
    interpolation, so the documented spelling (the only one that gets the declaration-list door,
    §6.38) parsed as CSS on web and as nothing at all on iOS. Measured: the continue-card
    overlay collapsed to its 3px track and the zstack centered the remains mid-poster. The gate
    now also opens on an interpolation hole. No template edit; the hairline moved to the poster
    foot on both devices.

48. RESOLVED 2026-08-31 (`despia-framework dev@4526ef24`) — **A greedy child inflated the depth
    stack.** SwiftUI's ZStack hands its incoming proposal to every child, so a `height: 100%`
    scrim (bridged to grow) swallowed the scroll proposal and a fixed-height band rendered 2.2×
    its declared height — hero copy pinned to the band top, captions adrift. `<zstack>` now
    sizes CSS-true (CoverZStackLayout): auto size from NON-GREEDY children only; covering layers
    take the resolved box; an axis with no non-greedy child keeps fill-available (a stack of
    nothing but layers is a full-bleed surface). Greed is detected by MEASUREMENT, so a class,
    inline CSS or an explicit `grow=` all count. iPad hero: copy vertically centered in a 421pt
    band against web's 420 at the same viewport.

49. → filed: https://github.com/despia-native/despia-framework/issues/281 — **Percent lengths
    have no native twin** (probe: a `width: 64%` fill inside a 220px track renders 141px on web
    and NOTHING on iOS — the bridge drops non-100 percents per-declaration, silently). Ports in
    this template: a statically-sized track computes the fill px in the interpolation
    (App/MyList continue rails); a fluid track uses the reference's own seek idiom —
    `measure="dsx.variable.seekBox"` on the track, `width="{{ Math.round(seekBox.width * pos) }}"`
    on the fill (Watch). Both render identically on web, so the port is not a fork. The ask
    upstream: a real parent-relative twin, or a loud DEBUG drop.

50. THE SCREEN-ROOT RECIPE, measured on device (2026-08-31) — three findings, one law.
    (a) `min-height: {{ dsx.screen.height }}` on a native route root forces WINDOW height
    into the SAFE region: the root demanded 874pt of a 781pt box and the spill carried the
    tab bar 34pt into the home-indicator zone (captions measured at 840–860pt against a safe
    bottom of 840). The declaration is the WEB page's body-height mechanism and now rides the
    `:web` suffix; a native route frame already proposes exactly the safe region, and the
    root fills it with `grow="true"`. (b) The root vstack's DEFAULT spacing (8 — measured
    identical on web and native, so no drift filing) plus a zero-size seed child cost a
    14pt phantom above the scroller the moment the min-height stopped masking it: a 0×0
    component still pays two inter-child gaps. Screen roots declare `spacing="0"`. (c) The
    fullscreen contract, all lanes, after the framework's canvas seams (dev@7514f068 native,
    dev@b9347e81 web): the canvas paints the inset strips in the page's own declared
    background, content stays inset, and a bar that should visually continue under the home
    indicator does so BY CANVAS, not by spilling content. Measured end state on iPhone 17
    Pro: first content 78pt (was 114 double-inset, and before that window-anchored under the
    island), bar ink 788–812pt, bar bottom = safe bottom 840, black to the physical edge.

51. RESOLVED 2026-08-31 (`despia-framework dev@7a459406`) — **Navigation was dead on every
    exported app with a route table, and the symptom lied.** A tab tap ran the verb, built the
    destination surface, fired its api blocks — and the screen "did nothing", because the export
    shipped no `routes.json`, so the kernel Router resolved EVERY path to the entry fallback and
    each navigation re-mounted Home wearing the new path. One trace line told the truth
    (`routerhost body — root view=shortdrama.App path=/vip`). The export now ships the bundled
    route floor (dsx.config.json `routes` → routes.json beside App.json, both platforms) — the
    file Router.bundledTable has always read. Same commit: exported Debug builds now define
    DEBUG (every `#if DEBUG` diagnostic was silently compiled out), and the router traces its
    verbs. The lesson upstreamed as the traces; the lesson HERE: when "nothing happened", find
    which half of the state/view pair moved.

52. RESOLVED 2026-08-31 (`despia-framework dev@9952e1a6`) — **Route params died at the component
    boundary.** The router seeds `vars` on the surface store; every component instance is born
    with a fresh store; so a route-mounted component read `{{ vars.show }}` as nothing and the
    Watch detail block stayed gated on vars:missing-value forever — two ObjectIdentifiers in one
    trace line. Instances now inherit the consumer's `vars` at store birth (pre-observation, so
    no mid-update publish), params flow down through every boundary exactly like the web scope
    chain. Same commit: the site handler learned the media rows and RFC 9110 single ranges —
    an octet-stream, range-less mp4 plays in every lenient browser and "would not play" in
    AVFoundation (206/content-range/416 now; accept-ranges advertised).

53. RESOLVED 2026-08-31 (`despia-framework dev@e7f77604`) — **A same-URL `route.replace` re-minted
    the native frame.** history.replaceState semantics on web; on native the Watch screen's
    mount-time URL sync looped mint → mount → sync → mint at ~10 frames/s (a thousand frame ids,
    the screen frozen on its loading branch). Same-URL replace is now a no-op; a changed path
    still remounts — which is what an episode change wants.

54. → filed: https://github.com/despia-native/despia-framework/issues/282 — **A 22pt icon tap
    passes review, and no hit-slop primitive exists.** The Watch back chevron hit-tested its bare
    glyph; a tap 2pt outside fell through to the pager (A/B probed: no hit-stealing anywhere —
    a mouse target on a touch screen). Template: the back chevrons carry paddingV/H 11 (44pt
    targets). Upstream asks: a review rule for sub-44pt tap handlers, and `hitSlop=` (or an
    automatic floor) so the fix stops costing layout.

55. RESOLVED 2026-08-31 (`despia-framework dev@0c73f390`) — **The iPad player rendered full-bleed
    because three small truths compounded.** (a) `grow` swallowed an explicit cap: `width: 100%`
    bridges to grow, the markup `maxWidth` rode beside it, and flexFrame resolved grow to
    .infinity — a maxWidth="200" pager measured 402pt. Grow now resolves to (cap ?? ∞) per axis.
    (b) The platform fold's hot-path gate probed only `style:`/`class:` keys, so
    `align:native="center"` never resolved on the platform it addresses; the gate now recognizes
    any suffixed key. (c) Both linters' suffix vocabularies lacked `native`/`wear`, so the fork
    word censused as a typo. Template half: the stage column carries the §6.43 recipe —
    `grow="width"` beside the dead `flex: 1`, `align:native="center"` for the web's
    `margin: auto` — and the iPad Watch now shows the reference shape: a 461pt stage, centered,
    letterboxed, chrome bound to the stage edges, clip playing under TopNav. Probe ledger:
    0..199 → 101..301 in a 402 viewport.

56. RESOLVED 2026-08-31 (`despia-framework dev@1c251901`) — **Native type ignored CSS weight on a
    variable family, and it read as "day and night".** DSXFontBook selected FACES by weight —
    correct for per-weight files, silently wrong for a single-file variable font, which carries
    its weights on the `wght` axis: the 700 hero title, 700 section heads, 500 tab captions and
    800 rank numerals ALL rendered Inter's 400 default instance while web was bold ("weight never
    synthesises" had nothing to synthesize from). The engine now maps CSS semantics onto the
    declared axes in cascade order — font-weight → `wght` clamped; `font-optical-sizing: auto`
    (the CSS default) → `opsz` = point size clamped — with the author's font-variation-settings
    still winning. The registry's hand-pinned `opsz: 17` default is gone (auto owns it, as on
    web). Verified both devices: the flat-foot Inter "2" at 800 in the TOP band is the tell.

57. RESOLVED 2026-08-31 (`despia-framework dev@1c251901`) — **The cover layout's fill fallback
    zeroed an UNSPECIFIED axis** (a same-day regression of §6.48's fix, caught by the genre
    grids): a poster cell sized purely by `width: 100%` + `aspect-ratio: 3/4` probes greedy on
    both axes yet answers the grid's real proposal with (colW, colW·4/3) — the old fallback
    replaced the unspecified height with zero and every genre-grid poster collapsed to a
    text-only row. The fallback now asks the children against the real proposal and fills only
    when they echo infinity. The lesson repeated from §6.43: verify a layout fix against the
    screen that DIDN'T motivate it.

58. RESOLVED 2026-08-31 (`despia-framework dev@7d649625` + `dev@38f94bdd`) — **Two "never
    bridged" rulings fell tonight, both user-visible.** (a) The CSS DISTRIBUTIONS: the tab
    row's `justify-content: space-around` packed left on device while web stretched it edge to
    edge — "spacer territory" was the old ruling, but the distributions are mechanically exact
    in SwiftUI (between = inner spacers; evenly = every slot; around = doubled inner spacers,
    edge:inner 1:2), carried on a `distribute` attr from the post-pass; hstack/vstack moved to
    the privileged tier for per-child rendering. Also unblocks Watch's speed row, AdGate and
    PersonalNav. (b) MARGINS: the bridge always emitted margin*, nothing read them; the new arm
    applies them OUTSIDE every fill (true margin, never padding), and negative `margin-top` is
    the PULL-UNDER — the wide hero's backdrop now runs to the page top behind the transparent
    nav on iPad, the web reference geometry. One lesson with it: a component ROOT's z-index
    cannot escape its instance natively — the MOUNT TAG carries `zIndex` at the one overlap
    site (App.dsx), the honest cross-platform spelling; hoisting instance-root z is a filed
    candidate.

59. RESOLVED 2026-08-31 (`despia-framework dev@37e1c82c`) — **The pixel-parity batch**, five
    engine arms from one review pass, each device-verified against web:
    (a) `position: absolute` + edge insets now lift a child into its parent stack's overlay —
    the paywall ✕ (top:14/right:14) anchored mid-panel in flow before; the whole
    absolutely-positioned badge class renders now. (b) `filter: blur(N)` bridges to the blur
    attr — the locked poster frosts natively. (c) THE SAFE-AREA FACTS:
    `dsx.screen.safeTop/safeBottom/safeLeft/safeRight` on iOS (window insets) AND web (resolved
    env() probe; zero in a browser tab, real in a standalone PWA) — one spelling pads full-bleed
    chrome everywhere, and Watch uses it (root `ignoreSafeArea`, topBar + safeTop, bottomBar +
    safeBottom; the screen-height stage no longer spills the EP pill off-screen). (d) UNIFIED
    ICONS: App.json `icons: "unified"` draws the web's own 24×24 Boxicons paths natively — same
    geometry, same em-box, so glyphs and spacing match web exactly (tab bar, engagement rail,
    chevrons all verified); default stays "platform". (e) image placeholders paint CLEAR
    (web-true) — the 6% white loading/no-source hints read as white boxes over transparent art
    (the coin chip). Template half: the Watch scrubber is now the reference recipe (custom-ux.md
    PlayerScrubber — track/fill/THUMB off one measured box, drag = seek, `<video bind>` ticks
    the fill), and heroArrow declares `alignY="center"` — measured, the chevron sat at the box
    top on BOTH lanes (web iconTop was 0): parity held, the design had never declared the
    vertical.

60. RESOLVED 2026-08-31 (`despia-framework dev@80f6b16c` + `dev@f0c80ef0`) — **The search
    overlay exposed the DESIGN-MODE seam.** Two defects in one screenshot: the cover sheet's
    declared `background="#000000"` parsed and was never applied (content floated on
    systemBackground white), and the custom pill's transparent input wore the LIBRARY-GRADE
    FIELD WELL — secondary-fill capsule plus the 2pt accent focus ring — chrome the author
    never wrote. The cover paints its background now, and `App.json "design": "custom"`
    declares the app its own design system: every system-skin embellishment stands down,
    engine-wide (the per-element sniff cannot always see authorship — the styled arm consumes
    `style` before elements read it). Bonus kill from the same sweep: NSNull interpolated its
    DESCRIPTION — literal "<null>" as ledger text; null renders empty on every lane now. The
    full gap census and execution order live in the framework's
    `OpenSource/Documentation/pixel-parity-program.md`.

61. RESOLVED 2026-08-31 (`despia-framework dev@bff4c16d`) — **`flex: 1` fills natively.** The
    most common web fill spelling was never-bridged (the tag-blind bridge cannot know the
    parent's axis) — the PARENT can: privileged stacks sniff each direct child's raw `flex: 1`
    / `flex-grow: n` and re-render it with a synthetic `grow` on their own main axis. The
    re-render matters: an outer frame expands EMPTY SPACE around a hug-sized box (probed — an
    empty flex spacer rendered invisible at 0pt inside an expanded frame); the synthetic attr
    runs through the child's own styled pipeline so backgrounds and radii widen with the box.
    Through a component boundary the parent sees only the mount tag — `grow` ON THE TAG is the
    documented spelling there (the zIndex-on-mount sibling; SearchOverlay's pill mount carries
    it). Measured: the phone home's search pill spans logo → avatar, the web row exactly.

62. RESOLVED 2026-08-31 (`despia-framework dev@1066c5c5`) — **The five-truth batch: the day the
    boot data pipeline turned out to be the real "rendering" bug.** (a) THE ABSOLUTE PLANE
    DETACHES AT THE NODE: overlays re-attach AFTER every styled arm, so a badge anchors the
    host's FINAL box and a host `radius` can no longer clip it — the VIP dot first floated off
    the gem's content hug, then vanished entirely under the corner clip; CSS never clips
    absolutely-positioned children under default overflow. The builder-side partition is gone.
    (b) CSS CROSS-AXIS STRETCH is the unsteered default (vstack stretches child width; hstack
    anchors flex-start) — Profile's Viewer/GoVIP/wallet/ledger cards fill the shell like web;
    hstack deliberately does NOT height-stretch (a greedy frame under a scroll's unbounded
    proposal inflated the row — the wallet card clipped mid-pill; CSS stretch fills the
    CONTENT-FORMED row height, filed open). (c) SYNTHETIC GROW IS A DEFAULT THAT UNIONS:
    `growSynthetic` folds in only against the child's own resolved grow — a raw-sniffed
    synthetic `grow` attr had clobbered the hero column's computed `height:100%` and pinned
    the copy to the band top under the iPad nav while the static spelling centered (probed
    both ways in one screen). (d) STORED NULL IS NULL: `truthy(NSNull)` is false and a
    `return null` initializer seeds NSNull, never "" — the search overlay's `results` was ""
    at mount, `results != null` took the wrong branch, and the overlay opened onto its
    zero-hits message instead of the Hot list. (e) API CLAIMS HAND OFF: SwiftUI replaces view
    identities new-before-old, and the outgoing identity's dispose was cancelling all three
    boot requests ~1.4s in after the incoming claim had been refused — no owner left to
    refire, every screen on the offline demo seed forever, WHILE ALL FIVE STATIC GATES WERE
    GREEN. Claims are refcounted now; the block survives the churn. Found by NSLog flight
    recorder (fire/apply/dispose), not by reading source. Template half: `homeLanded` retires
    the offline-demo chip the moment a real payload lands (the Article-7 chip must never lie),
    and the 12h dev-session tokens are re-minted with `npm run session` when /viewer/* starts
    answering 401 — the wallet numbers matching the demo seed's 320/45 disguised the outage.

63. RESOLVED 2026-08-31 (`despia-framework dev@04a42576`) — **The drawer complaint that turned
    out to be four engine laws and one flight recorder.** The user filed three defects: the
    episode grid "not 1:1 at all", the comments drawer padding, and a cheap-looking seek bar.
    Fixing them surfaced a chain no static gate could see. (a) GRID ITEMS STRETCH TO THEIR
    TRACK — CSS `justify-items: stretch` — via a `bound(adding:)` door handing every row
    `growSynthetic width`; an explicit width retires it per the definite-size rule. The
    tiles had been hugging their numerals as ~30pt circles. (b) `aspect-ratio` IS
    AXIS-DRIVEN: `.aspectRatio(.fit)` collapses to the content hug inside ideal-height rows,
    so a grown-width element now sizes h = w/ratio through a two-line Layout, and aspect +
    grow-width fills the height so fills and radius paint the whole box. (c) THE ABSOLUTE
    PLANE completed four rules in one pass: inset VALUES interpolate (`top: {{ safeTop +
    14 }}px` — the paywall ✕ now clears the status bar), unitless zero parses (the corner
    tag anchored top-LEADING because the parser demanded "px"), overlays SHRINK-TO-FIT like
    CSS absolutes ("VIP" had wrapped to "VI/V/…" down a collapsed cell), and an explicit
    `overflow: hidden` clips overlays to the radius box — the web corner-tab crop — while
    default overflow keeps the poke-past-the-corner law. (d) The comments empty state
    centers because `text-align` on a width-filling text now anchors its frame (a hugging
    single line ignores multilineTextAlignment). (e) The seek bar publishes every tick that
    moved — the old 2% gate advanced a 67s episode's fill once every ~1.3s in a visible jump.
    THE TWO SYSTEMIC DISEASES the flight recorder caught while everything above was being
    verified: sheets presented from a store-computed Binding never completed while a playing
    video published 4 Hz (presentation now rides identity-stable local @State, synced both
    ways), and a PARAM-ONLY `route.replace` re-minted the frame — a full player remount plus
    a duplicate wallet/favs/thread api wave on EVERY episode advance, with a presented
    drawer dismissed by its own screen's teardown (the router now updates the frame record
    and surface vars IN PLACE when the new path resolves to the same component — the exact
    history.replaceState semantic; frame ids stopped incrementing per episode). Lesson for
    the ledger: the user's screenshots were both taken on the LOCKED page — the one page
    where nothing ticks — which is why the sheets looked healthy while every unlocked page
    had them dead. Verify interactive chrome ON a playing page, not the quiet one.

64. RESOLVED 2026-08-31 (`despia-framework dev@ef5e4eef`) — **The acceptance pass: align is
    per-tag vocabulary, glass frosts for real, sheets fade their scroll edge.** Three user
    filings, four engine truths. (a) THE ALIGN OVERLOAD, both directions: `align` on a row
    is the VERTICAL word, so CSS `align-items` now lands on `align` for every stack — the
    old geometric-alignY carrier left rows unsteered, and once the unsteered row default
    became flex-start, the Watch top bar's 44pt chevron rode low beside its 20pt title.
    Then the mirror bug: flexFrame read a row's align="center" as a HORIZONTAL anchor and
    centered the wide Home's section heads page-wide; and `justify-content: flex-end` had
    been riding the same key, so suppressing it dropped the hero arrows to the leading
    edge. Rows now keep justify on its own resolved key, flexFrame anchors the main axis
    from it, and align steers only the element's cross axis. One key, three collisions,
    all measured. (b) `backdrop-filter: blur(N)` FROSTS FOR REAL — the nearest system
    material samples everything painted behind the element, art AND chrome: the paywall
    scrim now frosts the rail icons beneath it exactly like web. The paused-animator
    arbitrary-radius trick renders NO blur on current iOS (measured: sharp icons under a
    declared blur(22px)); the material rung is a NAMED approximation and exact-radius
    stays on the program's open list. (c) THE SCROLL-EDGE FADE ships with the sheet on
    BOTH lanes, like the grabber: content dissolves into the sheet surface instead of
    guillotining at the bottom corner radius — iOS overlays a 34pt gradient of the sheet's
    own background, the web renderer appends the identical fade tinted from the panel's
    resolved surface. Zero app markup. (d) The transparent-image report could not be
    reproduced on this build: coin, chest and poster twins all render alpha-true (the
    morning's clear-placeholder arm covered the loading hint); if a surface still paints
    white, it needs a screen name. Verification note for the ledger: the media files were
    temporarily looped to 300s to hold the player still — restored to the shipped 10s
    demos after the pass.

65. RESOLVED 2026-08-31 (`despia-framework dev@289f2c24`) — **Every native sheet was ~16px
    tighter than its web twin, on all four edges.** The web sheet's own content wrapper
    (`.dsx-sheet-content`) pads the slot 12 top / 16 sides / 16 bottom — measured live: the
    comments title sits 32 from the panel edge on web (wrapper 16 + the app's cHead 16),
    52 below the panel top. The native sheet rendered the slot bare, so the same title sat
    at 16/24 and every drawer read subtly cramped ("padding still off on native sheets").
    The native slot now wraps in the same EdgeInsets on every mode — drawer, card, cover,
    and the chrome variants, with the bar OUTSIDE the wrapper exactly like the web header —
    and the content-detent measuring pass sees the padded slot, so fit-content sheets hug
    the same box web lays out. The lesson: a renderer's SYSTEM CHROME (sheet wrappers,
    grabbers, header bars) is part of the parity contract too — measuring only the app's
    own markup missed a constant offset the eye reads instantly.

66. RESOLVED 2026-08-31 (`despia-framework dev@6da4c7f7`) — **The scrubber saga: the web depth
    stack had no placement area, and `anim=` never animated a change on any lane.** The
    "seekbar fully broken on web" report measured out to two web-engine holes: `.dsx-zstack`
    laid its layers in an implicit max-content column centered by `justify-content`, so no
    child could reach an edge whatever its alignment said — and a grown EMPTY layer was 0px
    wide, so the track literally did not exist (fill + thumb floated mid-bar over nothing).
    The grid is one full-size cell now (`grid-template: 100% / 100%`), `align=` speaks the
    native 9-anchor vocabulary, and `data-dsx-grow` children cover their axis — the
    CoverZStackLayout law, ported. Then the jumps: custom-ux.md §3 has always promised that
    `anim=` "animates the change" of the bindable transforms, and NEITHER renderer implemented
    it — anim only eased visibility. Native now attaches a value-keyed animation over
    width/height/offset/scale/rotation/opacity; web arms a persistent CSS transition that
    visibility's temporary in/out restores afterwards. `anim`/`animDuration` interpolate and
    `none` retires the tween, so the scrubber's gate — `anim="{{ scrubbing ? 'none' :
    'linear' }}"` — tracks the finger instantly while playback GLIDES linearly between the
    player's 4 Hz ticks. Measured both lanes: web thumb 299.7 → 304.3 → 308.6 across 240ms,
    native fill-end 1100 → 1157 → 1184 across ~150ms — continuous, not stepped. Template
    half: the Watch scrubber carries the tween + the `scrubbing` two-way (the reference
    recipe in custom-ux.md now shows the glide spelling). One unit lesson for the ledger:
    `animDuration` is SECONDS (the catalog says so) — "250" produced a four-minute tween
    on web before the probe caught it.

67. RESOLVED 2026-08-31 (`despia-framework dev@96563323` + template) — **The player interaction
    batch: tap-to-pause, the VIP entitlement hole, the speed rail, and the sheet's scroll-end
    contract.** (a) TAP-TO-PAUSE, the category standard: any stage tap toggles playback and the
    paused stage wears the big center glyph — one zstack `on:tap` plus a badge on a GREEDY
    centering layer, verified on web (video.paused flips, badge appears, second tap resumes)
    and device. The badge itself re-taught the cover law the hard way: a bare 84pt child SIZED
    the depth stack and the whole page collapsed to an 84pt strip — a width/height-100%
    wrapper is a covering layer and cannot (the recipe now spells it). The circle is built by
    construction (34pt glyph + 25pt padding), because main-axis centring still has no class
    twin (#238). (b) THE VIP HOLE: epLocked, gridLocked and onEnded's nextLocked all ignored
    `wallet.data.vip` — a paying subscriber hit the coin paywall on every non-free episode and
    autoplay stopped at EP.4. All three gates now honor VIP, so VIP rides straight through and
    auto-unlock keeps spending only when the viewer opted in. (c) THE SPEED SEGMENT IS A RAIL:
    seven pills never fit a 390 sheet (measured: 3.0x ran 27px past the viewport on web) — the
    house max-content track inside a horizontal scroll, verified scrollable with 3.0x
    reachable. (d) THE SCROLL-END CONTRACT, both lanes: the sheet edge fade grows to 56px with
    eased stops (web: color-mix of the panel's own surface; iOS: the same ramp), and the
    content wrapper's bottom inset carries the fade height — fully-scrolled content RESTS
    above the fade (measured: the drawer's last row clears it by 28px). PiP was already real
    on both lanes (AVPictureInPictureController + the menu toggle) — verified, not rebuilt.

68. RESOLVED 2026-08-31 (`despia-framework dev@ad026517`) — **"Web is not centered, and the
    seek bar is not positioned correctly" — two CSS-cascade defects, both parity breaks the
    native lane had already closed.** (a) THE DEPTH STACK LOST ITS OWN DEFAULTS: `.dsx-zstack`
    and the generic `.dsx-stack { align-items: start }` carry EQUAL specificity, so the winner
    was emission order — and a page carries two copies of the element sheet (the SSR critical
    inline + the client bundle), which interleaves them. Measured: `align-items` computed
    `start` on the scrubber's depth stack, so the 14pt thumb top-aligned with its 4pt track
    instead of centering on it. The depth-stack rules are TWO-CLASS now
    (`.dsx-stack.dsx-zstack`) so cascade order cannot decide them, and a grown layer takes
    `auto` on its other axis — a zstack also carries `.dsx-stack`, so the generic
    `> [data-dsx-grow]` rule stretched layers on BOTH axes and a stretch with a definite cross
    size behaves as flex-start (that is what pinned the `grow="width"` track to the top).
    After: track 362 full-span, fill and thumb all centered at cy 774.5. (b) BLOCK-STRETCH
    DEFEATED AUTHORED CENTERING: the sheet's "a form is a block" allowlist sets
    `align-self: stretch` on a nested column, and in CSS a child's align-self always beats a
    parent's align-items — so the pause badge rendered 390pt wide inside a column that
    declares `align-items: center`, while native hugged it to 84pt. The declaration is
    invisible to any runtime selector (the compiler folds inline CSS into an ATOMIC CLASS —
    the element carried only `data-dsx=c364`), so the marker had to be COMPILED: `css.ts` sets
    `__steers` when the fold contains `align-items`, SSR and mount stamp `data-dsx-steers`
    (the `__row` precedent), and the allowlist excludes those parents. After: badge 84×84
    centered, with Profile's cards and ledger still filling their shell. THE LESSON: when two
    sheets ship the same rules, equal specificity is not a tie — it is a coin flip decided by
    bundling; a renderer's own element defaults must outrank its generic ones by construction.

69. RESOLVED 2026-08-31 (`despia-framework dev@2614b750`) — **"Cutoff, too much gap, what is
    this?" — the scroll-end clearance was three bugs wearing one number.** Measured under the
    episode drawer's last row: **118pt** of dead space on iOS, 102px on web. It was the
    author's own `epGridWrap paddingBottom="28"`, PLUS the 40pt "fade clearance" §6.67 added
    with the edge fade, PLUS the home-indicator safe area — three layers solving one problem
    at the same box bottom. Two deeper findings came out of the inventory: (a) THE CLEARANCE
    SAT OUTSIDE THE SCROLLER on both lanes — native pads the slot AROUND the author's
    `<scroll>`, and web's `.dsx-sheet-content` IS the scroll viewport, so the padding shrank
    the viewport instead of travelling with the content. It could never be scroll clearance;
    it was a permanent band, which is exactly why it read as flat unscrollable colour. (b)
    NATIVE DOUBLE-COUNTED THE SAFE AREA: web folds base and inset into one `max()`, native
    applied a flat 56 and let the OS add 34 on top — 16pt taller than its web twin from
    identical markup. THE FIX IS THE AFFORDANCE DONE PROPERLY: a fade that means "there is
    more below" must not paint when there is nothing below, and then it needs no reserved
    space at all, because overlapping the content it hints at is the whole point. Web toggles
    it from the sheet viewport's own scroll state (rAF-coalesced listener + a ResizeObserver
    on the viewport AND its inner box, because sheet rows land asynchronously); iOS publishes
    ONE Bool up the tree from `<scroll>` (`DSXScrollEdgeKey`) — a Bool, never the offset, so
    the reader re-renders twice per scroll session instead of once per frame — with an
    environment gate arming the probe only inside a sheet, and the fade's state in its own
    view rather than on `SheetAnchor` (whose presentation churn once killed every sheet on
    this screen, §6.62). Template: `epGridWrap paddingBottom` 28 → 8, since the sheet supplies
    the inset. Measured after: web gap 84px → **24px**, fade opacity 0 at the end and 1
    mid-scroll; the non-scrolling comments sheet shows no fade and no void on either lane;
    the content-detent menu still hugs. Named gap: only `<scroll>` publishes on iOS, so a
    sheet whose scrolling is owned by a `<list>` or a scrolling `<grid>` will not arm the
    native fade yet. THE LESSON: reserving space for a decoration is a smell — if the
    decoration knows when it matters, it needs no reservation at all.

70. RESOLVED 2026-08-31 (`despia-framework dev@759a4901`) — **The web lane never knew about
    `design: "custom"`, and the sheet fade was anchored 34pt too high.** (a) THE DESIGN MODE
    IS A ROOT-PLAN KEY THE WEB BUILD SIMPLY DID NOT READ: `config.ts` took only `consts` from
    App.json, so a custom-design app got the library input well on web while native (which
    has honoured `AppManifest.designMode` since §6.60) painted exactly the authored styles.
    Measured: the comment and search fields wore the web well — its recessed fill, radius and
    0.5px inset ring — INSIDE the pill the author drew, two nested wells deep. The key now
    travels config → build (both the boot call and the baked document shell) → `boot.ts`
    stamping `data-dsx-design` on the root → `page-render.ts` stamping the SSR `<html>` so
    the first paint matches hydration → `theme.ts` standing the field chrome down. The focus
    RING stays: a custom design owns the resting look, never the accessibility affordance.
    (b) THE FADE ANCHORED THE SAFE-INSET BOTTOM: an overlay inside a sheet presentation
    aligns to the inset bounds and `.ignoresSafeArea` does NOT move that anchor (verified
    twice on device — the band covered 784–840pt while un-faded rows stayed bright to 874, so
    the home-indicator strip showed hard-cut content under a fade that had already finished).
    Negative bottom padding is the fix — the sanctioned pull the margin arm already uses for
    the hero — so the fade's bottom edge lands where web pins it. Template half: the drawer's
    tab underline spans its LABEL (`grow="width"`, was a guessed `width="26"`), and the search
    overlay's meta pills are one line (`lineLimit` + the nowrap web twin) so a two-word genre
    like "Time Travel" stops wrapping inside its own capsule.

71. RESOLVED 2026-08-31 (`despia-framework dev@877184be`) — **The tab rule and the fade, both
    measured twice before they were right.** (a) THE UNDERLINE IS A MEASURED WIDTH: a guessed
    `width="26"` was too short, and `grow="width"` was too long for a reason worth writing
    down — a greedy child makes its PARENT greedy, so the tab column filled the row and the
    rule ran past the word. `measure="dsx.variable.tabEpBox"` on the label plus
    `width="{{ box.width }}"` on the rule is the only spelling that tracks the label on every
    renderer and at every type size (custom-ux.md §2). Verified web: rule 69px = label 69px.
    (b) THE FADE ENDS WHERE CONTENT ENDS, and iOS was paying the home-indicator inset TWICE
    in the opposite direction from §6.69: an iOS sheet is NOT edge-to-edge — the presentation
    already floats the panel above the indicator — so `max(16, safeBottom)` pushed content
    ~42pt up from the panel's own bottom edge, and a fade anchored to the PANEL painted its
    entire ramp over empty surface while the last row was clipped hard above it. The bottom
    inset is a flat 16 on iOS (web keeps `max(base, env())` because its panel DOES reach the
    screen edge — same intent, each lane paying once), and the fade aligns to the content
    edge. (c) THE RAMP WAS AN ERASER: 56pt closing at 92% swallowed a whole tile under a flat
    band; 36pt closing only at the very edge dissolves the last few points and keeps the row
    legible. Both lanes carry identical stops and height. THE LESSON: "safe area" is not one
    number to add everywhere — it is a question of WHICH BOX owns the edge, and the answer
    differs per lane even when the intent is identical.

72. RESOLVED 2026-08-31 (`despia-framework dev@325547bd`) — **"It works on web, why not iOS?"
    — because web's padding is INSIDE the scroller and native's was around it.** The drawer
    still showed a half-faded row cut by a hairline with flat surface beneath: that hairline
    was the SCROLL VIEWPORT'S CLIP EDGE. Web's `.dsx-sheet-content` IS the scroller, so its
    bottom padding travels with the content — a row scrolls to the panel's bottom edge and
    dissolves under the fade there. Native padded the slot AROUND the author's `<scroll>`, so
    the viewport stopped short, content was clipped at that line, and the ramp painted the
    inset's empty surface below it. The bottom inset is now a `.safeAreaInset` on the slot —
    the SwiftUI spelling of "inset the scroll's CONTENT, not its viewport" — so the viewport
    reaches the panel edge (the ramp always falls on real rows) while the last row still
    rests 16pt clear at the end. Third and final correction to one 36pt gradient, and the
    through-line of all three is the same sentence: A PADDING OUTSIDE A SCROLLER IS NOT
    SCROLL SPACE, it is a dead band the content can never reach. Also shipped: REVIEW R9,
    the mechanical half of the safe-area contract — a safe-area fact ADDED to a constant is
    flagged (fold it with `max(base, fact)` or let the frame's inset stand), inert in a
    source that opted out with `ignoreSafeArea`/`fullBleed`, where paying the fact back plus
    a gap IS the documented spelling. Verified against this template: the full-bleed paywall
    close button is exactly that exempt case and is correctly not flagged, and the gate stays
    at 0 failures.

73. RESOLVED 2026-08-31 (`despia-framework dev@eb15c7a3`) — **"Move the fade down, ignore the
    safe area for IT only" — and the SwiftUI law that took four measured passes to see:
    `.ignoresSafeArea` only expands a view that FILLS.** A fixed-height, bottom-aligned
    overlay keeps its container's safe-inset anchor no matter what is applied to it. Each
    attempt failed differently, and each one was measured on device rather than eyeballed:
    anchored 36pt left badges at FULL brightness (163) from 834pt to the panel's edge at 866;
    growing the box to 36+inset only extended it UPWARD from the same anchor, so the strip
    stayed bright; pulling it with negative padding slid the entire ramp down and left the
    rows above it crisp. The shape that works is a FULL-SIZE VStack that ignores the bottom
    container inset with the gradient at ITS bottom — the layer expands to the panel's real
    bounds, so the ramp finishes exactly where the web twin's `bottom: 0` does. Measured
    after: the trailing badges dissolve 163 → ~124 across the strip instead of showing
    through it, and the rows above stay crisp. The content's own scroll-content inset (§6.72)
    is untouched: content pays the indicator once, only the DECORATION ignores it — which is
    exactly what was asked for. THE LESSON, now three ledger entries deep on one 36pt
    gradient: on iOS, whether a view can paint into the safe area is decided by whether it
    FILLS, not by what modifier you attach to it — and a pixel probe answers that question in
    one build where reasoning about it cost four.

74. RESOLVED 2026-08-31 (`despia-framework dev@1404d9c3`) — **The fade's curve, settled: eight
    eased stops over 64pt, closed before the edge.** Two opposite complaints landed back to
    back and the answer was neither extreme. FOUR stops ending at the layer's last pixel left
    RESIDUE — trailing badges still readable at the panel's bottom, because the fully-opaque
    stop sat where there was nothing left to cover. Closing that same ramp EARLY, over 36pt,
    killed the residue and read as abrupt: a dissolve you can watch start. The ramp is 64pt
    of content now, eased across eight stops (0 · .04 · .13 · .28 · .48 · .70 · .90 · 1) so
    no band is perceptible, reaching full opacity at the top of the indicator strip and
    holding solid through it. iOS scales the stop LOCATIONS by the strip it must also cover
    (`rampEnd`); web spans its 64px straight to the panel edge it already reaches — one
    curve, two geometries. Measured through the ramp on device: 125 → 92 → (row gap) → 94 →
    25 in even steps, then pure surface (20) to the bottom edge with ZERO content pixels in
    the centre columns. The measurement lesson, after four passes on this gradient: probe the
    CENTRE columns only — the panel's rounded corners expose the video underneath, and that
    video reads as "residue" in any full-width sample. Two of the earlier "still bleeding"
    readings were the corners, not the fade.

75. RESOLVED 2026-08-31 (`despia-framework dev@c22d5a07`) — **The scrubber's two truths, and
    the fade's last one.** (a) THE PIN RIDES THE FILL. Two tweens can never stay welded: the
    fill animates `width` (layout, main thread) while an `offsetX` thumb animates `transform`
    (compositor), and the two progress at different rates inside the same tween — measured on
    web, the fill edge and the pin centre disagreed by up to **11px in a sawtooth**, which is
    the "unlinked, slight stutter" read. The pin is an absolute child of the fill now, so ONE
    animated property drives both and it cannot drift from an edge it is pinned to (measured
    after: disagreement exactly 0 on every sample). Neither is rounded any more — rounding
    them separately was worth a pixel of disagreement on its own — and the tween runs 320ms
    against the player's 250ms tick, because a tween that finishes exactly as the next value
    lands has to wait, and that wait IS the stutter. (b) A DEPTH STACK THAT DECLARES `grow`
    TAKES THE PROPOSED BOX: CoverZStackLayout sized from non-greedy children even when the
    element itself said fill, so the outer frame widened the VIEW while the layout still
    placed layers in the content-sized box. The scrubber's 28% track therefore spanned only
    the white fill and was invisible beneath it — no 4pt band anywhere right of the pin —
    while web, where a block-level stack gets the row for free, painted the rail. After:
    track 162 against video 118, the full rail. (c) The fade's solid tail is gone: holding
    the indicator strip opaque was a black bar you could see, so the eased ramp spans the
    whole layer and closes exactly on the panel's bottom edge. THE LESSON: "it works on web"
    usually means the web lane got a box for free that native has to be told about — a
    block-level element, a scroller's own padding, a stack that fills its row.

76. RESOLVED 2026-08-31 (`despia-framework dev@5149665f`) — **The player becomes the category's
    real shape, and three missing CSS primitives fall out of building it.** THE LAYOUT: the
    masters are 16:9 and the stage is 9:16, so the clip is WIDTH 100% at its own ratio pinned
    to the TOP, and the black below it carries the chrome — seek directly under the picture,
    the episode selector under that, the engagement rail beneath. Cover-cropping a landscape
    master into a portrait stage had made every frame a zoomed-in detail with no composition
    left. THE THREE PRIMITIVES, each found because the app tried to say something CSS says
    plainly: (a) `scaleX`/`scaleY` + `transformOrigin` — the uniform `scale` cannot say "fill
    this bar to 62%", so the progress fill animated `width` (layout, main thread) while its
    pin animated `transform` (compositor): two pipelines, two rates, an 11px sawtooth of
    drift, and parenting the pin to the fill welded them but left the motion steppy because
    layout animation is what it is. With an axis scale both members are transforms — one
    pipeline, the GPU, disagreement exactly 0 and the fill interpolating sub-pixel. (b)
    `overflow: hidden` → `.clipped()`, the program's own P0 row: only `radius` clipped
    natively, so the key art's 3:4 ratio stood 536pt tall inside a 226pt band and spilled a
    third of a screen of poster below the picture. (c) A depth stack that declares `grow`
    takes the proposed box (§6.75) turned out to be load-bearing here too: once the clip
    became a band, the PAGE zstack sized to it and the pager showed three pages at once until
    the page said `grow="true"`. Also: the sheet's edge fade no longer animates its FIRST
    arrival — the edge state resolves while the sheet is still sliding up, so the fade
    animated in mid-flight and read as a flash on every open; it is held until the
    presentation settles and adopted without animation. THE LESSON: three engine gaps in one
    screen, and every one of them surfaced as "the app looks wrong", never as an error — the
    catalog gate is what turned the third into a conversation instead of a silent drop.

77. RESOLVED 2026-08-31 (`despia-framework dev@7eb4fc6b`) — **"width 100% does not render on
    native" — the third member of one family.** The playback-speed sheet's option rows shrank
    to the width of their own labels on iOS while the web twin spanned the card, so the
    selected pill and its tap target were a third of the size they should be. Cause: a
    `<list>` row is a block child of a column on web and stretches for free; native hugged.
    `<list>` now hands its rows the same `growSynthetic` default `<grid>` got in §6.67,
    through the same `bound(adding:)` door — a DEFAULT, so a row declaring its own width or
    grow keeps it, and horizontal rails are untouched because there the row's intrinsic width
    IS the layout. Three members landed this session, all the same shape: grid cells stretch
    to their track (§6.67), column children stretch on the cross axis (§6.62), list rows fill
    their list (here). Template half: the menu sheet dropped its own 12pt side padding (the
    sheet already insets 16, and 28 read narrow) and gained 8pt on top so the header clears
    the grabber. THE PATTERN WORTH NAMING: every one of these was the web lane being handed a
    box by the document model that native had to be told about — when an author says "it
    works on web", that is usually the sentence underneath it.

78. RESOLVED 2026-08-31 (`despia-framework dev@686acf39`) — **The player takes the reference
    letterbox, and a pager page learns to grant its box.** The category (ReelShort, Shortical,
    FlickReels) CENTRES a 16:9 master in a black stage and pins the chrome to the SCREEN's
    edges — the clip floats, the transport does not follow it. Top-aligning the clip with the
    controls tucked beneath it (the shape §6.76 first built) reads as a web page, not a
    player. The engine half: on web the pager page is a BLOCK, so a child's flex `grow` had
    nothing to grow inside — measured, the page box stood 844 tall while its `grow="true"`
    root hugged its 219pt clip band and the picture sat at the top, where native (whose pager
    proposes the page box to its child) centred it. Same markup, two lanes, two layouts. The
    page now grants its box to a child that asked to fill it, which is the CSS spelling of
    the proposal native already makes. Both lanes verified centred against the same source.

79. RESOLVED 2026-08-31 (`despia-framework dev@ca2b0c78`) — **The native value-tween was
    never firing, because its trigger key was the AUTHORED string.** `anim=` builds the
    animation and attaches it with `.animation(tween, value: motionKey)`, where `motionKey`
    is documented as "the RESOLVED values" — but it was assembled straight out of `attrs`,
    which carries the authored attribute, and every animated value in practice is a hole
    (`scaleX="{{ pos }}"`). The key was therefore the literal `{{ dsx.variable.pos }}`,
    constant for the life of the screen: SwiftUI got a correct 0.32s linear animation with a
    value that said nothing had changed, and a 4Hz binding stepped exactly as though no
    `anim=` had been declared. `declaredAnimation` two lines below already resolved its own
    `anim`/`animDuration` holes — the same door, half-open. Web never had the bug because a
    CSS transition is declared once and the browser applies it to the COMPUTED value.
    MEASURED, iPhone 17 Pro Release vs the same markup on web, frame-exact off a 60fps
    capture: before, the seek thumb was frozen 54% of the wall clock and teleported between
    ticks (median 1464 px/s); after, frozen 5%, gliding at a median 90 px/s. The web lane was
    run through the SAME pixel profiler as a control (0 snaps, 0 stalls, and quantization
    alone accounts for its jitter band) so the instrument could not be what was being read.

    KNOWN RESIDUAL, named rather than papered over: about one frame per 250ms tick still
    carries an outsized share of the step (~30% of travel). It is NOT the curve, the
    duration, the attachment point, or the outer visibility animation — all four were
    A/B'd on device by env-gated lanes in one build and none moved the number. It tracks
    RENDER LATENCY at the tick: SwiftUI starts the animation's clock at commit, and the
    first frame paints after the screen has re-evaluated, by which time the curve has already
    advanced — Debug (a slower re-evaluation) loses 48% of each step this way, Release ~18–30%.
    The deep cause is that a position tick invalidates the whole screen, and `attrs` has no
    per-render result cache. Fixing that is a scoped performance item, not a motion item.

80. RESOLVED 2026-09-01 (`despia-framework dev@f1d8b588`) — **`attrs` is memoised per
    render pass, and the transport's residual is now MEASURED rather than inferred.** §6.79
    named "render latency at the tick" as the residual's cause from the outside; this pass
    instrumented it. On the Watch screen, one 4Hz position tick re-renders **237 nodes** (947
    `body` evaluations per second) for ~21ms of MAIN-THREAD work — and `attrs`, a computed
    property whose own comment admitted it "runs many times per render", was re-running the
    full cascade (dict merges, a class Set, JSE interpolation of `class`/`style`, two sheet
    lookups) **30 times per node per body**. It is now memoised in a reference box scoped to
    exactly one render (`begin()` at the top of `body`), which is what makes it safe: the
    cascade interpolates and may read ANY store, global or cookie value, so no revision token
    could be trusted to cover it, but a memo that cannot outlive its render needs no such
    proof. Measured live: 28,038 cache hits against 947 computes, `attrs` down to 4ms/s.
    Transport profile went from 5% of the wall clock frozen to 0–3%.

    WHAT REMAINS, and the honest shape of it: `StackStyle.apply` is now the dominant cost
    (55ms/s of the 86ms/s body time), and the real defect is architectural — every
    `StackNodeView` holds `@ObservedObject store`, so ONE variable ticking re-renders all 237
    nodes whether or not they read it. Until that is fine-grained, ~20–30% of each step still
    arrives in a single frame, because SwiftUI starts an animation's clock at commit while the
    first frame paints after the re-render. Web has the same 4Hz tick and no such artifact:
    a CSS transition is compositor-driven and immune to main-thread work.

    TRIED AND REVERTED, recorded so it is not re-attempted blind: expressing playback as ONE
    long ramp (target the END, `animDuration` = the time actually left) so nothing restarts
    4×/s. It is the right idea and the category's own technique, and it needs ARMING — with
    no previous value at mount, `scaleX="1"` paints a FULL bar on frame one (measured: the
    fill sat at 100% from the first frame of a fresh launch). Arming it needs a latch that is
    provably set after the transport has painted the true position, plus disarm on episode
    change and on non-scrub seeks. Worth doing deliberately; not worth half-shipping.

81. LANGUAGE LAW 2026-09-01 — **JSE `+` is total arithmetic: `'' + 4` is the NUMBER 4.** The
    scrub clock rendered "0:3" for three seconds on BOTH lanes because the idiomatic JS
    zero-pad (`'' + sec`, then `'0' + ss`) never produced a string to concatenate onto. Grow
    the string from an anchor that cannot parse as a number (`m + ':'`). Added to AGENTS.md.

82. MEASURED 2026-09-01 — **Three numbers in AGENTS.md were wrong, and one claim was
    overstated.** A live re-measure of the category (ReelShort, ShortMax, GoodShort, DramaBox
    web players; 13 App Store listings; iPad screenshots) against what this template records:
      · the reference right panel is `30% / max 480 / min 320`, not a fixed **416**;
      · its collapse breakpoint is **1024**, not 1120;
      · range pills chunk at **50**, not 30 — the 30 in Watch.dsx matched no reference and
        was never sourced. Fixed.
      · episode cells are **radius 8** on both references, and AGENTS.md had said 8 since the
        first pass — the CODE had drifted to 11 against the project's own measurement. Fixed.
    And the overstatement: "every reference player puts the episode grid in a persistent 416px
    right panel" is true of the WEB players and false of tablets — ReelShort's and DramaWave's
    iPad builds are the phone player stretched into a 4:3 frame. Our two-column tablet lane
    stays, because it is better than what the category ships, but it is our choice and not
    something the category authorises.

    NOT COPIED, deliberately. The category never labels the free/paid boundary — the reader
    infers it from where the padlocks begin. We print "EP 1–N Free". That stays: a paywall the
    viewer can see coming is the honest version, and this template is training data.

    NOT A CONVENTION, worth knowing before anyone "fixes" it: comments do not exist in this
    category. ReelShort's, DramaBox's and GoodShort's players have no comment affordance at
    all (tested against the rendered DOM of every surface, and against the action rails in
    their store screenshots); the only instance found anywhere is DramaWave's danmaku overlay.
    Our comment sheet puts us AHEAD of the reference, not level with it. The rail the category
    actually ships is Bookmark (count) · Like (count) · Share (no count) · More — with SAVE
    outranking likes, and both counts scoped to the SHOW, not the episode.

    Two assumptions that turned out false and should stop being repeated: offline download is
    NOT rare — five apps advertise it in first-party store copy (ShortMax, NetShort, DramaWave,
    MoboReels, GoodShort) and it is the two market leaders that are silent; and no app in the
    set ships a TV app or casting, with DramaBox actively refusing to cast citing copyright.


82. UPSTREAM ASK 2026-09-01 — **a `<server>` action has no crypto seam, so the declared lane
    cannot mint a signed URL.** `actions.ts moduleTable` binds exactly four heads: `data`,
    `queue`, `secret` and declared packages. There is no HMAC, no digest, no signature — so
    the one thing every media paywall in the category does, `playSource` cannot do: return
    `https://cdn/…?Expires=…&Signature=…` and let the edge verify it with no round trip.
    The kernel already HAS the vocabulary (`kernel/src/crypto-core.ts` carries the digest and
    MAC tables, and `CRYPTO_MAC_DIGESTS` names sha256/384/512), it is simply not bound on the
    server side. ASK: `dsx.module.crypto.hmac({ digest, key, message })` and
    `dsx.module.crypto.digest(...)` in the server module table, with the key read through the
    existing `<secret>` seam so a body still cannot name a secret it did not declare.
    WORKED AROUND LOUDLY, not silently: the template mints a `playticket` ROW instead. A
    `gen_random_uuid()` id is the same 122 bits of unguessability as a signature and the row
    carries its own expiry — it just costs a database lookup per media request, which a CDN
    signature does not. `unique (owner_id, episode)` keeps the table the size of the unlock
    table rather than growing once per play. The whole trade is written in place at the
    entity (server/wallet.dsx) and at the gate (scripts/serve.mjs), with the three real
    production shapes named (CloudFront signed URLs, Cloudflare Stream tokens, Mux signed
    playback JWTs). It dies the day the seam lands.

83. UPSTREAM ASK 2026-09-01 — **`<index>` can express neither UNIQUE nor COMPOSITE, and
    every once-only rule in a real backend needs both.** The grammar is one attribute
    (`server-document.ts` line 34: `index: ["on"]`), the emitter writes
    `create index if not exists`, and `on="a b"` produces two SEPARATE single-column indexes
    rather than one composite. So a declared backend can say "index this column" and cannot
    say the only thing that actually enforces a business rule.
    THIS IS NOT COSMETIC. A declared action has no transaction seam (§6.38 — postgres.ts sets
    the caller identity per STATEMENT), so every "once per day", "once per episode", "once per
    order" guard is a read-then-write that two concurrent requests both pass. Measured in this
    template before the fix: two simultaneous `/rewards/checkin` calls both granted; two
    simultaneous `/wallet/unlock` calls both debited and the viewer paid twice for one
    episode. Application code cannot fix it. Only a unique index can.
    ASK: `<index unique="true" on="owner_id day"/>`, composite (one index from the whole
    `on` list), plus a `where=` predicate for the partial case — two of the nine constraints
    this template needs are partial (`dsx_order (intent) where intent <> ''`, because the
    order row is now written before the Stripe call; and `dsx_ledger (owner_id, kind, source,
    ref) where source in ('pack','vip')`, because only the payment grants must be
    exactly-once). `owner_id` must be nameable even though it is emitter-generated, since
    every owner-scoped constraint is scoped by it.
    BRIDGED IN PLACE: `server/policies.local.sql`, beside the comment-policy addendum, with
    the same "dies when upstream lands" labelling — it is already the sanctioned place for
    app-level DDL the generator cannot emit, and already re-runnable. Nine constraints, each
    with the defect it closes written above it. `npm run verify` now races the origin against
    itself and asserts each one behaviourally rather than trusting the SQL was applied.

84. UPSTREAM ASK 2026-09-01 — **a `<tool>` row has no authority model, so the MCP face is a
    second door onto anything a route gates.** `createMcpFace` checks exactly one thing
    (`mcp-face.ts:196`: `row.auth === "required" && ctx.identity === null` → 401) and has no
    notion of `reach`, no role check, and no way for a row to say who may call it. Every
    `<tool>` in this template is an admin verb, and two of them read the unpublished
    catalogue — so closing the HTTP routes with `reach=""` left the identical reads open over
    `/mcp` to any signed-in viewer's token. The declaration says the same word (`auth`) on
    both rows and means materially different things on each, which is the worst version of
    this: an author who gated the route reasonably believes they gated the tool.
    ASK: `<tool>` accepts `reach` (and, when §6.2 lands, `auth="role:…"`), and the face
    applies the host's own gateway — service role or internal key, 404 otherwise.
    BRIDGED IN PLACE: `scripts/serve.mjs` owns the local mount and holds the whole face to
    that test, with the reasoning at the call site. It is the whole face rather than per-tool
    because every tool here is an admin verb; a project with viewer-facing tools would need
    the upstream fix rather than this.

85. RESOLVED 2026-09-01 — **the coin economy no longer promises expiry, on either side of
    the wire.** App Store Review Guideline 3.1.1, verbatim: *"Any credits
    or in-game currencies purchased via in-app purchase may not expire."* 3.2.1(iii) permits
    an expiry window only for the rental of specific approved content; a coin balance is not
    that. The backend was writing a 7-day `expires` onto every granted-bonus ledger row and
    nothing ever read it — which the production audit filed as a bug to FIX by implementing a
    sweeper. Implementing it would have been the App Store rejection: `bonus` is not a
    purely-granted bucket, because a coin pack's "+5% free" is credited there by
    `settleOrder`, so an expiry sweeper on that balance expires money someone paid for.
    DONE (server): the `expires` field is removed from the `ledger` entity and from all three
    grant writes — the capability is gone, not merely unexercised. `npm run verify` asserts
    both (no `expires` column in the emitted ledger schema, no `expires:` in engage.dsx). The
    two balances stay separate, because spend order is a real product rule (granted first, so
    purchased coins outlive free ones) and because keeping the purchased balance nameable is
    what makes 3.1.1 provable.
    DONE (Components/, this pass). Re-measured before touching a string, because the ledger
    named three line NUMBERS and line numbers rot: two of the three had already been fixed
    (the balance-strip caption is now `Bonus`, the wide strip now reads "Coins never expire —
    bought or earned"). The third had NOT, and it was the one worth finding, because it read
    as dead code:

        {{ item.kind == 'bonus' ? 'Bonus coins' : 'Coins' }}{{ item.expires == null ? '' : ' · expires in 7 days' }}

    A SECOND interpolation appended to the first, on every ledger row. `ledgerRows` had
    already stopped naming `expires` in its payload, so it could not fire — which is exactly
    why it survived two passes. An unreachable promise is one payload change from a live one
    and no gate could see it, so it is deleted rather than left unexercised, on the same
    reasoning that removed the column instead of leaving it unread.
    A LOCALISATION MISS CAME OFF WITH IT. Two holes is a CONCATENATION, so neither branch was
    ever a rendered form the seam could look up — `scripts/strings.mjs ternaryLiterals` names
    this very line as its worked example. One hole over two bare literals is translatable, so
    `Coins` and `Bonus coins` now resolve in all thirteen locales (248/248 per table), each
    translation taken from the noun phrase that locale's own "Bonus coins are spent first"
    sentence already used.
    AND THE COPY IS GATED NOW, not just the behaviour. `verify` proved three server-side
    facts and nothing about what the app TELLS the customer, which is the half a reviewer
    reads. Two assertions run over the app's own display-point extractor — `keys` for
    literals and whole-attribute ternary branches, `unreachable` for every interpolated
    display attribute verbatim, which is precisely where a concatenated fragment hides. A
    mention of expiry passes only when it NEGATES one. Proven to fail by re-planting the
    deleted clause (1 promise of 2 mentions; 0 of 1 once restored), and paired with a
    positive so it cannot pass vacuously on an app that never mentions expiry.
    ALSO CHECKED, and clean: the spin is FREE (one a day, no coin cost anywhere in
    `spinWheel`), so it is not a loot box under 3.1.1 — a randomised reward is only one when
    it can be obtained with PURCHASED currency, and declaring one forces an 18+ rating in
    Brazil and 16+ in Australia. The rule is now written at the action and the odds are
    published in `rewardsState` (`spinOdds`, `spinCost: 0`) so a future "buy a spin" cannot
    land without someone reading it.

86. RESOLVED 2026-09-01 — **restore now reaches the native lane, and the ceiling it cannot
    cross is named on screen.** App Store 3.1.1 requires a restore mechanism for restorable
    purchases; the founder's constraint is sharper — *"restore purchases should work
    anonymously too, no login needed — the majority of revenue will come from non-logged-in
    users"* — so it may not sit behind an account.
    Most of the guideline is true here by construction: VIP and every unlock are server-side,
    account-scoped rows, so anything reaching the same subject already has its entitlements.
    The Stripe hole (`restoreOrders`, `POST /store/restore`) was closed a pass ago.
    THE STALE HALF OF THIS ENTRY, corrected: it said the native receiver "is a hosted-lane
    integration this template does not have" because the standalone server compiler has no
    `<webhook>` tag. That is no longer true — the `verify="bearer"` receiver, its drain and
    `settleNative` all landed since, and the build emits them. What was genuinely missing was
    not the receiver but the SWEEP.
    DONE: `restoreNative` (`POST /store/restore/native`) is the native twin of `restoreOrders`
    — one RevenueCat read for the caller's own subscriber record, then a grant for every
    non-subscription this deployment has not granted, through the same `grantStore` and the
    same two database locks. It takes NO argument: the caller id is read off `owner_id` on a
    row the caller owns, which is also the RevenueCat `app_user_id`. Bounded at five grants
    per call against the 64-call cap, resumable, `rate="20/h"` sized to the sweep. A native
    build runs BOTH sweeps, because a viewer who bought on the web storefront and came back on
    their phone has an unsettled order on the same account.
    ANONYMOUS BY CONSTRUCTION ON THE SERVER: `auth="required"` verifies a TOKEN and never asks
    for a human, so an anonymous session reaches both routes exactly as a signed-in one does.
    THE CEILING, and it is the answer rather than an obstacle. Apple keys a receipt to an
    APPLE ID and Google keys a purchase token to a GOOGLE ACCOUNT — per-account, never
    per-device — so the platform really can recognise a returning buyer with no app login. But
    every product here is a CONSUMABLE (coin packs by nature; the VIP pass by design, which is
    what makes a bearer receiver sufficient). StoreKit leaves consumables out of
    `currentEntitlements`; Play stops returning a purchase token once a pack is CONSUMED,
    which it must be or the viewer can never buy another. And replaying one would be wrong
    even where RevenueCat still remembers it: a consumable was DELIVERED. Someone who bought
    1,000 coins and spent 400 holds a balance of 600, not a 1,000-coin receipt, so re-granting
    the transaction mints fresh coins on every reinstall — `unique (intent)` refuses that by
    design, and the refusal is correct. **A reinstall is an identity problem, not a purchase
    problem.** `<RestoreRow>` prints that per lane, and `verify` fails if the line leaves
    `/store` or `/vip`.
    TWO DEFECTS FOUND WHILE BUILDING IT, both fixed here: `settleNative` granted on SANDBOX
    purchases while the webhook path skipped them, so the two server-to-server paths disagreed
    about the same purchase and the pull path was a coin faucet for anyone who can run a
    sandbox transaction; and two of `restoreOrders`'s three returns were short (no `vipDays`,
    no `done`), which under total arithmetic answers the wrong number about someone's money
    rather than throwing.
    STILL OPEN, and it is the last mile of the founder's requirement — **this build mints no
    anonymous session.** `<AuthSeam>` `publishGuest` publishes `{ ok: false, headers: {} }`,
    so a guest carries no token and both restore routes (and checkout) would 401. The SERVER
    is ready for the anonymous buyer; the CLIENT seam is not. `<RestoreRow>` says which half
    is missing rather than firing a call that cannot succeed, and the README deploy checklist
    carries the row. The shape of the fix, for whoever takes it: mint a durable subject at
    first run and publish it as a session — durable being the hard half, because a subject
    that changes on reinstall makes the identity problem above permanent, and there is no
    key-value plane in DSX today (§6.33). Until then, an adopter whose revenue depends on
    logged-out buyers wires it at the provider seam, which is exactly where docs/auth.md says
    identity decisions belong.

87. MEASURED 2026-09-01 — **Dynamic module dispatch does not exist, and both ways round it
    fail silently as SUCCESS.** Writing account deletion (App Store 5.1.1(v)) needs the same
    sweep over twelve owner-scoped entities, so the obvious spelling is a loop over table
    names. Probed on a live origin, in a throwaway action, per the probe-before-you-generalise
    rule:
      · `dsx.module.data[name].list(...)` → the whole expression is NULL. `await null` is null,
        `.ok` is false, and a twelve-table sweep deletes nothing while returning
        `{deleted:true}`. AGENTS.md already recorded bracket-read MUTATION as a no-op; this is
        the read side, on the module namespace.
      · `const n = await count(dsx.module.data.favorite)` — passing the table object into a
        lambda → ok with ZERO rows. The object loses the caller RLS scope as a value.
      · literal `dsx.module.data.favorite.list(...)` → ok, 5 rows.
    Both failures are indistinguishable from "nothing to delete", which for a deletion is the
    worst possible outcome. The action is unrolled, twelve literal blocks, and the finding is
    now an AGENTS.md rule.

    TWO MORE, from the same work. A request gets 64 module calls (ACTION_CALL_CAP, and a spec
    may only LOWER it), so the first correct version blew the budget mid-sweep: 20 unlocks
    gone, wallet and My List left behind, 503 to the caller — an account half deleted, which
    is exactly the "deactivate" 5.1.1(v) refuses. Deletion is now bounded per call and reports
    `done`, and the client loops until it flips. And the route ceiling has to follow the
    ACTION, not the intent: `rate="3/h"` looked right for a once-in-a-lifetime decision and
    rate-limited the viewer out of finishing their own deletion on pass two.

88. RESOLVED 2026-09-01 (`despia-framework dev@45264667`) — **Every `href` on iOS
    navigated to the entry route, silently, in every DSX app.** `href=` on a non-control
    element runs `followHref()`, which interpolates the path and calls
    `env.run("dsx.module.route.push({ path: __href })", args: ["__href": path])`. The body
    contains a brace, so `run(_:item:args:)` routes it to `runActionBody` — and BOTH body
    paths seed their scope with `var locals = item ?? [:]`, never merging `args`. The
    parameter was threaded through the whole call chain and used only for `replyToken`. So
    `__href` resolved to nothing, `route.push({ path: <nothing> })` fell back to the entry,
    and the tap landed on Home.

    It was invisible for exactly the reason it was worst: the entry route IS "/", so a broken
    link looks like "the tap did nothing" rather than like a navigation bug, and the one
    spelling that works — `on:tap="dsx.module.route.push({ path: '/x' })"` — is common enough
    in this template that whole screens navigated correctly while their neighbours did not.
    Measured on device: Profile's Account row (`href="/account"`) logged `push /`; the same
    row after the fix logs `push /account` and the screen opens with a native back chevron.

    AGENTS.md documents `href` as the idiom for cards and links ("CTAs are `<button on:tap>`
    when they need a background; `href` containers are for cards/links whose text stays
    plain"), so the documented, preferred spelling was the broken one. Web resolves args here
    and so does Kotlin — the comment at the call site even says "the web + Kotlin runners
    resolve the same way" — so this was iOS drifting from the other two lanes, not a design.

    Args now merge into the locals seed and shadow the row scope, because an explicit payload
    is more specific than the ambient item.


89. **The tab bar shifted between routes, and the shift was the previous fix.** Two rounds on
    one bug, worth recording as a pair because the first round is the tempting one.

    ROUND ONE (a44005f) — For You clipped its tab-bar captions where Home did not. Cause:
    Discover sized its pager stage `dsx.screen.height - 70` and carried `ignoreSafeArea` on
    the pager, so the column took all 874pt of an iPhone 17 Pro window inside a frame offering
    781; stage 804 + bar 70 filled the window exactly and the bar sat in the last 70, which
    contains the 34pt home indicator. The fix passed the inset INTO the shared bar
    (`<TabBar inset="{{ dsx.screen.safeBottom }}">`) so it could pay it back.

    ROUND TWO — that made the bar 104pt on For You against 70 everywhere else. The captions
    stopped clipping and started MOVING, which is what the founder saw and screenshotted:
    same bar, two heights, two caption baselines, changing under the tab tap. **Compensating
    inside shared chrome converts a clip into a drift, and a drift is worse** — a clip is one
    wrong screen, a drift is the frame of the whole app failing to hold still.

    The law is the inverse of the instinct: SHARED CHROME HAS ONE GEOMETRY AND SCREENS CONFORM
    TO IT. The bar now reads nothing about the safe area — a route frame already proposes the
    safe region, so the bar is clear of the indicator by construction, and the only way its
    captions land at two heights is a screen handing it a different box. That is a bug in that
    screen. Discover drops `ignoreSafeArea` (it is not the window owner; the tab bar is its
    sibling) and sizes its stage from the SAFE region:
    `screen.height - safeTop - safeBottom - chromeH`. `ignoreSafeArea` belongs only to a
    screen that owns the WHOLE window and pays every inset back itself — Watch does exactly
    that, and mounts no tab bar (§6.29 / item 56). The `inset` attribute is deleted rather than
    defaulted to zero: an unused compensation mechanism is the next person's trap.

    THE ENGINE GAP UNDERNEATH (filed, not worked around). `dsx.screen.height` is the WINDOW,
    and there is no fact for the box a frame actually proposes — so a screen doing pixel
    arithmetic must reconstruct it as a three-term subtraction, and every renderer's authors
    will get it wrong in the same direction (too tall, chrome into the indicator). The insets
    are published; the region they imply is not. `screen.contentHeight`/`contentWidth` is one
    addition to `DSXScreen.swift` and `boot.ts`'s `safeInsets()` that would make the correct
    spelling shorter than the wrong one. Until then AGENTS.md's tab-root corollary carries the
    subtraction, and the web router's chrome-drift reporter (the navigation pass) catches the
    class at runtime rather than in a screenshot.

90. RESOLVED 2026-09-01 — **The tab bar's last 4.67pt, and why the number 70 survived a round
    of fixing.** Item 89 removed 34pt of drift and left 4.67. The residue had a different
    cause, and it is the more instructive one.

    Measured on device, probe-free, VIP-badge fiducial across the four tab roots:

        BEFORE  Home 782.67  For You 778.00  My List 782.67  Profile 782.67   spread 4.67pt
        AFTER   Home 782.67  For You 782.67  My List 782.67  Profile 782.67   spread 0.00pt
                bar bottom 839.7pt against a safe edge of 840pt

    For You was the screen out of step, and it was out of step by PREDICTING instead of
    ASKING. It sized its stage `safeHeight - chromeH` with `chromeH = 70`; the bar it was
    reserving space for measures 65. Every other tab root lets the frame place the bar and
    lands its bottom edge on the safe edge, so a screen that reserves the wrong number stops
    short. `70` survived the previous round because a hard-coded 70 reads as a decision, not
    a guess — the same reason the earlier `inset` compensation read as a fix.

    THE RULE: a screen that must know a shared component's size ASKS it. `measure=` on the
    `<TabBar>` mount publishes the real box; the seed is the 65 the phone bar actually
    measures, so the first paint is already right and Dynamic Type or a platform drawing the
    icon a point taller corrects it from there rather than drifting.

    THE FACTS, read off the device rather than derived. A temporary probe in the bar printed
    `H874 T62 B34 SH778 bar65`. Two things fell out of that. **safeTop is 62 on an iPhone 17
    Pro, not 59** — every device constant in this family would have been wrong. And
    `dsx.screen.safeHeight`, the engine fact added the same day
    (`despia-framework dev@40f214f7`), was live and correct on device, so the stage reads one
    fact instead of subtracting three.

    The framework half of the day, for the record: `safeWidth`/`safeHeight` published
    identically on iOS, web and Android, and `mount.ts` importing `./element-motion.js` — a
    spelling tsc resolves and node does not — had silently darkened EVERY test in the web dom
    package since dev@6da4c7f7. 118 assertions in five files, including the router's own
    corpus, had stopped running. Fixing the import surfaced five real failures, all from that
    same commit, all now green: a byte-string pin describing a replaced zstack rule, a raw
    `#000` and a hand-picked 180ms in the rail edge fade (now `black` and
    `var(--dsx-dur-fast)`, which is 0ms under reduced motion — a preference the literal
    ignored), a reduced-motion assertion that read only the first of two policy blocks, and
    eight universal attributes with no web-support decision at all. The general lesson is the
    one this ledger keeps relearning: a gate that cannot fail is worse than no gate, because
    it is counted as coverage.

91. **A `<style as="…">` attribute cannot carry an interpolation, and the declaration is
    dropped SILENTLY.** Probed in a throwaway one-element component (AGENTS.md's rule) while
    factoring this template's brand palette into one definition:

    ```xml
    <variable as="brand" computed="true">return '#FF2C55'</variable>
    <style as="a" color="{{ dsx.variable.brand }}" fontSize="15"/>
    <style as="b" background="{{ dsx.variable.brand }}" padding="8"/>
    ```

    compiles to

    ```css
    [data-dsx~="a562"] { font-size: 15px; }
    [data-dsx~="a563"] { padding: 8px; }
    ```

    — the interpolated declaration is not wrong, it is ABSENT. `despia lint --strict`,
    `check:styles` and `despia review` all pass; the registry even preserves the hole
    verbatim in `head.styles` (`{"as":"a","attrs":{"color":"{{ dsx.variable.brand }}"}}`),
    so the loss happens in the CSS emitter, not the parser. The same hole works everywhere
    else: an inline element attribute (`color="{{ brand() }}"`) and a `style=""` hole both
    render, and the element node is marked reactive.

    WHY IT MATTERS FOR A TEMPLATE. A named style class is the documented way to express a
    repeated look, and a design token is the documented way to express a repeated value —
    and the two cannot meet. `#FF2C55` is written 86 times across 20 files here; 82 of
    those are markup and now call `brand()` (Components/parts/Theme.dsx), and the rest are
    inside `<style>` blocks where nothing can be called. An adopter re-skinning the app
    therefore still edits more than one file.

    THE BRIDGE, named in place rather than silent: Theme.dsx is the single definition and
    `npm run check:styles` refuses any hex in `Components/**` that it does not name, so the
    `<style>` copies are checked mirrors rather than independent truths. `scripts/review.mjs`
    reads the same table instead of the second copy it used to carry — a copy that had
    already fallen six shipping colours behind the app (`#5FD08A #3A3547 #FF7BAA #B3103A
    #FF8FA8 #1F1F26`), which is the ordinary fate of a second copy and the reason this entry
    exists.

    THE ASK: let a `<style>` attribute take a computed value, or give the style layer a
    token plane of its own. Either one turns a re-skin into a one-line edit.

92. **`Core/PostHog`, `Core/Consent` and `Core/Telemetry` each ship a complete web facet
    that no build can reach, because their manifests declare no `web.entry`.** Found while
    wiring this template's analytics plane. All three have `web/index.js` on disk —
    PostHog's is a full SDK-free implementation that POSTs `/i/v0/e/` and `/flags?v=2`,
    Consent's is a complete localStorage store publishing `granted`/`stored` — and
    `grep '"web"' dsx.json` returns nothing for any of them. `cli/src/build.ts` is explicit:

    ```ts
    for (const pkg of registry.packageWeb ?? []) {
      if (pkg.entry === undefined) continue;
    ```

    so no chunk is emitted, `has('posthog')` and `has('consent')` are false on every web
    build, and every call answers not-ok. This is not a new class of defect: it is exactly
    what `Core/SocialShare/dsx.json` records about itself — *"every web build silently had
    `has('share') === false` and no chunk on disk, while the implementation sat there
    complete. Declaring the entry is the whole fix."* SocialShare was fixed; these three
    were not.

    THE ASK: add `"web": { "boot": true, "entry": "web/index.js" }` to the three manifests.
    Three lines each, no new code — the implementations are already written and already
    conformance-pinned.

    Template side, meanwhile: `Components/parts/Analytics.dsx` declares the funnel and calls
    `dsx.module.posthog.capture` behind `has('posthog')` with the consent gate in front of
    it, exactly as `Components/parts/AdGate.dsx` handles the rewarded-ad lane — capability
    first, platform second. With no sink reachable the plane keeps a bounded in-memory ring
    instead, and the Manage screen SAYS the deployment has no sink rather than implying the
    funnel is being recorded.

93. **A bracket write whose KEY CONTAINS A DOT is stored as a nested path, silently — and it
    shipped.** `server/social.dsx listReports` tallied reports per target with
    `tally[k] = (tally[k] == null ? 0 : tally[k]) + 1`, `k` being `target ?? subject`. Comment
    reports counted correctly; **every ad report came back `flags: null`**. Isolated against a
    live origin by filing one ad report on a dot-free path:

        key '/promo/nodotcreative'      flags 1
        key 'a97b4883-…-330e3e104e17'   flags 1     (a UUID — dashes, no dot)
        key '/promo/house-ad.mp4'       flags null

    Same statement, same loop, same read expression. `tally["/promo/house-ad.mp4"] = 1` writes
    `tally["/promo/house-ad"]["mp4"]`, and the read finds nothing. It was invisible because
    100% of ad reports carry a creative path and 100% of creative paths end in `.mp4`, so the
    column simply looked unpopulated rather than wrong.

    This is a sibling of the bracket-read-mutation law AGENTS.md already carries
    (`byKey[k].push(v)` writes nothing). That one is about the READ; this one is about the
    KEY. Together the rule is: **never key a dict on caller data.** Fixed here by counting
    pairwise over the bounded page (n ≤ 100 by the list clamp, so at most 10k comparisons and
    no encoding hazard at all), and `npm run verify` now files an ad report with a dotted path
    on purpose so the assertion cannot pass vacuously.

    THE ASK: either make a bracket write with a computed key a literal key on every renderer,
    or refuse a dotted key loudly. A silent reinterpretation of a caller's string as a path
    is the worst of the three options.

94. **A `<functions global="true">` body is the EXPRESSION tier: `dsx.log`, `dsx.module.*`
    and every `global.*` WRITE are silent no-ops there.** Found while building this
    template's analytics plane as one shared `track()` function, which emitted nothing at
    all and reported success. Three statements, probed on a live origin, each run BOTH from
    inside a functions body and from an `<action>` body three lines away in the same file:

        statement                              in <functions>      in <action>
        dsx.log('PROBE …')                     no console line     "[dsx.log] app: PROBE …"
        dsx.module.route.push({path:'/notices'})   no navigation   (route changes)
        global.sdEvents = next                 reads back NULL     (value lands)

    READS work: `has('posthog')`, `global.consent.granted` and the caller's variables all
    resolve, exactly as `js-core.md` describes ("free names resolve against the calling
    surface's live store at call time"). It is the WRITE path and the runner-only callees
    that are absent — `dsx.log` and `dsx.module.*` are intercepted in `runner.ts`, and a
    named-function body is not evaluated by that tier.

    WHY IT MATTERS. The global function library is presented as the place shared logic lives
    ("validation, pricing, formatting … written once and shared by every surface"), so a
    reader will reach for it exactly when they want one emitter, one logger, one cache
    writer. Every one of those fails, returns cleanly, and leaves no trace. The lint gate has
    nothing to say and neither does the runtime.

    THE BRIDGE IN THIS TEMPLATE, named rather than silent: pure POLICY stays in the shared
    functions (`analyticsBlocked()`, `analyticsSink()` in `Components/parts/Analytics.dsx`)
    and the four-line SIDE-EFFECT shell is copied into each of the six components that emit,
    with a comment pointing here. That is a duplication this ledger would normally refuse;
    it is here because the alternative is a shared function that does nothing.

    THE ASK: run a functions body on the statement tier — or, if that is a deliberate
    boundary, make it an authoring-time error to name a runner callee or assign to `global`
    inside one. `jse-audit` already exists for exactly this class ("unsupported JS is an
    authoring-time error, never a silent null at runtime").

95. **A `<sheet>` nested inside a presented `<sheet>` STACKS correctly today — but nothing
    closes the child when the parent goes down, and no route change closes either.** Two
    separate engine gaps, found together while building the template's nested drawers, both
    measured on a live origin at dev@71155a18 (web lane, 375×812).

    **WHAT ALREADY WORKS, and it is more than `docs/stacked-sheets.md` predicted.** A child
    `<sheet>` declared inside its parent's slot presents as a real second level with no
    engine work at all. Probed on a throwaway two-sheet component and then again on the
    shipped surfaces:

        parent level 1 / child level 2 · z-index 10001 / 10002
        the parent's `.dsx-overlay-portal-scope` goes inert = true AND aria-hidden = "true"
        Escape closes exactly one level (first the child, parent stays at its detent)
        focus restores to the exact control that opened the child
        `document.documentElement.style.overflow` lock survives both, released on the last
        drag-to-dismiss owns the TOP card only (a 176px pull on the child's grabber wrote
          --dsx-sheet-drag: 88px mid-gesture and dismissed to the parent on release)
        each level runs its own detents (`content` child over a `half,full` parent)

    Two things from the design record are now stale and are corrected in that document:
    S1a (the ≥48rem rule overwriting the drag transform) is FIXED upstream — the media query
    at `overlay-controls.ts:1985` now carries `translateY(var(--dsx-sheet-drag, 0px))`. And
    the visual card-stack (S1/S2) is still absent: no `data-dsx-stacked`, the parent panel's
    computed `scale` reads `none` with a child up, and the child's scrim still carries
    `blur(8px) saturate(1.12)` so the app behind is blurred twice.

    **GAP (a) — THE CASCADE. Closing a parent leaves its declared child open, orphaned.**
    Probed: parent and child both up, close the parent → the child is still presented, now
    promoted to level 1, with its own `present` key still true. The store reads `p=0 c=1`.
    On web the child's portal scope is a body-level sibling, not a descendant, so nothing
    tears it down; `bindPresentation`'s disposer (`overlay-controls.ts:677`) calls
    `detachDocumentListeners`, `deactivateLayer` and `portal.unmount()` and never writes the
    key back. On iOS `SheetAnchor.onDisappear` (`Sheet.swift:422`) only NSLogs, so the key
    survives the teardown and — per `.onAppear { shown = present.wrappedValue }` at 411 —
    re-presents the child the next time the parent opens.

    **GAP (b) — ROUTING IGNORES THE OVERLAY LEDGER.** `router.ts` contains no reference to
    `activateLayer`, `deactivateLayer` or `dsx-overlay-layer`, so a `push`/`reset`/`replace`
    from inside an open sheet mounts the new frame UNDER it. Three shipped instances in this
    template, all measured and all fixed this pass:

        Watch.dsx    the drawer's genre chip pushed /browse/:genre and the episode drawer
                     stayed painted over it — frames 2→3, path changed, elementFromPoint at
                     the screen centre still inside `.dsx-sheet-layer`, scrim and blur intact
        SearchOverlay.dsx  a result row pushed /show/:id and the cover sheet stayed up
        AdGate.dsx   "See VIP plans" pushed /vip out of a cover sheet that was PLAYING A
                     VIDEO — the ad went on playing behind the paywall

    **THE BRIDGE IN THIS TEMPLATE, named rather than silent.** Every sheet whose key can be
    written by anything other than its own dismissal now closes through ONE action that
    takes its declared children down first, top-down, the way the engine will:
    `Watch.dsx closeDrawer` and `PlansSheet.dsx closePlans`. Every navigation out of a sheet
    goes through an action that closes it first: `goShow`, `seeAllGenre`, `openVipPage`,
    `openShow`, `seePlans`. Both are duplications of engine responsibility and both should
    be DELETED the day the engine owns them — the comment at each site says so.

    **THE ASK, in the order it is worth doing.**
    1. The cascade, on both lanes. Web: `layerPortal` already captures `home` at bind time
       (`overlay-controls.ts:426`), so the owning layer is `home.closest(".dsx-overlay-layer")`
       — register the pair and close registered descendants top-down inside `setOpen(false)`
       before `deactivateLayer`, each firing its own `dismiss` and write-back. iOS: write
       `present.wrappedValue = false` in `.onDisappear` when `shown` is true, guarded so a
       normal swipe-dismiss does not double-fire. The semantic is already pinned for the other
       presentation plane (`Conformance/router/present.json`: "dismissing a CHAIN entry takes
       its later chain descendants and spares every overlay") — reuse those words, because
       the two planes must not disagree about what a stack is.
    2. Routing closes open modal layers. An exported `closeAllLayers()` called from `push`,
       `reset` and `pop`, firing each `dismiss`. This is the one that no author can be
       expected to remember, because the failure is invisible from the source.
    3. Lint: two `<sheet>` elements as SIBLINGS whose `present` keys can both be true is not
       a stack — on iOS a view controller presents one thing at a time, so the second
       silently does nothing. Say so at authoring time.
    4. A stacked child with no `title=` is an unlabelled level-2 dialog. Survivable at level 1,
       disorienting at level 2. Worth a lint note.

    Everything above `docs/stacked-sheets.md` already specifies in detail — that document is
    the design record for this item and its §5 staging is still the right order. What this
    entry adds is the measurement that the STATE half (Stages 1–2, and the routing stage) is
    what a template actually trips over, while the fidelity half (Stages 3–5, the card-stack
    look) is a want rather than a blocker: two nested drawers ship in this template today,
    on the plain flat presentation, and they are good.

96. RESOLVED 2026-09-01 (`despia-framework dev@1870e4e4`) — **`nav` was a reserved plane on the
    WEB runtime only, so the documented guarded-back idiom answered null on both native lanes.**

    StackReference documents it on its own routing page:
    `visible-if="{{ dsx.variable.nav.canPop }}"`. `dsx.variable.nav` normalizes to the bare
    name `nav`; the web resolver has a reserved branch for it beside `route`, and NEITHER
    NATIVE RESOLVER DID. So the read fell through to the SURFACE store while the router
    publishes `nav` to the APP store, and returned nil.

    Measured on an iPhone 17 Pro at depth 3 (`/` → `/browse/Comedy` → `/show/:id`): the back
    chevron logged `replace — apply — depth 3 top /`. The guard took its else branch, the
    viewer landed on Home, and the stack was left as `[/, /browse/Comedy, /]`. After:
    `pop — apply — depth 2 top /browse`. The same markup had always popped correctly on web,
    which is exactly what made it look like an iOS quirk rather than two lanes missing a
    branch the third had.

    A documented read that silently answers null is worse than one that errors: every guard
    written against it inverts, and it inverts toward "there is no history" — the destructive
    direction, every time.

    Both native resolvers now carry the branch, reading the app store exactly as `route` does,
    so it is reactive for the same reason. And the plane is READ-ONLY, now enforced: all four
    write paths (web interpreter, web codegen, Swift, Kotlin) already refused surface-store
    writes to `dsx`/`global`/`route`/`cookie`, and `nav` joins them — a plane an author can
    now SEE is a plane an author can now try to write, and `nav.canPop = false` would
    otherwise have quietly created a surface variable the reader deliberately ignores.

    THE GATE: `Conformance/jse/reserved-planes.json` — 14 case groups over 23 spellings,
    because all three appear in shipped markup (the bare name, the `dsx.` root, and the
    surface-scope spelling that broke). Two properties beyond the values: a reserved plane
    cannot be SHADOWED by a surface variable or a row field of the same name, and an
    unpublished plane answers null rather than a stale value. Proven to fail — removing the
    branch again turns 2 of 3 red on web and 2 of 3 on the JVM. The fixture needs a seeded app
    store, which the generic triple runner cannot express, so it declares its own executors and
    BOTH generic runners now honour that declaration loudly: they skip the rows but assert the
    named executor is still on disk.

97. RESOLVED 2026-09-01 (`despia-framework dev@daad3fa0`) — **A `reset` away from a pushed
    screen could kill the process, and the cause was that DISPOSAL PUBLISHED.**

    Reproduced 3× on the most ordinary gesture an app has — push a detail, tap a tab: thousands
    of "Publishing changes from within view updates is not allowed" and then
    `Fatal access conflict detected`. An earlier pass isolated it against a control build
    (pre-existing) and measured one hypothesis FALSE: deferring `releaseNative` off the publish
    turn does not fix it, because the disposals immediately before the fatal are a whole
    surface's api blocks going down as SwiftUI unmounts the replaced root, not `onPop`. That
    negative result was right and it points at the seam.

    Two causes, both in teardown. (1) `ApiBlock.cancel()` settles the envelope flags — loading
    false, refreshing false, status ready — and `dispose()` called it. Those writes are a state
    transition for an OBSERVER, and a disposed block has none: its surface is being destroyed.
    But `store.vars` is `@Published` with a `didSet`, so every block on the outgoing surface
    published into an observed store from inside SwiftUI's update pass. (2) Disposal rides
    `deinit`, and `deinit` runs on whichever queue drops the last reference — the same reason
    `FrameSurface.deinit` already hops — while `apiHandles` and the api graph are
    main-thread-only, so a mass release mutated main-thread state off-main.

    `cancel(publishing:)` takes false from `dispose()` (the live-cancel path, where a refetch
    supersedes a request and the flags DO matter, is unchanged), and both `MountedStackApi.deinit`
    and `StackSurface.deinit` hop through `JSE.afterRender`. The hop is safe precisely because
    the release it defers is IDENTITY-checked: if the replacing view identity has already
    re-claimed the name, `handle.value` is the new block and the late release returns false —
    which is the behaviour that check was written for.

    Measured after: three cycles of push-a-tab-root-then-switch-tabs plus a depth-3 push and
    pop — 0 publish-in-update warnings (was ~15,000), 0 access conflicts, process alive.

    The general lesson, and it is the third time this ledger has written a version of it:
    a write on a teardown path has no reader, and a framework that publishes it anyway is
    paying a crash for a value nobody will ever read.

98. **THE LOCALIZATION SEAM DOES NOT REACH A CHOICE CONTROL'S OPTIONS, and JSE has no
    `localize()` — so an app cannot translate the words inside a `<picker>`, a
    `<segmented>`, a `<combobox>` or a `<wheelpicker>`** (found 2026-09-01 building this
    template's language switcher; measured on the web lane, source-read on both native).

    The seam is wired at the DISPLAY points and only there: `dom/src/mount.ts bindDisplay`
    is called from `elements.ts` for `<text value=>` / inner text and the button family's
    `label=`, and from the field family for `placeholder=`. `native-controls.ts` — the file
    that builds every choice control on web — never calls it: `bindOptions` goes through
    `api.bindText` / `api.bindValue`, and `choiceControl` sets the option's `textContent`
    from the raw label. `Picker.swift` and `PickerElements.kt` build their menus from the
    same raw strings. So `<picker options="Weekly,Monthly,Yearly">` renders three English
    words in a German app, silently, with a 100% coverage report beside it.

    There is no second door either. `DSXStrings.localize` is exported from the kernel and
    consumed by exactly one caller (`mount.ts:415`); it is not in the JSE builtin table, so
    an author cannot reach it from a computed, a formula or an action to translate the rows
    before handing them over.

    **WHY THIS ONE IS SHARP RATHER THAN THEORETICAL.** The control that the localization
    plane most obviously exists to enable — an in-app LANGUAGE SWITCHER — is a choice
    control whose options are language names. Twelve of this template's fourteen rows are
    fine, because a language row must be an ENDONYM and an endonym is never translated (a
    Japanese reader hunting for German is looking for `Deutsch`). The fourteenth is
    "Device language", which is a sentence rather than a name, and it is now a hand-kept
    thirteen-entry map in `Components/parts/Theme.dsx deviceRowLabel()` — a second copy of
    thirteen table entries, in an app whose whole localization story is "you never write a
    key". `npm run verify` asserts the map covers every shipped locale, because the failure
    mode is one English row inside an otherwise translated menu.

    **THE ASK.** Run `labelField`-resolved option labels through `DSXStrings.localize` in
    all three builders, exactly as `bindDisplay` does — the label is display copy by
    construction, and the VALUE (`valueField`) must not be touched. `options=` CSV and
    `optionsKey=` rows both. A `<picker>` label/placeholder is display copy too. The
    corpus (`Conformance/strings/cases.json`) can pin it: one case per control, one row
    translated, one row absent, asserting the value is unchanged and the miss is identity.
    Secondary and cheaper: expose `localize(s)` in the JSE builtin table, which also gives
    the interpolated-composite tier a manual escape hatch until the Translate module lands.

     **RESOLVED UPSTREAM 2026-09-02** (dev@d2927f31 web · 30831187 Kotlin · the Swift half in
     91a108b0): option labels reach the table through one fold per lane (`DSXStrings.option`),
     and `localize()` is a JSE verb in all three tables. This template's device row is now
     `localize('Device language')` with one key in each Strings table; `deviceRowLabel()` and
     its thirteen hand-kept copies are gone, and `scripts/strings.mjs` harvests `localize('…')`
     literals so `--write` can never prune the key. Proof: `npm run verify` reads the tables.

99. **THE STRING-TABLE LADDER TRIES [FULL TAG, BARE LANGUAGE] AND NOTHING BETWEEN, so a
    script- or region-qualified table is unreachable from the DEVICE step** (found
    2026-09-01 shipping `pt-br` and `zh-hant`; `kernel/src/strings.ts load()`, and the same
    two candidates in `DSXStrings.swift` / `Strings.kt`).

        for (const candidate of [lang, bare]) …          // lang = "zh-tw", bare = "zh"

    A device set to Traditional Chinese reports `zh-TW`, `zh-HK` or `zh-Hant-TW`. None of
    those is `zh-hant`, and the bare fallback is `zh`, which we deliberately do not ship
    (`zh` would catch Simplified devices and hand them Traditional text). A Portuguese
    device reports `pt-PT`; we ship `pt-br` and, again deliberately, not `pt`. Both
    locales are therefore reachable only through the in-app picker, which writes
    `global.locale` explicitly — the device step skips straight past them to English.

    Bare-language tables are unaffected (`de-AT` → `de`, `fr-CA` → `fr` both resolve), which
    is why this is invisible until an app ships its first script-qualified locale.

    **THE ASK**, in the order BCP-47 itself implies: try the full tag, then progressively
    truncated subtag chains (`zh-hant-tw` → `zh-hant` → `zh`), and — the part that actually
    matters here — consult `Intl.Locale`'s maximize/minimize (or `Locale.canonicalize` on
    Swift, `ULocale.addLikelySubtags` on Android) so `zh-TW` LIKELY-EXPANDS to
    `zh-Hant-TW` and matches a `zh-hant` table. That is one library call per platform and
    it is the difference between "we ship Traditional Chinese" and "we ship Traditional
    Chinese to anyone who finds the menu". Until then the template names the limitation in
    its README rather than pretending the device path works.

100. **THERE IS STILL NOWHERE DURABLE TO PUT A PREFERENCE, and the one cross-platform place
     that exists cannot express durability: `dsx.cookie.*` writes a SESSION cookie on web,
     with no way to say otherwise** (found 2026-09-01 persisting the language choice; the
     sibling of §6.33, which is still open).

     §6.33 asked for a key-value plane and got none, so this pass reached for the only
     declared cross-platform storage grammar there is — the cookie jar, one spelling over
     `document.cookie` on web and `DSXCookies` on both native lanes. It works, and it is
     the right seam. But `dom/src/boot.ts wireCookies` writes:

         document.cookie = `${name}=${encodeURIComponent(string(value))}; path=/`

     — no `max-age`, no `expires`, no `SameSite`, no `Secure`, and no author-facing way to
     supply any of them, because the write grammar is a bare assignment to a name. So the
     choice survives a reload, a deep link and a tab restore, and dies when the browser
     does. Measured on a live origin: `uiLocale=es` present after `location.reload()`,
     absent after a fresh browsing session. The template names the limitation in the
     Language row itself rather than letting a viewer discover it.

     One more sharp edge on the way, and it is the reason this entry exists at all rather
     than a one-line note: **`dsx.cookie.x = null` is honoured, but a JSE value that is
     NSNull rather than a literal `null` is written as the four-character string
     `<null>`.** The writer's guard is `value === null || value === undefined`, and the
     scope sentinel (`jse/values.ts NSNull`) is neither — it stringifies. Any path where a
     null arrives through a variable rather than as a literal therefore stores `<null>` and
     the next read gets a truthy garbage tag. Probed: literal `null` deletes the cookie;
     an NSNull-valued local writes `uiLocale=%3Cnull%3E`.

     **THE ASK.** (a) `isNSNull(value)` in the cookie writer's guard, on all three lanes —
     one line, and it removes a class of silently-corrupt state. (b) An attribute or a
     second argument for cookie durability (`dsx.cookie.set('k', v, { days: 365 })`), or
     better, close §6.33 with a real preferences plane and let cookies go back to being
     about credentials. A language choice is not a credential and should not have been
     riding the auth plane's storage in the first place.

     **RESOLVED UPSTREAM 2026-09-02** (dev@e213cbac web · de9ca462 Swift · 50cd79f8 Kotlin):
     a cookie write of `{ value, days }` is the durable spelling on every lane (RFC 6265bis
     400-day cap; a bad `days` fails open to a session cookie; null/undefined/NSNull delete).
     This template writes `dsx.cookie.uiLocale = { value: tag, days: 365 }` and the
     "Remembered until you quit" note is gone. IdentityVault was argued and rejected upstream
     as the home for a preference (it is the credential vault); §6.33 stays the long-term ask.

101. **THE MESSAGE TEMPLATE TIER IS A CLIENT TIER: the SSR renderer emits the raw ICU
     group into the delivered HTML** (found 2026-09-01 shipping Arabic; measured on a live
     origin with `curl`, so it is the artefact and not a timing guess).

     `DSXStrings.localizeTemplate` is called from exactly one place — `dom/src/mount.ts`
     line 428, inside `bindDisplay`'s effect. `packages/server/src/render.ts` has no
     reference to `DSXStrings` at all. That is correct and invisible for every string this
     app shipped before today, because SSR renders the ENGLISH source and hydration swaps
     in the translation, which is the same story for all 247 keys. It stops being invisible
     the moment the source string is a MESSAGE rather than a sentence.

     Probed with one caption on `/show`:

         <text value="{dsx.variable.freeCount, plural, one {# free} other {# free}}"/>

     The delivered body carried

         <span class="dsx-text gridAll" …>{dsx.variable.freeCount, plural, one {# free} …

     verbatim — the reader's first paint is ICU markup, replaced only when the bundle
     hydrates. SSR *does* resolve `{{ … }}` holes (the same page serves `EP 1–5 Free`
     correctly), so this is specifically the `{expr, kind, …}` group grammar that the
     server-side path never learned.

     **WHAT IT COSTS RIGHT NOW.** Six counted strings in this template want a plural group
     and cannot have one, because their display points are server-rendered:
     `1-{{ n }}` and the free count on `/show`'s grid head, `EP 1 — {{ n }} episodes` and
     `Unlock all {{ n }} remaining episodes` on the detail panel, `All {{ n }} Episodes` in
     the player drawer, and `{{ n }} day streak` on Rewards. Every one of them is a place
     Arabic needs up to six forms and gets a concatenation. The three that DID convert
     (the composer's two counters and the moderation flag count) are inside sheets that
     mount on a tap and appear nowhere in an SSR body — `npm run verify` now asserts that
     confinement over the delivered bytes of seven routes, so the next author who writes a
     group at a server-rendered point is told rather than discovering it in Arabic.

     **THE ASK.** Run the message tier in `render.ts` at the same display points the client
     binds, with the request's resolved locale. The fold is already lane-independent by
     construction (`kernel/message.ts` is pure: no DOM, no store), so this is a call site
     rather than a port. Until then, `despia lint` could say it: a `{expr, plural, …}` group
     in a component that any route renders is a defect the author cannot see locally,
     because on localhost hydration usually beats the eye.

102. **THE RESOLVED LAYOUT DIRECTION IS NOT READABLE FROM DSX — the plane is write-only
     from the app's side** (found 2026-09-01, same pass; source-read across kernel, dom and
     store, confirmed by the absence of any `DSXState.set` for it).

     `DSXStrings.direction()` is the whole ladder and it works: an app pin (`global.direction`)
     over the resolved locale, script subtag over language, applied at each root. Nothing
     publishes its ANSWER anywhere an expression can read. There is no `dsx.screen.direction`,
     no `global.screen.direction`, and `global.locale` — the only readable input — is empty
     EXACTLY in the case that matters most, because an app that has never been switched is
     following the device and the device language is not exposed to JSE either
     (`DSXStrings.deviceLang` is kernel-internal).

     **WHY AN APP NEEDS TO ASK.** Three things do not mirror on their own and can only be
     fixed by the author choosing differently in RTL: a directional ICON name (§6.105), a
     physical transform (§6.104), and any gesture written against a raw x delta. All three
     need a boolean, and today the only way to get one is to reimplement the RTL language
     set in app code over `global.locale` — which this template now does
     (`Components/parts/Theme.dsx isRtl()`), and which is wrong for a device that never
     opened the picker. Measured consequence: an Arabic-language iPhone with no in-app
     choice gets a correctly mirrored layout from the engine and 34 chevrons pointing the
     wrong way from the app.

     The obvious workaround is worse than the gap. Writing the device tag into
     `global.locale` at boot would make `isRtl()` complete and would delete the kernel
     ladder's device step for every locale at once — a `de-AT` device pinned to `de-AT`
     stops falling back to the `de` table. This template refused it.

     **THE ASK.** Publish the two facts the plane already computes, tracked, on all three
     lanes: `dsx.screen.direction` (`'ltr' | 'rtl'`) and the resolved locale tag. They cost
     one `DSXState.set` each in the same sink that writes `dir` on the document element
     (`dom/src/boot.ts installLocalePlane`), the iOS environment write, and the Compose
     `LocalLayoutDirection` write. `Conformance/strings/direction.json` already pins every
     answer; this is publishing it. Secondary: a `mirror="true"` attribute on `<image>` that
     applies `scaleX(-1)` under RTL would remove the need for the boolean at the single
     largest call site.

103. **A `<pager>`'s PAGE ORDER DOES NOT MIRROR, and the app-side consequences are not
     documented anywhere** (measured 2026-09-01 in Arabic on the Home hero).

     `dom/src/mount.ts` sets `viewport.setAttribute("dir", "ltr")` on both the bound and
     the static pager, with a comment that says why: "One scroll-coordinate model in every
     engine. Page content is restored to RTL by the weak `:dir(rtl)` rule; keyboard intent
     mirrors with the outer direction." Measured, all three halves are true —
     `.dsx-paged-viewport` computes `ltr` while every ancestor computes `rtl`, each
     `.dsx-paged-page` computes `rtl` again, and the arrow keys swap. **This entry is not
     asking for that to change.** A stable index-to-offset model is worth more than a
     mirrored swipe, and the engine's own dots carry `dir="ltr"` too, so the control agrees
     with itself.

     What is missing is that nobody outside `mount.ts` can know. The consequence for an app
     is concrete: any affordance the app draws FOR a pager — a custom dot row, a thumbnail
     strip, a prev/next pair — is an ordinary stack and mirrors, while the thing it drives
     does not. This template's hero has both. The dash row is fine either way (index order
     maps monotonically right-to-left in RTL, which is what "slide 1 of 5" should look
     like), but the prev/next chevrons had to be pinned physical against a codebase rule
     that every other chevron follows, and there is no way to express "agree with the
     pager" other than a comment.

     **THE ASK.** Say it in `reference/` where an author reads it, not only in the source:
     a pager's index axis is physical on every lane, chrome that drives one should not
     mirror, and `dsx.screen.direction` (§6.102) is not the right input for that decision.
     If a mirrored page order is ever wanted, it belongs behind an attribute
     (`pageOrder="logical"`) rather than as a silent change of meaning.

104. **THE TRANSFORM VOCABULARY IS PHYSICAL WHILE THE LAYOUT VOCABULARY IS LOGICAL, and
     the same word means two different things on one element** (found 2026-09-01; measured
     on two live controls at 390px in Arabic).

     `compiler/src/cssmap.ts` maps `leading` to the logical `start` everywhere it is a
     LAYOUT word — `align`, `paddingLeading`, and the rest — which is why the direction
     plane mirrors this app's stacks for free. Twelve lines further down:

         const TRANSFORM_ORIGINS = { leading: "left center", trailing: "right center", … }

     So `transformOrigin="leading"` is `left` in Arabic. And `offsetX` has no logical twin
     at all: there is no `offsetLeading`, so a pin computed from a `measure=` box always
     travels rightward.

     Two measured breakages in this template, both from the reference recipes:

     · **The player's seek bar.** `custom-ux.md`'s PlayerScrubber is a track, a
       `scaleX` fill with `transformOrigin="leading"`, and a thumb at
       `offsetX="{{ pos * box.width - 7 }}"`. In Arabic the track measures x 14→376 and
       computes `direction: rtl` correctly; the fill's `transform-origin` resolves to
       `0px 2px` so it anchors at the LEFT and grows away from the reader's start edge;
       and the thumb, whose static position is now the track's right edge, gets
       `translateX(+109px)` on top of it and lands at **x 471–485 in a 390px viewport** —
       95px past the end of its own track and entirely off-screen. English at position 0
       renders the identical markup at x 7–21, centred on the track's left end.

     · **The episode drawer's sliding tab underline.** `align="leading"` on the rail
       mirrors correctly and puts the rail's start at the right; `offsetX="{{ tabSynBox.width + 28 }}"`
       then travels the rule rightward off it. Measured: the active tab (الحلقات) at
       x 239–290, the underline at **x 375–426** — under the OTHER tab and half outside the
       390px panel. The two attributes on the same element disagree about which way
       "leading" points.

     **THE ASK.** (a) Resolve `TRANSFORM_ORIGINS.leading`/`trailing` against the active
     direction on every lane — on web that is a `:dir(rtl)` companion rule or a computed
     value, since CSS `transform-origin` takes no logical keyword. (b) Add `offsetLeading`
     / `offsetTrailing` beside `offsetX`/`offsetY`, mapping to a sign-flipped translate
     under RTL. Both are small, and without them every measured-box affordance in every DSX
     app is broken in Arabic while passing all four static gates — this one shipped through
     `lint`, `check:styles`, `review` and `verify` untouched.

105. **THE SHARED ICON CATALOG HAS NO MIRRORING VOCABULARY: 115 names, and every
     directional one is a compass point** (found 2026-09-01; counted against
     `Conformance/icons/sf-map.json`).

     The catalog offers `chevron.left`, `chevron.right`, `arrow.right`, `arrow.backward`,
     `arrow.uturn.backward`, `arrow.uturn.forward`. SF Symbols' own auto-mirroring pair —
     `chevron.forward` / `chevron.backward`, which UIKit and SwiftUI flip with the layout
     direction for free — is not mapped, and no renderer mirrors a physical name (correctly:
     a `chevron.left` that pointed right would be a lie).

     So every DSX app is on its own for the single most common RTL affordance there is.
     Measured here: 37 directional icon sites, of which 34 were pointing the wrong way in
     Arabic — every back chevron on every screen, every disclosure chevron on every menu
     row, and the "opens something" arrow beside every legal link. The template now picks
     the glyph itself through `chevBack()` / `chevFwd()` / `arrowFwd()`, which works on all
     three lanes and costs an interpolation at 34 call sites; it also required extending
     `npm run check:styles`, because an interpolated `icon=` had been silently outside the
     catalog gate.

     **THE ASK.** Map the logical pair — `chevron.forward` / `chevron.backward`,
     `arrow.forward` / `arrow.backward` — and have each renderer resolve it against the
     active layout direction: SF Symbols does it natively, Material has
     `chevron_right`/`chevron_left` to select between, and the web can pick the path or
     apply `scaleX(-1)` under `:dir(rtl)` exactly as the framework's own
     `.dsx-route-back-icon` already does. That last point is the sharp one: the engine
     ALREADY mirrors the back chevron it draws itself (`route-chrome-style.ts:106`). An app
     that draws its own gets nothing.

106. **THERE IS NO PER-STRING TEXT DIRECTION, so content in one language inside a UI in
     another renders with its punctuation on the wrong side** (found 2026-09-01 reading the
     Arabic build's own demo catalogue).

     Every string a DSX app displays inherits the frame's paragraph direction, which is
     right for UI copy — that is the whole point of the direction plane — and wrong for
     CONTENT, whose language the app does not choose. A short-drama storefront is the
     clearest possible case: the chrome is Arabic and the catalogue is whatever the
     operator uploaded.

     Measured on `/show` with locale `ar`, English demo data: the synopsis renders its
     final full stop at the LEFT edge of the last line (`.somebody forgot they were
     pretending`), and a truncated related-show title clips its START rather than its end
     (`... Billionaire Twin` for "Swapped With My Billionaire Twin"). Both are exactly what
     the Unicode bidi algorithm specifies for an LTR run inside an RTL paragraph; neither is
     what the reader wants.

     The web has an answer (`unicode-bidi: plaintext`, or `dir="auto"`, which resolves each
     paragraph from its own first strong character) and DSX has no attribute for it, so it
     would be a web-only enhancement with no native twin — and it is not a free win even
     there, because with `text-align: start` a mixed-language column would then align some
     rows left and some right. This template deliberately did NOT half-fix it.

     **THE ASK.** A `textDirection="auto" | "ltr" | "rtl"` attribute on the text family,
     mapping to `unicode-bidi: plaintext` on web, `.environment(\.layoutDirection)` scoped
     to the Text on iOS, and `LocalLayoutDirection` / `TextDirection.Content` on Compose —
     plus a documented note that alignment stays with the UI while ORDERING follows the
     content, which is the behaviour every mature app converges on. Corpus-pinnable in
     `Conformance/strings/direction.json` as a per-string case beside the per-app ladder.

107. **THE SERVER TIER HAD NO CATALOGUE, AND THE PRICE LIST WAS THE PROOF** (found and
     closed 2026-09-01; the plane is `scripts/strings.mjs SERVER_COPY`, the gate is the
     `/store/catalog` block in `scripts/verify.mjs`). Filed as a LEDGER ENTRY rather than an
     ask, because nothing upstream had to change — this is the record of a template-side
     blind spot that every DSX app with a backend will have by default.

     Plan names, the term notes and `BEST VALUE` are fields on the rows
     `server/store.dsx storeCatalog` returns. No extractor read a server file, so all
     thirteen tables reported **248/248 viewer keys (100%)** while the Store and VIP screens
     sold in English in every one of them — the most visible untranslated surface in the app
     and the closest to the money, passing four static gates and a behavioural one.

     **The seam already reached them and nobody had looked.** `localizeTemplate` normalizes
     `{{ item.note }}` to `{0}`, misses, renders the hole, and then looks up the RENDERED
     form — the "legacy door", present with the same comment and the same ordering in
     `kernel/src/strings.ts`, `Engine/iOS/DSXStrings.swift` and `engine/Strings.kt`. So the
     English an action sends IS a gettext key on all three renderers, and the fix was a
     corpus rather than a mechanism: 248 → 255 viewer keys, thirteen locales back to 100%.
     Measured live at 390px afterwards, `uiLocale=ja` and `uiLocale=ar`: `7日間パス` /
     `اشتراك 7 أيام`, notes and badge translated on both /store and /vip, `scrollWidth`
     390 = `clientWidth` 390, no clipping, every string one line.

     **THE COST, so the next author does not rediscover it.** The key set grows with the
     operator's rows: a fourth tier is two more keys in thirteen tables. One ICU template
     (`{days, plural, other {#-day pass}}`) would collapse all six into one, and §6.101 has
     that door shut while the Store is a server-rendered route. The gate is what makes the
     cost loud instead of silent.

108. **A LATIN-INITIAL OR SIGN-INITIAL RUN IN THE APP'S OWN CHROME REORDERS UNDER RTL, and
     a fully translated app still shows it** (measured 2026-09-01 at 390px, `uiLocale=ar`,
     per-character `Range` sweep on /store — the same method that caught `19 - 1` on the
     episode grid). Same underlying gap as §6.106 and the same ask; filed separately because
     the TRIGGER is different and that difference is what makes it easy to miss.

     §6.106 is about content in a language the chrome is not — an English synopsis inside an
     Arabic frame — so it reads as a data problem an app with complete translations does not
     have. It is not. Two live cases on the coin-pack grid, where every word IS translated:

     | logical | renders as | what it is |
     |---|---|---|
     | `+5%` · `+10%` · `+20%` | `5%+` · `10%+` · `20%+` | server data (`storeCatalog.packs[].bonus`) |
     | `500 coins + 25 bonus` | `coins + 25 bonus 500` | markup composite, Components/Store.dsx |

     Six instances of each. The leading `+` is bidi class ES and, not sitting between two
     EN runs, resolves to the paragraph level and lands at the far end; a leading digit run
     does the same to the whole phrase. The prices themselves are FINE — `$11.99` and
     `$199.99` sweep as `$11.99` and `$199.99`, because `$` is ET and binds to the digits —
     so this is not "numbers break in RTL", it is specifically a sign or a number at the
     START of a string that has no strong character before it.

     **Two different fixes, and only one of them is upstream.** The markup composite is an
     APP defect fixable today and exactly as the episode grid's `{{ n }} free` → `free 5`
     was: split it so each child starts with a strong character (it also makes `coins` and
     `bonus` reachable keys, which they are not today). The `+5%` badge is not — it is one
     server string with no strong character anywhere in it, and the only honest fix is
     §6.106's `textDirection="auto"` on the text family. A web-only `unicode-bidi: isolate`
     would fix the browser and leave iOS and Android wrong, which is the shape of answer
     this template does not ship.

     **THE ASK** is §6.106's, unchanged, plus one line in its rationale: the attribute is
     not only for multilingual CONTENT. A monolingual app whose chrome contains a percentage
     badge or a count-led phrase needs it too, which moves it from "nice for content apps"
     to "every RTL app that prints a number".

109. **`on:appear` RAN BEFORE THE SURFACE'S OWN `<api>` WAS CLAIMED ON iOS, AND THE DROPPED
     VERB SAID NOTHING** (found 2026-09-01 on the Store, iPhone 17 Pro simulator; fixed upstream
     dev@368b2440 for iOS, the Android twin beside it, the contract in
     `Conformance/api/mounted-lifecycle.json` with one executor per lane).

     **What shipped.** The VIP tier cards rendered gold on the web and as an empty grey
     `<Skeleton>` forever on iOS. `PlansSheet` declares `<api as="catalog" auto="false"/>` and
     its inline root carries `on:appear="dsx.action.load()"`, where `load()` calls
     `catalog.refresh()` when the data is null — the stale-then-fresh idiom this brief
     prescribes. The refresh never ran, the phase computed stayed `loading`, and nothing in
     any log said so.

     **Measured, three arms on one build.** `refresh()` directly in `on:appear` → status
     `ready`, rows `null`. The same call one tick later (`setTimeout(0)`) → rows 3. Retried
     every 250ms → rows 3 after 3 tries. Ordering, and nothing else: a component instance's
     `<api>` is claimed during the render walk, `on:appear` ran inside SwiftUI's `onAppear`,
     which fires before that walk has reached the claim on a freshly pushed surface, and
     `apiHandle(named:)` answered nil in silence, so the verb was dropped as if it had
     succeeded. The web dispatches `appear` from a `queueMicrotask` after mount and never
     had the race; Android's `LaunchedEffect` on the appearing node ran before a LATER
     sibling's `DisposableEffect` claimed the handle — the same class, order-dependent.

     **The fix is the web's contract on every lane, not a retry in the app.** iOS hops
     `JSE.afterRender` before running `on:appear`; Android yields one frame
     (`withFrameNanos`) first; and a verb on an unclaimed handle now logs in DEBUG
     (`[dsx.api] catalog.<verb> called before <api as="catalog"> was claimed on this surface —
     the call is dropped`) instead of vanishing. Re-measured after the fix: arm A loads
     (rows 3) and the Store's plans branch paints on device. TEMPLATE RULE: an `on:appear`
     that kicks a manual `<api>` is correct on all three lanes — never wrap it in a timer or
     a retry loop, and if a screen still sits on its skeleton, read the console first.

110. **`dsx.log` IS `Swift.print` ON iOS, SO IT REACHES THE PROCESS STDOUT AND NOT THE
     UNIFIED LOG — AND AN INLINE `on:change` RUNS AT THE EXPRESSION TIER, WHERE THE CALL
     EMITS NOTHING** (found 2026-09-01 while probing §109; both measured on the simulator).

     `log stream --predicate 'subsystem contains "dsx"'` shows nothing for a `dsx.log(...)`
     line that `xcrun simctl launch --console-pty` prints immediately — the verb writes to
     stdout, which the unified log never sees. Separately, the same `dsx.log(...)` placed in
     an inline `<watch on:change="dsx.log(...)">` printed nothing at all, while the identical
     call inside an `<action>` body invoked from that watch printed every time: an inline
     handler is evaluated at the expression tier, and the log verb has no effect there.
     Neither is a rendering defect, but together they cost an hour of "the code path is not
     running" against code that was running fine.

     **THE ASK.** (a) Route `dsx.log` through `os.Logger` (subsystem `dsx`) on iOS so both
     `log stream` and the console see it, or document the stdout route in the debugging
     reference. (b) Either give the expression tier the log verb or lint an inline handler
     that calls it. TEMPLATE RULE until then: diagnostics live in `<action>` bodies, and a
     device capture is `simctl launch --console-pty`, never `log stream`.

111. **THE ANDROID ROOT PLAN EXHAUSTED AT 15s OVER A HOME THAT HAD RENDERED, because nothing
     translated the kernel's own first-render report into `screen.ready`** (found 2026-09-02,
     API 36 emulator; fixed upstream dev@ff6a3ba2). `despia export android` vendored the open
     kernel and ZERO modules (`Bootstrapped 1 plugin(s): [route]`), so no screen-phase
     coordinator existed to turn `surface.viewFinish` into the one vocabulary the root-plan fold
     reads; the fold sat through its full `timeoutMs` and painted "Root plan exhausted · 0
     shortdrama.App root.timeout 15.004s" over a screen the viewer had already been looking at
     for seven seconds. iOS had closed exactly this hole in 5156f03a with a boot-readiness floor
     in `Router.swift`; the Kotlin twin had never landed. The Android readiness path itself
     (mount effect, rendered hop, ScreenReadiness, the bus) was measured correct — the report
     reached nobody. The floor now engages 3.3s after Activity start and stands down the moment a
     coordinator answers; RouterTest 54/54 with two rows that were red before.

112. **THE ANDROID EXPORT WAS A DIFFERENT APP FROM THE iOS EXPORT** (found 2026-09-02; fixed
     upstream dev@13870d12 + 4518164d). Measured on the same source: a platform ACTION BAR titled
     "Short Drama" above the DSX surface (no `android:theme`), no edge-to-edge, NO
     `shortdrama://` intent filter ("Activity not started, unable to resolve Intent"), no
     `lifecycle.openURL` translation in the activity and no listener in the Kotlin Router, and
     ZERO modules bundled while the mandatory ones (Lifecycle, Splash, Security, MenuBar,
     PullToRefresh, Foundation) are `"mandatory": true`. Now: `Theme.Despia.Export` day/night
     NoActionBar, `enableEdgeToEdge()`, a VIEW/DEFAULT/BROWSABLE filter on the project scheme on a
     `singleTask` activity, cold and warm intents forwarded as `lifecycle.openURL`, `Router.openInbound`
     1:1 with `routePath(fromInbound:)` pinned by `Conformance/router/inbound.json` (18 rows, the
     first executor of that iOS behaviour on any lane), and the mandatory fold (`Bootstrapped 7
     plugin(s)`; cold first frame 9.3s → 4.65s). CORRECTED PREMISE, worth keeping: `dsx.config.json
     packages` is the WEB build's list. Both native exports read the project's `Modules/` folder and
     the lockfile — this template's four configured packages (Stripe, SocialShare, PostHog, Consent)
     and Core/Store are therefore absent from every native build, and `has('posthog')` is false on
     device however the web answers. See §6.115.

113. **THE ANDROID RENDER LANE PAINTED BOXES FOR ICONS, NOTHING FOR POSTERS, ROBOTO FOR INTER AND
     WHITE FOR A GRADIENT** (found 2026-09-02; fixed upstream dev@a7a7f9b5 · 3ce3c7e7 · fac00c1f ·
     b627ef28 · e8bcbb92). Four root causes, each pinned red→green: (1) the exported APK carried NO
     icon catalog — `render/build.gradle.kts` copied `sf-map.json` relative to the framework tree,
     a path the vendored export never creates, and Gradle's Copy copied nothing silently; and
     `icons: "unified"` had no vector rung on Android at all. The export now writes the catalog
     into assets and Android draws the same Boxicons paths iOS draws (300 vectors parse inside the
     24-box). (2) `ImageElements.loadRemote` validated `src` as-is, so a root-relative
     `/posters/x.svg` fell to the APK-asset ladder; `resolvedAgainstAppOrigin` is now applied first,
     rule-for-rule with Image.swift. (3) the export copied neither `Fonts/` nor the registry, and
     `StackFontBook` read only `families` — the registry root `default`, which iOS honours, had no
     reading. (4) `background: linear-gradient(…)` reached `StackStyle.color` verbatim, whose
     terminal fallback is white; the Kotlin bridge now translates gradients line-for-line with the
     Swift one. STILL OPEN on Android, filed for the next pass: a bound `<pager>` renders its
     template without row scope (the Home hero is a skeleton), `<picker>` renders a bare glyph,
     `<functions>` from a child `<Theme/>` mount register after the parent head's holes evaluate
     (the VIP gem is white), and `border-top` has no native target on either lane (needs a
     per-edge border attribute, not a bridge mapping).

114. **NESTED SHEETS CASCADE NOW, AND THE ROUTER KNOWS THE OVERLAY LEDGER** — §6.95 asks 1 and 2
     RESOLVED upstream 2026-09-02 (dev@d21d5eb7 · f1c22794 · d9f1ab5b · 19bd4afc; web f7c7891d ·
     16885516): one ledger class with one policy switch (`singlePresenter` on iOS, where a view
     controller presents one thing at a time — a sibling sheet is refused loudly,
     `overlay.siblings:a,b`), closing a parent takes its children in the same transition, every
     router verb (push/pop/replace/reset) closes the declared overlays before the swap, and the
     in-place `replace` (the URL sync after an episode advance) does NOT dismiss — pinned by two
     corpus rows on all three executors. Ask 3 (an authoring-time lint) is still open. The three
     manual closes this template carries (`Watch.goShow`/`seeAllGenre`, `SearchOverlay.openShow`,
     `PlansSheet.openVipPage`) are now redundant and are retired once the SwiftUI half is
     device-verified; `AdGate.seePlans → close()` stays (it is the reward-accounting decision).

115. **THE LINTER REFUSED A MANDATORY PACKAGE'S OWN GLOBAL, and that one refusal was the whole
     reason the in-app-purchase lane was missing** (found and fixed 2026-09-02, dev@77f4e65d). The
     build's registry folds every mandatory package, and Foundation is scheme-less, which is what
     makes its components the `shared.*` globals; the lint pool folded only the CONFIGURED packages,
     so `<shared.VipCard>` inside Core/Store — Foundation's own `Components/Core/VipCard.dsx`,
     documented in its header as "used from any package" — was "no global component 'VipCard'".
     Re-measured with Core/Store configured: lint 48 files 0 errors, `despia build` writes the
     artifact, and the iOS and Android exports BUILD. What still stands between this template and a
     StoreKit/Play Billing lane is §6.112's corrected premise, not a defect: the native exports read
     `Modules/` and the lockfile, so a package declared by path in `packages` never reaches a device
     build. THE ASK (upstream): one package declaration, three lanes — the native exports honour the
     same `packages` list the web build honours, refusing loudly for a package with no lane. Until
     then `has('store')` is false on device and the purchase surfaces refuse exactly as they do today,
     and turning the lane on also needs product ids and a RevenueCat secret that only an operator can
     supply.

116. **THE SERVER RENDERS THE DESKTOP CHROME FOR A PHONE, AND THE CLIENT SWAPS IT AFTER
     HYDRATION** (measured 2026-09-02 on the local origin). `curl` with an iPhone user agent
     returns a page carrying 18 `TopNav`-owned nodes and 13 `TabBar`-owned nodes; a 390px
     Playwright client then logs `[dsx hydrate] mismatch in <App> at <TabBar>#217: visible-if
     diverged (client true, server rendered nothing) — dsx.variable.wide == false — subtree
     replace-mount`, `<AuthSeam>#218: component root missing or mis-owned — replace-mounted`,
     and `<vstack>#0: 2 unmatched server element(s) removed`. The server has no viewport, so
     `bp` resolves to the wide lane at render time and every phone load paints desktop chrome
     for one frame before the tab bar mounts. The engine fails open exactly as documented — this
     is not a hydration bug, it is the cost of choosing a lane by `dsx.screen.width` on a plane
     that has none at SSR time.

     **THE ASK (upstream):** seed `dsx.screen.width` at SSR from what the request DOES carry —
     `Sec-CH-Viewport-Width` / `Viewport-Width` client hints where present, else a mobile user
     agent → the phone breakpoint — so `bp` computes the same lane the client will, and the
     hydration mismatch becomes the exception it was designed to be. Until then this template
     accepts the swap; it does not hide the bars with CSS because the two lanes are different
     TREES, not different styles of one tree.

117. **A BOUND `<pager>` HAD NO ROWS ON ANDROID, AND A CHILD `<Theme/>`'S FUNCTIONS NEVER LEFT ITS
     OWN STORE** (found 2026-09-02; fixed upstream dev@b2a14107 · 353da3ee). Two Home defects with
     one screenshot each. (1) `Pager()` read `bind=` as an alias of the page INDEX and always paged
     the static children, so the hero template rendered once with no `item` — an empty box where
     iOS and web paint the poster. The decision is now a pure function (`RepeaterSemantics.pagerPages`:
     `bind` → rows through the shared `bound()` seam, first child = template, page keys = row keys;
     no `bind` → children; `value=` alone is the index), matching `Pager.swift` and the web's
     `mountBoundPager`, pinned by `Conformance/layout/repeaters.json` with Kotlin executors (the TS
     and Swift decisions stay inline — disclosed in the layout README). (2) The VIP gem was white
     and the picker a bare glyph because `brand()`/`gemLift()`/`languageRows()` — `<functions>`
     declared by the child `<Theme/>` mount — were registered surface-LOCAL into the child's own
     store; the dispatch called `JSE.registerFunctions` and never `StackStore.registerHeadFunctions`,
     the core seam that routes on `global`. The corpus README even claimed it did. Not an ordering
     problem: computeds re-evaluate per read. Red→green: `HeadFunctionBlockTest — on another surface:
     expected #E52E2E, got null`. The picker needed no change of its own.

118. **TWO ANDROID GAPS SCOPED, NOT LANDED, so the next pass does not rediscover them.** (a) MAIN-AXIS
     ALIGNMENT: `justify-content: flex-end` places the hero's copy at the bottom on iOS and web and at
     the TOP on Android (`parity/android/after-home-5556.png` vs the iOS capture) — the three
     positional values are not bridged to the Compose arrangement, though the distributions are
     (§6 "upstream #238"). (b) PER-EDGE BORDERS: `border-top/right/bottom/left` have no native target
     on either lane — both pipelines draw one uniform stroke and both bridges map only the
     shorthands, so every 1px hairline in this template (`TabBar.dsx:15`, `App.dsx:743`,
     `Show.dsx:446/506`, the Profile rows) is web-only and Android logs `border-top … inert` on every
     Home render. Landing it is a catalog key on four renderers plus three gates, both native stroke
     paths, both bridges with `css-bridge.json` rows, and the web `borderDecls` emitter. Both are in
     flight upstream as this is written; the template changes nothing for either — the markup is
     already the right markup.
