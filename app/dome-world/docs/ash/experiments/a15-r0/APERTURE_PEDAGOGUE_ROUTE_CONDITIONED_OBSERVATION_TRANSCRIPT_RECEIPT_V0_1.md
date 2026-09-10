𝌋

# Aperture × Pedagogue Route-Conditioned Observation Transcript Receipt v0.1

**Schema:** `td613.a15-r0.aperture-pedagogue-route-conditioned-observation-transcript-receipt/v0.1`  
**PR:** #707  
**Scientific parent:** #706 corrected receipt `3986d10e28e1c4551b0fe9740d4aae07359da34e`  
**Status:** EVIDENTIARY CLOSURE / DRAFT STACKED / NO PROMOTION AUTHORITY

## 1. Witness coordinate

```text
run_number = 2062
run_id = 32672836004
witnessed_head = f40d6ebf0a7769bfb23e8055746e8fe88c943d18
static_job_id = 97276206625
conclusion = success
A15-R0_static_execution = success
browser_shards = skipped
full_repository_validation = skipped
self_hosted_calibration = skipped
literal_stdout = NOT_RETRIEVED_BY_CONNECTOR
```

The existing consolidated A15-R0 static gate executed the hostile contract on the exact witnessed head. #707 was restored to its true #706 scientific parent before this receipt was authored.

```text
receipt_document_commit != witnessed_head
```

The later receipt may document the witnessed contract and GitHub job result. It may not claim that CI executed the receipt itself.

## 2. Bounded primary result

Frozen initial operator:

```text
T0 = [[2,1],[1,3]]
```

Frozen post-sample additive transitions:

```text
Delta_A = [[0,0],[0,1]]
Delta_B = [[2,0],[0,0]]
```

The transitions commute under ordinary matrix addition and both routes terminate at exactly:

```text
T_final = [[4,1],[1,4]]
```

Under the preregistered timing law

```text
operator_before
-> sample scalar response
-> append immutable transcript event
-> apply declared transition
-> operator_after
```

the action-indexed historical evidence differs:

```text
AB:
  { A: 2, B: 4 }
  cumulative_response = 6

BA:
  { A: 4, B: 3 }
  cumulative_response = 7
```

The effect therefore survives canonicalization by action identity. It is not merely the trivial fact that event list `[A,B]` differs from `[B,A]`.

Required bounded classification survived:

```text
IDENTICAL_FINAL_OPERATOR_WITH_ROUTE_CONDITIONED_OBSERVATION_TRANSCRIPT_DIVERGENCE
```

## 3. Intermediate custody result

Each historical event retains and recursively freezes:

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

Responses are computed from each event's `operator_before`; later transitions do not rewrite earlier events.

Thus the chamber earns the bounded custody distinction:

```text
endpoint custody != intermediate observation custody
```

## 4. Negative controls

### Frozen operator

With zero transition deltas, both routes retain:

```text
{ A: 2, B: 3 }
cumulative_response = 5
```

so raw action order alone does not create action-indexed transcript divergence.

### Self-only commuting transitions

With:

```text
Delta_A_self = [[1,0],[0,0]]
Delta_B_self = [[0,0],[0,1]]
```

both routes change the final operator to:

```text
[[3,1],[1,4]]
```

while both action-indexed transcripts remain:

```text
{ A: 2, B: 3 }
```

Therefore:

```text
operator changed != transcript divergence
```

### Common-final-state sampling

When both transitions are applied first and both probes are sampled only from the shared endpoint, both route labels yield:

```text
{ A: 4, B: 4 }
```

so the primary distinction depends on intermediate sampling custody rather than endpoint inequality.

### Undeclared timing

Missing timing correctly abstains:

```text
SEQUENTIAL_OBSERVATION_TIMING_UNDECLARED
ABSTAIN_BEFORE_ROUTE_TRANSCRIPT_COMPARISON
```

## 5. Earned anti-equivalences

```text
same action multiset + same final operator != same route-conditioned observation transcript

different raw event order != sufficient evidence of route-conditioned transcript divergence

endpoint custody != intermediate observation custody

operator changed != transcript divergence

common endpoint != common historical evidence

commuting additive transitions != path category / transport / holonomy structure

intermediate observation history != final-state-only replay
```

## 6. Canonical bounded claim

```text
COMMUTING_ADDITIVE_OPERATOR_TRANSITIONS_CAN_TERMINATE_AT_THE_SAME_FINAL_OPERATOR_WHILE_PRODUCING_DIFFERENT_ACTION_INDEXED_SCALAR_OBSERVATION_TRANSCRIPTS_WHEN_RESPONSES_ARE_SAMPLED_AT_DIFFERENT_INTERMEDIATE_OPERATOR_STATES_IN_THE_AUTHORED_2X2_FIXTURE
```

## 7. Claim ceiling

Still false / unauthorized:

```text
general_path_dependence_theorem_earned = false
path_category_earned = false
path_groupoid_earned = false
transport_functor_earned = false
connection_earned = false
holonomy_earned = false
curvature_earned = false
Berry_structure_earned = false
quantum_behavior_earned = false
causal_intervention_theorem_earned = false
optimal_experiment_design_earned = false
canonical_operator_tomography_promotion_authority = false
physical_tomography_earned = false
blind_tomography_earned = false
Proto_Loom_earned = false
A16_reopened = false
live_Ash_mutation = false
merge_authority = false
production_authority = false
Vercel_authority = false
```

## 8. Next bounded western question

The exact fixture establishes route-conditioned historical divergence, but robustness remains unearned.

A later separately preregistered chamber may ask whether the distinction survives:

```text
small declared perturbations in transition magnitude
+
declared bounded measurement noise
+
a frozen endpoint-equality tolerance
```

without laundering mere numerical separation into a general path theorem.

The next chamber should distinguish at least:

```text
robust transcript separation
ambiguous transcript separation under noise
endpoint tolerance failure
```

before any stronger language is considered.

𝌋

Sealed ⟐
