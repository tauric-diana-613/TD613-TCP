# TD613 Buildout Completion and Anti-Drift Ledger

Date: `2026-07-14`

Ledger generation: `v0.5 · post-Reader-provenance-registry`

Tracked program: Ash Keep / Choir Test / anisotropic disclosure research program

Latest transition: PR #290 merged at `b0b600a07c8343311cdde50c2f250881e7f6091c`

## Purpose

This ledger compares the recommended buildout against the repository after:

1. Ash Keep v1.0 earned production-demonstrated status;
2. the promoted Ash posture survived deployed aftercare;
3. the bounded pairwise Choir core merged onto `main`;
4. Choir v0.1 gained adversarial observation-state, canonicalization, and Case Map boundary hardening;
5. Reader adapter provenance, result provenance, and pure replay receipts merged onto `main`;
6. Ash’s deployed observer passed again with the provenance spine present.

It separates production-demonstrated stations, validation-gated instruments, adjacent primitives, designed-only work, and deliberately held transport work.

A green unit test is not a production demonstration. A merged engine is not a deployed instrument. A production-demonstrated station does not transfer status to a new instrument that imports its contracts. Present evidence is not necessarily usable evidence. Provenance bound is not truth. Relation is not merger; adjacency is not authority.

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
| B. Choir Test / pairwise Moiré assay | 30 / 70 | **31 / 70** | **44%** | Provenance spine on `main` | Pairwise core and Reader provenance `IMPLEMENTED_VALIDATION_GATED`; broader Choir partial |
| C. Hush intervention ensemble | 7 / 35 | **7 / 35** | **20%** | Adjacent Hush primitives | `SCAFFOLDED` |
| D. Custodian Return Test / Anisotropy Receipt | 7 / 35 | **7 / 35** | **20%** | Continuity primitives exist; assay absent | `SCAFFOLDED` |
| E. Aperture wiring renovation | 6 / 25 | **6 / 25** | **24%** | Roadmap plus scheduler constraints | `DESIGNED_ONLY / SCAFFOLDED` |
| F. Safe Harbor → Ash bounded adapter | 6 / 30 | **6 / 30** | **20%** | Hook and provenance primitives exist; adapter absent | `SCAFFOLDED` |
| G. Destination-bound recipient transport | 7 / 45 | **7 / 45** | **16%** | Release/recall primitives only; transport intentionally absent | `HELD / SCAFFOLDED` |

## Aggregate

```text
program maturity on main = 118 / 295 ≈ 40%
production-demonstrated workstreams = 1 / 7
validation-gated instruments on main = pairwise Moiré assay + Reader provenance registry
transport-capable workstreams = 0
```

### Arithmetic lineage

The v0.3 B-row values summed to `30`, while the executive score and aggregate carried `26`. Ledger v0.4 corrected that stale arithmetic without retroactively claiming that PR #288 created four new maturity points.

Ledger v0.5 adds one maturity point because B4 now has a sealed registry, receipt-bound provenance, replay, schemas, focused validation, and CI coverage on `main`.

The aggregate does not imply that the architecture is 40% safe, private, truthful, complete, or scientifically validated.

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
| A4 | Deterministic, benign-control, and held-out Reader trials | 5 | `IMPLEMENTED_PRODUCTION_DEMONSTRATED` | Calibrated trials and replay verified. |
| A5 | Stale-draft and changed-route holds | 5 | `IMPLEMENTED_PRODUCTION_DEMONSTRATED` | Exact binding passed; stale version and changed route rejected. |
| A6 | Hush packet parity and forbidden-field rejection | 4 | `IMPLEMENTED_VALIDATION_GATED` | Local/API contracts are green; deployed closure deliberately made no external-provider call. |
| A7 | Save Point verification | 5 | `IMPLEMENTED_PRODUCTION_DEMONSTRATED` | Save Point sealed in deployed browser workflow. |
| A8 | Capsule export/import, wrong-passphrase, tamper holds | 5 | `IMPLEMENTED_PRODUCTION_DEMONSTRATED` | Authenticated return and failure holds observed. |
| A9 | Desktop/mobile/rotation/reduced-motion/scale behavior | 5 | `IMPLEMENTED_PRODUCTION_DEMONSTRATED` | Zero unreachable controls; 250-node/400-edge fixture verified. |
| A10 | Arrival triggers neither persistence nor transport | 5 | `IMPLEMENTED_PRODUCTION_DEMONSTRATED` | Zero pre-gesture persistence and non-read/recipient requests. |
| A11 | Durable receipt, synchronized release, aftercare | 5 | `IMPLEMENTED_PRODUCTION_DEMONSTRATED` | Production posture preserved with transport and Cinder false. |

