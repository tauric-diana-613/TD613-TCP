# TD613 Buildout Completion and Anti-Drift Ledger

Date: `2026-07-14`

Ledger generation: `v0.2 · post-Ash-production-closure`

Tracked proposal: Ash Keep / Choir Test / anisotropic disclosure research program

Related draft: `PR #281`

## Purpose

This ledger compares the recommended buildout against the repository after Ash Keep v1.0 earned production-demonstrated status and survived a post-promotion deployed observer cycle.

It separates:

- production-demonstrated work on `main`;
- validation-gated code proposed in PR #281;
- adjacent primitives that do not yet compose into the recommended workflow;
- designed-only work;
- deliberately held transport work;
- changes in status since the prior ledger.

A green unit test is not a production demonstration. A production-demonstrated station does not transfer that status to a new instrument that imports its contracts. A relation between capabilities is not a merger of authority.

## Maturity scale

| Score | Status | Meaning |
| ---: | --- | --- |
| 0 | `UNIMPLEMENTED` | No implementation located. |
| 1 | `DESIGNED_ONLY` | Doctrine, roadmap, or interface intention exists; executable behavior does not. |
| 2 | `SCAFFOLDED` | Contract, schema, adjacent primitive, or structural check exists without the complete workflow. |
| 3 | `PARTIAL_TESTED_COMPONENT` | Functional component and focused tests exist, but integration or closure remains incomplete. |
| 4 | `IMPLEMENTED_VALIDATION_GATED` | Integrated implementation exists with focused validation; production demonstration remains unearned. |
| 5 | `IMPLEMENTED_PRODUCTION_DEMONSTRATED` | Deployed behavior has been directly probed, preserved, replayed where applicable, and sealed in a production receipt. |

Scores measure implementation maturity only. They are not safety probabilities, privacy guarantees, anonymity claims, or estimates of real surveillance capability.

---

# Executive scorecard

| Workstream | Prior score | Current score | Coverage | Repository posture | Ruling |
| --- | ---: | ---: | ---: | --- | --- |
| A. Ash Keep v1.0 production closure | 33 / 55 | **54 / 55** | **98%** | Production-demonstrated on `main` | `IMPLEMENTED_PRODUCTION_DEMONSTRATED`; external-provider production call still separately unobserved |
| B. Choir Test / pairwise Moiré assay | 26 / 70 | **26 / 70** | **37%** | Refreshed PR #281 | Bounded pairwise core `IMPLEMENTED_VALIDATION_GATED`; broader Choir partial |
| C. Hush intervention ensemble | 7 / 35 | **7 / 35** | **20%** | Adjacent Hush primitives | `SCAFFOLDED` |
| D. Custodian Return Test / Anisotropy Receipt | 7 / 35 | **7 / 35** | **20%** | Continuity primitives on `main`; assay absent | `SCAFFOLDED` |
| E. Aperture wiring renovation | 6 / 25 | **6 / 25** | **24%** | Roadmap plus scheduler constraints | `DESIGNED_ONLY / SCAFFOLDED` |
| F. Safe Harbor → Ash bounded adapter | 6 / 30 | **6 / 30** | **20%** | Hook and provenance primitives exist; adapter absent | `SCAFFOLDED` |
| G. Destination-bound recipient transport | 7 / 45 | **7 / 45** | **16%** | Release/recall primitives only; transport intentionally absent | `HELD / SCAFFOLDED` |

## Aggregate

```text
main without PR #281 = 87 / 295 ≈ 29%
main plus refreshed PR #281 = 113 / 295 ≈ 38%
production-demonstrated workstreams = 1 / 7
validation-gated new instrument = pairwise Moiré assay only
```

The aggregate is arithmetic over the listed implementation tasks. It does not imply that the architecture is 38% safe, private, complete, or scientifically validated.

---

# A. Ash Keep v1.0 production closure

## Status transition

