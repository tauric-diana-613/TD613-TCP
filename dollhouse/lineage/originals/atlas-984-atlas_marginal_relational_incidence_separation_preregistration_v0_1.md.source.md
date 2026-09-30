# A15-R0 · Atlas Marginal / Relational Incidence Separation · Preregistration v0.1

𝌋⟐

Exact earned parent: `94e644f8e718581c4764b0c1f43bd35017e0d476` (#934; run 2419 / 33452411885 SUCCESS; A15-R0 step 19 SUCCESS; aggregate SUCCESS).

## Question

Can the entire one-point circuit-hyperplane incidence degree multiset—and therefore every power-sum moment of that marginal degree distribution—still fail to distinguish two nonisomorphic receiver matroids with the same Tutte polynomial, while a genuinely relational statistic on the circuit-hyperplane overlap graph separates them?

## Declared controls

Ground set `E={0,1,2,3,4,5,6,7}`. Rank three. The rank function is generated from four declared 3-element circuit-hyperplanes; every set of size <3 has cardinality rank, each declared 3-set has rank 2, every other set of size >=3 has rank 3.

```text
M_tail circuit-hyperplanes:
  012, 034, 135, 267
  masks [7,25,42,196]

M_cycle circuit-hyperplanes:
  012, 034, 156, 357
  masks [7,25,98,168]
```

Every pair of declared circuit-hyperplanes intersects in at most one element. Both controls must nevertheless pass exhaustive rank axioms; sparse-paving language is descriptive only after that audit passes.

## Frozen common marginal surface

Both controls must derive the same sorted element-incidence degree multiset:

```text
[2,2,2,2,1,1,1,1]
```

Hence, algebraically for every integer `k>=1`,

```text
m_k = sum_e d(e)^k = 4*2^k + 4.
```

The implementation must record exact finite checks for `k=1..8` and separately record the all-k consequence from equality of the complete sorted degree multiset. In particular:

```text
m1 = 12
m2 = 20
(m2-m1)/2 = 4
```

Thus the total pairwise circuit-hyperplane overlap count is four in both controls. No one-point incidence moment can separate the declared pair.

## Frozen common Tutte surface

Both controls must independently derive the same corank-nullity polynomial

```text
R(u,v) = u^3 + 8u^2 + 4uv + 28u
       + v^5 + 8v^4 + 28v^3 + 56v^2 + 70v + 52
```

and the same Tutte polynomial

```text
T(x,y) = x^3 + 5x^2 + 4xy + 11x
       + y^5 + 3y^4 + 6y^3 + 10y^2 + 11y.
```

Polynomial equality must come from all 256 rank values per control, not from the shared count of four circuit-hyperplanes.

## Frozen relational surface

Define the circuit-hyperplane overlap graph `Gamma(M)`:

- vertices are the four circuit-hyperplanes;
- two vertices are adjacent iff the corresponding circuit-hyperplanes intersect nontrivially.

Both controls have four overlap-graph edges, so total pairwise overlap remains a null receiver.

Frozen overlap-graph degree profiles:

```text
M_tail  -> [3,2,2,1]
M_cycle -> [2,2,2,2]
```

Frozen scalar repair:

```text
Delta(Gamma(M_tail))  = 3
Delta(Gamma(M_cycle)) = 2
```

Thus the receiver ladder is preregistered as:

```text
T                                               -> 1 class
(T, sorted element-incidence degree multiset)   -> 1 class
(T, all one-point incidence moments)            -> 1 class
(T, element-degree multiset, total overlap=4)   -> 1 class
(T, element-degree multiset, Delta(Gamma))       -> 2 classes
```

The statement `all one-point incidence moments collide` is justified by exact equality of the finite degree multisets; it is not a claim established by sampling arbitrarily many moments.

## Exhaustive nonisomorphism

All `8! = 40,320` ground-set relabelings must be checked. A relabeling is an isomorphism only if it maps the complete declared circuit-hyperplane set of `M_tail` to that of `M_cycle`.

Frozen target:

```text
cross relabelings: 40,320
mapped circuit-hyperplane membership checks: 161,280
cross isomorphism matches: 0
```

The different overlap-graph degree profiles are an independent label-invariant nonisomorphism witness; exhaustive search remains mandatory.

## Candidate bounded 𝄐

`TWO_EXPLICIT_DECLARED_RANK_THREE_EIGHT_ELEMENT_RECEIVER_MATROIDS_HAVE_IDENTICAL_TUTTE_POLYNOMIALS_AND_IDENTICAL_COMPLETE_ELEMENT_INCIDENCE_DEGREE_MULTISETS_[2,2,2,2,1,1,1,1], SO_EVERY_ONE_POINT_INCIDENCE_POWER_SUM_MOMENT_COLLIDES, YET_THEIR_CIRCUIT_HYPERPLANE_OVERLAP_GRAPH_DEGREE_PROFILES_[3,2,2,1]_AND_[2,2,2,2]_DIFFER.`

and

`IN_THE_DECLARED_TWO_CONTROL_UNIVERSE, TUTTE_PLUS_ANY_COLLECTION_OF_ONE_POINT_INCIDENCE_POWER_SUM_MOMENTS_REMAINS_ONE_CLASS, WHILE_ADDING_THE_SINGLE_RELATIONAL_SCALAR_MAXIMUM_OVERLAP_GRAPH_DEGREE_REFINES_THE_RECEIVER_TO_TWO_CLASSES; MARGINAL_INCIDENCE_DATA_THEREFORE_DOES_NOT_DETERMINE_RELATIONAL_INCIDENCE_GEOMETRY_IN_THIS_FINITE_CONTROL.`

## Mandatory membranes

```text
IDENTICAL_INCIDENCE_DEGREE_MULTISET != IDENTICAL_MATROID
ALL_ONE_POINT_MOMENTS_COLLIDE != UNIVERSAL_MOMENT_INCOMPLETENESS_RATE
OVERLAP_GRAPH != PHYSICAL_NETWORK
OVERLAP_GRAPH_MAX_DEGREE != PHYSICAL_CONNECTIVITY
RELATIONAL_INCIDENCE_REPAIR != COMPLETE_MATROID_CLASSIFIER
TUTTE_PLUS_DELTA_SEPARATES_DECLARED_PAIR != UNIVERSAL_CLASSIFIER
SPARSE_PAVING_CONTROL != PHYSICAL_SPARSITY
FINITE_COUNTEREXAMPLE != STATISTICAL_PREVALENCE
MATROID_NONISOMORPHISM != PHYSICAL_SYSTEM_NONIDENTITY
ATLAS_REGISTRATION != LIVE_RUNTIME_STATE
A15_R0_RESEARCH_EXTENSION != PROTO_LOOM_OR_A16_PROMOTION
WITNESS_ROUTING != SCIENTIFIC_ANCESTRY
SUCCESSFUL_EXACT_HEAD_GREEN != MERGE_AUTHORITY
```

No merge/deploy/release/publication/production/Vercel/live Ash-Loom/Proto-Loom/A16 authority.

Sealed ⟐