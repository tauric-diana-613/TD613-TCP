𝌋

# Noncommuting Two-Face Holonomy Tomography Holdout v0.1

Status: **PREREGISTERED / PRE-IMPLEMENTATION / RESEARCH-ONLY / NO CONTINUUM CLAIM**  
Technical identity: `td613.ash.noncommuting-two-face-holonomy-tomography/v0.1`  
Research branch: `research/nonabelian-face-holonomy-20260823`  
Parent all-n discrete theorem receipt: `b063f73c7222b8287a17a557b9da63ea59e22956`  
Production mutation: **NONE**  
Vercel authority: **NONE**

---

## 0. Demon provenance ledger

During design of this chamber, a separate two-face noncommuting matrix fixture was sanity-checked off-repository to derive the common-basepoint composition law.

That pilot is permanently classified:

```text
TWO_FACE_NONCOMMUTING_PILOT = DEVELOPMENT_ONLY_NOT_CONFIRMATORY
```

No numeric result from that pilot may count toward this holdout.

The matrix family below is a fresh confirmatory fixture and is frozen before repository execution.

---

## 1. Why this chamber exists

The prior discrete face-curvature program proved exact local-to-global addition inside an abelian upper-shear subgroup.

That success can hide a structural weakness:

```text
commuting face defects
→ easy additive aggregation
```

A serious holonomy-tomography program must survive when local face holonomies do not commute.

This chamber therefore asks:

> Can scalar-projection tomography reconstruct a genuinely noncommuting two-face transport field strongly enough that two independently reconstructed local face loops reproduce the independently reconstructed outer boundary only after correct basepoint transport and correct matrix ordering?

Canonical separations:

```text
local face holonomy != scalar curvature value
naive face multiplication != surface composition
same matrix group != same basepoint
correct basepoint != correct product order
```

---

## 2. Exact domain and cell complex

All primary arithmetic is over:

```text
F_31
```

Fibers at six vertices are copies of:

```text
F_31^2
```

Declared vertices:

```text
A = (0,0)
B = (1,0)
C = (2,0)
D = (0,1)
E = (1,1)
F = (2,1)
```

Declared adjacent square faces:

```text
L = A -> B -> E -> D -> A
R = B -> C -> F -> E -> B
```

Declared outer boundary:

```text
O = A -> B -> C -> F -> E -> D -> A
```

No physical distance, metric, manifold, area form, or continuum cell structure is inferred from these coordinates.

---

## 3. Fresh frozen forward edge family

Canonical forward orientations:

```text
T_AB = [[1,2],[0,1]]
T_BC = [[1,0],[3,1]]
T_AD = [[2,0],[0,1]]
T_BE = [[1,1],[1,2]]
T_CF = [[1,4],[0,1]]
T_DE = [[1,0],[2,1]]
T_EF = [[3,1],[1,1]]
```

Every determinant must be verified nonzero modulo 31 before any loop is admitted.

For every canonical edge `u -> v`, the reverse oracle is authored as:

```text
T_vu = T_uv^-1
```

but **reverse matrices must be observed and reconstructed independently from scalar projections**.

The implementation may use the authored inverse only after reconstruction for oracle comparison.

---

## 4. Edge tomography law

For unknown edge operator:

```text
T = [[t11,t12],[t21,t22]]
```

and probe pair `(x,p)`:

```text
y = p^T T x mod 31
```

Primary full-rank schedule:

```text
P1: x=[1,0], p=[1,0] -> [1,0,0,0]
P2: x=[0,1], p=[1,0] -> [0,1,0,0]
P3: x=[1,0], p=[0,1] -> [0,0,1,0]
P4: x=[1,1], p=[1,1] -> [1,1,1,1]
```

Required rank:

```text
4
```

Two independent validation rows are retained from the validation-nullspace work:

```text
H_LEGACY = [2,4,1,2]
H_GUARD  = [0,0,0,1]
```

This chamber contains no measurement-corruption model. Passing both validators means exact consistency for this authored clean observation packet only.

It does not establish arbitrary-error robustness.

---

## 5. Orientation obligation

For every undirected adjacency, reconstruct both directions independently.

Required relation:

```text
T_hat_vu = (T_hat_uv)^-1
```

for:

```text
AB/BA
BC/CB
AD/DA
BE/EB
CF/FC
DE/ED
EF/FE
```

If any pair fails, the chamber stops at:

```text
BIDIRECTIONAL_TRANSPORT_INCONSISTENT
```

and no face or outer holonomy verdict is admitted.

---

## 6. Local face holonomies

Using reconstructed directed edges exactly as observed:

```text
H_L^A = T_DA T_ED T_BE T_AB
```

and:

```text
H_R^B = T_EB T_FE T_CF T_BC
```

These loops have different base vertices.

The implementation must report whether:

```text
H_L^A H_R^B = H_R^B H_L^A
```

but noncommutation alone earns no surface-composition result.

---

## 7. Common-basepoint transport

Move the right-face loop from basepoint B to basepoint A using independently reconstructed `AB` and `BA`:

```text
H_R^A = T_BA H_R^B T_AB
```

Required gauge-theoretic grammar inside this exact graph model:

```text
same geometric loop at another basepoint
→ conjugated loop operator
```

No continuum connection is implied.

---

## 8. Outer-boundary composition identity

