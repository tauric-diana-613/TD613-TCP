𝌋

# Discrete Curvature Refinement Covariance Assay v0.1

Status: **PREREGISTERED / PRE-IMPLEMENTATION / RESEARCH-ONLY / EXACT-RATIONAL**  
Technical identity: `td613.ash.discrete-curvature-refinement-covariance/v0.1`  
Parent curvature receipt commit: `b7102910d66c96e77b4e0d3ae5e28fbc6d6a7be1`  
Research branch: `research/discrete-curvature-refinement-20260823`  
Production mutation: **NONE**  
Vercel authority: **NONE**  
Continuum claim: **FALSE**  
Physical curvature claim: **FALSE**

---

## 0. Question

The parent assay introduced an explicit square 2-cell complex and reconstructed gauge-invariant local face defects from edgewise scalar tomography.

That result used one lattice spacing only.

This assay asks a narrower next question:

> When the same abstract unit square is represented by multiple exact combinatorial subdivisions and the authored edge transport is scaled by the declared edge length, do integrated loop defects and area-normalized face defects transform covariantly under refinement—and can a deliberately mis-scaled control be rejected?

Required anti-equivalence:

```text
REFINEMENT_STABILITY
!=
CONTINUUM_LIMIT
```

No physical length, infinitesimal process, convergence theorem, or manifold metric is admitted.

---

## 1. Exact rational domain

All transport parameters, areas, and densities are exact rational numbers.

Use canonical reduced fractions:

```text
q = numerator / denominator
```

with integer numerator, positive integer denominator, and exact gcd reduction.

No floating-point arithmetic is permitted in primary verdicts.

The transport subgroup remains:

```text
S(q) = [[1,q],[0,1]]
S(q1)S(q2) = S(q1+q2)
S(q)^-1 = S(-q)
```

---

## 2. Mesh family

Represent the same authored abstract unit square:

```text
D = [0,1] x [0,1]
```

using mesh resolutions:

```text
n in {1,2,3,4}
```

At resolution `n`:

```text
vertices = (i/n, j/n), 0 <= i,j <= n
edge length in coordinate units = 1/n
unit cell area = 1/n^2
cell count = n^2
```

These coordinate units are mathematical bookkeeping only, not physical distance.

---

## 3. Covariant constant-density connection

Freeze:

```text
kappa = 2
```

For a rightward horizontal edge at row `j`:

```text
A_x^(n)(i,j)
= S(kappa * (j/n) * (1/n))
= S(2j / n^2)
```

Vertical upward edges:

```text
A_y^(n) = I
```

Reverse edges are exact inverses.

For every unit cell:

```text
face_shear = -2 / n^2
cell_area = 1 / n^2
face_density = -2
```

For the entire unit square:

```text
macro_loop_shear = -2
```

at every declared `n`.

These predictions must be computed from reconstructed edge transports, not inserted as verdict constants.

---

## 4. Edgewise rational tomography

Reuse the parent four-projection inverse over exact rationals:

```text
P1 = t11
P2 = t12
P3 = t21
P4 = t11+t12+t21+t22
```

and both validators:

```text
legacy heldout row = [2,4,1,2]
guard heldout row  = [0,0,0,1]
```

Every directed edge used by the refinement receipts must:

- reconstruct exactly;
- retain determinant one;
- reconstruct its reverse as the exact inverse;
- produce zero residual under both clean held-out projections.

---

## 5. Parent-child face aggregation law

For any parent mesh `n` and integer refinement factor `m`, compare a parent cell `(i,j)` with its `m x m` child block in mesh `n*m`.

Frozen refinement pairs:

```text
1 -> 2
1 -> 3
2 -> 4
```

Required integrated-defect relation:

```text
parent_face_shear
=
sum(child_face_shears)
```

Required area relation:

```text
parent_area
=
sum(child_areas)
```

Required density relation:

```text
parent_density
=
area_weighted_mean(child_densities)
```

For the constant-density arm, all values should equal exactly `-2` after normalization.

---

## 6. Variable-field refinement control

Reuse an exact coordinate connection related to the parent variable fixture:

```text
A_x(x,y) = 2 y^2
```

The integrated horizontal transport over one mesh edge of width `1/n` is frozen as:

```text
A_x^(n)(i,j)
= S(2 * (j/n)^2 * (1/n))
= S(2 j^2 / n^3)
```

Vertical edges remain identity.

A cell in row `j` has exact face shear:

