# A15-R0 · Atlas HNF Output-Basis Classification · Preregistration v0.1

Parent authority: exact earned #952 / `4b731c16721b43e5319843da84955b3b80210cec` / TD613 Consolidated Validation run 2429 / 33548978221 SUCCESS / A15-R0 step 19 SUCCESS / aggregate SUCCESS.

## Question

Earned #950 proves the minimum additive integer-valued scalar rank is `d_n=2^n-1`. Earned #952 classifies the lattice-surjective minimum-rank receivers as one left `GL_d(Z)` orbit represented by Atlas, while explicitly leaving full-rank nonunimodular receivers in proper finite-index sublattices.

The remaining exact-additive classification question is:

**How are all full-rank minimum-rank integer receivers classified up to integer output-basis change while the semantic support basis remains fixed?**

## Relative receiver matrix

For `n` labeled blocks let `Z_n∈GL_d(Z)` be the earned Atlas transform, `d=2^n-1`. For any square minimum-rank integer receiver `A`, define

`B_A = A Z_n^{-1} ∈ M_d(Z)`.

An allowed output-basis change is left multiplication by `U∈GL_d(Z)`:

`A' = U A`.

Therefore

`B_A' = U B_A`.

No right multiplication is admitted because the input coordinates are the fixed semantic incidence-support multiplicities.

## Row Hermite normal form convention

For full-rank square integer matrices this chamber uses the unique row Hermite normal form `H=HNF_row(B)` characterized by:

1. `H` is upper triangular;
2. every diagonal pivot is positive;
3. for every column `j` and row `i<j`, `0 <= H[i,j] < H[j,j]`;
4. `H = U B` for some `U∈GL_d(Z)`.

The implementation must use exact integer arithmetic. JavaScript signed zero is not an admitted integer distinction; the implementation will use `BigInt`, for which integer zero has a single canonical representation.

## Candidate classification theorem

For full-rank minimum-rank integer receivers `A,A'`:

`A' = U A` for some `U∈GL_d(Z)`

iff

`HNF_row(A' Z_n^{-1}) = HNF_row(A Z_n^{-1})`.

Hence the row HNF of the relative matrix is a complete canonical invariant for minimum-rank additive receivers under output-basis equivalence.

Consequences:

- Atlas itself has canonical class `I_d`.
- Earned #952 is recovered as the special class `H=I_d`, equivalently determinant index `1`.
- `|det(A)| = det(H)` is the finite lattice index but is not a complete orbit invariant.
- Distinct HNFs can have the same determinant/index and therefore represent inequivalent minimum-rank receivers.

## Frozen same-index counter-control

At `d=3`, the two canonical HNFs

`H_1 = diag(1,2,2)`

and

`H_2 = diag(1,1,4)`

both have determinant/index `4` but are distinct row HNFs. The chamber must preserve their inequivalence under output-basis change.

## Finite executable controls

For Atlas profiles `n=1..4` (`d=1,3,7,15`) the implementation must:

- construct exact `Z_n` and `Z_n^{-1}`;
- construct four deterministic canonical HNF templates per profile;
- apply four deterministic unimodular left transforms to each template;
- recover the exact preregistered HNF for every transformed receiver;
- classify all transforms of the same HNF together;
- keep distinct HNF templates in distinct classes;
- retain the explicit same-index/different-HNF determinant-4 control.

Finite controls test the implementation only. The arbitrary-`n` classification authority is the algebraic uniqueness theorem for row HNF combined with earned unimodularity of `Z_n`.

## Candidate bounded 𝄐

`AT_THE_EARNED_MINIMAL_ADDITIVE_RANK_D_N_EQUALS_2^N_MINUS_1, EVERY_FULL_RANK_INTEGER_RECEIVER_A_HAS_A_UNIQUE_OUTPUT_BASIS_CLASS_GIVEN_BY_THE_ROW_HERMITE_NORMAL_FORM_OF_THE_RELATIVE_MATRIX_B_A_EQUALS_A_Z_N_INVERSE: TWO_RECEIVERS_A_AND_A_PRIME_ARE_RELATED_BY_AN_INTEGER_OUTPUT_BASIS_CHANGE_IFF_THEIR_RELATIVE_ROW_HNFS_ARE_IDENTICAL. ATLAS_IS_THE_IDENTITY_HNF_CLASS; DETERMINANT_ABSOLUTE_VALUE_IS_ONLY_THE_COARSE_LATTICE_INDEX_AND_DOES_NOT_CLASSIFY_PROPER_SUBLATTICE_ORBITS.`

## Mandatory membranes

`HNF_OUTPUT_BASIS_CLASSIFICATION != INPUT_SUPPORT_RELABELING`  
`HNF_OUTPUT_BASIS_CLASSIFICATION != SMITH_NORMAL_FORM_CLASSIFICATION`  
`LEFT_GL_Z_EQUIVALENCE != LEFT_RIGHT_GL_Z_EQUIVALENCE`  
`SAME_DETERMINANT_INDEX != SAME_OUTPUT_BASIS_CLASS`  
`CANONICAL_HNF != UNIQUE_ENCODING`  
`INTEGER_LATTICE_CLASSIFICATION != SHANNON_INFORMATION`  
`HNF_CLASSIFICATION != ARBITRARY_NONLINEAR_RECEIVER_CLASSIFICATION`  
`METALLURGICAL_REFINEMENT_METAPHOR != MATHEMATICAL_PROOF`  
`EXACT_HEAD_SUCCESS != MERGE_AUTHORITY`

If RED, authority remains exact earned #952. No merge/deploy/release/publication/production/Vercel/live Ash-Loom/Proto-Loom/A16 authority.

Sealed ⟐