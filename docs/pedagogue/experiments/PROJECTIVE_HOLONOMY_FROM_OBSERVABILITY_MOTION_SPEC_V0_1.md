𝌋

# Projective Holonomy Reconstruction from Observability Motion · v0.1

**Status:** PREREGISTERED / PRE-COMPUTATION / RESEARCH-ONLY  
**Technical identity:** `td613.aia.projective-holonomy-from-observability-motion/v0.1`  
**Parent orbit receipt:** `5f3d6b4d21a6cab8b4d4fa4d5f34d3775c54c415`  
**Branch:** `research/projective-holonomy-from-observability-20260823`  
**Production mutation:** NONE  
**Vercel authority:** NONE

---

## 0. Inverse question

Prior work established a nontrivial discrete loop `H` and observed its action on local readout directions:

```text
q -> qH
```

This assay hides the authored loop matrix from the reconstructor and asks:

> Can the projective class of the loop be reconstructed from a small set of input/output readout-direction correspondences alone?

The target object is the projective matrix class:

```text
[H] in PGL(2,F_31)
```

not a unique `GL(2,F_31)` representative.

Canonical separation:

```text
projective holonomy class
!=
unique scaled GL2 matrix
```

because `H` and `lambda H` induce the same projective action for every nonzero scalar `lambda`.

---

## 1. Arithmetic and hidden oracle

Field:

```text
F_31
```

Oracle loop used only to generate post-loop readout directions:

```text
H_oracle = [[3,5],
            [1,2]]
```

The reconstruction solver may not consult `H_oracle` while solving.

---

## 2. Fresh preregistered readout probes

Freeze four distinct input directions before computing outputs:

```text
q1 = [1,3]
q2 = [1,7]
q3 = [1,11]
q4 = [1,19]
```

For each probe:

```text
r_i = normalize_projective(q_i H_oracle)
```

where projective normalization is:

```text
if row=[a,b] and a != 0:
  normalize(row)=[1,b/a]
else:
  normalize(row)=[0,1]
```

The derived `r_i` values are not frozen here and must be computed only after this preregistration commit.

---

## 3. Homogeneous correspondence equation

Let an unknown projective representative be:

```text
M = [[a,b],
     [c,d]]
```

For input row `q=[x,y]` and observed projective output `r=[u,v]`, the predicted output is:

```text
qM = [x a + y c, x b + y d]
```

Projective agreement requires collinearity:

```text
u * (x b + y d) - v * (x a + y c) = 0
```

which is a homogeneous linear constraint on:

```text
vec(M) = [a,b,c,d]^T
```

with coefficient row:

```text
[-v x, u x, -v y, u y]
```

All arithmetic is modulo 31.

---

## 4. Two-correspondence underidentification control

Use only:

```text
(q1 -> r1)
(q2 -> r2)
```

Required diagnostics:

```text
constraint_rank <= 2
nullspace_dimension >= 2
```

The instrument must materialize at least two invertible matrices from the homogeneous solution space that:

1. satisfy both projective correspondences;
2. are not scalar multiples of one another;
3. therefore represent distinct `PGL(2,F_31)` classes;
4. predict different projective outputs for at least one held-out preregistered readout among `q3,q4`.

Allowed classification:

```text
TWO_PROJECTIVE_READOUT_CORRESPONDENCES_UNDERIDENTIFY_LOOP_CLASS
```

No canonical representative may be selected by convenience.

---

## 5. Three-correspondence reconstruction

Use:

```text
(q1 -> r1)
(q2 -> r2)
(q3 -> r3)
```

Required target condition:

```text
constraint_rank = 3
nullspace_dimension = 1
```

If the one-dimensional nullspace contains a nonzero invertible matrix, normalize its projective representative canonically by scaling the first nonzero entry of `[a,b,c,d]` to 1.

The reconstructed projective class must:

1. satisfy all three input/output correspondences;
2. predict the held-out projective output `r4` from `q4`;
3. be projectively equivalent to the hidden oracle only **after** reconstruction;
4. expose that the absolute scalar multiplying the recovered matrix is unidentified.

Allowed classification:

```text
THREE_GENERIC_OBSERVABILITY_CORRESPONDENCES_RECONSTRUCT_ONE_PGL2_F31_LOOP_CLASS
```

---

## 6. Held-out fourth readout

`q4 -> r4` is never used to solve the primary three-correspondence inverse.

After reconstructing the projective class, predict:

```text
r4_hat = normalize_projective(q4 M_hat)
```

Required:

```text
r4_hat = r4
```

This validates projective action outside the three equations used for reconstruction.

---

## 7. Contradictory fourth-correspondence control

Create a hostile output from the true `r4=[u,v]` by the frozen rule:

```text
if u != 0:
  r4_bad = normalize_projective([u, v+1])
else:
  r4_bad = normalize_projective([u+1, v])
```

The mutation must be verified projectively distinct from `r4`.

Add:

```text
(q4 -> r4_bad)
```

to the three correct correspondences.

Required:

```text
constraint_rank = 4
nullspace_dimension = 0
```

or another exact certificate that no nonzero matrix satisfies all four homogeneous correspondence equations.

Required classification:

```text
PROJECTIVE_LOOP_MODEL_DEFEATED_BY_INCONSISTENT_OBSERVABILITY_CORRESPONDENCE
```

The instrument must not return a nearest projective map.

---

## 8. Gauge-covariant reconstruction control

Freeze basepoint frame change:

```text
K = [[2,1],
     [1,1]]
```

Transform the hidden loop and readout directions consistently:

```text
H' = K H K^-1
q_i' = q_i K^-1
r_i' = r_i K^-1
```

where `r_i` denotes any representative row of the observed output direction before projective renormalization.

The gauge-clone reconstruction must recover the projective class of:

```text
K H K^-1
```

without receiving `K` or `H` as solver inputs.

The recovered original and gauge-clone classes may differ as matrices but must satisfy the declared conjugacy relation in the verification layer.

---

## 9. Projective-scale hostile control

For any nonzero:

```text
lambda in F_31
```

`H` and `lambda H` produce identical projective readout motion.

Freeze one explicit scalar clone after reconstruction:

```text
lambda = 7
```

Required:

```text
normalize(q_i H) = normalize(q_i (7H))
```

for all four preregistered inputs.

Therefore the instrument must keep:

```text
absolute_GL2_scale_identified = false
```

---

## 10. Falsifiers

The projective tomography claim fails if any occur:

1. two correspondences already force one projective class without an independently justified degeneracy explanation;
2. three correspondences leave more than one projective class;
3. the recovered nullspace representative is singular;
4. held-out `q4` prediction fails;
5. the contradictory fourth pair still admits a nonzero solution;
6. the solver consults `H_oracle`, `K`, or oracle identity while solving;
7. matrix scale is reported as identified from projective-only observations;
8. gauge-clone reconstruction requires the gauge matrix as an input to the inverse;
9. the result is promoted into physical holonomy, continuum tomography, or a universal theorem about arbitrary projective systems.

---

## 11. Allowed bounded outcome

If all obligations survive, the strongest allowed statement is:

```text
IN_AUTHORED_F31_FIXTURE_THREE_GENERIC_INPUT_OUTPUT_READOUT_DIRECTION_CORRESPONDENCES_RECONSTRUCT_THE_PROJECTIVE_CLASS_OF_AN_EARNED_DISCRETE_LOOP_WHILE_TWO_CORRESPONDENCES_REMAIN_UNDERIDENTIFIED_A_HELDOUT_FOURTH_DIRECTION_IS_PREDICTED_AND_AN_INCONSISTENT_FOURTH_CORRESPONDENCE_DEFEATS_THE_MODEL
```

Short research label:

```text
PROJECTIVE_HOLONOMY_TOMOGRAPHY_FROM_OBSERVABILITY_MOTION
```

Claim ceiling remains:

```text
PGL2(F31) synthetic reconstruction only
GL2 absolute scale unearned
physical holonomy false
continuum bundle false
continuum tomography false
Berry structure false
quantum behavior false
Proto-Loom false
production false
Vercel false
```

𝌋

⟐
