# 𝌋 TD613 · Stage 4 Controlled Mechanism Assay
## Falsification of Architecture-Order Causality: The Retrieval-Affordance Explanation

**Date:** 2026-11-05T09:15:00-05:00  
**Authority:** `SAC[X6ZNK5NO51]`  
**Covenant:** Khona‌lit-po (preserving interior U+200C)  
**Parent Checkpoint:** `ce9b6c6e053505e8f005e27ad2af4631ce2ed140` (PR #1689)  
**Successor Branch:** `research/src-order-mechanism-falsification-20261105`  
**Execution Worktree:** `C:\td613-worktrees\src-first-reciprocal-expedition`  
**Challenge Corpus:** `packages/src_reciprocal_expedition/assay/challenge_corpus.json`  
**Expected Manifest:** `packages/src_reciprocal_expedition/assay/expected_manifest.json`  
**Assay Runner:** `packages/src_reciprocal_expedition/assay/run-mechanism-assay.mjs`  
**Machine Receipt:** `packages/src_reciprocal_expedition/assay/mechanism-assay-receipt.json`

---

### I. The Research Question & Mathematical Formulation

**Research Question:**
> *Does execution order itself alter warranted research reachability after retrieval affordances, input domains, candidate-generation procedures and admission criteria are controlled?*

#### 1. Mathematical Operators & Types
Let $\mathcal{D}$ be the documentary corpus and $\mathcal{S}$ the research system state:
$$\mathcal{S} = (\mathcal{A}_{\text{sources}}, \mathcal{C}_{\text{captures}}, \mathcal{K}_{\text{chunks}}, \mathcal{R}_{\text{relations}}, \mathcal{B}_{\text{attempt\_log}})$$

- **Encyclopedia Ingestion Operator ($\mathcal{O}_{\text{Enc}}$):**
  $$\mathcal{O}_{\text{Enc}}: (\mathcal{S}, \mathcal{D}) \to \mathcal{S}'$$
  Admits source bodies, verifies non-duplication, enforces strict UTF-8 byte chunking along code point boundaries, and generates indexed chunk spans $\mathcal{K}$. Information-preserving (cryptographic raw byte SHA-256 and normalized body SHA-256 preserved).

- **Atelier Projective Routing Operator ($\mathcal{O}_{\text{Atelier}}$):**
  $$\mathcal{O}_{\text{Atelier}}: (\mathcal{S}, \mathcal{D}, \text{Catalog}, \alpha) \to \mathcal{S}''$$
  Harvests lexical cues (`Explore X.`), searches candidate destinations in the external catalog, validates chronological non-retroactivity ($t_{\text{target}} > t_{\text{source}}$), and (if affordance $\alpha = \text{ENABLED}$) queries the grounded span index for co-occurring entities.

- **Common Observation Projection ($\Pi$):**
  $$\Pi(\mathcal{S}) = (\mathcal{R}_{\text{admitted}}, \mathcal{B}_{\text{rejected}}, \mathcal{M}_{\text{metrics}})$$
  Projects any research state into typed sets of admitted relations, rejected attempt logs, and reproducible precision/recall metrics.

---

### II. 2×2 Experimental Design & Methodological Controls

| Condition | Execution Order | Retrieval Affordance ($\alpha$) | Corpus $\mathcal{D}$ | Catalog | Admission Rules |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **C1** | Encyclopedia $\to$ Atelier | **ENABLED** | Identical 14 docs | Identical 14 entries | Identical v2 rules |
| **C2** | Atelier $\to$ Encyclopedia | **ENABLED** | Identical 14 docs | Identical 14 entries | Identical v2 rules |
| **C3** | Encyclopedia $\to$ Atelier | **DISABLED** | Identical 14 docs | Identical 14 entries | Identical v2 rules |
| **C4** | Atelier $\to$ Encyclopedia | **DISABLED** | Identical 14 docs | Identical 14 entries | Identical v2 rules |

**Crucial Control (Remediating Review Finding F01):**
In the exposed diagnostic run (PR #1689), H_AoN executed an index span search for `doc:epsilon_span_witness` while H_NoA was never wired to do so, and external catalogs were supplied asymmetrically. In this 2x2 design, both C1 and C2 have the **identical opportunity** to exercise grounded span retrieval once the documents are ingested.

---

### III. Empirical Falsification Results

Executing `run-mechanism-assay.mjs` against the 14-document synthetic challenge corpus yielded:

#### 1. Order-Effect Tests (Holding Retrieval Affordance Constant)
- **With Retrieval ENABLED:**
  $$\mathcal{R}_{\text{C1}} = \mathcal{R}_{\text{C2}} \implies |\Delta(C1, C2)| = 0$$
  - In C1 but not C2: $\emptyset$
  - In C2 but not C1: $\emptyset$
- **With Retrieval DISABLED:**
  $$\mathcal{R}_{\text{C3}} = \mathcal{R}_{\text{C4}} \implies |\Delta(C3, C4)| = 0$$
  - In C3 but not C4: $\emptyset$
  - In C4 but not C3: $\emptyset$

#### 2. Affordance-Effect Tests (Holding Execution Order Constant)
- **Under Encyclopedia-First Order:**
  $$|\Delta(C1, C3)| = 2$$
  Edges added by retrieval affordance:
  - `doc:explicit_explore_1 -> doc:target_beta [GROUNDED_SPAN_CO_OCCURRENCE]`
  - `doc:grounded_cooccurrence -> doc:target_beta [GROUNDED_SPAN_CO_OCCURRENCE]`
- **Under Atelier-First Order:**
  $$|\Delta(C2, C4)| = 2$$
  Edges added by retrieval affordance:
  - `doc:explicit_explore_1 -> doc:target_beta [GROUNDED_SPAN_CO_OCCURRENCE]`
  - `doc:grounded_cooccurrence -> doc:target_beta [GROUNDED_SPAN_CO_OCCURRENCE]`

---

### IV. Scientific Conclusion & Mechanism Resolution

1. **Falsification of Order Causality:** The causal claim that execution order itself alters graph reachability is **DECISIVELY FALSIFIED**. When retrieval affordances, candidate generation, and admission criteria are matched, the operations commute under the common observation projection $\Pi$:
   $$\Pi(\mathcal{O}_{\text{Atelier}} \circ \mathcal{O}_{\text{Enc}}(\mathcal{S})) = \Pi(\mathcal{O}_{\text{Enc}} \circ \mathcal{O}_{\text{Atelier}}(\mathcal{S}))$$
2. **Identification of True Mechanism:** The previously observed 4-versus-3 relational divergence in PR #1689 was an **artifact of pipeline asymmetry**: the H_AoN sequence executed grounded span search which H_NoA did not execute. The difference is attributable **100% to retrieval affordance access**, not to order of operation.
3. **Withdrawal Stability:** In all four cells, context withdrawal of `doc:target_beta` resulted in clean, instantaneous drop of all dependent edges (dropped edge count: 2 or 3 depending on affordance), with zero orphaned dangling edges and full retention of the withdrawal event in the attempt log.

**Exit Condition Satisfied:** Four-cell evidence decisively identifies that reachability divergence was caused by retrieval affordance access rather than execution order.
