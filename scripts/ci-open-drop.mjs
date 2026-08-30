//
//  scripts/ci-open-drop.mjs — build this template against the PUBLIC Apache-2.0 drop.
//
//  The drop (`despia-native/despia`) carries OpenSource/ only, so the two ClosedSource
//  module packages named in dsx.config.json are absent and `despia build` cannot resolve
//  them. This removes those entries and their schemes, and PRINTS what that costs — because
//  a build that quietly ships without a payment provider is exactly the kind of silence this
//  template exists to argue against.
//
//  Used by .github/workflows/ci.yml. Also useful by hand for anyone building from the drop:
//      node scripts/ci-open-drop.mjs
//  It is idempotent, and it refuses to touch a checkout that HAS the modules, so running it
//  on a full distribution by accident changes nothing.
//
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const file = resolve(root, "dsx.config.json");
const cfg = JSON.parse(readFileSync(file, "utf8"));

// what each scheme buys, so the log says what was lost rather than what was removed
const COST = {
  stripe: "the Store shows the server's honest refusal instead of a payment sheet",
  share: "the player's Share control copies the link instead of opening the system sheet",
};

const packages = cfg.packages ?? [];
const absent = packages.filter((p) => !existsSync(resolve(root, p)));

if (absent.length === 0) {
  console.log("[ci-open-drop] every declared module package is on disk — nothing to drop");
  process.exit(0);
}

const dropped = new Set(absent.map((p) => p.split("/").pop().toLowerCase()));
// SocialShare's directory name is not its scheme; map by directory, then by scheme name
const schemeOf = { socialshare: "share", stripe: "stripe" };
const goneSchemes = [...dropped].map((d) => schemeOf[d] ?? d);

cfg.packages = packages.filter((p) => existsSync(resolve(root, p)));
cfg.modules = (cfg.modules ?? []).filter((m) => !goneSchemes.includes(m));
writeFileSync(file, `${JSON.stringify(cfg, null, 2)}\n`);

console.log("[ci-open-drop] built WITHOUT the ClosedSource modules — this build is degraded:");
for (const s of goneSchemes) {
  console.log(`  · ${s} — ${COST[s] ?? "the module's lane is unavailable and the UI says so"}`);
}
console.log("  Both degrade in place and name themselves in the UI (Article 7). Nothing else changes.");
