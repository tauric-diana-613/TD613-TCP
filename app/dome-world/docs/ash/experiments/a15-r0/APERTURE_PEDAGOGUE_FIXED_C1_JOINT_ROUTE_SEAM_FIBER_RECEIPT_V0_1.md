𝌋

󐘓 U+10D613

# A15-R0 · Fixed-C1 Joint Authored-Route × Linear-Seam Fiber

Receipt v0.1

Status: **WITNESSED / RECEIPT-PINNED / DRAFT / OPEN / UNMERGED**

Parent scientific authority:

```text
#746 receipt
f15ab5e46c7ee7de43a44386c8fea36e272dba9b
```

Receiving dock #747 remained documentary and was not used as scientific ancestry.

## Custody chain

```text
preregistration        febccfeffb2a82bd93290457b7187718efb4ed1f
implementation         62e76e2ae51c0bf917f03a12c718602bdb20a5e4
tests                  840bcd5f91c364f0e54e6f17c5bc660dee0d3eb2
frozen science         ae9f8d7eeefc4de39d5a09d086daadbed22d7e47
initial routing        456b4e04f415d6663774ab68302b762c16bb9f8a
routed witness head    a2cfc7c83aa808171b11054746b4b3ccbea36c42
post-route cleanup     a8c0bf12e845bfaa2efac6c058a0fca0aa916bb3
```

The initial retargeted routing head did not immediately attach a pull-request Actions run. One metadata-only synchronization update to the already-allowlisted routing note registered a fresh PR event. This is preserved as an operational routing scar.

Frozen science -> post-route cleanup:

```text
zero net changed files
```

No theorem, hostile, test, or claim ceiling changed after scientific freeze.

## Authority-bearing witness

```text
TD613 Consolidated Validation
run 2180 / 32767346291                         SUCCESS
classifier job 97559706034                     SUCCESS
static job     97559767256                     SUCCESS
A15/A15-R0 step 19                             SUCCESS
```

Explicit full-repository validation: SKIPPED.
Explicit self-hosted calibration: SKIPPED.
Giving/practice browser witness: SKIPPED.
Front-line browser witness: SKIPPED.
Full-product browser witness: SKIPPED.

No scientific red occurred.

---

# Earned theorem

Fix a lawful exact first-moment state

```text
c=(t,E,O,P).
```

For `t>=1`, write each authored route uniquely as

```text
w=Q^q0 T Q^q1 T ... T Q^qt.
```

Let a lawful #745 linear seam vector be

```text
k=(k_1,...,k_(t-1)),
0<=k_i<=q_i.
```

Define the joint fiber

```text
J_c={(w,k): C1(w)=c and k is a lawful seam vector for w}.
```

For every internal block, split

```text
q_i = left_i + right_i
left_i=k_i
right_i=q_i-k_i.
```

Endpoints `q_0,q_t` remain single coordinates.

Therefore each joint state is in exact bijection with one finite seam-split block allocation:

```text
(q_0; left_1,right_1; ...; left_(t-1),right_(t-1); q_t).
```

The inverse reconstructs

```text
q_i=left_i+right_i
k_i=left_i.
```

Thus route and seam are recovered together without choosing a representative.

---

## Exact finite duplicated-slot coefficient law

Let

```text
m_i=1  for i=0 or i=t
m_i=2  for 1<=i<=t-1.
```

For parity `p in {0,1}` and finite total `N`, define

```text
F_(t,p,N)(x,q)
 = product_(0<=i<=t, i mod 2=p)
     (sum_(n=0)^N x^n q^(floor(i/2)n))^m_i.
```

Then

```text
A_(t,E)(q)=[x^E]F_(t,0,E)(x,q)
B_(t,O)(q)=[y^O]F_(t,1,O)(y,q)
J_(t,E,O)(q)=A_(t,E)(q)B_(t,O)(q).
```

All sums and products are finite.

With

```text
R=(P-O)/2,
```

the exact joint route × seam cardinality is

```text
|J_c|=[q^R]J_(t,E,O)(q).
```

Equivalent route-conditioned form:

```text
|J_c|
 = sum_(w in G_c) product_(i=1)^(t-1)(q_i(w)+1),
```

where `G_c` is #746's exact authored-route fiber.

The coefficient law comes from the exact seam-split bijection. Bounded enumeration was corroboration only.

---

## Inherited wound closes at five

For

```text
c=(3,1,1,3)
R=1,
```

#746 gives exactly:

```text
T Q T Q T    blocks=(0,1,1,0)
Q T T T Q    blocks=(1,0,0,1).
```

Their #745 conditional seam fibers have cardinalities:

```text
(0,1,1,0) -> 4
(1,0,0,1) -> 1.
```

The exact joint polynomial is

