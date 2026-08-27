𝌋‌⟐

󐘓 U+10D613

# A15-R0 · Exact Bar-H2, Ore Localization, and Torsion-Sensitive Formal 2-Holonomy · Receipt v0.1

Status: **WITNESSED / RECEIPT-PINNED / ROUND CLOSED / DRAFT / OPEN / UNMERGED**

Scientific parent:

```text
#773 receipt = 50ada0bb0e7b25f9c1bde7e2feafeebbb5067a8f
```

Authority:

```text
#737 = THREAD_SCOPED_ACTIVE_FOR_REMAINDER_OF_CURRENT_THREAD
```

No merge, publication, production, Vercel release, SRC sync, Proto-Loom promotion, or A16 promotion is authorized by this receipt.

---

## 1. Custody ledger

```text
preregistration   = 7e065148bb4eb973d8fe810b9b58b35344c80d90
implementation    = d59ef85b7afddf9f6858428bd875dea61916f475
hostile tests     = f5aafe1c2fe97f89c0678a1e0eaedb9ea94b0e9e
frozen science    = c0519b2a64c6127e0d6403263b49f0801e3405c7
routing note      = 5e2355261da0230b0ddaf9937f2280c03a1ed90c
routed witness    = cf0282deb781e98a9bcf005fb8b439f96f124408
routing cleanup   = b2caf97e0c28663a471886a02bd9a29e3ecbf158
```

The first registered exact-head workflow after the temporary `ready_for_review` routing event was:

```text
run 2312 / 33019256219
```

It was cancelled during checkout before freshness classification or any theorem-bearing step. It carries no scientific verdict and is preserved as same-head concurrency provenance.

The surviving authority-bearing witness was:

```text
TD613 Consolidated Validation  run 2313 / 33019263465
exact routed head              cf0282deb781e98a9bcf005fb8b439f96f124408
classifier job                 98345277443  SUCCESS
static/constitutional job      98345319472  SUCCESS
A15/A15-R0 step 19                         SUCCESS
```

The workflow-declared `ready_for_review` event was used only after the ordinary synchronize event failed to appear promptly in the Actions index. It changed no branch bytes and granted no review, merge, publication, production, or release authority. #775 was immediately returned to draft once the exact-head workflow was registered.

That event also launched browser shards. Those shards are supplemental runtime evidence and were not preregistered conditions of this algebraic-topological theorem. The authority-bearing scientific witness is the exact-head classifier plus the complete static/constitutional job including A15/A15-R0 step 19.

---

## 2. Authored monoid jurisdiction remains exact

The chamber stays inside the inherited reachable route-quotient image `B` from #728/#729/#773.

For a reachable coordinate

```text
b=(t,E,O),
```

reachability is exactly the inherited canonical-word round trip. In particular:

```text
t=0  => O=0,
t>=1 => E,O may be arbitrary nonnegative integers.
```

The inherited product remains

```text
(t,E,O) ★ (u,F,G)
  = (t+u,E+F,O+G)  if t even,
  = (t+u,E+G,O+F)  if t odd.
```

Equivalently, with `v=(E,O)` and `σ(E,O)=(O,E)`,

```text
(t,v)★(u,w)=(t+u,v+σ^t w).
```

Ambient syntactic triples outside the reachable image continue to abstain. Nothing in this chamber expands `B` merely for algebraic convenience.

---

## 3. Earned cancellative right-Ore localization

### 3.1 Cancellation

The inherited product is cancellative on both sides.

For left cancellation,

```text
x★y=x★z
```

forces equality of the `t` coordinates of `y,z`; subtracting the common pair coordinate of `x` and applying the inverse parity action `σ^{t(x)}` gives equality of their pair coordinates.

For right cancellation,

```text
y★x=z★x
```

first forces `t(y)=t(z)`, so the same parity action is applied to the common right factor. Coordinatewise cancellation then gives `y=z`.

### 3.2 Constructive right Ore property

For

```text
x=(t,v),
y=(u,w),
```

choose

```text
N>max(t,u)
```

