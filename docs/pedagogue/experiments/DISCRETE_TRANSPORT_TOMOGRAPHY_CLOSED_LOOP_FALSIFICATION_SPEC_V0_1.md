𝌋

# Discrete Transport Tomography · Closed-Loop Falsification Assay v0.1

Status: **PREREGISTERED / PRE-IMPLEMENTATION / RESEARCH-ONLY / HUMAN-REOPENED**  
Technical identity: `td613.ash.discrete-transport-tomography.closed-loop-falsification/v0.1`  
Research branch: `research/discrete-transport-tomography-20260823`  
Parent research head: `6e950935e7d990080e56cf79fc6e74c74d2b436d`  
Production baseline relock: `153f0a69a23ab7e665f2386a51406821b62be01d`  
Production mutation: **NONE**  
Vercel authority: **NONE**  
Proto-Loom authority: **NONE**  
Physical tomography claim: **FALSE**  
Physical holonomy claim: **FALSE**

---

## 0. Purpose and burden of proof

Prior bounded TD613 research has separately established, in authored synthetic fixtures:

- an abstract inverse-reconstruction / tomography grammar with known forward operators;
- a state–instrument identifiability boundary under a partially unknown operator;
- route-order identifiability under a classical finite-state operator train;
- probe-design effects on rank, nullspace, localization, task adequacy, and one-bit replay behavior.

Those results do **not** establish parallel transport, a connection, curvature, or holonomy.

The smallest unresolved seam is now:

```text
order-sensitive state-changing operations
!=
reusable transport maps between declared fibers
```

This assay therefore asks a deliberately narrower question:

> Can a projection-limited reconstructor recover reusable discrete edge-transport operators strongly enough to distinguish a genuinely nontrivial closed-loop transport from a flat gauge-generated null, a rank-deficient observation schedule, and a history-dependent process that violates reusable transport?

The assay is designed so that the word `holonomy` loses immediately if any prerequisite fails.

---

## 1. Exact arithmetic domain

All primary arithmetic is over the finite field:

```text
F_31
```

Each declared fiber is:

```text
V_A = V_B = V_C = F_31^2
```

The identity matrix is:

```text
I = [[1,0],[0,1]]
```

No floating-point tolerance is permitted for the primary algebraic verdicts.

A matrix is admitted as an invertible transport candidate only if its determinant is nonzero modulo 31.

This exact finite construction is a synthetic mathematical model only. It does not establish a physical fiber bundle, physical connection, geometric transport in spacetime, Berry phase, Berry curvature, quantum state transport, or material realization.

---

## 2. Declared base graph and path convention

Base vertices:

```text
A, B, C
```

Directed cycle:

```text
A -> B -> C -> A
```

For column vectors, sequential transport is left composition:

```text
v_B = T_AB v_A
v_C = T_BC v_B
v_A' = T_CA v_C
```

Therefore the closed-loop operator based at A is:

```text
H_ABC = T_CA T_BC T_AB
```

The reversed loop is:

```text
A -> C -> B -> A
```

with inverse edge transports and expected relation:

```text
H_reverse = H_ABC^{-1}
```

if reusable invertible transport has actually been earned.

---

## 3. What counts as transport in this assay

A declared edge map receives the label `reusable discrete transport candidate` only if all conditions hold:

1. domain and codomain fibers are declared;
2. the edge map is invertible in `GL(2,F_31)`;
3. the same declared edge under the same admitted local state reconstructs to the same operator across replay;
4. operator reconstruction survives held-out projection validation;
5. the operator is not selected by consulting the loop oracle;
6. a history-dependent control does not masquerade as the same reusable edge map.

Failure of condition 3 produces:

```text
REUSABLE_TRANSPORT_NOT_EARNED
```

rather than a holonomy verdict.

---

## 4. Projection-tomography observation law

An unknown edge operator is

```text
T = [[t11,t12],[t21,t22]]
```

