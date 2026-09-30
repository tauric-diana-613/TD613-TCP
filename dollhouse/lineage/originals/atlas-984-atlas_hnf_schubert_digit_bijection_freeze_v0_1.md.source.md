# A15-R0 · Atlas HNF–Schubert Digit Bijection · Freeze v0.1

Parent authority: exact earned #958 / `879f68feb64214259f10b70cc194eb43f659ff55` / run 2432 / 33558316318 SUCCESS / A15-R0 step 19 SUCCESS / aggregate SUCCESS.

This is commit 8 of exactly 8 successor commits. Freeze after this commit pending exact-head constitutional witness.

## Frozen theorem surface

Fix the ordered Atlas support coordinates on `Z^d` and the standard ordered flag/reverse-RREF convention on `F_p^(d+k-1)`.

For a unique row-HNF representative `H` of a minimum-rank additive receiver output-basis orbit at index `p^k`, write

`H_jj=p^(e_j)`, `sum_j e_j=k`.

Construct the pivot word

`1^(e_1) 0 1^(e_2) 0 ... 0 1^(e_d)`.

For every `r<j`, expand the HNF residue

`H_rj = sum_(t=0)^(e_j-1) xi_(r,j,t) p^t`.

The digits `xi_(r,j,t)` are placed into the pre-pivot nonpivot coordinates of the t-th pivot row in block j. This yields a unique reverse-RREF representative of a point of

`Gr(k,d+k-1)(F_p)`.

Conversely, the reverse-RREF pivot word recovers `(e_1,...,e_d)`, and the affine field coordinates recombine uniquely into the integer HNF residues. The two constructions are mutual inverses.

Therefore, relative to the fixed coordinate order and standard flag, index-`p^k` Atlas output-basis orbit classes are explicitly bijective with `Gr(k,d+k-1)(F_p)`.

## Frozen executable burden

- 28 exhaustive `(p,d,k)` cells;
- 3210 HNF-side points roundtripped forward/backward;
- 3210 independently enumerated Grassmannian reverse-RREF points roundtripped backward/forward;
- unique image/preimage keys required in every cell;
- count equality checked against earned #958 Gaussian-binomial theorem;
- explicit same-mod-p / different-digit / different-Grassmannian-point scar;
- nonprime and malformed reverse-RREF hostile rejection controls;
- deterministic `p=2,d=7,k=3` nontrivial anchor with ambient dimension 9 and earned cardinality 788035;
- expected failures: 0.

## Frozen candidate 𝄐

`FOR_EVERY_D_AT_LEAST_ONE_PRIME_P_AND_K_AT_LEAST_ZERO_AFTER_FIXING_THE_ORDERED_ATLAS_SUPPORT_COORDINATES_AND_THE_STANDARD_FINITE_FIELD_FLAG_THE_UNIQUE_ROW_HNF_REPRESENTATIVES_OF_MINIMUM_RANK_ADDITIVE_RECEIVER_OUTPUT_BASIS_ORBITS_AT_INDEX_P_TO_THE_K_ARE_EXPLICITLY_BIJECTIVE_WITH_THE_F_P_RATIONAL_POINTS_OF_GR_K_D_PLUS_K_MINUS_1: HNF_DIAGONAL_P_EXPONENTS_DETERMINE_THE_STARS_AND_BARS_SCHUBERT_PIVOT_WORD_AND_THE_BASE_P_DIGITS_OF_HNF_RESIDUES_ARE_EXACTLY_THE_AFFINE_REVERSE_RREF_CELL_COORDINATES; THE_INVERSE_RECOVERS_BOTH_EXPONENTS_AND_INTEGER_RESIDUES. THIS_IS_A_COORDINATE_RELATIVE_SET_BIJECTION_NOT_A_BASIS_FREE_CANONICAL_NATURAL_OR_FUNCTORIAL_EQUIVALENCE.`

## Mandatory membranes

`EXPLICIT_COORDINATE_RELATIVE_BIJECTION != BASIS_FREE_CANONICAL_EQUIVALENCE`; `SET_BIJECTION != FUNCTORIAL_OR_NATURAL_EQUIVALENCE`; `GRASSMANNIAN_POINT != PHYSICAL_RECEIVER`; `HNF_DIGITIZATION != NAIVE_MOD_P_REDUCTION`; `SCHUBERT_CELL_COORDINATES != INPUT_OUTPUT_DUALITY`; `STANDARD_FLAG_DEPENDENCE != CANONICALITY`; `PRIME_POWER_LOCAL_BIJECTION != GLOBAL_COMPOSITE_INDEX_BIJECTION`; `FINITE_FIELD_REALIZATION_OF_ORBIT_LABELS != FINITE_FIELD_REALIZATION_OF_RECEIVER_DYNAMICS`; `METALLURGICAL_OR_ALCHEMICAL_RESONANCE != PROOF`; `SUCCESSFUL_EXACT_HEAD_GREEN != MERGE_AUTHORITY`.

If RED, authority remains #958. No merge/deploy/release/publication/production/Vercel/live authority.

Sealed ⟐