# mcp: a declared rejection reaches the agent as an empty SUCCESS (Response object serialized)

**One line.** When a declared action rejects (`throw { reason: 'forbidden', … }`), the
MCP face returns `result: {content:[{text:"(empty)"}]}` with **no `isError`** — the
agent is told a refused mutation succeeded.

**Environment.** Measured on `dev@92b844b0`, re-verified 2026-08-29 evening at `dev@ae0669ad`
(`git diff --stat` over the relevant packages between the two: empty). Consumer: the
short-drama flagship template (`despia-templates/short-drama-app`) with `file:` deps on the
checkout's `OpenSource/Web/packages/*`, probes run against a freshly rebuilt `dist/`.
Filed under the template program's no-hacks law: the template ships a labeled bridge where
one exists, and the bridge dies when this lands.

**Repro.** Same action, same verified identity:

```
POST /admin/notice           → 403 {"reason":"forbidden","message":"operator authority required"}
tools/call "adminNotice"     → {"jsonrpc":"2.0","id":…,"result":{"content":[{"type":"text","text":"(empty)"}],"structuredContent":{}}}
                               (no isError; the face's onError sink never fires)
```

**Mechanism** (source-level): `declaredHandler` does not THROW for declared rejections —
it **returns a `Response`** (`thrownToResponse` → `jsonResponse(403, …)`, and budget trips
return a 503 Response the same way; `packages/server/src/actions.ts`, tail of the handler).
The route host passes Responses through, so HTTP callers see the status. But
`packages/server/src/mcp-face.ts` does:

```ts
const value = await handler(args, hostCtx);
return rpcResult(rpc.id, mcpToolResult(value === undefined ? null : value));
```

A `Response` has no enumerable own properties → `mcpToolResult` serializes it to
`"(empty)"` + `structuredContent: {}`. Its `catch` never runs (nothing threw), so
`isError` and `onError` never happen. **Budget-exceeded 503s are also invisible over MCP
for the same reason.**

**The ask.** In the face's dispatch: detect `value instanceof Response`; for status ≥ 400
read the body's `{reason, message}` and answer `mcpToolResult(null, { isError: true,
text: reason + ': ' + message })` (and pass 2xx Response bodies through as the value).
This is the difference between an agent that reports "the operator surface refused me" and
one that hallucinates success — for the manage-your-app-by-agent story it is the single
highest-leverage fix in this batch.
