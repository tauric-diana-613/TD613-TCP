# A15-R0 · Atlas Automorphism-Lift Exactness

Status: PREREGISTERED / PREIMPLEMENTATION / THEOREM UNEARNED.

Exact earned parent:

```text
#918 / fb4f10524d4f93c35fc4d1a48c6b86c6f5aa1487
TD613 Consolidated Validation run 2411 / 33424071745 — SUCCESS
A15-R0 step 19 — SUCCESS
```

## Question

The earned quadratic-refinement orbit chamber established a fixed two-dimensional F2 quotient `V=G/Z(G)`, an earned D8-side refinement `q_D=[0,0,0,1]`, a Q8 control refinement `q_Q=[0,1,1,1]`, and pairing-automorphism stabilizers of sizes 2 and 6 respectively.

This chamber asks whether those downstairs quadratic symmetries are exactly the quotient actions induced by actual automorphisms of each eight-element central extension.

For each declared group `G`, define

```text
pi_G : Aut(G) -> GL(V)
```

by the induced action on `G/Z(G)`.

Frozen target exact sequences:

```text
1 -> Inn(D8) -> Aut(D8) -> O(q_D) -> 1
1 -> Inn(Q8) -> Aut(Q8) -> O(q_Q) -> 1
```

where `O(q)` means the subgroup of the already-earned six-element pairing automorphism group preserving the declared quadratic refinement.

## D8-side target

Reconstruct the actual inherited finite transport group from the same Moss Lantern generators

```text
A(x,y)=(x xor 1,y)
B(x,y)=(x,y xor x)
```

on the four-state apparatus fiber.

Required:

```text
|G_D| = 8
|Aut(G_D)| = 8
|Inn(G_D)| = 4
|O(q_D)| = 2
|im(pi_D)| = 2
|ker(pi_D)| = 4
ker(pi_D)=Inn(G_D)
im(pi_D)=O(q_D)
```

Every element of `O(q_D)` must have exactly four automorphism lifts. The four pairing automorphisms outside `O(q_D)` must have zero D8 automorphism lifts.

## Q8 control target

Independently reconstruct symbolic

```text
Q8={1,-1,i,-i,j,-j,k,-k}
```

from its multiplication law.

Required:

```text
|Aut(Q8)| = 24
|Inn(Q8)| = 4
|O(q_Q)| = 6
|im(pi_Q)| = 6
|ker(pi_Q)| = 4
ker(pi_Q)=Inn(Q8)
im(pi_Q)=O(q_Q)
```

Every one of the six quadratic-space automorphisms must have exactly four Q8 automorphism lifts.

## Exhaustive automorphism census

Do not infer automorphism-group sizes from presentations or library classification tables.

For each group enumerate all

```text
8! = 40,320
```

bijections of the eight-element underlying set and test all 64 multiplication cells for each candidate.

Thus the preregistered raw homomorphism burden is

```text
40,320 * 64 = 2,580,480 multiplication checks per group
5,160,960 total multiplication checks
```

before quotient-action classification.

## Candidate bounded 𝄐

If exact-head GREEN:

`FOR_BOTH_DECLARED_EIGHT_ELEMENT_CLASS_TWO_CONTROLS_THE_NATURAL_AUTOMORPHISM_ACTION_ON_G_MOD_Z_HAS_KERNEL_EXACTLY_THE_FOUR_ELEMENT_INNER_AUTOMORPHISM_GROUP_AND_IMAGE_EXACTLY_THE_ORTHOGONAL_STABILIZER_OF_THE_EARNED_QUADRATIC_REFINEMENT, GIVING_EXACT_SEQUENCES_1_TO_INN_G_TO_AUT_G_TO_O_Q_TO_1.`

and

`ON_THE_EARNED_D8_SIDE_QUADRATIC_PRESERVATION_IS_AN_EXACT_LIFTABILITY_OBSTRUCTION_AMONG_THE_SIX_PAIRING_AUTOMORPHISMS: THE_TWO_Q_D_PRESERVERS_HAVE_FOUR_GROUP_AUTOMORPHISM_LIFTS_EACH_WHILE_THE_OTHER_FOUR_PAIRING_AUTOMORPHISMS_HAVE_ZERO; FOR_THE_Q8_CONTROL_ALL_SIX_Q_Q_PRESERVERS_LIFT_WITH_FOUR_LIFTS_EACH.`

## Mandatory membranes

```text
AUTOMORPHISM_GROUP != PHYSICAL_SYMMETRY_GROUP
QUOTIENT_ACTION != PHYSICAL_MOTION
ORTHOGONAL_STABILIZER != CONTINUUM_ORTHOGONAL_GROUP
AUTOMORPHISM_LIFT != CAUSAL_REALIZABILITY
LIFTABILITY_OBSTRUCTION != PHYSICAL_OBSTRUCTION
INNER_AUTOMORPHISM != INTERNAL_MODEL_STATE
OUTER_AUTOMORPHISM_QUOTIENT != EXTERNAL_ACTOR_CLASS
EXACT_SEQUENCE != TEMPORAL_SEQUENCE
D8_Q8_CONTROL != UNIVERSAL_EXTENSION_CLASSIFICATION
FINITE_F2_GEOMETRY != CONTINUUM_PHASE_SPACE
FORMAL_DISCRETE_HOLONOMY != GEOMETRIC_OR_PHYSICAL_HOLONOMY
ATLAS_REGISTRATION != LIVE_RUNTIME_STATE
A15_R0_RESEARCH_EXTENSION != PROTO_LOOM_OR_A16_PROMOTION
WITNESS_ROUTING != SCIENTIFIC_ANCESTRY
```

No merge, deployment, release, publication, production, Vercel, live Ash/Loom, physical symmetry/gauge/quantum interpretation, source provenance, Proto-Loom, or A16 authority.

Sealed ⟐