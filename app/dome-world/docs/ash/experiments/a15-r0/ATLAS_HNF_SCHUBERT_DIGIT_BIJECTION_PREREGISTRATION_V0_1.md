# A15-R0 · Atlas HNF–Schubert Digit Bijection · Preregistration v0.1

Parent authority: exact earned #958 / `879f68feb64214259f10b70cc194eb43f659ff55` / run 2432 / 33558316318 SUCCESS / A15-R0 step 19 SUCCESS / aggregate SUCCESS.

## Question

Does the earned prime-power equality

`a_d(p^k) = |Gr(k,d+k-1)(F_p)|`

admit an explicit pointwise correspondence, rather than merely equal cardinality?

## Preregistered construction

Fix:
- the ordered Atlas support coordinates on `Z^d`;
- row-HNF convention from #954;
- the standard ordered coordinates of `F_p^(d+k-1)`;
- the reverse-row-reduced/opposite-Schubert convention determined by that order.

Let `H` be the unique row-HNF representative of an output-basis orbit at lattice index `p^k`. Since `det(H)=p^k` and HNF pivots are positive,

`H_jj = p^(e_j)`, with `e_j >= 0` and `sum_j e_j = k`.

Form the stars-and-bars word

`w_e = 1^(e_1) 0 1^(e_2) 0 ... 0 1^(e_d)`

of length `d+k-1`, with `k` ones. Its one-positions are reverse-RREF pivots. A pivot belonging to block `j` has exactly `j-1` zero/nonpivot positions before it.

For each HNF residue `H_rj` with `r<j`, write the unique base-p expansion

`H_rj = sum_(t=0)^(e_j-1) xi_(r,j,t) p^t`, `xi_(r,j,t) in F_p`.

For the t-th pivot in block j, place the digit vector

`(xi_(1,j,t), ..., xi_(j-1,j,t))`

into the `j-1` allowed pre-pivot nonpivot coordinates of its reverse-RREF row.

Call the resulting Grassmannian point `Psi(H)`.

## Preregistered inverse

Given a reverse-RREF matrix in `Gr(k,d+k-1)(F_p)`:
1. its pivot word uniquely determines the weak composition `(e_1,...,e_d)` by counting pivots between successive nonpivot separators;
2. its affine cell coordinates uniquely recover digits `xi_(r,j,t)`;
3. recombine `H_rj = sum_t xi_(r,j,t) p^t`;
4. set diagonal `H_jj=p^(e_j)`, lower entries zero.

The recovered matrix is row HNF of determinant `p^k`.

## Candidate theorem

For every `d>=1`, prime `p`, and `k>=0`, the above maps are mutual inverses. Hence the set of minimum-rank additive integer receiver output-basis orbits of lattice index `p^k` is explicitly bijective, relative to the fixed Atlas coordinate order and standard finite-field flag, with `Gr(k,d+k-1)(F_p)`.

## Mandatory membranes

- `EXPLICIT_COORDINATE_RELATIVE_BIJECTION != BASIS_FREE_CANONICAL_EQUIVALENCE`
- `SET_BIJECTION != FUNCTORIAL_OR_NATURAL_EQUIVALENCE`
- `GRASSMANNIAN_POINT != PHYSICAL_RECEIVER`
- `HNF_DIGITIZATION != NAIVE_MOD_P_REDUCTION`
- `SCHUBERT_CELL_COORDINATES != INPUT_OUTPUT_DUALITY`
- `STANDARD_FLAG_DEPENDENCE != CANONICALITY`
- `PRIME_POWER_LOCAL_BIJECTION != GLOBAL_COMPOSITE_INDEX_BIJECTION`
- `FINITE_FIELD_REALIZATION_OF_ORBIT_LABELS != FINITE_FIELD_REALIZATION_OF_RECEIVER_DYNAMICS`
- `METALLURGICAL_OR_ALCHEMICAL_RESONANCE != PROOF`
- `SUCCESSFUL_EXACT_HEAD_GREEN != MERGE_AUTHORITY`

No merge/deploy/release/publication/production/Vercel/live authority.

Sealed ⟐