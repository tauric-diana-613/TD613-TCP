# TD613 Repository Roadmap

𝌋‌ U+10D613

Roadmap generation: `v1.2 · Ash operator surface landed / consolidation selected`

Date: `2026-07-15`

Use with:

- [`docs/ASH_KEEP_BUILDOUT_LEDGER.md`](docs/ASH_KEEP_BUILDOUT_LEDGER.md)
- [`docs/ASH_LIFECYCLE_ORCHESTRATION.md`](docs/ASH_LIFECYCLE_ORCHESTRATION.md)
- [`docs/ASH_LIFECYCLE_PRODUCTION_DEMO_RECEIPT.md`](docs/ASH_LIFECYCLE_PRODUCTION_DEMO_RECEIPT.md)
- [`KNOWN_FAILURES.md`](KNOWN_FAILURES.md)

The ledger is authoritative for maturity scoring. This roadmap records shipped architecture, the selected executable packet, ordered future work, and separately tracked red lanes.

## Maturity law

| Score | Status |
| ---: | --- |
| 0 | `UNIMPLEMENTED` |
| 1 | `DESIGNED_ONLY` |
| 2 | `SCAFFOLDED` |
| 3 | `PARTIAL_TESTED_COMPONENT` |
| 4 | `IMPLEMENTED_VALIDATION_GATED` |
| 5 | `IMPLEMENTED_PRODUCTION_DEMONSTRATED` |

Green tests do not impersonate production evidence. Shared chambers do not impersonate lifecycle integration. Production status never transfers by proximity. Current-head deployed aftercare proves non-disturbance along the observed route; it does not silently promote every new feature present on that head.

## Current posture

```text
Ash Keep = 54 / 55 · production-demonstrated
Choir = 36 / 70 · validation-gated
Ash lifecycle = 35 / 35 · production-demonstrated
Ash operator surface = 35 / 45 · validation-gated
full bounded program = 193 / 375 · ≈51%
production-demonstrated workstreams = 2 / 9
transport-capable workstreams = 0
```

Ash transport and automatic Cinder remain false.

## Governing route distinctions

```text
workspace visibility ≠ mutation eligibility
case selection ≠ case opening
case closure ≠ case deletion
saved fingerprint ≠ custody proof
local deletion ≠ external erasure
current-head aftercare ≠ feature-specific production demonstration
case restoration ≠ historical-record repair
```

# Shipped spine

## Ash Keep v1.0

Production merge: `5cb72bb2d7314666c7191ef5e8f9f8235e01984f`

The Keep demonstrated local case custody, Rooms, Route Memory, Rebuild Tests, Draft review, release receipts, Save Points, encrypted Capsules, mobile behavior, and zero recipient transport. That evidence predates the complete lifecycle and remains a separate maturity jurisdiction.

## Choir instruments 1–4

```text
pairwise Moiré            1a01181cea77590ad3067ebd27da4518511dac5f
observation hardening     52968efb0fb52ecc138dc4d4b80b60725473fa63
Reader provenance         b0b600a07c8343311cdde50c2f250881e7f6091c
Reader disagreement       3a8dbebf1ad65f7ee281c2fcd5816afd8584c984
matched controls          378bf0f1a81b6aa7b9ebe8379ca207d6f1f36925
```

All remain validation-gated.

## Ash product lifecycle orchestration

Implementation merge: PR `#297`, `af733b26f835bc5f110e251addbc49b5d75a75e0`

Production-observed runtime: `e8cbd00673e86d9fa0969407c28ef3ed89af55f7`

```text
ARRIVAL_UNPERSISTED
→ READINESS_OBSERVED
→ CUSTODY_ROOT_VERIFIED
→ CASE_BOUND
→ REBUILD_ELIGIBLE
→ RELEASE_ELIGIBLE
→ CONTINUITY_SEALED
```

The Dome Ash tab enters an art-forward threshold. Quick Scan carries session-only readiness. Ash Custody is a native Keep workspace. A verified root changes the Case Map digest and invalidates stale downstream authority. Rebuild, Draft, Review, Release, Save Point, and Capsule bind to that same current Case Map.

Human grammar:

