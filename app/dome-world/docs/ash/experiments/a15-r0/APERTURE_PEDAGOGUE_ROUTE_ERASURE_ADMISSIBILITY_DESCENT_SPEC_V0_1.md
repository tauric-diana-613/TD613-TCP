𝌋

󐘓 U+10D613

# A15-R0 · Route-Erasure Admissibility Descent

Specification v0.1

Status: **PREREGISTERED / PRE-IMPLEMENTATION / FINITE / CLAIM-BOUNDED**

Parent scientific receipt:

```text
#750 = de1cc600b330e90fa237c8984379ee08a787b0f7
```

Gate:

```text
#737 = THREAD_SCOPED_ACTIVE for the present conversation
```

## 0. Purpose

#750 established that the exact lawful joint route×seam state space is the finite dependent sum

```text
D_c = Σ_(w∈G_c) K_w,
```

where `G_c` is the exact fixed-C1 authored-route fiber and `K_w` is route `w`'s exact raw seam-vector support.

It also established that equal route-conditioned seam cardinalities are exactly what permit a padding-free route-respecting Cartesian product **while route identity remains retained and route-local relabeling is allowed**.

This chamber asks the sharper question:

```text
when exact route identity is erased, can one exact route-independent raw-seam admissibility rule descend to the surviving fixed-C1 state?
```

This chamber concerns exact finite support sets, not probabilities, entropy, asymptotics, average coding, trees, DAGs, general dependent type theory, or real-world provenance reconstruction.

---

## 1. Exact raw seam supports

Fix lawful exact

```text
c=(t,E,O,P)
```

and exact route

```text
w = Q^q0 T Q^q1 T ... T Q^qt ∈ G_c.
```

For `t>=1`, define the exact raw seam support

```text
K_w = Π_(i=1)^(t-1) {0,...,q_i(w)} ⊆ N^(t-1).
```

For `t=0` and `t=1`, use the unique empty seam vector support

```text
K_w = {()}.
```

This support uses literal seam coordinates, not route-local mixed-radix labels.

Anti-equivalence:

```text
route-local rank alphabet equivalence != equality of raw seam supports.
```

---

## 2. Candidate theorem A · raw seam support reveals the internal route blocks

For every `t>=2`, candidate exact recovery law:

```text
q_i(w) = max { k_i : k∈K_w }
for each internal coordinate i=1,...,t-1.
```

Hence candidate exact implication:

```text
K_u = K_v
=>
q_i(u)=q_i(v) for every internal i.
```

The converse is immediate because equal internal block vectors define the same Cartesian seam box.

Thus:

```text
K_u = K_v
iff
internal block vectors agree.
```

For `t<=1`, the fixed-C1 route fiber is already singleton and the edge is handled separately.

---

## 3. Candidate theorem B · fixed C1 plus internal blocks determines endpoint blocks

Suppose `u,v∈G_c` share every internal block `q_1,...,q_(t-1)`.

### Odd t

If `t` is odd, endpoint `q_0` is even-parity and endpoint `q_t` is odd-parity. Therefore fixed `(E,O)` gives exactly:

```text
q_0 = E - Σ_(1<=i<=t-1, i even) q_i
q_t = O - Σ_(1<=i<=t-1, i odd) q_i.
```

### Even t>=2

If `t` is even, both endpoints are even-parity. Fixed `P` gives:

```text
q_t = (P - Σ_(i=1)^(t-1) i q_i)/t,
```

and fixed `E` then gives:

```text
q_0 = E - q_t - Σ_(1<=i<=t-1, i even) q_i.
```

Because both routes are already lawful members of the same exact C1 fiber, these values are nonnegative integers.

Therefore candidate exact implication:

```text
same fixed C1 + same internal blocks
=>
same endpoint blocks
=>
same complete route.
```

Combining with theorem A gives the candidate injectivity theorem:

```text
w -> K_w
is injective on G_c.
```

---

## 4. Candidate theorem C · exact raw-seam admissibility descent criterion

After route erasure, define an exact route-independent descended raw-seam admissibility support to mean a set

```text
Kbar_c ⊆ N^(t-1)
```

such that

```text
Kbar_c = K_w
for every w∈G_c.
```

