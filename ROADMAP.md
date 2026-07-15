# TD613 Repository Roadmap

Roadmap generation: `v1.0 · Ash lifecycle merged / production closure selected`

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

Green tests do not impersonate production evidence. Shared chambers do not impersonate lifecycle integration. Production status does not transfer from Ash Keep to the complete Ash lifecycle.

## Current posture

```text
Ash Keep = 54 / 55 · production-demonstrated
Choir = 36 / 70 · validation-gated
Ash lifecycle = 24 / 35 · validation-gated
full bounded program = 147 / 330 · ≈45%
production-demonstrated workstreams = 1 / 8
transport-capable workstreams = 0
```

Ash transport and automatic Cinder remain false.

# Shipped spine

## Ash Keep v1.0

Production merge: `5cb72bb2d7314666c7191ef5e8f9f8235e01984f`

The Keep demonstrated local case custody, Rooms, Route Memory, Rebuild Tests, Draft review, release receipts, Save Points, encrypted Capsules, mobile behavior, and zero recipient transport. That evidence predates the complete lifecycle.

## Choir instruments 1–4

```text
pairwise Moiré            1a01181cea77590ad3067ebd27da4518511dac5f
observation hardening     52968efb0fb52ecc138dc4d4b80b60725473fa63
Reader provenance         b0b600a07c8343311cdde50c2f250881e7f6091c
Reader disagreement       3a8dbebf1ad65f7ee281c2fcd5816afd8584c984
matched controls          378bf0f1a81b6aa7b9ebe8379ca207d6f1f36925
```

All remain validation-gated.

## Ash product lifecycle repair

PR `#297`, merge `af733b26f835bc5f110e251addbc49b5d75a75e0`

```text
ARRIVAL_UNPERSISTED
→ READINESS_OBSERVED
→ CUSTODY_ROOT_PROVISIONAL / CUSTODY_ROOT_VERIFIED
→ CASE_BOUND
→ REBUILD_ELIGIBLE
→ RELEASE_ELIGIBLE
→ CONTINUITY_SEALED
```

The Dome Ash tab now enters an art-forward threshold. Quick Scan carries session-only readiness. Ash Custody is a native Keep workspace. A verified root changes the Case Map digest and invalidates stale downstream authority. Draft, Review, Release, Save Point, and Capsule are bound to the current Case Map.

Human grammar:

```text
Ash = complete lifecycle
Ash Keep = case-custody workspace and orchestrator
Quick Scan = readiness observation
Ash Custody Root = verified case root
ash-readiness = machine/API compatibility term
```

The former direct-to-Keep deployed observer is obsolete. Its failure remains evidence that the probe no longer represented the governed route.

# Selected next packet

## Ash lifecycle production closure

```text
SELECTED_NEXT
branch: agent/ash-lifecycle-production-closure
status: NOT_YET_EARNED
```

Required circuit:

```text
threshold wrong-order reset
→ Arrival → Boundary → Custody
→ session-only readiness
→ pre-custody workspace hold
→ local L1 artifact commitment
→ custody registration and digest verification
→ custody-root Case Map binding
→ current Rebuild Test
→ Case Map-bound Draft and Review
→ Release Receipt
→ Save Point and encrypted Capsule
→ CONTINUITY_SEALED
```

Required boundaries:

- no persistence before threshold clearance;
- no raw content in readiness;
- artifact bytes remain browser-local;
- one allowed custody-registration POST;
- no artifact content in the request body;
- no provider, recipient, Cinder, or transport route;
- no automatic promotion;
- declared storage keys only;
- wrong-passphrase and tamper holds;
- desktop, mobile portrait, mobile landscape, and reduced-motion reachability.

Required evidence:

- observed commit and deployment run;
- lifecycle observer run and terminal status ID;
- artifact ID and SHA-256;
- threshold and Keep route-readiness receipt;
- report and evidence-manifest digests;
- screenshot digests;
- custody manifest and receipt digests;
- before/after Case Map digests;
- Rebuild, Draft, Review, Release, Save Point, and Capsule references;
- storage and network receipts;
- `promotion_authorized: false`.

A passing workflow creates evidence. A later evidence-only commit must verify that evidence before H can move to production-demonstrated.

# Ordered program roadmap

1. **Ash lifecycle production closure.** Run and evidence-close the selected packet.
2. **Choir calibration receipt binding — AFTER lifecycle closure.** Replace free calibration booleans with verified matched-control receipt references.
3. **Higher-order interference.** Keep k-order recovery separate from pairwise Moiré.
4. **Ordered route-sequence recovery.** Measure order effects under a sequence-specific receipt.
5. **Temporal and delayed-disclosure assays.** Use declared slices without claiming trusted time.
6. **Hush vocabulary externalization.** Move fixture-heavy vocabulary into declared data.
7. **Hush intervention ensemble.** Hold proposition obligations constant across surface changes.
8. **Custodian Return and Anisotropy.** Restore the custody-bound lifecycle after controlled context loss.
9. **Aperture wiring renovation before Choir UI.** Replace wrapper chains with declared composition.
10. **Safe Harbor → Ash custody-root adapter.** Enter verified packets through bounded custody ingress.
11. **Independent provenance adapters.** Preserve evidence status without truth or identity inflation.
12. **Destination-bound transport last.** Require lifecycle and Rebuild preflight plus separate authorization and execution receipts.

# Structural maintenance

- Replace the temporary post-review lifecycle reload with a declared internal event bus during wiring renovation.
- Preserve the twelve-function Vercel ceiling and Marrowline shell contract.
- Narrow lifecycle persistence after deployed evidence identifies the minimum retrieval surface.
- Keep Safe Harbor membrane, packet lifecycle, signature alignment, and reference-surface work separately tracked.

# Current red — separate jurisdiction

Two Marrowline workflows remain red in an unchanged station-test family. PR #297 preserved every PR-sensitive Vercel invariant asserted by that test. Do not alter unrelated Marrowline code merely to make the Ash lane look greener.

# Final route

```text
Ash threshold
→ Quick Scan readiness
→ custody root
→ Case Map binding
→ Rebuild
→ Draft / Review / Release
→ continuity
→ lifecycle production closure [NEXT]
→ Choir calibration
→ higher-order / ordered / temporal assays
→ Hush intervention
→ Custodian Return
→ Aperture and Choir UI
→ Safe Harbor custody ingress
→ independent provenance
→ destination transport [LAST]
```

Architecturally coherent. The product inversion is repaired. The lifecycle remains validation-gated until deployed evidence earns the next status.

𝌋‌ U+10D613

Marked ⟐
