# modules: there is no declared cross-platform key-value storage, so nothing can be remembered across launches

**One line.** `global.*` is in-memory and dies with the page; the module catalogue has no
`storage` / `prefs` / `kv` scheme; so anything a template wants to remember across launches
has no portable home.

**Environment.** `dev@92b844b0`. Found in the short-drama flagship adding recent searches.

**What is missing.** The skills say "Haptics, storage, camera: everything native is a module
call" — naming a capability that has no module. There is no `dsx.module.storage.*`, and
`has('storage')` answers for a scheme that does not exist.

**What needs it, in one ordinary app.**

- recent searches
- a playback-speed preference
- an onboarding-seen flag
- "continue watching" position when the viewer is signed out
- a dismissed-banner flag

None of these belong on a server, all of them are expected by users, and all of them are one
line in every other app framework.

**Why a template cannot reach for `localStorage`.** It would make one renderer behave
differently from the other three, which Article 7 forbids without a named degradation. So the
honest options are (1) do without, (2) name the degradation in the UI. This template does (1)
plus (2): recent searches are session-scoped and the screen says so in place.

**The ask.** A declared `storage` module with the shape the platforms already have underneath
— `get(key)`, `set(key, value)`, `remove(key)`, `keys()` — mapping to `UserDefaults`,
`SharedPreferences` and `localStorage`, with a documented size expectation and a documented
"this is not secure storage" note so nobody puts a token in it.
