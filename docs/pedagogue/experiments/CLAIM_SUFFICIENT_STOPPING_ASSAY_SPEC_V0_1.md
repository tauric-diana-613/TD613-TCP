𝌋

# Claim-Sufficient Stopping Assay v0.1

Status: **PREREGISTERED / PRE-IMPLEMENTATION / RESEARCH-ONLY / SYNTHETIC EXECUTION ONLY**  
Technical identity: `td613.pedagogue.claim-sufficient-stopping/v0.1`  
Research branch: `research/claim-sufficient-stopping-20260823`  
Parent claim-targeted measurement receipt: `87b55faefae865e9e9a8b7a37dc059068ba22f9d`  
Production mutation: **NONE**  
Vercel authority: **NONE**

---

## 0. Question

The parent bridge established that a next probe designed for a downstream claim can differ from a probe designed to minimize raw-state ambiguity.

That result matters operationally only if the instrument can stop when the requested claim is actually licensed.

This chamber asks:

> Under a fixed synthetic candidate model, can a claim-conditioned measurement policy stop as soon as the preregistered target claim becomes constant over the surviving compatible family, while a raw-state-first policy requires an additional measurement to license the same claim—and can the stopping rule refuse an out-of-model observation rather than forcing a claim?

Canonical separation:

```text
claim sufficient evidence
!=
full raw-state reconstruction
```

---

## 1. Candidate universe and probes

Reuse the frozen 62-candidate universe:

```text
C0 = {
  [[2,b],[0,5]],
  [[2,b],[0,7]]
  : b in F_31
}
```

Target claim:

```text
CONJUGACY_FINGERPRINT
```

Frozen probes:

```text
P_RAW   = observe t12
P_CLAIM = observe t22
```

Each measurement returns exactly one scalar in `F_31`.

---

## 2. Compatible-set update

For current compatible set `C` and observed probe outcome `y`:

```text
C' = { H in C : probe(H) = y }
```

If:

```text
C' = empty
```

required classification:

```text
OBSERVATION_OUTSIDE_CURRENT_MODEL_SUPPORT
```

and:

```text
claim_license_emitted = false
forced_nearest_candidate = false
```

The policy stops in a model-inadequacy state.

---

## 3. Claim-license stopping rule

For nonempty compatible set `C`, compute the complete image of the target claim:

```text
F(C) = { conjugacy_fingerprint(H) : H in C }
```

Then:

```text
claim_license_ready iff |F(C)| = 1
```

The policy stops immediately when this condition first becomes true.

It may stop with:

```text
|C| > 1
```

Raw matrix uniqueness is not a prerequisite for the target claim.

---

## 4. Policy G · goal-conditioned

Frozen policy:

```text
step 1 -> P_CLAIM
```

After any in-model observation:

```text
outcome = 5 or 7
remaining raw candidates = 31
remaining target classes = 1
```

Required:

```text
stop_after_measurement_count = 1
target_claim_licensed = true
raw_matrix_identified = false
```

No second measurement may be taken after the stopping condition is satisfied.

---

## 5. Policy R · raw-state-first

Frozen policy:

```text
step 1 -> P_RAW
if target claim still unresolved:
  step 2 -> P_CLAIM
```

After any in-model first outcome:

```text
remaining raw candidates = 2
remaining target classes = 2
```

Therefore step 1 is insufficient for the requested claim.

After step 2:

```text
remaining raw candidates = 1
remaining target classes = 1
```

Required:

```text
stop_after_measurement_count = 2
target_claim_licensed = true
raw_matrix_identified = true
```

---

## 6. Exhaustive in-model evaluation

Evaluate both policies for all 62 candidate truths.

No probability distribution is assumed.

Required uniform relations:

```text
for every H in C0:
  Policy G licenses target after 1 scalar
  Policy G leaves 31 raw candidates

  Policy R does not license target after first scalar
  Policy R licenses target after 2 scalars
  Policy R leaves 1 raw candidate
```

Therefore, for this declared target claim:

```text
Policy G target-license measurement count = 1
Policy R target-license measurement count = 2
```

This is a deterministic synthetic measurement-count comparison, not an expected-cost theorem.

---

## 7. Raw-state goal control

Run the same policy grammar with target claim:

```text
RAW_MATRIX
```

A policy may stop only when the compatible set has size one.

Required result:

```text
P_CLAIM alone is insufficient
P_RAW alone is insufficient
both P_RAW and P_CLAIM are required
raw-state goal measurement count = 2
```

This prevents the result from being rewritten as:

```text
P_CLAIM is generally a better measurement
```

It is better only for the declared conjugacy target in this authored candidate family.

---

## 8. Out-of-model hostile control

Freeze synthetic outsider:

```text
H_out = [[2,11],[0,6]]
```

This matrix is not in `C0` because:

```text
t22 = 6 not in {5,7}
```

Under Policy G:

```text
P_CLAIM(H_out) = 6
```

No current candidate predicts outcome 6.

Required result:

```text
compatible_count_after_observation = 0
classification = OBSERVATION_OUTSIDE_CURRENT_MODEL_SUPPORT
target_claim_licensed = false
forced_nearest_candidate = false
measurement_sequence_stops = true
```

The oracle fact that `H_out` is outside the model may be used only to construct the fixture, never to override the observed support test.

---

## 9. Measurement-count ledger

Freeze separately:

```text
measurements_to_target_claim
measurements_to_raw_state
remaining_raw_count_at_stop
remaining_target_class_count_at_stop
stop_reason
```

No single scalar utility or winner is produced across different goals.

---

## 10. Falsifiers

The chamber fails if any occur:

1. Policy G takes a second measurement after its target claim is licensed;
2. Policy G claims raw-state identification after one measurement;
3. Policy R licenses conjugacy after P_RAW alone;
4. Policy R fails to license conjugacy after both probes;
5. the raw-state goal stops before the compatible set is singleton;
6. outsider outcome 6 is mapped to class 5 or 7;
7. an empty compatible set emits any claim license;
8. the oracle outsider label overrides the observed-support criterion;
9. one-target measurement savings is promoted into universal measurement efficiency;
10. synthetic stopping policy is promoted into live autonomous measurement authority.

---

## 11. Allowed bounded outcome

A pass may earn:

```text
CLAIM_SUFFICIENT_STOPPING_CAN_REDUCE_SYNTHETIC_MEASUREMENT_COUNT_RELATIVE_TO_RAW_STATE_FIRST_RECONSTRUCTION_FOR_A_PREDECLARED_HOLONOMY_CLAIM
```

and:

```text
PEDAGOGUE_CAN_STOP_WHEN_THE_REQUESTED_CLAIM_IS_CONSTANT_OVER_THE_SURVIVING_COMPATIBLE_FAMILY_WITHOUT_WAITING_FOR_A_POINT_ESTIMATE_IN_THIS_SYNTHETIC_MODEL
```

with the hostile companion:

```text
OUT_OF_MODEL_OBSERVATION_STOPS_WITH_MODEL_INADEQUACY_NOT_FORCED_CLASSIFICATION
```

No universal active-learning law, Bayesian optimality, live autonomous experimentation, physical sensing, Proto-Loom authority, production authority, or Vercel authority follows.

𝌋

⟐