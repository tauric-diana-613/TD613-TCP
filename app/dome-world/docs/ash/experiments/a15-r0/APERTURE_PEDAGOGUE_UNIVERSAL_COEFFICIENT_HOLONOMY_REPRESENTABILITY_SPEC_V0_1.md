𝌋‌⟐

󐘓 U+10D613

# A15-R0 · Universal-Coefficient Formal 2-Holonomy Representability and Faithful-Target Criterion · Spec v0.1

**Status:** PREREGISTERED / PRE-IMPLEMENTATION / HUMAN-AUTHORIZED  
**Scientific parent:** #775 receipt `39b8f6e8ba319154378d03c28a1bf42c02870de1`  
**Authority:** #737 THREAD_SCOPED_ACTIVE_FOR_REMAINDER_OF_CURRENT_THREAD  
**Merge / publication / production / Vercel / SRC sync / Proto-Loom / A16 authority:** NONE

## 0. Consequential question

#775 earned the exact integral second bar homology

```text
H := H_2^bar(B;Z) ≅ Z<[z_0]> ⊕ (Z/2)<[theta]>
```

and one torsion-sensitive formal coefficient target

```text
A_0 = Z ⊕ Z/2
```

with explicit cocycle pair

```text
K_full=(kappa,beta)
```

whose closed character is an isomorphism

```text
Psi:H -> Z ⊕ Z/2,
Psi([z_0])=(1,0),
Psi([theta])=(0,1).
```

That proves existence of a faithful torsion-sensitive formal target. It does **not** yet prove why this target is universal, how arbitrary abelian coefficient groups behave, or which coefficient groups admit any faithful single closed formal 2-holonomy character.

This chamber asks exactly that.

## 1. General formal coefficient jurisdiction

Let `A` be an arbitrary abelian group, written additively.

Define the strict formal target

```text
B^2 A
```

with one object, one 1-cell, and 2-endomorphism group `A`.

Inside the exact #772 formal bar-chain 2-groupoid jurisdiction, an additive formal 2-transport assignment is a group homomorphism

```text
F:C_2^bar(B;Z) -> A.
```

Because `C_2` is free abelian on normalized bar-2 basis cells, this is exactly an `A`-valued normalized 2-cochain.

Representative invariance under bar-3 boundary shift is exactly

```text
F o partial_3 = 0,
```

i.e. the 2-cocycle equation.

Formal boundary re-zeroing by an `A`-valued normalized 1-cochain `phi` changes

```text
F -> F + d phi.
```

Therefore the candidate coefficient-general transport classification is

```text
T_2(A)
:= {strict B^2A-valued formal 2-transports}/formal-boundary-rezeroing
≅ H_bar^2(B;A).
```

No connection-gauge language is authorized.

## 2. Natural Universal Coefficient bridge for every abelian A

The normalized bar chain groups are free abelian. Ordinary cohomological UCT gives naturally in `A`

```text
0
-> Ext_Z^1(H_1^bar(B;Z),A)
-> H_bar^2(B;A)
-> Hom(H_2^bar(B;Z),A)
-> 0.
```

#773/#775 earned

```text
H_1^bar(B;Z) ≅ Z^2.
```

Since free abelian groups are projective,

```text
Ext_Z^1(Z^2,A)=0
```

for **every** abelian group `A`.

Acceptance therefore requires the natural isomorphism

```text
T_2(A)
≅ H_bar^2(B;A)
≅ Hom(H,A).
```

The word `natural` is mandatory: for every coefficient homomorphism

```text
f:A->A',
```

coefficient pushforward of cochains must commute with evaluation on homology:

```text
[f o F] = f_*[F]
```

and under the UCT identification the corresponding character is exactly

```text
h -> f o h.
```

A non-natural choice of a splitting is not sufficient; the chamber relies only on the canonical evaluation map after the Ext term vanishes.

## 3. Exact coefficient classification A ⊕ A[2]

From #775,

```text
H ≅ Z ⊕ Z/2.
```

For any abelian `A`, define its 2-torsion subgroup

```text
A[2] = {b in A : 2b=0}.
```

Every homomorphism

```text
h:H->A
```

is determined uniquely by

```text
a=h([z_0]) in A,
b=h([theta]) in A[2].
```

Conversely every pair `(a,b)` with `2b=0` defines exactly

```text
h_(a,b)(n,epsilon)=n a + epsilon b,
epsilon in Z/2.
```

Acceptance requires the natural classification

