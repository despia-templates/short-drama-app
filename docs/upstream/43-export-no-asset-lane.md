# export: there is no asset lane, so a native app cannot ship its own images, fonts or media — every one is a network fetch against an origin

**One line.** `despia export ios|android` bundles the kernel, the components, `App.json`,
`EngineConfig.json` and `runtime.js` — and nothing from the project's `public/`. So every poster,
font and clip a DSX app renders must be fetched from a reachable origin at runtime, and an app
with no network shows nothing.

**Environment.** `dev@ca71178d`, `packages/cli/src/export.ts`. Found taking the short-drama
flagship to the native lane: 44 poster/hero SVGs, a bundled Inter face and demo media, all of
which the web lane serves from `public/` and the native lane simply cannot see.

**What ships today** (both platforms, from `exportIOS` / `exportAndroid`):

| | shipped |
|---|---|
| kernel sources | yes |
| `Components/**.dsx` | yes (`Resources/DSXComponents/` · `assets/components/`) |
| `App.json`, `EngineConfig.json`, `runtime.js` | yes |
| the project's `public/` (images, fonts, media) | **no** |

**Why this bites harder than it sounds.**

1. **There is no offline first frame.** An app whose art is 100% remote renders an empty layout
   until the network answers, on every cold launch, forever. That is the opposite of the reason to
   ship natively.
2. **It forces a reachable origin for things that are not data.** A template that wants to run on
   a simulator or a device now needs a hosted origin purely to serve static art — `localhost` is
   not reachable from a device, so the honest options collapse to "deploy something" or "type your
   laptop's LAN IP into App.json". Neither is a template default anyone should ship.
3. **It interacts with ATS.** A LAN origin over http needs `NSAllowsLocalNetworking`, which the
   generated Info.plist does not declare — so the workaround for the missing asset lane needs a
   second workaround.

**The ask.** An asset lane in the export: copy the project's `public/` (or a declared
`assets`/`resources` list) into `Resources/` on iOS and `assets/` on Android, and resolve a
root-relative `src="/posters/x.svg"` against the BUNDLE first, falling back to the origin. That
gives the same authoring spelling on both lanes — which is the whole promise — and gives native
apps a real offline first frame.

**Adjacent, worth deciding with it.** `App.json`'s `host` is currently the only origin seam, and
it is documented as identity ("the per-locale host resolved from App.json"). Templates need a
THIRD state beside "production host" and "unset": a development origin for simulator/device
testing that is obviously not a shipping value. `dsx.global.dev.origin` exists for this in the
Core/DevSettings module, but a template that declares no modules cannot reach it.
