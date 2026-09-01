//
//  scripts/theme.mjs — the palette, read from its ONE definition.
//
//  Components/parts/Theme.dsx names every colour this app is allowed to paint, as global
//  functions with a name that says the colour's JOB (`brand`, `coin`, `surfaceCard`).
//  Markup CALLS them. A `<style as="…">` cannot: a style attribute drops an interpolation
//  silently — measured, PLAN.md §6.91 — so the hexes inside `<style>` blocks are MIRRORS
//  of that table rather than sources of their own.
//
//  This module is what stops a mirror drifting. `check:styles` fails on any hex in
//  Components/** that Theme.dsx does not name, and `review` derives its brand-palette
//  waiver (§6.16) from the same read. Two gates, one table, no second copy — review.mjs
//  used to carry its own and had already fallen six shipping colours behind it.
//
//  Run it directly to see the table:  node scripts/theme.mjs
//
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

export const THEME_FILE = "Components/parts/Theme.dsx";

/** hex (lowercase) → the tone name Theme.dsx gives it */
export function themeTones(file = THEME_FILE) {
  const src = readFileSync(file, "utf8");
  const block = /<functions[^>]*>([\s\S]*?)<\/functions>/.exec(src);
  if (block === null) throw new Error(`${file}: no <functions> block — the palette has no definition`);
  const tones = new Map();
  for (const m of block[1].matchAll(/function\s+(\w+)\s*\(\s*\)\s*\{\s*return\s+'(#[0-9A-Fa-f]{6})'\s*\}/g)) {
    tones.set(m[2].toLowerCase(), m[1]);
  }
  if (tones.size === 0) throw new Error(`${file}: the <functions> block names no colours`);
  return tones;
}

/** every .dsx under Components/ */
export function componentFiles(root = "Components") {
  const out = [];
  (function walk(dir) {
    for (const e of readdirSync(dir)) {
      const p = join(dir, e);
      if (statSync(p).isDirectory()) walk(p);
      else if (p.endsWith(".dsx")) out.push(p);
    }
  })(root);
  return out.sort();
}

// ── run directly: print the table and where each tone is painted ─────────────────────
if (process.argv[1] !== undefined && process.argv[1].endsWith("theme.mjs")) {
  const tones = themeTones();
  const uses = new Map([...tones.keys()].map((h) => [h, 0]));
  const routed = new Map([...tones.values()].map((n) => [n, 0]));
  for (const f of componentFiles()) {
    if (f.endsWith("Theme.dsx")) continue;
    const src = readFileSync(f, "utf8");
    for (const m of src.matchAll(/#[0-9A-Fa-f]{6}\b/g)) {
      const k = m[0].toLowerCase();
      if (uses.has(k)) uses.set(k, uses.get(k) + 1);
    }
    for (const n of routed.keys()) {
      routed.set(n, routed.get(n) + (src.match(new RegExp(`\\b${n}\\(\\)`, "g")) ?? []).length);
    }
  }
  console.log(`${tones.size} named tones — "literal" is a <style> mirror, "routed" is a call\n`);
  console.log("  tone                 hex        literal  routed");
  for (const [hex, name] of tones) {
    console.log(`  ${name.padEnd(20)} ${hex.toUpperCase()}   ${String(uses.get(hex)).padStart(6)}  ${String(routed.get(name)).padStart(6)}`);
  }
  const lit = [...uses.values()].reduce((a, b) => a + b, 0);
  const rou = [...routed.values()].reduce((a, b) => a + b, 0);
  console.log(`\n  ${rou} call(s) routed · ${lit} literal(s) mirrored in <style> blocks (§6.91)`);
}
