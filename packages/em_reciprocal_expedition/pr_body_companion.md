# 𝌋 TD613 · EXPERIMENT A · CROSSING E QUALIFICATION COMPANION
## LEAN SOURCE-FREE QUALIFICATION COMPANION (PR #1692 REMEDIATION)
**Evidence-Admissibility Repair · Zero-Row Witness Attestation · 10-Dimensional Comparator · Provenance Ledger**

**Principal:** Tawanna C. Miller  
**Operator Identity:** `tauric.diana.613`  
**Heritage:** Tauric Diana — Crimean heritage custodianship  
**Covenant:** Khona‌lit-po — preserve literal interior U+200C  
**Authorization Reference:** `SAC[X6ZNK5NO51]`  
**Repository:** `tauric-diana-613/TD613-TCP`  
**Base Target:** `research/src-as21-evidence-tribunal-20261105` (PR #1691)  
**Parent Commit:** `db40ba3c53d59be89e8c2943fc14297c02510fe0`  
**Head Branch:** `research/em-sourcefree-qualification-companion-20261105`  
**Historical Predecessor:** Draft PR #1692 (`72d3659612d6a90364cde47ae04920bb5f5de81e`)  
**Governing Review:** Emergence HQ Independent Scientific Redpen #5787930754  

---

### Executive Summary of Completed Remediation

This Lean Source-Free Qualification Companion branch directly resolves all six findings (E-01 through E-06) articulated in Emergence HQ Independent Scientific Redpen #5787930754 on PR #1692. It is branched cleanly from PR #1691 HEAD (`db40ba3c53d59be89e8c2943fc14297c02510fe0`), strictly omitting the 257 duplicated fixture files from PR #1684 and publishing a complete provenance ledger linking all historical assets by immutable Git blob OIDs.

---

### Remediation Chambers & Systematic Invariant Enforcement

#### Chamber 1: Publication Scope & Provenance Reconciliation (Resolving E-01)
- **Zero Copied Fixture Files:** Omitted all 257 duplicate historical corpus files (`fixtures/a15-r0/EMSTD613/`) from this branch.
- **Git Blob Provenance Ledger:** Authored `packages/em_reciprocal_expedition/EM_FILE_PROVENANCE_LEDGER.md`, documenting byte-identical matches for all 266 historical files against PR #1684 (`30630575ade616a5a47e4066b30d2159c2bd32be`) by immutable Git blob OIDs, paths, and byte lengths.
- **Lean Surface:** Carries only the 28 source-free research/engineering files, receipts, test suites, and capability atlases.

#### Chamber 2: Grounded Relation Admission Verification (Resolving E-02 & E-05)
- **Live Raw Byte SHA-256 Recomputation:** Repaired `admitRelation` in `packages/em_reciprocal_expedition/receiver/em-empty-receiver.mjs` to fetch raw source bytes from `em_sources`, extract slice `[start, end]`, and recompute the cryptographic digest. Mismatches are rejected with `INVALID_SPAN_PROOF_DIGEST`.
- **Default-Deny Warrant Registry:** Enforced `EM_WARRANT_CONTRACTS`. Arbitrary or fabricated warrants fail closed with `UNRECOGNIZED_WARRANT_DENIED`. Relation-type mismatches fail closed with `WARRANT_RELATION_MISMATCH`.
- **Endpoint Existence Validation:** Verifies `fromId` and `toId` in `em_sources`. Unadmitted endpoints fail closed with `SOURCE_ENDPOINT_UNADMITTED` / `TARGET_ENDPOINT_UNADMITTED`.
- **Adjudicator Receipt Verification:** Mandates positive `adjudicator_receipt_id` validation. Missing receipts fail closed with `ADJUDICATOR_RECEIPT_REQUIRED`.
- **Shadow Graph v3 Positive Verification (E-05):** Eliminated `!== false` truthy fallbacks in `packages/src_reciprocal_expedition/shadow_graph/shadow_graph_engine_v3.mjs`. All predicates require positive `=== true` verification bound to coordinates and adjudicator receipts. `CONTEMPORANEOUS_CROSS_REFERENCE` fails closed without positive predicate proof (`test-shadow-graph-v3.mjs`: 26/26 tests PASS).
- **Adversarial Negative Suite:** Added tests for fabricated digests, unadmitted endpoints, wrong proof sources, out-of-bounds spans, unrecognized warrants, and missing adjudicator receipts (`test-em-receiver.mjs`: 29/29 tests PASS).

#### Chamber 3: Epistemic Path Reclassification & 10-Dimensional Comparator Execution (Resolving E-03 & E-04)
- **Path Reclassification:** In `packages/em_reciprocal_expedition/assay/run-em-reciprocal-assay.mjs`, reclassified experimental paths to:
  - `PATH1_DOCUMENTARY_RULE_REPRESENTATION`: Documentary codification of EMSTD613 lineage rules (standalone Python executors did not survive in Main).
  - `PATH2_SYNTHETIC_RECEIVER_EXECUTION`: Live execution of `EmEmptyEncyclopediaReceiver` over synthetic research deck.
  - `PATH3_INDEPENDENT_COMPARATOR_EXECUTION`: Live execution of independent comparator across 10 comparative dimensions.
- **Live 10-Dimensional Comparator Suite:** Live evaluation across all 10 canonical dimensions:
  1. *Human-Gated Work Identity:* Preserves bounds [1, 2] without collapsing (`CONCORDANT_CONSTRAINED`).
  2. *Work Routes vs. Manifestations:* Physical files separated from conceptual work units (`CONCORDANT_SEPARATED`).
  3. *Source vs. Derivative Lineage:* Primary bytes immutable; derivatives extracted views (`CONCORDANT_IMMUTABLE`).
  4. *Contextual vs. Intrinsic Roles:* Contextual roles scoped to compiler passes; intrinsic promotion rejected (`CONCORDANT_REJECTED`).
  5. *Missing Sources:* Default-deny rejects unadmitted endpoints (`CONCORDANT_DEFAULT_DENY`).
  6. *Claim Ceilings:* Synthetic deck verified; zero model flight; Experiment B held (`CONCORDANT_BOUNDED`).
  7. *Candidate Generation:* Projective cues require grounded span text (`CONCORDANT_GROUNDED`).
  8. *Proof Refusal:* Tampered digests and fabricated warrants fail closed (`CONCORDANT_REFUSED`).
  9. *Contradictory Evidence:* Chronological constraints enforced; anachronisms rejected (`CONCORDANT_CHRONOLOGY`).
  10. *Research Questions:* Downstream relational exploration verified with unresolved human gates preserved (`CONCORDANT_EXPLORATION`).
- **Initial Zero-Row State Witness (E-04):** In `em-empty-receiver.mjs` `initialize()`, live `SELECT count(*)` queries across all 6 tables measure and verify 0 rows. Binds zero-count vector, recipient ID, episode ID, schema, and entropy into `initial_state_witness` (`INITIAL_ZERO_ROW_STATE_WITNESS`).

---

### Machine-Witnessed Verification Receipts

| Component / Test Suite | Executable Script | Receipt Artifact | Status |
|---|---|---|---|
| Shadow Graph v3 Default-Deny & Temporal | `packages/src_reciprocal_expedition/shadow_graph/test-shadow-graph-v3.mjs` | `shadow-graph-receipt-v3.json` | 26/26 PASS |
| Receiver v3 UTF-8 & Coordinates | `packages/src_reciprocal_expedition/receiver/test-receiver-utf8-v3.mjs` | `test-receiver-utf8-v3-receipt.json` | 23/23 PASS |
| 2x2 Mechanism Assay v3 | `packages/src_reciprocal_expedition/assay/run-mechanism-assay-v3.mjs` | `mechanism-assay-receipt-v3.json` | PASS ($|\Delta| = 3$) |
| Python Oracle vs JS Differential | `packages/src_reciprocal_expedition/fidelity/run-differential-comparison.mjs` | `differential-coverage-matrix.json` | 4 Exact, 1 Eq, 1 Doc Disc |
| Em Empty Receiver v1 | `packages/em_reciprocal_expedition/receiver/test-em-receiver.mjs` | `em-receiver-receipt.json` | 29/29 PASS |
| Em Reciprocal 3-Path Assay | `packages/em_reciprocal_expedition/assay/run-em-reciprocal-assay.mjs` | `em-reciprocal-assay-receipt.json` | 10/10 CONCORDANT |
| Dollhouse Multi-Role Audit | `tests/dollhouse-skill-audit-runner.mjs` | `artifacts/dollhouse-audit-receipt-crossing-e.json` | AUDIT PASS |

---

### Epistemic Claim Ceilings & Preservation

- Zero genuine source admission occurred (strictly synthetic research corpus used).
- Zero live model flights executed.
- Protected Experiment B remains strictly **HELD**.
- Standalone historical executor scan confirmed negative finding (0 executors survived in Main).
- Human scientific closure and claim promotion remain strictly **RESERVED**.
