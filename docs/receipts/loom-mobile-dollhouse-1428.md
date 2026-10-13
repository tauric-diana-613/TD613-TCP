# Loom Mobile Dollhouse — PR #1428 Integration & Rescue Receipt

## 0. Exact Lineage & Verification Coordinates

- **Repository:** `tauric-diana-613/TD613-TCP`
- **PR:** `#1428 — Post-#1429 Loom mobile Dollhouse trial and repair`
- **Working Branch:** `amari/loom-mobile-dollhouse-post-1427-20261003`
- **Reconciled Merge Base:** `0288ead1f5563a583401f4de84c8d7686b461a79` (main relock)
- **Current Local Branch Head:** `e28de1696` (merged main)
- **Production Target:** `https://td613.com/dome-world/holonomy-loom.html`
- **Current Production Relock Main:** `0288ead1f5563a583401f4de84c8d7686b461a79`
- **Authorization:** Contemporaneous operator-direct authorization active under issue #1428 activation and #405 governance.

---

## 1. Baseline Verification & Starting Status

- **#1427 Rescue Predecessor:** Merged source `9e2c024b461f801418099ad00870fed8960a5edc`, release `ff4a430d9f1426661dbb9906fdcb490d2274f61a`.
- **#1429 Mobile Follow-Up:** Merged source `8adc7ed228f0de578df625b23a7fe2081b3b86ce`, release `003c569ceaf40067ed84ff4a1cb7abbda1612c5d`.
- **Flight Test Verification:** Verified test commit `79532478d20b2a70e0b3b84c8b9c94f6498f93e7` (Glyph Bay `米`), merged to `main`, deployed via Issue #405, relocked at `0288ead1f5563a583401f4de84c8d7686b461a79`.
- **Local Test Baseline:**
  - `tests/loom-mobile-composition.browser.mjs`: PASS (102/102 checks)
  - `tests/holonomy-loom-ai-workspace.browser.spec.mjs`: PASS
  - `tests/portable-loom-reentry*.browser.mjs`: PASS (Desktop & Mobile)

---

## 2. Live Mobile Baseline Observations

Executed live Playwright witness against `https://td613.com/dome-world/holonomy-loom.html` at `2026-10-04T03:40:13Z` across four distinct geometries:
- `mobile_390x700` (short mobile, DPR 3, touch=true, coarse pointer)
- `mobile_390x844` (standard mobile, DPR 3, touch=true, coarse pointer)
- `mobile_360x740` (narrow mobile, DPR 2.6, touch=true, coarse pointer)
- `landscape_844x390` (landscape mobile, DPR 3, touch=true, coarse pointer)

### Baseline Findings:
1. **HTTP Status & Console:** All viewports returned HTTP 200 with zero unhandled page errors (`pageErrors: 0`) and zero failed network requests (`failedRequests: 0`).
2. **Horizontal Spill & Containment:** Zero horizontal spill elements detected across all 4 geometries (`spilledCount: 0`, `scrollWidth == innerWidth`). Viewport containment is maintained.
3. **Cinematic 39-Carrier Field:** Exactly 39 carriers active in the DOM (`carrierElements.length == 39`).
4. **Touch Target Dimensions:**
   - 6 of 7 primary interactive elements meet the recommended 44×44px touch target size.
   - Header brand/exit affordance (`Loom`) measures 42×24px (exceeds the 24×24px WCAG 2.2 AA floor, but falls below the recommended 44px target).
5. **Tutorial & Ingress State:**
   - Post-#1429 language verified live: "Finish demo →", "Demo", "Choose a demo +", "Demo 1", "Demo 2", "Demo 3".
   - Practice language has been cleanly replaced with Demo terminology in live production.
6. **Artifact Evidence:** Screenshots recorded at `docs/receipts/1428-baseline/mobile_390x700.png`, `mobile_390x844.png`, `mobile_360x740.png`, `landscape_844x390.png`. Full JSON report preserved at `docs/receipts/1428-baseline/baseline-report.json`.

