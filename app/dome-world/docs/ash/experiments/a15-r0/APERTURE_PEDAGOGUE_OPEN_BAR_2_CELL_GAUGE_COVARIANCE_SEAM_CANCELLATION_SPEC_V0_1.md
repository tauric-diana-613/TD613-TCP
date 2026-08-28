𝌋

󐘓 U+10D613

# A15-R0 · Open Bar-2-Cell Gauge Covariance and Boundary-Seam Cancellation · Preregistration v0.1

Status: **PREREGISTERED / PRE-IMPLEMENTATION / DRAFT / UNMERGED**

Scientific parent:

```text
#765 receipt = 4c8018df2aa1857456cde76e65a9ca694715926e
```

Authority:

```text
#737 · WESTWARD_LIBERTIES_ACTIVE_FOR_THIS_CONTINUATION · 2026-08-26
```

Collision membrane:

```text
SRC Atelier #731/#758/#759 = separate project; no SRC path mutation
#767 pasted-diamond defect transport = separate occupied Westward branch; no path/theorem/witness collision
new chamber descends only from #765 scientific receipt
```

## Question

#765 earned a closed bar-2-cycle period return

```text
Per_[omega]: H_2^bar(B;Z) -> Z
```

that is invariant under cohomologous cocycle presentations. That authority applies only after the bar-2-chain closes.

This chamber asks the strictly local finite question that comes immediately before closure:

> For a finite normalized integer bar-2-chain `c`, where does the presentation dependence of the raw interior pairing live when `∂c` is nonzero?

No connection, curvature, gerbe, operational surface, or 2-holonomy structure is assumed.

## Declared algebra

Use the already-authored normalized integer bar complex over #729's quotient monoid `B` with the inherited conventions

```text
∂[x|y] = [y] - [x★y] + [x]
```

and

```text
(dphi)(x,y) = phi(x) + phi(y) - phi(x★y).
```

Let `omega` be the #734/#735 normalized integer transport 2-cocycle.

For any finite normalized integer bar-2-chain

```text
c = sum_i n_i [x_i|y_i]
```

define the raw interior value

```text
A_omega(c) = <omega,c>.
```

Unlike #765's period, `A_omega(c)` receives no homology-class authority when `∂c != 0`.

## Candidate law 1 · exact open-cell presentation covariance

For every normalized integer-valued 1-cochain `phi` on the finite coordinates touched by `c`, under

```text
omega' = omega + dphi,
```

the preregistered identity is

```text
A_(omega+dphi)(c) - A_omega(c)
 = <dphi,c>
 = <phi,∂c>.
```

The intended classification, if and only if the finite hostiles survive, is:

```text
OPEN_BAR_TWO_CHAIN_COHOMOLOGOUS_PRESENTATION_CHANGE_IS_EXACTLY_THE_PAIRING_OF_THE_ONE_COCHAIN_WITH_THE_CHAIN_BOUNDARY
```

For `∂c=0`, the identity must reduce exactly to #765:

```text
A_(omega+dphi)(c)=A_omega(c).
```

## Candidate law 2 · lawful pasted-cell seam cancellation

Take three lawful quotient coordinates `x,y,z` and form the left-associated pasted bar-2-chain

```text
c_left = [x|y] + [x★y|z].
```

Its two face boundaries are

```text
∂[x|y]     = [y] - [x★y] + [x]
∂[x★y|z]   = [z] - [(x★y)★z] + [x★y].
```

The internal seam `[x★y]` therefore occurs with coefficients

```text
-1 + 1 = 0.
```

So, using associativity of the inherited quotient product,

```text
∂c_left = [x] + [y] + [z] - [x★y★z].
```

The preregistered covariance target is then

```text
Delta_phi A(c_left)
 = <phi,[x]+[y]+[z]-[x★y★z]>,
```

with no internal seam contribution.

The right-associated pasted chain

```text
c_right = [y|z] + [x|y★z]
```

must have the same external boundary, and

```text
c_right - c_left = ∂[x|y|z]
```

under the inherited bar-3 boundary convention. Because #734 earned `domega=0`, the raw `omega` value must agree across these two lawful pastings.

The intended classification, if and only if the hostiles survive, is:

```text
PASTED_BAR_TWO_CELLS_CANCEL_INTERNAL_BOUNDARY_PRESENTATION_TERMS_AND_LEAVE_ONLY_EXTERNAL_BOUNDARY_COVARIANCE
```

## Mandatory finite hostiles

### H1 · closed-cycle reduction

Use #735's explicit relation cycle `z` and a nontrivial normalized `phi` that changes at least one pointwise cocycle value. Require exactly:

```text
∂z = 0
Delta_phi A(z)=0
Per_[omega]([z])=2 remains unchanged
```

This must reproduce #765 rather than create a second closed-cycle rule.

### H2 · single open bar-2-simplex

