# TD613 Repository Roadmap

𝌋‌ U+10D613

Roadmap generation: `v1.8 · Stretch 3 closed / Stretch 4 blocked`

Date: `2026-07-16`

Use with:

- [`docs/ASH_KEEP_BUILDOUT_LEDGER.md`](docs/ASH_KEEP_BUILDOUT_LEDGER.md)
- [`docs/ASH_LIFECYCLE_ORCHESTRATION.md`](docs/ASH_LIFECYCLE_ORCHESTRATION.md)
- [`docs/ASH_LIFECYCLE_PRODUCTION_DEMO_RECEIPT.md`](docs/ASH_LIFECYCLE_PRODUCTION_DEMO_RECEIPT.md)
- [`docs/ASH_CONSTITUTIONAL_CONVERGENCE_RECEIPT.md`](docs/ASH_CONSTITUTIONAL_CONVERGENCE_RECEIPT.md)
- [`docs/ASH_CUSTODIAN_RETURN_PRODUCTION_RECEIPT.md`](docs/ASH_CUSTODIAN_RETURN_PRODUCTION_RECEIPT.md)
- [`docs/ASH_KEEP_CHOIR_CALIBRATION_BINDING.md`](docs/ASH_KEEP_CHOIR_CALIBRATION_BINDING.md)
- [`docs/ASH_KEEP_CHOIR_CALIBRATION_RECEIPT.md`](docs/ASH_KEEP_CHOIR_CALIBRATION_RECEIPT.md)
- [`KNOWN_FAILURES.md`](KNOWN_FAILURES.md)

The ledger remains authoritative for maturity scoring. This roadmap records shipped architecture, packet state, operator approval gates, future order, and separately governed red lanes.

## Current Vector Posture

```text
component maturity after Stretch 3 closure = 237 / 375 · ≈63%
constitutional synthesis = 47 / 50 · production-demonstrated / evidence-bounded
Ash Keep = 54 / 55 · production-demonstrated
Ash lifecycle = 35 / 35 · production-demonstrated
Ash operator surface = 43 / 45 · production-demonstrated / two points retained
Custodian Return / Anisotropy = 35 / 35 · production-demonstrated / evidence-bounded
Choir = 44 / 70 · validation-gated / evidence-bounded
production-demonstrated workstreams = 4 / 9
validation-gated workstreams = 1 / 9
transport-capable workstreams = 0
```

The synthesis score remains orthogonal and must never be added to component maturity. Stretch 3 evidence closure adds no maturity points.

## Governing Distinctions

```text
readiness ≠ custody
custody ≠ authenticity
case binding ≠ truth
workspace visibility ≠ mutation eligibility
case selection ≠ case opening
case closure ≠ case deletion
saved fingerprint ≠ custody proof
local deletion ≠ external erasure
context receipt ≠ action authority
audit receipt ≠ lifecycle rank
derivative candidate ≠ release
release ≠ transport
local reconstitution ≠ total restoration
external projection ≠ Capsule disclosure
anisotropy comparison ≠ universal score
calibration eligible ≠ universal validity
Reader consensus ≠ truth
receipt verified ≠ result correct
hold state ≠ executable prohibition
replay verified ≠ Reader rerun
component maturity ≠ constitutional synthesis
constitutional synthesis ≠ production closure
Stretch 3 closure ≠ Stretch 4 authorization
```

# Shipped Constitutional Spine

## Dome-World Threshold And Quick Scan

The Dome Ash tab enters a threshold membrane. Arrival remains unpersisted. Quick Scan carries session-scoped readiness only.

## Ash Custody Root

L0 metadata-only and L1 browser-local commitment routes verify custody before a root enters the Case Map. A valid root changes `case_map_digest`; custody remains non-equivalent to authenticity or truth.

## Ash Keep Lifecycle

```text
ARRIVAL_UNPERSISTED
→ READINESS_OBSERVED
→ CUSTODY_ROOT_VERIFIED
→ CASE_BOUND
→ REBUILD_ELIGIBLE
→ RELEASE_ELIGIBLE
→ CONTINUITY_SEALED
```

