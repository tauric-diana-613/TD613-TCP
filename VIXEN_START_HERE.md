# Vixen Cybernetics · START HERE (PR #1730)

**Scoped operator quickstart for coding agents.** Root `AGENTS.md` controls authority. This document is a **navigation graph**, not an alternate copy of the underlying research or a release warrant. **Provenance discipline ≠ inventory clutter.** Do not duplicate original corpora, archived judgments or generated screenshots to make an agent guide.

## Five-minute entry

1. Inspect the live PR HEAD, current worktree and diff; never reset to a remembered SHA. Draft branch: `research/vixen-dual-estate-encyclopedia-20261108`. Preserve newer commits and independent worktrees.
2. Read root `AGENTS.md` and `app/encyclopedia/vixen-estate/AGENTS.md` before edits. Then open `app/encyclopedia/vix-cyb.html`, the main page/route/controls host.
3. Source of truth for live browser execution: HTML module tags at the **end** of `vix-cyb.html`, imported ES modules under `vixen-estate/`, and CSS loaded in the HTML head. Do not treat historical JSON manifests embedded in HTML as the actual current module list.
4. Preserve Antigravity-owned desktop/mobile PNG and yellow-eyed SVG in `app/encyclopedia/assets/vixen/`. Do not regenerate or modify these during optical engineering.
5. Run targeted tests and syntax checks. Compare current-source Chromium screenshots at 1440×900 and 390×844 against the operator-approved Glinda-Cybergoth design, and inspect actual live motion. GREEN proves scoped contracts, not artistic success.

## Active runtime ownership graph

| Surface | Primary visual/motion owner | Secondary or parked | Main source |
|---|---|---|---|
| Overview, Works, Gates, Methods, Refusals, Folios | Living Mesh (non-source visual atmosphere) | Foyer pointer one-shot on Overview | `vixen-live-mesh-rgi13.mjs`, `vixen-foyer.mjs` |
| Observatory | Electric Foundry, WebGL2 or Canvas2D fallback, host-owned RAF | Legacy Observatory Canvas loop **parked** after Foundry mounts; Living Mesh parked | `observatory-electric-foundry.mjs`, `observatory-foundry-renderer.mjs`, `observatory-computational-score.mjs` |
| Salon / Collection | Folded Cuirass compositor, 39-carrier field, one RAF | Its ambient field **paints in the same frame**; full-page Living Mesh borrows that clock with no second RAF; legacy opaline/veil routes are rollback only | `synthesis-salon.mjs`, `vixen-folded-cuirass.mjs`, `vixen-salon-ambient-field.mjs` |
| Shared mathematical kernel | D₃ / φ fields, finite carrier/RGI15 optical coefficients | Input only, never a clock, source attribution or authority | `observatory-foundry-kernel.mjs`, `vixen-beat-radiometry-rgi15.mjs` |

**Live cross-room adapter:** `VixenLivingMesh.renderHostFrame` shares the current owner's phase and throttles the global canvas to one host-driven paint per 180 ms. It creates no requestAnimationFrame. Observatory default remains OFF, preserving its independent WebGL2/Canvas2D instrumentation; opt in by setting `document.body.dataset.vixenOpticalMeshObservatory='on'` and call `VIXEN_ELECTRIC_FOUNDRY.renderOnce()` for an intentional paused preview.

The **global Still** button is `#motionBtn`. Its current action sets `body[data-vixen-motion]`, sends `vixen:motionchange`, and applies a CSS animation hold. `vixen-motion-governor.mjs` maps active owners and exposes read-only `window.VIXEN_MOTION_GRAPH.status()`. Every active RAF owner must independently honor global Still, reduced motion, hidden-page state, room visibility, and explicit Rest. A paused source selection/probe may cause **one intentional still-frame repaint**, never restart continuous motion. There is no entitlement for two independently ticking effects in one room.

## What is retained, what is active, what is unproven

- `vixen-salon-light.mjs` and `vixen-opaline-couture-rgi14.mjs` remain for declared legacy rollback. Their presence in the tree does not imply they are live alongside folded chrome.
- `vixen-live-mesh-rgi13.mjs` contains the whole-page mesh used outside the two independently owned optical rooms; its own RAF parks on Salon and Observatory. The Salon now calls `renderHostFrame({time,sourceIds,electrodes,view,force})` from the folded-cuirass clock, with three strictly bounded seam electrodes derived from actual material geometry, while Observatory can opt in through `data-vixen-optical-mesh-observatory="on"`. This reuses visual operators without equating independent research engines.
- Observatory's vector-score canvas is composited within the Foundry's host clock. A usable room-specific *opt-in* cross-room light adapter is prospective, not automatically active.
- Source evidence and scientific holds live in the retained `artifacts/vixen-dual-estate/VIXEN_OPTICAL_TRIBUNAL_FINAL_20261112.md` and the original design commission. Neither guide nor UI graphics can create empirical acquisition or human acceptance.
- The approved design is dramatically luminous, electrical, refractive and spatially unified. The earlier batched chrome capture had significantly flatter highlights than the approved exhibit; newer amendments adjust spectral opacity and concentrate finite waist/beam emission. Judge the exact-head Chromium capture, not this document, to qualify the current state. Treat that as an **OPEN VISUAL DEFECT**. Do not report “finished” solely from color interpolation, refraction math, or CI.

## Fast repair loop

```sh
git fetch --all --prune
git status --short --branch
git log -5 --oneline
node --test tests/vixen-motion-graph.test.mjs tests/vixen-room-optics.test.mjs tests/vixen-room-radiance.test.mjs tests/vixen-folded-cuirass.test.mjs tests/vixen-salon-ambient-field.test.mjs tests/vixen-electric-foundry.test.mjs tests/vixen-rgi13-mesh.test.mjs tests/vixen-synthesis-salon.test.mjs
node --check app/encyclopedia/vixen-estate/vixen-folded-cuirass.mjs
node --check app/encyclopedia/vixen-estate/observatory-electric-foundry.mjs
git diff --check
```

Then run the repository's broader Actions workflow and retrieve its current-head Chromium witness artifact. Check desktop/mobile pixel evidence, actual p95 frame cost, Still/Rest and reduced-motion frame counters, source selection, DPR resize and page navigation. Verify deployed bytes against PR head **before** claiming the public preview is updated. Vercel deployment is separately authorized and currently locked; PR remains draft.

## No-clutter disposition rule

Classify each candidate for deletion as **ACTIVE**, **CONDITIONAL/ROLLBACK**, **HISTORICAL EVIDENCE**, **UNREFERENCED CANDIDATE**, or **VERIFIED DEAD** with import references, code-path evidence and predecessor. Never infer deadness from a filename. Prefer a short index or direct import correction over copies, reserialized manifests, automatic renames or historical deletion. Propose archival removal separately for human adjudication.

**OPERAHOUSE ≠ OPERA ≠ PERFORMER.** Source body, Work identity, human gates, 32 Works, 53 manifestations, 21 methods, original authorship uncertainty and scientific holds remain distinct. No main merge, flight, deployment, scientific promotion or artistic closure without an explicit operator act. 𝌋
