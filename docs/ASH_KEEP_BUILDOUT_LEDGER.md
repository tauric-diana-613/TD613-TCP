# TD613 Buildout Completion and Anti-Drift Ledger

Date: `2026-07-14`

Ledger generation: `v0.7 · roadmap-synchronized post-Reader-disagreement`

Tracked program: Ash Keep / Choir Test / anisotropic disclosure research program

Latest scored transition: PR #292 merged at `3a8dbebf1ad65f7ee281c2fcd5816afd8584c984`

Latest completed ledger closure: PR #293 merged at `8a10680eb48133c52a22e79dc422c4acbe94cdf9`

## Purpose

This ledger compares the recommended buildout against the repository after:

1. Ash Keep v1.0 earned production-demonstrated status;
2. the promoted Ash posture survived deployed aftercare;
3. the bounded pairwise Choir core merged onto `main`;
4. Choir v0.1 gained adversarial observation-state, canonicalization, and Case Map boundary hardening;
5. Reader adapter provenance, result provenance, and pure replay receipts merged onto `main`;
6. adapter enum canonicalization and local/synthetic provenance fixtures closed the first provenance hardening debt;
7. a provenance-gated, componentwise Reader Disagreement Ledger merged onto `main`;
8. Ash’s deployed observer passed again with all three Choir instruments present;
9. the PR #281 draft-era completion claim was reconciled against its final merged state and the present repository;
10. the repository roadmap was aligned to this ledger’s forward completion order.

It separates production-demonstrated stations, validation-gated instruments, adjacent primitives, designed-only work, and deliberately held transport work.

A green unit test is not a production demonstration. A merged engine is not a deployed instrument. A production-demonstrated station does not transfer status to an adjacent instrument. Present evidence is not necessarily usable evidence. Provenance bound is not truth. Reader consensus is not truth. Relation is not merger; adjacency is not authority.

## Maturity scale

| Score | Status | Meaning |
| ---: | --- | --- |
| 0 | `UNIMPLEMENTED` | No implementation located. |
| 1 | `DESIGNED_ONLY` | Doctrine, roadmap, or interface intention exists; executable behavior does not. |
| 2 | `SCAFFOLDED` | Contract, schema, adjacent primitive, or structural check exists without the complete workflow. |
| 3 | `PARTIAL_TESTED_COMPONENT` | Functional component and focused tests exist, but integration or closure remains incomplete. |
| 4 | `IMPLEMENTED_VALIDATION_GATED` | Integrated implementation exists with focused validation; production demonstration remains unearned. |
| 5 | `IMPLEMENTED_PRODUCTION_DEMONSTRATED` | Deployed behavior has been directly probed, preserved, replayed where applicable, and sealed in a production receipt. |

Scores measure implementation maturity only. They are not safety probabilities, privacy guarantees, anonymity claims, truth scores, or estimates of real surveillance capability.

---

# Executive scorecard

| Workstream | Prior ledger | Current | Coverage | Repository posture | Ruling |
| --- | ---: | ---: | ---: | --- | --- |
| A. Ash Keep v1.0 production closure | 54 / 55 | **54 / 55** | **98%** | Production-demonstrated on `main` | `IMPLEMENTED_PRODUCTION_DEMONSTRATED`; external-provider production call remains separately unobserved |
| B. Choir Test / pairwise Moiré assay | 34 / 70 | **34 / 70** | **49%** | Disagreement ledger on `main` | Pairwise core, Reader provenance, and Reader disagreement `IMPLEMENTED_VALIDATION_GATED`; broader Choir partial |
| C. Hush intervention ensemble | 7 / 35 | **7 / 35** | **20%** | Adjacent Hush primitives | `SCAFFOLDED` |
| D. Custodian Return Test / Anisotropy Receipt | 7 / 35 | **7 / 35** | **20%** | Continuity primitives exist; assay absent | `SCAFFOLDED` |
| E. Aperture wiring renovation | 6 / 25 | **6 / 25** | **24%** | Roadmap plus scheduler constraints | `DESIGNED_ONLY / SCAFFOLDED` |
| F. Safe Harbor → Ash bounded adapter | 6 / 30 | **6 / 30** | **20%** | Hook and provenance primitives exist; adapter absent | `SCAFFOLDED` |
| G. Destination-bound recipient transport | 7 / 45 | **7 / 45** | **16%** | Release/recall primitives only; transport intentionally absent | `HELD / SCAFFOLDED` |