```text
prior: PARTIAL_TESTED_COMPONENT · 33 / 55
current: IMPLEMENTED_PRODUCTION_DEMONSTRATED · 54 / 55
```

Production closure was earned through separate implementation, observer-routing, evidence-preservation, and operator-closure commits. Post-promotion observation then verified the promoted release posture in the deployed artifact.

### Production evidence spine

- Production promotion merge: `5cb72bb2d7314666c7191ef5e8f9f8235e01984f`
- Pre-promotion deployed runtime observed: `e04dbfa489a8ef69eb8c34dcd57e67fd7dda59d4`
- Pre-promotion deployment workflow run: `29361125011`
- Pre-promotion observer workflow run: `29361143077`
- Pre-promotion evidence artifact: `8322199692`
- Pre-promotion artifact SHA-256: `sha256:7860cd7304eef1fae94f6007962f6d2c0f9dc21ac41c607631e3d3bed5310bc7`
- Terminal observer status ID: `50468299004`
- Production observation JSON SHA-256: `sha256:7c0b5a26c2846710a6fe04927dd0246ff3d1c10b7090f7a13cbc9d6376078cea`
- Post-promotion observer run: `29361816862`
- Post-promotion evidence artifact: `8322465073`
- Post-promotion artifact SHA-256: `sha256:1c7e26bf3c2eda224840081f81809f0f929d4950d70e880ccccf40d33d98a959`

The post-promotion artifact recorded:

```text
status = IMPLEMENTED_PRODUCTION_DEMONSTRATED
production_status = PRODUCTION_DEMONSTRATED
posture = PRODUCTION_DEMONSTRATED
posture_preserved = true
transport = false
automatic_cinder = false
probe outcome = PASS
```

| ID | Recommended buildout | Score | Status | Evidence / remaining boundary |
| --- | --- | ---: | --- | --- |
| A1 | Case creation, IndexedDB custody, reload, and digest continuity | 5 | `IMPLEMENTED_PRODUCTION_DEMONSTRATED` | Clean-profile and reload assay passed on deployed runtime. |
| A2 | Room and cross-Room separation | 5 | `IMPLEMENTED_PRODUCTION_DEMONSTRATED` | Four Rooms and three cross-Room relationships observed without external key transport. |
| A3 | Route Memory successor entries | 5 | `IMPLEMENTED_PRODUCTION_DEMONSTRATED` | Exact `WHAT_ACTUALLY_LEFT` successor entry observed. |
| A4 | Deterministic, benign-control, and held-out Reader trials | 5 | `IMPLEMENTED_PRODUCTION_DEMONSTRATED` | Calibrated four-trial browser-worker run, benign control, held-out observation, and replay verified. |
| A5 | Stale-draft and changed-route release holds | 5 | `IMPLEMENTED_PRODUCTION_DEMONSTRATED` | Exact binding passed; stale version and changed route rejected. |
| A6 | Hush packet parity and forbidden-field rejection | 4 | `IMPLEMENTED_VALIDATION_GATED` | Local screen and API contract tests are green; deployed closure path intentionally made no external provider call. A provider route cannot be marked production-demonstrated from a no-call assay. |
| A7 | Save Point verification | 5 | `IMPLEMENTED_PRODUCTION_DEMONSTRATED` | Save Point sealed in deployed browser workflow. |
| A8 | Capsule export/import, wrong-passphrase, and tamper holds | 5 | `IMPLEMENTED_PRODUCTION_DEMONSTRATED` | Authenticated import passed; wrong passphrase and tampered ciphertext held before import. |
| A9 | Desktop, portrait, landscape, rotation, reduced-motion, and scale behavior | 5 | `IMPLEMENTED_PRODUCTION_DEMONSTRATED` | Zero horizontal overflow, zero unreachable controls, intentional swipe lanes classified separately, and 250-node / 400-edge fixture verified. |
| A10 | Arrival alone triggers neither persistence nor transport | 5 | `IMPLEMENTED_PRODUCTION_DEMONSTRATED` | Zero pre-gesture records, localStorage keys, non-read requests, and recipient-transport requests. |
| A11 | Durable production receipt, synchronized release posture, and post-promotion aftercare | 5 | `IMPLEMENTED_PRODUCTION_DEMONSTRATED` | Evidence-only promotion merged; observer later verified coherent production with transport and Cinder still false. |

