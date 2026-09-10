𝌋

󐘓 U+10D613

# A15-R0 · Fixed-C1 Joint Authored-Route × Linear-Seam Fiber

Specification v0.1

Status: **PREREGISTERED / PRE-IMPLEMENTATION / FINITE / THREAD-SCOPED WESTWARD AUTHORITY**

Parent scientific receipt:

```text
#746 = f15ab5e46c7ee7de43a44386c8fea36e272dba9b
```

Receiving dock #747 is documentary only and is not scientific ancestry for this chamber.

Gate:

```text
#737 = THREAD_SCOPED_ACTIVE in the present conversation
```

No merge, publication, production, Vercel release, Proto-Loom/A16 promotion, live Ash mutation, or ontology promotion is authorized.

---

## 1. Research question

#745 proved the exact linear seam fiber after the full authored T/Q word is retained.

#746 proved the exact complete authored-route fiber after only the first-moment state

```text
C1=(t,E,O,P)
```

is retained.

This chamber asks the next finite question:

> Given exact C1 but neither exact authored route nor exact linear seam vector, what is the exact joint lawful fiber of `(route,seam)` states, and what minimum additional custody recovers one joint state without impersonation?

The object is

```text
J_c={(w,k): C1(w)=c and k is a lawful #745 one-T-per-factor seam vector for w}.
```

This is not a branching tree, workflow DAG, parenthesization space, probability distribution, entropy model, or real-world provenance theorem.

---

## 2. Block and rank coordinates

Every authored route with `t` T-generators has unique block form

```text
w=Q^q0 T Q^q1 T ... T Q^qt.
```

#746 fixes

```text
E=sum_(i even) q_i
O=sum_(i odd) q_i
R=(P-O)/2=sum_i floor(i/2) q_i.
```

For `1<=i<=t-1`, #745's seam coordinate cuts the internal Q-run `q_i` into two nonnegative pieces:

```text
left_i = k_i
right_i = q_i-k_i
left_i,right_i>=0.
```

Endpoints remain unsplit:

```text
q_0
q_t.
```

Therefore each joint `(route,seam)` state determines the seam-split block vector

```text
(q_0; left_1,right_1; ...; left_(t-1),right_(t-1); q_t).
```

Conversely, every such nonnegative seam-split vector reconstructs uniquely

```text
q_i=left_i+right_i
k_i=left_i,
```

and hence reconstructs one exact authored route plus one exact #745 seam vector.

### Preregistered primary bijection candidate

```text
JOINT_FIXED_C1_ROUTE_SEAM_STATE
<->
SEAM_SPLIT_BLOCK_ALLOCATION_SATISFYING_THE_SAME_E_O_R_CONSTRAINTS
```

This must be proved symbolically and corroborated finitely. Enumeration alone cannot carry universal authority.

---

## 3. Duplicated-slot coefficient law

Let

```text
m_i = 1, i=0 or i=t
m_i = 2, 1<=i<=t-1.
```

Each internal block index appears twice because seam custody separates the left and right pieces. Each endpoint appears once.

For parity `p in {0,1}` and total `N`, define the exact finite truncated slot polynomial

```text
F_(t,p,N)(x,q)
 = product over i in {0,...,t}, i mod 2=p
     ( sum_(n=0)^N x^n q^(floor(i/2)n) )^m_i.
```

Define

```text
A_(t,E)(q)=[x^E]F_(t,0,E)(x,q)
B_(t,O)(q)=[y^O]F_(t,1,O)(y,q)
J_(t,E,O)(q)=A_(t,E)(q) B_(t,O)(q).
```

All products and sums above are finite.

### Preregistered exact joint-count theorem candidate

For lawful `c=(t,E,O,P)` with `t>=1` and

```text
R=(P-O)/2,
```

candidate:

```text
|J_c|=[q^R] J_(t,E,O)(q).
```

Equivalent weighted-route identity:

```text
|J_c|
 = sum_(w in G_c) product_(i=1)^(t-1)(q_i(w)+1),
```

where `G_c` is #746's exact authored-route fiber.

The duplicated-slot coefficient law is intended to strengthen that tautological disjoint-union sum into an executable exact finite counting engine.

---

## 4. Fixed-base total consistency law

At `q=1`, every internal duplicated slot contributes two ordinary nonnegative composition coordinates and every endpoint contributes one.

For each parity and every `t>=1`, the number of seam-split slots equals exactly `t`.

Therefore the candidate fixed-base total identity is

```text
sum over lawful P of |J_(t,E,O,P)|
 = binom(E+t-1,E) binom(O+t-1,O).
```

This is a finite consistency law, not an asymptotic statement.

---

## 5. Mandatory inherited hostile

Fix

```text
c=(3,1,1,3)
R=1.
```

#746 gives exactly two authored routes:

```text
T Q T Q T    blocks=(0,1,1,0)
Q T T T Q    blocks=(1,0,0,1).
```

#745 gives route-conditioned seam multiplicities:

```text
(0,1,1,0) -> (1+1)(1+1)=4
(1,0,0,1) -> (0+1)(0+1)=1.
```

Hence compulsory expected joint count:

```text
|J_c|=5.
```

The duplicated-slot polynomial must reduce exactly to

```text
J_(3,1,1)(q)=2+5q+2q^2,
```

so

