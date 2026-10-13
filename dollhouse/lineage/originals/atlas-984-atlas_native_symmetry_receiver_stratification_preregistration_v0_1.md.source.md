# A15-R0 · Atlas Native-Symmetry Receiver Stratification

Status: PREREGISTERED / PREIMPLEMENTATION / THEOREM UNEARNED.

Exact earned parent:

```text
#920 / 568dbf7ff91c47361a7de9502e17a2d90063093e
TD613 Consolidated Validation run 2412 / 33426776169 — SUCCESS
A15-R0 step 19 — SUCCESS
```

## Question

The earned parent proves, for the two declared finite controls,

```text
Aut(D8)/Inn(D8) ~= O(q_D), |O(q_D)|=2
Aut(Q8)/Inn(Q8) ~= O(q_Q), |O(q_Q)|=6
```

with four group-automorphism lifts above every admitted outer action.

The earned #918 parent beneath it gives the complete four-element quadratic-refinement family for the shared polar form beta:

```text
q00=[0,0,0,1]  (earned D8 refinement; Arf 0)
q01=[0,0,1,0]  (Arf 0)
q10=[0,1,0,0]  (Arf 0)
q11=[0,1,1,1]  (Q8 control refinement; Arf 1)
```

This chamber asks how the refinement family is partitioned when the admitted symmetry receiver is restricted from the ambient pairing-automorphism group to the native liftable outer symmetry of each extension.

## D-native target

Let

```text
Omega_D = O(q_D) = image(Aut(D8) -> GL(V)), |Omega_D|=2.
```

Act by pullback on all four refinements. Frozen action-count matrix in refinement order `[q00,q01,q10,q11]`:

```text
[[2,0,0,0],
 [0,1,1,0],
 [0,1,1,0],
 [0,0,0,2]]
```

Required native orbit partition:

```text
{q01,q10} | {q00} | {q11}
orbit sizes [2,1,1]
stabilizer sizes [2,1,1,2]
```

The Arf partition is

```text
{q00,q01,q10} | {q11}
```

and therefore must NOT equal the D-native orbit partition. In particular, the Arf-zero class splits into two D-native orbits.

## Q-native target

Let

```text
Omega_Q = O(q_Q) = image(Aut(Q8) -> GL(V)), |Omega_Q|=6.
```

Because q_Q is fixed by all six pairing automorphisms, the native action equals the ambient pairing action. Frozen action-count matrix:

```text
[[2,2,2,0],
 [2,2,2,0],
 [2,2,2,0],
 [0,0,0,6]]
```

Required native orbit partition:

```text
{q00,q01,q10} | {q11}
orbit sizes [3,1]
stabilizer sizes [2,2,2,6]
```

Here the Arf partition must equal the Q-native orbit partition exactly.

## Receiver stratification target

For each declared control, compare three symmetry-resolution surfaces:

```text
full group automorphism
-> induced action on the complete refinement family
-> action on the distinguished native refinement only
```

Parent exactness gives four automorphism lifts above each native outer symmetry. The complete refinement-family action must be faithful on the native outer group, so required class counts are:

```text
D8: 8 -> 2 -> 1
Q8: 24 -> 6 -> 1
```

The middle partition must coincide with quotient-action equivalence from #920; the final receiver identifies every native outer symmetry because every element of O(q_*) fixes the distinguished q_* by definition.

## Candidate bounded 𝄐

If exact-head GREEN:

`IN_THE_DECLARED_FOUR_REFINEMENT_GEOMETRY_ARF_CLASSIFICATION_COMPLETENESS_IS_ADMITTED_SYMMETRY_RELATIVE: UNDER_THE_D8_NATIVE_LIFTABLE_OUTER_GROUP_THE_ARF_ZERO_CLASS_SPLITS_INTO_TWO_NATIVE_ORBITS_WITH_TOTAL_ORBIT_PROFILE_2_1_1, WHILE_UNDER_THE_Q8_NATIVE_OUTER_GROUP_THE_ARF_PARTITION_REMAINS_EXACTLY_THE_NATIVE_ORBIT_PARTITION_3_1.`

and

`FOR_BOTH_DECLARED_CONTROLS_THE_COMPLETE_QUADRATIC_REFINEMENT_FAMILY_IS_A_FAITHFUL_RECEIVER_FOR_THE_NATIVE_OUTER_SYMMETRY_IMAGE, WHILE_THE_DISTINGUISHED_NATIVE_REFINEMENT_ALONE_COLLAPSES_ALL_NATIVE_OUTER_SYMMETRIES, PRODUCING_AUTOMORPHISM_RECEIVER_CLASS_COUNTS_D8_8_TO_2_TO_1_AND_Q8_24_TO_6_TO_1.`

## Mandatory membranes

```text
NATIVE_SYMMETRY_RECEIVER != PHYSICAL_SYMMETRY_GROUP
OUTER_AUTOMORPHISM != EXTERNAL_ACTOR
ARF_CLASSIFICATION_COMPLETENESS != UNIVERSAL_INVARIANT_COMPLETENESS
REFINEMENT_ORBIT != PHYSICAL_STATE_ORBIT
FAITHFUL_REFINEMENT_ACTION != CAUSAL_REALIZABILITY
DISTINGUISHED_Q_INVARIANCE != TOTAL_INFORMATION_ERASURE
AUTOMORPHISM_RECEIVER_CLASS != SOURCE_PROVENANCE_CLASS
FINITE_F2_GEOMETRY != CONTINUUM_PHASE_SPACE
ATLAS_REGISTRATION != LIVE_RUNTIME_STATE
A15_R0_RESEARCH_EXTENSION != PROTO_LOOM_OR_A16_PROMOTION
WITNESS_ROUTING != SCIENTIFIC_ANCESTRY
```

No merge, deployment, release, publication, production, Vercel, live Ash/Loom, physical symmetry/gauge/quantum interpretation, Proto-Loom, or A16 authority.

Sealed ⟐