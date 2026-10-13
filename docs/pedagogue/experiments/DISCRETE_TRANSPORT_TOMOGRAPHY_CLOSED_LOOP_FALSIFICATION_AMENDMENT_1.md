𝌋

# Discrete Transport Tomography · Closed-Loop Falsification Assay v0.1
## Amendment 1 · Held-Out-Blind Nullspace Hardening

Status: **PREREGISTERED AMENDMENT / PRE-EXECUTION FOR AMENDED CONTROL / RESEARCH-ONLY**  
Parent specification: `DISCRETE_TRANSPORT_TOMOGRAPHY_CLOSED_LOOP_FALSIFICATION_SPEC_V0_1.md`  
Parent spec commit: `d9cff3a1c6969be28af28c90f7aef85e4200fc70`  
Development implementation commit before amendment: `00495b3f59bf9b6c0de1a5c822338c8e3a78cf8b`  
Production mutation: **NONE**  
Vercel authority: **NONE**

---

## 0. Why this amendment exists

After the parent specification was frozen and before any final scientific receipt was authored, adversarial review found a defect in the original `P_BLIND` control.

The original rank-3 schedule omitted one primary inverse direction corresponding to `t22`, but the common held-out probe had coefficient row:

```text
h = [2,4,1,2]
```

and therefore had nonzero overlap with the original null direction:

```text
n_original = [0,0,0,1]
h · n_original = 2 mod 31
```

Consequently, if the held-out observation were treated as available evidence rather than strictly quarantined validation, the combined observation set could resolve the missing direction.

The original control remains valid only for the narrower statement:

```text
THE_PRIMARY_FOUR_PROBE_SCHEDULE_IS_RANK_DEFICIENT
```

It is **not** sufficient for the stronger statement:

```text
THE_LOOP_REMAINS_UNIDENTIFIED_AFTER_THE_COMMON_HELDOUT_OBSERVATION
```

The original blind result is therefore classified:

```text
P_BLIND_ORIGINAL = DEVELOPMENT_ONLY_HELDOUT_LEAKY_CONTROL
```

No final receipt may use it to claim held-out-persistent loop nonidentifiability.

---

## 1. Hardened blind schedule

Freeze the replacement schedule `P_BLIND_HARD`:

```text
BH1: x=[0,1], p=[0,1]
BH2: x=[0,1], p=[1,0]
BH3: x=[0,1], p=[1,1]
BH4: x=[1,0], p=[2,1]
```

Its coefficient rows are:

```text
[0,0,0,1]
[0,1,0,0]
[0,1,0,1]
[2,0,1,0]
```

Predeclared exact structure:

```text
rank = 3
nullity = 1
```

A frozen null vector is:

```text
n_hard = [15,0,1,0]^T
```

because every hardened blind row annihilates `n_hard` modulo 31.

The common held-out coefficient row remains unchanged:

```text
h = [2,4,1,2]
```

and now:

```text
h · n_hard
= 2*15 + 4*0 + 1*1 + 2*0
= 31
= 0 mod 31
```

Therefore the held-out probe is also blind to the declared null direction.

This property must be computed by the implementation rather than asserted from the prose alone.

---

## 2. Frozen compatible operators

The positive authored edge remains:

```text
T_AB^(0) = [[1,1],[0,1]]
vec(T_AB^(0)) = [1,1,0,1]^T
```

Materialize a second candidate by adding the null vector:

```text
T_AB^(1) = vec^-1(vec(T_AB^(0)) + n_hard)
         = [[16,1],[1,1]] mod 31
```

Predeclared checks:

```text
both candidates invertible = true
both candidates produce identical P_BLIND_HARD observations = true
both candidates produce identical P_HOLD observation = true
```

The held-out observation itself must not resolve the compatible family.

---

## 3. Frozen loop divergence prediction

Use the same positively reconstructed other edges:

```text
T_BC = [[1,0],[1,1]]
T_CA = [[1,2],[0,1]]
```

Then the two compatible `AB` candidates are predicted to produce distinct loop operators:

```text
H^(0) = T_CA T_BC T_AB^(0)
      = [[3,5],[1,2]]

H^(1) = T_CA T_BC T_AB^(1)
      = [[19,5],[17,2]]
```

The implementation must recompute these products independently.

If both primary and held-out observations remain identical while the compatible loop operators differ, the earned classification is:

```text
CLOSED_LOOP_TRANSPORT_UNIDENTIFIED_AFTER_HELDOUT_BLIND_NULLSPACE_CONTROL
```

---

## 4. Strengthened falsifiers

The amended control fails if any occur:

1. `P_BLIND_HARD` rank differs from 3.
2. `n_hard` is not annihilated by every hardened blind row.
3. the common held-out row does not annihilate `n_hard`.
4. either frozen compatible operator is singular.
5. the two operators differ in primary blind observations.
6. the two operators differ in held-out observation.
7. the two compatible operators produce the same loop operator.
8. the instrument emits a unique loop operator from the common evidence surface.
9. the original leaky blind control is silently substituted for the hardened control in the final receipt.

---

## 5. Claim ceiling correction

Only the hardened control may support:

```text
PROJECTION_NULLSPACE_CAN_PERSIST_THROUGH_A_COMMON_HELDOUT_VALIDATOR_AND_LEAVE_CLOSED_LOOP_TRANSPORT_UNIDENTIFIED
```

Even a passing result does not establish:

```text
unknown real-world transport
physical tomography
physical connection
physical curvature
physical holonomy
```

It establishes only an exact identifiability fact in the authored finite fixture.

The defect was discovered before final receipt freeze. The amendment preserves that provenance rather than rewriting the original preregistration.

𝌋

⟐