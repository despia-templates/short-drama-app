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
import { themeTones } from "./theme.mjs";

// the sibling convention (scripts/preflight.mjs) or DSX_FRAMEWORK_DIR; DSX_STYLE_CATALOG
// still overrides the exact file for unusual layouts
const FRAMEWORK = process.env.DSX_FRAMEWORK_DIR
  ?? new URL("../../despia_dsx/despia-framework", import.meta.url).pathname;
const CATALOG = process.env.DSX_STYLE_CATALOG
  ?? `${FRAMEWORK}/OpenSource/Documentation/reference/stack-style-properties.json`;
const ICONS = process.env.DSX_ICON_CATALOG
  ?? `${FRAMEWORK}/OpenSource/Conformance/icons/sf-map.json`;

// EVERY ICON COMES FROM THE SHARED CATALOG, and this is the check that says so. One name
// resolves to a Boxicon on web, an SF Symbol on iOS and a Material Symbol on Android — a
// name that is NOT in the catalog has no such twin. On web it may still render (Boxicons
// has plenty the catalog does not map), which is exactly what makes the defect invisible
// here: it ships, it looks right in the browser, and the glyph is missing on the two
// platforms nobody ran. Caught two on this template's own screens — `eye` beside every view
// count and `rectangle.stack` in three empty states — both rendering fine on web.
const iconNames = new Set(Object.keys(JSON.parse(readFileSync(ICONS, "utf8")).icons));

const valid = new Set(["as", "class"]);
for (const g of JSON.parse(readFileSync(CATALOG, "utf8")).groups) {
  for (const p of g.properties) { valid.add(p.key); for (const a of p.aliases ?? []) valid.add(a); }
}

// ── THE FUNCTION LIBRARY IS WHERE A RUNTIME ICON NAME IS STILL A LITERAL ──────────────
// Theme.dsx's `<functions global="true">` block is the app's one vocabulary, and it hands
// out icon names two ways: a helper that RETURNS one (`chevBack()`) and a data row that
// CARRIES one (the VIP benefit list). Both spellings put the name outside the `icon="…"`
// regex above, so both used to escape the catalog check entirely. Every dotted lowercase
// string literal in that block is treated as an icon name and checked; the same read
// collects the function names, so an interpolated `icon=` can be traced back to one.
const themeSrc = readFileSync("Components/parts/Theme.dsx", "utf8");
const themeFunctions = new Set([...themeSrc.matchAll(/function\s+([A-Za-z_][\w]*)\s*\(/g)].map((m) => m[1]));
const themeIconLiterals = [...themeSrc.matchAll(/'([a-z][a-z0-9]*(?:\.[a-z][a-z0-9]*)+)'/g)].map((m) => m[1]);

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

// THE PALETTE HAS ONE DEFINITION and it is Components/parts/Theme.dsx, where every colour
// carries a name that says its job. Markup CALLS those names; a `<style as="…">` cannot,
// because a style attribute drops an interpolation silently (measured — PLAN.md §6.91), so
// the hexes inside style blocks are MIRRORS of the table. This is the check that stops a
// mirror drifting: an unnamed hex fails, so a re-skin cannot half-land.
const TONES = themeTones();
let unnamed = 0;

for (const f of files.sort()) {
  const src = readFileSync(f, "utf8");

  // every hex must be a NAMED tone (Theme.dsx itself is the definition, so it is exempt)
  if (!f.endsWith("Theme.dsx")) {
    const off = new Set();
    for (const m of src.matchAll(/#[0-9A-Fa-f]{6}\b/g)) {
      if (!TONES.has(m[0].toLowerCase())) off.add(m[0].toUpperCase());
    }
    for (const hex of off) {
      unnamed++;
      say(f, `${hex} is not a named tone — add it to Components/parts/Theme.dsx with a name ` +
             "that says its job, then use that name (a hex nobody named is a hex nobody can re-skin)");
    }
  }

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

  for (const m of src.matchAll(/\bicon(?::\w+)?="([^"{}]+)"/g)) {
    if (!iconNames.has(m[1])) {
      say(f, `icon="${m[1]}" is not in the shared catalog — it has no per-platform twin, ` +
             "so it renders on web and is missing on iOS and Android");
    }
  }

  // AN INTERPOLATED ICON NAME IS STILL AN ICON NAME. This gate used to stop at the literal
  // form and say so — "a runtime value; only literals are checkable" — which was true of
  // the regex and false of the risk: the moment `chevBack()`/`chevFwd()`/`arrowFwd()`
  // arrived so the chevrons could turn with the locale, THIRTY-FOUR sites left the gate in
  // one commit, and three more (`bolt.fill`, `lock.open.fill`, `dollarsign.circle.fill`)
  // had been outside it since the VIP benefit rows became data. A helper is a runtime value
  // only in WHICH name it picks; the names themselves are literals in Theme.dsx, so the
  // check moves there: every dotted lowercase literal in the function library must be a
  // catalog name, and an interpolated `icon=` must call a function that library declares.
  for (const m of src.matchAll(/\bicon(?::\w+)?="\{\{([^"]*)\}\}"/g)) {
    for (const call of m[1].matchAll(/([A-Za-z_][\w]*)\s*\(/g)) {
      if (!themeFunctions.has(call[1])) {
        say(f, `icon="{{ ${m[1].trim()} }}" calls ${call[1]}(), which Theme.dsx does not declare — ` +
               "an icon chosen at runtime is only checkable through the function library that names it");
      }
    }
  }

  for (const m of src.matchAll(/class="([^"{}]*)"/g)) {
    for (const t of m[1].split(/\s+/).filter(Boolean)) {
      if (!declared.has(t)) say(f, `class="${t}" is not declared by this document`);
    }
  }
}

for (const name of themeIconLiterals) {
  if (!iconNames.has(name)) {
    say("Components/parts/Theme.dsx", `'${name}' reads as an icon name and is not in the shared catalog — ` +
        "a name handed out by the function library needs a per-platform twin like any other");
  }
}

console.log(problems === 0
  ? `check:styles — ${files.length} files, 0 problems (${TONES.size} named tones, ${themeIconLiterals.length} library icon names, 0 unnamed hexes)`
  : `check:styles — ${problems} problem(s)${unnamed > 0 ? `, ${unnamed} unnamed colour(s)` : ""}`);
process.exit(problems === 0 ? 0 : 1);
