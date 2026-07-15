# TD613 Repository Roadmap

𝌋‌ U+10D613

Roadmap generation: `v1.4 · constitutional convergence validation gate`

Date: `2026-07-15`

Use with:

- [`docs/ASH_KEEP_BUILDOUT_LEDGER.md`](docs/ASH_KEEP_BUILDOUT_LEDGER.md)
- [`docs/ASH_LIFECYCLE_ORCHESTRATION.md`](docs/ASH_LIFECYCLE_ORCHESTRATION.md)
- [`docs/ASH_LIFECYCLE_PRODUCTION_DEMO_RECEIPT.md`](docs/ASH_LIFECYCLE_PRODUCTION_DEMO_RECEIPT.md)
- [`docs/ASH_CONSTITUTIONAL_CONVERGENCE_RECEIPT.md`](docs/ASH_CONSTITUTIONAL_CONVERGENCE_RECEIPT.md)
- [`KNOWN_FAILURES.md`](KNOWN_FAILURES.md)

The ledger is authoritative for maturity scoring. This roadmap records shipped architecture, constitutional convergence, the selected executable packet, ordered future work, and separately tracked red lanes.

## Maturity law

| Score | Status |
| ---: | --- |
| 0 | `UNIMPLEMENTED` |
| 1 | `DESIGNED_ONLY` |
| 2 | `SCAFFOLDED` |
| 3 | `PARTIAL_TESTED_COMPONENT` |
| 4 | `IMPLEMENTED_VALIDATION_GATED` |
| 5 | `IMPLEMENTED_PRODUCTION_DEMONSTRATED` |

Green tests do not impersonate production evidence. Shared chambers do not impersonate lifecycle integration. Production status never transfers by proximity.

## Current vector posture

```text
component maturity = 193 / 375 · ≈51%
constitutional synthesis = 40 / 50 · provisional relational audit
Ash Keep = 54 / 55 · production-demonstrated
Ash lifecycle = 35 / 35 · production-demonstrated
Ash operator surface = 35 / 45 · validation-gated
Choir = 36 / 70 · validation-gated
production-demonstrated workstreams = 2 / 9
transport-capable workstreams = 0
```

The synthesis score is orthogonal. It must never be added to the component score.

## Governing distinctions

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
```

# Shipped constitutional spine

## 1. Dome-World threshold and Quick Scan

The Dome Ash tab enters a threshold membrane. Arrival remains unpersisted. Quick Scan carries session-scoped readiness only.

## 2. Ash Custody Root

L0 metadata-only and L1 browser-local commitment routes verify the custody receipt before a root enters the Case Map. A valid root changes `case_map_digest`; custody remains non-equivalent to authenticity or truth.

## 3. Ash Keep lifecycle

```text
ARRIVAL_UNPERSISTED
→ READINESS_OBSERVED
→ CUSTODY_ROOT_VERIFIED
→ CASE_BOUND
→ REBUILD_ELIGIBLE
→ RELEASE_ELIGIBLE
→ CONTINUITY_SEALED
```

Production evidence:

```yaml
status: IMPLEMENTED_PRODUCTION_DEMONSTRATED
score: 35 / 35
observed_commit: e8cbd00673e86d9fa0969407c28ef3ed89af55f7
deployment_run: 29383285733
observer_run: 29383294474
evidence_artifact: 8330532097
evidence_artifact_sha256: sha256:93c8c3992223af4524bf16d645de394333decd62b2ab65c88a1a7d1c4c68a249
observer_result: PASS
promotion_scope: lifecycle maturity only
```

One custody-bound Case Map now governs Rebuild, Draft, Review, Release, Save Point, and Capsule. Stale pre-binding authority cannot jump the lifecycle.

## 4. Ash operator stewardship

Landed sequence:

```text
PR #323  lifecycle integration hardening
PR #326  case-entry and restoration membrane
PR #327  dedicated mobile composition
PR #328  canonical Keep popup restoration
PR #329  Save / Close / Select and local fingerprints
PR #330  explicit Open / Delete and density-aware map labels
PR #331  navigable workspaces with action-level holds
PR #332  navigation observer reconciliation
```

Current-head aftercare:

```yaml
head_commit: 3b85b95d616579ddc3255e2716cabd4b178f74da
observer_run: 29441389808
observer_result: PASS
evidence_artifact: 8353582293
evidence_artifact_sha256: sha256:ebb97064fb3cee667b227a176f72fa1dce66e4087b5e0470f6f286748a1279a6
promotion_authorized: false
ruling: CURRENT_HEAD_NON_DISTURBANCE_ONLY
```

The surface supports deliberate Save, Close, Select, Open, local Delete, mobile composition, accessible map labels, and reviewable workspaces whose mutating actions remain lifecycle-held.

## 5. Constitutional participation of Flow-Core, Aperture, and Hush

```text
Flow-Core = bounded context, provenance, missingness, uncertainty, alternatives, abstention
Aperture = observation, admissibility, audit, route governance
Hush = derivative candidate production
```

These organs were not invented by Ash integration. Their prior contracts were waiting for a complete state-bearing body. The integration made their constitutional placement legible.

Their ceilings remain strict:

```text
Flow-Core may contextualize; it may not create custody or action authority.
Aperture may audit and hold for repair; it may not manufacture lifecycle rank.
Hush may generate a derivative candidate; it may not release, persist, or transport by itself.
```

# Constitutional synthesis ruling

The integration is not merely Ash Keep plus two adjacent features. It is a convergence in which previously separate organs acquired one shared authority spine.

Provisional matrix:

```text
J1 threshold → readiness                              5
J2 readiness remains distinct from custody            5
J3 custody root mutates Case Map                       5
J4 downstream lifecycle shares one Case Map            5
J5 runtime composition                                 4
J6 Aperture bounded participation                       4
J7 Flow-Core bounded participation                      3
J8 Hush derivative lifecycle participation              3
J9 operator continuity                                  4
J10 eventing / contention / deletion / compatibility    2

