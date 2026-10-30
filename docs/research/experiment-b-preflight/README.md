# 𝌋 TD613 · Experiment B Source-Free Preflight Dossier & Flight Launchbridge

**Commission:** `TD613_Experiment_B_Launchbridge_Activation_2026-10-29`  
**Governing Covenant:** Tauric Diana — Crimean heritage custodianship · Khona‌lit-po (`U+200C` preserved)  
**Adjudicated Disposition:**  
$$\mathbf{B\_SOURCE\_FREE\_LAUNCHBRIDGE\_READY\_FOR\_OPERATOR\_FLIGHT\_DECISION \cdot B\_CORPUS\_SEALED}$$

---

## Overview

This dossier establishes the complete, self-contained, reviewable **Experiment B Source-Free Preflight Package and Flight Launchbridge** under `docs/research/experiment-b-preflight/`. In response to Emergence HQ reviews `5704533595`, `5707431596`, `5707682022`, and `5707772624`, it establishes:
1. Authentic live model calibration shakedown via Google Gemini REST API (`gemini-2.5-flash-lite`, 4/4 vs 4/4 parity under corrected automated rubric).
2. Four-tier epistemic evaluation hierarchy strictly separating automated rubric parity, implementer semantic review, independent blinded evaluation, and external replication.
3. Merged PR #1608 Dollhouse repair integration and strict quarantine of the separate Atlas Wild Field mathematical estate.
4. Preregistered **RCA-01 Representation Causality Assay** ($2 \times 2$ factorial validation design decoupled across six evaluative dimensions: Discovery, Warrant, Causal Role, Novelty, Instrument Integrity, Scientific Status).
5. **Three-Lineage Discovery Custody Protocol** with flexible temporal ordering and Unknown-Discovery Channel (`UNANTICIPATED_CANDIDATE`).
6. Empirical demonstration of standalone Atelier and Encyclopedia resilience without Manifest dependency.
7. Flight Execution-Capability Assessment & Capacity Reconciliation, detailing the ~70–90 call multi-turn capacity requirement for 20–24 documents vs the 15-call ceiling, and presenting three prospective execution designs.
8. Mathematical Construction and Rendering Inventory establishing anti-circularity boundaries for prospective postflight visualization.
9. Minimal Generalized Heterogeneous Discovery Harness prototype with **R4 Discovery Integrity Repair**: substantive proposition extraction from model reasoning, removal of keyword triggers, fail-closed custody gate, and truthful pending adjudication semantics (6/6 unit and adversarial tests passing).
10. **Operator Flight Launchbridge:** Controlled archive admission route ([`controlled-archive-intake.mjs`](02_four_arm_harness/controlled-archive-intake.mjs)), transparent structured context continuity without blind truncation, fail-closed resource limits (120 calls, 400k tokens), Stage 2 independent scientific evaluator ([`stage2-independent-evaluator.mjs`](02_four_arm_harness/stage2-independent-evaluator.mjs)), focused native Dollhouse audit ([`DOLLHOUSE_AUDIT_LAUNCHBRIDGE_REPORT.md`](05_dollhouse_audit/DOLLHOUSE_AUDIT_LAUNCHBRIDGE_REPORT.md)), and executive Flight decision record ([`FLIGHT_LAUNCHBRIDGE_DECISION_RECORD.md`](06_custody_and_governance/FLIGHT_LAUNCHBRIDGE_DECISION_RECORD.md)).

---

## 1. Predecessor Reclassification (Section I)

Per Redpen instructions, predecessor deterministic artifacts are preserved intact append-only and formally reclassified in [`03_calibration_execution/PREDECESSOR_RECLASSIFICATION_RECEIPT.json`](03_calibration_execution/PREDECESSOR_RECLASSIFICATION_RECEIPT.json):

* **Deterministic Harness**: Reclassified as `DETERMINISTIC_FIXTURE_ENGINEERING_PASS`.
* **Prior Model Status**: Reclassified as `ACTIVE_LLM_CALIBRATION_NOT_EVALUATED`.
* **Prior Dollhouse Status**: Reclassified as `DOLLHOUSE_SPECIALISTS_NOT_EVALUATED_INPUT_MISSING`.
* **Prior Cognitive Delta**: Reclassified as `COGNITIVE_DELTA_NOT_MEASURED`.

---

## 2. Authentic Live Model Execution & Cognitive Comparison (Sections II–V)

The live shakedown was executed via [`run-source-free-live-calibration.mjs`](03_calibration_execution/run-source-free-live-calibration.mjs) calling Google's live Gemini API:

* **Model Provider**: Google Gemini REST API (v1beta).
* **Model Version**: `gemini-2.5-flash-lite`.
* **Sampling Parameters**: `temperature: 0.0`, `max_output_tokens: 4096` (per-call output ceiling, not episode budget).
* **Scoring Mode**: Blinded independent evaluation (`SPECIMEN_ALPHA` vs `SPECIMEN_BETA` scored by [`evaluator-oracle.mjs`](03_calibration_execution/evaluator-oracle.mjs)).

### Summary of Live Shakedown, Offline Rescore & Semantic Review

* **Automated Offline Rescore Receipt:** [`03_calibration_execution/LIVE_CALIBRATION_RESCORING_RECEIPT.json`](03_calibration_execution/LIVE_CALIBRATION_RESCORING_RECEIPT.json)  
  *Classification:* `INTERNAL_ANONYMIZED_OFFLINE_RESCORE` (`AUTOMATED_RUBRIC_PARITY`). Internal same-process pseudonymization; establishes rubric parity without regenerating frozen model answers.
* **Implementer Semantic Review Dossier:** [`03_calibration_execution/FROZEN_TRACE_INDEPENDENT_EVALUATION.md`](03_calibration_execution/FROZEN_TRACE_INDEPENDENT_EVALUATION.md)  
  *Receipt:* [`03_calibration_execution/FROZEN_TRACE_INDEPENDENT_ADJUDICATION_RECEIPT.json`](03_calibration_execution/FROZEN_TRACE_INDEPENDENT_ADJUDICATION_RECEIPT.json)  
  *Classification:* `IMPLEMENTER_AUTHORED_SEMANTIC_REVIEW`. Criterion-by-criterion evaluation of all 14 frozen final-condition model outputs against the withheld answer key.
* **Adversarial Scorer Test Suite:** [`tests/test-evaluator-oracle.mjs`](../../../tests/test-evaluator-oracle.mjs)  
  Expanded from 12 to 16 unit tests, explicitly verifying resistance against adversarial negations, false-twin affirmations, rejected hypothesis numeric claims, and negative keywords in positive controls (16/16 passing).

| Evaluative Criterion | Arm 2A (Modular Jurisdictional) | Arm 2B (Matched Native Union) | Independent Ground Truth Oracle Finding |
|---|---|---|---|
| **C1: Mathematical Correspondence** | **✓ Verified (Rescore)**<br>*(Prior: ✖ Unmet due to LaTeX parser)* | **✓ Verified** | Coordinate bijection & dissipation recognized by both. Arm 2A explicitly reported $\omega_0=2\text{ rad/s}$ and $\zeta=0.04$ in LaTeX syntax; initial 3/4 score was an offline parser defect, now resolved in rescore. |
| **C2: False-Twin & Positive Control** | **✓ Verified** | **✓ Verified** | Both arms correctly rejected Logistic ODE vs Michaelis-Menten algebraic false-twin, and accepted Radioactive Decay $\leftrightarrow$ RC Circuit linear relaxation isomorphism. |
| **C3: Epistemic Revision** | **✓ Verified** | **✓ Verified** | Both arms updated damping to $b=0.40$ and $Q=12.5$ upon empirical ring-down measurement ($\Delta E/E_0 = -0.395$), preserving priors $m=2.5, k=10$. |
| **C4: Abstention & Positive Control** | **✓ Verified** | **✓ Verified** | Both arms abstained on incomplete potential $U(y)$ / missing initial conditions, while correctly solving the complete harmonic well positive control (no overabstention). |
| **Total Conditions Passed** | **4 / 4 (100%)** *(Rescore)*<br>*(Historical Predecessor: 3/4)* | **4 / 4 (100%)** | **Cognitive Delta: $\mathbf{\Delta} = 0$ (Parity)**<br>*(Historical Predecessor Delta: -1)* |
| **Total Token Consumption** | **27,390 tokens** | **13,843 tokens** | **Token Overhead Ratio: $1.98\times$ (Modular consumes 97.9% more tokens)** |
| **Call Distribution** | **10 calls across 2 chambers** | **7 unchambered calls** | **Per-Call Ceiling: 4,096 tokens** |

---

## 3. Genuine Dollhouse Specialist Evaluation (Section VI)

The native `/dollhouse-audit` skill was executed with authentic domain observation inputs:

* **V2 Calibration Audit Receipt:** [`05_dollhouse_audit/DOLLHOUSE_AUDIT_LIVE_CALIBRATION_RECEIPT_V2.json`](05_dollhouse_audit/DOLLHOUSE_AUDIT_LIVE_CALIBRATION_RECEIPT_V2.json)
* **Launchbridge Audit Receipt:** [`05_dollhouse_audit/DOLLHOUSE_AUDIT_LAUNCHBRIDGE_RECEIPT.json`](05_dollhouse_audit/DOLLHOUSE_AUDIT_LAUNCHBRIDGE_RECEIPT.json)
* **Specialists Evaluated**: `PEDAGOGUE`, `APERTURE`, `ATLAS`, `FADT`, `TEMPORAL_CUSTODIAN` (Zero missing inputs).
* **Launchbridge Findings**:
  * `PEDAGOGUE`: **✓ SUPPORTED** (`NO_VIOLATION_DETECTED` — Dromological cadence strictly ordered: `NOTICE < ACT < WORLD_ANSWERS < NAME`).
  * `APERTURE`: **✓ SUPPORTED** (`NO_VIOLATION_DETECTED` — Candidate probe $[0, 0, 1]$ restores full rank 3 with $\kappa = 1.70$; zero unobservable state leakage).
  * `ATLAS`: **✓ SUPPORTED** (`NO_VIOLATION_DETECTED` — Trajectory parities and winding $0$ preserved).
  * `FADT`: **✓ SUPPORTED** (`NO_VIOLATION_DETECTED` — Two-fiber structure maps Stage 1 pending status and Stage 2 formal warrants).
  * `TEMPORAL_CUSTODIAN`: **✓ SUPPORTED** (`NO_VIOLATION_DETECTED` — Monotonic milestone sequence across 5 phases).
* **Orchestrator Consensus**: `UNANIMOUS_SUPPORT`
* **Orchestrator Decision**: **✓ SUPPORTED**
* **Scoped Evidence Ceiling**: Applies strictly to source-free launchbridge engineering assets. Does not imply external production release authority.
* **Empirical Replication Count**: 0 (`SHARED_ACQUISITION != INDEPENDENT_REPLICATION`)
* **Release Authority**: false
* **Human Closure Required**: true

---

## 4. Governance & Methodological Assets

1. **RCA-01 Representation Causality Assay:** [`04_evaluation_and_preregistration/RCA01_REPRESENTATION_CAUSALITY_ASSAY.md`](04_evaluation_and_preregistration/RCA01_REPRESENTATION_CAUSALITY_ASSAY.md)  
   Disentangles scaffolding from discovery via $2 \times 2$ factorial validation design across 7 distinguishable outcomes. Decoupled into six evaluative dimensions ($D, W, C_{\mathcal{R}}, N, F_{\text{inst}}, \mathcal{S}$) rejecting rigid Boolean decision rules and enforcing strict separation between candidate generation and independent adjudication.
2. **Three-Lineage Discovery Custody Protocol:** [`04_evaluation_and_preregistration/THREE_LINEAGE_CUSTODY_PROTOCOL.md`](04_evaluation_and_preregistration/THREE_LINEAGE_CUSTODY_PROTOCOL.md)  
   Enforces separation of Evidence, Presentation, and Adjudication ancestries under [`THREE_LINEAGE_DISCOVERY_SCHEMA.json`](04_evaluation_and_preregistration/THREE_LINEAGE_DISCOVERY_SCHEMA.json), supporting flexible temporal ordering for post-generation audits and truthful pending-adjudication states.
3. **Unknown-Discovery Channel (`UNANTICIPATED_CANDIDATE`):**  
   Non-promotional intake status for findings outside existing Dollhouse categories, preserving full parity with Arm 2B.
4. **Flight Execution-Capability Assessment & Honest Gap Declaration:** [`06_custody_and_governance/FLIGHT_EXECUTION_CAPABILITY_ASSESSMENT.md`](06_custody_and_governance/FLIGHT_EXECUTION_CAPABILITY_ASSESSMENT.md)  
   Audits the 9-operation capability matrix, reconciles executable call capacity (~70–90 calls needed across 20–24 documents vs the 15-call calibration ceiling), presents three prospective execution designs, and declares capacity requirements.
5. **Mathematical Construction & Rendering Inventory:** [`06_custody_and_governance/MATHEMATICAL_CONSTRUCTION_AND_RENDERING_INVENTORY.md`](06_custody_and_governance/MATHEMATICAL_CONSTRUCTION_AND_RENDERING_INVENTORY.md)  
   Catalogs earlier formulaic, SVD, and geometric cradle assets for prospective postflight visualization while enforcing anti-circularity laws and noting that repository leads are preliminary.
