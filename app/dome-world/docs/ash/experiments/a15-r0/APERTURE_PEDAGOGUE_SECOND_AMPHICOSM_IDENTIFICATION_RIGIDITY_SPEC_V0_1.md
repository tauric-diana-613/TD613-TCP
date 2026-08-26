# A15-R0 · Second Amphicosm Identification and Bieberbach Rigidity

Status: PREREGISTERED / WESTWARD #737 / SCIENTIFIC PARENT #775 / THEOREM AUTHORITY UNEARNED

```text
scientific_parent = #775 receipt 39b8f6e8ba319154378d03c28a1bf42c02870de1
gate_issue        = #737
```

## Question

The witnessed parent #775 earns the abstract fraction group

```text
G = Z^2 ⋊_sigma Z,
sigma(E,O)=(O,E),
BB ≃ K(G,1),
H1(G;Z) ≅ Z^2.
```

This chamber asks whether the exact abstract group can be identified with one of the ten classical compact flat 3-manifold groups, without borrowing any theorem authority from #778, #780, #781, #782, or #783.

## External classification datum

Conway–Rossetti, *Describing the platycosms* (arXiv:math/0311476), gives the amphicosm presentations

```text
+a1: <W,X,Z | W^-1 Z W = Z^-1,
                 X^-1 Z X = Z^-1,
                 [X,W] = 1>

-a1: <W,X,Z | W^-1 Z W = Z^-1,
                 X^-1 Z X = Z^-1,
                 [X,W] = Z>
```

with commutator convention

```text
[X,W] = X^-1 W^-1 X W.
```

The same source gives

```text
H1(+a1;Z) ≅ Z^2 ⊕ Z/2
H1(-a1;Z) ≅ Z^2.
```

It also identifies `+a1` and `-a1` as the first/positive and second/negative amphicosms, respectively, both with point group `C2`, and orientable double cover the torocosm `c1`.

## Exact change of generators inside #775 G

Use #775 coordinates `(t,E,O)` and define

```text
T = (1,0,0)
e = (0,1,0)
o = (0,0,1)

W = T
X = e T
Z = e o^-1 = (0,1,-1).
```

The implementation must derive, using only the inherited #775 group multiplication and inverse,

```text
W^-1 Z W = Z^-1
X^-1 Z X = Z^-1
[X,W]    = Z.
```

It must also prove the chosen elements generate the original #775 generators:

```text
T = W
e = X W^-1
o = W e W^-1.
```

Therefore the negative-amphicosm relations are not merely sampled in a subgroup; the named generators recover the inherited generating set.

## Independent abelianization fingerprint

The inherited #775 result already earns

```text
H1(G;Z) ≅ Z^2.
```

The classification datum distinguishes the two `C2`-point-group nonorientable amphicosms:

```text
+a1 -> Z^2 ⊕ Z/2
-a1 -> Z^2.
```

The exact parent fingerprint therefore agrees with `-a1` and excludes `+a1`.

The chamber must preserve the stronger distinction

```text
PRESENTATION_MATCH
AND
H1_FINGERPRINT_MATCH
```

as two independently checked identification channels.

## First-amphicosm hostile

The same `W,X,Z` must reject the first-amphicosm commutator relation:

```text
[X,W] != 1
[X,W] = Z
Z != 1.
```

A malformed classifier that ignores the commutator and looks only at point group `C2`, nonorientability, or torus double cover must fail.

## Product hostile

Conway–Rossetti notes that the first amphicosm admits a product form `Klein bottle × S^1` in a standard metric family. Independently, its abelianization contains `Z/2`.

Since #775 earns `H1(G;Z)=Z^2`, the chamber may classify

```text
G is not the fundamental group of the first amphicosm
G is not the first-amphicosm / Klein-bottle-times-circle topological type.
```

This is a topological identification, not a statement about all possible metrics.

## Bieberbach rigidity consequence

Standard Bieberbach rigidity for Euclidean crystallographic groups states that an abstract isomorphism between crystallographic groups is induced by affine conjugacy. Equivalently, compact flat manifolds with isomorphic fundamental groups have the same affine equivalence type.

This consequence is conditional only on the standard fact that the Conway–Rossetti `-a1` group is a compact flat 3-manifold group; it does not import #783's candidate affine realization as authority.

Candidate consequence:

```text
The abstract #775 group G already determines the affine platycosm type -a1.
```

Thus a future independently witnessed affine realization of `G` cannot land in the first amphicosm or another platycosm type merely by changing coordinates.

## Candidate theorem stack — UNEARNED

If all certificates pass under constitutional witness:

```text
THE_775_FRACTION_GROUP_ADMITS_CONWAY_ROSSETTI_NEGATIVE_AMPHICOSM_GENERATORS
THE_EXACT_NEGATIVE_AMPHICOSM_PRESENTATION_RELATIONS_HOLD_IN_G
THE_FIRST_AMPHICOSM_COMMUTATOR_RELATION_FAILS_IN_G
THE_INHERITED_H1_Z_SQUARED_FINGERPRINT_MATCHES_NEGATIVE_AMPHICOSM_AND_EXCLUDES_POSITIVE_AMPHICOSM
THE_775_K_G_1_HOMOTOPY_TYPE_IS_THE_SECOND_NEGATIVE_AMPHICOSM_HOMOTOPY_TYPE
THE_FLAT_MANIFOLD_AFFINE_TYPE_ASSOCIATED_TO_G_IS_RIGIDLY_THE_SECOND_NEGATIVE_AMPHICOSM_TYPE
SECOND_AMPHICOSM_IDENTIFICATION_AND_BIEBERBACH_RIGIDITY_EARNED
```

## Consequential scars

```text
POINT_GROUP_C2_AND_TORUS_DOUBLE_COVER
!=
SUFFICIENT_TO_DISTINGUISH_THE_TWO_AMPHICOSMS
```

```text
ABSTRACT_GROUP_PRESENTATION_PLUS_H1_FINGERPRINT
CAN_FIX_A_CLASSICAL_FLAT_MANIFOLD_TYPE
WITHOUT_CHOOSING_A_METRIC_REALIZATION
```

```text
AFFINE_RIGIDITY
!=
ISOMETRIC_METRIC_RIGIDITY
```

Different flat metrics/parameters may remain; the candidate classification is affine/topological type, not a unique metric.

## Mandatory hostiles

```text
[X,W]=1                                              REJECT
Z=1                                                  REJECT
W^-1 Z W=Z                                           REJECT
X^-1 Z X=Z                                           REJECT
chosen W,X fail to recover inherited T,e,o           REJECT
H1(G)=Z^2⊕Z/2                                        REJECT
+a1 and -a1 have same H1                             REJECT
C2 point group alone distinguishes +a1 from -a1      REJECT
torus orientation cover alone distinguishes them     REJECT
second amphicosm = Klein bottle × S1                  REJECT
Bieberbach affine conjugacy = unique isometry metric REJECT
named platycosm = physical spacetime                  REJECT
classical linear holonomy = formal bar 2-holonomy     REJECT
```

## Hard ceilings

```text
second amphicosm identification != physical universe identification
platycosm nomenclature != ontology authority
flat-manifold affine equivalence != unique Riemannian metric
Bieberbach rigidity != operational route rigidity
classical point-group holonomy != bar-complex 2-holonomy
classical holonomy != Berry / gerbe holonomy
named flat 3-manifold != physical spacetime
```

#718 remains alive.

No merge / deployment / fifth workflow / SRC sync / production / Vercel authority.

𝌋‌⟐
