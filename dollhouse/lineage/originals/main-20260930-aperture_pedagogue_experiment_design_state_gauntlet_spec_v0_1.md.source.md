# Aperture × Pedagogue Typed Experiment-Design State Gauntlet v0.1

Status: AUTHORED / PRE-IMPLEMENTATION / RESEARCH-ONLY / A15-R0 PHASE-FREE

Authority: NONE. No production, sensor control, custody, deployment, prediction, physical-tomography, autonomous experiment, information-geometric, or optimal-design authority.

## 0. Why this object now exists

A15-R0 has separately established bounded synthetic distinctions:

```text
rank lift != practical recoverability
candidate observation geometry is relative to declared uncertainty
same marginal variances != same joint noise geometry
different probe directions != independent noise directions
```

Those results expose a deeper failure in a universal probe selector.

When the current operator is rank deficient, a useful next question must first constrain a missing direction. When the current operator is already full rank but badly conditioned, positive rank lift is impossible; a useful additional observation may instead improve stability. When the current operator is already full rank and well conditioned under the declared posture, the existence of available probes is not itself a reason to manufacture another question.

This gauntlet therefore asks:

> Can Pedagogue and Aperture represent the **type of admitted epistemic deficit** first, then apply only the interrogation rule appropriate to that deficit, while preserving abstention and invalid-noise boundaries?

The research object is called an **experiment-design state**. The name describes state representation for bounded synthetic question design. It is not an optimal-experimental-design claim.

## 1. Jurisdiction

- Pedagogue: proposes predeclared synthetic questions conditioned on the declared deficit class.
- Aperture: diagnoses rank/stability/noise-geometry posture, audits proposed widening, preserves missingness and abstention, and refuses observability→validation promotion.
- Dome-World: experiment host.
- Ash: no live custody binding.
- Human: closure and any future promotion.

No standalone Aperture UI mutation is permitted.

## 2. Required experiment-design state

The state must preserve at least:

```text
source_status
operator_basis
latent_dimension
current_rank
current_nullity
current_sigma_min
current_condition_number
uncertainty_geometry_status
deficit_class
deficit_reason
candidate_probe_receipts
missingness
selection_posture
selected_probe_id
held_out_not_used_for_selection
automatic_execution
claim_ceiling
```

No scalar score may collapse rank deficit, numerical fragility, uncertainty missingness, and covariance validity into one number.

## 3. Fixture-local stability declaration

For this gauntlet only, the equal-variance normalized linear fixtures declare:

```text
sigma_min_floor = 0.25
condition_number_ceiling = 10
minimum_sigma_min_gain_for_stability_widening = 0.05
```

These are authored fixture thresholds, not universal numerical-stability standards.

## 4. Deficit classes

Classification order is binding:

### INVALID_NOISE_GEOMETRY

A required covariance/noise model is declared but invalid.

Required posture:

```text
reject before ranking
selected_probe_id = null
```

### NOISE_GEOMETRY_INCOMPLETE

A materially competing candidate lacks disposition-relevant uncertainty geometry.

Required posture:

```text
abstain globally
selected_probe_id = null
```

### STRUCTURAL_RANK_DEFICIT

```text
rank(current_operator) < latent_dimension
```

Question criterion:

1. require positive rank lift;
2. among admissible rank-lifting candidates, audit uncertainty-aware conditioning;
3. reject differently named duplicates that do not contract nullity.

### NUMERICAL_STABILITY_DEFICIT

```text
rank(current_operator) = latent_dimension
AND
(sigma_min < sigma_min_floor OR condition_number > condition_number_ceiling)
```

Because rank is already full, `rank_lift` cannot be the admission criterion.

Question criterion:

1. preserve full rank;
2. require `sigma_min_after - sigma_min_before >= minimum_sigma_min_gain_for_stability_widening`;
3. among admissible candidates, maximize `sigma_min_after` under the declared normalized equal-noise posture;
4. use condition number as secondary diagnostic/tie-break;
5. differently named repetitions with trivial stability gain must not win merely because another observation was added.

