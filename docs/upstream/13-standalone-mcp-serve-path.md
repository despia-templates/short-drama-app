# packaging/mcp: a standalone project has no supported way to SERVE its emitted mcpTools

**One line.** `despia build` emits `mcpTools` into the standalone barrel
(`server/generated/index.ts`), but `@despia/server`'s export map has no `"./mcp-face"`,
and `bootloader-node`'s `serve()` loads the MONOREPO artifact shape (`generated/routes.json`
etc.) — so the `<tool>` grammar produces rows nothing can mount outside the monorepo.

**Environment.** Measured on `dev@92b844b0`, re-verified 2026-08-29 evening at `dev@ae0669ad`
(`git diff --stat` over the relevant packages between the two: empty). Consumer: the
short-drama flagship template (`despia-templates/short-drama-app`) with `file:` deps on the
checkout's `OpenSource/Web/packages/*`, probes run against a freshly rebuilt `dist/`.
Filed under the template program's no-hacks law: the template ships a labeled bridge where
one exists, and the bridge dies when this lands.

**Observed.** `import { createMcpFace } from "@despia/server/mcp-face"` →
`ERR_PACKAGE_PATH_NOT_EXPORTED`. Exports today: `. ./host ./actions ./identity
./bootloader-node ./bootloader-deno ./deploy ./bootloader-workers ./postgres
./preview-workers`. The template's local origin imports
`…/packages/server/dist/mcp-face.js` by absolute file path, loudly labeled as a bridge.

**The ask**, smallest first:
1. add `"./mcp-face"` to the export map;
2. teach the standalone serve path (or a documented `createHost`-adjacent helper) to mount
   the face from the barrel's `mcpTools` — the barrel comment already says "consumed by an
   /mcp face when the host mounts one", but no shipped host can;
3. long-term: fold into whatever the standalone deploy emits per target.

Together with the inputs emit (filed separately) this closes the gap between "the `<tool>`
row is documented grammar" and "a standalone deployment actually answers `tools/call`".
