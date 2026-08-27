𝌋

# Aperture × Pedagogue Admissible Bilinear Probe Geometry Gauntlet v0.1

**Schema:** `td613.a15-r0.aperture-pedagogue-admissible-bilinear-probe-geometry/v0.1`  
**Program:** A15-R0  
**Scientific parent:** #704 receipt head `8ed7dbdca905beb3f7c9138b499da54809834fc5`  
**Status:** PREREGISTERED / PRE-IMPLEMENTATION / NO TERMINOLOGY-PROMOTION AUTHORITY

## 0. Research question

#704 established, in one authored finite fixture, that a hidden 2x2 linear operator can be reconstructed from a full-rank family of scalar bilinear responses

```text
z = r T x.
```

The next failure mode is action-space laundering.

An optimizer working only on the four coordinates of `vec(T)` may propose an arbitrary linear functional that perfectly contracts the current operator nullspace even when that functional cannot be realized as one declared scalar bilinear input/readout probe.

The literal question is therefore:

> Does operator-nullspace informativeness survive restriction from arbitrary linear functionals on `vec(T)` to the actually admissible single-probe bilinear action set?

Frozen anti-equivalence:

```text
distinguishable by an arbitrary linear functional on vec(T)
!=
distinguishable by one admissible scalar bilinear rTx probe
```

## 1. Inherited incomplete operator family

Reuse only the first three response rows from #704:

```text
A3 = [
  [1,1,0,0],
  [0,0,1,1],
  [1,0,1,0]
]
```

with frozen null direction

```text
n = [1,-1,-1,1].
```

Required preregistered facts:

```text
rank(A3) = 3
nullity(A3) = 1
A3 n = 0
```

The corresponding 2x2 null-direction matrix is

```text
N = [[1,-1],[-1,1]].
```

## 2. Single-bilinear admissibility

For one scalar probe with row/readout `r=[r1,r2]` and input `x=[x1,x2]`, the induced coefficient row on row-major `vec(T)` is

```text
h(r,x) = [r1*x1, r1*x2, r2*x1, r2*x2].
```

Reshape any candidate `h=[h11,h12,h21,h22]` as

```text
H = [[h11,h12],[h21,h22]].
```

For this authored 2x2 chamber, a nonzero coefficient row is realizable as one scalar bilinear probe iff `H` has rank 1, equivalently

```text
det(H) = 0.
```

The zero row is degenerate and inadmissible for the candidate set.

This is an action-set constraint, not an information score.

## 3. Frozen matched-cost candidates

Every candidate below has declared `probe_cost = 1`. This cost is an authored action-count cost only; it is not a universal physical-resource metric.

### `Q_UNRESTRICTED_TRACE`

```text
h = [1,0,0,1]
H = [[1,0],[0,1]]
det(H) = 1
h·n = 2
```

It contracts the current null direction as an arbitrary linear functional but is **not realizable as one scalar bilinear probe**.

Frozen status:

```text
UNRESTRICTED_LINEAR_FUNCTIONAL_INFORMATIVE_BUT_INADMISSIBLE_AS_ONE_BILINEAR_PROBE
```

### `Q_ADMISSIBLE_GOOD`

```text
r = [1,0]
x = [1,0]
h = [1,0,0,0]
det(H) = 0
h·n = 1
```

Required:

```text
rank([A3;h]) = 4
```

Frozen status:

```text
ADMISSIBLE_BILINEAR_PROBE_CONTRACTS_OPERATOR_NULLSPACE
```

### `Q_ADMISSIBLE_BLIND`

```text
r = [1,1]
x = [0,1]
h = [0,1,0,1]
det(H) = 0
h·n = 0
```

Required:

```text
rank([A3;h]) = 3
```

This is a legal single bilinear action that does not resolve the remaining ambiguity.

Frozen status:

```text
ADMISSIBLE_BILINEAR_PROBE_BLIND_TO_CURRENT_OPERATOR_NULLSPACE
```

## 4. Frozen scoring hostile

Define the assay-local normalized nullspace sensitivity score

```text
score(h) = |h·n| / ||h||_2.
```

Expected frozen values:

```text
score(Q_UNRESTRICTED_TRACE) = sqrt(2)
score(Q_ADMISSIBLE_GOOD) = 1
score(Q_ADMISSIBLE_BLIND) = 0
```

