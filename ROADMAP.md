# TD613 Repository Roadmap

𝌋‌ U+10D613

Roadmap generation: `v1.5 · Stretch 1 closed / Stretch 2 awaiting approval`

Date: `2026-07-15`

Use with:

- [`docs/ASH_KEEP_BUILDOUT_LEDGER.md`](docs/ASH_KEEP_BUILDOUT_LEDGER.md)
- [`docs/ASH_LIFECYCLE_ORCHESTRATION.md`](docs/ASH_LIFECYCLE_ORCHESTRATION.md)
- [`docs/ASH_LIFECYCLE_PRODUCTION_DEMO_RECEIPT.md`](docs/ASH_LIFECYCLE_PRODUCTION_DEMO_RECEIPT.md)
- [`docs/ASH_CONSTITUTIONAL_CONVERGENCE_RECEIPT.md`](docs/ASH_CONSTITUTIONAL_CONVERGENCE_RECEIPT.md)
- [`KNOWN_FAILURES.md`](KNOWN_FAILURES.md)

The ledger is authoritative for maturity scoring. This roadmap records shipped architecture, closed packets, operator approval gates, future packet order, and separately tracked red lanes.

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
component maturity = 201 / 375 · ≈54%
constitutional synthesis = 47 / 50 · production-demonstrated / evidence-bounded
Ash Keep = 54 / 55 · production-demonstrated
Ash lifecycle = 35 / 35 · production-demonstrated
Ash operator surface = 43 / 45 · production-demonstrated / two points retained
Choir = 36 / 70 · validation-gated
production-demonstrated workstreams = 3 / 9
transport-capable workstreams = 0
```

The synthesis score is orthogonal. It must never be added to the component score.

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
component maturity ≠ constitutional synthesis
constitutional synthesis ≠ production closure
Stretch 1 closure ≠ Stretch 2 authorization
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

Lifecycle production evidence remains:

```yaml
status: IMPLEMENTED_PRODUCTION_DEMONSTRATED
score: 35 / 35
observed_commit: e8cbd00673e86d9fa0969407c28ef3ed89af55f7
observer_run: 29383294474
evidence_artifact: 8330532097
```

## Ash Operator Stewardship

The surface now supports deliberate Save, Close, Select, explicit Open, local Delete, mobile composition, accessible map labels, reviewable workspaces, action-level holds, durable save acknowledgment, and cross-tab operation serialization.

## Constitutional Participation

```text
Flow-Core = bounded context, provenance, missingness, uncertainty, alternatives, abstention
Aperture = observation, admissibility, audit, route governance
Hush = derivative candidate production
```

Their ceilings remain strict:

```text
Flow-Core may contextualize; it may not create custody or action authority.
Aperture may audit and hold for repair; it may not manufacture lifecycle rank.
Hush may generate a derivative candidate; it may not release, persist, or transport by itself.
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

Directly demonstrated:

```text
canonical composition manifest                         PASS
Authority Context and lifecycle permissions            PASS
complete nine-surface stale invalidation                PASS
multi-case Save / Close / Select / Open / Delete        PASS
Open without reload                                     PASS
Web Locks plus waiting IndexedDB lease                  PASS
successful and interrupted deletion                     PASS
dry compatibility audit                                 PASS
reference-only event routing                            PASS
desktop / mobile / rotation                             PASS
horizontal overflow                                     0
clipped visible controls                                0
product HTTP errors                                     0
console errors                                          0
provider / recipient / Cinder / transport               0
```

## Stretch 1 Closure Circuit

```text
Dome threshold
→ Quick Scan readiness
→ Ash Custody Root
→ canonical Keep core
→ lifecycle
→ custody and workspace bridges
→ operator controls and mobile composition
→ bounded Flow-Core adapter
→ bounded Aperture adapter
→ bounded Hush adapter
→ deployed observer
```

The shared Authority Context remains conditional on lifecycle rank:

```text
readiness_receipt_reference
custody_root_receipt_reference
case_id
case_map_digest
lifecycle_rank
route_memory_digest
rebuild_receipt_reference
current_review_reference
current_release_reference
current_continuity_reference
```

A custody, Case Map, or Route Memory mutation invalidates stale Flow-Core context, Aperture audits, Choir calibration, Hush derivatives, Drafts, Reviews, Releases, Save Points, and continuity references while preserving their historical receipts.

The explicit case-state contract remains:

```text
EPHEMERAL_CURRENT
CURRENT_UNSAVED
CURRENT_SAVED
CLOSED_SAVED
CLOSED_CURRENT_UNSAVED
SELECTED_NOT_OPEN
DELETION_PENDING
DELETED_LOCAL
DELETE_PARTIAL_HOLD
```

