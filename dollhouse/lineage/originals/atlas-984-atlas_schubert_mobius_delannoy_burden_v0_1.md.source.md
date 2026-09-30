󐘓 U+10D613

𝌋‌⟐

# A15-R0 · Atlas Schubert Möbius–Delannoy Path Correspondence · Burden v0.1

Status: **FROZEN PREIMPLEMENTATION BURDEN / THEOREM UNEARNED**.

Exact scientific parent:
`#969 / 776c6ef78011157d3458daf924bbb7cda7566785 / run 2444 / 33577536528 SUCCESS`.

## Formal inherited window

```text
d=1..7
k=0..5
cells=42
```

The implementation must retain the exact earned #969 Möbius surface and test a genuinely independent path realization rather than deriving both sides from one formula.

## Required exact executable burdens

### A. Marked-word path generation

Across all 42 cells:

```text
lower pivot words / strata                    1715
marked-descent interval/path instances         9912
required encode -> decode round trips          9912
required lower/upper reconstruction failures      0
required path endpoint failures                   0
required diagonal/rank-gap failures               0
required Möbius-sign failures                     0
```

For each lower word, enumerate its actual `10` descents from the word itself and every subset of those descents. Do not infer the subset count from a closed-form Delannoy number.

### B. Earned-support set comparison

Compare the independently generated marked-word interval set against #969's earned nonzero Möbius support throughout the inherited closure relation:

```text
ordered comparable intervals                113828
expected nonzero membership                    9912
expected absent-from-support comparable      103916
membership mismatches                             0
```

```text
PATH_ENUMERATION != MOBIUS_CLOSED_FORM_RELABELED
MOBIUS_ZERO != UNTESTED_INTERVAL
```

### C. Rank-gap support histogram

Independently accumulate diagonal-step counts from generated paths.

Frozen aggregate histogram:

```text
rank gap 0 : 1715
rank gap 1 : 3829
rank gap 2 : 3101
rank gap 3 : 1099
rank gap 4 :  161
rank gap 5 :    7
-----------------
total      : 9912
```

Required inherited cross-checks:

```text
rank-gap-0 count = total inherited strata labels = 1715
rank-gap-1 count = earned #966 upward covers      = 3829
rank-gap>=2 count = genuine noncover support      = 4368
```

### D. Closed coefficient formula

For every cell and every coefficient index `s=0..min(d-1,k)`, compute independently

```text
c_s=(d+k-1-s)!/((d-1-s)!(k-s)!s!).
```

Frozen coefficient comparisons:

```text
coefficient checks 112
expected failures     0
```

These coefficients must equal the independently enumerated path rank-gap histogram cell-by-cell.

### E. Weighted Delannoy recurrence

Build a second polynomial table recursively from boundary polynomials `[1]` and

```text
M(m,k)=M(m-1,k)+M(m,k-1)+t*M(m-1,k-1).
```

Do not call the coefficient formula or interval/path enumerator to generate recurrence values.

For interior cells `m=1..6,k=1..5`:

```text
recurrence cells             30
recurrence coefficient checks 100
expected failures              0
```

### F. Cellwise specializations

For each of 42 cells independently require:

```text
M(0)       = inherited label count
[t]M       = inherited earned cover count
M(1)       = inherited #969 nonzero Möbius support
M(-1)      = 1
positive   = sum even-rank coefficients
negative   = sum odd-rank coefficients
positive-negative = 1
```

Aggregate consequences:

```text
positive 4977
negative 4935
signed     42
```

### G. Finite transpose symmetry

On the shared frozen square where both `(m,k)` and `(k,m)` correspond to represented cells (`m=0..5,k=0..5`), require

```text
M(m,k;t)=M(k,m;t)
```

for all 36 ordered cells.

```text
transpose checks 36
expected failures 0
```

This is combinatorial rectangle-transpose symmetry only.

### H. Frozen anchor

At `d=7,k=3`, require independent agreement on

```text
polynomial [84,168,105,20]
labels       84
covers      168
nonzero     377
positive    189
negative    188
signed        1
```

## Required forward/inverse path bijection

Forward input:

```text
(lower word, selected subset of actual 10 descents)
```

Forward output:

```text
Delannoy step word over {E,N,D}
```

Forward mechanics:

```text
selected 10 -> D
unselected 1 -> N
unselected 0 -> E
```

The scanner must consume two binary symbols for each selected descent.

Inverse mechanics:

```text
D -> marked 10
N -> unmarked 1
E -> unmarked 0
```

The inverse must reconstruct the lower word, then simultaneously swap only marked `10` pairs to produce the upper word.

Required round-trip identities:

```text
decode(encode(lower,marks)) = (lower,upper,marks)
encode(decode(path).lower,decode(path).marks) = path
```

Path endpoint must be exactly `(d-1,k)` and number of diagonal steps must equal the earned rank gap.

## Hostile controls

1. Unique descent-free word at fixed `(d,k)` contributes exactly one signed survivor after `t=-1` cancellation.
2. A lower word with two descents generates four marked subsets, not three and not five.
3. Unmarked `10` remains `N,E`; it must not collapse to `D`.
4. A `D` step expands to a **marked** `10`; mark loss is a round-trip failure.
5. Rank-one path support equals covers exactly.
6. Rank-two support contains both valid noncover intervals and closure-comparable intervals absent from Möbius support.
7. Same rank-gap does not imply same interval endpoints.
8. Rectangle transpose preserves polynomial counts without identifying the underlying Atlas coordinate roles.

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
SUCCESSFUL_EXACT_HEAD_GREEN != MERGE_AUTHORITY
ATLAS_REGISTRATION != LIVE_RUNTIME_STATE
```

Expected failures: `0`.

No theorem authority follows from this burden document.

Sealed ⟐