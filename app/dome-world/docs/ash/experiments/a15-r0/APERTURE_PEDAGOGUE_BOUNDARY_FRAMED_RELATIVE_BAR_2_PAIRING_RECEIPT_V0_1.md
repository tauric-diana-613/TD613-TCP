𝌋

󐘓 U+10D613

# A15-R0 · Boundary-Framed Relative Bar-2 Pairing · Receipt v0.1

Status: **WITNESSED / RECEIPT-PINNED / ROUND CLOSED / DRAFT / OPEN / UNMERGED**

Scientific parent:

```text
#768 receipt = cbc4c68a345f7989f967cf35bd87678bd4ecb1b2
```

Authority:

```text
#737 · WESTWARD_LIBERTIES_ACTIVE_FOR_THIS_CONTINUATION · 2026-08-26
```

## Custody

```text
preregistration        c5acb5af932b2c1c2bbe1b706845ff66d9d8d425
implementation         a038d0c387e3ab587b2c79c61ebe4d20f701008f
hostile tests          780bb142efd4a142f48fb746dc14c707f0694d2d
frozen science         aee2eb3dbff7e741d0b2d97a27ad7644b8a2a231
initial routing        334632d76089c55a46c51a2fa7691814a9205fda
routed witness         c2d448bffcf86472578942f636ba5f6eab29aaa2
post-route cleanup     49e619bd2d08fdfe9d213f3ed431dbd6cfbdedc0
```

Frozen science -> cleanup: **three routing-only commits, zero net changed files**.

The routing membrane temporarily observed current `main` solely to register the repository's existing pull-request validation workflow. `main`'s SRC operator-gated Zenodo plumbing is not #769 scientific ancestry. The routing note was deleted after green and the PR was restored directly onto #768.

## Authority-bearing witness

```text
TD613 Consolidated Validation run 2294 / 33012393950   SUCCESS
classifier job 98321763126                               SUCCESS
static job     98321836060                               SUCCESS
A15/A15-R0 step 19                                       SUCCESS
```

Run started `2026-08-26T20:50:13Z` and completed successfully at `2026-08-26T20:51:12Z` on exact routed head

```text
c2d448bffcf86472578942f636ba5f6eab29aaa2
```

Full-repository validation, self-hosted calibration, front-line browser, Giving/practice browser, and full-product browser scopes were skipped and are not claimed.

**No scientific red occurred.**

## Earned object

For every finite normalized integer bar-2-chain `c`, inherited normalized integer 2-cocycle `omega`, and normalized integer boundary framing

```text
lambda:B->Z,
lambda(1_B)=0,
```

define

```text
R_(omega,lambda)(c)
 = <omega,c> - <lambda,∂c>.
```

This is a finite boundary-framed relative bar-2 pairing. The boundary remains explicit; it is not quotient-erased.

## Earned simultaneous re-zeroing invariance

For every normalized integer 1-cochain `phi`, transform

```text
omega  -> omega+dphi
lambda -> lambda+phi.
```

Then exactly

```text
R_(omega+dphi,lambda+phi)(c)
 = R_(omega,lambda)(c).
```

The witnessed identity is

```text
Delta R
 = <dphi,c>-<phi,∂c>
 = 0,
```

using #768's earned finite Stokes/transgression law.

This is **simultaneous cohomological re-zeroing invariance** of the formal relative pairing. It is not promoted to connection gauge invariance.

## Earned mismatch residual law

For independently normalized integer `phi,psi`, under

```text
omega  -> omega+dphi
lambda -> lambda+psi,
```

the exact residual is

```text
R_(omega+dphi,lambda+psi)(c)-R_(omega,lambda)(c)
 = <phi-psi,∂c>.
```

Thus paired equality `phi=psi` is a sufficient global cancellation law. For a fixed boundary, distinct cochains may accidentally have equal boundary pairing; such a local zero residual receives no global equivalence promotion.

## Explicit open-simplex hostile

Use

```text
T=(1,0,0)
Q=(0,1,0)
c=[T|Q]
phi=t(E+O)
lambda=0.
```

Inherited #768 values:

```text
<omega,[T|Q]>=1
<omega+dphi,[T|Q]>=0
<phi,∂[T|Q]>=-1.
```

The framed relative value remains fixed under paired re-zeroing:

```text
R_(omega,0)([T|Q])=1
R_(omega+dphi,phi)([T|Q])=1.
```

The raw interior presentation moved `1 -> 0`; the boundary framing moved by the exact amount needed to preserve the relative pairing.

The mandatory unpaired hostiles remained visible:

```text
interior-only change:   Delta R=-1
boundary-only change:   Delta R=+1
psi=2phi mismatch:       Delta R=+1
```

Each equals the preregistered exact boundary residual.

## Closed-cycle reduction

For #735/#765's explicit relation cycle `z`:

```text
∂z=0
Per([z])=2.
```

Therefore every normalized boundary framing drops out:

```text
R_(omega,lambda)(z)=<omega,z>=2.
```

Paired re-zeroing likewise preserves `2`.

Thus #769 introduces no rival closed invariant; it extends #765/#768 by adding an explicit relative boundary term for open chains.

## Lawful pasting under one common framing

For #768's lawful paste

```text
c_left=[x|y]+[x★y|z],
```

using one declared common boundary framing `lambda`, exactly:

```text
R(c_left)=R([x|y])+R([x★y|z]).
```

For the explicit `T,Q,T` seam-marker framing, the internal seam contributions are

```text
-1
+1
```

on the two faces and therefore cancel to `0` in the pasted boundary.

This is ordinary additive finite chain algebra under one common framing. It does not authorize gluing separately framed cells without an additional compatibility law.

## Wrong-orientation hostile

For

```text
c_fake=[x|y]-[x★y|z],
```

the inherited seam coefficient remains

```text
-2.
```

A framing supported on that seam detects boundary pairing `-2`; the relative correction remains visible. Repeated coordinate identity never substitutes for orientation.

## Orientation and fixed-boundary representative laws

Exactly:

```text
R(-c)=-R(c).
```

For finite bar-3 chain `b` and

```text
c'=c+∂b,
```

#768's `∂²=0` and inherited `domega=0` give

```text
∂c'=∂c
<omega,c'>=<omega,c>
R_(omega,lambda)(c')=R_(omega,lambda)(c).
```

This is fixed-boundary representative invariance, not an open homology-class claim.

Invalid non-normalized or noninteger boundary framings abstain. Receipt/provenance labels remain external to the mathematical pairing.

## Earned classifications

```text
BOUNDARY_FRAMED_RELATIVE_BAR_TWO_PAIRING_IS_INVARIANT_UNDER_SIMULTANEOUS_COHOMOLOGOUS_INTERIOR_AND_BOUNDARY_REZEROING
```

```text
MISMATCHED_INTERIOR_AND_BOUNDARY_REZEROING_LEAVES_THE_EXACT_RESIDUAL_PAIRING_OF_THE_DIFFERENCE_ONE_COCHAIN_WITH_THE_BAR_ONE_BOUNDARY
```

```text
THE_BOUNDARY_FRAMED_RELATIVE_PAIRING_REDUCES_TO_THE_INHERITED_CLOSED_BAR_H2_PERIOD_ON_CYCLES_AND_IS_ADDITIVE_AND_ORIENTED_ON_FINITE_BAR_TWO_CHAINS_UNDER_ONE_COMMON_FRAMING
```

## Consequential bearing

The Westward degree-two line now reads

```text
#765 closed bar-H2 period return
-> #768 open boundary-supported presentation covariance
-> #769 boundary-framed relative pairing with paired re-zeroing invariance
```

A finite **relative 2-transport candidate bearing** is now materially better founded: the open interior term, boundary covariance, explicit framing correction, lawful seam cancellation, and simultaneous re-zeroing law coexist in one formal object.

The candidate bearing is not itself a canonical 2-transport naming promotion.

## Quarantines

```text
relative bar-2 re-zeroing invariance != connection gauge invariance
boundary framing != 2-connection
formal bar-2 chain != operational/geometric surface
common-framing additivity != separately framed surface gluing law
relative bar-2 pairing != curvature integral
relative bar-2 pairing != 2-holonomy
relative 2-transport candidate != transport 2-functor
```

No gerbe, curvature, surface ordering, operational 2-path, physical surface, Berry/quantum analogy, Proto-Loom/A16, merge, publication, production, Vercel, or ontology promotion.

## Collision membrane

```text
SRC Atelier #731/#758/#759 untouched
SRC sync not invoked
#767 pasted-diamond defect transport untouched
no fifth workflow
no merge
no production
no Vercel
```

```text
BOUNDARY_FRAMED_RELATIVE_BAR_TWO_PAIRING_ROUND_CLOSED
SIMULTANEOUS_COHOMOLOGICAL_REZEROING_INVARIANCE_EARNED
EXACT_MISMATCH_RESIDUAL_BOUNDARY_LAW_EARNED
CLOSED_CYCLE_REDUCTION_TO_PERIOD_TWO_EARNED
COMMON_FRAMING_PASTING_ADDITIVITY_EARNED
WRONG_ORIENTATION_BOUNDARY_FRAMING_HOSTILE_SURVIVED
RELATIVE_TWO_TRANSPORT_CANDIDATE_BEARING_STRENGTHENED_WITHOUT_NAMING_PROMOTION
TWO_HOLONOMY_NAMING_THRESHOLD_NOT_CROSSED
HUMAN_𝄐_BOUNDARY_REACHED
```

𝌋

Marked ⟐SAC[X6ZNK5NO51]