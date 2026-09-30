# A15-R0 · Atlas Receiver Matroid Minors / Fault Tolerance — Preregistration v0.1

Status: **PREREGISTERED / UNEARNED / RESEARCH-ONLY / UNMERGED**

Exact earned parent:

```text
#926
431898a8bc7f14c466f401d71dfe20feaaf7c447
TD613 Consolidated Validation run 2415 / 33440032523 — SUCCESS
A15-R0 step 19 — SUCCESS
```

## Question

Given the two exact earned four-coordinate receiver matroids

```text
D ~= U_{1,2} + two loops
Q ~= U_{2,3} + one loop
```

what receiver-identification structure survives coordinate deletion or contraction, what are the minimal rank-destroying deletion sets, and which proper minors are shared between the two native controls?

This chamber treats coordinate deletion/contraction as finite matroid operations only. It does not identify them with physical sensor failure, causal removal, live receiver loss, or operational intervention.

## Ground set

Original coordinate order:

```text
0 = q00
1 = q01
2 = q10
3 = q11
```

Parent full ranks:

```text
r_D(E)=1
r_Q(E)=2
```

Parent bases:

```text
B_D = [2,4]
B_Q = [3,5,6]
```

## Deletion-fault definition

For deletion mask `F`, define the surviving rank

```text
r_survive(F) = r(E \ F).
```

`F` is rank-preserving iff `r_survive(F)=r(E)`.

A rank-destroying deletion set is minimal iff it lowers full rank and every proper subset preserves full rank. In a finite matroid these minimal rank-destroying deletion sets are cocircuits.

Define the finite deletion tolerance distance / cogirth in this chamber by

```text
del_dist(M) = min |F| such that r(E\F) < r(E).
```

## Frozen D deletion targets

Rank-preserving deletion masks:

```text
[0,1,2,3,4,5,8,9,10,11,12,13]
```

Rank-destroying deletion masks:

```text
[6,7,14,15]
```

Minimal rank-destroying deletion masks / cocircuits:

```text
[6] = [{q01,q10}]
```

Size profile:

```text
preserving by deletion size k = [1,4,5,2,0]
destroying by deletion size k = [0,0,1,2,1]
```

Thus the rank-preserving deletion enumerator target is

```text
R_D(z) = 1 + 4 z + 5 z^2 + 2 z^3
```

and the rank-destroying enumerator target is

```text
F_D(z) = z^2 + 2 z^3 + z^4.
```

Every single-coordinate deletion must preserve rank:

```text
single deletion ranks = [1,1,1,1]
```

so D has no coloop and

```text
del_dist(D)=2.
```

## Frozen Q deletion targets

Rank-preserving deletion masks:

```text
[0,1,2,4,8,9,10,12]
```

Rank-destroying deletion masks:

```text
[3,5,6,7,11,13,14,15]
```

Minimal rank-destroying deletion masks / cocircuits:

```text
[3,5,6]
= [{q00,q01},{q00,q10},{q01,q10}]
```

Size profile:

```text
preserving by deletion size k = [1,4,3,0,0]
destroying by deletion size k = [0,0,3,4,1]
```

Rank-preserving deletion enumerator target:

```text
R_Q(z) = 1 + 4 z + 3 z^2
```

Rank-destroying enumerator target:

```text
F_Q(z) = 3 z^2 + 4 z^3 + z^4.
```

Every single-coordinate deletion must preserve rank:

```text
single deletion ranks = [2,2,2,2]
```

so Q has no coloop and

```text
del_dist(Q)=2.
```

## Exact finite contrast

The controls therefore have the same single-coordinate deletion tolerance and the same minimum deletion distance, but not the same minimal failure geometry:

```text
D cocircuit count = 1
Q cocircuit count = 3
```

The theorem must preserve this distinction. Equal cogirth does not imply equal fragility structure.

## Single-element minor targets

For each original element `e`, construct both deletion and contraction rank tables on the remaining three coordinates.

Contraction rank is derived from the parent rank function:

```text
r_{M/e}(S) = r_M(S ∪ {e}) - r_M({e}).
```

No minor type may be assigned before its complete three-element rank table is derived.

### D deletion minors

```text
delete q00 -> U_{1,2} + one loop
delete q11 -> U_{1,2} + one loop
delete q01 -> U_{1,1} + two loops
delete q10 -> U_{1,1} + two loops
```

Type multiplicities:

```text
U_1_2_PLUS_ONE_LOOP: 2
U_1_1_PLUS_TWO_LOOPS: 2
```

### D contraction minors

```text
contract q00 -> U_{1,2} + one loop
contract q11 -> U_{1,2} + one loop
contract q01 -> U_{0,3}
contract q10 -> U_{0,3}
```

Type multiplicities:

```text
U_1_2_PLUS_ONE_LOOP: 2
U_0_3: 2
```

