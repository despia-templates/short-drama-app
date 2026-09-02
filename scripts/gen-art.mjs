//
//  scripts/gen-art.mjs — the demo catalogue's key art, generated.
//
//  A template ships with no licensed photography, and a wall of flat gradients reads as
//  "unfinished" rather than "placeholder". So the art is SYNTHESISED: one palette and one
//  seed per show drive a layered composition (sky wash, rim glow, two-figure silhouette,
//  light sweep, grain, vignette) that survives being 150px wide on a phone rail.
//
//  Two composition rules come straight off the category reference, and both were bugs here
//  before they were rules:
//
//   1. THE FRAME IS 3:4. The app renders posters at 3:4 with `object-fit: cover`; the first
//      generation was 2:3, so the browser cropped a quarter of the height off and the baked
//      title landed half outside the card. Art is authored at the ratio it is shown at.
//   2. THE TOP-LEFT IS THE BADGE ZONE. "New" / "Trending" / "EP 12" pills live at the poster's
//      top-left on every app in this category, so the title sits at the BOTTOM over its own
//      scrim and the top 30% of the art carries nothing that reads as type.
//
//  Deterministic: same manifest in, byte-identical SVGs out. No network, no binary assets.
//
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { SHOWS } from "./catalogue.mjs";

const OUT = resolve("public/posters");
mkdirSync(OUT, { recursive: true });

// A tiny deterministic PRNG so "random" specks are stable across runs — a poster that
// re-renders differently on every seed would churn the diff for no reason.
const rng = (seed) => {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
};
const seedOf = (str) => {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
};
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/'/g, "&#39;").replace(/"/g, "&quot;");

// Break a title onto at most `max` lines of roughly `per` characters, never mid-word.
const wrap = (title, per, max) => {
  const words = title.split(/\s+/);
  const lines = [];
  let cur = "";
  for (const w of words) {
    const next = cur === "" ? w : `${cur} ${w}`;
    if (next.length > per && cur !== "") { lines.push(cur); cur = w; } else { cur = next; }
  }
  if (cur !== "") lines.push(cur);
  if (lines.length <= max) return lines;
  const head = lines.slice(0, max - 1);
  head.push(`${lines.slice(max - 1).join(" ").slice(0, per - 1)}…`);
  return head;
};

