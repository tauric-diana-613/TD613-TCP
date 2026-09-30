# Pedagogue Model-Misspecification + Held-Out Observation Gauntlet Spec v0.1

Status: **AUTHORED / PRE-IMPLEMENTATION / RESEARCH-ONLY / HUMAN-GATED**  
Parent criterion family: `td613.flowcore.pedagogue-research-criterion-family/v0.1`  
Parent contraction assay: `td613.ash.a15-r0.partial-identification-contraction/v0.1`  
Model family: `FINITE_ROUTE_CONDITIONED_DISCRETE_OBSERVATION_DISTRIBUTIONS`  
Promotion authority: **FALSE**  
Production mutation: **NONE**

## 0. Research question

The previous gauntlet established that an identification verdict must carry its observation scope, candidate model, and assumption provenance. The next hostile question is:

```text
Can a declared candidate model produce a clean singleton
and very high within-model posterior confidence
while the synthetic truth lies outside the candidate family?
```

Then:

```text
What may a genuinely held-out observation establish
when it contradicts every admitted candidate?
```

Core anti-equivalences:

```text
within-model singleton
!=
truth belongs to candidate family

high posterior confidence within a declared model
!=
model adequacy

model-class falsification by held-out evidence
!=
identification of the omitted truth

failure to falsify on one held-out event
!=
model validation

post-hoc candidate expansion
!=
independent confirmation
```

## 1. Frozen synthetic worlds

### 1.1 Admitted decoder candidate family

The decoder is allowed to consider exactly:

```text
C = {R0,R1,R2}
```

Equal prior weighting is fixed before any observation:

```text
P(R0)=P(R1)=P(R2)=1/3
```

### 1.2 Synthetic generator truth

The fixture generator declares, before decoder evaluation:

```text
true_route = RX
RX ∉ C
```

`RX` is available only to the synthetic fixture oracle and test assertions. The decoder may not search for, infer, or silently append `RX` while evaluating the admitted candidate family.

Required provenance language:

```text
truth_membership_in_declared_candidate_family = false
candidate_family_complete = false
```

This is a deliberately misspecified model.

## 2. Training channel Y

Binary alphabet:

```text
Y ∈ {0,1}
```

Frozen route-conditioned laws:

```text
P(Y|R0) = [0.9,0.1]
P(Y|R1) = [0.5,0.5]
P(Y|R2) = [0.1,0.9]
P(Y|RX) = [0.9,0.1]
```

Thus:

```text
P(Y|RX) = P(Y|R0)
```

Inside the admitted family `C`, the population-level target law has a unique match:

```text
I_Y(C) = {R0}
```

Required classification:

```text
POINT_IDENTIFIED_WITHIN_MISSPECIFIED_DECLARED_MODEL
```

Required caveat:

```text
point_identified_within_declared_model = true
truth_identified = false
model_adequacy_established = false
```

The decoder is behaving correctly *relative to its declared ontology* while the ontology is incomplete.

## 3. Case A · finite training sample creates high within-model confidence

Freeze the training sample before implementation:

```text
Y_train = [0,0,0,0,0,0]
n_train = 6
```

Under equal priors and the exact admitted laws:

```text
L(R0) = 0.9^6 = 0.531441
L(R1) = 0.5^6 = 0.015625
L(R2) = 0.1^6 = 0.000001
```

Normalized posterior inside `C`:

```text
P(R0|Y_train,C) = 0.971436770999
P(R1|Y_train,C) = 0.028561401072
P(R2|Y_train,C) = 0.000001827930
```

Required decision output:

```text
within_model_map_route = R0
within_model_map_posterior = 0.971436770999
classification = HIGH_CONFIDENCE_WITHIN_MISSPECIFIED_MODEL
```

Required refusals:

```text
high_confidence_truth_claim = false
model_adequacy_established = false
candidate_family_completeness_inferred = false
```

The number is real arithmetic inside the fixture. Its epistemic reach is bounded by the candidate model.

