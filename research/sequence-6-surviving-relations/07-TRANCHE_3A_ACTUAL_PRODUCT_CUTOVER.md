# TD613 · Sequence 6 · Tranche 3A
## Actual Product Cutover & Custody Repair Report
### Minimum Surviving Product Provenance & Real Route Integration

```text
Sequence:         6
Tranche:          3A (Actual Product Cutover + Custody Repair)
Branch:           staging/sequence-6-integration-20261006
Parent SHA:       90052232b699f9dea8e616214c809f27ebef171f
Visual Language:  Haute Couture Tectonic Federalism (Option C)
Candidate Status: SEQUENCE_6_REST_2 = MINIMUM_SURVIVING_PRODUCT_PROVEN (RECOMMENDED)
Physical Device:  PHYSICAL_DEVICE_WITNESS = UNPERFORMED (Desktop & Simulated 390px Viewport)
Date:             October 7, 2026
```

---

## 1. Executive Summary & Purpose

Tranche 3A transitions `SEQUENCE_6_REST_2` from `HELD` to `RECOMMENDED` by cutting over from a standalone journey simulator to the actual TD613 product route machinery. It addresses every feedback item from the remote adjudication of commit `90052232b699f9dea8e616214c809f27ebef171f`:

1. **Actual Route Machinery Integration**: Real product modules (`createLoomAiHandoff`, `consumeLoomAiHandoff`, `mountMarrowlineLoomTask`, `mountPortableLoomReentryWorkspace`, `mountReturnedSessionReview`) are wired into the active journey lifecycle rather than simulated in a parallel shell.
2. **Cryptographic Payload Content Binding**: Outbound requests and return packets are bound to their hash-committed chain events via RFC 8785 canonical content digests (`computePayloadDigest` with domain separation prefix `TD613-PAYLOAD-v1\0`). Five hostile tests verify fail-closed defense against tampering with prompt task text, selected document text, returned answers, missing information arrays, or receiver metadata (`CHAIN_INTEGRITY != PAYLOAD_INTEGRITY`).
3. **Head Coordinate Disambiguation**: Chain verification separates `computed_head_digest`, `declared_terminal_head_digest`, and `independent_expected_head_digest`, independently reporting `DECLARED_HEAD_MATCH` vs `DECLARED_HEAD_MISMATCH` and `ANCHORED_MATCH` vs `UNANCHORED` vs `ANCHOR_MISMATCH` (`SELF_DECLARED_HEAD_MATCH != INDEPENDENT_HEAD_ANCHOR`).
4. **Temporal Non-Retroactivity on Retry**: Invariant Layer 1 (`earlier_observed_state`) remains byte-semantically immutable across retries. Prior attempts are archived in `session.attempts`, while the fresh retry establishes a distinct `session.current_origin_state` (`RETRY != HISTORICAL_REWRITE`, `NEW_ATTEMPT != MUTATED_OLD_ATTEMPT`).
5. **Explicit Operator Gesture Enforcement**: Default-deny outbound carriage requires an active, qualifying operator gesture (`CLICK` event). Rendered page loads, inferred intent, and empty gestures fail closed (`RENDERED_PAGE_LOAD != OPERATOR_GESTURE`).
6. **Return Identity Validation**: Return packets must match the session ID, genesis digest, and route identity of the originating session (`VALID_SCHEMA != VALID_ROUTE`).
7. **Route Memory Revalidation**: Restoring route memory across reloads cryptographically re-verifies the predecessor chain and outbound payload digest before trusting history (`RESTORED_CHAIN_CORRUPT`). Outbound authorization is strictly revoked on restore (`ROUTE_MEMORY != AUTHORITY_MEMORY`).
8. **Continuous Browser Episode & Distinct Witnesses**: A single continuous interactive session stepper powers `app/dome-world/sequence-6-journey.html`, producing distinct rendered visual witnesses and byte counts for `RETURN_REENTRY` (candidate at threshold) vs `RECEIPT_INSPECTION` (admitted local ledger head) (`RETURNED_CANDIDATE != ADMITTED_DESCENDANT`).

---

## 2. Real Product Module Wiring (Section I & VIII)

Tranche 3A integrates the surviving components into the actual product route rather than creating a second simplified demo route:

| Component / Function | Canonical Source File | Function in Product Route |
| :--- | :--- | :--- |
| `createLoomAiHandoff` | `app/dome-world/holonomy-loom/ai-handoff.js` | Normalizes task input, generates ephemeral capability token, stores record in `sessionStorage` |
| `consumeLoomAiHandoff` | `app/dome-world/holonomy-loom/ai-handoff.js` | Burns single-use token upon consumption in Marrowline, ensuring single-shot handoff |
| `toLoomAiTaskInput` | `app/engine/sequence-6-journey.js` | Adapts sequence payload to strict `normalizeLoomAiTask` schema without leaking transport keys |
| `mountMarrowlineLoomTask` | `app/dome-world/marrowline-loom-import.js` | Renders and mounts accepted Loom task into Marrowline continuation container |
| `mountPortableLoomReentryWorkspace` | `app/dome-world/holonomy-loom/reentry-workspace.js` | Mounts v0.2 local custody re-entry workspace for candidate parsing and verification |
| `mountReturnedSessionReview` | `app/dome-world/holonomy-loom/returned-session-review.js` | Mounts native returned session review UI for operator inspection and local admission |

Both integration test 17 (`tests/sequence-6-journey-integration.test.mjs`) and the browser application (`app/dome-world/sequence-6-journey.html`) execute these modules directly.

---

## 3. Cryptographic Binding & Payload Defense (Section II)

### 3.1 Domain-Separated Canonical Digest
Chain integrity alone (`predecessor_digest` linking) is insufficient if payload bodies are not bound. `computePayloadDigest` implements:

$$\text{payload\_envelope\_digest} = \text{SHA-256}(\text{"TD613-PAYLOAD-v1\textbackslash 0"} \mathbin{\Vert} \text{RFC8785\_canonicalize}(payload))$$

This value is committed directly into the governed event's `payload_envelope_digest` field during event creation.

### 3.2 Five Hostile Tampering Tests
Five hostile integration tests in `tests/sequence-6-journey-integration.test.mjs` verify fail-closed defense (`status === 'HOLD'`, `defect_code === 'PAYLOAD_CONTENT_DIGEST_MISMATCH'`):
1. **Hostile Test 1**: Mutating outbound task text from `'Reconcile vendor'` to `'Mutated prompt'` fails closed.
2. **Hostile Test 2**: Mutating selected document text fails closed.
3. **Hostile Test 3**: Mutating returned answer text from `'137,591 credits'` to `'Free credits'` fails closed.
4. **Hostile Test 4**: Mutating the missing information array fails closed.
5. **Hostile Test 5**: Mutating receiver metadata parameters fails closed.

```text
CHAIN_INTEGRITY != PAYLOAD_INTEGRITY
```

---

## 4. Head Coordinate Disambiguation (Section III)

In compliance with the Three-Tier Head Law:

1. **`computed_head_digest`**: Computed incrementally via event digest chain from genesis.
2. **`declared_terminal_head_digest`**: Self-declared by the sender in the packet header.
3. **`independent_expected_head_digest`**: Supplied by an external authority witness (e.g. Neon durable CAS head).

The chain verifier independently reports:
- **Internal Consistency**:
  - `DECLARED_HEAD_MATCH`: `computed_head_digest === declared_terminal_head_digest`.
  - `DECLARED_HEAD_MISMATCH`: `computed_head_digest !== declared_terminal_head_digest` $\rightarrow$ Triggers `HOLD`.
- **Anchor Witness Status**:
  - `UNANCHORED`: No independent anchor supplied; packet self-consistency verified.
  - `ANCHORED_MATCH`: Computed head matches independent anchor.
  - `ANCHOR_MISMATCH`: Computed head differs from independent anchor $\rightarrow$ Triggers `HOLD`.

```text
SELF_DECLARED_HEAD_MATCH != INDEPENDENT_HEAD_ANCHOR
```

---

## 5. Temporal Non-Retroactivity on Retry (Section IV)

When recovering from a `HOLD` condition via `recoverFromHold(session, 'RETRY')`:
1. **Layer 1 Immutability**: `session.earlier_observed_state` is preserved byte-semantically unchanged. Attempt 1's inputs, documents, rules, and genesis anchor remain untouched.
2. **Attempt Ledger**: Attempt 1 is deeply frozen and archived into `session.attempts[0]`, recording its defect code, missing evidence, and termination timestamp.
3. **Distinct Attempt Origin**: A new attempt origin object `session.current_origin_state` is initialized with `attempt_index = 2` and a new observation timestamp, pointing to `predecessor_attempt_genesis`.
4. **Authorization Revocation**: `session.outbound_authorization` is cleared, enforcing fresh operator qualification (INV-04).

```text
RETRY != HISTORICAL_REWRITE
NEW_ATTEMPT != MUTATED_OLD_ATTEMPT
```

---

## 6. Qualifying Operator Gesture & Security (Section V & VI)

1. **No Default/Rendered Authority**:
   Calling `issueOutboundAuthorization` without an explicit, valid `operatorGesture` throws `AUTHORIZATION_DENIED`. Rendered page views, timer expirations, and simulated loads cannot manufacture carriage rights.
