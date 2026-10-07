# TD613 · Sequence 6 · Tranche 3
## Loom → Marrowline → Native Return: End-to-End Journey Integration
### Minimum Surviving Product Provenance & Journey Architecture Report

```text
Sequence:         6
Tranche:          3
Branch:           staging/sequence-6-integration-20261006
Parent SHA:       1f3a520f248e107530843bb6b613e707b94a2306
Visual Language:  Haute Couture Tectonic Federalism (Option C)
Candidate Status: SEQUENCE_6_REST_2 = MINIMUM_SURVIVING_PRODUCT_PROVEN (RECOMMENDED)
Date:             October 7, 2026
```

---

## 1. Executive Summary & Purpose

Tranche 3 embodies the surviving relation set into one complete, unbroken, governed product journey:

```text
LOOM ORIGIN
  → EXPLICIT OUTBOUND AUTHORIZATION (INV-01..04)
    → MARROWLINE CONTINUATION (RFC 8785 PARITY)
      → RETURN / RE-ENTRY (RECEIVER != ADMISSION)
        → RECEIPT INSPECTION (CALM MONOSPACE)
          → LAWFUL STRUCTURAL REST (𝄐)
```

The minimum surviving vertical slice proves that the TD613 architecture preserves state, route identity, chronological ordering, custody distinctions, and operator agency across the actual product journey without route amnesia, without authority laundering, and without aesthetic collapse.

---

## 2. Core Architecture & Route-State Model

### 2.1 The Five Visual Jurisdictions in Product Form
1. **Living Field (`living_field`)**: Active relational motion in Loom Origin and Marrowline Continuation. Driven by the sovereign animation coordinator clock. Carriers manifest Mugler-tailored silk curves, structural berths, and kinetic depth gains.
2. **Authorization Boundary (`authorization_boundary`)**: Active solely when crossing governed egress. Defaults to `EXTERNAL CARRIAGE // CONFIGURED RECEIVER` under INV-01..04. Issue #691 detached delegation gate triggers **only** when `actor_class === 'DETACHED_DELEGATED'`.
3. **HOLD (`hold`)**: Actionable, dignified posture when forward passage is restrained by missing, tampered, or contradictory evidence. Exposes explicit deficit diagnostics with three actionable gestures: `[INSPECT DEFICIT]`, `[RETRY]`, and `[ABORT JOURNEY]`.
4. **Receipt Inspection (`receipt_inspection`)**: Calm, monospace Aperture register displaying `[OBSERVED]`, `[DERIVED]`, and `[HELD]` badges. Zero radar cosplay. Monotonic predecessor verification and RFC 8785 canonical confirmation.
5. **Structural Rest (`structural_rest` 𝄐)**: Authentic resolution of kinetic obligation upon explicit local ledger admission. Settles the 39-carrier field. Not success confetti.

### 2.2 Three-Tier Temporal Non-Retroactivity (INV-11 Embodied)
To prevent retrospective rewriting of history, the journey engine maintains three strictly distinct immutable state layers:
- **`earlier_observed_state`**: Deep-frozen snapshot of initial task, selected shareable documents, traveling rules, and genesis anchor prior to outbound handoff.
- **`later_return_state`**: Deep-frozen snapshot of the response received from Marrowline, containing answer text, used source IDs, open missing items, and terminal head digest.
- **`current_reconstructed_state`**: Synthesized projection computed from earlier observations and later returns without mutating or overwriting earlier records.

```text
LATER_DISCOVERY != EARLIER_OBSERVATION
CURRENT_RECONSTRUCTION != HISTORICAL_REWRITE
```

---

## 3. Authority Laws & Invariant Custody

1. **Authority Separation**:
   ```text
   EXTERNAL_PROVIDER_CARRIAGE != DETACHED_OPENAI_DELEGATION
   INTERACTIVE_OPERATOR_DIRECT != DETACHED_DELEGATION
   AMARI_CONNECTOR_AUTHORITY != DETACHED_DELEGATION
   ```
2. **Qualifying Outbound Carriage (INV-01..04)**:
   - **INV-01 (Default-Deny)**: Outbound authorization is closed (`null`) by default.
   - **INV-02 (Explicit Authorization)**: Requires contemporaneous human operator prompt / gesture.
   - **INV-03 (Ephemeral Single-Shot)**: Tokens are single-shot and time-bounded. Once consumed for handoff, they are immediately marked `SPENT` and cannot be reused for duplicate sends.
   - **INV-04 (Fresh Reauthorization on Return)**: Outbound authorization is closed upon return. Re-entry requires fresh explicit operator gesture to admit into local ledger. No standing authority!
