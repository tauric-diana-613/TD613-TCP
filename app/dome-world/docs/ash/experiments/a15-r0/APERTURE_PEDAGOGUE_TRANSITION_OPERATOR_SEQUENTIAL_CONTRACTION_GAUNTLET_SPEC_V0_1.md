𝌋

# Aperture × Pedagogue Sequential Compatible-Set Contraction Gauntlet v0.1

**Status:** PREREGISTERED / PRE-IMPLEMENTATION / A15-R0 SYNTHETIC RESEARCH ONLY  
**Technical identity:** `td613.a15-r0.aperture-pedagogue-transition-operator-sequential-contraction/v0.1`  
**Parent witnessed boundary:** `td613.a15-r0.aperture-pedagogue-transition-operator-bounded-noise/v0.1`  
**Parent receipt head:** `1c004f9ba8adbb55317fe96e7f42f1a98a977fa2`  
**Installed Aperture mutation:** NONE  
**Pedagogue promotion authority:** NONE  
**A16:** HELD  
**Production / Vercel authority:** NONE

---

## 0. Research question

The parent chamber established that, under one exact calibration anchor and one bounded-error second probe, exact algebraic identifiability can coexist with radically different complete compatible operator uncertainty, and that this difference can change held-out model-falsification power.

The next narrower question is sequential:

> **Can Pedagogue maintain the complete deterministic compatible transition-operator set across multiple scalar probes, distinguish claim-sufficient stopping from full operator identification, refuse redundant measurements that add no compatible-set contraction, preserve declared held-out coverage, and defeat a context-dependent open-set source that agrees on the acquired probes but cannot be represented by any remaining declared linear operator?**

This chamber is a bounded sequential system-identification assay.

It is not operator tomography.

It is not optimal experimental design.

It is not active-learning optimality.

It is not a posterior inference procedure.

---

## 1. Frozen operator parameterization

Reuse the exact calibration anchor from the parent chamber:

```text
x_cal = [1,0]^T
y_cal = [2,1]^T
```

Therefore the first transition-operator column remains exact:

```text
c1 = [2,1]^T
```

Parameterize the unknown second column by:

```text
theta = [theta1,theta2]^T
```

so every declared operator has form:

```text
T(theta) = [
  [2, theta1],
  [1, theta2]
]
```

Freeze a deterministic declared parameter support:

```text
theta1 in [0,2]
theta2 in [2,4]
```

This is an admissible bounded model-support set.

It is not a probability prior.

Synthetic truth used only by the fixture evaluator:

```text
theta_star = [1,3]
T_star = [[2,1],[1,3]]
```

Selector access to `theta_star` or `T_star` is forbidden.

Required law:

```text
declared bounded parameter support != probability prior
```

---

## 2. Complete compatible-set representation

Represent the complete current compatible `theta` set as a convex polygon in the `theta1 x theta2` plane.

Initial polygon:

```text
P0 = rectangle with vertices
[0,2]
[2,2]
[2,4]
[0,4]
```

Required initial area:

```text
area(P0) = 4
```

Every admitted scalar observation contributes a closed strip constraint. Update the compatible polygon by exact deterministic half-plane clipping of the current polygon against both strip boundaries.

The implementation may use ordinary finite-precision arithmetic with a declared comparison tolerance, but it must represent the entire clipped polygon—not Monte Carlo samples, a point estimate, a covariance ellipse, or a posterior summary.

Required refusals:

```text
POINT_ESTIMATE != COMPLETE_COMPATIBLE_POLYGON
FINITE_SAMPLES != COMPLETE_COMPATIBLE_POLYGON
POSTERIOR_CREDIBLE_REGION != DECLARED_DETERMINISTIC_COMPATIBLE_SET
```

---

## 3. Scalar probe grammar

A probe consists of:

```text
input x = [alpha,beta]^T
readout r = [r1,r2]^T
probe_cost = 1
```

