# export: four defects, each of which alone makes `despia export ios` produce an app that cannot run

**One line.** Taking the short-drama flagship through `despia export ios` for the first time hit
four separate blockers in sequence — two that stop the build, one that produces an unlaunchable
bundle, and one that makes every exported app boot to the kernel's red "failed to render" card.
None of them is project-specific: they fire for any project.

**Status.** All four fixed in `dev@0ea4481e`. Filed for the record, the conformance rows, and
because the failure signatures are worth writing down — three of the four point somewhere else.

**Environment.** `dev@621b8dc5` → `0ea4481e`, `packages/cli/src/export.ts`. Xcode 26.6,
iOS 26.2 simulator, iPhone 17 Pro.

---

### 1 · Components were collected NON-RECURSIVELY, so a nested folder vanished from native

`listDsx()` read the top level of `Components/` only, while `build.ts` (the web lane) walks the
tree with `listFiles()`. Two lanes, two different answers to "what are this project's
components".

Measured: this project keeps its shared pieces in `Components/parts/` — nav bar, tab bar, search
overlay, ad gate, plans sheet. `despia build` reports **18 components**; `despia export ios`
reported **12**. The six missing ones are exactly the folder. Nothing warned; the only signal was
a lower number in a line nobody compares.

The app then boots and fails to resolve its own `<TopNav>`.

**Fixed** by walking recursively. A component is addressed by BASENAME, so two files with the
same basename in different folders are now an explicit error rather than last-one-wins — a
silent shadow is the same class of bug.

### 2 · The bridging header was exported but never put on the header search path

`App/Bridging.h` does `#import "DSXObjCException.h"`. That header IS copied (it lands in
`Kernel/`), but nothing adds `Kernel` to `HEADER_SEARCH_PATHS`, and a `.h` that is not a build-file
member does not reach the project header maps. Every export failed to compile:

```
error: bridging header dependency scanning failure:
  App/Bridging.h:6:9: fatal error: 'DSXObjCException.h' file not found
```

**Fixed** with `HEADER_SEARCH_PATHS = "$(inherited) $(SRCROOT)/Kernel"` on both configurations.

### 3 · The generated Info.plist had no identity keys, so the product was not a launchable bundle

The target sets `GENERATE_INFOPLIST_FILE = NO`, which means Xcode injects nothing — the file is
the whole plist. The generated one declared display name, version and orientations, and **no
`CFBundleExecutable`, `CFBundleIdentifier`, `CFBundleName` or `CFBundlePackageType`**.

The failure signature points nowhere near the cause:

```
appintentsnltrainingprocessor error: Unable to parse Info.plist
Command AppIntentsSSUTraining failed with a nonzero exit code
** BUILD FAILED **
```

— which reads as a Siri-metadata step misbehaving, not "your app has no identity". `plutil -p` on
the built bundle is what actually shows it.

**Fixed** by declaring the identity keys with the documented build-variable spellings
(`$(EXECUTABLE_NAME)`, `$(PRODUCT_BUNDLE_IDENTIFIER)`, `$(PRODUCT_NAME)`,
`$(PRODUCT_BUNDLE_PACKAGE_TYPE)`, `$(MARKETING_VERSION)`, `$(CURRENT_PROJECT_VERSION)`), plus
`UISupportedInterfaceOrientations~ipad` with all four orientations — an iPad app that is not
`UIRequiresFullScreen` must support them.

### 4 · The generated host never called `ModuleRegistry.shared.boot()`, so the component table was empty

This is the one that matters most. `Module.swift` documents `boot()` as *"call synchronously at
the very top of `didFinishLaunching`"* — it is the class walk that installs the BUILD TABLES
(`KernelTables`, the component table among them) and then registers modules. `DSXBoot.boot`
does **not** call it, and the generated `AppDelegate` called only `DSXBoot.boot(present:)`.

So `KernelTables.stackComponents` was never filled, `StackComponents.didBootstrap` — a `let`,
evaluated once — read an empty table, and every component reference resolved to nil. The app
launches to the kernel's red card:

> `<shortdrama.App/>` failed to render — Malformed markup or a missing component

Isolated: repointing the entry at a different, much simpler component produced the identical
card, which is what proves it is the table and not the template.

**The diagnostics actively mislead here.** Tapping the card opens the Diagnostics panel, which
reports **"No issues — Every shipped template parsed and registered"**, 0 errors, 0 kernel log
lines. All true and all useless: zero templates failed to parse because zero templates were ever
loaded. A panel that distinguishes "nothing failed" from "nothing was loaded" would have turned a
long bisection into one glance — worth a follow-up on its own.

**Fixed** by calling `ModuleRegistry.shared.boot()` first in the generated `AppDelegate`.

**The Android twin does NOT have this bug**, which is why it went unnoticed: the generated
`DespiaApp.onCreate` registers components explicitly (`registerBundledComponents()` parses each
asset and calls `ComposeStackComponents.defineNode`) rather than relying on the class walk. Two
hosts, two different registration strategies, one of them missing its step. Worth converging.

---

**Verified after all four.** `despia export ios` → 18 components → `xcodebuild` **BUILD
SUCCEEDED** → launches on the simulator → the entry component mounts and renders → the app's
`<api url="/catalog/home">` resolves against the App.json origin and reaches a live server
(observed as a real request on an instrumented origin). The remaining gap is layout parity, which
is a separate matter and a template problem, not an export one.

**Suggested follow-up.** A smoke gate: export the framework's own demo project, build it headless
with `xcodebuild`, boot it, and assert the entry surface renders rather than the diagnostic card.
Three of these four would have been caught by the build step alone, and the fourth by the assert.
