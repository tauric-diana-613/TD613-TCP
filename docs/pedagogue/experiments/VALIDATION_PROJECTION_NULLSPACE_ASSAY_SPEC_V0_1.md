𝌋

# Validation Projection Nullspace Assay v0.1

Status: **PREREGISTERED / PRE-IMPLEMENTATION / RESEARCH-ONLY**  
Technical identity: `td613.pedagogue.validation-projection-nullspace/v0.1`  
Parent path-groupoid implementation head: `c147bd710a0ccab1a502c1942c41eb25df700c0f`  
Production mutation: **NONE**  
Vercel authority: **NONE**

---

## 0. Question

A held-out observation can be statistically or procedurally separate from the primary fit while remaining geometrically blind to some estimator-error directions.

This assay asks:

> For the exact four-probe transport inverse already used in the discrete tomography fixtures, which primary-observation corruptions are visible to the current held-out probe, and can a second predeclared validation projection close the single-error blind direction without pretending to eliminate all coordinated multi-error nullspaces?

Canonical anti-equivalence:

```text
HELD_OUT
!=
GEOMETRICALLY_INDEPENDENT_OF_THE_ESTIMATOR_ERROR_SURFACE
```

---

## 1. Primary inverse matrix

The frozen `P_FULL` coefficient matrix is:

```text
A =
[[1,0,0,0],
 [0,1,0,0],
 [0,0,1,0],
 [1,1,1,1]]
```

For primary scalar vector `y`, the reconstructed operator vector is:

```text
v_hat = A^-1 y
```

All arithmetic is exact in `F_31`.

The implementation must compute `A^-1` rather than copy a prose result.

---

## 2. Legacy held-out validator

The current held-out projection row is:

```text
h_legacy = [2,4,1,2]
```

For a primary observation error `e`, the held-out prediction error is:

```text
r_legacy = h_legacy A^-1 e
```

The predeclared sensitivity row is:

```text
s_legacy = h_legacy A^-1 = [0,2,30,2] mod 31
```

Therefore a nonzero corruption confined to primary coordinate `P1` is predicted to remain invisible to the legacy held-out residual.

Required classification:

```text
LEGACY_HELDOUT_HAS_SINGLE_PRIMARY_ERROR_BLIND_DIRECTION
```

This does not invalidate previous clean-data receipts. It limits what their zero held-out residual may mean.

---

## 3. Guard validator

Freeze a second validation projection:

```text
P_HOLD_GUARD:
  x = [0,1]
  p = [0,1]
```

Coefficient row:

```text
h_guard = [0,0,0,1]
```

Its predeclared primary-error sensitivity is:

```text
s_guard = h_guard A^-1 = [30,30,30,1] mod 31
```

Every coordinate is nonzero.

Therefore every isolated nonzero corruption of exactly one primary scalar is predicted to produce a nonzero guard residual.

Required bounded relation:

```text
GUARD_VALIDATOR_DETECTS_ALL_NONZERO_SINGLE_PRIMARY_COORDINATE_ERRORS_IN_THIS_F31_INVERSE
```

---

## 4. Exhaustive single-error family

Enumerate:

```text
4 primary coordinates
x
30 nonzero F_31 error magnitudes
=
120 corruption cases
```

For each case:

1. perturb exactly one primary scalar;
2. reconstruct the operator from corrupted primary observations;
3. compare legacy held-out prediction with the clean oracle held-out observation;
4. compare guard prediction with the clean oracle guard observation;
5. record whether each validator detects the corruption.

No random sampling.

Expected legacy family:

```text
P1 errors: 30/30 missed
P2 errors: 30/30 detected
P3 errors: 30/30 detected
P4 errors: 30/30 detected
```

Expected guard family:

```text
all 120/120 detected
```

The implementation must derive these counts.

---

## 5. Coordinated-error firewall

Two validators do not imply universal corruption detection.

Let the combined validator sensitivity be:

```text
S =
[s_legacy
 s_guard]
```

The implementation must compute:

```text
rank(S)
nullity(S)
```

Because `S` has fewer rows than four primary coordinates, a nontrivial coordinated error nullspace is expected to remain.

At least one explicit nonzero coordinated primary-error vector `e_joint` satisfying:

```text
S e_joint = 0
```

must be materialized.

Required anti-equivalence:

```text
ALL_SINGLE_COORDINATE_ERRORS_DETECTED
!=
ALL_MULTI_COORDINATE_ERRORS_DETECTED
```

No universal robustness claim is permitted.

---

## 6. Implication for validation language

If the assay passes, future TD613 research receipts should distinguish:

```text
heldout_zero_residual
validation_single_error_coverage
validation_sensitivity_rank
validation_nullity
```

A validator may be called `held-out` based on workflow provenance while still carrying a nonzero geometric nullspace.

Candidate research relation:

```text
VALIDATION_IS_ITSELF_A_PROJECTION_DESIGN_PROBLEM
```

This relation remains a research candidate until the exact assay receipt freezes.

---

## 7. Falsifiers

The assay fails if any occur:

1. the computed `A^-1` differs from the exact field inverse;
2. legacy sensitivity does not equal `[0,2,30,2]`;
3. guard sensitivity does not equal `[30,30,30,1]`;
4. any isolated nonzero primary corruption escapes the guard validator;
5. the legacy validator detects all P1-only corruptions contrary to the declared algebra;
6. the combined validation matrix is falsely described as full-rank in the four-dimensional primary-error space;
7. single-error coverage is promoted into arbitrary-error robustness.

---

## 8. Claim ceiling

No result establishes statistical generalization, stochastic noise calibration, adversarial robustness in deployed systems, physical sensor reliability, or production authority.

The result concerns exact finite linear validation geometry in an authored synthetic reconstruction fixture.

𝌋

⟐