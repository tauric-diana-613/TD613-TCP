# A15-R0 · Atlas Schubert Graded Cell Decomposition · Preregistration v0.1

Parent authority: exact earned #960 / `0372405b055bcdff990f715cc65eed9354b2a4a0` / run 2434 / 33565228479 SUCCESS / A15-R0 step 19 SUCCESS / aggregate SUCCESS.

## Question

Does the earned #960 coordinate-relative HNF ↔ Grassmannian bijection refine, for fixed exponent composition `e=(e_1,...,e_d)` with `sum e_j=k`, into an affine-cell bijection whose dimension is the number of base-p HNF residue digits carried by that exponent stratum?

## Preregistered theorem target

Fix ordered Atlas support coordinates and the same standard finite-field flag / reverse-RREF convention as #960. For prime `p`, `d>=1`, `k>=0`, and a weak composition `e` of `k` into `d` parts, let `H_e(p)` be the row-HNF representatives with diagonal `H_jj=p^(e_j)`.

Define

`m(e)=sum_(j=1)^d (j-1)e_j`.

The target is:

1. `H_e(p)` is explicitly parameterized by exactly `m(e)` base-p residue digits, hence `H_e(p) ≅ F_p^(m(e))` as a coordinate-relative finite set / affine coordinate chart.
2. Under #960's explicit bijection, `H_e(p)` maps exactly onto the reverse-RREF Schubert cell with pivot word `1^(e_1) 0 1^(e_2) 0 ... 0 1^(e_d)`, whose free-coordinate dimension is `m(e)`.
3. Therefore each stratum has cardinality `p^(m(e))`.
4. Summing strata yields the formal polynomial identity

   `sum_(e_1+...+e_d=k) q^(m(e)) = GaussianBinomial(d+k-1,k;q)`.

5. Evaluating the formal variable at a prime `q=p` recovers the earned prime-power orbit census `a_d(p^k)`.

## Fixed finite burden

- independent formal-polynomial comparison for `d=1..7`, `k=0..5`;
- evaluation comparison at `p in {2,3,5,7}` over the same grid;
- exhaustive #960-compatible HNF/Grassmannian stratum audit over the same 28 cells used by #960 (`p=2,d<=4,k<=3`; `p=3,d<=3,k<=3`), totaling 3210 HNF points;
- exact per-composition cardinality checks `count(e)=p^m(e)`;
- exact free-coordinate dimension checks from the produced reverse-RREF pivot pattern;
- deterministic `d=7,k=3` histogram and `p=2` evaluation anchor `788035`;
- expected failures: 0.

## Mandatory membranes

`FORMAL_Q != FIELD_PRIME_P`; `SCHUBERT_CELL_DIMENSION != PHYSICAL_DIMENSION`; `HNF_EXPONENT_STRATUM != ATLAS_SUPPORT_STRATUM`; `CELL_DECOMPOSITION != BRUHAT_CLOSURE_ORDER`; `AFFINE_COORDINATE_CHART != BASIS_FREE_CANONICAL_GEOMETRY`; `STANDARD_FLAG_DEPENDENCE != CANONICALITY`; `GAUSSIAN_POLYNOMIAL != ASYMPTOTIC_LIMIT`; `FINITE_GEOMETRY != PHYSICAL_GEOMETRY`; `POLYNOMIAL_EVALUATION_AT_COMPOSITE_Q != FINITE_FIELD_REALIZATION`; `SUCCESSFUL_EXACT_HEAD_GREEN != MERGE_AUTHORITY`; `ATLAS_REGISTRATION != LIVE_RUNTIME_STATE`.

No merge/deploy/release/publication/production/Vercel/live authority.

Sealed ⟐