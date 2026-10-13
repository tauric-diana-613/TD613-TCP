# Aperture × Pedagogue Conditioning-Aware Widening Gauntlet v0.1

Status: AUTHORED / PRE-IMPLEMENTATION / RESEARCH-ONLY / A15-R0 PHASE-FREE

Authority: NONE. No production, sensor, custody, deployment, prediction, physical-tomography, or experiment-execution authority.

## Question

The prior A15-R0 assay established a bounded rule: a predeclared next observation may be useful when it increases local operator/Jacobian rank and contracts current nullity. This gauntlet tests the failure mode that follows immediately: **rank lift can be mathematically real while reconstruction remains numerically fragile.**

Aperture v3.1-alpha contributes the governing law: widening increases observability; widening does not manufacture validity, proof, authority, or truth.

Research question:

> Can Pedagogue propose a rank-augmenting question while Aperture independently distinguishes robust widening from nearly singular widening under the same declared scale, observation budget, and perturbation posture?

## Jurisdiction

- Pedagogue: represent the identifiability deficit and propose from a predeclared probe family.
- Aperture: evaluate conditioning, signed reconstruction residue, abstention, and replay; never promote observability into validation.
- Dome-World: synthetic experiment host.
- Ash: no live custody binding.
- Human: closure and any future promotion.

The standalone Aperture UI is not modified. The full laboratory remains Dome-World-side.

## Frozen state and base operator

```text
S* = [x,y]^T = [2,3]^T
B = [1,0]
rank(B)=1
nullity(B)=1
```

The y direction is unseen by the base observation.

## Declared comparison law

Every candidate row is normalized to unit Euclidean norm before conditioning comparison. The synthetic noise posture declares equal variance across the observations. Raw coefficient scaling may not manufacture a conditioning advantage.

This normalization is fixture-specific. A physical or heteroscedastic system would require a declared covariance/whitening law.

## Predeclared probes

```text
P_DUP  raw [1,0]       -> expected rank lift 0
P_NEAR raw [1,0.001]   -> expected rank lift 1, nearly parallel to B
P_ORTH raw [0,1]       -> expected rank lift 1, orthogonal to B
```

Expected normalized conditioning posture:

```text
P_NEAR:
sigma_max ≈ 1.41421339
sigma_min ≈ 0.0007071065
condition_number_2 ≈ 2000.0005
noise_amplification_proxy ≈ 1414.2141

P_ORTH:
sigma_max = 1
sigma_min = 1
condition_number_2 = 1
noise_amplification_proxy = 1
```

## Selection law

1. Prefer positive rank lift.
2. Among equal rank-lifting candidates under the declared equal-noise normalization, maximize the smallest singular value of the augmented operator.
3. Equivalently in this bounded fixture, minimize the 2-norm condition number.
4. Stable probe-id ordering is only a final tie-break.

This is a local authored heuristic, not an optimal-experimental-design theorem.

## Frozen perturbation witness

```text
eta = [0.01,-0.01]^T
```

This is deterministic perturbation, not an empirical error-rate model.

For each full-rank candidate, construct normalized `A_P`, then:

```text
O_P = A_P S* + eta
S_hat_P = least_squares(A_P,O_P)
```

Expected:

```text
P_ORTH: S_hat ≈ [2.01,2.99], L2 error ≈ 0.0141421356
P_NEAR: S_hat ≈ [2.01,-17.000005], L2 error ≈ 20.0000075
```

P_DUP remains rank deficient and receives no full-rank stability classification.

## Held-out witness

```text
H(S)=x-y
H(S*)=-1
```

Expected absolute held-out residuals:

```text
P_ORTH ≈ 0.02
P_NEAR ≈ 20.010005
```

Held-out performance witnesses the selected geometry **after** selection. It may not be consulted to choose the candidate.

## Required classifications

```text
RANK_DEFICIENT
FULL_RANK_FRAGILE_UNDER_DECLARED_SCALE_NOISE_POSTURE
FULL_RANK_ROBUST_RELATIVE_TO_CANDIDATE_FAMILY
```

`ROBUST` is strictly relative to this authored candidate family and perturbation posture.

## Required Aperture receipt

Preserve at least:

```text
source_status
operator_basis
normalization_law
noise_posture
rank_before
rank_after
rank_lift
sigma_min
sigma_max
condition_number_2
noise_amplification_proxy
selection_reason
held_out_not_used_for_selection
perturbation_reconstruction_error
held_out_residual
alternatives
missingness
abstention
claim_ceiling
```

The receipt must state:

```text
widening != validation
rank_lift != practical_recoverability
formal_identifiability != stable_reconstruction
```

## Hostile requirements

Fail if:

- P_NEAR and P_ORTH receive the same conditioning score;
- coefficient rescaling can win without normalization;
- P_DUP receives positive rank-lift credit;
- held-out truth enters probe selection;
- the earlier rank-lift rule is silently overwritten rather than refined;
- Aperture grants action, prediction, production, physical-sensor, or validation authority;
- standalone Aperture UI is changed for this assay.

## Bounded hypothesis

```text
H_CONDITIONING_AWARE_WIDENING:
Within a declared local linear inverse problem and equal-noise normalization,
two candidate probes can produce the same positive rank lift while differing sharply in numerical conditioning;
therefore rank lift alone is insufficient to characterize practical reconstruction stability.
```

## Claim ceiling

```text
optimal_experimental_design = false
active_learning_theorem = false
fisher_information_optimality = false
physical_sensor_design = false
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

A passing gauntlet may support only:

```text
CONDITIONING_AWARE_IDENTIFIABILITY_REFINEMENT_CANDIDATE
```

## Next question if this passes

Only after this assay survives may A15-R0 ask whether candidate observations should be compared under a declared noise covariance / whitened Jacobian rather than equal-noise row normalization.