3. **Route Memory Law**:
   ```text
   ROUTE_MEMORY != AUTHORITY_MEMORY
   ```
   Restoring route memory across page reloads, tab restores, or back/forward navigation recovers route breadcrumbs, selected task contexts, and audit receipts, but strictly initializes outbound authorization to `null` (closed).
4. **Return Custody Distinction**:
   ```text
   RECEIVER_LOCAL_STATE != LOOM_ADMISSION
   RETURNED_CANDIDATE != ADMITTED_DESCENDANT
   SUCCESSFUL_IMPORT != SCIENTIFIC_VALIDATION
   ```
   Returned candidates from Marrowline wait at the Loom threshold in `RECEIPT_INSPECTION` until explicit local admission is gestured.
5. **Canonicalization Parity**:
   ```text
   OUTBOUND_CANONICALIZATION == REENTRY_CANONICALIZATION
   ```
   Both outbound payload encoding and return digest verification use RFC 8785 deterministic JCS via `canonicalizeJson`. Lone surrogates, sparse arrays, and non-finite numbers immediately trigger HOLD (`RETURN_CANONICALIZATION_FAILED`).

---

## 4. Predecessor Chain & Terminal Head Verification

The journey incorporates `app/engine/governed-event-chain.js`:
- **Genesis Anchor**: `computeGenesisDigest({ sessionId, initialCommitSha, routeIdentity })` with `TD613-GENESIS\x00` domain separation.
- **Predecessor Binding (INV-05)**: Every transition event links cryptographically to the predecessor digest using `TD613-EVENT-v1\x00` domain prefix.
- **Chronological Monotonicity**: Rejects any event where recording time precedes earlier events or where declared measurement occurs in the future.
- **Terminal Head Verification**:
  - Anchored Match: If an expected head digest is supplied and matches computed head $\to$ `ANCHORED_MATCH`.
  - Anchored Mismatch: If an expected head digest is supplied and differs $\to$ `ANCHOR_MISMATCH` $\to$ transitions to `HOLD`.
  - Unanchored Return: If no expected head digest is supplied $\to$ surfaces `UNANCHORED` explicitly without fabricating anchor integrity.

---

## 5. Audit of Known Historical Journey Defects (Section X)

| Historical Journey Issue | Audit Finding & Current Status |
| :--- | :--- |
| **Mobile Send Reachability (~390px)** | **CONFIRMED RESOLVED & VERIFIED**. Full composer, inputs, and Send button are within accessible viewport at 390px. Verified in `tests/dome-world-marrowline-mobile.test.mjs` and browser capture `browser-journey-390px-portrait.png`. |
| **Loom Arrival Overlay Blocking Interaction** | **CONFIRMED RESOLVED & VERIFIED**. In `marrowline-loom-pocket.js`, arrival sets `aiaPocketOpen = false` and `hidden = true`. Context arrives staged in a pocket `＋` menu; main chat is never covered or blocked. Includes explicit close / return affordance. |
| **Attachment Preview / Inspection** | **CONFIRMED PRESENT**. Attachments tray supports review and removal prior to message send. Verified in `marrowline-attachment-quality.test.mjs`. |
| **Receipts Routing / Snapping** | **CONFIRMED RESOLVED & VERIFIED**. Receipts route cleanly to Receipt panel with monospace diagnostics; verified in `marrowline-receipt-routing-contract.test.mjs`. |
| **Receiver-local "Admitted" Language** | **CONFIRMED CLEAN**. Marrowline receiver displays local receipt state; does not imply Loom ledger admission. Loom re-entry explicitly states `RECEIVER_LOCAL_STATE != LOOM_ADMISSION`. |
| **Modal Retention Meaning ("up to 45 days")** | **CONFIRMED ENFORCED**. In `ai-evidence-review.js`, `ai-projects.js`, and `demo-contract.js`, modal qualifiers ("up to 45 days") are strictly preserved as contractual ceilings, rejecting any assertion of guaranteed persistence. |
| **Fee Comparison Subtotal vs Total** | **CONFIRMED ENFORCED**. `ai-project-checks.js` explicitly distinguishes 12-month stated fee totals from individual subscription line items. |
| **Clear Conversation Empty Phantom Thread** | **CONFIRMED RESOLVED & VERIFIED**. Empty placeholder is pruned on clear; verified in `marrowline-threads.test.mjs`. |
| **Selecting Conversation Reordering** | **CONFIRMED RESOLVED & VERIFIED**. Read-only conversation selection preserves activity order; verified in `marrowline-thread-recency.test.mjs`. |
| **Bottom Action Row (`↻ ⧉ ✕ 𖠿`)** | **CONFIRMED PRESENT & FUNCTIONAL**. Wired in `marrowline-desktop-repair.js` with confirmation dialog and home return. |
| **Raw Markdown / Unsafe Render Leakage** | **CONFIRMED SAFE**. Safe HTML sanitization and pre-wrap rendering enforced via `renderSafeMarkdown`. |

