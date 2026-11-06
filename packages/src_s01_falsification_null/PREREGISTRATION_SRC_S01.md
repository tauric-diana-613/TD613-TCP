# 𝌋 TD613 · SRC S-01 Independent Falsification Preregistration

**Principal / Human Closure:** Tawanna C. Miller · `tauric.diana.613`  
**Covenant:** Khona‌lit-po (literal `U+200C` interior zero-width non-joiner retained)  
**Authority Reference:** `SAC[X6ZNK5NO51]`  
**Repository:** `tauric-diana-613/TD613-TCP`  
**Commission Phase:** SRC S-01 Preregistration & Finite Test Protocol  

---

### 1. Preregistered Hypotheses

1. **Primary Null Hypothesis ($H_0$):**
   Under identical admissible evidence, compute budgets, iteration ceilings, and retrieval affordances, the reciprocal SRC–Encyclopedia system ($S_3$) does not produce any statistically significant excess of warranted scientific information beyond a competent union of its constituent methods ($S_2$):
   $$H_0: \Delta = \text{Score}(S_3) - \text{Score}(S_2) \le 0$$

2. **Alternative Hypothesis ($H_1$):**
   Reciprocal interaction between the SRC Atelier and Encyclopedia receiver generates unique warranted scientific information ($\Delta > 0$) that cannot be produced by the competent union operating under the same budgets.

3. **Trajectory Discrepancy Hypothesis ($H_{\text{trajectory}}$):**
   Even under conditions where terminal graph outputs are identical ($\Pi^*(S_3) = \Pi^*(S_2)$), the intermediate research trajectories, logged attempt histories, and transition sequences differ materially between reciprocal feedback and union execution:
   $$\text{TrajectoryDistance}(S_3, S_2) > 0 \quad \text{while} \quad |\Pi^*(S_3) \triangle \Pi^*(S_2)| = 0$$

---

### 2. The 10 Preregistered Measurement Dimensions

| Dim ID | Dimension Name | Evaluation Criterion / Ground-Truth Metric | Required Fail-Closed Behavior |
|:---:|---|---|---|
| **D1** | **Native-Method Fidelity** | Strict byte-for-byte and semantic parity against pinned Python `projective.py`, `phase2.py`, and `query.py`. | Mismatches fail unless documented as verified lexical discrepancies. |
| **D2** | **Projective Routing & Cues** | Exact extraction of field markers and `Explore X.` cues; temporal classification into `LATER` vs `PREEXISTING`. | Refuses semantic or causal promotion from lexical links. |
| **D3** | **Temporal Non-Retroactivity** | Forward routing requires $t_{\text{target}} > t_{\text{source}}$; retrospective bibliographic citation permits $t_{\text{target}} \le t_{\text{source}}$. | Rejects retroactive causal claims with `RETROACTIVE_CITATION_DENIED`. |
| **D4** | **Rejected Attempts & Missing Hops** | Every unsuccessful exploration attempt is permanently preserved in the Shadow Graph; unobserved hops emit `NO_DOWNSTREAM_WITNESSED_RELATION`. | Rejects phantom edge hallucination or silent omission. |
| **D5** | **Source & Lineage Provenance** | Every asserted relation retains provenance to exact authenticated source-root SHA-256 and acquisition ID. | Rejects untracked or synthetic source injections. |
| **D6** | **Tomography & Score Refusal** | Evaluates representation lift (NARROWED, EXPANDED, PRESERVED) across separate dimensions; composite scalar scoring refused. | Fails closed if `composite_score !== null`. |
| **D7** | **Contextual Roles** | Entity roles are scoped strictly to compiler passes; intrinsic entity typing is prohibited. | Fails if role is asserted as intrinsic to source object. |
| **D8** | **Withdrawal & Custody Integrity** | Withdrawing a source root cascades dynamically to all derived claims; tombstones chained with cryptographic SHA-256 hashes. | Rejects reuse of tombstoned IDs (`ROOT_ID_PERMANENTLY_WITHDRAWN`). |
| **D9** | **Terminal Equality vs Trajectory** | Audits terminal relation set $\Pi^*$ alongside transition event count and rejected attempt logs. | Logs both terminal $\Delta$ and trajectory distance as distinct outputs. |
| **D10** | **Warranted Scientific Information** | Measures net warranted information gained, lost, or uniquely recovered under reciprocal feedback. | Distinguishes integration cost from emergent operations. |

