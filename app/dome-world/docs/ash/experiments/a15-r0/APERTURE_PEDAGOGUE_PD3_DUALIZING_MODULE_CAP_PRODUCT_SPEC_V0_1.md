𝌋‌⟐

󐘓 U+10D613

# A15-R0 · PD3 Dualizing Module, Orientation-Twisted Fundamental Class, and Cap-Product Duality · Spec v0.1

Status: **PREREGISTERED / UNWITNESSED / UNMERGED / THEOREM AUTHORITY UNEARNED**

Scientific parent:

```text
#775 receipt = 39b8f6e8ba319154378d03c28a1bf42c02870de1
```

Authority:

```text
#737 = THREAD_SCOPED_ACTIVE_FOR_REMAINDER_OF_CURRENT_THREAD
```

This chamber depends only on witnessed #775 plus standard mapping-torus and Poincaré-duality theorems. It does **not** depend on #778, #780, #781, #782, #783, #784, or #785.

No merge, publication, production, Vercel, SRC sync, A16, physical-spacetime, Berry/gerbe, or operational-route authority is granted.

---

## 1. Inherited exact parent data

From #775:

```text
G = Z^2 ⋊_sigma Z
sigma(E,O)=(O,E)
BB ≃ K(G,1)
H0(G;Z)=Z
H1(G;Z)=Z^2
H2(G;Z)=Z ⊕ Z/2
H3(G;Z)=0
```

and the algebraic classifying-space homology may be computed by the mapping torus of the coordinate-swap automorphism of `T^2`.

Let

```text
f:T^2->T^2
f_*(H1)=swap
f_*(H2)=-1.
```

Define the mapping torus

```text
M_f = T^2×[0,1] / (x,1)~(f(x),0).
```

Preregistered standard consequences to be certified explicitly:

```text
M_f is a connected closed 3-manifold
pi1(M_f) ≅ G
universal cover(M_f) ≅ R^2×R ≅ R^3
M_f is aspherical
M_f is a K(G,1).
```

Thus the chamber may transport manifold Poincaré duality to group (co)homology without borrowing #783.

---

## 2. Orientation character and dualizing module

The swap on the torus fiber reverses its orientation because

```text
det([[0,1],[1,0]])=-1.
```

A loop representing `(t,E,O)∈G` traverses the base `t` times. Preregister the orientation character

```text
w:G->{±1}
w(t,E,O)=(-1)^t.
```

Let `Z^w` denote the rank-one integral local system/module on which `g∈G` acts by multiplication by `w(g)`.

Candidate dualizing-module classification:

```text
G is a Poincare duality group of dimension 3
D_G ≅ Z^w.
```

Candidate cohomological dimension:

```text
cd_Z(G)=3.
```

Required argument:

```text
M_f is a finite closed aspherical 3-manifold K(G,1)
H^3(G;Z^w)=Z !=0
therefore cd_Z(G)=3
and the orientation module is the PD3 dualizing module.
```

---

## 3. Twisted fundamental class

Preregister a fundamental class

```text
[M]_w ∈ H3(G;Z^w) ≅ Z.
```

Ordinary integral top homology remains

```text
H3(G;Z)=0.
```

Required scar:

```text
ORDINARY_TOP_HOMOLOGY_VANISHES
!=
FAILURE_OF_THREE_DIMENSIONAL_POINCARE_DUALITY.
```

The top class lives in the orientation local system.

---

## 4. Twisted Wang computation

For the orientation local system, one traversal of the base multiplies coefficients by `-1`, so the effective monodromy on fiber homology is

```text
mu_q = - f_*|H_q(T^2;Z).
```

Hence

```text
q=0: mu_0=-1
q=1: mu_1=-swap
q=2: mu_2=+1.
```

The preregistered Wang maps `I-mu_q` are therefore

```text
q=0: [2]
q=1: I+swap = [[1,1],[1,1]]
q=2: [0].
```

Required exact kernel/cokernel data:

```text
coker(2)=Z/2
ker(2)=0

coker(I+swap)=Z
ker(I+swap)=Z<1,-1>

coker(0)=Z
ker(0)=Z.
```

Therefore candidate twisted homology:

```text
H0(G;Z^w)=Z/2
H1(G;Z^w)=Z
H2(G;Z^w)=Z^2
H3(G;Z^w)=Z.
```

The degree-two short exact sequence splits because the quotient `Z` is free/projective.

---

## 5. Ordinary integral cohomology, independently rederived

From witnessed #775 homology and integral UCT:

```text
H^0(G;Z)=Z
H^1(G;Z)=Z^2
H^2(G;Z)=Z
H^3(G;Z)=Z/2.
```

Required degree-three calculation:

```text
H^3(G;Z)
 ≅ Ext^1_Z(H2(G;Z),Z)
 ≅ Ext^1_Z(Z/2,Z)
 ≅ Z/2,
```

because `H3(G;Z)=0`.

This independently rederives the group value proposed in frozen #780 without borrowing #780 authority.

---

## 6. Poincaré cap-product square

Cap product with `[M]_w` must give isomorphisms for every degree `k`:

```text
PD_w(k): H^k(G;Z)   --∩[M]_w--> H_{3-k}(G;Z^w)
PD_1(k): H^k(G;Z^w) --∩[M]_w--> H_{3-k}(G;Z).
```

The first family predicts exactly

```text
H^0(G;Z)=Z       ≅ H3(G;Z^w)=Z
H^1(G;Z)=Z^2     ≅ H2(G;Z^w)=Z^2
H^2(G;Z)=Z       ≅ H1(G;Z^w)=Z
H^3(G;Z)=Z/2     ≅ H0(G;Z^w)=Z/2.
```

The second family predicts exactly

