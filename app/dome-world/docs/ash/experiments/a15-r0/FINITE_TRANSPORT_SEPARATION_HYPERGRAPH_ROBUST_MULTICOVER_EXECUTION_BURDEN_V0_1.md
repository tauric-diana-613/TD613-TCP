# A15-R0 · Finite Transport-Separation Hypergraph / Robust Multicover · Execution Burden v0.1

Status: **FROZEN BEFORE IMPLEMENTATION**

Exact earned parent: **#886 / `891cb4125e626c1145b4a6dcb3b1a82074bee510`**.

This burden exists to prevent the successor from replacing the preregistered finite correspondences with a few hand-selected examples.

## Declared witness universes

```text
specialization comparability : n=20 / 2^20 = 1,048,576 families
principal-open identity      : n=5  / 2^5  = 32 families
principal-open size          : n=5  / 2^5  = 32 families
cut orientation              : n=10 / 2^10 = 1,024 families
-----------------------------------------------------------
total selected families                  1,049,664
```

The inherited #882 metric-isometry action has exactly three nonidentity transports. Every class therefore has exactly three transport-labelled separation edges `D_g` before edge-set deduplication.

## Required complete incidence burden

For every one of the 1,049,664 selected witness families and all three nonidentity transports, evaluate whether the family intersects the corresponding transport-separation edge.

```text
1,049,664 * 3 = 3,148,992 family×transport intersection checks
```

These checks must certify

```text
g survives in S_W IFF W misses D_g
```

without sampling.

## Required multicover burden

For every family compute

```text
mu_H(W) = min_g |W intersect D_g|
```

and evaluate multicover depths 1 through 5.

```text
1,049,664 * 5 = 5,248,320 family×depth checks
```

The resulting family counts and minimum widths must exactly replay the already-earned #886 erasure-robustness ladder.

## Required blocker / minimality burden

Every selected family must be classified as hitting or non-hitting. For every selected witness in every family, the one-witness deletion must be available to test inclusion minimality. Across a complete Boolean family universe, the number of selected-witness deletion checks is `n * 2^(n-1)`.

```text
comparability       20 * 2^19 = 10,485,760
principal identity   5 * 2^4  =         80
principal size       5 * 2^4  =         80
cut orientation     10 * 2^9  =      5,120
------------------------------------------------
total                              10,491,040
```

The blocker derived from the three transport edges must equal the inclusion-minimal inherited-origin-identifying family set extensionally.

## Required inherited cross-check

Only after the hypergraph structure has been derived from #884 witness cells + #882 action may the successor compare against #886's earned certificate:

```text
selected family total = 1,049,664
exact / depth-1 counts = 981696 + 27 + 18 + 765
robust depth counts and minimum widths exactly as preregistered
criterion mismatches = 0 in parent
```

The successor does **not** rerun #886's 528,332,644 exact deletion cases. Its scientific burden is to derive and exhaustively validate the smaller combinatorial mechanism that explains those already-earned results.

## Independent hostile burden

Before child import, hostile reconstruction must independently derive:

- three transport-labelled edge masks per class;
- edge-set deduplication;
- every family hitting status;
- every family `mu_H`;
- depth-1..5 multicover counts and minima;
- blocker members by direct deletion minimality;
- edge-avoidance residual transport sets.

Only after freezing that object may the hostile load the child and #886 for comparison.

## RED conditions

Any skipped class, sampled family universe, collapsed transport label before required labelled checks, child-derived hostile edge table, mismatch with #886, or blocker/minimality shortcut that does not establish extensional equality holds the theorem RED.

## Membranes

This is finite combinatorics over a declared witness/action fixture. No physical network, coding capacity, Shannon theorem, causal graph, gauge theory, physical dynamics, physical orientation, universal inverse-problem theorem, merge, deployment, publication, release, or Vercel authority follows.

Sealed ⟐
