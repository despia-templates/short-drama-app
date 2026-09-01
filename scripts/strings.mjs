//
//  scripts/strings.mjs — the localisation catalogue: extract, report, refresh.
//
//  ══ THE PLANE IS THE FRAMEWORK'S, AND THE ENGLISH SOURCE STRING IS THE KEY ═══════════
//  DSX localisation is gettext-shaped (OpenSource/Documentation/architecture/
//  localization.md): apps are written in English, the English string IS the key, and the
//  kernel resolves it at the display points — `<text value=>` and `<text>` inner text,
//  the button family's `label=`, the field family's `placeholder=`. Nothing is annotated
//  and nothing is rewritten. So this template's ~180 literals were ALREADY the catalogue;
//  what was missing was a table, a switcher, and this script.
//
//  A table is `Strings.<lowercase-bcp47>.json` at the app root, flat { source: target }.
//  File presence IS the declaration: `despia build` folds every one it finds into the
//  registry (compiler/src/registry.ts) and the client boot hands it to DSXStrings. The
//  ladder is `global.locale` -> device language -> en, full tag tried before bare, and a
//  miss returns the English byte-for-byte (Article 7).
//
//  ══ WHAT THIS SCRIPT DOES ════════════════════════════════════════════════════════════
//    node scripts/strings.mjs                 report coverage per locale
//    node scripts/strings.mjs --write es      refresh Strings.es.json: add every new key
//                                             blank, drop keys the app no longer renders,
//                                             keep every translation already in it
//    node scripts/strings.mjs --unreachable   the strings the SEAM CANNOT REACH, which is
//                                             the mechanical follow-up list rather than a
//                                             guess: a11y labels, alt text, interpolated
//                                             composites, and copy the server sends
//
//  The extractor mirrors the framework's own (`cli/src/edit.ts collectDisplayStrings`,
//  which serves the Studio's strings table) so a key produced here is a key the runtime
//  will actually look up. Where the two could drift, DISPLAY_TAGS below is the mirror to
//  re-check.
//
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { componentFiles } from "./theme.mjs";

/** display attribute per tag — the mirror of the dom layer's bindDisplay call sites */
const DISPLAY_TAGS = {
  text: "value", label: "value",
  button: "label", pressable: "label", glassButton: "label", transport: "label", row: "label",
  textfield: "placeholder", input: "placeholder", securefield: "placeholder", searchbar: "placeholder",
};

/** attributes that carry copy the seam does NOT localize — the follow-up list */
const UNREACHABLE_ATTRS = ["a11yLabel", "a11yValue", "a11yHint", "alt", "title", "toast"];

const TAG = /<([A-Za-z][\w.]*)\s([^>]*?)\/?>/gs;
const ATTR = /([\w:.-]+)="([^"]*)"/g;

