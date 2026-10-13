󐘓 U+10D613

𝌋‌⟐

# A15-R0 · Atlas Schubert Closure-Poset Correspondence · Burden v0.1

Parent: exact earned #963 / `d19d4f8d48c10df624f9c0574aeee9c687cfb4af`.

## Derived orientation to freeze

Under the exact #960 stars-and-bars convention

`w_e = 1^e1 0 1^e2 0 ... 0 1^ed`,

let `E_j=sum_(a=1)^j e_a`. If `C_e` denotes the fixed-standard-flag reverse-RREF Schubert cell, then the candidate closure predicate is

`C_f subset closure(C_e)  <=>  F_j >= E_j for every j=1,...,d-1`.

Equivalently, if `I(e)=(i_1<...<i_k)` and `I(f)=(j_1<...<j_k)` are the exact reverse-RREF pivot positions, then

`C_f subset closure(C_e)  <=>  j_r <= i_r for every r`.

The inequality orientation follows mechanically because row `r` has exactly `i_r-r` allowed pre-pivot nonpivot coordinates, so moving one pivot one slot right raises the earned cell dimension by one. No remembered Bruhat inequality may substitute for this derivation.

## Required executable claims

1. Reproduce the exact #960 weak-composition -> pivot-word convention and its pivot subset.
2. Require exact equivalence between componentwise pivot order and reverse prefix dominance on every weak-composition pair in the frozen formal window `d=1..7`, `k=0..5`.
3. Independently enumerate finite reverse-RREF Grassmannian points for the inherited 28 `(p,d,k)` cells (`p=2,d=1..4,k=0..3`; `p=3,d=1..3,k=0..3`).
4. Test closure membership by standard-prefix-flag rank incidence, using exact finite-field Gaussian elimination on suffix projections rather than generating the relation from the Atlas predicate.
5. Require rank-incidence membership to agree with reverse prefix dominance on every independently enumerated point/candidate-closure pair.
6. Require the direct cover predicate to be exactly one adjacent unit move `j -> j+1` and to raise `m(e)` by exactly one.
7. Require every comparable pair of dimension difference one to satisfy that direct cover predicate, and reject comparable non-cover pairs with larger rank gap.
8. Preserve explicit equal-dimension incomparability: `(0,2,0)` versus `(1,0,1)`, both dimension 2.
9. Preserve explicit dimension-inequality incomparability: `(0,3,0)` has dimension 3 while `(2,0,1)` has dimension 2, yet their cumulative profiles cross.
10. Preserve an explicit non-cover comparable pair, e.g. `(0,0,2)` above `(2,0,0)` at `d=3,k=2`.
11. Freeze the deterministic `d=7,k=3` anchor: 84 labels, rank 18, 2520 ordered closure incidences including reflexive pairs, and 168 upward covers.
12. Preserve every inherited anti-overclaim membrane and add the closure-poset membranes below.

## Frozen burden counts

- 42 formal `(d,k)` cells over `d=1..7`, `k=0..5`;
- 376467 ordered weak-composition-pair controls;
- 113828 ordered closure incidences in that window;
- 3829 upward cover incidences in that window;
- 28 independent finite-field cells;
- 3210 independently enumerated reverse-RREF Grassmannian points;
- 44517 independent rank-incidence closure checks;
- zero expected failures.

## Mandatory membranes

`CELL_DECOMPOSITION != BRUHAT_CLOSURE_ORDER`
`CELL_DIMENSION_EQUALITY != BRUHAT_COMPARABILITY`
`CELL_DIMENSION_INEQUALITY != BRUHAT_COMPARABILITY`
`BRUHAT_COMPARABILITY != COVER_RELATION`
`WEAK_COMPOSITION_LABEL != ATLAS_SUPPORT_STRATUM`
`FIXED_FLAG_CLOSURE_POSET != BASIS_FREE_CANONICAL_GEOMETRY`
`STANDARD_FLAG_DEPENDENCE != CANONICALITY`
`FINITE_SCHUBERT_POSET != PHYSICAL_CAUSAL_ORDER`
`FORMAL_POSET != RUNTIME_SCHEDULER`
`ORDER_ISOMORPHISM != FUNCTORIAL_EQUIVALENCE`
`FINITE_CONTROLS != ASYMPTOTIC_GEOMETRY`
`SUCCESSFUL_EXACT_HEAD_GREEN != MERGE_AUTHORITY`

Expected failures: `0`.

Sealed ⟐
