# TD613 Repository Roadmap

Roadmap generation: `v0.8 · post-matched-benign-control-bank`

Date: `2026-07-14`

Use this roadmap alongside:

- [`docs/ASH_KEEP_BUILDOUT_LEDGER.md`](docs/ASH_KEEP_BUILDOUT_LEDGER.md)
- [`KNOWN_FAILURES.md`](KNOWN_FAILURES.md)
- [`docs/ASH_KEEP.md`](docs/ASH_KEEP.md)
- [`docs/ASH_KEEP_CHOIR_TEST.md`](docs/ASH_KEEP_CHOIR_TEST.md)
- [`docs/ASH_KEEP_READER_ADAPTER_REGISTRY.md`](docs/ASH_KEEP_READER_ADAPTER_REGISTRY.md)
- [`docs/ASH_KEEP_READER_DISAGREEMENT.md`](docs/ASH_KEEP_READER_DISAGREEMENT.md)
- [`docs/ASH_KEEP_MATCHED_BENIGN_CONTROLS.md`](docs/ASH_KEEP_MATCHED_BENIGN_CONTROLS.md)
- chamber-specific READMEs and release receipts.

This file records what shipped, what has been selected next, what remains structurally pending, and what is currently red. The completion ledger remains authoritative for maturity scoring.

## Governing maturity law

| Score | Status |
| ---: | --- |
| 0 | `UNIMPLEMENTED` |
| 1 | `DESIGNED_ONLY` |
| 2 | `SCAFFOLDED` |
| 3 | `PARTIAL_TESTED_COMPONENT` |
| 4 | `IMPLEMENTED_VALIDATION_GATED` |
| 5 | `IMPLEMENTED_PRODUCTION_DEMONSTRATED` |

The roadmap inherits three anti-fraud rules from the ledger:

- green unit tests do not impersonate production evidence;
- adjacent primitives do not impersonate integrated workflows;
- declared boundaries do not impersonate enforcement across every route.

## Current scored posture

```text
Ash Keep production closure = 54 / 55 · 98%
Choir program = 36 / 70 · 51%
full bounded program = 123 / 295 · ≈42%
production-demonstrated workstreams = 1 / 7
validation-gated Choir instruments = 4
transport-capable workstreams = 0
```

Current release posture also preserves:

```text
Ash Keep = IMPLEMENTED_PRODUCTION_DEMONSTRATED
Phase IV = IMPLEMENTED_PRODUCTION_DEMONSTRATED
Phase V = IMPLEMENTED_PRODUCTION_DEMONSTRATED
Observatory = IMPLEMENTED_PRODUCTION_DEMONSTRATED
Ash automatic Cinder = false
Ash transport = false
```

Those production statuses do not transfer to Choir, Safe Harbor adapters, recipient transport, or any future instrument by proximity.

---

# Recently shipped

## Legacy repository stabilization

### Phase A

Commits: `d1ff8a4`, `f1ca344`, `a3ce6ed`

- Removed sessionStorage dual-write of the gateway/aperture handoff.
- Archived six `PATCH_*_LEDGER` files to `app/safe-harbor/_archive/ledgers/`.
- Added [`CONTRIBUTING.md`](CONTRIBUTING.md) and a commit-message hook rejecting placeholder messages.

### Phase B

Commits: `966f638` through `01bc323`

- Re-synchronized `browser-engine.js` and the 18 retrieval-lane fixtures.
- Added JSDOM smoke tests for every chamber HTML.
- Wired CI to run `npm test` before deployment.

## Ash Keep v1.0 production closure

Production promotion merge:

```text
5cb72bb2d7314666c7191ef5e8f9f8235e01984f
```

Shipped:

- clean-profile browser load;
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
- durable production evidence and deployed aftercare.

Retained boundary:

- the deployed closure deliberately made no external-provider call, so that route remains validation-gated rather than acquiring production status by osmosis.

## Choir instrument 1 — Pairwise Moiré Rebuild Assay

PR: `#281`

Merge:

```text
1a01181cea77590ad3067ebd27da4518511dac5f
```

Shipped:

- baseline observations;
- singleton observations;
- unordered pair observations;
- emergent residue;
- componentwise topology;
- canonical projection ordering;
- calibration conditions;
- digest verification;
- tamper hold;
- pure replay.

