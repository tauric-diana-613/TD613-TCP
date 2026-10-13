𝌋

# Gauge-Quotient Identifiability · Matched Nullspace Assay v0.1

Status: **PREREGISTERED / PRE-IMPLEMENTATION / RESEARCH-ONLY**  
Technical identity: `td613.ash.gauge-quotient-identifiability.matched-nullspace/v0.1`  
Parent gauge-blind conjugacy receipt: `82be6dde829747402e3983568f629a6067b59aff`  
Production mutation: **NONE**  
Vercel authority: **NONE**

---

## 0. Question

The current discrete holonomy program has conservatively required full matrix reconstruction before admitting downstream loop structure.

That rule may be stronger than mathematically necessary when the downstream object is an equivalence class rather than a raw representative.

This chamber asks:

> Can a rank-deficient scalar-projection aperture leave the raw matrix unidentified while still identifying its GL(2,F31) conjugacy class—and can an exposure-matched hostile family show when the same matrix-level ambiguity genuinely spans multiple conjugacy classes and therefore requires abstention?

Canonical separation:

```text
raw_operator_identifiability
!=
quotient_conjugacy_class_identifiability
```

---

## 1. Exact domain

All matrices are in:

```text
GL(2,F_31)
```

Observation law remains linear in flattened matrix entries:

```text
y = q dot [t11,t12,t21,t22]^T mod 31
```

The primary aperture is rank three:

```text
Q1 = [1,0,0,0]   # observe t11
Q2 = [0,0,1,0]   # observe t21
Q3 = [0,0,0,1]   # observe t22
```

Therefore:

```text
rank = 3
nullity = 1
```

and the unobserved coordinate is exactly:

```text
t12
```

The instrument must enumerate the complete compatible family over all `t12 in F_31`.

No point estimate is permitted.

---

## 2. Arm Q1 · quotient-identifiable / raw-unidentified family

Frozen observations:

```text
t11 = 2
t21 = 0
t22 = 5
```

Compatible matrices are:

```text
H_b = [[2,b],[0,5]]
b in F_31
```

Required raw-state posture:

```text
compatible_matrix_count = 31
unique_raw_matrix = false
```

The implementation must classify every compatible invertible matrix with the parent gauge-blind GL(2,F31) fingerprint.

The chamber predicts, by declared algebraic construction but not by prior repository execution:

```text
all 31 matrices share one conjugacy class
```

because the distinct diagonal eigenvalues remain `2` and `5` while the upper-right coordinate changes representative only.

This predicted property must be computed from the compatible family rather than hard-coded into the verdict.

Allowed classification on success:

```text
RAW_OPERATOR_UNIDENTIFIED_BUT_CONJUGACY_CLASS_IDENTIFIED
```

---

## 3. Arm Q2 · quotient-unidentified hostile family

Use the exact same projection rows and exact same one-dimensional nullity.

Frozen observations:

```text
t11 = 3
t21 = 0
t22 = 3
```

Compatible matrices are:

```text
J_b = [[3,b],[0,3]]
b in F_31
```

Again:

```text
compatible_matrix_count = 31
unique_raw_matrix = false
```

But the family contains at least two expected conjugacy types:

```text
b = 0   -> scalar repeated-root class
b != 0  -> nontrivial Jordan repeated-root class
```

The implementation must compute the class partition from fingerprints and confirm representative nonconjugacy through the complete conjugacy-equation solver.

Required outcome:

```text
RAW_OPERATOR_UNIDENTIFIED_AND_CONJUGACY_CLASS_UNIDENTIFIED
```

---

## 4. Matched ambiguity budget

Both arms must match exactly on:

```text
field size = 31
projection row count = 3
projection rank = 3
projection nullity = 1
compatible raw matrix count = 31
all compatible matrices invertible = true
unobserved raw coordinate = t12
```

Thus any difference in quotient identifiability cannot be explained by compatible-set cardinality, rank, nullity, or invertibility alone.

---

## 5. Quotient-identifiability rule

For compatible family `C`, define fingerprint partition:

```text
Pi(C) = partition of C by gauge-blind GL(2,F31) conjugacy fingerprint
```

Then:

```text
raw_identifiable(C) iff |C| = 1
```

and:

```text
quotient_identifiable(C) iff |Pi(C)| = 1
```

The instrument must report both independently.

It may not replace raw nonidentifiability with a secretly chosen canonical representative.

---

## 6. Witness requirement

Fingerprint collapse alone is not enough for the positive arm.

Select one deterministic reference member:

```text
b = 0
```

For every other compatible member in Q1, use the parent conjugacy-equation solver to witness an invertible conjugator from the matrices alone.

The oracle construction relating members may not be supplied.

For Q2, use representative members:

```text
b = 0
b = 1
```

and require complete exhaustion of the conjugacy-equation solution space before stating that the two classes are nonconjugate.

---

## 7. Falsifiers

The assay fails or materially weakens if any occur:

1. either projection matrix has rank other than 3;
2. either compatible family has cardinality other than 31;
3. any compatible candidate is singular, breaking the matched GL(2,F31) domain;
4. the positive family spans more than one conjugacy fingerprint;
5. any positive-family member lacks an independently solved invertible conjugator to the reference member;
6. the hostile family collapses to one fingerprint;
7. scalar `b=0` and Jordan `b=1` are called conjugate;
8. the negative nonconjugacy verdict is issued without exhausting its complete conjugacy solution space;
9. quotient identifiability is rewritten as raw matrix identifiability;
10. the result is promoted into physical gauge redundancy, continuum bundle ontology, or universal inverse-problem law.

---

## 8. Allowed bounded outcome

A full pass may earn:

```text
CONJUGACY_CLASS_CAN_BE_IDENTIFIABLE_WHILE_RAW_HOLONOMY_MATRIX_REMAINS_UNIDENTIFIED_IN_AUTHORED_GL2_F31_PROJECTION_FAMILY
```

and:

```text
FULL_RAW_RECONSTRUCTION_IS_SUFFICIENT_BUT_NOT_NECESSARY_FOR_DECLARED_GAUGE_QUOTIENT_IDENTIFIABILITY_IN_THIS_SYNTHETIC_MODEL
```

This would refine the current safety rule from:

```text
raw unidentified -> withhold everything
```

into:

```text
withhold every downstream quantity not constant across the full compatible family
```

The latter remains a research candidate rule only until separately frozen.

No physical gauge symmetry, continuum geometry, Berry structure, quantum behavior, Proto-Loom authority, production authority, or Vercel authority follows.

𝌋

⟐