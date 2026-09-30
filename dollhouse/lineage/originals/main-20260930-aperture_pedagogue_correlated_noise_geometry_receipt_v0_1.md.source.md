# Aperture × Pedagogue Correlated Noise Geometry Receipt v0.1

Status: WITNESSED / BOUNDED SYNTHETIC SUPPORT / RESEARCH-ONLY

Exact witnessed source head: `01fb82ad3b2e3bdfd00a90c0d7d7ea69d5259330`

Validation workflow: `TD613 Consolidated Validation`

Witness run: `1833 / 32320993363`

Static / constitutional / release estate: PASS

Browser families: SKIPPED BY DESIGN

Standalone Aperture UI mutated: FALSE

TD613.com deployment: HELD

## Question witnessed

Can two rank-lifting probes with identical marginal observation variances receive different stability orderings once their shared error direction is represented by full off-diagonal covariance?

## Frozen fixture

```text
S* = [2,3]^T
B = [1,0]
P_DUP  = [1,0]
P_ORTH = [0,1]
P_DIAG = [1,1]/sqrt(2)

marginal variances = [1,1]
Sigma = [[1,0.9],
         [0.9,1]]
```

The full covariance is symmetric positive definite. Whitening used the declared Cholesky relation `Sigma = L L^T` and `A_w = L^(-1) A`.

## Exact deterministic values on the witnessed implementation

```text
diagonal_only_choice = P_ORTH
full_covariance_choice = P_DIAG

P_ORTH:
sigma_min_full_covariance = 0.725476250110012
sigma_max_full_covariance = 3.16227766016838
condition_number_full_covariance = 4.358898943540674
reconstruction_error = 0.011799580098116
held_out_residual = 0.002375100220298

P_DIAG:
sigma_min_full_covariance = 0.947880400291132
sigma_max_full_covariance = 1.711412337262568
condition_number_full_covariance = 1.805515059428303
reconstruction_error = 0.009462389779567
held_out_residual = 0.00078323668019

standardized perturbation z = [0.01/sqrt(2), 0.01/sqrt(2)]
physical perturbation eta = [0.007071067811865, 0.009446168032163]
```

## Hostile controls witnessed

```text
missing P_DIAG joint covariance:
selected_probe_id = null
selection_status = NO_GLOBAL_WIDENING_SELECTION_MISSING_JOINT_NOISE_GEOMETRY
best_declared_subset_probe_id = P_ORTH

invalid covariance [[1,1.05],[1.05,1]]:
positive_definite_status = INVALID_NOISE_GEOMETRY_NOT_POSITIVE_DEFINITE
selection_status = INVALID_NOISE_GEOMETRY_PRESENT_NO_SELECTION
selected_probe_id = null
```

No covariance repair, diagonal substitution, hidden jitter, or independence default was permitted.

## Bounded interpretation

Within this authored local synthetic inverse problem:

```text
different probe directions != independent noise directions
same marginal variances != same joint noise geometry
diagonal covariance != full covariance
known variances != known correlations
positive rank lift != independent evidence
full rank != stable reconstruction
widening proposal != widening execution
widening != validation
```

The result supports only:

```text
CORRELATED_NOISE_WIDENING_REFINEMENT_CANDIDATE
MISSING_JOINT_NOISE_GEOMETRY_ABSTENTION_SUPPORTED_IN_BOUNDED_SYNTHETIC_FIXTURE
```

## Claim ceiling

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
```

## Preserved next question

The existing selector family still assumes that `rank_lift > 0` is the primary admission criterion. Once the current operator is already full-rank, that criterion becomes silent even when reconstruction is badly conditioned.

The next admissible assay therefore asks whether **the type of admitted epistemic deficit should determine the kind of next synthetic question sought**:

```text
rank deficit      -> seek a probe that contracts nullity, then audit uncertainty-aware stability
stability deficit -> seek a probe that improves whitened conditioning even though rank cannot increase
no declared local deficit -> do not manufacture a question merely because candidates exist
missing/invalid uncertainty geometry -> abstain or reject before ranking
```

This prospective object is an experiment-design state, not an optimal-design law.

Human closure remains required.