```text
Ash = complete lifecycle
Ash Keep = case-custody workspace and orchestrator
Quick Scan = readiness observation
Ash Custody Root = verified case root
ash-readiness = machine/API compatibility term
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
terminal_status_id: 50486516511
observer_result: PASS
promotion_scope: lifecycle maturity only
```

The evidence-only receipt closed the lifecycle maturity gate. It grants no transport or automatic Cinder authority.

## Ash operator surface and local case stewardship

Landed sequence:

```text
PR #323  lifecycle integration hardening
PR #326  case-entry and restoration membrane
PR #327  dedicated mobile composition
PR #328  canonical Keep popup restoration
PR #329  Save Case / Close Case / Select Case / local fingerprints
PR #330  explicit Open / Delete and density-aware map labels
PR #331  navigable workspaces with action-level lifecycle holds
PR #332  navigation observer and deployed-probe reconciliation
```

Current-head deployed aftercare:

```yaml
head_commit: 3b85b95d616579ddc3255e2716cabd4b178f74da
observer_run: 29441389808
observer_result: PASS
evidence_artifact: 8353582293
evidence_artifact_sha256: sha256:ebb97064fb3cee667b227a176f72fa1dce66e4087b5e0470f6f286748a1279a6
promotion_authorized: false
ruling: CURRENT_HEAD_NON_DISTURBANCE_ONLY
```

The landed surface now supports deliberate local case saving, closing, selection, explicit opening, confirmed local deletion, mobile-specific composition, density-aware map labels, and reviewable workspaces whose mutating actions remain lifecycle-held. These features form a new maturity jurisdiction. They do not reopen or inherit A or H.

# Selected next packet

## Ash operator-surface consolidation and closure

```text
SELECTED_NEXT
status: IMPLEMENTED_VALIDATION_GATED / CLOSURE_PACKET_UNBUILT
```

Purpose:

Stabilize the operator substrate before Choir calibration is allowed to depend on it.

Required circuit:

```text
declared composition manifest
→ explicit case-state machine
→ deletion plan and recovery receipt
→ browser-local contention protocol
→ historical compatibility audit
→ lifecycle event bus
→ dedicated deployed operator-surface probe
→ evidence-only promotion decision
```

## 1. Declared composition manifest

Declare one canonical order for:

```text
canonical Keep document
→ lifecycle composition
→ custody bridge
→ workspace bridge
→ navigation semantics
→ case controls
→ mobile composition
→ map labels
→ production observer
```

Each layer must state:

- prerequisite version;
- provided capability;
- mutation surface;
- authority ceiling;
- idempotence marker;
- failure posture.

## 2. Explicit case-state contract

The product must distinguish at least:

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

No interface label may collapse selection into opening, closure into deletion, or saved sameness into custody proof.

## 3. Destructive-continuity closure

Local Delete must gain:

- a pre-deletion inventory;
- a deletion-plan digest;
- one transaction or explicitly staged transaction set;
- a post-deletion orphan scan;
- a partial-failure receipt;
- interrupted-delete recovery;
- a clear statement that local deletion does not prove remote erasure;
- an optional Capsule/export reminder before irreversible deletion.

## 4. Browser-local contention protocol

Define browser-local coordination for:

- first custody registration;
- Save Case;
- explicit Open;
- Delete;
- stale pointer cleanup.

This protocol may use a lease, lock, or deterministic transaction rule. It must not claim repository-wide or distributed locking.

## 5. Historical compatibility audit

Run a dry, non-mutating audit for:

- malformed historical Save Points;
- duplicate custody nodes;
- orphaned reviews or releases;
- stale saved-case fingerprints;
- missing lifecycle records;
- pointers to deleted cases.

Any migration requires a separate human-approved plan.

## 6. Lifecycle event bus

Replace the temporary post-review reload with a declared internal lifecycle event bus before additional behavior depends on reload timing.

## 7. Dedicated deployed operator-surface probe

The deployed probe must directly demonstrate:

- first entry;
- returning entry without launch flicker;
- Save Case;
- mutation changing saved posture to current unsaved;
- Close Case without deletion;
- selection without opening;
- explicit Open;
- multiple local cases;
- Delete confirmation;
- complete owned-record cleanup;
- interrupted or partial deletion hold;
- all seven workspaces navigable;
- mutating actions held at the correct lifecycle ranks;
- desktop, mobile portrait, mobile landscape, and reduced-motion behavior;
- density-aware map labels and accessible node numbering;
- zero provider, recipient, Cinder, or transport routes;
- `promotion_authorized: false` during observation.

