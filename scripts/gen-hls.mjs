//
//  scripts/gen-hls.mjs — the demo's HLS ladders and subtitle renditions, generated from the
//  three progressive MP4s in public/media with ffmpeg.
//
//  WHY. The player's option sheets (Components/Watch.dsx §3d) offer the SUBTITLE TRACKS and
//  the RENDITION LADDER the stream actually carries — `<video>` publishes them as `tracks`
//  and `variants` (Conformance/media/playback-selection.json) and the sheets render exactly
//  those lists. A progressive MP4 carries neither, so against the old demo media both sheets
//  would have been empty and the founder's target UI unreachable. HLS is the one container
//  that carries both on every lane natively (AVPlayer, ExoPlayer, Safari) and, since this
//  pass, on Chrome and Firefox through the web renderer's dependency-free MSE lane.
//
//  WHAT IT WRITES, per source clip <slug>:
//     public/media/<slug>/master.m3u8              the master — renditions + subtitle groups
//     public/media/<slug>/v<height>/index.m3u8      one media playlist per rung (fMP4, 2 s)
//     public/media/<slug>/v<height>/init.mp4 + seg*.m4s
//     public/media/<slug>/sub/<lang>/index.m3u8     one WebVTT rendition per language
//     public/media/<slug>/sub/<lang>/cues.vtt
//  scripts/seed.mjs then points every episode's `videoUrl` at the master.
//
//  THE LADDER IS HONEST. The demo sources are 640x360 Blender open-movie clips, so the rungs
//  are 360p (the source) · 240p · 144p, and that is what the Quality sheet will say — the
//  words come from the stream, never from markup. A real deployment encodes 1080/720/480/240
//  from its masters and the same sheet reads "Auto(720p) · 720p · 480p · 240p" with no code
//  change. Upscaling 360p to "720p" for the demo would make the picker lie about the pixels.
//
//  THE SUBTITLES ARE DEMO TEXT in the ten languages the reference sheet lists, one short line
//  per clip, cued to the clip's ten seconds. They exist so the Subtitles sheet has real tracks
//  to select — the line is the same sentence in each language, not a translation of the film.
//
//  Idempotent (rewrites in place); ~20 s for the three clips. Output is gitignored like the
//  PNG art twins: a clone runs `npm run gen-hls` (or `npm run seed`, which calls it).
//
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const MEDIA = join(root, "public", "media");

// height → video bitrate (kbps). Audio, when the source has any, rides every rung at 96 kbps AAC.
const LADDER = [
  { height: 360, kbps: 800 },
  { height: 240, kbps: 400 },
  { height: 144, kbps: 200 },
];

// the ten §3d languages, endonyms as the NAME the picker shows (never translated), and the
// demo line each rendition carries. Language tags are BCP-47 as the sheet will publish them.
const SUBTITLES = [
  { lang: "en", name: "English", line: "She signed the contract without reading a single word." },
  { lang: "ja", name: "日本語", line: "彼女は一言も読まずに契約書にサインした。" },
  { lang: "ko", name: "한국어", line: "그녀는 한 글자도 읽지 않고 계약서에 서명했다." },
  { lang: "es", name: "Español", line: "Firmó el contrato sin leer una sola palabra." },
  { lang: "id", name: "Bahasa Indonesia", line: "Dia menandatangani kontrak itu tanpa membaca sepatah kata pun." },
  { lang: "pt-BR", name: "Português", line: "Ela assinou o contrato sem ler uma única palavra." },
  { lang: "th", name: "ภาษาไทย", line: "เธอเซ็นสัญญาโดยไม่ได้อ่านแม้แต่คำเดียว" },
  { lang: "ar", name: "اللغة العربية", line: "وقّعت العقد دون أن تقرأ كلمة واحدة." },
  { lang: "zh-Hant", name: "繁體中文", line: "她一個字都沒看就簽了合約。" },
  { lang: "zh-Hans", name: "简体中文", line: "她一个字都没看就签了合同。" },
];

const ff = (args) => execFileSync("ffmpeg", ["-v", "error", "-y", ...args], { stdio: ["ignore", "inherit", "inherit"] });
const probe = (file, what) =>
  execFileSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", `stream=${what}`, "-of", "default=nw=1:nk=1", file]).toString().trim();

const sources = readdirSync(MEDIA).filter((f) => f.endsWith(".mp4")).map((f) => f.replace(/\.mp4$/, ""));
if (sources.length === 0) { console.error("[gen-hls] no MP4 sources in public/media"); process.exit(1); }