```text
T_2(A) ≅ A ⊕ A[2].
```

This is an isomorphism of abelian groups in the formal transport-equivalence jurisdiction.

## 4. Universal representing object

Define

```text
H = Z ⊕ Z/2
```

using the explicit #775 basis `[z_0],[theta]`.

#775's cocycle pair

```text
K_full=(kappa,beta)
```

is `H`-valued and has

```text
K_full([z_0])=(1,0)
K_full([theta])=(0,1).
```

Under

```text
T_2(H) ≅ Hom(H,H),
```

acceptance requires the exact identification

```text
[K_full] <-> id_H.
```

Call this class

```text
U in T_2(H)
```

the **universal formal degree-two transport class**.

For every abelian `A` and every transport-equivalence class

```text
[F] in T_2(A),
```

there must exist a unique coefficient homomorphism

```text
h_F:H->A
```

such that

```text
[F] = (h_F)_*(U).
```

Equivalently:

```text
T_2(-) ≅ Hom(H,-)
```

as functors `Ab->Ab`.

This is the representability target of the chamber.

The chamber may use the Yoneda vocabulary only in this ordinary category-theoretic sense. It grants no ontology or physical universality authority.

## 5. Faithful raw-H2 character criterion

For a single coefficient group `A`, a closed formal 2-holonomy character

```text
h_(a,b):H->A
```

separates every raw `H_2` class exactly when `h_(a,b)` is injective.

Acceptance requires the theorem

```text
h_(a,b) is injective
iff
(a has infinite additive order) and (b != 0 with 2b=0).
```

Reason:

- if `a` has finite order, a nonzero free multiple dies;
- if `b=0`, the unique nonzero order-two class dies;
- if `a` has infinite order, `<a>` is torsion-free, hence contains no nonzero order-two element; therefore nonzero `b in A[2]` has trivial intersection with `<a>`, and `Z a ⊕ <b>` is an embedded copy of `Z ⊕ Z/2`.

Thus an abelian coefficient target admits some faithful single formal closed 2-holonomy character iff

```text
A contains an infinite-order element
and
A contains nonzero 2-torsion.
```

Equivalently:

```text
A contains a subgroup isomorphic to H.
```

## 6. Minimal faithful image theorem

Do not claim a global total ordering of all abelian groups by “size.”

The lawful minimality statement is image-theoretic:

For every faithful character

```text
h:H->A,
```

its image satisfies

```text
im(h) ≅ H.
```

Corestricting `h` to its image gives an isomorphism

```text
H -> im(h).
```

Therefore every faithful target contains a faithful **core image** isomorphic to

```text
Z ⊕ Z/2.
```

#775's chosen target `A_0=H` is minimal in this exact sense: its faithful universal character has no coefficient codomain beyond its own image.

Required scar:

```text
minimal faithful image != unique smallest ambient abelian group under an undeclared ordering.
```

## 7. Coefficient examples and hostile controls

The chamber must instantiate the general theorem on several coefficient groups.

### 7.1 Integers

```text
A=Z,
A[2]=0,
T_2(Z)≅Z.
```

The primitive class `kappa` corresponds to `1`; inherited `omega` corresponds to `2`.

No integer-valued character is raw-H2 faithful because the torsion sector is killed.

### 7.2 Z/2

```text
A=Z/2,
A[2]=A,
T_2(Z/2)≅(Z/2)^2.
```

Both free and torsion basis values can be chosen independently mod two, but every character collapses the infinite free subgroup. Torsion sensitivity alone does not imply faithfulness.

### 7.3 Odd cyclic coefficients

For odd `n`:

```text
A=Z/n,
A[2]=0,
T_2(Z/n)≅Z/n.
```

The order-two homology sector is invisible.

### 7.4 Even cyclic coefficients

For even `n`:

```text
A=Z/n,
A[2]≅Z/2,
T_2(Z/n)≅Z/n ⊕ Z/2.
```

The order-two sector becomes detectable, but no finite cyclic target can be raw-H2 faithful because it has no infinite-order element.

### 7.5 #775 target

```text
A=Z⊕Z/2.
```

Choose

```text
a=(1,0),
b=(0,1).
```

The resulting character is the identity and is faithful.

### 7.6 Larger faithful host

Use a nonminimal host such as

```text
A=Z⊕Z/4,
a=(1,0),
b=(0,2).
```

The character is faithful, but its image is exactly the subgroup

