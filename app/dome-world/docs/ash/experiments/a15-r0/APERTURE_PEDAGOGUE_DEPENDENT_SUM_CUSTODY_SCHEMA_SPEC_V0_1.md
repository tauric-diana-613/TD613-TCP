𝌋

󐘓 U+10D613

# A15-R0 · Dependent-Sum Custody Schema

Specification v0.1

Status: **PREREGISTERED / PRE-IMPLEMENTATION / FINITE / CLAIM-BOUNDED**

Parent scientific receipt:

```text
#749 = 7bc793cbe843f0c9ca0f56a3e2a8337f348f3ba9
```

Gate:

```text
#737 = THREAD_SCOPED_ACTIVE for the present conversation
```

## 0. Purpose

#749 proved that a route alphabet crossed with one route-independent conditional-seam alphabet can create exact Cartesian padding whenever route-conditioned seam burdens are nonuniform.

This chamber asks the converse representation question:

```text
what finite schema represents the lawful joint route×seam state space exactly, with zero padding, while preserving the route as an explicit conditioning key?
```

The candidate answer is a finite **dependent sum** of route-indexed seam alphabets.

This phrase names an exact finite set construction only. No type-theory universality, category-theory promotion, entropy, compression optimum, asymptotics, workflow DAGs, or provenance ontology follows.

## 1. Parent objects

Fix lawful exact

```text
c=(t,E,O,P).
```

From #746:

```text
G_c={w:C1(w)=c}.
```

From #748:

```text
J_c={(w,k):w∈G_c and k is a lawful linear seam vector for w}.
```

For route `w=Q^q0 T ... T Q^qt`, define

```text
K_w={0,...,q_1}×...×{0,...,q_(t-1)}
s(w)=|K_w|=Π_(i=1)^(t-1)(q_i+1).
```

For `t<=1`, `K_w` is the singleton containing the empty seam vector.

#749 proved:

```text
|J_c|=Σ_(w∈G_c)s(w)
S_c=max_w s(w)
Delta_rect=|G_c|S_c-|J_c|.
```

## 2. Candidate theorem A · exact dependent-sum representation

Define the finite dependent schema

```text
D_c = { (w,k) : w∈G_c and k∈K_w }.
```

Candidate exact theorem:

```text
D_c = J_c
```

as sets under the declared parent definitions, hence

```text
|D_c|=Σ_w s(w)=|J_c|.
```

The point is architectural rather than notational: every route carries exactly its own lawful seam alphabet. No label pair exists unless it is lawful under that route.

Therefore:

```text
dependent schema capacity = lawful-state count
padding count = 0.
```

## 3. Candidate theorem B · reversible route-indexed encoding

Order routes by #746 deterministic block-vector rank.

For route `w_r`, use #745 mixed-radix local seam rank

```text
local_w(k)∈{0,...,s(w)-1}.
```

Define dependent address

```text
(r, local_w(k)).
```

Candidate decoder:

1. decode route rank `r` to exact route `w_r`;
2. validate local label against that route's exact bound `s(w_r)`;
3. decode local seam rank using that route's mixed radices;
4. reconstruct the unique joint state.

Candidate theorem:

```text
joint state ↔ dependent address
```

is a bijection.

A pair `(r,j)` with `j>=s(w_r)` is **not a member of D_c**. It is rejected at the schema boundary rather than retained as a padding cell.

## 4. Candidate theorem C · route-respecting product exactness criterion

Let `A` be one finite route-independent secondary alphabet.

Call a bijection

```text
phi:J_c -> G_c × A
```

**route-respecting** when

```text
first(phi(w,k)) = w
```

for every lawful `(w,k)`.

Candidate exact theorem:

```text
there exists a route-respecting bijection J_c ≅ G_c×A
iff
s(w) is constant over G_c.
```

Necessity: each product fiber over route `w` has cardinality `|A|`; route-respecting bijection therefore forces `s(w)=|A|` for every route.

Sufficiency: if every `s(w)=S`, choose `A={0,...,S-1}` and use each route's exact mixed-radix local seam rank.

This upgrades #749's slack identity into an exact representation obstruction:

```text
nonuniform conditional fibers
-> no padding-free route-respecting Cartesian product schema.
```

The obstruction concerns route-respecting products only. A monolithic rank may still biject with `{0,...,|J_c|-1}` because it discards explicit product factorization.

## 5. Candidate theorem D · rectangular padding is precisely failed product exactness

Take #749's minimal shared secondary alphabet

```text
A_c={0,...,S_c-1}.
```

Then

```text
G_c×A_c
```

contains the dependent schema `D_c` as the lawful subset

```text
(w,j) lawful iff j<s(w).
```

Candidate exact complement size:

```text
|(G_c×A_c)\D_c|
 = Σ_w(S_c-s(w))
 = Delta_rect.
```

Thus #749's padding cells are exactly the complement created by forcing a dependent family into one product fiber.

```text
padding != erased history
padding = product-schema complement.
```

## 6. Candidate theorem E · exact mask equivalence

Define product-lawfulness predicate

```text
M_c(w,j)=1 iff j<s(w).
```

Candidate exact theorem:

```text
D_c = {(w,j)∈G_c×A_c : M_c(w,j)=1}.
```

