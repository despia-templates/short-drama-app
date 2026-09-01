//
//  scripts/verify.mjs — the BEHAVIOURAL gate. `lint`, `review` and `check:styles` read the
//  source; this one runs the thing and asks the questions a human would: does every route
//  answer, does the SSR html carry real content, do the payloads still have the fields the
//  screens read?
//
//  WHY IT EXISTS. Three defects shipped in one week that every static gate passed, because
//  each was a runtime disagreement rather than bad source:
//    · the host-gated ops twin in serve.mjs built its own values object, so two new columns
//      were silently dropped on the way to the database and every show reported 0 views;
//    · `await` inside a ternary returned a non-ok result in a server action, so a related
//      rail came back empty for a genre with two live shows — no throw, no log;
//    · a demo-metrics table was keyed on slugs that had been invented rather than read, so
//      six shows fell through to one shared fallback.
//  Every one of them is a shape assertion away from being caught. That is this file.
//
//  A FOURTH CLASS ARRIVED, and it is the reason half this file now exists. The production
//  audit found that every static gate was green while the app served every paid episode's
//  media URL to anonymous callers, wrote a service_role token into the deploy artefact, and
//  granted twice on every concurrent daily reward. None of those is bad source: each is a
//  RUNTIME agreement — between a payload and a paywall, between a build and a deploy,
//  between two requests that arrive together — and a source-reading gate cannot see any of
//  them. So this file now signs in, spends money, races itself, and reads the artefact.
//
//  THE SHAPE OF AN ASSERTION HERE. It fails on the DEFECT, not on the fix. "The payload has
//  no `video` for a locked episode" would pass if `episodes` were empty; "no locked episode
//  anywhere in the catalogue carries a source, and there is at least one locked episode"
//  cannot. Every negative below is paired with the positive that proves it was reachable.
//
//  It boots its own server on a spare port so it never depends on one already running, and
//  kills it on the way out — including on a failed assertion.
//
import { spawn } from "node:child_process";
import { createHmac, randomUUID } from "node:crypto";
import { existsSync, readFileSync, mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { request as httpRequest } from "node:http";
import { tmpdir } from "node:os";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import pg from "pg";
import { scanDistForSecrets } from "./dist-guard.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PORT = Number(process.env.VERIFY_PORT ?? 8799);
const base = `http://localhost:${PORT}`;

// the same .env.local fold serve.mjs and dev-session.mjs do — this file now needs the JWT
// secret (to mint its own callers) and the database URL (to arrange fixtures), and the
// documented run order does not source the file into the shell
if (existsSync(resolve(root, ".env.local"))) {
  for (const line of readFileSync(resolve(root, ".env.local"), "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2];
  }
}

let failures = 0;
const ok = (name) => console.log(`  ok   ${name}`);
const bad = (name, detail) => { failures += 1; console.error(`  FAIL ${name}\n       ${detail}`); };
const check = (name, cond, detail) => (cond ? ok(name) : bad(name, detail));

// ── THE CALLERS ────────────────────────────────────────────────────────────────────────
// A FRESH SUBJECT PER RUN, minted here rather than read from .dev-session.json. Three
// reasons, all learned the hard way while writing these tests against the shared demo
// viewer: the daily guards (check-in, spin) are once-per-DAY, so a second run the same day
// would assert against a viewer who had already used them; the unlock tests need an account
// whose entitlements are known; and a gate must never mutate the identity a developer is
// looking at in the browser. `sub` MUST be a UUID — owner RLS stores `owner_id uuid` and
// postgres.ts refuses a non-UUID subject outright (docs/auth.md).
const secret = process.env.DSX_JWT_SECRET;
if (!secret) { console.error("[verify] DSX_JWT_SECRET is required (it is what the origin verifies against)"); process.exit(1); }
const b64u = (buf) => Buffer.from(buf).toString("base64url");
const mint = (claims) => {
  const header = b64u(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const now = Math.floor(Date.now() / 1000);
  const payload = b64u(JSON.stringify({ iat: now, exp: now + 900, ...claims }));
  return `${header}.${payload}.${createHmac("sha256", secret).update(`${header}.${payload}`).digest("base64url")}`;
};
const viewerSub = randomUUID();
const viewer = { authorization: `Bearer ${mint({ sub: viewerSub })}`, "content-type": "application/json" };
const operator = { authorization: `Bearer ${mint({ sub: randomUUID(), role: "service_role" })}`, "content-type": "application/json" };
const anon = { "content-type": "application/json" };

const GET = (path, headers) => fetch(`${base}${path}`, { headers });
const POST = (path, headers, body) =>
  fetch(`${base}${path}`, { method: "POST", headers, body: JSON.stringify(body ?? {}) });
const asJson = async (res) => ({ status: res.status, body: await res.json().catch(() => null) });

// ── FIXTURES ───────────────────────────────────────────────────────────────────────────
// A few assertions need a wallet with money in it, and there is deliberately no route that
// credits one from the client — that is the whole trust shape (`server/wallet.dsx`: the
// client never grants). So the fixture goes in through the database, service-scope, exactly
// as an operator grant or a settled payment would. This is a TEST HARNESS reaching past the
// API on purpose; nothing in the app can do it.
const pool = process.env.DSX_DATABASE_URL ? new pg.Pool({ connectionString: process.env.DSX_DATABASE_URL }) : null;
const sql = async (text, params) => {
  if (pool === null) return null;
  return pool.query(text, params);
};

/** the page's visible text, script tags stripped — what a reader actually gets */
const bodyText = (html) => {
  const i = html.indexOf("<body");
  const body = i < 0 ? html : html.slice(i);
  return body.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ").trim();
};

const server = spawn(process.execPath, [resolve(root, "scripts/serve.mjs")], {
  cwd: root,
  env: { ...process.env, PORT: String(PORT), DSX_DEV_NO_SW: "1" },
  stdio: ["ignore", "pipe", "pipe"],
});
let serverLog = "";
server.stdout.on("data", (d) => { serverLog += d; });
server.stderr.on("data", (d) => { serverLog += d; });
const stop = () => { try { server.kill("SIGTERM"); } catch { /* already gone */ } };
process.on("exit", stop);
process.on("SIGINT", () => { stop(); process.exit(130); });

// wait for the origin to answer rather than sleeping a guessed amount
const ready = await (async () => {
  for (let i = 0; i < 60; i += 1) {
    if (server.exitCode !== null) return false;
    try {
      const r = await fetch(`${base}/catalog/home`);
      if (r.ok) return true;
    } catch { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 250));
  }
  return false;
})();

if (!ready) {
  console.error(`[verify] the server never became ready on :${PORT}\n${serverLog.slice(-1200)}`);
  stop();
  process.exit(1);
}

console.log(`[verify] origin up on :${PORT}`);

// ── 1 · the API payloads still carry the fields the screens read ───────────────────────
console.log("\napi payloads");
const home = await fetch(`${base}/catalog/home`).then((r) => r.json());
check("/catalog/home has all four rails",
  ["hero", "latest", "trending", "shelves"].every((k) => Array.isArray(home[k])),
  `got keys: ${Object.keys(home).join(", ")}`);
check("/catalog/home is not empty", home.latest.length > 0, "latest is empty — is the database seeded?");
const card = home.latest[0];
for (const field of ["id", "title", "genre", "poster", "episodes", "views", "rating"]) {
  check(`home card carries ${field}`, card[field] !== undefined, `missing on ${card.title ?? "?"}`);
}
check("home card episode count is real", card.episodes > 0,
  `${card.title} reports ${card.episodes} episodes — the 100-row list ceiling bites here (PLAN.md §6.20)`);
// `> 1 distinct` would have passed with seven shows sharing one fallback, which is exactly
// what the mis-keyed METRICS table shipped. Every show gets its own number or this fails.
check("demo metrics are per-show, not a shared fallback",
  new Set(home.latest.map((c) => c.views)).size === home.latest.length,
  `${home.latest.length} shows, only ${new Set(home.latest.map((c) => c.views)).size} distinct view counts — ` +
  "METRICS in scripts/catalogue.mjs is keyed on slugs that do not exist");

const browse = await fetch(`${base}/catalog/browse/all`).then((r) => r.json());
check("/catalog/browse/all returns chips with counts",
  Array.isArray(browse.genres) && browse.genres.length > 0 && browse.genres[0].count > 0,
  JSON.stringify(browse.genres ?? null).slice(0, 120));
check("browse filters by genre", await (async () => {
  const g = browse.genres[0].name;
  const one = await fetch(`${base}/catalog/browse/${encodeURIComponent(g)}`).then((r) => r.json());
  return one.active === g && one.total > 0 && one.total < browse.total;
})(), "a filtered browse did not narrow the result set");

const detail = await fetch(`${base}/catalog/show/${card.id}`).then((r) => r.json());
check("/catalog/show/:id returns show + episodes", detail.show != null && Array.isArray(detail.episodes),
  Object.keys(detail).join(", "));
check("detail carries the related rail", Array.isArray(detail.related),
  "related is missing from the payload");
// Array.isArray alone would have passed straight through the conditional-await regression
// (PLAN.md §6.31), which returned an EMPTY rail. Assert it actually fills somewhere: any
// genre with two or more live shows must produce a neighbour.
check("the related rail is populated where a genre has siblings", await (async () => {
  const shared = browse.genres.find((g) => g.count > 1);
  if (shared === undefined) return true;                       // nothing to relate — not a failure
  const list = await fetch(`${base}/catalog/browse/${encodeURIComponent(shared.name)}`).then((r) => r.json());
  const d = await fetch(`${base}/catalog/show/${list.items[0].id}`).then((r) => r.json());
  return Array.isArray(d.related) && d.related.length > 0;
})(), "a genre with two live shows produced no related titles — the rail is silently empty");
// TAGS are parsed in three places (card(), browse rows, showDetail) and the detail copy was
// the one that shipped a raw comma-joined STRING while the screens read it as a list — the
// tag row rendered nothing and no gate noticed. Assert the parsed shape everywhere.
check("home cards carry a tags ARRAY", Array.isArray(card.tags) && card.tags.length > 0,
  `got ${JSON.stringify(card.tags)} — the card helper is handing back a raw string`);
check("show detail carries a tags ARRAY", Array.isArray(detail.show.tags) && detail.show.tags.length > 0,
  `got ${JSON.stringify(detail.show.tags)} — showDetail returns the raw row, which stores tags comma-joined`);
check("browse offers tag chips beside the genres",
  Array.isArray(browse.tags) && browse.tags.length > 0 && browse.tags.every((t) => t.count > 1),
  `${JSON.stringify(browse.tags ?? null).slice(0, 120)} — a chip that narrows to one title is a dead end`);
check("browse filters by TAG, not just genre", await (async () => {
  const tag = browse.tags[0];
  const r = await fetch(`${base}/catalog/browse/${encodeURIComponent(tag.name)}`).then((x) => x.json());
  return r.active === tag.name && r.total === tag.count
    && r.items.every((i) => i.tags.includes(tag.name));
})(), "filtering by a tag did not return exactly the titles carrying it");

check("episodes carry a price and a free flag",
  detail.episodes.length > 0 && detail.episodes[0].price !== undefined && detail.episodes[0].free !== undefined,
  JSON.stringify(detail.episodes[0] ?? null).slice(0, 140));

// ── 2 · SSR delivers CONTENT, not a loading shell ──────────────────────────────────────
console.log("\nserver-side rendering");
for (const [path, needle] of [
  ["/", card.title.slice(0, 12)],
  ["/browse", "series"],
  ["/vip", "VIP"],
  ["/store", "Store"],
]) {
  const html = await fetch(`${base}${path}`).then((r) => r.text());
  const text = bodyText(html);
  check(`${path} server-renders its content`, text.includes(needle),
    `no "${needle}" in the delivered html — SSR seeding is not reaching the page. Got: ${text.slice(0, 90)}`);
  check(`${path} links the bundled face`, /rel="stylesheet"[^>]*fonts\/inter\.css/.test(html),
    "no /fonts/inter.css link — the page will render in whatever face the OS supplies");
}

// ── 2b · the art negotiation serves each lane a format it can decode ───────────────────
console.log("\nart negotiation");
{
  const poster = card.poster;                       // a real /posters/….svg URL from the payload
  const asBrowser = await fetch(`${base}${poster}`, { headers: { "user-agent": "Mozilla/5.0 (verify)" } });
  const asNative = await fetch(`${base}${poster}`, { headers: { "user-agent": "ShortDrama/1 CFNetwork" } });
  check("a browser gets the SVG", (asBrowser.headers.get("content-type") ?? "").includes("svg"),
    `browser UA got ${asBrowser.headers.get("content-type")} for ${poster}`);
  check("a native client gets the PNG twin", (asNative.headers.get("content-type") ?? "").includes("png"),
    `bare UA got ${asNative.headers.get("content-type")} — iOS <image> cannot decode SVG; ` +
    "run `node scripts/rasterize-art.mjs` (the twins are build output)");
}

// ── 3 · money is the SERVER's word ─────────────────────────────────────────────────────
console.log("\nauthority");
const unlock = await fetch(`${base}/wallet/unlock`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ episode: detail.episodes[detail.episodes.length - 1].id }),
});
// The bulk basket is the biggest single spend in the app. Its price is quoted and charged
// by the SERVER; the client sends only a show id. Both faces must refuse an anonymous caller,
// or the discount becomes a way to read another viewer's entitlements.
for (const [name, req] of [
  ["the series quote", fetch(`${base}/wallet/series/${detail.show.id}`)],
  ["a bulk unlock", fetch(`${base}/wallet/unlockseries`, {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ show: detail.show.id }),
  })],
]) {
  const res = await req;
  check(`${name} is refused without a session`, res.status >= 400,
    `answered ${res.status} to an anonymous caller — pricing and entitlement are the server's word`);
}

