# A15-R0 · Finite Task Homotopy-Amnesia / Role-Tomography Aperture Ladder Preregistration v0.1

Status: PREREGISTERED BEFORE THEOREM IMPLEMENTATION.

Exact scientific parent:

```text
#874 / 7c4cef95d4f704f05615d663e252d5a53775bdbe
TD613 Consolidated Validation run 2384 / 33278954289 — SUCCESS
```

#875 remains witness-routing only and carries zero theorem ancestry.

## Fixed inherited object

Use only #874's earned five-point finite task topology and its specialization order, with task points

```text
X={A,B,T,M,R}
```

and specialization covers

```text
B < R
A < T
A < M
T < R
```

under the convention `x <= y iff x in cl({y})`.

Inherited #874 rigidity:

```text
120 task-point permutations
1 topology automorphism
0 nonidentity topology automorphisms
```

This successor asks what survives under deliberately coarser local, deletion-complex, homological, beat-collapse, and finite-map-homotopy apertures.

## Primary falsifiable synthesis

The fixed full task topology is expected to distinguish all five structural roles exactly while progressively coarser apertures identify fewer roles:

```text
full joint local structural fingerprint : 5 role classes
single-deletion order-complex f-vector  : 3 role classes
single-deletion F2 Betti profile        : 2 role classes
global homotopy/homology aperture       : 1 role class
```

Preregistered strict role-distinguishability ladder:

```text
5 -> 3 -> 2 -> 1
```

A mismatch at any rung falsifies this ladder.

## Local two-aperture tomography

For each role x define

```text
c(x)=|cl{x}|
u(x)=|U_x|
```

where U_x is the inherited minimal open neighborhood.

Expected scalar partitions:

```text
c : {A,B} | {T,M} | {R}
u : {R,M} | {B,T} | {A}
```

Each scalar aperture aliases roles. The expected joint pair `(c,u)` is injective:

```text
A (1,4)
B (1,2)
T (2,2)
M (2,1)
R (4,1)
```

Expected joint role classes = 5; ambiguity = 0.

## Complete finite self-map census

Enumerate every function `f:X->X`:

```text
5^5 = 3,125
```

Test each map independently in two ways:

1. specialization-order preservation on all ordered comparable pairs;
2. finite-topology continuity by requiring the inverse image of every one of the 12 inherited open sets to be open.

Expected exact agreement:

```text
3,125 / 3,125 classifications agree
0 mismatches
128 order-preserving maps
128 continuous maps
2,997 maps fail both classifications
```

Expected continuous-endomap image-size spectrum:

```text
|im|=1 :  5
|im|=2 : 50
|im|=3 : 60
|im|=4 : 12
|im|=5 :  1
TOTAL  :128
```

The unique image-size-five continuous map is expected to be the identity, reconciling with #874's automorphism rigidity.

Expected idempotent continuous endomaps:

```text
61 total
image-size spectrum 5 / 26 / 21 / 8 / 1 for sizes 1 / 2 / 3 / 4 / 5
```

## Pointwise-comparability map graph

On the 128 continuous endomaps, form an undirected graph joining distinct `f,g` iff either

```text
f(x) <= g(x) for every x
```

or

```text
g(x) <= f(x) for every x.
```

This is the declared finite pointwise-comparability homotopy graph. No physical evolution or general mapping-space theorem is implied.

Expected exact graph:

```text
vertices = 128
edges = 1,528
connected components = 1
diameter = 3
```

Expected unordered-pair shortest-distance distribution:

```text
d=1 : 1,528
d=2 : 5,435
d=3 : 1,165
TOTAL = C(128,2)=8,128
```

Identity eccentricity is expected to be 3, with distance distribution

```text
0:1 / 1:6 / 2:49 / 3:72
```

Expected identity-to-constant-map distances:

```text
const A : 2
const R : 2
const B : 3
const T : 3
const M : 3
```

Candidate major separation:

```text
AUTOMORPHISM_RIGIDITY != POINTWISE_COMPARABILITY_HOMOTOPY_RIGIDITY
```

## Beat-point collapse census

A point is admitted as a beat point only when, in the current induced specialization subposet, its strict upper set has a unique minimum or its strict lower set has a unique maximum.

Expected initial beat points:

```text
B : up-beat with upper minimum R
T : up-beat with upper minimum R and down-beat with lower maximum A
M : down-beat with lower maximum A
```