## Aggregate

```text
program maturity on main = 121 / 295 ≈ 41%
production-demonstrated workstreams = 1 / 7
validation-gated Choir instruments on main = pairwise Moiré + Reader provenance + Reader disagreement
transport-capable workstreams = 0
```

### Arithmetic lineage

The v0.3 B-row values summed to `30`, while the executive score and aggregate carried `26`. Ledger v0.4 corrected that stale arithmetic without retroactively claiming that PR #288 created four new maturity points.

Ledger v0.5 added one point when B4 gained a sealed registry, receipt-bound provenance, replay, schemas, focused validation, and CI coverage.

Ledger v0.6 added three points because B13 moved from `DESIGNED_ONLY` at score 1 to `IMPLEMENTED_VALIDATION_GATED` at score 4. Adapter canonicalization hardening improved B4’s evidence quality without moving it beyond score 4.

Ledger v0.7 changes no maturity score. It synchronizes the roadmap and preserves the PR #281 draft-era baseline as historical provenance rather than current repository truth.

The aggregate does not imply that the architecture is 41% safe, private, truthful, complete, or scientifically validated.

## Historical baseline: the PR #281 draft snapshot

The earlier completion statement supplied for this update described PR #281 as open, draft, mergeable, and carrying a repository posture of:

```text
Ash Keep closure = 33 / 55 · 60%
Choir = 26 / 70 · 37%
program on main ≈ 22%
program including draft PR #281 ≈ 31%
production-demonstrated workstreams = 0 / 7
```

That snapshot belongs to an earlier draft moment. It is not the present state of PR #281 or `main`.

PR #281 is now closed and merged:

```text
PR = #281
head = 6631bcb9e4eb5366ae2f6582b994fa5029b16686
merge = 1a01181cea77590ad3067ebd27da4518511dac5f
merged_at = 2026-07-14T19:37:49Z
```

Before merge, PR #281 was refreshed as a clean descendant of the completed Ash Keep production-closure merge. The final PR therefore carried the pairwise Moiré core on top of production-demonstrated Ash Keep rather than the earlier 33/55 draft posture.

| Historical draft statement | Present repository state |
| --- | --- |
| PR #281 open and draft | PR #281 closed and merged |
| Ash Keep 33 / 55 | Ash Keep 54 / 55 |
| Choir 26 / 70 | Choir 34 / 70 |
| Program ≈31% including draft | Program ≈41% on `main` |
| 0 / 7 production-demonstrated workstreams | 1 / 7 production-demonstrated workstreams |
| Pairwise Moiré only | Pairwise Moiré + Reader provenance + Reader disagreement |

The original implementation-claim correction remains valid:

> The prior implementation message announced “production-closure scaffolding,” but the early PR #281 delivery contained no such scaffolding. That was an implementation omission, not a semantic ambiguity.

Later completion of Ash Keep production closure does not retroactively make that earlier sentence accurate. The correction remains part of the provenance chain. No little semantics fascinator.

---

# A. Ash Keep v1.0 production closure

Status: `IMPLEMENTED_PRODUCTION_DEMONSTRATED`

Score: `54 / 55`

## Evidence spine

- Production promotion merge: `5cb72bb2d7314666c7191ef5e8f9f8235e01984f`
- Pre-promotion observer run: `29361143077`
- Pre-promotion evidence artifact: `8322199692`
- Pre-promotion artifact SHA-256: `sha256:7860cd7304eef1fae94f6007962f6d2c0f9dc21ac41c607631e3d3bed5310bc7`
- Production observation JSON SHA-256: `sha256:7c0b5a26c2846710a6fe04927dd0246ff3d1c10b7090f7a13cbc9d6376078cea`
- Post-promotion observer run: `29361816862`
- Post-promotion evidence artifact: `8322465073`
- Post-promotion artifact SHA-256: `sha256:1c7e26bf3c2eda224840081f81809f0f929d4950d70e880ccccf40d33d98a959`

