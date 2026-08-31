# A15-R0 · Atlas Tutte / Rank-Generating Compression · Execution Burden v0.1

𝌋⟐

This burden is frozen before child implementation.

Exact earned parent: `62722caea3f35bd520a2a1bfa5163f8cd2e14c26` (#928; run 2416 / 33443058142 SUCCESS).

## 1. Parent authority gates

The child must require:

- earned #928 certificate `passed === true`;
- exact #928 schema;
- D/Q deletion-distance, cocircuit, and rank-preserving enumerator surfaces equal the earned values;
- earned #926 matroid certificate `passed === true`;
- exact D/Q full ranks and all 16 rank values available from #926.

The Tutte child may use #926 rank values only after #928 ancestry is positively gated.

## 2. Rank-generating accumulation

For each of D and Q:

1. enumerate all 16 subset masks;
2. compute `corank = r(E)-r(A)`;
3. compute `nullity = |A|-r(A)`;
4. accumulate one coefficient into `R_M(u,v)`.

Frozen workload:

```text
D subset terms: 16
Q subset terms: 16
total: 32
```

Coefficient sums must each equal 16.

Exact term maps must match the preregistered expectations.

## 3. Exact substitution into Tutte polynomial

The implementation must expand

```text
u^a v^b -> (x-1)^a (y-1)^b
```

using integer binomial coefficients, accumulating signed contributions before zero-coefficient cleanup.

Frozen raw contribution counts:

```text
D: 22
Q: 21
total: 43
```

Final nonzero Tutte term counts:

```text
D: 2
Q: 3
```

No CAS dependency or string-equality-only proof is permitted; equality must be coefficient-map equality.

## 4. Standard specialization recovery

For each derived Tutte polynomial evaluate exactly:

```text
(1,1) bases
(2,1) independent sets
(1,2) spanning sets
(2,2) all subsets
```

Frozen total specialization identities: **8**.

Expected values:

```text
D: 2, 3, 12, 16
Q: 3, 7,  8, 16
```

These must cross-check the earned #926/#928 combinatorics.

## 5. Spanning-slice deletion-enumerator recovery

Extract all `R_M` terms of corank zero. For every such term with nullity `j`, map its coefficient to deletion exponent

```text
|E| - r(E) - j.
```

Frozen recoveries:

```text
D -> [1,4,5,2,0]
Q -> [1,4,3,0,0]
```

These arrays must equal #928 `rank_preserving_by_size` exactly.

Frozen recovery identities: **2**.

## 6. Minor reconstruction and deletion–contraction

For each of the 16 single-element minors already earned in #928, derive its Tutte polynomial directly from its 8-entry rank table.

Frozen minor rank-term workload:

```text
16 minors × 8 subset masks = 128 rank terms
```

For each of the 8 parent elements, independently determine parent element class from rank:

```text
loop iff r({e}) = 0
coloop iff r(E)-r(E\e) = 1
ordinary otherwise
```

Then verify coefficient-map equality for the corresponding recurrence.

Frozen identity census:

```text
D loops: 2
D ordinary: 2
Q loops: 1
Q ordinary: 3
coloops: 0
combined loop identities: 3
combined ordinary identities: 5
total deletion–contraction identities: 8
```

Minor Tutte coefficient maps must match the five exact preregistered minor types, but type labels cannot be used as the source of polynomial values.

## 7. Hostile independence requirements

Before importing the child, hostile must independently reconstruct:

- the exact D/Q parent rank arrays from the earned #926 structural description or direct finite rules;
- both rank-generating coefficient maps;
- both Tutte maps by integer substitution;
- all eight standard specializations;
- both spanning-slice deletion enumerators;
- all 16 minor rank tables from parent ranks;
- all 16 minor Tutte maps;
- all eight deletion–contraction identities;
- all frozen burden counts.

Only after those independent values are fixed may hostile dynamically import the child and compare.

## 8. Anti-overclaim control

The chamber must export explicit false/negative authority flags:

```text
complete_matroid_isomorphism_invariant_claimed = false
lossless_history_reconstruction_claimed = false
universal_statistic_sufficiency_claimed = false
physical_reliability_claimed = false
causal_deletion_contraction_claimed = false
```

## Frozen aggregate burden

```text
parent subset-rank terms: 32
rank-generating coefficient-sum identities: 2
raw substitution contributions: 43
minor rank terms: 128
delete/contract identities: 8
specialization identities: 8
deletion-enumerator recoveries: 2
expected total failures: 0
```

If any frozen identity fails, the candidate is RED and theorem authority remains at exact earned #928.

Sealed ⟐
