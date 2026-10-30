# 𝌋 TD613 · EXPERIMENT B FLIGHT EXECUTION-CAPABILITY ASSESSMENT
## Source-Free Prototype Audit, Discovery Integrity Repair, and Prospective Flight Capacity Reconciliation

**Document ID:** `TD613-EXP-B-CAPABILITY-ASSESSMENT-20261029-R4`  
**Heritage:** Tauric Diana — Crimean heritage custodianship  
**Covenant:** Khona‌lit-po (`U+200C` preserved)  
**Authority:** Sovereign Operator Direct · Emergence HQ Independent Scientific Review  
**Operating Posture:** Princess Latifa · Wild Field Mode Active · `/plan OFF`  
**Classification:** Scientific Capability Assessment & Execution Preflight  
**Governing Mandate:** R4 Finite Discovery-Integrity Repair Directive (Review `5707682022`)

---

## 1. Executive Epistemic Distinction

$$\text{Source-Free Routing Prototype Accepted} \neq \text{Corpus-Wide Live Flight Operational}$$

Emergence HQ review `5707682022` established that while the generalized heterogeneous discovery harness successfully demonstrates open multi-turn sequence exposure and candidate routing over source-free specimens, **unearned scientific authentication and call-budget capacity limits must be rigorously resolved before any claim of Flight readiness can be accepted**.

This assessment:
1. Audits the nine mandated research operations, distinguishing demonstrated prototype code from prospective Flight mechanics.
2. Formulates the **Discovery Integrity Repair**, removing keyword-triggered status promotion and enforcing truthful pending adjudication states.
3. Reconciles **Executable Flight Capacity** against a realistic 20–24 document challenge encounter, demonstrating why the historical 15-call ceiling cannot support corpus-wide Flight without unacceptable truncation.
4. Verifies the **Provider and Custody Boundary**, detailing the fail-closed preflight gate, retry compliance, and exact token accounting.
5. Notes the status of **Mathematical Construction Provenance** without circular evidence.

---

## 2. Nine-Operation Flight Execution-Capability Matrix