### NO_DECLARED_LOCAL_IDENTIFIABILITY_DEFICIT

```text
rank = latent_dimension
sigma_min >= sigma_min_floor
condition_number <= condition_number_ceiling
```

Required posture:

```text
selected_probe_id = null
selection_status = NO_WIDENING_PROPOSED_NO_DECLARED_LOCAL_DEFICIT
```

Candidate availability may not manufacture a research need.

## 5. Context A · structural rank deficit

Latent dimension: 2.

Current operator:

```text
A_rank = [[1,0]]
rank = 1
nullity = 1
```

Predeclared candidates:

```text
R_DUP  = [1,0]
R_NEAR = [1,0.001]
R_ORTH = [0,1]
```

Unit-normalized rows; equal-variance fixture.

Expected:

```text
deficit_class = STRUCTURAL_RANK_DEFICIT
R_DUP rank_lift = 0
R_NEAR rank_lift = 1 but very poor conditioning
R_ORTH rank_lift = 1 and condition number = 1
selected_probe_id = R_ORTH
```

This preserves the earlier rank-deficit + conditioning refinement.

## 6. Context B · full-rank numerical stability deficit

Current operator:

```text
A_fragile = [
  [1,0],
  normalize([1,0.001])
]
```

Expected approximately:

```text
rank = 2
nullity = 0
sigma_min ≈ 0.000707106516
condition_number ≈ 2000.0005
```

Thus:

```text
deficit_class = NUMERICAL_STABILITY_DEFICIT
```

Predeclared additional observations:

```text
Q_DUP  = [1,0]
Q_NEAR = [1,0.002]
Q_DIAG = [1,1]
Q_STAB = [0,1]
```

Every appended candidate necessarily has `rank_lift = 0` because the current operator is already full rank.

Expected approximate results:

```text
Q_DUP:
sigma_min_after ≈ 0.000816496263
sigma_min_gain ≈ 0.000109389747

Q_NEAR:
sigma_min_after ≈ 0.001414211441
sigma_min_gain ≈ 0.000707104925

Q_DIAG:
sigma_min_after ≈ 0.617672513994
sigma_min_gain ≈ 0.616965407477

Q_STAB:
sigma_min_after = 1
sigma_min_gain ≈ 0.999292893484
condition_number_after ≈ 1.414213562373
```

Required:

```text
selected_probe_id = Q_STAB
```

The important anti-equivalence is:

```text
rank_lift = 0
```

can mean either **useless repetition** or **valuable stabilization**, depending on the admitted deficit class.

## 7. Context C · no declared local deficit

Current operator:

```text
A_good = [[1,0],[0,1]]
```

Expected:

```text
rank = 2
nullity = 0
sigma_min = 1
condition_number = 1
deficit_class = NO_DECLARED_LOCAL_IDENTIFIABILITY_DEFICIT
```

Provide available candidates anyway:

```text
N_DUP_X = [1,0]
N_DUP_Y = [0,1]
N_DIAG  = [1,1]
```

Required:

```text
selected_probe_id = null
selection_status = NO_WIDENING_PROPOSED_NO_DECLARED_LOCAL_DEFICIT
```

This context exists to prove that the system can decide **not to ask another question**.

## 8. Context D · materially incomplete uncertainty geometry

Reuse a structural or stability-deficit context with at least two materially competing candidates, but mark one candidate's required variance/covariance `UNRESOLVED` where prior assays showed that uncertainty can change the preferred widening.

Required:

```text
deficit_class = NOISE_GEOMETRY_INCOMPLETE
selected_probe_id = null
selection_status = NO_GLOBAL_WIDENING_SELECTION_MISSING_NOISE_GEOMETRY
```

A provisional declared-subset ordering may be preserved as a counterfactual but may not become the global result.

## 9. Context E · invalid uncertainty geometry

