# lint/web: a bare `{{ var }}` fragment inside a compound style attribute is silently discarded

**One line.** `style="{{ dsx.variable.shell }}; height: 100%"` drops the `{{ var }}`
fragment with no diagnostic — `parseStyleAttr` splits on `;` before interpolation, the
colon-less fragment fails the declaration test and is skipped — while the whole-attribute
spelling `style="{{ dsx.variable.shell }}"` is a first-class door (`__style_list`).

**Environment.** Measured at `dev@ae0669ad` (compiler `cssmap.ts` `parseStyleAttr`;
`dom/mount.ts` whole-attribute style hole), while restyling the short-drama flagship.

**Repro.**
```xml
<variable as="shell" computed="true">return 'max-width: 1400px; margin-left: auto; margin-right: auto'</variable>
<vstack style="{{ dsx.variable.shell }}; height: 100%">   <!-- shell VANISHES; height applies -->
<vstack style="{{ dsx.variable.shell }}">                 <!-- works: the declaration-list door -->
```
Observed live: the extras applied, the shell's centering/gutters silently gone — the
layout collapse reads as a renderer bug until the split order is known.

**Why it bites.** The two spellings look like the same feature. An author who has seen
`style="{{ list }}"` work will compose `"{{ list }}; one-more"` and lose the list with
zero feedback — lint passes, build passes, SSR passes.

**The ask (either):**
1. lint: flag a `style=""` containing a top-level `{{ … }}` fragment with no `:` beside
   other declarations — "this fragment is discarded; use one computed list or move it to
   its own element";
2. or make the parser interpolation-aware for that shape (expand the fragment before the
   `;`-split), which would make the natural spelling just work.

The template's idiom meanwhile: compound lists are ONE computed value used as the whole
attribute (AGENTS.md).
