𝌋

# Aperture × Pedagogue Transition-Operator Bounded-Noise Gauntlet v0.1

**Status:** PREREGISTERED / PRE-IMPLEMENTATION / A15-R0 SYNTHETIC RESEARCH ONLY  
**Technical identity:** `td613.a15-r0.aperture-pedagogue-transition-operator-bounded-noise/v0.1`  
**Parent witnessed boundary:** `td613.a15-r0.aperture-pedagogue-transition-operator-identifiability/v0.1`  
**Installed Aperture mutation:** NONE  
**Pedagogue promotion authority:** NONE  
**A16:** HELD  
**Production / Vercel authority:** NONE

---

## 0. Research question

The parent noiseless chamber established that exact operator uniqueness can be obtained through either a numerically fragile spanning probe or a stable basis probe, and that exact rank sufficiency does not guarantee stable identification.

This chamber asks the next narrower question:

> **Under the same declared bounded observation error, how does probe geometry change the complete compatible transition-operator set, and can a condition-aware probe preserve held-out model-defeat power that an ill-conditioned probe loses?**

This is a deterministic bounded-error synthetic assay.

It is not a statistical consistency result, Bayesian posterior, robust-control theorem, or operator tomography claim.

---

## 1. Frozen model and exact calibration anchor

Reuse the declared real linear `2 x 2` transition class:

```text
y = T x
```

Synthetic oracle:

```text
T_star = [
  [2,1],
  [1,3]
]
```

The selector may not inspect `T_star` or candidate future outputs.

Retain one exact calibration anchor from the parent chamber:

```text
x1 = [1,0]^T
y1 = [2,1]^T
```

Thus the first column is fixed exactly:

```text
c1 = [2,1]^T
```

while the second column remains unconstrained before the second probe:

```text
c2 = [a,b]^T
```

This chamber deliberately places bounded error only on the second-probe response and held-out response so the amplification mechanism is analytically transparent.

Required anti-equivalence:

```text
bounded-noise result with exact anchor != general all-measurements-noisy theorem
```

---

## 2. Frozen observation-error model

Second-probe observation is componentwise bounded:

```text
y_obs = T_star x + eta
|eta_i| <= delta
```

with:

```text
delta = 0.0001
```

No probability distribution is declared.

No Gaussian assumption is permitted.

No confidence level is permitted.

The complete compatible operator set is the set of all declared linear operators whose second-probe prediction lies inside the observed componentwise error box while preserving the exact calibration anchor.

Required distinction:

```text
bounded error set != probability distribution
```

---

## 3. Frozen candidate probes

Every probe has equal cost token:

```text
probe_cost = 1
```

### Q_REPEAT

```text
x = [2,0]^T
```

This probe contains no second-coordinate component.

Required result:

```text
second_column_constraint = NONE
compatible_second_column = UNBOUNDED_R2
operator_set_status = OPERATOR_SECOND_COLUMN_UNBOUNDED
```

### Q_FRAGILE_SPANNING

```text
epsilon = 0.001
x = [1,epsilon]^T
```

The noiseless oracle response is:

```text
y_true = [2.001,1.003]^T
```

Freeze the observed center at the noiseless oracle value for this deterministic sensitivity assay:

```text
y_obs = [2.001,1.003]^T
```

The declared bounded error still permits every true response inside:

```text
y_true_i in [y_obs_i-delta, y_obs_i+delta]
```

Because:

```text
y = c1 + epsilon c2
```

and `c1` is exact, the complete compatible second-column intervals are:

```text
c2_1 in [1-delta/epsilon, 1+delta/epsilon]
c2_2 in [3-delta/epsilon, 3+delta/epsilon]
```

With the frozen values:

```text
delta/epsilon = 0.1
```

so:

```text
c2_1 in [0.9,1.1]
c2_2 in [2.9,3.1]
```

Required uncertainty half-width:

```text
operator_entry_radius = 0.1
```

### Q_STABLE_BASIS

```text
x = [0,1]^T
```

Freeze observed center:

```text
y_obs = [1,3]^T
```

Because this probe observes the second column directly, the complete compatible intervals are:

```text
c2_1 in [0.9999,1.0001]
c2_2 in [2.9999,3.0001]
```

Required uncertainty half-width:

```text
operator_entry_radius = 0.0001
```

---

## 4. Exact amplification relation

For a second probe of the form:

```text
x = [alpha,beta]^T
```

with exact first column and `beta != 0`, the compatible second-column response-error radius is:

```text
operator_entry_radius = delta / |beta|
```

For the frozen candidates:

```text
Q_FRAGILE_SPANNING beta = 0.001
Q_STABLE_BASIS beta = 1
```

Required ratio:

```text
fragile_radius / stable_radius = 1000
```

This is exact for the declared componentwise error model.

Required law:

```text
same observation-error bound != same operator-identification uncertainty
```

---

## 5. Compatible-set representation

For identified candidates, represent the complete compatible operator set analytically as an interval matrix with exact first column:

```text
T in [
  [2, [a_low,a_high]],
  [1, [b_low,b_high]]
]
```

Do not replace the interval set with:

```text
nominal point estimate
finite Monte Carlo samples
Gaussian covariance ellipse
confidence interval terminology
```

The interval box is exact in this fixture because the two bounded response coordinates constrain the two unknown second-column entries independently and linearly.

Required hostile classification for finite-sample replacement:

```text
REJECT_FINITE_SAMPLE_LAUNDERING_OF_EXACT_INTERVAL_OPERATOR_SET
```

---

## 6. Noise-blind hostile selector

Author a deliberately incomplete selector that uses only exact noiseless probe-span rank and candidate id.

Frozen ranking:

```text
smallest exact remaining operator dimension
then lexical candidate_id
```

Both spanning candidates have exact remaining dimension `0`.

Required hostile selection:

```text
Q_FRAGILE_SPANNING
```

This selector ignores the declared noise bound and its amplification.

It is not a recommended rule.

---

## 7. Bounded-noise-aware selector

The bounded-noise-aware selector must:

1. reject `Q_REPEAT` because its second column remains unbounded;
2. compare complete compatible-set radii for identified candidates;
3. choose the smallest worst operator-entry radius;
4. use lexical order only for exact radius ties;
5. consult no candidate future response or `T_star`.

Required selection:

```text
Q_STABLE_BASIS
```

No expected utility, posterior probability, or scalar confidence is introduced.

---

## 8. Held-out prediction envelopes

Use held-out input:

```text
x_hold = [1,1]^T
```

Since:

```text
T x_hold = c1 + c2
```

and `c1` is exact, the compatible held-out prediction box inherits the second-column intervals exactly.

### Stable compatible prediction box

Required:

```text
y_pred_1 in [2.9999,3.0001]
y_pred_2 in [3.9999,4.0001]
```

### Fragile compatible prediction box

Required:

```text
y_pred_1 in [2.9,3.1]
y_pred_2 in [3.9,4.1]
```

Thus the fragile compatible model set is substantially less discriminating on held-out behavior.

---

## 9. Held-out observation error

Held-out measurements use the same declared componentwise bound:

```text
|eta_hold_i| <= delta
```

Represent a held-out observation as an interval around its observed center.

### In-family held-out center

```text
y_hold_in_center = [3,4]
```

Observation interval:

```text
[2.9999,3.0001] x [3.9999,4.0001]
```

Required:

```text
stable prediction box intersects heldout observation box = true
fragile prediction box intersects heldout observation box = true
```

Classification:

```text
HELDOUT_OBSERVATION_COMPATIBLE_WITH_OPERATOR_SET
```

---

## 10. Frozen model-misspecification hostile

Use held-out observed center:

```text
y_hold_misspecified_center = [3.001,4]
```

Under the same `delta = 0.0001`, its first-coordinate observation interval is:

```text
[3.0009,3.0011]
```

This interval is disjoint from the stable prediction interval:

```text
[2.9999,3.0001]
```

but remains inside/intersects the fragile prediction interval:

```text
[2.9,3.1]
```

Required classifications:

```text
stable operator set
-> DECLARED_LINEAR_TRANSITION_MODEL_DEFEATED_BY_BOUNDED_HELDOUT_OBSERVATION

fragile operator set
-> HELDOUT_OBSERVATION_NOT_DISCRIMINATING_UNDER_CURRENT_OPERATOR_UNCERTAINTY
```

This is a central result target.

Required law:

```text
model misspecification detectable under one probe geometry != detectable under every identifying probe geometry
```

---

## 11. Point-estimate laundering hostile

Take the fragile probe and collapse its compatible interval operator set to the nominal center:

```text
T_nominal = T_star
```