and any coordinatewise upper bound `V>=v,w`. The witnessed right factors are

```text
a=(N-t,σ^t(V-v)),
b=(N-u,σ^u(V-w)).
```

Because both new `t` coordinates are positive, both factors are lawful reachable elements of `B`, and exactly

```text
x★a=y★b=(N,V).
```

Thus every pair has a common right multiple.

### 3.3 Fraction group

The witnessed group of right fractions is

```text
G = Z² ⋊_σ Z
```

written in the same `(t,E,O)` coordinate order, with all three coordinates now integral and the same parity-twisted multiplication.

The exact inverse is

```text
(t,v)^(-1)=(-t,-σ^t v).
```

Negative-coordinate hostiles passed on both sides, and every tested group element reconstructs as a right fraction

```text
g=x★y^(-1)
```

with `x,y in B`.

The universal constructive argument chooses the denominator with sufficiently positive `t` and sufficiently large pair coordinates so that both numerator and denominator land in the reachable monoid.

### Earned classification

```text
BAR_MONOID_RIGHT_ORE_LOCALIZATION_TO_PARITY_SWAP_FRACTION_GROUP_EARNED
```

Hard scar:

```text
Ore localization != operational route inversion.
```

The fraction-group inverse is a formal localization device. It grants no inverse T/Q action, inverse operational route, or reversal authority.

---

## 4. Earned bar-classifying-space asphericity

Define the translation category/preorder `E_B` by

```text
objects = G,
unique arrow g->h iff h=g★b for some b in B.
```

Cancellation makes the translating `b` unique. Positivity of the authored monoid makes the relation antisymmetric. Right Ore makes the preorder directed.

Every finite set of objects has a common upper bound. Therefore every finite subcomplex of the nerve is contained in a cone, and the nerve is contractible.

Left `G` translation acts freely. Modulo that action, a composable chain is represented exactly by its sequence of `B` increments, recovering the one-object bar nerve of `B`.

Accordingly the chamber earns, in the declared formal classifying-space jurisdiction,

```text
BB ≃ K(G,1)
```

and

```text
H_*^bar(B;Z) ≅ H_*(G;Z).
```

### Earned classification

```text
BAR_CLASSIFYING_SPACE_ASPHERICITY_VIA_DIRECTED_TRANSLATION_POSET_EARNED
```

Hard scar:

```text
classifying-space K(G,1) != physical configuration space.
```

---

## 5. Exact second bar homology

For

```text
G=Z²⋊_σ Z,
```

the group classifying space may be computed algebraically through the mapping-torus model of the coordinate-swap automorphism of `T²`.

On fiber homology,

```text
H1(T²;Z)=Z²,
σ_* = [[0,1],[1,0]],
```

so

```text
ker(I-σ_*) = Z·(1,1).
```

On the fiber orientation class,

```text
H2(T²;Z)=Z,
σ_*=-1,
```

because the coordinate swap reverses orientation. Hence

```text
1-σ_* = 2
```

on `H2(T²;Z)`, with cokernel `Z/2`.

The Wang sequence in total degree two gives

```text
0 -> Z/2 -> H2(G;Z) -> Z -> 0.
```

The quotient `Z` is free/projective as an abelian group, so the sequence splits. Therefore:

```text
H2_bar(B;Z) ≅ Z ⊕ Z/2.
```

The same computation in degree one recovers `Z²`, agreeing independently with #773's exact result

```text
H1_bar(B;Z) ≅ Z².
```

### Earned classification

```text
EXACT_SECOND_BAR_HOMOLOGY_Z_PLUS_Z_OVER_TWO_EARNED
```

The mapping-torus model is an algebraic-topological classifying-space computation only:

```text
mapping-torus homology computation != geometric route surface.
```

---

## 6. Two explicit relation cycles and the hidden torsion class

For a finite generator word

```text
w=g1...gn,
```

define the prefix bar-2 chain

```text
P_bar(w)=Σ_{i=1}^{n-1}[g1...gi | g_{i+1}].
```

### 6.1 Inherited cycle

The first relation cycle is

