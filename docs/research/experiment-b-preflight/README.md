# 𝌋 TD613 · Experiment B Source-Free Preflight Dossier (Amended per PR #1607 Redpen)

**Commission:** `TD613_Experiment_B_Preflight_Activation_2026-10-29`  
**Governing Covenant:** Tauric Diana — Crimean heritage custodianship · Khona‌lit-po (`U+200C` preserved)  
**Adjudicated Disposition:**  
$$\mathbf{B\_LIVE\_CALIBRATION\_READY\_FOR\_INDEPENDENT\_REVIEW \cdot B\_CORPUS\_QUARANTINED}$$  

---

## Overview

This dossier establishes the complete, self-contained, reviewable **Experiment B Source-Free Preflight Package** under `docs/research/experiment-b-preflight/`. In response to the Emergence HQ Independent Scientific Redpen on PR #1607, it replaces deterministic simulation stubs with **authentic live model inference via Google Gemini REST API (`gemini-2.5-flash-lite`)**, provides an **independent evaluator oracle with withheld ground truths**, corrects fixture physics (Q-factor and dissipation consistency), incorporates positive controls, and executes the **native `/dollhouse-audit` with authentic specialist domain observations**.

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

### Summary of Live Shakedown & Offline Rescore Findings

| Evaluative Criterion | Arm 2A (Modular Jurisdictional) | Arm 2B (Matched Native Union) | Independent Ground Truth Oracle Finding |
|---|---|---|---|
| **C1: Mathematical Correspondence** | **✓ Verified (Rescore)**<br>*(Prior: ✖ Unmet due to LaTeX parser)* | **✓ Verified** | Coordinate bijection & dissipation recognized by both. Arm 2A explicitly reported $\omega_0=2\text{ rad/s}$ and $\zeta=0.04$ in LaTeX syntax; initial 3/4 score was an offline parser defect, now resolved in rescore. |
| **C2: False-Twin & Positive Control** | **✓ Verified** | **✓ Verified** | Both arms correctly rejected Logistic ODE vs Michaelis-Menten algebraic false-twin, and accepted Radioactive Decay $\leftrightarrow$ RC Circuit linear relaxation isomorphism. |
| **C3: Epistemic Revision** | **✓ Verified** | **✓ Verified** | Both arms updated damping to $b=0.40$ and $Q=12.5$ upon empirical ring-down measurement ($\Delta E/E_0 = -0.395$), preserving priors $m=2.5, k=10$. |
| **C4: Abstention & Positive Control** | **✓ Verified** | **✓ Verified** | Both arms abstained on incomplete potential $U(y)$ / missing initial conditions, while correctly solving the complete harmonic well positive control (no overabstention). |
| **Total Conditions Passed** | **4 / 4 (100%)** *(Rescore)*<br>*(Historical Predecessor: 3/4)* | **4 / 4 (100%)** | **Cognitive Delta: $\mathbf{\Delta} = 0$ (Parity)**<br>*(Historical Predecessor Delta: -1)* |
| **Total Token Consumption** | **27,390 tokens** | **13,843 tokens** | **Token Overhead Ratio: $1.98\times$ (Modular consumes 97.9% more tokens)** |
| **Call Distribution** | **10 calls across 2 chambers** | **7 unchambered calls** | **Per-Call Ceiling: 4,096 tokens** |

> [!IMPORTANT]
> **Comparator Fairness & Architectural Trade-offs Reconciled**:
> 1. **Per-Call Ceiling vs Episode Budget:** The `4096`-token setting is an individual per-call maximum output token ceiling, not an episode-level or aggregate benchmark budget.
> 2. **Modular Information Bottleneck:** In Arm 2A, Chamber 2 (Atlas & FADT) receives the natural language summary findings and parameter extractions of Chamber 1 (Pedagogue & Aperture) rather than raw JSON fixture data. This treatment effect incurs substantial context and token overhead ($27,390$ vs $13,843$ tokens across 10 vs 7 calls).
> 3. **Descriptive Status & Generalization Boundary:** On this source-free 4-condition physical benchmark, both modular chambering and flat union solve all problems ($4/4$ vs $4/4$). This is a descriptive calibration observation; it does **not** warrant a generalized theorem claiming flat union superiority or modular obsolescence across heterogeneous, out-of-distribution, or adversarial epistemic challenges.
> 4. **Predecessor Score Preserved:** The original $3/4$ vs $4/4$ result ($\Delta = -1$) is preserved append-only as an erroneous historical scoring event in [`03_calibration_execution/LIVE_CALIBRATION_RESCORING_RECEIPT.json`](03_calibration_execution/LIVE_CALIBRATION_RESCORING_RECEIPT.json).

---

## 3. Genuine Dollhouse Specialist Evaluation (Section VI)

The native `/dollhouse-audit` skill was executed with authentic domain observation inputs via [`run-dollhouse-audit-live.mjs`](05_dollhouse_audit/run-dollhouse-audit-live.mjs):