//  XML ENTITIES ARE DECODED BEFORE THE STRING BECOMES A KEY, and getting this wrong is
//  invisible until you look at the running app. The kernel localizes the RENDERED text, so
//  the key it looks up for `value="My List &amp;amp; History"` is `My List & History`. Keyed
//  on the raw attribute instead, four strings sat in the table with a 100% coverage report
//  and stayed English on screen — caught in the browser, not by a gate.
const ENTITIES = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&apos;": "'", "&#39;": "'" };
function decode(v) { return v.replace(/&(amp|lt|gt|quot|apos|#39);/g, (m) => ENTITIES[m]); }

function attrs(blob) {
  const out = {};
  for (const m of blob.matchAll(ATTR)) out[m[1]] = decode(m[2]);
  return out;
}

/** every static display string in Components/**, with the files that render it */
export function extract() {
  const keys = new Map();       // source string -> Set(file)
  const unreachable = new Map();
  for (const f of componentFiles()) {
    const src = readFileSync(f, "utf8");
    // strip comments: a code sample inside one is documentation, not copy
    const body = src.replace(/<!--[\s\S]*?-->/g, "");
    for (const m of body.matchAll(TAG)) {
      const tag = m[1];
      const a = attrs(m[2]);
      const display = DISPLAY_TAGS[tag];
      if (display !== undefined && a["bind"] === undefined) {
        const v = a[display];
        if (typeof v === "string" && v.length > 0) {
          if (v.includes("{{")) {
            // an interpolated template resolves BEFORE the seam, so only its exact rendered
            // form could ever match a table — static chrome is covered, composites are not
            add(unreachable, `${tag}.${display}: ${v}`, f);
          } else add(keys, v, f);
        }
      }
      for (const k of UNREACHABLE_ATTRS) {
        const v = a[k];
        if (typeof v === "string" && v.length > 0 && !v.includes("{{")) add(unreachable, `${k}: ${v}`, f);
      }
    }
    // <text>inner text</text> with no value= — the other half of the text display point
    for (const m of body.matchAll(/<text(?![\w])([^>]*)>([^<{}]+)<\/text>/g)) {
      const a = attrs(m[1]);
      if (a["value"] !== undefined || a["bind"] !== undefined) continue;
      const t = decode(m[2].trim());
      if (t.length > 0) add(keys, t, "inner");
    }
  }
  return { keys, unreachable };
}

function add(map, k, f) {
  if (!map.has(k)) map.set(k, new Set());
  map.get(k).add(f);
}

//  ══ WHICH STRINGS A LOCALE IS EXPECTED TO CARRY ═════════════════════════════════════
//  Not every string in this app is product copy, and pretending otherwise makes a coverage
//  number meaningless. Two classes are DELIBERATELY English, and the rule is mechanical so
//  it can be checked rather than claimed:
//
//    OPERATOR  — rendered only by Components/Admin.dsx. The Manage surface is an internal
//                tool for whoever runs the deployment, not a viewer surface.
//    DEVELOPER — copy that cites a source path, a config key or a ledger entry
//                ("set `authSignInUrl` in App.json `consts`", "PLAN.md §6.92"). Those are
//                instructions to the ADOPTER. Translating a file path is worse than not:
//                it makes the instruction wrong in the target language.
//
//  Everything else is VIEWER copy and a locale is measured against exactly that set.
const DEV_CITATION = /PLAN\.md|App\.json|dsx\.config|server\/|scripts\/|docs\/|\.dsx|Core\/|`[a-zA-Z]+Url`|despia build|DSX_/;

export function classify(key, files) {
  if (DEV_CITATION.test(key)) return "developer";
  const rendered = [...files].filter((f) => f !== "inner");
  if (rendered.length > 0 && rendered.every((f) => f.endsWith("Admin.dsx"))) return "operator";
  return "viewer";
}

export function tableFiles(root = ".") {
  return readdirSync(root)
    .map((e) => /^Strings\.([a-z][a-z0-9-]*)\.json$/.exec(e))
    .filter((m) => m !== null)
    .map((m) => ({ tag: m[1], file: `Strings.${m[1]}.json` }));
}

// ── CLI ──────────────────────────────────────────────────────────────────────────────
if (process.argv[1] !== undefined && process.argv[1].endsWith("strings.mjs")) {
  const { keys, unreachable } = extract();
  const arg = process.argv[2];

  if (arg === "--unreachable") {
    console.log(`${unreachable.size} string(s) the localisation seam does not reach.\n`);
    console.log("These are NOT a backlog of missed conversions — they are the seam's real");
    console.log("boundary, and each needs a different answer:\n");
    console.log("  a11yLabel / a11yHint / alt   the kernel localizes DISPLAY points only, so a");
    console.log("                               screen reader hears English on a Spanish device.");
    console.log("                               Upstream ask: run a11y copy through the same seam.");
    console.log("  an interpolated composite    resolves before the lookup, so only its exact");
    console.log("                               rendered form could match. The Translate module");
    console.log("                               (scheduled, not shipped) owns this tier.");
    console.log("  server copy                  prices, rejection messages and notice bodies are");
    console.log("                               the server's words; they localize server-side.\n");
    for (const [k, files] of [...unreachable].sort()) {
      console.log(`  ${k}`);
      console.log(`      ${[...files].join(" ")}`);
    }
    process.exit(0);
  }

  if (arg === "--write") {
    const tag = process.argv[3];
    if (tag === undefined || !/^[a-z][a-z0-9-]*$/.test(tag)) {
      console.error("usage: node scripts/strings.mjs --write <lowercase-bcp47>   (e.g. es, pt-br)");
      process.exit(1);
    }
    const file = `Strings.${tag}.json`;
    const existing = existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : {};
    const viewer = [...keys.keys()].filter((k) => classify(k, keys.get(k)) === "viewer").sort();
    const next = {};
    let kept = 0, added = 0;
    for (const k of viewer) {
      const v = typeof existing[k] === "string" ? existing[k] : "";
      if (v !== "") kept++; else added++;
      next[k] = v;
    }
    const viewerSet = new Set(viewer);
    const dropped = Object.keys(existing).filter((k) => !viewerSet.has(k));
    writeFileSync(file, JSON.stringify(next, null, 2) + "\n");
    console.log(`${file} — ${viewer.length} viewer key(s): ${kept} translated, ${added} blank, ${dropped.length} dropped`);
    if (dropped.length > 0) console.log(`  dropped (no longer rendered): ${dropped.slice(0, 8).join(" · ")}${dropped.length > 8 ? " …" : ""}`);
    console.log("\nA BLANK IS NOT A BUG: the kernel drops empty values, so an untranslated key");
    console.log("falls back to English byte-for-byte. Never invent a translation to fill one.");
    process.exit(0);
  }

  const tables = tableFiles();
  const byClass = { viewer: [], operator: [], developer: [] };
  for (const [k, files] of keys) byClass[classify(k, files)].push(k);
  console.log(`${keys.size} localizable string(s) across ${componentFiles().length} components:`);
  console.log(`  ${String(byClass.viewer.length).padStart(4)}  VIEWER    product copy — this is what a locale is measured against`);
  console.log(`  ${String(byClass.operator.length).padStart(4)}  OPERATOR  rendered only by the Manage surface, deliberately English`);
  console.log(`  ${String(byClass.developer.length).padStart(4)}  DEVELOPER cites a path, a config key or a ledger entry — translating`);
  console.log(`        one would make the instruction wrong in the target language`);
  console.log(`\n${unreachable.size} more the seam does not reach — node scripts/strings.mjs --unreachable\n`);
  if (tables.length === 0) {
    console.log("No Strings.<tag>.json at the app root: this build ships one locale.");
    console.log("Start one with  node scripts/strings.mjs --write es");
    process.exit(0);
  }
  let bad = 0;
  for (const { tag, file } of tables) {
    let table;
    try { table = JSON.parse(readFileSync(file, "utf8")); }
    catch { console.error(`  ${file}  INVALID JSON — the loader skips it and the app silently stays English`); bad++; continue; }
    const filled = Object.entries(table).filter(([, v]) => typeof v === "string" && v !== "");
    const viewerSet = new Set(byClass.viewer);
    const stale = Object.keys(table).filter((k) => !viewerSet.has(k));
    const missing = byClass.viewer.filter((k) => typeof table[k] !== "string" || table[k] === "");
    const pct = byClass.viewer.length === 0 ? 0 : Math.round((filled.length / byClass.viewer.length) * 100);
    console.log(`  ${file.padEnd(20)} ${String(filled.length).padStart(4)}/${byClass.viewer.length} viewer keys (${pct}%)${stale.length > 0 ? `  ${stale.length} stale` : ""}`);
    if (missing.length > 0) console.log(`      missing — run --write ${tag}: ${missing.slice(0, 4).map((k) => JSON.stringify(k.slice(0, 32))).join(" · ")}${missing.length > 4 ? " …" : ""}`);
    // a stale key is dead weight, never a failure: the app renders English either way
    if (stale.length > 0) console.log(`      stale — run --write ${tag} to prune: ${stale.slice(0, 4).join(" · ")}${stale.length > 4 ? " …" : ""}`);
  }
  process.exit(bad === 0 ? 0 : 1);
}
