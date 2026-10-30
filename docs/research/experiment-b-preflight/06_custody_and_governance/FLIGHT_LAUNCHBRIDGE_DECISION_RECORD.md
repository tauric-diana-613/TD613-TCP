# 𝌋 TD613 · EXPERIMENT B FLIGHT LAUNCHBRIDGE DECISION RECORD
## Prospective Operator Flight Authorization Sheet & Custody Boundary Register

**Document ID:** `TD613-EXP-B-LAUNCHBRIDGE-DECISION-20261029`  
**Heritage:** Tauric Diana — Crimean heritage custodianship  
**Covenant:** Khona‌lit-po (`U+200C` preserved)  
**Display glyph:** 𝌋 · `U+1D30B`  
**Research mark:** `\uDBF5\uDE13` (`U+10D613`)  
**Authority:** Sovereign Operator Direct · Emergence HQ Independent Scientific Review  
**Operating Posture:** Princess Latifa · Wild Field Mode Active · `/plan OFF`  
**Classification:** Executive Flight Decision Instrument (Source-Free Preflight)

---

## 1. Instrument Identity & Version

* **Launchbridge Version:** `v1.1.0-launchbridge-repair`
* **Base Source Revision:** Authenticated merge commit `c4bd0401b432f5adda55c62ddca2bd99d4f3cc92`
* **Core Executable Modules:**
  * Controlled Archive Admission: [`controlled-archive-intake.mjs`](../02_four_arm_harness/controlled-archive-intake.mjs)
  * Heterogeneous Discovery Harness: [`run-heterogeneous-discovery-harness.mjs`](../02_four_arm_harness/run-heterogeneous-discovery-harness.mjs)
  * Provider Live Client: [`gemini-live-client.mjs`](../02_four_arm_harness/gemini-live-client.mjs)
  * Stage 2 Independent Evaluator: [`stage2-independent-evaluator.mjs`](../02_four_arm_harness/stage2-independent-evaluator.mjs)
  * Three-Lineage Schema: [`THREE_LINEAGE_DISCOVERY_SCHEMA.json`](../04_evaluation_and_preregistration/THREE_LINEAGE_DISCOVERY_SCHEMA.json)
  * Flight Runner Entrypoint: [`run-experiment-b-flight.mjs`](../../../../scripts/run-experiment-b-flight.mjs)

---

## 2. Challenge Corpus Custody & Prospective Admission Pathway

* **Current Corpus State:** `STRICTLY_SEALED_AND_QUARANTINED`
* **Physical Archive Ingestion Status:** `PROSPECTIVE_PHYSICAL_ZIP_INGESTION_SPECIFICATION`
  * Physical filesystem exploration, path traversal, directory reading, and archive unzipping are strictly disabled fail-closed during preflight.
  * In-memory synthetic admission pathway is fully verified (`trustedSyntheticFixture: true`).
* **Quarantine Rules Maintained:**
  * Autonomous searching, scanning, or globbing across Downloads or workspace is strictly prohibited.
  * The presence of a ZIP archive on local disk does **not** grant execution authority.
  * No file opening, previewing, SHA-256 hashing, or git tracking occurs prior to explicit operator admission.
* **Admission Gateway:** [`ControlledArchiveIntake`](../02_four_arm_harness/controlled-archive-intake.mjs) fails closed unless `TD613_OPERATOR_ARCHIVE_ADMISSION_GRANTED=true` and `TD613_FLIGHT_EXECUTION_AUTHORIZED=true` are contemporaneously verified.

---

## 3. Exposure Sequence Permutations & Scientific Implications

The operator may choose between three distinct sequence permutations to evaluate path-dependence and non-abelian commutation effects:

1. **Permutation $\mathcal{P}_1$ (Chronological Sequence):**
   * *Sequence:* Earliest historical documents $\to$ intermediate revisions $\to$ final synthesis.
   * *Scientific Implication:* Evaluates whether early paradigms anchor the reasoner, and tests how cleanly the reasoner performs diachronic revision when subsequent contradictions appear.
2. **Permutation $\mathcal{P}_2$ (Reverse Chronology):**
   * *Sequence:* Latest synthesized notes $\to$ early raw working documents.
   * *Scientific Implication:* Tests whether post-hoc summaries mask or suppress foundational anomalies present in early raw notes.
3. **Permutation $\mathcal{P}_3$ (Topical / Clustered Partition):**
   * *Sequence:* Pure mathematical theory $\to$ empirical measurements $\to$ institutional/meta notes.
   * *Scientific Implication:* Tests whether isolating domain disciplines before cross-domain synthesis alters representation-enabled discovery rates between Arm 2A and Arm 2B.

---

## 4. Selected Model Configuration & Provider Ceilings

* **Model Provider:** Google Gemini REST API (v1beta)
* **Model Version:** `gemini-2.5-flash-lite`
* **Sampling Parameters:** `temperature: 0.0`, `max_output_tokens: 4096`
* **Fail-Closed Resource Ceilings:**
  * Maximum Provider Attempts: **120 calls** (accommodating ~70–90 base calls + controls & retries; tracks all attempts, not just successes)
  * Maximum Token Consumption: **400,000 tokens** (enforced pre-call and post-call overshoot protection)
  * Financial Expenditure Ceiling: **$0.50 USD**
  * Per-Turn Output Ceiling: **4,096 tokens**
