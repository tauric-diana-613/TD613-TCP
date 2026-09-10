𝌋

# A15-R0 · Aperture × Pedagogue Directed Reachability Geometry Spec v0.1

**Status:** PREREGISTERED / PRE-IMPLEMENTATION / HUMAN-AUTHORIZED  
**Scientific parent:** #718 receipt head `05ae44861f1b7c1871928c9bdc8e0f730698e709`  
**Program:** A15-R0 western-horizon bounded research only  
**Date:** 2026-08-24

---

## 0. Human authority

Human 𝄐:

```text
C it is. carry on mlove
```

The selected lane is the directed/non-groupoid lane from #718.

This authority permits a bounded directed-geometry assay using only already-admitted operational objects and T/Q path semantics.

It does **not** authorize:

```text
new reverse generators
coarsening K_period4
inverse morphisms
groupoid promotion
transport
connection
loop endomorphism
holonomy
curvature
Berry / quantum vocabulary
Proto-Loom
A16
live Ash
merge
production
Vercel
```

---

## 1. Parent facts frozen as prerequisites

The assay must import and require executable success from both:

```text
#717 finite path-category audition
#718 invertibility admissibility / monotone-obstruction assay
```

Parent object:

```text
O(h) := K_period4(h)
```

Parent generators:

```text
T := PSI_TICK
Q := Q_PHASE_PULSE
```

Parent finite category slice:

```text
S3
```

Parent obstruction:

```text
M(h) := sum of endpoint entries
```

with all authored anchor-reachable T/Q generator steps strictly increasing M.

If either parent executable fails, this chamber must abstain before directed-geometry promotion.

---

## 2. Scientific question

The chamber asks:

> Once invertibility is obstructed, what positive directed structure is actually present?

It will distinguish three levels:

```text
1. full path category: remembers individual directed arrows / generator words;
2. reachability relation: remembers only whether at least one arrow A -> B exists;
3. directed shortest-path distance: remembers minimum path length only.
```

Anti-equivalence frozen before implementation:

```text
path identity != endpoint reachability
reachability equality != route equality
directed distance equality != route equality
same height != same operational object
same height != mutual reachability
partial order != thin path category
```

---

## 3. Reachability relation

On the finite S3 object set define:

```text
A ≼ B  iff  there exists at least one internal category arrow A -> B.
```

Because #717 includes one identity arrow per object, reflexivity is predicted.

Because #717 composition is closed and associative, transitivity is predicted.

Antisymmetry is **not** assumed from acyclicity alone in prose. It must be audited extensionally over all ordered node pairs and supported by the #718 strict-ranking obstruction:

```text
A ≼ B and B ≼ A  =>  A = B
```

for the authored finite node set.

Required exhaustive checks:

```text
all node reflexivity checks
all ordered-pair antisymmetry checks
all ordered-triple transitivity checks
```

If any fail, no partial-order classification may be emitted.

---

## 4. Path multiplicity / thinness audit

For every ordered object pair `(A,B)`, count the number of distinct category arrows with those endpoints.

Define:

```text
multiplicity(A,B) := |Hom_S3(A,B)|
```

where `Hom_S3` here means only the explicitly enumerated internal arrows of the authored finite path category.

The chamber must report:

```text
maximum endpoint-pair multiplicity
all endpoint pairs with multiplicity > 1
whether the finite path category is thin
```

No thinness outcome is preregistered.

Interpretation rule:

```text
if multiplicity > 1 exists:
  reachability order forgets route multiplicity;
  partial-order success does not make the parent path category a poset category.

if every multiplicity <= 1:
  the finite path category is thin on S3;
  no ambient thinness theorem is earned.
```

---

## 5. Height / grading audition

For each S3 node define authored height relative to the root anchor object:

```text
H(O) := M(O) - M(O_root)
```

where `M(O)` is the sum of the node state's endpoint entries.

The chamber must first audit every generator edge in S3:

```text
ΔH(edge) > 0
```

This rechecks local compatibility between the #717 slice and #718 monotone coordinate.

A stronger **unit grading** may be emitted only if every generator edge satisfies:

```text
ΔH(edge) = 1
```

and every internal arrow `f:A->B` satisfies:

```text
length(f) = H(B) - H(A).
```

No unit-grading result is preregistered.

If any generator edge has ΔH > 1, the chamber must retain only:

```text
STRICT_MONOTONE_HEIGHT_ON_S3
```

and explicitly decline graded-poset language.

---

## 6. Same-height antichain hostile

