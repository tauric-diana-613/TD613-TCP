# A15-R0 · Finite Custody Behavioral Quotient / Exact Declared-Task Closure · Execution Burden v0.1

Status: **PREREGISTERED / PREIMPLEMENTATION / THEOREM UNEARNED**.

Exact parent: `#868 / d94c1b6cd47dbb611ae4a6a3297522ee99bb29ef`.

This file freezes the minimum execution burden expected from both the canonical implementation and an independent hostile reconstruction. It counts executed finite checks only; represented Cartesian products are not silently promoted into executed work.

## Canonical implementation burden

The implementation must execute at least:

```text
750 antecedent constructions
762 schedule/bundle context constructions
3,048 stage support-profile reconstructions
2,380 predecessor-task replay rows
  1,180 #858 recompression rows
    784 #860 path-transport rows
    208 #862 horizon rows
    208 #864 alias/marginal rows
762 authority-birth recovery checks
762 κ signature constructions
762 Φ task-signature constructions
762 D support-labelled trajectory fingerprint constructions
154 C-class to Φ-class mapping checks
36 Φ-class semantic-noncollapse checks
810 coordinate-ablation context checks
```

Coordinate-ablation context burden:

```text
q1:  26 * 1 =  26
q2:  80 * 2 = 160
q3: 208 * 3 = 624
TOTAL          810
```

The implementation must also verify exact partition counts and birth-local spectra rather than merely spot-checking named examples.

## Independent hostile burden

The hostile must independently reconstruct before consulting the canonical certificate:

```text
125-state cube
6 schedules
750 antecedents
4 registered global fibre partitions
127 nonempty claim bundles
762 schedule/bundle contexts
3,048 stage support profiles
2,380 declared predecessor-task replay rows
762 birth-recovery checks
762 independent κ signatures
762 independent Φ signatures
762 independent D fingerprints
all partition class counts and spectra
all 810 coordinate-ablation context checks
explicit collision witnesses for every ablated coordinate family
all 36 Φ-class support-semantic noncollapse checks
```

The hostile must not import canonical κ classes, canonical Φ classes, canonical D fingerprints, or canonical ablation witness tables before completing its own derivation.

## Exact partition obligations

Both implementation and hostile must return:

```text
D = 762 classes
C = 154 classes
Φ = 36 classes
b = 4 classes
```

and exact birth-local class spectra:

```text
        contexts   D    C    Φ
q1         26      26   18    5
q2         80      80   32   10
q3        208     208   40   20
INF       448     448   64    1
TOTAL     762     762  154   36
```

## Bidirectional quotient obligation

Both implementations must establish partition equivalence:

```text
κ(Q)=κ(Q') iff Φ(Q)=Φ(Q')
```

with:

```text
κ class count = 36
κ -> Φ ambiguity classes = 0
Φ -> κ ambiguity classes = 0
```

This is the exact bounded quotient claim.

## Birth functional closure obligation

Both implementations must derive, not import:

```text
b_hat(Q)=first t in {q1,q2,q3} with m_t(Q)=1 else INF
```

and return:

```text
762 matches
0 mismatches
26 / 80 / 208 / 448-INF distribution
```

## Semantic noncollapse obligation

Both implementations must establish:

```text
762 distinct D fingerprints
36 Φ classes
0 Φ classes singleton under D identity
```

At least one explicit pair must share Φ while differing in D.

## Ablation obligation

For every retained κ coordinate family, the hostile must construct an explicit finite collision between distinct Φ classes after deleting that coordinate. Summary counts must match the preregistered expectation JSON exactly.

## Refusals

```text
EXECUTED_CHECK_COUNT != INFORMATION_QUANTITY
PARTITION_CLASS_COUNT != BIT_LENGTH
PARTITION_CLASS_COUNT != ENTROPY
PARTITION_CLASS_COUNT != SHANNON_CAPACITY
COORDINATE_DROP_COLLISION != UNIVERSAL_FEATURE_MINIMALITY
DECLARED_TASK_PARTITION != FUTURE_TASK_PARTITION
```

No merge, deployment, publication, production, release, Vercel, source-state mutation, Proto-Loom/A16, #788 promotion, universal coding, natural-language semantic reconstruction, physical holonomy, or operational path-groupoid authority follows.

**BURDEN FROZEN BEFORE THEOREM CODE.**

Sealed ⟐