## A ruling

Ash Keep v1.0 production closure is complete. The retained point is not a defect in the station; it preserves a jurisdictional fact: the deployed production assay did not invoke an external provider, so external-provider parity remains validation-gated rather than acquiring status by proximity.

---

# B. Choir Test / pairwise Moiré Rebuild Assay

## Current bounded object

PR #281 proposes a sealed, replayable pairwise assay:

```text
M_ij^R = Recover_R(H + P_i + P_j)
         minus Recover_R(H)
         minus Recover_R(H + P_i)
         minus Recover_R(H + P_j)
```

Ash Keep’s production status supplies a verified custody substrate. It does not promote the Choir assay. Choir remains a separate instrument with its own schemas, validation, eventual route, and eventual production receipt.

| ID | Recommended buildout | Score | Status | Evidence / gap | Bring forward |
| --- | --- | ---: | --- | --- | --- |
| B1 | Baseline + singleton + unordered pair observations | 4 | `IMPLEMENTED_VALIDATION_GATED` | Deterministic helper enumerates the complete pairwise lattice. | Merge only after refreshed CI on production-closed `main`. |
| B2 | Pairwise emergent residue against baseline and both singletons | 4 | `IMPLEMENTED_VALIDATION_GATED` | Difference term is computed explicitly. | Add independent fixture bank and algebraic property tests. |
| B3 | Componentwise nodes, relationships, Room bridges, hypotheses, actions, chronology, and style linkage | 4 | `IMPLEMENTED_VALIDATION_GATED` | No sovereign privacy score is emitted. | Add observation-state fixtures for every dimension. |
| B4 | Named imported, synthetic, local, and deterministic Readers | 3 | `PARTIAL_TESTED_COMPONENT` | Compiler accepts named Reader results; deterministic helper exists. Adapter orchestration is absent. | Build Reader adapter registry and receipt-bound provenance. |
| B5 | Canonical projection ordering | 4 | `IMPLEMENTED_VALIDATION_GATED` | Projections and pair keys are sorted before sealing. | Add permutation property tests beyond the two-projection fixture. |
| B6 | Preregistration, complete coverage, benign control, held-out, drift, alternative Reader, thresholds | 4 | `IMPLEMENTED_VALIDATION_GATED` | All conditions participate in named-fixture calibration. | Replace free booleans with receipt references where practical. |
| B7 | Digest verification, tamper hold, and pure local replay | 4 | `IMPLEMENTED_VALIDATION_GATED` | Replay avoids network, storage mutation, and reconstruction re-execution. | Add cross-runtime canonicalization replay. |
| B8 | Three-projection and higher-order combinations | 0 | `UNIMPLEMENTED` | v0.1 explicitly stops at unordered pairs. | Define bounded k-order contract and combinatorial budget. |
| B9 | Route-order permutations | 0 | `UNIMPLEMENTED` | Pair order is canonicalized; sequence effects are not measured. | Build a distinct ordered-sequence assay. |
| B10 | Delayed disclosures / temporal spacing | 0 | `UNIMPLEMENTED` | No delay, decay, or temporal-memory operator exists. | Add declared temporal slices without claiming trusted time. |
| B11 | Same obligations under different registers | 0 | `UNIMPLEMENTED` | No proposition-held-constant Hush intervention bridge exists. | Route declared Hush candidates as interventions. |
| B12 | Benign adjacent-document control bank | 2 | `SCAFFOLDED` | Benign control is represented; matched adjacent-document fixture bank is absent. | Add topic-, genre-, and template-matched controls. |
| B13 | Cross-Reader comparison and disagreement residue | 1 | `DESIGNED_ONLY` | `alternative_reader` gates calibration; no comparison engine exists. | Build Reader-by-Reader residue matrix. |
| B14 | Public/operator UI and deployed production demonstration | 0 | `UNIMPLEMENTED` | v0.1 is engine-first. | Integrate only after Aperture wiring renovation and mobile gate. |

