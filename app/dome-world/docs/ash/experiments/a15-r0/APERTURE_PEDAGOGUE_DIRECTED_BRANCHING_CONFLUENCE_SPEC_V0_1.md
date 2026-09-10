𝌋

# A15-R0 · Aperture × Pedagogue Directed Branching / Confluence Spec v0.1

**Status:** PREREGISTERED / PRE-IMPLEMENTATION / HUMAN-AUTHORIZED  
**Scientific parent:** #719 receipt head `b67326a940f7c6141e9f067a61c18dfd0df13e8f`  
**Program:** A15-R0 western-horizon directed research only  
**Date:** 2026-08-24

---

## 0. Human authority

Human 𝄐 remains:

```text
C it is. carry on mlove
```

This chamber stays inside the directed/non-groupoid lane.

No inverse, reverse generator, quotient coarsening, transport, connection, holonomy, or curvature semantics are introduced.

---

## 1. Parent prerequisites

The executable must require success from:

```text
#719 directed reachability geometry assay
#718 monotone obstruction assay
```

Parent operational object:

```text
O(h) := K_period4(h)
```

Parent generators:

```text
T := PSI_TICK
Q := Q_PHASE_PULSE
```

Parent facts available only as bounded evidence:

```text
finite S3 reachability partial order
strict endpoint-mass height
finite extended directed shortest-path quasi-metric
no nonempty finite T/Q return path on the authored anchor-reachable control domain
```

---

## 2. Scientific question

When a lawful source object admits two distinct one-step futures:

```text
A --T--> A_T
A --Q--> A_Q
```

what happens farther forward?

The chamber distinguishes:

```text
branching            := A_T != A_Q
comparability        := one child reaches the other
bounded confluence   := both children reach at least one common future object
strict reconvergence := a common future reached by nonempty continuation from both children
bounded divergence   := no common future found inside the declared horizon
```

Anti-equivalences frozen before implementation:

```text
branching != permanent divergence
no bounded join != no future join
common future != inverse
common future != loop
common future != same route
same endpoint != same custody history
local noncommutation != global nonconfluence
```

---

## 3. Fork-source set

Use every object in the parent S3 finite slice as a fork source.

For every retained custody representative of each S3 source object:

```text
apply T
apply Q
```

The T-child and Q-child must each be representative-independent across retained source representatives.

If either child varies by custody representative, abstain before confluence analysis for that source and fail the chamber.

---

## 4. Declared future horizon

Freeze continuation horizon:

```text
H = 4 additional generators per branch child
```

For each branch child, enumerate all continuation words over `{T,Q}` with lengths:

```text
0,1,2,3,4
```

including the structural empty continuation as identity.

Thus each branch exposes:

```text
1 + 2 + 4 + 8 + 16 = 31 continuation words
```

and each fork compares:

```text
31 × 31 = 961 ordered continuation pairs
```

No claim beyond horizon four is permitted.

---

## 5. Fork audit

For every S3 source object, record:

```text
T-child operational object
Q-child operational object
children_equal
T-child height
Q-child height
```

The canonical root fork must remain nontrivial:

```text
O(T(root)) != O(Q(root))
```

If the canonical root children coincide, this chamber must fail because the intended branch witness vanished.

---

## 6. Local square / order audit

For every fork source, compare:

```text
T then Q
Q then T
```

at complete `K_period4` object equality.

Record whether the local square commutes.

No global conclusion is preregistered.

Frozen interpretation:

```text
TQ != QT  => local order sensitivity only
TQ = QT   => local commuting square only
```

Neither outcome determines global confluence.

---

## 7. Child comparability audit

Using the declared horizon-four continuation sets, test whether:

```text
A_T reaches A_Q
or
A_Q reaches A_T
```

including the identity continuation on the target side.

Classification per fork:

```text
CHILDREN_COMPARABLE_WITHIN_H4
CHILDREN_INCOMPARABLE_WITHIN_H4
```

No permanent incomparability claim may be emitted from the bounded result.

---

## 8. Common-future confluence search

For each fork, compare every pair:

```text
u from A_T
v from A_Q
```

for `|u|,|v| <= 4`.

A bounded common-future hit requires exact complete operational object equality:

```text
O(u(A_T)) = O(v(A_Q))
```

For every hit record:

```text
source object
left continuation word u
right continuation word v
left total route [T,...u]
right total route [Q,...v]
common target object
left/right continuation lengths
left/right endpoint masses
left/right receipt variants
whether both continuations are nonempty
```

