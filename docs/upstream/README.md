# Upstream issue drafts — filed from the short-drama template

Each file is the body of one GitHub issue on `despia-native/despia-framework`.
Ledger of record: `PLAN.md` §6. Every claim here survived the clean-room
re-verification of 2026-08-29 evening (three earlier claims did not, and were
retracted in the ledger instead of filed).

- `01-verticalplayerstack-web-facet.md` — article 10: VerticalPlayerStack has no web facet → https://github.com/despia-native/despia-framework/issues/215
- `02-operator-authority-declared-actions.md` — server: declared actions have no operator/service authority path (blocks Manage View writes) → https://github.com/despia-native/despia-framework/issues/216
- `03-standalone-webhook-parity.md` — standalone server compile: <webhook> is not in the vocabulary → https://github.com/despia-native/despia-framework/issues/217
- `04-jse-stored-null-truthiness.md` — jse: stored null is truthy — `!w` is false and `if (w)` enters on a null → https://github.com/despia-native/despia-framework/issues/218
- `05-jse-bracket-read-mutation-noop.md` — jse: mutation through a bracket read with a variable key is a silent no-op → https://github.com/despia-native/despia-framework/issues/219
- `06-data-create-explicit-null.md` — server/data: an explicit null field value fails the whole data.create statement → https://github.com/despia-native/despia-framework/issues/220
- `07-towire-repeated-refs.md` — server/wire: toWire's seen-set nulls repeated references — a DAG is not a cycle → https://github.com/despia-native/despia-framework/issues/221
- `08-api-send-verbatim.md` — api: send() posts its argument verbatim — the documented send({ body: X }) double-wraps → https://github.com/despia-native/despia-framework/issues/222
- `09-image-size-attrs-web.md` — web: <image> width/height attributes don't emit — <video>'s do → https://github.com/despia-native/despia-framework/issues/223
- `10-inline-component-placeholder-web.md` — web: head-declared <component as=…> renders a literal "<Name>?" placeholder → https://github.com/despia-native/despia-framework/issues/224
- `11-mcp-rejection-empty-success.md` — mcp: a declared rejection reaches the agent as an empty SUCCESS (Response object serialized) → https://github.com/despia-native/despia-framework/issues/225
- `12-tool-emit-omits-inputs.md` — cli/mcp: the standalone <tool> emit omits inputs — every tool advertises an empty schema and drops its arguments → https://github.com/despia-native/despia-framework/issues/226
- `13-standalone-mcp-serve-path.md` — packaging/mcp: a standalone project has no supported way to SERVE its emitted mcpTools → https://github.com/despia-native/despia-framework/issues/227
- `14-dev-lane-trust.md` — dx/dev-lane: two ways the local lane silently misleads (precaching SW; static shell ignores the deep-linked path) → https://github.com/despia-native/despia-framework/issues/228
- `15-review-brand-palette.md` — review: R4 hex-count has no brand-palette valve → https://github.com/despia-native/despia-framework/issues/230
- `16-style-fragment-silent-drop.md` — lint/web: style fragment silently discarded → https://github.com/despia-native/despia-framework/issues/231
- `17-review-type-ramp.md` — review: R3 has no project type-ramp declaration → https://github.com/despia-native/despia-framework/issues/232
- `18-entry-frame-double-mount.md` — web/router: entry frame double-mounted on every route → https://github.com/despia-native/despia-framework/issues/233
- `19-persistent-chrome.md` — router/layout: no persistent chrome slot → https://github.com/despia-native/despia-framework/issues/234
- `20-coin-icon.md` — icons: no currency-neutral coin glyph → https://github.com/despia-native/despia-framework/issues/235
- `21-press-release-event.md` — input: no press-release event → https://github.com/despia-native/despia-framework/issues/236
- `22-linelimit-inert-web.md` — web: lineLimit is inert → https://github.com/despia-native/despia-framework/issues/237
- `23-justifycontent-missing.md` — layout: justifyContent missing → https://github.com/despia-native/despia-framework/issues/238
- `24-sibling-inputs-scope-leak.md` — sibling-with-inputs corrupts the caller's next binding → https://github.com/despia-native/despia-framework/issues/242
- `25-ssr-relative-api-url.md` — ssr: a root-relative <api url="/x"> cannot be fetched during SSR — every seeded page shipped empty → https://github.com/despia-native/despia-framework/issues/260
- `26-exportstatic-shadows-live.md` — site: exportStatic's dataless export permanently shadows live SSR seeding → https://github.com/despia-native/despia-framework/issues/261
- `27-universal-attribute-census.md` — reference/lint: the universal-attribute census omitted seven documented attributes → https://github.com/despia-native/despia-framework/issues/262
- `28-router-motion-chrome.md` — router: motion has one knob too few for global chrome → https://github.com/despia-native/despia-framework/issues/263
- `29-api-cache-mount-scope.md` — api: cache="swr(...)" cannot survive a mount → https://github.com/despia-native/despia-framework/issues/264
- `30-await-in-ternary.md` — jse/server: await inside a ternary silently yields a non-ok result → https://github.com/despia-native/despia-framework/issues/265
- `31-route-param-initializer-and-order.md` — router: route param unreadable from a <variable> initializer; route order captures the URL → https://github.com/despia-native/despia-framework/issues/266
- `32-no-kv-storage.md` — modules: no declared cross-platform key-value storage → https://github.com/despia-native/despia-framework/issues/267
- `33-shell-stylesheets.md` — build/shell: the bundled face was unreachable — no app could link a stylesheet → https://github.com/despia-native/despia-framework/issues/268
- `34-replace-reset-motion.md` — router: only push animated — replace/reset hard-cut → https://github.com/despia-native/despia-framework/issues/269
- `35-video-rendition-track.md` — elements: <video> can select neither a rendition nor a track → https://github.com/despia-native/despia-framework/issues/270
- `36-package-boot-required.md` — packages/runtime: a declared web package is unreachable without boot: true — silently disabled Stripe → https://github.com/despia-native/despia-framework/issues/271
- `37-no-transaction.md` — server/data: a declared action cannot span a transaction → https://github.com/despia-native/despia-framework/issues/272
- `38-atomic-style-id-collision.md` — web/ssr: atomic style ids are positional and unversioned → https://github.com/despia-native/despia-framework/issues/273
- `39-hydrated-scroll-plane.md` — web/ssr: a hydrated <scroll> never gets its scroll plane → https://github.com/despia-native/despia-framework/issues/274
- `40-open-drop-behind-dev.md` — distribution: the public drop mirrors a branch behind dev → https://github.com/despia-native/despia-framework/issues/275