check("an unauthenticated unlock is refused", unlock.status >= 400,
  `POST /wallet/unlock answered ${unlock.status} with no token — entitlement must never be the client's word`);

// ── 4 · THE PAYWALL PROTECTS THE MEDIA, NOT THE PLAYER ─────────────────────────────────
// The audit's G1, and the worst thing that has shipped in this template. `showDetail`
// returned `video_url` for EVERY episode on an `auth="none"` route — so
// `curl /catalog/show/:id | jq '.episodes[].video'` handed a stranger all 24 paid episodes
// of a series, and `GET /media/bride.mp4` answered 200 with 991,017 bytes and no token.
// Both halves are asserted, and each negative is paired with the positive that proves the
// path was reachable at all — "no locked episode carries a source" passes trivially against
// an empty catalogue.
console.log("\nentitlement");
{
  let lockedSeen = 0;
  let lockedWithSource = 0;
  let freeWithSource = 0;
  let sampleShow = null;
  let sampleFree = null;
  let sampleLocked = null;
  for (const c of home.latest) {
    const d = await fetch(`${base}/catalog/show/${c.id}`).then((r) => r.json());
    for (const e of d.episodes) {
      if (e.free) { if (e.video != null) freeWithSource += 1; if (sampleFree === null) { sampleFree = e; sampleShow = d; } }
      else { lockedSeen += 1; if (e.video != null) lockedWithSource += 1; if (sampleLocked === null) sampleLocked = e; }
    }
  }
  check("the catalogue actually has locked episodes to protect", lockedSeen > 0,
    "every episode in the seed is free — this section would pass vacuously; check scripts/catalogue.mjs freeUntil");
  check("NO locked episode carries a playable source in the public payload", lockedWithSource === 0,
    `${lockedWithSource} of ${lockedSeen} locked episodes still ship a URL from an auth="none" route — the paywall is markup, not enforcement`);
  check("free episodes DO carry a source (the funnel still works)", freeWithSource > 0,
    "no free episode has a source either — the gate closed on the hook as well as the paywall");
  check("the discover reel carries a source only for free first episodes", await (async () => {
    const feed = await fetch(`${base}/catalog/discover`).then((r) => r.json());
    return Array.isArray(feed.cards) && feed.cards.length > 0 && feed.cards.some((c) => c.video != null);
  })(), "the discover reel has no playable card at all — its first episodes are free by construction");

  // THE MEDIA PLANE. Five requests, one per way in.
  const mediaPath = sampleFree.video.split("?")[0];
  const bare = await fetch(`${base}${mediaPath}`);
  check("bare media is refused", bare.status === 403,
    `GET ${mediaPath} answered ${bare.status} with no episode named — public/media was an open bucket`);
  const asFree = await fetch(`${base}${sampleFree.video}`, { headers: { range: "bytes=0-1023" } });
  check("a free episode's own source plays", asFree.status === 206 || asFree.status === 200,
    `the free source answered ${asFree.status} — the gate closed on the funnel's hook`);
  check("ranged playback survives the gate", asFree.status === 206,
    "the gate answered 200 to a Range request — AVFoundation treats that as unseekable and native playback breaks (site-node.ts)");
  const asLocked = await fetch(`${base}${mediaPath}?ep=${sampleLocked.id}`);
  check("a locked episode's media is refused without a ticket", asLocked.status === 403,
    `answered ${asLocked.status} — knowing a paid episode's id must not be enough to play it`);
  const wrongFile = await fetch(`${base}/media/bride.mp4?ep=${sampleFree.id}`);
  check("a free episode's id does not unlock a DIFFERENT file", wrongFile.status === 403,
    "one free episode id opened another file — three MP4s back 352 episodes here, so that is a master key");

  // THE ENTITLED DOOR. A brand-new viewer owns nothing.
  const playAnon = await fetch(`${base}/wallet/play/${sampleLocked.id}`);
  check("the play endpoint refuses an anonymous caller", playAnon.status === 401,
    `answered ${playAnon.status} — the source of a paid episode is not public`);
  const playUnentitled = await asJson(await GET(`/wallet/play/${sampleLocked.id}`, viewer));
  check("the play endpoint refuses a signed-in caller who has not paid", playUnentitled.status === 403,
    `answered ${playUnentitled.status} ${JSON.stringify(playUnentitled.body)} — a token is not an entitlement`);
  const playFree = await asJson(await GET(`/wallet/play/${sampleFree.id}`, viewer));
  check("the play endpoint answers for a free episode", playFree.status === 200 && typeof playFree.body?.source === "string",
    `answered ${playFree.status} ${JSON.stringify(playFree.body)}`);
  check("the issued source carries a ticket and an expiry", await (async () => {
    if (playFree.status !== 200) return false;
    if (!/ticket=[0-9a-f-]{36}/.test(playFree.body.source)) return false;
    const ttl = new Date(playFree.body.expires).getTime() - Date.now();
    return ttl > 0 && ttl <= 10 * 60_000;              // short-lived, per the signed-URL shape it stands in for
  })(), `source=${playFree.body?.source} expires=${playFree.body?.expires} — a grant with no expiry is a permanent shareable link`);
  // (a forged ticket is asserted in §6, against a PAID episode — a free episode needs no
  //  ticket at all, so forging one there proves nothing)

  // THE THREE COPIES OF THE FREE RULE. `price === 0 || idx <= free_until` is spelled in
  // server/catalog.dsx, in server/wallet.dsx and again in scripts/serve.mjs — across two
  // languages, so nothing can share it. Two formulas that must agree and do not is exactly
  // the class this file exists for, so the agreement is asserted rather than assumed.
  let disagreed = 0;
  for (const e of sampleShow.episodes) {
    const path = `/media/${sampleShow.episodes[0].video.split("/").pop().split("?")[0]}`;
    const r = await fetch(`${base}${path}?ep=${e.id}`, { method: "HEAD" });
    const originSaysFree = r.status !== 403;
    if (originSaysFree !== e.free) disagreed += 1;
  }
  check("the payload's free flag and the origin's free rule agree on every episode", disagreed === 0,
    `${disagreed} episode(s) disagree — server/catalog.dsx, server/wallet.dsx and scripts/serve.mjs each spell the free window separately`);
}