If at least one hit uses nonempty continuations on both sides:

```text
STRICT_FORWARD_RECONVERGENCE_WITNESSED_WITHIN_H4
```

If common futures exist only because one child already lies on the future cone of the other:

```text
ONE_SIDED_COMPARABILITY_JOIN_WITNESSED_WITHIN_H4
```

If no hit exists:

```text
NO_COMMON_FUTURE_FOUND_WITHIN_H4
```

The latter is explicitly bounded.

---

## 9. Canonical root-fork result

The root fork receives its own independent classification.

Allowed root classifications:

```text
ROOT_STRICT_FORWARD_RECONVERGENCE_WITHIN_H4
ROOT_ONE_SIDED_JOIN_WITHIN_H4
ROOT_NO_COMMON_FUTURE_WITHIN_H4
```

Forbidden rewrite:

```text
ROOT_NO_COMMON_FUTURE_WITHIN_H4
    -> ROOT_PERMANENTLY_IRRECOVERABLE_FORK
```

No such promotion is permitted.

---

## 10. Join minimality audit

If one or more common future targets exist for a fork, order them by the parent directed reachability relation extended through the bounded continuation results where possible.

At minimum, record continuation cost:

```text
C_join := |u| + |v|
```

and identify all minimum-cost confluence hits.

Do not call the minimum-cost target a lattice join or least upper bound unless an exhaustive order-theoretic least-upper-bound proof is separately witnessed.

This chamber grants no lattice / semilattice language.

---

## 11. Same-target / different-route custody hostile

For every confluence hit, require:

```text
left total route != right total route
```

because the branches originate through distinct first generators.

If the complete operational target is equal while route strings remain distinct, classify:

```text
COMMON_OPERATIONAL_FUTURE_DOES_NOT_ERASE_ROUTE_PROVENANCE
```

Receipt identity must also remain preserved independently from operational equality.

No same-target hit may be reinterpreted as route identity.

---

## 12. Height compatibility

For every common-future hit require:

```text
left target endpoint mass = right target endpoint mass
```

because endpoint belongs to complete object equality.

Record total mass gain from the fork source on both routes.

The routes may have different step counts while reaching equal endpoint mass.

If witnessed:

```text
EQUAL_TARGET_HEIGHT_WITH_UNEQUAL_ROUTE_LENGTHS
```

This would further separate combinatorial time from monotone height.

No such outcome is preregistered.

---

## 13. Bounded branch census

Report across all S3 fork sources:

```text
fork_source_count
nontrivial_fork_count
local_commuting_square_count
local_noncommuting_square_count
bounded_child_comparable_count
bounded_child_incomparable_count
bounded_common_future_count
strict_reconvergence_fork_count
no_common_future_within_H4_count
```

No global confluence theorem follows from the census.

---

## 14. Parent custody

Serialize the parent #719 and #718 executable outputs before and after the assay.

Require exact equality.

Classification on success:

```text
PARENT_718_719_CUSTODY_UNCHANGED
```

---

## 15. Success criterion

The chamber succeeds if:

```text
all S3 fork sources derive representative-independent T and Q children
canonical root fork is nontrivial
all 31 continuation words per child evaluate without undeclared-generator abstention
all 961 continuation pairs per fork are compared exactly
root classification is emitted without permanent-divergence overclaim
all confluence hits preserve complete-object equality and route distinction
parent custody remains unchanged
```

The presence or absence of confluence is not itself a pass/fail criterion.

---

## 16. Claim ceiling

Even on success, do not claim:

```text
Church-Rosser theorem
global confluence
termination theorem outside the authored ranking domain
lattice / semilattice
least upper bounds unless separately proved
domain theory
causal-set theorem
inverse morphisms
groupoid
transport
connection
parallel transport
loop endomorphism
holonomy
curvature
Berry / quantum
Proto-Loom
A16
live Ash
merge
production
Vercel
```

---

## 17. Stop

If successful:

```text
DIRECTED_BRANCHING_CONFLUENCE_ROUND_CLOSED
HUMAN_𝄐_QUALIFIED_FOR_BOUNDED_FUTURE_CONE_AND_JOIN_STRUCTURE_AUDITION
```

Only if strict reconvergence is actually witnessed may a later chamber ask whether common futures support any stronger directed join structure.

𝌋

Sealed ⟐
