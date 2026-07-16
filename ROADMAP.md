# TD613 Repository Roadmap

𝌋‌ U+10D613

Roadmap generation: `v1.7 · Stretch 2 closed / Stretch 3 validation-gated`

Date: `2026-07-16`

Use with:

- [`docs/ASH_KEEP_BUILDOUT_LEDGER.md`](docs/ASH_KEEP_BUILDOUT_LEDGER.md)
- [`docs/ASH_LIFECYCLE_ORCHESTRATION.md`](docs/ASH_LIFECYCLE_ORCHESTRATION.md)
- [`docs/ASH_LIFECYCLE_PRODUCTION_DEMO_RECEIPT.md`](docs/ASH_LIFECYCLE_PRODUCTION_DEMO_RECEIPT.md)
- [`docs/ASH_CONSTITUTIONAL_CONVERGENCE_RECEIPT.md`](docs/ASH_CONSTITUTIONAL_CONVERGENCE_RECEIPT.md)
- [`docs/ASH_CUSTODIAN_RETURN_PRODUCTION_RECEIPT.md`](docs/ASH_CUSTODIAN_RETURN_PRODUCTION_RECEIPT.md)
- [`docs/ASH_KEEP_CHOIR_CALIBRATION_BINDING.md`](docs/ASH_KEEP_CHOIR_CALIBRATION_BINDING.md)
- [`KNOWN_FAILURES.md`](KNOWN_FAILURES.md)

The ledger remains authoritative for maturity scoring. This roadmap records shipped architecture, packet state, operator approval gates, future order, and separately governed red lanes.

## Maturity Law

| Score | Status |
| ---: | --- |
| 0 | `UNIMPLEMENTED` |
| 1 | `DESIGNED_ONLY` |
| 2 | `SCAFFOLDED` |
| 3 | `PARTIAL_TESTED_COMPONENT` |
| 4 | `IMPLEMENTED_VALIDATION_GATED` |
| 5 | `IMPLEMENTED_PRODUCTION_DEMONSTRATED` |

Green tests do not impersonate production evidence. Shared chambers do not impersonate lifecycle integration. Production status never transfers by proximity.

## Current Vector Posture

```text
component maturity after Stretch 3 merge = 237 / 375 · ≈63%
constitutional synthesis = 47 / 50 · production-demonstrated / evidence-bounded
Ash Keep = 54 / 55 · production-demonstrated
Ash lifecycle = 35 / 35 · production-demonstrated
Ash operator surface = 43 / 45 · production-demonstrated / two points retained
Custodian Return / Anisotropy = 35 / 35 · production-demonstrated / evidence-bounded
Choir = 44 / 70 · validation-gated
production-demonstrated workstreams = 4 / 9
validation-gated workstreams = 1 / 9
transport-capable workstreams = 0
```

The synthesis score remains orthogonal and must never be added to component maturity.

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
Stretch 3 implementation ≠ Stretch 4 authorization
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

## Ash Operator Stewardship

The surface supports deliberate Save, Close, Select, explicit Open, local Delete, mobile composition, accessible map labels, reviewable workspaces, action-level holds, durable save acknowledgment, and cross-tab operation serialization.

## Constitutional Participation

```text
Flow-Core = bounded context, provenance, missingness, uncertainty, alternatives, abstention
Aperture = observation, admissibility, audit, route governance, anisotropy and calibration comparison
Hush = derivative candidate production
Custodian Return = isolated authorized reconstitution
Choir = external reconstruction-pressure and calibration instrumentation
```

