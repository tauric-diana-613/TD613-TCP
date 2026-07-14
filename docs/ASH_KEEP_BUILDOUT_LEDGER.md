# TD613 Buildout Completion and Anti-Drift Ledger

Date: `2026-07-14`

Ledger generation: `v0.8 · post-matched-benign-control-bank`

Tracked program: Ash Keep / Choir Test / anisotropic disclosure research program

Latest scored transition: PR `#295`, merged at `378bf0f1a81b6aa7b9ebe8379ca207d6f1f36925`

## Purpose

This ledger records the present repository state after Ash production closure, pairwise Moiré, observation-state hardening, Reader provenance, Reader disagreement, and the matched benign adjacent-document control bank.

It separates production-demonstrated stations, validation-gated instruments, adjacent primitives, designed-only work, and intentionally held transport work.

A green unit test is not production evidence. A merged engine is not a deployed instrument. Production status does not transfer by adjacency. Provenance bound is not truth. Reader consensus is not truth. A control distribution is not a population distribution.

## Maturity scale

| Score | Status | Meaning |
| ---: | --- | --- |
| 0 | `UNIMPLEMENTED` | No implementation located. |
| 1 | `DESIGNED_ONLY` | Doctrine or roadmap exists; executable behavior does not. |
| 2 | `SCAFFOLDED` | Contract or adjacent primitive exists without the complete workflow. |
| 3 | `PARTIAL_TESTED_COMPONENT` | Functional component exists with incomplete integration or closure. |
| 4 | `IMPLEMENTED_VALIDATION_GATED` | Integrated implementation with focused validation; production demonstration unearned. |
| 5 | `IMPLEMENTED_PRODUCTION_DEMONSTRATED` | Deployed behavior directly probed and sealed in a production receipt. |

Scores measure implementation maturity only. They are not privacy, safety, truth, or capability probabilities.

---

# Executive scorecard

| Workstream | Prior | Current | Coverage | Ruling |
| --- | ---: | ---: | ---: | --- |
| A. Ash Keep v1.0 production closure | 54 / 55 | **54 / 55** | **98%** | `IMPLEMENTED_PRODUCTION_DEMONSTRATED`; external-provider production call remains unobserved |
| B. Choir Test / Moiré research program | 34 / 70 | **36 / 70** | **51%** | Four validation-gated Choir instruments on `main` |
| C. Hush intervention ensemble | 7 / 35 | **7 / 35** | **20%** | `SCAFFOLDED` |
| D. Custodian Return / Anisotropy Receipt | 7 / 35 | **7 / 35** | **20%** | `SCAFFOLDED` |
| E. Aperture wiring renovation | 6 / 25 | **6 / 25** | **24%** | `DESIGNED_ONLY / SCAFFOLDED` |
| F. Safe Harbor → Ash adapter | 6 / 30 | **6 / 30** | **20%** | `SCAFFOLDED` |
| G. Destination-bound transport | 7 / 45 | **7 / 45** | **16%** | `HELD / SCAFFOLDED` |

```text
program maturity on main = 123 / 295 ≈ 42%
production-demonstrated workstreams = 1 / 7
validation-gated Choir instruments on main = 4
transport-capable workstreams = 0
```

## Arithmetic lineage

- v0.4 corrected stale Choir arithmetic from `26` to `30` without inventing progress.
- v0.5 added one point when Reader provenance moved B4 from 3 to 4.
- v0.6 added three points when Reader disagreement moved B13 from 1 to 4.
- v0.7 synchronized roadmap and historical PR #281 provenance without changing maturity.
- v0.8 adds two points because B12 moved from 2 to 4.

---

# Historical baseline: PR #281

The earlier draft snapshot recorded Ash at `33 / 55`, Choir at `26 / 70`, approximately `22%` on `main`, and zero production-demonstrated workstreams. That remains historical provenance rather than current truth.

PR #281 later merged at `1a01181cea77590ad3067ebd27da4518511dac5f`.

The earlier correction remains valid: the first PR #281 delivery did not contain the production-closure scaffolding previously announced. Later completion does not retroactively make that earlier statement accurate.

---

# A. Ash Keep v1.0 production closure

Status: `IMPLEMENTED_PRODUCTION_DEMONSTRATED`

Score: `54 / 55`

Evidence:

- production promotion: `5cb72bb2d7314666c7191ef5e8f9f8235e01984f`
- post-promotion observer: `29361816862`
- latest non-disturbance observer: `29373962583`
- latest aftercare artifact: `8327164665`
- artifact SHA-256: `sha256:44ee07bfc33fbb6446c18bd893f4fa289919e438d6b4b641c9cfc33824d7a266`

