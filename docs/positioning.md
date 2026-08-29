# Positioning — what Despia is, said once, bound to what ships

> **Status: DOCTRINE (owner-stated 2026-08-29).** This is the positioning the template
> program serves and every template communicates. The company-wide source of truth for
> marketing claims is `despia-framework/IDENTITY.md`; this file is the template program's
> local copy of the doctrine plus the obligations it creates *here*. Per the IDENTITY rule:
> say what is enforced, not what sounds good — hence the claims ledger (§6).

## 1 · The category map

| Category | What it does | What it leaves you with |
|---|---|---|
| **Vibe coding** | prompts an application into existence | a repo you must either keep re-prompting an AI about, or spelunk by hand |
| **No-code** | builds visually inside a closed abstraction | a boundary: outside it you hit limits, add workarounds, or rebuild elsewhere |
| **Cursor / Claude Code / Codex** | help developers edit the repository, fast | the human still reconstructs the system from files, folders, imports, and logs |
| **Despia** | **the application model** that humans, AI, web, native, backend, deployment, and management all understand | an application that explains itself |

Despia is not competing on the *generate* moment. It solves what happens **after**: once
the application is large, someone must understand what AI created, find where behavior
lives, fix problems, operate the product, update it, and hand it over safely. Vibe-coding
leaves two options — re-prompt and hope, or grep the repo. Despia adds the third:
**the application visually explains itself.**

## 2 · The two Views (one model, two audiences)

- **App View — understand.** Screens, workflows, APIs, database tables, storage,
  infrastructure, external services, agent tools, costs, and the relationships between
  them, in one logical representation **generated from the real DSX source**. Not a diagram
  someone maintains; not an AI summary that can hallucinate. The real application, drawn.
  *"In Despia, the code is the documentation."*
- **Manage View — operate** (rfcs/0003). The declared, limited, safe operating surface a
  developer hands a client: for this template — add a show, upload an episode, schedule a
  release, feature content, change coin pricing, send a notification, inspect revenue,
  manage viewers. Authored in DSX, versioned with the project, rendered in Despia Mobile,
  projectable to MCP so the client can operate the app from ChatGPT or Claude. Much bigger
  than a CMS: a **project-specific operating interface generated from the same application
  model.**

The pair is the positioning in miniature: the developer understands through App View; the
client operates through Manage View; both read the one model.

## 3 · One system, many doors (the anti-no-code claim)

The visual editor is one interface over a complete framework — never the product boundary.
The same application can be: built visually · built through AI · edited as DSX source ·
controlled through MCP · managed through the CLI · rendered as a real web application ·
rendered through native iOS and Android kernels · deployed to infrastructure the customer
owns · inspected through App View · operated through Manage View.

Beginners and professionals use the **same system** — no toy tier, no separate "real" stack.
The proof with teeth: **Despia is built in Despia.** The editor, platform surfaces, backend
logic, tools, and first-party apps ride the same DSX model customers get.

## 4 · Coexistence, not replacement

Cursor and Claude Code help AI edit the code. **Despia helps humans and AI understand the
application.** Agents connect through Despia MCP and receive structured knowledge of the
app (declared actions, entities, routes, facets — not a folder listing); humans inspect the
result in App View instead of reconstructing it from source. We integrate with every agent;
we replace none.

## 5 · The lines (canonical copy)

- Primary: **"AI can build your application. Despia makes it understandable, maintainable,
  operable, and truly yours."**
- Short: **"AI writes the software. Despia shows you what it means."**
- App View hook: **"Stop searching through folders to understand your application.
  Open App View."**
- Strategic: **"Despia makes professional software development simpler without making it
  less professional."**
- Never lead with "build apps with AI" — everybody says that.

## 6 · Claims ledger (what backs each claim today — framework dev@92b844b0)

| Claim | Backing today | Honest status |
|---|---|---|
| "Generated from the real DSX source" | every dsx.json declares actions/args/errors/tests; `<server>` documents are parsed trees ("lintable, budgetable, displayable in a dashboard"); the `<api>` dependency graph registers at compile time; `/edit/api/graph` serves the catalog | **enforced** — the model is declared, not inferred |
| App View as one assembled surface | `OpenSource/Flow` (node-and-edge canvas, pure DSX, every renderer) is the drawing substrate; live-logs already lands "in the App view"; costs ride the spend plane | **assembling** — say "App View" as product direction, demo what renders today, do not enumerate panes that don't exist yet |
| Manage View | RFC 0003 (this program's framework proposal), composing landed machinery (Apps slots, seams, MCP facets) | **proposed** — templates build the bridge form now (in-app route, same components) |
| "Built in Despia" | Dashboard, Editor, Platform are in-tree DSX packages | **true and strengthening** — "increasingly our own first-party applications" is the accurate tense |
| "Infrastructure the customer owns" | Cloudflare OAuth deploy to the customer's account; open Workers/Node/Deno bootloaders | **enforced** |

## 7 · What this doctrine binds the template program to

1. **Templates are the positioning, demonstrated.** An official template is a complete,
   maintained software product foundation — web app, native apps, backend, database model,
   infrastructure config, management tools, MCP capabilities, deployment automation,
   upgrade paths, tests, documentation, client handoff (the completeness contract,
   rfcs/0001 §4a). Deploy a working web product immediately; understand it in App View;
   operate it in Manage View; customize with AI; ship native later.
2. **App View legibility is a quality gate.** Everything declarable is declared (entities,
   actions, routes, workers, facets, config) — a template that hides behavior in opaque
   script bodies breaks "the code is the documentation" and fails review (rfcs/0001 §4).
3. **The no-hacks law is positioning enforcement.** A workaround is invisible to the model,
   therefore invisible to App View, therefore a lie in the documentation. Same law, second
   reason.
4. **Every template README leads with the doctrine**, not with "built with AI": what you
   can see (App View), what your client can do (Manage View), what you own (repo +
   infrastructure), and which agents can drive it (MCP).
