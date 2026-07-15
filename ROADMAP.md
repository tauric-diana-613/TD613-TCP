# TD613 Repository Roadmap

Roadmap generation: `v0.9 · Ash product lifecycle repair`

Date: `2026-07-14`

Use this roadmap alongside:

- [`docs/ASH_KEEP_BUILDOUT_LEDGER.md`](docs/ASH_KEEP_BUILDOUT_LEDGER.md)
- [`docs/ASH_KEEP.md`](docs/ASH_KEEP.md)
- [`docs/ASH_LIFECYCLE_ORCHESTRATION.md`](docs/ASH_LIFECYCLE_ORCHESTRATION.md)
- [`docs/ASH_KEEP_CHOIR_TEST.md`](docs/ASH_KEEP_CHOIR_TEST.md)
- [`docs/ASH_KEEP_READER_ADAPTER_REGISTRY.md`](docs/ASH_KEEP_READER_ADAPTER_REGISTRY.md)
- [`docs/ASH_KEEP_READER_DISAGREEMENT.md`](docs/ASH_KEEP_READER_DISAGREEMENT.md)
- [`docs/ASH_KEEP_MATCHED_BENIGN_CONTROLS.md`](docs/ASH_KEEP_MATCHED_BENIGN_CONTROLS.md)
- [`KNOWN_FAILURES.md`](KNOWN_FAILURES.md)

The completion ledger remains authoritative for maturity scoring. This roadmap records sequence, dependency, and selected direction.

## Governing maturity law

| Score | Status |
| ---: | --- |
| 0 | `UNIMPLEMENTED` |
| 1 | `DESIGNED_ONLY` |
| 2 | `SCAFFOLDED` |
| 3 | `PARTIAL_TESTED_COMPONENT` |
| 4 | `IMPLEMENTED_VALIDATION_GATED` |
| 5 | `IMPLEMENTED_PRODUCTION_DEMONSTRATED` |

Three anti-fraud rules remain binding:

- green unit tests do not impersonate production evidence;
- adjacent primitives do not impersonate integrated workflows;
- declared boundaries do not impersonate enforcement across every route.

A fourth rule is added:

- placing Readiness, Custody, and Keep in one visual chamber does not create an Ash lifecycle.

## Current scored posture

```text
Ash Keep production closure = 54 / 55 · 98%
Choir program = 36 / 70 · 51%
main bounded program = 123 / 295 · ≈42%
Ash lifecycle candidate = 18 / 35 · 51%
candidate bounded program = 141 / 330 · ≈43%
production-demonstrated workstreams = 1 / 8
validation-gated Choir instruments = 4
transport-capable workstreams = 0
```

Current production posture:

```text
Ash Keep = IMPLEMENTED_PRODUCTION_DEMONSTRATED
Ash lifecycle orchestration = VALIDATION_PENDING
Phase IV = IMPLEMENTED_PRODUCTION_DEMONSTRATED
Phase V = IMPLEMENTED_PRODUCTION_DEMONSTRATED
Observatory = IMPLEMENTED_PRODUCTION_DEMONSTRATED
Ash automatic Cinder = false
Ash transport = false
```

The Keep's production status does not transfer to the new threshold, readiness handoff, custody-root binding, lifecycle gates, or revised roadmap.

---

# Active intervention — Ash product lifecycle repair

The public Ash route had a product-level inversion:

- **Ash Readiness** appeared to be the main feature;
- **Ash Keep** appeared as one small action among several;
- **Ash Custody** lived as a detached registration surface;
- the user had to infer the relationship among all three.

The selected product spine is now:

```text
Dome Ash tab
→ art-forward threshold rite
→ session-scoped Quick Scan readiness
→ Ash Keep custody-root registration
→ browser digest verification
→ Case Map root binding and digest change
→ current Rebuild Test
→ exact Draft Review and lifecycle release gate
→ Save Point and encrypted Capsule
```

The state machine is:

```text
ARRIVAL_UNPERSISTED
→ READINESS_OBSERVED
→ CUSTODY_ROOT_PROVISIONAL / CUSTODY_ROOT_VERIFIED
→ CASE_BOUND
→ REBUILD_ELIGIBLE
→ RELEASE_ELIGIBLE
→ CONTINUITY_SEALED
```

