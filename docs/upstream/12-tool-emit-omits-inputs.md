# cli/mcp: the standalone <tool> emit omits inputs — every tool advertises an empty schema and drops its arguments

**One line.** `readTool()` builds `{action, description, auth?, mutates?}` and never
copies the target action's declared `inputs`, so `tools/list` advertises
`inputSchema: {properties: {}}` and `tools/call` arguments never reach the action.

**Environment.** Measured on `dev@92b844b0`, re-verified 2026-08-29 evening at `dev@ae0669ad`
(`git diff --stat` over the relevant packages between the two: empty). Consumer: the
short-drama flagship template (`despia-templates/short-drama-app`) with `file:` deps on the
checkout's `OpenSource/Web/packages/*`, probes run against a freshly rebuilt `dist/`.
Filed under the template program's no-hacks law: the template ships a labeled bridge where
one exists, and the bridge dies when this lands.

**Source.** `packages/cli/src/server-document.ts` `readTool()`: the row is assembled
without `inputs`, even though the parser has the exact map at
`out.actions[action].inputs` in the same function's scope. `McpToolRow.inputs?` exists on
the server type and the face honours it.

**Observed.** All six of the template's tools listed with empty schemas; an
`adminNotice` call with `{title, message, segment}` arguments inserted nothing (arguments
dropped before dispatch). The template bridges by re-parsing `server/*.dsx` at boot and
attaching `inputs` per row — one source of truth, dies when the emitter carries it.

**The ask.** One line-ish: emit `inputs: Object.keys(out.actions[action].inputs)` into the
tool row. The facet law ("a tool never carries a second contract") is preserved — the
inputs ARE the action's declared contract.
