# A15-R0 · Finite Blocker Duality / Minimal-Obstruction Reconstruction · Execution Burden v0.1

Status: **FROZEN BEFORE IMPLEMENTATION / EXECUTION BURDEN / NO MERGE AUTHORITY**

Exact earned scientific parent: **#888 / `633cd75baaaebcc5f357bd503024aefbbcf11057` / run 2395 SUCCESS**.

Preregistration commit: `6b56bfbeecbc007bf3988491713aedb9b528f105`.
Machine expectations commit: `fdd269bf29f5a27283761bbec5979a4a9b74d12a`.

#890/#891 are RED/uneared and excluded from theorem ancestry.

## Required finite execution

The child must process exactly the four earned #888 witness classes:

```text
specialization_comparability : 20 witnesses / 1,048,576 selected families / 22 earned blocker members
principal_open_identity      :  5 witnesses /        32 selected families /  4 earned blocker members
principal_open_size          :  5 witnesses /        32 selected families /  4 earned blocker members
cut_orientation              : 10 witnesses /     1,024 selected families / 16 earned blocker members
TOTAL                         :                1,049,664 selected families
```

For each class the implementation must:

1. read the three earned transport-labelled separation edges from #888;
2. deduplicate edge sets and compute the inclusion-minimal clutter core;
3. recompute the first blocker from the clutter using an explicit finite minimal-transversal algorithm;
4. compare that blocker extensionally with #888's earned blocker;
5. compute the second blocker from the earned blocker;
6. compare the second blocker extensionally with the clutter core;
7. enumerate every selected witness family and compare `mu_H(W)` against `mu_clutter(W)`;
8. regenerate depth-1..5 family counts and minimum widths from the clutter functional;
9. compare those outputs with the already-earned #888 rows;
10. verify that all `3! = 6` permutations of the nonidentity transport labels leave the unlabelled edge/blocker/clutter incidence unchanged.

## Upper-bound operation ledger

The original transport-labelled hypergraph has exactly three nonidentity transport edges per class. The clutter has at most three distinct minimal edges per class.

Therefore the complete family-depth comparison requires no more than

```text
1,049,664 families × (3 original + 3 clutter) edge-intersection counts
= 6,297,984 edge-intersection counts.
```

Depth-1..5 classification adds exactly

```text
1,049,664 × 5 = 5,248,320 threshold checks.
```

Transport-label nonrecoverability control adds

```text
4 classes × 6 label permutations = 24 relabelling controls.
```

The recursive blocker computations operate only on the finite edge/blocker families already earned by #888 and must not enumerate a second million-family power set merely to recover the double blocker.

## Required independent hostile burden

Before importing the child, the hostile test must independently reconstruct the three transport-separation edges per class from the #884 witness rows plus the #882 metric-isometry action.

The hostile route must:

- deduplicate and clutterize those independently reconstructed edges;
- compute minimal transversals using an algorithm different from the child routine;
- compute a second blocker;
- freeze exact edge/blocker/double-blocker sets;
- only then import #888 and the child for extensional comparison.

The hostile route does not need to repeat the 1,049,664-family `mu` census; its role is structural independence of the dual reconstruction.

## Hardening membrane

The aggregate hardening file must retain an **explicit import manifest**. Dynamic glob/import-all discovery is prohibited in this chamber. The only new imports are the canonical and hostile tests for this exact successor.

This is an execution-custody rule, not a scientific theorem.

## Failure interpretation

Any mismatch is scientific RED unless the failure occurs before a declared finite value is produced because of a runtime/interface defect. Runtime failure must not be translated into a mathematical counterexample.

```text
PREDICATE-EVALUATION CRASH != NONIDENTIFYING PREDICATE
AGGREGATE HARNESS FAILURE != THEOREM COUNTEREXAMPLE
```

## Membranes

```text
BLOCKER_DUAL_RECOVERY != TRANSPORT_LABEL_RECOVERY
MINIMAL_IDENTIFYING_FAMILIES != COMPLETE_WITNESS_SEMANTICS
OBSTRUCTION_CLUTTER != PHYSICAL_NETWORK
CLUTTERIZATION != INFORMATION-THEORETIC COMPRESSION
BLOCKER_CARDINALITY != MINIMUM BIT LENGTH
MULTICOVER_DEPTH != SHANNON INFORMATION
TRANSPORT_EDGE_MULTICOVER != ERROR-CORRECTION CAPACITY
FREE TRANSITIVE FINITE ACTION != GAUGE THEORY
WITNESS ROUTING != SCIENTIFIC ANCESTRY
```

Sealed ⟐
