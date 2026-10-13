# A15-R0 · Atlas Minimal Additive Receiver Rank · Freeze v0.1

Parent authority: exact earned #948 / `c880a89346fd18a11a8c9476529e77816e12d14a` / run 2426 / 33538088412 SUCCESS / A15-R0 step 19 SUCCESS / aggregate SUCCESS.

This file is commit 8 of exactly 8 successor commits. The branch is frozen after this commit pending exact-head constitutional validation.

## Frozen theorem surface

For `n` labeled blocks, the nonempty support-multiplicity module has dimension

`d_n = 2^n - 1`.

The full Atlas receiver has exactly the same number of integer scalar coordinates:

- `n` capacities;
- `binom(n,2)` weighted pair intersections;
- `2^n-1-n-binom(n,2)` exact high-support multiplicities.

Ordered by support cardinality, its transform is upper triangular with unit diagonal and therefore unimodular with determinant `1`.

Any additive integer-valued `m`-channel receiver is represented by an integer matrix `A:Z^d -> Z^m`. If `m<d`, exact rational nullspace construction produces nonzero `z∈ker(A)∩Z^d`; splitting `z=z^+-z^-` yields two distinct nonnegative support states with identical receiver output. Thus

`r_add(n)=2^n-1`.

## Frozen executable surface

```text
n   dimension   C   W   H   det
1       1       1   0   0    1
2       3       2   1   0    1
3       7       3   3   1    1
4      15       4   6   5    1
5      31       5  10  16    1
```

Hostile obligations:

- 42 generated lower-dimensional integer receiver matrices;
- 42/42 constructive kernel collisions required;
- 7/7 one-coordinate deletion collisions required;
- recursive nonlinear Cantor scalar control: 128/128 unique Boolean three-block codes required.

## Frozen candidate 𝄐

`FOR_N_LABELED_BLOCKS_THE_FULL_ATLAS_C_W_H_RECEIVER_IS_A_UNIMODULAR_INTEGER_CHANGE_OF_BASIS_ON_THE_2^N_MINUS_1_DIMENSIONAL_NONEMPTY_SUPPORT_MULTIPLICITY_MODULE; CONSEQUENTLY_EVERY_EXACT_ADDITIVE_INTEGER_VALUED_RECEIVER_FOR_ALL_NONNEGATIVE_SUPPORT_MULTIPLICITIES_REQUIRES_AT_LEAST_2^N_MINUS_1_SCALAR_CHANNELS, AND_ATLAS_ACHIEVES_THIS_BOUND. THIS_IS_MINIMAL_ADDITIVE_RECEIVER_RANK, NOT_MINIMAL_BITS_OR_MINIMAL_ARBITRARY_NONLINEAR_ENCODING.`

Mandatory membranes remain: additive rank is not bit length, Shannon entropy, physical sensor count, universal optimal compression, or a lower bound against arbitrary nonlinear injection. The one-scalar Cantor control explicitly witnesses the latter exclusion.

If exact-head CI RED, authority remains #948. If exact-head CI is GREEN including A15-R0 step 19 and aggregate SUCCESS, this theorem earns on the frozen tree only.

No merge/deploy/release/publication/production/Vercel/live Ash-Loom/Proto-Loom/A16 authority.

Sealed ⟐