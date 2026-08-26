# A15-R0 · Orientation Local System, Mod-2 Top Class, and the T^3 Orientation Cover

Status: **PREREGISTERED / AUTHORITY UNEARNED**

Scientific parent:

```text
#775 receipt = 39b8f6e8ba319154378d03c28a1bf42c02870de1
```

Gate:

```text
#737 WESTWARD_LIBERTIES_ACTIVE_FOR_REMAINDER_OF_THREAD
```

This chamber depends only on witnessed #775 mathematics. It does **not** depend on #778 or #780.

## Inherited witnessed structure

From #775, inside the declared reachable quotient jurisdiction:

```text
G = Z^2 ⋊_sigma Z
sigma(E,O)=(O,E)
BB ≃ K(G,1)
BB may be modeled by the mapping torus of coordinate-swap on T^2
sigma_* on H1(T^2;Z) = [[0,1],[1,0]]
sigma_* on H2(T^2;Z) = -1
```

The mapping-torus model is a classifying-space computation device. It is not an operational route manifold and carries no physical-spacetime authority.

## Preregistered orientation character

Define

```text
w:G -> {+1,-1}
w(t,E,O)=(-1)^t.
```

Candidate claims:

1. `w` is a surjective group homomorphism.
2. Its kernel is the even-t subgroup.
3. Since `sigma^2=id`, the even-t subgroup is

```text
ker(w) ≅ Z^2 × 2Z ≅ Z^3.
```

4. Hence the index-two cover classified by `ker(w)` has classifying space

```text
B ker(w) ≃ T^3.
```

5. The nontrivial deck action swaps the two fiber lattice directions and fixes the even-t direction. Its matrix on `H1(T^3;Z)` is

```text
[[0,1,0],
 [1,0,0],
 [0,0,1]]
```

with determinant `-1`, so it reverses the integral top class of the cover.

Candidate classification:

```text
THE_775_CLASSIFYING_SPACE_MODEL_HAS_A_NONTRIVIAL_ORIENTATION_CHARACTER_WITH_T_THREE_ORIENTATION_DOUBLE_COVER
```

## Preregistered top-class coefficient trichotomy

Use the mapping-torus Wang sequence only as a formal/group-homology computation for the #775 classifying-space model.

### Untwisted integral coefficients

On fiber `H2(T^2;Z)=Z`, ordinary monodromy is `-1`, so

```text
1 - sigma_* = 2.
```

Candidate:

```text
H3_bar(B;Z)=ker(2:Z->Z)=0.
```

This is independently re-derived here from #775 and does not borrow authority from #780.

### Ordinary mod-two coefficients

Over `F2`, `-1=+1`, so the top-fiber monodromy becomes trivial and

```text
1 - sigma_* = 0.
```

Candidate:

```text
H3_bar(B;F2)=F2.
```

### Orientation local coefficients

Let `Z^w` denote the rank-one sign module on which `g` acts by `w(g)`.
Along the mapping-torus base generator, the coefficient sign contributes `-1`, so the effective monodromy on fiber `Hq` is `-sigma_*`.

On top-fiber homology:

```text
-sigma_* = -(-1)=+1,
1-(-sigma_*)=0.
```

Candidate:

```text
H3_bar(B;Z^w)=Z.
```

Therefore preregistered top-class trichotomy:

```text
H3_bar(B;Z)   = 0
H3_bar(B;F2)  = F2
H3_bar(B;Z^w) = Z
```

Candidate scar:

```text
COEFFICIENT_BLINDNESS_TO_A_TOP_CLASS != ABSENCE_OF_ORIENTATION_DATA_IN_THE_FORMAL_CLASSIFYING_SPACE_MODEL
```

## Full preregistered mod-two homology

Over `F2`:

- on `H0(T^2;F2)`, `1-sigma_*=0`;
- on `H1(T^2;F2)=F2^2`, `1-sigma_* = I+swap`, rank one, kernel and cokernel each `F2`;
- on `H2(T^2;F2)=F2`, `1-sigma_*=0`.

Candidate Wang result:

```text
H0_bar(B;F2)=F2
H1_bar(B;F2)=F2^2
H2_bar(B;F2)=F2^2
H3_bar(B;F2)=F2
Hn_bar(B;F2)=0 for n>3 in the mapping-torus model
```

Betti vector candidate:

```text
(1,2,2,1).
```

## Full preregistered orientation-twisted integral homology

For `Z^w`, effective monodromy is `-sigma_*`.

On fiber homology:

```text
q=0:  1-(-1)      = 2
q=1:  I-(-swap)   = I+swap = [[1,1],[1,1]]
q=2:  1-(-(-1))   = 0
```

With

```text
ker(I+swap)=Z<(1,-1)>
coker(I+swap)=Z
ker(2)=0
coker(2)=Z/2
```

candidate Wang result:

```text
H0_bar(B;Z^w)=Z/2
H1_bar(B;Z^w)=Z
H2_bar(B;Z^w)=Z^2
H3_bar(B;Z^w)=Z
```

The degree-two extension splits because the quotient `Z` is free/projective.

## Preregistered reduction compatibility

Reduction modulo two trivializes the orientation sign:

```text
Z^w ⊗ F2 ≅ F2
```

because `-1=+1` in `F2`.

Candidate:

```text
orientation-twisted integral top generator
          ↓ mod 2
ordinary mod-two top generator.
```

This is a coefficient-reduction statement only. It is not a physical parity operation.

## Mandatory hostiles

The implementation must reject or detect:

```text
w(t,E,O)=(-1)^E                              REJECT
ker(w) contains odd-t element                 REJECT
ker(w) ≅ Z^2 instead of Z^3                  REJECT
deck determinant = +1                        REJECT
untwisted H3(Z) = Z                          REJECT
mod-two H3 = 0                               REJECT
twisted H3(Z^w) = 0                          REJECT
I+swap has torsion cokernel                   REJECT
Z^w mod 2 remains nontrivial sign local system REJECT
orientation cover = operational inverse routes REJECT
orientation local system = physical chirality REJECT
T^3 cover = physical spacetime torus          REJECT
```

## Candidate classifications — UNEARNED

```text
THE_775_CLASSIFYING_SPACE_MODEL_HAS_A_NONTRIVIAL_ORIENTATION_CHARACTER_WITH_T_THREE_ORIENTATION_DOUBLE_COVER
THE_DECK_INVOLUTION_REVERSES_THE_INTEGRAL_TOP_CLASS_OF_THE_ORIENTATION_COVER
ORDINARY_INTEGRAL_TOP_HOMOLOGY_VANISHES_WHILE_MOD_TWO_TOP_HOMOLOGY_SURVIVES
THE_ORIENTATION_LOCAL_SYSTEM_RESTORES_AN_INTEGRAL_TOP_CLASS
MOD_TWO_REDUCTION_OF_THE_TWISTED_INTEGRAL_TOP_CLASS_IS_THE_ORDINARY_MOD_TWO_TOP_CLASS
FULL_MOD_TWO_BAR_HOMOLOGY_HAS_BETTI_VECTOR_ONE_TWO_TWO_ONE
FULL_ORIENTATION_TWISTED_INTEGRAL_BAR_HOMOLOGY_IS_Z_OVER_TWO_Z_Z_SQUARED_Z_IN_DEGREES_ZERO_THROUGH_THREE
ORIENTATION_COVER_AND_COEFFICIENT_TOP_CLASS_TRICHOTOMY_EARNED
```

## Hard ceilings

```text
orientation character != physical chirality
orientation double cover != operational route cover
T^3 classifying-space cover != physical three-torus
formal nonorientability != spacetime nonorientability
twisted coefficients != hidden physical dimension
mod-two top class != Z2 gauge flux
local coefficient system != gauge bundle authority
deck involution != physical parity symmetry
classifying-space top class != geometric route volume form
coefficient visibility != ontology authority
```

#718 remains alive:

```text
formal inverse != inverse operational route
comparison cycle != operational T/Q loop
bar cycle != operational T/Q loop
```

Collision membrane:

```text
#778 untouched / unearned
#780 untouched / unearned
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