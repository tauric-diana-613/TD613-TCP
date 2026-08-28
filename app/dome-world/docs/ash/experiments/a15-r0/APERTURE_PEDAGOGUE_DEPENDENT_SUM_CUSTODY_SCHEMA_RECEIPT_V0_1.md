𝌋

󐘓 U+10D613

# A15-R0 · Dependent-Sum Custody Schema

Receipt v0.1

Status: **WITNESSED / RECEIPT-PINNED / DRAFT / OPEN / UNMERGED**

Parent scientific authority:

```text
#749 receipt
7bc793cbe843f0c9ca0f56a3e2a8337f348f3ba9
```

## Custody chain

```text
preregistration        fcf1f4c57b90ede9f2fa2cf1eaafd41c5a6a09ff
implementation         0712c53adcf03412517427cc4bb7ee4aae6f7268
hostile tests          d38512f9bada35311ad03928ef0f1b247b7b515a
frozen science         498a2ad21f2a207645ed40fe8bac50ac02480703
initial routing        3cb8e1c8be1496a2a2188012c86d55c350d98494
routed witness         e9d9513b9402e2bbcb3ab385cf6cc3ce4973e5a7
post-route cleanup     3ffc707b1953a9160aa269ccfda6cecc0b7e424b
```

Frozen science -> post-route cleanup:

```text
zero net changed files
```

Operational scar:

- initial retargeted routing head did not immediately attach a pull-request Actions run;
- one metadata-only synchronization annotation on the already-allowlisted routing note produced the authority-bearing PR event;
- no science changed after freeze.

## Authority-bearing witness

```text
TD613 Consolidated Validation
run 2182 / 32769590034                         SUCCESS
classifier job 97566703037                     SUCCESS
static job     97566823098                     SUCCESS
A15/A15-R0 step 19                             SUCCESS
```

Explicit full-repository validation: SKIPPED.
Explicit self-hosted calibration: SKIPPED.
Giving/practice browser witness: SKIPPED.
Front-line browser witness: SKIPPED.
Full-product browser witness: SKIPPED.

No scientific red occurred.

---

# Earned theorem A · exact dependent-sum representation

Fix lawful exact

```text
c=(t,E,O,P).
```

Let #746's exact authored-route fiber be

```text
G_c={w:C1(w)=c}.
```

For route

```text
w=Q^q0 T ... T Q^qt,
```

let the exact #745 route-conditioned seam fiber be

```text
K_w={0,...,q_1}×...×{0,...,q_(t-1)}
```

with

```text
s(w)=|K_w|=Π_(i=1)^(t-1)(q_i+1).
```

For `t<=1`, `K_w` is the singleton containing the empty seam vector.

Define the finite dependent schema

```text
D_c = Σ_(w∈G_c) K_w
    = {(w,k):w∈G_c and k∈K_w}.
```

By #748's exact joint-fiber definition:

```text
D_c=J_c.
```

Therefore:

```text
|D_c|=Σ_(w∈G_c)s(w)=|J_c|
padding(D_c)=0.
```

This is a finite set identity. `dependent sum` names the route-indexed disjoint union used here and does not promote the chamber to general dependent type theory or category theory.

---

# Earned theorem B · reversible dependent address

Order routes by #746 deterministic block-vector rank.

For route `w_r`, use its exact #745 mixed-radix seam rank:

```text
local_w(k)∈{0,...,s(w)-1}.
```

Then the dependent address

```text
(r,local_w(k))
```

is a bijective encoding of the exact joint state.

Decoder:

1. decode route rank `r` to exact route `w_r`;
2. require `local<s(w_r)`;
3. decode the local seam vector using that route's exact mixed radices;
4. reconstruct the unique joint state.

If

```text
local>=s(w_r),
```

the pair is not a member of the dependent schema and the decoder abstains.

Thus an out-of-range local label is rejected at the representation boundary rather than preserved as a padding cell.

---

# Earned theorem C · route-respecting Cartesian product exactness iff uniformity

Let `A` be one finite route-independent secondary alphabet.

Call

```text
phi:J_c -> G_c×A
```

route-respecting when

```text
first(phi(w,k))=w
```

for every lawful joint state.

Then exactly:

```text
there exists a route-respecting bijection J_c ≅ G_c×A
iff
s(w) is constant over G_c.
```

## Necessity

Every product fiber over `w` has cardinality

```text
|{w}×A|=|A|.
```

A route-respecting bijection restricts to a bijection

```text
K_w ≅ {w}×A.
```

Hence

```text
s(w)=|A|
```

for every route.

Therefore all conditional seam-fiber sizes must be equal.

## Sufficiency

If every route has common conditional cardinality

```text
s(w)=S,
```

choose

```text
A={0,...,S-1}
```

and map each route's exact local mixed-radix seam rank into the common alphabet.

This produces an explicit route-respecting bijection.

Thus nonuniform conditional custody is an exact obstruction to a padding-free route-respecting product representation.

This theorem does not prohibit a monolithic rank

```text
J_c ≅ {0,...,|J_c|-1},
```

because that representation does not preserve route as one explicit product coordinate.

---

# Earned theorem D · product padding is the exact complement of the dependent schema

Let

