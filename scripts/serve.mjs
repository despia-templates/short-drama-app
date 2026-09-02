//
//  scripts/serve.mjs — the LOCAL production-shaped node: one origin serving the built
//  DSX site (static + SSR) in front of the generated API host, wired to local Postgres.
//  This is the standalone twin of @despia-native/server's bootloader-node serve() (which loads
//  the monorepo artifact shape); the barrel import below is the standalone shape
//  `despia build` emits. Local/dev only — the hosted lane is `despia deploy cloudflare`.
//
import { createServer } from "node:http";
import pg from "pg";
import { createHost, installEntities } from "@despia-native/server/host";
import { installPostgresPool } from "@despia-native/server/postgres";
import { createIdentityResolver } from "@despia-native/server/identity";
import { createSiteHandler } from "@despia-native/server";
// UPSTREAM GAP (PLAN.md §6.15): `despia build` emits `mcpTools` into the standalone
// barrel, but @despia-native/server's export map has no "./mcp-face", and bootloader-node's
// serve() consumes the MONOREPO artifact shape rather than this barrel — so a standalone
// project can declare <tool> rows it has no supported way to serve. Reached by FILE PATH
// beside the package's own entry (portable on any machine: the path is derived from where
// @despia-native/server actually resolved, never hardcoded), deliberately loud, and it
// dies the day the export lands.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { randomBytes, createHash, createHmac, timingSafeEqual, randomUUID } from "node:crypto";
import { resolve } from "node:path";
import { entities, routes, handlers, spendBudgets, mcpTools } from "../server/generated/index.ts";
// LOCAL LANE ONLY — the operator side-door, pending upstream role-scoped authority
// (PLAN.md §6.2 / RFC 0003 §5). The framework's sanctioned admin-job shape: hand-written
// handlers on INTERNAL routes (reach: []) — the host itself refuses any caller that is not
// service-role (or the internal key) with a 404 indistinguishable from an absent route.
// serviceRepo is deliberately unexported from the package (the "cannot be obtained from a
// HostContext" law), so the local lane reaches it by file path — a thing only someone
// holding the framework checkout can do, which is the right shape for a side-door.
const serverDist = new URL("./", import.meta.resolve("@despia-native/server"));
const { serviceRepo } = await import(new URL("repo.js", serverDist));
const { createMcpFace } = await import(new URL("mcp-face.js", serverDist));

