//
//  scripts/rasterize-art.mjs — PNG twins for every SVG asset, for the NATIVE lanes.
//
//  WHY. All key art is authored as deterministic SVG (scripts/gen-art.mjs) — ideal on the
//  web, invisible natively: iOS's <image> decodes through ImageIO, which does not read SVG,
//  and fails OPEN to a placeholder (upstream 278 discussion; filed with the <image> findings).
//  The founder's call: PNG for native, SVG for web — two sets, one source of truth (the SVG),
//  this script the bridge. `scripts/serve.mjs` serves the right twin per client; a real CDN
//  does the same with a one-line rewrite (see the serve.mjs comment).
//
//  Rasterisation rides the FRAMEWORK's own Playwright (the parity oracle's engine) — this
//  project adds no dependency. Each SVG opens as a file:// document at its own declared
//  width x height, deviceScaleFactor 2, and a viewport screenshot lands byte-deterministic
//  PNGs at @2x (poster 360x480 → 720x960, hero 1600x900 → 3200x1800).
//
//  Rerun after `npm run gen-art`. Idempotent; ~seconds for the full set.
//
import { createRequire } from "node:module";
import { readdirSync, readFileSync } from "node:fs";
import { resolve, dirname, join, basename } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const FRAMEWORK = process.env.DSX_FRAMEWORK_DIR
  ?? resolve(root, "../despia_dsx/despia-framework");
const require2 = createRequire(join(FRAMEWORK, "OpenSource/Web/package.json"));
const { chromium } = require2("playwright-core");

const DIRS = [join(root, "public", "posters"), join(root, "public", "assets")];

/** an svg's own declared pixel size — the art is generated with explicit width/height */
function svgSize(file) {
  const head = readFileSync(file, "utf8").slice(0, 500);
  const w = /width="(\d+)"/.exec(head)?.[1];
  const h = /height="(\d+)"/.exec(head)?.[1];
  if (!w || !h) throw new Error(`${basename(file)} declares no width/height — gen-art always does`);
  return { w: Number(w), h: Number(h) };
}

const launch = async () => {
  try { return await chromium.launch(); } catch {
    const exe = process.env.DSX_CHROMIUM;
    if (!exe) throw new Error("playwright chromium unavailable — set DSX_CHROMIUM to a chromium binary");
    return chromium.launch({ executablePath: exe });
  }
};

const browser = await launch();
let n = 0;
try {
  for (const dir of DIRS) {
    const files = readdirSync(dir).filter((f) => f.endsWith(".svg")).sort();
    for (const f of files) {
      const file = join(dir, f);
      const { w, h } = svgSize(file);
      // Heroes are 1600x900 with film grain — @2x PNGs land at ~6MB apiece and the band
      // renders 480pt tall, so @1x is already supersampled there. Posters and glyphs are
      // small and sharp-edged; they keep @2x.
      const scale = /-hero(-tall)?\.svg$/.test(f) ? 1 : 2;
      const context = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: scale });
      const page = await context.newPage();
      await page.goto(`file://${file}`);
      await page.screenshot({ path: file.replace(/\.svg$/, ".png") });
      await context.close();
      n += 1;
    }
  }
} finally {
  await browser.close();
}
console.log(`[rasterize-art] ${n} png twin(s) @2x → public/{posters,assets}`);
