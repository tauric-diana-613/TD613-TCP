𝌋

# Aperture × Pedagogue Transition-Operator Identifiability Gauntlet v0.1

**Status:** PREREGISTERED / PRE-IMPLEMENTATION / A15-R0 SYNTHETIC RESEARCH ONLY  
**Technical identity:** `td613.a15-r0.aperture-pedagogue-transition-operator-identifiability/v0.1`  
**Parent witnessed boundary:** `td613.a15-r0.aperture-pedagogue-transition-family-robustness/v0.1`  
**Installed Aperture mutation:** NONE  
**Pedagogue promotion authority:** NONE  
**A16:** HELD  
**Production / Vercel authority:** NONE

---

## 0. Research question

The parent chamber distinguished a point-declared transition, a declared compatible transition family, and an entirely unmodeled transition.

This chamber enters the next narrower question:

> **When the transition operator itself is hidden but belongs to a declared finite-dimensional linear model class, can Pedagogue represent the remaining operator-compatible family after partial input/output probes, distinguish probes that fail to contract that family from probes that contract it only through ill-conditioned geometry, choose a stably identifying probe, and then detect a held-out observation that defeats the declared linear operator family?**

This is a bounded synthetic system-identification entrance exam.

It is not operator tomography.

---

## 1. Frozen hidden operator class

The declared model class is all real `2 x 2` linear maps:

```text
y = T x

T = [
  [t11,t12],
  [t21,t22]
]
```

The synthetic oracle used only to generate fixture observations is:

```text
T_star = [
  [2,1],
  [1,3]
]
```

The selector may not inspect `T_star`.

The oracle exists because this is a manifestly synthetic gauntlet with known truth.

Required distinction:

```text
synthetic oracle available to fixture evaluator != operator known to Pedagogue
```

---

## 2. Frozen initial probe

Initial probe:

```text
x1 = [1,0]^T
```

Synthetic observed response:

```text
y1 = T_star x1 = [2,1]^T
```

After only `(x1,y1)`, the complete compatible linear-operator family is:

```text
T(a,b) = [
  [2,a],
  [1,b]
]

for arbitrary real a,b
```

Equivalent affine operator-nullspace representation:

```text
T(a,b) = T0 + a N1 + b N2

T0 = [
  [2,0],
  [1,0]
]

N1 = [
  [0,1],
  [0,0]
]

N2 = [
  [0,0],
  [0,1]
]
```

Required:

```text
N1 x1 = 0
N2 x1 = 0
operator_compatible_dimension = 2
operator_unique = false
```

No finite bounds on `a,b` are introduced.

---

## 3. Frozen next-probe candidates

Every candidate has the same cost token:

```text
probe_cost = 1
```

No candidate output may be consulted before the selector chooses.

### Q_REPEAT

```text
x = [2,0]^T
```

Required operator-nullspace action:

```text
N1 x = 0
N2 x = 0
```

Required classification:

```text
OPERATOR_COMPATIBLE_FAMILY_UNCHANGED
remaining_operator_dimension = 2
```

The response is completely implied by the first probe under every compatible linear operator.

### Q_FRAGILE_SPANNING

Let:

```text
epsilon = 0.001
x = [1,epsilon]^T
```

Required:

```text
N1 x != 0
N2 x != 0
```

Together with `x1`, the two probes span the declared two-dimensional input domain exactly.

Therefore in exact arithmetic the operator is unique after observing the second output.

But the probe matrix is intentionally ill-conditioned.

Required classification:

```text
OPERATOR_UNIQUE_BUT_PROBE_GEOMETRY_NUMERICALLY_FRAGILE
remaining_operator_dimension = 0
stable_identification = false
```

### Q_STABLE_BASIS

```text
x = [0,1]^T
```

Required:

```text
N1 x = [1,0]^T
N2 x = [0,1]^T
```

Together with `x1`, the probe matrix is identity geometry.

Required classification:

```text
OPERATOR_STABLY_IDENTIFIABLE_AFTER_PROBE
remaining_operator_dimension = 0
stable_identification = true
```