```text
Z⊕{0,2} ≅ Z⊕Z/2.
```

This hostile prevents “#775 target is the only possible faithful ambient coefficient group.”

### 7.7 Torsion-free larger target

For example

```text
A=Z^2,
A[2]=0.
```

Despite having abundant infinite-order elements, it cannot see `[theta]` and admits no faithful character.

## 8. Naturality hostiles

Require at least these commuting coefficient maps:

```text
reduction mod2: Z -> Z/2
embedding: Z -> Z⊕Z/2, n |-> (n,0)
projection: Z⊕Z/2 -> Z
projection: Z⊕Z/2 -> Z/2
embedding: Z⊕Z/2 -> Z⊕Z/4, (n,e) |-> (n,2e)
```

For each, pushforward of the universal/basis character must agree exactly with composition of the corresponding `H->A` character.

A deliberately malformed map that does not preserve the order-two relation must abstain from coefficient-homomorphism status.

## 9. Consequential candidate classifications

All remain UNEARNED before an exact-head witness:

```text
THE_FORMAL_DEGREE_TWO_TRANSPORT_EQUIVALENCE_FUNCTOR_ON_ABELIAN_COEFFICIENT_GROUPS_IS_NATURALLY_REPRESENTED_BY_H2_BAR_B_Z

FOR_EVERY_ABELIAN_A_STRICT_B_SQUARED_A_FORMAL_TWO_TRANSPORT_CLASSES_MODULO_FORMAL_BOUNDARY_REZEROING_ARE_NATURALLY_A_CROSS_A_TWO_TORSION

THE_775_KAPPA_BETA_CLASS_IS_THE_UNIVERSAL_IDENTITY_TRANSPORT_CLASS_AND_EVERY_COEFFICIENT_VALUED_FORMAL_TRANSPORT_CLASS_IS_ITS_UNIQUE_COEFFICIENT_PUSHFORWARD

AN_ABELIAN_COEFFICIENT_TARGET_ADMITS_A_FAITHFUL_SINGLE_CLOSED_FORMAL_TWO_HOLONOMY_CHARACTER_IFF_IT_CONTAINS_BOTH_AN_INFINITE_ORDER_ELEMENT_AND_NONZERO_TWO_TORSION

EVERY_FAITHFUL_CHARACTER_HAS_CORE_IMAGE_ISOMORPHIC_TO_Z_CROSS_Z_OVER_TWO_SO_THE_775_TARGET_IS_MINIMAL_IN_THE_EXACT_IMAGE_THEORETIC_SENSE
```

Consequential bearing if all pass:

```text
UNIVERSAL_COEFFICIENT_FORMAL_TWO_HOLONOMY_REPRESENTABILITY_EARNED
```

## 10. Hard ceilings

Even a green chamber must preserve:

```text
representing object H2 != physical gauge group
universal formal transport class != universal physical field
coefficient pushforward != physical symmetry breaking or coupling
faithful formal H2 character != geometric holonomy tomography
minimal faithful image != unique smallest ambient coefficient group
A[2] torsion visibility != physical topological order
B^2A formal target != gerbe / 2-connection target
UCT naturality != geometric parallel-transport naturality
category-theoretic representability != ontology authority
formal coefficient universality != operational route universality
```

Remain false:

```text
GEOMETRIC_TWO_HOLONOMY_AUTHORITY
PHYSICAL_TWO_HOLONOMY_AUTHORITY
BERRY_OR_GERBE_HOLONOMY_AUTHORITY
CONNECTION_AUTHORITY
TWO_CONNECTION_AUTHORITY
CURVATURE_AUTHORITY
OPERATIONAL_PATH_TWO_GROUPOID_AUTHORITY
OPERATIONAL_INVERSE_ROUTE_AUTHORITY
```

#718 remains constitutional.

SRC Atelier #731/#758/#759, SRC continuation #771, #767, production, Vercel, and the four-workflow estate remain untouched.

## 11. Stop rule

Preregistration precedes implementation.

No representability, universality, or minimality language is earned from #775's existence theorem alone. The general coefficient classification, naturality, universal identity class, and faithful-target iff must all survive their own hostiles.

```text
PREIMPLEMENTATION_UNIVERSAL_COEFFICIENT_HOLONOMY_REPRESENTABILITY_AUDITION_PREREGISTERED
HUMAN_𝄐_REQUIRED_AFTER_NEXT_CONSEQUENTIAL_WITNESS
```

𝌋‌⟐

Sealed ⟐