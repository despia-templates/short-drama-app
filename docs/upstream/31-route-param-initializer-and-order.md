# router: a route param is unreadable from a `<variable>` initializer, and a bare route declared before its parameterised sibling captures the URL

**One line.** Two route-table surprises, one screen, both silent: a param read at mount time
comes back empty, and route ORDER decides which URL is written to history even when the
content comes from the other route.

**Environment.** `dev@92b844b0`. Measured in the short-drama flagship building a Browse screen
at `/browse` and `/browse/:genre`.

---

### (a) A plain `<variable>` initializer runs before the param is in scope

```xml
<!-- reads EMPTY at mount -->
<variable as="active">return vars.genre == null ? '' : vars.genre</variable>

<!-- correct -->
<variable as="active" computed="true">return vars.genre == null ? '' : vars.genre</variable>
```

`/browse/Revenge` server-rendered **"All series"** with no error anywhere. The same
`vars.genre` interpolates correctly in markup and resolves in a computed; moving the read into
`computed="true"` fixed it outright.

The reference documents params as readable "in markup AND in action bodies". An initializer is
neither, and nothing says so — so the failure is a screen that renders the wrong content
confidently.

**Ask.** Either make params available to initializers, or make reading one there a lint error.

---

### (b) A bare route declared before its parameterised sibling captures the URL

With `/browse` declared BEFORE `/browse/:genre`, navigating to `/browse/Revenge`:

- rendered the RIGHT screen — genre bound, 2 series listed;
- wrote the history URL as **`/browse`**.

So a reload, a back, or a shared link showed something different from what the viewer was
looking at. Declaring the parameterised route first fixed it.

**Ask.** A table whose ORDER changes which URL is written, while the content comes from
another route, should be either order-independent or a validation error at build time. The
current behaviour is the worst of the three: it works, until someone reloads.
