# TD613 Repository Roadmap

𝌋‌ U+10D613

Roadmap generation: `v1.6 · Stretch 2 validation-gated / Stretch 3 blocked`

Date: `2026-07-15`

Use with:

- [`docs/ASH_KEEP_BUILDOUT_LEDGER.md`](docs/ASH_KEEP_BUILDOUT_LEDGER.md)
- [`docs/ASH_LIFECYCLE_ORCHESTRATION.md`](docs/ASH_LIFECYCLE_ORCHESTRATION.md)
- [`docs/ASH_LIFECYCLE_PRODUCTION_DEMO_RECEIPT.md`](docs/ASH_LIFECYCLE_PRODUCTION_DEMO_RECEIPT.md)
- [`docs/ASH_CONSTITUTIONAL_CONVERGENCE_RECEIPT.md`](docs/ASH_CONSTITUTIONAL_CONVERGENCE_RECEIPT.md)
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
component maturity = 216 / 375 · ≈58%
constitutional synthesis = 47 / 50 · production-demonstrated / evidence-bounded
Ash Keep = 54 / 55 · production-demonstrated
Ash lifecycle = 35 / 35 · production-demonstrated
Ash operator surface = 43 / 45 · production-demonstrated / two points retained
Custodian Return / Anisotropy = 22 / 35 · validation-gated
Choir = 36 / 70 · validation-gated
production-demonstrated workstreams = 3 / 9
validation-gated workstreams = 2 / 9
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
validation-gated implementation ≠ production closure
component maturity ≠ constitutional synthesis
constitutional synthesis ≠ production closure
Stretch 2 implementation ≠ Stretch 3 authorization
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
Aperture = observation, admissibility, audit, route governance, anisotropy comparison
Hush = derivative candidate production
Custodian Return = isolated authorized reconstitution
```

Their ceilings remain strict:

```text
Flow-Core may contextualize; it may not create custody or action authority.
Aperture may audit and compare; it may not manufacture lifecycle rank or emit a universal recovery score.
Hush may generate a derivative candidate; it may not release, persist, or transport by itself.
Custodian Return may reconstruct inside its sandbox; it may not mutate the live case or declare total restoration.
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

## Visible Post-Closure Aftercare

```text
aftercare_commit: 2c89b70e284562ebb6b842900ae1a1bd0b00f6e6
scope: bounded save-confirmation presentation stability
maturity_movement: none
production_evidence_replacement: none
```

Current-head aftercare remains visible without silently inheriting Stretch 1’s earlier production receipt.

# Stretch 2 — Open And Validation-Gated

## Custodian Return And Anisotropy

```text
OPEN
status: IMPLEMENTED_VALIDATION_GATED / PRODUCTION_CLOSURE_UNEARNED
landed_main_commit: 2dc2d1c72a3fdd50094184717906e3d0469e0947
implementation_pr: 342
focused_validation_run: 29468144412
TCP_smoke_run: 29468144399
static_deployment_run: 29468144420
Ash_lifecycle_integration_run: 29468144390
```

Shipped circuit:

```text
authenticated Ash Capsule
→ Save Point and Case Map verification
→ digest-binding verification
→ isolated td613-ash-return-sandbox write
→ authorized local Reader component recovery
→ purpose-shaped external Reader projection
→ componentwise comparison
→ Custodian Return Receipt
→ Anisotropy Receipt
```

The external projection excludes the Ash Capsule, Case Map, room keys, and complete Route Memory. Null, missing, contradictory, rejected, and unresolved outcomes remain visible. No universal recovery score is emitted.

Current implementation boundaries:

```text
live-case mutation        0
provider calls            0
recipient transport       0
Cinder action             0
lifecycle-rank promotion  0
```

## Stretch 2 Production Closure Gate

The following remain mandatory before closure:

1. Reconstitute readiness provenance, custody root, Route Memory, lifecycle rank, Rebuild history, derivative history, Reviews, Releases, Save Points, and continuity posture from a return-ready bundle.
2. Verify selected receipts and custody-root references explicitly.
3. Demonstrate wrong-passphrase, tamper, partial-Capsule, stale-receipt, interrupted-import, and replay behavior.
4. Demonstrate desktop, mobile, reduced-motion, and accessibility behavior.
5. Run a deployed synthetic return flight.
6. Preserve a durable production receipt and obtain an operator closure gesture.

Until these gates pass, Stretch 2 remains open and its score remains validation-gated.

# Stretch 3 — Blocked

## Choir Calibration Receipt Binding

```text
BLOCKED_PENDING_STRETCH_2_CLOSURE_AND_OPERATOR_APPROVAL
status: PACKET_UNBUILT
```

The next packet may begin only after Stretch 2 production closure and an explicit operator opening gesture.

Proposed circuit:

```text
current custody-bound case_id and case_map_digest
→ verified Moiré assay receipt
→ verified Reader provenance receipts
→ verified Reader Disagreement Ledger
→ verified matched-control bank receipt
→ calibration eligibility derived from references
→ componentwise comparison
→ tamper, replay, source-drift, and stale-case holds
```

No free calibration booleans. No universal score. No automatic hold, release, provider execution, transport, Cinder action, or maturity transfer from Ash.

# Ordered Program Roadmap

1. **Stretch 1 · Ash Constitutional Convergence Closure — CLOSED.** Composition, Authority Context, invalidation, case states, deletion, contention, compatibility, event routing, responsive behavior, and deployed observation are evidence-closed.
2. **Stretch 2 · Custodian Return And Anisotropy — OPEN / VALIDATION-GATED.** Isolated return and anisotropy receipts have landed; full reconstitution, failure matrix, and deployed production closure remain.
3. **Choir calibration receipt binding — BLOCKED.** Bind external reconstruction calibration to verified receipts and the current custody-bound Case Map only after Stretch 2 closes.
4. **Hush vocabulary externalization and intervention ensemble.** Hold proposition obligations constant across surface variation and bind candidates to current lifecycle state.
5. **Aperture composition renovation before Choir UI.** Replace wrapper chains with declared composition while preserving the animation scheduler; execute through internal sub-packets rather than one oversized merge.
6. **Higher-order interference.** Keep k-order recovery separate from pairwise Moiré.
7. **Ordered route-sequence recovery.** Measure order effects under a sequence-specific receipt.
8. **Temporal and delayed-disclosure assays.** Use declared slices without claiming trusted time.
9. **Safe Harbor → Ash custody-root adapter.** Enter verified packets through bounded custody ingress.
10. **Independent provenance adapters.** Preserve evidence status without truth or identity inflation.
11. **Destination-bound transport last.** Require lifecycle and Rebuild preflight plus separate authorization and execution receipts.

# Structural Maintenance

- Preserve the twelve-function Vercel ceiling and Marrowline shell contract.
- Preserve exact lifecycle and Case Map binding regressions.
- Keep navigation, mutation, custody, reconstitution, release, and transport authority separately testable.
- Keep every post-promotion Ash change visible in the ledger rather than folding it invisibly into prior evidence.
- Treat observer semantics, browser resource behavior, mobile reachability, and production-interface timing as first-class packet work.
- Require a fresh operator opening gesture for each major stretch; a passing gate establishes eligibility rather than desire.
- Keep provider, recipient, Cinder, and transport routes absent unless a later packet explicitly implements and proves them.

# Current Red — Separate Jurisdiction

Two Marrowline workflows remain red in a separately governed station-test family. Stretch 2 did not modify that jurisdiction. Do not alter unrelated Marrowline code merely to make the repository appear uniformly green.

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
→ Custodian Return / Anisotropy [VALIDATION-GATED / OPEN]
→ deployed synthetic return and operator closure [REQUIRED]
→ Choir calibration [BLOCKED]
→ Hush intervention
→ Aperture and Choir UI
→ Safe Harbor custody ingress
→ independent provenance
→ destination transport [LAST]
```

Stretch 2 has landed but remains open. Stretch 3 remains blocked.

Authored with 𝌋‌

Noted ⟐
