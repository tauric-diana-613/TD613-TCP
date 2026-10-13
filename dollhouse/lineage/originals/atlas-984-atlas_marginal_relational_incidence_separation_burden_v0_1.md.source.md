# A15-R0 · Atlas Marginal / Relational Incidence Separation · Execution Burden v0.1

𝌋⟐

Exact earned parent: `94e644f8e718581c4764b0c1f43bd35017e0d476` (#934; run 2419 / 33452411885 SUCCESS).

Frozen before child implementation.

## 1. Rank construction and axioms

Build both 256-entry rank tables from the declared circuit-hyperplane sets. Audit:

```text
rank-bound checks: 512
monotonicity candidate pairs: 131,072
actual inclusion premises: 13,122
submodularity pairs: 131,072
expected failures: 0
```

## 2. Polynomial collision

From every subset rank derive both corank-nullity maps and both Tutte coefficient maps. Exact common maps must equal the expectation fixture. Workload: 512 parent rank terms. String-only polynomial equality is insufficient.

## 3. Marginal incidence

Derive circuit-hyperplanes back from the rank tables. Then derive element-incidence degrees from membership, not from preregistered degree arrays.

Expected sorted degree multiset for both controls:

```text
[2,2,2,2,1,1,1,1]
```

Check `m_k=sum_e d(e)^k` for k=1..8 against:

```text
[12,20,36,68,132,260,516,1028]
```

The exported all-k equality must be justified by exact equality of the complete degree multisets, yielding `m_k=4*2^k+4` for every integer k>=1.

## 4. Relational overlap graph

Build a four-vertex graph on circuit-hyperplanes with adjacency iff intersection is nonempty. Audit all 12 unordered pair evaluations across both controls.

Expected:

```text
M_tail  overlap edges 4; degree profile [3,2,2,1]; Delta=3
M_cycle overlap edges 4; degree profile [2,2,2,2]; Delta=2
```

Check the double-counting identity:

```text
sum_e C(d(e),2) = overlap-edge count = 4
```

in both controls. Therefore total overlap is still a null receiver while `Delta` separates.

## 5. Receiver ladder

Exact class counts across the declared two-control universe:

```text
T                                             1
T + full element-degree multiset               1
T + all one-point power-sum moments            1
T + degree multiset + total overlap             1
T + degree multiset + max overlap-graph degree 2
```

## 6. Exhaustive nonisomorphism

Enumerate all 40,320 permutations of the eight-element ground set. For each permutation map all four `M_tail` circuit-hyperplanes and test target membership in the `M_cycle` circuit-hyperplane set.

Frozen burden:

```text
permutations: 40,320
mapped circuit-hyperplane membership checks: 161,280
matches: 0
```

No early termination of the permutation census.

## 7. Hostile independence

Before importing the child, hostile must independently reconstruct both rank functions from the declared four triples, validate rank axioms, derive circuit-hyperplanes, derive the common polynomial, marginal degree multiset, first eight moments, overlap graphs, receiver ladder, and exhaustive cross-isomorphism search.

## 8. Negative authority

The child must export false flags for universal completeness, physical network interpretation, universal moment-depth claims, and physical system nonidentity.

If any frozen identity fails, theorem authority remains exact earned #934.

Sealed ⟐