// dev nicety: fold .env.local into the environment (never committed; hosted lanes use real secrets)
import { existsSync } from "node:fs";
if (existsSync(".env.local")) {
  for (const line of readFileSync(".env.local", "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2];
  }
}

const env = (key) => process.env[key];
const PORT = Number(process.env.PORT ?? 8787);
const SITE = resolve(process.env.DSX_SITE_DIR ?? "dist");

if (!env("DSX_DATABASE_URL")) { console.error("DSX_DATABASE_URL is required"); process.exit(1); }
if (!env("DSX_JWT_SECRET")) { console.error("DSX_JWT_SECRET is required"); process.exit(1); }

// pg returns int8/numeric as strings by default; JSE's `+` would then concatenate a
// wallet balance instead of adding to it. Parse them as numbers at the transport.
pg.types.setTypeParser(20, (v) => Number(v));
pg.types.setTypeParser(1700, (v) => Number(v));
// timestamptz/timestamp as ISO strings — a pg Date object crosses the JSE seam as {}
pg.types.setTypeParser(1184, (v) => new Date(v).toISOString());
pg.types.setTypeParser(1114, (v) => new Date(v).toISOString());
const pool = new pg.Pool({ connectionString: env("DSX_DATABASE_URL") });
installPostgresPool(pool);
installEntities(entities);

const svc = serviceRepo();
const need = (v, name) => { if (v === undefined || v === null || v === "") throw { reason: "invalid", message: `${name} is required` }; return v; };
const opsHandlers = {
  // The internal twins mirror server/admin.dsx exactly, INCLUDING its ceiling: `svc.list`
  // clamps `limit` to LIST_LIMIT (100) and says nothing, so asking for 2000 returned 100 and
  // the dashboard reported "100 episodes" for a 352-episode catalogue. Page counts, plus the
  // flag that says the page was full.
  stats: async () => {
    const [shows, eps, notices] = await Promise.all([svc.list("show", { limit: 100 }), svc.list("episode", { limit: 100 }), svc.list("notice", { limit: 100 })]);
    return {
      shows: shows.length,
      live: shows.filter((s) => s.state === "live").length,
      drafts: shows.filter((s) => s.state === "draft").length,
      episodes: eps.length,
      notices: notices.length,
      capped: shows.length >= 100 || eps.length >= 100 || notices.length >= 100,
    };
  },
  listShows: async () => {
    const shows = await svc.list("show", { limit: 100 });
    // one bounded read per show — a catalogue-wide episode list stops at 100 rows silently
    const counts = {};
    for (const s of shows) counts[s.id] = (await svc.list("episode", { filters: { show: s.id }, limit: 100 })).length;
    const rows = shows
      .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
      .map((s) => ({ id: s.id, title: s.title, genre: s.genre, state: s.state, featured: s.featured === true, freeUntil: s.free_until, episodes: counts[s.id] ?? 0, poster: s.poster }));
    return { rows };
  },
  listEpisodes: async (args) => {
    const eps = await svc.list("episode", { filters: { show: String(need(args.show, "show")) }, limit: 100 });
    return { rows: eps.sort((a, b) => a.idx - b.idx) };
  },
  upsertShow: async (args) => {
    const values = {
      title: String(need(args.title, "title")),
      synopsis: String(args.synopsis ?? ""), genre: String(args.genre ?? "" ) || "Drama",
      poster: String(args.poster ?? ""), hero: String(args.hero ?? ""), hero_tall: String(args.heroTall ?? ""),
      state: String(args.state ?? "") || "draft",
      free_until: Number.isFinite(Number(args.freeUntil)) ? Number(args.freeUntil) : 8,
      featured: args.featured === true,
      // demo social proof — the reference catalogues all carry a play count and a rating,
      // and a card with neither reads as an empty shelf (scripts/catalogue.mjs METRICS)
      views: Number.isFinite(Number(args.views)) ? Number(args.views) : 0,
      rating: String(args.rating ?? ""),
      // tags arrive as an array and are stored comma-joined (see the entity's note)
      tags: Array.isArray(args.tags) ? args.tags.join(",") : String(args.tags ?? ""),
      // the reference home's fields (docs/design/reference-ui-spec.md §1–§2): the 2:3 cover,
      // the title art, the three badge flags and the coming-soon pair. Mirrored from
      // server/admin.dsx adminUpsertShow field for field — `npm run verify` reads them back
      // off /catalog/home, so a column dropped here goes red rather than reporting false
      cover: String(args.cover ?? ""),
      title_art: String(args.titleArt ?? ""),
      hot: args.hot === true,
      is_new: args.isNew === true,
      original: args.original === true,
      coming_soon: args.comingSoon === true,
    };
    if (typeof args.id === "string" && args.id !== "") {
    // a release date is only ever written when one was sent — a show that is out has none
    if (typeof args.releaseAt === "string" && args.releaseAt !== "") values.release_at = args.releaseAt;
      const row = await svc.update("show", args.id, values);
      if (row === null) throw { reason: "not_found", message: "no such show" };
      return { id: args.id, updated: true };
    }
    const made = await svc.create("show", values);
    return { id: made.id, created: true };
  },
  upsertEpisode: async (args) => {
    const idx = Number.isFinite(Number(args.idx)) ? Number(args.idx) : 1;
    const values = {
      show: String(need(args.show, "show")), idx,
      title: String(args.title ?? "") || `Episode ${idx}`,
      video_url: String(args.videoUrl ?? ""), poster: String(args.poster ?? ""),
      duration: Number.isFinite(Number(args.duration)) ? Number(args.duration) : 75,
      price: Number.isFinite(Number(args.price)) ? Number(args.price) : 60,
      state: String(args.state ?? "") || "live",
    };
    if (typeof args.id === "string" && args.id !== "") {
      const row = await svc.update("episode", args.id, values);
      if (row === null) throw { reason: "not_found", message: "no such episode" };
      return { id: args.id, updated: true };
    }
    const made = await svc.create("episode", values);
    return { id: made.id, created: true };
  },
  publish: async (args) => {
    const state = String(need(args.state, "state"));
    if (state !== "live" && state !== "draft") throw { reason: "invalid", message: "state must be live or draft" };
    const row = await svc.update("show", String(need(args.show, "show")), { state });
    if (row === null) throw { reason: "not_found", message: "no such show" };
    return { show: args.show, state };
  },
  feature: async (args) => {
    const row = await svc.update("show", String(need(args.show, "show")), { featured: args.featured === true });
    if (row === null) throw { reason: "not_found", message: "no such show" };
    return { show: args.show, featured: args.featured === true };
  },
  notice: async (args) => {
    const made = await svc.create("notice", {
      title: String(need(args.title, "title")),
      message: String(args.message ?? ""),
      segment: String(args.segment ?? "") || "all",
      kind: String(args.kind ?? "") || "push",
    });
    return { id: made.id, queued: true };
  },
};
const opsRoutes = Object.keys(opsHandlers).map((name) => ({
  key: `ops-${name.toLowerCase()}`,
  chain: "opsx",
  action: name,
  method: "POST",
  path: `/internal/admin/${name.toLowerCase()}`,
  auth: "required",
  reach: [],
}));

// ══════════════════════════════════════════════════════════════════════════════════════
//  DEVICE IDENTITY — the provider half of the 90% path (the design is in server/auth.dsx).
//
//  These four endpoints MINT sessions, and minting is PROVIDER work: docs/auth.md is one
//  sentence — the backend VERIFIES tokens, it never ISSUES them — so a session comes from the
//  provider (this origin locally, your IdP in production), never from server/*.dsx. It also
//  CANNOT live in a declared action even if we wanted it to: a declared body reaches the
//  database only user-scoped (repo.ts), and its writes throw `forbidden` for a caller with no
//  identity — which every public registration is by construction — and this store is written
//  with SERVICE authority no viewer may reach. So the device store is written from here with
//  `serviceRepo()`, exactly as the `/internal/admin/*` twins are, pending the same upstream word
//  (§6.2/§6.7) that would move both into the declared lane — filed as PLAN.md §6.128. node:crypto
//  signs the sessions with the SAME secret the host verifies (the dev-session.mjs primitives), so
//  none of this is blocked on the declared-lane crypto verbs, and neither is `npm run verify`.
//
//  THE TRUST CHAIN (the founder's constraints): the secret is SERVER-generated (randomBytes(32)),
//  returned ONCE, and only its sha256 is stored — a decompiled client holds a secret that proves
//  possession and reveals nothing, and a leaked table is worthless hashes. The client never holds
//  a long-lived server token: it exchanges the credential for a 1h HS256 session that carries a
//  UUID `sub` and a `kind`, and NEVER a `role` — a device can never be the operator. No coin ever
//  originates here: this mints an IDENTITY; the merge sums two wallets under an idempotent ledger
//  lock (server-side, replay-safe), and every credit still comes from the server grant paths.
const DSX_JWT_SECRET_AUTH = env("DSX_JWT_SECRET");
const b64uAuth = (buf) => Buffer.from(buf).toString("base64url");
const mintSession = (claims, ttlSeconds = 3600) => {
  const header = b64uAuth(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const now = Math.floor(Date.now() / 1000);
  const payload = b64uAuth(JSON.stringify({ iat: now, exp: now + ttlSeconds, ...claims }));
  const sig = createHmac("sha256", DSX_JWT_SECRET_AUTH).update(`${header}.${payload}`).digest("base64url");
  return `${header}.${payload}.${sig}`;
};
const sha256hex = (s) => createHash("sha256").update(String(s)).digest("hex");
const AUTH_UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// A fixed 64-hex dummy so an unknown deviceId costs the same compare as a wrong secret — the
// exchange must never become a timing oracle for "does this deviceId exist".
const AUTH_DUMMY_HASH = "0".repeat(64);
const hashEq = (a, b) => {
  const ba = Buffer.from(String(a), "utf8");
  const bb = Buffer.from(String(b), "utf8");
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
};
const authJson = (status, body) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });

// THE LINK MERGE — one SQL transaction, because the provider HAS the transaction seam a declared
// action lacks (§6.38), so the fold is atomic rather than a bounded-and-resumable loop. Every
// UNION step is idempotent on its own unique index; the only non-idempotent part — summing the
// two coin balances — is guarded by an exactly-once `merge` ledger row (dsx_ledger_merge_once),
// so a concurrent or replayed link folds the balance exactly once. Runs as the pool's own role,
// which bypasses RLS the same way serviceRepo() does — service authority, named.
const mergeDeviceIntoAccount = async (deviceViewer, accountSub) => {
  const client = await pool.connect();
  try {
    await client.query("begin");
    // $1 = account, $2 = device, both uuid. Casts are explicit because a prepared statement
    // cannot infer a uuid parameter the way a literal is coerced, and a query that references
    // only one of the two placeholders would leave the other untyped (42P18).
    const both = (text) => client.query(text, [accountSub, deviceViewer]);
    const dev = (text) => client.query(text, [deviceViewer]);
    await both(`update dsx_favorite f set owner_id=$1::uuid where f.owner_id=$2::uuid and not exists (select 1 from dsx_favorite g where g.owner_id=$1::uuid and g.show=f.show)`);
    await dev(`delete from dsx_favorite where owner_id=$1::uuid`);
    await both(`update dsx_unlock u set owner_id=$1::uuid where u.owner_id=$2::uuid and not exists (select 1 from dsx_unlock g where g.owner_id=$1::uuid and g.episode=u.episode)`);
    await dev(`delete from dsx_unlock where owner_id=$1::uuid`);
    await both(`update dsx_progress p set owner_id=$1::uuid where p.owner_id=$2::uuid and not exists (select 1 from dsx_progress g where g.owner_id=$1::uuid and g.episode=p.episode)`);
    await both(`update dsx_progress a set position=d.position, idx=d.idx, day=d.day, created_at=d.created_at from dsx_progress d where a.owner_id=$1::uuid and d.owner_id=$2::uuid and a.episode=d.episode and d.created_at > a.created_at`);
    await dev(`delete from dsx_progress where owner_id=$1::uuid`);
    await both(`update dsx_order set owner_id=$1::uuid where owner_id=$2::uuid`);
    await both(`update dsx_comment set owner_id=$1::uuid, author_id=$1::uuid where owner_id=$2::uuid`);
    await both(`update dsx_report set owner_id=$1::uuid, reporter_id=$1::uuid where owner_id=$2::uuid`);
    await both(`update dsx_block b set owner_id=$1::uuid where b.owner_id=$2::uuid and not exists (select 1 from dsx_block g where g.owner_id=$1::uuid and g.subject=b.subject)`);
    await dev(`delete from dsx_block where owner_id=$1::uuid`);
    await client.query(`insert into dsx_wallet (owner_id, coins, bonus) values ($1::uuid, 0, 0) on conflict (owner_id) do nothing`, [accountSub]);
    const folded = await client.query(
      `with dev as (select coins, bonus, vip_until from dsx_wallet where owner_id=$2::uuid),
            marker as (
              insert into dsx_ledger (owner_id, kind, amount, source, ref)
              select $1::uuid, 'coin', coalesce(dev.coins,0)+coalesce(dev.bonus,0), 'merge', $2::text from dev
              on conflict (owner_id, source, ref) where source='merge' do nothing
              returning 1
            )
       update dsx_wallet a set
          coins = a.coins + coalesce((select coins from dev),0),
          bonus = a.bonus + coalesce((select bonus from dev),0),
          vip_until = greatest(a.vip_until, (select vip_until from dev))
        where a.owner_id=$1::uuid and exists (select 1 from marker)
        returning a.coins, a.bonus`, [accountSub, deviceViewer]);
    await client.query(`delete from dsx_wallet where owner_id=$1::uuid`, [deviceViewer]);
    await client.query(`delete from dsx_ledger where owner_id=$1::uuid and source <> 'merge'`, [deviceViewer]);
    for (const t of ["dsx_checkin", "dsx_spin", "dsx_taskclaim", "dsx_adview", "dsx_playticket"]) {
      await client.query(`delete from ${t} where owner_id=$1::uuid`, [deviceViewer]);
    }
    await client.query("commit");
    const w = folded.rows[0] ?? null;
    return { folded: folded.rowCount > 0, coins: w ? w.coins : null, bonus: w ? w.bonus : null };
  } catch (e) {
    try { await client.query("rollback"); } catch { /* connection already gone */ }
    throw e;
  } finally {
    client.release();
  }
};

