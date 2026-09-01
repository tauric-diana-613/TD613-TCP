# A15-R0 · Atlas HNF Orbit Census · Execution Burden v0.1

Parent: exact earned #954 / `445f84887306be89cf2167f66fe26c3162daff18`.

## Formula burden

Implement exact BigInt `a_d(N)` from ordered positive factor tuples `(h_1,...,h_d)` with product `N`, weighted by `product_j h_j^(j-1)` in one-based notation.

Require exact profiles for `N=1..8`:

```text
d=1  1 1 1 1 1 1 1 1
d=2  1 3 4 7 6 12 8 15
d=3  1 7 13 35 31 91 57 155
d=7  1 127 1093 10795 19531 138811 137257 788035
```

## Independent HNF enumeration burden

Hostile code must independently enumerate canonical upper-triangular row-HNF matrices for `d=1..3`, `N=1..8` by:

1. enumerating ordered positive diagonal factorizations of `N`;
2. independently enumerating all allowed above-pivot residues `0<=H[i][j]<H[j][j]`;
3. counting the resulting matrices without calling the child formula.

Total enumerated canonical representatives across these 24 cells must equal `454`; every cell must match `a_d(N)`.

## Multiplicativity burden

Use the 46 unordered coprime pairs `1<=m<=n<=12` for each `d=1..5`. Require all 230 identities

`a_d(mn)=a_d(m)a_d(n)`.

Also require `a_2(4)=7` and `a_2(2)^2=9` to preserve `MULTIPLICATIVE != COMPLETELY_MULTIPLICATIVE`.

## Local-factor burden

For each `p∈{2,3,5}`, `d=1..5`, and `k=0..4`, independently compute the coefficient of `t^k` in

`product_{j=0}^{d-1}(1-p^j t)^(-1)`

by truncated dynamic multiplication and compare against `a_d(p^k)`. Total: 75 exact local-factor controls.

## Claim ceiling

The earned claim, if any, counts row-HNF/output-basis orbits of full-rank minimum-rank additive integer receivers. It does not count raw receiver matrices, quotient by input/support relabeling, arbitrary nonlinear encodings, physical sensors, or Shannon bits. The Dirichlet-series identity is asserted in its ordinary absolute-convergence domain and as a formal Euler/Dirichlet factorization; no analytic continuation, pole theorem, or asymptotic is preregistered.

Any mismatch is RED. Expectations remain frozen and may not be edited toward output.

Sealed ⟐