```text
-(4j+2) / n^3
```

and exact area-normalized density:

```text
-(4j+2) / n
```

The density varies by location and resolution, but parent-child aggregation must remain exact:

```text
parent integrated face shear
=
sum child integrated face shears
```

and:

```text
parent density
=
area-weighted mean child densities
```

For the entire unit square:

```text
macro_loop_shear = -2
```

at every declared mesh.

This control tests refinement covariance without constant-density triviality.

---

## 7. Flat control

Freeze coordinate connection:

```text
A_x(x,y)=7
```

with edge-integrated transport:

```text
S(7/n)
```

for every rightward horizontal edge.

Every face and macro loop must remain identity / zero shear at every mesh.

Local edge transport remains nonidentity.

---

## 8. Hostile mis-scaled control

Freeze a deliberately wrong discretization:

```text
A_x_bad^(n)(i,j)=S(2*j/n)
```

which omits the edge-length factor `1/n`.

Predicted cell face shear:

```text
-2/n
```

Predicted area-normalized cell density:

```text
-2n
```

Predicted macro unit-square loop shear:

```text
-2n
```

Thus refinement stability must fail across `n`.

Required classification:

```text
MIS_SCALED_EDGE_TRANSPORT_REJECTS_REFINEMENT_COVARIANCE
```

The assay fails if this hostile arm is mistakenly admitted as refinement-stable.

---

## 9. Gauge covariance across meshes

Use exact rational vertex frame:

```text
phi(x,y)=3x-2y+xy
G(x,y)=S(phi(x,y))
```

At every declared mesh and for constant, variable, and flat covariant arms:

```text
T'_(u->v)=G(v)T_(u->v)G(u)^-1
```

Required:

```text
all cell loop shears unchanged
macro loop shear unchanged
parent-child aggregation unchanged
```

The hostile mis-scaled control may also be gauge transformed, but gauge invariance does not rescue its failed refinement scaling.

Required separation:

```text
GAUGE_COVARIANCE
!=
REFINEMENT_COVARIANCE
```

---

## 10. Refinement receipts

For each mesh freeze:

```text
n
vertex_count
cell_count
cell_area
all_edges_tomographically_validated
cell_face_shears
cell_face_densities
sum_cell_face_shears
macro_loop_shear
macro_equals_face_sum
```

For each refinement pair freeze:

```text
parent_n
child_n
factor
parent_cell_id
parent_face_shear
child_face_ids
sum_child_face_shears
parent_area
sum_child_areas
parent_density
child_area_weighted_density
integrated_defect_covariant
area_covariant
density_covariant
```

---

## 11. Falsifiers

The refinement candidate fails if any occur:

1. any rational edge reconstruction or reverse-orientation validation fails;
2. constant-density cell density differs from `-2` at any mesh;
3. constant macro loop differs from `-2` at any mesh;
4. any parent face shear differs from the sum of its child face shears;
5. variable-field parent-child aggregation fails;
6. flat control develops a nonzero face or macro defect;
7. gauge transformation changes any admitted loop defect or aggregation relation;
8. hostile mis-scaled control is labeled refinement-stable;
9. refinement stability is promoted into a continuum-limit claim;
10. coordinate mesh size is promoted into physical length.

---

## 12. Allowed bounded outcomes

A complete pass may earn:

```text
DISCRETE_FACE_CURVATURE_REFINEMENT_COVARIANCE_SURVIVES_ACROSS_AUTHORED_EXACT_RATIONAL_MESH_FAMILY
```

and:

```text
EDGE_LENGTH_SCALING_IS_REQUIRED_FOR_REFINEMENT_COVARIANCE_IN_AUTHORED_CONNECTION_DISCRETIZATION
```

and:

```text
GAUGE_COVARIANCE_AND_REFINEMENT_COVARIANCE_ARE_SEPARATE_OBLIGATIONS
```

No result establishes a continuum connection, continuum curvature, convergence to a differential geometry, physical spatial scale, physical curvature, Berry curvature, Proto-Loom authority, production authority, or Vercel authority.

---

## 13. Continuum firewall

Even after a complete pass:

```text
finite_mesh_family_only = true
mesh_levels_tested = {1,2,3,4}
limit_n_to_infinity_tested = false
convergence_rate_estimated = false
continuum_object_identified = false
physical_scale_identified = false
```

The next legitimate question would be a separately specified convergence/extension theorem candidate, not a physical interpretation.

𝌋

⟐