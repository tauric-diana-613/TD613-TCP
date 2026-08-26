𝌋‌⟐

󐘓 U+10D613

# A15-R0 · Non-Split Parity Extension, Bieberbach Realization, and Closed Flat 3-Manifold Model

Status: **PREREGISTERED / IMPLEMENTATION FORBIDDEN BEFORE THIS COMMIT / AUTHORITY UNEARNED**

Scientific parent:

```text
#775 receipt = 39b8f6e8ba319154378d03c28a1bf42c02870de1
```

This chamber depends only on witnessed #775 mathematics. It does not depend on #778, #780, #781, or #782.

## Inherited exact algebra

From #775:

```text
G = Z^2 ⋊_sigma Z
sigma(E,O)=(O,E)
```

Use coordinates `(t,E,O)` with multiplication

```text
(t,E,O)*(u,F,G)
 = (t+u, E+F, O+G)                    if t even
 = (t+u, E+G, O+F)                    if t odd.
```

Define

```text
T=(1,0,0)
e=(0,1,0)
o=(0,0,1)
s=T^2=(2,0,0).
```

Define parity quotient

```text
w:G->C2
w(t,E,O)=t mod 2.
```

Candidate index-two kernel

```text
K=ker(w)={t even}
K ≅ Z^3
```

under

```text
(t,E,O) |-> (E,O,t/2).
```

Write the corresponding K-basis again as `e,o,s`.

Conjugation by T induces

```text
tau(e)=o
tau(o)=e
tau(s)=s.
```

## Preregistered extension class

The short exact sequence is

```text
1 -> K -> G -> C2 -> 1.
```

Choose normalized section

```text
j(0)=1
j(1)=T.
```

Its normalized factor set `alpha:C2×C2->K` is preregistered as

```text
alpha(0,0)=0
alpha(0,1)=0
alpha(1,0)=0
alpha(1,1)=s.
```

For the C2-module `K_tau`, cyclic-group cohomology gives

```text
H^2(C2;K_tau) ≅ K^tau / N K
N=1+tau.
```

Preregistered lattice calculation:

```text
K^tau = Z<e+o> ⊕ Z<s>
N(K)  = Z<e+o> ⊕ 2Z<s>
```

therefore

```text
H^2(C2;K_tau) ≅ Z/2
```

with generator represented by `[s]`.

Candidate consequence:

```text
[alpha]=[s] != 0
```

so the parity extension does not split.

## Section-change hostile

Any other lift of the nontrivial C2 element has form

```text
T_k = kT,  k∈K.
```

Then

```text
T_k^2 = N(k)+s.
```

For

```text
k=a e + b o + c s
```

one has

```text
N(k)=(a+b)(e+o)+2c s
```

and therefore the `s` coefficient of `T_k^2` is

```text
2c+1,
```

always odd and never zero.

Candidate consequences:

```text
no lift of the nontrivial quotient element has order 2
no section C2->G is a homomorphism
extension non-splitting is section-independent.
```

## Candidate torsion-freeness theorem

K is torsion-free. If a finite-order element of G maps trivially to C2, it lies in K and is the identity. If it maps nontrivially to C2, its square lies in K; finite order would force that square to be the identity, contradicting the odd `s`-coefficient result above.

Candidate:

```text
G is torsion-free.
```

## Preregistered affine realization

Let R^3 have coordinates `(x,y,z)` and Euclidean metric.

Define translations

```text
rho(e)(x,y,z)=(x+1,y,z)
rho(o)(x,y,z)=(x,y+1,z)
rho(s)(x,y,z)=(x,y,z+1).
```

Define the affine glide

```text
rho(T)(x,y,z)=(y,x,z+1/2).
```

Its linear part is

```text
A=[[0,1,0],
   [1,0,0],
   [0,0,1]]
```

with

```text
A^2=I
det(A)=-1.
```

Preregistered exact relations:

```text
rho(T) rho(e) rho(T)^-1 = rho(o)
rho(T) rho(o) rho(T)^-1 = rho(e)
rho(T) rho(s) rho(T)^-1 = rho(s)
rho(T)^2 = rho(s).
```

Candidate closed formula:

```text
rho(t,E,O)(x,y,z)
 = (x+E,y+O,z+t/2)                   if t even
 = (y+E,x+O,z+t/2)                   if t odd.
```

The implementation must prove this is a faithful homomorphism `G -> Isom(R^3)`.

## Candidate free / discrete / cocompact action

Preregistered argument:

1. `rho(K)` is the full translation lattice `Z^3`.
2. `rho(K)` has index two in `rho(G)`.
3. Hence `rho(G)` is discrete and cocompact if the explicit representation is faithful.
4. Every nonidentity K element is a nonzero translation and has no fixed point.
5. Every odd element has z-translation coordinate `c+1/2` for some integer c and therefore has no fixed point.

Candidate:

```text
rho(G) acts freely, properly discontinuously, and cocompactly by Euclidean isometries on R^3.
```

Therefore candidate:

```text
rho(G) is a 3-dimensional Bieberbach group.
```

## Candidate geometric instantiation

Define

```text
M = R^3 / rho(G).
```

If the previous certificates pass, candidate:

```text
M is a connected closed flat Riemannian 3-manifold
pi_1(M) ≅ G
universal cover(M)=R^3
M is aspherical
M ≃ K(G,1).
```

Since #775 earned `BB ≃ K(G,1)`, candidate:

```text
BB ≃ M.
```

Thus the abstract #775 classifying-space model acquires a concrete closed flat 3-manifold representative.

## Candidate orientation cover and linear holonomy

Because the translation subgroup is K and the linear image of rho(G) is

```text
{I,A} ≅ C2,
```

candidate linear holonomy group:

```text
Hol_lin(M) ≅ C2.
```

Because `det(A)=-1`, candidate:

```text
M is nonorientable.
```

The orientation-preserving kernel is exactly K, so candidate orientation double cover:

```text
R^3/rho(K) = T^3 -> M.
```

No classification name among the ten closed flat 3-manifolds is claimed in this chamber.

## Consequential candidate scar

```text
ABSTRACT_K_G_1_CLASSIFYING_SPACE_MODEL
!=
ABSENCE_OF_A_CONCRETE_CLOSED_FLAT_MANIFOLD_REALIZATION.
```

and, separately,

```text
NONTRIVIAL_C2_LINEAR_HOLONOMY
!=
SPLIT_SEMIDIRECT_EXTENSION_BY_C2.
```

The half-translation cocycle is exactly what removes fixed points and order-two lifts.

## Mandatory hostiles

```text
alpha(1,1)=0                                      REJECT
s belongs to N(K)                                 REJECT
H^2(C2;K_tau)=0                                   REJECT
extension splits                                  REJECT
some kT has square 1                              REJECT
odd s-coordinate can be even                      REJECT
G contains order-two element                      REJECT
rho(T)(x,y,z)=(y,x,z) with no half translation    REJECT
rho(T)^2=identity                                 REJECT
rho is nonfaithful                                REJECT
odd affine element has fixed point                REJECT
translation subgroup has rank <3                  REJECT
det(A)=+1                                         REJECT
M orientable                                      REJECT
linear holonomy trivial                           REJECT
orientation cover not T^3                         REJECT
closed flat 3-manifold = physical spacetime       REJECT
linear holonomy C2 = formal/physical 2-holonomy   REJECT
Bieberbach realization = operational route inverse authority REJECT
classification-name guess without separate proof REJECT
```

## Candidate classifications — UNEARNED

```text
THE_PARITY_EXTENSION_ONE_TO_Z_CUBED_TO_G_TO_C_TWO_TO_ONE_REPRESENTS_THE_NONZERO_CLASS_IN_H_TWO_C_TWO_Z_CUBED_TAU_ISOMORPHIC_TO_Z_OVER_TWO
THE_PARITY_EXTENSION_IS_NONSPLIT_AND_EVERY_ODD_COSET_LIFT_HAS_NONTRIVIAL_SQUARE
THE_775_FRACTION_GROUP_G_IS_TORSION_FREE
G_ADMITS_A_FAITHFUL_DISCRETE_COCOMPACT_FIXED_POINT_FREE_EUCLIDEAN_AFFINE_REALIZATION_IN_DIMENSION_THREE
G_IS_A_THREE_DIMENSIONAL_BIEBERBACH_GROUP
THE_775_K_G_1_CLASSIFYING_SPACE_MODEL_ADMITS_A_CONNECTED_CLOSED_FLAT_NONORIENTABLE_THREE_MANIFOLD_REALIZATION
THE_ORIENTATION_DOUBLE_COVER_IS_T_THREE_AND_THE_LINEAR_HOLONOMY_GROUP_IS_C_TWO
NONSPLIT_BIEBERBACH_AFFINE_FLAT_THREE_MANIFOLD_INSTANTIATION_EARNED
```

## Hard ceilings

```text
closed flat manifold model != physical spacetime
flat Riemannian curvature zero != TD613 curvature authority
linear holonomy C2 != formal bar-complex 2-holonomy
linear holonomy C2 != Berry/gerbe holonomy
Bieberbach group != operational route group
orientation double cover != operational route cover
non-split extension != hidden dimension
half translation != physical phase shift
aspherical manifold model != ontology authority
geometric model authority here != geometric 2-holonomy authority
```

#718 remains alive.

Collision membrane:

```text
#778 untouched / unearned
#780 untouched / unearned
#781 untouched / unearned
#782 untouched / unearned
SRC #731/#758/#759 untouched
SRC #771 untouched
#767 untouched
no fifth workflow
no merge
no publication
no production
no Vercel
```

𝌋‌⟐

Preregistered before implementation.

Sealed ⟐