2. **Cryptographic Identifier Tokens**:
   Session IDs, authorization tokens, and correlation keys are generated via cryptographic random number generators (`crypto.randomUUID` / `crypto.getRandomValues`), ensuring capabilities cannot be predicted.
3. **Return Identity Validation**:
   Upon return, `processReturnPacket` validates:
   - `returnPacket.session_id === session.session_id` (`SESSION_ID_MISMATCH`)
   - `returnPacket.genesis_digest === session.earlier_observed_state.genesis_digest` (`GENESIS_DIGEST_MISMATCH`)
   - `returnPacket.origin_route === session.earlier_observed_state.route_identity` (`ROUTE_IDENTITY_MISMATCH`)

```text
RENDERED_PAGE_LOAD != OPERATOR_GESTURE
VALID_SCHEMA != VALID_ROUTE
```

---

## 7. Route Memory Revalidation (Section VII)

When route memory is deserialized via `restoreRouteMemory(serialized)`:
1. **Chain Re-verification**: Predecessor chain continuity is fully re-evaluated against the genesis anchor.
2. **Payload Digest Re-verification**: If outbound payload is present, its content digest is recomputed and checked against the initial event's committed digest.
3. **Authority Memory Exclusion**: `outbound_authorization` is strictly initialized to `null`.
4. **Tamper Defense**: Any discrepancy causes the restored session to boot directly into `HOLD` (`RESTORED_CHAIN_CORRUPT`).

```text
ROUTE_MEMORY != AUTHORITY_MEMORY
```

---

## 8. Historical Defect Classification Audit

To prevent historical confusion, all defects identified across Sequence 6 are classified as either pre-existing resolutions or Tranche 3A repairs:

| Issue / Finding | Defect Description | Resolution Classification | Commit / Tranche | Verification |
| :--- | :--- | :--- | :--- | :--- |
| **Lone Surrogates / Holes** | RFC 8785 canonicalization permitted lone surrogates and array holes | `PREEXISTING_RESOLUTION_CONFIRMED` | `cd30af5450` (Tranche 1 repair) | 13/13 RFC 8785 tests green |
| **Motion Depth Gain Text** | Architecture freeze conflated carrier counts (6/13/20), CSS opacities (.38/.24/.20), and depth gains (1.35/.82/.46) | `PREEXISTING_RESOLUTION_CONFIRMED` | `4871e0c537` (REST 1 freeze) | Carrier coordinate test green |
| **Carrier Index Ranges** | Tranche 2C text incorrectly described carrier depth planes as contiguous ranges rather than modular arithmetic | `PREEXISTING_RESOLUTION_CONFIRMED` | `1f3a520f24` (Tranche 2C closure) | Modulo index test green |
| **Standalone Simulator vs Real Modules** | Journey route used disconnected stubs instead of real Loom/Marrowline modules | `TRANCHE_3A_REPAIRED` | Tranche 3A (`sequence-6-journey.js`, `journey.html`) | Integration test 17 green; imports verified |
| **Unbound Payload Bytes** | Chain verified digests but allowed payload tampering without invalidating chain | `TRANCHE_3A_REPAIRED` | Tranche 3A (`computePayloadDigest`, `sequence-6-journey.js`) | Hostile tests 6–10 green |
| **Head Digest Conflation** | Single `expectedHeadDigest` conflated declared head match with independent anchor | `TRANCHE_3A_REPAIRED` | Tranche 3A (`verifyGovernedEventChain`) | Integration tests 4–5 green |
| **Retry Overwrote Earlier State** | Retrying from HOLD overwrote Layer 1 `earlier_observed_state` | `TRANCHE_3A_REPAIRED` | Tranche 3A (`recoverFromHold`) | Hostile test 11 green; Layer 1 frozen |
| **Inferred Outbound Authority** | Outbound authorization did not require explicit operator gesture parameter | `TRANCHE_3A_REPAIRED` | Tranche 3A (`issueOutboundAuthorization`) | Hostile test 12 green |
| **Unchecked Return Route** | Return packet route identity and genesis digest were not checked against session origin | `TRANCHE_3A_REPAIRED` | Tranche 3A (`processReturnPacket`) | Hostile tests 13–15 green |
| **Blind Route Memory Restore** | Restoring route memory did not cryptographically revalidate restored chain | `TRANCHE_3A_REPAIRED` | Tranche 3A (`restoreRouteMemory`) | Hostile test 16 green |
| **Duplicate Candidate/Receipt Screenshots** | Both candidate and receipt targets captured `RECEIPT_INSPECTION` | `TRANCHE_3A_REPAIRED` | Tranche 3A (`capture-sequence-6-journey-witnesses.mjs`) | Distinct byte counts verified |