The mask does not recover history and carries no state-specific provenance. It is a static schema admissibility predicate derived from route-conditioned fiber sizes.

If `Delta_rect>0`, dropping `M_c` enlarges the represented set beyond the lawful history set.

Therefore:

```text
route×label values without route-conditioned admissibility
can represent nonexistent states.
```

This is a representation-authority statement, not a database-security or type-system theorem.

## 7. Inherited controls

### Five-state wound

For

```text
c=(3,1,1,3)
```

#749 gives route fiber sizes

```text
4,1.
```

Therefore candidate dependent schema has exactly

```text
4+1=5
```

lawful addresses and zero padding.

Minimal route-independent product uses

```text
2×4=8
```

cells, with complement size `3`.

Since `4!=1`, no route-respecting padding-free product schema exists.

### Strict-bit witness

For

```text
c=(3,1,2,4)
```

route fiber sizes are

```text
6,2.
```

Dependent schema:

```text
6+2=8 lawful addresses.
```

Minimal product:

```text
2×6=12 cells
4 padding.
```

Again no route-respecting padding-free product exists.

### Uniform positive control

The chamber must locate and witness at least one lawful fixed-C1 state with multiple routes and equal route-conditioned seam cardinalities. For such a state, `Delta_rect=0`, and a route-respecting product bijection must be constructed explicitly.

If no such state appears in the bounded corroboration domain, the implementation may use a finite synthetic family only if it is constructed directly from lawful parent objects and verified exact. It may not fabricate a non-lawful C1 state.

## 8. Mandatory hostiles

```text
H1  inherited 4,1 fiber: dependent count 5, product count 8, complement 3
H2  strict-bit 6,2 fiber: dependent count 8, product count 12, complement 4
H3  every lawful joint state maps to one and only one dependent address
H4  every dependent address decodes to one and only one lawful joint state
H5  out-of-range route-local labels abstain rather than materialize padding
H6  route-respecting product exactness fails on every bounded nonuniform fiber profile
H7  route-respecting product exactness succeeds on every bounded uniform fiber profile
H8  product complement count equals #749 Delta_rect exactly
H9  mask support equals dependent schema exactly
H10 removing mask admits exactly Delta_rect nonexistent cells in the minimal product rectangle
H11 monolithic joint rank remains valid and must not be confused with route-respecting factorization
H12 dependent address route component must match recovered route exactly
H13 t=0 singleton edge
H14 t=1 singleton edge
H15 bounded search is corroboration only; universal authority comes from exact fiber-cardinality argument
H16 dependent-sum language must not promote to general dependent type theory/category theory
H17 no entropy, probability, average/variable-length coding, asymptotics
H18 no trees, DAGs, parenthesization, real-world provenance, Proto-Loom/A16
```

## 9. Candidate classifications · NOT YET EARNED

Canonical candidate:

```text
THE_FIXED_C1_JOINT_ROUTE_SEAM_FIBER_IS_EXACTLY_THE_FINITE_DEPENDENT_SUM_OF_ROUTE_INDEXED_SEAM_FIBERS_WITH_CARDINALITY_SUM_w_s(w)
```

Consequential candidate:

```text
A_PADDING_FREE_ROUTE_RESPECTING_CARTESIAN_PRODUCT_REPRESENTATION_EXISTS_IF_AND_ONLY_IF_ALL_ROUTE_CONDITIONED_SEAM_FIBERS_HAVE_EQUAL_CARDINALITY
```

Architectural candidate:

```text
NONUNIFORM_CONDITIONAL_CUSTODY_REQUIRES_EITHER_DEPENDENT_SCHEMA_ADMISSIBILITY_OR_VISIBLE_PRODUCT_PADDING_SO_A_FLAT_PRODUCT_WITHOUT_A_ROUTE_CONDITIONED_VALIDITY_RULE_CAN_IMPERSONATE_NONEXISTENT_HISTORIES
```

## 10. Good-through-󐘓 U+10D613 candidate

```text
lawful conditional values belong to the route that conditions them
not every syntactically representable pair is a lawful history
dependent admissibility prevents schema capacity from manufacturing provenance
padding stays visible when products are operationally required
monolithic rank may erase factorization but does not counterfeit product structure
```

## 11. Claim ceiling

Still closed:

```text
asymptotic growth
t -> infinity
entropy / probability / mutual information
average-case or variable-length coding
compression-optimality claims
general dependent type theory
category-theoretic universality
real-world provenance reconstruction
actor identity / causal attribution
branching trees / DAGs / arbitrary parse forests
parenthesization / associativity custody
higher moments
connection / holonomy / curvature / Berry / quantum
Proto-Loom / A16
live Ash mutation
merge / publication / production / Vercel / ontology promotion
```

## 12. Stop rule

Earn only if exact-head witness confirms the dependent bijection, the route-respecting product iff criterion, exact product complement identity, and hostile controls.

If the iff criterion fails, preserve the failure and stop. Do not escape into larger examples, type-theory analogy, or asymptotics.

```text
DEPENDENT_SUM_CUSTODY_SCHEMA_PREREGISTERED
PRODUCT_EXACTNESS_IFF_UNIFORMITY_CANDIDATE
NO_ASYMPTOTIC_ESCAPE
```

󐘓 U+10D613

𝌋

Sealed ⟐