# A15-R0 · Atlas Weighted 2-Section / Stratified Möbius Reconstruction · Execution Burden v0.1

Parent authority: exact earned #944 / `578be6f432cffa67dbaf6da0a47cb9d36c0fb68f`.

The implementation and hostile must derive, not assume, the following surface.

## Algebraic obligations
For every receiver state with labeled blocks:

1. Treat high-support multiplicities `mu(S)` for `|S|>=3` as exact.
2. For every pair `i<j`, verify
   `w_ij = mu({i,j}) + Σ_{S⊇{i,j},|S|>=3} mu(S)`.
3. Recover
   `mu({i,j}) = w_ij - Σ_{S⊇{i,j},|S|>=3} mu(S)`
   and require nonnegative integer residuals.
4. For every vertex `i`, verify
   `c_i = mu({i}) + Σ_{S⊇{i},|S|>=2} mu(S)`.
5. Recover
   `mu({i}) = c_i - Σ_{S⊇{i},|S|>=2} mu(S)`
   and require nonnegative integer residuals.
6. Canonical reconstructed support multiset must equal the raw incidence-neighborhood multiset exactly.
7. No theorem branch may test or require pairwise linearity or global uniformity.

## Exhaustive finite stress surface
Ground size 6. Block pool all 2-,3-,4-subsets, exactly 50 blocks. Enumerate every 1–3 block family, exactly 20,875.

Required exact burden:

- `61,300` block-capacity observations;
- `60,025` pair-intersection calculations;
- `367,800` ground/block membership evaluations;
- `109,500` raw support entries;
- `53,655` positive weighted pair entries;
- total pair weight `88,200`;
- `11,405` distinct high-support entries across families;
- total high-support element multiplicity `13,800`;
- `37,500` positive residual degree-2 support entries;
- residual degree-2 multiplicity sum `46,800`;
- `8,700` residual pair entries with multiplicity greater than one.

Structural census must equal:

- nonuniform `18,375`;
- nonlinear `16,490`;
- nonlinear + nonuniform `14,820`;
- marked `11,405`;
- nonlinear + marked `11,015`.

High-support multiplicity histogram must equal:

- multiplicity 1: `9,090`;
- multiplicity 2: `2,235`;
- multiplicity 3: `80`.

## Comparative receiver obligation
Run the same decoder once with true pair weights and once with binary/unweighted overlap edges.

Required result:

- weighted: `20,875` successes / `0` failures;
- unweighted: `4,385` successes / `16,490` failures;
- exact equality of the unweighted failure set and nonlinear-family set.

This equality is an assay result only, not a universal theorem about all alternative unweighted encodings.

## Necessity controls
- capacity removal must leave singleton multiplicities underdetermined;
- high-support removal must leave pair weights unable to distinguish degree-2 overlap from higher concurrency bundling;
- isolated degree-zero ground is not recoverable from a union-grounded receiver;
- pair-weight values and support multiplicities are formal incidence counts, not physical edge weights or causal concurrency.

## Anti-overclaim
No claim of minimality of this receiver is earned here. No claim that weighted 2-section alone is complete. No claim of source provenance or physical causality. The finite assay attacks the implementation; algebraic identities carry the general theorem.

Sealed ⟐
