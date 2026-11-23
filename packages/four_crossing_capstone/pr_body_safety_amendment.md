# 𝌋 TD613 · EXPERIMENT A · CAPSTONE FINITE SAFETY AMENDMENT
## Fail-Closed External Custody, Immutable Staging, Candidate Graph Isolation & Metric Reclassification

**Principal:** Tawanna C. Miller  
**Operator Identity:** `tauric.diana.613`  
**Heritage Custodianship:** Tauric Diana — Crimean Heritage Custodianship  
**Covenant:** Khona‌lit-po — strict preservation of literal interior U+200C (`Khona\u200Clit-po`)  
**Authorization Reference:** `SAC[X6ZNK5NO51]`  
**Repository:** `tauric-diana-613/TD613-TCP`  
**Base Target:** `research/experiment-a-four-crossing-capstone-20261105` (Draft PR #1697, HEAD `20df004c4997689d33ed614b42ab8b683c1da22a`)  
**Active Amendment Branch:** `research/experiment-a-capstone-safety-amendment-20261105`  
**Independent Scientific Review:** #5790386565  
**Protected Experiment B:** Strictly **HELD**  
**Human Source Admission, Scientific Interpretation, Merge, Deployment:** Strictly **RESERVED**

---

## Executive Summary

This pull request implements the **Capstone Finite Safety Amendment** following Emergence HQ's exact-head independent scientific review #5790386565 on PR #1697 (`20df004c4997689d33ed614b42ab8b683c1da22a`).

All five governed amendments have been implemented, verified through targeted adversarial test suites, and audited by the native Dollhouse Multi-Role Orchestrator:

### 1. Amendment A — External Human Authorization (Fail-Closed)
- **Problem Identified (C-01):** The external admission gate previously accepted any nonempty string token without verifying a trusted external authority root.
- **Safety Repair Landed:** Until an independently authenticated human trust root actually exists, `EXTERNALLY_AUTHENTICATED_HUMAN_ADMISSION` fails closed for **every** supplied token (null, empty, arbitrary string, or syntactically plausible fabricated token).
- **Adjudicator Separation:** Prohibits self-issued `MACHINE_SYNTHETIC` events from issuing external `HUMAN` approvals (`MACHINE_CANNOT_ISSUE_HUMAN_ADMISSION`). Self-issued human events without an external trust root fail closed (`EXTERNAL_HUMAN_AUTH_ROOT_UNAVAILABLE`).

### 2. Amendment B — Synthetic Provenance & Immutable Staged Proposals
- **Problem Identified (C-02, C-03):** Records with missing or ambiguous synthetic declarations could slip through, and callers could mutate proposal metadata after preparation.
- **Safety Repair Landed:** 
  - Requires explicit boolean `synthetic: true` on the reparsed staged payload; absent, null, false, string (e.g. `"true"`), or number values are strictly rejected (`SYNTHETIC_DECLARATION_INVALID`).
  - `admitRecord()` reparses the immutable staged JSON bytes (`ua_proposals.record_json`) at admission time and re-computes its SHA-256 digest independently.
  - Rejects caller attempts to alter `raw_json` (`STAGED_PAYLOAD_MUTATED`), mutate record IDs (`PROPOSAL_RECORD_ID_MISMATCH`), or alter record labels/kinds (`PROPOSAL_RECORD_MUTATED`).
  - Database columns in `ua_records` derive strictly from the reparsed immutable bytes.

### 3. Amendment C — Candidate Relations Outside Admitted Graph
- **Problem Identified (C-04):** Unvalidated candidate predicates (`CANDIDATE_UNVALIDATED_PREDICATE`) were previously inserted into the active reverse-citation index (`ua_reverse_citations`) and included in graph projections.
- **Safety Repair Landed:**
  - Candidate relations are recorded in `ua_links` for historical inspection but are strictly excluded from `ua_reverse_citations`.
  - `neighbors()` and `route()` default strictly to `status = 'ADMITTED'`.
  - `canonicalProjectionPi()` and `UniversalAtelierReceiver.canonicalProjectionPi()` strictly query `WHERE status = 'ADMITTED'`, guaranteeing that unvalidated candidate edges never contaminate the terminal research graph.

### 4. Amendment D — Scientific Measurement Corrections
- **Problem Identified (C-05, C-07, C-08):** Hard-coded 50% and 100% figures were framed as empirical classifier scores; Wendbine 146 relations were claimed as matched admissions when only 9 samples were admitted into the receiver; Reference Encyclopedia was claimed as "without semantic loss" despite 5 measured differentials.
- **Corrections Landed:**
  - **Twin-World Reclassification:** Reclassified 50% as expected chance under a balanced symmetric prior due to mutual information \(I(\text{World}; \Pi(G)) = 0\), and 100% as construction-specific in-sample trace separability via signed rejection logs. Explicitly stated: no empirical blinded classifier was executed.
  - **Wendbine Parity Qualification:** Formally distinguishes the 9 sample relations admitted into the receiver across the 9 graph families from the 146 original scientific relations in PR #1685. Transfer of all 146 relations and source-support parity is explicitly declared HELD pending per-edge source witness validation. The 143 computed co-occurrence edges are verified at threshold >= 2 without claiming per-edge support equality.
  - **Encyclopedia 7/5 Differential:** Formally confirms 7 concordant dimensions and 5 measured differentials across 12 comparisons. Clarified in Dimension 8 that Reference Edition 1.4 had `null` claim ceiling while Universal Atelier attaches fallback limitations, representing an intentional structural adaptation rather than verbatim parity. All contradictory claims of universal semantic losslessness have been removed.

### 5. Amendment E — Audit, Runner Safeguard & Stopping Rule
- **Problem Identified (C-09 & Amari's Discovery):** Audit spec previously referenced parent commit rather than PR #1697 HEAD, and the Dollhouse runner silently hung when passed positional filenames without `--input`.
- **Repairs Landed:**
  - `audit-spec-capstone.json` binds directly to exact evaluated commit `20df004c4997689d33ed614b42ab8b683c1da22a`.
  - Dollhouse CLI runner (`scripts/run-dollhouse-skill-audit.mjs`) updated to fail closed immediately on unrecognized positional arguments with code 2 and clear usage instructions.
  - Added targeted regression test in `test-custodial-and-time-boundaries.mjs` verifying immediate fail-closed execution without hanging.
  - Nested Aperture (`HELD_NOT_YET_WITNESSED`) and Atlas (`HELD_INVALID_DECLARATION`) holds carried into final register.
  - Re-executed Dollhouse Multi-Role Audit: **🟢 SUPPORTED** (`UNANIMOUS_SUPPORT`, 5/5 specialists, 0 infractions, execution duration: 445ms).

---

## Machine Receipt Verification Census

1. `packages/universal_atelier/receiver/test-universal-atelier.mjs`: **45 / 45 PASSED**.
2. `packages/four_crossing_capstone/test-custodial-and-time-boundaries.mjs`: **32 / 32 PASSED** (includes all Amendment A, B, C, and runner fail-closed regression tests).
3. `packages/four_crossing_capstone/run-encyclopedia-matched-assay.mjs`: **7 Concordant, 5 Measured Differentials / 12 Dimensions**.
4. `packages/four_crossing_capstone/run-wendbine-matched-assay.mjs`: **10 / 10 Dimensions Concordant & Reconciled** (with explicit sample/held-transfer qualifications).
5. `packages/four_crossing_capstone/run-twin-world-assay.mjs`: **4 / 4 Estates INVARIANT_CONFIRMED** (reclassified theoretical separability).
6. `artifacts/dollhouse-audit-receipt-capstone.json`: **🟢 SUPPORTED** (`UNANIMOUS_SUPPORT`, 5/5 specialists, 0 infractions).

---

## Stopping Rule Confirmation

Following completion of this amendment, the source-free engineering cycle for Experiment A stands formally concluded. No new research estates, model activations, or unblinded evaluations have been initiated. The next separately commissioned activity will be an independent Argon postflight investigation using frozen research evidence and a newly preregistered blinded challenge.

𝄐 Khona‌lit-po  
Human scientific closure RESERVED  
Protected Experiment B HELD  
Sealed ⟐SAC[X6ZNK5NO51]
