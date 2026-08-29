# RFC 0002 — Template governance: the org, the flow, the fleet

> **Status: DRAFT for upstream.** Target: the `despia-templates` GitHub org (files:
> `templates.json`, org profile, shared workflows) + despia-platform (catalog page, fleet
> bot). Model: the registry plan's own directive — *"OSS and lean; git is the source of
> truth; an index generated from the GitHub API; the community lives on GitHub."*

## 1 · The three layers (copied from the registry, deliberately)

| Layer | Lives | Fails how |
|---|---|---|
| **Truth** | semver tags on `despia-templates/<name>` (official) or any author's repo (community) | only if GitHub is down |
| **Submission** | `templates.json` — one flat list, added by PR | never; it is a file |
| **Discovery** | generated index + despia.com/templates + the editor's New-Project picker | degrades; `despia create` still works |

Two shelves, mirroring the packages/apps trust split:

- **Community templates** — listed, denylist-moderated, badge shows computed shelf usage.
  Listing is not endorsement.
- **Official templates** (`despia-templates/*`) — pass RFC 0001 gates in CI, human review,
  signed release (tree-hash-bound, the apps-shelf machinery). These are the training-data
  shelf and the editor's default picker.

## 2 · One repo per template, one shape

`despia-templates/<name>`: the app tree + `docs/` (product/architecture/setup) + `AGENTS.md`
+ `.github/` from the org's shared workflow set (gates of RFC 0001 §4 as reusable actions).
Issues and Discussions ON. The org profile README states the contract (§3, §4) so every repo
inherits it by link, not by copy-paste drift.

## 3 · Issues: the routing law (where the no-hacks rule becomes process)

Every template repo triages to exactly one of:

| Label | Meaning | Action |
|---|---|---|
| `template-bug` | the template misuses the framework | fix here, patch release |
| `framework-gap` | the framework cannot express the need | **file/link upstream issue in despia-framework; this issue blocks on it**; interim = Article 7 degradation, documented in the template ledger — never a workaround commit |
| `content/docs` | copy, demo content, setup docs | fix here |
| `feature-request` | new template capability | milestone or decline with reason |

The `framework-gap` lane is the enforcement of PLAN.md law 1. A maintainer merging a
workaround instead of filing upstream is the one review failure the org treats as severe,
because the workaround becomes AI training data (RFC 0001 §1).

## 4 · Contribution flow

CONTRIBUTING.md (org-shared): DCO sign-off; PR template asks the two gate questions
("does this teach an agent something wrong?", "does this belong upstream?"); CI runs the
RFC 0001 gates; human review by the template's CODEOWNERS (min 1 core maintainer); squash
merge; release = tag + changelog + migration note. Contributors to official templates sign
nothing beyond DCO — the trees are Apache-2.0 (rfcs/0004 §1).

## 5 · The fleet problem (thousands of templates, one framework moving)

- **The matrix is CI, not people**: a nightly org-level workflow builds every official
  template against (a) its pinned framework and (b) latest framework tags. A red (b) cell
  opens a tracked issue *before users find it*.
- **The fleet bot** (platform-side): when a framework release lands, it opens bump PRs
  across `despia-templates/*` (lockfile + migration notes), CI gates them, maintainers merge.
  Same bot offers downstream *projects created from templates* an update PR (opt-in,
  editor-surfaced) — forks get proposals, never pushes (RFC 0001 §6).
- **Health page**: the discovery index carries per-template freshness (framework delta,
  open `framework-gap` count, last release). A template can be marked `maintained`,
  `seeking-maintainer`, or `archived` — archival keeps the tag history working forever
  (truth layer never depends on maintenance).
- **Capacity rule**: an official template requires a named maintainer (person or team) at
  submission. No maintainer, no official shelf — community shelf instead.

## 6 · Handoff: developer → client (the custody chain)

The scenario the admin plane (rfcs/0003) exists for: an agency builds from a template,
the client operates it.

1. **Roles at the platform**: project owner (client) vs developer access — grants recorded in
   the consent ledger (master-plan law 3); the developer's access is listed, scoped,
   revocable.
2. **The client's surface** is Manage View: they see admin contributions, the dashboard
   cards, the Despia mobile app, their MCP tools. They never need the Studio to run the
   business; opening the Studio is not forbidden, it is simply never required.
3. **The developer's surface** is the repo + Studio + raw database. Post-handoff changes flow
   through releases; the client sees "update available" with the developer's notes.
4. **Transfer is an act**: billing, Cloudflare account ownership, store accounts, and secret
   custody move to the client at handoff (checklist rendered by the platform from the
   template's `services` block). Templates are built assuming this day comes — that is why
   secrets are `<secret env>` rows and infra is the client's own Cloudflare from deploy one.

## 7 · Business flow (who pays for what)

- Templates: free, open, Apache-2.0 — they are demand generation and training data.
- Despia monetizes where it already does: managed builds/CI for premium-shelf native lanes,
  hosted platform conveniences, support. A 100%-open-shelf template is fully self-hostable
  free forever (rfcs/0004 §3) — that claim is load-bearing for trust and is CI-verified.