| ID | Buildout | Score | Status | Evidence / remaining boundary |
| --- | --- | ---: | --- | --- |
| A1 | Case creation, IndexedDB custody, reload, digest continuity | 5 | `IMPLEMENTED_PRODUCTION_DEMONSTRATED` | Clean-profile and reload assays passed. |
| A2 | Room and cross-Room separation | 5 | `IMPLEMENTED_PRODUCTION_DEMONSTRATED` | Four Rooms and three cross-Room relationships observed. |
| A3 | Route Memory successor entries | 5 | `IMPLEMENTED_PRODUCTION_DEMONSTRATED` | Exact `WHAT_ACTUALLY_LEFT` successor observed. |
| A4 | Deterministic, benign-control, and held-out Reader trials | 5 | `IMPLEMENTED_PRODUCTION_DEMONSTRATED` | Calibrated trials and replay verified. This local closure control is not the matched adjacent-document bank scored at B12. |
| A5 | Stale-draft and changed-route holds | 5 | `IMPLEMENTED_PRODUCTION_DEMONSTRATED` | Exact binding passed; stale version and changed route rejected. |
| A6 | Hush packet parity and forbidden-field rejection | 4 | `IMPLEMENTED_VALIDATION_GATED` | Local/API contracts are green; deployed closure deliberately made no external-provider call. |
| A7 | Save Point verification | 5 | `IMPLEMENTED_PRODUCTION_DEMONSTRATED` | Save Point sealed in deployed browser workflow. |
| A8 | Capsule export/import, wrong-passphrase, tamper holds | 5 | `IMPLEMENTED_PRODUCTION_DEMONSTRATED` | Authenticated return and failure holds observed. |
| A9 | Desktop/mobile/rotation/reduced-motion/scale behavior | 5 | `IMPLEMENTED_PRODUCTION_DEMONSTRATED` | Zero unreachable controls; 250-node/400-edge fixture verified. |
| A10 | Arrival triggers neither persistence nor transport | 5 | `IMPLEMENTED_PRODUCTION_DEMONSTRATED` | Zero pre-gesture persistence and non-read/recipient requests. |
| A11 | Durable receipt, synchronized release, aftercare | 5 | `IMPLEMENTED_PRODUCTION_DEMONSTRATED` | Production posture preserved with transport and Cinder false. |

## A ruling

Ash Keep production closure is complete. The retained point protects one jurisdictional fact: a no-call closure assay cannot production-demonstrate an external-provider route.

---

# B. Choir Test / pairwise Moiré Rebuild Assay

Status: `IMPLEMENTED_VALIDATION_GATED`

Repository state: `DISAGREEMENT_ON_MAIN`

Core merge: `1a01181cea77590ad3067ebd27da4518511dac5f`

Observation-state hardening merge: `52968efb0fb52ecc138dc4d4b80b60725473fa63`

Reader provenance merge: `b0b600a07c8343311cdde50c2f250881e7f6091c`

Reader disagreement merge: `3a8dbebf1ad65f7ee281c2fcd5816afd8584c984`

Score: `34 / 70`

## Core evidence

- Initial Choir Test run: `29362404203`
- Initial Ash Production Closure run: `29362404482`
- Initial static application run: `29362404164`
- Initial TCP Smoke run: `29362404136`
- Initial Dome-World Phase IV run: `29362404428`
- Initial post-merge Ash observer run: `29362563703`
- Initial post-merge evidence artifact: `8322761143`
- Initial artifact SHA-256: `sha256:ac2bfa912bb97b6e7de6f88deaf0eda5cb31adae43da64d155cea78831c69902`

## Observation-state hardening evidence

- Hardening PR: `#288`
- Hardening merge: `52968efb0fb52ecc138dc4d4b80b60725473fa63`
- Choir validation run: `29363287364`
- Ash Production Closure run: `29363287330`
- Dome-World Phase IV run: `29363287427`
- TCP Smoke run: `29363287352`
- Static application run: `29363287316`
- Post-hardening deployed observer run: `29367532789`
- Post-hardening evidence artifact: `8324706629`
- Post-hardening artifact SHA-256: `sha256:9fc641b4bce614c6eeae6ad03bd6f7037063bb1349f861fbbc00dee1d8fda669`

