𝌋

# Claim-Targeted Next-Measurement Design Bridge v0.1

Status: **PREREGISTERED / PRE-IMPLEMENTATION / RESEARCH-ONLY**  
Technical identity: `td613.pedagogue.claim-targeted-next-measurement-design/v0.1`  
Research branch: `research/claim-targeted-measurement-design-20260823`  
Parent refinement receipt: `324284c320ab1e6dfd7867ad8d64c39863eebd8f`  
Production mutation: **NONE**  
Vercel authority: **NONE**

---

## 0. Why this chamber exists

The structured-probe program established that probe design can change localization under matched observation budgets.

The holonomy program then established that a raw matrix may remain unidentified while a downstream quotient claim is nevertheless constant across the complete compatible family.

This chamber joins those results directly.

It asks:

> When the current evidence leaves multiple holonomy matrices compatible, should the next measurement be designed to shrink the raw candidate set as aggressively as possible, or to resolve a preregistered downstream claim as efficiently as possible?

The answer is not assumed to be the same.

Canonical separation:

```text
raw-state ambiguity reduction
!=
target-claim resolution
```

No Shannon-information, mutual-information, Bayesian-optimality, or universal experimental-design claim is made.

---

## 1. Exact finite candidate universe

Arithmetic domain:

```text
F_31
```

Current rank-two observation aperture has already fixed:

```text
t11 = 2
t21 = 0
```

The predeclared candidate model restricts the remaining diagonal coordinate to:

```text
t22 in {5,7}
```

while:

```text
t12 = b in F_31
```

Therefore the complete current compatible family is:

```text
C0 = C5 union C7

C5 = { [[2,b],[0,5]] : b in F_31 }
C7 = { [[2,b],[0,7]] : b in F_31 }
```

with:

```text
|C5| = 31
|C7| = 31
|C0| = 62
```

Every matrix must be verified invertible before the assay proceeds.

---

## 2. Preregistered target claim

The target claim is:

```text
CONJUGACY_FINGERPRINT
```

using the frozen gauge-blind GL(2,F31) classifier.

Expected algebraic structure to be computed, not hard-coded into the verdict:

```text
all C5 members -> one conjugacy fingerprint
all C7 members -> one conjugacy fingerprint
C5 fingerprint != C7 fingerprint
```

Thus the current compatible family contains exactly two target-claim classes while containing 62 raw representatives.

---

## 3. Matched one-scalar probe library

Every candidate next measurement returns exactly one scalar in `F_31`.

No probe may inspect oracle identity.

### P_RAW

Observe:

```text
t12
```

row:

```text
[0,1,0,0]
```

### P_CLAIM

Observe:

```text
t22
```

row:

```text
[0,0,0,1]
```

### P_MIX

Observe:

```text
t12 + t22
```

row:

```text
[0,1,0,1]
```

### P_REDUNDANT

Reobserve already fixed:

```text
t11
```

row:

```text
[1,0,0,0]
```

All four have:

```text
scalar observation count = 1
field = F_31
execution cost = one declared row evaluation
```

---

## 4. Probe partition compiler

For probe `q`, partition the complete compatible family by exact observed scalar:

```text
C0 = union_y B_q(y)
```

where:

```text
B_q(y) = { H in C0 : q vec(H) = y }
```

For every nonempty bucket compute:

```text
raw_candidate_count
target_claim_class_count
target_claim_classes
```

Then freeze probe-level metrics:

```text
outcome_count
maximum_raw_bucket_size
minimum_raw_bucket_size
maximum_target_class_count_per_bucket
minimum_target_class_count_per_bucket
all_nonempty_buckets_target_pure
candidate_count_with_target_resolved
candidate_fraction_with_target_resolved
```

No probability distribution is assumed over candidates.

The candidate-fraction metric is an exhaustive finite-family coverage fraction only.

---

## 5. Raw-state selector

The raw-state selector minimizes:

```text
maximum_raw_bucket_size
```

Tie-break in frozen probe-library order:

```text
P_RAW
P_CLAIM
P_MIX
P_REDUNDANT
```

Expected geometry to be computed:

```text
P_RAW max raw bucket = 2
P_MIX max raw bucket = 2
P_CLAIM max raw bucket = 31
P_REDUNDANT max raw bucket = 62
```

