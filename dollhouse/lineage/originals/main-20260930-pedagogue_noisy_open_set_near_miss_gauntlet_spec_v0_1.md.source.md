# Pedagogue Noisy Open-Set Near-Miss Gauntlet Spec v0.1

Status: **AUTHORED / PRE-IMPLEMENTATION / RESEARCH-ONLY / HUMAN-GATED**  
Parent open-set assay: `td613.ash.a15-r0.inadequate-reserve-open-set-hold/v0.1`  
Criterion role: `FORMAL_DIAGNOSTIC`  
Promotion authority: **FALSE**  
Production mutation: **NONE**

## 0. Research question

The parent assay earned abstention only after exact zero-probability failures. That is intentionally easy.

The next question is:

```text
Can Pedagogue earn or refuse open-set rejection
when every admitted candidate assigns nonzero probability
to the observed finite sample?
```

The assay must preserve two uncomfortable possibilities at once:

```text
1. an outside truth can produce enough discrepancy that rejection is earned;
2. an outside truth can also produce a near-miss sample for which rejection is not earned.
```

Core anti-equivalences:

```text
nonzero likelihood
!=
adequate candidate support

outside oracle truth
!=
permission to reject without sufficient observed evidence

predeclared finite-budget rejection criterion
!=
universal model-rejection threshold

failure to reject
!=
model validation

one surviving adequacy candidate
!=
unconditional truth identification
```

## 1. Frozen reserve candidate family

The active candidate family for this assay is:

```text
C = {RX,RY,RZ}
```

Each candidate generates Bernoulli observations `B ∈ {0,1}` with fixed success probabilities:

```text
p_RX = 0.70
p_RY = 0.50
p_RZ = 0.30
```

Every candidate therefore assigns positive probability to every finite binary sequence.

The hostile outside generator is:

```text
true_route = RU
p_RU = 0.95
RU ∉ C
```

A separate admitted control generator uses:

```text
control_route = RX
```

The oracle identities exist only for fixture assertions and may not alter the rejection criterion.

## 2. Predeclared finite-budget adequacy criterion

Sample size:

```text
n = 100
```

Familywise diagnostic error budget:

```text
alpha_family = 0.01
```

Candidate count:

```text
K = 3
```

Per-candidate budget is fixed before any sample is inspected:

```text
alpha_member = alpha_family / K
             = 0.0033333333333333335
```

Using the two-sided Hoeffding bound

```text
P(|p_hat - p| >= epsilon) <= 2 exp(-2 n epsilon^2)
```

the assay fixes the simultaneous diagnostic radius:

```text
epsilon
= sqrt(log(2 / alpha_member) / (2n))
= sqrt(log(600) / 200)
≈ 0.178842523679579
```

Candidate `r` survives the bounded adequacy diagnostic iff:

```text
|p_hat - p_r| <= epsilon
```

The family is rejected iff no admitted candidate survives.

### 2.1 Criterion status

Required metadata:

```text
criterion_role = FORMAL_DIAGNOSTIC
criterion_predeclared = true
criterion_selected_after_observation = false
universal_threshold_claim = false
empirical_validation_claim = false
```

This fixture uses Hoeffding because it gives a clean finite-sample concentration bound. It does not establish that this is an optimal open-set detector for TD613 or any live system.

## 3. Case A · hostile noisy outside sample earns rejection

Freeze before implementation:

```text
B_hostile = 95 ones + 5 zeros
n = 100
p_hat_hostile = 0.95
```

All candidate sequence likelihoods remain strictly positive.

Distances from admitted Bernoulli parameters:

```text
|0.95 - 0.70| = 0.25
|0.95 - 0.50| = 0.45
|0.95 - 0.30| = 0.65
```

All exceed `epsilon ≈ 0.178842523679579`.

Required surviving adequacy set:

```text
A_hostile = []
```

Required classification:

```text
NOISY_OPEN_SET_REJECTION_EARNED
```

Required output:

```text
all_candidate_likelihoods_nonzero = true
all_candidates_outside_predeclared_adequacy_band = true
selected_route = NONE
open_set_state = OPEN_SET_UNRESOLVED
abstention_earned = true
truth_identified = false
```

## 4. Case B · outside near-miss does not earn rejection

Freeze a second outside-world finite sample:

```text
B_near_miss = 85 ones + 15 zeros
n = 100
p_hat_near_miss = 0.85
```

The oracle truth remains outside the admitted family. But the observed sample is not sufficiently separated from `RX` under the predeclared diagnostic:

```text
|0.85 - 0.70| = 0.15 <= epsilon
```

while:

```text
|0.85 - 0.50| = 0.35 > epsilon
|0.85 - 0.30| = 0.55 > epsilon
```

Required surviving adequacy set:

```text
A_near_miss = [RX]
```

Required classification:

```text
OPEN_SET_REJECTION_NOT_EARNED_NEAR_MISS
```

Required refusals:

```text
oracle_outside_truth_used_to_override_criterion = false
abstention_earned = false
model_validated = false
RX_truth_identified = false
```

This case is crucial. The fixture oracle knows the truth is outside the candidate family, but the decoder must remain governed by observed evidence and the predeclared criterion.

## 5. Case C · admitted control survives

Freeze an admitted control sample generated for calibration:

```text
B_control = 72 ones + 28 zeros
n = 100
p_hat_control = 0.72
control_route = RX
```

Distances:

```text
|0.72 - 0.70| = 0.02 <= epsilon
|0.72 - 0.50| = 0.22 > epsilon
|0.72 - 0.30| = 0.42 > epsilon
```

Required surviving adequacy set:

```text
A_control = [RX]
```

Required classification:

```text
ADMITTED_CONTROL_SURVIVES_PREDECLARED_ADEQUACY_BAND
```

Required qualification:

```text
surviving_candidate = RX
criterion_conditioned_membership_support = true
unconditional_truth_identification = false
model_family_validated_universally = false
```

## 6. Candidate likelihoods must remain visible

For every case, implementation must retain finite-sample likelihoods under each candidate.

For count data with `k` ones and `n-k` zeros, the ordered-sequence likelihood surrogate used by this assay is:

```text
L_r = p_r^k (1-p_r)^(n-k)
```

The assay may compare adequacy using the Hoeffding band, but it must still prove:

```text
L_RX > 0
L_RY > 0
L_RZ > 0
```

for all three cases.

This prevents implementation from accidentally recreating the exact-zero parent assay.

## 7. Rejection provenance ledger

Every case receipt must preserve:

```text
sample_size
ones
zeros
empirical_rate
candidate_parameters
candidate_likelihoods
alpha_family
alpha_member
hoeffding_radius
criterion_role
criterion_predeclared
surviving_adequacy_set
open_set_rejection_earned
oracle_truth_in_candidate_family
oracle_truth_exposed_to_decoder
```

The criterion must be evaluated identically across hostile, near-miss, and admitted-control cases.

## 8. Negative controls

### 8.1 Post-hoc threshold tightening

After observing the near-miss sample, changing `epsilon` so that `RX` fails is forbidden.

Required rejection:

```text
POSTHOC_REJECTION_THRESHOLD_MUTATION_REJECTED
```

### 8.2 Oracle override

Because the fixture oracle knows `RU ∉ C`, a hypothetical implementation attempts to force open-set rejection in Case B despite `RX` surviving the authored band.

Required rejection:

```text
ORACLE_OVERRIDE_OF_OBSERVED_CRITERION_REJECTED
```

### 8.3 Failure-to-reject laundering

Case B and Case C may not be translated into:

```text
candidate family validated
```

Required field:

```text
failure_to_reject_is_validation = false
```

## 9. Expected exact receipt

```text
criterion:
  role = FORMAL_DIAGNOSTIC
  n = 100
  alpha_family = 0.01
  alpha_member = 0.0033333333333333335
  hoeffding_radius = 0.178842523679579
  predeclared = true
  universal_threshold_claim = false

case_A_hostile:
  empirical_rate = 0.95
  distances = {RX:0.25, RY:0.45, RZ:0.65}
  surviving_adequacy_set = []
  classification = NOISY_OPEN_SET_REJECTION_EARNED
  abstention_earned = true

case_B_near_miss:
  empirical_rate = 0.85
  distances = {RX:0.15, RY:0.35, RZ:0.55}
  surviving_adequacy_set = [RX]
  classification = OPEN_SET_REJECTION_NOT_EARNED_NEAR_MISS
  abstention_earned = false
  model_validated = false

case_C_control:
  empirical_rate = 0.72
  distances = {RX:0.02, RY:0.22, RZ:0.42}
  surviving_adequacy_set = [RX]
  classification = ADMITTED_CONTROL_SURVIVES_PREDECLARED_ADEQUACY_BAND
  unconditional_truth_identification = false

controls:
  threshold_mutation = POSTHOC_REJECTION_THRESHOLD_MUTATION_REJECTED
  oracle_override = ORACLE_OVERRIDE_OF_OBSERVED_CRITERION_REJECTED
  failure_to_reject_is_validation = false
```

## 10. Failure conditions

The gauntlet fails if implementation:

1. relies on zero candidate likelihoods in any case;
2. changes `alpha_family`, `alpha_member`, `n`, or `epsilon` after observing a sample;
3. rejects Case B merely because the fixture oracle knows the truth is outside `C`;
4. calls the near-miss survivor `RX` the true route;
5. calls Case B or Case C validation of candidate-family completeness;
6. fails to reject Case A under the exact authored criterion;
7. converts the Hoeffding diagnostic into an empirical-validation claim;
8. silently uses a different criterion across hostile, near-miss, and control cases;
9. hides the candidate likelihoods or oracle-membership status;
10. treats the synthetic result as evidence about live TD613, Ash, human cognition, physical systems, or quantum systems.

## 11. Epistemic posture

A pass may establish only:

```text
NOISY_OPEN_SET_NEAR_MISS_GRAMMAR_VALIDATED_IN_BOUNDED_SYNTHETIC_FIXTURE
```

Research refinement candidate:

```text
responsible open-set abstention must be earned from
predeclared evidence criteria,
not from oracle knowledge that the model is wrong;
and nonzero candidate likelihood does not by itself establish adequacy
```

This remains a **research refinement candidate**, not a promoted Pedagogue law.

## 12. Next action if the gauntlet survives

The next question should reconnect this open-set work to the earlier TD613 measurement-diversity thesis:

```text
next_learning_action = TEST_MULTI_PROBE_OPEN_SET_REJECTION_UNDER_MATCHED_OBSERVATION_BUDGETS
```

That assay should compare one repeated probe family against several genuinely different probe families under the same total observation budget and ask whether probe diversity improves rejection/identifiability without merely increasing sample count.

This is the natural bridge back toward:

```text
measurement diversity > raw repetition
```

and the longer tomography / relational-probe program.

## 13. Claim ceiling

No passing result establishes:

- universal open-set recognition;
- a universal optimal rejection threshold;
- empirical calibration on live data;
- universal Hoeffding optimality;
- causal identification;
- live TD613 stochastic behavior;
- tomography;
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

Human closure remains required.