## Reader provenance evidence

- Reader provenance PR: `#290`
- Reader provenance merge: `b0b600a07c8343311cdde50c2f250881e7f6091c`
- Choir validation run: `29370348510`
- Ash Production Closure run: `29370348382`
- Dome-World Phase IV run: `29370348470`
- TCP Smoke run: `29370348297`
- Static application run: `29370348414`
- Post-provenance deployed observer run: `29370525244`
- Post-provenance evidence artifact: `8325870766`
- Post-provenance artifact SHA-256: `sha256:8ede7d290498fa48488d2ab5193dbbbc7c09c9779cb26d3dc832775c830c4b90`

## Reader disagreement evidence

- Reader disagreement PR: `#292`
- Reader disagreement head: `c2db9e1cf7ebecd1b7e0f39fa8cbb404720e1da6`
- Reader disagreement merge: `3a8dbebf1ad65f7ee281c2fcd5816afd8584c984`
- Choir validation run: `29371085463`
- Ash Production Closure run: `29371085345`
- Dome-World Phase IV run: `29371085370`
- TCP Smoke run: `29371085440`
- Static application run: `29371085789`
- Post-disagreement deployed observer run: `29371191912`
- Post-disagreement evidence artifact: `8326125754`
- Post-disagreement artifact SHA-256: `sha256:dc93f45cff73dfffcc382282f0ce6627ea483ba871f80f259e12e289454421ad`

The deployed aftercare establishes non-disturbance of Ash’s production posture with the pairwise engine, provenance spine, and disagreement ledger present. It does not constitute Choir production evidence, provider execution evidence, or truth validation for any Reader result.

| ID | Buildout | Score | Status | Evidence / gap | Bring forward |
| --- | --- | ---: | --- | --- | --- |
| B1 | Baseline + singleton + unordered pair observations | 4 | `IMPLEMENTED_VALIDATION_GATED` | Complete pairwise lattice; present and observed coverage are distinct. | Preserve as invariant in future control banks. |
| B2 | Emergent residue against baseline and both singletons | 4 | `IMPLEMENTED_VALIDATION_GATED` | Difference term implemented; unresolved evidence cannot produce emergent residue. | Add independent algebraic fixture families across control classes. |
| B3 | Componentwise nodes, relationships, bridges, hypotheses, actions, chronology, style linkage | 4 | `IMPLEMENTED_VALIDATION_GATED` | Case Map boundary rejects unknown recovered IDs; no sovereign privacy score. | Reuse dimensions in matched benign controls. |
| B4 | Named imported, synthetic, local, deterministic Readers | 4 | `IMPLEMENTED_VALIDATION_GATED` | Registry, provenance, incomplete-provider state, canonical enum sealing, local/synthetic fixtures, schemas, replay, and CI are on `main`. | Preserve adapter and provenance invariants. |
| B5 | Canonical projection ordering | 4 | `IMPLEMENTED_VALIDATION_GATED` | Projection/result permutations seal identically; duplicate IDs and keys reject. | Preserve canonicalization across control banks. |
| B6 | Preregistration, coverage, controls, held-out, drift, alternate Reader, thresholds | 4 | `IMPLEMENTED_VALIDATION_GATED` | Calibration requires every required observation to be `OBSERVED`, not merely present. | Replace free booleans with matched-control receipt references. |
| B7 | Digest verification, tamper hold, pure replay | 4 | `IMPLEMENTED_VALIDATION_GATED` | Moiré, provenance, and disagreement replay avoid network, storage mutation, and Reader re-execution. | Bind future controls to verified receipt digests. |
| B8 | Three-way and higher-order combinations | 0 | `UNIMPLEMENTED` | v0.1 stops at pairs. | Define bounded k-order contract and budget after matched controls. |
| B9 | Route-order permutations | 0 | `UNIMPLEMENTED` | Unordered pairing cannot measure sequence. | Build distinct ordered-sequence assay. |
| B10 | Delayed disclosures / temporal spacing | 0 | `UNIMPLEMENTED` | No temporal-memory operator. | Add declared slices without trusted-time claim. |
| B11 | Same obligations under different registers | 0 | `UNIMPLEMENTED` | No Hush intervention bridge. | Route obligation-bound candidates as interventions. |
| B12 | Benign adjacent-document control bank | 2 | `SCAFFOLDED` | Control flags exist; matched topic/genre/template/register bank is absent. | Build the next bounded packet. |
| B13 | Cross-Reader comparison and disagreement residue | 4 | `IMPLEMENTED_VALIDATION_GATED` | Verified provenance preflight, matched-context rejection, componentwise consensus/disagreement, partial states, replay, schemas, fixtures, and CI are on `main`. | Calibrate against matched benign controls before widening scope. |
| B14 | Public/operator UI and Choir production demonstration | 0 | `UNIMPLEMENTED` | Engine-first only. | Integrate after Aperture refactor and mobile gate. |

