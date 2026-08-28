# Aperture × Pedagogue Joint Decision / Custody Hold Composition Gauntlet v0.1

Status: **PREREGISTERED / SYNTHETIC / A15-R0 / NON-RUNTIME / NON-PRODUCTION**  
Preregistration boundary: **frozen before executable implementation.**

## 0. Research question

The preceding bounded synthetic work separated a locally useful decision coordinate from the fuller custody/provenance record and then tested both under declared noise and source-root duplication/conflict.

This gauntlet asks the next narrower question:

> **Can decision posture and custody posture be represented and composed as two independently typed axes without either axis laundering, overriding, scalarizing, or silently resolving the other?**

This is a composition test, not a theorem that the chosen state tuple is sufficient, minimal, Markovian, causal, optimal, or physically instantiated.

## 1. Frozen state grammar

The authored epistemic state is:

```text
E_t = <D_t, C_t>
```

where:

```text
D_t = local decision posture derived from the declared orientation interval and bound posture
C_t = custody/provenance posture derived from declared source-root structure
```

The two axes are intentionally non-totalized.

Required composition fields:

```text
decision.status
decision.selected_action
decision.interval
decision.support_eligible
custody.status
custody.resolved_route
custody.unique_root_count
custody.independent_support_count
composition.joint_state_id
composition.decision_authority_from_custody = false
composition.custody_authority_from_decision = false
composition.combined_confidence_scalar = null
composition.majority_vote_used = false
composition.automatic_escalation = false
composition.automatic_execution = false
composition.human_closure_required = true
```

No scalar severity, confidence, utility, priority, or universal ordering is permitted to replace the typed pair.

## 2. Frozen decision postures

The decision axis may return only the following authored postures:

```text
DECISION_ACTIONABLE_PLUS
DECISION_ACTIONABLE_MINUS
DECISION_ABSTAIN_ORIENTATION_UNRESOLVED
DECISION_EVIDENCE_INELIGIBLE_BOUND_FALSIFIED
```

Mapping law:

```text
valid-bound CERTIFIED_POSITIVE -> DECISION_ACTIONABLE_PLUS / Q_PLUS_REPAIR
valid-bound CERTIFIED_NEGATIVE -> DECISION_ACTIONABLE_MINUS / Q_MINUS_REPAIR
ORIENTATION_UNRESOLVED         -> DECISION_ABSTAIN_ORIENTATION_UNRESOLVED / no repair
synthetic truth falsifies the declared noise bound
                                -> DECISION_EVIDENCE_INELIGIBLE_BOUND_FALSIFIED / no repair
```

The falsified-bound posture does not rewrite the custody axis and is not counted as evidence against the valid-bound rule.

## 3. Frozen custody postures

The custody axis may return the following authored postures from the preceding provenance fixture:

```text
CUSTODY_SINGLE_ROOT_SUPPORTED_NOT_CORROBORATED
CUSTODY_MULTI_ROOT_SYNTHETIC_AGREEMENT
CUSTODY_PROVENANCE_CONFLICT_HOLD
CUSTODY_SOURCE_ROOT_INTERNAL_CONFLICT_HOLD
```

Mapping law:

```text
SINGLE_ROOT_DUPLICATES_DO_NOT_AMPLIFY
  -> CUSTODY_SINGLE_ROOT_SUPPORTED_NOT_CORROBORATED

MULTI_ROOT_AGREEMENT_IN_BOUNDED_SYNTHETIC_FIXTURE
  -> CUSTODY_MULTI_ROOT_SYNTHETIC_AGREEMENT

PROVENANCE_CONFLICT_HOLD
  -> CUSTODY_PROVENANCE_CONFLICT_HOLD

SOURCE_ROOT_INTERNAL_CONFLICT_HOLD
  -> CUSTODY_SOURCE_ROOT_INTERNAL_CONFLICT_HOLD
```

Different synthetic `source_root_id` values are declared fixture independence only. They do not establish real-world source independence.

## 4. Frozen authored composition matrix

The executable fixture must include at least these eight cases:

### J1 — actionable + multi-root agreement

```text
decision input: y_hat = +0.001, bound = 0.0002, actual_eta = 0
custody input: two declared independent synthetic roots agree on Q_A
expected:
  DECISION_ACTIONABLE_PLUS
  CUSTODY_MULTI_ROOT_SYNTHETIC_AGREEMENT
```

### J2 — abstain + multi-root agreement

```text
decision input: y_hat = 0, bound = 0.0002
custody input: two declared independent synthetic roots agree on Q_A
expected:
  DECISION_ABSTAIN_ORIENTATION_UNRESOLVED
  CUSTODY_MULTI_ROOT_SYNTHETIC_AGREEMENT
```

Custody agreement may not manufacture a decision sign.

### J3 — actionable + provenance conflict

```text
decision input: y_hat = +0.001, bound = 0.0002, actual_eta = 0
custody input: independent synthetic roots conflict Q_A vs Q_B
expected:
  DECISION_ACTIONABLE_PLUS
  CUSTODY_PROVENANCE_CONFLICT_HOLD
```

Local actionability may not erase provenance conflict.

### J4 — abstain + provenance conflict

