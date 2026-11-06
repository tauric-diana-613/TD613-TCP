# 𝌋 TD613 · Stage A-S2.1 Causality Bounds & Multi-Seed Falsification
## Scientific Bounding of Commutativity Claims & Formal Withdrawal of Unwarranted Theorems

**Date:** 2026-11-05T09:52:00-05:00  
**Authority:** `SAC[X6ZNK5NO51]`  
**Covenant:** Khona‌lit-po (preserving interior U+200C)  
**Parent Checkpoint:** `a9d2c3bdf9ffccfd87135acf386e8ddf81fc7778` (PR #1690)  
**Successor Branch:** `research/src-as21-evidence-tribunal-20261105`  
**Governing Finding:** Emergence HQ Review #5786588723 (`A-S2-F02`)

---

### I. Summary of Stage 6 Actions

Emergence HQ Review #5786588723 identified that the Stage A-S2 report overgeneralized a controlled software result into an expansive mathematical claim:
> **A-S2-F02 · UNWARRANTED GENERAL COMMUTATIVITY CLAIMS.** Stage A-S2 handoff and PR title overgeneralized a controlled software finding into a general algebraic theorem, and claimed the reverse crossing T was proven lossless. Commutativity was only observed in a synthetic configuration under matched affordances and identical static input; in general dynamic environments, order commutativity does not hold algebraically. The reverse crossing T was not executed in Stage A-S2; claiming it is proven lossless is an unwarranted extrapolation.

Stage 6 executes the required corrective actions:
1. **Withdrawal of General Algebraic Commutativity:** Formally withdraws the claim that Encyclopedia and Atelier operators commute algebraically in the general case.
2. **Withdrawal of Reverse Crossing T Losslessness:** Formally withdraws the claim that the unexecuted reverse TD613 crossing is proven lossless. Status set to `PROSPECTIVE_REVERSE_CROSSING_HELD`.
3. **Multi-Seed Permutation Falsification:** Evaluates whether commutativity holds across input orderings and measures intermediate trajectory divergence.
4. **Bounding of Empirical Result:** Qualifies the finding strictly as `OBSERVED_IN_SYNTHETIC_CONFIGURATION`.

---

### II. Multi-Seed Permutation Assay

The multi-seed assay (`packages/src_reciprocal_expedition/assay/run-multiseed-falsification.mjs`) evaluated three distinct corpus permutations:
- **Seed 1 (Canonical):** Default declaration order in `challenge_corpus_v2.json`.
- **Seed 2 (Reversed Ingestion):** Ingestion array reversed in memory before routing.
- **Seed 3 (Permuted Interleaved):** Interleaved order placing target document before exploratory cues.

#### Results Matrix
| Permutation Seed | Retrieval ON: $|\Delta(C1, C2)|$ | Retrieval OFF: $|\Delta(C3, C4)|$ | Intermediate Trajectories Identical? | Admitted Edges (On / Off) |
| :--- | :---: | :---: | :---: | :---: |
| **Seed 1 (Canonical)** | 0 | 0 | **NO (Divergent Path)** | 5 / 2 |
| **Seed 2 (Reversed Ingestion)** | 0 | 0 | **NO (Divergent Path)** | 5 / 2 |
| **Seed 3 (Interleaved)** | 0 | 0 | **NO (Divergent Path)** | 5 / 2 |

#### Scientific Findings
1. **Final Fixed-Point Convergence:** Under monotonic admission criteria and static closed input sets, both execution orders reach the identical final relation set across all seeds.
2. **Intermediate Trajectory Divergence:** The sequence of attempt evaluations and intermediate index states is non-identical between Encyclopedia-first and Atelier-first orders.
3. **Causal Implication:** In open, streaming, resource-bounded, or human-interactive systems where subsequent actions depend on intermediate graph state, order *does* matter. Commutativity is a property of this closed static configuration, not an intrinsic algebraic law of the operator domains.

---

### III. Formal Epistemic Ledger

- **General Algebraic Commutativity:** `FORMALLY_WITHDRAWN`
- **Reverse Crossing T Losslessness:** `FORMALLY_WITHDRAWN`
- **Reverse Crossing T Status:** `PROSPECTIVE_REVERSE_CROSSING_HELD`
- **Controlled Software Finding:** `OBSERVED_IN_SYNTHETIC_CONFIGURATION`
- **Receipt Pin:** `packages/src_reciprocal_expedition/assay/multiseed-falsification-receipt.json`