An unrestricted greedy selector that ranks all equal-cost linear functionals by this score must choose the trace hostile.

That selection is scientifically invalid because the proposed action is outside the declared one-probe bilinear action set.

The admissibility-aware selector must:

1. reject non-bilinear candidates before informativeness ranking;
2. retain only realizable one-probe actions;
3. choose `Q_ADMISSIBLE_GOOD` over the blind legal action.

Frozen anti-equivalence:

```text
highest unrestricted information score
!=
highest realizable one-action information score
```

## 5. Factorization witness

The executable must not infer admissibility only from candidate labels.

For each candidate it must compute the 2x2 coefficient matrix and determinant/rank condition. For legal probes it must also reconstruct the coefficient row from the declared `(r,x)` factorization and verify exact agreement.

The unrestricted trace candidate intentionally has no `(r,x)` factorization supplied to the selector.

## 6. Coordinate-equivalence control

Reuse the declared #704 coordinate transform

```text
G = [[1,1],[0,1]].
```

For an admissible bilinear probe,

```text
x' = Gx
r' = r G^-1.
```

The transformed probe remains bilinear by construction and its coefficient matrix remains rank 1 / determinant 0.

Required:

```text
complete coordinate change preserves single-bilinear admissibility.
```

This control does not claim that the raw four-coordinate coefficient row is invariant.

## 7. Hostile controls

The hostile contract must fail if any of the following occur:

```text
H1 unrestricted trace is treated as one admissible bilinear action
H2 candidate label substitutes for computed factorization/admissibility
H3 blind legal probe is claimed to contract the nullspace
H4 unrestricted score is applied before action-set filtering by the corrected selector
H5 trace hostile is silently decomposed into multiple probes while retaining cost 1
H6 coordinate transformation destroys bilinear realizability
H7 current null vector or hidden answer is leaked into an oracle-only selection field beyond the declared nullspace state already available to Pedagogue
H8 claim ceiling is widened to general experiment-design optimality or operator tomography
```

Clarification for H7: the current compatible-family null direction `n` is part of Pedagogue's declared epistemic state in this assay. Hidden `T_star`, future scalar responses, and answer-key labels are not selector inputs.

## 8. Success criteria

The chamber succeeds only if all are true:

```text
A3 rank = 3 and n remains its null direction
trace hostile resolves n algebraically
trace hostile fails one-bilinear admissibility
GOOD is admissible and raises rank to 4
BLIND is admissible and leaves rank 3
unrestricted selector chooses TRACE
admissibility-aware selector rejects TRACE and chooses GOOD
coordinate-equivalent GOOD remains admissible
no hidden operator / future response leakage reaches selector
fixture remains immutable
```

## 9. Bounded claim candidate

If the hostile contract survives exact-head witness, the strongest permitted chamber claim is:

```text
AN_UNRESTRICTED_LINEAR_FUNCTIONAL_ON_VEC_T_CAN_RESOLVE_THE_CURRENT_OPERATOR_NULLSPACE_WHILE_REMAINING_INADMISSIBLE_AS_ANY_SINGLE_DECLARED_BILINEAR_INPUT_READOUT_PROBE_AND_MATCHED_ACTION_COUNT_ADMISSIBLE_BILINEAR_PROBES_CAN_DIFFER_IN_NULLSPACE_CONTRACTION_IN_THE_AUTHORED_FINITE_FIXTURE
```

## 10. Claim ceiling

Even success does **not** establish:

```text
general optimal experimental design
canonical operator tomography terminology promotion
operator tomography general theorem
blind tomography
physical tomography
path category
path transport
holonomy
curvature
Berry structure
quantum behavior
Proto-Loom
A16 reopening
live Ash mutation
merge authority
production authority
Vercel authority
```

## 11. Frozen next question if successful

The trace hostile contains another seam:

```text
inadmissible as one bilinear probe
!=
unrealizable as a multi-probe program.
```

Indeed, in this 2x2 fixture,

```text
trace(T) = e1^T T e1 + e2^T T e2.
```

A later separately preregistered chamber may ask whether an inadmissible rank-2 linear functional can be realized as a cost-2 composition of admissible rank-1 bilinear probes, and whether action cost / sequencing changes the scientific comparison.

That later chamber is not authorized by this preregistration alone.

𝌋

Sealed ⟐
