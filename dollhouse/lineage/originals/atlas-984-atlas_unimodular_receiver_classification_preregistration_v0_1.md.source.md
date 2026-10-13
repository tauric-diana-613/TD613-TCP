# A15-R0 · Atlas Unimodular Receiver Classification · Preregistration v0.1

Parent authority: exact earned #950 / `c20ee814c02f5779b80560b229078b89e703dfae` / TD613 Consolidated Validation run 2427 / 33541810010 SUCCESS / A15-R0 step 19 SUCCESS / aggregate SUCCESS.

## Question

#950 earns the minimal additive scalar rank `d_n=2^n-1`. Among exact minimal-rank additive integer receivers `A:Z^d->Z^d`, which ones are genuinely equivalent to Atlas as integer-coordinate systems?

Let `Z_n` denote the earned full Atlas `(C,W,H)` transform. #950 establishes `det(Z_n)=1`, so `Z_n∈GL_d(Z)`.

## Candidate classification

For any square integer receiver `A∈Z^(d×d)`:

1. `A` is injective on all nonnegative support-multiplicity states iff `det(A) != 0`.
2. `A` is lattice-surjective (equivalently `A(Z^d)=Z^d`) iff `|det(A)|=1`.
3. `A` is integer output-basis equivalent to Atlas iff there exists `U∈GL_d(Z)` with

   `A = U Z_n`.

Because `Z_n^{-1}∈GL_d(Z)`, such a `U` is forced to be

`U = A Z_n^{-1}`.

Therefore:

`A = U Z_n for some U∈GL_d(Z)` iff `|det(A)|=1`.

Equivalently, all unimodular minimal additive receivers form one left `GL_d(Z)` orbit, represented by Atlas.

## Proper-sublattice controls

Full-rank nonunimodular receivers remain injective but are not integer-basis equivalent to Atlas. For `k>1`, let

`D_k = diag(k,1,...,1)` and `A_k = D_k Z_n`.

Then

`det(A_k)=k`,

so `A_k` is injective, but its image has lattice index `k` and is a proper sublattice of `Z^d`.

The finite hostile must test `k∈{2,3,5,7}` for each `n=1..5`: exactly 20 proper-sublattice controls.

## Singular square controls

Minimum channel count does not itself imply exactness. For each `n=1..5`, the hostile must create a square rank-deficient receiver by replacing the first output row of `Z_n` with zero. Its determinant must be `0`, and the control must admit two distinct nonnegative support states with identical readout.

## Unimodular orbit controls

For each `n=1..5`, generate exactly six deterministic elementary unimodular output basis changes from row swaps, sign flips, and integer row shears. For every `U`:

- `det(U)=±1`;
- `A=U Z_n` has determinant `±1`;
- recover `U` exactly as `A Z_n^{-1}`;
- require exact matrix equality;
- require Atlas-equivalence classification true.

Total unimodular orbit controls: 30.

## Candidate bounded 𝄐

`AT_THE_EARNED_MINIMAL_ADDITIVE_RANK_D_N_EQUALS_2^N_MINUS_1, THE_LATTICE_SURJECTIVE_EXACT_INTEGER_RECEIVERS_FORM_A_SINGLE_GL_D_OF_Z_OUTPUT_BASIS_ORBIT: AN_INTEGER_D_BY_D_RECEIVER_A_IS_INTEGER_BASIS_EQUIVALENT_TO_ATLAS_IFF_ABS_DET_A_EQUALS_ONE, IN_WHICH_CASE_THE_UNIQUE_OUTPUT_BASIS_CHANGE_IS_U_EQUALS_A_Z_N_INVERSE. FULL_RANK_NONUNIMODULAR_RECEIVERS_CAN_REMAIN_INJECTIVE_BUT_OCCUPY_PROPER_FINITE_INDEX_SUBLATTICES_AND_ARE_NOT_INTEGER_BASIS_EQUIVALENT_TO_ATLAS.`

## Mandatory membranes

`GL_Z_ORBIT_UNIQUENESS != UNIQUE_ENCODING`  
`UNIMODULAR_EQUIVALENCE != ARBITRARY_NONLINEAR_EQUIVALENCE`  
`LATTICE_SURJECTIVE != REQUIRED_FOR_STATE_INJECTIVITY`  
`DETERMINANT_INDEX != SHANNON_INFORMATION`  
`PROPER_SUBLATTICE != INFORMATION_LOSS_ON_VALID_IMAGE`  
`OUTPUT_BASIS_EQUIVALENCE != INPUT_RELABELING_EQUIVALENCE`  
`MINIMAL_ADDITIVE_CLASSIFICATION != UNIVERSAL_COMPRESSION_THEOREM`  
`EXACT_HEAD_SUCCESS != MERGE_AUTHORITY`

If RED, authority remains exact earned #950. No merge/deploy/release/publication/production/Vercel/live Ash-Loom/Proto-Loom/A16 authority.

Sealed ⟐