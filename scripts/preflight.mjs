//
//  scripts/preflight.mjs — fail EARLY with the fix in the error, never mid-install with
//  ENOENT soup. Runs as `preinstall` and by hand (`npm run preflight`).
//
//  THE SIBLING CONVENTION. The DSX packages are not on npm yet (tracked in PLAN.md §6),
//  so this template resolves them from a framework checkout at a FIXED RELATIVE PATH:
//
//      <parent>/
//        despia_dsx/despia-framework/     ← the framework checkout
//        <this repo>/                     ← cloned beside it
//
//  package.json's file: deps, dsx.config.json's `packages` entry and the serve script's
//  side-door imports all assume exactly that layout, which is why ONE check here covers
//  all of them. `DSX_FRAMEWORK_DIR` overrides the location (an absolute path to the
//  framework checkout) for people who keep it elsewhere — but note the file: deps in
//  package.json cannot read an env var; with a custom location, symlink the conventional
//  path to the real one:  ln -s "$DSX_FRAMEWORK_DIR/.." ../despia_dsx
//
import { existsSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const framework = process.env.DSX_FRAMEWORK_DIR
  ? resolve(process.env.DSX_FRAMEWORK_DIR)
  : resolve(root, "../despia_dsx/despia-framework");

const problems = [];

// 1 · node version (package.json engines is advisory unless engine-strict is set)
const wanted = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8")).engines?.node ?? "";
const major = Number(process.versions.node.split(".")[0]);
if (major < 22) {
  problems.push(
    `Node ${process.versions.node} is too old — this template needs ${wanted}.\n` +
    `    Fix: install Node 22+ (https://nodejs.org) and re-run.`,
  );
}

// 2 · the framework checkout, at the sibling path or DSX_FRAMEWORK_DIR
if (!existsSync(resolve(framework, "OpenSource/Web/packages/cli/package.json"))) {
  problems.push(
    `The framework checkout was not found at:\n      ${framework}\n` +
    `    This template resolves @despia-native/* from a sibling checkout (see the header\n` +
    `    of this file). Fix, from the directory ABOVE this repo:\n` +
    `      git clone https://github.com/despia-native/despia-framework despia_dsx/despia-framework\n` +
    `    (or the public drop: git clone https://github.com/despia-native/despia despia_dsx/despia-framework)\n` +
    `    then build it once:  cd despia_dsx/despia-framework/OpenSource/Web && npm install && npm run build`,
  );
} else if (!existsSync(resolve(framework, "OpenSource/Web/packages/cli/dist/bin/dsx.js"))) {
  problems.push(
    `The framework checkout exists but is NOT BUILT (no cli/dist).\n` +
    `    Fix:  cd ${resolve(framework, "OpenSource/Web")} && npm install && npm run build`,
  );
}

// 3 · the Stripe module path in dsx.config.json (ClosedSource — present only in the
//     full framework distribution; without it `despia build` fails at the module step)
const cfg = JSON.parse(readFileSync(resolve(root, "dsx.config.json"), "utf8"));
for (const entry of cfg.packages ?? []) {
  const p = resolve(root, entry);
  if (!existsSync(p)) {
    problems.push(
      `dsx.config.json names a module package that is not on disk:\n      ${entry}\n` +
      `    The Stripe web module ships in the full Despia framework distribution. If your\n` +
      `    checkout lacks it, ask for access — or remove "stripe" from "modules" and the\n` +
      `    entry from "packages" to build without web checkout (the Store screen will\n` +
      `    show the server's refusal instead of a payment sheet; nothing else changes).`,
    );
  }
}

if (problems.length > 0) {
  console.error("\n[preflight] this clone cannot build yet:\n");
  for (const p of problems) console.error(`  · ${p}\n`);
  process.exit(1);
}
console.log(`[preflight] ok — framework at ${framework}, node ${process.versions.node}`);