---

## 6. Single Animation Sovereignty & 39-Carrier Field

### 6.1 Animation Sovereignty
- Single animation owner: All kinetic rendering is subordinated to `AnimationCoordinator` (`renderDomeArt` / `generateJourneyPresentation`).
- Inactive views and static frames draw strictly zero extra loops.
- No secondary or rogue `requestAnimationFrame` timers exist in the bridge.

### 6.2 39-Carrier Field Preservation
Carrier classification preserves the canonical modular allocation across all jurisdictions and viewports:
- **Near (6)**: Modular indices `[0, 11, 13, 22, 26, 33]`
- **Mid (13)**: Modular indices `[4, 7, 8, 12, 14, 16, 20, 21, 24, 28, 32, 35, 36]`
- **Far (20)**: Remaining 20 datum pins
- **Total**: Exactly **39 carriers**.
- Preserved without deletion at 390px portrait mobile and under reduced motion.

---

## 7. Hostile Integration Test Suite Results

The dedicated integration test suite `tests/sequence-6-journey-integration.test.mjs` executes 21 comprehensive hostile cases:

```text
✔ 1. Normal successful round trip across all 6 journey stages (15.55ms)
✔ 2. Missing return evidence transitions to inspectable HOLD (0.70ms)
✔ 3. Tampered predecessor digest transitions to HOLD (INV-05) (0.91ms)
✔ 4. Terminal-head mismatch when anchored transitions to HOLD (0.99ms)
✔ 5. Unanchored return surfaces UNANCHORED explicitly without fabricating authority (0.89ms)
✔ 6. Stale route / invalid transition is rejected without corrupting state (0.43ms)
✔ 7. Retry after failure requires fresh authorization token and preserves deficit record (1.13ms)
✔ 8. Reload before Send retains draft without granting standing outbound authority (0.60ms)
✔ 9. Reload after Send preserves route memory but revokes Send authority (1.22ms)
✔ 10. Back navigation preserves event history and prevents retroactive rewriting (1.03ms)
✔ 11. Restored tab enforces clean authority closure (0.70ms)
✔ 12. Duplicate return is detected and does not rewind or corrupt the chain (1.19ms)
✔ 13. Contradictory receipt / non-monotonic timestamp triggers HOLD (INV-11) (0.55ms)
✔ 14. Canonicalization parity rejects lone surrogates into HOLD (0.50ms)
✔ 15. Long response is bounded, preserved, and verified (0.94ms)
✔ 16. Attachment present is bound into earlier observed state (0.28ms)
✔ 17. Reduced motion preserves all 39 carriers in static calm frame (0.92ms)
✔ 18. 390px portrait viewport preserves all 39 carriers and all 3 depth planes (1.61ms)
✔ 19. Structural rest settles motion without erasing history or acting as confetti (3.19ms)
✔ 20. Return from HOLD offers actionable recovery options (0.59ms)
✔ 21. Issue #691 detached delegation gate conditional behavior (0.27ms)
```

**Overall Test Suite Status**:
- `tests/governed-event-chain.test.mjs`: **13 PASS / 0 FAIL**
- `tests/flowcore-semantic-motion-bridge.test.mjs`: **13 PASS / 0 FAIL**
- `tests/sequence-6-journey-integration.test.mjs`: **21 PASS / 0 FAIL**
- **Total Combined**: **47 PASS / 0 FAIL** (192ms execution time).

---

## 8. Durable Browser Witnesses

Durable browser PNG screenshots were captured using headless Chrome (`C:\Program Files\Google\Chrome\Application\chrome.exe`) driven by `scripts/capture-sequence-6-journey-witnesses.mjs` against the live local server at `http://localhost:6140`:

| Witness File Name | Evidence Class | Viewport | Size (Bytes) | Description |
| :--- | :--- | :--- | :--- | :--- |
| `browser-journey-loom_origin-desktop.png` | `BROWSER_VIEWPORT_WITNESS` | 1280x800 | 221,607 | Loom Origin active state, 39 carriers gathering field, prompt, selected files |
| `browser-journey-authorization_boundary-desktop.png` | `BROWSER_VIEWPORT_WITNESS` | 1280x800 | 230,308 | Outbound Authorization Boundary under INV-01..04 with configured receiver |
| `browser-journey-marrowline_continuation-desktop.png` | `BROWSER_VIEWPORT_WITNESS` | 1280x800 | 224,969 | Marrowline Continuation chamber with model release and predecessor binding |
| `browser-journey-hold-desktop.png` | `BROWSER_VIEWPORT_WITNESS` | 1280x800 | 198,110 | HOLD jurisdiction: inspectable evidence deficit and actionable recovery options |
| `browser-journey-returned_candidate-desktop.png` | `BROWSER_VIEWPORT_WITNESS` | 1280x800 | 183,709 | Returned candidate waiting at Loom threshold; receiver local != Loom admission |
| `browser-journey-receipt_inspection-desktop.png` | `BROWSER_VIEWPORT_WITNESS` | 1280x800 | 183,709 | Receipt Inspection jurisdiction with [OBSERVED], [DERIVED], [HELD] calm monospace |
| `browser-journey-structural_rest-desktop.png` | `BROWSER_VIEWPORT_WITNESS` | 1280x800 | 209,080 | Structural Rest 𝄐 with kinetic obligation resolved and historical records preserved |
| `browser-journey-390px-portrait.png` | `SIMULATED_390PX_BROWSER_CAPTURE` | 390x844 | 46,563 | Simulated 390px mobile viewport: all controls reachable, 39 carriers preserved |
| `browser-journey-reduced_motion-desktop.png` | `BROWSER_VIEWPORT_WITNESS` | 1280x800 | 228,783 | Reduced motion static calm view: all 39 carriers preserved without animation |

*Honesty Notice on Evidence Classification*:
`SIMULATED_390PX_BROWSER_CAPTURE` is an automated headless browser viewport simulation.
`PHYSICAL_DEVICE_WITNESS = UNPERFORMED`.

---

## 9. Journey Files Modified and Reused

### Reused Existing Journey Machinery:
- `app/dome-world/holonomy-loom/ai-workspace.js`
- `app/dome-world/holonomy-loom/ai-handoff.js` & `ai-handoff-base.js`
- `app/dome-world/holonomy-loom/reentry-workspace.js` & `returned-session-review.js`
- `app/dome-world/holonomy-loom/animation-coordinator.js`
- `app/dome-world/marrowline-loom-import.js` & `marrowline-loom-import-base.js`
- `app/dome-world/marrowline-loom-demo.js`
- `app/dome-world/marrowline-loom-pocket.js`
- `app/dome-world/marrowline-desktop-repair.js`
- `app/dome-world/marrowline-living-chat.js`

### Created / Hardened in Tranche 3:
- `app/engine/sequence-6-journey.js`: Complete end-to-end journey integration engine.
- `app/engine/governed-event-chain.js`: Hardened for isomorphic browser and Node execution.
- `app/dome-world/sequence-6-journey.html`: Integrated interactive product journey surface.
- `tests/sequence-6-journey-integration.test.mjs`: 21 comprehensive hostile integration tests.
- `scripts/capture-sequence-6-journey-witnesses.mjs`: Browser screenshot automation script.
- `research/sequence-6-surviving-relations/05-TRANCHE_2C_DIRECTORS_CUT_SYNTHESIS.md`: Corrected stale HOLD diagram berth indices.
- `research/sequence-6-surviving-relations/witnesses/witness-manifest.json`: Updated with 9 journey browser captures.

---

## 10. Candidate Milestone Recommendation

```text
SEQUENCE_6_REST_2 = MINIMUM_SURVIVING_PRODUCT_PROVEN
Recommendation: ADMITTED / RECOMMENDED
```

**Rationale**:
1. The minimum surviving vertical slice is proven end-to-end in code, tests, and durable browser captures.
2. Authority laws (INV-01..04), single-shot tokens, and clear separation between default carriage and Issue #691 detached delegation are rigorously enforced.
3. Predecessor chain integrity and RFC 8785 canonicalization parity are verified.
4. Route memory survives interruption without resurrecting outbound authority (`ROUTE_MEMORY != AUTHORITY_MEMORY`).
5. Temporal non-retroactivity is embodied in three immutable state records (`LATER_DISCOVERY != EARLIER_OBSERVATION`).
6. Haute Couture Tectonic Federalism is embodied across all five jurisdictions without aesthetic degradation.
7. All 47 tests pass cleanly.

**Stop & Rest Boundary**:
No push to main. No deployment. No modification of issue #405. Work remains sealed on `staging/sequence-6-integration-20261006`.
