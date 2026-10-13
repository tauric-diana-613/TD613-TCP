# A15-R0 · Atlas Tutte / Rank-Generating Compression · Preregistration v0.1

𝌋⟐

Status: **PREREGISTERED BEFORE IMPLEMENTATION / THEOREM UNEARNED**.

Exact earned parent:

```text
#928 / 62722caea3f35bd520a2a1bfa5163f8cd2e14c26
TD613 Consolidated Validation run 2416 / 33443058142 — SUCCESS
A15-R0 step 19 — SUCCESS
aggregate — SUCCESS
```

## Question

Can the two earned four-coordinate native receiver matroids be compressed into exact corank–nullity / Tutte polynomials while preserving the specific receiver statistics already earned in #926 and #928, and while satisfying elementwise deletion–contraction against the exact earned single-element minors?

This chamber is finite and declared. It does **not** claim that a Tutte polynomial uniquely reconstructs an arbitrary matroid or an underlying physical system.

## Definitions

For an earned rank function `r` on four-element ground set `E`, define

```text
R_M(u,v) = Σ_{A⊆E} u^(r(E)-r(A)) v^(|A|-r(A))
T_M(x,y) = R_M(x-1,y-1)
```

`R_M` is reconstructed from all 16 subset ranks. `T_M` is obtained by exact integer polynomial substitution and collection, not by naming the parent matroid type.

## Frozen exact targets

### D receiver matroid

```text
R_D(u,v)
 = u v^2 + 2 u v + u + v^3 + 4 v^2 + 5 v + 2

T_D(x,y)
 = x y^2 + y^3
 = y^2 (x + y)
```

Coefficient sum of `R_D` must be 16.

### Q receiver matroid

```text
R_Q(u,v)
 = u^2 v + u^2 + 3 u v + 3 u + v^2 + 4 v + 3

T_Q(x,y)
 = x^2 y + x y + y^2
 = y (x^2 + x + y)
```

Coefficient sum of `R_Q` must be 16.

The child must derive these from the exact earned subset-rank tables; the factorized forms are only frozen expected identities.

## Frozen specialization recovery

For both controls, the implementation must recover from the derived Tutte polynomial:

```text
T(1,1) = number of bases
D = 2
Q = 3

T(2,1) = number of independent sets
D = 3
Q = 7

T(1,2) = number of spanning sets
D = 12
Q = 8

T(2,2) = number of all subsets
D = 16
Q = 16
```

These counts must agree with the exact earned #926/#928 surfaces rather than stand alone as polynomial trivia.

## Frozen deletion-enumerator recovery

The `u^0` slice of `R_M` records spanning subsets by nullity.

Frozen slices:

```text
R_D(0,v) = v^3 + 4 v^2 + 5 v + 2
R_Q(0,v) = v^2 + 4 v + 3
```

For a spanning subset with nullity `j`, deletion size is

```text
|E| - r(E) - j.
```

Reversing the spanning-nullity coefficients must recover exactly the earned #928 rank-preserving deletion enumerators:

```text
D: 1 + 4 z + 5 z^2 + 2 z^3
Q: 1 + 4 z + 3 z^2
```

This is a finite exact recovery statement for the declared matroids.

## Frozen deletion–contraction recurrence

Every one of the eight parent elements is audited against the exact single-element minor rank tables earned in #928.

For each element `e`:

```text
loop:     T_M = y T_(M\e)
coloop:   T_M = x T_(M/e)
ordinary: T_M = T_(M\e) + T_(M/e)
```

Expected element classes:

```text
D: 2 loops, 0 coloops, 2 ordinary
Q: 1 loop,  0 coloops, 3 ordinary
combined: 3 loop recurrences + 5 ordinary recurrences = 8
```

Exact minor-polynomial targets:

```text
U_1_2_PLUS_ONE_LOOP   -> x y + y^2
U_1_1_PLUS_TWO_LOOPS  -> x y^2
U_0_3                  -> y^3
U_2_3                  -> x^2 + x + y
U_2_2_PLUS_ONE_LOOP   -> x^2 y
```

Thus the expected recurrence identities include:

```text
D loop:     x y^2 + y^3 = y (x y + y^2)
D ordinary: x y^2 + y^3 = x y^2 + y^3

Q loop:     x^2 y + x y + y^2 = y (x^2 + x + y)
Q ordinary: x^2 y + x y + y^2 = x^2 y + (x y + y^2)
```

The implementation must compute the minor Tutte polynomials from their rank tables, not from these type names.

## Frozen burden

```text
parent subset-rank terms accumulated: 32
corank-nullity coefficient sums checked: 2
raw substitution contributions before coefficient collection: 43
  D: 22
  Q: 21
final Tutte monomials:
  D: 2
  Q: 3
single-element minor rank terms accumulated: 128
single-element deletion–contraction identities: 8
  loop identities: 3
  coloop identities: 0
  ordinary identities: 5
specialization identities: 8
spanning-slice deletion-enumerator recoveries: 2
all mismatches/failures: 0
```

## Candidate bounded 𝄐

`THE_TWO_EARNED_FOUR_COORDINATE_NATIVE_RECEIVER_MATROIDS_ADMIT_EXACT_CORANK_NULLITY_AND_TUTTE_COMPRESSION_DERIVED_FROM_ALL_SIXTEEN_SUBSET_RANKS: T_D_EQUALS_X_Y2_PLUS_Y3_AND_T_Q_EQUALS_X2_Y_PLUS_X_Y_PLUS_Y2, AND_ALL_EIGHT_ELEMENTWISE_DELETION_CONTRACTION_IDENTITIES_HOLD_AGAINST_THE_EARNED_SINGLE_ELEMENT_MINOR_RANK_TABLES.`

and

`THE_DERIVED_POLYNOMIALS_RECOVER_THE_PREVIOUSLY_EARNED_BASIS_INDEPENDENT_SPANNING_AND_TOTAL_SUBSET_COUNTS_AT_STANDARD_TUTTE_SPECIALIZATIONS_AND_RECOVER_THE_EXACT_RANK_PRESERVING_DELETION_ENUMERATORS_FROM_THE_U_ZERO_CORANK_NULLITY_SLICE_IN_BOTH_DECLARED_CONTROLS.`

## Mandatory membranes

```text
TUTTE_POLYNOMIAL != COMPLETE_MATROID_ISOMORPHISM_INVARIANT
CORANK_NULLITY_COMPRESSION != LOSSLESS_HISTORY_RECONSTRUCTION
POLYNOMIAL_SPECIALIZATION != UNIVERSAL_STATISTIC_SUFFICIENCY
TUTTE_COEFFICIENT != SHANNON_INFORMATION
DELETION_CONTRACTION_RECURRENCE != CAUSAL_REMOVAL_OR_INTERVENTION
SPANNING_SET_COUNT != PHYSICAL_RELIABILITY
RANK_PRESERVING_DELETION_ENUMERATOR != PHYSICAL_RELIABILITY_CURVE
MATROID_POLYNOMIAL != PHYSICAL_SYSTEM_POLYNOMIAL
ATLAS_REGISTRATION != LIVE_RUNTIME_STATE
A15_R0_RESEARCH_EXTENSION != PROTO_LOOM_OR_A16_PROMOTION
WITNESS_ROUTING != SCIENTIFIC_ANCESTRY
SUCCESSFUL_EXACT_HEAD_GREEN != MERGE_AUTHORITY
```

No merge/deploy/release/publication/production/Vercel/live Ash-Loom/Proto-Loom/A16/physical reliability authority.

Sealed ⟐
