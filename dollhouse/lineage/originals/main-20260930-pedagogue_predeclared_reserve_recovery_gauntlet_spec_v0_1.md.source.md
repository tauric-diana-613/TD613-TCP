# Pedagogue Predeclared Reserve + Out-of-Model Recovery Gauntlet Spec v0.1

Status: **AUTHORED / PRE-IMPLEMENTATION / RESEARCH-ONLY / HUMAN-GATED**  
Parent misspecification assay: `td613.ash.a15-r0.model-misspecification-heldout/v0.1`  
Model family: `FINITE_ROUTE_CONDITIONED_DISCRETE_OBSERVATION_DISTRIBUTIONS`  
Promotion authority: **FALSE**  
Production mutation: **NONE**

## 0. Research question

The previous gauntlet showed that a held-out event can falsify an active candidate family without identifying the omitted truth. The next question is:

```text
What changes if a bounded reserve family was declared
before the failure event occurred?
```

More precisely:

```text
Can Pedagogue distinguish
predeclared contingency capacity
from post-hoc ontology repair,
and can it require independent recovery evidence
before promoting a reserve candidate?
```

Core anti-equivalences:

```text
predeclared reserve
!=
active primary candidate model

reserve activation
!=
reserve-member confirmation

compatibility with trigger evidence
!=
identification

trigger evidence
!=
independent recovery evidence

recovery inside a predeclared expanded finite model
!=
universal truth identification
```

## 1. Frozen candidate architecture

### 1.1 Active primary family

```text
C_primary = {R0,R1,R2}
```

This is the only family permitted to participate in the original training decision.

### 1.2 Quarantined predeclared reserve family

Before training data, held-out data, or any failure event is inspected, the fixture declares:

```text
C_reserve = {RX,RY,RZ}
```

Reserve status:

```text
predeclared_before_training = true
predeclared_before_trigger_event = true
active_during_primary_training = false
eligible_for_primary_map_decision = false
activation_rule_frozen = true
```

The fixture oracle declares:

```text
true_route = RX
RX ∈ C_reserve
RX ∉ C_primary
```

The decoder is not allowed to use oracle truth to choose or reorder the reserve family.

## 2. Primary training channel Y

Reuse the parent misspecification fixture:

```text
P(Y|R0) = [0.9,0.1]
P(Y|R1) = [0.5,0.5]
P(Y|R2) = [0.1,0.9]
P(Y|RX) = [0.9,0.1]
```

Frozen sample:

```text
Y_train = [0,0,0,0,0,0]
```

Primary-only result remains:

```text
MAP_primary = R0
P(R0|Y_train,C_primary) = 0.971436770999
```

Required status:

```text
PRIMARY_DECISION_RETAINED_AS_HISTORICAL_RECEIPT
```

The existence of a reserve family does not retroactively place reserve candidates into the primary decision.

## 3. Frozen trigger channel W

The trigger channel is declared before training evaluation:

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

Frozen trigger event:

```text
W_trigger = c
```

Thus:

```text
∀ r ∈ C_primary: P(c|r)=0
∀ q ∈ C_reserve: P(c|q)>0
```

## 4. Predeclared activation rule

Before any event is observed, the fixture freezes:

```text
ACTIVATE_RESERVE
iff
primary_marginal_probability(trigger_event) = 0
```

For `c`:

```text
primary_marginal_probability(c) = 0
```

Required verdict:

```text
PRIMARY_MODEL_FALSIFIED_RESERVE_ACTIVATED
```

Required provenance:

```text
activation_triggered = true
activation_rule_predeclared = true
reserve_family_posthoc_modified = false
```

### 4.1 Trigger evidence may open the reserve but may not crown it

Although reserve candidates assign different probabilities to `c`:

```text
P(c|RX)=0.2
P(c|RY)=0.4
P(c|RZ)=0.6
```

this fixture deliberately classifies the trigger event as:

```text
ACTIVATION_EVIDENCE_ONLY
```

It must not produce a reserve MAP winner.

Required output:

```text
reserve_member_identified_from_trigger = false
reserve_map_from_trigger = NOT_COMPUTED_BY_DESIGN
```

This is a conservative governance choice for the assay, not a universal prohibition on statistically conditioning on selection events. The purpose is to force a clean separation between contingency activation and independent recovery discrimination.

## 5. Frozen recovery channel V

A separate recovery channel is declared before the trigger event and is not used for primary training or reserve activation.

```text
V ∈ {u,v,x}
```

Reserve laws:

```text
P(V|RX) = [0.7,0.3,0.0]
P(V|RY) = [0.7,0.0,0.3]
P(V|RZ) = [0.0,0.7,0.3]
```

Frozen recovery sequence:

```text
V_recovery = [u,v]
```

Exact sequence likelihoods:

```text
L_V(RX) = 0.7 * 0.3 = 0.21
L_V(RY) = 0.7 * 0.0 = 0
L_V(RZ) = 0.0 * 0.7 = 0
```

Under the exact predeclared reserve family:

```text
I_V(C_reserve) = {RX}
```

Required verdict:

```text
RECOVERED_WITHIN_PREDECLARED_RESERVE_MODEL
```

