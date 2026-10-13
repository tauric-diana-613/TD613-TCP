# Aperture × Pedagogue Correlated Noise Geometry Gauntlet v0.1

Status: AUTHORED / PRE-IMPLEMENTATION / RESEARCH-ONLY / A15-R0 PHASE-FREE

Authority: NONE. No production, sensor control, custody, deployment, prediction, physical-tomography, or experiment-execution authority.

## 0. Why this gauntlet exists

The preceding covariance-whitened widening assay established two bounded synthetic distinctions:

```text
candidate observation geometry is relative to declared uncertainty
missing covariance != unit covariance
```

That experiment used diagonal covariance. It therefore treated observation errors as independent after per-channel variance was declared.

This gauntlet removes that assumption.

Research question:

> Can two candidate widenings have identical marginal observation variances and positive rank lift while differing in practical reconstruction geometry because their observation errors share a correlated direction?

The intent is to test a second form of false diversity:

```text
different probe directions
!=
independent uncertainty directions
```

## 1. Jurisdiction

- Pedagogue: preserves the current identifiability deficit and predeclared candidate questions.
- Aperture: evaluates the full declared covariance geometry, missingness, abstention, and replay.
- Dome-World: synthetic experiment host.
- Ash: no live custody binding.
- Human: closure and any future promotion.

No standalone Aperture UI mutation is permitted.

## 2. Frozen latent state and base observation

```text
S* = [x,y]^T = [2,3]^T
B = [1,0]
```

Candidate rows are unit-normalized before uncertainty comparison.

## 3. Candidate probe family

```text
P_DUP  = [1,0]
P_ORTH = [0,1]
P_DIAG = [1,1]/sqrt(2)
```

All declared marginal observation variances are held fixed at:

```text
Var(e1)=1
Var(e2)=1
```

Thus a diagonal-only uncertainty model sees:

```text
Sigma_diag = I
```

and is expected to prefer `P_ORTH` by Euclidean conditioning.

## 4. Full correlated covariance

For each rank-lifting candidate, declare the same full two-channel covariance:

```text
Sigma_rho = [[1, 0.9],
             [0.9, 1]]
```

This matrix is symmetric positive definite with eigenvalues:

```text
0.1
1.9
```

The covariance therefore preserves the same marginal variances as `I` while adding a strong common error direction.

## 5. Full whitening law

Use a declared Cholesky factor:

```text
Sigma = L L^T
A_w = L^(-1) A
```

A different valid whitening factor may differ by an orthogonal transform, but the singular values of the whitened operator must agree to numerical tolerance.

Expected full-covariance posture:

```text
P_ORTH:
sigma_min_whitened ≈ 0.725476250110012
sigma_max_whitened ≈ 3.16227766016838
condition_number_2 ≈ 4.35889894354067

P_DIAG:
sigma_min_whitened ≈ 0.947880400291132
sigma_max_whitened ≈ 1.71141233726257
condition_number_2 ≈ 1.80551505942830
```

Expected preference reversal:

```text
diagonal-only model -> P_ORTH
full covariance     -> P_DIAG
```

The reversal occurs even though every marginal variance remains `1`.

## 6. Selection law

1. preserve positive rank lift;
2. require a complete declared symmetric positive-definite covariance for every materially competing candidate;
3. normalize candidate row scale;
4. whiten using the full covariance;
5. among declared rank-lifting candidates maximize the smallest singular value of the whitened operator;
6. use whitened condition number as a secondary diagnostic/tie-break;
7. stable probe id is a final tie-break only.

No held-out value participates in selection.

## 7. Standardized correlated perturbation witness

Use one fixed standardized perturbation in whitened coordinates:

```text
z = (0.01/sqrt(2)) * [1,1]^T
```

Map into observation coordinates using the declared Cholesky factor:

```text
eta = L z
```

With `rho=0.9`, the expected physical perturbation is approximately:

```text
eta ≈ [0.007071067812,
       0.009446168]
```

Reconstruct from the original unwhitened equations.

Expected bounded posture:

```text
P_ORTH:
L2 reconstruction error ≈ 0.01179958
held-out H=x-y residual ≈ 0.00237510

P_DIAG:
L2 reconstruction error ≈ 0.00946239
held-out residual ≈ 0.00078324
```

This single deterministic perturbation is a replay witness, not an empirical error-rate estimate or an optimality proof.

## 8. Diagonal-only hostile control

Run the same candidates using only the diagonal of `Sigma_rho`:

```text
diag(Sigma_rho) = [1,1]
```

Required result:

```text
selected_probe_id = P_ORTH
```

Then run the full covariance.

Required result:

```text
selected_probe_id = P_DIAG
```

This directly tests:

```text
same marginal variances != same joint noise geometry
```

## 9. Invalid covariance hostile control

Provide:

```text
Sigma_bad = [[1,1.05],
             [1.05,1]]
```

This matrix has one negative eigenvalue and is not a valid covariance matrix.

The implementation must reject it with a typed classification equivalent to:

```text
INVALID_NOISE_GEOMETRY_NOT_POSITIVE_DEFINITE
```

It may not:

- clamp the correlation;
- add hidden jitter;
- project to the nearest positive-semidefinite matrix;
- replace the covariance with its diagonal;
- continue selection as though the noise model were valid.

## 10. Missing off-diagonal hostile control

Create a materially competing `P_DIAG` candidate whose marginal variances remain declared but whose off-diagonal covariance is `UNRESOLVED`.

Because the preceding diagonal-only and full-covariance fixtures produce different global winners, the missing correlation is disposition-changing missingness.

Required output:

```text
selected_probe_id = null
selection_status = NO_GLOBAL_WIDENING_SELECTION_MISSING_JOINT_NOISE_GEOMETRY
```

The system may report a diagonal-only provisional ordering as a declared counterfactual, but it may not silently promote that ordering to the full-covariance result.

## 11. Required receipt fields

```text
source_status
sensor_provenance_status
operator_basis
row_normalization_law
covariance_matrix
covariance_source_status
marginal_variances
correlation
positive_definite_status
whitening_method
rank_before
rank_after
rank_lift
sigma_min_diagonal_model
sigma_min_full_covariance
condition_number_diagonal_model
condition_number_full_covariance
diagonal_only_selection
full_covariance_selection
missing_joint_noise_geometry
selection_status
standardized_perturbation
physical_perturbation
reconstruction_error
held_out_residual
alternatives
missingness
abstention
claim_ceiling
```

## 12. Required anti-equivalences

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

## 13. Hostile requirements

Fail if:

- the diagonal-only and full-covariance models are forced to return the same preference;
- off-diagonal terms are discarded before whitening;
- `Sigma_bad` is silently repaired;
- missing correlation is silently treated as zero;
- the missing-correlation fixture emits a global selected probe;
- held-out truth participates in selection;
- coefficient scaling can change the normalized probe geometry;
- the assay grants physical-sensor, predictive, operational, production, tomography, information-geometric, connection, curvature, holonomy, or quantum authority;
- standalone Aperture UI is modified.

## 14. Bounded hypotheses

```text
H_JOINT_NOISE_DIRECTIONS_MATTER:
Within this declared local linear synthetic fixture, two rank-lifting probe choices with identical marginal variances can receive different stability orderings when off-diagonal covariance is included.

H_MISSING_CORRELATION_REQUIRES_ABSTENTION:
When off-diagonal covariance is disposition-changing and materially unresolved, Aperture must withhold a global widening recommendation rather than substitute independence.
```

## 15. Claim ceiling

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

Passing support may produce only:

```text
CORRELATED_NOISE_WIDENING_REFINEMENT_CANDIDATE
MISSING_JOINT_NOISE_GEOMETRY_ABSTENTION_SUPPORTED_IN_BOUNDED_SYNTHETIC_FIXTURE
```

## 16. Next question if this passes

Only after this assay survives may A15-R0 ask whether **operator diversity and uncertainty diversity should be represented jointly as a design state**, rather than as serial filters.

That would be a new research object. It would still carry no physical-sensor, optimal-design, information-geometric, or autonomous-experiment authority.