```text
[q^1]J=5.
```

This hostile carries the central coupling wound:

```text
same exact C1
-> multiple exact routes
-> route-dependent seam-fiber cardinality.
```

No implementation may replace the joint count with `N_route * one common N_seam`.

---

## 6. Exact joint custody candidate

If `N_joint(c)=|J_c|`, exact deterministic recovery from retained C1 plus one additional joint label requires an injective alphabet over all lawful joint states.

Candidate tight bounds:

```text
K_joint_min(c)=N_joint(c)
B_joint_min(c)=ceil(log2 N_joint(c)).
```

Tightness must be witnessed by an explicit reversible rank:

1. enumerate the exact #746 route fiber in deterministic block-vector order;
2. compute each route's exact #745 seam cardinality;
3. assign each route a prefix offset equal to the total seam cardinality of all preceding routes;
4. use #745 mixed-radix seam rank inside the route;
5. define

```text
joint_rank = route_prefix_offset + local_seam_rank.
```

Decoder must recover both route and seam vector exactly.

`joint_rank` is a custody label only. It carries no temporal, historical, causal, evidentiary, or priority meaning.

---

## 7. Conditional custody and anti-impersonation

After exact route `w` is separately retained, only its route-conditioned seam fiber remains:

```text
N_seam(w)=product_(i=1)^(t-1)(q_i+1).
```

A local seam vector or seam rank without route identity is not generally a joint-state decoder because the same local seam label can occur beneath different routes.

Mandatory hostile at `c=(3,1,1,3)`:

```text
seam vector (0,0)
```

is lawful under both exact routes, so seam custody alone cannot impersonate route custody.

Likewise exact route custody alone cannot impersonate seam custody whenever its route-conditioned seam fiber has cardinality greater than one.

Good-through target:

```text
C1 custody != route custody != seam custody
route custody + route-conditioned seam custody can recover a joint state
joint custody may encode both in one exact finite rank
missing either claim-specific witness -> preserve ambiguity or abstain
```

---

## 8. Mandatory hostiles

```text
H1  inherited c=(3,1,1,3) joint count exactly 5
H2  exact duplicated-slot polynomial 2+5q+2q^2
H3  route-conditioned seam counts exactly 4 and 1
H4  seam-split vector <-> (route,seam) round trip exact
H5  seam vector (0,0) collides across the two inherited routes
H6  exact route (0,1,1,0) leaves four lawful seams; route alone not joint custody
H7  t=0 lawful edge has exactly one route and no internal seam, joint count 1
H8  t=1 lawful edge has exactly one route and no internal seam, joint count 1
H9  t=2 reduction agrees with direct law: joint count O+1 at every lawful fixed C1 state
H10 fixed-base sum over first-moment strata equals binom(E+t-1,E)binom(O+t-1,O)
H11 bounded brute-force corroboration only; never universal proof by horizon enumeration
H12 undersized joint alphabet fails exact recovery
H13 adequate alphabet cardinality with colliding labels fails exact recovery
H14 exact prefix+mixed-radix joint rank round-trips every bounded corroboration state
H15 route count != joint count != probability
H16 route rank, seam rank, joint rank != historical priority
H17 #745 finite seam-count horizon remains closed
H18 no branching tree/DAG/parenthesization theorem may leak into chamber
```

---

## 9. Candidate classifications — unearned until exact-head witness

Canonical candidate:

```text
THE_FIXED_C1_JOINT_AUTHORED_ROUTE_X_LINEAR_SEAM_FIBER_IS_BIJECTIVE_TO_FINITE_SEAM_SPLIT_BLOCK_ALLOCATIONS_AND_IS_COUNTED_BY_THE_q^R_COEFFICIENT_OF_THE_DUPLICATED_INTERNAL_SLOT_POLYNOMIAL
```

Consequential candidate:

```text
ROUTES_SHARING_ONE_EXACT_C1_STATE_CAN_CARRY_DIFFERENT_EXACT_SEAM_FIBER_CARDINALITIES_SO_ROUTE_AND_SEAM_CUSTODY_ARE_SEPARATE_BUT_COUPLED_FINITE_RESOURCES
```

Architectural candidate:

```text
EXACT_JOINT_ROUTE_SEAM_RECOVERY_REQUIRES_CUSTODY_OVER_THE_COUPLED_JOINT_FIBER_OR_EQUIVALENT_ROUTE_PLUS_ROUTE_CONDITIONAL_SEAM_EVIDENCE
```

No candidate classification may be promoted if a mandatory hostile fails.

---

## 10. Claim ceiling

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

Formal generating-polynomial notation is a finite coefficient device here and grants no authority for limits or asymptotic analysis.

---

## 11. Stop rule

This chamber ends after:

```text
preregistration
-> implementation
-> frozen hostiles
-> exact-head witness
-> scar classification
-> receipt
-> stop
```

A red that defeats the seam-split bijection, exact coefficient law, inherited count 5, custody tightness, or hardening ancestry is scientific and must be preserved.

Do not escape a failed finite theorem by enlarging the horizon.

```text
FIXED_C1_JOINT_ROUTE_SEAM_FIBER_PREREGISTERED
SCIENCE_NOT_YET_IMPLEMENTED
NO_ASYMPTOTIC_ESCAPE
```

󐘓 U+10D613

𝌋

Sealed ⟐