# A15-R0 · Atlas Minimal Additive Receiver Rank · Preregistration v0.1

Parent authority: exact earned #948 / `c880a89346fd18a11a8c9476529e77816e12d14a` / TD613 Consolidated Validation run 2426 / 33538088412 SUCCESS / A15-R0 step 19 SUCCESS / aggregate SUCCESS.

## Question

The earned Atlas receiver retains capacities `C`, weighted pair intersections `W`, and exact high-support multiplicities `H`. On three blocks #948 proved those strata jointly sufficient and individually indispensable. The unresolved seam is stronger: can an alternative jointly transformed **additive integer-valued receiver** use fewer scalar channels while remaining injective on every nonnegative incidence-support multiplicity vector?

## Universal n-block support module

For `n>=1`, index the nonempty supports `S⊆[n]`. Their multiplicity vector is

`mu=(mu_S)_{∅≠S⊆[n]} ∈ N_0^(2^n-1)`.

Set `d_n=2^n-1`.

Define the full stratified Atlas receiver `Phi_n` with one coordinate for every nonempty support index:

- `|S|=1`: `y_S = sum_{T⊇S} mu_T` (block capacity);
- `|S|=2`: `y_S = sum_{T⊇S} mu_T` (weighted pair intersection);
- `|S|>=3`: `y_S = mu_S` (exact high-support multiplicity).

Order supports first by cardinality, then lexicographically. The transform matrix `Z_n` is preregistered to be upper triangular with diagonal entries all `1`; therefore `det(Z_n)=1` and `Phi_n` is a unimodular integer change of basis.

## Candidate theorem: minimal additive scalar rank

An additive integer receiver with `m` scalar channels is a monoid homomorphism

`R:N_0^d -> Z^m`

and therefore has an integer matrix representation `A∈Z^(m×d)`.

Preregistered lower-bound argument:

1. If `m<d`, then `rank_Q(A)<d`, hence there exists nonzero `z∈Z^d` with `Az=0` after clearing rational nullspace denominators.
2. Write `z=z^+-z^-` with `z^+,z^-∈N_0^d` coordinatewise.
3. Since `z≠0`, `z^+≠z^-`.
4. `A z^+ = A z^-`.

Thus every additive receiver with fewer than `d` integer scalar channels has a collision on valid nonnegative support-multiplicity states.

Since `Phi_n` uses exactly `d_n=2^n-1` scalar channels and is unimodular:

`r_add(n)=2^n-1`.

## Finite executable controls

The implementation must mechanically construct `Z_n` for `n=1..5` and verify:

```text
n   d_n   C   W   H   det
1     1   1   0   0    1
2     3   2   1   0    1
3     7   3   3   1    1
4    15   4   6   5    1
5    31   5  10  16    1
```

It must also expose an exact rational-nullspace witness constructor. Hostile tests will feed lower-dimensional integer matrices and require two distinct nonnegative collision vectors with identical readout.

## Nonlinear one-scalar counter-control

Coordinate count alone cannot yield a universal coding lower bound. Recursive Cantor pairing gives an injective nonlinear map `N_0^d -> N_0` for every finite `d`. The implementation must include that control and show all 128 Boolean three-block support states receive distinct scalar codes.

Therefore the candidate theorem is deliberately restricted to additive integer-valued scalar receivers.

## Candidate bounded 𝄐

`FOR_N_LABELED_BLOCKS_THE_FULL_ATLAS_C_W_H_RECEIVER_IS_A_UNIMODULAR_INTEGER_CHANGE_OF_BASIS_ON_THE_2^N_MINUS_1_DIMENSIONAL_NONEMPTY_SUPPORT_MULTIPLICITY_MODULE; CONSEQUENTLY_EVERY_EXACT_ADDITIVE_INTEGER_VALUED_RECEIVER_FOR_ALL_NONNEGATIVE_SUPPORT_MULTIPLICITIES_REQUIRES_AT_LEAST_2^N_MINUS_1_SCALAR_CHANNELS, AND_ATLAS_ACHIEVES_THIS_BOUND. THIS_IS_MINIMAL_ADDITIVE_RECEIVER_RANK, NOT_MINIMAL_BITS_OR_MINIMAL_ARBITRARY_NONLINEAR_ENCODING.`

## Mandatory membranes

`MINIMAL_ADDITIVE_SCALAR_RANK != MINIMAL_BIT_LENGTH`  
`MINIMAL_ADDITIVE_SCALAR_RANK != SHANNON_LOWER_BOUND`  
`INTEGER_LINEAR_LOWER_BOUND != ARBITRARY_NONLINEAR_CODING_LOWER_BOUND`  
`UNIMODULAR_RECEIVER != UNIVERSAL_OPTIMAL_COMPRESSION`  
`CANTOR_PAIRING_CONTROL != PRACTICAL_COMPRESSION_SCHEME`  
`SUPPORT_MULTIPLICITY_MODULE != HISTORICAL_SOURCE_IDENTITY`  
`EXACT_HEAD_SUCCESS != MERGE_AUTHORITY`

If RED, authority remains exact earned #948. No merge/deploy/release/publication/production/Vercel/live Ash-Loom/Proto-Loom/A16 authority.

Sealed ⟐