# Packet after consolidation

## Choir calibration receipt binding

```text
AFTER_CONSOLIDATION
status: IMPLEMENTED_VALIDATION_GATED / NEXT_RESEARCH_PACKET_UNBUILT
```

Purpose:

Replace free calibration booleans and nearby maturity assumptions with verified matched-control receipt references bound to the settled lifecycle substrate.

Required circuit:

```text
current custody-bound case_id and case_map_digest
→ verified Moiré assay receipt
→ verified Reader provenance receipts
→ verified Reader Disagreement Ledger
→ verified matched benign-control bank receipt
→ calibration eligibility derived from references
→ componentwise comparison retained
→ tamper, replay, and stale-case holds retained
```

Required boundaries:

- calibration eligibility derives from verified receipt references rather than free booleans;
- target and control Reader sets, registry, result schema, and input contract remain explicit;
- only eligible matched controls enter the comparison distribution;
- case mutation invalidates stale calibration references;
- saved-case fingerprints never impersonate custody or Case Map authority;
- residual confounds and excluded controls remain visible;
- no universal score;
- no automatic hold, release, provider execution, or transport;
- A, H, and I maturity never transfer to Choir.

# Ordered program roadmap

1. **Ash operator-surface consolidation and closure.** Stabilize composition, case states, destructive continuity, contention, compatibility, event routing, and deployed observation.
2. **Choir calibration receipt binding.** Bind calibration eligibility to verified receipts and the current custody-bound Case Map.
3. **Custodian Return and Anisotropy.** Test whether the rightful custodian can restore the lifecycle after controlled context loss without granting equivalent external recoverability.
4. **Higher-order interference.** Keep k-order recovery separate from pairwise Moiré.
5. **Ordered route-sequence recovery.** Measure order effects under a sequence-specific receipt.
6. **Temporal and delayed-disclosure assays.** Use declared slices without claiming trusted time.
7. **Hush vocabulary externalization.** Move fixture-heavy vocabulary into declared data.
8. **Hush intervention ensemble.** Hold proposition obligations constant across surface changes.
9. **Aperture composition renovation before Choir UI.** Replace wrapper chains with declared composition.
10. **Safe Harbor → Ash custody-root adapter.** Enter verified packets through bounded custody ingress.
11. **Independent provenance adapters.** Preserve evidence status without truth or identity inflation.
12. **Destination-bound transport last.** Require lifecycle and Rebuild preflight plus separate authorization and execution receipts.

# Structural maintenance

- Preserve the twelve-function Vercel ceiling and Marrowline shell contract.
- Narrow lifecycle persistence only through new evidence, never convenience.
- Preserve exact `keepDraft()`-scoped binding regressions so unrelated Case Map digest uses cannot suppress Draft authority.
- Keep Safe Harbor membrane, packet lifecycle, signature alignment, and reference-surface work separately tracked.
- Record every post-promotion Ash change in the ledger delta register rather than folding it invisibly into A or H.
- Keep navigation authority, mutation authority, custody authority, release authority, and transport authority separately testable.

# Current red — separate jurisdiction

Two Marrowline workflows remain red in an unchanged station-test family. The Ash lifecycle and operator-surface work preserve that separation. Do not alter unrelated Marrowline code merely to make the repository look uniformly green.

# Final route

```text
Ash threshold
→ Quick Scan readiness
→ custody root
→ Case Map binding
→ Rebuild
→ Draft / Review / Release
→ continuity
→ lifecycle production closure [CLOSED]
→ operator-surface consolidation [NEXT]
→ Choir calibration receipt binding [AFTER CONSOLIDATION]
→ Custodian Return / Anisotropy
→ higher-order / ordered / temporal assays
→ Hush intervention
→ Aperture and Choir UI
→ Safe Harbor custody ingress
→ independent provenance
→ destination transport [LAST]
```

Architecturally coherent. The lifecycle remains closed and production-demonstrated. The operator surface is real, useful, and validation-gated. Consolidation now precedes Choir so future research binds to a stable custodial substrate rather than retroactively patching a moving one.

Authored with 𝌋‌

Noted ⟐