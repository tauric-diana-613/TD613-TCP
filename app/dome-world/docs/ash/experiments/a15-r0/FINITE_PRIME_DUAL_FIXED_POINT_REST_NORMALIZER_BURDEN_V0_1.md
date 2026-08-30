𝌋‌⟐

# A15-R0 · Finite Prime-Dual Fixed-Point Rest Normalizer · Execution Burden v0.1

Exact earned parent: `961d6eae8491ca1c72da23c5f23c2b573dc8e8ce`.

The chamber must evaluate the complete declared family surface and may not substitute random sampling.

## Fixed work ledger

For the four declared witness classes:

```text
selected families                              1,049,664
transport truth intersection checks            3,148,992
Hasse-edge checks, first normalization         10,491,040
success-DNF subset-zeta propagation updates    10,491,040
obstruction-CNF intersection checks             3,147,904
Hasse-edge checks, second normalization        10,491,040
---------------------------------------------------------
fixed work units                               37,770,016
```

`10,491,040` is the exact number of cover relations in the four Boolean subset lattices:

```text
20 * 2^19 + 5 * 2^4 + 5 * 2^4 + 10 * 2^9
= 10,491,040.
```

## Required algorithmic separation

Canonical path:
1. derive direct transport truth from the inherited transport-separation edges;
2. extract minimal true points and maximal false points by one exact Boolean-lattice Hasse scan;
3. complement maximal false points to obtain the obstruction antichain;
4. compare extracted antichains extensionally to the earned parent blocker/clutter;
5. reconstruct truth independently from the extracted success antichain by exact subset-zeta upward closure;
6. reconstruct truth independently from the extracted obstruction antichain by clause intersection;
7. normalize the reconstructed truth a second time;
8. require exact antichain fixed-point equality.

Hostile path must rebuild the direct transport truth and both normalization passes independently before importing the child certificate for comparison.

## Forbidden shortcuts

```text
NO random sampling
NO expected-output injection into the implementation
NO deriving the second antichain by simply copying the first-pass parent object
NO treating array order as mathematical equality
NO using #890/#891 artifacts or lineage
NO weakening the exact family surface
NO merge/deploy/release/publication/Vercel
```

## Pass condition

All seven preregistered mismatch ledgers must be zero, all expected prime counts must match, both reconstructed truth surfaces must equal direct transport truth, and the second normalization must be extensionally identical to the first.

A green exact-head workflow is required for 𝄐 authority.

Sealed ⟐