The chamber must search for at least one pair of distinct objects `A != B` with:

```text
H(A) = H(B)
```

and then audit whether either direction is reachable.

Prediction from strict monotonicity:

```text
if A != B and H(A)=H(B), then neither A ≼ B nor B ≼ A.
```

If such a witness exists, classify:

```text
SAME_HEIGHT_DISTINCT_OBJECTS_FORM_A_DIRECTED_ANTICHAIN_WITNESS
```

If no same-height distinct pair exists in S3, report absence without manufacturing one.

This control protects against:

```text
same scalar rank -> same state
same scalar rank -> observational equivalence
same scalar rank -> mutual reachability
```

---

## 7. Directed shortest-path distance

Define an extended directed distance on the S3 object set:

```text
d→(A,B) := minimum arrow length among internal arrows A -> B,
           +∞ if no arrow A -> B exists.
```

The chamber must audit extensionally:

```text
d→(A,A) = 0 for every A
all finite distances are nonnegative integers
triangle inequality for every ordered triple:
  d→(A,C) <= d→(A,B) + d→(B,C)
with ordinary extended-real conventions
```

Symmetry is **not** required.

The chamber must search for an asymmetry witness:

```text
d→(A,B) finite
and
d→(B,A) = +∞
```

If found, classify:

```text
DIRECTED_DISTANCE_ASYMMETRY_WITNESSED
```

This may be called an authored finite **extended directed shortest-path quasi-metric** only if the audited zero and triangle conditions pass.

It must not be called a metric.

---

## 8. Distance-information-loss audit

For each endpoint pair with more than one arrow, compare their arrow lengths.

The chamber must report whether distinct route words collapse to:

```text
same endpoint pair
same directed distance
```

If at least two distinct arrows between the same endpoints have equal minimum length, classify:

```text
DIRECTED_DISTANCE_FORGETS_ROUTE_IDENTITY
```

If multiplicity exists but lengths differ, classify instead:

```text
DIRECTED_DISTANCE_RETAINS_ONLY_MINIMUM_LENGTH_NOT_PATH_SET
```

If the path category is thin, report that this hostile is not instantiated in S3.

---

## 9. Root reachability profile

From the canonical S3 root object, record:

```text
reachable object count
unreachable object count
height histogram
minimum directed distance to each reachable object
```

If unit grading is earned, independently check:

```text
d→(root,O) = H(O)
```

for every root-reachable object.

If unit grading is not earned, no such equality may be claimed.

---

## 10. Parent custody and mutation prohibition

Before executing the assay serialize:

```text
runFinitePathCategoryAudition()
runInvertibilityAdmissibilityObstructionAssay()
```

After all directed-geometry calculations, re-run and serialize both parents.

Require byte equality.

Classification on success:

```text
PARENT_717_718_CUSTODY_UNCHANGED
```

The chamber may derive new immutable summaries only.

---

## 11. Success ladder

The executable must classify only what is actually earned.

Minimum possible successful classification:

```text
FINITE_S3_REACHABILITY_PARTIAL_ORDER_WITH_STRICT_MONOTONE_HEIGHT_AND_DIRECTED_SHORTEST_PATH_QUASIMETRIC
```

Possible stronger bounded suffixes, only if witnessed:

```text
UNIT_GRADED
NONTHIN_PATH_MULTIPLICITY
SAME_HEIGHT_ANTICHAIN
DIRECTED_DISTANCE_ROUTE_COLLAPSE
```

No ambient theorem is implied.

---

## 12. Claim ceiling

Even a fully successful assay does not earn:

```text
ambient TD613 partial order
causal-set theorem
generic poset representation theorem
generic Lyapunov theorem
metric geometry
Riemannian / Finsler geometry
Lawvere-enriched-category promotion
transport
connection
parallel transport
loop endomorphism
holonomy
curvature
Berry phase
quantum analogy
groupoid
inverse semantics
Proto-Loom
A16
live Ash
merge
production
Vercel
```

The terms `order`, `height`, and `directed shortest-path quasi-metric` remain finite authored S3 descriptors only.

---

## 13. Stop condition

If successful, stop at:

```text
DIRECTED_REACHABILITY_GEOMETRY_ROUND_CLOSED
HUMAN_𝄐_QUALIFIED_FOR_DIRECTED_BRANCHING_AND_CONFLUENCE_AUDITION
```

The proposed next C-lane chamber would study branch divergence / confluence / irrecoverable fork structure without introducing inverse or holonomy vocabulary.

𝌋

Sealed ⟐
