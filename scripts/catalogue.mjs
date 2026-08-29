//
//  scripts/catalogue.mjs — the demo catalogue, as data.
//
//  Shared by `gen-art.mjs` (which paints one poster + hero per row) and `seed.mjs` (which
//  writes them through the admin routes). Kept apart from both so the art and the database
//  can never disagree about what shows exist, and so a template user editing the demo
//  content edits ONE file.
//
//  Shape notes, all of them category facts rather than invention:
//   · episode counts run 18–32, and they are REAL rows, not a cosmetic number on a badge.
//     A shipping vertical drama runs 60–100 one-minute episodes; a demo seed that wrote
//     1,300 rows would push `discoverFeed`'s 500-episode read past its limit and silently
//     drop shows off Discover, so the demo seeds what it can serve honestly and the
//     badge says exactly what the drawer contains.
//   · `freeUntil` is 2–5. The hook is free, the cliffhanger is not — that is the business.
//   · `price` is per episode in coins and varies by show, because the reference catalogues
//     price a flagship above a back-catalogue title.
//   · `featured` drives the hero pager and the TOP rail; five is the reference count.
//
export const SHOWS = [
  {
    slug: "bride", title: "The Billionaire's Contract Bride", genre: "Romance",
    kicker: "ORIGINAL", featured: true, episodes: 30, freeUntil: 3, price: 60, media: "bride",
    synopsis:
      "Fired, framed and forced into a marriage of convenience, Aria signs a 90-day contract with the city's coldest CEO — and discovers his heart has fine print of its own.",
    palette: { deep: "#2A0B16", mid: "#B8213F", glow: "#FF8FA8", accent: "#5B1030", figure: "#180510", spark: "#FFD9E2" },
  },
  {
    slug: "alpha", title: "Reborn: The Alpha's Revenge", genre: "Werewolf",
    kicker: "ORIGINAL", featured: true, episodes: 32, freeUntil: 3, price: 65, media: "alpha",
    synopsis:
      "Betrayed by his pack and left for dead, Kael wakes ten years in the past with every memory intact. This time, the wolves who burned his family will kneel.",
    palette: { deep: "#07182E", mid: "#1D5AA8", glow: "#7EC4FF", accent: "#0B2E57", figure: "#030B18", spark: "#D6ECFF" },
  },
  {
    slug: "heiress", title: "Secret Heiress of Time", genre: "Time Travel",
    kicker: "ORIGINAL", featured: true, episodes: 26, freeUntil: 4, price: 55, media: "heiress",
    synopsis:
      "An antique pocket watch throws waitress June a century back — into the shoes of the heiress whose disappearance ruined her own family's name.",
    palette: { deep: "#1B0A33", mid: "#7A34C8", glow: "#C79BFF", accent: "#3A0F6B", figure: "#0D0420", spark: "#EBDCFF" },
  },
  {
    slug: "midnight", title: "Midnight CEO: Double Identity", genre: "Romance",
    kicker: "ORIGINAL", featured: true, episodes: 28, freeUntil: 3, price: 60, media: "bride",
    synopsis:
      "By day he signs her paycheque. By night he is the masked stranger who saved her life. Nora is falling for both men — and they are running out of ways to stay two people.",
    palette: { deep: "#120A22", mid: "#C2337A", glow: "#FF9BD0", accent: "#43104A", figure: "#0A0514", spark: "#FFE1F1" },
  },
  {
    slug: "divorce", title: "After the Divorce, I Became a Queen", genre: "Revenge",
    kicker: "TRENDING", featured: true, episodes: 27, freeUntil: 3, price: 60, media: "bride",
    synopsis:
      "He signed the papers laughing, certain she had nothing. He did not know the quiet wife he discarded owned the board that was about to fire him.",
    palette: { deep: "#2B0F08", mid: "#C25A1B", glow: "#FFC17E", accent: "#5C230A", figure: "#150703", spark: "#FFE7C8" },
  },
  {
    slug: "mafia", title: "The Don's Forbidden Nurse", genre: "Mafia",
    kicker: "ORIGINAL", featured: false, episodes: 24, freeUntil: 2, price: 70, media: "alpha",
    synopsis:
      "She patched a bullet wound and asked no questions. Now the most dangerous man in the city has decided she belongs to him — and the man who put the bullet there is still breathing.",
    palette: { deep: "#160A0A", mid: "#8E1420", glow: "#FF7A72", accent: "#3B0A0E", figure: "#0A0404", spark: "#FFD3CB" },
  },
  {
    slug: "twins", title: "Swapped With My Billionaire Twin", genre: "Comedy",
    kicker: "NEW", featured: false, episodes: 20, freeUntil: 5, price: 45, media: "heiress",
    synopsis:
      "Two identical strangers, one boardroom, and forty-eight hours before the merger vote. Neither of them can afford to blink first.",
    palette: { deep: "#0A2320", mid: "#1E8E7A", glow: "#7BF0D8", accent: "#0D4A3F", figure: "#04120F", spark: "#D8FFF5" },
  },
  {
    slug: "ceo-nanny", title: "The CEO's Accidental Nanny", genre: "Romance",
    kicker: "NEW", featured: false, episodes: 22, freeUntil: 4, price: 50, media: "bride",
    synopsis:
      "She answered an ad for a dog-sitter. The 'dog' is a six-year-old genius, the client is the man who ruined her father, and the job comes with a room in his house.",
    palette: { deep: "#241033", mid: "#9A3FB4", glow: "#E3A0FF", accent: "#4A1560", figure: "#100518", spark: "#F6E3FF" },
  },
  {
    slug: "heir", title: "The Hidden Heir Returns", genre: "Revenge",
    kicker: "TRENDING", featured: false, episodes: 31, freeUntil: 3, price: 65, media: "alpha",
    synopsis:
      "Eighteen years ago they threw a boy out into the rain. Yesterday, the family's largest creditor bought their debt. Tonight he is coming to dinner.",
    palette: { deep: "#0B1522", mid: "#2F5F86", glow: "#93CBEF", accent: "#123044", figure: "#050B12", spark: "#DCEEFB" },
  },
  {
    slug: "moonlit", title: "Moonlit Bride of the Wolf King", genre: "Werewolf",
    kicker: "ORIGINAL", featured: false, episodes: 29, freeUntil: 3, price: 65, media: "alpha",
    synopsis:
      "The treaty says the weakest omega of the losing pack must marry the king who destroyed it. Nobody warned the king that she was never weak.",
    palette: { deep: "#101A2E", mid: "#3F4FA8", glow: "#A9B4FF", accent: "#1C2455", figure: "#070B16", spark: "#E2E6FF" },
  },
  {
    slug: "amnesia", title: "I Forgot I Was His Wife", genre: "Drama",
    kicker: "NEW", featured: false, episodes: 21, freeUntil: 4, price: 50, media: "heiress",
    synopsis:
      "She woke with no name and a wedding ring. The man at her bedside says he is her husband. Everyone else in the building says she died last spring.",
    palette: { deep: "#1A1620", mid: "#6C5A8C", glow: "#C3B2E0", accent: "#332A47", figure: "#0C0910", spark: "#EFE7FA" },
  },
  {
    slug: "chef", title: "Kitchen of Second Chances", genre: "Drama",
    kicker: "NEW", featured: false, episodes: 18, freeUntil: 5, price: 45, media: "heiress",
    synopsis:
      "A three-star chef loses her palate and her restaurant in the same week. The only kitchen that will take her belongs to the critic who destroyed her.",
    palette: { deep: "#231604", mid: "#A8781A", glow: "#FFD979", accent: "#4C3008", figure: "#120B02", spark: "#FFF0C4" },
  },
  {
    slug: "vault", title: "The Last Heiress of Nightvale", genre: "Suspense",
    kicker: "ORIGINAL", featured: false, episodes: 25, freeUntil: 2, price: 70, media: "alpha",
    synopsis:
      "Her grandmother left her a house, a key, and one instruction: never open the east wing. Three days after the funeral, the east wing opens by itself.",
    palette: { deep: "#0C1410", mid: "#2C6B4B", glow: "#8CE0B4", accent: "#123528", figure: "#050A07", spark: "#D9F7E7" },
  },
  {
    slug: "campus", title: "My Cold Campus Prince", genre: "Comedy",
    kicker: "NEW", featured: false, episodes: 19, freeUntil: 5, price: 40, media: "heiress",
    synopsis:
      "One dorm mix-up, one fake relationship, and one very real scholarship on the line. The rules were simple until somebody forgot they were pretending.",
    palette: { deep: "#0F1B33", mid: "#3C74D6", glow: "#9CC2FF", accent: "#1A3468", figure: "#060C18", spark: "#E0EBFF" },
  },
];

// The beat sheet a vertical drama actually runs on: hook, escalation, betrayal, reversal.
// Episode titles cycle through it so an 80-episode show reads as a story rather than a
// counter, and the drawer's "EP 41 — The Price of Silence" looks like a real catalogue.
export const EPISODE_TITLES = [
  "The Contract", "A Stranger Returns", "The First Lie", "Behind Closed Doors",
  "The Rival", "What She Heard", "No Way Back", "The Reveal",
  "Ashes and Interest", "The Second Signature", "A Name He Buried", "The Long Game",
  "Everything She Owns", "The Price of Silence", "Blood in the Boardroom", "Checkmate",
];

export const epTitle = (i) => `EP ${i} — ${EPISODE_TITLES[(i - 1) % EPISODE_TITLES.length]}`;
