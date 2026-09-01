# A15-R0 · Atlas Schubert Graded Cell Decomposition · Freeze v0.1

Parent authority: exact earned #960 / `0372405b055bcdff990f715cc65eed9354b2a4a0` / run 2434 / 33565228479 SUCCESS / A15-R0 step 19 SUCCESS / aggregate SUCCESS.

This is commit 8 of exactly 8 successor commits. Freeze after this commit pending exact-head constitutional witness.

## Frozen theorem surface

Fix the ordered Atlas support coordinates and the same standard finite-field flag / reverse-RREF convention earned in #960.

For prime `p`, `d>=1`, `k>=0`, and each weak composition `e=(e_1,...,e_d)` of `k`, let `H_e(p)` be the unique row-HNF output-basis orbit representatives with diagonal `H_jj=p^(e_j)`.

Define

`m(e)=sum_(j=1)^d (j-1)e_j`.

Column `j` contains `j-1` independent HNF residues modulo `p^(e_j)`; each residue has exactly `e_j` base-p digits. Therefore `H_e(p)` has exactly `m(e)` free field digits and

`H_e(p) ≅ F_p^(m(e))`

as a coordinate-relative affine chart / finite set.

Under the exact #960 digit bijection, those digits occupy precisely the free coordinates of the reverse-RREF Schubert cell with pivot word

`1^(e_1) 0 1^(e_2) 0 ... 0 1^(e_d)`.

Hence that cell has dimension `m(e)` and cardinality `p^(m(e))`.

Summing over weak compositions gives the finite formal polynomial identity

`P_(d,k)(q)=sum_(e_1+...+e_d=k) q^(m(e)) = GaussianBinomial(d+k-1,k;q)`.

Equivalently,

`sum_(k>=0) P_(d,k)(q)t^k = product_(j=0)^(d-1)(1-q^j t)^(-1)`

and

`P_(d,k)=P_(d-1,k)+q^(d-1)P_(d,k-1)`

with `P_(d,0)=P_(1,k)=1`.

Evaluating the formal variable at a prime `q=p` recovers the earned prime-power orbit census `a_d(p^k)`.

## Frozen executable burden

- 42 coefficient-for-coefficient formal polynomial controls (`d=1..7,k=0..5`);
- 168 evaluations at `p in {2,3,5,7}` against the earned Gaussian-binomial values;
- 28 exhaustive #960-compatible finite cells;
- 3210 HNF points checked for exponent preservation, reverse-RREF free-coordinate dimension, exact per-stratum cardinality, and point-key uniqueness;
- zero expected failures;
- fixed-standard-flag dependence control;
- composite-`q` arithmetic-evaluation control with no finite-field claim;
- `d=7,k=3` anchor: 84 compositions, degree 18, coefficient histogram `[1,1,2,3,4,5,7,7,8,8,8,7,7,5,4,3,2,1,1]`, evaluation at `p=2` exactly `788035`.

## Frozen candidate 𝄐

`AFTER_FIXING_THE_ORDERED_ATLAS_SUPPORT_COORDINATES_AND_THE_STANDARD_REVERSE_RREF_FLAG_THE_EARNED_HNF_TO_GRASSMANNIAN_BIJECTION_IS_GRADED_BY_WEAK_COMPOSITIONS_E_OF_K: THE_FIXED_DIAGONAL_EXPONENT_STRATUM_H_E_OF_P_IS_AN_EXPLICIT_AFFINE_COORDINATE_CHART_F_P_TO_THE_M_OF_E_WITH_M_OF_E_EQUALS_SUM_J_MINUS_ONE_TIMES_E_J_AND_MAPS_EXACTLY_TO_THE_CORRESPONDING_REVERSE_RREF_SCHUBERT_CELL; CONSEQUENTLY_ITS_CARDINALITY_IS_P_TO_THE_M_OF_E_AND_THE_FINITE_CELL_ENUMERATOR_SUM_E_Q_TO_THE_M_OF_E_IS_THE_GAUSSIAN_BINOMIAL_D_PLUS_K_MINUS_ONE_CHOOSE_K_AT_FORMAL_Q. PRIME_EVALUATION_RECOVERS_THE_EARNED_PRIME_POWER_ORBIT_CENSUS. THIS_IS_FINITE_COORDINATE_RELATIVE_GEOMETRY_NOT_ASYMPTOTICS_PHYSICAL_GEOMETRY_BRUHAT_CLOSURE_OR_BASIS_FREE_CANONICALITY.`

## Mandatory membranes

`FORMAL_Q != FIELD_PRIME_P`; `SCHUBERT_CELL_DIMENSION != PHYSICAL_DIMENSION`; `HNF_EXPONENT_STRATUM != ATLAS_SUPPORT_STRATUM`; `CELL_DECOMPOSITION != BRUHAT_CLOSURE_ORDER`; `AFFINE_COORDINATE_CHART != BASIS_FREE_CANONICAL_GEOMETRY`; `STANDARD_FLAG_DEPENDENCE != CANONICALITY`; `GAUSSIAN_POLYNOMIAL != ASYMPTOTIC_LIMIT`; `FINITE_GEOMETRY != PHYSICAL_GEOMETRY`; `POLYNOMIAL_EVALUATION_AT_COMPOSITE_Q != FINITE_FIELD_REALIZATION`; `SUCCESSFUL_EXACT_HEAD_GREEN != MERGE_AUTHORITY`; `ATLAS_REGISTRATION != LIVE_RUNTIME_STATE`.

If RED, authority remains #960. No merge/deploy/release/publication/production/Vercel/live authority.

Sealed ⟐