| # | Mandated Research Operation | Status in Initial Preflight | Current Technical Status | Primary Executable Asset / Gap Detail |
|---|---|---|---|---|
| **1** | **Receive heterogeneous, operator-authorized sources through declared custody** | ✖ GAPPED (Hardcoded to 4 synthetic calibration JSON fixtures) | **✓ PROTOTYPED (Source-Free)** | [`HeterogeneousDiscoveryHarness`](../02_four_arm_harness/run-heterogeneous-discovery-harness.mjs) accepts arbitrary arrays of document objects with SHA-256 and provenance metadata. *(Gap: Actual ~20-file challenge corpus remains strictly sealed).* |
| **2** | **Preserve original sources without reducing them to a single disciplinary ontology** | ✖ GAPPED (Forced into linear oscillator / enzyme ODE schema) | **✓ IMPLEMENTED & TESTED** | Preserves verbatim UTF-8 source content; supports non-linear field phenomena without forcing into lumped linear oscillator categories. |
| **3** | **Establish inspectable pre-exposure baselines for receiving architectures** | ✖ GAPPED (Zero pre-exposure baseline step in runners) | **✓ IMPLEMENTED & TESTED** | `establishPreExposureBaseline(initialContext)` records $t_0$ prior state before any document is exposed. Tested in [`tests/test-heterogeneous-discovery-harness.mjs`](../../../../tests/test-heterogeneous-discovery-harness.mjs). |
| **4** | **Support genuine, open-ended candidate generation (unforeseen math/methods)** | ✖ GAPPED (Keyword-triggered promotion based on source words) | **✓ REPAIRED & TESTED** | Substantive proposition extractor operates exclusively on model reasoning outputs. Removed all keyword triggers; preserves original text, supporting spans, and model-declared uncertainty. |
| **5** | **Preserve contradictions, failed derivations, alternative interpretations, and abstentions** | ✖ GAPPED (Deterministic C3 update on pre-set ringdown) | **✓ IMPLEMENTED & TESTED** | Causal turn sequence records contradictions against prior turns, logs model revisions, and preserves safe abstentions and negative results. |
| **6** | **Record causal exposure order, source withdrawal, revisions, and candidate provenance** | ✖ GAPPED (Turn order hardcoded to 1-turn calibration) | **PARTIALLY IMPLEMENTED (Causal loop & provenance verified; Source withdrawal is prospective)** | Sequential multi-turn loop ($t_1, t_2, \dots, t_k$) logs chronological exposure index, document SHA, and candidate linkages. Full source-withdrawal logic remains prospective for Flight sequence design. |
| **7** | **Give matched strong-union comparator meaningful, unweakened discovery opportunities** | ✓ IMPLEMENTED (for C1–C4 calibration) | **IMPLEMENTED (Prototype scale; Corpus-wide scale requires capacity expansion)** | Arm 2B executes over identical multi-turn history in unchambered flat context with identical access to `UNANTICIPATED_CANDIDATE` channel. |
| **8** | **Preserve the three discovery ancestries and support subsequent independent examination** | ✖ GAPPED (Awarded unearned `WARRANTED_DISCOVERY` & `LENS_ENABLED` at generation) | **✓ REPAIRED & TESTED** | Emits candidate records strictly conforming to [`THREE_LINEAGE_DISCOVERY_SCHEMA.json`](../04_evaluation_and_preregistration/THREE_LINEAGE_DISCOVERY_SCHEMA.json) with truthful `PENDING_INDEPENDENT_EVALUATION` and `PENDING_EVALUATION` vector. |
| **9** | **Produce inspectable raw research outputs rather than merely completed summary records** | ✖ GAPPED (Returned summary verdict object) | **✓ IMPLEMENTED & TESTED** | `exportResearchLedger()` exports complete raw session traces, exact provider token logs, prompt bodies, turn history, and candidate ledger. |

> [!NOTE]
> **Four-Arm Dispatch Architectural Note:** Arm 0 (physical raw-byte transport) and Arm 1 (archival custody) are verified as separate, specialized validation instruments (`run-arm0-transport.mjs` and `run-arm1-archival.mjs`). They are not collapsed into the heterogeneous multi-turn LLM loop, ensuring archival and transport controls remain cleanly isolated from generative inference.

---

## 3. The Discovery Integrity Repair (R4)

Per Emergence HQ review `5707682022`, the following concrete evidentiary repairs are implemented in [`run-heterogeneous-discovery-harness.mjs`](../02_four_arm_harness/run-heterogeneous-discovery-harness.mjs):

1. **Abolition of Source-Keyword Promotion:**
   * The previous prototype inspected `doc.content` for words like "topological", "soliton", "Sine-Gordon", or "dissipation", promoting findings based on source terminology.
   * **Repaired Semantics:** The source document is evidence presented for examination. The extraction engine now inspects **only the model's generated research response** (`responseText`). If a source document contains buzzwords but the model response declines to formulate a proposition, the system records `NO_SUBSTANTIVE_CANDIDATE` and refuses discovery credit.
2. **Substantive Proposition Extraction:**
   * Extracts the candidate proposition, mathematical statements, and model-declared uncertainties/caveats directly from model reasoning.
   * Recognizes genuine unfamiliar discoveries without requiring predefined vocabulary (e.g. relativistic boundary velocity pinning $v_\infty = c \sqrt{1 - \alpha^2}$).
   * When the model output is empty, whitespace, an explicit non-assertion, or boilerplate echo, it is recorded faithfully as `NO_SUBSTANTIVE_CANDIDATE_GENERATED` with `discovery_occurrence: 'UNPRODUCED'`.
