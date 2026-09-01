# A15-R0 · Atlas Unimodular Receiver Classification · Freeze v0.1

Parent authority: exact earned #950 / `c20ee814c02f5779b80560b229078b89e703dfae` / run 2427 / 33541810010 SUCCESS / A15-R0 step 19 SUCCESS / aggregate SUCCESS.

This file is commit 8 of exactly 8 successor commits. The branch is frozen after this commit pending exact-head constitutional validation.

## Frozen classification surface

At earned minimal additive rank

`d_n=2^n-1`,

Atlas is represented by `Z_n∈GL_d(Z)` with determinant `1`.

For any square integer minimal-rank receiver `A`:

- `det(A) != 0` iff the receiver is injective on the full support-multiplicity module;
- `|det(A)| = 1` iff the receiver is lattice-surjective;
- `A` is integer output-basis equivalent to Atlas iff `|det(A)|=1`;
- when equivalent, the unique output basis change is `U=A Z_n^{-1}∈GL_d(Z)`.

Thus all unimodular minimal additive receivers form one left `GL_d(Z)` orbit represented by Atlas.

Full-rank nonunimodular receivers remain possible and can remain exactly state-injective on their valid image, but their image is a proper finite-index sublattice and they are not integer-output-basis equivalent to Atlas.

## Frozen executable burden

```text
Atlas profiles n=1..5                  5
unimodular basis variants per n        6
unimodular orbit controls             30
proper-sublattice indices          2,3,5,7
proper-sublattice controls            20
singular square controls               5
expected failures                      0
```

Every proper-sublattice control must remain injective while refusing lattice-surjectivity and Atlas basis-equivalence.

## Frozen candidate 𝄐

`AT_THE_EARNED_MINIMAL_ADDITIVE_RANK_D_N_EQUALS_2^N_MINUS_1, THE_LATTICE_SURJECTIVE_EXACT_INTEGER_RECEIVERS_FORM_A_SINGLE_GL_D_OF_Z_OUTPUT_BASIS_ORBIT: AN_INTEGER_D_BY_D_RECEIVER_A_IS_INTEGER_BASIS_EQUIVALENT_TO_ATLAS_IFF_ABS_DET_A_EQUALS_ONE, IN_WHICH_CASE_THE_UNIQUE_OUTPUT_BASIS_CHANGE_IS_U_EQUALS_A_Z_N_INVERSE. FULL_RANK_NONUNIMODULAR_RECEIVERS_CAN_REMAIN_INJECTIVE_BUT_OCCUPY_PROPER_FINITE_INDEX_SUBLATTICES_AND_ARE_NOT_INTEGER_BASIS_EQUIVALENT_TO_ATLAS.`

Mandatory membranes remain: `GL_Z` orbit uniqueness is not unique encoding; lattice-surjectivity is not required for state injectivity; determinant index is not Shannon information; output-basis equivalence is not input relabeling; this classification is not a universal compression theorem.

If exact-head CI RED, authority remains #950. If exact-head CI is GREEN including A15-R0 step 19 and aggregate SUCCESS, this theorem earns on the frozen tree only.

No merge/deploy/release/publication/production/Vercel/live Ash-Loom/Proto-Loom/A16 authority.

Sealed ⟐