The scalar observation model is:

```text
z_obs = r^T T(theta) x + e
|e| <= delta
```

Freeze:

```text
delta = 0.1
```

Because `c1` is exact:

```text
r^T T(theta) x
= alpha * r^T c1 + beta * r^T theta
```

For `beta != 0`, an observation center `z_obs` induces the complete strip:

```text
(z_obs - alpha*r^T c1 - delta) / beta
<= r^T theta <=
(z_obs - alpha*r^T c1 + delta) / beta
```

with inequality orientation normalized if `beta < 0`.

For `beta = 0`, the observation contains no information about `theta`; it may test consistency with the exact first column but cannot contract the `theta` polygon.

No probability distribution is declared for `e`.

---

## 4. Frozen claim functionals

Define two scalar operator claims:

```text
F_TARGET(theta) = theta1 + theta2
F_GUARD(theta)  = theta1 - theta2
```

For any compatible polygon `P`, define exact vertex-attained linear-functional intervals:

```text
I_TARGET(P) = [min_P F_TARGET, max_P F_TARGET]
I_GUARD(P)  = [min_P F_GUARD,  max_P F_GUARD]
```

and widths:

```text
W_TARGET(P) = max - min
W_GUARD(P)  = max - min
```

Freeze claim-sufficiency width threshold:

```text
claim_width_ceiling = 0.25
```

A claim is locally sufficient only when its complete compatible-set interval width is at most `0.25`.

This is a local deterministic fixture threshold.

It is not a confidence level.

Required law:

```text
small compatible-set functional width != probabilistic confidence
```

---

## 5. Frozen probe candidates

Every candidate has equal cost token `1`.

### P_TARGET

```text
x = [0,1]
r = [1,1]
claim_alignment = TARGET
```

Synthetic oracle observation center after selection:

```text
z = 4
```

Required strip:

```text
3.9 <= theta1 + theta2 <= 4.1
```

### P_GUARD

```text
x = [0,1]
r = [1,-1]
claim_alignment = GUARD
```

Synthetic oracle observation center after selection:

```text
z = -2
```

Required strip:

```text
-2.1 <= theta1 - theta2 <= -1.9
```

### P_TARGET_DUPLICATE

```text
x = [0,1]
r = [1,1]
claim_alignment = TARGET
```

Synthetic oracle observation center:

```text
z = 4
```

This creates exactly the same bounded strip as `P_TARGET`.

After `P_TARGET` has already been admitted, applying `P_TARGET_DUPLICATE` must produce:

```text
polygon_area_contraction = 0
TARGET width contraction = 0
GUARD width contraction = 0
REDUNDANT_BOUNDED_STRIP_NO_NEW_COMPATIBLE_SET_INFORMATION
```

### P_NO_THETA_INFORMATION

```text
x = [1,0]
r = [1,0]
claim_alignment = NONE
```

Synthetic oracle observation center:

```text
z = 2
```

Because `beta = 0`, this probe may verify consistency with the exact calibration column but cannot contract `theta`.

Required:

```text
NO_THETA_CONTRACTION
```

---

## 6. Frozen polygon geometry

### Initial support

Required:

```text
area(P0) = 4
I_TARGET(P0) = [2,6]
W_TARGET(P0) = 4
I_GUARD(P0) = [-4,0]
W_GUARD(P0) = 4
```

### After P_TARGET

Let:

```text
P1 = P0 intersect {3.9 <= theta1+theta2 <= 4.1}
```

Required polygon area:

```text
area(P1) = 0.39
```

Required claim intervals:

```text
I_TARGET(P1) = [3.9,4.1]
W_TARGET(P1) = 0.2

I_GUARD(P1) = [-4,0]
W_GUARD(P1) = 4
```

Thus:

```text
TARGET claim = sufficient
GUARD claim = unresolved
operator polygon = nonpoint
```

### After P_TARGET + P_GUARD

Let:

```text
P2 = P1 intersect {-2.1 <= theta1-theta2 <= -1.9}
```

Required:

```text
area(P2) = 0.02
I_TARGET(P2) = [3.9,4.1]
W_TARGET(P2) = 0.2
I_GUARD(P2) = [-2.1,-1.9]
W_GUARD(P2) = 0.2
```

The polygon must remain nonempty and nonpoint.

Required operator-entry intervals implied by `P2`:

```text
theta1 in [0.9,1.1]
theta2 in [2.9,3.1]
```

This establishes the target distinction:

```text
claim-sufficient stopping != full raw operator identification
```

---

## 7. Claim-conditioned stopping modes

Freeze two declared observation goals.

### GOAL_TARGET_ONLY

Required claims:

```text
TARGET
```

Starting at `P0`, select and admit `P_TARGET`.

At `P1`:

```text
W_TARGET = 0.2 <= 0.25
```

Required stopping status:

```text
CLAIM_SUFFICIENT_STOP_WITH_NONPOINT_OPERATOR_SET
```

No guard probe is required under this declared goal.

### GOAL_TARGET_AND_GUARD

Required claims:

```text
TARGET
GUARD
```

Starting at `P0`, the local selector must choose `P_TARGET` under the frozen tie rule in Section 8.

At `P1`:

```text
TARGET sufficient
GUARD unresolved
```

Required next selection:

```text
P_GUARD
```

At `P2`, both declared claims satisfy the width threshold.

Required stopping status:

```text
DECLARED_CLAIM_SET_SUFFICIENT_STOP_WITH_NONPOINT_OPERATOR_SET
```

The implementation may not continue probing merely because the polygon has nonzero area.

Required law:

```text
nonpoint operator-compatible set != mandatory continued probing
```

---

## 8. Local selector rule

This chamber does not claim a globally optimal measurement policy.

The selector receives only:

```text
current compatible polygon
candidate probe metadata {candidate_id,x,r,probe_cost,claim_alignment}
declared delta
declared goal
claim-width threshold
frozen claim-priority list [TARGET,GUARD]
```

The selector must not receive:

```text
theta_star
T_star
candidate future observations
candidate observed centers
heldout observations
open-set source outputs
```

Selection logic:

1. identify declared goal claims whose current widths exceed the ceiling;
2. among unresolved claims, choose the one with largest normalized excess width;
3. use frozen priority `[TARGET,GUARD]` for an exact tie;
4. among candidates aligned to that claim, prefer nonzero `|beta|`;
5. prefer smaller guaranteed observation-strip half-width `delta/|beta|`;
6. lexical candidate id only for any remaining exact tie;
7. return `STOP` when every claim in the declared goal is sufficient.

This is a deterministic local fixture policy.

It is not optimal experimental design, adaptive-submodularity, Bayesian experimental design, dual control, or active-learning optimality.

Required first two selections under `GOAL_TARGET_AND_GUARD`:

```text
P0 -> P_TARGET
P1 -> P_GUARD
```

`P_TARGET_DUPLICATE` must not be selected after TARGET is already sufficient while GUARD remains unresolved.

---

## 9. Redundancy hostile

After reaching `P1`, deliberately apply `P_TARGET_DUPLICATE` outside the recommended selector.

Required exact result:

```text
P1_duplicate = P1
area_before = 0.39
area_after = 0.39
W_TARGET_before = 0.2
W_TARGET_after = 0.2
W_GUARD_before = 4
W_GUARD_after = 4
```

Required classification:

```text
REDUNDANT_BOUNDED_STRIP_NO_NEW_COMPATIBLE_SET_INFORMATION
```

Core law:

```text
more probes != more information
```

This is under a deterministic bounded-error set model. Repeated stochastic measurements under an explicitly declared stochastic model are outside this chamber.

---

## 10. Held-out coverage assay

After `P_TARGET` only, treat `F_GUARD` as an unacquired held-out functional.