Lifecycle production status remains `35 / 35 · IMPLEMENTED_PRODUCTION_DEMONSTRATED`.

## Constitutional Participation

```text
Flow-Core = bounded context, provenance, missingness, uncertainty, alternatives, abstention
Aperture = observation, admissibility, audit, route governance, anisotropy and calibration comparison
Hush = derivative candidate production
Custodian Return = isolated authorized reconstitution
Choir = external reconstruction-pressure and calibration instrumentation
```

```text
Flow-Core may contextualize; it may not create custody or action authority.
Aperture may audit and compare; it may not manufacture lifecycle rank or emit a universal score.
Hush may generate a derivative candidate; it may not release, persist, or transport by itself.
Custodian Return may reconstruct inside its sandbox; it may not mutate the live case or declare total restoration.
Choir calibration may bind verified receipts; it may not execute Readers, adjudicate truth, infer identity, release, transport, or command Ash.
```

# Stretch 1 — Closed

## Ash Constitutional Convergence Closure

```text
CLOSED
status: IMPLEMENTED_PRODUCTION_DEMONSTRATED / EVIDENCE_BOUNDED
observed_main_commit: 17f3d9d759a462d91c5db6d284f518fba10bd8f7
observer_run: 29458943541
evidence_artifact: 8360435416
evidence_artifact_sha256: sha256:f1d7069feca261db693c9db374daa8c3397b666e08f35a1c63be067afa07ec6a
```

Visible aftercare at `2c89b70e284562ebb6b842900ae1a1bd0b00f6e6` stabilized save confirmation without moving maturity or replacing the production receipt.

# Stretch 2 — Closed

## Custodian Return And Anisotropy

```text
CLOSED
status: IMPLEMENTED_PRODUCTION_DEMONSTRATED / EVIDENCE_BOUNDED
implementation_main_commit: 2dc2d1c72a3fdd50094184717906e3d0469e0947
closure_main_commit: 62a4756e2ad38ec89c3eeaf2f532bf2f5676979b
Custodian_Return_run: 29473322517
lifecycle_and_convergence_run: 29473333298
```

The closed circuit verifies return-ready continuity, isolated sandbox recovery, the full failure matrix, purpose-shaped external projection, and componentwise anisotropy without live-case mutation, provider execution, recipient transport, Cinder action, lifecycle promotion, or a universal score.

# Stretch 3 — Closed

## Choir Calibration Receipt Binding

```text
CLOSED
status: IMPLEMENTED_VALIDATION_GATED / EVIDENCE_BOUNDED
implementation_main_commit: 14c6c144d796213d9aa9995f30cbaf3a3ebb268b
closure_main_commit: bd118da4862bdd0334111d3ba9ed8878daf2976c
implementation_PR: 354
aftercare_PR: 355
Choir_validation_run: 29476772041
Choir_validation_artifact: 8366852051
Choir_validation_artifact_sha256: sha256:fabdcabd323206d5637cac776ef1203e7a4fb65398b0e1333786ed415fa7e80c
lifecycle_and_convergence_run: 29476786363
lifecycle_and_convergence_artifact: 8366875739
lifecycle_and_convergence_artifact_sha256: sha256:cfa8f15f8a9afa3a85b867baf68ddb115324ffa14f269e25e2a572d9cdbc168e
```

Closed circuit:

```text
current verified custody-bound Case Map
+ current verified Route Memory
+ verified Moiré assay receipts
+ verified Reader provenance receipts
+ verified Reader Disagreement Ledger
+ verified Matched Benign Control Bank
→ exact Reader-set and digest-reference binding
→ source-drift and evidence-completeness checks
→ componentwise matched-control evidence
→ Choir Calibration Binding Receipt
→ replay without Reader re-execution
```

Derived states remain:

```text
CALIBRATION_ELIGIBLE
TAMPER_HOLD
STALE_CASE_HOLD
SOURCE_DRIFT_HOLD
RECEIPT_REFERENCE_HOLD
NOT_ENOUGH_TEST_DATA
```