A and R are not initial beat points.

Enumerate every lawful dynamic beat deletion until a singleton remains.

Expected census:

```text
36 complete beat-collapse sequences
19 distinct reachable induced subspaces
reachable-subspace counts by size:
size 5:1
size 4:3
size 3:5
size 2:5
size 1:5
```

Every role is expected to occur as a terminal singleton, with exact multiplicity:

```text
A:12
R:12
T:6
B:3
M:3
```

Therefore terminal beat-collapse identity is not structural role identity.

## Order-complex and F2 homology aperture

Construct the strict-chain order complex of the specialization poset.

Expected full-space simplex counts:

```text
0-simplices = 5
1-simplices = 5
2-simplices = 1  (A<T<R)
no higher simplices
Euler characteristic = 1
```

Compute simplicial homology over `F2` by explicit boundary matrices.

Expected full-space Betti profile:

```text
beta0=1
beta1=0
beta2=0
```

For each role x, delete x, form the induced order complex, and compute its f-vector and F2 Betti profile.

Expected deletion f-vectors:

```text
delete A : (4,2,0)
delete R : (4,2,0)
delete B : (4,4,1)
delete M : (4,4,1)
delete T : (4,3,0)
```

Expected f-vector role partition:

```text
{A,R} | {B,M} | {T}
```

Expected deletion Betti profiles:

```text
delete A : (beta0,beta1,beta2)=(2,0,0)
delete R : (2,0,0)
delete B : (1,0,0)
delete T : (1,0,0)
delete M : (1,0,0)
```

Expected Betti role partition:

```text
{A,R} | {B,T,M}
```

## Cross-aperture reconciliation

Expected beat-terminal multiplicity partition:

```text
{A,R} | {T} | {B,M}
```

This equals the expected deletion-f-vector three-class partition as an unlabeled partition of roles.

The successor must distinguish:

```text
full topology structural role identity
!= local scalar role aliasing
!= deletion-complex role aliasing
!= homology role aliasing
!= beat-collapse endpoint identity
!= endomap homotopy-component identity
```

## Mandatory membranes

```text
TASK_TOPOLOGY_RIGIDITY != HOMOTOPY_RIGIDITY
AUTOMORPHISM_RIGIDITY != HOMOTOPY_IDENTITY_RIGIDITY
CONTINUOUS_ENDOMORPHISM != AUTOMORPHISM
HOMOTOPY_EQUIVALENCE != TASK_ROLE_IDENTITY
CONTRACTIBLE != TOPOLOGICALLY_TRIVIAL
BEAT_POINT_REMOVAL != SEMANTIC_TASK_DELETION
BEAT_COLLAPSE_TERMINAL_POINT != STRUCTURAL_ROLE_IDENTITY
ORDER_COMPLEX != PHYSICAL_GEOMETRY
SIMPLICIAL_HOMOLOGY != INFORMATION_CONTENT
BETTI_EQUIVALENCE != TASK_ROLE_EQUIVALENCE
EULER_CHARACTERISTIC != SEMANTIC_COMPLETENESS
COARSE_TOPOLOGICAL_INVARIANT != FULL_TASK_TOPOLOGY
LOCAL_SCALAR_APERTURE_ALIASING != ROLE_IDENTITY
JOINT_LOCAL_FINGERPRINT_RECOVERY != UNIVERSAL_TOMOGRAPHY
FINITE_CONTINUITY_CENSUS != UNIVERSAL_DYNAMICAL_SYSTEM
POINTWISE_COMPARABILITY_GRAPH != PHYSICAL_EVOLUTION
HOMOTOPY_CLASS_COLLAPSE != SOURCE_STATE_COLLAPSE
ROLE_DISTINGUISHABILITY_LADDER != SHANNON_INFORMATION_LADDER
FINITE_ROLE_TOMOGRAPHY != NATURAL_LANGUAGE_SEMANTIC_RECONSTRUCTION
WITNESS_ROUTING != SCIENTIFIC_ANCESTRY
```

No merge, deployment, publication, production, release, Vercel, source-state mutation, Proto-Loom/A16, #788 promotion, Shannon/entropy/mutual-information theorem, category/functor theorem, physical topology, continuum topology, physical homotopy, or natural-language semantic reconstruction theorem follows.

Sealed ⟐