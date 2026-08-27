𝌋‌⟐

󐘓 U+10D613

# A15-R0 · Exact Bar-H2, Ore Localization, and Torsion-Sensitive Formal 2-Holonomy · Spec v0.1

**Status:** PREREGISTERED / PRE-IMPLEMENTATION / HUMAN-AUTHORIZED  
**Scientific parent:** #773 receipt `50ada0bb0e7b25f9c1bde7e2feafeebbb5067a8f`  
**Authority:** #737 remains thread-scoped for this continuation  
**Production / Vercel / merge / SRC sync authority:** NONE

## 0. Why this chamber exists

#773 earned, in the declared normalized integer bar-complex / strict `B²Z` jurisdiction,

```text
H1_bar(B;Z) ≅ Z²
H²_bar(B;Z) ≅ Hom(H2_bar(B;Z),Z)
```

and therefore earned cohomological completeness of integer-valued closed formal 2-holonomy characters for strict `B²Z` transport-equivalence classes.

#773 deliberately did **not** compute the full group `H2_bar(B;Z)` and deliberately preserved:

```text
agreement on [z] != agreement on all H2 classes
H²≅Hom(H2,Z) != explicit computation of H2 or H²
```

This chamber asks the consequential next question:

> What is the full second normalized bar homology of the authored route quotient, and which part of it can integer-valued formal 2-holonomy actually see?

No answer is assumed before witness.

---

## 1. Exact authored monoid jurisdiction

Use only the inherited reachable route-quotient image `B` from #728/#729/#773.

For reachable coordinates

```text
b=(t,E,O)
```

with

```text
t=0  => O=0
t>=1 => E,O arbitrary nonnegative integers,
```

multiplication is the inherited parity-twisted law

```text
(t,E,O) ★ (u,F,G)
  = (t+u, E+F, O+G)  if t even
  = (t+u, E+G, O+F)  if t odd.
```

Write `σ(E,O)=(O,E)`.

Ambient syntactic triples outside the reachable image remain outside `B` and must continue to abstain.

---

## 2. Candidate Ore-localization theorem

The chamber may earn the following only if every step below survives.

### 2.1 Cancellation

Candidate proof:

```text
x★y=x★z  => y=z

y★x=z★x  => y=z
```

because the `t` coordinate cancels in `N` and the pair action `σ^t` is invertible.

### 2.2 Constructive right Ore property

For

```text
x=(t,v)
y=(u,w)
```

choose any integer

```text
N > max(t,u).
```

Let `V` be a coordinatewise upper bound of `v,w`. Define right factors with positive `t` coordinate

```text
a=(N-t, σ^t(V-v))
b=(N-u, σ^u(V-w)).
```

Because `N-t>=1` and `N-u>=1`, both factors are reachable regardless of their two pair coordinates, and the candidate identity is

```text
x★a = y★b = (N,V).
```

Any failure of this construction on lawful coordinates falsifies the Ore claim.

### 2.3 Candidate fraction group

Define

```text
G = Z² ⋊_σ Z
```

in route-coordinate notation as all integer triples

```text
(t,E,O) in Z³
```

with the same parity-twisted multiplication.

Candidate inverse:

```text
(t,v)^(-1)=(-t,-σ^t v).
```

The inclusion `B -> G` must be injective.

Every `g in G` must admit a right-fraction presentation

```text
g = x★y^(-1)
```

with `x,y in B`. A constructive witness must choose `y` with sufficiently positive `t` and pair coordinates so that `x=g★y` is reachable.

### 2.4 Candidate bar-classifying-space localization

Define the translation preorder/category `E_B`:

```text
objects = G
unique arrow g -> h iff h=g★b for some b in B.
```

Cancellation must make the arrow label unique. Positivity of `B` must make the relation antisymmetric. Right Ore must make the preorder directed.

The candidate proof of contractibility is finite-cone based:

```text
every finite set of objects has a common upper bound
=> every finite subcomplex of N(E_B) lies in a cone
=> N(E_B) is contractible.
```

