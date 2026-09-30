󐘓 U+10D613

𝌋‌⟐

# A15-R0 · Atlas Schubert Möbius–Delannoy Path Correspondence · Freeze v0.1

Status: **FROZEN CANDIDATE / THEOREM UNEARNED PENDING EXACT-HEAD CONSOLIDATED WITNESS / DRAFT / OPEN / UNMERGED**.

Exact earned scientific parent:

```text
#969
776c6ef78011157d3458daf924bbb7cda7566785
TD613 Consolidated Validation 2444 / 33577536528 — SUCCESS
classifier 100084681091 — SUCCESS
static / constitutional / release 100084717359 — SUCCESS
A15-R0 step 19 — SUCCESS
downstream 20–30 — SUCCESS
aggregate — SUCCESS
CLOSED / UNMERGED
```

This is successor commit 9. Exactly eight A15-R0 paths differ from the earned parent. The extra commit depth records a pre-witness repair of an unused helper typo; the repaired executable theorem surface, preregistered counts, burden, and candidate law are unchanged.

```text
PRE_WITNESS_HELPER_REPAIR != RED_THEOREM_SCAR
COMMIT_DEPTH != CHANGED_PATH_COUNT
```

## Frozen path correspondence

Fix the ordered Atlas support coordinates and standard reverse-RREF flag inherited through #960, #963, #966, and #969.

A lower stratum has an exact binary pivot word with

```text
k ones
m=d-1 zeros.
```

The earned upward cover operation is

```text
10 -> 01.
```

For every nonzero Möbius interval `f <= e`, the upper pivot word is obtained from the lower pivot word by selecting a subset of its actual `10` descents and simultaneously swapping exactly those selected descents.

Distinct `10` descents cannot overlap. Mark each selected descent and encode

```text
marked 10 -> D=(1,1)
unconsumed 0 -> E=(1,0)
unconsumed 1 -> N=(0,1).
```

This gives a Delannoy path from `(0,0)` to `(d-1,k)`.

Conversely, expand

```text
D -> marked 10
E -> unmarked 0
N -> unmarked 1
```

and swap only the marked `10` pairs. The resulting lower and upper pivot words recover the unique nonzero Möbius interval.

Thus the frozen candidate is an exact bijection

```text
NONZERO_MOBIUS_INTERVAL
<-> MARKED_DESCENT_WORD
<-> DELANNOY_PATH_TO_(d-1,k).
```

The diagonal count is exactly the earned rank gap:

```text
#D = m(e)-m(f).
```

Therefore

```text
mu(f,e)=(-1)^(#D).
```

## Frozen support polynomial

Define

```text
M_{d,k}(t)=sum_{mu(f,e) != 0} t^(m(e)-m(f)).
```

The candidate exact coefficient law is

```text
[t^s]M_{d,k}(t)
 = (d+k-1-s)! / ((d-1-s)!(k-s)!s!)
```

for `0<=s<=min(d-1,k)`.

Equivalently, with `m=d-1`, `M` is the weighted Delannoy path enumerator by diagonal-step count and satisfies

```text
M(m,k;t)
 = M(m-1,k;t)
 + M(m,k-1;t)
 + t M(m-1,k-1;t)
```

with boundary polynomial `1` when `m=0` or `k=0`.

## Frozen specializations

### Strata surface

```text
M_{d,k}(0)=binomial(d+k-1,k).
```

The constant coefficient counts the reflexive nonzero intervals and equals the inherited number of Atlas/Schubert strata.

### Hasse surface

```text
[t]M_{d,k}(t)=# upward covers.
```

Thus the first nontrivial coefficient recovers the exact #966 Hasse count, while coefficients of degree `>=2` prove that Möbius support is strictly richer than the cover graph.

### Sparse inverse support surface

```text
M_{d,k}(1)=D(d-1,k),
```

ordinary Delannoy path count, equal to the #969 nonzero Möbius support cardinality.

### Signed cancellation surface

```text
M_{d,k}(-1)=1.
```

For each lower word with `r` descents, its marked subsets contribute `(1-1)^r`; every word with at least one descent cancels in the signed support sum, while the unique descent-free word contributes one.

Hence cell-by-cell

```text
#(mu=+1)-#(mu=-1)=1.
```

This explains the inherited aggregate relation over 42 cells:

```text
4977-4935=42.
```

```text
SIGNED_CANCELLATION != DELETION_OF_INTERVALS
M_DK_MINUS_ONE_EQUALS_ONE != SINGLE_SURVIVING_INTERVAL
```

## Frozen finite burden

Across `d=1..7,k=0..5`:

```text
formal cells                               42
lower pivot words / strata              1715
independent path instances              9912
path encode/decode round trips          9912
comparable support-membership checks  113828
closed coefficient checks                112
weighted recurrence cells                 30
weighted recurrence coefficient checks   100
finite transpose checks                    36
expected failures                           0
```

Aggregate rank-gap polynomial:

```text
1715 + 3829 t + 3101 t^2 + 1099 t^3 + 161 t^4 + 7 t^5.
```

Therefore

```text
reflexive support        1715
cover support            3829
higher noncover support  4368
total nonzero support    9912
positive support         4977
negative support         4935
signed total               42
```

