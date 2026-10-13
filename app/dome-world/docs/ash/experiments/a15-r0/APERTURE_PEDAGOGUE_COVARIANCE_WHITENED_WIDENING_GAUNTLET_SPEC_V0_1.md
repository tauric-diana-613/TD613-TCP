# Aperture × Pedagogue Covariance-Whitened Widening Gauntlet v0.1

Status: AUTHORED / PRE-IMPLEMENTATION / RESEARCH-ONLY / A15-R0 PHASE-FREE

Authority: NONE. No production, sensor control, custody, deployment, prediction, physical-tomography, or experiment-execution authority.

## 0. Why this gauntlet follows

The preceding conditioning-aware widening assay established a bounded synthetic refinement:

```text
positive rank lift
!=
practical reconstruction stability under a declared perturbation posture
```

That assay normalized rows and assumed equal observation variance. The next failure mode is immediate: if candidate observation channels have different uncertainty, Euclidean row geometry is not the relevant comparison geometry.

Aperture v3.1-alpha already requires source status, sensor provenance, uncertainty, and missingness to travel with returned context; widening remains sensitivity analysis rather than validation.

This gauntlet asks:

> Can Aperture evaluate Pedagogue's candidate widenings in a declared uncertainty geometry, while abstaining from a global recommendation when the candidate noise model is materially missing?

## 1. Jurisdiction

- Pedagogue: proposes candidate questions from the admitted local identifiability deficit.
- Aperture: evaluates candidate observation geometry after declared uncertainty whitening; carries uncertainty/missingness; may abstain.
- Dome-World: synthetic experiment host.
- Ash: no live custody binding.
- Human: closure and promotion.

No standalone Aperture UI mutation is permitted.

## 2. Frozen state and base observation

```text
S* = [x,y]^T = [2,3]^T
B = [1,0]
base observation variance = 1
```

Candidate rows are normalized to unit Euclidean norm before the declared noise model is applied.

## 3. Predeclared candidates and observation variances

### P_DUP

```text
row = [1,0]
variance = 1
```

Expected rank lift: 0.

### P_ORTH

```text
row = [0,1]
variance = 100
standard deviation = 10
```

Under equal-variance Euclidean conditioning this candidate is geometrically ideal relative to `B`.

Whitened augmented operator:

```text
A_white = [[1,0],
           [0,0.1]]
```

Expected:

```text
sigma_min = 0.1
condition_number_2 = 10
```

### P_DIAG

```text
row = [1,1] / sqrt(2)
variance = 1
standard deviation = 1
```

Expected whitened singular posture approximately:

```text
sigma_min ≈ 0.541196100146
condition_number_2 ≈ 2.414213562373
```

Thus the declared covariance changes the preferred candidate:

```text
equal-variance Euclidean conditioning -> P_ORTH
covariance-whitened conditioning       -> P_DIAG
```

This is a fixture-bound reversal, not a universal sensor-design result.

## 4. Whitening law

For declared diagonal covariance

```text
Sigma = diag(sigma_1^2,...,sigma_m^2)
```

define the whitened observation operator:

```text
A_w = Sigma^(-1/2) A
```

The candidate comparison uses the smallest singular value of `A_w` after positive rank lift.

This fixture uses diagonal covariance only. Correlated-noise covariance is explicitly untested.

No Fisher-information or optimal-design claim is made, even though the whitened Gram matrix is mathematically related to familiar linear-Gaussian information constructions under additional assumptions.

## 5. Complete-noise-model selection law

When every rank-lifting candidate has a valid declared variance:

1. preserve Pedagogue's positive-rank-lift requirement;
2. normalize raw candidate row scale;
3. whiten the augmented operator by the declared observation standard deviations;
4. among rank-lifting candidates maximize `sigma_min(A_w)`;
5. use whitened condition number only as a secondary diagnostic/tie-break;
6. stable probe id is the final tie-break.

Expected selected candidate: `P_DIAG`.

## 6. Missing-noise-model hostile control

Create a second candidate set in which `P_DIAG` remains rank lifting but its variance is `UNRESOLVED`.