for (const slug of sources) {
  const src = join(MEDIA, `${slug}.mp4`);
  const out = join(MEDIA, slug);
  const srcH = Number(probe(src, "height"));
  // the CODECS string must name exactly the tracks the init segment carries: a browser's MSE
  // demuxer refuses an init that "misses the expected aac track", and the demo masters are
  // silent (Blender open-movie clips stripped to picture), so a ladder is audio-less unless
  // the source has sound. Probe rather than assume.
  const hasAudio = execFileSync("ffprobe", ["-v", "error", "-select_streams", "a:0", "-show_entries", "stream=codec_name", "-of", "default=nw=1:nk=1", src]).toString().trim() !== "";
  const codecs = hasAudio ? "avc1.4d401f,mp4a.40.2" : "avc1.4d401f";
  const duration = Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", src]).toString().trim());
  mkdirSync(out, { recursive: true });

  const rungs = LADDER.filter((r) => r.height <= srcH);
  for (const r of rungs) {
    const dir = join(out, `v${r.height}`);
    mkdirSync(dir, { recursive: true });
    // fMP4 (CMAF) segments, 2 s, one keyframe per segment so every rung's timeline is aligned
    // and a quality switch lands on a boundary — the shape the web MSE lane expects.
    ff([
      "-i", src,
      "-vf", `scale=-2:${r.height}`,
      "-c:v", "libx264", "-preset", "veryfast", "-profile:v", "main", "-pix_fmt", "yuv420p",
      "-b:v", `${r.kbps}k`, "-maxrate", `${Math.round(r.kbps * 1.1)}k`, "-bufsize", `${r.kbps * 2}k`,
      "-g", "60", "-keyint_min", "60", "-sc_threshold", "0",
      ...(hasAudio ? ["-c:a", "aac", "-b:a", "96k", "-ac", "2"] : ["-an"]),
      "-f", "hls", "-hls_time", "2", "-hls_playlist_type", "vod",
      "-hls_segment_type", "fmp4", "-hls_fmp4_init_filename", "init.mp4",
      "-hls_segment_filename", join(dir, "seg%03d.m4s"),
      join(dir, "index.m3u8"),
    ]);
  }

  // subtitle renditions: a WebVTT media playlist per language, one segment, cues across the clip
  for (const s of SUBTITLES) {
    const dir = join(out, "sub", s.lang);
    mkdirSync(dir, { recursive: true });
    const end = Math.max(2, Math.floor(duration) - 1);
    const vtt = [
      "WEBVTT",
      "X-TIMESTAMP-MAP=MPEGTS:0,LOCAL:00:00:00.000",
      "",
      `00:00:00.800 --> 00:00:0${Math.min(4, end)}.600`,
      s.line,
      "",
      `00:00:0${Math.min(5, end)}.000 --> 00:00:0${Math.min(9, end)}.400`,
      `${s.name} · Demo`,
      "",
    ].join("\n");
    writeFileSync(join(dir, "cues.vtt"), vtt);
    writeFileSync(join(dir, "index.m3u8"), [
      "#EXTM3U", "#EXT-X-VERSION:3", `#EXT-X-TARGETDURATION:${Math.ceil(duration)}`,
      "#EXT-X-MEDIA-SEQUENCE:0", "#EXT-X-PLAYLIST-TYPE:VOD",
      `#EXTINF:${duration.toFixed(3)},`, "cues.vtt", "#EXT-X-ENDLIST", "",
    ].join("\n"));
  }

  // the master: subtitle group first, then the rungs highest first (players read the list
  // top-down when the bandwidth estimate is unknown; ABR still starts where each lane decides)
  const master = ["#EXTM3U", "#EXT-X-VERSION:7", "#EXT-X-INDEPENDENT-SEGMENTS"];
  for (const s of SUBTITLES) {
    master.push(`#EXT-X-MEDIA:TYPE=SUBTITLES,GROUP-ID="subs",NAME="${s.name}",LANGUAGE="${s.lang}",DEFAULT=NO,AUTOSELECT=NO,FORCED=NO,URI="sub/${s.lang}/index.m3u8"`);
  }
  for (const r of [...rungs].sort((a, b) => b.height - a.height)) {
    const dir = join(out, `v${r.height}`);
    const w = Number(probe(join(dir, "init.mp4"), "width")) || Math.round((r.height * 16) / 9);
    const bandwidth = (r.kbps + (hasAudio ? 96 : 0)) * 1000;
    master.push(`#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},AVERAGE-BANDWIDTH=${Math.round(bandwidth * 0.92)},RESOLUTION=${w}x${r.height},CODECS="${codecs}",SUBTITLES="subs"`);
    master.push(`v${r.height}/index.m3u8`);
  }
  master.push("");
  writeFileSync(join(out, "master.m3u8"), master.join("\n"));
  console.log(`[gen-hls] ${slug}: ${rungs.map((r) => r.height + "p").join(" · ")} + ${SUBTITLES.length} subtitle renditions → public/media/${slug}/master.m3u8`);
}
