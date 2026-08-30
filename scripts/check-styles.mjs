//
//  scripts/check-styles.mjs — validate every <style> class against the framework's own
//  style catalog. An unknown property is dropped SILENTLY by the renderer, so this is the
//  one check the linter cannot make for us today. Also verifies that every class= token
//  resolves to a style declared in the same document.
//
//  (An earlier version of this script also banned inline layout attributes and demanded
//  screen-prefixed class names. Both rules were wrong — see PLAN.md §6.13a — and are gone.)
//
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

// the sibling convention (scripts/preflight.mjs) or DSX_FRAMEWORK_DIR; DSX_STYLE_CATALOG
// still overrides the exact file for unusual layouts
const FRAMEWORK = process.env.DSX_FRAMEWORK_DIR
  ?? new URL("../../despia_dsx/despia-framework", import.meta.url).pathname;
const CATALOG = process.env.DSX_STYLE_CATALOG
  ?? `${FRAMEWORK}/OpenSource/Documentation/reference/stack-style-properties.json`;

const valid = new Set(["as", "class"]);
for (const g of JSON.parse(readFileSync(CATALOG, "utf8")).groups) {
  for (const p of g.properties) { valid.add(p.key); for (const a of p.aliases ?? []) valid.add(a); }
}

const files = [];
(function walk(dir) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p);
    else if (p.endsWith(".dsx")) files.push(p);
  }
})("Components");

let problems = 0;
const say = (f, msg) => { problems++; console.error(`${f}: ${msg}`); };

for (const f of files.sort()) {
  const src = readFileSync(f, "utf8");
  const names = [...src.matchAll(/<style\s+as="([^"]+)"/g)].map((m) => m[1]);
  const declared = new Set(names);
  // A DUPLICATE <style as="x"> is silent: the Set above collapses it, the linter allows it,
  // and the second declaration quietly re-skins every element already wearing the first.
  // (Caught the hard way — a new `viewAll` shadowed the existing one on Home.)
  const seen = new Set();
  for (const n of names) {
    if (seen.has(n)) say(f, `<style as="${n}"> is declared twice — the second silently re-skins every class="${n}" in this document`);
    seen.add(n);
  }

  for (const m of src.matchAll(/<style\s+([^>]*?)\/>/gs)) {
    const name = /as="([^"]+)"/.exec(m[1])?.[1] ?? "?";
    for (const attr of [...m[1].matchAll(/([\w-]+)\s*=/g)].map((x) => x[1])) {
      if (!valid.has(attr)) say(f, `<style as="${name}">: "${attr}" is not in the style catalog — it is dropped silently`);
    }
  }

  for (const m of src.matchAll(/class="([^"{}]*)"/g)) {
    for (const t of m[1].split(/\s+/).filter(Boolean)) {
      if (!declared.has(t)) say(f, `class="${t}" is not declared by this document`);
    }
  }
}

console.log(problems === 0
  ? `check:styles — ${files.length} files, 0 problems`
  : `check:styles — ${problems} problem(s)`);
process.exit(problems === 0 ? 0 : 1);