The Stretch 3 boundary rejects free top-level calibration assertions. The first aftercare packet repaired an observer-only case-list repaint race and established `Ash Choir Calibration Validation` as a first-class main commit status. Product deletion authority and the canonical convergence probe remained unchanged.

```text
universal calibration score  null
Reader execution              0
provider calls                0
network calls                 0
storage mutation              0
release authority             0
recipient transport           0
Cinder action                 0
prediction authority          0
automatic hold                0
automatic Ash action          0
```

# Stretch 4 — Blocked

## Hush Vocabulary Externalization And Lifecycle-Bound Intervention Ensemble

```text
BLOCKED / NOT_AUTHORIZED
status: PACKET_UNBUILT
fresh_operator_gesture_required: true
```

Stretch 3 closure establishes that its own packet is complete. It does not silently authorize Hush work.

# Ordered Program Roadmap

1. **Stretch 1 · Ash Constitutional Convergence Closure — CLOSED.** Composition, Authority Context, invalidation, case states, deletion, contention, compatibility, event routing, responsive behavior, and deployed observation are evidence-closed.
2. **Stretch 2 · Custodian Return And Anisotropy — CLOSED.** Full return-ready reconstitution, failure matrix, responsive proof, deployed observation, and compatibility aftercare are evidence-closed.
3. **Stretch 3 · Choir calibration receipt binding — CLOSED.** Receipt-bound calibration, adversarial holds, replay, first-class main status, and exact evidence artifact are closed at validation-gated maturity.
4. **Hush vocabulary externalization and intervention ensemble — BLOCKED.** A fresh operator opening gesture is required.
5. **Aperture composition renovation before Choir UI.** Replace wrapper chains with declared composition while preserving the animation scheduler.
6. **Higher-order interference.** Keep k-order recovery separate from pairwise Moiré.
7. **Ordered route-sequence recovery.** Measure order effects under a sequence-specific receipt.
8. **Temporal and delayed-disclosure assays.** Use declared slices without claiming trusted time.
9. **Safe Harbor → Ash custody-root adapter.** Enter verified packets through bounded custody ingress.
10. **Independent provenance adapters.** Preserve evidence status without truth or identity inflation.
11. **Destination-bound transport last.** Require lifecycle and Rebuild preflight plus separate authorization and execution receipts.

# Structural Maintenance

- Preserve the twelve-function Vercel ceiling and Marrowline shell contract.
- Preserve exact lifecycle, Case Map, Route Memory, and receipt-reference binding regressions.
- Keep navigation, mutation, custody, reconstitution, calibration, release, and transport authority separately testable.
- Keep every post-promotion Ash change visible in the ledger rather than folding it invisibly into prior evidence.
- Treat observer semantics, browser resource behavior, mobile reachability, production-interface timing, and evidence-artifact retention as first-class packet work.
- Require a fresh operator opening gesture for each major stretch; a passing gate establishes eligibility rather than desire.
- Keep provider, recipient, Cinder, and transport routes absent unless a later packet explicitly implements and proves them.

# Current Red — Separate Jurisdiction

Two Marrowline workflows remain red in a separately governed station-test family. Stretches 1–3 did not modify that jurisdiction. Do not alter unrelated Marrowline code merely to make the repository appear uniformly green.

# Final Route

```text
Ash threshold
→ Quick Scan readiness
→ custody root
→ Case Map binding
→ Rebuild
→ Draft / Review / Release
→ continuity
→ lifecycle production closure [CLOSED]
→ constitutional convergence closure [CLOSED]
→ Custodian Return / Anisotropy [CLOSED]
→ Choir calibration receipt binding [CLOSED]
→ Hush intervention [BLOCKED / FRESH OPERATOR GESTURE REQUIRED]
→ Aperture and Choir UI
→ Safe Harbor custody ingress
→ independent provenance
→ destination transport [LAST]
```

Stretches 1, 2, and 3 are closed. Stretch 4 has not opened.

Authored with 𝌋‌

Noted ⟐
