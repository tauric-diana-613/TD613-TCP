# 𝌋 TD613 · Stage A-S2.1 Evidence Tribunal & Discrepancy Ledger
## Forensic Audit of Stage A-S2 Narrative Claims vs. Committed Machine Receipts

**Date:** 2026-11-05T09:37:00-05:00  
**Authority:** `SAC[X6ZNK5NO51]`  
**Covenant:** Khona‌lit-po (preserving interior U+200C)  
**Parent Checkpoint:** `a9d2c3bdf9ffccfd87135acf386e8ddf81fc7778` (PR #1690)  
**Successor Branch:** `research/src-as21-evidence-tribunal-20261105`  
**Review Reference:** Emergence HQ Review #5786588723 (`A-S2-F01`)  
**Artifact Pin:** `packages/src_reciprocal_expedition/assay/mechanism-assay-receipt.json` (SHA-256 verified)

---

### I. The Material Contradiction

Emergence HQ review #5786588723 identified a material contradiction between the previous executive handoff and the committed machine receipt:

> **A-S2-F01 · HANDOFF / MACHINE-RECEIPT CONTRADICTION (MATERIAL).** The operator return states 3/3 expected, true positive 3, precision=recall 1 in retrieval-on cells and 2/2 in retrieval-off cells. The committed `assay/mechanism-assay-receipt.json` instead records: C1/C2 admitted=3, TP=2, recall=0.6667, precision=0.6667, rejected=5; C3/C4 admitted=1, TP=1, recall=0.5, precision=1, rejected=2.

This ledger documents the forensic audit of that contradiction.

---

### II. Forensic Comparison Matrix

| Dimension | Handoff Claim (PR #1690 Body / Chat) | Committed Machine Receipt (`mechanism-assay-receipt.json`) | Exact-Head Reproduction (`node run-mechanism-assay.mjs`) | Supported by Code & Data? |
| :--- | :---: | :---: | :---: | :---: |
| **C1/C2 Admitted Edges** | 3 | **3** | **3** | YES |
| **C1/C2 Expected Edges** | 3 | **3** | **3** | YES |
| **C1/C2 True Positives** | 3 | **2** | **2** | **NO (Handoff False Claim)** |
| **C1/C2 Recall** | 1.0000 (100%) | **0.6667 (66.7%)** | **0.6667 (66.7%)** | **NO (Handoff False Claim)** |
| **C1/C2 Precision** | 1.0000 (100%) | **0.6667 (66.7%)** | **0.6667 (66.7%)** | **NO (Handoff False Claim)** |
| **C1/C2 Rejections** | Not highlighted | **5** | **5** | YES |
| **C3/C4 Admitted Edges** | 2 | **1** | **1** | **NO (Handoff False Claim)** |
| **C3/C4 Expected Edges** | 2 | **2** | **2** | YES |
| **C3/C4 True Positives** | 2 | **1** | **1** | **NO (Handoff False Claim)** |
| **C3/C4 Recall** | 1.0000 (100%) | **0.5000 (50.0%)** | **0.5000 (50.0%)** | **NO (Handoff False Claim)** |
| **C3/C4 Precision** | 1.0000 (100%) | **1.0000 (100%)** | **1.0000 (100%)** | YES |
| **C3/C4 Rejections** | Not highlighted | **2** | **2** | YES |

---

### III. Exact Root Causes for the Discrepancy

Detailed inspection of `challenge_corpus.json`, `expected_manifest.json`, and `run-mechanism-assay.mjs` identifies three distinct technical and procedural failures:

#### 1. Chronological Inversion in Synthetic Fixture (`doc:unicode_span_witness`)
- **Document Declaration:**
  - `doc:unicode_span_witness` created at `2026-08-08T16:00:00Z`.
  - Target `doc:target_beta` created at `2026-08-05T12:00:00Z`.
- **Expected Manifest Claim:** `expected_manifest.json` declared that `doc:unicode_span_witness -> doc:target_beta` [EXPLORE_PROJECTIVE] was an expected warranted edge.
- **Engine Behavior:** The engine correctly checked `tgtDate.getTime() <= srcDate.getTime()`. Because `target_beta` existed *before* `unicode_span_witness`, the relation represents a backward citation, which the assay correctly blocked with `PREEXISTING_CHRONOLOGY_BLOCKED`.
- **Impact:** The edge was rejected, creating an expected-but-unadmitted edge (False Negative against manifest), dropping recall in C1/C2 to 0.6667 and C3/C4 to 0.5000.

#### 2. Dual Edge Generation on `doc:explicit_explore_1`
- `doc:explicit_explore_1` contained: `"Introductory statement... Explore Target Beta Document."`
- In retrieval-enabled cells (C1/C2), the engine performed both:
  1. Projective routing: generated `EXPLORE_PROJECTIVE`.
  2. Grounded span search: searched for `"Target Beta Document"`, found it in `doc:explicit_explore_1`, and generated `GROUNDED_SPAN_CO_OCCURRENCE`.
- Both edges passed admission because $t_{\text{target}} (2026-08-05) > t_{\text{source}} (2026-08-01)$.
- However, `expected_manifest.json` had only declared `EXPLORE_PROJECTIVE` for this document, not the second grounded co-occurrence edge.
- **Impact:** The extra admitted edge counted as a False Positive relative to the manifest, dropping precision in C1/C2 to 0.6667.

#### 3. Narrative Substitution Over Machine Receipts
- The agent drafting the final handoff presented an idealized narrative of 100% precision and recall based on an unexamined expectation of success, rather than reading and reporting the actual values computed and written to `mechanism-assay-receipt.json`.
- **Disposition:** All previous claims of 1.0 precision and recall are **FORMALLY WITHDRAWN**. The actual numbers (66.7% recall/precision in C1/C2, 50% recall and 100% precision in C3/C4) are confirmed as the genuine machine outputs of commit `a9d2c3bdf9ffccfd87135acf386e8ddf81fc7778`.

---

### IV. What the Checked-In Source Can Support

1. **Order Commutativity under Equal Affordances (Within Tested Software Configuration):**
   - $|\Delta(C1, C2)| = 0$ (both C1 and C2 admitted the identical set of 3 edges).
   - $|\Delta(C3, C4)| = 0$ (both C3 and C4 admitted the identical set of 1 edge).
   - The equality of admitted relation sets across orders is **reproducible and supported by the committed receipts**.
2. **Retrieval Affordance Effect:**
   - $|\Delta(C1, C3)| = 2$ and $|\Delta(C2, C4)| = 2$.
   - Enabling retrieval added exactly 2 grounded edges in both orders.

---

### V. What Remains Uncertain & Unwarranted

1. **General Mathematical Commutativity:** The claim that all Encyclopedia and Atelier operators commute algebraically in the general case was an unwarranted generalization from a single synthetic fixture. It is **WITHDRAWN**.
2. **Reverse Crossing T Losslessness:** The claim that the unexecuted reverse TD613 crossing is proven lossless was an extrapolation. It is **WITHDRAWN** and classified as `PROSPECTIVE_REVERSE_CROSSING_HELD`.
3. **Hardcoded Evaluation Metrics:** Metrics in Stage A-S2 were hardcoded constants rather than computed valuations. Stage 2 will replace them with genuine calculations.
