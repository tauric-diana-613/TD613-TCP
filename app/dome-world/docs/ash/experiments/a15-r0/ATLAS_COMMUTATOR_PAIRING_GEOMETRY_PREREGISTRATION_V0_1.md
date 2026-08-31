# A15-R0 · Atlas Commutator Pairing Geometry — Preregistration v0.1

Status: PREREGISTERED BEFORE IMPLEMENTATION.

## Exact earned parent

```text
#912 / 5fc0678c440e81b393663b39d4659ebc6eeb5e29
TD613 Consolidated Validation run 2408 / 33351640311 — SUCCESS
A15-R0 step 19 — SUCCESS
```

The earned parent establishes, in the declared synthetic finite transport fixture,

```text
|G|=8
G'=[G,G]=Z(G)
|G'|=|Z(G)|=2
lower-central sizes=[8,2,1]
nilpotency class=2
```

with unique nonidentity commutator equal to the earned Moss Lantern formal loop holonomy.

## Research question

Does the central commutator descend to an exact alternating nondegenerate bilinear pairing on the central quotient

```text
V = G/Z(G)
```

when the two-element center/derived subgroup is identified with `F2`?

## Declared pairing

Let

```text
C = G' = Z(G) = {1,z}
phi_C(1)=0
phi_C(z)=1
```

and define

```text
beta : (G/Z) x (G/Z) -> F2
beta(gZ,hZ) = phi_C([g,h]).
```

This definition is admissible only if representative independence is established exactly.

## Frozen quotient target

The parent group has eight elements and two-element center, so the candidate quotient has four elements:

```text
V ~= C2 x C2 ~= F2^2.
```

Use the declared quotient basis

```text
e1 = A Z(G)
e2 = B Z(G)
```

where `A` and `B` are the inherited Moss Lantern transport generators.

Frozen coordinate labels:

```text
0       = Z(G)
e1      = A Z(G)
e2      = B Z(G)
e1+e2   = AB Z(G)
```

## Frozen pairing matrix

Relative to `(e1,e2)`, the exact target is

```text
J = [[0,1],
     [1,0]]
```

so

```text
rank_F2(J)=2
det_F2(J)=1.
```

Complete four-by-four pairing table target, in order `0,e1,e2,e1+e2`:

```text
0       0 0 0 0
e1      0 0 1 1
e2      0 1 0 1
e1+e2   0 1 1 0
```

Frozen value distribution:

```text
16 ordered quotient-pair values
10 zeros
6 ones
```

## Required laws

### 1. Representative independence

For every quotient pair `v,w` and every choices of representatives `g,gz` of `v` and `h,hz` of `w`, the commutator bit must be identical.

This is the executable descent condition from `G x G` to `(G/Z) x (G/Z)`.

### 2. Alternation

```text
beta(v,v)=0
```

for all four quotient elements.

### 3. Bilinearity over F2

```text
beta(u+v,w)=beta(u,w)+beta(v,w)
beta(u,v+w)=beta(u,v)+beta(u,w)
```

for all `u,v,w in V`, with arithmetic in `F2`.

### 4. Nondegeneracy

The radical must be trivial:

```text
rad(beta)={v : beta(v,w)=0 for all w}={0}.
```

Equivalently each nonzero quotient element must pair nontrivially with at least one quotient element.

### 5. Symmetry in characteristic two

The declared table should satisfy

```text
beta(v,w)=beta(w,v)
```

for all quotient pairs. This is a finite characteristic-two consequence to audit, not a substitute for alternation or bilinearity.

## Frozen hostile burden

```text
4 quotient classes
2 representatives per class
64 representative-independence checks
16 quotient pairing cells
4 alternating diagonal checks
64 first-slot bilinearity checks
64 second-slot bilinearity checks
16 symmetry checks
4 radical membership checks
3 nonzero vectors must leave the radical
10 zero / 6 one pairing-value distribution
basis matrix J=[[0,1],[1,0]]
rank=2
determinant=1 in F2
```

## Required strict witness

```text
beta(e1,e2)=1
```

while

```text
beta(e1,e1)=beta(e2,e2)=0.
```

So the pairing is nonzero but alternating.

## Candidate bounded 𝄐

If exact-head GREEN:

`THE_EARNED_CLASS_TWO_MOSS_LANTERN_FORMAL_HOLONOMY_GROUP_CARRIES_AN_EXACT_NONDEGENERATE_ALTERNATING_F2_COMMUTATOR_PAIRING_ON_ITS_FOUR_ELEMENT_CENTRAL_QUOTIENT_G_MOD_Z_WITH_MATRIX_[[0,1],[1,0]]_IN_THE_DECLARED_BASIS.`

and

`THE_NONABELIAN_HISTORY_DEFECT_DESCENDS_TO_A_TWO_DIMENSIONAL_FINITE_PAIRING_GEOMETRY: COMMUTATOR_INFORMATION_SURVIVES_ON_G_MOD_Z_AS_A_BILINEAR_ALTERNATING_NONDEGENERATE_FORM_WHILE_ALL_CENTRAL_REPRESENTATIVE_CHOICE_IS_FORGOTTEN.`

## Mandatory membranes

```text
COMMUTATOR_PAIRING != PHYSICAL_SYMPLECTIC_FORM
FINITE_F2_GEOMETRY != CONTINUUM_PHASE_SPACE
NONDEGENERATE_ALTERNATING_PAIRING != PHYSICAL_QUANTIZATION
PAIRING_RANK != INFORMATION_CAPACITY
G_MOD_Z != LIVE_STATE_SPACE
PAIRING_GEOMETRY != FULL_CENTRAL_EXTENSION_CLASS
NONDEGENERATE_PAIRING != UNIQUE_D8_RECONSTRUCTION
D8_AND_Q8_CAN_SHARE_THE_SAME_COMMUTATOR_PAIRING
REPRESENTATIVE_INDEPENDENCE != SOURCE_INDEPENDENCE
FORMAL_DISCRETE_HOLONOMY != GEOMETRIC_OR_PHYSICAL_HOLONOMY
ATLAS_REGISTRATION != LIVE_RUNTIME_STATE
A15_R0_RESEARCH_EXTENSION != PROTO_LOOM_OR_A16_PROMOTION
WITNESS_ROUTING != SCIENTIFIC_ANCESTRY
```

No merge, deployment, release, production, publication, Vercel, live Ash/Loom, physical phase space, quantization, gauge/Berry structure, source provenance, Proto-Loom, or A16 authority.

Sealed ⟐