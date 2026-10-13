𝌋⟐
# Execution Burden

Exact parent: `e1db7374df71de4df459cda939b63a282a0831ea`.

The child must implement one k-parametric encoder/reconstructor. No k-specific reconstruction branches are permitted except assay enumeration bounds.

## Exact assay census
k=2: 385 candidate / 385 admitted / 385 exact round trips / 145 marked.
k=3: 59,535 candidate / 4,305 admitted / 4,305 exact round trips / 945 marked.
k=4: 1,543,675 candidate / 113,785 admitted / 113,785 exact round trips / 2,800 marked.

Aggregate: 1,603,595 candidate families; 118,475 admitted; 118,475 exact round trips; 3,890 marked; zero expected failures.

## Required construction checks for every admitted family
1. all blocks have declared size k;
2. pair intersections <=1;
3. every mark has support size >=3 and induces a clique;
4. no edge is covered by two marks;
5. uncovered graph edges become degree-2 supports;
6. shared-support count s_i never exceeds k;
7. exactly k-s_i singleton supports are restored at block i;
8. reconstructed canonical support multiset equals raw incidence-neighborhood multiset.

## General-proof ledger
The certificate must expose boolean obligations corresponding to the algebraic proof; passing finite assays alone may not set `parametric_theorem_proved` true. The theorem flag requires the proof ledger plus the generic reconstructor and all hostile boundaries.

Negative controls independently attack nonlinearity, nonuniformity, and invisible degree-zero ground.

No merge/deploy/release/publication authority.

Sealed ⟐