```text
decision input: y_hat = 0, bound = 0.0002
custody input: independent synthetic roots conflict Q_A vs Q_B
expected:
  DECISION_ABSTAIN_ORIENTATION_UNRESOLVED
  CUSTODY_PROVENANCE_CONFLICT_HOLD
```

This is a genuine dual-hold fixture. The two holds remain differently typed.

### J5 — actionable + same-root duplicates

```text
decision input: y_hat = -0.001, bound = 0.0002, actual_eta = 0
custody input: two agreeing records from one root
expected:
  DECISION_ACTIONABLE_MINUS
  CUSTODY_SINGLE_ROOT_SUPPORTED_NOT_CORROBORATED
```

Record multiplicity may not silently become independent corroboration.

### J6 — actionable + duplicate-majority provenance conflict

```text
decision input: y_hat = -0.001, bound = 0.0002, actual_eta = 0
custody input: two same-root Q_B records versus one independent-root Q_A record
expected:
  DECISION_ACTIONABLE_MINUS
  CUSTODY_PROVENANCE_CONFLICT_HOLD
```

Raw 2:1 record count may not majority-vote the custody conflict away.

### J7 — abstain + source-root internal conflict

```text
decision input: y_hat = 0.0001, bound = 0.0002
custody input: one root internally supplies Q_A and Q_B descendants
expected:
  DECISION_ABSTAIN_ORIENTATION_UNRESOLVED
  CUSTODY_SOURCE_ROOT_INTERNAL_CONFLICT_HOLD
```

### J8 — falsified decision bound + custody agreement

```text
decision synthetic truth: true_y = +0.0008
y_hat = -0.0001
declared bound = 0.00005
actual eta = -0.0009
custody input: two declared independent synthetic roots agree on Q_A
expected:
  DECISION_EVIDENCE_INELIGIBLE_BOUND_FALSIFIED
  CUSTODY_MULTI_ROOT_SYNTHETIC_AGREEMENT
```

The decision evidence becomes ineligible in the synthetic truth fixture; custody agreement remains independently represented.

## 5. Required non-interference assertions

For every authored joint state:

```text
decision_authority_from_custody = false
custody_authority_from_decision = false
combined_confidence_scalar = null
majority_vote_used = false
automatic_escalation = false
automatic_execution = false
human_closure_required = true
```

Additional invariants:

```text
changing only custody input may not alter decision.status or selected_action
changing only decision input may not alter custody.status or resolved_route
an unresolved decision may coexist with agreed custody
an actionable decision may coexist with conflicted custody
an ineligible decision receipt may coexist with agreed custody
```

The tuple preserves coexistence rather than attempting to synthesize a single certainty state.

## 6. Hostile controls

The executable witness must reject or hold the following:

1. any attempt to produce a finite `combined_confidence_scalar`;
2. any composition that uses raw record majority to resolve a root-level conflict;
3. any attempt to infer a decision sign from custody agreement;
4. any attempt to erase custody conflict because the local decision is actionable;
5. any attempt to turn a falsified decision noise bound into a custody failure;
6. undeclared decision posture;
7. undeclared custody posture;
8. malformed source-root fixture;
9. automatic execution or escalation;
10. any claim that synthetic root labels establish real-world source independence.

## 7. Bounded success criterion

The assay passes only if all eight authored states retain the preregistered decision and custody postures independently and all non-interference / anti-scalar / anti-majority assertions hold.

A passing fixture may support only this bounded refinement candidate:

> **In this finite synthetic fixture, local decision posture and custody/provenance posture can be carried as independently typed axes; agreement, conflict, abstention, and local actionability remain co-present without scalar collapse or cross-axis authority.**

It does not establish that this tuple is sufficient, minimal, Markovian, optimal, causal, robust outside the fixture, or appropriate for consequential real-world decision systems.

## 8. Anti-equivalences

```text
decision state != custody state
local actionability != provenance resolution
custody agreement != action authorization
orientation uncertainty != provenance conflict
provenance conflict != orientation uncertainty
record count != independent support count
duplicate agreement != independent corroboration
majority records != provenance resolution
synthetic root separation != proven real-world independence
noise-bound falsification != custody falsification
custody conflict != decision ineligibility
abstention != failure
joint state != confidence scalar
coexistence != mutual authorization
receipt preservation != execution permission
```

## 9. Claim ceiling

The assay grants no authority for:

```text
sufficient-statistic theorem
Markov-state theorem
POMDP theorem
Bayesian confidence theorem
consensus theorem
real-world provenance-independence claim
causal intervention theorem
active learning
reinforcement learning
optimal experimental design
autonomous escalation
autonomous execution
physical sensor feedback
physical tomography
blind tomography
operator tomography
connection
curvature
Berry structure
holonomy
TD613-general AIA theorem
Proto-Loom
production mutation
Vercel release
```

Installed Aperture remains unchanged. Pedagogue law promotion remains false. Human closure remains required.

## 10. Frozen next learning action

Only after this composition assay is witnessed may the frontier consider:

```text
TEST_DECISION_STATE_TRANSITION_WITH_CUSTODY_MONOTONIC_REPLAY_WHEN_A_NEW_OBSERVATION_RESOLVES_DECISION_UNCERTAINTY_BUT_DOES_NOT_ERASE_PRIOR_CONFLICT_OR_ROUTE_HISTORY
```

That future question remains held. It must not be implemented in this preregistration commit.
