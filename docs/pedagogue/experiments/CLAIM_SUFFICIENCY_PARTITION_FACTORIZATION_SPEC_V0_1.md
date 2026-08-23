𝌋

# Claim Sufficiency · Partition Factorization Theorem v0.1

Status: **PREREGISTERED / SYMBOLIC + HOLDOUT / RESEARCH-ONLY**  
Technical identity: `td613.pedagogue.claim-sufficiency-partition-factorization/v0.1`  
Parent claim-sufficient stopping receipt: `f529ccaf13045d4ec0bac44ef58acb6e6bd1568a`  
Production mutation: **NONE**  
Vercel authority: **NONE**

---

## 0. Question

The prior measurement-design and stopping assays showed that minimizing raw candidate count can diverge from resolving a downstream claim.

This chamber asks for the exact finite-set structure underneath that divergence:

> For a finite compatible set `C`, target claim `f:C->V`, and measurement `q:C->Y`, when is the observed measurement value sufficient to determine the target claim without reconstructing the underlying candidate?

---

## 1. Three equivalent conditions

Define the measurement fiber at outcome `y`:

```text
q^-1(y) = { c in C : q(c)=y }
```

Define the claim fiber at value `v`:

```text
f^-1(v) = { c in C : f(c)=v }
```

The theorem candidate states that the following are equivalent:

### S1 · Bucket purity

For every `y in q(C)`, `f` is constant on `q^-1(y)`.

### S2 · Partition refinement

Every nonempty measurement fiber is contained in one claim fiber:

```text
Pi_q refines Pi_f
```

where `Pi_q` and `Pi_f` are the partitions induced by equality of `q` and `f` respectively.

### S3 · Factorization

There exists a unique function on observed outcomes:

```text
g : q(C) -> V
```

such that:

```text
f = g o q
```

on all of `C`.

Required theorem label:

```text
FINITE_CLAIM_SUFFICIENCY_IFF_MEASUREMENT_PARTITION_REFINES_CLAIM_PARTITION_IFF_CLAIM_FACTORS_THROUGH_MEASUREMENT
```

No category-theory structure is claimed by the word `factors`.

---

## 2. Proof obligations

### S1 -> S3

For each observed outcome `y`, choose any `c` with `q(c)=y` and define:

```text
g(y)=f(c)
```

Bucket purity makes this definition independent of which `c` is chosen.

Then for every `c in C`:

```text
g(q(c))=f(c)
```

### S3 -> S1

If:

```text
q(c1)=q(c2)
```

then:

```text
f(c1)=g(q(c1))=g(q(c2))=f(c2)
```

so `f` is constant on each measurement fiber.

### S1 <-> S2

Bucket purity states exactly that each block of `Pi_q` is contained in one block of `Pi_f`.

### Uniqueness of g

Because `g` is defined only on the actually observed image `q(C)`, any factorizing function must satisfy:

```text
g(y)=f(c)
```

for any `c` in the nonempty fiber over `y`.

Therefore `g` is unique on `q(C)`.

No statement is made about arbitrary values outside `q(C)`.

---

## 3. Anti-cardinality theorem

Partition refinement is structural and cannot be inferred from bucket sizes alone.

Two measurements may have:

```text
same number of outcomes
same multiset of bucket cardinalities
same scalar observation budget
```

while only one refines the target-claim partition.

A fresh matched-bucket holdout is required below.

---

## 4. Fresh matched-bucket holdout universe

Use `F_31` matrices:

```text
H(b,d) = [[2,b],[0,d]]
```

with restricted finite holdout universe:

```text
b in {0,1}
d in {5,7}
```

Thus:

```text
C = {
  H(0,5),
  H(1,5),
  H(0,7),
  H(1,7)
}
```

Every candidate must be verified invertible.

Target claim:

```text
f(H)=CONJUGACY_FINGERPRINT(H)
```

The implementation must compute the claim partition from the frozen gauge-blind classifier.

Expected target classes, to be computed rather than hard-coded:

```text
{H(0,5),H(1,5)}
{H(0,7),H(1,7)}
```

---

## 5. Matched measurements

Both measurements return exactly one scalar in `F_31`.

### Q_ALIGNED

```text
q_A(H)=t22
```

Expected buckets:

```text
outcome 5 -> {H(0,5),H(1,5)}
outcome 7 -> {H(0,7),H(1,7)}
```

### Q_TRANSVERSE

```text
q_T(H)=t12
```

Expected buckets:

```text
outcome 0 -> {H(0,5),H(0,7)}
outcome 1 -> {H(1,5),H(1,7)}
```

Matched geometry:

```text
outcome_count = 2 for both
bucket_size_multiset = [2,2] for both
scalar_budget = 1 for both
```

But expected claim relation:

```text
Q_ALIGNED partition refines target partition
Q_TRANSVERSE partition crosses target partition
```

---

## 6. Required constructive receipts

For each measurement freeze:

```text
measurement_id
outcome_values
measurement_partition
bucket_size_multiset
all_buckets_claim_pure
partition_refines_claim_partition
factorization_exists
factor_map_g
factorization_verified_on_every_candidate
```

For a failing measurement, freeze a concrete collision witness:

```text
c1
c2
q(c1)=q(c2)
f(c1)!=f(c2)
```

No failure verdict without an explicit pair.

---

## 7. Falsifiers

The chamber fails if any occur:

1. any holdout matrix is singular;
2. the target claim partition is not exactly two classes of size two;
3. the two measurements differ in scalar budget;
4. the two measurements differ in outcome count;
5. the two measurements differ in bucket-size multiset;
6. Q_ALIGNED fails partition refinement;
7. Q_ALIGNED has no unique factor map on its observed image;
8. Q_TRANSVERSE unexpectedly refines the claim partition;
9. Q_TRANSVERSE lacks an explicit same-measurement/different-claim collision witness;
10. bucket cardinality is used as a substitute for partition refinement;
11. the theorem is promoted into probabilistic sufficiency, minimal sufficient statistics, or universal information theory without separate assumptions.

---

## 8. Allowed bounded outcome

A full pass may earn the exact finite-set theorem:

```text
FINITE_CLAIM_SUFFICIENCY_IFF_MEASUREMENT_PARTITION_REFINES_CLAIM_PARTITION_IFF_CLAIM_FACTORS_THROUGH_MEASUREMENT
```

and the matched-holdout relation:

```text
IDENTICAL_MEASUREMENT_BUCKET_CARDINALITIES_CAN_HAVE_DIFFERENT_CLAIM_SUFFICIENCY_BECAUSE_PARTITION_ALIGNMENT_DIFFERS
```

This may provide a mathematically precise discrete meaning for **claim-relative anisotropy** inside the authored information architecture:

```text
same measurement amount
+
same coarse bucket geometry
+
different orientation relative to the claim partition
→
different epistemic adequacy
```

The phrase `claim-relative anisotropy` remains a bounded discrete research term here. It does not establish physical anisotropy, tensor geometry, continuum information geometry, Fisher geometry, or Holonomy Loom ontology.

---

## 9. Claim ceiling

No result establishes:

```text
probabilistic sufficiency
minimal sufficient statistic theorem
Shannon-information optimality
Fisher-information geometry
physical anisotropy
continuum geometry
sheaf structure
category-theory structure
Proto-Loom authority
production authority
Vercel authority
```

𝌋

⟐