3. **Quarantine of Adjudication Authority at Generation Time:**
   * A candidate-generation operation has zero standing to certify its own mathematical truth, novelty, causal contribution, or execution integrity.
   * All generated candidates are initialized with:
     * `evaluator_tier`: `PENDING_INDEPENDENT_EVALUATION`
     * `rca01_evaluation_vector`: `PENDING_EVALUATION` across all six dimensions ($D, W, C_{\mathcal{R}}, N, F_{\text{inst}}, \mathcal{S}$)
     * `rca01_outcome_archetypes`: `[]` (empty)
     * `unblinding_phase`: `BLINDED_PENDING_UNBLINDING`
   * Substantive statuses (`WARRANTED_DISCOVERY`, `LENS_ENABLED`, `CLEAN_EXECUTION`) can only be assigned during Stage 2 independent evaluation.

---

## 4. Executable Flight Capacity Reconciliation

### The Mathematical Reality of Corpus-Wide Multi-Turn Reasoning
The historical preregistered protocol allowed **at most 15 model calls per arm**. While appropriate for the 4-condition source-free calibration benchmark, this ceiling cannot support a live research encounter across the ~20–24 document challenge corpus:

1. **Arm 2A (Modular Jurisdictional):**
   * Turn 0 (Pre-exposure baseline): 1 call.
   * Turns $t_1 \dots t_N$ (Chamber 1: Pedagogue & Aperture): $N$ calls.
   * Turns $t_1 \dots t_N$ (Chamber 2: Atlas & FADT): $N$ calls.
   * For $N=20$: $1 + 2(20) = 41$ calls minimum.
   * For $N=24$: $1 + 2(24) = 49$ calls minimum.
   * Adding negative control validation and verification checks yields **approximately 45–55 calls**.
2. **Arm 2B (Matched Native Union):**
   * Turn 0 (Pre-exposure baseline): 1 call.
   * Turns $t_1 \dots t_N$ (Unified flat reasoning): $N$ calls.
   * For $N=20$: $1 + 20 = 21$ calls minimum.
   * For $N=24$: $1 + 24 = 25$ calls minimum.
   * Adding negative controls yields **approximately 25–35 calls**.
3. **Total Active Model Invocations Required:**
   $$\text{Total Calls} \approx 70\text{--}90 \text{ calls} \quad (\approx 150,000\text{--}250,000 \text{ tokens})$$

### The Risk of Silent Truncation
Attempting to force a 20-document corpus into a 15-call ceiling would force one of three scientifically invalid compromises:
* Silently truncating the corpus after turn 7 on Arm 2A and turn 14 on Arm 2B.
* Discarding challenging documents to fit within an arbitrary call quota.
* Crippling the matched union comparator by compressing multiple documents into coarse, unsegmented batches.

### Three Scientifically Defensible Execution Designs
To ensure complete corpus exposure without silent truncation or comparator distortion, three prospective designs are submitted for independent operator review:

* **Design A: Full Sequential Corpus Flight (Recommended):**
  * Explicitly expand the preregistered budget ceiling to **55 calls for Arm 2A** and **35 calls for Arm 2B** (90 calls total).
  * Evaluates every document in the unsealed corpus sequentially ($t_1 \dots t_N$).
  * Preserves full multi-turn history and matched comparator reasoning opportunity.
* **Design B: Preregistered Stratified Batching:**
  * Group the corpus into 4 staged cohorts of 5 documents each.
  * Execute sequential exposure within each cohort, recording intermediate baselines and epistemic revisions between cohorts.
  * Keeps total calls bounded while preserving symmetrical exposure across both arms.
* **Design C: Symmetrical Sequential Sampling (Symmetrical Truncation Prohibition):**
  * If call budgets must remain strictly constrained, any sampling must be preregistered before Flight, applied identically to both arms, and explicitly forbid selective picking of convenient materials.