// ── 5 · EMBARGOED CONTENT IS NOT ONE AUTHENTICATED REQUEST AWAY ────────────────────────
// The audit's G2. `show` is ownership="public-read", whose SELECT policy is `using (true)`,
// and the public reads filter `state:'live'` in APPLICATION code that the admin reads do not
// run — so any signed-in viewer could read the unpublished catalogue through /admin/shows,
// and the same two actions were reachable over /mcp.
console.log("\noperator authority");
{
  for (const path of ["/admin/stats", "/admin/shows"]) {
    const asViewer = await POST(path, viewer);
    check(`${path} is invisible to a viewer`, asViewer.status === 404,
      `answered ${asViewer.status} to a plain viewer token — drafts, artwork and free-episode windows leak`);
  }
  const stats = await asJson(await POST("/admin/stats", operator));
  check("/admin/stats still answers the operator", stats.status === 200 && typeof stats.body?.shows === "number",
    `${stats.status} ${JSON.stringify(stats.body)} — the gate closed on the operator too, which breaks Manage`);
  const shows = await asJson(await POST("/admin/shows", operator));
  check("/admin/shows still answers the operator", shows.status === 200 && Array.isArray(shows.body?.rows),
    `${shows.status} ${JSON.stringify(shows.body).slice(0, 120)}`);
  const mcpViewer = await POST("/mcp", viewer, { jsonrpc: "2.0", id: 1, method: "tools/list" });
  check("/mcp is invisible to a viewer", mcpViewer.status === 404,
    `answered ${mcpViewer.status} — createMcpFace checks only auth="required", so the admin tools were the same leak by another door`);
}

// ── 6 · A GUARD THAT ONLY EXISTS IN AN `if` IS NOT A GUARD ─────────────────────────────
// The audit's S2. Every once-per-day / once-only rule was a read-then-write with a plain
// index behind it; a declared action has no transaction seam (PLAN.md §6.38), so two
// requests that arrive together both read "not yet" and both grant. These fire the pairs
// CONCURRENTLY — a sequential retry passes even on the broken code.
console.log("\nconcurrency");
{
  const both = await Promise.all([POST("/rewards/checkin", viewer), POST("/rewards/checkin", viewer)].map(async (p) => asJson(await p)));
  const granted = both.filter((r) => r.status === 200);
  check("two simultaneous check-ins grant exactly once", granted.length === 1,
    `${granted.length} of 2 succeeded (${both.map((r) => r.status).join(", ")}) — unique (owner_id, day) on dsx_checkin is the lock; is server/policies.local.sql applied?`);
  check("the loser is told why", both.some((r) => r.status === 409 || r.body?.reason === "conflict"),
    `got ${JSON.stringify(both.map((r) => r.body?.reason))} — a refused grant must be a declared rejection the UI can render`);

  const spins = await Promise.all([POST("/rewards/spin", viewer), POST("/rewards/spin", viewer)].map(async (p) => asJson(await p)));
  check("two simultaneous spins grant exactly once", spins.filter((r) => r.status === 200).length === 1,
    `${spins.filter((r) => r.status === 200).length} of 2 succeeded — unique (owner_id, day) on dsx_spin`);

  const favs = await Promise.all([POST("/viewer/favorite", viewer, { show: detail.show.id }), POST("/viewer/favorite", viewer, { show: detail.show.id })].map(async (p) => asJson(await p)));
  const rows = await sql("select count(*)::int as n from dsx_favorite where owner_id = $1 and show = $2", [viewerSub, detail.show.id]);
  check("two simultaneous favorites leave exactly one row", rows === null || rows.rows[0].n <= 1,
    `${rows?.rows[0].n} rows — two made the heart un-clearable (the next tap deletes one and the other keeps it filled)`);
  void favs;

  // THE MONEY RACE. A fresh viewer, funded through the database, unlocking one paid episode
  // twice at once. Before the fix both calls debited and the viewer paid twice for one
  // episode; the unlock row is now written BEFORE the charge, so the loser charges nothing.
  const target = await (async () => {
    for (const c of home.latest) {
      const d = await fetch(`${base}/catalog/show/${c.id}`).then((r) => r.json());
      const p = d.episodes.find((e) => !e.free && e.price > 0);
      if (p) return p;
    }
    return null;
  })();
  if (target === null || pool === null) {
    check("the double-unlock race charges once", false,
      pool === null ? "DSX_DATABASE_URL is unset — this assertion needs to fund a wallet" : "no priced episode in the catalogue");
  } else {
    const fund = target.price * 3;
    await sql(
      "insert into dsx_wallet (owner_id, coins, bonus) values ($1, $2, 0) on conflict (owner_id) do update set coins = $2, bonus = 0",
      [viewerSub, fund],
    );
    const before = (await asJson(await GET("/wallet/state", viewer))).body;
    const two = await Promise.all([
      POST("/wallet/unlock", viewer, { episode: target.id }),
      POST("/wallet/unlock", viewer, { episode: target.id }),
    ].map(async (p) => asJson(await p)));
    const after = (await asJson(await GET("/wallet/state", viewer))).body;
    const spent = (before.coins + before.bonus) - (after.coins + after.bonus);
    check("two simultaneous unlocks charge for ONE episode", spent === target.price,
      `spent ${spent} for a ${target.price}-coin episode (${two.map((r) => r.status).join(", ")}) — the grant must be written before the debit so the loser is refused by unique (owner_id, episode)`);
    const held = await sql("select count(*)::int as n from dsx_unlock where owner_id = $1 and episode = $2", [viewerSub, target.id]);
    check("and leave exactly one unlock row", held.rows[0].n === 1,
      `${held.rows[0].n} unlock rows for one episode`);
    const paidPlay = await asJson(await GET(`/wallet/play/${target.id}`, viewer));
    check("the episode is now playable and the earlier refusal was real",
      paidPlay.status === 200 && typeof paidPlay.body?.source === "string",
      "a paid-for episode did not become playable — the gate is refusing an entitled viewer");
    // THE TICKET IS A CAPABILITY, tested where it matters: on a PAID episode, where it is
    // the only thing between the request and the bytes. (On a free episode there is no
    // ticket to forge — the origin serves it on the episode id alone.)
    check("the entitled source plays", (await fetch(`${base}${paidPlay.body.source}`, { headers: { range: "bytes=0-1023" } })).status === 206,
      "an entitled viewer's own ticketed source did not stream");
    const forged = await fetch(`${base}${paidPlay.body.source.replace(/ticket=[0-9a-f-]+/, `ticket=${randomUUID()}`)}`);
    check("a forged ticket on a PAID episode is refused", forged.status === 403,
      `answered ${forged.status} — the ticket must be a capability, not a formality`);
    const stripped = await fetch(`${base}${paidPlay.body.source.replace(/&ticket=[0-9a-f-]+/, "")}`);
    check("dropping the ticket from a paid source is refused", stripped.status === 403,
      `answered ${stripped.status} — knowing the URL must not be enough`);
    // AN UNAFFORDABLE UNLOCK IS REFUSED, and refused BEFORE the grant — otherwise the
    // lock-first ordering would hand out episodes nobody paid for.
    await sql("update dsx_wallet set coins = 0, bonus = 0 where owner_id = $1", [viewerSub]);
    const broke = await (async () => {
      for (const c of home.latest) {
        const d = await fetch(`${base}/catalog/show/${c.id}`).then((r) => r.json());
        const p = d.episodes.find((e) => !e.free && e.price > 0 && e.id !== target.id);
        if (p) return p;
      }
      return null;
    })();
    const refused = await asJson(await POST("/wallet/unlock", viewer, { episode: broke.id }));
    check("an unlock with no balance is refused and grants nothing", refused.status >= 400, `answered ${refused.status}`);
    const ghost = await sql("select count(*)::int as n from dsx_unlock where owner_id = $1 and episode = $2", [viewerSub, broke.id]);
    check("...and writes no unlock row", ghost.rows[0].n === 0,
      "a broke viewer got a free grant — the affordability check must run before the lock insert");
  }
}