Candidate general support criterion:

```text
exact descent exists
iff
K_w is constant over G_c.
```

By the candidate injectivity theorem of Sections 2–3, in this declared T/Q grammar the criterion sharpens to:

```text
exact raw-seam admissibility descends through route erasure
iff
|G_c|=1.
```

Thus any non-singleton exact fixed-C1 route fiber carries incompatible raw seam supports.

This is stronger than #750's cardinality-uniformity criterion.

```text
equal |K_w| across routes
!=
equal K_w across routes
!=
route-erasure admissibility descent.
```

---

## 5. Candidate theorem D · union/intersection extremal policies

Define finite route-erased support envelopes:

```text
U_c = ⋃_(w∈G_c) K_w
I_c = ⋂_(w∈G_c) K_w.
```

Candidate exact laws:

```text
I_c ⊆ K_w ⊆ U_c
for every w.
```

A route-independent raw-seam rule `A_c` is declared:

```text
universally sound     iff A_c ⊆ K_w for every w
universally complete  iff K_w ⊆ A_c for every w.
```

Therefore candidate extremal laws:

```text
universally sound     iff A_c ⊆ I_c
universally complete  iff U_c ⊆ A_c.
```

So:

```text
I_c = largest universally sound route-erased support
U_c = smallest universally complete route-erased support.
```

An exact universally sound-and-complete route-erased rule exists iff

```text
I_c=U_c
iff
all K_w equal
iff
|G_c|=1
```

inside the declared grammar.

---

## 6. Candidate theorem E · exact finite descent gap

Define the route-sensitive raw-seam descent gap

```text
Gamma_c = U_c \ I_c
Delta_descent(c)=|Gamma_c|=|U_c|-|I_c|.
```

Candidate exact criterion:

```text
Delta_descent(c)=0
iff
exact route-erasure raw-seam admissibility descends
iff
|G_c|=1.
```

If `Delta_descent>0`, every seam vector in `Gamma_c` is lawful under at least one erased route and unlawful under at least one erased route.

Thus any route-independent rule must choose between at least one false admission or at least one false rejection on those route-sensitive values.

This is deterministic set disagreement, not probability or error rate.

---

## 7. Mandatory hostile A · #750 equal-cardinality / unequal-support wound

Use

```text
c=(5,0,3,9).
```

Exact fixed-C1 routes should be:

```text
w0 blocks = (0,0,0,3,0,0)
w1 blocks = (0,1,0,1,0,1).
```

Both have exact seam cardinality `4`, which made #750's route-respecting product possible after route-conditioned relabeling.

But their literal raw seam supports should be:

```text
K_w0 = {(0,0,j,0): j=0,1,2,3}

K_w1 = {(a,0,b,0): a,b∈{0,1}}.
```

Hence:

```text
|K_w0|=|K_w1|=4
K_w0 != K_w1
|U_c|=6
|I_c|=2
Delta_descent=4.
```

Therefore candidate consequence:

```text
route-respecting product exactness while route survives
!=
raw-seam admissibility descent after route erasure.
```

This is the chamber's primary wound.

---

## 8. Mandatory hostile B · inherited five-state wound

For

```text
c=(3,1,1,3),
```

exact routes:

```text
(0,1,1,0)
(1,0,0,1).
```

Raw supports:

```text
K0={0,1}×{0,1}
K1={(0,0)}.
```

Therefore candidate values:

```text
|U|=4
|I|=1
Delta_descent=3.
```

Union is complete but not universally sound.
Intersection is sound but not universally complete.

---

## 9. Mandatory positive descent control

Use a nontrivial singleton route with a non-singleton seam support:

```text
c=(3,0,1,1).
```

Candidate unique route:

```text
blocks=(0,1,0,0)
```

with support

```text
K={(0,0),(1,0)}.
```

Therefore:

```text
|G_c|=1
U=I=K
Delta_descent=0
```

and exact route-erased raw seam admissibility descends.

This prevents the theorem from confusing route singleton with seam singleton.

---

## 10. Mandatory hostile controls