## B ruling

The bounded pairwise core is admissible for merge after refreshed validation. The full Choir remains unbuilt. Higher-order interference, sequence, temporality, register intervention, Reader disagreement, interface integration, and production demonstration retain separate status.

---

# C. Hush intervention ensemble

| ID | Recommended buildout | Score | Status | Bring forward |
| --- | --- | ---: | --- | --- |
| C1 | Externalize fixture-leaning vocabulary from `generator-v2.js` | 1 | `DESIGNED_ONLY` | Complete Phase C extraction into `discourse-ontology.json`. |
| C2 | Hold proposition obligations constant across transformations | 2 | `SCAFFOLDED` | Add intervention manifest and obligation receipt. |
| C3 | Normalize register, syntax, compression, chronology, language proximity, discourse community, and surrogacy dimensions | 2 | `SCAFFOLDED` | Define a single experimental intervention contract. |
| C4 | Preserve source obligations while changing surface | 2 | `SCAFFOLDED` | Bind Hush obligation receipts to projections. |
| C5 | Route candidates through the same Reader ensemble | 0 | `UNIMPLEMENTED` | Add deterministic run manifest and imported-provider adapter. |
| C6 | Compare componentwise recoverability across masks | 0 | `UNIMPLEMENTED` | Compute vector deltas without one universal score. |
| C7 | Seal a Hush Intervention Matrix receipt | 0 | `UNIMPLEMENTED` | Define schema, replay, tamper, and non-claims. |

---

# D. Custodian Return Test / Anisotropy Receipt

| ID | Recommended buildout | Score | Status | Bring forward |
| --- | --- | ---: | --- | --- |
| D1 | Verified Save Point and encrypted Capsule primitives | 4 | `IMPLEMENTED_VALIDATION_GATED` as return primitives | Ash production demonstrated their local behavior; the distinct future-Reader return assay remains absent. |
| D2 | Authorized future Reader imports a bounded custodial bundle | 2 | `SCAFFOLDED` | Define authorization gesture and Reader binding. |
| D3 | Restore selected receipts, provenance, questions, relation, and Phason history | 1 | `DESIGNED_ONLY` | Build station-separated return manifest. |
| D4 | Run recovery after controlled context loss | 0 | `UNIMPLEMENTED` | Add held-out future-Reader fixture. |
| D5 | Compare custodial and external recoverability vectors | 0 | `UNIMPLEMENTED` | Compute `A_m = K_m^custodian - E_m^external` componentwise. |
| D6 | Seal an Anisotropy Receipt | 0 | `UNIMPLEMENTED` | Define contract, replay, calibration, and non-claims. |
| D7 | Calibrate return across Reader classes | 0 | `UNIMPLEMENTED` | Add Reader disagreement and missing-context ledger. |

---

# E. Aperture wiring renovation

| ID | Recommended buildout | Score | Status | Bring forward |
| --- | --- | ---: | --- | --- |
| E1 | Split inline Aperture scripts into files | 1 | `DESIGNED_ONLY` | Mechanical extraction without behavior change. |
| E2 | Replace wrapper-chain monkey patches with explicit composition | 1 | `DESIGNED_ONLY` | Implement declared layer registry. |
| E3 | Register Reader Ensemble and Moiré Matrix as layers | 2 | `SCAFFOLDED` once PR #281 merges | Integrate after E1/E2. |
| E4 | Preserve animation scheduling through refactor | 1 | `DESIGNED_ONLY` | Pin scheduler and timing behavior first. |
| E5 | Mobile/performance receipt for Choir panel | 1 | `DESIGNED_ONLY` | Create only after a panel exists. |

