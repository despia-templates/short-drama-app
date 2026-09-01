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
//                                             guess: a11y labels, alt text and interpolated
//                                             composites
//    node scripts/strings.mjs --server        just the SERVER tier — the copy a declared
//                                             action sends to a display point (SERVER_COPY)
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
          if (icuKey(v) !== null) {
            // A MESSAGE TEMPLATE IS ITS OWN KEY, WITH THE HOLES INTACT. The framework's
            // message tier (kernel message.ts, wired into the display point by dom
            // mount.ts) normalizes `{n, plural, one {# x} other {# xs}}` to
            // `{0, plural, one {# x} other {# xs}}` and looks THAT up, resolving the
            // count after the hit — so one entry serves every value of n and each locale
            // picks its own CLDR category. That is the only spelling in which Arabic can
            // state six forms; a `== 1` ternary can state two.
            add(keys, icuKey(v), f);
          } else if (v.includes("{{")) {
            // AN INTERPOLATION RESOLVES BEFORE THE SEAM — AND THE SEAM READS WHAT COMES OUT.
            // This branch used to file every interpolated value as unreachable, which is
            // half true and cost real coverage. `bindDisplay` is
            //     () => DSXStrings.localize(expr.includes("{{") ? interpolate(expr) : expr)
            // so the RENDERED form is looked up. `EP 1–{{ n }} Free` renders "EP 1–5 Free"
            // and will never match a table, correctly. But a ternary over string LITERALS
            // renders one of those literals byte-for-byte, and the table hits.
            //
            // Measured before it was believed: `<text value="{{ favOn ? 'Saved' : 'My List' }}">`
            // on /show renders "Liste" with `global.locale = 'de'`. Thirty-six literals sat in
            // the follow-up list carrying the app's most-tapped words — Follow / Following,
            // Claim / Claimed, See plans, Restore purchases, Sign in — so twelve otherwise
            // complete locales all showed English on their VIP call to action.
            for (const lit of ternaryLiterals(v)) add(keys, lit, f);
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
  // ONE CORPUS, NOT TWO. The server tier folds in here rather than beside, so `--write`,
  // the coverage gate and the identical-to-English ratio all measure a locale against every
  // string a reader sees — wherever it was authored. A caller that wants the tier alone
  // asks `extractServer()`; nothing in this repo needs to.
  for (const [k, files] of extractServer()) for (const f of files) add(keys, k, f);
  return { keys, unreachable };
}

//  THE RENDERED FORMS OF A TERNARY, and the two conditions that make them exact.
//
//  (1) THE WHOLE ATTRIBUTE IS ONE HOLE. `value="{{ a ? 'X' : 'Y' }}"` renders exactly X or
//      exactly Y. `value="{{ … }}{{ … }}"` or `value="EP {{ n }}"` renders a CONCATENATION,
//      and no branch of it is ever a rendered form on its own — the ledger row that reads
//      `{{ kind == 'bonus' ? 'Bonus coins' : 'Coins' }}{{ … ' · expires in 7 days' }}` is
//      the live example, and taking its branches would have put two keys in every table
//      that the runtime can never look up.
//  (2) THE LITERAL IS A WHOLE BRANCH. It has to sit between a `?` or `:` and a `:` or the
//      end of the hole. That excludes a comparison operand (`kind == 'bonus'`, which is
//      never displayed) and a concatenation fragment (`'a' + x`, which never renders alone),
//      while still reading every arm of a nested ternary.
//
//  Anything this misses stays in the unreachable list, which is the safe direction: a key
//  nobody renders is dead weight in a table, and `--write` prunes it on the next refresh.
const WHOLE_HOLE = /^\{\{([\s\S]*)\}\}$/;
const BRANCH_LITERAL = /[?:]\s*'([^'\\]*)'\s*(?=:|$)/g;