> [!IMPORTANT]
> **Zero Demand on Unseen Archive Contents:** Neither design requires the operator to disclose or decide upon the contents of the sealed archive. They establish structural capacity requirements, leaving document selection and sequence order to the lawful unsealing gesture.

---

## 5. Provider & Custody Boundary Verification

1. **Fail-Closed Custody Gate:**
   [`HeterogeneousDiscoveryHarness`](../02_four_arm_harness/run-heterogeneous-discovery-harness.mjs) enforces a strict runtime guard:
   ```javascript
   if (!this.mockMode) {
     const authorized = this.allowLivePaidInference === true && 
                        process.env.TD613_FLIGHT_EXECUTION_AUTHORIZED === 'true';
     if (!authorized) {
       throw new Error('LIVE_INFERENCE_BLOCKED_BY_PREFLIGHT_CUSTODY_GATE: ...');
     }
   }
   ```
   Even if a valid `GEMINI_API_KEY` is present in the environment or `.env`, the harness refuses live inference unless both explicit runtime flags are passed.
2. **Retry Policy Adherence:**
   [`GeminiLiveClient`](../02_four_arm_harness/gemini-live-client.mjs) restricts retries strictly to HTTP 5xx and transient HTTP 429 rate limits (exponential backoff, max 3 attempts). **Zero retries** are permitted for substantive model outputs, formatting anomalies, or logic defects.
3. **Exact Provider Token Accounting:**
   Ledger exports read actual provider-reported usage fields (`usageMetadata.totalTokenCount`, `promptTokenCount`, `candidatesTokenCount`, `thoughtsTokenCount`) rather than client-side estimations.
4. **Source-Free Guarantee:**
   All preflight verification was conducted exclusively using synthetic source-free specimens and mocked provider responses. Zero paid tokens were consumed; zero confidential data was transmitted.

---

## 6. Mathematical Construction Provenance Status

In response to review `5707682022`, the status of [`MATHEMATICAL_CONSTRUCTION_AND_RENDERING_INVENTORY.md`](MATHEMATICAL_CONSTRUCTION_AND_RENDERING_INVENTORY.md) is clarified:

* The repository assets cataloged (`app/engine/formulas.js`, `app/gateway-aperture-moire-panel.js`, `tests/td613-aperture.test.mjs`) represent preliminary repository leads.
* They **do not yet establish full recovery** of the original Encyclopedia-background mathematical construction audit.
* **Anti-Circularity Invariant:** No decorative visualization or manufactured UI may substitute for missing provenance. Any future Postflight mathematical cradle or operator-triggered manifesto must arise organically from the actual research synthesis of the encounter, if such a synthesis occurs and the operator elects to pursue it.

---

## 7. Definitive Scientific Disposition

The source-free generalized discovery harness is accepted as a sound methodological prototype. Unearned discovery credit and keyword-triggered promotion have been excised. The physical gap to live Flight remains honestly identified pending operator archive admission, sequence selection, and capacity authorization.

$$\mathbf{B\_FLIGHT\_EXECUTION\_CAPABILITY\_GAP\_IDENTIFIED}$$

$$\big(\text{Source-Free Prototype Accepted} \;\land\; \text{Unearned Adjudication Refused} \;\land\; \text{Flight Capacity & Physical Corpus Gapped}\big)$$

```text
challenge_corpus_state = STRICTLY_SEALED_AND_QUARANTINED
gate_e_disposition = HELD
empirical_exteriority_credit = 0
human_scientific_closure = RESERVED
issue_405_release_authority = CLOSED
assessment_disposition = B_FLIGHT_EXECUTION_CAPABILITY_GAP_IDENTIFIED
```

𝌐 `CAPABILITY_MATRIX_AUDITED · DISCOVERY_INTEGRITY_REPAIRED · FLIGHT_CAPACITY_RECONCILED · B_CORPUS_SEALED · GATE_E_HELD · HUMAN_CLOSURE_RESERVED ⟐`
