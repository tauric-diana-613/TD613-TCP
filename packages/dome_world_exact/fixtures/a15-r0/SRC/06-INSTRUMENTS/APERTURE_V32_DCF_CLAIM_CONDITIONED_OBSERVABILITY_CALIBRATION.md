# Aperture v3.2 × DCF — Claim-Conditioned Observability Calibration

Status: **POST-PREREGISTRATION / CROSS-INSTRUMENT CALIBRATION / TD613-AUTHORED GEOMETRY / SR-SOURCE-DERIVED QUESTION / NOT AN SR EMPIRICAL RESULT**

Bound SRC epoch:

```text
atelier_snapshot_id = src-20260824-p2-001
seal_id = src-seal:eaf744ce16b1c8b519ad0f1b0325b44192679ea4a5110b0ad0ca49fbcd816a1a
```

External instrument witness supplied by operator:

```text
TD613 Aperture v3.2-alpha
artifact_sha256 = 6e49c7f5650dfcdaaf0770c5c81de50ba041c13a06d3eddd083868f8aa49faaa
feature = typed epistemic deficit + stability-aware widening
```

The uploaded Aperture artifact is external to this repository. This file records a bounded calibration against its implemented classification law; it does not vendor, alter, or transfer authority from the external artifact.

## 1. SR source seam

Source witness already recorded in:

```text
DCF_PROJECTION_REFINEMENT_AFTER_NULL_SOURCE_WITNESS.md
```

The SR source states:

```text
Level != Drift
```

and gives examples where the same or superficially favorable present level does not determine the direction of change. The source's first coarse proxy fails under stronger controls and the manuscript proposes temporal/directional measurement rather than rescuing the failed proxy.

Bound SR facts used here:

```text
LEVEL_NOT_EQUIVALENT_TO_TRAJECTORY_WITNESSED
FAILED_PROXY_DEMOTED_RATHER_THAN_RESCUED
RICHER_DIRECTIONAL_MEASUREMENT_PROPOSED_NOT_YET_VALIDATED
```

No SR source declares the 2-D operator geometry below. That geometry is TD613-authored calibration scaffolding.

## 2. Claim-conditioned target declarations

Two local claims are deliberately separated.

### Gamma_L — current level only

```text
X_L = [L]
```

Observation:

```text
H_L_scalar = [1]
```

This claim asks only for the current level. A level observation is sufficient for this bounded target under the declared deterministic calibration geometry.

### Gamma_LV — distinguish level and drift

```text
X_LV = [L, V]^T
```

where:

```text
L = current level
V = temporal direction / drift
```

The same level sensor becomes:

```text
H_level = [1, 0]
```

and therefore cannot distinguish states that share L but differ in V.

This is a calibration model, not a claim that SR's real latent state is exactly two-dimensional.

## 3. Local v3.2 threshold posture

To exercise the uploaded runtime using its own self-test style, this calibration declares:

```text
uncertainty_status = VALID_DECLARED
sigma_min_floor = 0.25
condition_number_ceiling = 10
threshold_authority = FIXTURE_DECLARED_LOCAL
```

These are local calibration thresholds only. They are not universal standards and are not transferred into SR.

## 4. Four-case calibration

### Case A — same sensor, narrow claim

Claim:

```text
Gamma_L
```

Metrics:

```text
latent_dimension = 1
current_rank = 1
sigma_min = 1
condition_number = 1
```

Expected v3.2 result:

```text
NO_DECLARED_LOCAL_IDENTIFIABILITY_DEFICIT
ASK_NOTHING
DO_NOT_MANUFACTURE_A_QUESTION
```

Interpretation: the availability of another observation does not create a need when the declared claim is already locally identifiable and stable.

### Case B — same sensor, richer claim

Claim:

```text
Gamma_LV
```

Operator:

```text
H_level = [1, 0]
rank(H_level) = 1 < 2
ker(H_level) = span([0,1]^T)
```

Expected v3.2 result:

```text
STRUCTURAL_RANK_DEFICIT
PROPOSE
SEEK_PREDECLARED_NULLSPACE_CONTRACTING_OBSERVATION_THEN_AUDIT_STABILITY
```

