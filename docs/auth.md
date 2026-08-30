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

`public/dev-session.json` is the only artifact the client knows about (the script writes the same JSON to `dist/dev-session.json` so a built site serves it too). Its shape:

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

`DSX_INTERNAL_KEY` is the host's *internal* caller key (server-to-server jobs); it is
optional locally and distinct from the operator role — a job holding the key can call
internal routes without any JWT at all. Set it in hosted lanes; never expose it to a
client.
