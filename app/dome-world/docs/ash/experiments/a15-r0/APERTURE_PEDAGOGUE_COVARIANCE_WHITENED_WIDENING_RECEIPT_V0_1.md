# Aperture × Pedagogue Covariance-Whitened Widening Receipt v0.1

Status: WITNESSED / BOUNDED SYNTHETIC SUPPORT / RESEARCH-ONLY

Exact witnessed source head: `57620848c615a18d2b5a9b1e42c288e54168f5e5`

Validation workflow: `TD613 Consolidated Validation`

Witness run: `1828 / 32320471336`

Static / constitutional / release estate: PASS

Browser families: SKIPPED BY DESIGN

Standalone Aperture UI mutated: FALSE

TD613.com deployment: HELD

## Question witnessed

Can a candidate widening preference change when declared observation uncertainty enters the comparison geometry, and must the instrument abstain when a materially competing candidate lacks a comparable noise model?

## Frozen fixture

```text
S* = [2,3]^T
B = [1,0]
base variance = 1

P_DUP  = [1,0], variance 1
P_ORTH = [0,1], variance 100
P_DIAG = [1,1]/sqrt(2), variance 1
```

Whitening law:

```text
A_w = Sigma^(-1/2) A
```

for the declared diagonal synthetic covariance.

## Exact deterministic values on the witnessed head

```text
euclidean_choice = P_ORTH
whitened_choice = P_DIAG

P_ORTH:
sigma_min_whitened = 0.1
condition_number_whitened = 9.999999999999995
reconstruction_error = 0.100498756211209
held_out_residual = 0.11

P_DIAG:
sigma_min_whitened = 0.541196100146197
condition_number_whitened = 2.414213562373095
reconstruction_error = 0.026131259297526
held_out_residual = 0.03414213562373

missing_noise_status = NO_GLOBAL_WIDENING_SELECTION_MISSING_NOISE_GEOMETRY
selected_when_missing = null
best_declared_subset_probe_id = P_ORTH

next_learning_action = TEST_CORRELATED_COVARIANCE_AND_JOINT_NOISE_DIRECTIONS_BEFORE_ANY_INFORMATION_GEOMETRY_PROMOTION
promotion_authority = false
```

The tiny floating difference between `10` and `9.999999999999995` is an IEEE-754 witness detail and was handled by the already-declared numerical tolerance; no fixture or hypothesis changed.

## Bounded interpretation

Within this authored synthetic local inverse problem:

```text
candidate observation geometry is relative to a declared uncertainty model
missing covariance != unit covariance
known forward row != known observation reliability
widening proposal != widening execution
widening != validation
```

The covariance-aware selector reversed the equal-variance Euclidean preference because `P_ORTH` carried substantially greater declared observation variance. When `P_DIAG` remained a materially competing rank-lifting candidate but its variance was withheld, Aperture refused a global recommendation rather than silently imputing reliability.

## Support status

```text
UNCERTAINTY_WEIGHTED_WIDENING_REFINEMENT_CANDIDATE
MISSING_NOISE_GEOMETRY_ABSTENTION_SUPPORTED_IN_BOUNDED_SYNTHETIC_FIXTURE
```

These are research refinement candidates only.

## Claim ceiling

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

## Preserved next question

Marginal variances do not encode correlations among observation channels. The next admissible fixture must hold marginal variances fixed while changing off-diagonal covariance and ask whether the full joint noise geometry changes the preferred widening. Non-positive-definite covariance must be rejected rather than silently repaired.

Human closure remains required.