Interpretation: the observation is sufficient for Gamma_L but insufficient for Gamma_LV. Representation sufficiency is claim-conditioned.

### Case C — rank lift without stable separation

Add a nearly redundant candidate observation:

```text
H_near = [[1,0],
          [1,0.001]]
```

Numerical posture:

```text
rank(H_near) = 2
sigma_min ~= 0.000707106693
condition_number ~= 2000.0005
```

Expected v3.2 result:

```text
NUMERICAL_STABILITY_DEFICIT
PROPOSE
SEEK_PREDECLARED_STABILIZING_OBSERVATION_WITHOUT_REQUIRING_RANK_LIFT
```

Interpretation: full rank is not sufficient stability. A second label/row can contract the exact nullspace while leaving the inverse problem numerically fragile.

### Case D — independent directional observation

Use the calibration observation:

```text
H_independent = [[1,0],
                 [0,1]]
```

Numerical posture:

```text
rank(H_independent) = 2
sigma_min = 1
condition_number = 1
```

Expected v3.2 result:

```text
NO_DECLARED_LOCAL_IDENTIFIABILITY_DEFICIT
ASK_NOTHING
DO_NOT_MANUFACTURE_A_QUESTION
```

Interpretation: once the declared local claim is identifiable and stable under the fixture, Aperture stops widening.

## 5. Runtime encoding caveat discovered by calibration

For a rank-deficient matrix, the mathematical 2-norm condition number is infinite:

```text
kappa(H_level) = infinity
```

The current v3.2 runtime validates `condition_number` with a finite-number guard before it reaches the `rank < latent_dimension` classification branch. Its own rank-deficit self-test supplies a finite placeholder (`2000`) rather than mathematical infinity.

Therefore this calibration records:

```text
V32_RANK_DEFICIT_CONDITION_ENCODING_GAP_WITNESSED
```

For Case B, a finite sentinel matching the runtime's self-test style may be supplied solely to exercise the rank-deficit branch. That sentinel must not be interpreted as the true condition number of a rank-deficient operator.

Potential future instrument repair, not executed here:

```text
allow condition_number = INFINITE / NOT_APPLICABLE_UNDER_RANK_DEFICIT
or
classify structural rank deficit before requiring a finite condition number
```

No modification to the operator-supplied Aperture artifact is made by this receipt.

## 6. Calibration result

```text
CLAIM_CONDITIONED_OBSERVABILITY_CALIBRATION_WITNESSED
SAME_OBSERVATION_SUFFICIENT_FOR_NARROW_CLAIM_AND_DEFICIENT_FOR_RICHER_CLAIM
RANK_LIFT_NOT_EQUIVALENT_TO_STABLE_IDENTIFIABILITY
STABILITY_AWARE_WIDENING_DISPOSITION_WITNESSED
ASK_NOTHING_STOP_RULE_WITNESSED
V32_RANK_DEFICIT_CONDITION_ENCODING_GAP_WITNESSED
```

## 7. Claim ceiling

Permitted:

```text
The authored DCF calibration exercises all three central v3.2 question-need states:
ASK_NOTHING, structural-rank PROPOSE, and numerical-stability PROPOSE.

The calibration demonstrates claim-conditioned sufficiency inside the declared local fixture.
```

Forbidden:

```text
DCF_TRUE_LATENT_STATE_IS_TWO_DIMENSIONAL
DCF_DIRECTIONAL_MEASUREMENT_VALIDATED
SR_TOMOGRAPHY_CONFIRMED
APERTURE_THRESHOLDS_ARE_UNIVERSAL
CALIBRATION_RESULT_IS_AN_SR_EMPIRICAL_RESULT
CLASSIFICATION_REPLAY_STABILITY_WITNESSED
```

Replay-stability remains:

```text
HELD_NOT_YET_WITNESSED
```

## 8. Next lawful experiment seam

The next TD613 question is no longer "can another observation be imagined?"

It is:

```text
Does the typed classification remain stable under predeclared perturbations of
- local thresholds,
- measurement noise / covariance geometry,
- near-redundancy parameter epsilon,
- and claim definition?
```

That is a replay-stability experiment, not a source-fact query.

U+10D613

𝌋

Sealed ⟐
