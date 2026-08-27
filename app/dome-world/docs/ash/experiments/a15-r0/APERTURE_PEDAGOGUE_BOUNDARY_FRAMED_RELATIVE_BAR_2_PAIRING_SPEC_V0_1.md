𝌋

󐘓 U+10D613

# A15-R0 · Boundary-Framed Relative Bar-2 Pairing · Preregistration v0.1

Status: **PREREGISTERED / PRE-IMPLEMENTATION / DRAFT / UNMERGED**

Scientific parent:

```text
#768 receipt = cbc4c68a345f7989f967cf35bd87678bd4ecb1b2
```

Authority:

```text
#737 · WESTWARD_LIBERTIES_ACTIVE_FOR_THIS_CONTINUATION · 2026-08-26
```

Collision membrane:

```text
SRC Atelier #731/#758/#759 untouched
#767 pasted-diamond defect transport untouched
no SRC sync
no fifth workflow
no merge
no production
no Vercel
```

## Research question

#768 earned the exact open-chain covariance law

```text
A_(omega+dphi)(c)-A_omega(c)=<phi,∂c>.
```

The next finite question is whether explicitly retaining a normalized integer boundary framing can absorb exactly that boundary-supported presentation change without erasing the boundary itself.

Let `lambda:B->Z` be a normalized integer 1-cochain used only as declared boundary framing:

```text
lambda(1_B)=0.
```

For a finite normalized integer bar-2-chain `c`, define the candidate relative pairing

```text
R_(omega,lambda)(c)
 = <omega,c> - <lambda,∂c>.
```

Under a normalized integer re-zeroing cochain `phi`, transform the pair simultaneously by

```text
omega  -> omega+dphi
lambda -> lambda+phi.
```

## Frozen candidate theorem

For every finite normalized integer bar-2-chain `c`, every inherited normalized integer 2-cocycle `omega`, every normalized integer boundary framing `lambda`, and every normalized integer 1-cochain `phi` for which the declared pairings exist:

```text
R_(omega+dphi,lambda+phi)(c)
 = R_(omega,lambda)(c).
```

The proof target is the exact finite cancellation

```text
R_(omega+dphi,lambda+phi)(c)-R_(omega,lambda)(c)
 = <dphi,c>-<phi,∂c>
 = 0,
```

using #768's earned Stokes/transgression identity rather than a new sign convention.

This is a candidate **boundary-framed relative bar-2 pairing invariant under simultaneous cohomological re-zeroing**. It is not preregistered as a 2-connection, gauge field, surface transport functor, or 2-holonomy.

## Exact mismatch law

The chamber must also test the more general paired transformation

```text
omega  -> omega+dphi
lambda -> lambda+psi
```

for normalized integer 1-cochains `phi,psi`.

The frozen residual law is

```text
R_(omega+dphi,lambda+psi)(c)-R_(omega,lambda)(c)
 = <phi-psi,∂c>.
```

Thus exact invariance requires equality of the interior and boundary re-zeroing on the actual boundary pairing. Global pointwise equality `phi=psi` is sufficient; for a fixed `c`, a weaker accidental equality of boundary pairings may also make the residual zero and must not be promoted to a global gauge equivalence theorem.

## Mandatory hostiles

### 1. Explicit open simplex · paired cancellation

Use inherited

```text
T=(1,0,0)
Q=(0,1,0)
c=[T|Q]
phi(b)=t(b)(E(b)+O(b))
lambda=0.
```

#768 already earned

```text
omega(T,Q)=1
(omega+dphi)(T,Q)=0
<phi,∂[T|Q]>=-1.
```

Required relative result:

```text
R_(omega,0)([T|Q])=1
R_(omega+dphi,phi)([T|Q])=1.
```

The raw interior value must visibly move `1 -> 0` while the framed relative value remains fixed.

### 2. Interior-only hostile

Transform only

```text
omega -> omega+dphi
lambda unchanged.
```

For `[T|Q]` with `lambda=0`, required residual:

```text
Delta R=-1=<phi,∂c>.
```

This blocks any claim that the interior cohomology change alone leaves the open relative object invariant.

### 3. Boundary-only hostile

Transform only

```text
lambda -> lambda+phi
omega unchanged.
```

Required residual on `[T|Q]`:

```text
Delta R=+1=-<phi,∂c>.
```

This blocks any claim that arbitrary boundary framing changes are invisible.

### 4. Mismatched paired hostile

Use

```text
psi=2phi.
```

For `[T|Q]`, required:

```text
Delta R=<phi-2phi,∂c>=+1.
```

