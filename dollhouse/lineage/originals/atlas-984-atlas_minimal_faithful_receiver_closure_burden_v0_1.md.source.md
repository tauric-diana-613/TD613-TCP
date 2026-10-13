# A15-R0 · Atlas Minimal Faithful Receiver / Closure Geometry Burden

Frozen before implementation.

Parent: `#922 / b56e7bbea41e93bdc9f9d59e053be4733a1d5e41`.

## Complete subset surface

Enumerate all `2^4=16` subsets of the earned four-refinement family. Do not search only singleton/pair candidates and stop after a faithful receiver is found.

For every subset independently evaluate both native outer groups:

```text
D native group size = 2
Q native group size = 6
```

Required raw restricted-signature evaluations:

```text
16 * 2 = 32 D evaluations
16 * 6 = 96 Q evaluations
128 total subset/group signature evaluations
```

For every subset compare every unordered pair of native actions for restricted-signature collision:

```text
D: 16 * C(2,2) = 16
Q: 16 * C(6,2) = 240
256 total signature-pair checks
```

## Exact receiver-class table

Mask bits index `(q0,q1,q2,q3)`.

```text
mask   D   Q
0      1   1
1      1   3
2      2   3
3      2   6
4      2   3
5      2   6
6      2   6
7      2   6
8      1   1
9      1   3
10     2   3
11     2   6
12     2   3
13     2   6
14     2   6
15     2   6
```

Required frequency profiles:

```text
D: {1:4, 2:12}
Q: {1:2, 3:6, 6:8}
```

## Pointwise stabilizer reconstruction

For every subset `S`, reconstruct

```text
Omega_(S)={g in Omega : g fixes every q in S}
```

and require

```text
receiver_class_count = |Omega| / |Omega_(S)|
```

for all 32 group/subset cases.

The pointwise stabilizer must be derived from the actual induced refinement permutations, not inferred from the expected class count.

## Closure reconstruction

For every subset and every refinement coordinate `q`, exhaustively inspect all ordered native-action pairs `(g,h)`.

A coordinate belongs to receiver closure iff every pair agreeing on `S` also agrees on that coordinate.

Required ordered-pair audit:

```text
D: 16 subsets * 4 coordinates * 2^2 ordered action pairs = 256
Q: 16 subsets * 4 coordinates * 6^2 ordered action pairs = 2304
2560 total closure ordered-pair checks
```

Independently compute the fixed set of the pointwise stabilizer and require

```text
cl_Omega(S)=Fix(Omega_(S))
```

for all 32 group/subset cases.

Required closure-size frequency:

```text
D: {2:4, 4:12}
Q: {1:2, 2:6, 4:8}
```

Exact empty closures:

```text
D: [q0,q3]
Q: [q3]
```

## Minimal faithful receiver search

Search all 16 subsets after the complete census has been built.

Faithful means restricted-signature class count equals native group size.

Required:

```text
D faithful subsets = 12
D minimum cardinality = 1
D inclusion-minimal/minimum masks = [2,4]

Q faithful subsets = 8
Q minimum cardinality = 2
Q inclusion-minimal/minimum masks = [3,5,6]
```

Negative controls:

```text
D singleton q0 -> 1 class
D singleton q3 -> 1 class
D singleton q1 -> 2 classes
D singleton q2 -> 2 classes

Q singleton q0 -> 3 classes
Q singleton q1 -> 3 classes
Q singleton q2 -> 3 classes
Q singleton q3 -> 1 class
Q pair {q0,q3} -> 3 classes
Q pair {q1,q3} -> 3 classes
Q pair {q2,q3} -> 3 classes
Q pairs {q0,q1},{q0,q2},{q1,q2} -> 6 classes
```

## Automorphism-level fiber lift

Use the earned parent lift multiplicity `4` per native outer element; do not re-enumerate 8! automorphism candidates in this descendant.

For every subset, multiply each outer restricted-signature fiber by four and require:

```text
D one outer class -> [8]
D two outer classes -> [4,4]

Q one outer class -> [24]
Q three outer classes -> [8,8,8]
Q six outer classes -> [4,4,4,4,4,4]
```

This is an inherited exact consequence of earned #920, not a new exhaustive automorphism census.

## Claim ceiling

GREEN supports a bounded finite receiver-base/closure result for the two declared native permutation actions. It does not establish a physical sensor minimum, Shannon capacity theorem, universal experimental-design optimum, source-provenance identifier, or general theorem equating this rank with #900 action-evaluation rank.

Sealed ⟐