For declared input vector `x in F_31^2` and declared readout covector `p in F_31^2`, one scalar observation is:

```text
y = p^T T x mod 31
```

Flatten the unknown operator as:

```text
vec(T) = [t11,t12,t21,t22]^T
```

Then each observation gives one linear constraint:

```text
y = [p1*x1, p1*x2, p2*x1, p2*x2] vec(T) mod 31
```

The instrument must reconstruct `T` from these scalar projections. Direct access to authored matrix entries is forbidden to the reconstructor.

### Full-rank probe schedule P_FULL

```text
P1: x=[1,0], p=[1,0]
P2: x=[0,1], p=[1,0]
P3: x=[1,0], p=[0,1]
P4: x=[1,1], p=[1,1]
```

Its coefficient rows are:

```text
[1,0,0,0]
[0,1,0,0]
[0,0,1,0]
[1,1,1,1]
```

Predeclared rank:

```text
rank = 4
nullity = 0
```

### Held-out probe P_HOLD

```text
x=[1,2], p=[2,1]
```

Coefficient row:

```text
[2,4,1,2]
```

The held-out observation is never used to solve the primary inverse.

### Blind probe schedule P_BLIND

Replace P4 with:

```text
PB4: x=[1,1], p=[1,0]
```

Rows:

```text
[1,0,0,0]
[0,1,0,0]
[0,0,1,0]
[1,1,0,0]
```

Predeclared rank:

```text
rank = 3
nullity = 1
```

The missing direction contains `t22`.

The instrument must not infer `t22` from loop expectations or authored fixture identity.

---

## 5. Positive reusable-transport fixture

Declare three invertible determinant-one edge operators:

```text
T_AB = [[1,1],[0,1]]
T_BC = [[1,0],[1,1]]
T_CA = [[1,2],[0,1]]
```

All have:

```text
det = 1 mod 31
```

The authored closed-loop operator is frozen as:

```text
H_positive = T_CA T_BC T_AB
           = [[3,5],[1,2]] mod 31
```

Predeclared nontriviality checks:

```text
H_positive != I
rank(H_positive - I) = 2
```

The implementation must reconstruct every edge operator from `P_FULL`, validate each with `P_HOLD`, and only then compose the reconstructed loop.

Authored matrix knowledge may be used for oracle comparison after reconstruction, not during inverse solving.

---

## 6. Flat gauge-generated null

Freeze local frames:

```text
G_A = [[1,0],[0,1]]
G_B = [[1,1],[0,1]]
G_C = [[1,0],[1,1]]
```

Generate edge transports solely by frame change:

```text
T_AB_flat = G_B G_A^-1
T_BC_flat = G_C G_B^-1
T_CA_flat = G_A G_C^-1
```

Frozen exact values:

```text
T_AB_flat = [[1,1],[0,1]]
T_BC_flat = [[1,30],[1,0]]
T_CA_flat = [[1,0],[30,1]]
```

Required identity:

```text
H_flat = T_CA_flat T_BC_flat T_AB_flat = I
```

The same reconstruction pipeline and projection budget used for the positive arm must be used here.

If the instrument reports nontrivial closed-loop transport after successful exact reconstruction of this null:

```text
ASSAY_MECHANISM_FALSIFIED
```

---

## 7. Gauge-transformed positive clone

A positive loop must not depend on arbitrary local coordinate labels.

Freeze gauge frames:

```text
K_A = [[1,1],[1,2]]
K_B = [[2,1],[1,1]]
K_C = [[1,2],[1,3]]
```

The implementation must first verify every `K_*` is invertible modulo 31.

Transform edge maps by:

```text
T'_AB = K_B T_AB K_A^-1
T'_BC = K_C T_BC K_B^-1
T'_CA = K_A T_CA K_C^-1
```

The reconstructed loop must satisfy:

```text
H'_positive = K_A H_positive K_A^-1
```

