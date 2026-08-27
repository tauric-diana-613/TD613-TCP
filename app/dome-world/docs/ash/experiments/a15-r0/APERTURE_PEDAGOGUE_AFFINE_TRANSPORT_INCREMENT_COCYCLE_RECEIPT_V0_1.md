# A15-R0 · Affine Transport-Increment Cocycle Receipt v0.1

Status: **WITNESSED / ROUND CLOSED / DRAFT / OPEN / UNMERGED**

PR: `#734`
Parent PR: `#733`
Parent receipt head: `fd632f912982914a36807f83b02f750945c230a7`
Original preregistration commit: `8fd9614f643025a184f1bf6a031cc55c64c53918`

## Human reopening authority

```text
U+10D613 wow excellent work! i just finished peeling it apart on github. please continue to the next 𝄐, make sure it’s sufficiently 𝌋‌ enough so that the next 𝄐 is earned. @GitHub
```

## Earned classification

```text
FIRST_MOMENT_AFFINE_CROSS_TERM_IS_WELL_DEFINED_NORMALIZED_MONOID_2_COCYCLE_RECOVERING_WITNESSED_TRANSPORT_EXTENSION_WITH_SECTION_CHANGE_COVARIANCE
```

## Frozen base and extension

The base object is the source-retaining #729 quotient monoid

```text
B = {(t,E,O) : t,E,O ∈ N}
```

with parity-twisted product `★`:

```text
(t,E,O) ★ (u,F,G)
  = (t+u, E+F, O+G)  when t is even
  = (t+u, E+G, O+F)  when t is odd.
```

The identity is `e=(0,0,0)`.

Define the additive base observables

```text
t(x) = tick coordinate
q(x) = E(x)+O(x).
```

The witnessed #729 product gives

```text
t(x★y)=t(x)+t(y)
q(x★y)=q(x)+q(y).
```

The odd-parity swap exchanges the right `E/O` coordinates but preserves their sum.

#733 witnesses the first-moment extension coordinate

```text
C1 = B × N
```

with

```text
(x,P) ⊙ (y,R)
  = (x★y, P+R+t(x)q(y)).
```

## Cocycle theorem

Define

```text
ω(x,y)=t(x)q(y).
```

Within the declared source-retaining #729 monoid, `ω` is well-defined on quotient coordinates and independent of route spelling or receipt identity.

Normalization:

```text
ω(e,x)=0
ω(x,e)=0.
```

The normalized monoid 2-cocycle identity holds for all base coordinates:

```text
ω(x,y)+ω(x★y,z)
=
ω(y,z)+ω(x,y★z).
```

Symbolically,

```text
LHS = t_x q_y + (t_x+t_y)q_z
    = t_x q_y + t_x q_z + t_y q_z

RHS = t_y q_z + t_x(q_y+q_z)
    = t_x q_y + t_x q_z + t_y q_z.
```

The universal authority is this exact symbolic cancellation using the frozen additive laws for `t` and `q`. Finite coordinate controls are hostile corroboration only.

## Exact recovery of the witnessed transport extension

The cocycle extension product

```text
(x,P) ⊙_ω (y,R)
  = (x★y, P+R+ω(x,y))
```

recovers #733's witnessed first-moment product exactly because

```text
ω(x,y)=t(x)q(y).
```

For finite authored T/Q words, the same product recovers #733's all-finite concatenation law for `C1(uv)`.

This establishes that `ω` is not merely some cocycle compatible with the base monoid; it is the cocycle selected by the already-witnessed first-moment transport extension.

## Sufficiently-𝌋 hostiles

### Directed order sensitivity

For generator classes

```text
T=(1,0,0)
Q=(0,1,0)
```

the witness records

```text
ω(T,Q)=1
ω(Q,T)=0.
```

Thus the cocycle is nonzero as a function and directed-order-sensitive.

This does **not** establish a nonzero cohomology class.

### Swapped-cross-term impostor

The alternate function

```text
ω_swap(x,y)=q(x)t(y)
```

can satisfy a cocycle identity, but it fails exact recovery of the #733 transport extension on the `T,Q` ordering controls.

Therefore:

```text
some lawful cocycle
!=
the transport cocycle selected by the witnessed dynamics.
```

### Parity-fragile hostile

The candidate

```text
ω_E(x,y)=t(x)E(y)
```

fails the cocycle identity because `E` alone is not additive through #729's odd-parity swap.

On the preregistered `T,T,Q` hostile, the witnessed cocycle defect is

```text
1.
```

This isolates why `q=E+O`, rather than `E` alone, is structurally required.

### Quotient-representative independence

Distinct authored words

```text
TTQ
QTT
```

occupy one #729 quotient class. The cocycle value remains identical under the tested left and right base partners because route spelling is not an admissible cocycle input.

### Receipt externality

Receipt variants `R1` and `R1_DUP` remain distinct in the parent history layer while producing the same cocycle coordinate and value. Provenance is preserved outside the quotient/cocycle presentation.

## Section-change covariance

For a declared algebraic re-zeroing

```text
P'(x)=P(x)+φ(x)
```

with `φ(e)=0`, the transformed cross-term is

```text
ω_φ(x,y)
=
ω(x,y)+φ(x★y)-φ(x)-φ(y).
```

The executable witnesses the concrete section

```text
φ(t,E,O)=t^2+E+O
```

and the symbolic cancellation shows that `ω_φ` remains normalized and satisfies the same monoid 2-cocycle identity, while the transformed extension obeys

```text
P'(xy)=P'(x)+P'(y)+ω_φ(x,y).
```

Earned classification for this sub-result:

```text
SECTION_CHANGE_COVARIANCE_OF_NORMALIZED_MONOID_COCYCLE_PRESENTATION
```

This chamber does **not** promote the terms `cohomologous`, `coboundary class`, `nontrivial class`, `H^2`, or `central extension` as scientific classifications.

## Parent receipt / no replay custody

Parent #733 receipt head

```text
fd632f912982914a36807f83b02f750945c230a7
```

was bound by ancestry verification. The chamber did not rerun the western research stack for custody.

## Authority-bearing witness

```text
frozen scientific head  b36e5a0fd3f2ece7b5f1c6ae363c6ba03332568e
exact routed witness     b5549eb6ae101b4ea355ef34c9f6b7ec4e3cc128
run                      2158 / 32748515141   SUCCESS
classifier job           97499663335          SUCCESS
static job               97499787350          SUCCESS
A15/A15-R0 step 19                             SUCCESS
```

Run 2158 started `2026-08-24T15:58:10Z` and completed successfully at `2026-08-24T15:59:05Z`.

There was no predecessor scientific red witness in this chamber.

Explicit full-repository validation, self-hosted calibration, Giving/practice browser witness, front-line browser shards, and full-product browser witness were skipped and remain outside this receipt's claim.

## Post-witness cleanup

After run 2158 succeeded:

- #734 was restored from temporary `main` routing to parent branch `research/a15-r0-first-moment-weaker-transport-quotient-20260824`;
- the routing note was deleted;
- frozen scientific head `b36e5a0f...` to post-routing cleanup head `e39b7f27...` contains routing-only commits and **zero net changed files**;
- no scientific executable or hostile assertion changed during cleanup;
- no merge, production, or Vercel action occurred.

## Claim ceiling

This receipt does **not** establish or authorize:

```text
nontrivial cohomology class
coboundary/non-coboundary classification
H^1 / H^2 computation
group cohomology
group completion
inverse transport
groupoid
connection
closed nonidentity loop
loop endomorphism
holonomy
curvature
Berry / quantum analogy
higher-moment completeness
Proto-Loom
A16
live Ash mutation
merge
production
Vercel release
```

The word `2-cocycle` is used here strictly for the normalized **monoid** cocycle identity with trivial additive coefficient action, quotient well-definedness, exact recovery of the witnessed #733 extension, and section-change covariance.

```text
AFFINE_TRANSPORT_INCREMENT_COCYCLE_ROUND_CLOSED
HUMAN_𝄐_REQUIRED_BEFORE_ANY_COHOMOLOGY_CLASS_NONTRIVIALITY_OR_HIGHER_MOMENT_HIERARCHY_AUDITION
```

󐘓 U+10D613

𝌋

Sealed ⟐
