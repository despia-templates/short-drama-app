//
//  scripts/dev-session.mjs — mints the LOCAL demo identities (HS256, DSX_JWT_SECRET).
//  This file is the auth-provider seam: in a real deployment these tokens come from your
//  identity provider (Clerk, Supabase auth, ...) — the server only ever verifies.
//  Two people: a viewer (no role) and the operator (role: service_role, which is what
//  the admin document's write seams require).
//
//  ══ THIS FILE USED TO WRITE THE OPERATOR TOKEN INTO THE DEPLOY ARTEFACT ══════════════
//  It wrote the same JSON to `public/` AND `dist/`. `.gitignore` covers both, which is the
//  detail that made it look safe — but `dist/` is not a working directory, it is the thing
//  `npm run deploy` (`despia deploy cloudflare`) UPLOADS. So the documented sequence
//  `npm run session && npm run build && npm run deploy` published a full-write
//  `role: service_role` JWT at a guessable public URL, valid for twelve hours, on every
//  deployment. Nothing in the pipeline objected; docs/auth.md warned about it in prose and
//  prose is not a gate.
//
//  Now it writes ONE file, `public/dev-session.json`, which is a SOURCE directory and never
//  shipped. The local app still gets its session because the dev origin serves that file at
//  `/dev-session.json` at runtime, behind a private-network host check and dev-only
//  (scripts/serve.mjs — the same host-gating precedent as the `/internal/admin/*` twins,
//  PLAN.md §6.7). `scripts/seed.mjs` reads the same file directly off disk.
//
//  And the rule is now GATED rather than remembered: `scripts/dist-guard.mjs` refuses any
//  build whose output contains a privileged token, runs as npm's `postbuild`, and is
//  asserted again by `npm run verify`. It is a hard failure, never a warning — a warning
//  scrolls past and the token still ships.
//
import { createHmac } from "node:crypto";
import { writeFileSync, mkdirSync, existsSync, readFileSync, rmSync } from "node:fs";

// the same .env.local fold serve.mjs does — the README's step order relies on it
// (measured: the documented sequence exited 1 here, because only serve loaded the file)
if (existsSync(".env.local")) {
  for (const line of readFileSync(".env.local", "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2];
  }
}

const secret = process.env.DSX_JWT_SECRET;
if (!secret) { console.error("DSX_JWT_SECRET is required"); process.exit(1); }

const b64u = (buf) => Buffer.from(buf).toString("base64url");
const mint = (claims) => {
  const header = b64u(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const now = Math.floor(Date.now() / 1000);
  const payload = b64u(JSON.stringify({ iat: now, exp: now + 12 * 3600, ...claims }));
  const sig = createHmac("sha256", secret).update(`${header}.${payload}`).digest("base64url");
  return `${header}.${payload}.${sig}`;
};

const session = {
  note: "LOCAL DEV ONLY — minted by scripts/dev-session.mjs; a real deployment gets tokens from its identity provider.",
  viewer: { sub: "11111111-1111-4111-8111-111111111111", token: mint({ sub: "11111111-1111-4111-8111-111111111111" }) },
  operator: { sub: "22222222-2222-4222-8222-222222222222", token: mint({ sub: "22222222-2222-4222-8222-222222222222", role: "service_role" }) },
};

// public/ ONLY. Never dist/ — see the header. If a previous run of the old script left one
// behind, remove it here rather than waiting for the build guard to fail: a stale artefact
// from before the fix is exactly the case a person will not think to check.
if (!existsSync("public")) mkdirSync("public", { recursive: true });
writeFileSync("public/dev-session.json", JSON.stringify(session, null, 2));
if (existsSync("dist/dev-session.json")) {
  rmSync("dist/dev-session.json");
  console.warn("[dev-session] removed a stale dist/dev-session.json left by an older run — that file was the deploy artefact");
}
console.log("[dev-session] minted viewer + operator (12h) → public/dev-session.json");
console.log("[dev-session] the origin serves it at /dev-session.json for LOOPBACK AND PRIVATE-NETWORK hosts only; it is never built into dist/");