Their ceilings remain strict:

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
promotion_authorized_during_observation: false
```

Visible aftercare at `2c89b70e284562ebb6b842900ae1a1bd0b00f6e6` stabilized save confirmation without moving maturity or replacing the production receipt.

# Stretch 2 — Closed

## Custodian Return And Anisotropy

```text
CLOSED
status: IMPLEMENTED_PRODUCTION_DEMONSTRATED / EVIDENCE_BOUNDED
implementation_main_commit: 2dc2d1c72a3fdd50094184717906e3d0469e0947
closure_main_commit: 62a4756e2ad38ec89c3eeaf2f532bf2f5676979b
implementation_pr: 342
compatibility_pr: 353
Custodian_Return_run: 29473322517
lifecycle_and_convergence_run: 29473333298
local_evidence_artifact: 8365592007
local_evidence_sha256: sha256:347232162c5fcbabd91e8f5846bc1e2221d502484d829a0f736febea71a31360
deployed_evidence_artifact: 8365605636
deployed_evidence_sha256: sha256:12bb0ea1dc081fa553db00ee79b9d9c20b2efa897470a0f4008b78470615a85f
lifecycle_evidence_artifact: 8365604655
lifecycle_evidence_sha256: sha256:1b72d57b16f11fd42b344627bb078f4f85e3487c01516c7573a3f49d25598d93
```

Closed circuit:

```text
return-ready authenticated Capsule
→ verified readiness and custody receipts
→ verified Authority Context and lifecycle receipt
→ verified Case Map and Route Memory
→ verified Rebuild, Draft, Review, Release and Save Point history
→ isolated td613-ash-return-sandbox write
→ authorized local Reader component recovery
→ purpose-shaped external Reader projection
→ componentwise comparison
→ Custodian Return Receipt
→ Anisotropy Receipt
```

The external projection excludes the Ash Capsule, Case Map, room keys, and complete Route Memory. Null, missing, contradictory, rejected, and unresolved outcomes remain visible. No universal recovery score is emitted.

```text
live-case mutation        0
provider calls            0
recipient transport       0
Cinder action             0
lifecycle-rank promotion  0
```

# Stretch 3 — Open And Validation-Gated

## Choir Calibration Receipt Binding

```text
OPEN
status: IMPLEMENTED_VALIDATION_GATED / MAIN_CLOSURE_EVIDENCE_PENDING
operator_opening_gesture: 2026-07-16
```

Implemented circuit:

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

Derived states:

```text
CALIBRATION_ELIGIBLE
TAMPER_HOLD
STALE_CASE_HOLD
SOURCE_DRIFT_HOLD
RECEIPT_REFERENCE_HOLD
NOT_ENOUGH_TEST_DATA
```

The Stretch 3 boundary rejects free top-level calibration assertions. Historical Moiré assay-local fixture declarations remain historical evidence only and cannot independently confer Stretch 3 eligibility.

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

## Stretch 3 Closure Gate

The implementation may close only after:

1. the complete inherited Choir suite and new adversarial matrix pass;
2. the implementation merges to `main`;
3. the main Choir run preserves a validation evidence artifact;
4. the exact main commit, run, artifact, and digest enter a durable receipt;
5. the operator-visible closure ruling is recorded.

# Stretch 4 — Blocked

## Hush Vocabulary Externalization And Lifecycle-Bound Intervention Ensemble

```text
BLOCKED_PENDING_STRETCH_3_CLOSURE
status: PACKET_UNBUILT
```

Stretch 3 success establishes eligibility for an operator decision. It does not silently authorize Hush work.

# Ordered Program Roadmap

1. **Stretch 1 · Ash Constitutional Convergence Closure — CLOSED.** Composition, Authority Context, invalidation, case states, deletion, contention, compatibility, event routing, responsive behavior, and deployed observation are evidence-closed.
2. **Stretch 2 · Custodian Return And Anisotropy — CLOSED.** Full return-ready reconstitution, failure matrix, responsive proof, deployed observation, and compatibility aftercare are evidence-closed.
3. **Stretch 3 · Choir calibration receipt binding — OPEN / VALIDATION-GATED.** Receipt-bound calibration and replay are implemented; exact main-run closure evidence remains.
4. **Hush vocabulary externalization and intervention ensemble — BLOCKED.** Hold proposition obligations constant across surface variation and bind candidates to current lifecycle state.
5. **Aperture composition renovation before Choir UI.** Replace wrapper chains with declared composition while preserving the animation scheduler; execute through internal sub-packets rather than one oversized merge.
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

Two Marrowline workflows remain red in a separately governed station-test family. Stretch 2 closure and Stretch 3 implementation did not modify that jurisdiction. Do not alter unrelated Marrowline code merely to make the repository appear uniformly green.

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
→ Choir calibration receipt binding [VALIDATION-GATED / OPEN]
→ main evidence receipt and operator closure [REQUIRED]
→ Hush intervention [BLOCKED]
→ Aperture and Choir UI
→ Safe Harbor custody ingress
→ independent provenance
→ destination transport [LAST]
```

Stretch 2 is closed. Stretch 3 is implemented and active. Stretch 4 remains blocked.

Authored with 𝌋‌

Noted ⟐