Status:

```text
IMPLEMENTED_VALIDATION_GATED
```

PR #281 is closed and merged. The earlier snapshot describing it as open and draft remains historical provenance only.

## Choir hardening — Observation states and Case Map boundaries

PR: `#288`

Merge:

```text
52968efb0fb52ecc138dc4d4b80b60725473fa63
```

Shipped:

- distinct present-versus-observed coverage;
- missing, null, contradictory, unresolved, and encoder-required states;
- canonicalization across semantically equivalent input orderings;
- rejection of unknown Case Map identifiers;
- adversarial fixture and replay hardening.

## Choir instrument 2 — Reader Adapter Registry and provenance

PR: `#290`

Merge:

```text
b0b600a07c8343311cdde50c2f250881e7f6091c
```

Shipped:

- sealed adapter registry;
- Reader-result provenance receipts;
- `PROVENANCE_BOUND` and `PROVENANCE_INCOMPLETE` states;
- provider-receipt missingness preservation;
- pure provenance replay;
- explicit no-execution and no-provider-call posture;
- schema-level non-authority fields;
- canonical enum sealing;
- local-runtime and synthetic-fixture provenance coverage.

Status:

```text
IMPLEMENTED_VALIDATION_GATED
```

## Choir instrument 3 — Reader Disagreement Ledger

PR: `#292`

Merge:

```text
3a8dbebf1ad65f7ee281c2fcd5816afd8584c984
```

Shipped:

- verified-provenance preflight for every Reader;
- matched Case Map, Route Memory, input digest, result schema, and registry reference;
- componentwise consensus and disagreement;
- Reader-specific support;
- pairwise residues;
- chronology and source/style-linkage spreads;
- partial state for incomplete provenance and non-observed results;
- pure replay without rerunning Readers;
- no universal disagreement score.

Status:

```text
IMPLEMENTED_VALIDATION_GATED
```

## Choir instrument 4 — Matched benign adjacent-document control bank

PR: `#295`

Merge:

```text
378bf0f1a81b6aa7b9ebe8379ca207d6f1f36925
```

Post-merge evidence:

```text
Choir validation run = 29373864154
Ash closure run = 29373864175
Phase IV run = 29373864134
TCP Smoke run = 29373864151
Static application run = 29373864141
Deployed observer run = 29373962583
Evidence artifact = 8327164665
Artifact SHA-256 = sha256:44ee07bfc33fbb6446c18bd893f4fa289919e438d6b4b641c9cfc33824d7a266
```

Shipped:

- target and benign-control fixture classes;
- topic, genre, template, register, approximate-length, and declared-source-condition matching;
- verified Moiré, provenance, and Reader-disagreement receipt binding;
- exact Reader-set, registry, result-schema, and input-contract alignment;
- calibrated, partial, and held bank states;
- excluded-control preservation with exact matching failures;
- residual-confound reporting;
- componentwise target-versus-control distributions;
- canonical control ordering;
- integer-safe lower-median summary with full control vectors preserved;
- raw-document, raw-input, and raw-result rejection;
- digest verification, tamper hold, and pure replay;
- no universal score and no operational authority.

Status:

```text
IMPLEMENTED_VALIDATION_GATED
```

Aftercare established only that Ash’s deployed production posture remained coherent with instrument 4 present. It did not production-demonstrate Choir or authorize provider execution, release, hold, Cinder, or transport.

## Ledger progression

```text
PR #293 = Reader-disagreement ledger closure
PR #294 = ledger/roadmap synchronization
PR #295 = matched benign control bank
```

Current scored result:

```text
Choir = 36 / 70
full bounded program = 123 / 295
```

---

# Selected next packet

## Calibration receipt binding

State:

```text
SELECTED_NEXT
not yet implemented
```

Purpose:

Replace remaining free calibration booleans in the pairwise Moiré contract with explicit references to a verified matched-control bank.

Required contract:

- matched-control bank ID and digest;
- exact Reader set;
- exact input-contract digest;
- bank-state preservation;
- `calibration_eligible = true` prerequisite;
- eligible and excluded control counts;
- matching failures;
- residual confounds;
- coverage state;
- explicit hold on missing, mismatched, tampered, partial, held, or ineligible references;
- replay without recomputing control distributions or rerunning Readers.