const authHandlers = {
  // POST /auth/device/register — public. Mint a device viewer + secret, store sha256(secret),
  // hand the credential back ONCE with a 1h session. `platform`/`plane` (from the client's
  // identityvault.durability()) are stored for the ledger, never for authority.
  register: async (_args, ctx) => {
    const body = ctx.body ?? {};
    const platform = typeof body.platform === "string" ? body.platform.slice(0, 40) : "";
    const plane = typeof body.plane === "string" ? body.plane.slice(0, 40) : "";
    const viewerId = randomUUID();
    const secret = randomBytes(32).toString("hex");
    const row = await svc.create("device_identity", {
      viewer_id: viewerId, secret_hash: sha256hex(secret),
      platform, plane, last_seen_at: new Date().toISOString(),
    });
    if (row === null || row === undefined) return authJson(503, { reason: "unavailable", message: "device registration failed" });
    const session = mintSession({ sub: viewerId, kind: "device", dev: row.id });
    return { deviceId: row.id, secret, session, expiresIn: 3600, kind: "device", sub: viewerId };
  },

  // POST /auth/device — public. Exchange {deviceId, secret} for a 1h session, timing-safe. A
  // LINKED device mints a session for the ACCOUNT it points at, which is the "follows you to any
  // device" story: the same credential, a different subject once the account owns it.
  exchange: async (_args, ctx) => {
    const body = ctx.body ?? {};
    const deviceId = typeof body.deviceId === "string" ? body.deviceId : "";
    const secret = typeof body.secret === "string" ? body.secret : "";
    const row = AUTH_UUID_RE.test(deviceId) ? await svc.get("device_identity", deviceId) : null;
    const stored = row && typeof row.secret_hash === "string" ? row.secret_hash : AUTH_DUMMY_HASH;
    const candidate = secret === "" ? "" : sha256hex(secret);
    const ok = row !== null && candidate !== "" && hashEq(candidate, stored);
    if (!ok) return authJson(401, { reason: "device_unknown", message: "this device credential is not recognised" });
    const linked = row.linked_viewer_id ? String(row.linked_viewer_id) : "";
    const sub = linked !== "" ? linked : String(row.viewer_id);
    const kind = linked !== "" ? "account" : "device";
    await svc.update("device_identity", deviceId, { last_seen_at: new Date().toISOString() });
    return { session: mintSession({ sub, kind, dev: deviceId }), expiresIn: 3600, kind, sub, deviceId, linked: linked !== "" };
  },

  // POST /auth/link — Bearer = the ACCOUNT session. Verify the device, point it at the account,
  // and MERGE the device viewer's rows into the account. The host has already verified the token
  // (auth="required"); a DEVICE token is refused here, because linking a device to a device is
  // nonsense and would strand the merge on the wrong subject.
  link: async (_args, ctx) => {
    const identity = ctx.identity && typeof ctx.identity === "object" ? ctx.identity : null;
    const accountSub = identity ? String(identity.sub ?? "") : "";
    if (accountSub === "" || !AUTH_UUID_RE.test(accountSub)) return authJson(401, { reason: "unauthenticated", message: "an account session is required to link a device" });
    const claims = identity && typeof identity.claims === "object" ? identity.claims : {};
    if (claims.kind === "device") return authJson(400, { reason: "invalid", message: "link with an account session, not a device session" });
    const body = ctx.body ?? {};
    const deviceId = typeof body.deviceId === "string" ? body.deviceId : "";
    const secret = typeof body.secret === "string" ? body.secret : "";
    const row = AUTH_UUID_RE.test(deviceId) ? await svc.get("device_identity", deviceId) : null;
    const stored = row && typeof row.secret_hash === "string" ? row.secret_hash : AUTH_DUMMY_HASH;
    const candidate = secret === "" ? "" : sha256hex(secret);
    if (row === null || candidate === "" || !hashEq(candidate, stored)) return authJson(401, { reason: "device_unknown", message: "this device credential is not recognised" });
    if (row.linked_viewer_id && String(row.linked_viewer_id) !== accountSub) return authJson(409, { reason: "conflict", message: "this device is already linked to another account" });
    const deviceViewer = String(row.viewer_id);
    await svc.update("device_identity", deviceId, { linked_viewer_id: accountSub });
    let merged;
    try {
      merged = await mergeDeviceIntoAccount(deviceViewer, accountSub);
    } catch (e) {
      console.error("[auth.link merge] failed:", e);
      return authJson(503, { reason: "unavailable", message: "the device was linked but its data could not be merged — sign in again to retry" });
    }
    return { linked: true, done: true, account: accountSub, merged };
  },

  // POST /auth/unlink — Bearer = the account (or the linked device acting as it). Retire the
  // device credential; the merged data stays on the account and the client registers a fresh
  // device. Only the account a device is linked to may unlink it, and the answer is the same
  // whether or not it was linked, so nothing leaks about a device the caller does not own.
  unlink: async (_args, ctx) => {
    const identity = ctx.identity && typeof ctx.identity === "object" ? ctx.identity : null;
    const accountSub = identity ? String(identity.sub ?? "") : "";
    if (accountSub === "") return authJson(401, { reason: "unauthenticated", message: "a session is required" });
    const body = ctx.body ?? {};
    const deviceId = typeof body.deviceId === "string" ? body.deviceId : "";
    const row = AUTH_UUID_RE.test(deviceId) ? await svc.get("device_identity", deviceId) : null;
    if (row !== null && String(row.linked_viewer_id ?? "") === accountSub) {
      await svc.remove("device_identity", deviceId);
    }
    return { unlinked: true };
  },
};
const authRoutes = [
  // Rates are per bucket (a `sub` for an identified caller, an IP for anonymous — clientAddress
  // below). register is once per fresh install; exchange fires on every cold start and 401, so it
  // matches /wallet/state; link/unlink are deliberate, rare acts.
  { key: "auth-device-register", chain: "authx", action: "register", method: "POST", path: "/auth/device/register", auth: "none", rate: "60/h" },
  { key: "auth-device-exchange", chain: "authx", action: "exchange", method: "POST", path: "/auth/device", auth: "none", rate: "240/m" },
  { key: "auth-device-link", chain: "authx", action: "link", method: "POST", path: "/auth/link", auth: "required", rate: "20/h" },
  { key: "auth-device-unlink", chain: "authx", action: "unlink", method: "POST", path: "/auth/unlink", auth: "required", rate: "20/h" },
];

const host = createHost({
  routes: [...routes, ...opsRoutes, ...authRoutes],
  handlers: { ...handlers, opsx: opsHandlers, authx: authHandlers },
  spend: spendBudgets,
  internalKey: env("DSX_INTERNAL_KEY"),
  // WITHOUT THIS, EVERY DECLARED `rate=` ON A PUBLIC ROUTE IS A GLOBAL LIMIT.
  // host.ts buckets an identified caller by their verified `sub`, and everyone else by
  // `clientAddress(req)` — and when that is not supplied it buckets them by the EMPTY
  // STRING, so all anonymous callers share one counter per route. The storefront reads are
  // `auth="none"`, so declaring a ceiling on them before filling this seam would have
  // turned a defence into a self-inflicted outage: one crawler would 429 every reader.
  // x-forwarded-for first (a real deployment sits behind a proxy and the socket address is
  // then the proxy's), leftmost hop, falling back to the peer address `toWebRequest` stamps
  // onto the request. It is stamped on the REQUEST rather than held in a module variable on
  // purpose: a Web Request carries no peer address, and a shared `let` would be read after
  // an await by whichever request happened to be in flight. Locally every caller is ::1,
  // which is correct — one machine is one caller.
  clientAddress: (req) => {
    const fwd = req.headers.get("x-forwarded-for");
    if (typeof fwd === "string" && fwd !== "") return fwd.split(",")[0].trim();
    return req.headers.get(PEER_HEADER) ?? null;
  },
});
const resolveIdentity = createIdentityResolver(env);

