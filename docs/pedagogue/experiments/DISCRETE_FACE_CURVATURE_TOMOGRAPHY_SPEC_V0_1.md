𝌋

# Discrete Face-Curvature Tomography Assay v0.1

Status: **PREREGISTERED / PRE-IMPLEMENTATION / RESEARCH-ONLY / NEW 2-CELL ONTOLOGY**  
Technical identity: `td613.ash.discrete-face-curvature-tomography/v0.1`  
Parent discrete-holonomy synthesis head: `620a612024783b7c47674b632d2ed7822e1e4f41`  
Research branch: `research/discrete-face-curvature-20260823`  
Production mutation: **NONE**  
Vercel authority: **NONE**  
Physical curvature claim: **FALSE**  
Continuum limit claim: **FALSE**

---

## 0. Constitutional reopening: curvature receives its own ontology

The parent graph-holonomy receipts explicitly left curvature undefined because no 2-cell geometry, area assignment, or local face structure had been declared.

This assay does not reinterpret those receipts.

It introduces a new synthetic object with explicit 2-cells:

```text
integer square lattice
vertices = Z^2 points used by the finite fixture
unit square faces = declared 2-cells
unit face area = 1
```

Only inside this new object may the assay define a discrete face-curvature diagnostic.

Required anti-retroactivity:

```text
PREVIOUS_GRAPH_HOLONOMY_RECEIPT
!=
PREVIOUS_CURVATURE_MEASUREMENT
```

---

## 1. Exact transport subgroup

Use exact integer unipotent shears:

```text
S(a) = [[1,a],[0,1]]
```

with:

```text
S(a)S(b) = S(a+b)
S(a)^-1 = S(-a)
det S(a) = 1
```

No modular wrap and no floating-point tolerance.

Each directed lattice edge carries one reusable shear transport.

The reverse orientation carries the exact inverse.

---

## 2. Scalar projection tomography of an edge

Reuse the four scalar projection forms from the prior transport-tomography grammar, now over exact integers:

```text
P1 -> t11
P2 -> t12
P3 -> t21
P4 -> t11+t12+t21+t22
```

For every edge used by the assay:

1. generate scalar observations from the authored edge oracle;
2. reconstruct all four matrix entries from those observations;
3. verify determinant one;
4. verify the reconstructed reverse edge equals the exact inverse;
5. verify two held-out scalar projections:

```text
legacy heldout row = [2,4,1,2]
guard heldout row  = [0,0,0,1]
```

No curvature quantity may be computed from an edge that fails reconstruction or orientation consistency.

---

## 3. Positive constant-density connection

Freeze integer constant:

```text
kappa = 2
```

For a rightward horizontal edge:

```text
(x,y) -> (x+1,y)
A_x(x,y) = S(kappa * y)
```

For an upward vertical edge:

```text
(x,y) -> (x,y+1)
A_y(x,y) = S(0) = I
```

Reverse edges are exact inverses.

For a counterclockwise rectangle with lower-left `(x0,y0)`, width `w`, height `h`, define path:

```text
right w
up h
left w
down h
```

The preregistered rectangle holonomy is:

```text
H_rect = S(-kappa * w * h)
```

with declared lattice area:

```text
Area = w*h
```

Define the model-specific discrete face-curvature shear density:

```text
F_rect = shear(H_rect) / Area
```

Expected:

```text
F_rect = -2
```

for every rectangle in the positive fixture.

This ratio is a diagnostic inside the declared shear subgroup; it is not a universal logarithm of holonomy.

---

## 4. Frozen positive rectangle family

Use:

```text
R1: lower_left=(0,0), w=1, h=1, area=1
R2: lower_left=(2,3), w=1, h=2, area=2
R3: lower_left=(1,4), w=2, h=1, area=2
R4: lower_left=(3,2), w=2, h=2, area=4
```

Expected loop shear parameters:

```text
R1 = -2
R2 = -4
R3 = -4
R4 = -8
```

Expected density:

```text
all = -2
```

The implementation must construct each path from reconstructed edge transports rather than insert the loop formula directly.

---

## 5. Unit-face field and discrete Stokes check

For every unit face enclosed by each rectangle, independently compose its four reconstructed boundary edges.

Extract unit-face shear:

```text
f(x,y) = shear(H_unit_face(x,y))
```

For the positive connection, expected:

```text
f(x,y) = -2
```

for every sampled face.

Required local-to-global identity:

```text
shear(H_rectangle)
=
sum of f(x,y) over enclosed unit faces
```

This is the discrete Stokes-style relation admitted by the authored abelian shear subgroup and declared square 2-cell complex.

