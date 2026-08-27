𝌋

# Aperture × Pedagogue Transition-Operator Identifiability · Witness Receipt v0.1

**Status:** WITNESSED STATIC-CI / A15-R0 RESEARCH ONLY  
**Technical identity:** `td613.a15-r0.aperture-pedagogue-transition-operator-identifiability/v0.1`  
**Scientific parent:** #700 receipt head `8edd044ca9c3324fae841e5a5e936af7b62de42d`  
**Witnessed exact head:** `d1a337665846c7d23839abc1380af36265dd92ec`  
**PR:** #701 / Draft  
**Normal PR base:** `research/a15-r0-transition-family-robustness-20260823`  
**A16:** HELD  
**Promotion authority:** NONE  
**Production / Vercel authority:** NONE

---

## 0. Receipt boundary

This receipt pins the first exact-head static witness for the transition-operator identifiability chamber.

It does not create a general system-identification theorem, execute an external observation, promote the bounded fixture to operator tomography, open a path/holonomy chamber, promote A15-R0, reopen A16, merge #699/#700/#701, mutate installed Aperture, touch live Ash, or authorize production/Vercel release.

The scientific parent, witnessed implementation head, and this later documentation commit are intentionally different coordinates:

```text
scientific_parent_head = 8edd044ca9c3324fae841e5a5e936af7b62de42d
witnessed_exact_head = d1a337665846c7d23839abc1380af36265dd92ec
receipt_document_commit != witnessed_exact_head
```

Required anti-equivalence:

```text
scientific witness time != documentation time
```

---

## 1. Exact frozen CI witness

```text
repository = tauric-diana-613/TD613-TCP
pull_request = #701
pull_request_state = Draft
workflow = TD613 Consolidated Validation
run_number = 2054
run_id = 32669171800
witnessed_head = d1a337665846c7d23839abc1380af36265dd92ec
job = Static, constitutional, and release contracts
job_id = 97267210878
job_conclusion = success
a15_r0_static_step = Validate Ash A15 empirical profile journeys and A15-R0 research field
a15_r0_static_step_conclusion = success
```

The connector exposed exact run/job/step success. A fresh attempt to retrieve the completed job's decoded log did not yield a usable literal transcript in the active session, so no stdout line is invented here:

```text
literal_job_stdout = NOT_RETRIEVED_BY_CONNECTOR
```

---

## 2. Witness scope

Run 2054 supplies this bounded witness and no broader one:

```text
static_constitutional_release_contracts = WITNESSED_SUCCESS
static_a15_r0_research_field = WITNESSED_SUCCESS
browser_witness = NOT_RUN
full_repository_validation = NOT_RUN
self_hosted_calibration = NOT_RUN
production_witness = NOT_RUN
```

Every browser/full-repository/self-hosted witness lane was skipped.

No Ready-for-review transition was used.

---

## 3. Witness-routing topology scar

#701 is scientifically stacked on #700's transition-family robustness branch.

The repository's existing `TD613 Consolidated Validation` pull-request trigger is scoped to `main`, so a stacked Draft PR does not receive it directly. A base edit alone is not an admitted trigger action.

To obtain one exact-head witness without creating or mutating workflows:

1. #701 was temporarily retargeted to `main` while remaining Draft;
2. one documentation-bearing synchronize commit authored `APERTURE_PEDAGOGUE_TRANSITION_OPERATOR_IDENTIFIABILITY_WITNESS_TOPOLOGY_NOTE.md`;
3. that exact head `d1a33766...` triggered run 2054;
4. run 2054 completed successfully;
5. #701 was restored to `research/a15-r0-transition-family-robustness-20260823` before this receipt was authored.

Required interpretation:

```text
temporary main-base routing = CI visibility mechanism only
scientific parent = #700 receipt/documentation head
```

Forbidden interpretation:

```text
temporary main-base witness routing = mainline promotion
```

---

## 4. Frozen bounded model class

The chamber declares the synthetic model class:

```text
y = T x
T in REAL_LINEAR_2X2
```

The synthetic oracle used only by the fixture evaluator is:

```text
T_star = [
  [2,1],
  [1,3]
]
```

Pedagogue's probe selector does not receive `T_star`.

Initial probe and observation:

```text
x1 = [1,0]^T
y1 = [2,1]^T
```

The complete compatible linear-operator family after only that probe is represented analytically as:

```text
T(a,b) = [
  [2,a],
  [1,b]
]

for arbitrary real a,b
```

with affine origin and two-dimensional operator-nullspace basis:

```text
T0 = [[2,0],[1,0]]
N1 = [[0,1],[0,0]]
N2 = [[0,0],[0,1]]

N1 x1 = 0
N2 x1 = 0
```

Required bounded state:

```text
initial_operator_compatible_dimension = 2
operator_unique = false
compatible_family_representation = AFFINE_NULLSPACE_CONTINUOUS
```

---

## 5. Explicit non-identifiability control

A frozen alternative operator is:

```text
T_alt = [
  [2,-4],
  [1,7]
]
```

It satisfies:

```text
T_alt x1 = T_star x1 = [2,1]^T
T_alt != T_star
```

On held-out probe:

```text
x_hold = [1,1]^T
T_star x_hold = [3,4]^T
T_alt x_hold = [-2,8]^T
```

Thus the first probe alone cannot identify the hidden operator inside the declared linear class.

