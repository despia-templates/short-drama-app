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
//  The PUBLIC drop (`despia-native/despia`, Apache-2.0) is the contents of OpenSource/ with
//  no wrapping directory, so it is cloned INTO `OpenSource`:
//
//      git clone https://github.com/despia-native/despia despia_dsx/despia-framework/OpenSource
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
// COMPARE WHAT ENGINES ACTUALLY SAYS. This used to test the major only, so the whole of
// Node 22.0–22.17 sailed through a check whose own message quoted ">=22.18" — the gate
// disagreed with the range it was printing. Parse the floor out of `engines.node` and
// compare major.minor.patch, so the two can never drift again.
// `>=22.18` has TWO parts, so a three-part-only regex silently fell back to [22] and let
// every 22.x through — the first version of this fix shipped that bug and the check below
// caught it. Capture one to three parts.
const floorMatch = wanted.match(/(\d+)(?:\.(\d+))?(?:\.(\d+))?/);
const floor = floorMatch === null ? [22] : floorMatch.slice(1).filter((p) => p !== undefined).map(Number);
const here = process.versions.node.split(".").map(Number);
const older = (a, b) => {
  for (let i = 0; i < b.length; i += 1) {
    if ((a[i] ?? 0) !== (b[i] ?? 0)) return (a[i] ?? 0) < (b[i] ?? 0);
  }
  return false;
};
if (older(here, floor)) {
  problems.push(
    `Node ${process.versions.node} is too old — this template needs ${wanted}.\n` +
    `    Fix: install a newer Node (https://nodejs.org) and re-run.`,
  );
}

// 2 · the framework checkout, at the sibling path or DSX_FRAMEWORK_DIR
//
// THE OPEN DROP IS THE CONTENTS OF OpenSource/, NOT A COPY OF THE REPO. `despia-native/despia`
// puts `Web/`, `Documentation/`, `Conformance/` at its ROOT — there is no `OpenSource/`
// wrapper — so the obvious `git clone … despia_dsx/despia-framework` lands every package one
// directory above where package.json's `file:` deps look, and npm reports a pile of ENOENT
// with no hint of the cause. Those deps are literal relative paths and cannot branch, so the
// drop has to be cloned INTO `OpenSource`. This check names that case specifically rather
// than repeating the generic "not found".
if (existsSync(resolve(framework, "Web/packages/cli/package.json"))
    && !existsSync(resolve(framework, "OpenSource/Web/packages/cli/package.json"))) {
  problems.push(
    `The open drop is checked out one level too high at:\n      ${framework}\n` +
    `    \`despia-native/despia\` is the CONTENTS of OpenSource/ (its root holds Web/,\n` +
    `    Documentation/, Conformance/), and package.json's file: deps read the literal path\n` +
    `    OpenSource/Web/packages/*. Fix:\n` +
    `      mv ${framework} /tmp/dsx-drop && mkdir -p ${framework} \\\n` +
    `        && mv /tmp/dsx-drop ${resolve(framework, "OpenSource")}\n` +
    `    or re-clone into place:\n` +
    `      git clone https://github.com/despia-native/despia despia_dsx/despia-framework/OpenSource`,
  );
} else if (!existsSync(resolve(framework, "OpenSource/Web/packages/cli/package.json"))) {
  problems.push(
    `The framework checkout was not found at:\n      ${framework}\n` +
    `    This template resolves @despia-native/* from a sibling checkout (see the header\n` +
    `    of this file). Fix, from the directory ABOVE this repo:\n` +
    `      git clone https://github.com/despia-native/despia-framework despia_dsx/despia-framework\n` +
    `    or the public Apache-2.0 drop, which is the contents of OpenSource/ and so is cloned\n` +
    `    INTO it:\n` +
    `      git clone https://github.com/despia-native/despia despia_dsx/despia-framework/OpenSource\n` +
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
      `    ${entry.split("/").pop()} ships in the full Despia framework distribution. If your\n` +
      `    checkout lacks it, ask for access — or drop this entry from "packages" and its\n` +
      `    scheme from "modules" to build without it. Each degrades in place and says so:\n` +
      `    without Stripe the Store shows the server's refusal instead of a payment sheet;\n` +
      `    without SocialShare the Share control copies the link instead of opening the\n` +
      `    system sheet. Nothing else changes.`,
    );
  }
}

if (problems.length > 0) {
  console.error("\n[preflight] this clone cannot build yet:\n");
  for (const p of problems) console.error(`  · ${p}\n`);
  process.exit(1);
}
console.log(`[preflight] ok — framework at ${framework}, node ${process.versions.node}`);