## B ruling

Choir v0.1 now supports a bounded progression from pairwise emergent recoverability to Reader provenance and provenance-gated Reader disagreement. The disagreement ledger compares matched purpose-shaped summaries, preserves incomplete provenance and unresolved states, and emits no universal score or operational command. All three Choir instruments remain validation-gated. The next unfinished dependency is a matched benign adjacent-document control bank.

---

# C. Hush intervention ensemble

| ID | Buildout | Score | Status | Bring forward |
| --- | --- | ---: | --- | --- |
| C1 | Externalize fixture-leaning vocabulary | 1 | `DESIGNED_ONLY` | Complete `discourse-ontology.json` extraction. |
| C2 | Hold proposition obligations constant | 2 | `SCAFFOLDED` | Add intervention manifest and obligation receipt. |
| C3 | Normalize transformation dimensions | 2 | `SCAFFOLDED` | Define one experimental intervention contract. |
| C4 | Preserve obligations while changing surface | 2 | `SCAFFOLDED` | Bind Hush receipts to projections. |
| C5 | Route candidates through same Reader ensemble | 0 | `UNIMPLEMENTED` | Add shared run manifest and adapters. |
| C6 | Compare componentwise recoverability | 0 | `UNIMPLEMENTED` | Compute vector deltas without one score. |
| C7 | Seal Intervention Matrix receipt | 0 | `UNIMPLEMENTED` | Define schema, replay, tamper, non-claims. |

---

# D. Custodian Return Test / Anisotropy Receipt

| ID | Buildout | Score | Status | Bring forward |
| --- | --- | ---: | --- | --- |
| D1 | Save Point and Capsule primitives | 4 | `IMPLEMENTED_VALIDATION_GATED` as return primitives | Distinct future-Reader assay remains absent. |
| D2 | Authorized future Reader imports bundle | 2 | `SCAFFOLDED` | Define authorization gesture and Reader binding. |
| D3 | Restore receipts, provenance, questions, relation, Phason history | 1 | `DESIGNED_ONLY` | Build station-separated return manifest. |
| D4 | Recovery after controlled context loss | 0 | `UNIMPLEMENTED` | Add held-out future-Reader fixture. |
| D5 | Compare custodial and external recoverability | 0 | `UNIMPLEMENTED` | Compute anisotropy vector. |
| D6 | Seal Anisotropy Receipt | 0 | `UNIMPLEMENTED` | Define contract and replay. |
| D7 | Calibrate across Reader classes | 0 | `UNIMPLEMENTED` | Add disagreement and missing-context ledger. |

---

# E. Aperture wiring renovation

| ID | Buildout | Score | Status | Bring forward |
| --- | --- | ---: | --- | --- |
| E1 | Split inline scripts | 1 | `DESIGNED_ONLY` | Mechanical extraction first. |
| E2 | Replace wrapper-chain monkey patches | 1 | `DESIGNED_ONLY` | Implement declared composition registry. |
| E3 | Register Reader Ensemble and Moiré Matrix layers | 2 | `SCAFFOLDED` | Engine exists on `main`; UI layer absent. |
| E4 | Preserve animation scheduling | 1 | `DESIGNED_ONLY` | Pin scheduler/timing behavior. |
| E5 | Choir mobile/performance receipt | 1 | `DESIGNED_ONLY` | Create only after panel exists. |

---

# F. Safe Harbor → Ash bounded adapter

