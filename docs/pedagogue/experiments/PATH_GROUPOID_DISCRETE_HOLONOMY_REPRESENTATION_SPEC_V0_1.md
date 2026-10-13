𝌋

# Path-Groupoid Discrete Holonomy Representation Assay v0.1

Status: **PREREGISTERED / PRE-IMPLEMENTATION / RESEARCH-ONLY**  
Technical identity: `td613.ash.path-groupoid-discrete-holonomy-representation/v0.1`  
Parent graph-connection receipt commit: `02274545ee2497fc0853febf2f0aefa8f409abec`  
Production mutation: **NONE**  
Vercel authority: **NONE**  
Curvature claim: **FALSE**  
Physical holonomy claim: **FALSE**

---

## 0. Why this assay exists

The parent assay earned a bounded synthetic graph-connection candidate:

```text
orientation-consistent GL(2,F_31)-valued transport on a finite graph
```

with all six triangle-edge orientations independently reconstructed from scalar projections.

A single nonidentity triangle loop remains insufficient for a strong holonomy-representation claim because a one-off loop residue could still be treated as an isolated composition artifact.

This assay asks whether independently reconstructed loop transports obey the algebra expected of a path-groupoid representation:

- inverse paths map to inverse operators;
- concatenated paths map to ordered operator products;
- basepoint change acts by conjugation;
- gauge change acts by conjugation at the basepoint;
- two loops may fail to commute while all local edge orientation laws remain valid.

No local curvature field is introduced.

---

## 1. Extended graph

Vertices:

```text
A, B, C, D
```

Existing bidirectional edges:

```text
AB / BA
BC / CB
CA / AC
```

Add independently observed bidirectional edges:

```text
CD / DC
DA / AD
```

New forward oracles:

```text
T_CD = [[1,0],[2,1]]
T_DA = [[1,1],[0,1]]
```

New reverse oracles are frozen as exact inverses:

```text
T_DC = [[1,0],[29,1]]
T_AD = [[1,30],[0,1]]
```

Every new oriented edge receives the same `P_FULL` scalar projection schedule and `P_HOLD` validator used by the parent transport assay.

Reverse operators must be reconstructed independently from their own observations.

---

## 2. Two based loops

Loop 1 at A:

```text
γ1 = A -> B -> C -> A
H1 = T_CA T_BC T_AB
```

Frozen expected operator:

```text
H1 = [[3,5],[1,2]]
```

Loop 2 at A:

```text
γ2 = A -> C -> D -> A
H2 = T_DA T_CD T_AC
```

Frozen expected operator:

```text
H2 = [[3,26],[2,28]]
```

Both have determinant one modulo 31 and are nonidentity.

---

## 3. Inverse-loop law

Independently reconstruct the reverse paths:

```text
γ1^-1 = A -> C -> B -> A
γ2^-1 = A -> D -> C -> A
```

Required exact relations:

```text
H(γ1^-1) = H1^-1
H(γ2^-1) = H2^-1
```

No reverse loop operator may be generated merely by calling `inverse(H_forward)` before direct path composition from independently reconstructed reverse edges.

---

## 4. Concatenation law

Define the phrase:

```text
TRAVERSE γ1 THEN γ2
```

literally.

For left-acting column-vector transport, the required operator is:

```text
H(γ1 then γ2) = H2 H1
```

Similarly:

```text
H(γ2 then γ1) = H1 H2
```

The implementation must build both operators from the underlying edge sequence and compare them with the corresponding product of individually reconstructed loop operators.

A multiplication-order convention that produces the wrong direct route product falsifies the assay.

---

## 5. Noncommuting loop-image check

The two frozen loops are deliberately selected so that:

```text
H1 H2 != H2 H1
```

This is a finite classical matrix statement only.

If the implementation confirms noncommutation after all edge and path reconstruction checks pass, the bounded phrase allowed is:

```text
NONCOMMUTING_IMAGE_ELEMENTS_IN_AUTHORED_DISCRETE_HOLONOMY_REPRESENTATION_CANDIDATE
```

Forbidden promotions include:

```text
quantum noncommutativity
non-Abelian gauge field in nature
Berry holonomy
physical non-Abelian phase
```

---

## 6. Basepoint-change law

Construct the explicit C-based loop:

```text
C -> A
then γ1 at A
then A -> C
```

The direct edge sequence is:

```text
CA, AB, BC, CA, AC
```

Expected transport:

```text
H1_at_C = T_AC H1 T_CA
```

The implementation must compute both:

1. direct transport along the five-edge sequence;
2. conjugation of the A-based loop by the independently reconstructed `CA/AC` edge pair.

Required equality:

```text
DIRECT_C_BASED_LOOP = T_AC H1 T_CA
```

This test prevents raw matrix equality across basepoints from becoming the criterion for loop equivalence.

---

## 7. Gauge covariance

Extend the existing local gauge frames with:

```text
K_D = [[2,1],[1,1]]
```

If this duplicates another numerical frame, that is permitted; its vertex label remains distinct and the implementation must still apply the correct source/target conjugation.

Every oriented edge transforms by:

```text
T'_ij = K_j T_ij K_i^-1
```

For any loop based at A:

```text
H'_γ = K_A H_γ K_A^-1
```

Required for both `γ1` and `γ2`, their concatenations, and the commutator witness.

---

## 8. Hostile order-blind composition control

Create a control that receives only the unordered multiset:

```text
{γ1, γ2}
```

and therefore cannot distinguish:

```text
γ1 then γ2
```

from:

```text
γ2 then γ1
```

Because the frozen loop images are noncommuting, those two ordered products are predicted to differ.

Required classification:

```text
ORDER_BLIND_LOOP_AGGREGATION_IS_INSUFFICIENT_FOR_PATH_REPRESENTATION
```

The control may not choose one ordered product without observing order.

---

## 9. Curvature firewall

This graph carries no declared 2-cell geometry, area assignment, infinitesimal loop family, mesh-refinement limit, or local curvature density.

Therefore even a complete pass must retain:

```text
curvature_defined = false
curvature_measured = false
```

A nonidentity graph-loop transport is not promoted into local curvature.

This deliberately exercises the global holonomy/monodromy route without pretending that curvature is a prerequisite for every holonomy construction.

---

## 10. Falsifiers

The holonomy-representation candidate fails if any occur:

1. any new directed edge cannot be independently reconstructed and held-out validated;
2. any positive reverse edge fails the orientation law;
3. either direct reverse-loop composition differs from the inverse forward loop;
4. direct concatenated edge transport differs from the corresponding ordered loop-product law;
5. basepoint-change direct transport differs from the declared conjugation law;
6. gauge-transformed loop transport fails basepoint conjugacy;
7. the order-blind control is allowed to infer an order it never observed;
8. noncommutation is claimed from operator labels rather than exact matrix products;
9. graph holonomy language is promoted into curvature, physical geometry, Berry structure, or quantum behavior.

---

## 11. Allowed bounded outcome

A complete pass may earn:

```text
DISCRETE_PATH_GROUPOID_HOLONOMY_REPRESENTATION_CANDIDATE_SURVIVES_IN_AUTHORED_F31_GRAPH_FIXTURE
```

with the narrower relations:

```text
PATH_INVERSION_MAPS_TO_OPERATOR_INVERSION
PATH_CONCATENATION_MAPS_TO_ORDERED_OPERATOR_COMPOSITION
BASEPOINT_CHANGE_MAPS_TO_CONJUGATION
GAUGE_CHANGE_MAPS_TO_BASEPOINT_CONJUGATION
ORDER_BLIND_AGGREGATION_LOSES_NONCOMMUTING_LOOP_INFORMATION
```

No outcome establishes physical holonomy, physical connection, curvature, manifold ontology, Berry structure, quantum behavior, Proto-Loom authority, production authority, or Vercel authority.

---

## 12. Stop condition

After receipt freeze, stop before:

```text
curvature estimation
mesh refinement
local face-density interpretation
continuum limit
physical translation
UI/runtime integration
PR/CI/Vercel/release
```

unless a later research gesture explicitly opens those questions.

𝌋

⟐