// THE MCP FACE — the `<tool>` rows in server/admin.dsx, served at /mcp over the streamable
// HTTP transport. Same declared actions, same handlers, same identity boundary as the HTTP
// routes: one declaration, three faces (UI · agent · curl). Without this the Manage screen's
// "manage it from ChatGPT" line would be a claim with nothing behind it.
// The emitted rows carry no `inputs` (upstream gap above), which leaves every tool with an
// EMPTY input schema: arguments are dropped, so a mutating tool silently no-ops while the
// agent is told it succeeded. The action's declared `inputs=` is the contract the row should
// have carried, so read it back from the documents rather than restating it here — one
// source of truth, and it cannot drift from the action it describes.
const declaredInputs = (() => {
  const byAction = {};
  for (const file of readdirSync("server").filter((f) => f.endsWith(".dsx"))) {
    const src = readFileSync(resolve("server", file), "utf8");
    for (const m of src.matchAll(/<action\s+as="([^"]+)"(?:\s+inputs="([^"]*)")?/g)) {
      byAction[m[1]] = (m[2] ?? "").split(",").map((x) => x.trim()).filter(Boolean);
    }
  }
  return byAction;
})();
const toolRows = mcpTools.map((t) => ({ ...t, inputs: t.inputs ?? declaredInputs[t.action] ?? [] }));
const mcp = toolRows.length > 0
  ? createMcpFace({ tools: toolRows, handlers, serverName: "short-drama", serverVersion: "0.1.0",
      onError: (info) => console.error(`[mcp] ${info.tool} failed (${info.correlationId}):`, info.error) })
  : null;
const REGISTRY_FILE = resolve(SITE, "registry.json");
const readRegistry = () => JSON.parse(readFileSync(REGISTRY_FILE, "utf8"));
let registry = readRegistry();
// The face is the BUILD's business now: `despia build` resolves the framework's bundled
// Inter, copies it to dist/fonts, and writes stylesheets:["/fonts/inter.css"] into
// registry.shell — which this handler already spreads (live.ts), so the live lane and the
// static export link the same one file. This used to pass its own public/type copy, which
// worked only here and shipped the face twice.
let site = createSiteHandler(SITE, registry, { stream: false });

// THE SSR SHEET AND THE CLIENT SHEET SHARE ONE ID NAMESPACE, AND NOTHING VERSIONS IT.
// A compiled page's styles are atomic classes numbered by POSITION — `[data-dsx~="a517"]`
// — emitted twice: once into the SSR html by this handler's boot-time registry, once at
// runtime by the client bundle read fresh off disk. When those two disagree the ids still
// MATCH, so the cascade quietly hands each element somebody else's declarations. Measured
// here after one forgotten restart: the top nav rendered 32x64 instead of 1440x64, because
// the client's a517 was the 32px logo square and the SSR sheet's a517 was the bar. No
// console warning, no hydration mismatch, no error anywhere — the page just looked wrong.
//
// That is a two-minute detour locally and a production incident behind a CDN, where a
// cached html document outlives a fresh bundle by design. The framework ask is upstream
// (PLAN.md §6.39: hash the sheet and refuse a mismatched pair). What this origin owes its
// reader is that the trap never fires silently: the registry is re-read the moment the
// build that produced it changes, and it says so.
let registryStamp = statSync(REGISTRY_FILE).mtimeMs;
const refreshSiteIfRebuilt = () => {
  let stamp;
  try { stamp = statSync(REGISTRY_FILE).mtimeMs; } catch { return; }   // mid-build write
  if (stamp === registryStamp) return;
  try { registry = readRegistry(); } catch { return; }                 // half-written json
  registryStamp = stamp;
  site = createSiteHandler(SITE, registry, { stream: false });
  console.log("[serve] dist/ was rebuilt — SSR registry reloaded (stale sheet ids avoided)");
};

/** The peer address, carried on the request so `clientAddress` can bucket rate limits. */
const PEER_HEADER = "x-dsx-peer-address";

function toWebRequest(req, body) {
  const url = `http://${req.headers.host ?? "localhost"}${req.url ?? "/"}`;
  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) {
    if (typeof v === "string") headers.set(k, v);
    else if (Array.isArray(v)) for (const one of v) headers.append(k, one);
  }
  // Stamped LAST so a client cannot supply its own and choose which rate bucket to spend.
  headers.set(PEER_HEADER, req.socket?.remoteAddress ?? "");
  const init = { method: req.method ?? "GET", headers };
  if (init.method !== "GET" && init.method !== "HEAD" && body.length > 0) init.body = body;
  return new Request(url, init);
}

async function writeWebResponse(webRes, res) {
  const headers = {};
  webRes.headers.forEach((v, k) => { headers[k] = v; });
  res.writeHead(webRes.status, headers);
  const buf = Buffer.from(await webRes.arrayBuffer());
  res.end(buf);
}

