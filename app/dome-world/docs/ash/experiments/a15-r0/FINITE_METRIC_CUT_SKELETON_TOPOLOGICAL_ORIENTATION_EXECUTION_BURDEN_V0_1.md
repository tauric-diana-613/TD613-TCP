# A15-R0 · Finite Metric Cut-Skeleton / Topological-Orientation Execution Burden

Status: FROZEN BEFORE IMPLEMENTATION. THEOREM UNEARNED.

Exact scientific parent: `#880 / 29a8879571341d0ee68b14f3e52bef76005b438e`.

## Required independent derivations

Implementation and hostile must derive the candidate theorem from the earned #880 distance matrix and the earned parent fact that the full observer atlas contains ten distinct unit open probes. Neither may treat the preregistered counts as inputs to the derivation.

### 1. Raw integer cut inversion

Construct all 15 nontrivial unoriented cut semimetrics on five labelled roles. Solve the ten pair-distance equations over nonnegative integer coefficients using an exhaustive bounded backtracking or equivalent exact finite procedure.

Required result:

```text
exactly 5 nonnegative-integer decompositions
```

All five coefficient vectors must equal the machine expectation file exactly.

This stage must execute before any ten-distinct-unit restriction is imposed.

### 2. Distinct-unit cut-family inversion

Enumerate all `2^15 = 32,768` subsets of the 15 unoriented cuts. Sum each family with unit coefficient and compare all ten pair distances against #880's earned full metric.

Required result:

```text
exact binary decomposition count = 1
support size = 10
cuts = A, AB, AT, AM, ABT, ABM, ATM, ABTM, ABTR, ATMR
```

This result is explicitly conditioned on the inherited ten-distinct-unit-probe model.

### 3. Orientation-to-topology census

For the recovered ten-cut skeleton, enumerate all `2^10 = 1,024` orientations. For each orientation:

- select exactly one side of every cut;
- adjoin `EMPTY` and the full role set;
- retain all 12 candidate open states, rejecting duplicate-side degeneracy if any;
- execute every ordered pairwise union and intersection test without early termination.

Required closure-operation burden:

```text
1,024 orientations
12 x 12 ordered set pairs/orientation
2 operations/pair
= 294,912 union/intersection membership checks
```

Required compatible orientations:

```text
0000000001
0000000010
1111111101
1111111110
```

exactly four.

### 4. Four-topology structural audit

For each compatible orientation independently derive:

```text
open-state count = 12
T0 = true
T1 = false
connected = true
clopen count = 2
finite Alexandrov = true
```

Reconstruct the specialization relation and transitive reduction. Match the four preregistered cover sets exactly.

Enumerate all `5! = 120` role permutations for each topology and prove exactly one topology automorphism per orientation:

```text
4 x 120 = 480 topology-automorphism permutation checks
```

### 5. Metric-isometry reconstruction and action

Independently enumerate all 120 role permutations against the #880 full distance matrix. Recover exactly:

```text
id
(B M)
(A R)
(A R)(B M)
```

For each of the 4 isometries and 4 compatible topologies, map every open set under the role permutation and identify the resulting compatible topology:

```text
4 x 4 = 16 action checks
```

Required inherited-topology action:

```text
1111111110 --id----------> 1111111110
1111111110 --(B M)-------> 1111111101
1111111110 --(A R)-------> 0000000010
1111111110 --(A R)(B M)--> 0000000001
```

Required finite group-action facts:

```text
orbit size = 4
stabilizer size = 1
action free = true
action transitive = true
```

### 6. Parent-interface audit

The child must bind to #880's canonical earned certificate and verify:

```text
parent exact = true
parent full metric equals frozen metric
parent full probe count = 10
parent metric isometry count = 4
parent full labelled-incidence automorphism count = 1
```

Do not derive the ten-distinct-unit condition from the metric itself. It is an inherited structural prior and must remain labelled as such.

## Independent hostile ordering

The hostile must complete sections 1–5 from the parent metric/topology surfaces before importing the child certificate. Final child readback may compare certificates only after the hostile has independently reconstructed:

- all 15 cuts;
- all five integer cut decompositions;
- the unique binary ten-cut support;
- all 1,024 orientations;
- all 294,912 topology closure checks;
- all four specialization-cover sets;
- all 480 topology automorphism checks;
- all 120 metric isometry checks;
- all 16 isometry/topology action checks.

## Mandatory failure classifications

Any of the following is a theorem/census RED rather than a bookkeeping repair:

```text
integer decomposition count != 5
binary distinct-unit decomposition count != 1
compatible topology count != 4
any preregistered orientation code absent/present incorrectly
any specialization cover mismatch
any compatible topology automorphism count != 1
metric isometry count != 4
orbit size != 4
stabilizer size != 1
free/transitive action false
```

Ordering, serialization, branch-merge-ref, or canonical parent-entry-point failures must be classified separately and may not be used to change any frozen mathematical target.

## Claim ceilings

```text
RAW_METRIC_DECOMPOSITION != UNIQUE_CUT_SKELETON
INTEGER_CUT_DECOMPOSITION != REAL_CUT_CONE_UNIQUENESS
TEN_DISTINCT_UNIT_PROBE_PRIOR != METRIC_ONLY_INFORMATION
UNORIENTED_CUT != OPEN_SET
CUT_SKELETON_RECOVERY != TOPOLOGY_RECOVERY
TOPOLOGICAL_ORIENTATION != PHYSICAL_ORIENTATION
SPECIALIZATION_ORDER != CAUSAL_ORDER
METRIC_ISOMETRY_ACTION != PHYSICAL_DYNAMICS
FREE_TRANSITIVE_FINITE_ACTION != GAUGE_THEORY
ORIENTATION_FIBRE != HIDDEN_STATE_SPACE
FOUR_COMPATIBLE_TOPOLOGIES != UNIVERSAL_TOPOLOGY_NONIDENTIFIABILITY
FINITE_ALEXANDROV_TOPOLOGY != CONTINUUM_TOPOLOGY
SEPARATOR_COUNT_METRIC != PHYSICAL_GEOMETRY
WITNESS_ROUTING != SCIENTIFIC_ANCESTRY
```

No merge, deployment, publication, production, release, Vercel, source-state mutation, Proto-Loom/A16, #788 promotion, physical geometry, continuum topology, gauge theory, Shannon/channel coding, or universal inverse-problem theorem follows.

Sealed ⟐