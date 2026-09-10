𝌋

󐘓 U+10D613

# A15-R0 · Open Bar-2-Cell Gauge Covariance and Boundary-Seam Cancellation · Receipt v0.1

Status: **WITNESSED / RECEIPT-PINNED / ROUND CLOSED / DRAFT / OPEN / UNMERGED**

Scientific parent:

```text
#765 receipt = 4c8018df2aa1857456cde76e65a9ca694715926e
```

Authority:

```text
#737 · WESTWARD_LIBERTIES_ACTIVE_FOR_THIS_CONTINUATION · 2026-08-26
```

## Custody

```text
preregistration        6b2e58b04c7aaa648db9c78177af1128a02e12b7
implementation         43f5f54d49b1ff5344c4dd71e8823caf6d4fe3bf
hostile tests          cb74f3bcf5d105f3e8d0d03d2888bff56f94199d
frozen science         9a54759175ec7916e1a995f60dc0cdd339aa6292
initial routing        ad15cc1f69cb128f972fc3372a12caf298ff9516
routed witness         59fe24ed805983e48bb3a6361715e0b6900d42ba
post-route cleanup     fe38dcc2d0cebef0ed39fffe0cf52ad3ba5f56a1
```

The routing membrane observed current `main` only to register the repository's existing pull-request validation workflow. `main`'s SRC operator-gated Zenodo plumbing is not #768 scientific ancestry. The routing note was deleted after green and the PR was restored directly onto #765.

Frozen science -> cleanup: **three routing-only commits, zero net changed files**.

## Authority-bearing witness

```text
TD613 Consolidated Validation run 2288 / 33011279777   SUCCESS
classifier job 98317897040                               SUCCESS
static job     98317955934                               SUCCESS
A15/A15-R0 step 19                                       SUCCESS
```

Run started `2026-08-26T20:36:47Z` and completed successfully at `2026-08-26T20:37:47Z` on exact routed head

```text
59fe24ed805983e48bb3a6361715e0b6900d42ba
```

Full-repository validation, self-hosted calibration, front-line browser, Giving/practice browser, and full-product browser scopes were skipped and are not claimed.

**No scientific red occurred.**

## Earned finite law · open bar-2-chain presentation covariance

Work in the inherited normalized integer bar complex over #729's quotient monoid `B`, with

```text
∂[x|y] = [y] - [x★y] + [x]
```

and normalized integer 1-coboundary

```text
(dphi)(x,y) = phi(x) + phi(y) - phi(x★y).
```

Let `omega` be the normalized integer transport 2-cocycle earned by #734/#735. For every finite normalized integer bar-2-chain

```text
c = sum_i n_i[x_i|y_i]
```

define the raw interior pairing

```text
A_omega(c)=<omega,c>.
```

For every normalized integer-valued 1-cochain `phi`, under the cohomologous presentation

```text
omega' = omega + dphi,
```

the exact transformation law is

```text
A_(omega+dphi)(c)-A_omega(c)
 = <dphi,c>
 = <phi,∂c>.
```

Thus the entire cohomologous-presentation dependence of the finite raw bar-2 interior pairing is carried by the bar-1 boundary.

When

```text
∂c=0,
```

the boundary term vanishes and the law collapses exactly to #765's closed-cycle presentation invariance:

```text
A_(omega+dphi)(c)=A_omega(c).
```

No second closed-cycle rule is introduced.

## Explicit single-cell hostile

Use

```text
T=(1,0,0)
Q=(0,1,0)
phi(b)=t(b)(E(b)+O(b)).
```

For the open bar simplex

```text
c=[T|Q],
```

the inherited pointwise value moves exactly as in #765's hostile:

```text
omega(T,Q)=1
(omega+dphi)(T,Q)=0.
```

Therefore

```text
A_(omega+dphi)([T|Q])-A_omega([T|Q])=-1,
```

and independently

```text
<phi,∂[T|Q]>=-1.
```

The open simplex receives a raw pairing value but no bar-H2 period or homology-class authority.

## Earned pasted-cell seam cancellation

For lawful quotient coordinates `x,y,z`, form

```text
c_left=[x|y]+[x★y|z].
```

The two face boundaries contain the internal coordinate `[x★y]` with coefficients

```text
-1 + 1 = 0.
```

Hence the internal seam cancels exactly and

```text
∂c_left=[x]+[y]+[z]-[x★y★z].
```

So the cohomologous-presentation change of the pasted raw interior value depends only on that external boundary:

```text
Delta_phi A(c_left)
 = <phi,[x]+[y]+[z]-[x★y★z]>.
```