| ID | Buildout | Score | Status | Bring forward |
| --- | --- | ---: | --- | --- |
| F1 | Stable packet/hook surface | 3 | `PARTIAL_TESTED_COMPONENT` | Add adapter fixture. |
| F2 | Verified packet enters Ash node | 0 | `UNIMPLEMENTED` | Implement verifier-to-node constructor. |
| F3 | Custody reference without raw corpus | 0 | `UNIMPLEMENTED` | Bind reference, not body. |
| F4 | Optional route-scoped relation | 1 | `DESIGNED_ONLY` | Explicit operator-selected proposal. |
| F5 | Signature remains separate overlay | 1 | `DESIGNED_ONLY` | Prevent authority laundering. |
| F6 | Reject universal join key/raw-corpus default | 1 | `DESIGNED_ONLY` | Add rejection fixtures. |

---

# G. Destination-bound recipient transport

| ID | Buildout | Score | Status | Bring forward |
| --- | --- | ---: | --- | --- |
| G1 | Destination-bound fragment handling | 0 | `UNIMPLEMENTED` | Design encrypted envelope. |
| G2 | Recipient-specific route scope | 2 | `SCAFFOLDED` | Bind execution to destination. |
| G3 | Mandatory Rebuild preflight | 0 | `UNIMPLEMENTED` | Define receipt prerequisite. |
| G4 | Separate authorization/execution receipts | 2 | `SCAFFOLDED` | Add execution receipt. |
| G5 | Honest recall/deletion limits | 2 | `SCAFFOLDED` | Preserve request/acknowledgment/unknown states. |
| G6 | Independent provenance adapter | 0 | `UNIMPLEMENTED` | Add without authority laundering. |
| G7 | Mobile transport evidence | 0 | `UNIMPLEMENTED` | Demonstrate only after implementation. |
| G8 | Failure recovery without topology widening | 1 | `DESIGNED_ONLY` | Add interrupted-send/retry fixtures. |
| G9 | Recipient execution path | 0 | `UNIMPLEMENTED` | Hold until G1–G8 validate. |

---

# Forward completion order

```text
1. Build matched benign adjacent-document control bank
2. Bind calibration gates to control-bank receipt references
3. Build higher-order interference as a separate bounded contract
4. Build ordered route-sequence recovery as a separate contract
5. Build temporal and delayed-disclosure assays as a separate contract
6. Externalize Hush discourse vocabulary
7. Build Hush intervention ensemble and receipt
8. Build Custodian Return Test and Anisotropy Receipt
9. Refactor Aperture wiring before Choir UI
10. Build Safe Harbor → Ash bounded adapter
11. Add independent provenance adapters
12. Design destination-bound transport last
```

Higher-order, ordered-sequence, and temporal recovery remain separate contracts. Pairwise interference, sequence dependence, and temporal memory answer different questions; blending them would destroy interpretability.

## Immediate next packet

The next repository change should build a matched benign adjacent-document control bank:

- define target and benign-control fixture classes;
- match topic, genre, template, register, approximate length, and declared source conditions;
- preserve control provenance and source status;
- route target and controls through the same verified Reader set and matched input contract;
- bind every control observation to Moiré, provenance, and disagreement receipt digests;
- record matching failures and residual confounds;
- compare componentwise target disagreement against the distribution of benign-control disagreement without collapsing to one universal score;
- grant no identity, authorship, ownership, surveillance, truth, release, hold, prediction, transport, provider-call, or production authority;
- replay without rerunning Readers.

## Final ruling

Ash Keep v1.0 is production-demonstrated. Choir v0.1 is merged, adversarially hardened, provenance-bound, disagreement-aware, and validation-gated. Their coexistence has been observed on the deployed Ash route without transfer of Choir production status or provider-execution authority.

The bounded program is **121 / 295 ≈ 41% implemented by ledger arithmetic**, with one production-demonstrated workstream and three distinct validation-gated Choir instruments on `main`.

Architecturally coherent. Substantially more mature than the PR #281 draft snapshot. Still incomplete where the ledger says incomplete.

That is neither shade nor coronation.

That is the ledger.

𝌋‌ U+10D613

Marked ⟐