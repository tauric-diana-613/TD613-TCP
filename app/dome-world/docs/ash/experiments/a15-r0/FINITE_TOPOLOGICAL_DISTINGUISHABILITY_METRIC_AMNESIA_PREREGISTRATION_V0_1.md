# A15-R0 · Finite Topological Distinguishability Metric / Non-Liftable Isometry Amnesia

Status: **PREREGISTRATION ONLY / THEOREM UNEARNED / NO IMPLEMENTATION YET**.

𝌋‌⟐

## Exact scientific parent

```text
#878 / 4ba3542aea8784586562032c57096248dc961db9
TD613 Consolidated Validation run 2387 / 33282971967 — SUCCESS
```

#879 is witness-routing only and carries zero theorem ancestry.

The successor branch is cut directly from the exact earned #878 receipt.

## Scientific question

Let `X={A,B,T,M,R}` be the five earned task roles and let `P` be the ten nontrivial open-set membership probes inherited from #878.

For any selected probe family `F subseteq P`, define the finite membership signature

```text
sigma_F(x) = (1_U(x))_{U in F}
```

and the finite separator-count distance

```text
d_F(x,y) = |{U in F : 1_U(x) != 1_U(y)}|.
```

This chamber asks four bounded questions.

1. Does `d_F` form a pseudometric for every selected family, and become a metric exactly when `F` identifies all five roles?
2. Is #878's exact arbitrary-`e` erasure criterion equivalent to the metric statement `min_{x!=y} d_F(x,y) >= e+1`?
3. For the full ten-probe atlas, what structural information is lost when the complete labelled incidence atlas is replaced by the pairwise distance matrix alone?
4. Across all 795 exact observer families, how often does the induced metric acquire role permutations that do not lift to automorphisms of the selected labelled probe incidence family?

The chamber is finite. It does not claim Shannon coding capacity, a stochastic channel model, physical geometry, continuum topology, semantic identity, or source-state reconstruction.

## Frozen probe universe

Use the preregistered #878 deterministic presentation order only as a finite enumeration coordinate:

```text
RTAM, BRTM, RTM, BRM, BRT, RM, RT, BR, M, R
```

Inherited probe-universe identity must be checked setwise before that presentation order is used.

```text
PROBE_UNIVERSE_IDENTITY != PROBE_ENUMERATION_ORDER
```

## Frozen full-atlas separator matrix

For the full ten-probe atlas, the exact pairwise separator counts are preregistered as:

```text
        A  B  T  M  R
A       0  5  4  5  8
B       5  0  5  6  5
T       4  5  0  5  4
M       5  6  5  0  5
R       8  5  4  5  0
```

Therefore:

```text
minimum positive distance = 4
maximum distance / diameter = 8
```

Sorted off-diagonal point-distance profiles:

```text
A -> 4,5,5,8
B -> 5,5,5,6
T -> 4,4,5,5
M -> 5,5,5,6
R -> 4,5,5,8
```

Frozen distance-profile partition:

```text
{A,R} | {B,M} | {T}
```

For all 60 ordered triples of distinct roles, triangle slack

```text
d(x,y)+d(y,z)-d(x,z)
```

has exact spectrum:

```text
0 -> 2
2 -> 4
4 -> 22
6 -> 20
8 -> 12
```

The only zero-slack ordered triples are:

```text
A -> T -> R : 4 + 4 = 8
R -> T -> A : 4 + 4 = 8
```

## Frozen full-atlas metric-isometry result

Enumerate all `5! = 120` role permutations and retain exactly those preserving the full pairwise distance matrix.

Expected full-atlas metric isometry group:

```text
size = 4
identity
(A R)
(B M)
(A R)(B M)
```

`T` is fixed by every full-atlas metric isometry.

By the already-earned #874 topology-rigidity result, the full task topology has exactly one preserving role automorphism: identity.

The successor must independently reconstruct the full labelled probe-incidence automorphism count from the ten-probe family and obtain:

```text
full-atlas labelled-incidence automorphisms = 1
full-atlas metric isometries = 4
non-liftable full-atlas metric isometries = 3
```

Candidate bounded consequence:

```text
FULL_PAIRWISE_DISTINGUISHABILITY_METRIC != FULL_LABELLED_PROBE_INCIDENCE_STRUCTURE
METRIC_ISOMETRY != TOPOLOGICAL_AUTOMORPHISM
```

## Frozen 1,024-family metric census

Enumerate all `2^10=1,024` selected probe families.

The #878 role-class spectrum must be independently recovered:

```text
1 role class ->   1 family
2 role classes -> 10 families
3 role classes -> 44 families
4 role classes -> 174 families
5 role classes -> 795 families
```

The successor must prove family-by-family:

```text
F exactly identifies all five roles
IFF
sigma_F is injective
IFF
d_F is a metric on the five roles.
```

Thus the exact metric-family count is frozen at:

```text
795 / 1,024
```

## Frozen metric-isometry spectrum over all 795 exact families

For each exact family, enumerate all 120 role permutations and count metric isometries.

Expected spectrum:

```text
isometry-group size  1 -> 372 exact families
isometry-group size  2 -> 360 exact families
isometry-group size  4 ->  40 exact families
isometry-group size  6 ->  10 exact families
isometry-group size  8 ->   8 exact families
isometry-group size 12 ->   4 exact families
isometry-group size 24 ->   1 exact family
TOTAL                     795
```

## Frozen labelled-incidence lift census

For each exact family `F`, call a role permutation a labelled-incidence-family automorphism when its action on role membership maps the selected family of probe subsets to itself as a set.

