# A15-R0 · Atlas Tutte Collision / Nonisomorphism · Preregistration v0.1

𝌋⟐

Exact earned parent: `b34d04f078791bada782bdb88d2d22307c891595` (#930; run 2417 / 33445992335 SUCCESS; A15-R0 step 19 SUCCESS; aggregate SUCCESS).

## Scientific question

Can two explicit finite receiver matroids carry the same Tutte polynomial while remaining nonisomorphic under every ground-set relabeling?

## Declared controls

Ground set `E={0,1,2,3,4,5}`, rank 3.

Define a rank function by

```text
r(A)=|A|                         if |A|<3
r(A)=2                           if A is a declared 3-element circuit-hyperplane
r(A)=3                           otherwise
```

Control `M_disj` declares circuit-hyperplanes

```text
H_disj = { {0,1,2}, {3,4,5} }
```

with intersection size 0.

Control `M_meet` declares

```text
H_meet = { {0,1,2}, {0,3,4} }
```

with intersection size 1.

The child must verify rank axioms exhaustively; the phrase `matroid` is not granted merely by construction syntax.

## Frozen polynomial targets

Both controls must derive the same corank-nullity polynomial

```text
R(u,v)=u^3 + 6u^2 + 2uv + 15u + v^3 + 6v^2 + 15v + 18
```

and the same Tutte polynomial

```text
T(x,y)=x^3 + 3x^2 + 2xy + 4x + y^3 + 3y^2 + 4y.
```

Equality must be coefficient-map equality after independent rank enumeration and exact substitution.

## Frozen nonisomorphism burden

Enumerate all `6! = 720` permutations `p:E→E`.

For each permutation compare all 64 subset ranks:

```text
r_disj(A) == r_meet(p(A))
```

for every subset `A`.

Frozen outcome:

```text
cross permutations checked = 720
rank comparisons = 46,080
isomorphism matches = 0
```

No structural shortcut may replace the exhaustive search, though the circuit-hyperplane intersection profile is retained as an independent witness.

## Frozen self-automorphism controls

Exhaust the same 720 permutations against each control itself.

Expected exact automorphism counts:

```text
|Aut(M_disj)| = 72
|Aut(M_meet)| = 8
```

with `46,080` rank comparisons per self-audit.

Thus the complete permutation burden is

```text
2,160 permutations
138,240 rank comparisons
```

across one cross-isomorphism and two self-automorphism searches.

## Structural witness

The two declared circuit-hyperplanes have intersection-size multisets

```text
M_disj: [0]
M_meet: [1]
```

which must differ exactly.

## Candidate bounded 𝄐

`TWO_EXPLICIT_DECLARED_RANK_THREE_SIX_ELEMENT_RECEIVER_MATROIDS_HAVE_IDENTICAL_CORANK_NULLITY_AND_TUTTE_POLYNOMIALS_BUT_ZERO_ISOMORPHISMS_ACROSS_ALL_720_GROUND_SET_RELABELINGS, SO_TUTTE_COMPRESSION_IS_STRICTLY_COARSER_THAN_FULL_MATROID_ISOMORPHISM_IN_THIS_FINITE_CONTROL.`

and

`THE_COLLIDING_CONTROLS_RETAIN_DIFFERENT_CIRCUIT_HYPERPLANE_INTERSECTION_GEOMETRY_AND_DIFFERENT_AUTOMORPHISM_GROUP_ORDERS_72_VERSUS_8_DESPITE_IDENTICAL_TUTTE_POLYNOMIALS.`

## Mandatory membranes

```text
TUTTE_COLLISION != UNIVERSAL_CLASSIFICATION_FAILURE_RATE
NONISOMORPHIC_MATROIDS != DIFFERENT_PHYSICAL_SYSTEMS
AUTOMORPHISM_GROUP_ORDER != PHYSICAL_SYMMETRY_COUNT
CIRCUIT_HYPERPLANE_INTERSECTION != PHYSICAL_INTERSECTION
FINITE_COUNTEREXAMPLE != STATISTICAL_PREVALENCE
TUTTE_POLYNOMIAL != COMPLETE_MATROID_ISOMORPHISM_INVARIANT
MATROID_COLLISION != HISTORY_COLLISION
ATLAS_REGISTRATION != LIVE_RUNTIME_STATE
A15_R0_RESEARCH_EXTENSION != PROTO_LOOM_OR_A16_PROMOTION
WITNESS_ROUTING != SCIENTIFIC_ANCESTRY
SUCCESSFUL_EXACT_HEAD_GREEN != MERGE_AUTHORITY
```

No merge/deploy/release/publication/production/Vercel/live Ash-Loom/Proto-Loom/A16 authority.

Sealed ⟐