```text
J_(3,1,1)(q)=2+5q+2q^2.
```

Therefore

```text
|J_(3,1,1,3)|=5.
```

The two routes under one exact C1 state carry different exact conditional seam burdens.

This forbids replacing the joint fiber with

```text
N_route * one common N_seam.
```

---

## Fixed-base consistency law

For every `t>=1`, seam splitting yields exactly `t` nonnegative allocation slots in each parity class.

Consequently:

```text
sum over lawful P of |J_(t,E,O,P)|
 = binom(E+t-1,E) binom(O+t-1,O).
```

This is finite stars-and-bars consistency, not asymptotic growth.

The `t=0` and `t=1` lawful edges each have one exact joint state.

For `t=2`, exact C1 fixes the route and the remaining exact joint ambiguity is the middle odd seam:

```text
|J_c|=O+1.
```

---

## Tight exact joint custody

Given exact C1 retained, exact deterministic recovery of one lawful joint state requires:

```text
K_joint_min(c)=|J_c|
B_joint_min(c)=ceil(log2 |J_c|).
```

Necessity is finite injectivity over the joint fiber.

Tightness is witnessed by the reversible encoder:

```text
joint_rank
 = route_prefix_offset
 + route_conditioned_mixed_radix_seam_rank.
```

Routes use #746 deterministic block-vector order. Each route's interval width is its exact #745 seam cardinality. The decoder first identifies the unique route interval, then decodes the local seam vector in that route's mixed radices.

`joint_rank` is a decoder label only.

```text
joint rank != historical priority
joint count != probability
```

---

## Anti-impersonation hostiles

At the inherited five-state wound, local seam vector

```text
(0,0)
```

occurs beneath both exact routes. Therefore:

```text
local seam label != route identity.
```

The exact route `TQTQT` retains four lawful seams. Therefore:

```text
exact route != exact joint state
```

when its conditional seam fiber is non-singleton.

The earned custody relation is:

```text
exact C1 custody
!= exact authored-route custody
!= exact linear-seam custody.
```

But exact route plus exact route-conditioned seam evidence can recover the joint state, and one exact joint rank can encode both.

The theorem therefore establishes **coupling and nonuniformity**, not a prohibition on separately witnessed route and conditional-seam fields.

---

# Earned classifications

Canonical:

```text
THE_FIXED_C1_JOINT_AUTHORED_ROUTE_X_LINEAR_SEAM_FIBER_IS_BIJECTIVE_TO_FINITE_SEAM_SPLIT_BLOCK_ALLOCATIONS_AND_IS_COUNTED_BY_THE_q^R_COEFFICIENT_OF_THE_DUPLICATED_INTERNAL_SLOT_POLYNOMIAL
```

Consequential:

```text
ROUTES_SHARING_ONE_EXACT_C1_STATE_CAN_CARRY_DIFFERENT_EXACT_SEAM_FIBER_CARDINALITIES_SO_ROUTE_AND_SEAM_CUSTODY_ARE_SEPARATE_BUT_COUPLED_FINITE_RESOURCES
```

Architectural:

```text
EXACT_JOINT_ROUTE_SEAM_RECOVERY_REQUIRES_CUSTODY_OVER_THE_COUPLED_JOINT_FIBER_OR_EQUIVALENT_ROUTE_PLUS_ROUTE_CONDITIONAL_SEAM_EVIDENCE
```

Good-through-󐘓 U+10D613:

```text
exact answer custody does not authorize route claims
exact route custody does not authorize unrecorded seam claims
local seam labels do not authorize route identity
coupled ambiguity remains visible until custody separates it
preserve the full lawful joint fiber or abstain
rank labels decode; they do not narrate history
```

---

# Claim ceiling

Still closed:

```text
asymptotic growth
t -> infinity
limit shapes
entropy / probability / mutual information
average-case coding
real-world provenance reconstruction
actor identity / causal attribution
arbitrary workflow DAGs
branching factorization trees
parenthesization / associativity custody
Catalan-count promotion
higher moments
connection / holonomy / curvature / Berry / quantum
Proto-Loom / A16
live Ash mutation
merge / publication / production / Vercel / ontology promotion
```

#745's finite seam-count horizon remains closed. This chamber changed the object by coupling route and seam fibers; it did not reopen seam-dimension farming.

```text
FIXED_C1_JOINT_ROUTE_SEAM_FIBER_ROUND_CLOSED
JOINT_CUSTODY_COUPLING_BOUNDARY_EARNED
NO_ASYMPTOTIC_ESCAPE
```

#737 remains thread-scoped active for the remainder of the present conversation per the operator's prior explicit grant. Fresh GitHub and a fresh preregistration remain required before any later chamber.

󐘓 U+10D613

𝌋

Sealed ⟐