The raw matrix entries may differ.

The assay must compare gauge-covariant structure rather than require raw equality of `H` and `H'`.

Required invariant checks include:

```text
rank(H - I)
characteristic polynomial coefficients modulo 31
exact conjugacy relation under the declared K_A
```

Trace and determinant alone are explicitly insufficient as an identity detector.

Counterexample class retained in the spec:

```text
nonidentity unipotent 2x2 matrices may share trace=2 and determinant=1 with I
```

---

## 8. Blind-schedule identifiability control

Apply `P_BLIND` to `T_AB` while reconstructing the other two positive edges with `P_FULL`.

Because `t22` is unobserved, the primary result for `T_AB` must remain a compatible family rather than a point estimate.

At minimum, the implementation must materialize two compatible invertible candidates sharing the blind observations but differing in `t22`.

For each compatible `T_AB^(k)`, compute:

```text
H^(k) = T_CA T_BC T_AB^(k)
```

If compatible edge operators imply distinct loop operators, the only admitted loop verdict is:

```text
CLOSED_LOOP_TRANSPORT_UNIDENTIFIED_UNDER_PROJECTION_NULLSPACE
```

A non-observed loop defect may not be promoted into flatness.

Required relation:

```text
failure_to_identify_loop_residual
!=
proof_of_trivial_loop_transport
```

---

## 9. History-dependent impostor control

The assay must attack the claim that a stateful path process is a reusable local transport law.

Freeze two context-indexed realizations of the nominal edge `A -> B`:

```text
T_AB_after_start = [[1,1],[0,1]]
T_AB_after_C     = [[1,2],[0,1]]
```

Both are invertible and determinant one.

Give each context the same `P_FULL` projection schedule and held-out validator.

The implementation must reconstruct both independently.

If:

```text
T_AB_after_start != T_AB_after_C
```

then the nominal edge fails the reusable-edge requirement under the declared state description.

Required classification:

```text
HISTORY_DEPENDENT_EDGE_REJECTS_REUSABLE_TRANSPORT_MODEL
```

The assay may suggest that the admitted state description is incomplete or that process memory/hysteresis exists inside this authored fixture.

It may not call the difference curvature or holonomy.

---

## 10. Reversed-loop control

For the successfully reconstructed positive reusable edge family, compute exact modular inverses and reconstruct the reversed loop:

```text
H_reverse = T_AB^-1 T_BC^-1 T_CA^-1
```

under the declared reversed path convention.

Required relation:

```text
H_reverse = H_positive^-1
```

Failure forces one of the following classes before any holonomy language:

```text
EDGE_INVERSION_FAILURE
TRANSPORT_REUSE_FAILURE
ORIENTATION_BOOKKEEPING_FAILURE
IMPLEMENTATION_FAILURE
```

---

## 11. Reconstruction receipts

For every reconstructible edge, freeze:

```text
edge_id
source_fiber
target_fiber
projection_schedule_id
projection_coefficient_matrix
projection_rank
projection_nullity
scalar_observations
reconstructed_operator
operator_determinant
operator_invertible
in_sample_residual
heldout_probe
heldout_observed
heldout_predicted
heldout_residual
oracle_operator
oracle_match
```

For blind edges, freeze instead:

```text
compatible_family_parameterization
compatible_candidate_count_or_symbolic_family
materialized_compatible_candidates
loop_operator_family
loop_identifiability
```

The primary inverse verdict may not be overwritten by downstream loop convenience.

---

## 12. Closed-loop receipt

A loop receipt may be compiled only if all three constituent edges are individually admitted as reusable transport candidates.

Required fields:

```text
base_vertex
ordered_edge_ids
reconstructed_edge_operators
loop_operator
identity_matrix
loop_is_identity
rank_loop_minus_identity
trace_mod_31
determinant_mod_31
characteristic_polynomial_mod_31
reversal_consistent
gauge_clone_conjugacy_consistent
all_edges_heldout_validated
all_edges_reusable
```