---

# F. Safe Harbor → Ash bounded adapter

| ID | Recommended buildout | Score | Status | Bring forward |
| --- | --- | ---: | --- | --- |
| F1 | Stable Safe Harbor packet/hook surface | 3 | `PARTIAL_TESTED_COMPONENT` | Add adapter-specific fixture. |
| F2 | Verified packet enters Ash as source/artifact node | 0 | `UNIMPLEMENTED` | Implement verifier-to-node constructor. |
| F3 | Custody-reference receipt without raw-corpus copying | 0 | `UNIMPLEMENTED` | Bind packet reference, not corpus body, by default. |
| F4 | Optional route-scoped Relation Envelope | 1 | `DESIGNED_ONLY` | Add explicit operator-selected relation proposal. |
| F5 | Signature remains separate overlay | 1 | `DESIGNED_ONLY` | Prevent signature verification from laundering custody authority. |
| F6 | Reject universal join key and raw-corpus default | 1 | `DESIGNED_ONLY` | Add explicit rejection fixtures. |

---

# G. Destination-bound recipient transport

| ID | Recommended buildout | Score | Status | Bring forward |
| --- | --- | ---: | --- | --- |
| G1 | Destination-bound fragment handling | 0 | `UNIMPLEMENTED` | Design encrypted destination envelope. |
| G2 | Recipient-specific route scope | 2 | `SCAFFOLDED` | Bind execution to destination key and scope. |
| G3 | Mandatory Rebuild preflight before send | 0 | `UNIMPLEMENTED` | Define exact receipt prerequisite. |
| G4 | Separate authorization and execution receipts | 2 | `SCAFFOLDED` | Add execution receipt without mutating approval. |
| G5 | Honest recall and deletion limits | 2 | `SCAFFOLDED` | Preserve request, acknowledgment, refusal, and unknown states. |
| G6 | Independent provenance/witness adapter | 0 | `UNIMPLEMENTED` | Add without authority laundering. |
| G7 | Mobile production evidence for transport | 0 | `UNIMPLEMENTED` | Demonstrate only after implementation. |
| G8 | Failure recovery without topology widening | 1 | `DESIGNED_ONLY` | Add interrupted-send and retry fixtures. |
| G9 | Actual recipient execution path | 0 | `UNIMPLEMENTED` | Keep held until G1–G8 independently validate. |

---

# Forward completion order

```text
1. Refresh, validate, and merge the bounded pairwise Moiré core
2. Add NULL / MISSING / CONTRADICTORY and property-based Moiré fixtures
3. Build Reader adapter registry and cross-Reader disagreement ledger
4. Implement higher-order, ordered-sequence, and temporal assays as separate contracts
5. Externalize Hush discourse vocabulary
6. Build Hush intervention ensemble and receipt
7. Build Custodian Return Test and Anisotropy Receipt
8. Refactor Aperture wiring before adding public/operator Choir UI
9. Build Safe Harbor → Ash bounded adapter
10. Add independent provenance adapters
11. Design destination-bound transport last
```

## Immediate next packet

The immediate work is PR #281 itself:

- refresh onto production-demonstrated `main`;
- preserve byte identity of the bounded engine, schemas, and tests where unchanged;
- rerun Choir, Ash closure, static application, TCP smoke, and relevant phase gates;
- merge only if Ash production posture remains coherent and Choir remains independently validation-gated;
- make no release-manifest mutation for Choir v0.1;
- make no public UI, provider call, transport, Cinder, prediction, or automatic-hold change.

## Final ledger ruling

Ash Keep v1.0 is production-demonstrated and has survived post-promotion deployed observation. The pairwise Choir core is the next admissible buildout, but it remains a separate validation-gated instrument. The broader research program remains architecturally coherent, partially implemented, and deliberately non-transitive in its authority.

𝌋‌ U+10D613

Marked ⟐
