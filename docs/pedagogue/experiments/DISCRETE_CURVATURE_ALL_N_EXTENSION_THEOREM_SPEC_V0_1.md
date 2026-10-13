𝌋

# Discrete Curvature All-n Extension Theorem Candidate v0.1

Status: **PREREGISTERED / SYMBOLIC / RESEARCH-ONLY / NO CONTINUUM CLAIM**  
Technical identity: `td613.ash.discrete-curvature-all-n-extension-theorem/v0.1`  
Parent finite-refinement receipt: `1be55f0b50f7f17646edeb0e4f7139980ea246f2`  
Production mutation: **NONE**  
Vercel authority: **NONE**

---

## 0. Question

The parent refinement assay established exact covariance on meshes `n={1,2,3,4}` and refinement maps `1->2`, `1->3`, `2->4`.

The surviving formulas are algebraic in mesh resolution and refinement factor.

This chamber asks:

> Can the bounded finite-mesh observations be strengthened into exact identities for every positive integer mesh resolution `n` and every positive integer refinement factor `m`, without invoking a limit as `n -> infinity`?

Canonical separation:

```text
FOR_ALL_POSITIVE_INTEGER_N
!=
LIMIT_N_TO_INFINITY
```

A quantified discrete theorem may range over infinitely many integer meshes while identifying no continuum object.

---

## 1. Domain

Quantified variables:

```text
n in Z_{>0}
m in Z_{>0}
j in {0,...,n-1}
```

For parent-child refinement claims that require a proper refinement:

```text
m > 1
```

All algebra is exact over rational functions whose denominators are positive powers of `n` and `m` on the declared domain.

The symbolic verifier must clear denominators and prove polynomial numerators identically zero.

Finite sampling alone is inadmissible as proof.

---

## 2. Constant-density family

Frozen edge-integrated horizontal shear:

```text
a_n(j) = 2j / n^2
```

Unit-cell defect:

```text
f_n(j)
= a_n(j) - a_n(j+1)
= -2/n^2
```

Cell area:

```text
A_n = 1/n^2
```

Density:

```text
rho_n(j)=f_n(j)/A_n=-2
```

Macro unit-square defect:

```text
n^2 * f_n = -2
```

Parent-child refinement by factor `m` requires:

```text
f_n = m^2 * f_(nm)
```

and:

```text
A_n = m^2 * A_(nm)
```

and therefore exact density preservation.

The verifier must prove these after denominator clearing for symbolic `n,m`.

---

## 3. Variable-field family

Frozen edge-integrated horizontal shear:

```text
a_n(j)=2j^2/n^3
```

Unit-cell defect:

```text
f_n(j)=-(4j+2)/n^3
```

Density:

```text
rho_n(j)=-(4j+2)/n
```

### 3.1 Macro defect

Across the full `n x n` unit square:

```text
F_macro(n)
= n * sum_{j=0}^{n-1} f_n(j)
= -2
```

using exact finite sum:

```text
sum_{j=0}^{n-1} j = n(n-1)/2
```

### 3.2 Parent-child integrated defect

A parent cell `(i,j)` at mesh `n` contains an `m x m` block in mesh `nm`.

Each child row index is:

```text
j' = jm + r
r = 0,...,m-1
```

Each child row occurs `m` times across the parent width.

Required identity:

```text
f_n(j)
=
m * sum_{r=0}^{m-1} f_(nm)(jm+r)
```

Use:

```text
sum_{r=0}^{m-1} r = m(m-1)/2
```

and prove the cleared numerator is identically zero in `j,m`.

### 3.3 Parent-child density

All child areas are equal, so the area-weighted child density equals the arithmetic mean over the `m` child rows:

```text
rho_n(j)
=
(1/m) * sum_{r=0}^{m-1} rho_(nm)(jm+r)
```

after collapsing the repeated x-direction multiplicity.

Again prove symbolically after denominator clearing.

---

## 4. Flat family

Frozen edge-integrated horizontal shear:

```text
a_n = 7/n
```

Therefore:

```text
f_n = 0
F_macro(n)=0
```

