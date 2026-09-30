# Pedagogue Known-Forward Relational Reconstruction Spec v0.1

Status: **AUTHORED / PRE-IMPLEMENTATION / RESEARCH-ONLY / HUMAN-GATED**  
Parent matched-budget assay: `td613.ash.a15-r0.multi-probe-matched-budget/v0.1`  
Research question family: `KNOWN_FORWARD_OPERATOR_INVERSE_RECONSTRUCTION`  
Promotion authority: **FALSE**  
Production mutation: **NONE**

## 0. Research question

The matched-budget gauntlet established a bounded prerequisite:

```text
nonredundant probe families can carry jointly stronger constraints
than repeated observations of one projection
```

The next question is no longer classificatory:

```text
Given an explicit latent state S,
known forward operators F_i,
and partial relational observations O_i,
can A15-R0 reconstruct S
while preserving operator provenance and reconstruction uncertainty/claim ceilings?
```

This is the first A15-R0 fixture in which the inverse problem itself is executable.

Core anti-equivalences:

```text
observation
!=
latent state

repeated observation of one forward map
!=
additional operator rank

multiple differently named operators
!=
independent forward geometry

exact algebraic reconstruction in a synthetic linear fixture
!=
physical tomography

correct numerical reconstruction
without correct operator provenance
!=
valid reconstruction receipt

zero in-sample residual under mislabeled operators
!=
correct latent state
```

## 1. Latent state

Define the frozen synthetic latent state:

```text
S* = [x,y,z]^T
   = [2,3,5]^T
```

This state is available to the fixture oracle for validation but not to the reconstruction routine as an input.

Required provenance:

```text
oracle_state_exposed_to_reconstructor = false
latent_dimension = 3
```

## 2. Known relational forward operators

Define three pairwise relational probes:

```text
F12(S) = x + y
F23(S) = y + z
F13(S) = x + z
```

Matrix form:

```text
O = A S

A = [1 1 0
     0 1 1
     1 0 1]
```

For `S*=[2,3,5]^T`:

```text
O12 = 5
O23 = 8
O13 = 7

O = [5,8,7]^T
```

The matrix has:

```text
rank(A) = 3
det(A) = 2
nullity(A) = 0
```

so the noiseless latent state is uniquely identifiable within this declared linear model.

## 3. Explicit inverse map

The authored inverse is:

```text
x_hat = (O12 + O13 - O23)/2
y_hat = (O12 + O23 - O13)/2
z_hat = (O13 + O23 - O12)/2
```

For the frozen observations:

```text
S_hat = [2,3,5]^T
```

Required classification:

```text
KNOWN_FORWARD_RELATIONAL_RECONSTRUCTION_EXACT_IN_SYNTHETIC_FIXTURE
```

Required fields:

```text
forward_operator_known = true
operator_matrix_rank = 3
operator_matrix_nullity = 0
unique_reconstruction_within_declared_model = true
reconstruction = [2,3,5]
reconstruction_error_l2 = 0
physical_tomography_claim = false
```

## 4. Repetition control · rank does not grow by copying one operator

Construct a repeated-measurement operator matrix using only `F12`:

```text
A_repeat = [1 1 0
            1 1 0
            1 1 0]
```

with repeated observations:

```text
O_repeat = [5,5,5]^T
```

Required linear-algebra facts:

```text
rank(A_repeat) = 1
nullity(A_repeat) = 2
```

The compatible state family is infinite:

```text
x + y = 5
z unconstrained
```

Required classification:

```text
REPEATED_FORWARD_OPERATOR_REMAINS_UNDERDETERMINED
```

Required refusal:

```text
unique_reconstruction = false
repetition_promoted_to_operator_diversity = false
```

## 5. Redundant-label control

Construct three differently named probes:

```text
G1 = F12
G2 = F12
G3 = F12
```

The operator rows are still identical.

Required:

```text
rank(A_redundant) = 1
nullity(A_redundant) = 2
classification = REDUNDANT_OPERATOR_LABELS_DO_NOT_INCREASE_RECONSTRUCTION_RANK
```

This is the inverse-problem analogue of the parent probe-label control.

## 6. Bounded noisy observation case

Freeze a small perturbed observation vector:

```text
O_noisy = [5.1,7.9,7.0]^T
```

Using the same authored inverse:

```text
x_hat = (5.1 + 7.0 - 7.9)/2 = 2.1
y_hat = (5.1 + 7.9 - 7.0)/2 = 3.0
z_hat = (7.0 + 7.9 - 5.1)/2 = 4.9

S_hat_noisy = [2.1,3.0,4.9]^T
```

Against the fixture oracle state:

```text
error = S_hat_noisy - S*
      = [0.1,0,-0.1]

||error||_2 = sqrt(0.02)
            ≈ 0.141421356237310
```

Required classification:

```text
KNOWN_FORWARD_RECONSTRUCTION_PERTURBATION_PROPAGATED
```

This fixture does not estimate a noise distribution. It records deterministic perturbation propagation only.

Required refusals:

```text
noise_model_inferred = false
uncertainty_distribution_estimated = false
empirical_error_rate_claim = false
```

## 7. Held-out operator-provenance validator

A reconstruction can fit mislabeled observations perfectly if the observation/operator binding is wrong. Therefore define a held-out validation operator before reconstruction:

```text
H(S) = x + 2y + 3z
```

For the true latent state:

```text
H(S*) = 2 + 6 + 15 = 23
```

This held-out observation is not used in the three-operator reconstruction.

### 7.1 Correct binding

With correct observation/operator provenance:

```text
O12=5
O23=8
O13=7
```

reconstruction yields:

```text
S_hat=[2,3,5]
H(S_hat)=23
heldout_residual=0
```

Required classification:

```text
RECONSTRUCTION_PASSES_HELDOUT_OPERATOR_VALIDATION
```

### 7.2 Swapped-binding hostile control

Swap the `O23` and `O13` values while falsely retaining their labels:

```text
O12=5
O23=7
O13=8
```

The same inverse yields:

```text
S_hat_swapped=[3,2,5]
```

This state fits the mislabeled three-equation system exactly, so in-sample algebra alone cannot expose the provenance failure.

But:

```text
H(S_hat_swapped)=3+4+15=22
heldout_residual = |22-23| = 1
```

Required classification:

```text
OPERATOR_OBSERVATION_BINDING_FAILURE_DETECTED_BY_HELDOUT_VALIDATOR
```

Required fields:

```text
in_sample_equation_residual = 0
heldout_validation_residual = 1
operator_provenance_valid = false
reconstruction_claim_admitted = false
```

Core lesson under review:

```text
operator provenance is part of the inverse problem;
numerical closure under the wrong operator binding is not a valid receipt
```

## 8. Reconstruction receipt

Every reconstruction receipt must preserve:

```text
latent_dimension
operator_ids
operator_definitions
operator_matrix
operator_rank
operator_nullity
observation_vector
observation_to_operator_binding
inverse_method
reconstructed_state
in_sample_residual
heldout_operator_id
heldout_observation
heldout_prediction
heldout_residual
operator_provenance_valid
claim_ceiling
```

This is an early executable form of the broader receipt grammar:

```text
observations
+
aperture/operator provenance
+
calibration/validation state
+
reconstruction
+
residual
+
claim ceiling
```

## 9. Inverse-problem status

A pass earns the following bounded statement:

```text
KNOWN_FORWARD_LINEAR_INVERSE_PROBLEM_EXECUTED_IN_BOUNDED_SYNTHETIC_FIXTURE
```

The project may then use **tomographic reconstruction grammar** in the abstract methodological sense:

```text
multiple partial known projections
→ explicit forward model
→ constrained latent-state reconstruction
→ validation receipt
```

But required claim ceiling remains:

```text
physical_tomography = false
quantum_state_tomography = false
medical_tomography = false
blind_tomography = false
unknown_operator_reconstruction = false
```

The word `tomography` here names an experimental reconstruction grammar, not a claim that A15-R0 implements any physical imaging modality.

## 10. Failure conditions

The gauntlet fails if implementation:

1. supplies `S*` directly to the reconstruction routine;
2. reports `A_repeat` or `A_redundant` as rank 3;
3. returns a unique state from the repeated one-equation system without an additional declared assumption;
4. changes the forward operators after seeing the observations;
5. hides the observation-to-operator binding;
6. accepts the swapped-binding reconstruction because its in-sample residual is zero;
7. uses the held-out validator during reconstruction and still calls it held out;
8. infers a stochastic noise model from the single deterministic perturbation fixture;
9. promotes the synthetic inverse result into physical tomography, Berry geometry, curvature, holonomy, or quantum behavior;
10. mutates live Ash, Giving, Holonomy Loom, or production surfaces.

## 11. Epistemic posture

A pass may establish only:

```text
KNOWN_FORWARD_RELATIONAL_RECONSTRUCTION_GRAMMAR_VALIDATED_IN_BOUNDED_SYNTHETIC_FIXTURE
```

Research refinement candidates:

```text
an inverse reconstruction receipt is inseparable from
its forward operators + observation/operator binding + validation residual

and

repeated precision along one operator cannot substitute
for missing operator rank
```

These remain **research refinement candidates**, not promoted Pedagogue laws.

## 12. Next action if the gauntlet survives

The next scientifically harder question is operator uncertainty:

```text
next_learning_action = TEST_SELF_CALIBRATING_RECONSTRUCTION_WITH_PARTIALLY_UNKNOWN_FORWARD_OPERATOR
```

That assay should deliberately withhold one calibration parameter from the forward model and ask whether observations can jointly constrain both latent state and operator parameter.

This is the natural bridge toward:

```text
blind inverse problems
self-calibration
operator tomography
```

without claiming any of them before the calibration parameter is actually reconstructed.

## 13. Claim ceiling

No passing result establishes:

- physical tomography;
- quantum state tomography;
- medical tomography;
- blind tomography;
- universal inverse-problem solvability;
- live TD613 latent-state reconstruction;
- empirical sensor calibration;
- connection;
- curvature;
- holonomy;
- Berry structure;
- physical phasons;
- quantum behavior;
- A16 admission;
- Proto-Loom;
- production authority.

## 14. UI / release posture

```text
Pedagogue research UI = NOT REQUIRED
Moss Lantern UI = NONE
Giving UI mutation = NONE
Ash Keep production UI mutation = NONE
Holonomy Loom UI mutation = NONE
TD613.com deployment = HELD
Vercel authorization = NOT REQUESTED
PR remains Draft
```

Human closure remains required.