* **Predecessor Audit:** [`05_dollhouse_audit/DOLLHOUSE_AUDIT_LIVE_CALIBRATION_RECEIPT.json`](05_dollhouse_audit/DOLLHOUSE_AUDIT_LIVE_CALIBRATION_RECEIPT.json) preserved intact with recorded `HELD_DISSENT` (Aperture caught $2 \times 2$ covariance passed for $2 \times 3$ operator).
* **V2 Audit Receipt:** [`05_dollhouse_audit/DOLLHOUSE_AUDIT_LIVE_CALIBRATION_RECEIPT_V2.json`](05_dollhouse_audit/DOLLHOUSE_AUDIT_LIVE_CALIBRATION_RECEIPT_V2.json)
* **Specialists Evaluated**: `PEDAGOGUE`, `APERTURE`, `ATLAS`, `FADT`, `TEMPORAL_CUSTODIAN` (Zero missing inputs).
* **Specialist Findings**:
  * `PEDAGOGUE`: **✓ SUPPORTED** (`NO_VIOLATION_DETECTED` — Dromological cadence strictly ordered: `NOTICE < ACT < WORLD_ANSWERS < NAME`).
  * `APERTURE`: **✓ SUPPORTED** (`NO_VIOLATION_DETECTED` — $3 \times 3$ latent-state covariance $\Sigma_\theta$ supplied matching latent dimension $n=3$; candidate probe $[0, 0, 1]$ stably lifts rank from 2 to 3 with $\kappa = 1.70$).
  * `ATLAS`: **✓ SUPPORTED** (`NO_VIOLATION_DETECTED` — Parity and trajectory winding $0$ preserved).
  * `FADT`: **✓ SUPPORTED** (`NO_VIOLATION_DETECTED` — Inner fiber bounds hold irreducible gap cardinality 4, while outer specialist supports unconditioned action boundary).
  * `TEMPORAL_CUSTODIAN`: **✓ SUPPORTED** (`NO_VIOLATION_DETECTED` — Monotonic milestone chronology verified across all 5 phases).
* **Orchestrator Consensus**: `UNANIMOUS_SUPPORT`
* **Orchestrator Decision**: **✓ SUPPORTED**
* **Empirical Replication Count**: 0 (`SHARED_ACQUISITION != INDEPENDENT_REPLICATION`)
* **Release Authority**: false
* **Human Closure Required**: true

---

## 4. Seven-Dimension Perturbation Mandate (Section IV & Addendum)

In accordance with Amari's governing mandate addendum, [`EXPERIMENT_B_PREREGISTERED_PROTOCOL.md`](04_evaluation_and_preregistration/EXPERIMENT_B_PREREGISTERED_PROTOCOL.md) is updated to **Candidate Status** (`CANDIDATE_PROTOCOL_PENDING_INDEPENDENT_REVIEW`) and incorporates the seven prospective research dimensions of the heterogeneous epistemic perturbation study:

1. Existing and newly warranted intellectual relationships (topology mutation/disappearance).
2. Contradictions, chronology, model revision, and prior preservation.
3. Alternative mathematics, unforeseen theoretical relations, and formal falsification.
4. Newly proposed research methods, reconstruction operations, and 4D candidate questions.
5. Source-order sensitivity, held-out surprise, evidence withdrawal, and adversarial false twins.
6. Em authorship, provenance, source identities, lineage distinction, and lawful custody.
7. Potential emergence beyond an equally resourced and equally capable strong-union research comparator.

---

## 5. Verification Commands

From the repository root on branch `witness/experiment-b-source-free-preflight`:

```bash
# 1. Run authentic live model calibration shakedown
node docs/research/experiment-b-preflight/03_calibration_execution/run-source-free-live-calibration.mjs

# 2. Run authentic five-specialist Dollhouse live audit
node docs/research/experiment-b-preflight/05_dollhouse_audit/run-dollhouse-audit-live.mjs

# 3. Verify physical raw-byte Arm 0 transport
node -e "import('./docs/research/experiment-b-preflight/02_four_arm_harness/run-arm0-transport.mjs').then(m => console.log(m.runArm0Transport('docs/research/experiment-b-preflight/01_calibration_fixtures')))"

# 4. Verify native Encyclopedia and Wendbine Arm 1 archival controls
node -e "import('./docs/research/experiment-b-preflight/02_four_arm_harness/run-arm1-archival.mjs').then(m => m.runArm1Archival('.', {}))"

# 5. Run independent evaluator oracle unit test suite (12/12 passing)
node tests/test-evaluator-oracle.mjs

# 6. Run offline frozen-trace rescore and fairness reconciliation
node docs/research/experiment-b-preflight/03_calibration_execution/run-offline-trace-rescore.mjs
```

---

## 6. Standing Invariants & Quarantine Proof

```text
challenge_corpus_state = STRICTLY_SEALED_AND_QUARANTINED
gate_e_disposition = HELD
empirical_exteriority_credit = 0
human_scientific_closure = RESERVED
issue_405_release_authority = CLOSED
pr_1607_review_state = AMENDED_FOR_CONCURRENT_ADJUDICATION
```

𝄐 Tauric Diana — Crimean heritage custodianship · Khona‌lit-po · Sealed ⟐