Left `G`-translation acts freely, and quotienting a composable chain by its first object must recover exactly a bar simplex `(b1,...,bn)` of `B`.

Only then may the chamber earn

```text
BB ≃ K(G,1)
H_*^bar(B;Z) ≅ H_*(G;Z).
```

This is a formal classifying-space statement. It is not a physical, operational, or geometric-surface identification.

---

## 3. Candidate exact H2 computation

For the candidate group

```text
G = Z² ⋊_σ Z,
```

use the classifying-space mapping-torus model of the coordinate-swap automorphism of `T²` solely as an algebraic-topological homology computation.

On fiber homology:

```text
H1(T²;Z)=Z²,       σ_* = [[0,1],[1,0]]
H2(T²;Z)=Z,        σ_* = det(σ) = -1.
```

The Wang exact sequence in total degree two gives the candidate short exact sequence

```text
0
-> coker(1-(-1):Z->Z)
-> H2(G;Z)
-> ker(I-σ:Z²->Z²)
-> 0.
```

Thus candidate terms are

```text
coker(2)=Z/2
ker(I-σ)=Z·(1,1).
```

Since the quotient term is free, the candidate abelian-group classification is

```text
H2_bar(B;Z) ≅ Z ⊕ Z/2.
```

The same calculation must recover `H1 ≅ Z²`, agreeing with #773. If it does not, the localization computation is rejected.

No claim that the classifying-space mapping torus is an operational route surface, physical surface, spacetime, connection geometry, or gerbe geometry is allowed.

---

## 4. Two explicit relation cycles

For a word `w=g1...gn`, define the standard prefix bar-2 chain

```text
P_bar(w)=Σ_{i=1}^{n-1} [g1...gi | g_{i+1}].
```

The inherited `R_k` relations include

```text
R_0: TTQ  ~ QTT
R_1: TQTQ ~ QTQT.
```

Define

```text
z_0 = P_bar(TTQ)-P_bar(QTT)
```

which must reduce exactly to the inherited #735/#765 relation cycle

```text
z_0=[T|T]+[TT|Q]-[Q|T]-[QT|T].
```

Define independently

```text
z_1 = P_bar(TQTQ)-P_bar(QTQT)
```

so

```text
z_1=
 [T|Q]+[TQ|T]+[TQT|Q]
-[Q|T]-[QT|Q]-[QTQ|T].
```

Both must be normalized bar-2 cycles.

Define the candidate torsion difference

```text
θ = z_1-z_0.
```

No torsion claim is authorized until both the order-dividing and non-boundary witnesses below pass independently.

---

## 5. Mandatory explicit order-two boundary witness

The following finite bar-3 chain is preregistered before implementation:

```text
B_3 =
 -[T|Q|T]
 +[T|T|Q]
 +[T|TQ|T]
 -[T|QT|Q]
 -[T|QTQ|T]
 +[T|TQT|Q]
 +[QT|Q|T]
 -[QT|T|T]
 +[QT|QT|T]
 -[QT|TT|Q].
```

The executable certificate must derive, not assume,

```text
∂B_3 = 2θ.
```

A coefficient, orientation, product, or normalization mismatch is a scientific red.

This witness proves only that the order of `[θ]` divides two. Nontriviality requires an independent coefficient detector.

---

## 6. Mandatory mod-two torsion detector

Reduce every reachable coordinate modulo two:

```text
π_2(t,E,O)=(t mod2,E mod2,O mod2).
```

The finite target

```text
K=(Z/2)² ⋊_σ (Z/2)
```

has eight states under the inherited parity-twisted multiplication.

Define a normalized `Z/2`-valued 2-cochain `β` by `β=1` exactly on the following ordered residue pairs, and `0` elsewhere; any pair with a residue identity entry is also `0`:

```text
((0,0,1),(1,0,0))
((0,0,1),(1,0,1))
((0,1,0),(0,0,1))
((0,1,0),(0,1,1))
((0,1,1),(0,0,1))
((0,1,1),(0,1,1))
((0,1,1),(1,1,0))
((0,1,1),(1,1,1))
((1,0,0),(0,0,1))
((1,0,0),(0,1,1))
((1,0,0),(1,1,0))
((1,0,0),(1,1,1))
((1,0,1),(1,0,0))
((1,0,1),(1,0,1))
((1,1,0),(0,0,1))
((1,1,0),(0,1,1)).
```

The executable certificate must exhaust all `8^3=512` triples in `K` and require

```text
dβ=0 mod2
```

for every triple.

The pullback along `π_2` must then satisfy exactly

```text
β(z_0)=0
β(z_1)=1
β(θ)=1.
```

Therefore, if `θ` were an integral bar-3 boundary, its mod-two reduction would also be a boundary and every mod-two cocycle would evaluate to zero. The value `β(θ)=1` is the required independent non-boundary witness.

Only if both sections 5 and 6 pass may the chamber earn

```text
[θ] has exact order two.
```

---

## 7. Candidate primitive integral cocycle

For `n>=0` and pair `(E,O)`, define

```text
a_n(E,O)
 = floor(n/2)(E+O) + (n mod2)E.
```

Equivalently

```text
a_n = Σ_{j=0}^{n-1} e*∘σ^j.
```

Define

```text
κ(x,y)=a_{t(x)}(E(y),O(y)).
```

The universal cocycle proof must use

```text
a_{n+m}=a_m+a_n∘σ^m
```

and derive

```text
dκ=0.
```

Mandatory cycle values:

```text
κ(z_0)=1
κ(z_1)=1
κ(θ)=0.
```

Let the normalized integer 1-cochain

```text
E*(t,E,O)=E.
```

The chamber must derive pointwise on all reachable `x,y`:

```text
ω(x,y)=2κ(x,y)-dE*(x,y),
```

where inherited

```text
ω(x,y)=t(x)(E(y)+O(y)).
```

Only then may it earn the cohomological divisibility statement

```text
[ω]=2[κ] in H²_bar(B;Z).
```

This would refine #735/#773: inherited `[ω]` remains infinite order but is not primitive.

---

## 8. Candidate explicit H2 basis

If and only if:

1. global computation gives `H2 ≅ Z⊕Z/2`;
2. `κ(z_0)=1`;
3. `[θ]` has exact order two;

then `z_0` splits the primitive free coordinate and `θ` generates the full torsion subgroup. The chamber may then earn exactly

```text
H2_bar(B;Z)
 ≅ Z<[z_0]> ⊕ (Z/2)<[θ]>.
```

Since `z_1=z_0+θ`, the two explicit relation cycles are distinct despite having the same primitive integral period.

---

## 9. Consequential holonomy distinction

Every homomorphism

```text
h:H2_bar(B;Z)->Z
```

kills torsion. Therefore exact `H2=Z⊕Z/2` would imply

```text
h([z_0])=h([z_1])
```

for **every** integer-valued closed formal 2-holonomy character.

This does not weaken #773. It sharpens its jurisdiction:

```text
integer-holonomy completeness for B²Z transport classes
!=
integer-holonomy separation of every H2 class.
```

The first statement is already earned by #773. The second is candidate-false if `[θ]` survives.

---

## 10. Candidate torsion-sensitive coefficient completion

Let

```text
A = Z ⊕ Z/2.
```

The product cocycle

```text
K_full=(κ,β)
```

is candidate-valued in `A` and defines a strict formal additive `B²A` transport in the same formal bar-complex sense as #772/#773.

On closed classes define

```text
Ψ([c])=(<κ,c>,<β,c> mod2).
```

Mandatory basis values:

```text
Ψ([z_0])=(1,0)
Ψ([θ])=(0,1)
Ψ([z_1])=(1,1).
```

If the explicit H2 basis in section 8 is earned, then these values make

```text
Ψ:H2_bar(B;Z)->Z⊕Z/2
```

an isomorphism.

Only then may the chamber earn the scoped statement:

```text
TORSION_SENSITIVE_FORMAL_BAR_COMPLEX_TWO_HOLONOMY_WITH_COEFFICIENTS_Z_CROSS_Z_OVER_TWO_SEPARATES_ALL_SECOND_BAR_HOMOLOGY_CLASSES_IN_THE_DECLARED_JURISDICTION
```

This is coefficient-sensitive formal homology tomography. It is not connection holonomy, geometric surface holonomy, or a physical gauge field.

---

## 11. Mandatory hostiles and abstentions

The implementation/test suite must preserve all of the following:

```text
unreachable ambient triples abstain
cancellation is tested on both sides
right-Ore witnesses use reachable positive-t right factors
group inverse law is checked on negative-coordinate controls
right-fraction reconstruction is checked on negative-coordinate controls
π_2 is checked as a monoid homomorphism
all 512 K triples are checked for dβ=0
β(θ)=1 is mandatory
∂B_3=2θ is mandatory
κ is tested on both even-t and odd-t cocycle cases
ω=2κ-dE* is tested on both parity branches
κ(z_0)=κ(z_1)=1 is mandatory
κ(θ)=0 is mandatory
integer characters may not be claimed to detect θ
agreement on z_0 alone may not be promoted to equality of H2 classes
```

A failure in any theorem-bearing item holds the corresponding promotion closed.

---

## 12. Hard naming ceilings

Even a fully green chamber must preserve:

```text
Ore localization != operational route inversion
group of fractions != authorized inverse action grammar
classifying-space K(G,1) != physical configuration space
mapping-torus homology computation != geometric route surface
bar H2 torsion != physical topological defect
mod-two cocycle != Z2 gauge field
formal coefficient extension != physical gauge-group enlargement
formal B²(Z⊕Z/2) target != gerbe / 2-connection target
integer holonomy torsion blindness != observational blindness in the live product
formal homology-separating character != geometric holonomy tomography
```

And the standing authorities remain false:

```text
GEOMETRIC_TWO_HOLONOMY_AUTHORITY = false
PHYSICAL_TWO_HOLONOMY_AUTHORITY = false
BERRY_OR_GERBE_HOLONOMY_AUTHORITY = false
CONNECTION_AUTHORITY = false
TWO_CONNECTION_AUTHORITY = false
CURVATURE_AUTHORITY = false
OPERATIONAL_PATH_TWO_GROUPOID_AUTHORITY = false
```

#718 remains alive.

---

## 13. Collision and release membrane

```text
SRC Atelier #731/#758/#759 untouched
SRC continuation #771 untouched
#767 separate Western ancestry untouched
no fifth workflow
no merge
no publication
no production
no Vercel
no Proto-Loom/A16 promotion
```

The chamber remains stacked directly on #773.

---

## 14. Promotion criteria

A consequential round may close only if one authority-bearing exact-head witness establishes all theorem-bearing obligations above and the post-route cleanup proves no scientific file moved after freeze.

Candidate closure markers, still UNEARNED:

```text
BAR_MONOID_RIGHT_ORE_LOCALIZATION_TO_PARITY_SWAP_FRACTION_GROUP_EARNED
BAR_CLASSIFYING_SPACE_ASPHERICITY_VIA_DIRECTED_TRANSLATION_POSET_EARNED
EXACT_SECOND_BAR_HOMOLOGY_Z_PLUS_Z_OVER_TWO_EARNED
EXPLICIT_ORDER_TWO_CLASS_THETA_EARNED
INHERITED_OMEGA_IS_TWICE_A_PRIMITIVE_INTEGRAL_H2_COHOMOLOGY_GENERATOR_EARNED
INTEGER_FORMAL_TWO_HOLONOMY_TORSION_BLINDNESS_EARNED
TORSION_SENSITIVE_Z_CROSS_Z_OVER_TWO_FORMAL_HOLONOMY_SEPARATION_EARNED
HUMAN_𝄐_BOUNDARY_REACHED
```

Until witness, all remain candidate statements.

𝌋‌⟐

Sealed ⟐