// ══════════════════════════════════════════════════════════════════════════════════════
//  THE MEDIA PLANE — what a CDN would do, done here, badly enough to be honest about it.
//
//  THE DEFECT THIS CLOSES. `public/media/*` was served flat by the static handler, so
//  `curl http://localhost:8787/media/bride.mp4` returned 991,017 bytes with no token, no
//  referrer check and no entitlement of any kind. Combined with `showDetail` returning
//  every paid episode's `video_url` on an `auth="none"` route, the coin economy was
//  decorative: the paywall protected the PLAYER and the media was an open bucket behind it.
//  server/catalog.dsx closed the payload half. This is the other half — without it, closing
//  the payload just means the URLs have to be guessed instead of read, and there are three
//  of them.
//
//  THE RULE. Every media request must name the EPISODE it is claiming (`?ep=<uuid>`), and
//  that episode's own `video_url` must be this path. Then:
//     · the episode is FREE (price 0, or index inside the show's free window) → serve. A
//       free episode is the funnel's hook; it is public on purpose, to anyone, signed in or
//       not, exactly like the poster art.
//     · otherwise → a `&ticket=<uuid>` naming an UNEXPIRED playticket row for that same
//       episode. The ticket is minted by `GET /wallet/play/:episode` (server/wallet.dsx),
//       which re-runs free/VIP/unlock server-side. No ticket, wrong episode, expired: 403.
//  The `ep` is not decoration and not redundant with the ticket: one file backs many
//  episodes here (three MP4s stand in for 352), so without it a single free episode's id
//  would open every file in the bucket.
//
//  WHAT A PRODUCTION DEPLOYMENT DOES INSTEAD, precisely. It never routes bytes through the
//  origin at all. `playSource` returns a SIGNED CDN URL and the edge verifies it with no
//  round trip and no database:
//     · CloudFront  — `?Expires=…&Signature=…&Key-Pair-Id=…`, verified at the POP;
//     · Cloudflare Stream / R2 — a signed URL token, or Access with a service token;
//     · Mux / Bitmovin — a signed playback JWT scoped to one playback id and TTL.
//  All three are the same shape as this: a capability with an expiry, checked before the
//  first byte. The difference is only WHERE it is checked. The reason this template checks
//  it at the origin rather than signing is named in server/wallet.dsx and filed as PLAN.md
//  §6.82: a declared `<server>` action's module table is `data` · `queue` · `secret` ·
//  declared packages, with no crypto seam, so a signature cannot be computed in the
//  declared lane. A row id from `gen_random_uuid()` is the same 122 bits of unguessability;
//  it just costs a lookup.
//
//  The lookups are memoised because a `<video>` opens a media file with several RANGE
//  requests and re-deriving entitlement per range would be absurd. Episode facts for 60s
//  (an operator republishing takes effect within a minute); a ticket until its own expiry,
//  which is the only correct TTL for it.
const EP_TTL_MS = 60_000;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const epFacts = new Map();      // episode id → { at, free, path }
const ticketFacts = new Map();  // ticket id  → { episode, expiresMs }

/** The pathname an episode's stored `video_url` points at, query and origin removed. */
const mediaPathOf = (videoUrl) => {
  if (typeof videoUrl !== "string" || videoUrl === "") return null;
  try { return new URL(videoUrl, "http://x").pathname; } catch { return null; }
};

async function episodeFacts(id) {
  const hit = epFacts.get(id);
  if (hit !== undefined && Date.now() - hit.at < EP_TTL_MS) return hit;
  const ep = await svc.get("episode", id);
  if (ep === null || ep.state !== "live") {
    const miss = { at: Date.now(), free: false, path: null };
    epFacts.set(id, miss);
    return miss;
  }
  const show = await svc.get("show", ep.show);
  // The SAME free rule server/catalog.dsx and server/wallet.dsx spell, third and last copy.
  // It is duplicated across the language boundary, not shared, so `npm run verify` asserts
  // the three agree rather than trusting that they do (the twin-divergence class that cost
  // two dropped columns once — see this file's stats handler and verify.mjs's header).
  const free = ep.price === 0 || (show !== null && ep.idx <= show.free_until);
  const facts = { at: Date.now(), free, path: mediaPathOf(ep.video_url) };
  epFacts.set(id, facts);
  return facts;
}

async function ticketOk(id, episode) {
  const hit = ticketFacts.get(id);
  // A cached ticket is trusted only while it is still valid. `playSource` ROLLS a ticket's
  // expiry forward rather than minting a new row (that is what keeps the table bounded), so
  // a memo that outlived its own window would report the refreshed ticket as expired and
  // stall playback mid-episode. Past the window, re-read.
  if (hit !== undefined && hit.expiresMs > Date.now()) return hit.episode === episode;
  const row = await svc.get("playticket", id);
  if (row === null) return false;
  const expiresMs = row.expires === null || row.expires === undefined ? 0 : new Date(row.expires).getTime();
  ticketFacts.set(id, { episode: row.episode, expiresMs });
  return row.episode === episode && expiresMs > Date.now();
}

/** does the episode whose media lives at `owned` (its video_url pathname) own the request path? */
const mediaOwned = (owned, path) => {
  if (owned === null || owned === undefined) return false;
  if (owned === path) return true;
  if (!owned.endsWith(".m3u8")) return false;
  const dir = owned.slice(0, owned.lastIndexOf("/") + 1);
  return path.startsWith(dir) && !path.slice(dir.length).includes("..");
};

// ══ THE TOKENIZED PLAYLIST — what a CDN does with signed cookies, done here in the open ══
// An HLS player fetches a master, then rung playlists, then dozens of segments — and NONE of
// the native players (AVPlayer, ExoPlayer) carries the master URL's query string onto the
// child URIs it reads out of the playlist. The grant (`?ep=…&ticket=…`) would die at the
// first segment and the clip would stall at 0:00 with a 403 in the log. So the origin
// rewrites every URI in a playlist it serves — the plain URI lines and the `URI="…"`
// attributes of #EXT-X-MEDIA / #EXT-X-MAP — to carry the same query the master was asked
// with. A production edge does exactly this (CloudFront signed cookies, Cloudflare Stream
// signed tokens, Mux playback tokens): the token is minted once and rides every child
// request. The web renderer's own HLS lane inherits the query itself and is unaffected.
const MEDIA_ROOT = resolve(SITE, "..", "public");
function tokenizedPlaylist(path, url) {
  let text;
  try { text = readFileSync(resolve(MEDIA_ROOT, path.slice(1)), "utf8"); } catch { return null; }
  const grant = new URLSearchParams();
  for (const k of ["ep", "ticket"]) { const v = url.searchParams.get(k); if (v !== null) grant.set(k, v); }
  const q = grant.toString();
  if (q === "") return text;
  const carry = (uri) => (uri.includes("?") ? `${uri}&${q}` : `${uri}?${q}`);
  return text.split("\n").map((line) => {
    if (line.startsWith("#")) return line.replace(/URI="([^"]+)"/g, (_, uri) => `URI="${carry(uri)}"`);
    const t = line.trim();
    return t === "" ? line : carry(t);
  }).join("\n");
}

