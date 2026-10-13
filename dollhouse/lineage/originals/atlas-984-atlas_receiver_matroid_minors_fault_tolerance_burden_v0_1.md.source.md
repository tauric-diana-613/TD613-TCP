# A15-R0 · Atlas Receiver Matroid Minors / Fault Tolerance — Frozen Burden v0.1

Parent: exact earned #926 head `431898a8bc7f14c466f401d71dfe20feaaf7c447`.

This burden is frozen before implementation.

## Parent inheritance

The child may consume the earned D/Q rank tables and exact matroid classifications from #926. It must not replace those tables with hand-written formulas as its source of truth.

Required parent identities:

```text
D type = U_1_2_PLUS_TWO_LOOPS
Q type = U_2_3_PLUS_ONE_LOOP
D full rank = 1
Q full rank = 2
D bases = [2,4]
Q bases = [3,5,6]
D loops = [0,3]
Q loops = [3]
```

## Deletion census burden

For each parent and every deletion mask `F in [0,15]`, compute

```text
r(E\F)
```

from the earned rank table.

Exact burden:

```text
16 D deletion masks
16 Q deletion masks
32 total deletion masks
```

The implementation must derive, not inject:

- rank-preserving masks;
- rank-destroying masks;
- size frequencies;
- minimum rank-destroying size;
- minimal rank-destroying masks / cocircuits;
- all single-coordinate deletion ranks;
- coloop indices.

A coordinate is a coloop in this chamber iff deleting it lowers the parent full rank.

## Minimality / cocircuit burden

For every rank-destroying deletion mask, test every proper submask for rank preservation. The minimal fatal masks are registered as cocircuits only after this exhaustive finite minimality test.

Frozen targets:

```text
D cocircuits [6]
Q cocircuits [3,5,6]
```

No cocircuit may be inferred merely by complementing a named hyperplane without checking the parent rank table.

## Single-element minor construction

For each parent `M` and element `e`, derive a rank table on a local three-element ground set corresponding to the original elements other than `e`.

Deletion:

```text
r_{M\e}(S)=r_M(S)
```

Contraction:

```text
r_{M/e}(S)=r_M(S∪{e})-r_M({e}).
```

Exact totals:

```text
2 parents * 4 elements * 2 operations = 16 minor tables
8 subsets per minor = 128 minor rank values
```

## Minor rank-axiom audit

Each of the 16 derived minor rank tables must pass independently:

1. normalization `r(empty)=0`;
2. upper bound `0 <= r(S) <= |S|`;
3. monotonicity for all ordered subset pairs with inclusion premise;
4. submodularity for all ordered subset pairs.

Frozen combined counts:

```text
normalization checks = 16
rank upper-bound checks = 128
monotonicity candidate ordered pairs = 1024
monotonicity inclusion premises = 432
submodularity ordered pairs = 1024
all failures = 0
```

The `432` inclusion premises follow from `16 * 3^3 = 432` ordered pairs `(A,B)` with `A subseteq B` on a three-element ground set.

## Minor combinatorics and type classification

For each minor derive from its local rank table:

- full rank;
- independent masks;
- basis masks;
- circuit masks;
- loop indices;
- coloop indices.

Only then classify among the preregistered finite types:

```text
U_0_3
U_1_1_PLUS_TWO_LOOPS
U_1_2_PLUS_ONE_LOOP
U_2_2_PLUS_ONE_LOOP
U_2_3
```

Expected type frequencies:

```text
D deletion:
  U_1_2_PLUS_ONE_LOOP: 2
  U_1_1_PLUS_TWO_LOOPS: 2

D contraction:
  U_1_2_PLUS_ONE_LOOP: 2
  U_0_3: 2

Q deletion:
  U_2_3: 1
  U_2_2_PLUS_ONE_LOOP: 3

Q contraction:
  U_2_3: 1
  U_1_2_PLUS_ONE_LOOP: 3
```

## Isomorphism burden

Implement finite rank-table isomorphism on three-element minors by exhausting all six permutations of the local ground set.

Required bridge obligations:

```text
for each Q nonloop e in {0,1,2}
for each D loop ell in {0,3}
Q/e must be isomorphic to D\ell and D/ell
```

There are exactly six `(e,ell)` pairs.

The theorem does NOT claim literal equality of labeled rank tables, and it does NOT claim `Q/e ~= D`.

## Negative controls

The chamber must reject these stronger statements:

```text
Q/e ~= D                    false by ground-set cardinality
all deletion sets preserve rank    false
D and Q have same cocircuit family false
D and Q have same deletion enumerator false
D nonloop contraction preserves positive residual rank false
matroid deletion = physical sensor failure false
matroid contraction = causal intervention false
```

## Frozen theorem gate

`passed=true` only if every exact target, count, rank axiom, minor type frequency, cocircuit minimality result, six bridge obligations, and membrane is satisfied on the same certificate.

Sealed ⟐
