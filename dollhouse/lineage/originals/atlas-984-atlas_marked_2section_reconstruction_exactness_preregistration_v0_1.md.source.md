# A15-R0 · Atlas Marked 2-Section Reconstruction Exactness · Preregistration v0.1

𝌋⟐

Parent authority: #938 exact earned head `656f2093760f5812f8a4a9d1497a6dd5acf4e5a0`, TD613 Consolidated Validation run 2421 / 33457565811 SUCCESS, A15-R0 step 19 SUCCESS.

## Question

After #938 proved that an unmarked pairwise overlap graph can forget concurrency coupling, ask the converse structural question: **when does a fully concurrency-marked overlap receiver become lossless?**

Declared class: finite, union-grounded, linear, 3-uniform incidence families `H=(H_i)`. `Linear` means `|H_i ∩ H_j| <= 1` for every distinct block pair. `Union-grounded` means the declared ground set is exactly the union of the blocks.

## Receiver

Let `Gamma(H)` be the block-overlap graph: vertices are block indices and `{i,j}` is an edge iff `H_i ∩ H_j != empty`.

For each ground element `e` with incidence degree at least three, retain the support clique

`I_e = { i : e in H_i }`.

The **fully marked 2-section** is

`R*(H) = (Gamma(H), K_{>=3}(H), block_size=3)`.

## Reconstruction law

Because of linearity:

1. every overlap-graph edge belongs to at most one marked concurrency clique;
2. each marked clique corresponds to exactly one degree-3-or-higher ground element;
3. every graph edge not covered by a marked clique corresponds to exactly one degree-2 ground element;
4. for block `i`, if `s_i` is the number of reconstructed shared ground elements incident to it, then exactly `3-s_i` private degree-1 ground elements remain.

Thus the receiver reconstructs the multiset of incidence neighborhoods `{I_e : e in union(H)}`. Equality of that neighborhood multiset is equivalent to set-system isomorphism up to ground-element relabeling with block labels retained.

## Exhaustive finite universe

Enumerate all labeled families of 3-subsets of `{0,1,2,3,4,5,6}` with 1–4 blocks and pairwise intersection at most one.

Frozen census:

- total admitted families: **4,305**
- by block count: `1:35, 2:385, 3:1575, 4:2310`
- total blocks: **14,770**
- pair-linearity checks across admitted families: **18,970**
- raw ground/block membership evaluations: **103,390**
- incidence-neighborhood entries: **28,245**
- total overlap edges: **17,010**
- families with no degree>=3 mark: **3,360**
- families with exactly one degree-3 mark: **945**
- total marked concurrency cliques: **945**

Frozen target: exact reconstruction equality in **4,305 / 4,305** admitted families, zero failures.

## Negative controls

A. Nonlinear pair: `{012,013}`. Pair overlap multiplicity two is collapsed by an unweighted 2-section; reconstruction must not equal the raw incidence-neighborhood multiset.

B. Nonuniform family: `{0123,045}`. A fixed block-size-3 reconstructor must reject the input.

C. Non-union-grounded ground declaration: block family `{012}` with declared ground `{0,1,2,3}` versus `{0,1,2}`. The marked 2-section is identical while the isolated element differs; receiver cannot recover degree-0 ground elements.

## Candidate bounded 𝄐

`WITHIN_THE_DECLARED_EXHAUSTIVE_UNIVERSE_OF_4305_UNION_GROUNDED_LINEAR_3_UNIFORM_INCIDENCE_FAMILIES_THE_FULLY_CONCURRENCY_MARKED_2_SECTION_RECONSTRUCTS_THE_EXACT_INCIDENCE_NEIGHBORHOOD_MULTISET_IN_EVERY_CASE, SO_THE_RECEIVER_IS_LOSSLESS_UP_TO_GROUND_ELEMENT_RELABELING_ON_THAT_DECLARED_CLASS.`

and

`THE_RECONSTRUCTION_BOUNDARY_IS_STRUCTURAL: LINEARITY_PREVENTS_EDGE_MULTIPLICITY_LOSS, THREE_UNIFORMITY_FIXES_PRIVATE_ELEMENT_MULTIPLICITY, AND_UNION_GROUNDEDNESS_EXCLUDES_INVISIBLE_DEGREE_ZERO_ELEMENTS; HOSTILE_CONTROLS_OUTSIDE_THOSE_HYPOTHESES_FAIL_OR_REJECT.`

## Mandatory membranes

`MARKED_2SECTION_RECONSTRUCTION != UNIVERSAL_HYPERGRAPH_RECONSTRUCTION`

`FINITE_EXHAUSTIVE_CLASS != ALL_FINITE_SET_SYSTEMS`

`LOSSLESS_ON_DECLARED_CLASS != LOSSLESS_COMPRESSION_UNIVERSALLY`

`INCIDENCE_NEIGHBORHOOD_ISOMORPHISM != HISTORICAL_SOURCE_IDENTITY`

`CONCURRENCY_CLIQUE != CAUSAL_CONCURRENCY`

`OVERLAP_GRAPH != PHYSICAL_NETWORK`

`GROUND_ELEMENT_RELABELING != PHYSICAL_INTERCHANGEABILITY`

`ATLAS_REGISTRATION != LIVE_RUNTIME_STATE`

`A15_R0_RESEARCH_EXTENSION != PROTO_LOOM_OR_A16_PROMOTION`

`WITNESS_ROUTING != SCIENTIFIC_ANCESTRY`

`SUCCESSFUL_EXACT_HEAD_GREEN != MERGE_AUTHORITY`

No merge/deploy/release/publication/production/Vercel/live Ash-Loom/Proto-Loom/A16 authority.

Sealed ⟐