## A ruling

Ash Keep production closure is complete. The retained point protects a jurisdictional fact: a no-call closure assay cannot production-demonstrate an external-provider route.

---

# B. Choir Test / pairwise Moiré Rebuild Assay

Status: `IMPLEMENTED_VALIDATION_GATED`

Repository state: `PROVENANCE_ON_MAIN`

Core merge: `1a01181cea77590ad3067ebd27da4518511dac5f`

Hardening merge: `52968efb0fb52ecc138dc4d4b80b60725473fa63`

Reader provenance merge: `b0b600a07c8343311cdde50c2f250881e7f6091c`

Score: `31 / 70`

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
- Hardening head: `cf7148ca50de44c86652799e9057b596de41d923`
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
- Reader provenance head: `f70757517d8effecad616ecbffe2b21d3bebfa89`
- Reader provenance merge: `b0b600a07c8343311cdde50c2f250881e7f6091c`
- Choir validation run: `29370348510`
- Ash Production Closure run: `29370348382`
- Dome-World Phase IV run: `29370348470`
- TCP Smoke run: `29370348297`
- Static application run: `29370348414`
- Post-provenance deployed observer run: `29370525244`
- Post-provenance evidence artifact: `8325870766`
- Post-provenance artifact SHA-256: `sha256:8ede7d290498fa48488d2ab5193dbbbc7c09c9779cb26d3dc832775c830c4b90`

The deployed aftercare establishes non-disturbance of Ash’s production posture with the hardened Choir engine and Reader provenance spine present. It does not constitute Choir production evidence, provider execution evidence, or truth validation for any Reader result.

