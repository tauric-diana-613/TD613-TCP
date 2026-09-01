# A15-R0 · Atlas HNF Orbit Census · Preregistration v0.1

Parent authority: exact earned #954 / `445f84887306be89cf2167f66fe26c3162daff18` / TD613 Consolidated Validation run 2430 / 33552287766 SUCCESS / A15-R0 step 19 SUCCESS / aggregate SUCCESS.

## Question

#954 classifies every full-rank minimum-rank additive integer receiver `A` up to output/left `GL_d(Z)` by the row Hermite normal form of `B_A=A Z_n^{-1}`. The remaining same-lane question is arithmetic: for fixed lattice index `N=|det(A)|`, how many distinct output-basis classes exist?

## HNF counting law

Under the earned row-HNF convention, a canonical full-rank `d×d` representative is upper triangular with positive diagonal `h_1,...,h_d` and, in column `j`, exactly `j-1` entries above the pivot, each independently chosen from `0,...,h_j-1`.

Therefore for fixed diagonal tuple there are

`h_2 h_3^2 ... h_d^(d-1)`

canonical HNFs, and determinant/index is `h_1...h_d`. Define

`a_d(N)=sum_{h_1...h_d=N} h_2 h_3^2 ... h_d^(d-1)`.

Candidate theorem: `a_d(N)` is exactly the number of full-rank minimum-rank additive integer receiver classes of lattice index `N` under output-basis equivalence.

## Arithmetic factorization

Preregister the identity

`a_d = 1 * id * id^2 * ... * id^(d-1)`

under Dirichlet convolution. Hence `a_d` is multiplicative. Its formal Dirichlet generating series is

`sum_{N>=1} a_d(N) N^(-s) = product_{j=0}^{d-1} zeta(s-j)`

in the half-plane of absolute convergence, and prime-power local generating functions are

`sum_{k>=0} a_d(p^k) t^k = product_{j=0}^{d-1} (1-p^j t)^(-1)`.

These are arithmetic consequences of the finite HNF count, not analytic continuation claims.

## Frozen Atlas profiles

Atlas support dimension is `d_n=2^n-1`. For `n=1,2,3`, hence `d=1,3,7`, preregister the exact orbit counts for indices `N=1..8`:

```text
d=1: 1, 1, 1, 1, 1, 1, 1, 1
d=3: 1, 7, 13, 35, 31, 91, 57, 155
d=7: 1, 127, 1093, 10795, 19531, 138811, 137257, 788035
```

## Hostile obligations

1. Independently brute-enumerate all row-HNF representatives for `d=1..3`, `N=1..8`, and match the factorization formula exactly.
2. Verify multiplicativity on all coprime pairs `m,n<=12` for `d=1..5`.
3. Verify non-complete multiplicativity by requiring `a_2(4)=7 != a_2(2)^2=9`.
4. Verify prime-power coefficients by dynamic expansion of `product_{j=0}^{d-1}(1-p^j t)^(-1)` for selected `p∈{2,3,5}`, `d=1..5`, `k=0..4`.
5. Keep the distinction `ORBIT_COUNT != RECEIVER_COUNT`: each HNF class contains infinitely many raw matrices under left `GL_d(Z)` action.

## Candidate bounded 𝄐

`AFTER_HNF_CANONICAL_CLASSIFICATION, THE_NUMBER_A_D_OF_N_OF_MINIMUM_RANK_ADDITIVE_INTEGER_RECEIVER_OUTPUT_BASIS_CLASSES_AT_LATTICE_INDEX_N_IS_THE_FINITE_HNF_CENSUS_SUM_OVER_H_1_THROUGH_H_D_WITH_PRODUCT_N_OF_H_2_H_3_SQUARED_THROUGH_H_D_TO_THE_D_MINUS_1; EQUIVALENTLY_A_D_EQUALS_THE_DIRICHLET_CONVOLUTION_1_STAR_ID_STAR_ID_SQUARED_THROUGH_ID_TO_THE_D_MINUS_1, SO_THE_ORBIT_COUNT_IS_MULTIPLICATIVE_AND_HAS_FORMAL_DIRICHLET_SERIES_PRODUCT_J_0_TO_D_MINUS_1_ZETA_OF_S_MINUS_J. THIS_COUNTS_OUTPUT_BASIS_ORBITS, NOT_RAW_RECEIVER_MATRICES, AND_ASSERTS_NO_ANALYTIC_CONTINUATION_OR_SHANNON_MEANING.`

## Mandatory membranes

`HNF_ORBIT_COUNT != RAW_RECEIVER_COUNT`  
`MULTIPLICATIVE != COMPLETELY_MULTIPLICATIVE`  
`FORMAL_DIRICHLET_FACTOR != ANALYTIC_CONTINUATION_CLAIM`  
`SUBLATTICE_INDEX != SHANNON_INFORMATION`  
`OUTPUT_BASIS_ORBIT_CENSUS != INPUT_SUPPORT_RELABELING_CENSUS`  
`ARITHMETIC_CENSUS != PHYSICAL_SENSOR_MULTIPLICITY`  
`METALLURGICAL_REFINEMENT_METAPHOR != ARITHMETIC_PROOF`  
`SUCCESSFUL_EXACT_HEAD_GREEN != MERGE_AUTHORITY`

If RED, authority remains exact earned #954. No merge/deploy/release/publication/production/Vercel/live Ash-Loom/Proto-Loom/A16 authority.

Sealed ⟐