// ── the composition ───────────────────────────────────────────────────────────────────
// Every layer is a function of (w, h, palette, rand) so the same code paints a 3:4 poster
// and a 16:9 hero. `focal` is where the light and the figures sit, in unit coordinates —
// centred on the hero (which gets cropped from both sides) and offset on the poster (which
// gets cropped top and bottom).
const artLayers = (w, h, p, rand, focal) => {
  const fx = focal.x * w;
  const fy = focal.y * h;
  // SIZE OFF THE SHORT EDGE, not the long one. The hero is authored 16:9 and displayed at
  // 375x503 on a phone, where `object-fit: cover` scales it by HEIGHT and throws away 58% of
  // the width — so anything measured against the long edge is magnified by the crop. Sized
  // off `min`, a figure keeps roughly the same on-screen size in the wide crop and the tall
  // one, which is the only reason one piece of art can serve both.
  const r = Math.min(w, h);

  // grain: one turbulence, cheap, and it is what stops the gradients reading as plastic
  const grain = `<filter id="grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="${Math.floor(rand() * 100)}" result="n"/>
      <feColorMatrix in="n" type="saturate" values="0"/>
      <feComponentTransfer><feFuncA type="linear" slope="0.16"/></feComponentTransfer>
    </filter>`;
  const soft = `<filter id="soft" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="${Math.round(r * 0.045)}"/>
    </filter>`;

  // two silhouetted figures — a head-and-shoulders pair is the category's whole visual
  // language, and it survives at 150px in a way a landscape does not
  // A body leaves the frame at the bottom; it does not stop at a flat line. The first pass
  // closed the shoulder path at a fixed y and every poster wore a horizontal shelf across
  // its chest, which is the one thing that makes synthetic art look synthetic.
  const figure = (cx, cy, scale, opacity) => {
    const headR = r * 0.070 * scale;
    const shoulderW = headR * 3.1;
    const bottom = h + headR;          // past the frame, so the torso is cropped, not cut
    const neck = cy + headR * 1.24;
    return `<g opacity="${opacity}" fill="${p.figure}">
      <ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="${headR.toFixed(1)}" ry="${(headR * 1.16).toFixed(1)}"/>
      <path d="M ${(cx - shoulderW).toFixed(1)} ${bottom.toFixed(1)}
               C ${(cx - shoulderW).toFixed(1)} ${(neck + headR * 1.05).toFixed(1)}
                 ${(cx - headR * 1.42).toFixed(1)} ${neck.toFixed(1)}
                 ${cx.toFixed(1)} ${neck.toFixed(1)}
               C ${(cx + headR * 1.42).toFixed(1)} ${neck.toFixed(1)}
                 ${(cx + shoulderW).toFixed(1)} ${(neck + headR * 1.05).toFixed(1)}
                 ${(cx + shoulderW).toFixed(1)} ${bottom.toFixed(1)}
               Z"/>
    </g>`;
  };

  const specks = Array.from({ length: 26 }, () => {
    const x = (rand() * 1.1 - 0.05) * w;
    const y = rand() * h * 0.82;
    const rr = 0.6 + rand() * 1.9;
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${rr.toFixed(1)}" fill="${p.spark}" opacity="${(0.18 + rand() * 0.5).toFixed(2)}"/>`;
  }).join("");

  return {
    defs: `<linearGradient id="sky" x1="0.08" y1="0" x2="0.92" y2="1">
      <stop offset="0" stop-color="${p.deep}"/><stop offset="0.52" stop-color="${p.mid}"/><stop offset="1" stop-color="${p.deep}"/>
    </linearGradient>
    <radialGradient id="rim" cx="${focal.x}" cy="${focal.y - 0.06}" r="0.72">
      <stop offset="0" stop-color="${p.glow}" stop-opacity="0.62"/>
      <stop offset="0.55" stop-color="${p.glow}" stop-opacity="0.16"/>
      <stop offset="1" stop-color="${p.glow}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="sweep" x1="0" y1="0" x2="1" y2="0.6">
      <stop offset="0" stop-color="#FFFFFF" stop-opacity="0"/>
      <stop offset="0.46" stop-color="#FFFFFF" stop-opacity="0.10"/>
      <stop offset="0.58" stop-color="#FFFFFF" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="vig" cx="0.5" cy="0.44" r="0.78">
      <stop offset="0.45" stop-color="#000000" stop-opacity="0"/>
      <stop offset="1" stop-color="#000000" stop-opacity="0.62"/>
    </radialGradient>
    ${grain}${soft}`,
    body: `<rect width="${w}" height="${h}" fill="url(#sky)"/>
    <g filter="url(#soft)" opacity="0.9">
      <ellipse cx="${(fx + r * 0.14).toFixed(1)}" cy="${(fy - r * 0.1).toFixed(1)}" rx="${(r * 0.30).toFixed(1)}" ry="${(r * 0.26).toFixed(1)}" fill="${p.glow}" opacity="0.30"/>
      <ellipse cx="${(fx - r * 0.22).toFixed(1)}" cy="${(fy + r * 0.22).toFixed(1)}" rx="${(r * 0.24).toFixed(1)}" ry="${(r * 0.21).toFixed(1)}" fill="${p.accent}" opacity="0.24"/>
    </g>
    <rect width="${w}" height="${h}" fill="url(#rim)"/>
    ${figure(fx - r * 0.115, fy + r * 0.055, 1.0, 0.85)}
    ${figure(fx + r * 0.125, fy + r * 0.012, 1.12, 0.92)}
    <rect width="${w}" height="${h}" fill="url(#sweep)"/>
    ${specks}
    <rect width="${w}" height="${h}" fill="url(#vig)"/>
    <rect width="${w}" height="${h}" filter="url(#grain)" opacity="0.5"/>`,
  };
};

// ── poster: 3:4, title bottom-left over a scrim, top 30% left clear for the badge ──────
const poster = (show) => {
  const W = 360, H = 480;
  const rand = rng(seedOf(show.slug));
  const p = show.palette;
  const L = artLayers(W, H, p, rand, { x: 0.55, y: 0.33 });
  const lines = wrap(show.title, 17, 3);
  const size = lines.length >= 3 ? 30 : 34;
  const lead = size * 1.14;
  const first = H - 34 - (lines.length - 1) * lead;
  const tspans = lines.map((l, i) => `<tspan x="24" ${i === 0 ? 'dy="0"' : `dy="${lead.toFixed(1)}"`}>${esc(l)}</tspan>`).join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(show.title)}">
  <defs>${L.defs}
    <linearGradient id="scrim" x1="0" y1="0.34" x2="0" y2="1">
      <stop offset="0" stop-color="#05030A" stop-opacity="0"/>
      <stop offset="0.34" stop-color="#05030A" stop-opacity="0.22"/>
      <stop offset="0.68" stop-color="#05030A" stop-opacity="0.70"/>
      <stop offset="1" stop-color="#05030A" stop-opacity="0.95"/>
    </linearGradient>
  </defs>
  ${L.body}
  <rect width="${W}" height="${H}" fill="url(#scrim)"/>
  <text x="24" y="${(first - size - 16).toFixed(1)}" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-size="11" font-weight="700" letter-spacing="3.2" fill="${p.glow}" opacity="0.95">${esc(show.kicker)}</text>
  <text x="24" y="${first.toFixed(1)}" font-family="Georgia, Times New Roman, serif" font-size="${size}" font-weight="700" fill="#FFFFFF">${tspans}</text>
