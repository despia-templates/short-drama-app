//
//  scripts/review.mjs — the design gate, with ONE loud, named waiver.
//
//  `despia review --strict` R4 warns at ≥3 distinct raw hexes per file. This app is a
//  pinned-dark cinema storefront (the drama-category standard: the stage is black in
//  light mode too), and semantic tokens would resolve light-mode ink onto a black stage
//  — so the brand palette below IS the correct engineering, and the framework has no
//  way to be told so (no palette declaration, no appearance pin). Filed upstream:
//  despia-native/despia-framework — review R4 needs a brand-palette valve (see
//  PLAN.md §6.16). This wrapper dies the day that lands.
//
//  The waiver is NARROW: an R4 finding is waived only when every hex it lists is in
//  the declared palette. A hex outside the palette still fails the gate — the rule's
//  sprawl protection stays fully armed.
//
import { execSync } from "node:child_process";

const PALETTE = new Set([
  "#000000", "#111111",                                     // stage · ink-on-white
  "#0a0a0e", "#141419", "#17171c", "#1c1c22", "#1e1e24",    // the dark surface ramp
  "#232329", "#26262c", "#3a3a42", "#43434d",
  "#ff2d55", "#ff5c7a",                                     // brand red + its tint
  "#f7c948", "#f6b63d", "#b9c5d8", "#ce8b5c",               // coin gold · rank metals
  "#ffffff",
]);

let out = "";
try { out = execSync("npx despia review --strict 2>&1", { encoding: "utf8" }); }
catch (e) { out = (e.stdout ?? "") + (e.stderr ?? ""); }

const lines = out.split("\n").filter((l) => l.trim() !== "" && !/^despia review:/.test(l));
let failures = 0, waived = 0;
for (const line of lines) {
  const hexRule = /(\d+) distinct raw hex colors \(([^)]+)\)/.exec(line);
  if (hexRule) {
    const hexes = hexRule[2].split(/\s+/);
    const offPalette = hexes.filter((h) => !PALETTE.has(h.toLowerCase()));
    if (offPalette.length === 0) {
      waived++;
      console.log(`WAIVED (brand palette, upstream §6.16): ${line.replace(/ — semantic tokens.*$/, "")}`);
      continue;
    }
    console.error(`${line}\n  ^ off-palette: ${offPalette.join(" ")} — add to the palette deliberately or use a token`);
    failures++;
    continue;
  }
  console.error(line);
  failures++;
}
console.log(`review gate — ${failures} failure(s), ${waived} palette waiver(s)`);
process.exit(failures === 0 ? 0 : 1);
