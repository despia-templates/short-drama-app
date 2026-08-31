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
