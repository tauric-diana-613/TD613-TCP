# A15-R0 · Atlas Quadratic-Refinement Orbit Geometry · Preregistration v0.1

𝌋⟐

Parent authority: #916 exact earned receipt `83a3eff9ceb7f29a3f4d850c36f226dacffc80d0`, TD613 Consolidated Validation run 2410 / 33356020582 SUCCESS, A15-R0 step 19 SUCCESS.

## Question

For the earned two-dimensional quotient `V=G/Z(G) ~= F2^2` with nondegenerate alternating form `beta`, classify **all** quadratic refinements of that fixed `beta`, then determine the exact action of the pairing automorphism group `Sp(beta)=GL(2,2)` on the refinement family.

This chamber studies refinement-orbit geometry only. It does not infer physical phase space, quantum structure, universal extension classification, or live route symmetry.

## Fixed quotient order

`[0,e1,e2,e1+e2]` with addition table

```text
0       0 1 2 3
e1      1 0 3 2
e2      2 3 0 1
e1+e2   3 2 1 0
```

Earned polar form:

```text
beta =
[[0,0,0,0],
 [0,0,1,1],
 [0,1,0,1],
 [0,1,1,0]]
```

## Exhaustive refinement universe

Enumerate all 16 Boolean functions `q:V->{0,1}`. A function is admitted iff for all `u,v`:

```text
q(u+v) xor q(u) xor q(v) = beta(u,v).
```

Frozen target: exactly four admitted refinements, in lexicographic bit-vector order:

```text
q00 = [0,0,0,1]
q01 = [0,0,1,0]
q10 = [0,1,0,0]
q11 = [0,1,1,1]
```

The earned D8 square refinement is `q00`; the explicit Q8 control refinement is `q11`.

## Affine torsor law

For each admitted `q`, `q xor q00` must be a linear functional on `V`. The four differences must be exactly all of `V*`:

```text
0000
0011
0101
0110
```

Hence the refinement family is candidate an affine torsor over `V* ~= F2^2`.

## Pairing automorphism action

Enumerate all 16 binary 2x2 matrices and retain exactly the 6 invertible matrices. Every retained matrix must preserve `beta`.

Act on refinements by pullback:

```text
(M·q)(v) = q(M^-1 v).
```

Frozen orbit decomposition:

```text
{q00,q01,q10}   size 3   Arf 0
{q11}           size 1   Arf 1
```

Frozen stabilizers:

```text
Stab(q00)=2
Stab(q01)=2
Stab(q10)=2
Stab(q11)=6
```

Source-to-target action-count matrix in refinement order `[q00,q01,q10,q11]`:

```text
[[2,2,2,0],
 [2,2,2,0],
 [2,2,2,0],
 [0,0,0,6]]
```

Thus the 24 `(refinement, pairing-automorphism)` actions split exactly into 18 moves within the Arf-0 orbit and 6 fixed actions on the Arf-1 singleton.

## Candidate bounded 𝄐

If exact-head GREEN:

`THE_COMPLETE_QUADRATIC_REFINEMENT_FAMILY_OF_THE_EARNED_FOUR_POINT_COMMUTATOR_GEOMETRY_CONTAINS_EXACTLY_FOUR_FORMS_AND_IS_AN_AFFINE_V_DUAL_TORSOR; THE_FULL_SIX_ELEMENT_PAIRING_AUTOMORPHISM_GROUP_SPLITS_THIS_FAMILY_INTO_ONE_TRANSITIVE_THREE_ELEMENT_ARF_ZERO_ORBIT_AND_ONE_FIXED_ARF_ONE_SINGLETON.`

and

`THE_EARNED_D8_REFINEMENT_AND_Q8_CONTROL_REFINEMENT_LIE_IN_DISTINCT_PAIRING_AUTOMORPHISM_ORBITS_EVEN_THOUGH_THEY_HAVE_THE_SAME_POLAR_COMMUTATOR_FORM; REFINEMENT_ORBIT_TYPE_RETains_EXTENSION_SENSITIVE_DATA_THAT_BETA_ALONE_FORGETS_WITHIN_THE_DECLARED_FINITE_CONTROLS.`

## Mandatory membranes

```text
QUADRATIC_REFINEMENT_ORBIT != PHYSICAL_STATE_ORBIT
AFFINE_REFINEMENT_TORSOR != GAUGE_TORSOR
PAIRING_AUTOMORPHISM_GROUP != PHYSICAL_SYMMETRY_GROUP
ARF_ORBIT_SPLIT != ENTROPY_CLASSIFICATION
ORBIT_TYPE != UNIVERSAL_EXTENSION_CLASSIFICATION
D8_Q8_ORBIT_SEPARATION != PHYSICAL_SYMMETRY_IDENTIFICATION
FINITE_F2_GEOMETRY != CONTINUUM_PHASE_SPACE
FORMAL_DISCRETE_HOLONOMY != GEOMETRIC_OR_PHYSICAL_HOLONOMY
ATLAS_REGISTRATION != LIVE_RUNTIME_STATE
A15_R0_RESEARCH_EXTENSION != PROTO_LOOM_OR_A16_PROMOTION
WITNESS_ROUTING != SCIENTIFIC_ANCESTRY
```

No merge, deployment, publication, production, Vercel, live Ash/Loom, quantum/physical interpretation, source provenance, Proto-Loom, or A16 authority.

Sealed ⟐