```text
H1  exact support is literal Cartesian seam box from route blocks
H2  coordinate maxima recover every internal block
H3  same support implies same internal blocks
H4  fixed C1 plus same internal blocks recovers endpoints for odd t
H5  fixed C1 plus same internal blocks recovers endpoints for even t>=2
H6  support map w->K_w is injective over each bounded exact C1 route fiber corroborated
H7  c=(5,0,3,9): cardinalities 4,4 but supports unequal
H8  c=(5,0,3,9): union=6, intersection=2, descent gap=4
H9  c=(3,1,1,3): union=4, intersection=1, descent gap=3
H10 c=(3,0,1,1): singleton route, nontrivial support, exact descent succeeds
H11 union policy admits every route-lawful value and falsely admits for at least one route whenever supports differ
H12 intersection policy never admits a route-unlawful value and falsely rejects for at least one route whenever supports differ
H13 arbitrary route-independent candidate support exactness succeeds iff candidate equals every K_w
H14 t=0 singleton edge
H15 t=1 singleton edge
H16 equal support cardinality must never impersonate support equality
H17 route-local rank relabeling must never impersonate raw support descent
H18 bounded enumeration is corroboration only; universal authority comes from support maxima + endpoint recovery
H19 no probability, entropy, average-case coding, asymptotic growth, trees/DAGs, category theory, or general dependent type theory
H20 #745 seam-count horizon remains closed
```

---

## 11. Candidate classifications · NOT YET EARNED

Canonical candidate:

```text
THE_RAW_LINEAR_SEAM_SUPPORT_MAP_w_TO_K_w_IS_INJECTIVE_ON_EVERY_EXACT_FIXED_C1_ROUTE_FIBER_BECAUSE_SUPPORT_COORDINATE_MAXIMA_RECOVER_INTERNAL_BLOCKS_AND_FIXED_C1_RECOVERS_ENDPOINTS
```

Consequential candidate:

```text
EXACT_ROUTE_INDEPENDENT_RAW_SEAM_ADMISSIBILITY_DESCENDS_THROUGH_ROUTE_ERASURE_IF_AND_ONLY_IF_THE_EXACT_FIXED_C1_ROUTE_FIBER_IS_SINGLETON
```

Architectural candidate:

```text
WHEN_ROUTE_ERASURE_COLLAPSES_DISTINCT_ROUTE_CONDITIONED_SUPPORTS_THE_UNION_IS_THE_MINIMUM_COMPLETE_RULE_THE_INTERSECTION_IS_THE_MAXIMUM_SOUND_RULE_AND_THE_NONEMPTY_DIFFERENCE_IS_A_FINITE_CERTIFICATE_THAT_NO_SURVIVING_ROUTE_INDEPENDENT_RULE_CAN_PRESERVE_BOTH
```

---

## 12. Good-through-󐘓 U+10D613 candidate

```text
same number of lawful values does not mean same lawful values
route-conditioned relabeling authority disappears when the route key disappears
union preserves possibilities by admitting cross-route counterfactuals
intersection prevents cross-route counterfactuals by suppressing route-specific lawful values
route-sensitive admissibility must remain visibly unresolved when provenance needed to decide it has been erased
```

---

## 13. Claim ceiling

Still closed:

```text
general finite quotient theorem beyond the declared T/Q route/seam grammar
arbitrary state spaces or arbitrary admissibility families
general sheaf/descent theory
category theory / dependent type theory
probability / entropy / mutual information
average-case or variable-length coding
asymptotic growth / t->infinity
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

The possible abstract finite admissibility-descent theorem is explicitly reserved for a later chamber. This chamber must earn the concrete T/Q route-erasure case first.

---

## 14. Stop rule

Earn this chamber only if exact-head witness confirms the support-injectivity proof, the iff-singleton descent criterion, union/intersection extremality, and the equal-cardinality/unequal-support hostile.

If any implication fails, preserve the failure and stop. Do not widen into a general quotient theorem, larger seam horizon, or asymptotics.

```text
ROUTE_ERASURE_ADMISSIBILITY_DESCENT_PREREGISTERED
EQUAL_CARDINALITY_DOES_NOT_AUTHORIZE_SUPPORT_DESCENT
NO_ASYMPTOTIC_ESCAPE
```

󐘓 U+10D613

𝌋

Sealed ⟐