Supply a covariance whose declared matrix is not positive definite.

Required:

```text
deficit_class = INVALID_NOISE_GEOMETRY
selected_probe_id = null
selection_status = INVALID_NOISE_GEOMETRY_PRESENT_NO_SELECTION
```

No clamping, hidden jitter, diagonal substitution, or silent repair.

## 10. Decision architecture

The gauntlet must not compute one universal utility score.

Instead:

```text
experiment-design state
→ typed deficit class
→ deficit-appropriate candidate admission law
→ uncertainty/stability audit
→ proposal OR abstention OR rejection
```

Required dispatch logic:

```text
STRUCTURAL_RANK_DEFICIT
  -> positive rank lift required

NUMERICAL_STABILITY_DEFICIT
  -> positive stability gain required; rank lift may equal 0

NO_DECLARED_LOCAL_IDENTIFIABILITY_DEFICIT
  -> no proposal

NOISE_GEOMETRY_INCOMPLETE
  -> abstain globally

INVALID_NOISE_GEOMETRY
  -> reject before ranking
```

## 11. Required anti-equivalences

```text
rank deficit != stability deficit
rank_lift = 0 != useless observation
full rank != sufficient stability
available candidate != needed question
more observations != more recoverability
operator diversity != uncertainty diversity
missing noise geometry != neutral noise geometry
invalid covariance != approximately valid covariance
proposal != execution
widening != validation
```

## 12. Hostile requirements

Fail if:

- one scalar score determines all deficit classes;
- the full-rank fragile context receives `STRUCTURAL_RANK_DEFICIT`;
- the stability-deficit context rejects every candidate merely because all `rank_lift=0`;
- Q_DUP beats Q_STAB;
- the well-conditioned identity context emits any selected probe;
- candidate availability is treated as evidence that widening is needed;
- missing uncertainty is silently defaulted;
- invalid covariance is silently repaired;
- held-out truth or oracle identity participates in selection;
- a passing result grants autonomous experiment execution, physical-sensor design, optimal-design, information-geometric, tomography, connection, curvature, holonomy, quantum, Proto-Loom, production, or release authority;
- standalone Aperture UI is modified.

## 13. Bounded hypothesis

```text
H_DEFICIT_TYPED_QUESTION_DESIGN:
Within these authored local linear synthetic fixtures, the admissible criterion for a useful next observation depends on the declared type of current reconstruction deficit; a single rank-lift rule is insufficient across rank-deficient, full-rank-fragile, and already-stable states.
```

Secondary bounded proposition:

```text
H_NO_DEFICIT_NO_QUESTION:
A candidate library does not itself justify another observation when the current state satisfies the predeclared local rank and stability posture.
```

## 14. Claim ceiling

```text
optimal_experimental_design = false
active_learning_theorem = false
fisher_information_optimality = false
information_geometry = false
physical_sensor_design = false
physical_sensor_calibration = false
physical_tomography = false
blind_tomography = false
operator_tomography = false
live_td613_reconstruction = false
autonomous_aperture_widening = false
autonomous_experiment_execution = false
connection = false
curvature = false
holonomy = false
quantum_behavior = false
proto_loom = false
production_authority = false
release_authority = false
```

A passing gauntlet may support only:

```text
TYPED_EXPERIMENT_DESIGN_STATE_SUPPORTED_IN_BOUNDED_SYNTHETIC_FIXTURES
DEFICIT_CONDITIONAL_QUESTION_DESIGN_REFINEMENT_CANDIDATE
NO_DEFICIT_NO_QUESTION_ABSTENTION_SUPPORTED_IN_BOUNDED_SYNTHETIC_FIXTURE
```

## 15. Major-breakpoint criterion

This assay qualifies as a branch-worthy research breakpoint only if all five contexts pass in one exact-head CI witness, with no browser/UI/production mutation.

If it passes, stop before adding the next research chamber. Human branching/closure comes first.