```text
H^0(G;Z^w)=0             ≅ H3(G;Z)=0
H^1(G;Z^w)=Z ⊕ Z/2       ≅ H2(G;Z)=Z ⊕ Z/2
H^2(G;Z^w)=Z^2           ≅ H1(G;Z)=Z^2
H^3(G;Z^w)=Z             ≅ H0(G;Z)=Z.
```

Candidate twisted cohomology:

```text
H^0(G;Z^w)=0
H^1(G;Z^w)=Z ⊕ Z/2
H^2(G;Z^w)=Z^2
H^3(G;Z^w)=Z.
```

This independently rederives the strongest coefficient table proposed in frozen #781 without borrowing #781 authority.

---

## 7. Degree-three torsion / orientation-coinvariant bridge

The ordinary degree-three group has two independent descriptions:

```text
UCT:
H^3(G;Z)=Ext^1(H2(G;Z),Z)=Z/2
```

and

```text
PD:
H^3(G;Z) ≅ H0(G;Z^w)=Z/2.
```

The second `Z/2` is the orientation coinvariant group:

```text
H0(G;Z^w)
 = Z / <w(g)a-a>
 = Z / <(-1)a-a>
 = Z/2,
```

because odd-`t` elements exist.

Since both sides have a unique nonzero element, candidate:

```text
THE_UNIQUE_NONZERO_INTEGRAL_H3_COHOMOLOGY_CLASS
IS_SIMULTANEOUSLY
THE_EXT_SHADOW_OF_THE_ORDER_TWO_H2_SECTOR
AND
THE_PD_DUAL_OF_THE_NONZERO_ORIENTATION_COINVARIANT_CLASS.
```

This is a group-level identification only. No physical torsion, anomaly, flux, or orientation-defect authority follows.

---

## 8. Mod-two reduction consistency

Because `-1=+1` over `F2`, the orientation local system becomes trivial after mod-two reduction:

```text
Z^w ⊗ F2 ≅ F2.
```

Candidate consequence:

```text
[M]_w mod2 = [M]_2 ∈ H3(G;F2),
```

where `[M]_2` is the unique nonzero mod-two top class of the closed 3-manifold model.

This is coefficient reduction only; it grants no physical `Z2` sector.

---

## 9. Candidate classifications — UNEARNED

```text
THE_775_FRACTION_GROUP_IS_A_POINCARE_DUALITY_GROUP_OF_DIMENSION_THREE_WITH_DUALIZING_MODULE_Z_TO_THE_PARITY_ORIENTATION_CHARACTER
THE_PARITY_CHARACTER_W_T_E_O_EQUALS_MINUS_ONE_TO_THE_T_IS_THE_ORIENTATION_CHARACTER_OF_THE_SWAP_MAPPING_TORUS_MODEL
THE_ORIENTATION_TWISTED_FUNDAMENTAL_CLASS_GENERATES_H3_G_ZW_ISOMORPHIC_TO_Z_WHILE_ORDINARY_H3_G_Z_VANISHES
THE_FULL_ORIENTATION_TWISTED_HOMOLOGY_TABLE_IS_Z_OVER_TWO_Z_Z_SQUARED_Z_IN_DEGREES_ZERO_THROUGH_THREE
THE_FULL_ORIENTATION_TWISTED_COHOMOLOGY_TABLE_IS_ZERO_Z_PLUS_Z_OVER_TWO_Z_SQUARED_Z_IN_DEGREES_ZERO_THROUGH_THREE
CAP_PRODUCT_WITH_THE_TWISTED_FUNDAMENTAL_CLASS_GIVES_POINCARE_DUALITY_ISOMORPHISMS_IN_ALL_DEGREES
THE_UNIQUE_NONZERO_H3_INTEGRAL_COHOMOLOGY_CLASS_IS_BOTH_EXT_DERIVED_FROM_H2_TORSION_AND_PD_DUAL_TO_THE_ORIENTATION_COINVARIANT
ORDINARY_TOP_HOMOLOGY_VANISHING_DOES_NOT_SIGNAL_FAILURE_OF_PD3_DUALITY
PD3_DUALIZING_MODULE_AND_CAP_PRODUCT_DUALITY_EARNED
```

---

## 10. Mandatory hostiles

```text
w(t,E,O)=+1 for all elements                         REJECT
orientation module is trivial Z                     REJECT
effective twisted monodromy equals +f_*             REJECT
H0(G;Z^w)=0                                          REJECT
H3(G;Z^w)=0                                          REJECT
H3(G;Z)=Z                                            REJECT
H^3(G;Z)=0                                           REJECT
H^3(G;Z)=Z interpreted as ordinary fundamental class REJECT
PD3 requires ordinary H3(G;Z)!=0                     REJECT
H^1(G;Z^w)=Z^2                                       REJECT
H^2(G;Z^w)=Z                                         REJECT
Ext^1(Z/2,Z)=0                                       REJECT
orientation coinvariants are Z                      REJECT
mod-two reduction retains sign distinction           REJECT
mapping-torus K(G,1) = physical spacetime            REJECT
PD3 dualizing module = physical hidden dimension     REJECT
cap product = operational route composition           REJECT
```

---

## 11. Hard ceilings

```text
PD3 group != physical 3-dimensional universe
orientation module != physical chirality field
twisted fundamental class != physical volume form
cap-product duality != operational route duality
mapping-torus manifold model != TD613 physical spacetime
ordinary H^3 torsion != physical anomaly
orientation coinvariant != physical defect charge
mod-two fundamental class != Z2 gauge flux
Poincare duality != geometric 2-holonomy authority
```

#718 remains alive.

Collision membrane:

```text
#778/#780/#781/#782/#783/#784/#785 untouched / unearned
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

Sealed ⟐
