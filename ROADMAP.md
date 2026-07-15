# TD613 Repository Roadmap

Roadmap generation: `v1.1 · Ash lifecycle production-demonstrated / Choir calibration selected`

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

Green tests do not impersonate production evidence. Shared chambers do not impersonate lifecycle integration. Production status never transfers by proximity.

## Current posture

```text
Ash Keep = 54 / 55 · production-demonstrated
Choir = 36 / 70 · validation-gated
Ash lifecycle = 35 / 35 · production-demonstrated
full bounded program = 158 / 330 · ≈48%
production-demonstrated workstreams = 2 / 8
transport-capable workstreams = 0
```

Ash transport and automatic Cinder remain false.

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

Implementation merge: PR `#297`, `af733b26f835bc49b5d75a75e0`

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

Demonstrated boundaries:

- threshold wrong-order reset and ordered clearance;
- session-only readiness with no raw content;
- pre-custody workspace hold;
- browser-local L1 artifact commitment;
- exactly one custody-registration POST without artifact bytes;
- verified custody manifest and receipt digests;
- custody-root Case Map mutation;
- one common Case Map digest across Rebuild, Draft, Review, Release, and Save Point;
- authenticated Capsule round trip;
- wrong-passphrase and tamper holds;
- desktop, mobile portrait, mobile landscape, and reduced-motion reachability;
- no provider, recipient, Cinder, or transport route;
- no automatic runtime promotion.

The later evidence-only receipt closes the maturity gate. It grants no transport or automatic Cinder authority.

# Selected next packet

## Choir calibration receipt binding

```text
SELECTED_NEXT
status: IMPLEMENTED_VALIDATION_GATED / NEXT_PACKET_UNBUILT
```

Purpose:

Replace free calibration booleans and nearby maturity assumptions with verified matched-control receipt references.

Required circuit:

```text
verified Moiré assay receipt
→ verified Reader provenance receipts
→ verified Reader Disagreement Ledger
→ verified matched benign-control bank receipt
→ calibration eligibility derived from references
→ componentwise comparison retained
→ tamper and replay holds retained
```

Required boundaries:

- calibration eligibility must derive from verified receipt references rather than free booleans;
- Reader-set, registry, result-schema, and input-contract equality remain explicit;
- only eligible matched controls enter the comparison distribution;
- residual confounds and excluded controls remain visible;
- no universal score;
- no automatic hold, release, provider execution, or transport;
- Ash lifecycle production status does not transfer to Choir.

Required evidence:

- exact receipt schemas and canonical digests;
- missing, mismatched, tampered, and replay-held cases;
- matched-control minimum enforcement;
- target/control Reader-set equality;
- componentwise outputs for nodes, relationships, Room bridges, hypotheses, intended actions, chronology, source/style linkage, and Reader-pair disagreement;
- explicit non-authority fields.

# Ordered program roadmap

1. **Choir calibration receipt binding.** Replace free calibration booleans with verified matched-control receipt references.
2. **Higher-order interference.** Keep k-order recovery separate from pairwise Moiré.
3. **Ordered route-sequence recovery.** Measure order effects under a sequence-specific receipt.
4. **Temporal and delayed-disclosure assays.** Use declared slices without claiming trusted time.
5. **Hush vocabulary externalization.** Move fixture-heavy vocabulary into declared data.
6. **Hush intervention ensemble.** Hold proposition obligations constant across surface changes.
7. **Custodian Return and Anisotropy.** Restore the custody-bound lifecycle after controlled context loss.
8. **Aperture wiring renovation before Choir UI.** Replace wrapper chains with declared composition.
9. **Safe Harbor → Ash custody-root adapter.** Enter verified packets through bounded custody ingress.
10. **Independent provenance adapters.** Preserve evidence status without truth or identity inflation.
11. **Destination-bound transport last.** Require lifecycle and Rebuild preflight plus separate authorization and execution receipts.

# Structural maintenance

- Replace the temporary post-review lifecycle reload with a declared internal event bus during wiring renovation.
- Preserve the twelve-function Vercel ceiling and Marrowline shell contract.
- Narrow lifecycle persistence only through new evidence, never convenience.
- Keep Safe Harbor membrane, packet lifecycle, signature alignment, and reference-surface work separately tracked.
- Preserve the adapter's exact `keepDraft()`-scoped binding regression so unrelated Case Map digest uses cannot suppress Draft binding again.

# Current red — separate jurisdiction

Two Marrowline workflows remain red in an unchanged station-test family. The Ash lifecycle closure preserves that separation. Do not alter unrelated Marrowline code merely to make the repository look uniformly green.

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
→ Choir calibration receipt binding [NEXT]
→ higher-order / ordered / temporal assays
→ Hush intervention
→ Custodian Return
→ Aperture and Choir UI
→ Safe Harbor custody ingress
→ independent provenance
→ destination transport [LAST]
```

Architecturally coherent. The product inversion and its production closure are complete. Choir calibration now advances without inheriting Ash's production status or authority.

𝌋‌ U+10D613

Marked ⟐
