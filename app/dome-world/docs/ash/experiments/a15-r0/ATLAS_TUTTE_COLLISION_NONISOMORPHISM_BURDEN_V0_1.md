# A15-R0 · Atlas Tutte Collision / Nonisomorphism · Execution Burden v0.1

𝌋⟐

Frozen before child implementation. Exact earned parent: `b34d04f078791bada782bdb88d2d22307c891595`.

## 1. Parent authority

Require the earned #930 certificate and exact parent receipt. The collision controls are synthetic descendants; they do not alter #930's D/Q receiver matroids.

## 2. Construct both 64-entry rank tables

For each of `M_disj` and `M_meet`, enumerate all 64 subset masks from the preregistered circuit-hyperplane rule. Exact arrays and rank frequencies must match expectations.

## 3. Exhaustive rank-axiom validation

Per control:

```text
normalization checks: 1
rank bound checks: 64
ordered monotonicity candidate pairs: 4096
actual subset-inclusion premises: 729
ordered submodularity pairs: 4096
```

Combined:

```text
normalization checks: 2
rank bound checks: 128
monotonicity candidate pairs: 8192
inclusion premises: 1458
submodularity pairs: 8192
all failures: 0
```

No `matroid` label is admitted unless these pass.

## 4. Circuit-hyperplane reconstruction

Derive all hyperplanes from rank and identify those that are also circuits. Require exactly the preregistered two circuit-hyperplanes in each control.

Their unique pairwise intersection sizes must be

```text
M_disj: 0
M_meet: 1
```

## 5. Independent polynomial derivation

For each control:

1. derive `R_M(u,v)` from all 64 subset ranks;
2. substitute `u=x-1`, `v=y-1` with exact integer coefficient accumulation;
3. compare coefficient maps only after independent derivation.

Require exact common values:

```text
R = u^3 + 6u^2 + 2uv + 15u + v^3 + 6v^2 + 15v + 18
T = x^3 + 3x^2 + 2xy + 4x + y^3 + 3y^2 + 4y
```

Frozen parent-rank terms: 128 total.

## 6. Exhaustive cross-isomorphism search

Generate all 720 permutations of six elements. For every permutation evaluate all 64 rank equalities; do not early-exit the burden count.

```text
permutations: 720
rank comparisons: 46,080
isomorphism matches: 0
```

## 7. Exhaustive self-automorphism controls

Repeat the complete 720×64 comparison against each control itself.

```text
M_disj automorphisms: 72
M_meet automorphisms: 8
self rank comparisons: 92,160
```

Aggregate permutation burden:

```text
permutations: 2160
rank comparisons: 138,240
```

## 8. Hostile independence

Before importing the child, hostile must reconstruct:

- both rank tables directly from the two declared circuit-hyperplane pairs;
- every rank axiom count;
- both circuit-hyperplane sets and intersection profiles;
- both `R` and `T` coefficient maps;
- all 720 cross relabelings;
- all 1,440 self relabelings;
- automorphism orders 72 and 8.

Only after those values are fixed may hostile import the child.

## 9. Negative authority

Export explicit false flags:

```text
universal_tutte_collision_rate_claimed = false
physical_system_nonidentity_claimed = false
history_nonidentity_inferred_from_tutte_claimed = false
complete_matroid_classification_from_tutte_claimed = false
```

## Frozen aggregate

```text
rank entries constructed: 128
rank bound checks: 128
monotonicity candidate pairs: 8192
monotonicity premises: 1458
submodularity pairs: 8192
parent polynomial subset terms: 128
permutation searches: 2160
permutation rank comparisons: 138240
expected failures: 0
```

If any frozen identity fails, authority remains exact earned #930.

Sealed ⟐