The system may compute and report fully declared subset diagnostics, but it may not declare a global best candidate while a materially competing rank-lifting candidate lacks a comparable uncertainty model.

Required classification:

```text
NO_GLOBAL_WIDENING_SELECTION_MISSING_NOISE_GEOMETRY
```

Required selected candidate:

```text
null
```

Aperture must preserve the missingness explicitly rather than silently substituting variance `1`, infinity, zero, or a default.

## 7. Standardized perturbation witness

Use one fixed standardized perturbation:

```text
z = [0.01,-0.01]^T
```

Map it into each candidate's declared observation units:

```text
eta = Sigma^(1/2) z
```

Then reconstruct from the unwhitened declared forward equations.

Expected bounded posture:

```text
P_ORTH:
eta = [0.01,-0.1]
S_hat ≈ [2.01,2.9]
L2 error ≈ 0.100498756211
held-out residual for H=x-y ≈ 0.11

P_DIAG:
eta = [0.01,-0.01]
S_hat ≈ [2.01,2.975857864376]
L2 error ≈ 0.026131259298
held-out residual ≈ 0.034142135624
```

This deterministic standardized perturbation is a witness only; it is not an empirical error-rate estimate.

## 8. Required receipt fields

```text
source_status
sensor_provenance_status
base_variance
candidate_variance
variance_source_status
normalization_law
whitening_law
rank_before
rank_after
rank_lift
sigma_min_unwhitened
sigma_min_whitened
condition_number_unwhitened
condition_number_whitened
complete_noise_geometry
selection_status
selection_reason
missingness
standardized_perturbation
physical_perturbation
reconstruction_error
held_out_residual
alternatives
claim_ceiling
```

## 9. Required anti-equivalences

```text
equal Euclidean angle != equal information quality under unequal uncertainty
full rank != stable reconstruction
known forward row != known observation reliability
missing covariance != unit covariance
widening proposal != widening execution
widening != validation
```

## 10. Hostile requirements

Fail if:

- Euclidean selector and whitened selector are forced to agree by implementation;
- `P_ORTH` remains globally preferred after its declared variance becomes 100;
- missing `P_DIAG` variance is silently defaulted;
- the missing-noise hostile control emits a global selected probe;
- held-out truth participates in candidate selection;
- raw coefficient scaling changes the normalized geometry;
- a successful synthetic run grants physical sensor, prediction, action, production, tomography, or autonomous widening authority;
- standalone Aperture UI is modified.

## 11. Bounded hypotheses

```text
H_UNCERTAINTY_WEIGHTED_OBSERVABILITY:
Within this declared local linear synthetic fixture, candidate widening preference can change when observation uncertainty is incorporated through a declared whitening transform.

H_MISSING_NOISE_REQUIRES_ABSTENTION:
When a materially competing rank-lifting candidate lacks a declared comparable uncertainty model, the instrument must withhold a global widening recommendation rather than impute reliability.
```

## 12. Claim ceiling

```text
optimal_experimental_design = false
active_learning_theorem = false
fisher_information_optimality = false
physical_sensor_design = false
physical_sensor_calibration = false
physical_tomography = false
blind_tomography = false
operator_tomography = false
live_td613_reconstruction = false
autonomous_aperture_widening = false
autonomous_experiment_execution = false
correlated_noise_solution = false
connection = false
curvature = false
holonomy = false
quantum_behavior = false
proto_loom = false
production_authority = false
```

Passing support may produce only:

```text
UNCERTAINTY_WEIGHTED_WIDENING_REFINEMENT_CANDIDATE
MISSING_NOISE_GEOMETRY_ABSTENTION_SUPPORTED_IN_BOUNDED_SYNTHETIC_FIXTURE
```

## 13. Next question if this passes

Only after this assay survives may A15-R0 admit a correlated covariance matrix and ask whether probe usefulness depends on **joint noise directions**, rather than independent per-channel variances.

That would be the first legitimate path toward a richer uncertainty geometry; it still would not confer physical sensor or optimal-design authority.