// ── 7 · A RETRIED PAYMENT MUST NOT CHARGE TWICE ────────────────────────────────────────
// The audit's G5. `settleOrder` checked `status === 'paid'` and then wrote — two concurrent
// settles both passed and both granted — and nothing verified that the amount Stripe
// confirmed matched the amount the order recorded.
// A full round trip needs STRIPE_KEY, which a clone does not have, so what is asserted here
// is the MECHANISM the settle depends on: the ledger row is the exactly-once lock, and the
// already-paid path grants nothing.
console.log("\npayment idempotency");
if (pool === null) {
  bad("the payment grant lock", "DSX_DATABASE_URL is unset");
} else {
  const orderId = randomUUID();
  await sql(
    "insert into dsx_order (id, owner_id, sku, kind, amount_cents, coins, bonus, days, status, intent) " +
    "values ($1,$2,'coins_500','coins',499,500,25,0,'paid',$3)",
    [orderId, viewerSub, `pi_verify_${orderId.slice(0, 8)}`],
  );
  const first = await asJson(await POST("/store/settle", viewer, { order: orderId }));
  const second = await asJson(await POST("/store/settle", viewer, { order: orderId }));
  check("settling an already-paid order grants nothing, twice over",
    first.status === 200 && first.body?.already === true && second.body?.already === true,
    `${JSON.stringify(first)} / ${JSON.stringify(second)}`);

  // THE LOCK ITSELF. The grant writes `(kind, source='pack', ref=<order id>)` before it
  // touches the wallet; a second grant for the same order must be refused by the database,
  // because that is the only thing standing between a replayed settle and doubled coins.
  const ref = randomUUID();
  await sql("insert into dsx_ledger (owner_id, kind, amount, source, ref) values ($1,'coin',500,'pack',$2)", [viewerSub, ref]);
  let refused = false;
  try {
    await sql("insert into dsx_ledger (owner_id, kind, amount, source, ref) values ($1,'coin',500,'pack',$2)", [viewerSub, ref]);
  } catch { refused = true; }
  check("a duplicate payment grant is refused by the database", refused,
    "a second (owner, kind, source=pack, ref=order) ledger row was accepted — dsx_ledger_grant_once in server/policies.local.sql is missing, so a replayed settle doubles the coins");
  // ...and the constraint is PARTIAL, so it must not catch the sources that legitimately repeat
  let unlockRepeats = true;
  try {
    await sql("insert into dsx_ledger (owner_id, kind, amount, source, ref) values ($1,'coin',-60,'unlock',$2)", [viewerSub, ref]);
    await sql("insert into dsx_ledger (owner_id, kind, amount, source, ref) values ($1,'coin',-60,'unlock',$2)", [viewerSub, ref]);
  } catch { unlockRepeats = false; }
  check("the grant lock does not catch ordinary spend rows", unlockRepeats,
    "an 'unlock' ledger row collided — the unique index must be partial (where source in ('pack','vip'))");
  const bonusToo = await sql(
    "insert into dsx_ledger (owner_id, kind, amount, source, ref) values ($1,'bonus',25,'pack',$2) returning id", [viewerSub, ref],
  ).then(() => true).catch(() => false);
  check("a pack's coin row and its bonus row can coexist", bonusToo,
    "kind must be part of the unique key — a coin pack legitimately writes two rows for one order");
}

