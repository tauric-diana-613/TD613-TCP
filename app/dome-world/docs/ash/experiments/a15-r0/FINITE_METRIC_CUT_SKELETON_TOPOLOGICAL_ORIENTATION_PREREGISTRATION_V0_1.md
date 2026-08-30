# A15-R0 · Finite Metric Cut-Skeleton Recovery / Topological-Orientation Nonidentifiability

Status: PREREGISTERED BEFORE IMPLEMENTATION. THEOREM UNEARNED.

## Exact scientific parent

```text
#880 / 29a8879571341d0ee68b14f3e52bef76005b438e
TD613 Consolidated Validation run 2388 / 33284398244 — SUCCESS
```

#881 is witness routing only and carries zero theorem ancestry.

## Fixed parent metric

Role order:

```text
A B T M R
```

Earned full ten-probe metric:

```text
        A  B  T  M  R
A       0  5  4  5  8
B       5  0  5  6  5
T       4  5  0  5  4
M       5  6  5  0  5
R       8  5  4  5  0
```

For a nontrivial unoriented cut `C={S,X\S}`, let `delta_C(x,y)=1` iff the cut separates `x,y`, else 0.

There are exactly `2^(5-1)-1 = 15` nontrivial unoriented cuts on the five labelled roles. Canonical cut names use the side containing `A`.

## Preregistered inversion distinction

The raw metric is **not** preregistered as having a unique nonnegative-integer cut decomposition.

Exhaustive bounded integer inversion must recover exactly five decompositions of `D` over the 15 unit cut semimetrics:

```text
I1  AB×2 + AT + AM×2 + ABT + ATM + ATR + ABTM
I2  AB×2 + AT×2 + AM×2 + ABTM×2 + ABTR + ATMR
I3  A + AB + AM + ABT×2 + ABM + ATM×2 + ATR
I4  A + AB + AT + AM + ABT + ABM + ATM + ABTM + ABTR + ATMR
I5  A×2 + ABT×2 + ABM×2 + ATM×2 + ABTR + ATMR
```

Total cut multiplicities are `9 / 10 / 9 / 10 / 10` respectively.

Therefore the raw metric alone does not identify a unique integer cut multiset.

## Parent-conditioned ten-distinct-unit cut recovery

#878/#880 already fix that the full atlas consists of ten **distinct** nontrivial open-set probes, each contributing one unit separation cut.

Under exactly that inherited constraint, exhaustive enumeration of all `2^15 = 32,768` distinct-unit cut subfamilies must yield exactly one decomposition of the full metric:

```text
CUT_ORDER =
A | AB | AT | AM | ABT | ABM | ATM | ABTM | ABTR | ATMR
```

Equivalently the unique ten-cut skeleton is:

```text
A|BTMR
AB|TMR
AT|BMR
AM|BTR
ABT|MR
ABM|TR
ATM|BR
ABTM|R
ABTR|M
ATMR|B
```

This is conditional finite recovery from `(metric + inherited ten-distinct-unit-probe constraint)`; it is not universal cut-cone uniqueness.

## Orientation census

Each of the ten recovered unoriented cuts has two orientations. Fix bit `0` for the canonical `A`-containing side and bit `1` for its complement, in `CUT_ORDER` above.

All `2^10 = 1,024` cut orientations must be tested by adjoining `EMPTY` and the full role set and checking pairwise finite union/intersection closure.

Exactly four orientations must form a 12-open-set topology:

```text
0000000001
0000000010
1111111101
1111111110  <- inherited #874/#880 topology
```

No other orientation is topological.

Each of the four compatible topologies must be verified as:

```text
12 open states
T0 = true
T1 = false
connected = true
clopen count = 2
finite Alexandrov = true
point-permutation automorphisms = 1
```

Their specialization-order transitive reductions must be:

```text
0000000001 : M<A, R<B, R<T, T<A
0000000010 : B<A, R<M, R<T, T<A
1111111101 : A<B, A<T, M<R, T<R
1111111110 : A<M, A<T, B<R, T<R
```

## Metric-isometry action on the orientation fibre

The full metric isometry group, independently re-enumerated over all `5! = 120` role permutations, must contain exactly four maps:

```text
id
(B M)
(A R)
(A R)(B M)
```

The group must map the set of four compatible topologies to itself.

Starting from the inherited topology `1111111110`:

```text
id              -> 1111111110
(B M)           -> 1111111101
(A R)           -> 0000000010
(A R)(B M)      -> 0000000001
```

Preregistered action law:

```text
FULL_METRIC_ISOMETRY_GROUP_ACTS_FREELY_AND_TRANSITIVELY_ON_THE_FOUR_COMPATIBLE_TOPOLOGICAL_ORIENTATIONS
```

Operationally this means:

```text
orbit size of inherited topology = 4
stabilizer size = 1
all four compatible topology orientations reached exactly once
```

## Candidate theorem

In this fixed finite fixture:

```text
RAW_METRIC != UNIQUE_INTEGER_CUT_DECOMPOSITION

METRIC + TEN_DISTINCT_UNIT_PROBE_PRIOR
-> UNIQUE_UNORIENTED_TEN_CUT_SKELETON

UNIQUE_UNORIENTED_CUT_SKELETON
!= UNIQUE_TOPOLOGICAL_ORIENTATION

FULL_METRIC_COMPATIBLE_TOPOLOGY_FIBRE_SIZE = 4

METRIC_ISOMETRY_GROUP_SIZE = 4
AND ITS ACTION ON THAT FIBRE IS FREE AND TRANSITIVE
```

Thus pairwise separator geometry can recover the inherited unoriented separator skeleton under an explicit structural prior while still failing to choose the directed specialization/topological orientation.

## Mandatory membranes

```text
RAW_METRIC_DECOMPOSITION != UNIQUE_CUT_SKELETON
INTEGER_CUT_DECOMPOSITION != REAL_CUT_CONE_UNIQUENESS
TEN_DISTINCT_UNIT_PROBE_PRIOR != METRIC_ONLY_INFORMATION
UNORIENTED_CUT != OPEN_SET
CUT_SKELETON_RECOVERY != TOPOLOGY_RECOVERY
TOPOLOGICAL_ORIENTATION != PHYSICAL_ORIENTATION
SPECIALIZATION_ORDER != CAUSAL_ORDER
METRIC_ISOMETRY_ACTION != PHYSICAL_DYNAMICS
FREE_TRANSITIVE_FINITE_ACTION != GAUGE_THEORY
ORIENTATION_FIBRE != HIDDEN_STATE_SPACE
FOUR_COMPATIBLE_TOPOLOGIES != UNIVERSAL_TOPOLOGY_NONIDENTIFIABILITY
FINITE_ALEXANDROV_TOPOLOGY != CONTINUUM_TOPOLOGY
SEPARATOR_COUNT_METRIC != PHYSICAL_GEOMETRY
WITNESS_ROUTING != SCIENTIFIC_ANCESTRY
```

No merge, deployment, publication, production, release, Vercel, source-state mutation, Proto-Loom/A16, #788 promotion, physical geometry, continuum topology, gauge theory, Shannon/channel coding, or universal inverse-problem theorem follows.

Sealed ⟐