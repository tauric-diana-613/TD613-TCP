# A15-R0 · Atlas Capacity-Vector Marked 2-Section Reconstruction · Preregistration v0.1

Parent authority: #942 / `93abc6fa561d1992c5dc0322a8016212688c98bd` / run 2423 SUCCESS / A15-R0 step 19 SUCCESS.

## Question
Is global uniformity actually necessary for marked-2-section lossless reconstruction, or is local block capacity sufficient?

## Declared theorem candidate
Let `H=(B_0,...,B_{m-1})` be a finite union-grounded linear incidence system: distinct finite blocks, every ground element lies in at least one block, and `|B_i ∩ B_j| <= 1` for `i != j`. Let `c_i=|B_i|` be the capacity attached to block vertex `i`.

The receiver is

`R_c(H) = (Gamma(H), M_{>=3}(H), c)`

where `Gamma` is the unweighted block-overlap graph and `M_{>=3}` is the complete multiset of incidence supports of ground elements lying in at least three blocks.

Candidate law: `R_c` reconstructs the exact incidence-neighborhood multiset up to ground-element relabeling.

Reconstruction:
1. each marked support recovers one degree>=3 ground element;
2. by linearity, marked supports cover pairwise graph edges without multiplicity conflict;
3. each uncovered graph edge recovers one degree-2 ground element;
4. for each block `i`, let `s_i` be the number of reconstructed shared elements incident to `i`; recover exactly `c_i-s_i` private singleton supports `{i}`.

Hence uniform `k` from #942 is only the special case `c=(k,...,k)`.

## Proof / assay separation
General authority is algebraic for arbitrary finite positive integer capacity vectors. Finite executable assay is not proof by sampling.

Declared assay universe:
- labeled ground `{0,...,6}`;
- available blocks are every subset of size 2, 3, or 4 (91 possible blocks);
- families contain 1–3 distinct blocks;
- admit iff pairwise block intersection is at most one;
- ground is the union of the selected blocks.

Frozen census target:
- ambient candidate families: 125,671;
- admitted linear families: 27,426;
- by block count: 91 / 2,275 / 25,060;
- genuinely nonuniform admitted families: 23,765;
- marked admitted families: 2,345;
- genuinely nonuniform + marked: 2,100;
- exact round trips: 27,426;
- reconstruction failures: 0.

## Capacity-label necessity control
Use the same path overlap graph `0-1-2`, no concurrency marks, and the same sorted capacity multiset `[2,3,4]`:

A: blocks `[{0,1},{0,2,3,4},{2,5,6}]`, capacity vector `[2,4,3]`.
B: blocks `[{0,1,3,4},{0,2},{2,5,6}]`, capacity vector `[4,2,3]`.

The unmarked overlap graph and sorted capacity inventory coincide, but the exact incidence-neighborhood multisets differ. No path-graph automorphism sends the attached capacity vector of A to B. Thus a mere size multiset is insufficient; block-attached local capacities are the declared receiver data.

## Mandatory membranes
- `CAPACITY_VECTOR_RECONSTRUCTION != UNIVERSAL_HYPERGRAPH_RECONSTRUCTION`
- `LOCAL_BLOCK_CAPACITY != PHYSICAL_CAPACITY`
- `LOSSLESS_INCIDENCE_RECONSTRUCTION != HISTORICAL_SOURCE_IDENTITY`
- `FINITE_NONUNIFORM_ASSAY != PROOF_BY_SAMPLING`
- `SORTED_CAPACITY_MULTISET_INSUFFICIENT != CAPACITY_VECTOR_UNIVERSALLY_MINIMAL`
- `LINEAR_INCIDENCE != PHYSICAL_LINEARITY`
- `CONCURRENCY_MARK != CAUSAL_CONCURRENCY`
- `ATLAS_REGISTRATION != LIVE_RUNTIME_STATE`
- `A15_R0_RESEARCH_EXTENSION != PROTO_LOOM_OR_A16_PROMOTION`
- `SUCCESSFUL_EXACT_HEAD_GREEN != MERGE_AUTHORITY`

No merge/deploy/release/publication/production/Vercel/live Ash-Loom/Proto-Loom/A16 authority.

Sealed ⟐