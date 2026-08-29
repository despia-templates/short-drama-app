# RFC 0003 — Project Admin Surfaces: Manage View

> **Status: DRAFT for upstream (despia-framework).** This is the template program's one real
> framework proposal. It composes three shipped/proposed mechanisms — the backend's declared
> documents, Despia Apps' slot-grant-seam grammar, and the MCP facet projection — into the
> thing agencies and founders actually hand a client. It introduces **no new engine**: one new
> slot family, one new residence, one first-party component kit.
>
> **The positioning frame (docs/positioning.md):** Despia's answer to "what happens after
> AI builds it" is a pair of Views over one application model — **App View** (understand:
> the real application drawn from its declared source) and **Manage View** (operate: this
> RFC). The developer understands through App View; the client operates through Manage
> View; both read the one model. Neither is a diagram someone maintains or a summary that
> can hallucinate.
>
> **One sentence:** a project declares its own operator surface — DSX components over its own
> declared entities and actions, mounted by Despia's dashboard, mobile app and Studio,
> projected automatically to MCP — so the client gets a surface that is hard to mess up while
> the developer keeps the repo, and the same declaration drives UI, AI and notifications.

## 1 · The problem, precisely

Every serious app template needs an admin: content in, pricing tuned, campaigns sent,
refunds handled. Today a template author has two bad options:

1. **Build an admin app inside the app** (the industry default). It becomes an alien: not
   visible to the Despia editor's project model, not reachable by the platform MCP, not
   rendered in Despia mobile, secured by hand, versioned by luck.
2. **Give the client the Studio.** The Studio edits 100% of the UI and logic — that is its
   point — which is exactly why a freelancer cannot hand it to a restaurant owner. The CMS
   industry solved this decades ago (the admin/site split); the dynamic-app version does not
   exist yet.

The missing concept: **project scope** — a *declared, limited* operating surface over an
unlimited underlying project. Developer: full DSX. Operator: the declared surface, everywhere
Despia renders (web dashboard, mobile app, MCP, push), with the platform's own auth,
consent ledger and audit line underneath.

## 2 · What already exists (this RFC adds the delta only)

