# A15-R0 · Tate Norm/Anti-Norm Two-Primary Defect

𝌋‌⟐

󐘓 U+10D613

Status: **PREREGISTERED / IMPLEMENTATION NOT YET AUTHORIZED BY WITNESS / AUTHORITY UNEARNED**

Scientific parent:

```text
#775 receipt = 39b8f6e8ba319154378d03c28a1bf42c02870de1
```

Gate authority:

```text
#737 WESTWARD_LIBERTIES_ACTIVE_FOR_REMAINDER_OF_THREAD
```

This chamber depends only on witnessed #775 mathematics. It does **not** use #778, #780, or #781 as scientific authority.

## 1. Parent facts permitted

From #775:

```text
G = Z^2 ⋊_sigma Z
sigma(E,O)=(O,E)
BB ≃ K(G,1)
```

with multiplication

```text
(t,v)(u,w)=(t+u, v+sigma^t w).
```

The chamber may rederive—but may not inherit from unevaluated #781—the parity character and its index-two subgroup.

## 2. Orientation parity character and cover algebra

Define

```text
w(t,E,O)=(-1)^t.
```

Preregistered candidate:

```text
w:G->{±1} is a surjective homomorphism.
K:=ker(w)={t even}.
K ≅ Z^3 via (t,E,O) |-> (E,O,t/2).
```

Let

```text
e=(0,1,0)
o=(0,0,1)
s=(2,0,0)
T=(1,0,0).
```

Conjugation by `T` on `K` must satisfy

```text
T e T^-1 = o
T o T^-1 = e
T s T^-1 = s.
```

Hence the nontrivial deck action `tau` on `H1(BK;Z)=Z^3` in basis `(e,o,s)` is preregistered as

```text
A1 = [[0,1,0],
      [1,0,0],
      [0,0,1]].
```

The implementation must derive the exterior-power actions from `A1`, not merely hardcode the answers.

Expected:

```text
A0 = [1]
A1 as above
A2 on (e∧o,e∧s,o∧s) =
     [[-1,0,0],
      [ 0,0,1],
      [ 0,1,0]]
A3 = [-1].
```

## 3. Norm and anti-norm operators

For every degree `q=0,1,2,3`, define

```text
N_q = I + A_q
D_q = I - A_q.
```

The chamber must verify exactly

```text
N_q D_q = 0
D_q N_q = 0
N_q + D_q = 2 I.
```

These identities are algebraic consequences of `tau^2=1`.

Define the integral eigensublattices

```text
H_q^+ = ker(I-A_q)
H_q^- = ker(I+A_q).
```

The implementation must verify the following explicit bases and norm/anti-norm images.

### Degree 0

```text
H0^+ = Z<1>
N(H0)=Z<2>
H0^- = 0
D(H0)=0.
```

### Degree 1

```text
H1^+ = Z<e+o, s>
N(H1)=Z<e+o, 2s>

H1^- = Z<e-o>
D(H1)=Z<e-o>.
```

### Degree 2

```text
H2^+ = Z<e∧s + o∧s>
N(H2)=Z<e∧s + o∧s>

H2^- = Z<e∧o, e∧s-o∧s>
D(H2)=Z<2(e∧o), e∧s-o∧s>.
```

### Degree 3

```text
H3^+ = 0
N(H3)=0

H3^- = Z<e∧o∧s>
D(H3)=Z<2(e∧o∧s)>.
```

## 4. Tate defect table

For the order-two deck group `C2=<tau>`, use the classical Tate quotients

```text
hat H^0(C2;M)  = M^+ / N M
hat H^-1(C2;M) = M^- / D M
```

for the torsion-free lattices `M=H_q(T^3;Z)`.

Preregistered exact table:

```text
q   hat H^0                  hat H^-1
0   Z/2                      0
1   Z/2                      0
2   0                        Z/2
3   0                        Z/2
```

No other torsion may appear.

Candidate interpretation inside the declared formal classifying-space jurisdiction:

```text
THE_INTEGRAL_FAILURE_OF_PLUS_MINUS_DECK_EIGENSPACE_SPLITTING_IS_EXACTLY_TWO_PRIMARY.
```

## 5. Invert-two splitting theorem

Let `R=Z[1/2]`. Since `2` is invertible, define