Thus the preregistered tie-break predicts:

```text
RAW_SELECTOR -> P_RAW
```

This selector does not consult the target claim.

---

## 6. Claim-targeted selector

The claim-targeted selector minimizes lexicographically:

```text
1. maximum_target_class_count_per_bucket
2. maximum_raw_bucket_size
3. frozen probe-library order
```

A probe earns perfect target separation only if:

```text
all_nonempty_buckets_target_pure = true
```

Expected geometry to be computed:

```text
P_CLAIM -> every bucket contains exactly one conjugacy class
P_RAW   -> every bucket contains both conjugacy classes
P_MIX   -> every bucket contains both conjugacy classes
P_REDUNDANT -> one bucket contains both conjugacy classes
```

Therefore the preregistered target prediction is:

```text
CLAIM_SELECTOR -> P_CLAIM
```

---

## 7. Exhaustive no-oracle evaluation

No single oracle candidate is needed to establish the comparison.

For every candidate `H in C0`, evaluate the outcome that would be observed under each probe and then the resulting bucket.

Freeze per candidate:

```text
raw_selector_remaining_raw_count
raw_selector_remaining_target_class_count
claim_selector_remaining_raw_count
claim_selector_remaining_target_class_count
```

Required candidate-uniform relation:

```text
for all 62 candidates:
  raw selector leaves 2 raw candidates and 2 target classes
  claim selector leaves 31 raw candidates and 1 target class
```

If any candidate violates this, the uniform comparison fails.

---

## 8. Primary contradiction

A passing assay earns the bounded contradiction:

```text
THE_PROBE_THAT_MINIMIZES_WORST_CASE_RAW_AMBIGUITY_CAN_FAIL_TO_RESOLVE_THE_TARGET_CLAIM
```

while:

```text
A_PROBE_THAT_LEAVES_MORE_RAW_STATES_ALIVE_CAN_RESOLVE_THE_PREDECLARED_TARGET_CLAIM_FOR_EVERY_COMPATIBLE_CANDIDATE
```

The comparison remains conditional on the authored candidate universe, probe library, exact clean observation law, and target claim.

---

## 9. Falsifiers

The chamber fails or materially weakens if any occur:

1. `C0` contains other than 62 candidates;
2. any candidate is singular;
3. `C5` or `C7` spans more than one conjugacy fingerprint;
4. `C5` and `C7` accidentally share a fingerprint;
5. any probe returns more than one scalar or receives extra budget;
6. P_RAW fails to attain the minimum maximum raw-bucket size;
7. P_CLAIM fails to make every nonempty bucket target-pure;
8. P_RAW resolves the target class for any candidate;
9. P_CLAIM uniquely identifies the raw matrix for any candidate;
10. the selector consults an oracle candidate before choosing a probe;
11. candidate-count reduction is mislabeled Shannon information;
12. this one finite design result is promoted into universal optimal experimental design.

---

## 10. Allowed bounded outcome

A full pass may earn:

```text
CLAIM_TARGETED_NEXT_MEASUREMENT_DESIGN_CAN_DIVERGE_FROM_RAW_STATE_AMBIGUITY_MINIMIZATION_IN_AUTHORED_HOLONOMY_COMPATIBLE_FAMILY
```

and:

```text
PEDAGOGUE_PROBE_SELECTION_CAN_BE_CONDITIONED_ON_THE_CLAIM_LICENSE_SOUGHT_WITHOUT_REQUIRING_FULL_RAW_RECONSTRUCTION_IN_THIS_SYNTHETIC_MODEL
```

This is the intended Pedagogue ↔ discrete-holonomy-tomography bridge.

It does not establish:

```text
universal experiment optimality
mutual-information optimality
Bayesian active learning
causal experimental design
live autonomous measurement authority
physical sensor design
physical holonomy
Proto-Loom authority
production authority
Vercel authority
```

---

## 11. Execution authority

Repository execution is limited to the frozen synthetic candidate universe.

The selector may compute and compare hypothetical probe outcomes exhaustively.

It receives no authority to trigger live measurements, external retrieval, browser actions, Ash runtime actions, or production changes.

𝌋

⟐