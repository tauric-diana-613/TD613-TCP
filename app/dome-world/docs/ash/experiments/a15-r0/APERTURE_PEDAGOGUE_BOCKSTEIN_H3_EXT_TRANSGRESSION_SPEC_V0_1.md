# A15-R0 · Bockstein H³ Ext Transgression and Period-Blind Degree-Three Obstruction

Status: **PREREGISTERED / SCIENCE UNEARNED**

Authority:

```text
#737 = THREAD_SCOPED_ACTIVE_FOR_REMAINDER_OF_CURRENT_THREAD
```

Scientific parent:

```text
#775 receipt = 39b8f6e8ba319154378d03c28a1bf42c02870de1
```

This chamber depends only on witnessed #775/#773 mathematics. It must not import, quote as theorem, or rely on the unearned #778 universal-coefficient representability chamber.

## Question

#775 earned

```text
H2_bar(B;Z) ≅ Z ⊕ Z/2
H1_bar(B;Z) ≅ Z²
BB ≃ K(G,1)
G = Z² ⋊_swap Z
```

and exhibited a mod-two cocycle `β` with

```text
β(z0)=0
β(theta)=1
```

while every integer-valued H2 character kills `theta`.

The next question is whether this integer-invisible order-two sector disappears, or whether it reappears one cohomological degree higher as an Ext/Bockstein obstruction.

## Preregistered theorem stack

### 1. Exact third homology

Use only the already-earned mapping-torus/Wang model from #775. The swap acts by `-1` on

```text
H2(T²;Z)=Z.
```

Therefore the relevant Wang segment is

```text
0 -> H3(BB;Z) -> Z --(1-(-1))=2--> Z.
```

Since multiplication by two on `Z` has zero kernel,

```text
H3_bar(B;Z) ≅ 0.
```

### 2. Integral degree-three cohomology is pure Ext

For the normalized free bar chain complex, apply cohomological UCT in degree three:

```text
0 -> Ext¹_Z(H2_bar(B;Z),Z)
  -> H³_bar(B;Z)
  -> Hom(H3_bar(B;Z),Z)
  -> 0.
```

With

```text
H2_bar(B;Z)=Z⊕Z/2
H3_bar(B;Z)=0
Ext¹_Z(Z,Z)=0
Ext¹_Z(Z/2,Z)=Z/2
Hom(0,Z)=0,
```

preregister

```text
H³_bar(B;Z) ≅ Z/2.
```

Because the Hom term vanishes, the whole degree-three class is Ext-type rather than a period character on H3.

### 3. Coefficient sequence and Bockstein

Use the short exact coefficient sequence

```text
0 -> Z --×2--> Z -> Z/2 -> 0
```

with connecting map

```text
delta : H²_bar(B;Z/2) -> H³_bar(B;Z).
```

Lift #775's normalized mod-two cocycle `β` pointwise to the integer-valued cochain `beta_tilde` taking values in `{0,1}`. Since `β` is a mod-two cocycle, `d beta_tilde` must be even. Define

```text
gamma := (d beta_tilde)/2.
```

Preregister:

```text
gamma is an integer normalized 3-cocycle,
[gamma] = delta([β]).
```

Finite residue-group hardening must check all `8^3=512` triples for even lift defect and all `8^4=4096` quadruples for `d gamma=0`.

### 4. Nontriviality of the Bockstein class

Exactness gives

```text
ker(delta) = im( H²(B;Z) -> H²(B;Z/2) ).
```

Every integral H² class evaluates to zero on the order-two homology class `theta`, hence every mod-two reduction of an integral H² class also evaluates to zero on `theta`.

But inherited #775 gives

```text
β(theta)=1.
```

Therefore `[β]` is not in the reduction image and

```text
delta([β]) != 0.
```

Since `H³_bar(B;Z)≅Z/2`, preregister

```text
[gamma]=delta([β])
is the unique nonzero generator of H³_bar(B;Z).
```

### 5. Quotient form of the transgression

Preregister the exact coefficient consequence

```text
H²_bar(B;Z/2) / red_2(H²_bar(B;Z)) ≅ Z/2
```

with the nonzero coset represented by `β`, and the Bockstein induces an isomorphism

```text
H²_bar(B;Z/2) / red_2(H²_bar(B;Z))
  --delta~--> H³_bar(B;Z).
```

No arbitrary-coefficient representability theorem from #778 may be used to earn this statement.

### 6. Period-blind degree-three obstruction

Because

```text
H3_bar(B;Z)=0
```

every integer-valued closed degree-three homology character

```text
H3_bar(B;Z) -> Z
```