---

### 3. Finite Adversarial Test Suite Design

The candidate developmental suite implements 16 deterministic adversarial challenges:

1. **CH-01 (D1):** Pinned field-marker census across multi-paragraph documents.
2. **CH-02 (D1):** Trailing-numeral explore cue handling (verifying documented discrepancy).
3. **CH-03 (D2):** Exact lexical cue matching with temporal order classification.
4. **CH-04 (D3):** Forward exploration attempted against earlier document (proper rejection).
5. **CH-05 (D3):** Historical retrospective citation permitted to earlier document (proper acceptance).
6. **CH-06 (D4):** Shadow Graph retention of rejected attempt with detailed denial receipt.
7. **CH-07 (D4):** Trace query emitting explicit `NO_DOWNSTREAM_WITNESSED_RELATION` on missing hop.
8. **CH-08 (D5):** Multi-hop provenance tracking from terminal relation back to authenticated root bytes.
9. **CH-09 (D6):** Tomographic scope narrowing with mandatory composite score refusal (`composite_score: null`).
10. **CH-10 (D7):** Multi-compiler pass assigning distinct contextual roles to a single entity without intrinsic collision.
11. **CH-11 (D8):** Source root withdrawal cascading dynamically across derived relations.
12. **CH-12 (D8):** Attempted re-admission of withdrawn root ID failing closed (`ROOT_ID_PERMANENTLY_WITHDRAWN`).
13. **CH-13 (D8):** Tamper-evident hash-chained withdrawal ledger integrity verification (`verifyWithdrawalLedgerIntegrity`).
14. **CH-14 (D9):** Two-phase delayed target admission (edge placed in `PENDING_READJUDICATION` then admitted upon late arrival).
15. **CH-15 (D9):** Stationary vs streaming trajectory contrast (terminal equality with divergent attempt counts).
16. **CH-16 (D10):** Finite iteration bound enforcement (fail-closed on non-convergence depth exhaustion).

---

### 4. Statistical Decision Rules and Limits

1. **Paired Comparison:**
   Evaluations are scored pairwise on identical challenges between $S_3$ (Reciprocal) and $S_2$ (Competent Union).
2. **Discordance Matrix & McNemar Test:**
   $$\begin{pmatrix} n_{11} & n_{10} \\ n_{01} & n_{00} \end{pmatrix} = \begin{pmatrix} 16 & 0 \\ 0 & 0 \end{pmatrix}$$
   Exact two-sided McNemar $p$-value: $p = 1.0000$ ($n_d = n_{10} + n_{01} = 0$).
3. **Dynamic Terminal Graph Extraction:**
   $\Delta_{\text{terminal}} = |\text{Nodes}(S_3) \triangle \text{Nodes}(S_2)| + |\text{Edges}(S_3) \triangle \text{Edges}(S_2)| + |\text{Roots}(S_3) \triangle \text{Roots}(S_2)| + |\text{Rejections}(S_3) \triangle \text{Rejections}(S_2)| = 0$.
4. **Formal Epistemological Disposition:**
   - Formal classification: `DEVELOPMENT_SUITE_BOOLEAN_PARITY_OBSERVED_WITH_LIMITATIONS`
   - Scientific surplus: `SCIENTIFIC_SURPLUS_UNDETERMINED`
   - Zero discordances on a finite development suite ($n_d = 0$) and zero terminal graph deltas ($\Delta_{\text{terminal}} = 0$) demonstrate that the apparent 6-challenge advantage of reciprocal/manifest systems over naive baselines is attributable to standard graph algorithms in the comparator. It does **not** constitute mathematical proof of universal equivalence under all unconstrained inputs.

---

### 5. Stopping Criterion

The candidate author executes the visible development pilot, repairs any discovered software defects, freezes the candidate HEAD, and **halts prior to executing concealed independent evaluation**. Independent evaluation belongs exclusively to an un-entangled external reviewer.

𝄐 Khona‌lit-po · Sealed ⟐ SAC[X6ZNK5NO51]
