󐘓 U+10D613

𝌋‌⟐

# A15-R0 · Atlas Schubert Möbius–Delannoy Path Correspondence · Preregistration v0.1

Status: **PREREGISTRATION ONLY / PREIMPLEMENTATION / THEOREM UNEARNED**.

Exact scientific parent:

```text
#969 · A15-R0 Atlas Schubert Möbius Incidence Inversion
776c6ef78011157d3458daf924bbb7cda7566785
TD613 Consolidated Validation 2444 / 33577536528 — SUCCESS
classifier 100084681091 — SUCCESS
static / constitutional / release 100084717359 — SUCCESS
A15-R0 step 19 — SUCCESS
downstream 20–30 — SUCCESS
aggregate — SUCCESS
CLOSED / UNMERGED
```

This chamber branches directly from the exact earned #969 head. No witness, handoff, main-branch, or merge ancestry carries theorem authority.

```text
WITNESS_ROUTING != SCIENTIFIC_ANCESTRY
CLOSED_UNMERGED_PARENT != ABSENT_PARENT_AUTHORITY
SUCCESSFUL_EXACT_HEAD_GREEN != MERGE_AUTHORITY
```

## Inherited earned surface

With ordered Atlas support coordinates and the standard reverse-RREF flag fixed, weak compositions `e=(e_1,...,e_d)` of `k` encode the earned Schubert closure poset. For a comparable interval `f <= e`, #969 earned

```text
mu(f,e) != 0
```

iff every proper-prefix gap and every pivot displacement is Boolean. Equivalently the finite rectangle skew difference is a rook strip, and then

```text
mu(f,e)=(-1)^(m(e)-m(f)).
```

The frozen #969 window contained 113828 comparable intervals, of which 9912 carried nonzero Möbius coefficient.

## New question

Does the entire nonzero Möbius support admit an exact path model rather than merely a support predicate?

Write the exact inherited pivot word of a lower stratum `f` as a binary word with

```text
k ones
m=d-1 zeros.
```

A proper upward cover is the already-earned adjacent swap

```text
10 -> 01.
```

For a nonzero Möbius interval, the Boolean prefix-plus-pivot condition suggests that the upper word is obtained from the lower word by choosing a subset of the lower word's `10` descents and performing those pairwise-disjoint adjacent swaps simultaneously.

The preregistered candidate bijection is:

1. begin with the lower pivot word;
2. mark exactly the descents whose `10 -> 01` swap produces the upper pivot word;
3. replace every marked `10` by a diagonal step `D=(1,1)`;
4. replace every remaining `0` by `E=(1,0)`;
5. replace every remaining `1` by `N=(0,1)`.

Because distinct `10` descents of a binary word cannot overlap, the replacement is unambiguous.

The candidate target is a Delannoy path from `(0,0)` to

```text
(m,k)=(d-1,k)
```

using `E`, `N`, and `D` steps.

The inverse candidate expands

```text
E -> 0
N -> 1
D -> marked 10
```

then swaps every marked `10` to `01` to reconstruct the upper pivot word.

## Candidate rank-gap law

Every marked descent contributes exactly one earned adjacent cover move and therefore one unit of Schubert/Atlas rank increase. Hence the candidate path statistic is

```text
number of D steps = m(e)-m(f).
```

The Möbius sign should therefore be

```text
mu(f,e)=(-1)^(# diagonal steps).
```

## Candidate support polynomial

Let

```text
M_{d,k}(t)=sum_{mu(f,e) != 0} t^(m(e)-m(f)).
```

If the path correspondence is exact, then with `m=d-1`

```text
M_{d,k}(t)
 = sum_{s=0}^{min(m,k)}
   (m+k-s)! / ((m-s)!(k-s)!s!) * t^s.
```

The coefficient of `t^s` is the number of paths with exactly `s` diagonal steps, equivalently the number of nonzero Möbius intervals of rank gap `s`.

The candidate weighted Delannoy recurrence is

```text
M_{m,k}(t)
 = M_{m-1,k}(t)
 + M_{m,k-1}(t)
 + t M_{m-1,k-1}(t)
```

for `m,k >= 1`, with boundary value `1` when either coordinate is zero.

## Candidate specializations

The chamber preregisters all of the following as consequences to be tested independently:

### `t=0` — strata

```text
M_{d,k}(0)=binomial(d+k-1,k).
```

Only reflexive intervals remain. This must equal the number of weak-composition / Schubert labels already earned upstream.

### coefficient of `t` — covers

```text
[t] M_{d,k}(t)
```