The exact joint spectrum `(metric isometries, incidence automorphisms) -> family count` is preregistered as:

```text
(1,1)   -> 372
(2,1)   -> 192
(2,2)   -> 168
(4,1)   ->   9
(4,2)   ->  21
(4,4)   ->  10
(6,2)   ->   2
(6,6)   ->   8
(8,1)   ->   2
(8,2)   ->   5
(8,4)   ->   1
(12,6)  ->   4
(24,4)  ->   1
TOTAL   -> 795
```

Frozen derived totals:

```text
exact families with metric isometry count = incidence automorphism count : 558
exact families with extra non-liftable metric symmetries                 : 237
```

No claim is made that these groups are coding-theoretic symmetry groups or physical isometry groups.

## Frozen maximum-metric-symmetry control

There is exactly one exact selected family with 24 metric isometries:

```text
F_star = {RTAM, BRTM, M, R}
```

Its role signatures in that presentation order are:

```text
A -> 1000
B -> 0100
T -> 1100
M -> 1110
R -> 1101
```

Its pairwise metric is the five-vertex star metric:

```text
T is distance 1 from each of A,B,M,R
A,B,M,R are pairwise distance 2
```

Hence:

```text
metric isometries = 24
labelled-incidence-family automorphisms = 4
non-liftable metric isometries = 20
```

The 24 metric isometries are the full permutations of the four leaves with `T` fixed. The four incidence automorphisms are generated by independent swaps `A<->B` and `M<->R`.

This control must remain exactly identifying: five distinct membership signatures. It demonstrates that exact role distinguishability under the selected probes does not make pairwise-distance geometry a complete structural identity invariant.

## Frozen erasure/metric equivalence

For every selected family `F` and each declared erasure order `e=0..4` for which exact `e`-deletions exist, the successor must independently compare:

```text
every exact-e deletion remains a five-role metric
IFF
min_{x!=y} d_F(x,y) >= e+1.
```

The expected family/order comparison count remains #878's:

```text
4,876 comparisons
0 mismatches
```

The full exact deletion-case burden remains:

```text
e0  1,024
e1  5,120
e2 11,520
e3 15,360
e4 13,440
TOTAL 46,464
```

## Claim ceiling

If every frozen target survives independent hostile reconstruction and exact-head validation, the strongest allowed bounded claims are:

```text
FOR_EVERY_SELECTED_PROBE_FAMILY_IN_THE_FIXED_TEN_PROBE_ATLAS_SEPARATOR_COUNT_DEFINES_A_FINITE_PSEUDOMETRIC_AND_IT_IS_A_METRIC_EXACTLY_FOR_THE_795_FAMILIES_THAT_IDENTIFY_ALL_FIVE_ROLES

EXACT_E_ERASURE_ROBUST_ROLE_IDENTIFICATION_IS_EQUIVALENT_TO_MINIMUM_SELECTED_SEPARATOR_DISTANCE_AT_LEAST_E_PLUS_ONE_FOR_E_ZERO_THROUGH_FOUR_IN_THE_FIXED_FINITE_ATLAS

THE_FULL_TEN_PROBE_DISTINGUISHABILITY_METRIC_HAS_FOUR_ROLE_ISOMETRIES_WHILE_THE_FULL_LABELLED_TASK_TOPOLOGY_HAS_ONLY_THE_IDENTITY_AUTOMORPHISM_SO_THREE_FULL_METRIC_ISOMETRIES_DO_NOT_LIFT_TO_TOPOLOGICAL_AUTOMORPHISMS

ACROSS_THE_795_EXACT_OBSERVER_FAMILIES_237_HAVE_STRICTLY_MORE_METRIC_ISOMETRIES_THAN_LABELLED_INCIDENCE_AUTOMORPHISMS_AND_ONE_EXACT_FOUR_PROBE_FAMILY_HAS_24_METRIC_ISOMETRIES_BUT_ONLY_FOUR_INCIDENCE_AUTOMORPHISMS
```

## Mandatory scars

```text
SEPARATOR_COUNT_METRIC != PHYSICAL_GEOMETRY
FINITE_HAMMING_FORM != CHANNEL_CODING_THEOREM
PAIRWISE_DISTANCE_MATRIX != LABELLED_PROBE_INCIDENCE
METRIC_ISOMETRY != TOPOLOGICAL_AUTOMORPHISM
METRIC_ISOMETRY != SEMANTIC_ROLE_IDENTITY
EXACT_DISTINGUISHABILITY != STRUCTURAL_IDENTITY_RECOVERY
DISTANCE_PROFILE_ALIASING != ROLE_IDENTITY
NON_LIFTABLE_METRIC_SYMMETRY != HIDDEN_PHYSICAL_SYMMETRY
PSEUDOMETRIC_COLLAPSE != SOURCE_STATE_COLLAPSE
MINIMUM_SEPARATOR_DISTANCE != SHANNON_CAPACITY
MINIMUM_SEPARATOR_DISTANCE != MINIMUM_BIT_LENGTH
FINITE_ERASURE_METRIC_EQUIVALENCE != ERROR_CORRECTION_CAPACITY
LABELLED_INCIDENCE_AUTOMORPHISM != SCIENTIFIC_ANCESTRY
WITNESS_ROUTING != SCIENTIFIC_ANCESTRY
```

No merge. No deployment. No publication. No production. No release. No Vercel. No source-state mutation. No Proto-Loom/A16. No #788 promotion.

**PREREGISTERED. THEOREM UNEARNED.**

Sealed ⟐