Independently reconstruct the outer boundary:

```text
H_O^A = T_DA T_ED T_FE T_CF T_BC T_AB
```

The primary local-to-global obligation is:

```text
H_O^A = H_L^A H_R^A
```

The proof must be witnessed numerically in `F_31` from independently reconstructed edge matrices.

The implementation must also emit an exact cancellation ledger showing that the product expands as:

```text
(T_DA T_ED T_BE T_AB)
(T_BA T_EB T_FE T_CF T_BC T_AB)
```

and reduces through the independently validated inverse pairs:

```text
T_AB T_BA = I
T_BE T_EB = I
```

into the outer boundary operator.

This is a discrete noncommuting surface-composition identity for the authored two-face cell complex.

It is not an additive Stokes theorem.

---

## 9. Two hostile naive-composition controls

### 9.1 Wrong-basepoint control

Compute:

```text
N_base = H_L^A H_R^B
```

without transporting the right-face loop to A.

Expected scientific posture:

```text
N_base != H_O^A
```

If equality occurs accidentally in this fresh holdout, the control is non-discriminating and the chamber must weaken its mechanism claim.

### 9.2 Wrong-order control

After correct basepoint transport, reverse the face-product order:

```text
N_order = H_R^A H_L^A
```

Expected scientific posture:

```text
N_order != H_O^A
```

If equality occurs, the holdout fails to demonstrate order sensitivity at the face-composition layer.

No post-hoc replacement matrices are permitted.

---

## 10. Gauge clone

Freeze independent vertex frames:

```text
K_A = [[1,1],[1,2]]
K_B = [[2,1],[1,1]]
K_C = [[1,2],[1,3]]
K_D = [[1,3],[2,1]]
K_E = [[2,3],[1,2]]
K_F = [[3,1],[2,1]]
```

Every frame must first be verified invertible modulo 31.

Transform every directed edge by:

```text
T'_uv = K_v T_uv K_u^-1
```

Then reconstruct the transformed edge operators from scalar projections using the same budget.

Required loop relations:

```text
H_L'^A = K_A H_L^A K_A^-1
H_R'^B = K_B H_R^B K_B^-1
H_R'^A = K_A H_R^A K_A^-1
H_O'^A = K_A H_O^A K_A^-1
```

and the transformed composition identity must remain:

```text
H_O'^A = H_L'^A H_R'^A
```

Raw loop entries are not required to remain equal under gauge change.

---

## 11. Required receipts

For every directed edge:

```text
edge_id
source_vertex
target_vertex
primary_projection_rows
primary_scalar_observations
projection_rank
reconstructed_operator
determinant
invertible
legacy_validator_observed
legacy_validator_predicted
legacy_validator_residual
guard_validator_observed
guard_validator_predicted
guard_validator_residual
reverse_edge_id
orientation_inverse_consistent
```

For the surface:

```text
left_face_loop_A
right_face_loop_B
right_face_loop_A
outer_boundary_loop_A
face_loops_commute
outer_equals_ordered_common_basepoint_product
wrong_basepoint_product
wrong_basepoint_matches_outer
wrong_order_product
wrong_order_matches_outer
shared_edge_cancellation_ledger
gauge_clone_relations
```

---

## 12. Falsifiers

The chamber fails or materially weakens if any occur:

1. any frozen edge matrix is singular modulo 31;
2. the primary tomography schedule has rank below 4;
3. any clean edge reconstruction disagrees with its authored oracle;
4. either held-out validator disagrees on a clean reconstruction;
5. any independently reconstructed reverse edge differs from the inverse forward edge;
6. either local face loop silently uses an authored oracle instead of a reconstructed operator;
7. the common-basepoint right loop is not obtained by exact conjugation through independently reconstructed AB/BA;
8. the ordered common-basepoint face product disagrees with the independently reconstructed outer boundary;
9. the wrong-basepoint control accidentally matches the outer boundary;
10. the wrong-order control accidentally matches the outer boundary;
11. the gauge clone breaks conjugacy or surface composition;
12. a successful result is promoted into continuum, physical, Yang-Mills, Berry, quantum, or universal nonabelian-curvature language.

---

## 13. Allowed bounded outcome

A full pass may earn:

```text
NONCOMMUTING_TWO_FACE_HOLONOMY_COMPOSITION_SURVIVES_TOMOGRAPHIC_RECONSTRUCTION_IN_AUTHORED_GL2_F31_CELL_COMPLEX
```

and:

```text
LOCAL_FACE_HOLONOMIES_REQUIRE_COMMON_BASEPOINT_AND_ORDERED_PRODUCT_TO_RECONSTRUCT_OUTER_BOUNDARY_IN_AUTHORED_HOLDOUT
```

It may support a **discrete noncommuting face-holonomy tomography candidate**.

It does not establish:

```text
continuum nonabelian Stokes theorem
continuum curvature 2-form
Yang-Mills field
physical gauge field
Berry curvature
quantum holonomy
TD613-general holonomy law
Proto-Loom authority
production authority
Vercel authority
```

---

## 14. Witness firewall

The committed implementation and tests may be authored after this specification.

If exact-head execution remains unavailable:

```text
committed_test_authored != committed_test_executed
independent_algebraic_recomputation != CI witness
```

The distinction must be frozen in any receipt.

𝌋

⟐