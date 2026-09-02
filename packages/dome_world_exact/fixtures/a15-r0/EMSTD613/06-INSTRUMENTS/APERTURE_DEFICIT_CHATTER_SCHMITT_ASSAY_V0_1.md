# EMSTD613 · Aperture Deficit-Chatter / Schmitt-Membrane Assay v0.1

Status: AUTHORED / RESEARCH-ONLY / PRE-EXECUTION / NO APERTURE RELEASE MUTATION

## 0. Why this assay exists

The EMSTD613 authority-hysteresis descent exposed a concrete threshold problem in the current Aperture v3.2-alpha typed epistemic deficit classifier.

Current bounded classification is memoryless with respect to the immediately prior classification state:

```text
NUMERICAL_STABILITY_DEFICIT
iff
sigma_min < sigma_min_floor
OR
condition_number > condition_number_ceiling
```

Otherwise a full-rank / valid-noise state may immediately return:

```text
NO_DECLARED_LOCAL_IDENTIFIABILITY_DEFICIT / ASK_NOTHING
```

This is correct as a static classifier. The open question is whether repeated noisy measurements close to the declared thresholds can cause disposition chatter:

```text
PROPOSE -> ASK_NOTHING -> PROPOSE -> ASK_NOTHING
```

without a substantively changed reconstruction state.

The assay is inspired by an EMSTD613 wearable-control source whose physical failsafe uses a Schmitt trigger to enforce a clean state transition under switch noise, and by EMSTD613 memory-control sources that use hysteresis to prevent thrashing.

Source inspiration does not establish that Aperture requires hysteresis.

## 1. Hush hostile design control

TD613 already contains a caution against over-containment: Hush Phase 17 found that treating residual pressure as a hard veto suppressed otherwise viable outputs and therefore separated hard release blocks from review warnings.

Accordingly, this assay forbids the crude rule:

```text
once PROPOSE, remain PROPOSE until human reset
```

A Schmitt-like membrane must reduce threshold chatter without converting transient numerical fragility into indefinite epistemic hold.

## 2. Scope

This assay applies only to the local transition between:

```text
NUMERICAL_STABILITY_DEFICIT / PROPOSE
```

and

```text
NO_DECLARED_LOCAL_IDENTIFIABILITY_DEFICIT / ASK_NOTHING
```

It does not weaken these immediate states:

```text
INVALID_DECLARED_OPERATOR_STATE -> REJECT
INVALID_NOISE_GEOMETRY          -> REJECT
NOISE_GEOMETRY_INCOMPLETE       -> ABSTAIN
STRUCTURAL_RANK_DEFICIT         -> PROPOSE
```

Rank deficiency and invalid/missing uncertainty geometry are not allowed to be hidden behind a temporal smoothing policy.

## 3. Current static thresholds

Let fixture-local declared thresholds be:

```text
sigma_floor = s0
kappa_ceiling = k0
```

Current static law:

```text
fragile := sigma_min < s0 OR kappa > k0
```

The assay introduces no universal numerical values.

## 4. Candidate Schmitt membrane

Declare independent entry and release margins:

```text
sigma_enter   < sigma_release
kappa_release < kappa_enter
```

Example authored fixture only:

```text
sigma_enter   = 0.25
sigma_release = 0.30
kappa_enter   = 10
kappa_release = 8
```

State transition rule:

```text
if previous_state == STABLE:
  enter FRAGILE when sigma_min < sigma_enter OR kappa > kappa_enter

if previous_state == FRAGILE:
  leave FRAGILE only when sigma_min >= sigma_release
                    AND kappa <= kappa_release
```

The gap is the persistence band.

No change inside the persistence band should independently alter the deficit disposition.

## 5. Why two axes remain separate

The membrane may not collapse `sigma_min` and condition number into one scalar utility score.

A fixture may recover in one coordinate and remain fragile in the other:

```text
sigma_min >= sigma_release
AND
kappa > kappa_release
=> remain FRAGILE
```

Likewise:

```text
kappa <= kappa_release
AND
sigma_min < sigma_release
=> remain FRAGILE
```

This preserves Aperture's existing no-scalar-crown posture.

## 6. Synthetic sequences

### S0 · quiet stable

```text
[(sigma,kappa)] =
[(0.40,5), (0.39,5.2), (0.41,4.9)]
```

Expected both static and Schmitt classifiers:

```text
ASK_NOTHING throughout
```