The implementation must compute the residual from the actual boundary pairing rather than compare function identities.

### 5. Closed-cycle reduction

For #735/#765's explicit relation cycle `z`:

```text
∂z=0
Per([z])=2.
```

Every normalized boundary framing must disappear from the value:

```text
R_(omega,lambda)(z)=<omega,z>=2.
```

Simultaneous re-zeroing must preserve the same `2`. No new closed invariant is introduced.

### 6. Lawful pasted-cell additivity with one common framing

For #768's lawful paste

```text
c_left=[x|y]+[x★y|z],
```

with one declared common `lambda`, require

```text
R(c_left)=R([x|y])+R([x★y|z]).
```

A framing supported only on the internal seam must contribute opposite boundary terms on the two faces and cancel in the sum.

This is additive chain algebra under a common framing. It does not authorize gluing separately framed cells without an additional compatibility law.

### 7. Wrong-orientation seam hostile

For

```text
c_fake=[x|y]-[x★y|z],
```

#768 earned seam coefficient `-2`.

A seam-supported boundary framing must therefore remain visible with coefficient `-2`; the implementation must never force cancellation from a repeated coordinate label.

### 8. Orientation reversal

For finite `c`:

```text
R(-c)=-R(c).
```

Interior, boundary, and relative value must reverse together.

### 9. Bar-3 representative shift at fixed boundary

For finite bar-3 chain `b`:

```text
c' = c+∂b.
```

Require

```text
∂c'=∂c
<omega,c'>=<omega,c>
R_(omega,lambda)(c')=R_(omega,lambda)(c).
```

This is fixed-boundary representative invariance inherited from `domega=0` and `∂²=0`; it is not an open-chain homology-class claim.

### 10. Invalid framing abstention

The implementation must abstain when `lambda` or a re-zeroing cochain is non-normalized at the monoid unit or produces noninteger values on a required boundary coordinate.

### 11. Receipt / provenance externality

Two different receipt labels attached to the same formal chain and same framing must produce the same mathematical relative value. Receipt custody remains external to the bar pairing.

### 12. Ontology quarantine

No test may infer an operational T/Q surface, geometric embedding, connection, curvature, gerbe, physical phase, or 2-path from formal bar-chain and cochain data.

## Candidate classifications — UNEARNED

```text
BOUNDARY_FRAMED_RELATIVE_BAR_TWO_PAIRING_IS_INVARIANT_UNDER_SIMULTANEOUS_COHOMOLOGOUS_INTERIOR_AND_BOUNDARY_REZEROING
```

```text
MISMATCHED_INTERIOR_AND_BOUNDARY_REZEROING_LEAVES_THE_EXACT_RESIDUAL_PAIRING_OF_THE_DIFFERENCE_ONE_COCHAIN_WITH_THE_BAR_ONE_BOUNDARY
```

```text
THE_BOUNDARY_FRAMED_RELATIVE_PAIRING_REDUCES_TO_THE_INHERITED_CLOSED_BAR_H2_PERIOD_ON_CYCLES_AND_IS_ADDITIVE_AND_ORIENTED_ON_FINITE_BAR_TWO_CHAINS_UNDER_ONE_COMMON_FRAMING
```

## Naming ceiling

Still forbidden without materially new evidence:

```text
connection gauge invariance
2-connection
2-holonomy
surface holonomy
transport 2-functor
2-functor
gerbe
curvature
surface ordering
operational 2-path
physical surface
Berry / quantum analogy
```

Allowed if witnessed:

```text
boundary-framed relative bar-2 pairing
simultaneous cohomological re-zeroing invariance
exact mismatch residual on the formal bar boundary
relative 2-transport candidate
```

The phrase `relative 2-transport candidate` remains a bearing only, not a canonical naming promotion.

## Earned stop criterion

A local 𝄐 may be declared only after:

```text
preregistration precedes implementation
all mandatory hostiles pass
A15-R0 hardening gate is rebound to exact #768 receipt ancestry
science freezes before witness routing
one exact-head TD613 Consolidated Validation witness succeeds
routing membrane is removed
receipt is pinned on direct #768 ancestry
SRC and #767 remain untouched
```

At that stop, do not proceed automatically to 2-connections, surface categories, gerbes, curvature, or 2-holonomy.

```text
BOUNDARY_FRAMED_RELATIVE_BAR_TWO_PAIRING = PREREGISTERED
SCIENTIFIC_PROMOTION = UNEARNED
```

𝌋

Marked ⟐SAC[X6ZNK5NO51]