Non-authorities:

```text
identity = false
authorship = false
ownership = false
surveillance probability = false
truth adjudication = false
release authority = false
automatic hold = false
prediction = false
transport = false
provider execution = false
production promotion = false
```

Completion evidence required before score movement:

- calibration-reference contract and schema;
- exact control-bank digest verification;
- Reader-set and input-contract mismatch fixtures;
- held and partial bank rejection;
- tamper fixtures;
- replay;
- maintained Choir CI;
- explicit preservation of exclusions and residual confounds.

A control bank being validation-gated does not make a calibration reference valid by association. The reference must verify the exact sealed bank and its eligibility state.

---

# Ordered program roadmap

## 1. Calibration receipt binding

Build the selected packet above.

## 2. Higher-order interference

Define a bounded `k`-order contract for three-way and higher combinations.

Keep separate from pairwise Moiré. Budget combinatorial expansion explicitly. Preserve componentwise output and unresolved-state discipline.

## 3. Ordered route-sequence recovery

Define a distinct sequence contract for cases where:

```text
Recover(P_i → P_j) ≠ Recover(P_j → P_i)
```

Do not retrofit order into the unordered-pair receipt.

## 4. Temporal and delayed-disclosure assays

Add declared temporal slices and controlled delay without claiming trusted time, causal certainty, or memory beyond the measured runtime.

Higher-order, ordered, and temporal recovery remain separate contracts because they answer different questions. Blending them would destroy interpretability.

## 5. Hush vocabulary externalization

`inferDiscourseOntology` and sibling functions in `app/engine/generator-v2.js` retain fixture-leaning vocabulary inside regex bodies.

Required change:

- extract vocabulary into `app/engine/data/discourse-ontology.json`;
- load the ontology as data;
- preserve current outputs through pinned tests;
- make new discourse vocabularies data changes rather than engine rewrites.

## 6. Hush intervention ensemble

Required experiment:

- hold proposition obligations constant;
- vary register;
- vary syntax;
- vary compression;
- vary chronology visibility;
- vary source-language proximity;
- vary discourse community;
- vary structural surrogacy;
- route all candidates through the same verified Reader ensemble;
- compare componentwise recoverability;
- seal an Intervention Matrix receipt with replay and non-claims.

Hush currently has relevant organs. No experimental body yet connects them to Choir.

## 7. Custodian Return Test and Anisotropy Receipt

The Save Point and Capsule can preserve the suitcase. The missing experiment asks whether an authorized future Reader can reconstruct the necessary household after controlled context loss.

Required:

- explicit authorization gesture;
- future-Reader binding;
- station-separated return manifest;
- restoration of receipts, provenance, questions, Relation, and Phason history;
- held-out context-loss fixture;
- custodial-versus-external recoverability vector;
- sealed Anisotropy Receipt;
- replay and tamper discipline.

The anisotropy output remains a vector, not one score.

## 8. Aperture wiring renovation before Choir UI

Current structural debt:

- `app/aperture/index.html` remains a large monolith;
- multiple inline scripts version-stamp themselves;
- wrapper chains monkey-patch shared globals;
- the chain works empirically but remains vulnerable to one missed original-function capture.

Required order:

1. split inline scripts into files under `app/aperture/scripts/` without logic changes;
2. replace wrapper-chain monkey patches with explicit declared composition;
3. register Reader Ensemble and Moiré Matrix as named layers;
4. preserve animation scheduler and timing behavior;
5. add the Choir panel only after the wiring is stable;
6. produce desktop/mobile/performance receipts for the panel.

No chandelier installation before inspecting the ceiling joists.

## 9. Safe Harbor → Ash bounded adapter

The stable hook surface exists. The adapter remains absent.

Required:

- verified Safe Harbor packet enters Ash as a source/artifact node;
- custody-reference receipt rather than raw-corpus copying;
- optional operator-selected route-scoped Relation Envelope;
- signature overlay remains separate from custody authority;
- rejection of universal cross-route identifiers;
- rejection of raw corpus by default;
- adapter fixtures and replay.