</svg>
`;
};

// ── heroes: TWO assets, because one cannot serve both frames ──────────────────────────
// The wide hero is displayed at 1440x480 (3:1) and the phone hero at 375x503 (0.75:1).
// `object-fit: cover` between those two is a 4x difference in what survives the crop: one
// asset either loses the sides on the phone or magnifies the subject into the desktop band.
// Every app in the category ships both, and a generator makes both for free. No title is
// baked into either — the hero's type lives in the markup's overlay, where it is selectable,
// translatable and readable by a screen reader.
const heroWide = (show) => {
  const W = 1600, H = 900;
  const rand = rng(seedOf(`${show.slug}-hero`));
  // subject RIGHT of centre: the desktop band lays its title block over the LEFT third
  // (a 90deg scrim), and figures under type is the one composition the reference never
  // ships. 0.64 keeps both heads inside the 3:1 crop at 1440x480.
  const L = artLayers(W, H, show.palette, rand, { x: 0.64, y: 0.42 });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(show.title)}">
  <defs>${L.defs}</defs>
  ${L.body}
</svg>
`;
};

const heroTall = (show) => {
  const W = 900, H = 1200;
  const rand = rng(seedOf(`${show.slug}-hero-tall`));
  // the subject sits in the upper third: the phone hero's lower half is under the markup's
  // scrim, carrying the title, the genre pill and the Play button
  const L = artLayers(W, H, show.palette, rand, { x: 0.5, y: 0.34 });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(show.title)}">
  <defs>${L.defs}</defs>
  ${L.body}
</svg>
`;
};

// ── cover: 2:3, the reference home's frame (docs/design/reference-ui-spec.md §1–§2a) ────────
// Every card on that home is 2:3 — the 3-column grid at 116×174, the coming-soon rail at
// 113 wide, the New Titles poster at 81×127, the sheet poster at 110×165 — so the art is
// authored 2:3 and displayed 2:3, never the 3:4 poster cropped a quarter (AGENTS.md). Its
// composition differs from the poster's in one measured way: the CORNERS BELONG TO THE
// MARKUP. Top-right carries the HOT/NEW badge, bottom-left the ORIGINAL mark on a 56pt scrim,
// bottom-right the flame and the play count — so the title sits in the MIDDLE band (44–66%),
// centred, and the bottom third carries nothing that reads as type.
const cover = (show) => {
  const W = 400, H = 600;
  const rand = rng(seedOf(`${show.slug}-cover`));
  const p = show.palette;
  const L = artLayers(W, H, p, rand, { x: 0.5, y: 0.30 });
  const lines = wrap(show.title, 15, 3);
  const size = lines.length >= 3 ? 34 : 38;
  const lead = size * 1.1;
  const block = size + (lines.length - 1) * lead;
  const first = Math.round(H * 0.55 - block / 2 + size);
  const tspans = lines.map((l, i) => `<tspan x="${W / 2}" ${i === 0 ? 'dy="0"' : `dy="${lead.toFixed(1)}"`}>${esc(l)}</tspan>`).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(show.title)}">
  <defs>${L.defs}
    <linearGradient id="band" x1="0" y1="0.36" x2="0" y2="0.78">
      <stop offset="0" stop-color="#05030A" stop-opacity="0"/>
      <stop offset="0.4" stop-color="#05030A" stop-opacity="0.42"/>
      <stop offset="1" stop-color="#05030A" stop-opacity="0"/>
    </linearGradient>
  </defs>
  ${L.body}
  <rect width="${W}" height="${H}" fill="url(#band)"/>
  <text x="${W / 2}" y="${first}" text-anchor="middle" font-family="Georgia, Times New Roman, serif" font-size="${size}" font-weight="700" fill="#FFFFFF" style="paint-order: stroke; stroke: rgba(0,0,0,0.35); stroke-width: 6px; stroke-linejoin: round">${tspans}</text>
</svg>
`;
};

