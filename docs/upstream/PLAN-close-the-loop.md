# Closing the feedback loop: DSX web to React/Next parity

**Thesis.** DSX's model is not harder than React; its FEEDBACK LOOP is. 12 of the 18
defects filed this program fail silently. React's advantage is not the language — it is
that the browser is both runtime and inspector, and the framework warns loudly in dev.
Everything below is aimed at one outcome: **a DSX author can never lose work silently.**

## The four laws we are implementing

1. **Nothing is dropped silently.** Every declaration, attribute and fragment that does
   not reach the DOM says so — at build time if it is knowable statically, at runtime in
   dev if only the browser can judge it.
2. **The browser is the oracle.** For CSS validity we do not maintain a list; we set the
   property and read it back. Authority beats a lookup table that rots.
3. **Dev is loud, production is silent and lean.** Every check folds away under the
   existing `__DSX_OPTIONAL_*` pattern, exactly like React's `NODE_ENV` warnings.
4. **A warning names the fix, not just the fault.** Message = what was dropped, why, and
   the spelling that works.

## Work items (this session)

| # | Item | Closes | Where |
|---|---|---|---|
| P1 | Lint: a `{{ }}` fragment in a compound `style=""` is discarded | #231 | `compiler/src/lint.ts` |
| P2 | Runtime strict mode: every dropped CSS declaration warns in dev | the unknown-property class | `dom/src/mount.ts` + `compiler/src/cssmap.ts` |
| P3 | Router: mount exactly ONE frame per route | #233 | `dom/src/boot.ts` / `router.ts` |
| P4 | `<image>` width/height emit like `<video>`'s | #223 | `dom/src/*` element factory |
| P5 | `toWire` releases on subtree exit (a DAG is not a cycle) | #221 | `server/src/actions.ts` |
| P6 | Project design-system declaration honoured by review | #230 #232 | `cli/src/review.ts` |

Deferred (need conformance-corpus changes across three renderers, not one session):
#218 stored-null truthiness, #219 bracket-read mutation, #220 explicit-null create.

## Definition of done

- Each item has a test in the package's own runner, and the existing suites stay green.
- The short-drama template re-verifies against the changed framework.
- Anything not finished is filed with its diagnosis, never left implied.