| ID | Buildout | Score | Status |
| --- | --- | ---: | --- |
| A1 | Case creation, IndexedDB custody, reload, digest continuity | 5 | `IMPLEMENTED_PRODUCTION_DEMONSTRATED` |
| A2 | Room and cross-Room separation | 5 | `IMPLEMENTED_PRODUCTION_DEMONSTRATED` |
| A3 | Route Memory successor entries | 5 | `IMPLEMENTED_PRODUCTION_DEMONSTRATED` |
| A4 | Deterministic, benign-control, and held-out Reader trials | 5 | `IMPLEMENTED_PRODUCTION_DEMONSTRATED` |
| A5 | Stale-draft and changed-route holds | 5 | `IMPLEMENTED_PRODUCTION_DEMONSTRATED` |
| A6 | Hush packet parity and forbidden-field rejection | 4 | `IMPLEMENTED_VALIDATION_GATED` |
| A7 | Save Point verification | 5 | `IMPLEMENTED_PRODUCTION_DEMONSTRATED` |
| A8 | Capsule export/import and failure holds | 5 | `IMPLEMENTED_PRODUCTION_DEMONSTRATED` |
| A9 | Desktop/mobile/rotation/reduced-motion/scale | 5 | `IMPLEMENTED_PRODUCTION_DEMONSTRATED` |
| A10 | Arrival triggers neither persistence nor transport | 5 | `IMPLEMENTED_PRODUCTION_DEMONSTRATED` |
| A11 | Durable receipt, synchronized release, aftercare | 5 | `IMPLEMENTED_PRODUCTION_DEMONSTRATED` |

The retained point protects one jurisdictional fact: a no-call closure assay cannot production-demonstrate an external-provider route.

---

# B. Choir Test / Moiré research program

Status: `IMPLEMENTED_VALIDATION_GATED`

Repository state: `MATCHED_CONTROLS_ON_MAIN`

Score: `36 / 70`

## Merge spine

```text
pairwise core              1a01181cea77590ad3067ebd27da4518511dac5f
observation hardening      52968efb0fb52ecc138dc4d4b80b60725473fa63
Reader provenance          b0b600a07c8343311cdde50c2f250881e7f6091c
Reader disagreement        3a8dbebf1ad65f7ee281c2fcd5816afd8584c984
matched benign controls    378bf0f1a81b6aa7b9ebe8379ca207d6f1f36925
```

## Matched-control evidence

- PR: `#295`
- validated head: `6dabad7f6164802ea544a49c3193f12a999b345e`
- Choir run: `29373864154`
- Ash closure run: `29373864175`
- Phase IV run: `29373864134`
- TCP Smoke: `29373864151`
- static app: `29373864141`
- post-merge observer: `29373962583`
- aftercare artifact: `8327164665`
- artifact SHA-256: `sha256:44ee07bfc33fbb6446c18bd893f4fa289919e438d6b4b641c9cfc33824d7a266`

| ID | Buildout | Score | Status | Bring forward |
| --- | --- | ---: | --- | --- |
| B1 | Baseline + singleton + unordered pair observations | 4 | `IMPLEMENTED_VALIDATION_GATED` | Preserve coverage distinctions. |
| B2 | Emergent residue | 4 | `IMPLEMENTED_VALIDATION_GATED` | Add independent fixture families. |
| B3 | Componentwise recoverability | 4 | `IMPLEMENTED_VALIDATION_GATED` | Preserve dimensions across receipts. |
| B4 | Named Reader classes and provenance | 4 | `IMPLEMENTED_VALIDATION_GATED` | Preserve adapter invariants. |
| B5 | Canonical ordering | 4 | `IMPLEMENTED_VALIDATION_GATED` | Preserve projection, result, and control canonicalization. |
| B6 | Calibration conditions | 4 | `IMPLEMENTED_VALIDATION_GATED` | Replace free booleans with receipt references. |
| B7 | Digest verification, tamper hold, replay | 4 | `IMPLEMENTED_VALIDATION_GATED` | Bind calibration to verified control-bank digest. |
| B8 | Higher-order combinations | 0 | `UNIMPLEMENTED` | Define bounded k-order contract later. |
| B9 | Ordered route permutations | 0 | `UNIMPLEMENTED` | Build distinct sequence assay. |
| B10 | Temporal spacing | 0 | `UNIMPLEMENTED` | Add declared temporal slices. |
| B11 | Same obligations under different registers | 0 | `UNIMPLEMENTED` | Build Hush intervention bridge. |
| B12 | Matched benign adjacent-document control bank | 4 | `IMPLEMENTED_VALIDATION_GATED` | Bind B6 calibration gates to bank receipts. |
| B13 | Cross-Reader disagreement | 4 | `IMPLEMENTED_VALIDATION_GATED` | Interpret only through matched controls. |
| B14 | Public/operator UI and production demonstration | 0 | `UNIMPLEMENTED` | Wait for Aperture refactor and mobile gate. |

