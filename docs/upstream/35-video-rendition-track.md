# elements: `<video>` can select neither a RENDITION nor a TRACK, so the whole category's player controls are unbuildable

**One line.** The element census gives `<video>` `subtitles` and `pip` as booleans — both real
— but nothing to choose a quality rendition or an audio/subtitle LANGUAGE, which are the two
controls every app in this category ships.

**Environment.** `dev@92b844b0`. Measured in the short-drama flagship auditing the player.

**What it cost us, stated plainly.** This template had shipped a 240p–1080p ladder and an
eleven-language picker against those absent attributes. A viewer chose "1080p" or "Tamil" and
got whatever the asset happened to be. Worse, **1080p carried a VIP tag** — a paywall on a
control with no effect, which is the one thing a monetisation reference must never
demonstrate. Both controls are now removed; Quality survives as a disabled readout naming what
the build actually does (Article 7, the AdGate precedent):

> Quality — *Adaptive — one rendition in this build*

**Why the absence is easy to ship against.** Nothing errors. The attribute is simply ignored,
the picker's state changes, the UI updates, and the video keeps playing. It looks like it
works, on every platform, forever.

**The ask.** `quality` and `track` on `<video>`, with a **typed absence** when the source is a
single rendition — so an app can tell the difference between "no ladder available" and "ladder
available, none selected", and can offer the control the whole category offers instead of
deleting it.

**Adjacent, same file.** A language picker in this category means two different things: the
content track (this issue) and the app's own chrome (`dsx.global.strings`, which is declared
and works). Worth saying so in the docs, because the first is what users mean and the second
is what an author can reach today.
