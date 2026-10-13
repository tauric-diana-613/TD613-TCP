# A15-R0 · Atlas Tutte Collision / Incidence-Moment Repair · Execution Burden v0.1

𝌋⟐

This burden is frozen before child implementation.

Exact earned parent: `2b06eb8d2262135ed6b111dc103867c2d7e973af` (#932; run 2418 / 33450084910 SUCCESS).

## 1. Parent authority gate

Child must require:

- exact #932 schema;
- parent `passed === true`;
- exact common Tutte map;
- exact zero cross-isomorphism matches;
- exact parent automorphism orders 72 and 8;
- exact earned circuit-hyperplane intersection profiles `[0]` and `[1]`.

The child may use the 64-entry parent rank tables only after these gates pass.

## 2. Circuit-hyperplane reconstruction

For each control, reconstruct circuits and rank-2 hyperplanes from the parent rank function, intersect the two families, and require exact circuit-hyperplanes:

```text
M_disj [7,56]
M_meet [7,25]
```

The implementation may not use these masks as the source of incidence moments before reconstruction.

## 3. Incidence matrix and moments

For each control, evaluate membership for all:

```text
6 elements × 2 circuit-hyperplanes = 12 entries
```

Across both controls:

```text
24 base incidence membership evaluations
12 labeled degree values
12 sorted degree values
4 moment values (m1,m2 per control)
```

Exact targets are frozen in expectations.

## 4. Receiver-ladder census

Construct exact receiver signatures for both controls at three levels:

```text
R0 = T
R1 = (T,m1)
R2 = (T,m1,m2)
```

Frozen class counts:

```text
R0 -> 1
R1 -> 1
R2 -> 2
```

Compute the first separating moment depth over `{1,2}` and require exactly `2`.

Also record that only one additional scalar coordinate (`m2`) beyond the already-common Tutte receiver is sufficient for this pair, while explicitly refusing universal minimality outside the declared family.

## 5. Double-counting overlap identity

For each control compute both:

```text
P_degree = sum_e C(d(e),2)
P_moment = (m2-m1)/2
P_direct = sum_{i<j} |H_i ∩ H_j|
```

Frozen identities:

```text
M_disj: 0 = 0 = 0
M_meet: 1 = 1 = 1
```

Total exact overlap equalities: **4** (`P_degree=P_moment` and `P_degree=P_direct` for each control).

## 6. Relabeling-invariance assay

Enumerate all 720 permutations of six labels for each control.

For every relabeling:

1. permute the reconstructed circuit-hyperplane masks;
2. recompute all six incidence degrees;
3. recompute sorted degree profile;
4. recompute `m1`, `m2`, and `P`;
5. compare to the unpermuted invariant values.

Frozen burden:

```text
2 controls × 720 = 1,440 relabelings
1,440 × 6 × 2 = 17,280 incidence membership evaluations
1,440 sorted-profile checks
1,440 m1 checks
1,440 m2 checks
1,440 overlap checks
all failures 0
```

No early-exit shortcut is permitted in the hostile permutation audit.

## 7. Hostile independence requirements

Before importing the child, hostile must independently reconstruct both rank functions from the #932 declared structural controls:

```text
M_disj special 3-sets [7,56]
M_meet special 3-sets [7,25]
rank(mask)=|mask| for |mask|<3
rank(special 3-set)=2
rank(other mask of size>=3)=3
```

Then hostile must independently derive:

- exact circuit-hyperplane families;
- degree profiles;
- m1 and m2;
- all three overlap forms;
- receiver class counts 1,1,2;
- separation depth 2;
- all 1,440 relabeling invariance results.

Only after those values are fixed may hostile import the child.

## 8. Anti-overclaim flags

Child must export explicit false flags:

```text
complete_matroid_invariant_claimed = false
universal_required_moment_order_claimed = false
universal_classifier_claimed = false
physical_sensor_incidence_claimed = false
shannon_information_claimed = false
causal_interaction_claimed = false
lossless_compression_claimed = false
```

## Frozen aggregate

```text
base incidence memberships: 24
relabeling incidence memberships: 17,280
receiver signatures: 6
overlap exact equalities: 4
relabelings: 1,440
expected failures: 0
```

Any mismatch makes the candidate RED and leaves theorem authority at exact earned #932.

Sealed ⟐