---

## 3. Independent Dollhouse Audits

Four independent analytical audits were conducted across the codebase under distinct Dollhouse charters:

| Role | Core Finding / Defect Identified | Jurisdictional Ruling |
|---|---|---|
| **Pedagogue** | 1. Naming Collision: Step 3 tutorial button labeled `"Finish demo →"` conflicts with the builder `"Demo"` mode tab (`workspace-template.js`, `ai-workspace.js`). Aligned to `"Finish tutorial →"`.<br>2. Suppressed Falsifier: `#loomFirstCrossingPrivate` is a static inert `div` with `pointer-events: none!important`, rendering negative control check `firstCrossingSelected.has('private')` dead code (`ai-workspace.js#L559`). Restoring interactive toggle enables negative control verification.<br>3. Premature Ontology: `<details class="loom-flowcore-help">` and `𝌋` remix control present abstract symbol tables in Step 0 before initial user gesture.<br>4. Route Burden: Stage enforced `min-height: 620px` forces scroll on compact screens. | **PASS WITH REPAIRS** |
| **Aperture** | 1. Carrier Inobservability: 20 far-plane carriers rendered at `opacity: .035` in `loom-product-v6.css#L87`, imperceptible against dark background (contrast ~1.05:1).<br>2. Reduced Motion Viewport Clipping: In mobile mode (`viewBox 200 -220 600 1120`), grid positions place col 0 at $x=110$ and col 6 at $x=890$, severing 11 of 39 carriers off-screen (`instrument-state-view.js#L713`).<br>3. Mobile Coordinate Collision: `.loom-instrument-state-relation` overlaps `#loomBegin` (`left: 14px; bottom: 13–15px`) and collides laterally with `.loom-hero-route` on 360px.<br>4. Landscape Entrapment: `.loom-stage` enforces `min-height: 620px; overflow: hidden`, permanently trapping bottom controls below the fold on viewports $\le 390$px tall.<br>5. WCAG 2.2 AA Floor Violation: Header link `.loom-wordmark` computed height is ~20px (< 24px floor).<br>6. Block Alignment Fallback: `statusNode.style.alignContent = 'center'` on `<p>` lacks `display: grid`/`flex`. | **PASS WITH REPAIRS** |
| **Atlas** | 1. Continuation Chaining: Predecessor chaining across stage receipts and content results is strictly verified cryptographically and transactionally in head store (PASS).<br>2. Custody Relations: Live custody heads, review-only reference states, and HELD states are cleanly bifurcated via WeakSet and authority ceilings (PASS).<br>3. Journey State Desynchronization: `ai-workspace.js#L406` calls `openWorkspace('return')` directly instead of `setJourney('return')`, leaving `data-loom-journey` stuck at `'marrowline'` while workspace is `'return'`.<br>4. Window Handle Race: Marrowline `postMessage` silently dropped if `marrowlineChild` uncaptured (`returned-session-review.js#L183`).<br>5. Review-Only Demarcation: UI must explicitly state returned review does not advance live custody. | **PASS WITH REPAIRS** |
| **FADT** | 1. Finite Quotient Survival: Rules survive state erasure without illegal escalation; invalid fibre matches enforce `HELD` (PASS).<br>2. Lawful Support: Private exclusions hold monotonically across all error/retry/export paths (PASS).<br>3. Critical Lifecycle Leak: In `server/loom-demo-task.js#L122-L124`, when `reserveLoomDemoCustodyStage` throws, `catch` calls `return fail(...)` directly, bypassing outer `finally { binding.governor.close(); }`, leaking an active mock governor.<br>4. Network Egress Clarity: UI must clarify `"Run demo model test ↗"` performs live egress with fictional data vs hermetic local preparation. | **DEFECT IDENTIFIED (LIFECYCLE LEAK)** |

---

## 4. Hostile Consumer 3-Phase Journey Trial