If internal-edge cancellation fails, the curvature-tomography mechanism fails.

---

## 6. Flat but nontrivial-edge control

Freeze:

```text
A_x_flat(x,y) = S(7)
A_y_flat(x,y) = I
```

Individual horizontal edge transports are nonidentity.

However every unit-face and rectangle loop must reconstruct to:

```text
I
```

with:

```text
face shear = 0
rectangle shear = 0
```

Required relation:

```text
NONTRIVIAL_LOCAL_EDGE_TRANSPORT
!=
NONZERO_DISCRETE_FACE_CURVATURE
```

---

## 7. Nonuniform face-field control

Freeze:

```text
A_x_variable(x,y) = S(2*y^2)
A_y_variable(x,y) = I
```

Then a unit face at height `y` has predicted shear:

```text
f_variable(y)
= 2*y^2 - 2*(y+1)^2
= -4*y - 2
```

This control intentionally carries a nonconstant discrete face field.

It must satisfy local-to-global face summation while failing the constant-density statement:

```text
all sampled face densities equal -2
```

Required separation:

```text
DISCRETE_CURVATURE_FIELD_EXISTS
!=
DISCRETE_CURVATURE_FIELD_IS_CONSTANT
```

The variable control is not a 'no-curvature' null.

---

## 8. Gauge transformation

Use integer vertex potential:

```text
phi(x,y) = 3*x - 2*y + x*y
```

Represent local frame change by:

```text
G(x,y) = S(phi(x,y))
```

Every oriented edge transport transforms as:

```text
T'_(u->v) = G(v) T_(u->v) G(u)^-1
```

Because all matrices remain in the abelian shear subgroup, expected edge shear becomes:

```text
a'_(u->v) = a_(u->v) + phi(v) - phi(u)
```

Required loop relation:

```text
H'_closed_loop = H_closed_loop
```

for every sampled unit face and rectangle.

The edge values may change; the closed-loop shear field may not.

---

## 9. Tomographic custody fields

Every edge receipt must include:

```text
edge_id
source_vertex
target_vertex
primary_scalar_observations
reconstructed_matrix
determinant
reverse_edge_id
orientation_inverse_consistent
legacy_heldout_observed
legacy_heldout_predicted
legacy_heldout_residual
guard_heldout_observed
guard_heldout_predicted
guard_heldout_residual
```

Every face receipt must include:

```text
face_id
ordered_boundary_edges
loop_matrix
shear_parameter
declared_area
curvature_shear_density
```

Every rectangle receipt must additionally include:

```text
enclosed_unit_faces
sum_unit_face_shears
rectangle_shear
stokes_consistent
```

---

## 10. Falsifiers

The discrete face-curvature candidate fails if any occur:

1. any required edge cannot be reconstructed exactly from its scalar projections;
2. any reverse edge fails exact inverse consistency;
3. either held-out edge validator fails on clean authored observations;
4. the flat control produces nonzero face-loop shear;
5. the positive unit faces fail to produce shear `-2`;
6. any positive rectangle shear differs from `-2*area`;
7. any rectangle loop shear differs from the sum of enclosed unit-face shears;
8. gauge transformation changes any closed-loop shear;
9. the variable control is incorrectly forced into a constant-density verdict;
10. the finite discrete face density is promoted into continuum, physical, Riemannian, Berry, or spacetime curvature.

---

## 11. Allowed bounded outcomes

A complete pass may earn:

```text
DISCRETE_FACE_CURVATURE_TOMOGRAPHY_CANDIDATE_SURVIVES_IN_AUTHORED_INTEGER_SHEAR_LATTICE
```

and:

```text
EDGEWISE_TOMOGRAPHY_CAN_SUPPORT_GAUGE_INVARIANT_LOCAL_FACE_DEFECT_RECONSTRUCTION_IN_DECLARED_DISCRETE_2_CELL_COMPLEX
```

and:

```text
LOCAL_FACE_DEFECTS_SUM_TO_LARGER_LOOP_DEFECT_IN_AUTHORED_ABELIAN_SHEAR_FIXTURE
```

No result establishes continuum curvature, physical curvature, a manifold model of TD613, Berry curvature, quantum geometry, Proto-Loom authority, production authority, or Vercel authority.

---

## 12. Continuum firewall

Explicitly retain:

```text
mesh_refinement_tested = false
shrinking_physical_loop_limit = false
continuum_connection = false
continuum_curvature = false
```

The next scientific question, if later opened, would be refinement stability—not physical translation.

𝌋

⟐