is zero. Nevertheless

```text
H³_bar(B;Z)=Z/2
```

is nonzero.

Preregister the consequential scar:

```text
NONZERO_INTEGRAL_DEGREE_THREE_COHOMOLOGY
!=
NONZERO_CLOSED_H3_PERIOD_CHARACTER
```

and more sharply:

```text
THE_ORDER_TWO_H2_SECTOR_INVISIBLE_TO_INTEGER_DEGREE_TWO_PERIODS_REAPPEARS_AS_A_PURE_EXT_BOCKSTEIN_CLASS_ONE_COHOMOLOGICAL_DEGREE_HIGHER.
```

## Mandatory hostiles

The implementation must reject or expose all of the following:

1. `H3=0 => H^3=0` — false; UCT Ext term survives.
2. `H³=Z/2 => there exists a nonzero H3 cycle detector` — false because H3 is zero.
3. `β(theta)=1` but `β` is an integral reduction — impossible; reduction-image classes annihilate theta.
4. malformed integer lift with an odd coboundary on any residue triple — must fail Bockstein-lift divisibility.
5. any `gamma` row with nonzero degree-four coboundary — must fail the 3-cocycle certificate.
6. replacing swap action on H2(T²) by `+1` would give a different H3; the inherited determinant/sign action must be pinned to `-1`.
7. `Ext¹(Z/2,Z)=0` — false; exact value is `Z/2`.
8. `Bockstein nonzero => physical flux / 3-curvature / gerbe / anomaly inflow` — forbidden naming jump.
9. `pure Ext class => torsion H3` — false in this chamber; H3 itself is zero.
10. `#778 arbitrary-coefficient theorem required` — false; this chamber must close from #775 + standard UCT/Bockstein exactness only.

## Candidate classifications — UNEARNED

```text
THIRD_BAR_HOMOLOGY_VANISHES_IN_THE_DECLARED_REACHABLE_QUOTIENT_JURISDICTION

INTEGRAL_THIRD_BAR_COHOMOLOGY_IS_Z_OVER_TWO_AND_IS_PURELY_EXT_DERIVED

THE_775_MOD_TWO_TORSION_DETECTOR_HAS_NONTRIVIAL_INTEGRAL_BOCKSTEIN_EQUAL_TO_THE_UNIQUE_NONZERO_H_THREE_CLASS

THE_QUOTIENT_OF_MOD_TWO_H_TWO_BY_INTEGRAL_REDUCTION_IS_ISOMORPHIC_VIA_BOCKSTEIN_TO_INTEGRAL_H_THREE

INTEGER_DEGREE_THREE_PERIOD_CHARACTERS_ARE_TRIVIAL_EVEN_THOUGH_INTEGRAL_DEGREE_THREE_COHOMOLOGY_IS_NONTRIVIAL

H2_TORSION_BLINDNESS_REAPPEARS_ONE_COHOMOLOGICAL_DEGREE_HIGHER_AS_A_PURE_EXT_BOCKSTEIN_OBSTRUCTION
```

Candidate major bearing:

```text
BOCKSTEIN_EXT_TRANSGRESSION_AND_PERIOD_BLIND_H3_OBSTRUCTION_EARNED
```

All remain UNEARNED until implementation, hostile hardening, frozen-science audit, and an authority-bearing exact-head constitutional witness.

## Hard ceilings

```text
Bockstein connecting class != physical flux
H³ Ext class != gerbe / bundle-gerbe / 2-gerbe authority
integer 3-cocycle != 3-form curvature
bar cohomology degree three != geometric three-holonomy
H3=0 != absence of cohomological obstruction
pure Ext != physical torsion excitation
mod-two coefficient lift != gauge-field lift
mapping-torus homology != physical spacetime topology
coefficient exact sequence != physical symmetry extension
formal degree shift != anomaly inflow
formal transgression != operational route transgression
```

Existing ceilings remain:

```text
GEOMETRIC_TWO_HOLONOMY_AUTHORITY = false
PHYSICAL_TWO_HOLONOMY_AUTHORITY = false
CONNECTION_AUTHORITY = false
TWO_CONNECTION_AUTHORITY = false
CURVATURE_AUTHORITY = false
OPERATIONAL_INVERSE_ROUTE_AUTHORITY = false
```

#718 remains alive.

Collision membrane:

```text
#778 remains frozen / unearned / untouched
SRC #731/#758/#759 untouched
SRC #771 untouched
#767 untouched
no fifth workflow
no merge
no publication
no production
no Vercel
no Proto-Loom/A16 promotion
```

𝌋‌⟐

Sealed ⟐