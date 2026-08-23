𝌋

# Open-Set Holonomy Probe-Design Assay v0.1

Status: **PREREGISTERED / PRE-IMPLEMENTATION / RESEARCH-ONLY**  
Technical identity: `td613.ash.open-set-holonomy-probe-design/v0.1`  
Parent holonomy-representation receipt commit: `8a472ff2beb2f125749f581614f2f4f88ddf906c`  
Prior open-set grammar source: `noisy-open-set-near-miss.js`  
Production mutation: **NONE**  
Vercel authority: **NONE**

---

## 0. Question

The path-groupoid assay earned two admitted loop operators in an authored finite graph fixture:

```text
H1 = [[3,5],[1,2]]
H2 = [[3,26],[2,28]]
```

A future reconstructor may nevertheless encounter a loop operator outside its admitted candidate family.

This assay asks:

> Under the same three-scalar observation budget, can probe design determine whether an out-of-family loop is forced to masquerade as an admitted loop or can instead be responsibly rejected as outside the model family?

Required anti-equivalence:

```text
OUTSIDE_ORACLE_TRUTH
!=
EARNED_OPEN_SET_REJECTION
```

Oracle knowledge may not override the observed criterion.

---

## 1. Candidate family and out-of-family oracle

Admitted candidate loop family:

```text
C = {H1,H2}
```

Freeze an out-of-family loop operator:

```text
H_U = [[3,5],[2,2]]
```

Predeclared checks:

```text
H_U != H1
H_U != H2
det(H_U) = 27 mod 31 != 0
```

The decoder never receives the label `H_U` or the fact that oracle truth lies outside `C`.

---

## 2. Matched three-scalar schedules

### Alias schedule P_ALIAS

```text
A1: x=[1,0], p=[1,0]  -> row [1,0,0,0]
A2: x=[0,1], p=[1,0]  -> row [0,1,0,0]
A3: x=[1,1], p=[1,0]  -> row [1,1,0,0]
```

Predeclared rank:

```text
rank = 2
```

Expected signatures:

```text
sig_ALIAS(H1) = [3,5,8]
sig_ALIAS(H2) = [3,26,29]
sig_ALIAS(H_U)= [3,5,8]
```

Thus the out-of-family oracle is observationally identical to `H1` inside this aperture.

Required open-set verdict:

```text
OPEN_SET_REJECTION_NOT_EARNED_ALIAS
```

The decoder may report `H1` as the unique admitted candidate consistent with the observed signature, but it may not claim unconditional truth identification or universal model validity.

### Diverse schedule P_DIVERSE

```text
D1: x=[1,0], p=[1,0]  -> row [1,0,0,0]
D2: x=[0,1], p=[1,0]  -> row [0,1,0,0]
D3: x=[1,0], p=[0,1]  -> row [0,0,1,0]
```

Predeclared rank:

```text
rank = 3
```

Expected signatures:

```text
sig_DIVERSE(H1) = [3,5,1]
sig_DIVERSE(H2) = [3,26,2]
sig_DIVERSE(H_U)= [3,5,2]
```

No admitted candidate matches the oracle signature.

Required verdict:

```text
OPEN_SET_REJECTION_EARNED_BY_DECLARED_PROJECTION_CRITERION
```

The result identifies model-family inadequacy inside the declared finite candidate family. It does not identify the true outside operator by name.

---

## 3. Matched-budget comparison

Both schedules use exactly:

```text
3 scalar observations
same oracle loop
same admitted candidate family
same exact-match criterion
same arithmetic field
```

They differ only in projection design.

Allowed relation if the predictions survive:

```text
OPEN_SET_MODEL_ADEQUACY_IS_PROJECTION_DEPENDENT_IN_AUTHORED_FINITE_FIXTURE
```

This means the ability to earn abstention can depend on which relations the observation aperture exposes.

---

## 4. In-family control

Use `H1` as oracle truth under `P_DIVERSE`.

Required result:

```text
surviving_candidate_set = [H1]
open_set_rejection_earned = false
classification = ADMITTED_H1_CONTROL_SURVIVES_EXACT_SIGNATURE_CRITERION
```

Failure to reject the admitted control is not universal validation of the model family.

---

## 5. Oracle-override firewall

For the alias case, the test harness knows that `H_U` lies outside the candidate family.

That fact may not mutate the observed criterion.

Required fields:

```text
oracle_truth_in_candidate_family = false
oracle_truth_exposed_to_decoder = false
oracle_override_applied = false
```

Even though the authored oracle is outside the model, the alias schedule must refuse open-set rejection because `H1` exactly matches the available evidence.

This preserves the prior A15-R0 open-set law:

```text
responsible abstention must be earned from admitted evidence criteria, not secret oracle knowledge
```

---

## 6. Falsifiers

The assay fails if any occur:

1. either schedule uses more or fewer than three scalar observations;
2. `P_ALIAS` does not rank 2;
3. `P_DIVERSE` does not rank 3;
4. the alias schedule distinguishes `H_U` from `H1` contrary to the frozen signature;
5. the diverse schedule admits either `H1` or `H2` for the `H_U` signature;
6. oracle outside-family knowledge forces rejection in the alias case;
7. the in-family `H1` control is rejected;
8. open-set rejection is promoted into identification of the unknown operator;
9. projection-dependent model adequacy is promoted into universal optimality of the diverse schedule.

---

## 7. Claim ceiling

A passing result may support only:

```text
OPEN_SET_MODEL_ADEQUACY_IS_PROJECTION_DEPENDENT_IN_AUTHORED_FINITE_LOOP_FIXTURE
```

and:

```text
OUT_OF_FAMILY_TRUTH_CAN_BE_INSEPARABLE_FROM_AN_ADMITTED_CANDIDATE_INSIDE_A_BLIND_OBSERVATION_APERTURE
```

No result establishes universal open-set recognition, learned anomaly detection, physical holonomy, curvature, statistical calibration, deployed robustness, Proto-Loom authority, production authority, or Vercel authority.

𝌋

⟐