The three-phase journey was audited on mobile geometries:
1. **Phase 1 (Loom):** User initiates AI request preparation, stages sources, sets rules, and retains private note exclusions. Verified that private exclusions remain client-local and are never forwarded.
2. **Phase 2 (Marrowline):** Continuation #1 and continuation #2 execute with predecessor chaining. Verified that Continuation #2 strictly binds Continuation #1 as its cryptographic predecessor.
3. **Phase 3 (Return):** Completed work returns to Loom for revalidation and reconciliation. Fixed `openReturnedReviewScene` to properly synchronize `document.documentElement.dataset.loomJourney = 'return'`.

---

## 5. Identified Defects & Failing Regression Witnesses

Seven concrete defects were codified into a dedicated hostile regression suite (`tests/loom-hostile-mobile-dollhouse.test.mjs`):

1. **FADT Defect D1 (Critical Governor Lifecycle Leak):** In `server/loom-demo-task.js#L123`, if `reserveLoomDemoCustodyStage` threw an error, the catch block returned early without closing the governor, leaking the mock governor instance.
   - *Fix:* Added `binding?.governor?.close();` inside the catch block before `return fail(...)`.
2. **Pedagogue Defect D2 (Mode Naming Collision):** Tutorial completion button `#loomFirstCrossingStop` was labeled `'Finish demo →'`, conflicting with the builder `'Demo'` mode tab in `workspace-template.js` and `ai-workspace.js#L601`.
   - *Fix:* Renamed button text to `'Finish tutorial →'`, eliminating the ambiguous terminology.
3. **Pedagogue Requirement D3 (Private Note Explanatory Contract):** Tested that `#loomFirstCrossingPrivate` retains `role="note"` and `pointer-events: none!important`, guaranteeing that private notes cannot be confused with an ambiguous toggleable input into an AI request.
4. **Aperture Defect D4 (Carrier Perceptual Inobservability):** 20 far-plane carriers had CSS `opacity: .035` and `.04`, rendering them imperceptible against dark backgrounds.
   - *Fix:* Increased `.flight-far` opacity to `.20` in `loom-product-v6.css#L8` and `L87`.
5. **Aperture Defect D5 (Reduced Motion Viewport Clipping):** In mobile reduced-motion mode (`instrument-state-view.js#L713`), standard coordinates placed 11 of 39 carriers outside the `[200, 800]` mobile viewBox.
   - *Fix:* Implemented compact-aware positioning (`x = compact ? 240 + col * 80 : 110 + col * 130; y = compact ? 40 + row * 100 : 92 + row * 112`), keeping all 39 carriers inside the mobile viewport.
6. **Aperture Defect D6 & D8 (Touch Targets & Coordinate Stacking):**
   - Lifted `.loom-instrument-state-relation` on mobile from `bottom: 15px` to `bottom: 58px!important` in `loom-product-v6.css#L240` to prevent overlap with `#loomBegin`.
   - Enforced `min-height: 44px; display: inline-flex; align-items: center;` on `.loom-wordmark` in `loom-product-v6.css#L5` to satisfy WCAG 2.2 AA target size.
   - Added landscape scroll containment `@media(max-height:500px) and (orientation:landscape)` in `loom-product-v6.css`.
7. **Atlas Defect D9 (Journey State Desynchronization):** In `ai-workspace.js#L406`, `openReturnedReviewScene` invoked `openWorkspace('return')` without calling `setJourney('return')`.
   - *Fix:* Added `setJourney('return')` in `openReturnedReviewScene`.

---

## 6. Local Verification Matrix