for every positive integer `n`.

Nonidentity edge transport therefore remains compatible with identically zero discrete face curvature at every mesh.

---

## 5. Hostile mis-scaled family

Frozen bad discretization:

```text
a_bad_n(j)=2j/n
```

Unit-cell defect:

```text
f_bad_n=-2/n
```

Cell density:

```text
rho_bad_n=-2n
```

Macro defect:

```text
F_bad_macro(n)=-2n
```

Difference from the covariant target `-2`:

```text
F_bad_macro(n)-(-2)
= -2(n-1)
```

This polynomial is not identically zero and is nonzero for every integer `n>1`.

Parent-child integrated-defect mismatch under factor `m`:

```text
m^2 f_bad_(nm)-f_bad_n
= -2(m-1)/n
```

which is nonzero for every `m>1`.

The verifier must explicitly classify these as symbolic counterexamples rather than failed simplifications.

---

## 6. Gauge telescoping theorem

For any finite closed path:

```text
v0 -> v1 -> ... -> vk = v0
```

and any scalar vertex potential `phi`, an abelian shear-frame transformation adds edge increment:

```text
Delta_phi(e_i)=phi(v_{i+1})-phi(v_i)
```

The closed-path gauge contribution is:

```text
sum_i Delta_phi(e_i)=0
```

by exact telescoping.

The symbolic implementation must verify this structurally through a vertex coefficient ledger:

- every visited vertex receives `+1` for each arrival;
- every visited vertex receives `-1` for each departure;
- a closed path has zero net coefficient at every vertex.

No special numeric `phi` is required for this theorem.

Allowed relation:

```text
CLOSED_PATH_SHEAR_IS_GAUGE_INVARIANT_FOR_ANY_VERTEX_POTENTIAL_IN_AUTHORED_ABELIAN_SHEAR_MODEL
```

---

## 7. Proof obligations

The verifier must emit separate symbolic certificates for:

```text
C1 constant cell density
C2 constant macro defect
C3 constant parent-child integrated defect
C4 constant parent-child area
V1 variable macro defect
V2 variable parent-child integrated defect
V3 variable parent-child weighted density
F1 flat zero face defect
G1 generic closed-path gauge telescoping
B1 bad macro nonidentity witness
B2 bad proper-refinement mismatch witness
```

For identity obligations, certificate fields include:

```text
cleared_numerator_polynomial
coefficient_ledger
identically_zero
```

For hostile nonidentity obligations:

```text
witness_polynomial
identically_zero = false
nonzero_domain_condition
```

---

## 8. Falsifiers

The theorem candidate fails if any occur:

1. any identity certificate relies on finite sampling;
2. any cleared numerator retains a nonzero monomial coefficient;
3. the variable parent-child proof drops the `m` repeated x-direction multiplicity;
4. the weighted-density proof confuses integrated defect with density;
5. the gauge theorem assumes a specific numeric potential rather than closed-path coefficient cancellation;
6. the hostile polynomial is accidentally simplified to zero;
7. the theorem is promoted into existence of a continuum limit or differential connection.

---

## 9. Allowed bounded outcome

A complete proof may earn:

```text
ALL_N_DISCRETE_CURVATURE_REFINEMENT_IDENTITIES_PROVED_FOR_AUTHORED_SHEAR_CONNECTION_FAMILIES
```

and:

```text
FINITE_MESH_RECEIPT_UPGRADED_TO_DISCRETE_ALGEBRAIC_EXTENSION_THEOREM_WITHIN_DECLARED_MODEL
```

The theorem remains conditional on the authored formulas. It says nothing about arbitrary discretizations or empirical systems.

---

## 10. Continuum firewall

Even a proof for every positive integer `n` retains:

```text
limit_n_to_infinity_evaluated = false
Cauchy_convergence_established = false
continuum_connection_constructed = false
continuum_curvature_constructed = false
physical_scale = none
physical_geometry = none
```

The quantified domain is discrete.

No physical, Riemannian, Berry, quantum, Proto-Loom, production, or Vercel authority follows.

𝌋

⟐