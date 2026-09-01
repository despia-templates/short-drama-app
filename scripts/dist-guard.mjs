//
//  scripts/dist-guard.mjs — REFUSE TO SHIP A CREDENTIAL.
//
//  WHY THIS EXISTS. `scripts/dev-session.mjs` used to write the operator's
//  `role: service_role` JWT to `dist/dev-session.json` as well as `public/`. Both paths are
//  in `.gitignore`, which is exactly what made it look handled — but `dist/` is not a
//  scratch directory, it is what `npm run deploy` (`despia deploy cloudflare`) UPLOADS. So
//  the documented sequence published a full-write service-role token at a guessable URL on
//  every deployment, and every one of the five gates passed: `lint`, `check:styles`,
//  `review` and `build` read SOURCE, and `verify` did not look at the artefact at all.
//  docs/auth.md:48-50 warned about it in prose. Prose is not a gate. This is.
//
//  IT IS A FAILURE, NEVER A WARNING. A warning scrolls past in CI and the token ships
//  anyway; the entire value of this file is that `npm run build` exits non-zero. There is
//  no --force, no allowlist and no env override, deliberately: the fix for a true positive
//  is always to stop putting the secret in the artefact, never to teach the guard to accept
//  it. If you are here because a legitimate file tripped the scan, change the file.
//
//  WHAT IT LOOKS FOR, and why each one:
//    · a JWS whose decoded payload carries a `role` claim — that is the operator token by
//      definition (docs/auth.md: `role: service_role` marks the operator). A viewer token
//      has no `role` and is not flagged: it is a 12h capability for one demo identity, the
//      client is *supposed* to hold it, and flagging it would train people to ignore this.
//    · the literal `service_role`, anywhere, in any form — belt and braces for a token this
//      decoder failed to parse, or a config file naming the role.
//    · a Stripe SECRET key (`sk_live_` / `sk_test_` / `rk_live_` / `rk_test_`). The
//      publishable key is fine and is meant to be in the bundle; the secret one is a server
//      secret that `<secret as="STRIPE_KEY">` reads through the seam and must never be
//      compiled into a page.
//    · the deployment's `DSX_INTERNAL_KEY`, if one is set in this environment — it admits
//      every `reach: []` route without any JWT at all (host.ts INTERNAL_KEY_HEADER), so it
//      is the single most dangerous string that could end up in a bundle.
//    · a file literally named `dev-session.json`, wherever it is — the specific artefact
//      that shipped, named on its own so the error message can be exact about the fix.
//
//  Run: `node scripts/dist-guard.mjs [dir]`. Wired as npm `postbuild`, so it runs on every
//  `npm run build`, and imported by `scripts/verify.mjs` so the behavioural gate asserts it
//  too.
//
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, extname, relative, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

/** Binary and font payloads: nothing here can be a credential, and reading them is waste. */
const SKIP_EXT = new Set([
  ".mp4", ".webm", ".mov", ".mp3", ".wav", ".ogg",
  ".png", ".jpg", ".jpeg", ".gif", ".webp", ".avif", ".ico",
  ".woff", ".woff2", ".ttf", ".otf", ".eot", ".zip", ".gz", ".br", ".pdf",
]);

/** A JWS: three base64url segments. Deliberately loose — a near-miss is worth decoding. */
const JWS = /\beyJ[A-Za-z0-9_-]{6,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/g;

/**
 * A privileged JWT is one whose PAYLOAD carries a `role`. Decoding rather than string-
 * matching is the point: `service_role` inside a signed payload is base64, so a plain grep
 * for the word would miss the exact artefact this guard was written for.
 */
function privilegedJwt(token) {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  let claims;
  try {
    claims = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
  } catch {
    return null;                                  // not a JWT, or not one we can read
  }
  if (claims === null || typeof claims !== "object") return null;
  const role = claims.role;
  if (typeof role !== "string" || role === "") return null;
  return role;
}

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const abs = join(dir, name);
    const st = statSync(abs);
    if (st.isDirectory()) walk(abs, out);
    else out.push(abs);
  }
  return out;
}

/**
 * Scan a directory for credentials that must never be published.
 * Returns a list of `{ file, what, fix }` findings — empty means clean.
 */
export function scanDistForSecrets(dir) {
  if (!existsSync(dir)) return [];
  const findings = [];
  const internalKey = process.env.DSX_INTERNAL_KEY;
  for (const abs of walk(dir)) {
    const rel = relative(dir, abs);
    if (rel.split(/[\\/]/).includes("dev-session.json")) {
      findings.push({
        file: rel,
        what: "the dev session file itself",
        fix: "scripts/dev-session.mjs must write public/dev-session.json ONLY; the origin serves it at runtime behind a host check.",
      });
    }
    if (SKIP_EXT.has(extname(abs).toLowerCase())) continue;
    let text;
    try {
      text = readFileSync(abs, "utf8");
    } catch {
      continue;                                   // unreadable or not text — nothing to leak
    }
    for (const token of text.match(JWS) ?? []) {
      const role = privilegedJwt(token);
      if (role !== null) {
        findings.push({
          file: rel,
          what: `a signed JWT carrying role="${role}"`,
          fix: "a privileged token must never be built into the artefact — the operator authenticates through the IdP at runtime (docs/auth.md).",
        });
      }
    }
    if (text.includes("service_role")) {
      findings.push({
        file: rel,
        what: 'the literal string "service_role"',
        fix: "the operator role is a claim the IdP mints at runtime, not a value the bundle carries.",
      });
    }
    const stripe = /\b(?:sk|rk)_(?:live|test)_[A-Za-z0-9]{8,}/.exec(text);
    if (stripe !== null) {
      findings.push({
        file: rel,
        what: `a Stripe SECRET key (${stripe[0].slice(0, 11)}…)`,
        fix: "only the PUBLISHABLE key belongs in a client bundle; the secret one is read server-side through <secret as=\"STRIPE_KEY\">.",
      });
    }
    if (typeof internalKey === "string" && internalKey.length >= 8 && text.includes(internalKey)) {
      findings.push({
        file: rel,
        what: "this deployment's DSX_INTERNAL_KEY",
        fix: "the internal key admits every reach:[] route with no JWT at all — it is server-to-server only and must never reach a client.",
      });
    }
  }
  return findings;
}

/** The gate's own message, shared by the CLI below and by scripts/verify.mjs. */
export function reportFindings(findings, dir) {
  console.error(`\n[dist-guard] ${findings.length} credential(s) found in ${dir} — this artefact must not be deployed:\n`);
  for (const f of findings) console.error(`  · ${f.file}\n      ${f.what}\n      Fix: ${f.fix}\n`);
}

// ── CLI ────────────────────────────────────────────────────────────────────────────────
if (process.argv[1] !== undefined && import.meta.url === `file://${resolve(process.argv[1])}`) {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const dir = resolve(process.argv[2] ?? process.env.DSX_SITE_DIR ?? join(root, "dist"));
  const findings = scanDistForSecrets(dir);
  if (findings.length > 0) {
    reportFindings(findings, dir);
    process.exit(1);
  }
  console.log(`[dist-guard] ok — no privileged token in ${relative(root, dir) || dir}`);
}