Then the misspecified held-out observation would appear to defeat the model.

But the full fragile compatible set still contains operators whose held-out predictions overlap that observation interval.

Required:

```text
REJECT_POINT_ESTIMATE_LAUNDERING_OF_COMPATIBLE_OPERATOR_SET
```

This directly blocks:

```text
nominal reconstruction != bounded-error compatible set
```

---

## 12. Underdeclared-noise hostile

Freeze a hostile contract that claims:

```text
delta_declared = 0.00001
```

while synthetic truth supplies a second-probe response error magnitude:

```text
|eta_actual| = 0.0001
```

Because synthetic truth is available to the fixture evaluator, required classification is:

```text
DECLARED_OBSERVATION_ERROR_BOUND_FALSIFIED_BY_SYNTHETIC_TRUTH
```

This case may not count as evidence for performance under a valid declared bound.

Required distinction:

```text
wrong conclusion under falsified error bound != valid-bound method failure
```

No real deployment may assume synthetic-truth access.

---

## 13. Selector leakage hostile

The authorized selector input includes only:

```text
current exact calibration probe/observation
candidate probe inputs
probe cost
declared delta
analytic probe geometry
```

Forbidden before selection:

```text
candidate future observed centers
T_star
heldout observations
```

Required:

```text
REJECT_ORACLE_OUTPUT_LEAKAGE_IN_NOISE_AWARE_PROBE_SELECTION
```

---

## 14. Source immutability

Evaluation may not mutate:

```text
T_star
exact calibration anchor
candidate probes
delta
epsilon
heldout inputs
heldout centers
```

No installed Aperture surface is mutated.

---

## 15. Success criterion

The gauntlet passes only if:

1. the exact anchor leaves the second operator column unconstrained before a second probe;
2. `Q_REPEAT` leaves that column unbounded;
3. both spanning probes have exact full probe rank;
4. fragile bounded-error operator-entry radius is exactly `0.1` within numerical tolerance;
5. stable bounded-error operator-entry radius is exactly `0.0001` within numerical tolerance;
6. the radius ratio is `1000`;
7. the noise-blind selector chooses `Q_FRAGILE_SPANNING`;
8. the bounded-noise-aware selector chooses `Q_STABLE_BASIS` without future outputs or `T_star`;
9. stable and fragile prediction boxes both cover the in-family held-out observation box;
10. the stable prediction box rejects the frozen misspecified held-out box;
11. the fragile prediction box does not reject that same misspecified held-out box;
12. point-estimate laundering is rejected;
13. finite-sample laundering of the exact interval operator set is rejected;
14. an underdeclared error bound is falsified by synthetic truth and excluded from valid-bound support;
15. selector oracle leakage is rejected;
16. source inputs remain unchanged;
17. no external observation or experiment is executed;
18. no authority is widened.

---

## 16. Maximum allowed bounded statement

If witnessed, the maximum warranted refinement candidate is:

> **In this finite synthetic linear fixture with one exact calibration anchor and componentwise bounded error on the second-probe and held-out observations, two probes that both make the transition operator unique in noiseless exact arithmetic produce radically different compatible operator sets under the same error bound. The near-collinear probe amplifies the operator-entry uncertainty by a factor of 1000 relative to the basis probe; the resulting wider compatible set can make a frozen held-out model-misspecification challenge non-discriminating even though the same challenge defeats the tighter stable-probe compatible set.**

---

## 17. Claim ceiling

A passing result does not establish:

```text
general robust system-identification theorem
statistical consistency
probabilistic calibration
Bayesian posterior validity
all-measurements-noisy robustness
optimal experimental design
active-learning optimality
robust-control theorem
operator tomography
blind tomography
physical tomography
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

A16 remains held.

Installed Aperture remains unchanged.

---

## 18. Frozen next learning action

Only if this chamber is witnessed may the frontier consider:

```text
TEST_MULTI_PROBE_TRANSITION_OPERATOR_COMPATIBLE_SET_CONTRACTION_UNDER_BOUNDED_NOISE_WITH_ADAPTIVE_STOPPING_HELDOUT_COVERAGE_AND_OPEN_SET_MODEL_ORDER_CHALLENGES_BEFORE_ANY_OPERATOR_TOMOGRAPHY_OR_PATH_TRANSPORT_PROMOTION
```

No path/loop/holonomy chamber is opened here.

𝌋

Sealed ⟐