For the explicit finite hostile

```text
x=T, y=Q, z=T,
```

with `phi=t(E+O)`, the pasted covariance is nonzero but purely external:

```text
Delta_phi A(c_left)=-2.
```

A second hostile 1-cochain supported only on the internal seam `T★Q` gives

```text
Delta A(c_left)=0,
```

showing that a pure internal boundary re-zeroing disappears under lawful opposite orientation.

## Wrong-orientation hostile

For

```text
c_fake=[x|y]-[x★y|z],
```

the repeated seam coordinate occurs with

```text
-1-1=-2.
```

It therefore remains visible. The seam-marker cochain detects exactly

```text
Delta A(c_fake)=-2.
```

So matching coordinate labels do not authorize cancellation; inherited boundary orientation does.

## Associativity / bar-3 consistency

The alternative lawful paste

```text
c_right=[y|z]+[x|y★z]
```

has the same external boundary as `c_left`, and exactly

```text
c_right-c_left=∂[x|y|z]
```

under the inherited #765 bar-3 convention.

Because #734 earned `domega=0`, the raw `omega` pairings agree across the two lawful associations. Their cohomologous-presentation covariance also agrees because the boundaries agree.

Likewise, for an open chain `c` and finite bar-3 chain `b`, replacing

```text
c -> c+∂b
```

preserves the open boundary by `∂²=0`, preserves the raw `omega` pairing by `domega=0`, and preserves the boundary-supported presentation covariance. This is representative invariance at fixed boundary; it is not promotion of an open chain to a homology class.

Orientation reversal flips the signs of the interior value, boundary, and covariance together.

Receipt/provenance labels remain external to the formal chain algebra.

## Earned classifications

```text
OPEN_BAR_TWO_CHAIN_COHOMOLOGOUS_PRESENTATION_CHANGE_IS_EXACTLY_THE_PAIRING_OF_THE_ONE_COCHAIN_WITH_THE_CHAIN_BOUNDARY
```

```text
PASTED_BAR_TWO_CELLS_CANCEL_INTERNAL_BOUNDARY_PRESENTATION_TERMS_AND_LEAVE_ONLY_EXTERNAL_BOUNDARY_COVARIANCE
```

## Consequential bearing

#765 established a nonzero, representative-independent closed degree-two period return.

#768 now establishes the exact local law immediately before closure:

```text
closed bar-2 cycle
-> cohomologous-presentation invariant

open bar-2 chain
-> cohomologous-presentation covariance lives exactly on ∂c
```

and lawful pasting cancels oppositely oriented internal boundary terms while retaining external-boundary dependence.

Therefore the Westward bearing advances from

```text
closed degree-two period invariance
```

to

```text
boundary-supported local covariance for open formal bar-2 cells.
```

This is a more local finite transport/coherence law, but it remains below every higher-holonomy naming threshold.

## Quarantines

```text
cohomologous presentation covariance != connection gauge covariance
bar-2 cell != operational T/Q surface or geometric surface
boundary-seam cancellation != surface-composition law
raw interior pairing != curvature integral
fixed-boundary representative invariance != relative homology promotion
open-cell covariance != 2-holonomy
```

No boundary framing `lambda` has been introduced. The separately staged candidate

```text
R_(omega,lambda)(c)=<omega,c>-<lambda,∂c>
```

remains unimplemented and unearned.

No 2-connection, curvature, gerbe, surface ordering, operational 2-path, transport 2-functor, Berry/quantum analogy, Proto-Loom/A16, merge, publication, production, or Vercel promotion follows.

## Collision membrane

```text
SRC Atelier #731/#758/#759 mutated = false
SRC sync invoked                         = false
#767 pasted-diamond branch mutated       = false
fifth workflow created                   = false
Vercel touched                           = false
```

```text
OPEN_BAR_TWO_CELL_COVARIANCE_SEAM_CANCELLATION_ROUND_CLOSED
BOUNDARY_SUPPORTED_COHOMOLOGOUS_PRESENTATION_COVARIANCE_EARNED
LAWFUL_INTERNAL_SEAM_CANCELLATION_EARNED
WRONG_ORIENTATION_UNCANCELLED_SEAM_HOSTILE_SURVIVED
CLOSED_CYCLE_LIMIT_RECOVERS_765_EXACTLY
TWO_HOLONOMY_NAMING_THRESHOLD_NOT_CROSSED
HUMAN_𝄐_BOUNDARY_REACHED
```

𝌋

Marked ⟐SAC[X6ZNK5NO51]