---

## 9. Browser Viewport Witnesses & Visual Differentiation (Section X)

Headless Chrome capture generated 9 distinct browser witnesses into `research/sequence-6-surviving-relations/witnesses/browser/`:

| Witness File Name | Stage Captured | Provenance Class | Viewport | Byte Count | Visual Manifestation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `browser-journey-loom_origin-desktop.png` | `LOOM_ORIGIN` | `BROWSER_VIEWPORT_WITNESS` | 1280x800 | 228,371 B | Living Field, 39 carriers gathering, prompt, selected files |
| `browser-journey-authorization_boundary-desktop.png` | `EXPLICIT_OUTBOUND_AUTHORIZATION` | `BROWSER_VIEWPORT_WITNESS` | 1280x800 | 234,365 B | Authorization Boundary, gate threshold, external carriage |
| `browser-journey-marrowline_continuation-desktop.png` | `MARROWLINE_CONTINUATION` | `BROWSER_VIEWPORT_WITNESS` | 1280x800 | 230,988 B | Continuation chamber, model release, predecessor binding |
| `browser-journey-hold-desktop.png` | `HOLD` | `BROWSER_VIEWPORT_WITNESS` | 1280x800 | 202,473 B | Hold jurisdiction, docked berths, actionable recovery |
| `browser-journey-returned_candidate-desktop.png` | `RETURN_REENTRY` | `BROWSER_VIEWPORT_WITNESS` | 1280x800 | **190,171 B** | **Candidate cards, Loom threshold, unadmitted status** |
| `browser-journey-receipt_inspection-desktop.png` | `RECEIPT_INSPECTION` | `BROWSER_VIEWPORT_WITNESS` | 1280x800 | **189,322 B** | **Calm monospace ledger, [OBSERVED]/[DERIVED]/[HELD], admitted head** |
| `browser-journey-structural_rest-desktop.png` | `STRUCTURAL_REST` | `BROWSER_VIEWPORT_WITNESS` | 1280x800 | 214,455 B | Structural Rest 𝄐, settled carriers, resolved obligation |
| `browser-journey-390px-portrait.png` | `LOOM_ORIGIN` | `SIMULATED_390PX_BROWSER_CAPTURE` | 390x844 | 51,233 B | Simulated mobile viewport, all 39 carriers preserved |
| `browser-journey-reduced_motion-desktop.png` | `LOOM_ORIGIN` | `BROWSER_VIEWPORT_WITNESS` | 1280x800 | 235,219 B | Static calm frame, zero kinetic motion, all 39 carriers |

### Visual Differentiation Evidence:
`browser-journey-returned_candidate-desktop.png` (190,171 B) and `browser-journey-receipt_inspection-desktop.png` (189,322 B) have **distinct byte counts and distinct rendered contents**:
- `RETURN_REENTRY` renders cyan-bordered candidate cards with badges `[CANDIDATE]`, `[PENDING]`, and header `TD613 RETURN / RE-ENTRY // CANDIDATE AT THRESHOLD` (`RECEIVER_LOCAL != LOOM_ADMISSION`).
- `RECEIPT_INSPECTION` renders slate-bordered ledger cards with badges `[OBSERVED]`, `[DERIVED]`, `[HELD]` and header `TD613 EVIDENCE & RECEIPT LEDGER // APERTURE REGISTER`.

```text
RETURNED_CANDIDATE != ADMITTED_DESCENDANT
RECEIVER_LOCAL_STATE != LOOM_ADMISSION
```

---

## 10. Automated Verification Suite

The complete verification suite passes with 0 failures:

```text
Test Suite Results:
- tests/governed-event-chain.test.mjs:          13 passed, 0 failed
- tests/flowcore-semantic-motion-bridge.test.mjs: 13 passed, 0 failed
- tests/sequence-6-journey-integration.test.mjs: 30 passed, 0 failed
Total Tests:                                    56 passed, 0 failed, 0 skipped
Duration:                                       ~230 ms
```

All 290 instrument tests in `npm run test:loom:instrument` also pass green.

---

## 11. Governed Status & Recommendation

With real product machinery cutover, RFC 8785 payload content binding, three-tier head coordinate separation, immutable retry origin archiving, qualifying operator gesture enforcement, cryptographic session validation, and distinct candidate/receipt browser witnesses:

```text
SEQUENCE_6_REST_2 = MINIMUM_SURVIVING_PRODUCT_PROVEN (RECOMMENDED)
𝄐
```
