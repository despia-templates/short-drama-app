# RFC 0001 — What makes a repo an official DSX template

> **Status: DRAFT for upstream.** Target home: `despia-framework
> OpenSource/Documentation/architecture/proposals/templates.md` (the grammar + validators) and
> the despia-templates org (the checklist as CI). Written in this repo because the short-drama
> app is the proving template; ratification happens upstream, in the framework's process.
>
> **One sentence:** a template is an ordinary DSX app repo — App.json + packages + documents,
> resolvable by the registry mechanics — whose `dsx.json` carries a `template` block that
> machines (CLI, editor, MCP, agents) can *execute*, and which passes gates strict enough that
> the tree is safe to learn from.

## 1 · Why templates get a standard at all

Three consumers, one tree, no privileged one:

- **Humans** clone it and read it. It must explain itself (the framework's comment register).
- **AI agents** are *trained and steered by it*. Every official template is deliberately
  AI training data; a hack shipped in a template is a hack taught to every future agent.
  This is the strongest quality argument and it is a one-way door — hence the gates (§4).
- **Machines set it up**: the editor's deploy link, `despia create`, and MCP hosts need the
  setup story as *data*, not as a README paragraph.

## 2 · A template IS an app repo (no new distribution)

Registry law applies verbatim: git repo, `dsx.json`, bare semver tags, resolved by
`despia add` / `create-despia`, pinned by commit SHA + tree hash. A template is
distinguishable from any other package repo by exactly one thing: the `template` block.
There is no template server, no upload step, no separate format to rot.

## 3 · The `template` block (dsx.json, top-level key — the `studioApi` pattern)

```jsonc
{
  "name": "ShortDrama",
  "scheme": "shortdrama",
  "version": "1.0.0",
  "template": {
    "templateApi": 1,                       // the envelope; durability P1 pattern
    "title": "Short Drama",
    "summary": "ReelShort-class vertical drama: SSR web, native apps, coins, ads, admin.",
    "category": "media",
    "surfaces": ["web", "ios", "android", "server"],
    "services": {                           // what a deploy needs; the editor renders this
      "required": ["cloudflare"],           //   as the setup flow, the CLI as prompts
      "optional": ["admob", "revenuecat", "onesignal"]  // app runs degraded without them (Article 7)
    },
    "secrets": ["ADMOB_SSV_KEYS_URL", "REVENUECAT_WEBHOOK_SECRET", "ONESIGNAL_API_KEY"],
    "setup": [                              // machine-runnable, ordered, idempotent
      { "step": "deploy",  "doc": "server documents → Workers" },
      { "step": "seed",    "action": "admin.seedDemo", "summary": "3 demo shows, tasks, prize table" },
      { "step": "connect", "service": "admob",      "doc": "docs/setup/admob.md" },
      { "step": "connect", "service": "revenuecat", "doc": "docs/setup/revenuecat.md" },
      { "step": "connect", "service": "onesignal",  "doc": "docs/setup/onesignal.md" }
    ],
    "demo": { "seeded": true, "resettable": true }   // every template boots to a WORKING app
  }
}
```

**Computed, never declared:** consumed modules and their shelves. The validator walks the
dependency tree and *derives* the disclosure (`open` vs `premium` — rfcs/0004); an author
cannot understate licensing by editing a field. Same twin-validator pattern as studio-apps:
Ruby in-tree, TS in `@despia-native/cli`, one conformance fixture so they cannot drift.

## 4 · The gates (CI on every template repo; the official shelf requires all green)

1. **Framework-clean**: `dsx build` + lint + the conformance relevant corpora green on every
   declared surface. No vendored framework forks, no patched modules, no `node_modules`
   escape hatches. **The no-hacks law is a gate**: a diff that works around a framework
   limitation is rejected with the upstream issue link as the required fix.
2. **Article 10 honesty**: every feature ships on all declared surfaces or names its
   degradation in the template's own ledger (`docs/product/spec.md` "definition of done"
   section here is the model).
3. **Boots to working**: fresh deploy + seed step = a usable app with demo content, no manual
   database surgery. `demo.seeded` is tested, not asserted.
4. **White-label discipline** (Article 4 downstream): strings via attributes/locales, colors
   via theme facts, numbers via config — CI greps for user-facing literals in `.dsx`.
5. **Secrets hygiene**: only `<secret env>` names; `settings.example.env` complete; repo
   history scanned.
6. **Explains itself**: `README.md` (product), `AGENTS.md` (how agents work here — the
   framework's own three-file pattern scaled down), per-doc comments at the Paywall.dsx
   register. A template with clean code and silent files fails review.
7. **Store-shippable**: `despia shot` assets build; privacy declarations enumerable from the
   consumed modules' manifests (the module suite already declares its data use).
8. **App View legibility** (docs/positioning.md §7.2): everything declarable is declared —
   entities, actions, routes, workers, facets, config. Behavior hidden in opaque script
   bodies breaks "the code is the documentation" and fails review. Declared action `tests`
   are present and green (the registry already gates their correctness); template-level
   flows carry conformance-style fixtures.

## 4a · The completeness contract (what "official template" promises)

An official template is not starter source code; it is a complete, maintained software
product foundation. The checklist, verbatim from the positioning doctrine — a submission
missing a row names the row and the reason:

| # | Included | Where the gate checks it |
|---|---|---|
| 1 | the web application | §4.1–2, SSR pass |
| 2 | the native applications | §4.1–2, conformance matrix |
| 3 | the backend | server documents deploy in §4.3 |
| 4 | the database model | declared entities (§4.8) |
| 5 | infrastructure configuration | `template.services` + deploy emit |
| 6 | management tools | Manage View contributions (rfcs/0003) |
| 7 | MCP capabilities | facet projection present (§5) |
| 8 | deployment automation | `template.setup` runs end-to-end (§4.3) |
| 9 | upgrade paths | §6 versioning + migration notes |
| 10 | tests | declared action tests + fixtures (§4.8) |
| 11 | documentation | §4.6 explains-itself |
| 12 | client handoff | rfcs/0002 §6 checklist renders from the manifest |

## 5 · Ergonomics per consumer

- **CLI**: `despia create shortdrama` → scaffold from tag → run `template.setup` steps
  interactively. `despia doctor` re-checks services.
- **Editor / deploy link**: `despia.com/new?template=github:despia-templates/short-drama-app`
  → same `setup` array rendered as the onboarding flow (rfcs/0004 §4 owns the link contract).
- **MCP / agents**: the template block is served by the project's MCP face as `template.info`
  + `template.setup.status`, so an agent can *finish* an interrupted setup. Skills:
  `Skills/` folder in-template for app-specific agent guidance (e.g. "adding a show",
  "changing the economy") — the framework's Skills pattern, project-scoped.

## 6 · Versioning + updates (consumed by rfcs/0002)

Templates pin framework packages via `dsx.lock.json` like any app. A template release =
a git tag + changelog + migration note when entities changed. Downstream projects created
from a template are **forks, not subscribers** — they get update PRs from the fleet bot
(rfcs/0002 §5), never silent upstream pulls.

## 7 · Open questions for upstream review

1. Should `template.setup` steps be `<server>` actions by law (so setup is sandboxed +
   auditable like everything else)? (Recommended: yes — `admin.seedDemo` above already is.)
2. Does the official shelf require the studio-apps signing lane (Ed25519 approval over tree
   hash) from day one, or does denylist moderation suffice until third-party templates open?
   (Recommended: official = signed from day one; it is the training-data shelf.)
3. `templateApi` vs folding into `studioApi` — templates and apps are different consumers of
   the same registry; keeping envelopes separate lets them major independently.