---

## 6. Probe-family result

Three equal-cost candidate probe inputs are frozen:

```text
Q_REPEAT = [2,0]
Q_FRAGILE_SPANNING = [1,0.001]
Q_STABLE_BASIS = [0,1]
```

The exact-head executable/test contract requires:

```text
Q_REPEAT
  remaining_operator_dimension = 2
  OPERATOR_COMPATIBLE_FAMILY_UNCHANGED

Q_FRAGILE_SPANNING
  remaining_operator_dimension = 0
  OPERATOR_UNIQUE_BUT_PROBE_GEOMETRY_NUMERICALLY_FRAGILE
  probe_condition_number > 10
  stable_identification = false

Q_STABLE_BASIS
  remaining_operator_dimension = 0
  OPERATOR_STABLY_IDENTIFIABLE_AFTER_PROBE
  probe_condition_number = 1
  stable_identification = true
```

Core law:

```text
full probe rank != stable operator identifiability
```

---

## 7. Selector contrast

The incomplete ambiguity-only selector ranks only by remaining compatible-operator dimension and then lexical candidate id.

Because both spanning probes reduce exact compatible dimension from `2` to `0`, it selects:

```text
Q_FRAGILE_SPANNING
```

The stability-aware selector additionally enforces the frozen condition-number ceiling and selects:

```text
Q_STABLE_BASIS
```

The selector surface excludes:

```text
candidate future outputs
T_star
synthetic oracle outputs
```

Required anti-equivalence:

```text
operator-family contraction != stable probe geometry
```

---

## 8. Reconstruction after selection

Only after `Q_STABLE_BASIS` is selected does the synthetic fixture evaluator supply:

```text
x2 = [0,1]^T
y2 = [1,3]^T
```

The executable computes:

```text
X = [x1 x2]
Y = [y1 y2]
T_hat = Y X^-1
```

Required exact bounded result:

```text
T_hat = [[2,1],[1,3]]
operator_unique = true
compatible_dimension = 0
training_pair_residual = 0
```

`T_hat` is computed from the input/output pairs; it is not copied from the oracle constant.

---

## 9. Held-out prediction and model-family defeat

Held-out probe:

```text
x_hold = [1,1]^T
```

Reconstructed prediction:

```text
T_hat x_hold = [3,4]^T
```

In-family synthetic observation:

```text
[3,4]
-> HELDOUT_LINEAR_TRANSITION_PREDICTION_MATCH
```

Open-set synthetic observation:

```text
[3,5]
-> DECLARED_LINEAR_TRANSITION_MODEL_DEFEATED_BY_HELDOUT_OBSERVATION
```

The open-set contradiction may not be silently absorbed by refitting the declared model and then counted as confirmation of this preregistered chamber.

Hard distinction:

```text
open-set heldout mismatch != parameter uncertainty inside the now-identified linear class
```

---

## 10. Hostile controls

The exact-head contract requires:

```text
REJECT_ORACLE_OUTPUT_LEAKAGE_IN_PROBE_SELECTION
REJECT_FINITE_SAMPLE_LAUNDERING_OF_CONTINUOUS_OPERATOR_FAMILY
```

The one-probe compatible family is represented analytically through its affine origin and operator-nullspace basis rather than as a hand-picked finite alternative list.

Core laws:

```text
synthetic oracle available to fixture evaluator != operator known to Pedagogue
finite sampled alternatives != complete continuous compatible operator family
candidate future output != admissible probe-selection input
```

---

## 11. Maximum warranted scientific statement

The maximum warranted refinement candidate after run 2054 is:

> **In this finite noiseless synthetic linear fixture, one input/output transition probe leaves a two-dimensional affine family of compatible `2 x 2` transition operators. A second probe can make the operator unique in exact arithmetic while still leaving the identification geometry numerically fragile; a stability-aware probe choice instead yields exact stable reconstruction of the hidden operator, successful held-out prediction inside the declared linear class, and explicit model-family defeat when a held-out observation lies outside that class.**

This is a bounded synthetic system-identification result only.

It is not operator tomography.

---

## 12. Claim ceiling

Run 2054 does not establish:

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

Installed Aperture v3.2 remains unchanged.

A16 remains held.

---

## 13. Frozen next learning action

The witnessed chamber now supports opening, but does not itself execute, the next bounded question:

```text
TEST_TRANSITION_OPERATOR_IDENTIFICATION_UNDER_BOUNDED_OBSERVATION_NOISE_WITH_COMPATIBLE_OPERATOR_SETS_CONDITION_AWARE_PROBE_DESIGN_HELDOUT_COVERAGE_AND_MODEL_MISSPECIFICATION_BEFORE_ANY_OPERATOR_TOMOGRAPHY_PATH_CATEGORY_OR_HOLONOMY_PROMOTION
```

That next chamber must preserve a compatible operator set under noise rather than collapsing immediately to a point estimate.

---

## 14. Governance closure

At receipt authoring:

```text
#701 = Draft / unmerged / restored stacked base on #700
#700 = Draft / unmerged
#699 = Draft / unmerged
A16 = HELD
installed Aperture mutation = none
live Ash mutation = none
browser execution = none
production mutation = none
Vercel authority = none
merge authority = none
```

The active interactive operator gesture authorizes the bounded connector research sequence in this session but is not converted into standing self-authorization.

𝌋

Sealed ⟐