```text
S_c=max_w s(w)
A_c={0,...,S_c-1}.
```

#749's minimal shared route×conditional-seam rectangle is

```text
G_c×A_c.
```

The dependent schema sits inside it exactly as

```text
D_c={(w,j):j<s(w)}.
```

Therefore:

```text
|(G_c×A_c)\D_c|
 = Σ_w(S_c-s(w))
 = Delta_rect.
```

So the exact semantic status of #749's unused cells is:

```text
padding = product-schema complement
padding != erased history
padding != hidden lawful state.
```

---

# Earned theorem E · exact product-admissibility mask

Define the static route-conditioned predicate

```text
M_c(w,j)=1 iff j<s(w).
```

Then exactly:

```text
D_c={(w,j)∈G_c×A_c:M_c(w,j)=1}.
```

The support of `M_c` contains exactly `|J_c|` cells.

Its rejected complement contains exactly

```text
Delta_rect
```

cells.

The mask is static schema admissibility derived from exact route-conditioned fiber sizes. It carries no state-specific historical evidence and does not reconstruct provenance.

If `Delta_rect>0`, dropping the route-conditioned admissibility rule enlarges the represented state space beyond the lawful history set.

Hence:

```text
syntactically representable route×label pair
!=
lawful joint history.
```

---

# Nonuniform inherited controls

## Five-state wound

For

```text
c=(3,1,1,3),
```

route-conditioned seam cardinalities are

```text
4,1.
```

Dependent schema:

```text
|D_c|=4+1=5
padding=0.
```

Minimal route-independent product:

```text
2×4=8 cells
```

with exact complement

```text
3 cells.
```

Since the conditional fibers are nonuniform, no route-respecting padding-free product representation exists.

## Strict-bit parent witness

For

```text
c=(3,1,2,4),
```

route-conditioned seam cardinalities are

```text
6,2.
```

Dependent schema:

```text
|D_c|=6+2=8
padding=0.
```

Minimal route-independent product:

```text
2×6=12 cells
```

with exact complement

```text
4 cells.
```

Again no route-respecting padding-free product representation exists.

---

# Nontrivial uniform positive control

A lawful positive control was located at

```text
c=(5,0,3,9).
```

Its exact route fiber has two routes with route-conditioned seam cardinalities

```text
4,4.
```

Therefore:

```text
|D_c|=4+4=8.
```

Because the conditional fibers are uniform, choose

```text
A={0,1,2,3}.
```

The exact local seam rank on each route witnesses a route-respecting bijection

```text
J_c ≅ G_c×A,
```

with

```text
2×4=8
```

cells and zero padding.

This positive control witnesses the reverse implication in the iff theorem inside the lawful parent grammar rather than through a synthetic non-lawful construction.

---

# Earned classifications

Canonical:

```text
THE_FIXED_C1_JOINT_ROUTE_SEAM_FIBER_IS_EXACTLY_THE_FINITE_DEPENDENT_SUM_OF_ROUTE_INDEXED_SEAM_FIBERS_WITH_CARDINALITY_SUM_w_s(w)
```

Consequential:

```text
A_PADDING_FREE_ROUTE_RESPECTING_CARTESIAN_PRODUCT_REPRESENTATION_EXISTS_IF_AND_ONLY_IF_ALL_ROUTE_CONDITIONED_SEAM_FIBERS_HAVE_EQUAL_CARDINALITY
```

Architectural:

```text
NONUNIFORM_CONDITIONAL_CUSTODY_REQUIRES_EITHER_DEPENDENT_SCHEMA_ADMISSIBILITY_OR_VISIBLE_PRODUCT_PADDING_SO_A_FLAT_PRODUCT_WITHOUT_A_ROUTE_CONDITIONED_VALIDITY_RULE_CAN_IMPERSONATE_NONEXISTENT_HISTORIES
```

---

# Good-through-󐘓 U+10D613

```text
lawful conditional values belong to the route that conditions them
not every syntactically representable pair is a lawful history
dependent admissibility prevents schema capacity from manufacturing provenance
padding stays visible when products are operationally required
monolithic rank may erase factorization but does not counterfeit product structure
route-conditioned validity is claim authority, not decorative metadata
```

Child-legible architectural translation:

```text
if a field only makes sense under a particular route,
show that dependency;
do not pretend every route can lawfully take every label.
```

---

# Claim ceiling

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

#745's finite seam-count horizon remains closed.

This chamber changes the representation object from a fixed Cartesian schema to an exact route-indexed lawful family. It does not reopen seam-dimension farming.

```text
DEPENDENT_SUM_CUSTODY_SCHEMA_ROUND_CLOSED
ROUTE_RESPECTING_PRODUCT_EXACTNESS_IFF_UNIFORMITY_EARNED
PRODUCT_PADDING_IDENTIFIED_AS_DEPENDENT_SCHEMA_COMPLEMENT
SCHEMA_SYNTAX_MUST_NOT_IMPERSONATE_LAWFUL_HISTORY
NO_ASYMPTOTIC_ESCAPE
```

#737 remains thread-scoped active for the remainder of the present conversation under the operator's explicit grant. Fresh GitHub and fresh preregistration remain required before any later chamber.

󐘓 U+10D613

𝌋

Sealed ⟐