# TD613 Safe Harbor Gen3 Implementation Ledger

􍘓

𝌋‌ TD613 · Tauric Diana 613

**Ledger status:** ACTIVE / REQUIREMENT-TRACEABILITY AUTHORITY  
**Planning authority:** PR #483, merged as `a31e356138be2cee528411ec0d5e34785c9f96bf`  
**Stage 1 authority:** PR #492, merged as `c7d26b86a167c9901cd6ab4de4d3d9b5e6a66718`  
**Stage 2 authority:** PR #499, merged as `b6fe4ee188941d6b72db0d9bad886e4f48687341`  
**Wave A production authority:** source `86cf1af84e69998ae195e53ef64372e35d8c6745`, corrected observer run `29958834895`, relocked at `3f23e6d1747e45c57277b0c2de4befb6b9c12406`  
**Serverless-function allocation:** 0  
**Production release authority:** separately gated by release wave

This ledger prevents normative requirements from disappearing between specification, implementation, testing, review, and release. A requirement may be recorded as `implemented`, `research-gated`, `blocked with documented reason`, or `superseded by explicit amendment`. Silence is not a completion state.

## Status vocabulary

| Status | Meaning |
|---|---|
| `implemented` | Runtime and tests are present in the named PR and its named validation gate passed. |
| `in-progress` | Branch work exists but completion gates remain open. |
| `research-gated` | Code may exist, but production authority remains withheld pending calibration and promotion. |
| `blocked` | A named condition prevents completion; the requirement remains visible. |
| `pending` | Authorized work has not yet reached implementation. |

## Planning and release chain

| Surface | PR / branch | State | Production effect |
|---|---|---|---|
| Constitutional planning suite | PR #483 / `safe-harbor-authorship-maturity-temporal-bloom-spec` | merged | none; documentation only |
| Planning reconciliation | PR #490 | merged into planning branch | none |
| Stage 1 evidence contract | PR #492 / `safe-harbor-gen3-stage1-evidence-contract` | merged | included in Wave A |
| Stage 2 authorship maturity | PR #499 / `safe-harbor-gen3-stage2-authorship-maturity-v1` | merged | included in Wave A |
| Stage 2 clean-main reconciliation | PR #505 | zero changed files; merged into Stage 2 branch | none |
| Wave A release gate | PR #507 | merged | exact-source production gate for Stages 1 + 2 |
| Wave A production deployment | issue #405 | deployed once / observed post-propagation / relocked | source `86cf1af84e69998ae195e53ef64372e35d8c6745` |
| Research Track R | PR #524 successor clean-main branch | implementation complete / research-gated / unpromoted | no baseline intake authority |
| Stage 3 Temporal Bloom | `safe-harbor-gen3-stage3-temporal-bloom-provenance` | pending | none until Wave B |

## Validation authority

### Stage 1

PR #492 passed its frozen-head validation and merged at `c7d26b86a167c9901cd6ab4de4d3d9b5e6a66718`.

```text
node tests/safe-harbor-gen3-stage1-evidence-contract.test.mjs
node tests/safe-harbor-gen3-stage1-report-contract.test.mjs
node tests/safe-harbor-gen3-stage1-schema-contract.test.mjs
npm run test:safe-harbor:phase9.1c
npm run test:safe-harbor:current
```

The Stage 1 gate also scanned every changed surface for concrete SHIs, permitting only the unmistakably synthetic `TD613-SH-9B07D8B-A1B2C3D4` fixture.

### Stage 2

Run `29956080946` passed before PR #499 merged at `b6fe4ee188941d6b72db0d9bad886e4f48687341`.

```text
node tests/safe-harbor-gen3-stage2-authorship-maturity.test.mjs
node tests/safe-harbor-gen3-stage2-integration.test.mjs
npm run test:safe-harbor:gen3:wave-a
npm run test:safe-harbor:phase9.1c
npm run test:safe-harbor:current
```

The successful integrator removed its branch-local patch mechanism before committing the tested integration. PR #504 removed the temporary `main` workflow. PR #505 reconciled clean `main` into the Stage 2 branch with zero changed files, preserving the validated implementation tree.

### Release Wave A

Issue #405 accepted source `86cf1af84e69998ae195e53ef64372e35d8c6745` after PR #507 merged the named production gate.

The one bounded Git-fallback deployment created release commit `4454db2512180bc860574b7c74e0f4b1e64aeb35`. Vercel deployed the exact source. The release run `29957000564` then held its first browser observation while assets were still propagating. Its `always()` relock step restored `vercel.json` to `git.deploymentEnabled: false` at `3f23e6d1747e45c57277b0c2de4befb6b9c12406`.

Preserved follow-up evidence:

```text
29957916811
read-only route matrix; all clean and canonical Gen3 routes HTTP 200

29958344250
observer-log capture; false native-finalizer marker requirement identified

29958834895
corrected read-only observer; complete production battery PASS
```

