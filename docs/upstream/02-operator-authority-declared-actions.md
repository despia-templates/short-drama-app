# server: declared actions have no operator/service authority path (blocks Manage View writes)

**One line.** No `<server>`-grammar path can write a `public-read` entity: `repoFor()` pins
`scope: "user"` unconditionally, `serviceRepo()` is deliberately unreachable from documents,
and route `auth=` has no role vocabulary — so a project cannot declare its own admin verbs.

**Environment.** Measured on `dev@92b844b0`, re-verified 2026-08-29 evening at `dev@ae0669ad`
(`git diff --stat` over the relevant packages between the two: empty). Consumer: the
short-drama flagship template (`despia-templates/short-drama-app`) with `file:` deps on the
checkout's `OpenSource/Web/packages/*`, probes run against a freshly rebuilt `dist/`.
Filed under the template program's no-hacks law: the template ships a labeled bridge where
one exists, and the bridge dies when this lands.

**Repro.** Entity `show` is `ownership="public-read"` (migration emits `create policy …
for select using (true)` + `-- writes: service role only`). A declared action doing
`dsx.module.data.show.create({ … })`, invoked with a verified JWT carrying
`role: service_role`, gets `ok:false` at the seam:

```
POST /admin/notice  (operator JWT, role=service_role)
→ 403 {"reason":"forbidden","message":"operator authority required"}
```

`packages/server/src/repo.ts` — `repoFor()` hardcodes `const scope = "user" as const;` and
the file's own comment states the law: *"serviceRepo() cannot be obtained from a
HostContext"*. `runAs` (`postgres.ts`) always issues `set local role authenticated` for
user scope, so the identity's `service_role` claim is only honoured at the internal-route
gateway (`host.ts` `serviceRoles`), never at the data seam.

**Why this is a design request, not a bug report.** The invariant is intentional and good —
a generated CRUD handler must never escalate. But the consequence is that every real
template needs an operator surface (add a show, publish, price), and today that surface can
only be hand-written TS handlers on internal routes, outside the grammar and its gates.

**Suggested direction (pick one, all gate-friendly):**
1. `auth="role:<name>"` on route/tool rows + roles honoured at `runAs` (per-request
   `set local role` / claims), so a document can declare operator-only rows;
2. an explicit authority word on the action (`<action as="…" authority="service">`),
   buildable only in documents the manifest marks operator-facing;
3. an ownership word for operator-writable entities.

This is the concrete blocker for the Manage View / project-admin-surfaces direction (the
template's `docs/rfcs/0003-project-admin-surfaces.md`); its bridge today is host-gated
internal TS twins in the template's local serve script.