Required prediction interval:

```text
I_GUARD(P1) = [-4,0]
```

Synthetic in-family guard observation center:

```text
z_guard = -2
observation interval = [-2.1,-1.9]
```

The observation must intersect the current prediction interval.

Required classification:

```text
HELDOUT_GUARD_OBSERVATION_COVERED_BUT_NOT_NARROWLY_IDENTIFIED
```

This demonstrates:

```text
TARGET claim sufficiency != GUARD claim sufficiency
```

After `P_GUARD` is admitted, the guard interval contracts to `[-2.1,-1.9]`.

---

## 11. Open-set / model-order challenge

Freeze a synthetic context-dependent source that agrees with the declared linear operator family on both acquired training probes:

```text
P_TARGET center = 4
P_GUARD center = -2
```

but at a held-out scalar readout:

```text
x_hold = [0,1]
r_hold = [1,0]
```

emits center:

```text
z_hold_out = 1.5
```

Under `P2`, the declared linear family predicts:

```text
theta1 in [0.9,1.1]
```

so held-out prediction interval is:

```text
[0.9,1.1]
```

The held-out observation interval under the same `delta=0.1` is:

```text
[1.4,1.6]
```

These intervals are disjoint.

Required classification:

```text
DECLARED_LINEAR_TRANSITION_MODEL_DEFEATED_BY_HELDOUT_OBSERVATION
```

Required response:

```text
ABSTAIN_FROM_SILENT_MODEL_ORDER_UPGRADE
PRESERVE_CONTRADICTION_AS_EVIDENCE
```

The implementation may not:

```text
silently enlarge delta
silently enlarge declared parameter support
silently refit a point operator
silently introduce bias/context term
silently upgrade to nonlinear model
count the contradiction as confirmation
```

The challenge defeats the current declared linear family in this fixture. It does not identify the mechanism producing the mismatch.

Required law:

```text
model-family defeat != mechanism identification
```

---

## 12. In-family held-out control

At the same held-out readout:

```text
x_hold = [0,1]
r_hold = [1,0]
```

freeze in-family center:

```text
z_hold_in = 1
```

Observation interval:

```text
[0.9,1.1]
```

Required:

```text
HELDOUT_OBSERVATION_COMPATIBLE_WITH_CURRENT_OPERATOR_SET
```

The open-set defeat therefore cannot arise merely because held-out validation is hard-coded to reject.

---

## 13. Empty-set contradiction control

If any newly admitted observation strip makes the complete compatible polygon empty, required status is:

```text
DECLARED_MODEL_AND_OBSERVATION_CONSTRAINTS_INCONSISTENT
```

The implementation must not manufacture a nearest point, relax the strip, or continue with an empty polygon as though it were a valid posterior.

Required law:

```text
empty compatible set != low-confidence point estimate
```

---

## 14. Mutation and leakage hostiles

Required rejection surfaces:

```text
candidate probe mutation -> REJECT_SEQUENTIAL_PROBE_CANDIDATE_MUTATION
selector theta_star / T_star -> REJECT_ORACLE_LEAKAGE_IN_SEQUENTIAL_PROBE_SELECTION
selector future observation -> REJECT_ORACLE_LEAKAGE_IN_SEQUENTIAL_PROBE_SELECTION
selector observed center -> REJECT_ORACLE_LEAKAGE_IN_SEQUENTIAL_PROBE_SELECTION
undeclared goal mutation -> REJECT_SEQUENTIAL_GOAL_MUTATION
noise-bound mutation -> REJECT_DECLARED_SEQUENTIAL_NOISE_BOUND_MUTATION
point-estimate polygon replacement -> REJECT_COMPATIBLE_SET_LAUNDERING
finite-sample polygon replacement -> REJECT_COMPATIBLE_SET_LAUNDERING
```

Fixture immutability before/after the gauntlet must also be checked.

---

## 15. Pre-implementation kill criteria