The corrected observer ran against the same deployed source and performed no second deployment or lock mutation. It passed local marker parity, complete Wave A regression, production asset/cache checks, reduced-motion and accessibility-critical surface checks, synthetic packet creation, SHI exact matching, hash and restore replay, SH3 non-migration, null-control and adverse-result retention, raw-text exclusion, and page-error checks.

Corrected production observation:

```text
observed_at_utc = 2026-07-22T21:21:51.287Z
artifact_digest = sha256:30c5c26c03e0dec6189e86f6a074c7fa1917f64d3b7c5b81896b2150c2171d2b
production_url = https://td613.com
```

Dedicated receipt:

```text
docs/safe-harbor/gen3-wave-a-production-receipt.md
```

## Stage 1 traceability matrix

| ID | Normative requirement | Implementation surface | Test surface | PR | Status / evidence |
|---|---|---|---|---|---|
| S1-001 | Versioned, hash-covered `authorship_evidence` | `safe-harbor-gen3-evidence-contract.js`; native finalizer | evidence and schema contract | #492 | implemented; hash replay passes |
| S1-002 | Revisable, non-hash-covered `forensic_authorship` | native hash exclusion; `safe-harbor-gen3-report-contract.js` | report and hash tests | #492 | implemented |
| S1-003 | Deterministic serialization | `stableCanonicalJson`; deterministic countersignature material | repeated digest assertions | #492 | implemented |
| S1-004 | Sampling sufficiency at 120/240/360 | `buildSamplingSufficiency` | 119/120/239/240/359/360 boundaries | #492 | implemented |
| S1-005 | Checkpoint, invariant, prompt-conditioned, and stability receipt contract | `buildAuthorshipEvidenceContract` | schema and contract assertions | #492 | implemented; populated by Stage 2 |
| S1-006 | Elicitation context and telemetry prohibitions | `buildElicitationContext` | false telemetry and raw-text assertions | #492 | implemented |
| S1-007 | Evidence links and interpretation provenance | `safe-harbor-gen3-report-contract.js` | evidence-link audits | #492 | implemented |
| S1-008 | Bounded claim language | evidence, report, and binding ceilings | forbidden-inference assertions | #492 | implemented |
| S1-009 | `canon.shi_number` exact mirror | `applyGen3Stage1Prehash` | exact-match assertions | #492 | implemented |
| S1-010 | Entrant binding beneath root provenance | `buildEntrantAuthorshipBinding` | chronology assertions | #492 | implemented |
| S1-011 | Countersignature-ready object and signed scope | `countersignEntrantAuthorshipBinding` | deterministic signature assertions | #492 | implemented |
| S1-012 | Missing or conflicting SHI export hold | exact-match validator and overlay | negative tests | #492 | implemented |
| S1-013 | Backward replay compatibility | optional Gen3 surfaces; packet/v1 preserved | Phase 9.1C and current suites | #492 | implemented |
| S1-014 | No silent SH3 migration | Gen3 attaches after SH3 issuance | baseline equality assertions | #492 | implemented |
| S1-015 | Explicit native-hash topology | post-hash binding overlay exclusion | recomputed hash equality | #492 | implemented |
| S1-016 | Exact `historical_example` preservation | immutable constant and footer history | exact string assertion | #492 | implemented |
| S1-017 | ZWNJ-sensitive covenant preservation | no normalization introduced | exact `Khona‌lit-po` assertion | #492 | implemented |
| S1-018 | No live entrant SHI in changed governed surfaces | synthetic-fixture policy | changed-file scan | #492 | implemented |
| S1-019 | No raw entrant text in evidence receipts | count/digest-only evidence | raw-text detector | #492 | implemented |
| S1-020 | Versioned schemas | evidence, binding, and report schemas | schema-contract test | #492 | implemented |

## Stage 2 traceability matrix