# Operator Approval Gate

## Stretch 2 — Custodian Return And Anisotropy

```text
AWAITING_OPERATOR_APPROVAL
status: SCAFFOLDED / NOT_STARTED
```

No Stretch 2 code, schema, sandbox database, Return UI, import path, comparison run, Anisotropy Receipt, test fixture, production probe, or maturity promotion has begun.

Work stops here until the operator explicitly approves Stretch 2.

When approved, the required circuit is:

```text
controlled context loss in an isolated sandbox
→ verified Save Point, Capsule, receipts, schema, and authentication tag
→ authorized future local Reader
→ readiness provenance restoration
→ custody root and Case Map restoration
→ Route Memory and lifecycle-rank restoration
→ Rebuild, derivative, review, release, and continuity restoration
→ external Reader receives only a declared purpose-shaped projection
→ componentwise recovery comparison
→ Anisotropy Receipt
```

Required recovery dimensions:

- nodes;
- relationships;
- room bridges;
- source/style linkage;
- chronology;
- hypotheses;
- next actions;
- lifecycle state.

Null, missing, contradictory, rejected, and unresolved outcomes remain visible. No universal score may be emitted.

# Packet After Stretch 2

## Choir Calibration Receipt Binding

```text
AFTER_CUSTODIAN_RETURN
status: IMPLEMENTED_VALIDATION_GATED / PACKET_UNBUILT
```

Required circuit:

```text
current custody-bound case_id and case_map_digest
→ verified Moiré assay receipt
→ verified Reader provenance receipts
→ verified Reader Disagreement Ledger
→ verified matched-control bank receipt
→ calibration eligibility derived from references
→ componentwise comparison
→ tamper, replay, and stale-case holds
```

No free calibration booleans. No universal score. No automatic hold, release, provider execution, or transport. No maturity transfer from Ash.

# Ordered Program Roadmap

1. **Stretch 1 · Ash Constitutional Convergence Closure — CLOSED.** Composition, Authority Context, invalidation, case states, deletion, contention, compatibility, event routing, responsive behavior, and deployed observation are evidence-closed.
2. **Stretch 2 · Custodian Return And Anisotropy — AWAITING OPERATOR APPROVAL.** Prove authorized continuity after controlled context loss and seal a componentwise Anisotropy Receipt.
3. **Choir calibration receipt binding.** Bind external reconstruction calibration to verified receipts and the current custody-bound Case Map.
4. **Hush vocabulary externalization and intervention ensemble.** Hold proposition obligations constant across surface variation and bind candidates to current lifecycle state.
5. **Aperture composition renovation before Choir UI.** Replace wrapper chains with declared composition while preserving the animation scheduler.
6. **Higher-order interference.** Keep k-order recovery separate from pairwise Moiré.
7. **Ordered route-sequence recovery.** Measure order effects under a sequence-specific receipt.
8. **Temporal and delayed-disclosure assays.** Use declared slices without claiming trusted time.
9. **Safe Harbor → Ash custody-root adapter.** Enter verified packets through bounded custody ingress.
10. **Independent provenance adapters.** Preserve evidence status without truth or identity inflation.
11. **Destination-bound transport last.** Require lifecycle and Rebuild preflight plus separate authorization and execution receipts.

# Historical v1.4 Roadmap Baseline — Preserved, Not Current

```text
component maturity = 193 / 375
constitutional synthesis = 40 / 50
constitutional convergence closure [NEXT]
Custodian Return / Lifecycle Reconstitution
Choir calibration receipt binding
lifecycle production closure [CLOSED]
transport-capable workstreams = 0
```

The historical sequence remains provenance only. Current routing is governed by the ordered roadmap above.

# Structural Maintenance

- Preserve the twelve-function Vercel ceiling and Marrowline shell contract.
- Preserve exact lifecycle and Case Map binding regressions.
- Keep navigation, mutation, custody, release, and transport authority separately testable.
- Keep every post-promotion Ash change visible in the ledger rather than folding it invisibly into prior evidence.
- Keep provider, recipient, Cinder, and transport routes absent unless a later packet explicitly implements and proves them.

# Current Red — Separate Jurisdiction

Two Marrowline workflows remain red in a separately governed station-test family. Stretch 1 did not modify that jurisdiction. Do not alter unrelated Marrowline code merely to make the repository appear uniformly green.

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
→ Stretch 2 Custodian Return / Anisotropy [AWAITING OPERATOR APPROVAL]
→ Choir calibration
→ Hush intervention
→ Aperture and Choir UI
→ Safe Harbor custody ingress
→ independent provenance
→ destination transport [LAST]
```

Stretch 1 is complete. Stretch 2 remains unopened.

Authored with 𝌋‌

Noted ⟐
