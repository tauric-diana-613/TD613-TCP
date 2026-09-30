# Aperture × Pedagogue Replay-Stability Receipt v0.1

Status: **WITNESSED / BOUNDED SYNTHETIC RESEARCH / PHASE-FREE / HUMAN-GATED**

Schema: `td613.ash.a15-r0.aperture-pedagogue-replay-stability/v0.1`

Research PR: `#686`

Witnessed science head:

```text
08efe01a5c3453cb592b6147f6510aaa52c24848
```

Exact-head workflow witness:

```text
TD613 Consolidated Validation
run 1849 / 32436017553
Static, constitutional, and release contracts: SUCCESS
A15-R0 research field: SUCCESS
front-line browser shards: SKIPPED BY SCOPE
Giving/practice browser witness: SKIPPED BY SCOPE
full-product browser witness: SKIPPED BY SCOPE
```

This receipt records what the exact witnessed head established. It does not retroactively make this later documentation commit the science witness.

---

## 1. Research question

Aperture v3.2-alpha held:

```text
classification_replay_stability = HELD_NOT_YET_WITNESSED
```

The gauntlet tested whether replay stability is adequately represented by one Boolean or scalar, or whether different parts of the experiment-design state can move independently under nearby admissible threshold and uncertainty assumptions.

Primary predeclared anti-equivalence:

```text
diagnostic stability
!=
question-selection stability
```

---

## 2. Structural interior positive control

A rank-deficient operator was replayed over a 3 × 3 local threshold grid:

```text
sigma_min_floor ∈ {0.225, 0.250, 0.275}
condition_number_ceiling ∈ {9, 10, 11}
```

Exact witness:

```text
structural_replay_count = 9
structural_diagnostic_stable = true
```

The deficit remained:

```text
STRUCTURAL_RANK_DEFICIT
PROPOSE
```

and the selected question remained `R_ORTH` throughout the authored local threshold envelope.

Bounded conclusion:

```text
INTERIOR_TYPED_DEFICIT_REPLAY_STABILITY_SUPPORTED_IN_BOUNDED_SYNTHETIC_ENVELOPE
```

This is not a universal robustness radius.

---

## 3. Threshold-boundary hostile control

The raw full-rank operator was held fixed with:

```text
sigma_min = 0.25
condition_number = 4
```

Only the operator-declared local `sigma_min_floor` changed:

```text
floor 0.24 -> NO_DECLARED_LOCAL_IDENTIFIABILITY_DEFICIT / ASK_NOTHING
floor 0.25 -> NO_DECLARED_LOCAL_IDENTIFIABILITY_DEFICIT / ASK_NOTHING
floor 0.26 -> NUMERICAL_STABILITY_DEFICIT / PROPOSE
```

Required and witnessed classification:

```text
THRESHOLD_SENSITIVE_DIAGNOSTIC_CLASSIFICATION
```

This is a legitimate decision-boundary sensitivity, not by itself classifier failure. No claim is made that `0.25` is a universal engineering threshold.

---

## 4. Valid noise-model boundary

The raw forward operator remained the identity matrix. Only a valid symmetric positive-definite covariance model changed:

```text
Sigma(rho) = [1   rho
              rho 1]
```

Exact witness:

```text
rho = 0.978
condition_number = 9.482040440173785
class = NO_DECLARED_LOCAL_IDENTIFIABILITY_DEFICIT

rho = 0.980
condition_number = 9.949874371066198
class = NO_DECLARED_LOCAL_IDENTIFIABILITY_DEFICIT

rho = 0.982
condition_number = 10.49338415913149
class = NUMERICAL_STABILITY_DEFICIT
```

All three covariance matrices remained valid SPD models.

Bounded conclusion:

```text
VALID_NOISE_MODEL_SENSITIVITY_OF_DIAGNOSTIC_CLASSIFICATION_WITNESSED_IN_BOUNDED_SYNTHETIC_FIXTURE
```

Therefore:

```text
raw operator invariance
!=
experiment-design-state invariance
```

when admitted uncertainty geometry changes.

---

## 5. Central hostile control · stable diagnosis, unstable question

The current state remained structurally rank-deficient in both replays.

Only a tiny valid covariance perturbation changed:

```text
rho = 0.545
rho = 0.547
```

Exact witness:

```text
rho 0.545:
  deficit_class = STRUCTURAL_RANK_DEFICIT
  selected_probe_id = P_ORTH

rho 0.547:
  deficit_class = STRUCTURAL_RANK_DEFICIT
  selected_probe_id = P_DIAG
```

The diagnostic chamber remained stable:

```text
STRUCTURAL_RANK_DEFICIT
PROPOSE
```

while the preferred next question changed.

Required and witnessed classification:

```text
DIAGNOSTIC_STABILITY_WITH_QUESTION_SELECTION_SENSITIVITY
```

This is the primary new distinction earned by the gauntlet:

```text
diagnostic replay stability
!=
question-selection replay stability
```

A single `replay_stable = true/false` field would destroy information the experiment has now shown to be structurally relevant.

---

## 6. Invalid and incomplete uncertainty controls

The gauntlet retained categorical gates:

```text
NOISE_GEOMETRY_INCOMPLETE -> ABSTAIN -> selected_probe_id = null
INVALID_NOISE_GEOMETRY    -> REJECT  -> selected_probe_id = null
```

Invalid or missing uncertainty was not averaged into a perturbation score and did not silently produce a global candidate ranking.

---

## 7. Earned replay grammar

Within this authored synthetic program, replay posture now requires a typed receipt across at least:

```text
diagnostic_class
disposition
admissible_question_criterion
uncertainty_geometry
selection_status
selected_probe
```

The bounded research refinement is:

```text
replay stability is multi-axis;
stability of the deficit diagnosis does not imply stability of the preferred next question.
```

The result also supports the narrower distinctions:

```text
threshold sensitivity != classifier failure
raw operator invariance != uncertainty-geometry invariance
valid nearby noise model != identical experiment-design state
replay count != replay authority
research witness != installed-release promotion
```

No scalar replay crown is admitted.

---

## 8. Pedagogue × Aperture division of labor after this witness

The companion architecture now has a bounded reflexive research loop:

```text
Pedagogue
  proposes / reframes a predeclared question family

Aperture
  types the current epistemic deficit
  audits identifiability, stability and uncertainty geometry

Dome-World
  hosts controlled replay perturbations

Aperture
  audits whether its diagnosis and question posture survive nearby admitted assumptions

Human
  decides whether any result deserves promotion or consequential execution
```

The replay loop transfers no authority.

---

## 9. Installed Aperture promotion hold

The exact witnessed research test explicitly confirmed:

```text
installed_replay_flag = HELD_NOT_YET_WITNESSED
```

The installed engine remains unchanged by this research receipt:

```text
APERTURE_V32_REPLAY_STABILITY = HELD_NOT_YET_WITNESSED
```

Research evidence precedes release-contract promotion.

Any change to the installed standalone Aperture replay-status contract requires a separate human-reviewed Aperture release-lane decision.

---

## 10. Claim ceiling

This witness does **not** establish:

```text
universal threshold robustness
universal perturbation radius
optimal experimental design
active-learning optimality
Fisher-information optimality
information geometry
physical sensor design
physical sensor calibration
physical tomography
blind tomography
operator tomography
live TD613 reconstruction
autonomous observation
autonomous experiment execution
connection
curvature
holonomy
Berry structure
quantum behavior
Proto-Loom
production authority
release authority
```

---

## 11. Frozen next learning action

Recorded but **not executed in this receipt**:

```text
TEST_REPLAY_ENVELOPE_GEOMETRY_AND_HELD_OUT_DECISION_CONSEQUENCE_BEFORE_ANY_REPLAY_PROMOTION_OR_OPTIMAL_DESIGN_CLAIM
```

The next experiment must not begin until after the human/context branch point represented by this receipt.

---

## 12. Authority membrane

```text
source_status = SIMULATED
authority_class = A2_DERIVATIONAL
manifestly_fictional = true
no_scalar_crown = true
installed_aperture_replay_flag_mutated = false
promotion_authority = false
automatic_execution = false
production_mutated = false
standalone_aperture_ui_mutated = false
vercel_deployment_authorized = false
human_closure_required = true
```

𝌋 Witness preserved. Résumé editing held. ⟐
