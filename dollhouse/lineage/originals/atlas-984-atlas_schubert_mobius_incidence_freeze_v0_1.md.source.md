󐘓 U+10D613

𝌋‌⟐

# A15-R0 · Atlas Schubert Möbius Incidence Inversion · Freeze v0.1

Status: **FROZEN CANDIDATE / THEOREM UNEARNED PENDING EXACT-HEAD CONSOLIDATED WITNESS / DRAFT / OPEN / UNMERGED**.

Exact earned scientific parent:

```text
#966
f083e506f2a16f1d98b3af9a9b963d65694efc47
TD613 Consolidated Validation 2441 / 33574828910 — SUCCESS
A15-R0 step 19 — SUCCESS
aggregate — SUCCESS
CLOSED / UNMERGED
```

This is commit 8 of exactly 8 successor commits from the earned #966 head. Freeze after this commit pending exact-head constitutional witness.

## Frozen higher-incidence surface

Fix the ordered Atlas support coordinates and standard reverse-RREF flag inherited through #960, #963, and #966.

For weak compositions `e,f` of `k` into `d` parts with

```text
C_f subset closure(C_e),
```

define

```text
Delta_j = prefix_j(f)-prefix_j(e) >= 0, j<d
rho_r   = pivot_r(e)-pivot_r(f) >= 0, r=1,...,k.
```

The exact rank gap satisfies

```text
m(e)-m(f)=sum_j Delta_j=sum_r rho_r.
```

Under the finite rectangle translation

```text
lambda(e)=((d-1)^e_d,(d-2)^e_(d-1),...,1^e_2,0^e_1),
```

closure inclusion is exactly partition containment inside the `k x (d-1)` rectangle.

## Frozen candidate Möbius law

The defining-recursion Möbius coefficient of the earned closure poset is candidate-exactly

```text
mu(f,e)=(-1)^(m(e)-m(f))
```

iff both coordinate gap systems are Boolean:

```text
Delta_j in {0,1} for every j<d
and
rho_r in {0,1} for every r.
```

Otherwise

```text
mu(f,e)=0.
```

Equivalently, the finite rectangle skew difference `lambda(e)/lambda(f)` is a grid antichain / rook strip: at most one added box in each row and each column.

Thus the prefix coordinates expose the column obstruction while the pivot coordinates expose the row obstruction. Neither coordinate family alone characterizes the Möbius support.

```text
PREFIX_BOOLEAN_ALONE != MOBIUS_SUPPORT
PIVOT_BOOLEAN_ALONE != MOBIUS_SUPPORT
PREFIX_BOOLEAN_AND_PIVOT_BOOLEAN = CANDIDATE_MOBIUS_SUPPORT
```

## Frozen exact burden

Across `d=1..7`, `k=0..5`:

```text
formal cells                         42
ordered weak-composition pairs   376467
ordered comparable intervals     113828
nonzero Möbius incidences           9912
mu=+1 incidences                     4977
mu=-1 incidences                     4935
mu=0 comparable intervals          103916
recursive/formula mismatches            0
rank-gap identity failures              0
partition-order failures                0
rook-support failures                   0
cover-coefficient failures              0
```

Hence only `9912 / 113828` comparable intervals carry nonzero inverse weight on this frozen window; `103916 / 113828` comparable intervals vanish under Möbius inversion. The exact counts are authoritative only for the declared finite window.

## Independent executable witness

The canonical implementation contains a defining-recurrence table generated from the earned closure relation rather than from the candidate formula.

The hostile test independently rebuilds a second recurrence table from the closure predicate and rank ordering. It does not call the candidate gap, rook-strip, partition, or canonical-recursion machinery to generate coefficients.

Both recurrences are required to agree with the frozen candidate formula on all `113828` comparable intervals.

```text
INDEPENDENT_RECURSION != CANDIDATE_CLOSED_FORM
ONE_IMPLEMENTATION_AGREEMENT != INDEPENDENT_WITNESS
```

## Frozen anchor