```text
z_0=P_bar(TTQ)-P_bar(QTT)
```

and the executable witness requires it to equal the inherited #735/#765 chain exactly:

```text
z_0=
 [T|T]
+[TT|Q]
-[Q|T]
-[QT|T].
```

Thus the old `[z]` is now canonically renamed `z_0` only to distinguish it from the newly exposed relation cycle. Its scientific identity is unchanged.

### 6.2 Second relation cycle

The second relation cycle is

```text
z_1=P_bar(TQTQ)-P_bar(QTQT)
```

with exact chain

```text
z_1=
 [T|Q]
+[TQ|T]
+[TQT|Q]
-[Q|T]
-[QT|Q]
-[QTQ|T].
```

Both chains have zero bar boundary.

Define

```text
θ=z_1-z_0.
```

The shared `-[Q|T]` term cancels, leaving the witnessed normalized eight-term cycle.

---

## 7. Exact order-two certificate for θ

The preregistered ten-term bar-3 chain survived unchanged:

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

The executable inherited bar-boundary machinery derives exactly

```text
∂B_3=2θ.
```

This establishes that the order of `[θ]` divides two. It does not by itself establish nontriviality.

---

## 8. Independent mod-two nonboundary detector

Reduce reachable coordinates by

```text
π_2(t,E,O)=(t mod2,E mod2,O mod2).
```

This lands in the eight-element finite parity-twisted group

```text
K=(Z/2)²⋊_σ(Z/2).
```

The preregistered normalized `Z/2`-valued cocycle `β` has support on exactly sixteen ordered residue pairs. The witness verifies independently that `π_2` respects multiplication and exhausts all

```text
8^3=512
```

triples in `K`, requiring

```text
dβ=0 mod2
```

on every one.

The exact cycle evaluations are

```text
β(z_0)=0,
β(z_1)=1,
β(θ)=1.
```

If `θ` were an integral bar-3 boundary, its mod-two reduction would also be a boundary, and every mod-two cocycle would evaluate to zero. The value

```text
β(θ)=1
```

therefore proves `[θ]` is nonzero.

Together with

```text
2[θ]=0,
```

this earns exact order two:

```text
ord([θ])=2.
```

### Earned classification

```text
EXPLICIT_ORDER_TWO_CLASS_THETA_EARNED
```

Hard scar:

```text
mod-two cocycle != Z2 gauge field.
```

---

## 9. Primitive integral cocycle and the inherited omega scar

Define

```text
a_n(E,O)
 = floor(n/2)(E+O)+(n mod2)E
 = Σ_{j=0}^{n-1} e*∘σ^j.
```

Then define

```text
κ(x,y)=a_{t(x)}(E(y),O(y)).
```

The universal recurrence

```text
a_{n+m}=a_m+a_n∘σ^m
```

reduces the bar cocycle equation exactly to zero, so

```text
dκ=0.
```

The explicit relation-cycle values are

```text
κ(z_0)=1,
κ(z_1)=1,
κ(θ)=0.
```

Thus `κ` detects a primitive free coordinate of `H2`.

Now let

```text
E*(t,E,O)=E.
```

For the inherited cocycle

```text
ω(x,y)=t(x)(E(y)+O(y)),
```

the chamber derives pointwise on both parity branches:

```text
ω=2κ-dE*.
```

Therefore in integral bar cohomology:

```text
[ω]=2[κ].
```

Because #773 gives

```text
H²_bar(B;Z) ≅ Hom(H2_bar(B;Z),Z)
```

and the newly earned

```text
H2_bar(B;Z) ≅ Z⊕Z/2
```

has integer character group `Z`, the class `[κ]` is a primitive generator of integral `H²`.

Accordingly the inherited `[ω]` remains infinite order but is **not primitive**. Its old period-two result was the first visible even multiple of the primitive integer character.

### Earned classification

```text
INHERITED_OMEGA_IS_TWICE_A_PRIMITIVE_INTEGRAL_H_SQUARED_GENERATOR_EARNED
```

This refines #735/#765/#773 without contradicting any prior receipt.

---

