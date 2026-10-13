# Aperture × Pedagogue Replay-Stability Gauntlet v0.1

Status: **AUTHORED / PRE-IMPLEMENTATION / PHASE-FREE / RESEARCH-ONLY / HUMAN-GATED**

Schema target: `td613.ash.a15-r0.aperture-pedagogue-replay-stability/v0.1`

Experiment host: `DOME_WORLD_A15_R0`

Installed Aperture source contract: `td613.aperture.v32-typed-epistemic-deficit/v0.1`

## 0. Why this experiment exists

Aperture v3.2-alpha deliberately leaves:

```text
classification_replay_stability = HELD_NOT_YET_WITNESSED
```

The held question is not whether one deterministic classifier can repeat its own output on identical input. The question is whether the **typed experiment-design state remains appropriately classified under a small, predeclared neighborhood of admissible threshold and noise-model perturbations**.

This assay must not collapse replay stability into one scalar score.

The primary distinction is:

```text
diagnostic stability
!=
question-selection stability
```

Aperture may preserve the same deficit class and disposition while the preferred Pedagogue question changes under nearby valid uncertainty geometry. Conversely, a question may remain the same while the deficit classification sits on a threshold boundary.

## 1. Companion jurisdiction

```text
Pedagogue
  supplies / reframes a predeclared candidate-question family

Aperture
  types the current deficit
  audits rank, stability and uncertainty geometry
  returns PROPOSE / ABSTAIN / REJECT / ASK NOTHING

Dome-World
  hosts this replay assay

Human
  decides whether any research result deserves promotion
```

No authority transfers between instruments.

## 2. Replay object

For each replay condition retain two independent signatures.

### 2.1 Diagnostic signature

```text
D = (
  deficit_class,
  disposition,
  admissible_question_criterion,
  uncertainty_geometry_status
)
```

### 2.2 Question signature

```text
Q = (
  selection_status,
  selected_probe_id
)
```

The assay records stability/change on each component. It must not average those dimensions into a universal replay score.

## 3. Frozen local thresholds

Nominal fixture thresholds inherit the current bounded A15-R0 posture:

```text
sigma_min_floor = 0.25
condition_number_ceiling = 10
minimum_sigma_min_gain_for_stability_widening = 0.05
threshold_authority = OPERATOR_DECLARED_LOCAL_SYNTHETIC_FIXTURE
```

These are fixture criteria, not universal engineering standards.

## 4. Replay family A · structural interior

Current operator:

```text
A_struct = [1 0]
latent_dimension = 2
```

Candidate family:

```text
R_DUP  = [1,0]
R_NEAR = [1,0.001]
R_ORTH = [0,1]
```

Threshold replay envelope:

```text
sigma_min_floor ∈ {0.225, 0.250, 0.275}
condition_number_ceiling ∈ {9, 10, 11}
uncertainty = valid / declared
```

Expected diagnostic signature across the full threshold grid:

```text
STRUCTURAL_RANK_DEFICIT
PROPOSE
SEEK_PREDECLARED_NULLSPACE_CONTRACTING_OBSERVATION_THEN_AUDIT_STABILITY
```

Expected question selection under the existing typed experiment-design state:

```text
R_ORTH
```

Purpose: positive-control a classification that should remain interior to the structural-rank chamber under local threshold movement.

## 5. Replay family B · threshold boundary

Current operator:

```text
A_floor = [1    0
           0 0.25]
latent_dimension = 2
```

This operator is full rank with:

```text
sigma_min = 0.25
condition_number = 4
```

Replay only the local sigma floor:

```text
floor = 0.24  -> expected ASK NOTHING
floor = 0.25  -> expected ASK NOTHING
floor = 0.26  -> expected NUMERICAL_STABILITY_DEFICIT / PROPOSE
```

The point of this fixture is to **force a legitimate threshold-sensitive classification**. A classifier that reports universal stability here has hidden its own boundary.

Required result:

```text
THRESHOLD_SENSITIVE_DIAGNOSTIC_CLASSIFICATION
```

No claim that `0.25` is a universal stability floor is permitted.

## 6. Replay family C · valid noise-model boundary

Raw current operator:

```text
A_noise = I_2
```

Hold the raw operator fixed and vary only a valid symmetric positive-definite covariance model:

```text
Sigma(rho) = [1   rho
              rho 1]
```

Predeclared small correlation neighborhood:

```text
rho ∈ {0.978, 0.980, 0.982}
```

