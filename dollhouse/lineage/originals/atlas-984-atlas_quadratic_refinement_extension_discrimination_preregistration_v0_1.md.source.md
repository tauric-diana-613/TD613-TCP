# A15-R0 · Atlas Quadratic Refinement / Central-Extension Discrimination

Status: PREREGISTRATION ONLY · IMPLEMENTATION FORBIDDEN BEFORE FREEZE OF EXPECTATIONS AND BURDEN.

Parent authority:

```text
#914 / abfc2a801127b85fea870b56d253882951cca241
TD613 Consolidated Validation run 2409 / 33353777229 — SUCCESS
A15-R0 step 19 — SUCCESS
```

#914 earns a representative-independent alternating bilinear nondegenerate commutator pairing

```text
V = G/Z(G) ~= F2^2
G' = Z(G) ~= C2 ~= F2
beta(u,v) = [u~,v~]
J = [[0,1],[1,0]]
```

for the declared Moss Lantern formal transport group. It explicitly does **not** reconstruct the full central extension.

## Research question

Does the square map on central cosets supply quadratic data that the earned commutator pairing forgets?

For a class-two group whose center has exponent two, define

```text
q(g Z) = g^2 in Z ~= F2.
```

The target refinement law is

```text
q(u+v) = q(u) + q(v) + beta(u,v) mod 2.
```

The experiment must establish this law by reconstruction from the inherited finite transport group, not by assigning q-values as labels.

## Earned-group target

Use the #914 basis

```text
e1 = A Z(G)
e2 = B Z(G)
e1+e2 = AB Z(G)
```

with quotient order

```text
[0,e1,e2,e1+e2].
```

Frozen candidate square refinement:

```text
q_D = [0,0,0,1].
```

Required interpretation:

```text
q_D(0)=0
q_D(e1)=0
q_D(e2)=0
q_D(e1+e2)=1
```

The form must polarize exactly to the earned pairing table

```text
[[0,0,0,0],
 [0,0,1,1],
 [0,1,0,1],
 [0,1,1,0]].
```

## Explicit quaternionic control

Construct an independent symbolic quaternion group control

```text
Q8 = {1,-1,i,-i,j,-j,k,-k}
```

from its multiplication law, not from a predeclared q-vector.

The control must independently reconstruct:

```text
|Q8| = 8
Z(Q8) = Q8' = {1,-1}
Q8/Z(Q8) ~= F2^2
```

with declared quotient basis

```text
f1 = i Z(Q8)
f2 = j Z(Q8)
f1+f2 = k Z(Q8).
```

Its commutator pairing must equal the earned D8-side table **cell for cell**:

```text
beta_Q = beta_D = J.
```

But its square refinement must be

```text
q_Q = [0,1,1,1].
```

Thus the pairings agree while the refinements differ.

## Quadratic polarization target

For both controls and every `u,v in V`, verify

```text
q(u+v) xor q(u) xor q(v) = beta(u,v).
```

Complete burden:

```text
16 D-side polarization checks
16 Q-side polarization checks
0 failures
```

## Symplectic-basis / Arf target

Enumerate all ordered bases `(x,y)` of the four-element quotient satisfying

```text
beta(x,y)=1.
```

There must be exactly six ordered symplectic bases.

For each such basis compute the dimension-two Arf bit

```text
Arf(q;x,y)=q(x) q(y) in F2.
```

Frozen target:

```text
D-side: 6/6 Arf bits = 0
Q-side: 6/6 Arf bits = 1
```

Therefore the quadratic forms are not isometric even though their polar forms are identical.

## Full GL(2,2) control

Enumerate all invertible `2x2` matrices over `F2`.

Frozen target:

```text
|GL(2,2)| = 6
all 6 preserve J
D-side q stabilizer size = 2
Q-side q stabilizer size = 6
cross q-isometries D -> Q = 0
```

This is a finite control against accidentally calling distinct q-vectors the same quadratic geometry.

## Element-square distribution

The square map must also be audited on all eight group elements.

Earned D8 fixture target:

```text
8 square checks
6 square to identity
2 square to the nonidentity center element
```

Quaternionic control target:

```text
8 square checks
2 square to identity
6 square to the nonidentity center element
```

## Strict information distinction

Required exact witness:

```text
beta_D == beta_Q
q_D != q_Q
Arf(q_D)=0
Arf(q_Q)=1
```

Therefore, in the two declared finite controls,

```text
COMMUTATOR PAIRING
!=
QUADRATIC REFINEMENT
```

and the refinement separates the earned D8 fixture from the explicit Q8 control while the pairing alone cannot.

## Candidate bounded 𝄐

If exact-head constitutional validation is GREEN:

```text
THE_EARNED_MOSS_LANTERN_CLASS_TWO_FORMAL_HOLONOMY_GROUP_CARRIES_A_WELL_DEFINED_QUADRATIC_REFINEMENT_Q_ON_G_MOD_Z_GIVEN_BY_CENTRAL_SQUARES_WITH_Q=[0,0,0,1], WHOSE_POLAR_FORM_IS_EXACTLY_THE_EARNED_NONDEGENERATE_ALTERNATING_COMMUTATOR_PAIRING.
```

and

```text
AN_EXPLICIT_Q8_CONTROL_HAS_THE_SAME_F2_COMMUTATOR_PAIRING_BUT_QUADRATIC_REFINEMENT_[0,1,1,1]; THE_TWO_FORMS_HAVE_OPPOSITE_ARF_BITS_AND_ZERO_CROSS_ISOMETRIES_UNDER_GL_2_F2, SO_THE_QUADRATIC_REFINEMENT_RECOVERS_EXTENSION_DATA_THAT_THE_PAIRING_FORGETS_WITHIN_THE_DECLARED_FINITE_CONTROLS.
```

## Mandatory membranes

```text
QUADRATIC_REFINEMENT != QUANTUM_STATE
ARF_INVARIANT != ENTROPY
SQUARE_MAP != PHYSICAL_ENERGY
FINITE_F2_QUADRATIC_FORM != PHYSICAL_PHASE_SPACE
PAIRING_EQUALITY != EXTENSION_EQUALITY
QUADRATIC_REFINEMENT_DISCRIMINATION != UNIVERSAL_GROUP_CLASSIFICATION
D8_VS_Q8_CONTROL != PHYSICAL_SYMMETRY_IDENTIFICATION
Q8_SYMBOLIC_CONTROL != QUATERNIONIC_PHYSICS
CENTRAL_EXTENSION_DATA != HISTORICAL_SOURCE_PROVENANCE
FORMAL_DISCRETE_HOLONOMY != GEOMETRIC_OR_PHYSICAL_HOLONOMY
ATLAS_REGISTRATION != LIVE_RUNTIME_STATE
A15_R0_RESEARCH_EXTENSION != PROTO_LOOM_OR_A16_PROMOTION
WITNESS_ROUTING != SCIENTIFIC_ANCESTRY
```

No merge, deployment, release, publication, production, Vercel, physical phase space, quantization, gauge/Berry structure, source provenance, Proto-Loom, A16, or live Ash/Loom authority.

Sealed ⟐