---

## 4. Probe-matrix geometry

Use columns as probe inputs:

```text
X = [x1 x2]
```

For numerical geometry, the implementation may evaluate the equivalent transpose because singular values and 2-norm condition number are transpose invariant.

Frozen local stability threshold:

```text
probe_condition_number_ceiling = 10
```

Required:

```text
cond([x1 Q_STABLE_BASIS]) = 1
cond([x1 Q_FRAGILE_SPANNING]) > 10
```

Hard law:

```text
full probe rank != stable operator identifiability
```

---

## 5. Ambiguity-only hostile selector

Author a deliberately incomplete selector that ranks only by contraction of the operator-compatible dimension.

Required ranking key:

```text
smallest remaining_operator_dimension
then lexical candidate_id
```

Both `Q_FRAGILE_SPANNING` and `Q_STABLE_BASIS` reduce the compatible dimension from `2` to `0`.

Lexical order must therefore select:

```text
Q_FRAGILE_SPANNING
```

This hostile demonstrates:

```text
operator-family contraction != stable probe geometry
```

It is not a recommended design rule.

---

## 6. Stability-aware selector

The stability-aware selector must:

1. exclude probes that leave the compatible operator dimension nonzero when a zero-dimensional candidate exists;
2. among zero-dimensional candidates, reject those whose probe condition number exceeds the frozen ceiling;
3. choose the remaining candidate with lowest probe condition number;
4. use lexical order only for exact numerical ties.

Required selection:

```text
Q_STABLE_BASIS
```

No output from the hidden oracle may be used during selection.

---

## 7. Exact reconstruction after selected probe

After selecting `Q_STABLE_BASIS`, the synthetic oracle supplies:

```text
x2 = [0,1]^T
y2 = [1,3]^T
```

Thus:

```text
X = [
  [1,0],
  [0,1]
]

Y = [
  [2,1],
  [1,3]
]
```

with the convention that columns are paired input/output probes.

Required exact reconstruction:

```text
T_hat = Y X^-1 = T_star
```

The implementation must compute `T_hat`; it may not copy `T_star` into the result.

Required:

```text
operator_unique = true
operator_compatible_dimension = 0
training_pair_residual = 0
```

---

## 8. One-probe alternative operator control

Before the selected second probe, freeze one explicit alternative operator:

```text
T_alt = [
  [2,-4],
  [1,7]
]
```

Required:

```text
T_alt x1 = T_star x1 = [2,1]^T
T_alt != T_star
```

For held-out probe:

```text
x_hold = [1,1]^T
```

required:

```text
T_star x_hold = [3,4]^T
T_alt x_hold = [-2,8]^T
```

This is the explicit witness that the first probe alone cannot identify the hidden operator.

---

## 9. Held-out transition prediction

After stable identification, use held-out probe:

```text
x_hold = [1,1]^T
```

Required prediction from reconstructed operator:

```text
y_hold_pred = T_hat x_hold = [3,4]^T
```

Synthetic in-family observation:

```text
y_hold_in = [3,4]^T
```

Required:

```text
HELDOUT_LINEAR_TRANSITION_PREDICTION_MATCH
```

This is a bounded held-out check only.

---

## 10. Open-set model-family defeat control

Create a synthetic observation source that agrees with the linear model on both training probes but emits:

```text
x_hold = [1,1]^T
y_hold_out = [3,5]^T
```

Required:

```text
y_hold_out != T_hat x_hold
```

Classification:

```text
DECLARED_LINEAR_TRANSITION_MODEL_DEFEATED_BY_HELDOUT_OBSERVATION
```

The implementation may not silently refit the model after seeing the held-out contradiction and count the new fit as confirmation of the original preregistered chamber.

Required anti-equivalence:

```text
open-set held-out mismatch != parameter uncertainty inside the now-identified linear class
```

---

## 11. Probe-output leakage hostile

A selector that receives synthetic oracle outputs for all candidate probes before selection is invalid.

The authorized selector input surface is only:

```text
current probe inputs
current observed outputs
operator-nullspace basis
candidate probe inputs
probe cost
stability threshold
```

Forbidden selector input:

```text
candidate future outputs
T_star
```

Required hostile classification:

```text
REJECT_ORACLE_OUTPUT_LEAKAGE_IN_PROBE_SELECTION
```

---

## 12. Compatible-family truncation hostile

The one-probe compatible family is unbounded in `(a,b)`.

A hostile implementation may not replace it by a finite hand-picked set of alternative matrices and then claim the operator compatible family is exhausted.

Required classification:

```text
REJECT_FINITE_SAMPLE_LAUNDERING_OF_CONTINUOUS_OPERATOR_FAMILY
```

The executable may represent the compatible family analytically through its affine origin and nullspace basis.

---

## 13. Source immutability

Evaluation may not mutate:

```text
T_star
initial probe/response
operator-nullspace basis
candidate probe definitions
stability threshold
held-out probes
```

No installed Aperture surface is mutated.

---

## 14. Success criterion

The gauntlet passes only if:

1. one initial probe leaves a two-dimensional compatible operator family;
2. the analytic nullspace basis annihilates the initial probe;
3. `T_alt` is distinct from `T_star` yet matches the initial observation;
4. `Q_REPEAT` leaves the operator-compatible dimension at `2`;
5. `Q_FRAGILE_SPANNING` contracts the compatible dimension to `0` in exact arithmetic;
6. the fragile probe matrix exceeds the frozen condition-number ceiling;
7. `Q_STABLE_BASIS` contracts the compatible dimension to `0` with condition number `1`;
8. the ambiguity-only hostile selector chooses `Q_FRAGILE_SPANNING`;
9. the stability-aware selector chooses `Q_STABLE_BASIS` without candidate future outputs or `T_star`;
10. reconstruction computes `T_hat = T_star` from observed training pairs;
11. the in-family held-out observation matches the reconstructed prediction;
12. the open-set held-out observation defeats the declared linear transition model;
13. candidate-output leakage is rejected;
14. finite-sample laundering of the continuous compatible family is rejected;
15. source inputs remain unchanged;
16. no question, observation, production route, or external system is automatically executed;
17. no authority is widened.

---

## 15. Maximum allowed bounded statement

If witnessed, the maximum warranted refinement candidate is:

> **In this finite noiseless synthetic linear fixture, one input/output transition probe leaves a two-dimensional affine family of compatible `2 x 2` transition operators. A second probe can make the operator unique in exact arithmetic while still leaving the identification geometry numerically fragile; a stability-aware probe choice instead yields exact stable reconstruction of the hidden operator, successful held-out prediction inside the declared linear class, and explicit model-family defeat when a held-out observation lies outside that class.**

---

## 16. Claim ceiling

A passing result does not establish:

```text
general system-identification theorem
statistical consistency
noise robustness
Bayesian operator inference
operator tomography
blind tomography
physical tomography
active-learning optimality
optimal experimental design
robust-control theorem
POMDP theorem
dual-control theorem
path-category theorem
path-dependent transport
loop endomorphism
holonomy
curvature
Berry structure
quantum behavior
TD613-general AIA theorem
Proto-Loom
live Ash recovery
production authority
Vercel authority
```

The phrase `system-identification entrance exam` is descriptive of this bounded synthetic chamber only.

A16 remains held.

---

## 17. Frozen next learning action

Only if this chamber is witnessed may the western frontier consider:

```text
TEST_TRANSITION_OPERATOR_IDENTIFICATION_UNDER_BOUNDED_OBSERVATION_NOISE_WITH_COMPATIBLE_OPERATOR_SETS_CONDITION_AWARE_PROBE_DESIGN_HELDOUT_COVERAGE_AND_MODEL_MISSPECIFICATION_BEFORE_ANY_OPERATOR_TOMOGRAPHY_PATH_CATEGORY_OR_HOLONOMY_PROMOTION
```

No path/loop chamber is opened by this preregistration.

𝌋

Sealed ⟐