Required qualification:

```text
recovered_route = RX
reserve_identified_set = [RX]
recovery_evidence_independent_of_trigger_channel = true
recovery_is_within_declared_finite_reserve_scope = true
universal_truth_identification = false
```

## 6. Negative controls

### 6.1 Trigger only

With `c` observed but `V_recovery` withheld:

```text
classification = RESERVE_ACTIVATED_RECOVERY_UNRESOLVED
reserve_member_identified = false
```

The trigger event is sufficient to reject `C_primary` and activate the reserve under the frozen rule. It is insufficient under this assay's governance to identify one reserve member.

### 6.2 Recovery sequence without activation

If `V_recovery=[u,v]` exists but the primary family has not met the frozen activation rule:

```text
classification = RECOVERY_EVIDENCE_HELD_OUTSIDE_INACTIVE_RESERVE
primary_decision_mutated = false
reserve_member_promoted = false
```

The recovery channel cannot silently bypass the activation membrane.

### 6.3 Post-hoc reserve mutation

After observing `c` or `[u,v]`, adding a new reserve candidate or deleting `RY`/`RZ` is forbidden.

Required rejection:

```text
POSTHOC_RESERVE_MUTATION_REJECTED
```

## 7. Scope ledger

Every recovery receipt must preserve:

```text
primary_candidate_family
reserve_candidate_family
reserve_predeclaration_status
activation_rule
activation_evidence
recovery_observation_scope
recovery_candidate_scope
oracle_truth_exposed_to_decoder
```

Required values for the success case:

```text
primary_candidate_family = [R0,R1,R2]
reserve_candidate_family = [RX,RY,RZ]
reserve_predeclaration_status = PREDECLARED_AND_FROZEN
activation_evidence = W:c
recovery_observation_scope = V:[u,v]
recovery_candidate_scope = [RX,RY,RZ]
oracle_truth_exposed_to_decoder = false
```

## 8. Expected exact receipt

```text
primary_training:
  map_route = R0
  map_posterior = 0.971436770999
  status = PRIMARY_DECISION_RETAINED_AS_HISTORICAL_RECEIPT

activation:
  event = c
  primary_event_probabilities = [0,0,0]
  reserve_event_probabilities = [0.2,0.4,0.6]
  classification = PRIMARY_MODEL_FALSIFIED_RESERVE_ACTIVATED
  evidence_role = ACTIVATION_EVIDENCE_ONLY
  reserve_map_from_trigger = NOT_COMPUTED_BY_DESIGN

trigger_only_control:
  classification = RESERVE_ACTIVATED_RECOVERY_UNRESOLVED

recovery:
  sequence = [u,v]
  reserve_sequence_likelihoods = [0.21,0,0]
  identified_set = [RX]
  classification = RECOVERED_WITHIN_PREDECLARED_RESERVE_MODEL
  universal_truth_identification = false

inactive_reserve_control:
  classification = RECOVERY_EVIDENCE_HELD_OUTSIDE_INACTIVE_RESERVE

posthoc_mutation_control:
  classification = POSTHOC_RESERVE_MUTATION_REJECTED
```

## 9. Failure conditions

The gauntlet fails if implementation:

1. allows `RX`, `RY`, or `RZ` into the primary training MAP decision;
2. modifies the reserve family after trigger or recovery evidence appears;
3. calls reserve predeclaration confirmation of any reserve member;
4. computes a reserve MAP winner from `c` despite the authored `ACTIVATION_EVIDENCE_ONLY` rule;
5. promotes a reserve member before the activation rule fires;
6. lets recovery evidence mutate the still-active primary decision when activation has not occurred;
7. fails to recover `RX` from `[u,v]` under the exact predeclared reserve laws after activation;
8. calls bounded reserve recovery universal truth identification;
9. exposes fixture oracle truth to the decoder;
10. treats the synthetic result as evidence about live TD613, Ash, human cognition, physical systems, or quantum systems.

## 10. Epistemic posture

A pass may establish only:

```text
PREDECLARED_RESERVE_ACTIVATION_AND_RECOVERY_GRAMMAR_VALIDATED_IN_BOUNDED_SYNTHETIC_FIXTURE
```

Research refinement candidate:

```text
responsible out-of-model recovery requires provenance for
what alternatives existed before failure,
what evidence activated them,
and what distinct evidence discriminated among them
```

This remains a **research refinement candidate**, not a promoted Pedagogue law.

## 11. Next action if the gauntlet survives

If implementation preserves quarantine, activation, independent recovery, and post-hoc mutation refusal:

```text
next_learning_action = TEST_OPEN_SET_RECOVERY_WHEN_PREDECLARED_RESERVE_IS_ALSO_INADEQUATE
```

That assay should make both primary and reserve families wrong, preventing the architecture from learning the comforting but dangerous habit that every failure has a prepared answer waiting in the next drawer.

## 12. Claim ceiling

No passing result establishes:

- universal open-set recognition;
- universal Bayesian model selection;
- causal identification;
- empirical recovery outside the synthetic fixture;
- completeness of the reserve family;
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

## 13. UI / release posture

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
