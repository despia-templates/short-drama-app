# Auth: the seam, the token contract, and how to swap in your provider

The template's entire security model hangs on one boundary: **the server verifies
tokens; it never issues them.** Locally, `scripts/dev-session.mjs` plays the identity
provider. In production you replace that one role with Clerk, Supabase Auth, or your own
issuer — nothing in `server/*.dsx` changes, because the declared backend only ever sees
a verified subject.

The CLIENT half of that boundary is one file: **`Components/parts/AuthSeam.dsx`**. It owns
the session for the whole app, publishes it once, and is the only place a viewer is created
or destroyed. Everything below is either its contract or its consequences.

---

## 1 · The token contract (what the server actually reads)

The host verifies a **JWS (JWT), HS256**, shared-secret `DSX_JWT_SECRET`, and reads:

| claim | required | meaning |
|---|---|---|
| `sub` | yes | the subject. **Must be a UUID** — owner-scoped RLS stores `owner_id uuid`, and a non-UUID subject fails every owned read/write. |
| `role` | no | the service role marks the OPERATOR (the Manage surface's writes and the `/internal/*` twins). Absent for viewers. |
| `iat` / `exp` | yes | standard freshness; the local minter issues 12h tokens. |

Transport: `Authorization: Bearer <token>` on every authenticated call. The token lives in
memory (`global.auth.headers`) and is re-fetched from the provider on every cold start;
nothing here requires a cookie, though a cookie-based deployment works — the server only
reads the header.

**HS256 is the verified algorithm today.** An IdP that hands you RS256/JWKS (Clerk and
Supabase both do, in their default modes) needs one of:

1. the IdP configured to mint an HS256 token with your shared secret (Supabase: the
   project JWT secret IS this model — set `DSX_JWT_SECRET` to the project's JWT secret
   and Supabase-issued access tokens verify as-is, with `sub` already a UUID);
2. a thin token-exchange endpoint you host: verify the IdP's token with its JWKS, mint
   the short-lived HS256 twin above. ~30 lines; keep the TTL short;
3. the upstream ask (RS256/JWKS verification in the host) — tracked in PLAN.md §6.

---

## 2 · The provider seam — the ONE place to swap

`Components/parts/AuthSeam.dsx` calls four endpoints, all named by **config keys** in
`App.json` `consts` (a local build may override any of them in `dsx.config.json` `consts`
without editing the file that ships). `dsx.const.*` is a reactive, flat-scalar plane read
in markup; an absent key is typed-null, which is exactly the gate an honest degradation
needs.

| key | method | shape | default in this build |
|---|---|---|---|
| `authSessionUrl` | GET | → the session payload below | `/dev-session.json` |
| `authSignInUrl` | POST `{ email, password }` | → the session payload | `""` (unset) |
| `authSignUpUrl` | POST `{ email, password }` | → the session payload | `""` (unset) |
| `authSignOutUrl` | POST | any 2xx; the client drops its token either way | `""` (unset) |
| `accountDeleteUrl` | POST `{ confirm: "DELETE" }` | → `{ deleted: true }` | `""` (unset — see §6) |

**The session payload, in all four cases:**

```json
{ "viewer":   { "sub": "<uuid>", "token": "<jwt>", "name": "optional", "email": "optional" },
  "operator": { "sub": "<uuid>", "token": "<jwt>" } }
```

`operator` is optional and exists only for the local demo. In production the operator is
whoever your IdP marks with the service role, so the viewer's own headers ARE the
operator's and the host's `reach=""` gateway decides — `Components/Admin.dsx` reads one
name (`global.auth.opHeaders`) either way.

### What "swapping the provider" actually costs

Set `authSignInUrl` (and, if you offer registration, `authSignUpUrl`) in `App.json`
`consts`. That is the whole change. The seam then renders its credential form and posts to
your endpoint; nothing else in `Components/**` or `server/**` moves.

**Leave `authSignInUrl` unset — this build's default — and the screen says so** and offers
the LOCAL provider instead of rendering an email/password form in front of a minter that
checks neither. A control that promises something it does not do is the one thing this
template never ships (Article 7).

### The local provider

`GET /dev-session.json` is **served at runtime by the dev origin**, never built and never
deployed: `scripts/dev-session.mjs` writes `.dev-session.json` at the repo root
(gitignored) and `scripts/serve.mjs` answers that one path from it.

> **This used to be a shipped file, and it shipped the operator's token.** The minter wrote
> `public/dev-session.json` *and* `dist/dev-session.json`. `dist/` is what
> `despia deploy cloudflare` uploads — and `despia build` copies `public/` into `dist/`, so
> moving it to `public/` alone would have changed nothing. Every deployment published a
> full-write operator JWT at a guessable URL for twelve hours. The warning below ("do not
> ship a static operator token anywhere a viewer can fetch it") was already in this file;
> prose is not a gate. `scripts/dist-guard.mjs` is: it runs as npm's `postbuild`, fails the
> build on any privileged token in the output, and `npm run verify` asserts it again.

The runtime endpoint is gated by the **network**, because the caller has no token yet and
there is nothing else to gate on: loopback, `*.local`, or an RFC1918 address, and never
under `NODE_ENV=production`. Anything else gets a 404 — the same prober's answer host.ts
gives an internal route. A phone on the dev LAN can still reach it, which is the point.

---

## 3 · How a screen consumes the seam

Three spellings. No session block, no per-screen `authHeaders` computed, no `needs=` edge:

```xml
<api as="wallet" url="/wallet/state" ssr="false"
     auto="global.auth.ok == true"
     headers="global.auth.headers"
     on:success="global.cacheWallet = global.auth.ok == true ? wallet.data : null"/>
```

and, for the UI:

```xml
<variable as="signedIn"  computed="true">return global.auth.ok == true</variable>
<variable as="authKnown" computed="true">return global.auth != null &amp;&amp; global.auth.state != null</variable>
<variable as="signedOut" computed="true">return dsx.variable.authKnown &amp;&amp; dsx.variable.signedIn == false</variable>
```

Then mount `<AuthSeam/>` once, at the foot of the screen root (the default `mode="boot"`
renders nothing), and use `<SignInCard>` for the signed-out state.

**Why `auto=` and not `needs=`.** An `<api>` block re-evaluates `auto` whenever its read set
changes (kernel `api.ts`: "refetch when the MATERIALIZED request changes"), so a block
declared before the seam resolves simply waits, fires the moment the token lands, and stops
the moment it is dropped. `needs=` cannot help here: it names a SIBLING `<api>` in the same
component scope, and the whole point of the seam is that there is no sibling.

**Why `== true` and not truthiness.** An unset global is NSNull, whose truthiness is not
something to bet a money route on (AGENTS.md, the absence-check idiom).

**`global.auth`, the published shape:**

```js
{ state: 'guest' | 'in',  ok: bool,  sub: '',  name: '',  email: '',
  headers: { authorization: 'Bearer …' },   // {} when signed out — never a null-valued key
  opHeaders: { … } }
```

`headers` is an empty DICT when signed out and never a key whose value is null: a
null-valued header is a doc-11 "missing-value" hole that gates the block forever.

`state` is absent before the first resolve, which is the third state every screen needs —
`authKnown` is how a screen avoids flashing a sign-in card for one frame on a cold load.

### Reaching the surface from anywhere

One push, one statement, inline-legal:

```xml
on:tap="dsx.module.route.push({ path: '/auth/signin' })"   <!-- or /signout, /delete -->
```

No screen plumbs state into a child. `<SignInCard>` is the card that does it; every screen
that needs identity mounts that card in its signed-out branch.

**Why a route and not a sheet — measured, and worth the paragraph.** The first shape was a
`<sheet>` inside the seam, raised by writing one global. It renders once per LIVE FRAME, and
frames outlive their screens on purpose: a pushed route keeps the screen under it mounted
(that is what makes back instant), and the router seeds a root frame under a DEEP-LINKED
page so back works there too. So a cold load of `/profile` has two live frames, each with
its own seam, each portaling a sheet into the one app-wide overlay layer — two identical
panels at the same coordinates, with two confirmation fields holding different text.

Every ownership rule writable from inside the component fails one of those cases (a seeded
under-frame mounts while the route already reads the deep link, so "the route I was born
under" is the same string for both), and requiring each caller to pass an owner id is the
failure mode a template cannot afford.

A route is exactly-once **by construction** — the framework's own guarantee rather than a
protocol — and it costs nothing that mattered: a pushed frame restores the screen beneath it
on pop, so the player never loses its place. It also buys something real: `/auth/signin` is
a URL, so it survives a reload and can be the redirect target an OAuth provider hands back.

(The template's other sheets — `PlansSheet`, `SearchOverlay` — do not have this problem
because they are driven by a LOCAL `open` variable: only the instance whose own trigger was
tapped opens.)

---

## 4 · Guest browsing is the default, on purpose

App Store 5.1.1(v), verbatim: *"If your app doesn't include significant account-based
features, let people use it without a login."* A drama catalogue does not need one to
browse, and gating the whole app behind sign-up is its own rejection risk.

So a first run is a GUEST. What works with no account at all:

- home, discover, browse, search, every show page, every notice
- every FREE episode, full playback
- reading comment threads (`/social/comments/:episode` is `auth="none"`)
- the whole store and VIP price list, and the benefit story

What asks for identity, at the moment it is needed, by pushing `/auth/signin` rather than by
farming a 401 (and a pushed frame keeps the screen underneath alive, so the paywall, the buy
button or the comment box is exactly where it was on the way back):

| surface | file | behaviour for a guest |
|---|---|---|
| unlock an episode | `Components/Watch.dsx` `unlockNow` | pushes /auth/signin; the paywall keeps its place |
| favourite / My List | `Watch.dsx` `toggleFav`, `Show.dsx` `toggleFav` | pushes /auth/signin |
| post a comment | `Watch.dsx` `postComment` | pushes /auth/signin (reading stays open) |
| buy a coin pack | `Store.dsx` `buy` | pushes /auth/signin |
| buy a VIP plan | `parts/PlansSheet.dsx` `buy` | pushes /auth/signin |
| bulk-unlock a series | `Show.dsx` `buyWholeSeries` | pushes /auth/signin |
| wallet · ledger · rewards · My List | those screens | `<SignInCard>` in place of the data |
| Manage surface | `Components/Admin.dsx` | `<SignInCard>`, distinct from the authority failure |

One deliberate exception: **saving watch progress is silent for a guest.** A resume position
is not something a viewer asked for, so interrupting a free episode with a login screen to
save it would be exactly the wall guest browsing exists to avoid.

**Nothing is ever gated on a system permission** (App Store 5.1.2(i)) — no reward, coin or
feature in this app asks for one.

---

## 5 · Sign-out, and the caches that must die with the viewer

Screens keep their last good payload in the app-wide store so a route change never paints a
blank frame (`global.cache*` — PLAN.md §6.30 explains why the framework's own `<api cache>`
cannot do this: it is keyed by the per-mount store and dies with the screen).

The CONTENT keys (`cacheHome`, `cacheDiscover`, `cacheCatalog`, `cacheShow`, `cacheInbox`)
are public and stay. The VIEWER keys — `cacheWallet`, `cacheFavs`, `cacheContinue`,
`cacheLedger`, `cacheRewards` — belong to one person, and `AuthSeam`'s `clearViewerCaches`
nulls all five in the same breath that drops the token.

**Two things make that actually true, and both were learned by measurement:**

1. **The order of the sign-out statements is load-bearing.** A cookie write calls the
   kernel's `invalidateCookies()`, and the cookie partition is part of every GET block's
   materialized identity — so writing the session cookie FIRST made every authenticated
   block refetch *with the token still live*, and those responses landed after the caches
   were cleared and re-published the previous viewer's money into the app-wide store.
   Measured: the wallet stash came back two seconds after sign-out. The order is now
   *publish guest → clear caches → write cookie*: dropping the identity first turns `auto`
   false, so nothing new can fire.

2. **Every viewer-scoped `on:success` is guarded**, because one request already in flight
   when the viewer taps Sign out cannot be reordered away:
   `on:success="global.cacheWallet = global.auth.ok == true ? wallet.data : null"`.
   One assignment, so it stays inline-legal.

Belt and braces: every viewer-scoped *view* computed also returns null when signed out
(`if (dsx.variable.signedIn == false) { return null }`), so a stale payload can never be
rendered even for a frame.

### What is persisted, and what is not

Only the **decision** rides a cookie: `dsx.cookie.sd_auth` ∈ `'in' | 'guest'`. The token
itself never touches storage — it lives in `global.auth` (memory) and is re-fetched from
the provider on every cold start. That is how a real IdP session works (the provider holds
its own session; the app asks it for a short-lived access token), and it keeps a bearer JWT
out of a JavaScript-readable cookie.

---

## 6 · Account deletion — the client half, and the server action it needs

App Store 5.1.1(v), verbatim: *"Offer to delete the entire account record, along with
associated personal data… only offering to temporarily deactivate or disable an account is
insufficient."* The regulated-industry carve-out (5.1.1(ix): banking, healthcare, gambling,
cannabis, air travel, crypto) does not cover a drama app.

**What is built.** `Components/Account.dsx` (route `/account`, the last row of the Profile
menu — two taps from the tab bar) carries a top-level **Delete account** row. It pushes
`/auth/delete`, the seam's delete pane, which states exactly what is removed, states what
happens to an unspent coin balance, requires the viewer to type `DELETE`, and on success
drops the session and clears the five viewer caches.

**What it needs from the server, and does not have.** Erasing an account touches ten
owner-scoped entities behind Postgres RLS; there is no client route that can reach nine of
them. `accountDeleteUrl` therefore ships EMPTY, and the pane says so in place of a button
that cannot work. The exact thing that closes it:

```xml
<!-- server/viewer.dsx -->
<action as="deleteAccount" inputs="confirm">
  if (confirm !== 'DELETE') { throw { reason: 'invalid', message: 'confirmation required' } }
  // every entity below is ownership="owner", so `list` is already caller-scoped and
  // `delete` can only reach the caller's own rows — RLS is the guard, not this code.
  // wallet · ledger · unlock · order · progress · favorite · checkin · spin ·
  // taskclaim · adview · comment
  //   (comment is ownership="public-read" with an owner-write policy —
  //    server/policies.local.sql:34-36 — so filter by the caller explicitly.)
  // Bounded by LIST_LIMIT (100) per entity: loop until a page comes back empty, or
  // declare the erase as one SQL statement if a transaction seam lands (PLAN.md §6.38).
  return { deleted: true }
</action>

<route method="POST" path="/viewer/delete" action="deleteAccount" auth="required" rate="3/h"/>
```

Then set `"accountDeleteUrl": "/viewer/delete"` in `App.json` `consts`. **No client change
is required** — the pane goes live with the config value.

Two things the copy already says, and a server implementation must keep true:

- **An unspent balance is not grounds to refuse deletion.** Unspent coins and remaining VIP
  days are destroyed with the account, are not transferable, and are not refunded.
- **A refund is the payment provider's job, not this app's.** The pane tells the viewer to
  ask the App Store / Google Play / Stripe *before* deleting, because afterwards there is no
  order history left to point at.

---

## 7 · Restore purchases

`POST /store/restore` (`server/store.dsx` `restoreOrders`) walks the caller's own unsettled
orders, asks Stripe about each, and grants the ones that actually succeeded — exactly-once,
because the ledger's unique index refuses a second grant.

`Components/parts/RestoreRow.dsx` is the control, mounted where Apple expects it:

| surface | variant |
|---|---|
| `Components/parts/PlansSheet.dsx` (the subscription purchase sheet — App Store 3.1.2) | `compact` |
| `Components/Store.dsx` | `row` |
| `Components/Vip.dsx` | `row` |
| `Components/Account.dsx` | `row` |

A guest tap pushes `/auth/signin` instead of failing — which is the *"sign in OR restore
purchases"* pair 3.1.2 asks for, with both halves real for the first time. (The row on
`/vip` used to call `wallet.refresh()` and admit in its own third line that there was no
sign-in anywhere in the app.)

**Not covered, and named in the row rather than implied:** a purchase made through StoreKit
or Play Billing never creates one of these orders, so there is nothing here to restore for
it. That receiver is a hosted-lane integration this template does not have (see the
`server/store.dsx` header and PLAN.md §6.86). An adopter shipping to the App Store wires it
before submitting.

---

## 8 · Terms, Privacy and Support

`Components/parts/LegalLinks.dsx`, from three `App.json` `consts` keys: `termsUrl`,
`privacyUrl`, `supportUrl`. All three ship EMPTY — a placeholder URL looks satisfied to an
adopter and reads as a broken promise to a reviewer.

Rendered in two variants: a compact line on every purchase surface (`PlansSheet`, both
lanes, plus `/store`) and settings rows on `/account` and `/vip`. An unset key is not a dead
link and not a hidden row: it renders as a statement of what is missing and which key sets
it.

What each one satisfies: App Store 3.1.2 (Terms of Use + Privacy Policy reachable on a
subscription surface, and in App Store Connect metadata); Google Play (a privacy policy in
the listing AND in the app); App Store 1.2 (published contact information for an app
carrying user comments — that is `supportUrl`).

**One measured caveat.** The SSR renderer does not seed the `dsx.const.*` plane — only the
client bootloader does (`cli/src/build.ts` passes `consts` to `bootDsx`; `server/src/
page-render.ts` seeds nothing). So on a server-rendered first paint every key reads null and
these rows show their unset lane until hydration. Harmless in this build (the keys really
are empty); an adopter who sets them sees one frame of the wrong lane on a cold load. Filed
for PLAN.md §6 as the SSR-consts ask.

---

## 9 · The two authorities, and where they gate

- **Viewer (no role):** owner-scoped CRUD through RLS (`wallet`, `unlock`, `ledger`,
  `progress`, `favorite`, `checkin`, `spin`, `taskclaim`, `adview`, `comment` writes)
  plus the public reads. A viewer can never read another viewer's rows — that is
  Postgres RLS, not application code.
- **Operator (the service role):** the declared admin actions (`server/admin.dsx`)
  and, locally, the `/internal/admin/*` twins in `scripts/serve.mjs` (the documented
  side-door pending upstream role-scoped route authority — PLAN.md §6.7). Anything else
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
  user-scope query regardless of the token, so a declared action never executes as the
  service role — which is why the admin *writes* fail closed even for the operator, and why
  the local twins reach `serviceRepo()` directly. That is PLAN.md §6.7.

  `<tool>` rows have neither gate: `createMcpFace` checks `auth` and a non-null identity and
  nothing else, so `/mcp` was the same leak by another door. `scripts/serve.mjs` holds the
  whole face to the gateway's test until upstream lands (PLAN.md §6.84).

`DSX_INTERNAL_KEY` is the host's *internal* caller key (server-to-server jobs); it is
optional locally and distinct from the operator role — a job holding the key can call
internal routes without any JWT at all. Set it in hosted lanes; never expose it to a
client.

---

## 10 · Files

| file | what it is |
|---|---|
| `Components/parts/AuthSeam.dsx` | **the seam.** The session, the sign-in/sign-out/delete surface, `global.auth`, the cache clear. `mode="boot"` (the default) resolves and renders nothing — one mount per screen; `mode="page"` is the surface, mounted once by the route below. |
| `Components/Auth.dsx` | `/auth/:pane` — the route shell around `<AuthSeam mode="page">` |
| `Components/parts/SignInCard.dsx` | the one signed-out card, used by every screen that needs identity |
| `Components/parts/RestoreRow.dsx` | `POST /store/restore`, in two variants |
| `Components/parts/LegalLinks.dsx` | terms · privacy · support, from config, degrading honestly |
| `Components/Account.dsx` | `/account` — identity, restore, legal, sign out, delete |
| `App.json` `consts` | **the swap point.** Eight keys; everything else is derived. |
| `dsx.config.json` `routes` | `/auth/:pane` and `/account` |
| `scripts/dev-session.mjs` | the LOCAL provider — one demo viewer plus the operator |
| `scripts/dist-guard.mjs` | the gate that refuses to ship a privileged token |
