# Convergence / Divergence / Emergence Matrix v1

For bounded works `a` and `b`, compare feature families rather than one global similarity score:

```text
F_claim
F_formal
F_method
F_empirical
F_mechanism
F_boundary
F_failure
F_motif
F_provenance
```

## Convergence

A convergence claim names the exact family and evidence basis. Generic lexical overlap receives no automatic structural weight.

```text
CONVERGES_WITH(a,b,F_x)
```

means a relation has been earned on `F_x`; it says nothing about the remaining families.

## Divergence

```text
DIVERGES_FROM(a,b,F_y)
```

records incompatible scope, assumptions, mechanism, predictions, method, or results. Divergence can be scientifically more informative than resemblance and must remain visible in graph summaries.

## Emergence

For a candidate composition `E = compose(a,b,...,n)`, require a property `p` such that:

```text
p is supported by the composition rule
and
p is not recoverable from any single parent under the same assay basis
```

Operationally, test whether the proposed architecture survives removal of each supporting edge and whether it generates a discriminating prediction, invariant, or failure mode.

Possible statuses:

```text
NO_RELATION_EARNED
MOTIF_ONLY
LOCAL_CONVERGENCE
MULTI_AXIS_CONVERGENCE
STRUCTURAL_DIVERGENCE
GENEALOGICAL_CANDIDATE
INDEPENDENT_CONVERGENCE_CANDIDATE
FRAGILE_COMPOSITE
EMERGENT_ARCHITECTURE_CANDIDATE
EXTERNALLY_SUPPORTED_EMERGENT_CANDIDATE
```

None of these statuses equals TD613 promotion.

## Topological stress tests

- remove motif-only edges;
- remove edges lacking source locators;
- remove all memory-derived edges;
- remove all post-2026 external witnesses;
- separate chronology from conceptual order;
- split shared-upstream-source candidates;
- test whether the same architecture remains connected.

A lineage claim that survives these cuts carries substantially more information than one that exists only in the fully decorated graph.