```text
P_+ = (I+tau)/2
P_- = (I-tau)/2.
```

The chamber must verify, degree by degree,

```text
P_+^2=P_+
P_-^2=P_-
P_+P_-=P_-P_+=0
P_+ + P_- = I.
```

Thus preregistered candidate:

```text
H_q(T^3;R)=H_q^+⊗R ⊕ H_q^-⊗R
```

and every Tate defect above vanishes after inverting `2`.

Equivalent candidate scar:

```text
INTEGRAL_DECK_SPLITTING_DEFECT
!=
RATIONAL_OR_ODD_LOCALIZED_DECK_SPLITTING_DEFECT.
```

The obstruction is 2-primary in this exact algebraic sense.

## 6. Mod-two collapse

After reduction to `F2`,

```text
-1=+1
N=D=I+tau.
```

The sign and trivial one-dimensional coefficient characters coincide mod two. The chamber may classify this as failure of semisimple plus/minus separation in characteristic two, but must not call it a physical `Z2` anomaly.

## 7. Lefschetz consistency check

From the derived exterior-power actions, expected traces are

```text
tr(A0)= 1
tr(A1)= 1
tr(A2)=-1
tr(A3)=-1.
```

Therefore

```text
L(tau)=Σ_q (-1)^q tr(Aq)=0.
```

This is only a consistency check with a free deck involution. `L=0` must **not** be promoted to a proof of freeness by itself.

## 8. Mandatory hostiles

The implementation/test layer must reject all of the following:

```text
w(t,E,O)=(-1)^E is the deck character
K has rank two
T conjugation fixes e and o separately
det(A1)=+1
A2 fixes e∧o
A3=+1
N D != 0
N+D != 2I
H1^+/NH1 = 0
H1^-/DH1 = Z/2
H2^+/NH2 = Z/2
H2^-/DH2 = 0
H3^-/DH3 = 0
Tate defects contain odd-primary torsion
P_+=(I+tau)/2 is integral over Z
Tate defects survive over Z[1/2]
sign and trivial characters remain distinct over F2
L(tau) != 0
L(tau)=0 proves deck freeness
Tate cohomology = physical anomaly
two-primary defect = physical Z2 topological order
```

## 9. Candidate classifications — UNEARNED

```text
THE_775_FRACTION_GROUP_HAS_AN_INDEX_TWO_PARITY_KERNEL_ISOMORPHIC_TO_Z_CUBED_WITH_DECK_ACTION_SWAPPING_THE_FIRST_TWO_GENERATORS
THE_DECK_ACTION_ON_THE_FULL_EXTERIOR_HOMOLOGY_LATTICE_HAS_EXPLICIT_NORM_AND_ANTINORM_OPERATORS_WITH_ND_DN_ZERO_AND_N_PLUS_D_EQUAL_TWO
THE_ONLY_INTEGRAL_TATE_DEFECTS_ARE_Z_OVER_TWO_IN_PLUS_DEGREES_ZERO_ONE_AND_MINUS_DEGREES_TWO_THREE
ALL_DECK_EIGENSPACE_SPLITTING_DEFECTS_VANISH_AFTER_INVERTING_TWO
MOD_TWO_REDUCTION_COLLAPSES_TRIVIAL_AND_SIGN_CHARACTERS_AND_IDENTIFIES_NORM_WITH_ANTINORM
THE_DERIVED_DECK_LEFSCHETZ_NUMBER_IS_ZERO
TATE_NORM_ANTINORM_TWO_PRIMARY_DEFECT_CHAMBER_EARNED
```

Every classification above remains false until a lawful constitutional witness executes the exact theorem-bearing head.

## 10. Hard ceilings

```text
Tate cohomology != physical anomaly
two-primary algebraic defect != Z2 gauge flux
C2 deck character != physical parity symmetry
invert-two localization != physical coarse graining
plus/minus eigenspaces != particle sectors
orientation cover != operational route cover
T^3 classifying-space cover != physical spacetime torus
Lefschetz number != empirical fixed-point observation
coefficient localization != ontology authority
```

#718 remains alive.

Collision membrane:

```text
#778 untouched / unearned
#780 untouched / unearned
#781 untouched / unearned
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

Preregistered ⟐