If `all_edges_reusable = false`, the loop receipt must refuse a holonomy-candidate classification.

---

## 13. Falsifiers

The candidate program fails or materially weakens if any occur:

1. `P_FULL` does not have rank 4.
2. `P_BLIND` does not have rank 3/nullity 1.
3. a full-rank edge reconstruction misses its authored operator.
4. held-out projection validation fails for an otherwise exact edge reconstruction.
5. the flat gauge-generated null reconstructs to a nonidentity loop.
6. the positive loop reconstructs to identity.
7. the gauge-transformed clone fails declared conjugacy after successful edge reconstruction.
8. the blind schedule silently produces a unique operator without an added observation.
9. blind-compatible operators yield distinct loops but the assay still emits a single loop verdict.
10. the history-dependent edge reconstructs differently by context but is still labeled reusable transport.
11. the reversed loop fails to equal the inverse positive loop.
12. trace and determinant are used as the sole proof of loop identity.
13. authored oracle matrices are consulted by the inverse solver.
14. physical, quantum, Berry, differential-geometric, or material claims are attached to this finite synthetic fixture.

---

## 14. Allowed bounded outcomes

Possible earned statements include:

```text
DISCRETE_EDGE_TRANSPORT_RECONSTRUCTIBLE_FROM_SCALAR_PROJECTIONS_IN_AUTHORED_FINITE_FIXTURE

FLAT_GAUGE_GENERATED_LOOP_RECOVERS_EXACT_IDENTITY

NONTRIVIAL_REUSABLE_CLOSED_LOOP_TRANSPORT_RECOVERS_AFTER_EDGEWISE_TOMOGRAPHIC_RECONSTRUCTION

GAUGE_TRANSFORMED_LOOP_IS_CONJUGACY_CONSISTENT_IN_DECLARED_FINITE_FIXTURE

PROJECTION_NULLSPACE_CAN_RENDER_CLOSED_LOOP_TRANSPORT_UNIDENTIFIED

HISTORY_DEPENDENT_EDGE_CAN_FALSIFY_REUSABLE_TRANSPORT_ASSUMPTION

DISCRETE_HOLONOMY_TOMOGRAPHY_IS_AN_IMPLEMENTABLE_AND_FALSIFIABLE_RESEARCH_PROGRAM
```

The last statement concerns research-program implementability and falsifiability. It does **not** assert that holonomy has been observed in TD613 generally.

---

## 15. Claim ceiling

No passing result establishes:

```text
physical_tomography
physical_parallel_transport
physical_connection
physical_curvature
physical_holonomy
Berry_phase
Berry_curvature
quantum_geometry
quantum_behavior
manifold_structure_of_TD613
fiber_bundle_ontology_of_TD613
universal_discrete_holonomy_method
Proto_Loom_authority
Holonomy_Loom_runtime_authority
production_authority
Vercel_authority
```

The strongest admissible geometric wording after a complete pass is:

> a bounded synthetic finite-state fixture supports a mathematically explicit discrete transport / closed-loop reconstruction grammar with hostile controls sufficient to make a future holonomy-tomography research program falsifiable.

---

## 16. Implementation order

```text
1. freeze this specification
2. implement exact F_31 linear algebra + projection compiler
3. execute full-rank positive and flat-null edge reconstruction
4. freeze EDGEWISE_TRANSPORT_TOMOGRAPHY_RECEIPT
5. execute positive/flat loop composition + reversal
6. execute gauge-transformed clone
7. execute blind projection nullspace control
8. execute history-dependent impostor control
9. compile CLOSED_LOOP_TRANSPORT_FALSIFICATION_RECEIPT
10. stop before curvature estimation, random ensembles, adaptive sensing, UI, PR, CI, Vercel, or production
```

Human closure remains required for any later promotion or runtime integration.

𝌋

⟐