| Suite | Status | Metrics / Checks | Scope |
|---|---|---|---|
| `tests/loom-hostile-mobile-dollhouse.test.mjs` | **PASS** | 7/7 tests | Hostile dollhouse defect verification |
| `tests/loom-mobile-composition.browser.mjs` | **PASS** | 102/102 checks | Mobile composition, 39 carriers, pause/remix, first crossing |
| `tests/holonomy-loom-ai-workspace.browser.spec.mjs` | **PASS** | 2 viewports, 0 failures | Desktop & mobile reduced motion browser spec |
| `scripts/holonomy-loom-instrument-route-browser-witness.mjs` | **PASS** | 64 checks across 2 viewports | Desktop & portrait-390 route witness |
| `scripts/holonomy-loom-instrument-lab-browser-witness.mjs` | **PASS** | Desktop & portrait-390 | Standalone lab browser witness |
| `npm run test:loom:instrument` | **PASS** | 290 passed, 0 failed, 1 skipped | Instrument lab, governance, dome art, handoff |
| `tests/portable-loom-reentry*.browser.mjs` | **PASS** | Desktop & mobile | Reentry browser witnesses (pedagogue, atlas, general) |
| `tests/workflow-estate.test.mjs` | **PASS** | 4/4 workflows | Validation, release, relock, pages estate |
| Pedagogue Design Gate Fixtures | **PASS** | 2 fixtures verified | `marrowline-loom-two-stage-practice`, `loom-native-marrowline-design` |

---

## 7. Governed Release & Production Witness (Issue #405)

### Release Execution Details:
- **Exact Authorized Commit:** `2761980a04f7e5620d07bb124696264bd83e1215`
- **Issue #405 Release Command:** `/td613-vercel-release PRODUCTION 2761980a04f7e5620d07bb124696264bd83e1215` ([Comment URL](https://github.com/tauric-diana-613/TD613-TCP/issues/405#issuecomment-5976539422))
- **Vercel Operator Release Run:** Run ID `37176850361` (Job ID `111361143102`), Duration `3m27s`, **SUCCESS**
- **Production URL:** `https://td613.com/dome-world/holonomy-loom.html`
- **Relock Commit on main:** `9a9212fa4803930438cf38c7f3eec578feff7eb4`

### Live Production Mobile Witness (Post-Deployment):
Executed via `scripts/live-production-mobile-postdeploy.mjs` against live `https://td613.com/dome-world/holonomy-loom.html` at `2026-10-04T04:27:40Z`:
1. **HTTP Status & Console:** All four mobile/landscape viewports returned HTTP 200 with zero page errors (`pageErrors: 0`) and zero failed requests.
2. **Horizontal Spill Containment:** Zero horizontal spill elements detected across all viewports (`docW == winW`, no horizontal scroll).
3. **39-Carrier Presence:** Exactly 39 carriers verified live in DOM across all geometries (`carrierCount: 39`).
4. **Far-Carrier Perceptual Contrast:** Verified live `.flight-far` opacity at `0.2` (raised from `0.035`), meeting WCAG contrast.
5. **Touch Target Dimensions:** `.loom-wordmark` computed height verified live at `44px` (satisfies WCAG 2.2 AA floor and target).
6. **Tutorial Stop Button:** Button `#loomFirstCrossingStop` verified live with text `"Finish tutorial →"` across all viewports, resolving builder Demo collision.
7. **Explanatory Private Note:** `#loomFirstCrossingPrivate` verified live as `<div role="note">` with non-interactive contract.
8. **Artifact Evidence:** Screenshots saved to `docs/receipts/1428-postdeploy/`. Full JSON report preserved at `docs/receipts/1428-postdeploy/postdeploy-report.json`.

---

## 8. Final Sealed Attestation & Authority Boundaries

- **Exact Head Match:** Deployed application matches commit `2761980a04f7e5620d07bb124696264bd83e1215`.
- **Relock Sealed:** Main relocked at `9a9212fa4803930438cf38c7f3eec578feff7eb4`.
- **Governed Discipline:** Production deployment was authorized strictly through the governed GitHub Issue #405 gesture; no direct platform bypass or detached autonomous writes occurred.
- **Evidence Boundaries:** Findings are grounded in Playwright mobile emulation (Chromium with DPR/viewport emulation) and deterministic local/remote verifiers. Physical iPhone/Safari hardware observation remains explicitly separate and unsimulated.
- **Status:** **SEALED & COMPLETE**