## 4. Held-out channel W is frozen before training evaluation

The held-out channel is not selected after seeing `Y_train` and is not used to choose the candidate family, priors, or training decoder.

Alphabet:

```text
W ∈ {a,b,c}
```

Frozen laws:

```text
P(W|R0) = [0.8,0.2,0.0]
P(W|R1) = [0.5,0.5,0.0]
P(W|R2) = [0.2,0.8,0.0]
P(W|RX) = [0.4,0.4,0.2]
```

Every admitted candidate assigns zero probability to `c`:

```text
∀ r ∈ C: P(W=c|r)=0
```

The omitted synthetic truth assigns:

```text
P(W=c|RX)=0.2
```

Held-out status must remain explicit:

```text
heldout_channel_predeclared = true
heldout_channel_used_for_training = false
heldout_channel_used_for_candidate_selection = false
```

## 5. Case B · impossible held-out event falsifies the declared candidate family

Freeze the hostile held-out event:

```text
W_holdout_hard = c
```

Under the declared candidate family:

```text
P(W=c|C) = 0
```

Required verdict:

```text
MODEL_CLASS_FALSIFIED_BY_HELDOUT_EVENT
```

Required receipt:

```text
all_admitted_candidates_assign_zero_probability = true
candidate_family_adequate_after_event = false
within_model_training_posterior_still_historical = true
posterior_update_under_declared_candidate_family = UNDEFINED_ZERO_EVIDENCE
truth_identified = false
omitted_route_identified = false
```

The 97.14% training posterior remains a historical statement about the training-only declared model. It may not be carried forward as if the held-out event had positive evidence under that model.

### 5.1 No epsilon laundering

Implementation must not silently replace authored zeros with epsilon mass to rescue normalization.

Forbidden operation:

```text
0.0 → ε because held-out evidence otherwise has zero marginal likelihood
```

If smoothing is ever studied later, it requires a separately authored model with separately declared smoothing assumptions. This fixture contains none.

Required field:

```text
silent_probability_smoothing_applied = false
```

## 6. Case C · a non-falsifying held-out event does not validate the model

Freeze a matched control event:

```text
W_holdout_soft = a
```

All admitted candidates assign positive probability to `a`:

```text
P(a|R0)=0.8
P(a|R1)=0.5
P(a|R2)=0.2
```

Required verdict:

```text
NO_HELDOUT_FALSIFICATION_OBSERVED
```

Required refusals:

```text
model_validated = false
candidate_family_complete = false
truth_membership_in_candidate_family = false
```

Core anti-equivalence:

```text
compatible held-out event
!=
validated candidate ontology
```

## 7. Case D · post-hoc ontology repair cannot identify RX

After Case B exposes zero evidence under `C`, a hypothetical analyst appends the known fixture route `RX` and writes:

```text
C_post = {R0,R1,R2,RX}
```

This operation occurs after the hostile event is observed and after the fixture oracle has already declared `RX` as truth.

Required provenance:

```text
candidate_expansion = POSTHOC_ORACLE_REVEALED
independent_confirmation = false
```

Even though:

```text
P(W=c|RX)=0.2 > 0
```

Pedagogue must return:

```text
POSTHOC_CANDIDATE_EXPANSION_NOT_CONFIRMATORY
```

and:

```text
RX_identified_from_heldout_event = false
outside_alternative_uniquely_identified = false
```

Reason:

```text
rejection of C
establishes that the exact declared candidate family cannot generate c;
it does not enumerate, rank, or uniquely identify the open universe of omitted alternatives.
```

## 8. Model-adequacy ledger

Every receipt in this gauntlet must keep four different questions separate:

```text
1. Which candidate wins inside the declared model?
2. How concentrated is the finite-sample posterior inside that model?
3. Does held-out evidence falsify the exact declared model?
4. If the model is falsified, which omitted alternative generated the event?
```

The first three are answerable in bounded forms here. The fourth remains unanswered by candidate-family rejection alone.