The chamber fails before any claim is earned if implementation cannot simultaneously establish all of the following without post-witness threshold changes:

```text
K1  exact declared-support area = 4
K2  P_TARGET yields area 0.39 within numeric tolerance
K3  P_TARGET yields TARGET width 0.2 and GUARD width 4
K4  P_TARGET + P_GUARD yields area 0.02
K5  combined set remains nonpoint while both claim widths equal 0.2
K6  GOAL_TARGET_ONLY stops after P_TARGET
K7  GOAL_TARGET_AND_GUARD selects P_TARGET then P_GUARD and stops
K8  P_TARGET_DUPLICATE produces zero compatible-set contraction after P_TARGET
K9  selector never receives oracle or future outputs
K10 in-family held-out observation intersects current prediction
K11 open-set held-out observation is disjoint from every prediction admitted by P2
K12 open-set mismatch produces model-family defeat without silent refit or model-order upgrade
K13 exact complete polygon is retained rather than finite samples or point estimate
K14 empty-set contradiction remains explicit
K15 parent research / workflow / production membranes remain untouched
```

If a numeric expectation above is wrong, correct it visibly before implementation or preserve a post-implementation correction scar. Do not move thresholds after seeing CI.

---

## 16. Bounded claim candidate if witnessed

Maximum candidate claim:

```text
SEQUENTIAL_DETERMINISTIC_BOUNDED_ERROR_PROBES_CAN_CONTRACT_A_COMPLETE_COMPATIBLE_TRANSITION_OPERATOR_SET_TO_CLAIM_SUFFICIENT_NONPOINT_REGIONS_WITH_CLAIM_CONDITIONED_STOPPING_WHILE_REDUNDANT_PROBES_ADD_NO_SET_INFORMATION_AND_HELDOUT_OBSERVATIONS_CAN_DEFEAT_THE_DECLARED_LINEAR_MODEL_FAMILY_IN_THE_AUTHORED_SYNTHETIC_FIXTURE
```

No stronger generalization is authorized by this preregistration.

---

## 17. Anti-equivalences

```text
operator-set contraction != target prediction sufficiency
target prediction sufficiency != held-out coverage
claim-sufficient stopping != full operator identification
more probes != more information
compatible under declared bounded error != correct model order
complete compatible polygon != posterior credible region
declared parameter support != probability prior
empty compatible set != low-confidence point estimate
model-family defeat != mechanism identification
local claim-conditioned selector != optimal experimental design
bounded sequential system-identification assay != operator tomography
operator tomography != path transport
path transport != holonomy
research witness != A16 reopening
research witness != production authority
```

---

## 18. Claim ceiling

Unearned even if every kill criterion survives:

```text
general set-membership system-identification theorem
statistical consistency
probabilistic coverage
Bayesian posterior validity
optimal experimental design
active-learning optimality
adaptive-submodularity
dual-control theorem
robust-control theorem
arbitrary-noise robustness
arbitrary-dimensional operator theorem
operator tomography
blind tomography
physical tomography
path-category theorem
path-dependent transport theorem
reverse-morphism legitimacy theorem
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

---

## 19. Frozen next learning action if witnessed

If and only if the complete chamber survives, the next bounded question becomes:

```text
TEST_OPERATOR_RESPONSE_RECONSTRUCTION_ACROSS_MULTIPLE_DECLARED_INPUT_AND_READOUT_FAMILIES_WITH_EXPLICIT_GAUGE_OR_COORDINATE_EQUIVALENCE_HELDOUT_RESPONSE_COMPLETION_AND_MODEL_FAMILY_DEFEAT_BEFORE_DECIDING_WHETHER_THE_TERM_OPERATOR_TOMOGRAPHY_IS_EARNED
```

That future question is not implemented here.

No path category, transport, loop, or holonomy chamber opens merely because sequential compatible-set contraction succeeds.

𝌋

⟐