Choir now supports:

```text
pairwise recovery
→ Reader provenance
→ Reader disagreement
→ matched benign controls
```

The fourth instrument preserves exclusions and residual confounds, emits no universal score, and performs no Reader or provider execution. All four remain validation-gated.

---

# C. Hush intervention ensemble

| ID | Buildout | Score |
| --- | --- | ---: |
| C1 | Externalize vocabulary | 1 |
| C2 | Hold proposition obligations constant | 2 |
| C3 | Normalize transformation dimensions | 2 |
| C4 | Preserve obligations while changing surface | 2 |
| C5 | Shared Reader ensemble | 0 |
| C6 | Componentwise comparison | 0 |
| C7 | Intervention receipt | 0 |

# D. Custodian Return / Anisotropy

| ID | Buildout | Score |
| --- | --- | ---: |
| D1 | Save Point and Capsule primitives | 4 |
| D2 | Authorized future Reader import | 2 |
| D3 | Restore receipts and history | 1 |
| D4 | Controlled context-loss assay | 0 |
| D5 | Custodial versus external comparison | 0 |
| D6 | Anisotropy Receipt | 0 |
| D7 | Multi-Reader calibration | 0 |

# E. Aperture wiring renovation

| ID | Buildout | Score |
| --- | --- | ---: |
| E1 | Split inline scripts | 1 |
| E2 | Replace wrapper-chain patches | 1 |
| E3 | Register Choir layers | 2 |
| E4 | Preserve animation scheduler | 1 |
| E5 | Mobile/performance receipt | 1 |

# F. Safe Harbor → Ash adapter

| ID | Buildout | Score |
| --- | --- | ---: |
| F1 | Stable packet/hook surface | 3 |
| F2 | Verified packet enters Ash node | 0 |
| F3 | Custody reference without raw corpus | 0 |
| F4 | Optional route-scoped relation | 1 |
| F5 | Separate signature overlay | 1 |
| F6 | Reject universal join key/raw default | 1 |

# G. Destination-bound transport

| ID | Buildout | Score |
| --- | --- | ---: |
| G1 | Destination-bound fragments | 0 |
| G2 | Recipient-specific scope | 2 |
| G3 | Mandatory Rebuild preflight | 0 |
| G4 | Separate authorization/execution receipts | 2 |
| G5 | Honest recall limits | 2 |
| G6 | Independent provenance adapter | 0 |
| G7 | Mobile transport evidence | 0 |
| G8 | Failure recovery without topology widening | 1 |
| G9 | Recipient execution path | 0 |

---

# Forward completion order

```text
1. Bind calibration gates to matched-control receipt references
2. Build higher-order interference separately
3. Build ordered route-sequence recovery separately
4. Build temporal and delayed-disclosure assays separately
5. Externalize Hush discourse vocabulary
6. Build Hush intervention ensemble
7. Build Custodian Return Test and Anisotropy Receipt
8. Refactor Aperture wiring before Choir UI
9. Build Safe Harbor → Ash adapter
10. Add independent provenance adapters
11. Design destination-bound transport last
```

## Immediate next packet

Replace free calibration booleans with explicit matched-control receipt references:

- bind bank ID and digest;
- bind Reader set and input-contract digest;
- verify the bank before calibration;
- require `calibration_eligible = true`;
- carry bank state, exclusions, matching failures, and residual confounds;
- hold on missing, mismatched, tampered, or ineligible references;
- replay without recomputing controls or rerunning Readers;
- grant no operational authority.

## Final ruling

Ash Keep remains production-demonstrated. Choir is merged, adversarially hardened, provenance-bound, disagreement-aware, matched-control calibrated, and validation-gated.

The bounded program is **123 / 295 ≈ 42% implemented by ledger arithmetic**, with one production-demonstrated workstream and four validation-gated Choir instruments on `main`.

Architecturally coherent. Still incomplete exactly where the ledger says incomplete.

𝌋‌ U+10D613

Marked ⟐