| ID | Buildout | Score | Status | Evidence / gap | Bring forward |
| --- | --- | ---: | --- | --- | --- |
| B1 | Baseline + singleton + unordered pair observations | 4 | `IMPLEMENTED_VALIDATION_GATED` | Complete pairwise lattice; present and observed coverage are distinct. | Preserve as invariant in future Reader comparison. |
| B2 | Emergent residue against baseline and both singletons | 4 | `IMPLEMENTED_VALIDATION_GATED` | Difference term implemented; unresolved evidence cannot produce emergent residue. | Add independent algebraic fixture families across Reader classes. |
| B3 | Componentwise nodes, relationships, bridges, hypotheses, actions, chronology, style linkage | 4 | `IMPLEMENTED_VALIDATION_GATED` | Case Map boundary rejects unknown recovered IDs; no sovereign privacy score. | Compare each dimension without scalar collapse. |
| B4 | Named imported, synthetic, local, deterministic Readers | 4 | `IMPLEMENTED_VALIDATION_GATED` | Adapter registry, result provenance, incomplete-provider state, schemas, replay, and CI are on `main`. Registry performs no Reader execution. | Add synthetic/local-runtime fixture coverage and normalize mixed-case adapter enum declarations before disagreement promotion. |
| B5 | Canonical projection ordering | 4 | `IMPLEMENTED_VALIDATION_GATED` | Projection/result permutations seal identically; duplicate IDs and keys reject. | Preserve canonicalization across disagreement inputs. |
| B6 | Preregistration, coverage, controls, held-out, drift, alternate Reader, thresholds | 4 | `IMPLEMENTED_VALIDATION_GATED` | Calibration requires every required observation to be `OBSERVED`, not merely present. | Replace free booleans with receipt references where practical. |
| B7 | Digest verification, tamper hold, pure replay | 4 | `IMPLEMENTED_VALIDATION_GATED` | Node WebCrypto digest parity and replay invariants pass; no network/storage/re-execution. | Bind disagreement rows to verified provenance digests. |
| B8 | Three-way and higher-order combinations | 0 | `UNIMPLEMENTED` | v0.1 stops at pairs. | Define bounded k-order contract and budget after disagreement. |
| B9 | Route-order permutations | 0 | `UNIMPLEMENTED` | Unordered pairing cannot measure sequence. | Build distinct ordered-sequence assay. |
| B10 | Delayed disclosures / temporal spacing | 0 | `UNIMPLEMENTED` | No temporal-memory operator. | Add declared slices without trusted-time claim. |
| B11 | Same obligations under different registers | 0 | `UNIMPLEMENTED` | No Hush intervention bridge. | Route obligation-bound candidates as interventions. |
| B12 | Benign adjacent-document control bank | 2 | `SCAFFOLDED` | Control flag exists; matched bank absent. | Add topic/genre/template-matched controls. |
| B13 | Cross-Reader comparison and disagreement residue | 1 | `DESIGNED_ONLY` | Provenance prerequisite now exists; comparison engine remains absent. | Build Reader-by-Reader disagreement ledger with matched inputs and componentwise residue. |
| B14 | Public/operator UI and Choir production demonstration | 0 | `UNIMPLEMENTED` | Engine-first only. | Integrate after Aperture refactor and mobile gate. |

## B ruling

Choir v0.1 now distinguishes complete coverage from usable observed coverage, canonicalizes semantically equivalent inputs, rejects unknown Case Map identifiers, and preserves all non-claims. Reader outputs can now carry verified adapter provenance without raw content, provider execution, or truth claims. The pairwise instrument and provenance spine remain validation-gated. The next unfinished dependency is Reader disagreement, not Reader provenance.

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
1. Normalize adapter enum case and add synthetic/local-runtime provenance fixtures
2. Build cross-Reader comparison and disagreement residue
3. Add matched benign adjacent-document control bank
4. Implement higher-order, ordered-sequence, and temporal assays as separate contracts
5. Externalize Hush discourse vocabulary
6. Build Hush intervention ensemble and receipt
7. Build Custodian Return Test and Anisotropy Receipt
8. Refactor Aperture wiring before Choir UI
9. Build Safe Harbor → Ash bounded adapter
10. Add independent provenance adapters
11. Design destination-bound transport last
```

## Immediate next packet

The next repository change should build a bounded Reader disagreement ledger after one provenance preflight hardening:

- canonicalize adapter acquisition-route and execution-environment enums before sealing;
- add synthetic-fixture and local-runtime provenance fixtures;
- require every compared result to carry a verified provenance receipt;
- require matched Case Map, Route Memory, Reader-input, and result-schema references;
- preserve each Reader’s observation state and provenance state;
- compute disagreement componentwise across nodes, relationships, Room bridges, hypotheses, actions, chronology, and source/style linkage;
- preserve missingness, alternatives, and incomplete-provider provenance;
- emit no universal privacy score;
- grant no identity, authorship, ownership, surveillance, release, hold, prediction, transport, provider-call, or production authority;
- replay disagreement without rerunning Readers.

## Final ruling

Ash Keep v1.0 is production-demonstrated. Choir v0.1 is merged, adversarially hardened, provenance-bound, and validation-gated. Their coexistence has been observed on the deployed Ash route without transfer of Choir production status or provider-execution authority. The bounded program is now **118 / 295 ≈ 40% implemented by ledger arithmetic**, with one production-demonstrated workstream and two distinct validation-gated Choir instruments on `main`.

𝌋‌ U+10D613

Marked ⟐
