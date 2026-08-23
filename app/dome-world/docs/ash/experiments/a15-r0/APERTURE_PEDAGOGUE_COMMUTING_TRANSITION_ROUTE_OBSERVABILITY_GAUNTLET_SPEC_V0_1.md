𝌋

# Aperture × Pedagogue Commuting-Transition Route-Observability Gauntlet v0.1

**Schema:** `td613.a15-r0.aperture-pedagogue-commuting-transition-route-observability/v0.1`  
**Scientific parent:** #706 receipt `5cd5a8e5a74f302115e5df47044d7eea269f295b`  
**Status:** PREREGISTERED / PRE-IMPLEMENTATION / NO PATH-CATEGORY OR HOLONOMY AUTHORITY

## Research question

#706 established a frozen-operator control in which a two-action bilinear program is order-independent.

This chamber changes exactly one scientific ingredient: each question now has a declared post-measurement operator transition.

The question is:

> Can two programs use the same two actions, have commuting operator transitions, reach the same final operator, and nevertheless produce different ordered/cumulative observation transcripts because measurements are sampled at different intermediate operator states?

Frozen anti-equivalence:

```text
commuting operator transitions + same final operator
!=
route-independent observation transcript
```

## Action semantics

Every action executes in this exact order:

```text
1. observe scalar response against current operator T_k
2. append observation to transcript
3. apply the action's declared operator transition
4. continue
```

Changing measure-before-transition to transition-before-measurement would be a different experiment.

## Initial operator

```text
T0 = [[2,1],[1,3]].
```

## Action A

Measurement:

```text
r_A = [1,0]
x_A = [1,0]
z_A(T) = T_11
```

Post-measurement transition:

```text
Δ_A = [[0,0],[0,1]]
T -> T + Δ_A
```

## Action B

Measurement:

```text
r_B = [0,1]
x_B = [0,1]
z_B(T) = T_22
```

Post-measurement transition:

```text
Δ_B = [[2,0],[0,0]]
T -> T + Δ_B
```

## Commuting endpoint control

Transitions are additive, so required:

```text
A_transition(B_transition(T0))
=
B_transition(A_transition(T0))
=
[[4,1],[1,4]].
```

Thus both routes have the same operator endpoint.

## Frozen route predictions

### Route AB

```text
A observes 2
A transition makes T22 = 4
B observes 4
transcript = [2,4]
aggregate = 6
final operator = [[4,1],[1,4]]
```

### Route BA

```text
B observes 3
B transition makes T11 = 4
A observes 4
transcript = [3,4]
aggregate = 7
final operator = [[4,1],[1,4]]
```

Required:

```text
same action multiset = true
same final operator = true
transition maps commute = true
ordered transcripts differ = true
aggregate observations differ = true
```

## Frozen-operator negative control

Set both transition increments to zero while preserving measurements.

Required:

```text
AB transcript = [2,3]
BA transcript = [3,2]
aggregate(AB) = aggregate(BA) = 5
```

The ordered transcript differs only by action label/order; cumulative functional value is route-independent under the frozen operator.

## Endpoint-only custody hostile

An endpoint-only record containing only

```text
final operator = [[4,1],[1,4]]
action multiset = {A,B}
```

cannot recover whether the cumulative observation was 6 or 7.

Therefore the route transcript carries information discarded by endpoint-only compression.

Required anti-equivalence:

```text
endpoint-state custody != route-observation custody
```

This is a custody result about the authored fixture, not a generic theorem.

## Hostiles

Reject:

```text
H1 action transition applied before its measurement
H2 transition noncommutation used as explanation for the result
H3 final endpoints allowed to differ
H4 route transcript reconstructed from endpoint rather than executed
H5 frozen-operator control omitted
H6 endpoint-only custody claimed sufficient for cumulative observation history
H7 order sensitivity promoted to holonomy
H8 route dependence promoted to curvature / Berry / quantum / physical geometry
H9 action labels or hidden expected transcript leaked into a selector/oracle surface
```

## Bounded claim if successful

```text
TWO_PROGRAMS_USING_THE_SAME_ACTION_MULTISET_CAN_HAVE_COMMUTING_DECLARED_OPERATOR_TRANSITIONS_AND_THE_SAME_FINAL_OPERATOR_WHILE_PRODUCING_DIFFERENT_CUMULATIVE_OBSERVATION_TRANSCRIPTS_WHEN_MEASUREMENTS_ARE_SAMPLED_AT_DIFFERENT_INTERMEDIATE_OPERATOR_STATES_IN_THE_AUTHORED_FINITE_FIXTURE
```

## Claim ceiling

Success still does not earn:

```text
path category
path groupoid
parallel transport
holonomy
curvature
operator-tomography promotion
physical tomography
Berry / quantum
Proto-Loom
A16 reopening
merge / production / Vercel authority
```

## Frozen next seam if witnessed

A successful result would justify a separate human-reviewed scientific seam asking which object, if any, should be treated as the transported fiber state under reversible question morphisms. That is the point where categorical/path language would begin changing the ontology of the research program rather than merely describing an ordered fixture.

𝌋

Sealed ⟐
