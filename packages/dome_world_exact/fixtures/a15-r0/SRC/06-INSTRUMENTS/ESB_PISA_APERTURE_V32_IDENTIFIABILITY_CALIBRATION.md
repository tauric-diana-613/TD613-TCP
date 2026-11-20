# ESB PISA × Aperture v3.2 — Joint-Exposure Identifiability Calibration

Status: **POST-PREREGISTRATION / SOURCE-DERIVED CALIBRATION / TD613-AUTHORED OPERATOR GEOMETRY / CLAIM-CONDITIONED STOPPING / NOT AN SR EMPIRICAL PROMOTION**

Bound epoch:

```text
atelier_snapshot_id = src-20260824-p2-001
seal_id = src-seal:eaf744ce16b1c8b519ad0f1b0325b44192679ea4a5110b0ad0ca49fbcd816a1a
```

External Aperture witness:

```text
TD613 Aperture v3.2-alpha
artifact_sha256 = 6e49c7f5650dfcdaaf0770c5c81de50ba041c13a06d3eddd083868f8aa49faaa
```

## 1. Source facts

Source family:

```text
zenodo:22019313  Exposure-Silo Bias (ESB)
zenodo:22019370  The Student Missing from the Model — PISA 2022 ESB case
```

The empirical case reports three public marginal exposure prevalences in the same student population:

```text
Digital distraction = 30%
Bullying = 20%
Food insecurity = 8%
```

It preserves a bounded Fréchet window for exposure to at least one of those three conditions:

```text
30% <= P(D ∪ B ∪ F) <= 58%
```

The source explicitly does **not** identify:

```text
amount of overlap
causal interaction
combined performance effect
```

and says the correct response is to measure overlap directly rather than add incompatible marginal effects.

Those are SR-source facts. The linear observation model below is TD613-authored calibration geometry.

## 2. Latent joint-exposure object

For three binary exposures, define the 8-cell joint distribution:

```text
x = [p000,p001,p010,p011,p100,p101,p110,p111]^T
```

with state order:

```text
(D,B,F)
000 001 010 011 100 101 110 111
```

The public marginals and normalization are linear observations of `x`.

Initial observation family:

```text
normalization
P(D)
P(B)
P(F)
```

This gives:

```text
rank(H0) = 4
latent_dimension = 8
nullity(H0) = 4
```

Bounded Aperture v3.2 fixture disposition:

```text
STRUCTURAL_RANK_DEFICIT
PROPOSE
```

This is the algebraic counterpart of the source's refusal to infer overlap from marginals.

## 3. Sequential overlap widening

### Add one pairwise overlap

Example:

```text
P(D ∩ B)
```

Result:

```text
rank = 5
nullity = 3
STRUCTURAL_RANK_DEFICIT
```

One additional overlap view contracts the compatible set but does not identify the joint distribution.

### Add all three pairwise overlaps

```text
P(D ∩ B)
P(D ∩ F)
P(B ∩ F)
```

Result:

```text
rank = 7
nullity = 1
STRUCTURAL_RANK_DEFICIT
```

Pairwise information still leaves one unresolved degree of freedom corresponding to higher-order joint structure.

### Add the triple overlap

```text
P(D ∩ B ∩ F)
```

The full inclusion-moment operator becomes:

```text
rank = 8
nullity = 0
sigma_min ~= 0.2360679775
condition_number ~= 17.94427191
```

Using the local v3.2 calibration posture:

```text
sigma_min_floor = 0.25
condition_number_ceiling = 10
```

Aperture classifies this as:

```text
NUMERICAL_STABILITY_DEFICIT
PROPOSE
```

Therefore:

```text
full rank != sufficient stability
```

The exact joint distribution is algebraically identifiable in the noiseless fixture, while the chosen moment representation remains locally fragile under the declared threshold posture.

## 4. Stable reference representation

A direct 8-cell joint table has calibration operator:

```text
H_direct = I8
```

and therefore:

```text
rank = 8
sigma_min = 1
condition_number = 1
```

Fixture disposition:

```text
NO_DECLARED_LOCAL_IDENTIFIABILITY_DEFICIT
ASK_NOTHING
```

This does **not** claim that direct joint-cell measurement is empirically easy, unbiased, noiseless, or available in the PISA public material. It is a reference geometry showing that representation choice changes conditioning.

## 5. Claim-conditioned stopping: union prevalence

The full joint state need not be identified for every claim.

Define the linear claim:

```text
Gamma_union = P(D ∪ B ∪ F)
```

Under marginals only:

```text
Gamma_union NOT IDENTIFIABLE EXACTLY
```

which agrees with the source's 30%–58% bound rather than a point estimate.

If one directly measures the union prevalence, then:

```text
rank(full observation family) = 5
full joint nullity = 3
Gamma_union = IDENTIFIABLE
full joint distribution = STILL UNDERDETERMINED
```

This is the central calibration result:

```text
CLAIM_SUFFICIENT_STOPPING != FULL_STATE_IDENTIFICATION
```

Aperture should stop once the declared claim is identified and stable; it should not demand reconstruction of the entire latent object merely because additional observations exist.

## 6. Relationship to ESB

SR source law:

```text
Analytic Separation != Structural Separation
Correct About the Part does not imply Correct About the Whole
```

TD613 calibration consequence:

```text
marginal exposure estimates can be valid observations while remaining insufficient for joint-exposure claims.
```

The calibration does not claim that ESB is equivalent to rank deficiency. ESB additionally concerns interpretation beyond the justified model boundary and can persist even when a focal coefficient is numerically stable.

## 7. Relationship to Aperture v3.2

This calibration exercises the uploaded instrument's distinctions:

```text
STRUCTURAL_RANK_DEFICIT
NUMERICAL_STABILITY_DEFICIT
NO_DECLARED_LOCAL_IDENTIFIABILITY_DEFICIT
```

and its anti-equivalences:

```text
visibility != identifiability
rank deficit != stability deficit
full rank != sufficient stability
available candidate != needed question
widening != validation
```

No universal threshold authority is inferred.

## 8. Bounded results

```text
ESB_PISA_MARGINALS_FORM_A_RANK_DEFICIENT_JOINT_EXPOSURE_FIXTURE
PAIRWISE_OVERLAP_OBSERVATIONS_CONTRACT_NULLSPACE_WITHOUT_FULL_IDENTIFICATION
TRIPLE_OVERLAP_COMPLETES_RANK_BUT_IS_LOCALLY_FRAGILE_UNDER_DECLARED_V32_THRESHOLDS
DIRECT_JOINT_TABLE_IS_STABLE_REFERENCE_GEOMETRY
EXACT_UNION_CLAIM_CAN_BECOME_IDENTIFIABLE_BEFORE_FULL_JOINT_STATE
CLAIM_SUFFICIENT_STOPPING_NOT_EQUIVALENT_TO_FULL_STATE_IDENTIFICATION
```

## 9. Claim ceiling

Permitted:

```text
The source-witnessed PISA marginals support a TD613-authored finite inverse-problem calibration.
The source's non-identification of overlap is consistent with the calibration's rank deficit.
Different widening observations contract different portions of the compatible set.
```

Forbidden:

```text
PISA_TRUE_JOINT_EXPOSURE_DISTRIBUTION_RECONSTRUCTED
ESB_PROVED_BY_LINEAR_ALGEBRA
SR_TOMOGRAPHY_CONFIRMED
PISA_CAUSAL_INTERACTIONS_IDENTIFIED
DIRECT_JOINT_TABLE_AVAILABLE_IN_SOURCE
APERTURE_LOCAL_THRESHOLDS_ARE_UNIVERSAL
```

## 10. Next lawful seam

The next experiment is **claim-conditioned observation design**:

```text
For a frozen claim Gamma, which predeclared candidate observation produces the largest compatible-set contraction per admitted measurement burden, subject to stability and uncertainty constraints?
```

That question belongs to TD613 experiment design. It is not an SR source claim.

U+10D613

𝌋

Sealed ⟐