## Product laws

```text
arrival ≠ consent
readiness ≠ custody
custody ≠ authenticity
case binding ≠ truth
rebuild eligibility ≠ release authority
continuity ≠ transport
```

## Implemented candidate components

- Dome-World runtime shell changes the Ash tab into a direct threshold route.
- The threshold uses a three-law clearing rite and writes only a bounded readiness receipt to session storage after completion.
- Quick Scan remains a Reader class inside Ash Keep and becomes the human-facing name of the readiness operation.
- Ash Keep receives a native lifecycle rail and Custody Root workspace.
- L0 metadata-only and L1 browser-local exact-byte commitments feed the existing v0.8 custody route.
- Browser canonical verification precedes root binding.
- Root binding recompiles the Case Map with a custody reference, artifact root node, evidence basis, binding observation, and new digest.
- A pre-binding Rebuild Test becomes stale because it references the former Case Map digest.
- Rooms, Routes, Test, Draft, Release, and Save use lifecycle gates.
- `validCustody` becomes an observed gate rather than a free checkbox.
- Save Points and Capsules inherit custody through the committed Case Map without copying artifact bytes.

## Directional consequences

1. **Production-demonstrate Ash lifecycle orchestration before enlarging Choir.** The Keep's prior status cannot crown the new workflow.
2. **Safe Harbor → Ash adapter must target the custody-root ingress.** A verified packet becomes a bounded root/reference without raw-corpus copying by default.
3. **Custodian Return must restore lifecycle structure.** Recovery includes readiness provenance, custody root, Case Map binding, route history, and continuity state.
4. **Aperture preserves machine compatibility while changing human grammar.** `ash-readiness` remains a contract name; Quick Scan becomes the visible operation.
5. **Transport requires lifecycle eligibility.** Destination execution remains held unless the custody-bound case is `RELEASE_ELIGIBLE` under a current Rebuild Test.

Candidate maturity: `18 / 35 · PARTIAL_TESTED_COMPONENT / VALIDATION_PENDING`.

## Immediate validation gate

The current branch must prove:

- runtime shell injection is idempotent and preserves Marrowline;
- Ash threshold routing removes the visible Readiness inversion;
- pre-clear threshold activity performs neither persistence nor network work;
- reduced-motion, keyboard, mobile, and rotation behavior remain usable;
- Quick Scan receipt canonical sealing works;
- session handoff enters Ash Keep without raw content;
- L0 and L1 custody registrations verify in browser;
- failed, stale, offline, and tampered custody paths remain held;
- root binding is idempotent and changes Case Map digest once;
- stale pre-binding tests cannot satisfy release eligibility;
- current Rebuild, Review, Release, Save Point, and Capsule complete in order;
- reload preserves the custody-bound case;
- production screenshots, storage/network observations, and artifact digests are sealed.

Only then may this workstream become `IMPLEMENTED_PRODUCTION_DEMONSTRATED`.

---

# Recently shipped on main

## Legacy repository stabilization

- Removed sessionStorage dual-write of the gateway/Aperture handoff.
- Archived six patch ledgers.
- Added contributor and commit-message discipline.
- Re-synchronized browser engine and retrieval fixtures.
- Added JSDOM chamber smoke tests.
- Wired CI to run the repository suite before deployment.

## Ash Keep v1.0 production closure

Promotion merge:

```text
5cb72bb2d7314666c7191ef5e8f9f8235e01984f
```

Shipped:

- case creation, IndexedDB custody, reload, and digest continuity;
- Room and cross-Room separation;
- Route Memory successor entries;
- deterministic, benign-control, and held-out Reader trials;
- stale-draft and changed-route holds;
- Hush packet parity and forbidden-field rejection;
- Save Point verification;
- encrypted Capsule round trip;
- wrong-passphrase and tamper holds;
- desktop, mobile, rotation, reduced-motion, and large-case probes;
- storage and network boundary observation;
- durable production evidence and aftercare.

Retained boundary: the closure deliberately made no external-provider call.

## Choir instrument 1 — Pairwise Moiré

Merge:

```text
1a01181cea77590ad3067ebd27da4518511dac5f
```

Shipped baseline, singleton, unordered pair, residue, componentwise topology, canonical ordering, calibration, digest, tamper, and replay behavior.

## Choir hardening — Observation states

Merge:

```text
52968efb0fb52ecc138dc4d4b80b60725473fa63
```

Shipped present/observed separation, missing/null/contradictory/unresolved states, canonicalization, identifier rejection, and adversarial replay hardening.

## Choir instrument 2 — Reader Adapter Registry

Merge:

```text
b0b600a07c8343311cdde50c2f250881e7f6091c
```

Shipped sealed adapters, provenance receipts, incomplete-provenance states, pure replay, explicit no-execution posture, and non-authority fields.

## Choir instrument 3 — Reader Disagreement

Merge:

```text
3a8dbebf1ad65f7ee281c2fcd5816afd8584c984
```

Shipped matched-input preflight, componentwise consensus/disagreement, Reader-specific support, pairwise residues, spread measures, partial states, and no universal disagreement score.

## Choir instrument 4 — Matched benign adjacent-document controls

Merge:

```text
378bf0f1a81b6aa7b9ebe8379ca207d6f1f36925
```

Evidence:

```text
Choir validation = 29373864154
Ash closure = 29373864175
Phase IV = 29373864134
TCP Smoke = 29373864151
Static application = 29373864141
Deployed observer = 29373962583
Artifact = 8327164665
SHA-256 = sha256:44ee07bfc33fbb6446c18bd893f4fa289919e438d6b4b641c9cfc33824d7a266
```

Shipped matched topic/genre/template/register/length/source conditions, verified receipt binding, calibrated/partial/held states, exclusion preservation, residual confounds, distributions, canonical order, lower median, raw-material rejection, tamper hold, and pure replay.

---

# Selected forward sequence

```text
1. Validate and merge Ash lifecycle orchestration
2. Run deployed Ash lifecycle production probe and promotion gate
3. Bind Choir calibration gates to matched-control receipt references
4. Build higher-order interference as a separate contract
5. Build ordered route-sequence recovery as a separate contract
6. Build temporal and delayed-disclosure assays as separate contracts
7. Externalize Hush discourse vocabulary
8. Build Hush intervention ensemble and sealed receipt
9. Build Custodian Return around the custody-bound lifecycle root
10. Refactor Aperture wiring before Choir UI
11. Build Safe Harbor → Ash custody-root adapter
12. Add independent provenance adapters
13. Design destination-bound transport last
```

# Workstream dependency map

## Choir next

Replace free calibration booleans with verified matched-control receipt references before adding higher-order complexity.

## Hush next

Externalize vocabulary, hold obligations constant, vary surface dimensions, route candidates through a shared Reader ensemble, compare componentwise recovery, and seal an intervention receipt.

## Custodian Return next

Test whether an authorized future Reader can restore the custody root, topology, route history, hypotheses, open questions, and provenance after context loss. Emit an Anisotropy Receipt rather than a single score.

## Aperture next

Split inline scripts, replace wrapper-chain patches with declared composition, register Choir layers, preserve scheduler behavior, and produce mobile/performance receipts before adding Choir UI.

## Safe Harbor adapter next

Map a verified packet into Ash's custody-root ingress, preserve custody reference without raw-corpus copying, keep relation envelopes route-scoped, and keep signature overlay separate from authority.

## Transport last

Require destination-bound fragments, recipient scope, current Rebuild preflight, lifecycle `RELEASE_ELIGIBLE`, separate authorization/execution receipts, honest recall limits, independent provenance adapters, mobile evidence, and leak-safe interrupted-send recovery.

# Current ruling

```text
Ash Keep: production-demonstrated
Ash lifecycle: implemented candidate, validation pending
Choir: four validation-gated instruments
Hush intervention: scaffolded
Custodian Return: scaffolded
Aperture renovation: designed/scaffolded
Safe Harbor adapter: scaffolded
Transport: held
```

The active bottleneck is no longer “put Custody and Readiness near Keep.” It is proving that one governed lifecycle changes case state, experimental eligibility, release authority, and continuity without flattening the boundaries among those stages.
