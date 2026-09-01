# Auth: the seam, the token contract, and how to swap in your provider

The template's entire security model hangs on one boundary: **the server verifies
tokens; it never issues them.** Locally, `scripts/dev-session.mjs` plays the identity
provider. In production you replace that one role with Clerk, Supabase Auth, or your own
issuer — nothing in `server/*.dsx` changes, because the declared backend only ever sees
a verified subject.

## The token contract (what the server actually reads)

The host verifies a **JWS (JWT), HS256**, shared-secret `DSX_JWT_SECRET`, and reads:

| claim | required | meaning |
|---|---|---|
| `sub` | yes | the subject. **Must be a UUID** — owner-scoped RLS stores `owner_id uuid`, and a non-UUID subject fails every owned read/write. |
| `role` | no | `service_role` marks the OPERATOR (the Manage surface's writes and the `/internal/*` twins). Absent for viewers. |
| `iat` / `exp` | yes | standard freshness; the local minter issues 12h tokens. |

Transport: `Authorization: Bearer <token>` on every authenticated call. The screens keep
the token in memory (they fetch it from the session source at mount); nothing here
requires a cookie, though a cookie-based deployment works — the server only reads the
header.

**HS256 is the verified algorithm today.** An IdP that hands you RS256/JWKS (Clerk and
Supabase both do, in their default modes) needs one of:

1. the IdP configured to mint an HS256 token with your shared secret (Supabase: the
   project JWT secret IS this model — set `DSX_JWT_SECRET` to the project's JWT secret
   and Supabase-issued access tokens verify as-is, with `sub` already a UUID);
2. a thin token-exchange endpoint you host: verify the IdP's token with its JWKS, mint
   the short-lived HS256 twin above. ~30 lines; keep the TTL short;
3. the upstream ask (RS256/JWKS verification in the host) — tracked in PLAN.md §6.

## What to replace, concretely

`GET /dev-session.json` is the only thing the client knows about. It is **served at runtime
by the dev origin**, never built and never deployed: `scripts/dev-session.mjs` writes
`.dev-session.json` at the repo root (gitignored) and `scripts/serve.mjs` answers that one
path from it.

> **This used to be a shipped file, and it shipped the operator's token.** The minter wrote
> `public/dev-session.json` *and* `dist/dev-session.json`. `dist/` is what
> `despia deploy cloudflare` uploads — and `despia build` copies `public/` into `dist/`, so
> moving it to `public/` alone would have changed nothing. Every deployment published a
> full-write `role: service_role` JWT at a guessable URL for twelve hours. The warning below
> ("do not ship a static operator token anywhere a viewer can fetch it") was already in this
> file; prose is not a gate. `scripts/dist-guard.mjs` is: it runs as npm's `postbuild`, fails
> the build on any privileged token in the output, and `npm run verify` asserts it again.

The runtime endpoint is gated by the **network**, because the caller has no token yet and
there is nothing else to gate on: loopback, `*.local`, or an RFC1918 address, and never
under `NODE_ENV=production`. Anything else gets a 404 — the same prober's answer host.ts
gives an internal route. A phone on the dev LAN can still reach it, which is the point.

Its shape:

```json
{ "viewer":   { "sub": "<uuid>", "token": "<jwt>" },
  "operator": { "sub": "<uuid>", "token": "<jwt>" } }
```

Production replaces the FETCH of that file with your provider's session:

- every screen reads `session.data.viewer.token` through one computed (`authHeaders`) —
  point the `<api as="session">` at your session endpoint (same JSON shape), or swap the
  computed to read your SDK's token. One computed per screen, clearly at the top.
- the operator token exists only for the Manage surface and the seed script. In
  production the operator is whoever your IdP says carries `role: service_role` — do
  not ship a static operator token anywhere a viewer can fetch it.

- **clear the viewer-scoped caches when the viewer changes.** Screens keep their last good
  payload in the app-wide store so a route change never paints a blank frame (`global.cache*`
  — see PLAN.md §6.30 for why the framework's own `<api cache>` cannot do this: it is keyed
  by the per-mount store and dies with the screen). The CONTENT keys (`cacheHome`,
  `cacheDiscover`, `cacheCatalog`, `cacheShow`, `cacheInbox`) are public and safe to keep.
  The VIEWER keys — `cacheWallet`, `cacheFavs`, `cacheContinue`, `cacheLedger`,
  `cacheRewards` — belong to one person: whatever signs a viewer out or switches accounts
  must null them in the same action that drops the token, or the next viewer sees the
  previous one's coin balance for one frame. This template has no sign-out surface (the dev
  session is fixed), so there is nothing to wire it to yet — the moment you add one, that
  action clears these five keys.

## The two authorities, and where they gate

- **Viewer (no role):** owner-scoped CRUD through RLS (`wallet`, `unlock`, `ledger`,
  `progress`, `favorite`, `checkin`, `spin`, `taskclaim`, `adview`, `comment` writes)
  plus the public reads. A viewer can never read another viewer's rows — that is
  Postgres RLS, not application code.
- **Operator (`role: service_role`):** the declared admin actions (`server/admin.dsx`)
  and, locally, the `/internal/admin/*` twins in `scripts/serve.mjs` (the documented
  side-door pending upstream role-scoped route authority — PLAN.md §6.2). Anything else
  answering a non-operator is a 404 indistinguishable from an absent route.

  **`auth="required"` is NOT what makes that true — `reach=""` is.** Every `/admin/*` row
  now carries it, and the difference is not academic: `show`, `episode` and `notice` are
  `ownership="public-read"`, whose SELECT policy is literally `using (true)`, and the public
  catalogue filters `state:'live'` in *application code* the admin reads do not run. So with
  `auth="required"` alone, any signed-in viewer could read the unpublished catalogue through
  `/admin/shows`. `reach=""` moves the decision to the host's gateway, which admits only a
  service-role identity or `DSX_INTERNAL_KEY` and answers everyone else 404.

  Note the two planes are different and only one of them reads the `role` claim. The gateway
  does. Postgres does not: `runAs` sets `set local role authenticated` for **every**
  user-scope query regardless of the token, so a declared action never executes as
  `service_role` — which is why the admin *writes* fail closed even for the operator, and why
  the local twins reach `serviceRepo()` directly. That is PLAN.md §6.7.

  `<tool>` rows have neither gate: `createMcpFace` checks `auth` and a non-null identity and
  nothing else, so `/mcp` was the same leak by another door. `scripts/serve.mjs` holds the
  whole face to the gateway's test until upstream lands (PLAN.md §6.84).

`DSX_INTERNAL_KEY` is the host's *internal* caller key (server-to-server jobs); it is
optional locally and distinct from the operator role — a job holding the key can call
internal routes without any JWT at all. Set it in hosted lanes; never expose it to a
client.
