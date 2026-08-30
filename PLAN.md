# short-drama-app — the founding plan

> **Status: BUILT — production-shaped local slice.** Sixteen components, seven server
> documents, 29 routes, 14 entities; Stripe web checkout, the coin economy, the earn loop
> and the Manage surface all run against real Postgres with real RLS. This file is the
> spine; every document under `docs/` hangs off it, and §6 below is the measured upstream
> ledger. When a decision here conflicts with the framework, the framework wins and this
> file gets a correction — never the other way around.
>
> Source of truth for the framework: `despia-native/despia-framework` **dev branch**
> (locally `~/despia_dsx/despia-framework`, verified at `92b844b0`, 2026-08-29). The public
> `despia-native/despia` is the Apache-2.0 open drop of the same tree. Facts below were read
> from that tree on 2026-08-29, not assumed.

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

26. **A root-relative `<api url="/x">` cannot be fetched during SSR** — NOT YET FILED; fixed
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

27. **`exportStatic`'s DATALESS export shadows live SSR seeding** — NOT YET FILED; fixed
    upstream in this pass (same session). `dsx build` prerenders route HTML with no API host
    running, so each file holds that route's null-data branch — a spinner where the component
    declares a loading state, an empty shell otherwise (re-measured with the server stopped:
    Vip exports its headings and a wallet reading "— coins"; Discover exports "Loading the
    feed"). `createSiteHandler` served files BEFORE the page handler, so on a running server
    those files permanently shadowed the live render and seeding could never reach a browser.
    Fix: route paths (exact, non-pattern) go to the live renderer first — `preferLivePages`,
    default true, opt-out for a CDN-shaped deployment whose exports are authoritative.
    Assets are untouched, being route paths in no route table.

28. **The universal-attribute census omitted seven DOCUMENTED attributes** — NOT YET FILED;
    fixed upstream in this pass. `Documentation/reference/stack-elements.json` listed 30
    universal attributes; `href`, `shared`, `sharedMode`, `sharedAnim`, `sharedOrder`,
    `lockOrientation` and `dismissEdge` were missing, though all are documented as universal
    and `href` is honoured by `mount.ts` and demonstrably navigates. A CLI rebuild exposed a
    newer linter against the stale census and 29 valid `href` usages became hard errors —
    i.e. the census, not the reference, was deciding what the language allows. Census now 37.
    The deeper ask: this file is hand-maintained beside the reference it encodes, with no
    test proving the two agree.

29. **Router motion has one knob too few for GLOBAL CHROME** — NOT YET FILED; fixed upstream
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

30. **`<api cache="swr(...)">` cannot survive a MOUNT, so the cache's most valuable case is
    unreachable** — NOT YET FILED (measured 2026-08-30, from "page change reloads data and
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

31. **`await` inside a TERNARY branch silently yields a non-ok result (server action)** —
    NOT YET FILED (isolated 2026-08-30 building the related rail). `const pool = cond ? await
    data.show.list(A) : await data.show.list(B)` returned a value whose `.ok` was falsy, so a
    "More like this" rail came back EMPTY for a genre with two live shows — no throw, no log,
    no rejected envelope, just no data. ISOLATED: with the identical `let pool` and the same
    two calls written as an if/else with statement-level `await`, the rail fills correctly.
    Every other await in this file is a plain assignment, which is why nothing else hit it.
    The ask: either support `await` in a conditional expression or make it a LINT ERROR — a
    silent wrong answer in the money/catalogue path is the worst of the three outcomes.

32. **Route params are not readable from a plain `<variable>` initializer, and a bare route
    listed before its parameterised sibling captures the URL** — NOT YET FILED (both measured
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

33. **No declared cross-platform key-value storage** — NOT YET FILED (found 2026-08-30 adding
    recent searches). `global.*` is in-memory and dies with the page; the module catalogue has
    no `storage`/`prefs`/`kv` scheme, and the skills' "Haptics, storage, camera: everything
    native is a module call" names a capability that has no module. So anything a template
    wants to remember across launches — recent searches, a playback-speed preference, an
    onboarding-seen flag — has no portable home. Reaching for web localStorage would make one
    renderer behave differently from the other three, which Article 7 forbids without a named
    degradation. Recent searches are therefore session-scoped and say so in place.

34. **The bundled face was unreachable: no app could link a stylesheet into its head** —
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

35. **Only `push` animated: a `replace`/`reset` hard-cut, and a route override could not name
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
