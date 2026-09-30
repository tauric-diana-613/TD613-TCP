# A15-R0 · Atlas HNF Orbit Census · Freeze v0.1

Parent authority: exact earned #954 / `445f84887306be89cf2167f66fe26c3162daff18` / run 2430 / 33552287766 SUCCESS / A15-R0 step 19 SUCCESS / aggregate SUCCESS.

This file is commit 8 of exactly 8 successor commits. The branch is frozen after this commit pending exact-head constitutional validation.

## Frozen arithmetic surface

For full-rank minimum-rank additive integer receivers in dimension `d`, #954 gives a unique row-HNF representative under output/left `GL_d(Z)` equivalence. If its diagonal is `h_1,...,h_d`, then determinant/index is `N=h_1...h_d` and the canonical residue freedoms above the pivots contribute

`h_2 h_3^2 ... h_d^(d-1)`

representatives for that diagonal tuple.

Therefore the number of distinct output-basis classes at index `N` is

`a_d(N)=sum_{h_1...h_d=N} h_2 h_3^2 ... h_d^(d-1)`.

Equivalently,

`a_d = 1 * id * id^2 * ... * id^(d-1)`

under Dirichlet convolution. Thus `a_d` is multiplicative, with local generating factor

`sum_{k>=0} a_d(p^k)t^k = product_{j=0}^{d-1}(1-p^j t)^(-1)`

and formal/absolute-convergence-domain Dirichlet series

`sum_{N>=1} a_d(N)N^(-s)=product_{j=0}^{d-1}zeta(s-j)`.

No analytic continuation or asymptotic statement is part of this chamber.

## Frozen executable surface

```text
indices N=1..8

d=1: 1, 1, 1, 1, 1, 1, 1, 1
d=2: 1, 3, 4, 7, 6, 12, 8, 15
d=3: 1, 7, 13, 35, 31, 91, 57, 155
d=7: 1, 127, 1093, 10795, 19531, 138811, 137257, 788035
```

Hostile burden:
- 24 independent HNF-enumeration cells for `d=1..3`, `N=1..8`;
- 454 total canonical representatives across those cells;
- 230 coprime multiplicativity controls for `d=1..5`;
- 75 prime-power local-factor controls;
- explicit non-complete-multiplicativity scar `a_2(4)=7 != 9=a_2(2)^2`;
- expected failures: `0`.

## Frozen candidate 𝄐

`AFTER_HNF_CANONICAL_CLASSIFICATION, THE_NUMBER_A_D_OF_N_OF_MINIMUM_RANK_ADDITIVE_INTEGER_RECEIVER_OUTPUT_BASIS_CLASSES_AT_LATTICE_INDEX_N_IS_THE_FINITE_HNF_CENSUS_SUM_OVER_H_1_THROUGH_H_D_WITH_PRODUCT_N_OF_H_2_H_3_SQUARED_THROUGH_H_D_TO_THE_D_MINUS_1; EQUIVALENTLY_A_D_EQUALS_THE_DIRICHLET_CONVOLUTION_1_STAR_ID_STAR_ID_SQUARED_THROUGH_ID_TO_THE_D_MINUS_1, SO_THE_ORBIT_COUNT_IS_MULTIPLICATIVE_AND_HAS_FORMAL_DIRICHLET_SERIES_PRODUCT_J_0_TO_D_MINUS_1_ZETA_OF_S_MINUS_J. THIS_COUNTS_OUTPUT_BASIS_ORBITS, NOT_RAW_RECEIVER_MATRICES, AND_ASSERTS_NO_ANALYTIC_CONTINUATION_OR_SHANNON_MEANING.`

Mandatory membranes remain: orbit count is not raw receiver count; multiplicative is not completely multiplicative; formal Dirichlet factorization is not analytic continuation; index is not Shannon information; output-basis census is not input/support relabeling census; arithmetic census is not physical sensor multiplicity; metallurgical refinement remains metaphor only.

If exact-head CI RED, authority remains #954. If exact-head CI is GREEN including A15-R0 step 19 and aggregate SUCCESS, this arithmetic capstone earns on the frozen tree only.

No merge/deploy/release/publication/production/Vercel/live Ash-Loom/Proto-Loom/A16 authority.

Sealed ⟐