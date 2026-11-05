# 𝌋 TD613 · ARCHITECTURE-ORDER RESEARCH ASSAY

**Commission:** EXPERIMENT A RE-DO — SIGNALRUPTURE FIRST: THE RECIPROCAL RESEARCH EXPEDITION  
**Authorization reference:** `SAC[X6ZNK5NO51]`  
**Principal:** Tawanna C. Miller  
**Operator:** `tauric.diana.613`  
**Heritage:** Tauric Diana — Crimean heritage custodianship  
**Covenant:** Khona‌lit-po — preserve interior U+200C  
**Executing environment:** Antigravity Main Agent · Gemini 3.8 Flash High · Node.js v26.7.0  
**Repository:** `tauric-diana-613/TD613-TCP`  
**Worktree:** `C:\td613-worktrees\src-first-reciprocal-expedition`  
**Branch:** `research/src-reciprocal-expedition-20261105`  
**HEAD:** `3bad9aade0d90e6786ea7df11cae962ec3bc4726`  
**Runner:** `packages/src_reciprocal_expedition/order_assay/run-order-assay.mjs`  
**Receipt:** `packages/src_reciprocal_expedition/order_assay/architecture-order-assay-receipt.json`  
**Status:** DETERMINISTIC ORDER-SENSITIVITY WITNESSED · NON-COMMUTATIVE RESEARCH REACHABILITY  

---

## I. The Research Question & Mathematical Formulation

The central question formulated by Emergence HQ:

> **Does the order of Atelier and Encyclopedia operations change the set of relationships and research questions that become reachable from the same authenticated evidence?**

We define two explicit composition pipelines over identical admitted evidence $D$:

1. **$H_{A \circ N}(D) = A(N(D))$ (Encyclopedia-First, then Atelier):**
   - Evidence $D$ is first ingested into the Encyclopedia $N$: byte normalization, span slicing, chunk indexing, duplicate body identification, and endpoint admission validation.
   - Atelier operations $A$ (projective routing, tomography, context roles) are invoked on $N$'s structured, admitted state.
   - Grounded entity retrieval over chunk indexes operates concurrently with lexical cue census.
2. **$H_{N \circ A}(D) = N(A(D))$ (Atelier-First, then Encyclopedia):**
   - Atelier operations $A$ run directly across raw textual sources, discovering lexical cues (`Explore X.`) against unindexed text and open external catalogs.
   - Candidate links are generated without prior structural admission checks.
   - The Encyclopedia $N$ then attempts to admit and register $A$'s candidate links, evaluating endpoint validity and duplicate constraints at the ingestion boundary.

The symmetric difference between the reachable relation sets is defined as:

\[
\Delta(H_{A \circ N}, H_{N \circ A}) = \left(R(H_{A \circ N}) \setminus R(H_{N \circ A})\right) \cup \left(R(H_{N \circ A}) \setminus R(H_{A \circ N})\right)
\]

---

## II. Controls & Experimental Dataset

The assay operated on an authenticated 5-document synthetic evidence dataset $D$, plus an unadmitted external catalog record (`doc:delta_external`):

- **Control 1: Transport-Only Control ($T(D)$):** Verifies byte integrity through SHA-256 hashing without semantic or structural mutation.
- **Control 2: Atelier-Only Baseline ($A(D)$):** Direct execution of projective routing across raw text; yielded 5 cues and 4 candidate links (including 1 unadmitted external link).
- **Control 3: Encyclopedia-Only Baseline ($N(D)$):** Direct admission and chunk indexing; admitted 5 sources and yielded 5 grounded keyword matches across chunk spans.
- **Withdrawal Control:** Context withdrawal of bridge document `doc:beta` evaluated across both pipelines.

---

## III. Observed Execution Results

The executed assay produced machine receipt `architecture-order-assay-receipt.json`:

```json
{
  "sequences": {
    "H_AoN": {
      "order": "A o N (Encyclopedia first, then Atelier)",
      "cues_detected": 5,
      "candidate_links": 3,
      "grounded_span_relations": 1,
      "total_reachable_edges": [
        "doc:alpha -> doc:beta [EXACT_OR_TITLE_SUBSTRING]",
        "doc:beta -> doc:gamma [EXACT_OR_TITLE_SUBSTRING]",
        "doc:beta_mirror_duplicate -> doc:gamma [EXACT_OR_TITLE_SUBSTRING]",
        "doc:alpha -> doc:epsilon_span_witness [GROUNDED_SPAN_CO_OCCURRENCE]"
      ]
    },
    "H_NoA": {
      "order": "N o A (Atelier first, then Encyclopedia)",
      "raw_cues_detected": 5,
      "raw_candidate_links": 4,
      "admitted_links": 3,
      "rejected_links": 1,
      "rejected_reasons": [
        {
          "to": "doc:delta_external",
          "code": "UNSUPPORTED_GRAPH_LINK"
        }
      ],
      "total_reachable_edges": [
        "doc:alpha -> doc:beta [EXACT_OR_TITLE_SUBSTRING]",
        "doc:beta -> doc:gamma [EXACT_OR_TITLE_SUBSTRING]",
        "doc:beta_mirror_duplicate -> doc:gamma [EXACT_OR_TITLE_SUBSTRING]"
      ]
    }
  },
  "symmetric_difference": {
    "in_AoN_not_NoA": [
      "doc:alpha -> doc:epsilon_span_witness [GROUNDED_SPAN_CO_OCCURRENCE]"
    ],
    "in_NoA_not_AoN": [],
    "cardinality": 1
  }
}
```

### Measured Reachability & Non-Commutativity

1. **Reachable Edge Sets:**
   - $|R(H_{A \circ N})| = 4$
   - $|R(H_{N \circ A})| = 3$
2. **Symmetric Difference $|\Delta| = 1$:**
   - The relation `doc:alpha -> doc:epsilon_span_witness [GROUNDED_SPAN_CO_OCCURRENCE]` is present in $H_{A \circ N}$ but completely absent in $H_{N \circ A}$.
   - **Why?** `doc:epsilon_span_witness` contains no explicit `Explore X.` prompt. Under Atelier-first ($H_{N \circ A}$), the projective grammar operates purely on lexical imperative cues, making un-cued co-occurring text completely invisible. Under Encyclopedia-first ($H_{A \circ N}$), $N$ first indexes all text spans at byte precision; grounded entity search identifies the co-occurrence, making it reachable as a validated scientific relation.
3. **Boundary Refusal vs Upfront Filtering:**
   - In $H_{N \circ A}$, Atelier proposed a link to `doc:delta_external` (prompted by `Explore Delta Unadmitted External Specimen.`). When $N$ ran downstream, $N$ rejected this link with `UNSUPPORTED_GRAPH_LINK` because `doc:delta_external` was not admitted.
   - In $H_{A \circ N}$, Atelier was scoped to admitted records in $N$, preventing the generation of ungrounded external relations from the start.
4. **Context Withdrawal Sensitivity:**
   - When bridge document `doc:beta` was withdrawn:
     - $H_{A \circ N}$ cleanly prevented the link upfront (0 candidate links generated).
     - $H_{N \circ A}$ generated 2 dangling candidate links during Atelier phase, which $N$ subsequently rejected at the registration boundary.

---

## IV. Epistemic Assessment & Claim Boundary

\[
\text{Order Sensitivity in Implemented Architecture} \neq \text{Autonomous Model Discovery}
\]

1. **What is Proven:**
   - The two operations are mathematically and computationally **non-commutative**:
     \[
     A \circ N \neq N \circ A
     \]
   - Representation order alters which relationships are reachable from the exact same raw evidence.
   - Encyclopedia-first grounding enables discovery of latent, un-cued structural relationships through span indexing.
   - Atelier-first harvesting requires robust downstream admission gating to prevent ungrounded graph contamination.
2. **What is Held:**
   - This observed difference is a deterministic software and architectural property.
   - It does **not** constitute proof of unauthenticated model emergence or AI-generated scientific novelty.
   - All claims of emergent reasoning remain strictly **HELD**.

---

## V. Falsifiable Next-Step Research Hypothesis

**Hypothesis H-ORD-01:**  
*For any corpus containing $k$ documentary witnesses where key evidence entities co-occur without author-provided projective directives (`Explore X.`), $H_{A \circ N}$ will achieve strictly higher relational recall than $H_{N \circ A}$ ($Recall(H_{A \circ N}) > Recall(H_{N \circ A})$) while maintaining zero dangling graph edges ($DanglingEdges = 0$).*

Falsifier: Any controlled corpus where $H_{N \circ A}$ matches or exceeds the relational recall of $H_{A \circ N}$ without generating ungrounded or dangling graph links.

Chamber 4 is complete and verified.

𝄐 Tauric Diana · Khona‌lit-po · Sealed with ⟐SAC[X6ZNK5NO51]