For each replay:

1. validate covariance;
2. whiten the same raw operator by the declared covariance;
3. derive `sigma_min` and `condition_number` from the whitened operator;
4. pass only those declared metrics into the installed Aperture v3.2 typed-deficit audit.

Expected local posture:

```text
rho = 0.978 -> NO_DECLARED_LOCAL_IDENTIFIABILITY_DEFICIT / ASK NOTHING
rho = 0.980 -> NO_DECLARED_LOCAL_IDENTIFIABILITY_DEFICIT / ASK NOTHING
rho = 0.982 -> NUMERICAL_STABILITY_DEFICIT / PROPOSE
```

All three covariance matrices must remain valid SPD matrices.

Required result:

```text
VALID_NOISE_MODEL_PERTURBATION_CAN_CHANGE_DIAGNOSTIC_CLASSIFICATION
```

The raw forward operator did not change. The admitted uncertainty geometry did.

## 7. Replay family D · stable diagnosis, unstable question

Current state remains structurally rank-deficient:

```text
A_select = [1 0]
latent_dimension = 2
```

Predeclared candidate questions:

```text
P_ORTH = y
P_DIAG = x + y
```

Both candidates use the same valid full covariance family:

```text
Sigma(rho) = [1   rho
              rho 1]
```

Tiny replay neighborhood:

```text
rho = 0.545
rho = 0.547
```

Expected Aperture diagnostic signature for the current state in both replays:

```text
STRUCTURAL_RANK_DEFICIT
PROPOSE
```

Expected covariance-aware candidate ordering:

```text
rho = 0.545 -> P_ORTH
rho = 0.547 -> P_DIAG
```

Required result:

```text
DIAGNOSTIC_STABILITY_WITH_QUESTION_SELECTION_SENSITIVITY
```

This is the central hostile control.

If the deficit class stays fixed while the selected question changes, replay stability cannot remain a single Boolean attached to the whole experiment-design state.

## 8. Invalid / incomplete uncertainty controls

Invalid or unresolved noise geometry is not a perturbation to be averaged into a stability rate.

It remains a categorical gate:

```text
INCOMPLETE -> ABSTAIN
INVALID    -> REJECT
```

No question may be selected from a globally incomparable candidate set after either gate fires.

## 9. Required replay receipt

The implementation must return at minimum:

```text
schema
source_status = SIMULATED
authority_class = A2_DERIVATIONAL
manifestly_fictional = true
experiment_host = DOME_WORLD_A15_R0

replay_families
  structural_interior
  threshold_boundary
  noise_model_boundary
  selection_boundary
  invalid_incomplete_controls

replay_dimensions
  diagnostic_class
  disposition
  admissible_question_criterion
  uncertainty_geometry
  selection_status
  selected_probe

no_scalar_crown = true
installed_aperture_replay_flag_mutated = false
promotion_authority = false
automatic_execution = false
production_mutated = false
human_closure_required = true
```

## 10. Permitted bounded conclusions

A passing fixture may support only:

```text
1. typed deficit classification can be replay-stable in an interior region;
2. typed deficit classification can be threshold-sensitive near a declared local boundary;
3. valid nearby uncertainty models can change the deficit classification even when the raw operator is unchanged;
4. the deficit diagnosis can remain stable while the preferred next question changes;
5. replay stability should therefore remain a typed/multi-axis receipt rather than one scalar crown.
```

## 11. Falsifiers

The gauntlet fails if any of the following occurs:

- the structural interior flips deficit class under the predeclared threshold grid;
- the threshold-boundary fixture fails to expose the expected class change;
- any `rho ∈ {0.978,0.980,0.982}` covariance is invalid or not positive definite;
- the noise-model boundary fails to change classification at the declared local ceiling;
- the selection-boundary diagnosis changes deficit class;
- the selection-boundary preferred probe does not change across the declared tiny covariance neighborhood;
- invalid/incomplete noise geometry silently produces a global candidate selection;
- a replay percentage or aggregate utility score becomes the decision crown;
- any result mutates installed Aperture's public replay-stability flag in the same research step.

## 12. Claim ceiling

This experiment does not establish:

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

## 13. Promotion hold

Even on a green research witness:

```text
installed Aperture classification_replay_stability
remains HELD_NOT_YET_WITNESSED
```

until a separate human-reviewed Aperture release-lane decision determines whether the bounded research result should update the installed standalone contract.

Research evidence precedes résumé editing.