| Mechanism | Status | What Manage reuses |
|---|---|---|
| `<server>` documents | LANDED | entities (RLS/ownership), actions, routes, workers — *"a declared body is a parsed tree: lintable, budgetable, displayable in a dashboard"* (backend-authoring §1.3 — that sentence is this RFC's warrant) |
| Despia Apps (studio-apps v1) | PROPOSED 2026-08-28 | contribution rows, closed slot vocabulary, closed grant vocabulary, seam-list residences, budgets, `StudioAppSurface` mount, events, the agency ladder |
| `facets.mcp` + MCP Apps + `mcp-face.ts` | LANDED | action→tool derivation, `mutates` approval, `.dsx` tool faces, the server's remote MCP face |
| Dashboard / Despia Mobile / product-vision §§5–7, 26, 30 | VISION/BUILD | the operator client this plane renders in |

## 3 · The grammar: `facets.apps` grows a `manage.*` slot family

A project's own packages (and installed apps, same rows) contribute:

```jsonc
"facets": {
  "apps": {
    "shows": {
      "slot": "manage.section",                 // a destination in the project's Manage surface
      "component": "Admin/Shows.dsx",
      "title": "Shows", "icon": "film",
      "grants": ["data:show", "data:episode", "data:asset", "action:catalog.publish"]
    },
    "revenue-card": {
      "slot": "manage.card",                    // overview card (the dashboard.card shape, project-scoped)
      "component": "Admin/RevenueCard.dsx",
      "grants": ["data:rollup"]
    },
    "publish-episodes": {
      "slot": "manage.action",                  // ONE-CLICK verb row (product-vision §30) — renders as a
      "title": "Release next episodes",         //   button in dashboard/mobile AND a push action AND an MCP tool
      "run": "Server/Catalog.dsx#releaseNext",
      "grants": ["action:catalog.releaseNext"],
      "confirm": "summary"                      // the action's declared summary is the confirm sheet
    },
    "drop-alert": {
      "slot": "manage.notify",                  // operator push: event → notification to Manage members
      "on": "entity.ad-receipt.flagged",        //   tap → opens the bound manage.section (or the data row)
      "open": "shows",
      "grants": ["notify:operators"]
    }
  }
}
```

Slot semantics (all additive within `studioApi`; removals major, per the contract law):
`manage.section` (full destination, 340px-panel/full-window rules inherited),
`manage.card` (overview), `manage.action` (one-click verb; **the** §30 unit),
`manage.notify` (event→operator push binding). `tool` and `automation` are NOT duplicated —
existing slots already cover agent tools and event automation; Manage rows *project into*
them (§6).

## 4 · The `manage` residence — sixth seam list, smallest one

Same sandbox (JSE, no imports, budgets), same fail-closed law, new table — and the table is
mostly *derivation*, because the backend already declared everything:

| Chain | Gate | Backed by |
|---|---|---|
| `manage.data.<entity>.{list,get,create,update,archive}` | `data:<entity>` grant **∩ role row** (§5) | the entity's declared CRUD routes — **never a parallel API** |
| `manage.action.<doc>#<action>` | `action:<name>` grant ∩ role | the declared route/worker action |
| `manage.media.upload` | `data:<entity>` on an asset-typed entity | the asset plane (R2 presign) |
| `manage.notify.send` | `notify:operators` | platform push to project members by role |
| `manage.audit.list` | ambient (read-own-project) | the change-set/attribution plane |
| anything else | `forbidden`, naming the grant | the closing arm |

**Hard-to-mess-up is a property of the seam, not of the UI**: an operator surface physically
cannot reach an entity or action its rows don't grant — no matter what the component tries,
no matter what an AI tool call asks for. Destructive verbs are `archive` (soft) by default;
hard delete is not on the seam (recovery story, §8).

## 5 · Roles (the one genuinely new platform primitive)

Grants say what a *surface* may reach; roles say what a *person* may. Project membership
gains roles — `owner`, `operator` (client-grade), `developer` — recorded in the consent
ledger like every grant today. A manage row may declare `roles: ["owner","operator"]`
(default: all members). The same roles gate the backend routes (`auth="role:operator"` —
the upstream grammar item, PLAN.md §6.2), so UI and API cannot disagree.
End-user auth (the app's viewers) is untouched — this is project-member auth, the accounts
Despia already has (store-policy constraint respected: management clients only).

## 6 · One declaration, four renderings

1. **Dashboard web**: Manage tab per project — cards, sections, action rows.
2. **Despia Mobile**: the same contributions, mobile-first (AdminKit components are
   phone-first by rule); manage.notify lands as real push; tap-through opens the section.
   This is product-vision §5's "remote control", extended from *the software business* to
   *the app's own domain*.
3. **MCP**: every `manage.action` row and granted entity CRUD projects as MCP tools on the
   project's server MCP face (`mcp-face.ts`) with the `mutates` approval semantics —
   the client manages the app from ChatGPT/Claude with the same seam guarantees. No
   separate MCP config: the projection *derives* (facets.mcp law: no second schema, ever).
4. **Studio**: sections mount read-write for developers (grants still apply) — useful during
   build, and the recursion proof: the Manage surface is DSX, edited in DSX, rendering data
   declared in DSX.

## 7 · AdminKit — the component vocabulary (first-party package, `shelf: open`)

`despia add github:despia-native/admin-kit`: `<EntityTable>` (server-driven columns from the
entity declaration, filters, bulk archive), `<EntityForm>` (typed fields from the schema,
validation from declared constraints), `<MediaDrop>` (asset-plane upload with encode status),
`<StatCard>`/`<TrendCard>` (rollup-fed), `<PushComposer>` (segment picker + template +
schedule, preview-on-device), `<PrizeTableEditor>`, `<FlagList>`, `<AuditTrail>`,
`<ActionRow>`. All pure DSX over primitives (Article 10 by construction), all mobile-first,
all theme-fact clean. **The kit is why template admins converge in quality** — the same way
the design language made web defaults premium. The short-drama template is its first
consumer and its fixture farm.

## 8 · Operations: versioning, failure, recovery

- **Versioning**: manage rows live in the project repo — the admin ships in the same tag as
  the feature it manages; there is no "update the dashboard separately" state. A release
  that adds an entity adds its section in the same diff (the RFC 0001 review checklist asks).
  Contribution rows are validated at build: a row naming a dead action fails the build, not
  the client's Tuesday.
- **Failure**: manage surfaces get the platform error plane free — a failing action names
  its declared error; repeated failures raise a `manage.notify` to owner+developer with a
  **Fix with AI** deep link (Studio agent, pre-loaded with the action, the error, the logs —
  product-vision §§24–25) and an **open in IDE** handoff for repo-holders.
- **Recovery**: the 48h law — every mutation through the manage seam is change-set-attributed
  (`operator:<member>` the way app writes are `app:<scheme>`), entities archive rather than
  delete, and the events plane retains 48h raw (backend.md §2) — so "undo what happened
  Tuesday" is a ledger walk, not a database restore. Beyond 48h: rollups + the repo history.
- **Agency ladder applies**: `manage.action` rows are Prepare-grade by default (confirm
  sheet); `automation` rows that touch manage grants need `automation:auto` for silent runs —
  identical to studio-apps §7, no new policy.

## 9 · What this is NOT

Not a CMS bolted beside the app (the declaration lives in the app's own packages); not a
page builder (operators don't edit UI, they operate declared verbs and data); not a second
API (every chain resolves to declared routes/actions); not a Studio-lite (no project editing
on this plane, ever — that is what makes it safe to hand over).

## 10 · Open questions for upstream

1. Word choice: `manage.*` slots vs a separate facet word (`facets.manage`). Recommendation:
   slots within `facets.apps` — one grammar, one validator pair, one mount host; the plane is
   an *audience*, not a new mechanism.
2. Do `manage.notify` rows ride OneSignal (app-level) or the platform's own push to Despia
   Mobile? Recommendation: platform push (operators are Despia accounts; the app's OneSignal
   is for its *viewers*), with an optional bridge row for standalone-admin-app builds.
3. Roles: minimum viable set above vs. free-form named roles. Recommendation: fixed three for
   v1 (the consent ledger stays legible), free-form deferred with a wake trigger (first
   agency with >3 real roles).
4. Interim mounting before Dashboard/Mobile render manage slots: an ordinary in-app route
   behind `role:operator` composed of the same components (the short-drama template does
   this in Phase 5) — grammar-identical, so graduation is a manifest edit. Confirm this is
   blessed as the documented bridge, so nobody builds alien admins "until Manage lands".