must equal the exact upward-cover count of the earned #966 closure poset in each `(d,k)` cell.

### `t=1` — total inverse support

```text
M_{d,k}(1)=D(d-1,k)
```

where `D` is the ordinary Delannoy path count. This must equal the number of nonzero Möbius incidences earned in #969.

### `t=-1` — signed cancellation

Candidate exact identity:

```text
M_{d,k}(-1)=1
```

for every `d>=1,k>=0`.

Thus in every fixed `(d,k)` cell

```text
#(mu=+1) - #(mu=-1) = 1.
```

This should explain the inherited aggregate #969 difference

```text
4977 - 4935 = 42,
```

one surviving signed unit for each of the 42 frozen `(d,k)` cells.

A direct cancellation witness is required: summing over marked subsets of descents in each lower binary word gives `(1-1)^r`, so every lower word with at least one `10` descent cancels and the unique descent-free word survives.

## Frozen finite window

Retain the inherited formal window

```text
d=1..7
k=0..5
42 cells.
```

Preregister aggregate candidate support polynomial coefficients by rank gap:

```text
s=0 : 1715
s=1 : 3829
s=2 : 3101
s=3 : 1099
s=4 : 161
s=5 : 7
----------------
total 9912
```

Consequences:

```text
reflexive support       1715
cover support           3829
higher noncover support 4368
positive support        4977
negative support        4935
signed total              42
```

The equality `s=1 = 3829` must be checked directly against the inherited #966 earned cover census, not copied from this preregistration.

## Frozen anchor

At `d=7,k=3`, hence `(m,k)=(6,3)`, preregister

```text
M_{7,3}(t)=84 + 168 t + 105 t^2 + 20 t^3.
```

Therefore

```text
M(0)=84
[t]M=168
M(1)=377
M(-1)=1
positive=84+105=189
negative=168+20=188.
```

These must agree respectively with inherited label, cover, and #969 Möbius-support counts without using the candidate polynomial as their source.

## Candidate rectangle-transpose symmetry

Because the path endpoint is `(d-1,k)`, the candidate polynomial is symmetric under rectangle transposition:

```text
M_{d,k}(t)=M_{k+1,d-1}(t)
```

whenever both sides are interpreted within their own fixed coordinate systems.

This is a finite combinatorial symmetry only.

```text
RECTANGLE_TRANSPOSE_SYMMETRY != ATLAS_PHYSICAL_DUALITY
SUPPORT_AXIS_COUNT != PRIME_EXPONENT_IDENTITY
FORMAL_PARAMETER_SYMMETRY != FUNCTORIAL_EQUIVALENCE
```

## Independent executable burden

Implementation must not earn the theorem by calling the #969 closed-form support predicate and merely relabeling outputs as paths.

Required independent surfaces:

1. Enumerate lower binary words directly from `m` zeros and `k` ones.
2. Enumerate every subset of actual `10` descents and construct the corresponding upper word by simultaneous swaps.
3. Independently encode each marked word to an `E/N/D` path and decode it back.
4. Compare the generated interval set with the #969 earned nonzero Möbius interval set on the full frozen window.
5. Compute the rank-gap histogram directly from generated marked descents.
6. Compute the same histogram independently from the multinomial path coefficient formula.
7. Compute the weighted recurrence independently from both interval enumeration and coefficient formula.
8. Verify `t=0`, coefficient-1, `t=1`, and `t=-1` identities cell-by-cell.
9. Verify rectangle-transpose symmetry only on the shared finite parameter window where both transposed cells are present.
10. Preserve explicit non-cover support with rank gaps `>=2`; Delannoy support must not collapse back to the Hasse diagram.

## Hostile controls

- A binary word with no `10` descents must generate only its reflexive interval.
- A word with multiple descents must generate all `2^r` marked subsets.
- An unmarked `10` must remain two axial steps, not become a diagonal.
- A diagonal expansion must remember its mark; expanding `D` as an unmarked `10` is invalid.
- Two nonzero intervals with the same rank gap need not have the same endpoints.
- A comparable interval with a row or column collision remains absent from the path support even if its total rank gap matches a valid path-supported interval.
- Rank-one support must equal covers; rank-two and higher support must include genuine non-cover intervals.

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
SUCCESSFUL_EXACT_HEAD_GREEN != MERGE_AUTHORITY
ATLAS_REGISTRATION != LIVE_RUNTIME_STATE
```

Expected failures: `0`.

No merge, deploy, release, publication, production, Vercel, physical trajectory, causal interpretation, probability model, continuum geometry, or basis-free canonicality follows from this preregistration.

Sealed ⟐