Use

```text
c=[T|Q]
phi(b)=t(b)(E(b)+O(b)).
```

Inherited control:

```text
omega(T,Q)=1
(omega+dphi)(T,Q)=0.
```

Require the exact local equality

```text
-1
= A_(omega+dphi)([T|Q])-A_omega([T|Q])
= <phi,∂[T|Q]>.
```

### H3 · lawful pasted seam cancellation

Use

```text
x=T, y=Q, z=T
c_left=[T|Q]+[T★Q|T].
```

Require:

```text
internal seam coefficient at [T★Q] = -1+1 = 0
```

and, for `phi=t(E+O)`, a nonzero external-boundary covariance control:

```text
Delta_phi A(c_left)=<phi, external boundary>=-2.
```

Also use a seam-marker cochain supported only on the internal coordinate `T★Q`; its total pasted covariance must be zero, proving that a pure internal boundary re-zeroing cancels under lawful orientation.

### H4 · orientation reversal

For any audited open chain `c`, require

```text
A_omega(-c)=-A_omega(c)
∂(-c)=-∂c
Delta_phi A(-c)=-Delta_phi A(c).
```

### H5 · fake pasting / mismatched seam orientation

Replace the second face by the wrong orientation:

```text
c_fake=[x|y]-[x★y|z].
```

The shared seam must remain visible with coefficient

```text
-1-1=-2.
```

The implementation must not force cancellation merely because the same coordinate label appears in both boundaries. A seam-marker cochain must detect the uncancelled `-2` contribution.

### H6 · bar-3 boundary shift of an open representative

For an open chain `c` and finite bar-3 chain `b`, compare

```text
c' = c + ∂b.
```

Require exactly:

```text
∂c'=∂c
A_omega(c')=A_omega(c)
Delta_phi A(c')=Delta_phi A(c).
```

This uses inherited `∂²=0`, `domega=0`, and `d²phi=0` in the declared finite bar algebra. It extends representative invariance to open representatives with the same boundary without promoting them to homology classes.

### H7 · alternative lawful association

For

```text
c_left  = [x|y]+[x★y|z]
c_right = [y|z]+[x|y★z],
```

require:

```text
∂c_left=∂c_right
A_omega(c_left)=A_omega(c_right)
Delta_phi A(c_left)=Delta_phi A(c_right).
```

The difference must be exactly the inherited bar-3 boundary.

### H8 · receipt / provenance externality

Changing receipt labels or documentary provenance attached outside the chain terms must not alter mathematical boundary or pairing values.

### H9 · ontology abstention

A bar-2-chain remains a formal algebraic chain. The implementation and tests must not infer:

```text
operational T/Q surface
physical surface
surface ordering
2-path
2-connection
curvature
gerbe
2-holonomy
```

## Success boundary

If all hostiles pass on one exact frozen head, this chamber may earn only:

```text
OPEN_BAR_TWO_CHAIN_COHOMOLOGOUS_PRESENTATION_CHANGE_IS_EXACTLY_THE_PAIRING_OF_THE_ONE_COCHAIN_WITH_THE_CHAIN_BOUNDARY
```

and

```text
PASTED_BAR_TWO_CELLS_CANCEL_INTERNAL_BOUNDARY_PRESENTATION_TERMS_AND_LEAVE_ONLY_EXTERNAL_BOUNDARY_COVARIANCE
```

Consequential bearing may be stated narrowly as:

```text
closed degree-two period invariance
extends locally to boundary-supported cohomologous-presentation covariance on open bar-2-chains.
```

## Naming ceiling

The word `gauge` in the working title is only inherited shorthand for **cohomologous section/presentation re-zeroing**. A successful theorem must still preserve:

```text
cohomologous presentation covariance != connection gauge covariance
bar-2-cell != operational or geometric surface
boundary-seam cancellation != surface composition law
raw interior pairing != curvature integral
relative covariance != 2-holonomy
```

No `lambda` boundary framing is included in this chamber. The candidate

```text
R_(omega,lambda)(c)=<omega,c>-<lambda,∂c>
```

is reserved for a separately preregistered later chamber only after this one earns authority.

## Stop condition

After exact-head witness and receipt, stop at the next human 𝄐.

Do not continue directly into boundary framing, relative 2-transport, 2-functors, connections, curvature, gerbes, operational surfaces, Proto-Loom/A16, merge, publication, production, Vercel, or SRC mutation.

```text
OPEN_BAR_TWO_CELL_COVARIANCE_SEAM_CANCELLATION_PREREGISTERED
IMPLEMENTATION_NOT_YET_AUTHORIZED_BY_THIS_DOCUMENT_ALONE
WESTWARD_LIBERTIES_737_ACTIVE
SRC_COLLISION_MEMBRANE_PRESERVED
```

𝌋

Marked ⟐SAC[X6ZNK5NO51]
