# short-drama-app — the founding plan

> **Status: PLANNING.** Not one line of DSX exists yet, deliberately. This file is the spine;
> every document under `docs/` hangs off it. When a decision here conflicts with the framework,
> the framework wins and this file gets a correction — never the other way around.
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
  `<egress>`; deployed via the Workers bootloader (`@despia/server`), with identity, declared
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

1. **VerticalPlayerStack web facet.** No `web/` twin exists; the SSR web app needs the same
   player/paywall behaviour. Article 10: supported, polyfilled, or platform-limited-with-named-
   degradation. The fix belongs in the module (a `web/index.js` twin over `<video>`/`<pager>`),
   not as a template-side fork.
2. **Role-gated auth in the server grammar.** `<route auth="required">` exists; the Manage
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

### Filed from the implementation slice (2026-08-29, all reproduced on dev@92b844b0)

6. **`<webhook>` parity in the standalone server compile** — the monorepo grammar has it;
   `server-document.ts` aborts on it. Blocks the RevenueCat receiver outside the monorepo.
7. **Operator/service authority for declared actions** — `repoFor` pins user scope and
   `serviceRepo` is deliberately unreachable from documents, so no `<server>`-grammar path
   can write a public-read entity. The Manage bridge runs on host-gated internal TS twins
   (scripts/serve.mjs) until `auth="role:…"`/an authority word lands. This is §6.2's
   server-side face and RFC 0003 §5's concrete blocker.
8. **Stored-null truthiness diverges within the TS runner** — literal `!null` is true, but a
   stored null is NSNull and `!x` yields false / `if (x)` runs. The corpus is silent; the
   intra-runtime disagreement is the defect. Template idiom until pinned: `x == null`.
9. **JSE value semantics traps** — `arr.push` on a read is a silent no-op (concat-write-back
   is the idiom); 2-arg `Array.map((v, i) => …)` misbinds; explicit `field: null` in
   `data.create` values fails the statement (omit the key).
10. **Wire serializer elides repeated dict references as null** — a row appearing on two
    rails serializes once, then null. Actions must return value copies per collection.
11. **`<api>` `send()` posts its argument verbatim** — the documented `send({ body: X })`
    double-wraps; `send(X)` is what works. Docs/impl divergence, pick one.
12. **Web renderer gaps in list/pager/style planes** — nested repeater row templates lose
    `item.*` scope; per-node text styles are dropped inside `<pager>` rows (the external
    overlay bound to the resting page is the workable pattern, and honestly the better one);
    `zstack` ignores `align`/`width`/`height` attrs; `<image>` size attrs don't emit
    (`<video>`'s do); component-invocation attrs in row templates don't resolve row scope;
    one unsupported property drops a whole `style=""` declaration (`vh`, `position`,
    `conic-gradient` are outside the vocabulary — screen facts `dsx.screen.*` are the
    portable full-bleed spelling).
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

    Nothing in this row is an upstream item. It stays in the ledger as the correction of
    record, because a template that silently deleted a wrong claim would teach the next
    reader nothing.

14. **`vars.*` (route params) resolve in markup but not in action bodies** — mirror them into
    a variable at boot, or pass them through declared action inputs (inputs snapshot at call
    time in caller scope, which markup provides).

15. **The MCP face, measured end-to-end (2026-08-29).** `<tool>` rows in `server/admin.dsx`
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
    c. **`@despia/server` exports no way to serve them.** `despia build` emits `mcpTools`
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
