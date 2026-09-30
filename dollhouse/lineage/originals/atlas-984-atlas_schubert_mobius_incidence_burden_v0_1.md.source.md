󐘓 U+10D613

𝌋‌⟐

# A15-R0 · Atlas Schubert Möbius Incidence Inversion · Burden v0.1

Status: **FROZEN PREIMPLEMENTATION BURDEN / THEOREM UNEARNED**.

Exact scientific parent:
`#966 / f083e506f2a16f1d98b3af9a9b963d65694efc47 / run 2441 / 33574828910 SUCCESS`.

## Required formal census

Across the exact inherited window `d=1..7`, `k=0..5`, execute:

- `42` formal `(d,k)` cells;
- `376467` ordered weak-composition pairs;
- `113828` ordered comparable / closure-incidence pairs;
- exact rank-gap identity checks on every comparable pair;
- candidate Boolean-prefix / Boolean-pivot support checks on every comparable pair;
- independent defining-recurrence Möbius computation on every comparable pair;
- exact candidate-versus-recursive coefficient comparison on every comparable pair.

Frozen expected result:

```text
nonzero Möbius incidences   9912
mu = +1 incidences          4977
mu = -1 incidences          4935
mu = 0 comparable         103916
formula/recurrence mismatch    0
rank-gap identity failures      0
```

The zero mass is part of the burden, not discarded background:

```text
MOBIUS_ZERO != UNTESTED_INTERVAL
```

## Three-way support equivalence

For every comparable pair `lower <= upper`, require exact agreement among:

1. Boolean proper-prefix gaps plus Boolean pivot displacements;
2. antichain / rook-strip difference under the finite rectangle partition translation;
3. nonzero coefficient from independent defining recurrence.

The recurrence is authoritative for the hostile comparison and may not invoke the candidate support law internally.

## Required exact identities

With

```text
Delta_j = prefix_j(lower)-prefix_j(upper)
rho_r   = pivot_r(upper)-pivot_r(lower)
```

require:

```text
rank_gap = m(upper)-m(lower)
         = sum_j Delta_j
         = sum_r rho_r.
```

When every `Delta_j` and `rho_r` lies in `{0,1}`, require

```text
mu(lower,upper)=(-1)^rank_gap.
```

Otherwise require

```text
mu(lower,upper)=0.
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

## Hostile controls

- rank-two antichain interval: `(1,1,0) <= (0,1,1)` gives `mu=+1`;
- column-collision interval: `(2,0,0) <= (0,2,0)` gives `mu=0`;
- row-collision interval: `(2,0,0) <= (1,0,1)` gives `mu=0`;
- rank-three antichain interval: `(1,1,1,0) <= (0,1,1,1)` gives `mu=-1`;
- every proper cover gives `mu=-1`;
- at least one non-cover interval has nonzero Möbius coefficient;
- at least one comparable rank-two interval has zero Möbius coefficient.

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

Expected failures: `0`.

Sealed ⟐
