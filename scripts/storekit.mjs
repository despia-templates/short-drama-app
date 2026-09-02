//
//  scripts/storekit.mjs — the StoreKit configuration file, generated from the price table.
//
//  Xcode's StoreKit Testing runs an app against a LOCAL store described by a `.storekit`
//  file: every product id, price and type the simulator will sell, with no App Store Connect
//  account, no sandbox Apple ID and no network. That is what lets a developer put a purchase
//  through this template on day one — `despia export ios`, open the project, Run, tap a plan,
//  and the sheet StoreKit shows is the one their customers will see. The exported project's
//  shared scheme points its launch action at this file (docs/monetization.md).
//
//  ONE TABLE, NOT TWO. The products here are READ OUT OF `server/store.dsx storeCatalog`, the
//  same rows the Membership page displays and `grantStore` grants from, so the simulator can
//  never sell a product id the server would refuse. `npm run verify` asserts the file and the
//  running origin agree; run this script after every price-table edit:
//
//      node scripts/storekit.mjs            # rewrites ShortDrama.storekit at the app root
//      node scripts/storekit.mjs --check    # exit 1 when the file is stale
//
//  Every product is a CONSUMABLE, because that is what the backend sells: a dated VIP pass is
//  one charge for N days with no renewal (server/store.dsx, the price table header), and a
//  coin pack is a consumable by nature. The `displayPrice` is the USD list price; StoreKit
//  Testing formats it for the simulator's storefront, which is why the Membership page reads
//  the STORE's localized string rather than trusting this number.
//
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";

export const STOREKIT_FILE = "ShortDrama.storekit";

/** the catalogue rows, read from the action body that serves them */
export function catalogueRows(src = readFileSync("server/store.dsx", "utf8")) {
  const body = /<action\s+as="storeCatalog"[^>]*>([\s\S]*?)<\/action>/.exec(src);
  if (body === null) throw new Error("server/store.dsx: no storeCatalog action");
  const rows = [];
  for (const m of body[1].matchAll(/\{\s*id:\s*'([^']+)'\s*,\s*productId:\s*'([^']+)'([^}]*)\}/g)) {
    const rest = m[3];
    const field = (name) => { const f = new RegExp(`\\b${name}:\\s*'([^']*)'`).exec(rest); return f === null ? null : f[1]; };
    const num = (name) => { const f = new RegExp(`\\b${name}:\\s*(\\d+)`).exec(rest); return f === null ? null : Number(f[1]); };
    const cents = num("cents");
    if (cents === null) continue;
    const label = field("label");
    const coins = num("coins");
    rows.push({
      id: m[1], productId: m[2], cents,
      kind: label !== null ? "vip" : "coins",
      name: label !== null ? label : `${coins} coins`,
      description: label !== null
        ? `${field("note") ?? ""}`.trim()
        : `${coins} coins plus ${num("free") ?? 0} bonus coins`,
    });
  }
  if (rows.length === 0) throw new Error("server/store.dsx: no catalogue rows with a productId");
  return rows;
}

/** a stable UUID-shaped id from a name, so a regenerated file diffs by content only */
function stableId(seed) {
  const h = createHash("sha256").update(seed).digest("hex").toUpperCase();
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-A${h.slice(17, 20)}-${h.slice(20, 32)}`;
}

export function storekitDocument(rows) {
  return {
    identifier: stableId("shortdrama.storekit"),
    nonRenewingSubscriptions: [],
    products: rows.map((r) => ({
      displayPrice: (r.cents / 100).toFixed(2),
      familyShareable: false,
      internalID: stableId(`product:${r.productId}`),
      localizations: [{ description: r.description, displayName: r.name, locale: "en_US" }],
      productID: r.productId,
      referenceName: r.name,
      type: "Consumable",
    })),
    settings: {
      _applicationInternalID: "",
      _developerTeamID: "",
      _failTransactionsEnabled: false,
      _lastSynchronizedDate: 0,
      _locale: "en_US",
      _storefront: "USA",
      _storeKitErrors: [
        { current: null, enabled: false, name: "Load Products" },
        { current: null, enabled: false, name: "Purchase" },
        { current: null, enabled: false, name: "Verification" },
        { current: null, enabled: false, name: "App Store Sync" },
        { current: null, enabled: false, name: "Subscription Status" },
        { current: null, enabled: false, name: "App Transaction" },
        { current: null, enabled: false, name: "Manage Subscriptions Sheet" },
        { current: null, enabled: false, name: "Refund Request Sheet" },
        { current: null, enabled: false, name: "Offer Code Redeem Sheet" },
      ],
    },
    subscriptionGroups: [],
    version: { major: 3, minor: 0 },
  };
}

if (process.argv[1] !== undefined && process.argv[1].endsWith("storekit.mjs")) {
  const rows = catalogueRows();
  const next = JSON.stringify(storekitDocument(rows), null, 2) + "\n";
  if (process.argv[2] === "--check") {
    const current = existsSync(STOREKIT_FILE) ? readFileSync(STOREKIT_FILE, "utf8") : "";
    if (current !== next) {
      console.error(`${STOREKIT_FILE} is stale against server/store.dsx — run node scripts/storekit.mjs`);
      process.exit(1);
    }
    console.log(`${STOREKIT_FILE} matches the price table (${rows.length} products)`);
    process.exit(0);
  }
  writeFileSync(STOREKIT_FILE, next);
  console.log(`${STOREKIT_FILE} — ${rows.length} products: ${rows.map((r) => r.productId).join(" · ")}`);
}