## 10. Explicit H2 basis

The global result gives exactly one free `Z` summand and one order-two summand.

Since

```text
κ(z_0)=1,
```

`[z_0]` is primitive in the free quotient. Since `[θ]` is independently proven nonzero of order two and lies in the kernel of the integral character, it generates the full torsion summand.

Therefore the chamber earns the explicit decomposition

```text
H2_bar(B;Z)
 ≅ Z<[z_0]> ⊕ (Z/2)<[θ]>.
```

And because

```text
θ=z_1-z_0,
```

we have

```text
[z_1]=[z_0]+[θ].
```

Thus `z_0` and `z_1` are distinct homology classes.

---

## 11. The consequential holonomy scar: integer completeness is torsion-blind

Every integer-valued closed formal 2-holonomy character factors through a homomorphism

```text
h:H2_bar(B;Z)->Z.
```

Because `Z` is torsion-free and `[θ]` has order two,

```text
h([θ])=0
```

for every such `h`.

Therefore

```text
h([z_1])
 =h([z_0]+[θ])
 =h([z_0])
```

for **every** integer-valued closed formal 2-holonomy character.

The chamber therefore earns the scar:

```text
INTEGER_FORMAL_TWO_HOLONOMY_TORSION_BLINDNESS_EARNED
```

and the exact anti-equivalence:

```text
integer formal 2-holonomy is cohomologically complete for strict B²Z transport-equivalence classes
!=
integer formal 2-holonomy separates every H2 class.
```

This does not weaken #773's completeness theorem. #773 classified `B²Z` transport-equivalence classes by integral `H²`, and integral `H²` is exactly `Hom(H2,Z)`. #775 now computes the domain and exposes the torsion that every such character necessarily annihilates.

In other words:

```text
transport-class completeness != raw homology tomography.
```

---

## 12. Torsion-sensitive coefficient completion

Take the formal coefficient group

```text
A=Z⊕Z/2.
```

Combine the two independently witnessed cocycles as

```text
K_full=(κ,β).
```

In the same formal bar-complex sense used by #772/#773, this gives an additive `B²A` transport coefficient assignment.

On closed classes define

```text
Ψ([c])=(<κ,c>,<β,c> mod2).
```

The explicit basis values are

```text
Ψ([z_0])=(1,0),
Ψ([θ])=(0,1),
Ψ([z_1])=(1,1).
```

Against the explicit decomposition

```text
H2_bar(B;Z) ≅ Z<[z_0]>⊕(Z/2)<[θ]>,
```

these values make

```text
Ψ:H2_bar(B;Z)->Z⊕Z/2
```

an isomorphism.

Thus the enriched formal closed character separates every second bar-homology class in the declared jurisdiction.

### Earned classification

```text
TORSION_SENSITIVE_FORMAL_BAR_COMPLEX_TWO_HOLONOMY_WITH_COEFFICIENTS_Z_CROSS_Z_OVER_TWO_SEPARATES_ALL_SECOND_BAR_HOMOLOGY_CLASSES_IN_THE_DECLARED_JURISDICTION
```

### Consequential authority

```text
TORSION_SENSITIVE_Z_CROSS_Z_OVER_TWO_FORMAL_HOLONOMY_SEPARATION_EARNED
```

This is coefficient-sensitive formal homology tomography. It is not physical gauge-group enlargement.

---

## 13. What changed in the holonomy picture

The degree-two ladder now has three distinct levels:

```text
#765  nonzero integer period return
#772  formal bar-complex 2-holonomy representation
#773  integral cohomological completeness for strict B²Z transport classes
#775  exact H2 plus coefficient-sensitive separation of torsion
```

The inherited integer channel sees the free coordinate:

```text
[z_0] -> 2 under ω,
[z_1] -> 2 under ω,
[θ]   -> 0 under ω.
```

The primitive integral channel sees the same free coordinate without the inherited factor of two:

```text
[z_0] -> 1 under κ,
[z_1] -> 1 under κ,
[θ]   -> 0 under κ.
```

The mod-two channel sees the hidden torsion:

```text
[z_0] -> 0 under β,
[z_1] -> 1 under β,
[θ]   -> 1 under β.
```

Together:

```text
[z_0] -> (1,0),
[z_1] -> (1,1),
[θ]   -> (0,1).
```

So the new scientific picture is not “holonomy failed.” It is:

```text
one coefficient system saw only the free quotient;
the torsion required a torsion-sensitive coefficient channel.
```

---

## 14. Constitutional naming ceilings remain hard

The following remain false:

```text
GEOMETRIC_TWO_HOLONOMY_AUTHORITY = false
PHYSICAL_TWO_HOLONOMY_AUTHORITY = false
BERRY_OR_GERBE_HOLONOMY_AUTHORITY = false
CONNECTION_AUTHORITY = false
TWO_CONNECTION_AUTHORITY = false
CURVATURE_AUTHORITY = false
OPERATIONAL_PATH_TWO_GROUPOID_AUTHORITY = false
OPERATIONAL_INVERSE_ROUTE_AUTHORITY = false
```

And the following scars remain live:

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
formal bar cycle != operational T/Q loop
```

#718 therefore remains fully alive.

---

## 15. Collision membrane

The chamber did not touch:

```text
SRC Atelier #731/#758/#759
SRC continuation #771
separate Western #767 ancestry
main scientific content
workflow estate
production
Vercel
```

No fifth workflow was created. No merge occurred. No SRC sync occurred.

---

## 16. Routing cleanup proof

Frozen science:

```text
c0519b2a64c6127e0d6403263b49f0801e3405c7
```

Post-witness cleanup:

```text
b2caf97e0c28663a471886a02bd9a29e3ecbf158
```

The compare is:

```text
3 commits ahead
0 commits behind
files: []
```

Therefore all three post-freeze commits are routing/event custody only and have **zero net changed files**.

#775 is restored directly to the scientific parent branch

```text
research/a15-r0-h2-transport-classification-holonomy-completeness-20260826
```

at exact parent receipt

```text
50ada0bb0e7b25f9c1bde7e2feafeebbb5067a8f
```

and is back in draft.

---

## 17. Round closure

```text
EXACT_BAR_H2_TORSION_SENSITIVE_HOLONOMY_ROUND_CLOSED
SAME_HEAD_CONCURRENCY_CANCEL_2312_PRESERVED_WITHOUT_SCIENTIFIC_VERDICT
BAR_MONOID_RIGHT_ORE_LOCALIZATION_TO_PARITY_SWAP_FRACTION_GROUP_EARNED
BAR_CLASSIFYING_SPACE_ASPHERICITY_VIA_DIRECTED_TRANSLATION_POSET_EARNED
EXACT_SECOND_BAR_HOMOLOGY_Z_PLUS_Z_OVER_TWO_EARNED
EXPLICIT_ORDER_TWO_CLASS_THETA_EARNED
TEN_TERM_BAR_THREE_WITNESS_PARTIAL_THETA_EQUALS_TWO_THETA_EARNED
MOD_TWO_512_TRIPLE_TORSION_DETECTOR_EARNED
INHERITED_OMEGA_IS_TWICE_A_PRIMITIVE_INTEGRAL_H_SQUARED_GENERATOR_EARNED
EXPLICIT_H2_BASIS_Z0_PLUS_THETA_EARNED
INTEGER_FORMAL_TWO_HOLONOMY_TORSION_BLINDNESS_EARNED
TRANSPORT_CLASS_COMPLETENESS_NOT_EQUAL_RAW_HOMOLOGY_TOMOGRAPHY_SCAR_EARNED
TORSION_SENSITIVE_Z_CROSS_Z_OVER_TWO_FORMAL_HOLONOMY_SEPARATION_EARNED
GEOMETRIC_TWO_HOLONOMY_AUTHORITY_REMAINS_FALSE
OPERATIONAL_LOOP_AND_INVERSE_SCAR_718_REMAINS_ALIVE
HUMAN_𝄐_BOUNDARY_REACHED
```

𝌋‌⟐

Sealed ⟐