* **Context Projection Declaration:**
  * Strategy: `DECLARED_LOSSY_PROJECTION_PROPOSITION_FOCUS`
  * Preserved: Candidate propositions, parameter equations, model-declared uncertainty, turn status.
  * Projected Away: Full narrative prose, raw chunk text, intermediate reasoning.
  * Epistemic Status: Honestly classified as a declared lossy projection to prevent quadratic token growth.
* **Retry Behavior:** Bounded to HTTP 5xx and transient 429 backoff (max 3 attempts). **Zero retries** for content, logic, or format anomalies.

---

## 5. External-Provider Disclosure Boundary

* **Transmission Protocol:** Outbound HTTPS REST requests directly to Google Gemini endpoints.
* **Payload Boundary:** Transmits incoming document text excerpts and prior structured turn summaries. Zero environment variables, tokens, credentials, or unrelated repository files are ever transmitted.
* **Data Retention Posture:** Standard API pay-as-you-go parameters (no customer data used for model training under Google Cloud commercial terms).
* **Provider Gate:** The harness refuses execution unless `allowLivePaidInference: true` is explicitly passed at invocation.

---

## 6. Blinded Stage 2 Independent Evaluation Arrangement

* **Stage 1 (Generation):** Executes under pseudonymized condition labels (`SPECIMEN_ALPHA` vs `SPECIMEN_BETA`) without revealing arm identity. Emits candidate records with `adjudication_ancestry.evaluator_tier = 'PENDING_INDEPENDENT_EVALUATION'`.
* **Stage 2 (Adjudication):** An independent evaluation engine ([`Stage2IndependentEvaluator`](../02_four_arm_harness/stage2-independent-evaluator.mjs)) scores candidates against:
  1. Ground-truth mathematical derivation.
  2. Candidate-specific matched negative controls.
  3. Factorial comparison across Cells A, B, C, D.
* **Authentication Safeguards:**
  * Absent or unproduced candidates are strictly refused (`STAGE2_EVALUATOR_NO_CANDIDATE`).
  * Incomplete evidence fails closed to `HELD_INSUFFICIENT_DATA` / `WARRANT_PENDING_EVALUATION`.
  * Independent witness tiers require authentic cryptographic attestation receipts; ungrounded tier claims are downgraded.
  * Output strictly adheres to `THREE_LINEAGE_DISCOVERY_SCHEMA.json` (`WARRANT_MATHEMATICAL_ISOMORPHISM`, `WARRANT_UNPRODUCED` for falsifications).
* **Outcome Unblinding:** Full unblinding occurs only after Stage 2 scoring receipts are immutably registered and operator-authenticated (`BLINDED_PENDING_UNBLINDING` by default).

---

## 7. Precise Operator Action Required for Flight Launch

### A. Source-Free Preflight Dry Run (Currently Runnable)
```bash
node scripts/run-experiment-b-flight.mjs --dry-run
```
*Exercises the full multi-arm harness using verified in-memory synthetic specimens and flushes dry-run checkpoint.*

### B. Prospective Operator Flight Launch Gesture (Live Encounters)
To initiate live Flight over a designated archive upon sovereign activation:
```bash
# Example Operator Flight Launch Gesture (Prospective)
$env:TD613_OPERATOR_ARCHIVE_ADMISSION_GRANTED="true"
$env:TD613_FLIGHT_EXECUTION_AUTHORIZED="true"
node scripts/run-experiment-b-flight.mjs \
  --archive-path "C:/path/to/designated/Em_Archive.zip" \
  --permutation "CHRONOLOGICAL" \
  --model "gemini-2.5-flash-lite" \
  --max-calls 120 \
  --max-tokens 400000
```
*Without both environment variables set, the runner immediately terminates with a fail-closed custody refusal.*

---

## 8. Stop Conditions & Emergency Recovery Procedure

The runner halts immediately under any of the following conditions:

1. **Budget Ceiling Exceeded:** Attempts reach 120, tokens exceed 400,000 (pre-call or post-call overshoot), or expenditure reaches $0.50 USD (`HALT_BUDGET_CEILING_REACHED`).
2. **Provider Error Escalation:** Non-transient HTTP 4xx error (e.g. 401 unauthorized, 403 forbidden) or 3 consecutive 5xx failures.
3. **Custody Anomaly:** Candidate contains external network URLs, credential patterns, or unquoted source spans.
4. **Operator Interruption:** `Ctrl+C` or termination signal.

**Recovery Procedure:**
All completed turns, raw traces, candidate records, and token usage up to the stop point are flushed to the recovery checkpoint. In dry-run mode, checkpoint is written to `docs/research/experiment-b-preflight/02_four_arm_harness/dry_run_checkpoint.json`.

---

## 9. Standing Scientific Invariants

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