// ── 8 · NEITHER BALANCE EXPIRES (App Store 3.1.1) ──────────────────────────────────────
// "Any credits or in-game currencies purchased via in-app purchase may not expire." The
// backend used to stamp a 7-day expiry on every granted-bonus ledger row, and `bonus` is
// NOT a purely-granted bucket — a coin pack's "+5% free" lands there — so an expiry sweeper
// on it would have expired purchased value. The capability is gone, and this asserts it is
// gone rather than merely unused: the column must not exist in the emitted schema, and no
// grant may write one.
console.log("\ncurrency does not expire");
{
  const migration = readFileSync(resolve(root, "server/generated/migration.sql"), "utf8");
  check("the ledger schema has no expiry column", !/dsx_ledger[\s\S]*?expires/.test(migration.slice(migration.indexOf("create table if not exists dsx_ledger"), migration.indexOf("create table if not exists dsx_notice"))),
    "dsx_ledger still emits an `expires` column — a balance that CAN expire is one refactor from expiring a purchased one");
  const grants = readFileSync(resolve(root, "server/engage.dsx"), "utf8");
  check("no rewards grant writes an expiry", !/expires\s*:/.test(grants),
    "a grant in server/engage.dsx still writes `expires:` — see the compliance note at the top of server/wallet.dsx");
  // AND THE PAYLOAD, not just the schema. `migration.sql` is additive and never drops a
  // column, so an already-deployed database still HAS dsx_ledger.expires with old values in
  // it — and the ledger screen renders "· expires in 7 days" for any row that carries the
  // key. A dropped field is only gone once the payload stops naming it.
  const led = await asJson(await GET("/wallet/ledger", viewer));
  check("the ledger payload carries no expiry field", led.status === 200
    && (led.body?.rows ?? []).every((r) => r.expires === undefined),
    `${JSON.stringify((led.body?.rows ?? [])[0] ?? null)} — a legacy column is reaching the screen as a live promise`);
  if (pool !== null) {
    const rows = await sql("select count(*)::int as n from information_schema.columns where table_name = 'dsx_ledger' and column_name = 'expires'");
    if (rows.rows[0].n > 0) {
      console.log("  note  dsx_ledger.expires still exists in THIS database (the migration is additive and never drops); nothing reads or writes it");
    }
  }

  // ── AND THE COPY, which is the half that actually reaches a REVIEWER ─────────────────
  // The three assertions above prove the BEHAVIOUR: nothing expires. They say nothing about
  // what the app TELLS the customer, and a store rejection reads the screen, not the schema.
  // Three lines here promised a 7-day expiry after the server had stopped applying one, and
  // the last of them survived two passes precisely because it was already unreachable — a
  // second interpolation, `{{ item.expires == null ? '' : ' · expires in 7 days' }}`,
  // appended to the ledger row's kind. `ledgerRows` stopped naming that field, so it could
  // not fire; it was still one payload change from firing, and no gate could see it.
  //
  // The corpus is the app's OWN display-point extractor (scripts/strings.mjs `extract`),
  // which is the same set of attributes the localisation seam resolves — so this cannot
  // drift from what a viewer actually reads, and it covers BOTH halves: `keys` holds plain
  // literals and whole-attribute ternary branches, `unreachable` holds every interpolated
  // display attribute VERBATIM, which is where a concatenated fragment like the one above
  // hides. A mention is allowed only when it NEGATES: "Coins never expire" is the true
  // sentence and the only shape that passes.
  {
    const { extract } = await import(pathToFileURL(resolve(root, "scripts/strings.mjs")).href);
    const { keys, unreachable } = extract();
    const shown = [...keys.keys(), ...unreachable.keys()];
    const mentions = shown.filter((s) => /expir/i.test(s));
    const promises = mentions.filter((s) => !/\b(?:never|not|no|cannot|don't|doesn't)\s+expir/i.test(s));
    check("no display string promises the viewer that coins expire", promises.length === 0,
      `${promises.length} of ${shown.length} display strings claim an expiry, e.g. ` +
      `${promises.slice(0, 3).map((s) => JSON.stringify(s.slice(0, 90))).join(" · ")} — App Store 3.1.1 forbids ` +
      "expiring purchased currency and this backend expires nothing, so the copy is a promise the server does not keep");
    // the negative above is worthless if the corpus is empty or the phrase is unsayable:
    // prove the app DOES talk about expiry, and that the extractor reaches that sentence
    check("...and the app says so out loud somewhere", mentions.length > 0,
      "no display string mentions expiry at all — the assertion above would pass vacuously; " +
      "Profile's balance strip is where \"Coins never expire\" lives");
  }
}

// ── 9 · THE DECLARED CEILINGS ARE REAL ─────────────────────────────────────────────────
// The audit's G4: `rate=` is supported grammar and was unused on all 32 routes, so one
// authenticated caller could create 25,000 Stripe PaymentIntents and take payments down for
// every customer. A declared limit is only a limit if the store behind it counts durably —
// installPostgresPool fills RateLimitSeam.store, and this proves the wiring end to end.
console.log("\nrate ceilings");
{
  const grinder = { authorization: `Bearer ${mint({ sub: randomUUID() })}`, "content-type": "application/json" };
  let sawRefusal = false;
  let attempts = 0;
  for (let i = 0; i < 14 && !sawRefusal; i += 1) {
    attempts += 1;
    const r = await POST("/rewards/checkin", grinder);
    if (r.status === 429) sawRefusal = true;
  }
  check("a declared rate ceiling actually refuses", sawRefusal,
    `${attempts} calls to /rewards/checkin (rate="10/h") and never a 429 — the declared limit is not being counted; check that installPostgresPool ran and dsx_rate_counter exists`);
  const headed = await POST("/rewards/checkin", grinder);
  check("the refusal carries the retry advisory", headed.headers.get("retry-after") !== null || headed.headers.get("x-ratelimit-reset") !== null,
    "a 429 with no Retry-After/X-RateLimit-Reset gives a client nothing to back off against");
  check("the ceiling is PER CALLER, not global", await (async () => {
    const other = { authorization: `Bearer ${mint({ sub: randomUUID() })}`, "content-type": "application/json" };
    return (await POST("/rewards/checkin", other)).status !== 429;
  })(), "a second identity was refused too — the bucket must key on the verified `sub`, or one abuser locks everybody out");
  check("anonymous public reads are bucketed by ADDRESS, not shared globally", await (async () => {
    // clientAddress is supplied by scripts/serve.mjs; without it every anonymous caller
    // shares ONE bucket per route and a limit on the storefront is a self-inflicted outage.
    for (let i = 0; i < 8; i += 1) { if ((await fetch(`${base}/catalog/home`)).status === 429) return false; }
    return true;
  })(), "eight ordinary storefront reads hit the ceiling — clientAddress is not wired, so every anonymous caller shares one bucket");
}

// ── 10 · THE DEPLOY ARTEFACT CARRIES NO CREDENTIAL ─────────────────────────────────────
// The audit's A2. `dist/` is what `despia deploy cloudflare` uploads, and the session
// minter wrote a `role: service_role` JWT into it. `.gitignore` covered the path, which is
// exactly what made it look handled. Measured while fixing it: `despia build` also COPIES
// `public/` into `dist/`, so moving the file to `public/` — the audit's own suggestion —
// would have changed nothing.
console.log("\ndeploy artefact");
{
  const dist = resolve(root, process.env.DSX_SITE_DIR ?? "dist");
  const findings = scanDistForSecrets(dist);
  check("no privileged token in the build output", findings.length === 0,
    findings.map((f) => `${f.file}: ${f.what}`).join(" · ") + " — run `node scripts/dist-guard.mjs` for the fix");
  check("no dev-session file in the build output", !existsSync(join(dist, "dev-session.json")),
    "dist/dev-session.json exists — the operator token ships with the site; the origin serves it at runtime instead");
  // THE GUARD ITSELF IS PROVEN, not just its silence. A scanner that never fires is
  // indistinguishable from a scanner that cannot.
  const planted = mkdtempSync(join(tmpdir(), "dsx-guard-"));
  try {
    writeFileSync(join(planted, "session.json"), JSON.stringify({ token: mint({ sub: randomUUID(), role: "service_role" }) }));
    const caught = scanDistForSecrets(planted);
    check("the guard catches a planted service_role token", caught.length > 0,
      "scripts/dist-guard.mjs scanned a file containing an operator JWT and found nothing");
  } finally {
    rmSync(planted, { recursive: true, force: true });
  }
}

// ── 11 · THE LOCAL SESSION IS SERVED, NOT SHIPPED ──────────────────────────────────────
console.log("\nlocal session seam");
{
  const local = await fetch(`${base}/dev-session.json`);
  check("the origin serves the dev session to a loopback caller", local.status === 200 || local.status === 404,
    `answered ${local.status}`);
  if (local.status === 404) {
    console.log("  note  no .dev-session.json on disk — run `npm run session`; the endpoint itself is asserted below");
  } else {
    const body = await local.json();
    check("the served session carries the viewer the app needs", typeof body?.viewer?.token === "string",
      JSON.stringify(body).slice(0, 120));
  }
  // `Host` is a FORBIDDEN HEADER NAME for fetch() — the runtime silently drops it and the
  // request goes out as localhost, so the assertion would pass against a wide-open origin.
  // node:http lets a client set it, which is exactly the request this gate must simulate.
  const asHost = (hostHeader) => new Promise((done) => {
    const req = httpRequest(
      { host: "127.0.0.1", port: PORT, path: "/dev-session.json", method: "GET", headers: { host: hostHeader } },
      (res) => { res.resume(); done(res.statusCode); },
    );
    req.on("error", () => done(0));
    req.end();
  });
  check("a public host cannot fetch the dev session", await asHost("shortdrama.example.com") === 404,
    "a public Host header was served the local session — the network IS the credential here (there is no token yet), so anything outside loopback/RFC1918 must get the prober's 404");
  check("...and a LAN device still can", [200, 404].includes(await asHost("192.168.1.42:8799")),
    "an RFC1918 host was refused — that breaks testing a phone against this origin, which is the reason the check is a network test and not a loopback test");
}

