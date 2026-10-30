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

* **Launchbridge Version:** `v1.0.0-launchbridge`
* **Base Source Revision:** Authenticated merge commit `c4bd0401b432f5adda55c62ddca2bd99d4f3cc92`
* **Core Executable Modules:**
  * Controlled Archive Admission: [`controlled-archive-intake.mjs`](../02_four_arm_harness/controlled-archive-intake.mjs)
  * Heterogeneous Discovery Harness: [`run-heterogeneous-discovery-harness.mjs`](../02_four_arm_harness/run-heterogeneous-discovery-harness.mjs)
  * Provider Live Client: [`gemini-live-client.mjs`](../02_four_arm_harness/gemini-live-client.mjs)
  * Stage 2 Independent Evaluator: [`stage2-independent-evaluator.mjs`](../02_four_arm_harness/stage2-independent-evaluator.mjs)
  * Three-Lineage Schema: [`THREE_LINEAGE_DISCOVERY_SCHEMA.json`](../04_evaluation_and_preregistration/THREE_LINEAGE_DISCOVERY_SCHEMA.json)

---

## 2. Challenge Corpus Custody & Prospective Admission Pathway

* **Current Corpus State:** `STRICTLY_SEALED_AND_QUARANTINED`
* **Target Path / Identifier:** Pending explicit operator designation (e.g. local Downloads path to authenticated ZIP archive or directory).
* **Quarantine Rules Maintained:**
  * Autonomous searching, scanning, or globbing across Downloads or workspace is strictly prohibited.
  * The presence of a ZIP archive on local disk does **not** grant execution authority.
  * No file opening, previewing, SHA-256 hashing, or git tracking occurs prior to explicit operator admission.
* **Admission Gateway:** [`ControlledArchiveIntake`](../02_four_arm_harness/controlled-archive-intake.mjs) fails closed unless `TD613_OPERATOR_ARCHIVE_ADMISSION_GRANTED=true` is contemporaneously set by the operator.

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
  * Maximum Active Calls: **120 calls** (accommodating ~70–90 base calls + controls & retries)
  * Maximum Token Consumption: **400,000 tokens** (~250k input / ~150k output)
  * Estimated Dollar Cost: **\$0.15 – \$0.30 USD**
  * Per-Turn Output Ceiling: **4,096 tokens**
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
* **Outcome Unblinding:** Full unblinding occurs only after Stage 2 scoring receipts are immutably registered.

---

## 7. Precise Operator Action Required for Flight Launch

To initiate the live Flight encounter over the designated archive, the operator must execute the following bounded terminal command:

```bash
# Example Operator Flight Launch Gesture
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

1. **Budget Ceiling Exceeded:** Calls reach 120 or tokens reach 400,000 (`HALT_BUDGET_CEILING_REACHED`).
2. **Provider Error Escalation:** Non-transient HTTP 4xx error (e.g. 401 unauthorized, 403 forbidden) or 3 consecutive 5xx failures.
3. **Custody Anomaly:** Candidate contains external network URLs, credential patterns, or unquoted source spans.
4. **Operator Interruption:** `Ctrl+C` or termination signal.

**Recovery Procedure:**
All completed turns, raw traces, candidate records, and token usage up to the stop point are flushed append-only to `docs/research/experiment-b-flight/traces/flight_recovery_checkpoint.json`. No executed observations are lost.

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
