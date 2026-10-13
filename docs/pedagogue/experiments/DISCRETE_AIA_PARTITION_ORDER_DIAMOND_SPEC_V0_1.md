𝌋

# Discrete AIA · Partition-Order Diamond Holdout v0.1

Status: **PREREGISTERED / PRE-IMPLEMENTATION / RESEARCH-ONLY**  
Technical identity: `td613.aia.discrete-partition-order-diamond/v0.1`  
Research branch: `research/discrete-aia-partition-order-20260823`  
Parent claim-sufficiency receipt: `c6798161a3babdcfa2b31084d6bc182d43ebcdc3`  
Production mutation: **NONE**  
Vercel authority: **NONE**

---

## 0. Question

The claim-sufficiency theorem established that measurement adequacy is governed by partition refinement relative to a target claim rather than bucket cardinality alone.

This holdout asks whether a minimal finite observation architecture can exhibit a genuinely non-total distinguishability order:

> Can two matched one-scalar probes have identical bucket-size profiles while remaining incomparable as partitions, each licensing a different target claim, with a finer probe above both and a blind probe below both?

A positive result would provide a bounded discrete certificate for **claim-relative anisotropy**.

---

## 1. Fresh holdout universe

All matrices live in `GL(2,F_31)`:

```text
H(b,d) = [[2,b],[0,d]]
```

with fresh frozen values:

```text
b in {4,9}
d in {11,18}
```

Candidate set:

```text
C = {
  H(4,11),
  H(9,11),
  H(4,18),
  H(9,18)
}
```

Required:

```text
|C| = 4
all candidates invertible
```

These values were selected and frozen before repository execution of this chamber.

---

## 2. Frozen claims

### F_D · holonomy conjugacy claim

```text
F_D(H)=CONJUGACY_FINGERPRINT(H)
```

using the frozen gauge-blind GL(2,F31) classifier.

Expected structure to be computed:

```text
all d=11 members share one class
all d=18 members share one class
the two classes differ
```

### F_B · off-diagonal representative-coordinate claim

```text
F_B(H)=t12
```

Expected classes:

```text
b=4
b=9
```

This claim is coordinate-dependent and receives no gauge-invariant status.

### F_RAW · raw matrix claim

```text
F_RAW(H)=H
```

This induces the singleton partition.

---

## 3. Frozen one-scalar probes

Every probe returns one scalar in `F_31`.

### Q_D

```text
q_D(H)=t22
```

### Q_B

```text
q_B(H)=t12
```

### Q_PAIR

```text
q_PAIR(H)=t12+t22
```

For the frozen values, the implementation must verify rather than assume that all four sums are distinct.

### Q_BLIND

```text
q_BLIND(H)=t11
```

which is already constant at `2` over this universe.

---

## 4. Partition-refinement order

For measurements `q1,q2`, define:

```text
q1 >= q2
```

iff:

```text
Pi_q1 refines Pi_q2
```

meaning every `q1` bucket is contained in one `q2` bucket.

Interpretation is bounded:

> `q1` preserves at least every distinction made by `q2` on this finite candidate universe.

No Shannon-information or metric-distance interpretation follows.

---

## 5. Required diamond

The implementation must compute the full pairwise refinement matrix and test:

```text
Q_PAIR >= Q_D
Q_PAIR >= Q_B
Q_D >= Q_BLIND
Q_B >= Q_BLIND
```

while:

```text
Q_D not>= Q_B
Q_B not>= Q_D
```

and:

```text
Q_PAIR != Q_D != Q_B != Q_BLIND
```

The matched middle probes must satisfy:

```text
Q_D scalar budget = Q_B scalar budget = 1
Q_D outcome count = Q_B outcome count = 2
Q_D bucket-size multiset = Q_B bucket-size multiset = [2,2]
```

Thus their incomparability cannot be reduced to measurement count, outcome count, or bucket cardinality profile.

---

## 6. Claim-sufficiency incidence matrix

Using the frozen factorization theorem, compute whether each probe is sufficient for each claim.

Required pattern:

```text
             F_D   F_B   F_RAW
Q_BLIND       0     0      0
Q_D           1     0      0
Q_B           0     1      0
Q_PAIR        1     1      1
```

The implementation must derive each cell from partition refinement / factorization, not hard-code the matrix.

Every `0` must carry a concrete same-probe/different-claim collision witness.

---

## 7. Discrete anisotropy certificate

A bounded `CLAIM_RELATIVE_ANISOTROPY_CERTIFICATE` requires all:

1. two probes have identical scalar cost;
2. they have identical outcome count;
3. they have identical bucket-size multiset;
4. their partitions are incomparable;
5. there exists at least one claim licensed by the first and withheld by the second;
6. there exists at least one claim licensed by the second and withheld by the first.

For this holdout the certificate candidates are:

```text
Q_D
Q_B
```

with claims:

```text
F_D
F_B
```

---

## 8. Anti-scalar-ranking control

Any proposed scalar ranking based only on:

```text
measurement count
outcome count
bucket-size multiset
maximum bucket size
minimum bucket size
```

must assign Q_D and Q_B the same profile.

Yet their claim-sufficiency rows must differ.

Required relation:

```text
CARDINALITY_PROFILE_DOES_NOT_TOTAL_ORDER_CLAIM_ADEQUACY
```

No claim is made that every possible scalar statistic fails to distinguish the probes.

---

## 9. Falsifiers

The chamber fails or materially weakens if any occur:

1. any candidate matrix is singular;
2. Q_PAIR fails to separate all four candidates;
3. Q_D and Q_B differ in matched cardinality profile;
4. Q_D refines Q_B;
5. Q_B refines Q_D;
6. Q_D fails F_D sufficiency;
7. Q_B fails F_B sufficiency;
8. either middle probe licenses the other's claim;
9. Q_PAIR fails raw-state sufficiency;
10. any withheld cell lacks an explicit collision witness;
11. `claim-relative anisotropy` is promoted into physical anisotropy, tensor anisotropy, continuum information geometry, or a TD613-general theorem.

---

## 10. Allowed bounded outcome

A full pass may earn:

```text
DISCRETE_AIA_PARTITION_ORDER_CONTAINS_MATCHED_COST_INCOMPARABLE_OBSERVATION_DIRECTIONS_IN_AUTHORED_HOLDOUT
```

and:

```text
CLAIM_RELATIVE_ANISOTROPY_CERTIFIED_BY_INCOMPARABLE_MATCHED_PARTITIONS_WITH_CROSSED_CLAIM_SUFFICIENCY
```

This would support a bounded research interpretation:

> A discrete Anisotropic Information Architecture can be represented by a non-total refinement order over observation partitions together with a claim-sufficiency incidence relation.

That sentence remains a candidate formalization for TD613/Dome-World research only.

It does not establish physical anisotropy, a tensor field, Fisher geometry, continuum geometry, sheaf structure, category-theory structure, Proto-Loom authority, production authority, or Vercel authority.

𝌋

⟐