Required statuses:

```text
within_model_identification = ANSWERED
within_model_finite_sample_decision = ANSWERED
heldout_model_adequacy_test = ANSWERED_FOR_FROZEN_EVENTS
outside_truth_identification = UNRESOLVED
```

## 9. Expected exact receipt

```text
training_population:
  candidate_family = [R0,R1,R2]
  true_route = RX
  truth_in_candidate_family = false
  identified_set = [R0]
  classification = POINT_IDENTIFIED_WITHIN_MISSPECIFIED_DECLARED_MODEL
  truth_identified = false

case_A_training_sample:
  sample = [0,0,0,0,0,0]
  map_route = R0
  map_posterior = 0.971436770999
  classification = HIGH_CONFIDENCE_WITHIN_MISSPECIFIED_MODEL
  model_adequacy_established = false

case_B_hard_holdout:
  event = c
  candidate_event_probabilities = [0,0,0]
  classification = MODEL_CLASS_FALSIFIED_BY_HELDOUT_EVENT
  posterior_update = UNDEFINED_ZERO_EVIDENCE
  silent_probability_smoothing_applied = false
  omitted_route_identified = false

case_C_soft_holdout:
  event = a
  candidate_event_probabilities = [0.8,0.5,0.2]
  classification = NO_HELDOUT_FALSIFICATION_OBSERVED
  model_validated = false

case_D_posthoc_expansion:
  candidate_family = [R0,R1,R2,RX]
  provenance = POSTHOC_ORACLE_REVEALED
  classification = POSTHOC_CANDIDATE_EXPANSION_NOT_CONFIRMATORY
  RX_identified_from_heldout_event = false
```

## 10. Failure conditions

The gauntlet fails if implementation:

1. reports `R0` as the synthetic truth rather than the within-model winner;
2. rounds 97.14% confidence into a model-adequacy claim;
3. infers candidate-family completeness from posterior concentration;
4. updates a posterior after the hard held-out event despite zero marginal evidence under every admitted candidate;
5. silently smooths an authored zero probability;
6. calls the hard held-out event proof that `RX` generated it;
7. calls the soft held-out event validation of the candidate model;
8. lets the post-hoc oracle-revealed candidate expansion count as independent confirmation;
9. alters the candidate family, priors, channel laws, samples, or held-out status after implementation begins;
10. treats the synthetic fixture as evidence about live TD613, Ash, human cognition, physical systems, or quantum systems.

## 11. Epistemic posture

A pass may establish only:

```text
MODEL_MISSPECIFICATION_AND_HELDOUT_ADEQUACY_GRAMMAR_VALIDATED_IN_BOUNDED_SYNTHETIC_FIXTURE
```

The reusable relation under review becomes sharper:

```text
identification inside a model
and adequacy of the model
are different questions;
held-out falsification can reject a declared ontology
without naming the ontology that should replace it
```

This remains a **research refinement candidate**, not a promoted Pedagogue law.

## 12. Next action if the gauntlet survives

If implementation preserves the misspecification boundary, zero-evidence hold, soft-event nonvalidation, and post-hoc expansion refusal:

```text
next_learning_action = TEST_PREDECLARED_CANDIDATE_EXPANSION_AND_OUT_OF_MODEL_RECOVERY
```

That future assay should add a genuinely predeclared outside-candidate reserve family before held-out evaluation and ask what additional evidence is needed to move from model rejection toward bounded alternative discrimination.

## 13. Claim ceiling

No passing result establishes:

- a universal theorem of model misspecification;
- universal Bayesian calibration;
- causal identification;
- empirical validation outside the synthetic fixture;
- live TD613 stochastic behavior;
- a complete ontology of omitted alternatives;
- connection;
- curvature;
- holonomy;
- Berry structure;
- physical phasons;
- quantum behavior;
- A16 admission;
- Proto-Loom;
- production authority.

## 14. UI / release posture

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