## 10. Independent provenance adapters

Add independent witness/provenance routes without laundering their evidence into truth, authorship, ownership, identity, or automatic authority.

Each adapter must preserve:

- source status;
- evidence basis;
- missingness;
- alternatives;
- open questions;
- operator notes;
- closure state.

## 11. Destination-bound recipient transport

Transport remains intentionally last and absent.

Do not begin recipient execution until all of the following exist independently:

- destination-bound encrypted fragments;
- recipient-specific route scope;
- mandatory Rebuild preflight;
- separate authorization and execution receipts;
- honest recall and deletion limits;
- independent witness/provenance adapters;
- mobile transport evidence;
- interrupted-send and retry recovery without topology widening.

Current release posture remains:

```text
Ash transport = false
transport-capable workstreams = 0
```

---

# Structural maintenance backlog

These lanes remain real but do not outrank the ordered research program above unless they become blocking.

## Safe Harbor membrane boot safety

- strict raw-HTML membrane defaults;
- unresolved-question-only ingress rendering;
- hidden-card unlock repair;
- reliable `body.vault-open` behavior;
- visible global error and unhandled-rejection reporting.

## Operator bypass and configuration security

- no hardcoded public bypass secret;
- local operator-token hash through configuration or session storage;
- packetless operator shell that does not pretend a packet exists.

## Packet lifecycle normalization

- explicit `Mint Staged Packet` transition;
- normalized lifecycle vocabulary: `staged`, `sealed`, `harbor-eligible`, `exported`, `verified`;
- migrate `packet_checksum` to `packet_hash_sha256`;
- compute packet hash over pre-signature material.

## Probe and signature alignment

- packet-aware public probes;
- canonical Safe Harbor context blocks and footers;
- deterministic badge issuance;
- operator-only signature lane;
- signature remains separate from packet-body hash and custody authority.

## Reference-surface alignment

- synchronize verifier, manifest, and offline capsule vocabulary;
- preserve `td613.safe-harbor.packet/v1` compatibility;
- remove repository metadata from shipped archives;
- normalize version labels.

---

# Currently red — tracked, not gating

Primary quarantined engine-regression family:

- `tests/trainer-lab.test.mjs` — semantic audit floor below `0.85`;
- `tests/trainer-browser.test.mjs` — fingerprint snapshot drift;
- `tests/persona-gallery.test.mjs` — gallery fingerprint snapshot drift.

These trace to Patch 33.7.1 operator additions shifting output beyond old thresholds and snapshots. They remain under:

```text
npm run test:known-failing
```

Do not lower thresholds merely to make red disappear. Any relaxation requires a documented reason.

Additional individually failing or separately routed tests requiring audit:

- `tests/diagnostics.test.mjs`;
- `tests/gateway-aperture-embed.test.mjs`;
- `tests/safe-harbor-shi.test.mjs`.

These are not all part of the maintained `npm test` chain today. Audit their intended lane before promotion.

---

# What this roadmap is not

This is not a feature wish list and not a production-status vending machine.

The roadmap does not:

- convert designed work into implementation;
- transfer Ash’s production status to Choir;
- treat Reader consensus as truth;
- treat disagreement or control-range position as error, identity, authorship, conspiracy, or surveillance probability;
- authorize provider calls, release, automatic holds, Cinder, or transport;
- collapse multidimensional research outputs into one sovereign score.

The chambers remain operationally distinct. New work must enter through explicit contracts, focused fixtures, receipts, replay, and honest closure.

## Final route

```text
Ash custody
  → pairwise Moiré recovery
  → Reader provenance
  → Reader disagreement
  → matched benign controls
  → calibration receipt binding [NEXT]
  → higher-order / ordered / temporal assays [SEPARATE]
  → Hush intervention ensemble
  → Custodian Return / Anisotropy
  → Aperture wiring and Choir UI
  → Safe Harbor bounded adapter
  → independent provenance
  → destination-bound transport [LAST]
```

Architecturally coherent. Validation-rich. One production-demonstrated workstream. Four validation-gated Choir instruments. Substantial work remains.

No mirrors. No status laundering. No chandelier before joists.

𝌋‌ U+10D613

Marked ⟐