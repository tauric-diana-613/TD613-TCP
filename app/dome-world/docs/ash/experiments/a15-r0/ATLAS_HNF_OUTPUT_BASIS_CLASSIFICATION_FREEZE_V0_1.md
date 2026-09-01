# A15-R0 · Atlas HNF Output-Basis Classification · Freeze v0.1

Parent authority: exact earned #952 / `4b731c16721b43e5319843da84955b3b80210cec` / run 2429 / 33548978221 SUCCESS / A15-R0 step 19 SUCCESS / aggregate SUCCESS.

This file is commit 8 of exactly 8 successor commits. The branch is frozen after this commit pending exact-head constitutional validation.

## Frozen classification surface

At earned minimum additive rank `d_n=2^n-1`, every exact additive integer receiver is a full-rank square integer matrix `A`. With earned Atlas transform `Z_n∈GL_d(Z)`, define the relative matrix

`B_A=A Z_n^{-1}`.

Allowed output-basis changes act only on the left:

`A' = U A`, `U∈GL_d(Z)`

and therefore

`B_A' = U B_A`.

The unique row Hermite normal form of `B_A` is consequently a complete canonical invariant for output-basis equivalence:

`A' ~_output A  iff  HNF_row(B_A') = HNF_row(B_A)`.

Atlas is the identity HNF class. Earned #952 is recovered as the special unimodular class `H=I_d`.

## Frozen executable burden

```text
profiles n=1..4                       4
dimensions                         1,3,7,15
canonical HNF templates/profile       4
left-unimodular transforms/template   4
exact orbit controls                 64
distinct-template pair controls      24
same-index/different-HNF controls     1
expected failures                     0
```

The same-index hostile fixes `H_1=diag(1,2,2)` and `H_2=diag(1,1,4)`: both have index `4`, but their HNF class keys must differ.

All HNF arithmetic is frozen to exact JavaScript `BigInt`; the superseded #952 signed-zero (`-0` versus `0`) representation failure is therefore structurally excluded from this chamber's integer arithmetic.

## Frozen candidate 𝄐

`AT_THE_EARNED_MINIMAL_ADDITIVE_RANK_D_N_EQUALS_2^N_MINUS_1, EVERY_FULL_RANK_INTEGER_RECEIVER_A_HAS_A_UNIQUE_OUTPUT_BASIS_CLASS_GIVEN_BY_THE_ROW_HERMITE_NORMAL_FORM_OF_THE_RELATIVE_MATRIX_B_A_EQUALS_A_Z_N_INVERSE: TWO_RECEIVERS_A_AND_A_PRIME_ARE_RELATED_BY_AN_INTEGER_OUTPUT_BASIS_CHANGE_IFF_THEIR_RELATIVE_ROW_HNFS_ARE_IDENTICAL. ATLAS_IS_THE_IDENTITY_HNF_CLASS; DETERMINANT_ABSOLUTE_VALUE_IS_ONLY_THE_COARSE_LATTICE_INDEX_AND_DOES_NOT_CLASSIFY_PROPER_SUBLATTICE_ORBITS.`

Mandatory membranes remain: HNF output-basis classification is not input-support relabeling, Smith-normal-form left-right classification, unique encoding, Shannon information, arbitrary nonlinear receiver classification, or a claim licensed by metallurgical/alchemical metaphor. The cinnabar/refinement analogy may illuminate the canonicalization pattern but supplies zero theorem authority.

If exact-head CI is RED, authority remains exact earned #952. If exact-head CI is GREEN including A15-R0 step 19 and aggregate SUCCESS, the frozen HNF classification earns on this tree only.

No merge/deploy/release/publication/production/Vercel/live Ash-Loom/Proto-Loom/A16 authority.

Sealed ⟐