# A15-R0 · Atlas Schubert Graded Cell Decomposition · Burden v0.1

Parent: exact earned #960 / `0372405b055bcdff990f715cc65eed9354b2a4a0`.

## Mathematical burden

For every weak composition `e=(e_1,...,e_d)` of `k`, the row-HNF diagonal is fixed as `p^(e_j)`. In column `j`, each earlier row `r<j` admits one residue modulo `p^(e_j)`. Writing that residue in base `p` produces exactly `e_j` field digits. There are `j-1` earlier rows, so column `j` contributes `(j-1)e_j` independent digits. Thus

`m(e)=sum_(j=1)^d (j-1)e_j`.

The #960 pivot word places each of those digits into one free nonpivot coordinate to the left of the corresponding reverse-RREF pivot. Hence the fixed-`e` image is precisely an affine reverse-RREF Schubert cell of dimension `m(e)` under the fixed standard flag.

The formal stratum enumerator is

`P_(d,k)(q)=sum_(e_1+...+e_d=k) q^(sum_(j=1)^d (j-1)e_j)`.

Its generating function in `t` is

`sum_(k>=0) P_(d,k)(q)t^k = product_(j=0)^(d-1) (1-q^j t)^(-1)`.

Equivalently the finite recurrence is

`P_(d,k)(q)=P_(d-1,k)(q)+q^(d-1)P_(d,k-1)(q)`

with `P_(d,0)=1` and `P_(1,k)=1`; therefore `P_(d,k)(q)=GaussianBinomial(d+k-1,k;q)` as a polynomial in the formal variable `q`.

## Executable burden

The implementation must independently:

1. enumerate weak compositions and construct the coefficient histogram of `m(e)`;
2. construct the Gaussian polynomial by recurrence and compare coefficient-for-coefficient on 42 `(d,k)` controls (`d=1..7,k=0..5`);
3. evaluate the coefficient polynomial at `p in {2,3,5,7}` and compare with the already-earned prime-power Gaussian value on 168 controls;
4. independently enumerate all HNF matrices in the 28 #960 finite cells, totaling 3210 matrices;
5. map each through #960, verify the exponent vector/pivot word, verify the reverse-RREF free-coordinate count equals `m(e)`, and verify each exponent stratum has cardinality `p^m(e)`;
6. verify no cross-stratum point-key collision;
7. verify the `d=7,k=3` coefficient histogram exactly equals `[1,1,2,3,4,5,7,7,8,8,8,7,7,5,4,3,2,1,1]`, has total 84 weak compositions, formal degree 18, and evaluates at `p=2` to `788035`.

## Hostile burden

- reject malformed exponent vectors (negative/noninteger/wrong length/sum mismatch);
- demonstrate fixed-standard-flag dependence with exponent vectors whose cell dimensions differ under coordinate reversal;
- demonstrate that formal polynomial evaluation at composite `q` is arithmetic evaluation only and carries no finite-field realization claim;
- keep `CELL_DECOMPOSITION != BRUHAT_CLOSURE_ORDER` explicit: no closure-poset theorem is preregistered here.

## Success criterion

Every preregistered control passes on the exact frozen head under TD613 Consolidated Validation. Any RED preserves #960 as authority until exact diagnosis and repair.

Sealed ⟐