//  ══ THE MESSAGE-TEMPLATE KEY ═══════════════════════════════════════════════════════
//  A display value carrying an ICU GROUP (`{expr, plural, …}`) is looked up as its
//  NORMALIZED template — the mirror of `DSXMessage.normalize` in the framework kernel,
//  restricted to what this template actually writes. Walking left to right, every
//  `{{ expr }}` hole and every `{expr, plural, …}` HEAD contributes one argument,
//  deduplicated by its trimmed expression text and rewritten to `{N}` in source order.
//
//  ONLY A VALUE WITH A GROUP QUALIFIES, and that is deliberate rather than shy. A plain
//  composite (`EP 1–{{ n }} Free`) normalizes to a perfectly good key too, and the
//  runtime would resolve it — but the SSR renderer does not run the message tier at all
//  (PLAN.md §6.101), so adopting those wholesale would ship raw templates in the served
//  HTML. A group is the OPT-IN: an author writes one only where the tier is complete,
//  and `npm run verify` asserts no server-rendered route carries one.
const ICU_HEAD = /^\{\s*([^{},]+?)\s*,\s*(plural|select|selectordinal|number|currency|percent|compact|date|time)\b/;

export function icuKey(value) {
  if (!value.includes("{")) return null;
  let hasGroup = false, out = "", i = 0;
  const exprs = [];
  const intern = (e) => {
    const at = exprs.indexOf(e);
    if (at >= 0) return at;
    exprs.push(e);
    return exprs.length - 1;
  };
  while (i < value.length) {
    if (value[i] === "{" && value[i + 1] === "{") {
      const close = value.indexOf("}}", i + 2);
      if (close < 0) { out += value.substring(i); break; }
      out += `{${intern(value.substring(i + 2, close).trim())}}`;
      i = close + 2;
      continue;
    }
    if (value[i] === "{") {
      const head = ICU_HEAD.exec(value.substring(i));
      if (head !== null) {
        hasGroup = true;
        out += `{${intern(head[1])}`;
        // resume AT THE COMMA, exactly as the kernel does: the group body is then copied
        // by this same loop, so a hole inside a branch numbers in true source order
        i += head[0].indexOf(",");
        continue;
      }
    }
    out += value[i];
    i += 1;
  }
  return hasGroup ? out : null;
}

export function ternaryLiterals(value) {
  const trimmed = value.trim();
  // exactly ONE hole, and it is the whole attribute. Counting the openers is the check that
  // matters: `^\{\{[\s\S]*\}\}$` is greedy and happily spans `}}{{`, which is how the first
  // cut of this pulled " · expires in 7 days" — a concatenation fragment — into the corpus.
  if ((trimmed.match(/\{\{/g) ?? []).length !== 1) return [];
  const whole = WHOLE_HOLE.exec(trimmed);
  if (whole === null) return [];
  const hole = whole[1];
  if (!hole.includes("?")) return [];
  const out = [];
  for (const m of hole.matchAll(BRANCH_LITERAL)) {
    const lit = m[1];
    if (lit.length > 0) out.push(lit);
  }
  return out;
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

//  ══ THE SERVER TIER, AND WHY IT IS THE SAME PLANE RATHER THAN A SECOND ONE ═══════════
//  The Store's price list is not authored in markup. Plan names ("7-day pass"), the term
//  note ("One charge for 7 days. No auto-renewal.") and the badge ("BEST VALUE") are
//  fields on the rows `server/store.dsx storeCatalog` returns, and that is deliberate:
//  they are the ONE copy of the price table (its header argues the case — three copies had
//  already drifted, and the audit filed it as a blocker, because the price a screen
//  DISPLAYS and the price a card is CHARGED must not be two literals). So they never
//  passed through this extractor, thirteen tables reported 248/248, and a Japanese reader
//  still bought in English off the app's most valuable screen.
//
//  THE FIX IS NOT A MECHANISM. It is noticing that the server is ALREADY returning keys.
//  Under gettext the English source string IS the key, so "the backend sends English" and
//  "the backend sends a translation key" are the same sentence — the key just happens to
//  be readable. And the display point does not care where its template came from: the
//  kernel's `localizeTemplate` normalizes `{{ item.note }}` to `{0}`, misses, renders the
//  hole, and then looks up THE RENDERED FORM — the seam's "legacy door". So the string the
//  server sent hits the table the same way `Save` does.
//
//  HOW EACH LANE GETS THE RIGHT STRING, since parity is the standing goal and a plane that
//  only works in a browser would be no answer at all. There is one implementation of this
//  per renderer and they are the same algorithm, read side by side rather than assumed:
//    web      kernel/src/strings.ts        localizeTemplate  → "THE LEGACY DOOR"
//    iOS      Engine/iOS/DSXStrings.swift  localizeTemplate  → the same comment, same order
//    Android  .../engine/Strings.kt        localizeTemplate  → likewise
//  All three read `Strings.<tag>.json` out of the same build registry down the same ladder
//  (`global.locale` → device → en). The client resolves; the server never learns a locale.
//  SSR is the same story and needs no special case: server/src/render.ts holds no reference
//  to DSXStrings on purpose ("the server is rendering for MANY locales at once and knows
//  exactly one of them: the one the app is AUTHORED in"), so a route SSRs English and
//  `bindDisplay` swaps the translation in at mount — for a markup key and a server-sent key
//  identically. Nothing about the price list behaves differently from `Sign in`.
//
//  WHAT WAS REJECTED, and why the code decided it rather than taste:
//   · PER-REQUEST RESOLUTION ON THE SERVER (Accept-Language, or a locale argument on the
//     call). It is the right answer for anything a CRAWLER or an EMAIL must read, and this
//     app sends neither. Against it: `Accept-Language` is a browser header — the native
//     lanes would have to pass an explicit argument, so the "one plane" would immediately
//     be two, which is exactly the parity failure to avoid. It would also put a second
//     table corpus on the backend, and render.ts already refuses the idea for a structural
//     reason that has nothing to do with effort: `exportStatic` writes ONE document per
//     route to disk and every reader is served it.
//   · MOVING THE COPY INTO MARKUP and returning only prices and identifiers. Tempting, and
//     wrong here for two reasons the source states. It re-creates the drift store.dsx's
//     header exists to prevent (display copy in one file, the charged price in another),
//     and the TIER SET IS OPERATOR DATA — markup would hard-code three passes, so a
//     deployment adding a 90-day tier would render a card with no name. The one thing that
//     argument was buying — translatability — is exactly what the plane above already gives
//     the server for free, so the trade has nothing left on its side.
//
//  THE COST THAT COMES WITH KEEPING IT SERVER-SIDE, named rather than discovered later: the
//  KEY SET GROWS WITH THE OPERATOR'S ROWS. Three tiers are three names and three notes; a
//  fourth tier is two more keys in thirteen tables. The honest form of that would be one
//  ICU template (`{days, plural, other {#-day pass}}`) covering every tier at one key, and
//  it is not available: the Store is a server-rendered route, and `npm run verify` asserts
//  no server-rendered route carries a raw message template (PLAN.md §6.101). So the cost is
//  paid, and `npm run verify` makes it LOUD — the live-payload gate there fails the build
//  when the running server sends a word no table carries.
//
//  WHICH FIELDS ARE COPY IS DECLARED, because nothing can infer it. A row is
//  `{ id: 'vip_pass_7', label: '7-day pass', price: '$11.99', cents: 1199 }` and no rule
//  distinguishes the name from the sku without being told which field a screen prints.
//  `price` and `bonus` are deliberately absent: `$11.99` and `+5%` are formatted NUMBERS,
//  which localise by `Intl` at the point of formatting and never by a string table.
//  `reason` IS here and still comes out English — it cites `REVENUECAT_KEY` and a source
//  path, so `classify()` files it DEVELOPER by the same rule it applies to markup. That is
//  the tier working, not an omission.
//
//  AND THIS EXTRACTOR IS A CONVENIENCE, NOT THE AUTHORITY. It reads source, so it sees a
//  field whose value is a literal (a ternary included) and cannot see one a body computes.
//  That is fine, and it is why the real assertion lives in `npm run verify`, over the bytes
//  a BOOTED origin actually answers with: source-reading is what fills the tables, and the
//  running server is what proves them.
const SERVER_COPY = {
  "store.dsx": { storeCatalog: ["label", "note", "badge", "reason"] },
};

/** the body of one `<action as="NAME">`, whole-line `//` comments dropped. Only whole-line,
 *  because a trailing strip would eat the `//` in a `'https://api.stripe.com/…'` literal. */
function actionBody(src, name) {
  const m = new RegExp(`<action\\s[^>]*as="${name}"[^>]*>([\\s\\S]*?)</action>`).exec(src);
  if (m === null) return null;
  return m[1].split("\n").filter((l) => !l.trim().startsWith("//")).join("\n");
}

/** every quoted literal inside the VALUE of `field:` — the value's extent is walked rather
 *  than regexed so a ternary (`reason: ok ? '' : 'This build …'`) yields both of its arms
 *  and a comma inside a nested call never ends the value early. */
function fieldLiterals(body, field) {
  const out = [];
  for (const head of body.matchAll(new RegExp(`(?:^|[{,\\s])${field}\\s*:`, "g"))) {
    let i = head.index + head[0].length;
    let depth = 0;
    while (i < body.length) {
      const ch = body[i];
      if (ch === "'" || ch === '"') {
        let j = i + 1, lit = "";
        while (j < body.length && body[j] !== ch) {
          if (body[j] === "\\") { lit += body[j + 1] ?? ""; j += 2; continue; }
          lit += body[j]; j += 1;
        }
        if (lit.length > 0) out.push(lit);
        i = j + 1;
        continue;
      }
      if (ch === "(" || ch === "[" || ch === "{") depth += 1;
      else if (ch === ")" || ch === "]") depth -= 1;
      else if (ch === "}") { if (depth === 0) break; depth -= 1; }
      else if (ch === "," && depth === 0) break;
      i += 1;
    }
  }
  return out;
}

/** the declared copy an action sends, keyed exactly as a markup literal is */
export function extractServer(dir = "server") {
  const keys = new Map();
  for (const [file, actions] of Object.entries(SERVER_COPY)) {
    const path = `${dir}/${file}`;
    if (!existsSync(path)) continue;
    const src = readFileSync(path, "utf8").replace(/<!--[\s\S]*?-->/g, "");
    for (const [action, fields] of Object.entries(actions)) {
      const body = actionBody(src, action);
      if (body === null) continue;
      for (const field of fields) for (const lit of fieldLiterals(body, field)) add(keys, lit, path);
    }
  }
  return keys;
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
    console.log("                               rendered form could match. A TERNARY over string");
    console.log("                               literals IS extracted (ternaryLiterals above) —");
    console.log("                               the seam localizes what interpolation renders.");
    console.log("                               A CONCATENATION never can be; the Translate module");
    console.log("                               (scheduled, not shipped) owns that tier.");
    console.log("  a computed that returns      THE KNOWN NEXT TIER, not yet extracted. A display");
    console.log("  literal sentences            bound to `{{ dsx.variable.vipLine }}` renders one of");
    console.log("                               the literals that computed returns, so the seam");
    console.log("                               WOULD hit them — measured, roughly 25 strings across");
    console.log("                               Rewards, Store, AdGate, PlansSheet, RestoreRow and");
    console.log("                               the Profile VIP card. Following a computed's returns");
    console.log("                               needs a rule that cannot mistake an enum key or a CSS");
    console.log("                               string for copy, and a half-safe rule puts junk in");
    console.log("                               twelve tables — so it waits for the extractor the");
    console.log("                               framework generator will need anyway.");
    console.log("  server copy                  NO LONGER LISTED HERE, and the old note that said");
    console.log("                               it 'localizes server-side' was wrong twice over: it");
    console.log("                               does not, and it does not need to. A declared action");
    console.log("                               field is extracted like any literal and resolves at");
    console.log("                               the client display point — see SERVER_COPY above and");
    console.log("                               --server. What is genuinely still English is the copy");
    console.log("                               no action DECLARES: rejection messages and notice");
    console.log("                               bodies, which are the same one-line extension.\n");
    for (const [k, files] of [...unreachable].sort()) {
      console.log(`  ${k}`);
      console.log(`      ${[...files].join(" ")}`);
    }
    process.exit(0);
  }

  if (arg === "--server") {
    const server = extractServer();
    console.log(`${server.size} string(s) the DECLARED SERVER TIER contributes (SERVER_COPY):\n`);
    for (const [k, files] of [...server].sort()) {
      console.log(`  ${classify(k, files).padEnd(9)} ${JSON.stringify(k)}`);
      console.log(`      ${[...files].join(" ")}`);
    }
    console.log("\nThese are keys exactly as a markup literal is: the English the action sends IS");
    console.log("the table key, and the client display point resolves it on all three renderers.");
    console.log("`npm run verify` asserts the same words over a BOOTED origin's payload, so a");
    console.log("price list cannot go back to English without a gate going red.");
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
    const viewerSet = new Set(byClass.viewer);
    // COUNT THE VIEWER KEYS, not the file's entries. Counting entries let a STALE key stand
    // in for a MISSING one: the moment `Manage` became operator-only and `Add days` arrived,
    // every table read "244/244 (100%)" while none of them carried the new string. The
    // detail lines below were right and the headline was wrong, which is the worse way round.
    const filled = byClass.viewer.filter((k) => typeof table[k] === "string" && table[k] !== "");
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
