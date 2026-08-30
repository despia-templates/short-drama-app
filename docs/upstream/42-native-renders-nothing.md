# ios/render: an exported app renders a BLANK SCREEN for a minimal valid component — everything upstream of the render is provably correct

**One line.** A one-component project, lint-clean, exported with `despia export ios`, builds and
launches and shows **nothing at all** — no content, no diagnostic card, no kernel log — while
runtime instrumentation proves the component table is populated, the entry names it, and
`StackComponents.resolve` finds it.

**Severity.** This is the native lane's floor. No DSX app can render on iOS through `despia
export` today.

**Environment.** `dev@ca71178d` (current, with the style-value plane and the four export fixes
from the export-blockers issue). Xcode 26.6, iOS 26.2 simulator, iPhone 17 Pro. Reproduced
identically on an iPad Pro 13-inch (M5).

---

## Reproduce

A whole project — three files, no CSS, no modules, no origin:

```
Probe/
  dsx.config.json   { "name": "Probe", "entry": "Probe", "outDir": "dist" }
  dsx.json          { "name": "probe", "scheme": "probe", "version": "0.1.0" }
  App.json          { "name": "Probe", "entry": { "root": "/", "surfaces": ["probe.Probe"] } }
  Components/Probe.dsx
```

```xml
<vstack background="#FF0000" grow="true" padding="24" spacing="12">
  <text value="HELLO" fontSize="34" fontWeight="bold" color="#FFFFFF"/>
  <stack width="120" height="120" background="#00FF00"/>
</vstack>
```

```
despia lint --strict   →  1 files · 0 errors · 0 warnings · 0 notices
despia export ios      →  0 module(s), 1 component(s)
xcodebuild             →  ** BUILD SUCCEEDED **
launch                 →  a blank white screen, indefinitely
```

Reduced further to a single `<text value="HELLO" fontSize="40" color="#FF0000"/>` as the whole
document: **also blank**. There is no smaller case.

## What is provably NOT wrong

Instrumented in the generated `AppDelegate`, immediately after `ModuleRegistry.shared.boot()`:

```
DSXPROBE channel=simulator isTest=yes
DSXPROBE kernelTables.stackComponents=1
DSXPROBE   component name=Probe scheme=probe bytes=207
DSXPROBE entry.root=/ surfaces=1
DSXPROBE   surface view=probe.Probe id=probe.Probe timeoutMs=15000
DSXPROBE resolve(probe.Probe) = FOUND
```

So: the channel is a test channel (diagnostics armed), the component table is loaded, the root
plan has exactly one normalized candidate naming that component, and the component **resolves**.
Everything the render depends on is in place. The defect is at or after `RouterHost`'s frame-0
mount.

## What makes it hard to see

- **No diagnostic card.** `flagsUnresolved` fires for any capitalized or dotted tag on a test
  channel, so an unresolved entry would show the kernel's red card. It does not appear — correctly,
  since the tag resolves — which removes the one signal a developer would get.
- **No kernel log.** `KernelLogBuffer` is armed (`isTest=yes`) and nothing from the router,
  the root-plan fold, or the readiness sink reaches the system log. `log show` filtered to the
  process contains no `router-settle`, no `root.failed`, no candidate trace.
- **The settle timeout does not rescue it.** `timeoutMs=15000`; the screen is still blank at 34s,
  and no timeout/advance is logged.

Net effect: a completely silent blank screen with every diagnostic the kernel owns reporting
healthy.

## Suspected area

`RouterHost` frame-0 mount / the root-plan fold (`root-plan.md`: "Ready = the existing
frame-settle (`screen.ready` for frame 0), read as STATE by the Router's observe sink"). A plain
markup candidate appears never to be revealed or never to settle — but the absence of any router
logging means this is inference, and the owner will see it faster than I can.

## Why it went unnoticed

`OpenSource/Engine/Package.swift` declares two targets and **no `testTarget`** — the Swift kernel
has no automated render coverage in the open package. The Android host takes a different path
entirely (`MainActivity` mounts `StackRootView` directly, with no Router and no root plan), so the
two twins do not exercise the same code.

## Suggested direction

1. Fix the frame-0 mount / fold.
2. **Make the silence impossible**: if the fold has a live candidate that resolved and has not
   settled, say so on a test channel — the diagnostic card already exists and this is exactly the
   state it should describe ("`probe.Probe` mounted, never settled, advancing in 15000ms").
3. A smoke gate: export the minimal project above, build headless, launch, and assert a non-blank
   frame. It is ten lines of CI and it pins the floor.