// ── title art: the show's LOGO, on a transparent ground (spec §3b, the episodes sheet) ──────
// Displayed ~180×80 and centred over the sheet's panel, so it is authored 9:4 with no backdrop:
// the type is the asset. The glow behind it is the show's own palette, which is what makes
// twelve logos read as twelve shows rather than twelve captions.
const titleArt = (show) => {
  const W = 720, H = 320;
  const p = show.palette;
  const lines = wrap(show.title, 16, 3);
  const size = lines.length >= 3 ? 64 : lines.length === 2 ? 74 : 84;
  const lead = size * 1.02;
  const block = size + (lines.length - 1) * lead;
  const first = Math.round(H / 2 - block / 2 + size * 0.82);
  const tspans = lines.map((l, i) => `<tspan x="${W / 2}" ${i === 0 ? 'dy="0"' : `dy="${lead.toFixed(1)}"`}>${esc(l)}</tspan>`).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(show.title)}">
  <defs>
    <radialGradient id="halo" cx="0.5" cy="0.5" r="0.55">
      <stop offset="0" stop-color="${p.glow}" stop-opacity="0.42"/>
      <stop offset="0.7" stop-color="${p.glow}" stop-opacity="0.08"/>
      <stop offset="1" stop-color="${p.glow}" stop-opacity="0"/>
    </radialGradient>
    <filter id="tsoft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3"/></filter>
  </defs>
  <ellipse cx="${W / 2}" cy="${H / 2}" rx="${W * 0.48}" ry="${H * 0.42}" fill="url(#halo)"/>
  <text x="${W / 2}" y="${first + 4}" text-anchor="middle" font-family="Georgia, Times New Roman, serif" font-size="${size}" font-weight="700" fill="${p.deep}" opacity="0.8" filter="url(#tsoft)">${tspans}</text>
  <text x="${W / 2}" y="${first}" text-anchor="middle" font-family="Georgia, Times New Roman, serif" font-size="${size}" font-weight="700" fill="#FFFFFF" style="paint-order: stroke; stroke: ${p.mid}; stroke-width: 3px; stroke-linejoin: round">${tspans}</text>
  <rect x="${W / 2 - 36}" y="${first + 22}" width="72" height="3" rx="1.5" fill="${p.glow}" opacity="0.9"/>
</svg>
`;
};

// ── the bell: the permission sheet's 64pt illustration (spec §2b) — an ASSET, not a glyph ───
// An emoji is a font-dependent picture with no per-platform twin (AGENTS.md), and an icon-font
// bell at 64pt is a glyph blown up. This is a drawn object in the app's own palette — the gold
// of the crown, the teal of the accent as the "new" dot — so it reads as the app's rather than
// the OS's. Transparent ground: the sheet's panel shows through.
const bell = () => {
  const W = 128, H = 128;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Notification bell">
  <defs>
    <linearGradient id="gold" x1="0.2" y1="0" x2="0.8" y2="1">
      <stop offset="0" stop-color="#FFE38A"/><stop offset="0.55" stop-color="#F5C518"/><stop offset="1" stop-color="#C98F0A"/>
    </linearGradient>
    <radialGradient id="bellglow" cx="0.5" cy="0.55" r="0.6">
      <stop offset="0" stop-color="#F5C518" stop-opacity="0.35"/><stop offset="1" stop-color="#F5C518" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <circle cx="64" cy="70" r="58" fill="url(#bellglow)"/>
  <path d="M64 18c3.6 0 6.4 2.8 6.4 6.3v2.3c14.2 3 24 15.4 24 30.4v17.2l9.6 12.6c1.9 2.5.1 6.2-3 6.2H26.9c-3.1 0-4.9-3.7-3-6.2l9.6-12.6V57c0-15 9.8-27.4 24-30.4v-2.3c0-3.5 2.8-6.3 6.5-6.3z" fill="url(#gold)"/>
  <path d="M42 57c0-11 8.2-20.6 19-22.6" stroke="#FFF4C2" stroke-width="3.5" stroke-linecap="round" fill="none" opacity="0.85"/>
  <path d="M52 100h24c0 6.6-5.4 12-12 12s-12-5.4-12-12z" fill="#C98F0A"/>
  <circle cx="94" cy="34" r="13" fill="#4ADFB4"/>
  <circle cx="94" cy="34" r="13" fill="none" stroke="#0B1D18" stroke-width="3" opacity="0.6"/>
</svg>
`;
};

let n = 0;
for (const show of SHOWS) {
  writeFileSync(resolve(OUT, `${show.slug}-poster.svg`), poster(show));
  writeFileSync(resolve(OUT, `${show.slug}-cover.svg`), cover(show));
  writeFileSync(resolve(OUT, `${show.slug}-title.svg`), titleArt(show));
  writeFileSync(resolve(OUT, `${show.slug}-hero.svg`), heroWide(show));
  writeFileSync(resolve(OUT, `${show.slug}-hero-tall.svg`), heroTall(show));
  n += 5;
}
mkdirSync(resolve("public/assets"), { recursive: true });
writeFileSync(resolve("public/assets/bell.svg"), bell());
console.log(`[art] ${n} files → public/posters (${SHOWS.length} shows) + public/assets/bell.svg`);
