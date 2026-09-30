# A15-R0 · Atlas Minimal Faithful Receiver / Closure Geometry

Status: PREREGISTERED / PREIMPLEMENTATION / THEOREM UNEARNED.

Exact earned parent:

```text
#922 / b56e7bbea41e93bdc9f9d59e053be4733a1d5e41
TD613 Consolidated Validation run 2413 / 33430339504 — SUCCESS
A15-R0 step 19 — SUCCESS
```

## Question

The earned parent established that the complete four-refinement family is a faithful receiver for both declared native outer symmetry images, while observing only the distinguished native refinement collapses each native outer image.

This chamber asks the next receiver-design question:

> What is the smallest subset of the four refinement coordinates whose image tuple still uniquely identifies the native outer action?

Let the earned refinement family be indexed

```text
q0=q00=[0,0,0,1]
q1=q01=[0,0,1,0]
q2=q10=[0,1,0,0]
q3=q11=[0,1,1,1]
```

with native groups

```text
Omega_D = O(q_D), |Omega_D|=2
Omega_Q = O(q_Q), |Omega_Q|=6
```

For every subset `S` of `{q0,q1,q2,q3}`, define the receiver evaluation

```text
E_S(g) = (g.q)_{q in S}
```

using the ordered selected coordinates.

Define the native receiver separation rank

```text
r_recv(Omega) = min |S| such that E_S is injective on Omega.
```

This is the finite permutation-action base size expressed in Atlas receiver language. It is not the earlier #900 action-evaluation rank and not a physical sensor count.

## Frozen rank targets

```text
r_recv(D)=1
r_recv(Q)=2
```

D minimum faithful receivers:

```text
{q1}
{q2}
```

and no other singleton is faithful.

Q minimum faithful receivers:

```text
{q0,q1}
{q0,q2}
{q1,q2}
```

and no singleton is faithful.

## Complete 16-subset class census

For each subset, count distinct restricted action signatures.

Frozen frequency profiles:

```text
D receiver-class counts across all 16 subsets:
  1 class : 4 subsets
  2 classes: 12 subsets

Q receiver-class counts across all 16 subsets:
  1 class : 2 subsets
  3 classes: 6 subsets
  6 classes: 8 subsets
```

Exact mask table, with mask bits ordered `(q0,q1,q2,q3)`:

```text
mask   selected       D classes   Q classes
0000   {}                  1           1
0001   {q0}                1           3
0010   {q1}                2           3
0011   {q0,q1}             2           6
0100   {q2}                2           3
0101   {q0,q2}             2           6
0110   {q1,q2}             2           6
0111   {q0,q1,q2}          2           6
1000   {q3}                1           1
1001   {q0,q3}             1           3
1010   {q1,q3}             2           3
1011   {q0,q1,q3}          2           6
1100   {q2,q3}             2           3
1101   {q0,q2,q3}          2           6
1110   {q1,q2,q3}          2           6
1111   all four            2           6
```

## Receiver closure

Define

```text
cl_Omega(S)={q : equality of two native actions on S forces equality on q}.
```

Equivalently in this finite faithful permutation action,

```text
cl_Omega(S)=Fix(Omega_(S))
```

where `Omega_(S)` is the pointwise stabilizer of `S`.

Frozen closure-size profiles across all 16 subsets:

```text
D:
  closure size 2 : 4 subsets
  closure size 4 : 12 subsets

Q:
  closure size 1 : 2 subsets
  closure size 2 : 6 subsets
  closure size 4 : 8 subsets
```

Exact zero-input closures:

```text
cl_D(empty)={q0,q3}
cl_Q(empty)={q3}
```

D fixed-only subsets `{}`, `{q0}`, `{q3}`, `{q0,q3}` close to `{q0,q3}`; any subset containing q1 or q2 closes to the full family.

Q subsets containing no moving coordinate close to `{q3}`; one moving coordinate closes to that coordinate plus q3; any two moving coordinates close to the full family.

## Automorphism-level receiver fibers

The earned lift theorem supplies four group-automorphism lifts per native outer action.

Therefore the restricted receiver class-size multisets must be:

```text
D:
  outer classes 1 -> Aut(D8) receiver fiber [8]
  outer classes 2 -> Aut(D8) receiver fibers [4,4]

Q:
  outer classes 1 -> Aut(Q8) receiver fiber [24]
  outer classes 3 -> Aut(Q8) receiver fibers [8,8,8]
  outer classes 6 -> Aut(Q8) receiver fibers [4,4,4,4,4,4]
```

## Candidate bounded 𝄐

If exact-head GREEN:

`THE_MINIMAL_FAITHFUL_REFINEMENT_RECEIVER_IS_NATIVE_SYMMETRY_DEPENDENT_IN_THE_DECLARED_FOUR_FORM_GEOMETRY: ONE_MOVING_REFINEMENT_SUFFICES_FOR_THE_TWO_ELEMENT_D_NATIVE_OUTER_ACTION_WHILE_TWO_MOVING_REFINEMENTS_ARE_NECESSARY_AND_SUFFICIENT_FOR_THE_SIX_ELEMENT_Q_NATIVE_OUTER_ACTION, GIVING R_RECV_D_1_AND_R_RECV_Q_2.`

and

`THE_COMPLETE_16_SUBSET_RECEIVER_CENSUS_IS_EXACTLY_CONTROLLED_BY_POINTWISE_STABILIZERS: RECEIVER_CLASS_COUNT_EQUALS_THE_NATIVE_GROUP_INDEX_OF_THE_POINTWISE_STABILIZER_AND RECEIVER_CLOSURE_EQUALS_THE_FIXED_SET_OF_THAT_STABILIZER; GLOBAL_FIXED_REFINEMENTS_ENTER_CLOSURE_WITHOUT_ADDING_NATIVE_OUTER_IDENTIFIABILITY.`

## Mandatory membranes

```text
MINIMAL_FAITHFUL_RECEIVER != PHYSICAL_SENSOR_MINIMUM
NATIVE_RECEIVER_SEPARATION_RANK != ACTION_EVALUATION_RANK
POINTWISE_STABILIZER != SECURITY_PERMISSION_SET
RECEIVER_CLOSURE != CAUSAL_RECOVERABILITY
CLOSURE_MEMBERSHIP != OBSERVED_INPUT
GLOBAL_FIXED_REFINEMENT != INFORMATIVE_RECEIVER_COORDINATE
OUTER_ACTION_IDENTIFIABILITY != SOURCE_PROVENANCE_IDENTIFICATION
NATIVE_OUTER_ACTION != PHYSICAL_SYMMETRY_GROUP
FINITE_SUBSET_CENSUS != SHANNON_CAPACITY_THEOREM
ATLAS_REGISTRATION != LIVE_RUNTIME_STATE
A15_R0_RESEARCH_EXTENSION != PROTO_LOOM_OR_A16_PROMOTION
WITNESS_ROUTING != SCIENTIFIC_ANCESTRY
```

No merge, deployment, release, publication, production, Vercel, live Ash/Loom, physical sensor/capacity interpretation, source provenance, Proto-Loom, or A16 authority.

Sealed ⟐