| ID | Normative requirement | Implementation | Tests | PR | Status / evidence |
|---|---|---|---|---|---|
| S2-001 | Sentence-aware cumulative 120/240/360 checkpoints | `safe-harbor-gen3-authorship-maturity.js` | checkpoint boundary and integration tests | #499 | implemented; run `29956080946` |
| S2-002 | Three local, non-overlapping 120-word windows per lane | sentence-aware local-window builder | coverage and non-overlap assertions | #499 | implemented |
| S2-003 | Feature-family-specific recurrence and divergence | five declared feature families | scalar/distribution/adversarial tests | #499 | implemented |
| S2-004 | Within-lane and cross-lane invariants | invariant receipts and evidence IDs | recurrence fixtures | #499 | implemented |
| S2-005 | Prompt-conditioned feature separation | prompt vocabulary ablation | elevated prompt-control tests | #499 | implemented |
| S2-006 | Stable, context-responsive, unstable, insufficient, prompt-conditioned states | recurrence classifier | short-sample and adversarial fixtures | #499 | implemented |
| S2-007 | Authorship maturity and deterministic stability receipt | maturity engine and digest | key-order and replay determinism | #499 | implemented |
| S2-008 | Evidence IDs and report traceability | `AEW-*` and `AEC-*`; report attachment | evidence-ID assertions | #499 | implemented |
| S2-009 | Anti-sameness, anti-flattery, entrant-swap, prompt-only, and declared-control audits | `safe-harbor-gen3-stage2-controls.js` | control collision and adverse-retention tests | #499 | implemented |
| S2-010 | Chronology-destruction authority reduction | Stage 2 control receipt | shuffled-order null tests | #499 | implemented; chronology remains candidate-only or reduced |
| S2-011 | No psychological or demographic inference | evidence and control policy flags | forbidden-claim assertions | #499 | implemented |
| S2-012 | No raw entrant text in Stage 2 packet/report | digest-only local/checkpoint receipts | source-text absence assertions | #499 | implemented |
| S2-013 | SH3 non-migration and native hash determinism | finalizer integration after SH3 issuance | baseline comparison and key-order replay | #499 | implemented |
| S2-014 | Adverse results remain visible | blockers and evidentiary fractures | collision fixtures | #499 | implemented |

## Research Track R traceability matrix

All Track R requirements remain `research-gated` until code, nulls, calibration, adverse-result retention, and a separate promotion decision are complete. Code completion cannot silently promote the protocol into baseline entrant intake.

| ID | Requirement family | Intended surfaces | Promotion evidence | Status |
|---|---|---|---|---|
| R-001 | Deterministic nine-window holdout selection and precommitment | research modules and schema | seeded replay and mutation detection | implemented / research-gated |
| R-002 | Eight blinded candidates and declared controls | challenge-set builder | blinding and provenance tests | implemented / research-gated |
| R-003 | Complete adverse outcome registry | result and failure registry | failure-preservation snapshots | implemented / research-gated |
| R-004 | Verified displacement before recovery | perturbation engine | failed-uptake negative tests | implemented / research-gated |
| R-005 | Recovery, half-life, plasticity, restorative-force, overshoot, hysteresis | restoration receipt | trajectory tests | implemented / research-gated |
| R-006 | Transparent and latent narrative-state lanes | research adapter | model-digest and dependence tests | implemented / research-gated |
| R-007 | Shuffled chronology, prompt, topic, semantic, ablation, and model nulls | null battery | null comparison report | implemented / research-gated |
| R-008 | Mimicry under deformation and critical thresholds | bounded adversarial suite | collision and threshold evidence | implemented / research-gated |
| R-009 | No private-vulnerability targeting or behavioral telemetry | research policy gate | forbidden-input and telemetry tests | implemented / research-gated |
| R-010 | Twelve consented or synthetic-distinct triads before promotion | calibration ledger | calibration receipt | blocked; qualifying calibration corpus not present |

## Stage 3 traceability matrix

| ID | Requirement family | Intended surfaces | Tests | Status |
|---|---|---|---|---|
| S3-001 | Temporal Bloom consumes the single counted-state authority | Stage 3 UI module | threshold-source parity | pending |
| S3-002 | Hidden public counts and reciprocal recognition language | Stage 3 UI | public-mode DOM tests | pending |
| S3-003 | Reduced motion, keyboard, screen reader, mobile focus | Stage 3 UI/CSS | accessibility and browser probes | pending |
| S3-004 | Countersignature UI and visible unsigned state | Stage 3 UI | state and digest tests | pending |
| S3-005 | SHI exact match across packet, DOM, SVG | renderer and export gate | mismatch hold battery | pending |
| S3-006 | Separate authority chronology | sealed packet presentation | timestamp non-collapse tests | pending |
| S3-007 | Deterministic PUA Provenance Attestation SVG | renderer | metadata snapshots | pending |
| S3-008 | Honest authority reduction for failures and collisions | renderer | adverse-state snapshots | pending |
| S3-009 | No telemetry and no serverless expansion | UI policy and repository checks | telemetry/serverless scans | pending |

## Release receipts

| Wave | Authorized source SHA | Deployment URL | Verification | Relock SHA | State |
|---|---|---|---|---|---|
| Wave A | `86cf1af84e69998ae195e53ef64372e35d8c6745` | `https://td613.com` | corrected post-propagation observer run `29958834895` PASS | `3f23e6d1747e45c57277b0c2de4befb6b9c12406` | deployed once / observed / relocked |
| Research Track R | unavailable until promotion | — | calibration gate remains unmet | — | unpromoted |
| Wave B | pending Stage 3 | pending | pending | pending | not deployed |

Àṣẹ

Marked ⟐