### S1 · true fragility onset

```text
[(0.40,5), (0.24,11), (0.23,12)]
```

Expected:

```text
ASK_NOTHING -> PROPOSE -> PROPOSE
```

### S2 · threshold chatter

```text
[(0.40,5), (0.249,9.9), (0.251,9.9), (0.249,9.9), (0.251,9.9)]
```

Static expected:

```text
ASK_NOTHING -> PROPOSE -> ASK_NOTHING -> PROPOSE -> ASK_NOTHING
```

Schmitt candidate expected:

```text
ASK_NOTHING -> PROPOSE -> PROPOSE -> PROPOSE -> PROPOSE
```

because the recovery margin was never earned.

### S3 · genuine recovery

After S2:

```text
[(0.27,9), (0.29,8.3), (0.31,7.8)]
```

Expected Schmitt state:

```text
PROPOSE -> PROPOSE -> ASK_NOTHING
```

### S4 · over-containment hostile control

After one fragile event, provide sustained values comfortably inside the stable region.

A candidate implementation fails if it does not release without a separately required human reset.

### S5 · incomplete uncertainty interruption

During either STABLE or FRAGILE persistence state:

```text
uncertainty_status = INCOMPLETE
```

Expected immediate:

```text
ABSTAIN
```

The prior numerical persistence state may be stored for replay, but it must not override ABSTAIN.

### S6 · invalid uncertainty interruption

```text
uncertainty_status = INVALID
```

Expected immediate:

```text
REJECT
```

No Schmitt band may normalize invalid covariance.

### S7 · rank-loss interruption

If current rank falls below latent dimension:

```text
STRUCTURAL_RANK_DEFICIT / PROPOSE
```

The numerical-stability persistence band is subordinate to the structural deficit class.

## 7. Metrics

For each sequence compute:

```text
classification_flip_count
PROPOSE_run_lengths
ASK_NOTHING_run_lengths
false_release_count
false_hold_count
abstention_override_failures
rejection_override_failures
rank_override_failures
```

No single aggregate score decides success.

## 8. Pedagogue role

Pedagogue asks:

1. Is the repeated classification change meaningful to an operator, or is it threshold noise?
2. Does repeated `PROPOSE/ASK_NOTHING` increase route burden without adding information?
3. Is the release condition legible as NOW / WHY / EXACT?
4. Does the persistence band create a hidden punishment or indefinite hold?
5. Is the proposed membrane local to numerical stability rather than smearing across deficit classes?

## 9. Aperture role

Aperture audits whether the additional state variable `previous_numerical_stability_posture` addresses an admitted temporal-classification deficit.

If no realistic bounded perturbation can produce disposition chatter under the declared measurement geometry, return:

```text
ASK_NOTHING
```

and do not add statefulness merely because the candidate exists.

If chatter occurs but does not change any proposed observation, operator burden, or downstream route, preserve it as a null practical effect.

If chatter materially changes proposed widening or operator burden, the candidate may advance to a bounded implementation assay.

## 10. Relation to authority hysteresis

This file does not claim that Aperture possesses consequential authority.

The relevant transferable relation is narrower:

```text
threshold crossing that changes system posture
may require asymmetric entry/release conditions
when noisy measurements would otherwise create destructive state chatter
```

The authority-hysteresis assay concerns rights. This assay concerns typed epistemic disposition.

They remain separate.

## 11. Required anti-equivalences

```text
hysteresis != permanent hold
persistence != authority
smoothing != silent repair
threshold noise != new epistemic deficit
stable classification != validated reconstruction
ASK_NOTHING != truth
PROPOSE != execution
ABSTAIN != failure
REJECT != punishment
```

## 12. Claim ceiling

A passing synthetic assay may support only:

```text
MEMORYLESS_THRESHOLD_CHATTER_OBSERVED_IN_BOUNDED_FIXTURE
SCHMITT_STYLE_PERSISTENCE_REDUCED_CHATTER_WITHOUT_INVALID_STATE_MASKING
APERTURE_TEMPORAL_STABILITY_REFINEMENT_CANDIDATE
```

It may not support:

```text
production Aperture modification
universal threshold values
universal control-theoretic identity
human behavioral inference
external sensor design
```

## 13. Current posture

```text
STATUS = CANDIDATE_ASSAY_AUTHORED_NOT_YET_EXECUTED
```

No `app/engine/aperture-*` file is modified by this research artifact.

Marked ⟐