At `d=7,k=3`:

```text
labels               84
closure incidences 2520
nonzero mu           377
mu=+1                189
mu=-1                188
```

## Hostile witnesses

```text
(1,1,0) <= (0,1,1)   rank gap 2   mu=+1   non-cover / rook-strip
(2,0,0) <= (0,2,0)   rank gap 2   mu=0    column collision
(2,0,0) <= (1,0,1)   rank gap 2   mu=0    row collision
(1,1,1,0) <= (0,1,1,1) rank gap 3 mu=-1  three-cell rook-strip
```

Every earned upward cover must have coefficient `-1`, while non-cover intervals can carry nonzero coefficients. Comparability by itself carries no nonzero-inversion guarantee.

## Frozen candidate 𝄐

`AFTER_FIXING_THE_ORDERED_ATLAS_SUPPORT_COORDINATES_AND_STANDARD_REVERSE_RREF_FLAG_THE_EARNED_ATLAS_SCHUBERT_CLOSURE_POSET_SUPPORTS_A_SPARSE_EXACT_MOBIUS_INVERSION_CANDIDATE: FOR_EVERY_COMPARABLE_INTERVAL_F_LEQ_E_THE_RANK_GAP_EQUALS_BOTH_THE_SUM_OF_PROPER_PREFIX_GAPS_AND_THE_SUM_OF_PIVOT_DISPLACEMENTS; THE_MOBIUS_COEFFICIENT_IS_NONZERO_IF_AND_ONLY_IF_EVERY_PREFIX_GAP_AND_EVERY_PIVOT_DISPLACEMENT_IS_BOOLEAN_EQUIVALENTLY_THE_FINITE_RECTANGLE_SKEW_DIFFERENCE_IS_A_ROOK_STRIP_AND_ON_THAT_SUPPORT_MU_F_E_EQUALS_MINUS_ONE_TO_THE_RANK_GAP_OTHERWISE_IT_VANISHES. TWO_INDEPENDENT_DEFINING_RECURRENCE_IMPLEMENTATIONS_AGREE_WITH_THE_CLOSED_FORM_ON_THE_FROZEN_EXACT_WINDOW. THIS_IS_FIXED_FLAG_FINITE_INCIDENCE_INVERSION_NOT_BASIS_FREE_CANONICAL_GEOMETRY_CAUSAL_REVERSAL_PROBABILITY_WEIGHT_PHYSICAL_ORIENTATION_OR_RUNTIME_SCHEDULING.`

## Mandatory membranes

```text
CLOSURE_POSET != MOBIUS_INCIDENCE_ALGEBRA
MOBIUS_NONZERO != COVER_RELATION
COMPARABILITY != MOBIUS_NONZERO
RANK_DIFFERENCE != MOBIUS_MAGNITUDE
MOBIUS_ZERO != UNTESTED_INTERVAL
MOBIUS_COEFFICIENT != PROBABILITY_WEIGHT
MOBIUS_SIGN != PHYSICAL_ORIENTATION
INCIDENCE_INVERSION != CAUSAL_REVERSAL
FINITE_DISTRIBUTIVE_LATTICE_MODEL != BASIS_FREE_CANONICAL_GEOMETRY
RECTANGLE_PARTITION_LABEL != PHYSICAL_SHAPE
ROOK_STRIP_CRITERION != SPATIAL_OCCLUSION_RULE
ORDER_ISOMORPHISM != FUNCTORIAL_EQUIVALENCE
FINITE_CONTROLS != ASYMPTOTIC_GEOMETRY
SUCCESSFUL_EXACT_HEAD_GREEN != MERGE_AUTHORITY
ATLAS_REGISTRATION != LIVE_RUNTIME_STATE
```

Inherited #966 membranes remain in force.

No merge, deploy, release, publication, production, Vercel, physical geometry, continuum geometry, causal-order, or live-runtime authority follows.

**CANDIDATE ONLY UNTIL EXACT-HEAD GREEN.**

Sealed ⟐