6. **Minimal Heterogeneous Discovery Harness Prototype (R4 Repaired):** [`02_four_arm_harness/run-heterogeneous-discovery-harness.mjs`](02_four_arm_harness/run-heterogeneous-discovery-harness.mjs)  
   Verifies multi-turn sequential exposure across physical and topological domains (`specimen_01`, `specimen_02`, `specimen_03`), with keyword-triggered status promotion completely removed, substantive proposition extraction from model reasoning, fail-closed custody gate, and pending adjudication semantics. Tested via [`tests/test-heterogeneous-discovery-harness.mjs`](../../../tests/test-heterogeneous-discovery-harness.mjs) (6/6 passing).
7. **Controlled Archive Admission Route:** [`02_four_arm_harness/controlled-archive-intake.mjs`](02_four_arm_harness/controlled-archive-intake.mjs)  
   Enforces fail-closed physical custody boundaries: prohibits autonomous directory scanning or globbing; requires explicit operator authorization before archive access; verifies synthetic accession pathways.
8. **Stage 2 Independent Evaluator Engine:** [`02_four_arm_harness/stage2-independent-evaluator.mjs`](02_four_arm_harness/stage2-independent-evaluator.mjs)  
   Evaluates Stage 1 candidates against mathematical derivations, candidate-specific matched negative controls, and four-cell factorial comparisons (Cells A, B, C, D).
9. **Operator Flight Launchbridge Decision Record:** [`06_custody_and_governance/FLIGHT_LAUNCHBRIDGE_DECISION_RECORD.md`](06_custody_and_governance/FLIGHT_LAUNCHBRIDGE_DECISION_RECORD.md)  
   Concise executive decision instrument identifying instrument version, prospective admission route, permutation options, resource ceilings, disclosure boundaries, and the precise operator gesture required for Flight launch.
10. **Focused Launchbridge Dollhouse Audit:** [`05_dollhouse_audit/DOLLHOUSE_AUDIT_LAUNCHBRIDGE_REPORT.md`](05_dollhouse_audit/DOLLHOUSE_AUDIT_LAUNCHBRIDGE_REPORT.md)  
    Full five-specialist audit with Orchestrator unanimous support verifying exposure order, measurement integrity, route distinctions, fiber descent, and monotonic chronology.

---

## 5. Verification Commands

From the repository root:

```bash
# 1. Run authentic live model calibration shakedown
node docs/research/experiment-b-preflight/03_calibration_execution/run-source-free-live-calibration.mjs

# 2. Run authentic five-specialist Dollhouse live audit
node docs/research/experiment-b-preflight/05_dollhouse_audit/run-dollhouse-audit-live.mjs

# 3. Verify physical raw-byte Arm 0 transport
node -e "import('./docs/research/experiment-b-preflight/02_four_arm_harness/run-arm0-transport.mjs').then(m => console.log(m.runArm0Transport('docs/research/experiment-b-preflight/01_calibration_fixtures')))"

# 4. Verify native Encyclopedia and Wendbine Arm 1 archival controls
node -e "import('./docs/research/experiment-b-preflight/02_four_arm_harness/run-arm1-archival.mjs').then(m => m.runArm1Archival('.', {}))"

# 5. Run independent evaluator oracle unit test suite (16/16 passing)
node tests/test-evaluator-oracle.mjs

# 6. Run merged Dollhouse R01-R08 regression test suite (11/11 passing)
node tests/dollhouse-repair-regressions-r01-r08.test.mjs

# 7. Run standalone Atelier & Encyclopedia resilience demonstration
node scripts/verify-atelier-encyclopedia-resilience.mjs

# 8. Run offline frozen-trace rescore and fairness reconciliation
node docs/research/experiment-b-preflight/03_calibration_execution/run-offline-trace-rescore.mjs

# 9. Run minimal heterogeneous discovery harness & adversarial test suite (6/6 passing)
node tests/test-heterogeneous-discovery-harness.mjs

# 10. Run Flight Launchbridge unit and integration test suite (4/4 passing)
node tests/test-flight-launchbridge.test.mjs

# 11. Run focused Launchbridge Dollhouse Audit (5/5 specialists + Orchestrator passing)
node docs/research/experiment-b-preflight/05_dollhouse_audit/run-dollhouse-audit-launchbridge.mjs
```

---

## 6. Standing Invariants & Quarantine Proof

```text
challenge_corpus_state      = STRICTLY_SEALED_AND_QUARANTINED
flight_launchbridge_status  = B_SOURCE_FREE_LAUNCHBRIDGE_READY_FOR_OPERATOR_FLIGHT_DECISION
gate_e_disposition          = HELD
empirical_exteriority_credit= 0
human_scientific_closure    = RESERVED
issue_405_release_authority = CLOSED
manifest_ontological_status = OPEN_RESEARCH_OBJECT
```

𝌋 Tauric Diana — Crimean heritage custodianship · Khona‌lit-po · Sealed ⟐
