# Pedagogue Inadequate Reserve + Open-Set Hold Gauntlet Spec v0.1

Status: **AUTHORED / PRE-IMPLEMENTATION / RESEARCH-ONLY / HUMAN-GATED**  
Parent reserve assay: `td613.ash.a15-r0.predeclared-reserve-recovery/v0.1`  
Model family: `FINITE_ROUTE_CONDITIONED_DISCRETE_OBSERVATION_DISTRIBUTIONS`  
Promotion authority: **FALSE**  
Production mutation: **NONE**

## 0. Research question

The previous gauntlet established that a predeclared reserve may be activated after primary-model falsification and may support bounded recovery when independent recovery evidence discriminates among reserve candidates.

The next hostile question removes the comforting assumption that the reserve contains the truth:

```text
What must Pedagogue do when
both the primary family
and the predeclared reserve family
are inadequate?
```

The architecture must be able to stop.

Core anti-equivalences:

```text
reserve activation
!=
reserve adequacy

predeclared fallback family
!=
exhaustive ontology

all admitted families falsified
!=
permission to force a nearest candidate

UNKNOWN / OPEN_SET_HOLD
!=
a synthetic route candidate

abstention
!=
failed reasoning

negative-space exclusion receipt
!=
identification of the omitted truth
```

## 1. Frozen synthetic universe

### 1.1 Primary family

```text
C_primary = {R0,R1,R2}
```

### 1.2 Predeclared reserve family

```text
C_reserve = {RX,RY,RZ}
```

Reserve contract:

```text
predeclared_before_training = true
predeclared_before_trigger_event = true
predeclared_before_recovery_event = true
active_during_primary_training = false
eligible_for_primary_map_decision = false
activation_rule_frozen = true
```

### 1.3 Synthetic truth outside both families

The fixture oracle declares before decoder evaluation:

```text
true_route = RU
RU ∉ C_primary
RU ∉ C_reserve
```

The decoder may not inspect, infer, synthesize, or append `RU`.

Required provenance:

```text
truth_in_primary_family = false
truth_in_reserve_family = false
oracle_truth_exposed_to_decoder = false
```

## 2. Primary training channel Y

Reuse the parent primary laws:

```text
P(Y|R0) = [0.9,0.1]
P(Y|R1) = [0.5,0.5]
P(Y|R2) = [0.1,0.9]
P(Y|RU) = [0.9,0.1]
```

Frozen sample:

```text
Y_train = [0,0,0,0,0,0]
```

Primary-only historical result:

```text
MAP_primary = R0
P(R0|Y_train,C_primary) = 0.971436770999
```

Required status:

```text
PRIMARY_DECISION_RETAINED_AS_HISTORICAL_RECEIPT
```

The historical primary singleton remains model-conditional and does not gain authority from later failures.

## 3. Frozen primary-falsification trigger W

Alphabet:

```text
W ∈ {a,b,c}
```

Primary laws:

```text
P(W|R0) = [0.8,0.2,0.0]
P(W|R1) = [0.5,0.5,0.0]
P(W|R2) = [0.2,0.8,0.0]
```

Reserve laws:

```text
P(W|RX) = [0.4,0.4,0.2]
P(W|RY) = [0.3,0.3,0.4]
P(W|RZ) = [0.2,0.2,0.6]
```

Truth law:

```text
P(W|RU) = [0.25,0.25,0.50]
```

Frozen trigger event:

```text
W_trigger = c
```

Thus:

```text
∀ r ∈ C_primary: P(c|r)=0
∀ q ∈ C_reserve: P(c|q)>0
P(c|RU)>0
```

The parent activation rule therefore fires:

```text
classification = PRIMARY_MODEL_FALSIFIED_RESERVE_ACTIVATED
```

Trigger evidence remains:

```text
evidence_role = ACTIVATION_EVIDENCE_ONLY
reserve_member_identified_from_trigger = false
reserve_map_from_trigger = NOT_COMPUTED_BY_DESIGN
```

## 4. Frozen reserve-adequacy channel Q

A separate reserve-adequacy/recovery channel is declared before `W_trigger` is observed and is not used for primary training or reserve activation.

Alphabet:

```text
Q ∈ {m,n,o}
```

Reserve laws:

```text
P(Q|RX) = [0.7,0.3,0.0]
P(Q|RY) = [0.4,0.6,0.0]
P(Q|RZ) = [0.2,0.8,0.0]
```

Synthetic truth law:

```text
P(Q|RU) = [0.2,0.3,0.5]
```

Frozen hostile recovery event:

```text
Q_recovery = o
```

Therefore:

```text
∀ q ∈ C_reserve: P(o|q)=0
P(o|RU)=0.5
```

The reserve family is now falsified by evidence that was neither used for primary fitting nor reserve activation.

Required classification:

```text
PRIMARY_AND_RESERVE_MODELS_FALSIFIED_OPEN_SET_HOLD
```

Required output:

```text
primary_model_adequate = false
reserve_model_adequate = false
selected_route = NONE
forced_nearest_candidate = false
open_set_state = OPEN_SET_UNRESOLVED
abstention_earned = true
truth_identified = false
```

## 5. UNKNOWN is a governance state, not a candidate

The assay may expose an operator-facing epistemic state:

```text
UNKNOWN_OUTSIDE_DECLARED_FAMILIES
```

but this symbol must not enter any candidate set.

Required fields:

```text
unknown_token_is_candidate = false
unknown_token_has_route_likelihood = false
unknown_token_has_prior_probability = false
unknown_token_can_win_map = false
```

Its function is only to preserve a bounded statement:

```text
all currently admitted model families failed the authored adequacy tests;
no replacement generator has been identified
```

## 6. Negative-space exclusion receipt

After the hostile event, Pedagogue must be able to preserve what has actually been learned without inventing a replacement route.

Required negative-space receipt:

```text
excluded_primary_family = [R0,R1,R2]
excluded_reserve_family = [RX,RY,RZ]
exclusion_basis_primary = W:c
exclusion_basis_reserve = Q:o
outside_truth_identity = UNRESOLVED
```

Required classification:

```text
BOUNDED_NEGATIVE_SPACE_RECEIPT
```

Core law under review:

```text
knowing what the observation cannot have come from
may be evidentially useful
without implying knowledge of what it did come from
```

## 7. Forced-choice temptation control

A hostile downstream selector asks for one route anyway.

It may rank candidates by an arbitrary fallback distance, lexical order, prior training posterior, or reserve trigger probability.

The governed response must refuse route promotion because the relevant adequacy tests have falsified both admitted families.

Required verdict:

```text
FORCED_CHOICE_AFTER_MODEL_EXHAUSTION_REJECTED
```

Required fields:

```text
route_returned = NONE
historical_primary_map_reused = false
reserve_trigger_probability_used_as_recovery_rank = false
arbitrary_distance_fallback_used = false
```

## 8. Post-hoc candidate synthesis control

After both families fail, a hypothetical analyst attempts to create:

```text
R_NEW
```

from the failure residue and immediately add it as a candidate.

The assay must return:

```text
POSTHOC_CANDIDATE_SYNTHESIS_NOT_ADMITTED
```

and:

```text
new_candidate_synthesis_authorized = false
automatic_ontology_reopening_authorized = false
independent_predeclaration_or_new_governed_assay_required = true
```

This does not prohibit future hypothesis generation. It prevents hypothesis generation from being confused with evidence-backed candidate admission inside the assay that generated the hypothesis.

## 9. Soft control: reserve-compatible evidence remains bounded

To prevent the assay from learning that reserve activation always ends in reserve failure, include a control event:

```text
Q_control = m
```

All reserve candidates assign positive probability:

```text
P(m|RX)=0.7
P(m|RY)=0.4
P(m|RZ)=0.2
```

Required classification:

```text
RESERVE_NOT_FALSIFIED_BY_CONTROL_EVENT
```

Required refusal:

```text
reserve_validated = false
reserve_complete = false
```

Compatibility with one event does not prove reserve adequacy.

## 10. Scope ledger

Every receipt must preserve:

```text
primary_candidate_family
reserve_candidate_family
truth_in_primary_family
truth_in_reserve_family
primary_training_scope
reserve_activation_scope
reserve_adequacy_scope
primary_falsification_status
reserve_falsification_status
open_set_state
negative_space_receipt
forced_choice_refusal
posthoc_synthesis_refusal
oracle_truth_exposed_to_decoder
```

Expected values:

```text
primary_candidate_family = [R0,R1,R2]
reserve_candidate_family = [RX,RY,RZ]
truth_in_primary_family = false
truth_in_reserve_family = false
primary_training_scope = Y:[0,0,0,0,0,0]
reserve_activation_scope = W:c
reserve_adequacy_scope = Q:o
primary_falsification_status = FALSIFIED
reserve_falsification_status = FALSIFIED
open_set_state = OPEN_SET_UNRESOLVED
oracle_truth_exposed_to_decoder = false
```

