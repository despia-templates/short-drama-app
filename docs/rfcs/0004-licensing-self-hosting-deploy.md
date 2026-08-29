# RFC 0004 — Licensing disclosure, self-hosting lanes, and the deploy link

> **Status: DRAFT.** Targets: framework docs (the disclosure rule + self-host guide),
> despia-platform (the deploy-link flow — private repo, spec'd here as a contract),
> despia-templates org (badges in the index).

## 1 · The facts on the ground (read from dev@92b844b0, not invented)

- The kernel + Web packages + docs + Skills + Conformance are **open** (public
  `despia-native/despia`, Apache-2.0; kernel MIT per the v4 identity doc). Managed deployment
  (Despia Cloud) is commercial.
- Every module carries `shelf: "open"` (85 today) or `shelf: "premium"` (34 — AdMob,
  RevenueCat, OneSignal, OneSignalLiveActivity, Stream, PowerSync, AppsFlyer…).
  **VerticalPlayerStack: `open`.**
- Templates themselves: Apache-2.0, always (they are training data and demand generation —
  rfcs/0002 §7).

## 2 · The disclosure rule (the whole "source available?" question, made mechanical)

A template never *states* its licensing; the validator **computes** it from the dependency
walk (RFC 0001 §3) and the index renders it:

> **Short Drama** · template: Apache-2.0 · runs on: open kernel + 9 open modules +
> **4 premium modules** (AdMob, RevenueCat, OneSignal+LiveActivity) · web+server:
> 100% open · optional services: AdMob, RevenueCat, OneSignal accounts

Rules: premium modules must be **optional or degradable** (Article 7) wherever the product
allows — this template runs (no ads lane, no IAP lane, push absent) with all four premium
modules excluded; the economy then falls back to everything-free. That degradation is
tested, because "you can self-host the open parts" must be a checked claim, not a slogan.

## 3 · Self-hosting lanes (one honest table, shipped in every template README)

| Lane | What you run | License cost |
|---|---|---|
| **Web + backend** | `dsx build` → deploy the emitted Worker to your own Cloudflare (or Node/Deno bootloader on your metal); media on R2 + any HLS origin (the template's CDN base is config; the Stream encode worker is swappable) | **$0 — fully open** |
| **Native, open modules only** | build the app with premium modules excluded (`excluded.json`), your own certs, c7-self-hosted-ota for updates | **$0 — fully open** |
| **Native, full experience** | premium module suite (ads, IAP, push, live activities) via Despia build/plan | commercial |
| **Hosted (default)** | Despia editor end-to-end: build, deploy, OTA, dashboard — free tier on your own Cloudflare | free / paid tiers |

The self-host guide each template must include: prerequisites, `settings.example.env`,
deploy commands per lane, the exclusion recipe, and what degrades (named, per Article 7/10).

## 4 · The deploy link (the contract despia-platform implements)

`https://despia.com/new?template=github:despia-templates/short-drama-app@1.0.0`

1. Resolve the tag (registry mechanics: SHA + tree hash pinned; official shelf = verify the
   release signature).
2. Read `dsx.json template` block → render title/summary/shelf disclosure → **one consent
   screen** (the studio-apps consent register: rows + the sentence + an inert button until
   agreed).
3. **Cloudflare OAuth** → the user's own account (infrastructure-ownership law:
   the customer owns the substrate from minute one; Workers + D1/DB + R2 + Stream
   provisioned there, not on Despia's account).
4. Execute `template.setup` in order: deploy → seed → optional service connects (each
   skippable; skipped = degraded per §2, shown honestly: "Ads disabled until AdMob is
   connected").
5. Land in the editor with the app LIVE (web URL working, demo content playing) + the Manage
   surface populated + next-steps checklist (store provisioning when they want native).

Free tier: web + DIY native for open-shelf usage — priced $0 because the compute is the
user's own Cloudflare. The platform work: OAuth broker, provisioning calls, setup-step
runner, progress UI. **The template's only obligation is the declared block** — any future
substrate (the kernel names no cloud) reuses the same contract.

## 5 · Store/legal hygiene (inherited, not per-template)

Privacy manifests + data-use declarations derive from the consumed modules' manifests;
AdMob/ATT consent flows ship in the Consent module lane; template docs link the
store-provisioning skill for the click-by-click. Nothing in a template may embed a
third-party SDK outside the module system (that would be an undisclosed shelf row —
the validator catches the attempt at the dependency walk).