/** null ⇒ serve it; a Response ⇒ refuse, with the reason a developer needs. */
async function refuseMedia(path, url) {
  const ep = url.searchParams.get("ep") ?? "";
  const ticket = url.searchParams.get("ticket") ?? "";
  const no = (message) => new Response(JSON.stringify({ reason: "forbidden", message }), {
    status: 403,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
  if (!UUID_RE.test(ep)) {
    return no(
      "this media is entitlement-gated: a player asks GET /wallet/play/:episode for a source URL. " +
      "If you are trying to play a HOUSE AD CREATIVE, that is not episode media — serve it from /promo/ " +
      "(scripts/serve.mjs PROMO_ALIAS; Components/parts/AdGate.dsx's `creative` attribute still points at /media/).",
    );
  }
  const facts = await episodeFacts(ep);
  // The episode must actually be the one this file belongs to — otherwise one free
  // episode's id would be a master key to the whole bucket. A progressive episode owns ONE
  // file; an HLS episode (`video_url` ending .m3u8) owns its whole DIRECTORY — the master,
  // the rung playlists, the init and media segments and the WebVTT renditions all live
  // under it (scripts/gen-hls.mjs), and every one of them is a separate request from the
  // player that must carry the same grant.
  if (!mediaOwned(facts.path, path)) return no("that episode does not play this file");
  if (facts.free) return null;
  if (!UUID_RE.test(ticket)) return no("this episode is locked — unlock it, then ask GET /wallet/play/:episode");
  if (!(await ticketOk(ticket, ep))) return no("that playback ticket is expired or not yours — ask GET /wallet/play/:episode again");
  return null;
}

// THE HOUSE AD CREATIVE IS NOT EPISODE CONTENT, and now that /media is gated it cannot
// live there. `/promo/*` is the public creative lane, and `/promo/house-ad.mp4` is an
// ALIAS onto one of the demo's episode stand-ins — zero new bytes in a repo that already
// carries 3 MB of them (the audit's M11), and a real destination for the one-line change
// `Components/parts/AdGate.dsx` needs (its creative is `/media/heiress.mp4` today, which
// is the audit's M10: a drama clip wearing an "AD" tag). Aliasing by REWRITING the request
// keeps the static handler's Range support, which a readFileSync would throw away.
const PROMO_ALIAS = { "/promo/house-ad.mp4": "/media/heiress.mp4" };

// ══════════════════════════════════════════════════════════════════════════════════════
//  THE LOCAL SESSION, SERVED AT RUNTIME — never built, never deployed.
//
//  `scripts/dev-session.mjs` used to write the operator's service_role JWT into `public/`
//  AND `dist/`. `despia build` copies the first into the second and `despia deploy
//  cloudflare` uploads it, so a full-write token shipped at a guessable URL on every
//  deployment. The file now lives at the repo root (`.dev-session.json`), outside every
//  tree the build walks, and this handler is how the local app still finds it.
//
//  THE GATE IS THE PRECEDENT ALREADY IN THIS FILE. `/internal/admin/*` is host-gated
//  because §6.7 leaves no declared way to hold service authority; this is the same shape
//  for the same reason. It cannot use the host's own gateway — the whole point of the
//  endpoint is that the caller has no token yet — so the credential is the NETWORK:
//  loopback, `.local`, or an RFC1918 address. A device on the dev LAN can reach it (which
//  is how you test a phone against this origin); anything with a public hostname cannot.
//  Plus a hard refusal under NODE_ENV=production, because this origin is not what should be
//  answering there at all.
const SESSION_FILE = resolve(process.cwd(), ".dev-session.json");
const privateHost = (hostHeader) => {
  const name = String(hostHeader ?? "").replace(/:\d+$/, "").replace(/^\[|\]$/g, "").toLowerCase();
  if (name === "localhost" || name === "127.0.0.1" || name === "::1" || name === "0.0.0.0") return true;
  if (name.endsWith(".local") || name.endsWith(".localhost")) return true;
  if (/^10\.\d+\.\d+\.\d+$/.test(name)) return true;
  if (/^192\.168\.\d+\.\d+$/.test(name)) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\.\d+\.\d+$/.test(name)) return true;
  if (/^127\.\d+\.\d+\.\d+$/.test(name)) return true;
  if (name.startsWith("fe80:") || name.startsWith("fd") || name.startsWith("fc")) return true;
  return false;
};

const server = createServer((req, res) => {
  // DSX_DEV_LOG_REQUESTS=1 — one line per request, for tracing what a DEVICE actually
  // asked the origin (CFNetwork's device-side summaries omit URLs).
  if (process.env.DSX_DEV_LOG_REQUESTS) console.log("[req]", req.method, req.url);
  void (async () => {
    const chunks = [];
    let size = 0;
    for await (const chunk of req) {
      size += chunk.length;
      if (size > 1_048_576) {
        res.writeHead(413, { "content-type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ reason: "bad_request", message: "request body exceeds 1 MiB" }), () => req.destroy());
        return;
      }
      chunks.push(chunk);
    }
    let webReq = toWebRequest(req, Buffer.concat(chunks));
    const reqUrl = new URL(webReq.url);
    let path = reqUrl.pathname;

    // THE LOCAL SESSION — before everything, because the site handler would 404 it and the
    // API host would answer `unknown_route`, and neither says what is actually wrong.
    if (path === "/dev-session.json") {
      const allowed = process.env.NODE_ENV !== "production" && privateHost(req.headers.host);
      if (!allowed) {
        // 404, not 403: a public host must not learn that this endpoint exists here, the
        // same posture host.ts takes for a reach:[] route.
        res.writeHead(404, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
        res.end(JSON.stringify({ reason: "unknown_route", message: "no route matches GET /dev-session.json" }));
        return;
      }
      let body;
      try {
        body = readFileSync(SESSION_FILE, "utf8");
      } catch {
        res.writeHead(404, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
        res.end(JSON.stringify({ reason: "not_found", message: "no local session — run `npm run session`" }));
        return;
      }
      res.writeHead(200, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
      res.end(body);
      return;
    }

    // THE HOUSE CREATIVE ALIAS — rewrite before anything else looks at the path, so the
    // static handler serves it with its Range support intact.
    if (PROMO_ALIAS[path] !== undefined) {
      reqUrl.pathname = PROMO_ALIAS[path];
      path = reqUrl.pathname;
      webReq = new Request(reqUrl.toString(), { method: webReq.method, headers: webReq.headers });
    } else if (path.startsWith("/media/")) {
      // THE ENTITLEMENT GATE, in front of the bytes. Delegates to the static handler on a
      // pass so ranged playback keeps working; answers 403 with a usable message on a fail.
      const refused = await refuseMedia(path, reqUrl);
      if (refused !== null) { await writeWebResponse(refused, res); return; }
      if (path.endsWith(".m3u8")) {
        // a playlist is REWRITTEN, never served flat: every child URI inherits the grant
        const body = tokenizedPlaylist(path, reqUrl);
        if (body === null) {
          res.writeHead(404, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
          res.end(JSON.stringify({ reason: "not_found", message: `no playlist at ${path} — run \`node scripts/gen-hls.mjs\`` }));
          return;
        }
        res.writeHead(200, { "content-type": "application/vnd.apple.mpegurl", "cache-control": "no-store" });
        res.end(body);
        return;
      }
    }
    // THE LOCAL LANE HAS NO SERVICE WORKER (PLAN.md §6.13a). `despia build` emits a
    // precaching SW; against a rebuilt origin it replays a stale bundle whose style
    // tokens no longer match the freshly rendered markup, and correct DSX then looks
    // broken. Refusing the script here means a dev browser can never register one — the
    // offline plane still ships in the real build, where it belongs.
    if (env("DSX_DEV_NO_SW") === "1" && (path === "/dsx-sw.js" || path.endsWith("/dsx-sw.js"))) {
      res.writeHead(404, { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" });
      res.end("service worker disabled in the local lane (DSX_DEV_NO_SW=1)");
      return;
    }
    // The site answers static assets and pages, and returns null for what it does not own;
    // the API host stays last because it always answers. API-shaped paths skip the site so
    // a stale asset can never shadow a route.
    // `/webhooks/` belongs here for the reason this list exists at all — a stale asset must
    // never shadow a route — and a RECEIVER is the one route where that must never be in
    // doubt: a sender retries a shadowed delivery into a 200 and the event is lost silently.
    // It also keeps the body off the site handler's path; the signed bytes verify only if
    // nothing upstream reads or rebuilds the stream.
    const apiShaped = ["/catalog/", "/viewer/", "/wallet/", "/rewards/", "/admin/", "/internal/", "/webhooks/", "/mcp", "/health"].some((p) => path === p || path.startsWith(p));
    if (!apiShaped) {
      refreshSiteIfRebuilt();
      // ── ART NEGOTIATION: PNG for native, SVG for the web (founder decision, 2026-08-31).
      // The key art is authored as SVG (gen-art.mjs) and stays SVG in the DATA — every
      // payload URL ends .svg — because iOS's <image> decodes through ImageIO, which cannot
      // read SVG and fails open to a blank placeholder. Rather than fork the data or the
      // markup per platform, the ORIGIN answers each client with the twin it can decode:
      // a browser identifies itself with "Mozilla" and keeps the crisp SVG; a native
      // URLSession does not, and receives the pre-rasterised PNG twin
      // (scripts/rasterize-art.mjs — run it after gen-art; the twins are build output,
      // gitignored). In production this is a one-line CDN rule (rewrite *.svg → *.png when
      // the UA lacks "Mozilla"). A missing twin falls back to the SVG with a warning, so a
      // clone that skipped the rasterise step degrades visibly, never silently.
      const wantsArt = /^\/(posters|assets)\/.+\.svg$/.test(path);
      if (wantsArt && !String(req.headers["user-agent"] ?? "").includes("Mozilla")) {
        const pngPath = resolve(SITE, "..", "public", path.slice(1).replace(/\.svg$/, ".png"));
        try {
          const png = readFileSync(pngPath);
          res.writeHead(200, { "content-type": "image/png", "cache-control": "no-store" });
          res.end(png);
          return;
        } catch {
          console.warn(`[serve] no PNG twin for ${path} — run \`node scripts/rasterize-art.mjs\`; serving SVG (blank on native)`);
        }
      }
      const served = await site(webReq);
      if (served !== null) { await writeWebResponse(served, res); return; }
    }
    const identity = await resolveIdentity(webReq);
    // Scoped to the MCP path itself: `mcp()` answers null for anything it does not own, so
    // a gate that ran before the call would 404 every API route in the app.
    if (mcp !== null && (path === "/mcp" || path.startsWith("/mcp/"))) {
      // ══ THE MCP FACE IS OPERATOR-ONLY, AND THE FRAMEWORK CANNOT SAY THAT YET ══════════
      // Every `<tool>` row in this project is an admin verb (server/admin.dsx), and two of
      // them — adminStats and adminListShows — read the UNPUBLISHED catalogue: `show` is
      // ownership="public-read", whose SELECT policy is `using (true)`, and the public
      // reads filter `state:'live'` in application code that these actions do not run.
      // The declared HTTP routes now close that with `reach=""` (the host's gateway: service
      // role or the internal key, 404 to everyone else). createMcpFace has no equivalent —
      // it checks `auth === "required"` and a NON-NULL identity and nothing else, with no
      // notion of `reach` and no role check — so the same two reads stayed reachable over
      // /mcp with any signed-in viewer's token. Same leak, different door.
      // The mount is this file's to own, so the gate goes here: the whole face is held to
      // the same test host.ts applies to an internal route. Upstream ask: a `<tool>` row
      // needs the route gateway's authority model — PLAN.md §6.84. This block dies with it.
      const role = identity !== null && typeof identity === "object" ? identity.role : null;
      const key = env("DSX_INTERNAL_KEY");
      const byKey = typeof key === "string" && key !== "" && webReq.headers.get("x-dsx-internal-key") === key;
      if (role !== "service_role" && !byKey) {
        res.writeHead(404, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
        res.end(JSON.stringify({ reason: "unknown_route", message: `no route matches ${webReq.method} ${path}` }));
        return;
      }
      const served = await mcp(webReq, { identity, env });
      if (served !== null) { await writeWebResponse(served, res); return; }
    }
    const webRes = await host.handle(webReq, { identity, env });
    await writeWebResponse(webRes, res);
  })().catch((e) => {
    if (res.headersSent) { res.destroy(); return; }
    const correlationId = crypto.randomUUID();
    console.error(`[serve] transport failed (${correlationId}):`, e);
    res.writeHead(500, { "content-type": "application/json; charset=utf-8", "x-dsx-correlation-id": correlationId });
    res.end(JSON.stringify({ reason: "handler_failed", message: "internal error" }));
  });
});

server.listen(PORT, () => console.log(`[serve] short-drama at http://localhost:${PORT} (site: ${SITE})`));