## 11. Expected exact receipt

```text
primary_training:
  map_route = R0
  map_posterior = 0.971436770999
  status = PRIMARY_DECISION_RETAINED_AS_HISTORICAL_RECEIPT

activation:
  event = c
  classification = PRIMARY_MODEL_FALSIFIED_RESERVE_ACTIVATED
  evidence_role = ACTIVATION_EVIDENCE_ONLY

reserve_adequacy:
  event = o
  reserve_event_probabilities = [0,0,0]
  classification = PRIMARY_AND_RESERVE_MODELS_FALSIFIED_OPEN_SET_HOLD
  selected_route = NONE
  open_set_state = OPEN_SET_UNRESOLVED
  abstention_earned = true
  truth_identified = false

negative_space:
  classification = BOUNDED_NEGATIVE_SPACE_RECEIPT
  excluded_primary_family = [R0,R1,R2]
  excluded_reserve_family = [RX,RY,RZ]
  outside_truth_identity = UNRESOLVED

forced_choice_control:
  classification = FORCED_CHOICE_AFTER_MODEL_EXHAUSTION_REJECTED
  route_returned = NONE

posthoc_synthesis_control:
  classification = POSTHOC_CANDIDATE_SYNTHESIS_NOT_ADMITTED
  new_candidate_synthesis_authorized = false

soft_reserve_control:
  event = m
  classification = RESERVE_NOT_FALSIFIED_BY_CONTROL_EVENT
  reserve_validated = false
```

## 12. Failure conditions

The gauntlet fails if implementation:

1. treats reserve activation as proof that `C_reserve` is adequate;
2. selects `RX`, `RY`, or `RZ` after `Q=o` despite every reserve candidate assigning zero probability;
3. reuses historical primary MAP `R0` after the primary family has been falsified;
4. turns `UNKNOWN_OUTSIDE_DECLARED_FAMILIES` into a route candidate, prior-bearing hypothesis, or MAP competitor;
5. calls abstention a failure when both admitted families have been falsified;
6. identifies `RU` from negative-space exclusion alone;
7. automatically synthesizes and admits a new candidate from the same failure evidence;
8. calls the soft control event `m` validation or completeness of the reserve family;
9. changes candidate families, oracle truth, channel laws, events, or predeclaration status after implementation begins;
10. treats the synthetic fixture as evidence about live TD613, Ash, human cognition, physical systems, or quantum systems.

## 13. Epistemic posture

A pass may establish only:

```text
INADEQUATE_RESERVE_AND_OPEN_SET_HOLD_GRAMMAR_VALIDATED_IN_BOUNDED_SYNTHETIC_FIXTURE
```

Research refinement candidate:

```text
a responsible inference system needs an earned abstention state
when every admitted model family fails,
and that abstention must preserve negative-space evidence
without converting absence of fit into a fabricated positive ontology
```

This remains a **research refinement candidate**, not a promoted Pedagogue law.

## 14. Next action if the gauntlet survives

Exact-zero falsification is intentionally easy. The next scientifically harder assay should remove that convenience:

```text
next_learning_action = TEST_NOISY_OPEN_SET_REJECTION_WITH_NONZERO_NEAR_MISS_SUPPORT
```

That assay should ask whether Pedagogue can preserve abstention when every admitted candidate assigns *some* probability to the observation but none provides adequate support under a predeclared finite-budget criterion.

It must distinguish:

```text
low but nonzero likelihood
from
adequate evidence for candidate membership
```

without inventing a universal rejection threshold.

## 15. Claim ceiling

No passing result establishes:

- universal open-set recognition;
- universal abstention optimality;
- a universal model-rejection threshold;
- causal identification;
- empirical recovery outside the synthetic fixture;
- completeness of any omitted ontology;
- live TD613 stochastic behavior;
- connection;
- curvature;
- holonomy;
- Berry structure;
- physical phasons;
- quantum behavior;
- A16 admission;
- Proto-Loom;
- production authority.

## 16. UI / release posture

```text
Pedagogue research UI = NOT REQUIRED
Moss Lantern UI = NONE
Giving UI mutation = NONE
Ash Keep production UI mutation = NONE
Holonomy Loom UI mutation = NONE
TD613.com deployment = HELD
Vercel authorization = NOT REQUESTED
PR remains Draft
```

Human closure remains required.
