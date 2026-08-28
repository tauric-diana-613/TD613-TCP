𝌋

# Aperture × Pedagogue Route-Conditioned Observation Transcript Gauntlet v0.1

**Schema:** `td613.a15-r0.aperture-pedagogue-route-conditioned-observation-transcript/v0.1`  
**Scientific parent:** #706 corrected receipt head `3986d10e28e1c4551b0fe9740d4aae07359da34e`  
**Status:** PREREGISTERED / PRE-IMPLEMENTATION / A15-R0 SYNTHETIC RESEARCH ONLY

## 0. Research question

#706 established only a frozen-operator control: a rank-2 linear functional that is inadmissible as one bilinear action can be synthesized by a higher-cost sum of admissible rank-one actions, and under a fixed operator the component response sum is order-independent.

The next failure mode is endpoint laundering.

> Can two programs use the same two declared actions, apply commuting additive operator transitions, terminate at the same final operator, and nevertheless produce different action-indexed observation transcripts because each scalar response is sampled at a different intermediate operator state?

Frozen anti-equivalence:

```text
same action multiset + same final operator
!=
same route-conditioned observation transcript
```

This is not a path-category, transport, holonomy, or curvature claim.

## 1. Frozen initial operator

```text
T0 = [[2,1],[1,3]]
```

Two admissible bilinear actions:

```text
A:
  r_A = [1,0]
  x_A = [1,0]
  measures t11

B:
  r_B = [0,1]
  x_B = [0,1]
  measures t22
```

Each action has action-count cost 1.

## 2. Declared response/transition timing

For every action in the primary chamber:

```text
state_before
-> sample scalar response z = r T x
-> append immutable transcript event
-> apply that action's declared operator transition
-> state_after
```

The response is therefore sampled **before that action's transition** and after all earlier transitions in the route.

Timing is first-class experimental structure.

If the sampling/transition order is undeclared, the implementation must return:

```text
SEQUENTIAL_OBSERVATION_TIMING_UNDECLARED
ABSTAIN_BEFORE_ROUTE_TRANSCRIPT_COMPARISON
```

No default timing convention may be silently inserted.

## 3. Commuting additive transitions

Freeze:

```text
Delta_A = [[0,0],[0,1]]
Delta_B = [[2,0],[0,0]]
```

Action A applies `Delta_A` after sampling.
Action B applies `Delta_B` after sampling.

Because both transitions are additive:

```text
(T + Delta_A) + Delta_B
=
(T + Delta_B) + Delta_A
```

and therefore both routes must terminate at:

```text
T_final = [[4,1],[1,4]]
```

Required terminal equality:

```text
T_AB_final = T_BA_final
```

No matrix noncommutation is needed or permitted as the explanation of transcript divergence.

## 4. Primary route AB

Action A samples first:

```text
z_A = 2
```

Then `Delta_A` produces:

```text
T1_AB = [[2,1],[1,4]]
```

Action B then samples:

```text
z_B = 4
```

Then `Delta_B` produces:

```text
T_AB_final = [[4,1],[1,4]]
```

Canonical action-indexed transcript:

```text
{ A: 2, B: 4 }
```

Cumulative scalar response:

```text
6
```

## 5. Primary route BA

Action B samples first:

```text
z_B = 3
```

Then `Delta_B` produces:

```text
T1_BA = [[4,1],[1,3]]
```

Action A then samples:

```text
z_A = 4
```

Then `Delta_A` produces:

```text
T_BA_final = [[4,1],[1,4]]
```

Canonical action-indexed transcript:

```text
{ A: 4, B: 3 }
```

Cumulative scalar response:

```text
7
```

The comparison must use action-indexed responses and cumulative response, not only raw event order, so trivial list permutation cannot masquerade as the effect.

Required classification:

```text
IDENTICAL_FINAL_OPERATOR_WITH_ROUTE_CONDITIONED_OBSERVATION_TRANSCRIPT_DIVERGENCE
```

## 6. Custody requirements

Each transcript event must retain and recursively freeze:

```text
action_id
step_index
operator_before
probe_r
probe_x
scalar_response
transition_delta
operator_after
```

The implementation must derive each scalar response from `operator_before` and the declared probe.

It may not:

```text
copy expected response values from the fixture answer key
recompute old transcript events after later transitions
replace intermediate operator custody with final operator only
canonicalize away the route while preserving only the endpoint
```

Required law:

```text
endpoint custody != intermediate observation custody
```

## 7. Control A — frozen operator

Set both transition deltas to zero.

Both routes must then yield the same action-indexed response map:

```text
{ A: 2, B: 3 }
```

and cumulative response:

```text
5
```

Required classification:

```text
FROZEN_OPERATOR_ACTION_INDEXED_TRANSCRIPT_ORDER_INVARIANT
```

This preserves #706's static-order control.

## 8. Control B — self-only transitions

Freeze transitions that affect only the same action's measured coordinate after that action has already sampled:

```text
Delta_A_self = [[1,0],[0,0]]
Delta_B_self = [[0,0],[0,1]]
```

Under sample-before-transition timing, neither action changes the other action's later response.

Both routes must retain:

```text
{ A: 2, B: 3 }
```

while still terminating at the same changed final operator:

```text
[[3,1],[1,4]]
```

Required classification:

```text
COMMUTING_OPERATOR_CHANGE_WITHOUT_ROUTE_TRANSCRIPT_DIVERGENCE
```

This blocks:

```text
operator changed -> transcript divergence
```

## 9. Control C — final-state sampling

Apply both primary transitions first, then sample both probes only from the common final operator.

Both route labels must yield:

```text
{ A: 4, B: 4 }
```

Required classification:

```text
COMMON_FINAL_STATE_SAMPLING_ERASES_INTERMEDIATE_TRANSCRIPT_DIFFERENCE
```

This control demonstrates that the primary divergence depends on intermediate sampling custody, not endpoint inequality.

## 10. Hostile controls

The hostile contract must reject or fail if:

```text
H1 final operator differs between AB and BA
H2 transition composition is explained by noncommutation
H3 transcript comparison uses only event-list order
H4 expected scalar responses are copied rather than computed
H5 old transcript events mutate after later operator transitions
H6 missing timing is treated as sample-before-transition by default
H7 final operator is substituted for operator_before in historical events
H8 route-conditioned transcript divergence is promoted to path category, path transport, holonomy, curvature, Berry, or quantum structure
H9 merge, production, Vercel, live Ash, or A16 authority is widened
```

## 11. Success criteria

The chamber succeeds only if all are true:

```text
S1 primary transitions are additive and terminally commuting
S2 AB and BA use the same action multiset {A,B}
S3 AB and BA terminate at exactly [[4,1],[1,4]]
S4 AB action-indexed transcript = {A:2,B:4}
S5 BA action-indexed transcript = {A:4,B:3}
S6 cumulative responses differ 6 vs 7
S7 transcript events retain immutable intermediate operator custody
S8 frozen-operator control remains action-indexed transcript invariant
S9 self-only transition control changes endpoint but not action-indexed transcript
S10 common-final-state sampling removes the primary difference
S11 undeclared timing abstains
S12 no claim-ceiling membrane widens
```

## 12. Canonical bounded claim candidate

If exact-head witness succeeds, strongest permitted claim:

```text
COMMUTING_ADDITIVE_OPERATOR_TRANSITIONS_CAN_TERMINATE_AT_THE_SAME_FINAL_OPERATOR_WHILE_PRODUCING_DIFFERENT_ACTION_INDEXED_SCALAR_OBSERVATION_TRANSCRIPTS_WHEN_RESPONSES_ARE_SAMPLED_AT_DIFFERENT_INTERMEDIATE_OPERATOR_STATES_IN_THE_AUTHORED_2X2_FIXTURE
```

## 13. Claim ceiling

Still false / unauthorized:

```text
general path-dependence theorem
path category
path groupoid
transport functor
connection
holonomy
curvature
Berry structure
quantum behavior
causal intervention theorem
optimal experimental design
canonical operator tomography promotion
physical / blind tomography
Proto-Loom
A16 reopening
live Ash mutation
merge authority
production authority
Vercel authority
```

## 14. Frozen next question if successful

Only after witness + receipt may a later chamber ask whether route-conditioned transcript divergence survives small perturbations in transition magnitude and measurement noise while endpoint equality is preserved within a declared tolerance.

That would be a robustness assay, not a topology or holonomy promotion.

𝌋

Sealed ⟐
