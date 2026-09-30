# A15-R0 · Atlas Receiver Matroid Minors / Fault Tolerance — Freeze v0.1

Status: **FROZEN CANDIDATE / UNEARNED UNTIL EXACT-HEAD GREEN / DRAFT / UNMERGED**

Exact earned parent:

```text
#926
431898a8bc7f14c466f401d71dfe20feaaf7c447
run 2415 / 33440032523 — SUCCESS
A15-R0 step 19 — SUCCESS
```

## Frozen successor chronology

```text
1 preregistration  911e1cac6982fadba9c0397aec303afe7c4e417f
2 expectations     1aeca013258026b0bdaa252bc84a6de923a41e71
3 burden           d65352155ab034e7e0612a3ab568557c3db610f1
4 implementation   c28e3a17846da523e4971820f61fdfa3e70484e6
5 canonical        8dcecdf523781c37c96e0128c716629c0c55fc1f
6 hostile          84bf8ee2ccc0ffa9bc2e2002ccccfcb1c2877269
7 hardening        79e8878568c40a90a4e3a0c483159368a27a9ab6
8 freeze           THIS COMMIT / EXACT CANDIDATE HEAD
```

No scientific mutation is permitted after the freeze commit. A correction requires a new exact head and a new witness cycle.

## Frozen exact deletion surface

```text
D full rank 1
preserving deletion masks [0,1,2,3,4,5,8,9,10,11,12,13]
destroying deletion masks [6,7,14,15]
cocircuits [6]
preserving by size [1,4,5,2,0]
destroying by size [0,0,1,2,1]
delete distance / cogirth 2
coloops none

Q full rank 2
preserving deletion masks [0,1,2,4,8,9,10,12]
destroying deletion masks [3,5,6,7,11,13,14,15]
cocircuits [3,5,6]
preserving by size [1,4,3,0,0]
destroying by size [0,0,3,4,1]
delete distance / cogirth 2
coloops none
```

Frozen rank-preserving deletion enumerators:

```text
D: 1 + 4 z + 5 z^2 + 2 z^3
Q: 1 + 4 z + 3 z^2
```

Thus both controls tolerate every single-coordinate deletion in the finite matroid sense, while their two-coordinate minimal failure multiplicities differ `1 != 3`.

## Frozen minor census

```text
D deletion:
  U_1_2_PLUS_ONE_LOOP: 2
  U_1_1_PLUS_TWO_LOOPS: 2

D contraction:
  U_1_2_PLUS_ONE_LOOP: 2
  U_0_3: 2

Q deletion:
  U_2_3: 1
  U_2_2_PLUS_ONE_LOOP: 3

Q contraction:
  U_2_3: 1
  U_1_2_PLUS_ONE_LOOP: 3
```

Six cross-control bridge obligations are frozen:

```text
for q in {q00,q01,q10}
for ell in {D.q00,D.q11}
Q/q ~= D\ell ~= D/ell ~= U_1_2_PLUS_ONE_LOOP
```

The stronger statement `Q/q ~= D` remains explicitly forbidden by ground-set cardinality.

## Frozen exhaustive burden

```text
deletion masks evaluated 32
single-element minors 16
minor rank values 128
minor normalization checks 16
minor rank upper-bound checks 128
minor monotonicity candidate pairs 1024
minor monotonicity inclusion premises 432
minor submodularity pairs 1024
cross-control bridge obligations 6
all failures 0
```

## Candidate bounded 𝄐

`THE_TWO_EARNED_NATIVE_RECEIVER_MATROIDS_HAVE_EQUAL_SINGLE_COORDINATE_DELETION_TOLERANCE_AND_COGIRTH_TWO_BUT_DISTINCT_MINIMAL_FAILURE_GEOMETRY: D_HAS_ONE_TWO_COORDINATE_COCIRCUIT_WHILE_Q_HAS_THREE, WITH_EXACT_RANK_PRESERVING_DELETION_ENUMERATORS_1_PLUS_4Z_PLUS_5Z2_PLUS_2Z3_AND_1_PLUS_4Z_PLUS_3Z2.`

and

`EVERY_NONLOOP_CONTRACTION_OF_Q_IS_ISOMORPHIC_TO_EVERY_LOOP_DELETION_OR_CONTRACTION_MINOR_OF_D_AS_U_1_2_PLUS_ONE_LOOP, WHILE_NONLOOP_CONTRACTION_OF_D_COLLAPSES_TO_U_0_3; THE_TWO_NATIVE_RECEIVER_GEOMETRIES_THEREFORE_SHARE_A_THREE_ELEMENT_RANK_ONE_MINOR_THROUGH_DISTINCT_ELEMENT_CLASSES.`

## Membranes remain mandatory

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

No merge/deploy/release/publication/production/Vercel/live Ash-Loom/Proto-Loom/A16 authority.

Sealed ⟐