constitutional synthesis = 40 / 50
```

This does not rescore the organs. It records the relation among them.

# Selected next packet

## Ash Constitutional Convergence Closure

```text
ACTIVE_CLOSURE_PACKET
status: IMPLEMENTED_VALIDATION_GATED / DEPLOYED_OBSERVATION_PENDING
```

Purpose:

Close the shared constitutional body rather than treating the operator surface, lifecycle, context, audit, and derivative organs as independent appendages.

Current implementation evidence:

```text
canonical composition manifest                         PASS
Authority Context and lifecycle permissions            PASS
complete downstream stale invalidation                 PASS
case-state and deletion recovery                       PASS
Web Locks plus IndexedDB lease fallback                PASS
dry compatibility audit                                PASS
reference-only EventTarget and BroadcastChannel        PASS
desktop / mobile / rotation local flight               PASS
focused contract gate                                  33 / 33
deployed convergence observation                       PENDING
```

This gate does not change `193 / 375` or `40 / 50`. Production evidence cannot be inferred from local success.

Required circuit:

```text
declared constitutional composition manifest
→ shared bounded Authority Context
→ explicit case-state machine
→ cross-system stale-reference invalidation
→ destructive-continuity closure
→ browser-local contention protocol
→ historical compatibility audit
→ lifecycle event bus
→ dedicated deployed convergence probe
→ evidence-only promotion decision
```

## 1. Constitutional composition manifest

Declare one canonical order for:

```text
Dome threshold
→ Quick Scan readiness
→ Ash Custody Root
→ canonical Keep document and governed core
→ lifecycle module
→ custody and workspace bridges
→ operator controls and mobile composition
→ Flow-Core context adapter
→ Aperture audit adapter
→ Hush derivative adapter
→ observer
```

Each layer must state prerequisite version, provided capability, mutation surface, authority ceiling, idempotence marker, and failure posture.

## 2. Shared bounded Authority Context

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

Fields remain conditional on lifecycle rank. No organ may infer authority from interface presence, module adjacency, or a stale Case Map.

## 3. Cross-system invalidation

A custody or Case Map mutation must invalidate stale:

- Flow-Core context bindings;
- Aperture audits tied to the old case state;
- Choir calibration references;
- Hush derivative eligibility;
- Drafts, Reviews, Release Receipts, Save Points, and continuity claims.

## 4. Explicit case-state contract

At minimum:

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

Selection may not collapse into opening. Closure may not collapse into deletion. Saved sameness may not impersonate custody.

## 5. Destructive-continuity closure

Local Delete must gain a pre-deletion inventory, deletion-plan digest, staged or atomic transaction rule, orphan scan, partial-failure receipt, interrupted-delete recovery, Capsule reminder, and external-erasure disclaimer.

## 6. Browser-local contention protocol

Define bounded coordination for first custody registration, Save, Open, Delete, and stale-pointer cleanup. Do not claim distributed locking.

## 7. Historical compatibility audit

Run a dry, non-mutating audit for malformed Save Points, duplicate custody nodes, orphaned reviews/releases, stale fingerprints, missing lifecycle rows, and pointers to deleted cases. Migration requires a separate human-approved plan.

## 8. Lifecycle event bus

Replace post-review reload dependence with declared internal events before further cross-organ behavior depends on reload timing.

## 9. Deployed convergence probe

Directly demonstrate:

- threshold and readiness boundaries;
- custody-root Case Map mutation;
- shared Authority Context propagation;
- stale-reference invalidation across context, audit, derivative, review, release, and continuity layers;
- multiple-case Save / mutate / close / select / open;
- deletion success and partial-failure holds;
- workspace reviewability with action-level holds;
- desktop, mobile portrait, mobile landscape, rotation, and reduced motion;
- zero unauthorized provider, recipient, Cinder, or transport routes;
- `promotion_authorized: false` during observation.

# Packet after convergence closure

## Custodian Return / Lifecycle Reconstitution

```text
AFTER_CONVERGENCE
status: SCAFFOLDED / NEXT_RESEARCH_PACKET_UNBUILT
```

Purpose:

Test whether the authorized custodian can reconstitute the full lifecycle after controlled context loss without granting equivalent recoverability to an external Reader.

Required circuit:

```text
controlled context loss
→ Save Point + Capsule + selected receipts
→ authorized future Reader
→ readiness provenance restoration
→ custody root and Case Map restoration
→ Route Memory and lifecycle-rank restoration
→ Rebuild, derivative, review, release, and continuity restoration
→ external Reader comparison
→ componentwise Anisotropy Receipt
```

The Anisotropy Receipt must preserve dimensions rather than collapse them into one universal score.

# Packet after Custodian Return

## Choir calibration receipt binding

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

# Ordered program roadmap

1. **Ash Constitutional Convergence Closure.** Close composition, shared authority context, invalidation, case states, deletion, contention, compatibility, event routing, and deployed observation.
2. **Custodian Return / Lifecycle Reconstitution.** Prove authorized continuity after context loss and seal a componentwise Anisotropy Receipt.
3. **Choir calibration receipt binding.** Bind external reconstruction calibration to verified receipts and the current custody-bound Case Map.
4. **Hush vocabulary externalization and intervention ensemble.** Hold proposition obligations constant across surface variation and bind every candidate to current lifecycle state.
5. **Aperture composition renovation before Choir UI.** Replace wrapper chains with declared composition and preserve the existing animation scheduler.
6. **Higher-order interference.** Keep k-order recovery separate from pairwise Moiré.
7. **Ordered route-sequence recovery.** Measure order effects under a sequence-specific receipt.
8. **Temporal and delayed-disclosure assays.** Use declared slices without claiming trusted time.
9. **Safe Harbor → Ash custody-root adapter.** Enter verified packets through bounded custody ingress.
10. **Independent provenance adapters.** Preserve evidence status without truth or identity inflation.
11. **Destination-bound transport last.** Require lifecycle and Rebuild preflight plus separate authorization and execution receipts.

# Structural maintenance

- Preserve Vercel function-budget and Marrowline shell contracts.
- Preserve exact Draft-to-current-Case-Map binding regressions.
- Record every post-promotion Ash change in the delta register.
- Keep navigation, mutation, context, audit, custody, release, continuity, and transport authority separately testable.
- Preserve Flow-Core artifact blindness and Aperture non-execution.

# Current red — separate jurisdiction

Two Marrowline workflows remain red in an unchanged station-test family. Do not alter unrelated Marrowline code merely to make the repository look uniformly green.

# Final route

```text
Ash threshold
→ Quick Scan readiness
→ custody root
→ Case Map binding
→ Rebuild
→ Draft / derivative / Review / Release
→ continuity
→ lifecycle production closure [CLOSED]
→ constitutional convergence closure [VALIDATION PASSED · DEPLOYED OBSERVATION PENDING]
→ Custodian Return / Lifecycle Reconstitution
→ Choir calibration receipt binding
→ Hush intervention
→ Aperture renovation and Choir UI
→ higher-order / ordered / temporal assays
→ Safe Harbor custody ingress
→ independent provenance
→ destination transport [LAST]
```

The lifecycle remains closed and production-demonstrated. The operator surface remains real and validation-gated. The integration is now recognized as a constitutional convergence rather than a collection of adjacent additions. Close the shared body, prove the custodian can return through it, then measure what an outside Reader can reconstruct.

Authored with 𝌋‌

Noted ⟐
