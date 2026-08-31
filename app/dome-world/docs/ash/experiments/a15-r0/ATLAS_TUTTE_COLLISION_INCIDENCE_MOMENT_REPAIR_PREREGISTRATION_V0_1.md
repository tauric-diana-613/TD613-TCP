# A15-R0 · Atlas Tutte Collision / Incidence-Moment Repair · Preregistration v0.1

𝌋⟐

Status: **PREREGISTERED BEFORE IMPLEMENTATION / THEOREM UNEARNED**.

Exact earned parent:

```text
#932 / 2b06eb8d2262135ed6b111dc103867c2d7e973af
run 2418 / 33450084910 — SUCCESS
A15-R0 step 19 — SUCCESS
aggregate — SUCCESS
```

## 1. Purpose

#932 earned an explicit finite Tutte collision: two rank-3 six-element matroids have the same corank-nullity and Tutte polynomials yet are nonisomorphic under all 720 relabelings.

This successor asks a narrower Atlas question:

> What is the smallest declared **incidence-moment order** that repairs this particular collision without restoring the full rank table?

The chamber is not allowed to answer by importing the full nonisomorphism search as the receiver. It must derive a small label-invariant local statistic from circuit-hyperplane incidence.

## 2. Parent controls

Ground set:

```text
E = {0,1,2,3,4,5}
```

Earned #932 controls:

```text
M_disj circuit-hyperplanes = {012,345}
M_meet circuit-hyperplanes = {012,034}
```

Their common Tutte polynomial is fixed by the parent:

```text
T = x^3 + 3x^2 + 2xy + 4x + y^3 + 3y^2 + 4y
```

The child must re-derive the circuit-hyperplane families from the earned 64-entry parent rank tables before computing incidence moments. Hard-coding the moment values as primary evidence is prohibited.

## 3. Incidence degree and moments

For the circuit-hyperplane family `H(M)`, define

```text
d_M(e) = number of H in H(M) containing e
m_k(M) = sum_{e in E} d_M(e)^k
```

Frozen degree targets in element order `0..5`:

```text
M_disj: [1,1,1,1,1,1]
M_meet: [2,1,1,1,1,0]
```

Frozen sorted degree profiles:

```text
M_disj: [1,1,1,1,1,1]
M_meet: [2,1,1,1,1,0]
```

Frozen moments:

```text
m1(M_disj) = 6
m1(M_meet) = 6
m2(M_disj) = 6
m2(M_meet) = 8
```

Thus first incidence moment is predicted to preserve the Tutte collision, while second incidence moment is predicted to separate it.

## 4. Declared moment receiver ladder

Define the three receivers on the declared two-control universe:

```text
R0(M) = T(M)
R1(M) = (T(M), m1(M))
R2(M) = (T(M), m1(M), m2(M))
```

Frozen class counts:

```text
|{M_disj,M_meet}/~R0| = 1
|{M_disj,M_meet}/~R1| = 1
|{M_disj,M_meet}/~R2| = 2
```

Define declared incidence-moment separation depth

```text
r_mom = min{k in {1,2}: (T,m1,...,mk) separates the two controls}
```

Frozen target:

```text
r_mom = 2
```

This is a theorem only about this declared moment hierarchy and this declared two-control collision.

## 5. Overlap recovery identity

For any finite family of subsets, double counting gives

```text
sum_e C(d(e),2) = sum_{unordered H_i,H_j} |H_i ∩ H_j|.
```

Because each control here has exactly two circuit-hyperplanes, the right-hand side is their unique pair intersection size.

Using `C(d,2)=(d^2-d)/2`, freeze:

```text
P(M) = (m2(M)-m1(M))/2
```

Targets:

```text
P(M_disj) = 0
P(M_meet) = 1
```

These must equal the #932 circuit-hyperplane intersection profiles `[0]` and `[1]` respectively.

Thus second-moment excess is predicted to recover exactly the structural witness that the Tutte polynomial forgot in this pair.

## 6. Relabeling invariance

The statistic used to repair the collision must not depend on the chosen names `0..5`.

For every one of the `6! = 720` permutations of the ground set, for each control, recompute the permuted circuit-hyperplane family and require invariant:

```text
sorted degree profile
m1
m2
P=(m2-m1)/2
```

Frozen relabeling burden:

```text
controls: 2
permutations/control: 720
total relabelings: 1,440
incidence membership evaluations: 17,280
invariance failures: 0
```

## 7. Candidate bounded 𝄐

`THE_EARNED_TUTTE_COLLISION_IS_REPAIRED_IN_THE_DECLARED_TWO_CONTROL_UNIVERSE_BY_SECOND_ORDER_CIRCUIT_HYPERPLANE_INCIDENCE: BOTH_CONTROLS_HAVE_M1_EQUALS_6_BUT_M2_EQUALS_6_VERSUS_8, SO_THE_DECLARED_INCIDENCE_MOMENT_SEPARATION_DEPTH_IS_EXACTLY_TWO.`

and

`THE_SECOND_MOMENT_EXCESS_(M2_MINUS_M1)_OVER_TWO_EQUALS_TOTAL_PAIRWISE_CIRCUIT_HYPERPLANE_OVERLAP_AND_RECOVERS_THE_EARNED_ZERO_VERSUS_ONE_INTERSECTION_WITNESS, REFINING_THE_ONE_CLASS_TUTTE_RECEIVER_TO_TWO_CLASSES_WITHOUT_RESTORING_THE_FULL_RANK_TABLE.`

## 8. Mandatory membranes

```text
SECOND_INCIDENCE_MOMENT != COMPLETE_MATROID_INVARIANT
MOMENT_SEPARATION_DEPTH_TWO != UNIVERSAL_REQUIRED_MOMENT_ORDER
TUTTE_PLUS_M2_SEPARATES_DECLARED_PAIR != UNIVERSAL_CLASSIFIER
CIRCUIT_HYPERPLANE_INCIDENCE != PHYSICAL_SENSOR_INCIDENCE
INCIDENCE_MOMENT != SHANNON_INFORMATION
OVERLAP_COUNT != CAUSAL_INTERACTION
FINITE_COLLISION_REPAIR != LOSSLESS_COMPRESSION
LABEL_INVARIANCE != SOURCE_INDEPENDENCE
MATROID_RECEIVER != LIVE_RECEIVER
ATLAS_REGISTRATION != LIVE_RUNTIME_STATE
A15_R0_RESEARCH_EXTENSION != PROTO_LOOM_OR_A16_PROMOTION
WITNESS_ROUTING != SCIENTIFIC_ANCESTRY
SUCCESSFUL_EXACT_HEAD_GREEN != MERGE_AUTHORITY
```

No merge/deploy/release/publication/production/Vercel/live Ash-Loom/Proto-Loom/A16 authority.

Sealed ⟐