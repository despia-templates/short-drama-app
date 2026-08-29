# api: send() posts its argument verbatim — the documented send({ body: X }) double-wraps

**One line.** `web/05-api-blocks.md` shows `save.send({ body: dsx.variable.draft })`, but
the implementation assigns the whole argument as the request body, so that call posts
`{"body":{…draft}}` and the server sees every field nested one level down.

**Environment.** Measured on `dev@92b844b0`, re-verified 2026-08-29 evening at `dev@ae0669ad`
(`git diff --stat` over the relevant packages between the two: empty). Consumer: the
short-drama flagship template (`despia-templates/short-drama-app`) with `file:` deps on the
checkout's `OpenSource/Web/packages/*`, probes run against a freshly rebuilt `dist/`.
Filed under the template program's no-hacks law: the template ships a labeled bridge where
one exists, and the bridge dies when this lands.

**Source.** `packages/kernel/src/api.ts`:

```ts
async send(args?: Dict): Promise<unknown> {
  const req = this.materialize();
  if (args !== undefined && args !== null) req["body"] = args;   // ← argument IS the body
  …
}
```

**Observed in the template.** Every `send({ body: { episode, show, … } })` produced
wire bodies of the shape `{"body":{"episode":…}}` → the declared action's inputs read
undefined → 400 `invalid`. Switching to `send(payload)` fixed all ten call sites.

**The ask.** Pick one and align the other: either `send()` unwraps a lone `body` key
(matching the doc and the `body=` attribute's vocabulary), or the doc's examples change to
`send(payload)`. Right now the copy-pasteable example produces a malformed request.