// ── 12 · UGC SAFETY (App Store 1.2) — FILTER · REPORT · BLOCK ──────────────────────────
// Every claim in this section is a RUNTIME agreement between two callers, which is precisely
// the class no source-reading gate can see. Two of them were already false when this section
// was first written: a delete that RLS filtered away answered `{deleted: true}` (the statement
// is `delete … returning id`, so a hidden row simply matches nothing and the call is still
// `ok`), and every comment was authored by the literal string "You". Both are pinned below.
console.log("\nUGC safety: filter, report, block");
const otherSub = randomUUID();
const other = { authorization: `Bearer ${mint({ sub: otherSub })}`, "content-type": "application/json" };
{
  const anyShow = home.latest[0];
  const anyEp = (await GET(`/catalog/show/${anyShow.id}`, anon).then(asJson)).body.episodes[0];

  // 1.2 — POSTING NEEDS AN IDENTITY. Reading does not; the thread is public by design.
  const asGuest = await POST("/social/comment", anon, { show: anyShow.id, episode: anyEp.id, body: "hello" });
  check("an anonymous caller cannot post a comment", asGuest.status === 401,
    `answered ${asGuest.status} — /social/comment must refuse a caller with no verified subject`);

  // 1.2(a) — THE FILTER REFUSES, AND SAYS WHAT IT REFUSED. A rejection whose message is
  // "something went wrong" is a filter the viewer cannot comply with.
  const spam = await POST("/social/comment", viewer, { show: anyShow.id, episode: anyEp.id, body: "watch this https://spam.example instead" }).then(asJson);
  check("the filter refuses a link, with a reason the viewer can act on",
    spam.status === 400 && typeof spam.body?.message === "string" && /link/i.test(spam.body.message),
    `${spam.status} ${JSON.stringify(spam.body)}`);
  const phone = await POST("/social/comment", viewer, { show: anyShow.id, episode: anyEp.id, body: "call me on +1 (555) 123-4567 tonight" }).then(asJson);
  check("the filter refuses a phone number", phone.status === 400 && /phone/i.test(phone.body?.message ?? ""),
    `${phone.status} ${JSON.stringify(phone.body)}`);
  const mash = await POST("/social/comment", viewer, { show: anyShow.id, episode: anyEp.id, body: "aaaaaaaaaaaaaa" }).then(asJson);
  check("the filter refuses keyboard mashing", mash.status === 400, `${mash.status} ${JSON.stringify(mash.body)}`);
  // …AND LETS AN ORDINARY COMMENT THROUGH. The negative above is worthless without this:
  // "the filter refuses X" would pass just as well if it refused everything.
  const mine = await POST("/social/comment", viewer, { show: anyShow.id, episode: anyEp.id, body: "The twist in this one actually landed" }).then(asJson);
  check("an ordinary comment posts", mine.status === 200 && typeof mine.body?.id === "string", JSON.stringify(mine.body));

  // M1 — THE AUTHOR IS THE VERIFIED SUBJECT, not a client string and not the literal "You".
  const theirs = await POST("/social/comment", other, { show: anyShow.id, episode: anyEp.id, body: "Agreed, the pacing is the whole trick" }).then(asJson);
  const thread = async (headers, level) =>
    (await GET(`/social/comments/${anyEp.id}${level ? `?level=${level}` : ""}`, headers).then(asJson)).body;
  const seen = await thread(viewer);
  const rowOfMine = seen.rows.find((r) => r.id === mine.body.id);
  const rowOfTheirs = seen.rows.find((r) => r.id === theirs.body.id);
  check("a comment is attributed to its verified author, not to \"You\"",
    rowOfMine?.author !== "You" && rowOfMine?.author === `Viewer ${viewerSub.slice(0, 6).toUpperCase()}`,
    `author was ${JSON.stringify(rowOfMine?.author)} — the display name must be derived from the row owner_id`);
  check("two viewers are two different people in the thread",
    rowOfMine?.author !== rowOfTheirs?.author && rowOfMine?.owner !== rowOfTheirs?.owner,
    "both comments carried the same author — the thread reads as one person talking to themselves");

  // 1.2(b) — REPORT, and IDEMPOTENT per (reporter, target). The unique index is the lock;
  // without it one account could hide any comment for everyone by tapping three times.
  const filed = await POST("/social/report", viewer, { target: theirs.body.id, reason: "harassment" }).then(asJson);
  check("a report is filed", filed.status === 200 && filed.body?.filed === true, JSON.stringify(filed.body));
  const again = await POST("/social/report", viewer, { target: theirs.body.id, reason: "harassment" }).then(asJson);
  check("reporting the same comment twice is idempotent, and says so",
    again.status === 200 && again.body?.filed === true && again.body?.duplicate === true, JSON.stringify(again.body));
  if (pool !== null) {
    const rows = await sql("select count(*)::int as n from dsx_report where owner_id = $1 and target = $2", [viewerSub, theirs.body.id]);
    check("...and exactly one report row exists",
      rows?.rows[0].n === 1,
      `${rows?.rows[0].n} rows — dsx_report_owner_target_uniq in server/policies.local.sql is what makes the flag threshold count PEOPLE rather than taps`);
  }
  const flaggedRow = (await thread(anon)).rows.find((r) => r.id === theirs.body.id);
  check("the flag count is public and real", flaggedRow?.flags === 1, `flags was ${flaggedRow?.flags}`);

  // 1.2(a) as a VIEWER CONTROL: strict withholds a flagged comment, standard does not, and
  // both decisions are made on the server — the row is absent from the payload, not hidden
  // in markup, which is the same rule the paywall had to learn (G1).
  const strict = await thread(viewer, "strict");
  check("strict filtering withholds a flagged comment from the PAYLOAD",
    strict.rows.every((r) => r.id !== theirs.body.id) && strict.hidden >= 1,
    `${JSON.stringify(strict.rows.map((r) => r.id))} hidden=${strict.hidden}`);
  check("...and standard filtering still shows it", (await thread(viewer)).rows.some((r) => r.id === theirs.body.id),
    "one report hid a comment for everyone — a single account must not be a censor button");

  // 1.2(c) — BLOCK, enforced server-side and scoped to the blocker alone.
  const blocked = await POST("/social/block", viewer, { comment: theirs.body.id }).then(asJson);
  check("a viewer can block the author of a comment", blocked.status === 200 && blocked.body?.blocked === true, JSON.stringify(blocked.body));
  const afterBlock = await thread(viewer);
  check("a blocked author is absent from the blocker's payload",
    afterBlock.rows.every((r) => r.owner !== otherSub) && afterBlock.blocked >= 1,
    "the blocked author's comment was still in the JSON — a block filtered in markup is not a block");
  check("...and is still there for everyone else",
    (await thread(other)).rows.some((r) => r.id === theirs.body.id) && (await thread(anon)).rows.some((r) => r.id === theirs.body.id),
    "blocking one person removed their comment for the whole app");
  check("the block list is the blocker's own",
    (await GET("/social/blocks", viewer).then(asJson)).body?.count === 1 &&
    (await GET("/social/blocks", other).then(asJson)).body?.count === 0,
    "one viewer could see another's block list");
  const unblocked = await POST("/social/unblock", viewer, { subject: otherSub }).then(asJson);
  check("unblocking restores the thread", unblocked.status === 200 &&
    (await thread(viewer)).rows.some((r) => r.id === theirs.body.id), JSON.stringify(unblocked.body));

  // DELETE-OWN IS OWN. This is the one that was already broken: `ok` survives a row RLS
  // filtered away, so only the returned DATA can say a row went.
  const notMine = await POST("/social/comment/delete", viewer, { comment: theirs.body.id }).then(asJson);
  check("a viewer cannot delete somebody else's comment", notMine.status === 403, `${notMine.status} ${JSON.stringify(notMine.body)}`);
  check("...and the comment is still in the thread", (await thread(other)).rows.some((r) => r.id === theirs.body.id),
    "the refusal was reported but the row went anyway");
  const deleted = await POST("/social/comment/delete", viewer, { comment: mine.body.id }).then(asJson);
  check("a viewer can delete their own comment", deleted.status === 200 &&
    (await thread(anon)).rows.every((r) => r.id !== mine.body.id), `${deleted.status} ${JSON.stringify(deleted.body)}`);

  // THE OPERATOR QUEUE IS BEHIND THE GATEWAY, and a prober gets the 404 an absent route gets.
  const asViewer = await POST("/social/reports", viewer, {}).then(asJson);
  check("the moderation queue is invisible to a viewer", asViewer.status === 404,
    `answered ${asViewer.status} — reach="" must answer 404, never 403, which would confirm the endpoint exists`);
  const asOperator = await POST("/social/reports", operator, {}).then(asJson);
  check("...and the operator can read it, with the reported text preserved",
    asOperator.status === 200 && asOperator.body.rows.some((r) => r.target === theirs.body.id && typeof r.snapshot === "string" && r.snapshot.length > 0),
    `${asOperator.status} ${JSON.stringify(asOperator.body).slice(0, 200)}`);

  // EVERY ROW CARRIES A FLAG COUNT, INCLUDING THE ONES WHOSE KEY HAS A DOT IN IT. This is the
  // one that shipped broken and no static gate could see: the tally was a dict keyed on
  // `target ?? subject`, and a bracket write whose key contains a dot is stored as a NESTED
  // PATH — so a comment (a UUID) counted and every ad report, whose subject is a creative
  // path ending in .mp4, read back null. Measured on a live origin before the fix: dotted key
  // null, dot-free key 1, same code (PLAN.md §6.93). An ad row is filed here on purpose so
  // this assertion cannot pass vacuously on a queue that happens to hold only comments.
  await POST("/social/report/ad", viewer, { lane: "house", creative: "/promo/house-ad.mp4", note: "" });
  const withAd = await POST("/social/reports", operator, {}).then(asJson);
  const adRows = withAd.body?.rows?.filter((r) => r.kind === "ad") ?? [];
  check("the queue counts an ad report whose creative path contains a dot",
    adRows.length > 0 && adRows.every((r) => typeof r.flags === "number" && r.flags >= 1),
    `ad rows: ${JSON.stringify(adRows.map((r) => ({ subject: r.subject, flags: r.flags })))} — a null flag count means the dotted-key tally is back`);
  check("...and the queue publishes the community-fold threshold",
    typeof withAd.body?.threshold === "number" && withAd.body.threshold > 1,
    "listReports must return `threshold` — the Manage screen renders WITHHELD against it, and a hard-coded 3 on the client is the second copy this template exists to avoid");

  // ── EVERY SHIPPED LOCALE IS COMPLETE, OR IT DOES NOT SHIP ────────────────────────────
  // Profile offers a language per locale the build carries, and the objection the earliest
  // version raised against a picker was exactly right: "a dropdown that switches to Spanish
  // and returns a half-Spanish app is a control that promises something it does not do."
  // That objection is answered by COVERAGE rather than by argument, and only if something
  // enforces the coverage — so this is the enforcement. A locale table with one viewer
  // string missing fails the build, and the picker cannot reach a release half-filled.
  //
  // The build folds every Strings.<tag>.json at the app root into the registry, so the
  // assertion reads the SHIPPED artefact and not the source: a table that failed to parse
  // is skipped silently by the loader (fail-open, Article 7), and an app that silently
  // stayed English is precisely what this catches.
  {
    const { extract, classify, tableFiles } = await import(pathToFileURL(resolve(root, "scripts/strings.mjs")).href);
    const { keys } = extract();
    const viewer = [...keys.keys()].filter((k) => classify(k, keys.get(k)) === "viewer");
    const registry = JSON.parse(readFileSync(resolve(root, "dist/registry.json"), "utf8"));
    const shipped = registry.strings ?? {};
    const declared = tableFiles(root).map((t) => t.tag);
    check("every locale table the source declares is in the built registry",
      declared.every((t) => shipped[t] !== undefined),
      `declared ${JSON.stringify(declared)} but the build folded ${JSON.stringify(Object.keys(shipped))} — an unparsable table is skipped SILENTLY and the app just stays English`);
    for (const tag of Object.keys(shipped)) {
      const missing = viewer.filter((k) => typeof shipped[tag][k] !== "string" || shipped[tag][k] === "");
      check(`the ${tag} locale carries every viewer string (${viewer.length})`, missing.length === 0,
        `${missing.length} missing, e.g. ${missing.slice(0, 3).map((k) => JSON.stringify(k.slice(0, 44))).join(" · ")} — run node scripts/strings.mjs --write ${tag}`);
    }

    // ── AND THE PICKER OFFERS EXACTLY WHAT SHIPPED ─────────────────────────────────────
    // The completeness gate above says a shipped table is whole. It says nothing about the
    // CONTROL, and the control is a second list: `Theme.dsx languageRows()` is data, so a
    // row whose table nobody wrote is a language the viewer can select that answers English
    // in every string — the exact defect the coverage gate exists to prevent, arriving
    // through the other door. Both directions are asserted, because a table with no row is
    // dead weight an adopter will never find.
    //
    // Read out of the SOURCE by regex rather than by evaluating the block: `<functions>` is
    // the app's JSE tier, there is no node in this repo that runs it, and a parser here
    // would be a third copy of the list. A regex over three well-known shapes is the cheap
    // honest read, and it fails loudly (empty match → the assertion below fails) rather
    // than quietly agreeing with whatever it found.
    const themeSrc = readFileSync(resolve(root, "Components/parts/Theme.dsx"), "utf8");
    const tagsBody = /function localeTags\(\)\s*\{([\s\S]*?)\}/.exec(themeSrc)?.[1] ?? "";
    const pickerTags = [...tagsBody.matchAll(/'([a-z][a-z0-9-]*)'/g)].map((m) => m[1]);
    const rowsBody = /function languageRows\(\)\s*\{([\s\S]*?)\n      \}/.exec(themeSrc)?.[1] ?? "";
    const rowIds = [...rowsBody.matchAll(/\{ id: '([a-z0-9-]*)'/g)].map((m) => m[1]);
    const deviceBody = /function deviceRowLabel\(\)\s*\{([\s\S]*?)\n      \}/.exec(themeSrc)?.[1] ?? "";
    const deviceTags = [...deviceBody.matchAll(/l == '([a-z][a-z0-9-]*)'/g)].map((m) => m[1]);

    // `en` is the SOURCE language: it is a row in the picker and it never has a table,
    // because a table mapping English to English is 215 keys of nothing.
    const offered = pickerTags.filter((t) => t !== "en");
    check(`the language picker offers exactly the locales that shipped (${offered.length})`,
      offered.length > 0 && offered.every((t) => shipped[t] !== undefined) && Object.keys(shipped).every((t) => offered.includes(t)),
      `picker offers ${JSON.stringify(offered)} · build folded ${JSON.stringify(Object.keys(shipped))} — a row with no table is a language that silently answers English; a table with no row is a language nobody can reach`);
    check("...and its rows and its tag list are the same list",
      rowIds.length === pickerTags.length + 1 && pickerTags.every((t) => rowIds.includes(t)) && rowIds[0] === "",
      `localeTags ${JSON.stringify(pickerTags)} · languageRows ${JSON.stringify(rowIds)} — the first row is the DEVICE row (empty tag) and every other row must be a declared tag`);
    check("...and every offered locale names the device row in its own language",
      offered.every((t) => deviceTags.includes(t)),
      `deviceRowLabel covers ${JSON.stringify(deviceTags)} — a locale missing from that map gets an English "Device language" row inside an otherwise translated menu (PLAN.md §6.98)`);

    // ── A TABLE THAT COPIED ENGLISH THROUGH IS NOT A TRANSLATION ──────────────────────
    // Completeness is a count, and a count is satisfiable by pasting the key into the
    // value 215 times. Some identity IS correct — VIP, ShortDrama, the `·` and `/`
    // separators, Bonus in five of these languages — so the gate is a RATIO with a lot of
    // headroom rather than a per-string rule that would need a per-locale allowlist to
    // maintain. Measured on the finished tables: es 6.0%, and the Germanic and Malay
    // families sit highest because they genuinely share more words with English. 30% is
    // roughly five times the observed worst case and nowhere near a real translation.
    for (const tag of Object.keys(shipped)) {
      const rows = viewer.map((k) => [k, shipped[tag][k]]);
      const identical = rows.filter(([k, v]) => k === v);
      const pct = Math.round((identical.length / rows.length) * 1000) / 10;
      check(`the ${tag} locale is a translation and not a copy (${pct}% identical to English)`, pct < 30,
        `${identical.length}/${rows.length} values are byte-identical to their English key — e.g. ${identical.slice(0, 5).map(([k]) => JSON.stringify(k.slice(0, 24))).join(" · ")}`);
    }

    // ── THE PLURAL PLANE IS EXERCISED, AND ARABIC IS WHY ──────────────────────────────
    // A locale is not measured only by how many keys it fills. A `{n, plural, …}` entry
    // that answers one form for a language with six is a table that PASSES the coverage
    // gate and renders the wrong word at every count but one — the exact defect a hand-
    // rolled `== 1` ternary already had, carried into the table. So the CATEGORIES are
    // asserted against the shared CLDR corpus (Conformance/strings/plurals.json), through
    // the SAME kernel the app runs, at counts that discriminate the rules.
    const { DSXMessage, DSXPlural } = await import("@despia-native/kernel");
    const asText = (v) => String(v);
    const asNum = (v) => (typeof v === "number" ? v : null);
    const pluralKeys = viewer.filter((k) => k.includes(", plural,"));
    check(`the corpus carries message templates with plural groups (${pluralKeys.length})`, pluralKeys.length > 0,
      "no `{n, plural, …}` display string in Components/** — the plural tier is declared and unexercised, " +
      "and a `== 1` ternary is a two-category language hard-coded into the markup");
    // The counts CLDR needs to tell Arabic's six apart, one per category.
    const ARABIC_PROBE = { 0: "zero", 1: "one", 2: "two", 3: "few", 11: "many", 100: "other" };
    for (const tag of Object.keys(shipped)) {
      const lang = tag.split("-")[0];
      // every category this language's rule can actually SELECT, discovered rather than
      // typed: sweep the probe counts and collect what the kernel returns
      const wanted = new Set([...Array(130).keys()].map((n) => DSXPlural.category(lang, n)));
      const missing = [];
      for (const key of pluralKeys) {
        // the branch names a group actually declares: every bare word that OPENS a brace.
        // (`plural` in the head is followed by a comma, never a brace, so it never matches.)
        const declared = new Set([...shipped[tag][key].matchAll(/(?:^|[^A-Za-z])([a-z]+)\s*\{/g)].map((m) => m[1]));
        for (const cat of wanted) if (!declared.has(cat)) missing.push(`${cat} in ${JSON.stringify(key.slice(12, 34))}… (has ${[...declared].join("/")})`);
      }
      check(`the ${tag} plural entries carry every category CLDR can select (${[...wanted].sort().join("/")})`,
        missing.length === 0,
        `missing: ${missing.slice(0, 4).join(" · ")} — a table short a category falls back to \`other\`, which is a grammatical error in that language, not a miss`);
    }
    // ...and Arabic's six are SIX DISTINCT RENDERINGS, not one string repeated to satisfy
    // the count above. This is the assertion that makes the six real.
    for (const key of pluralKeys) {
      const rendered = Object.entries(ARABIC_PROBE).map(([n, cat]) =>
        [cat, DSXMessage.render(shipped.ar[key], [Number(n)], asText, asNum, "ar", "ar", true)]);
      check(`ar renders six distinct forms for ${JSON.stringify(key.slice(12, 40))}…`,
        rendered.every(([, v]) => typeof v === "string" && v.length > 0)
        && new Set(rendered.map(([, v]) => v)).size === 6,
        rendered.map(([c, v]) => `${c}=${JSON.stringify(v)}`).join(" · "));
    }
  }

  // ── A PLURAL GROUP AT A SERVER-RENDERED DISPLAY POINT SHIPS RAW ICU ──────────────────
  // The message tier lives in the CLIENT mount (dom/src/mount.ts localizeTemplate); the
  // SSR renderer does not run it. Measured before this gate existed: a `{n, plural, …}`
  // caption on /show served the template VERBATIM into the html and only hydration
  // replaced it (PLAN.md §6.101). So the three groups this app writes are confined to
  // sheets that mount on a tap, and this asserts that confinement from the OUTSIDE —
  // over the delivered bytes, which is the only place the mistake is visible.
  console.log("\nthe message tier is where SSR can carry it");
  for (const path of ["/", "/browse", "/vip", "/store", "/profile", `/show/${card.id}`, `/watch/${card.id}/1`]) {
    const html = await fetch(`${base}${path}`).then((r) => r.text());
    const raw = bodyText(html).match(/\{[^{}]*,\s*(?:plural|select|selectordinal)\s*,/);
    check(`${path} server-renders no raw message template`, raw === null,
      `the delivered body carries ${JSON.stringify(raw?.[0])} — a plural group at a server-rendered display point ` +
      "is visible ICU markup until hydration. Move it behind a tap-mounted sheet, or wait for §6.101");
  }

  // 1.2(d) — PUBLISHED CONTACT INFORMATION needs somewhere to be published FROM. The value
  // ships empty on purpose (a placeholder URL reads as a broken promise to a reviewer); the
  // KEY has to exist, or an adopter has nowhere to put it and the UI names a gap forever.
  const consts = JSON.parse(readFileSync(resolve(root, "App.json"), "utf8")).consts ?? {};
  check("the deployment plane declares a contact key", Object.prototype.hasOwnProperty.call(consts, "supportUrl"),
    "App.json consts has no `supportUrl` — guideline 1.2 requires published contact information for an app carrying comments");

  // ── AND THE SAFETY ROWS LEAVE WITH THE ACCOUNT (5.1.1(v)) ────────────────────────────
  // The comment and report tables are ownership="public-read", so an unfiltered sweep sees
  // every viewer's rows and can neither delete them nor stop asking for them. That is not a
  // hypothetical: before the declared owner columns existed, a viewer who owned NOTHING
  // looped /viewer/delete eight times and never reached `done`, because two other people had
  // left comments. `otherSub` still has a live comment throughout this block — that is the
  // fixture, and without it the assertion would pass on an empty table.
  const survivor = (await thread(anon)).rows.some((r) => r.owner === otherSub);
  check("another viewer's comment is present while we delete", survivor,
    "no foreign comment in the thread — this deletion assertion would pass vacuously");
  await POST("/social/report", viewer, { target: theirs.body.id, reason: "spam" });
  await POST("/social/block", viewer, { comment: theirs.body.id });
  let wipe = await POST("/viewer/delete", viewer, { confirm: "DELETE", sub: viewerSub }).then(asJson);
  let passes = 1;
  while (wipe.status === 200 && wipe.body?.done === false && passes < 60) {
    wipe = await POST("/viewer/delete", viewer, { confirm: "DELETE", sub: viewerSub }).then(asJson);
    passes += 1;
  }
  check("account deletion completes with other people's comments in the table",
    wipe.status === 200 && wipe.body?.done === true && wipe.body?.scoped === true,
    `${passes} passes, last answer ${JSON.stringify(wipe.body)} — an unfiltered sweep of an all-read table can never finish`);
  if (pool !== null) {
    const left = await sql(
      "select (select count(*) from dsx_report where owner_id = $1)::int as reports," +
      " (select count(*) from dsx_block where owner_id = $1)::int as blocks," +
      " (select count(*) from dsx_comment where owner_id = $1)::int as comments", [viewerSub]);
    check("...and takes the reports, the blocks and the comments with it",
      left?.rows[0].reports === 0 && left?.rows[0].blocks === 0 && left?.rows[0].comments === 0,
      JSON.stringify(left?.rows[0]));
  }
  check("...and the other viewer's comment survived it",
    (await thread(anon)).rows.some((r) => r.owner === otherSub),
    "one account's deletion removed another account's data");
}

if (pool !== null) {
  // leave nothing behind: this run's throwaway identity, and nothing else
  await sql("delete from dsx_report where owner_id = $1 or owner_id = $2", [viewerSub, otherSub]);
  await sql("delete from dsx_block where owner_id = $1 or owner_id = $2", [viewerSub, otherSub]);
  await sql("delete from dsx_comment where owner_id = $1 or owner_id = $2", [viewerSub, otherSub]);
  await sql("delete from dsx_ledger where owner_id = $1", [viewerSub]);
  await sql("delete from dsx_unlock where owner_id = $1", [viewerSub]);
  await sql("delete from dsx_playticket where owner_id = $1", [viewerSub]);
  await sql("delete from dsx_favorite where owner_id = $1", [viewerSub]);
  await sql("delete from dsx_checkin where owner_id = $1", [viewerSub]);
  await sql("delete from dsx_spin where owner_id = $1", [viewerSub]);
  await sql("delete from dsx_order where owner_id = $1", [viewerSub]);
  await sql("delete from dsx_wallet where owner_id = $1", [viewerSub]);
  await pool.end();
}

console.log(`\n[verify] ${failures === 0 ? "all checks passed" : `${failures} check(s) FAILED`}`);
stop();
process.exit(failures === 0 ? 0 : 1);