### Q deletion minors

```text
delete q11 -> U_{2,3}
delete q00 -> U_{2,2} + one loop
delete q01 -> U_{2,2} + one loop
delete q10 -> U_{2,2} + one loop
```

Type multiplicities:

```text
U_2_3: 1
U_2_2_PLUS_ONE_LOOP: 3
```

### Q contraction minors

```text
contract q11 -> U_{2,3}
contract q00 -> U_{1,2} + one loop
contract q01 -> U_{1,2} + one loop
contract q10 -> U_{1,2} + one loop
```

Type multiplicities:

```text
U_2_3: 1
U_1_2_PLUS_ONE_LOOP: 3
```

## Cross-control minor bridge

The preregistered bridge is intentionally cardinality-correct.

The claim is NOT `Q/e ~= D`.

Instead, for every Q nonloop

```text
e in {q00,q01,q10}
```

and either D loop

```text
ell in {q00,q11},
```

the three-element minors must satisfy

```text
Q/e ~= D/ell ~= D\ell ~= U_{1,2} + one loop.
```

This creates exactly

```text
3 * 2 = 6
```

cross-control isomorphism obligations between Q nonloop contractions and D loop deletion/contraction minors.

By contrast, D contraction by either moving/nonloop coordinate must collapse residual rank completely:

```text
D/q01 ~= D/q10 ~= U_{0,3}.
```

Thus the two native receiver matroids share a three-element rank-one minor but reach it through different element classes.

## Exhaustive minor burden

There are

```text
2 parent matroids * 4 coordinates * 2 operations = 16
```

single-element minors.

Each minor has `2^3=8` subsets, so the implementation must derive exactly

```text
16 * 8 = 128
```

minor rank values.

Every minor rank table must independently pass:

```text
normalization checks: 16
rank upper-bound checks: 128
monotonicity candidate ordered pairs: 1024
monotonicity inclusion premises: 432
submodularity ordered pairs: 1024
```

with zero failures.

## Candidate bounded 𝄐

If the exact frozen head receives authority-bearing GREEN including A15-R0 step 19:

`THE_TWO_EARNED_NATIVE_RECEIVER_MATROIDS_HAVE_EQUAL_SINGLE_COORDINATE_DELETION_TOLERANCE_AND_COGIRTH_TWO_BUT_DISTINCT_MINIMAL_FAILURE_GEOMETRY: D_HAS_ONE_TWO_COORDINATE_COCIRCUIT_WHILE_Q_HAS_THREE, WITH_EXACT_RANK_PRESERVING_DELETION_ENUMERATORS_1_PLUS_4Z_PLUS_5Z2_PLUS_2Z3_AND_1_PLUS_4Z_PLUS_3Z2.`

and

`EVERY_NONLOOP_CONTRACTION_OF_Q_IS_ISOMORPHIC_TO_EVERY_LOOP_DELETION_OR_CONTRACTION_MINOR_OF_D_AS_U_1_2_PLUS_ONE_LOOP, WHILE_NONLOOP_CONTRACTION_OF_D_COLLAPSES_TO_U_0_3; THE_TWO_NATIVE_RECEIVER_GEOMETRIES_THEREFORE_SHARE_A_THREE_ELEMENT_RANK_ONE_MINOR_THROUGH_DISTINCT_ELEMENT_CLASSES.`

## Mandatory membranes

```text
MATROID_DELETION != PHYSICAL_SENSOR_FAILURE
MATROID_CONTRACTION != CAUSAL_INTERVENTION
COCIRCUIT != PHYSICAL_COMMON_MODE_FAILURE
COGIRTH != ENGINEERING_RELIABILITY_RATING
RANK_PRESERVING_DELETION_ENUMERATOR != PHYSICAL_RELIABILITY_CURVE
MINIMAL_RANK_DESTROYING_SET != ATTACK_SET
MINOR_ISOMORPHISM != PHYSICAL_SYSTEM_EQUIVALENCE
SHARED_MATROID_MINOR != SHARED_HIDDEN_STATE
NO_COLOOP != NO_SINGLE_POINT_OF_OPERATIONAL_FAILURE
RECEIVER_FAULT_TOLERANCE_IN_THIS_FIXTURE != LIVE_RECEIVER_REDUNDANCY
ATLAS_REGISTRATION != LIVE_RUNTIME_STATE
A15_R0_RESEARCH_EXTENSION != PROTO_LOOM_OR_A16_PROMOTION
WITNESS_ROUTING != SCIENTIFIC_ANCESTRY
SUCCESSFUL_EXACT_HEAD_GREEN != MERGE_AUTHORITY
```

No merge, deployment, release, publication, production, Vercel, live Ash/Loom, Proto-Loom, A16, or physical reliability authority.

Sealed ⟐
