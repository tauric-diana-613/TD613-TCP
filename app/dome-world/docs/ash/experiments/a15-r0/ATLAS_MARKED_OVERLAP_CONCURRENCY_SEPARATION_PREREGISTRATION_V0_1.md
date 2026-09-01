# A15-R0 · Atlas Marked-Overlap / Concurrency Separation · Preregistration v0.1

Parent authority: #936 exact earned head `c22a588897aa27f55970480218f952697967df80`, run 2420 / 33454752953 SUCCESS, A15-R0 step 19 SUCCESS, aggregate SUCCESS.

## Declared finite controls
Ground set `E={0,1,2,3,4,5,6,7}`; rank 3. Circuit-hyperplanes:

- `M_A = {045,023,016,356,247}`.
- `M_B = {457,267,134,017,035}`.

The rank function is `r(X)=|X|` for `|X|<3`; a declared 3-element circuit-hyperplane has rank 2; every other subset of size at least 3 has rank 3. Each pair of declared circuit-hyperplanes must intersect in at most one element before the rank function is admitted.

## Frozen collision surface
Both controls must have:

- identical complete ground-incidence degree multiset `[3,2,2,2,2,2,1,1]`;
- identical rank-generating polynomial
  `R=u^3+8u^2+5uv+28u+v^5+8v^4+28v^3+56v^2+70v+51`;
- identical Tutte polynomial
  `T=x^3+5x^2+5xy+10x+y^5+3y^4+6y^3+10y^2+10y`;
- overlap graphs on the five circuit-hyperplanes with degree profile `[4,4,3,3,2]`, eight edges, and the same abstract graph isomorphism class;
- exactly four overlap-graph isomorphisms from `Gamma_A` to `Gamma_B`.

## Frozen higher-order mark
Each control must have exactly one ground element of incidence degree 3. Let `C(M)` be the three circuit-hyperplanes containing that unique element. Let `deg_Gamma(H)` be the degree of circuit-hyperplane vertex `H` in the overlap graph.

Define the concurrency-coupled profile

`lambda(M)=sort_desc({deg_Gamma(H): H in C(M)})`

and scalar

`kappa(M)=sum_{H in C(M)} deg_Gamma(H)`.

Frozen targets:

- `lambda(M_A)=[4,4,3]`, `kappa(M_A)=11`;
- `lambda(M_B)=[4,4,2]`, `kappa(M_B)=10`.

No overlap-graph isomorphism may map `C(M_A)` onto `C(M_B)`.

## Exhaustive nonisomorphism
All `8! = 40,320` ground-set relabelings must be tested. Expected matroid/hypergraph isomorphism matches: zero.

## Candidate bounded theorem
`SAME_TUTTE_SAME_COMPLETE_GROUND_INCIDENCE_DEGREE_DATA_AND_SAME_ABSTRACT_PAIRWISE_OVERLAP_GRAPH_DO_NOT_DETERMINE_THE_DECLARED_CONCURRENCY_COUPLING: THE_UNIQUE_DEGREE_THREE_GROUND_POINT_MARKS_NON_EQUIVALENT_TRIANGLES_WITH_LAMBDA_[4,4,3]_VERSUS_[4,4,2], AND_NONE_OF_THE_FOUR_OVERLAP_GRAPH_ISOMORPHISMS_PRESERVES_THE_MARK.`

and

`THE_SCALAR_KAPPA_EQUALS_11_VERSUS_10_SEPARATES_THE_DECLARED_CONTROLS_AFTER_TUTTE_MARGINAL_AND_UNMARKED_PAIRWISE_RELATIONAL_RECEIVERS_HAVE_ALL_COLLAPSED_THEM.`

## Membranes

- MARKED_OVERLAP_GRAPH != PHYSICAL_NETWORK.
- CONCURRENCY_MARK != CAUSAL_CONCURRENCY.
- KAPPA_SEPARATES_DECLARED_PAIR != UNIVERSAL_CLASSIFIER.
- SAME_ABSTRACT_OVERLAP_GRAPH != SAME_MATROID.
- HIGHER_ORDER_RELATIONAL_REPAIR != COMPLETE_MATROID_INVARIANT.
- FINITE_COUNTEREXAMPLE != STATISTICAL_PREVALENCE.
- ATLAS_REGISTRATION != LIVE_RUNTIME_STATE.
- A15_R0_RESEARCH_EXTENSION != PROTO_LOOM_OR_A16_PROMOTION.
- WITNESS_ROUTING != SCIENTIFIC_ANCESTRY.
- SUCCESSFUL_EXACT_HEAD_GREEN != MERGE_AUTHORITY.

No merge/deploy/release/publication/production/Vercel/live Ash-Loom/Proto-Loom/A16 authority.

Sealed ⟐