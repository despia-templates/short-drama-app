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
import { readFileSync, readdirSync } from "node:fs";
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
    };
    if (typeof args.id === "string" && args.id !== "") {
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

const host = createHost({
  routes: [...routes, ...opsRoutes],
  handlers: { ...handlers, opsx: opsHandlers },
  spend: spendBudgets,
  internalKey: env("DSX_INTERNAL_KEY"),
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
const registry = JSON.parse(readFileSync(resolve(SITE, "registry.json"), "utf8"));
// The face is the BUILD's business now: `despia build` resolves the framework's bundled
// Inter, copies it to dist/fonts, and writes stylesheets:["/fonts/inter.css"] into
// registry.shell — which this handler already spreads (live.ts), so the live lane and the
// static export link the same one file. This used to pass its own public/type copy, which
// worked only here and shipped the face twice.
const site = createSiteHandler(SITE, registry, { stream: false });

function toWebRequest(req, body) {
  const url = `http://${req.headers.host ?? "localhost"}${req.url ?? "/"}`;
  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) {
    if (typeof v === "string") headers.set(k, v);
    else if (Array.isArray(v)) for (const one of v) headers.append(k, one);
  }
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

const server = createServer((req, res) => {
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
    const webReq = toWebRequest(req, Buffer.concat(chunks));
    const path = new URL(webReq.url).pathname;
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
    const apiShaped = ["/catalog/", "/viewer/", "/wallet/", "/rewards/", "/admin/", "/internal/", "/mcp", "/health"].some((p) => path === p || path.startsWith(p));
    if (!apiShaped) {
      const served = await site(webReq);
      if (served !== null) { await writeWebResponse(served, res); return; }
    }
    const identity = await resolveIdentity(webReq);
    if (mcp !== null) {
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
