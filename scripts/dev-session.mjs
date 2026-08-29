//
//  scripts/dev-session.mjs — mints the LOCAL demo identities (HS256, DSX_JWT_SECRET).
//  This file is the auth-provider seam: in a real deployment these tokens come from your
//  identity provider (Clerk, Supabase auth, ...) — the server only ever verifies.
//  Two people: a viewer (no role) and the operator (role: service_role, which is what
//  the admin document's write seams require). Written to public/ and dist/ for the app
//  to pick up; both paths are gitignored.
//
import { createHmac } from "node:crypto";
import { writeFileSync, mkdirSync, existsSync } from "node:fs";

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

for (const dir of ["public", "dist"]) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(`${dir}/dev-session.json`, JSON.stringify(session, null, 2));
}
console.log("[dev-session] minted viewer + operator (12h) → public/dev-session.json, dist/dev-session.json");
