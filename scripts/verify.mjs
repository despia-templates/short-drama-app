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
//  It boots its own server on a spare port so it never depends on one already running, and
//  kills it on the way out — including on a failed assertion.
//
import { spawn } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PORT = Number(process.env.VERIFY_PORT ?? 8799);
const base = `http://localhost:${PORT}`;

let failures = 0;
const ok = (name) => console.log(`  ok   ${name}`);
const bad = (name, detail) => { failures += 1; console.error(`  FAIL ${name}\n       ${detail}`); };
const check = (name, cond, detail) => (cond ? ok(name) : bad(name, detail));

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

// ── 3 · money is the SERVER's word ─────────────────────────────────────────────────────
console.log("\nauthority");
const unlock = await fetch(`${base}/wallet/unlock`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ episode: detail.episodes[detail.episodes.length - 1].id }),
});
check("an unauthenticated unlock is refused", unlock.status >= 400,
  `POST /wallet/unlock answered ${unlock.status} with no token — entitlement must never be the client's word`);

console.log(`\n[verify] ${failures === 0 ? "all checks passed" : `${failures} check(s) FAILED`}`);
stop();
process.exit(failures === 0 ? 0 : 1);
