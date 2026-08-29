//
//  scripts/seed.mjs — demo catalogue, seeded THROUGH the admin routes with the operator
//  identity (the same path the Manage View uses; nothing writes the database directly).
//  Media: Blender Foundation open-movie MP4s (CC-BY) as stand-in episode streams; posters
//  are generated SVGs in public/posters. The hosted lane swaps these for Stream HLS URLs.
//
import { readFileSync } from "node:fs";

const BASE = process.env.BASE ?? "http://localhost:8787";
const session = JSON.parse(readFileSync("public/dev-session.json", "utf8"));
const OP = session.operator.token;

const call = async (path, body) => {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { authorization: `Bearer ${OP}`, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${path} → ${res.status} ${JSON.stringify(data)}`);
  return data;
};

const CDN = "/media";
const SHOWS = [
  {
    title: "The Billionaire's Contract Bride", genre: "Romance", slug: "bride", featured: true, freeUntil: 3,
    synopsis: "Fired, framed and forced into a marriage of convenience, Aria signs a 90-day contract with the city's coldest CEO — and discovers his heart has fine print of its own.",
    video: `${CDN}/bride.mp4`,
  },
  {
    title: "Reborn: The Alpha's Revenge", genre: "Fantasy", slug: "alpha", featured: true, freeUntil: 3,
    synopsis: "Betrayed by his pack and left for dead, Kael wakes ten years in the past with every memory intact. This time, the wolves who burned his family will kneel.",
    video: `${CDN}/alpha.mp4`,
  },
  {
    title: "Secret Heiress of Time", genre: "Time Travel", slug: "heiress", featured: false, freeUntil: 3,
    synopsis: "An antique pocket watch throws waitress June a century back — into the shoes of the heiress whose disappearance ruined her own family's name.",
    video: `${CDN}/heiress.mp4`,
  },
];

const epTitles = ["The Contract", "A Stranger Returns", "The First Lie", "Behind Closed Doors", "The Rival", "What She Heard", "No Way Back", "The Reveal"];

for (const s of SHOWS) {
  const show = await call("/internal/admin/upsertshow", {
    title: s.title, synopsis: s.synopsis, genre: s.genre,
    poster: `/posters/${s.slug}-poster.svg`, hero: `/posters/${s.slug}-hero.svg`,
    state: "live", freeUntil: s.freeUntil, featured: s.featured,
  });
  for (let i = 1; i <= 8; i++) {
    await call("/internal/admin/upsertepisode", {
      show: show.id, idx: i, title: `EP ${i} — ${epTitles[i - 1]}`,
      videoUrl: s.video, poster: `/posters/${s.slug}-poster.svg`,
      duration: 75, price: 60, state: "live",
    });
  }
  console.log(`[seed] ${s.title} (${show.id}) + 8 episodes`);
}
const stats = await call("/internal/admin/stats", {});
console.log("[seed] stats:", JSON.stringify(stats));