The independent hostile witness starts from Delannoy paths, decodes them into lower/upper pivot words without calling the canonical path encoder or the coefficient formula, and then queries the already-earned #969 defining Möbius recurrence for support and sign.

```text
PATH_FIRST_HOSTILE_WITNESS != CANONICAL_ENCODER_SELF_AGREEMENT
```

## Frozen anchor

At `d=7,k=3`, hence `(m,k)=(6,3)`:

```text
M_{7,3}(t)=84+168t+105t^2+20t^3
M(0)=84
[t]M=168
M(1)=377
M(-1)=1
positive=189
negative=188.
```

The degree-two and degree-three terms supply `125` genuine higher-rank support incidences beyond the 168 covers.

## Frozen transpose symmetry

The coefficient formula and path endpoint give

```text
M_{d,k}(t)=M_{k+1,d-1}(t),
```

an exact rectangle-transpose symmetry of the finite combinatorial support polynomial.

This exchanges the path-axis lengths `d-1` and `k`; it does not identify their Atlas meanings.

```text
RECTANGLE_TRANSPOSE_SYMMETRY != ATLAS_PHYSICAL_DUALITY
SUPPORT_AXIS_COUNT != PRIME_EXPONENT_IDENTITY
FORMAL_PARAMETER_SYMMETRY != FUNCTORIAL_EQUIVALENCE
```

## Frozen candidate 𝄐

`AFTER_FIXING_THE_ORDERED_ATLAS_SUPPORT_COORDINATES_AND_STANDARD_REVERSE_RREF_FLAG_THE_EARNED_SPARSE_MOBIUS_SUPPORT_ADMITS_AN_EXACT_DELANNOY_PATH_MODEL: EVERY_NONZERO_INTERVAL_IS_UNIQUELY_A_LOWER_PIVOT_WORD_WITH_A_MARKED_SUBSET_OF_ITS_ACTUAL_10_DESCENTS_EQUIVALENTLY_A_PATH_FROM_ZERO_ZERO_TO_D_MINUS_ONE_K_WITH_E_N_AND_DIAGONAL_STEPS; THE_NUMBER_OF_DIAGONAL_STEPS_EQUALS_THE_SCHUBERT_RANK_GAP_AND_CONTROLS_THE_MOBIUS_SIGN. CONSEQUENTLY_THE_RANK_GAP_SUPPORT_POLYNOMIAL_HAS_MULTINOMIAL_COEFFICIENTS_SATISFIES_THE_WEIGHTED_DELANNOY_RECURRENCE_SPECIALIZES_AT_ZERO_TO_THE_STRATUM_COUNT_AT_FIRST_DEGREE_TO_THE_HASSE_COVER_COUNT_AT_ONE_TO_THE_TOTAL_NONZERO_MOBIUS_SUPPORT_AND_AT_MINUS_ONE_TO_EXACTLY_ONE_PER_D_K_CELL. THE_PATH_POLYNOMIAL_IS_SYMMETRIC_UNDER_FINITE_RECTANGLE_TRANSPOSE. THIS_IS_A_FIXED_FLAG_FINITE_COMBINATORIAL_INCIDENCE_MODEL_NOT_A_PHYSICAL_TRAJECTORY_CAUSAL_JUMP_PROBABILITY_MODEL_RUNTIME_ROUTE_BASIS_FREE_CANONICAL_GEOMETRY_OR_FUNCTORIAL_DUALITY.`

## Mandatory membranes

```text
MOBIUS_SUPPORT != ENTIRE_CLOSURE_RELATION
DELANNOY_PATH != PHYSICAL_TRAJECTORY
DIAGONAL_STEP != CAUSAL_JUMP
PATH_BIJECTION != RUNTIME_ROUTE
PATH_COUNT != PROBABILITY
MOBIUS_SIGN != PATH_ORIENTATION
SIGNED_CANCELLATION != DELETION_OF_EVIDENCE
M_DK_MINUS_ONE_EQUALS_ONE != SINGLE_SURVIVING_INTERVAL
COEFFICIENT_ONE_EQUALS_COVER_COUNT != MOBIUS_SUPPORT_EQUALS_HASSE_DIAGRAM
RECTANGLE_TRANSPOSE_SYMMETRY != ATLAS_PHYSICAL_DUALITY
SUPPORT_AXIS_COUNT != PRIME_EXPONENT_IDENTITY
FORMAL_PARAMETER_SYMMETRY != FUNCTORIAL_EQUIVALENCE
FINITE_DELANNOY_CORRESPONDENCE != ASYMPTOTIC_GEOMETRY
FIXED_FLAG_PATH_MODEL != BASIS_FREE_CANONICAL_GEOMETRY
ORDER_AND_INCIDENCE_ISOMORPHISMS != FUNCTORIAL_EQUIVALENCE
PRE_WITNESS_HELPER_REPAIR != RED_THEOREM_SCAR
SUCCESSFUL_EXACT_HEAD_GREEN != MERGE_AUTHORITY
ATLAS_REGISTRATION != LIVE_RUNTIME_STATE
```

No merge, deploy, release, publication, production, Vercel, physical trajectory, causal interpretation, probability model, continuum geometry, or basis-free canonicality.

Sealed ⟐