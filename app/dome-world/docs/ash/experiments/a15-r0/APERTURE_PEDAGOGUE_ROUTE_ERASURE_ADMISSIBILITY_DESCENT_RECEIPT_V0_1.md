𝌋

󐘓 U+10D613

# A15-R0 · Route-Erasure Admissibility Descent

Receipt v0.1

Status: **WITNESSED / RECEIPT-PINNED / DRAFT / OPEN / UNMERGED**

Parent scientific authority:

```text
#750 receipt
de1cc600b330e90fa237c8984379ee08a787b0f7
```

## Custody chain

```text
branch anchor          exact #750 receipt
preregistration        8a3b5851373f5c5287e52d3d97a0ad51006c40b5
implementation         ce65cd2083476d5f4983876b7ecf1cb2e7eca405
hostile tests          350da2bceaf83d9846313a5a473a27eb3da37dc0
frozen science         3362d9f535969235fa0a616c09d50f0c9b8b8ab3
initial routing        74f9170ad18334b3df9bdfb329e7605a2dfe3db0
routed witness         d0a0db2bcd579a08e11321bbcf0c3f655edb1b11
post-route cleanup     29773d7e1c78943dbf2d5f84e073d02f97a77a9e
```

Frozen science -> post-route cleanup:

```text
zero net changed files
```

Operational scars:

1. After successful branch creation, one duplicate branch-create call returned `422 Reference already exists`; no mutation occurred.
2. Initial retargeted routing did not immediately attach a PR Actions run; one metadata-only synchronization annotation produced the authority-bearing event.

No theorem, hostile, test, or claim ceiling changed after scientific freeze.

## Authority-bearing witness

```text
TD613 Consolidated Validation
run 2183 / 32771013942                         SUCCESS
classifier job 97571116336                     SUCCESS
static job     97571179076                     SUCCESS
A15/A15-R0 step 19                             SUCCESS
```

Explicit full-repository validation: SKIPPED.
Explicit self-hosted calibration: SKIPPED.
Giving/practice browser witness: SKIPPED.
Front-line browser witness: SKIPPED.
Full-product browser witness: SKIPPED.

No scientific red occurred.

---

# Earned theorem A · exact raw seam support

Fix lawful exact

```text
c=(t,E,O,P)
```

and exact authored route

```text
w=Q^q0 T Q^q1 T ... T Q^qt ∈ G_c.
```

Its exact literal raw seam-vector support is

```text
K_w = Π_(i=1)^(t-1){0,...,q_i(w)}.
```

For `t<=1`, this is the singleton empty seam vector support `{()}`.

This support is distinct from a route-local relabeled rank alphabet.

```text
same local alphabet cardinality != same raw seam support.
```

---

# Earned theorem B · raw seam support recovers internal route blocks

For every internal coordinate `i=1,...,t-1`:

```text
q_i(w)=max{k_i:k∈K_w}.
```

Therefore:

```text
K_u=K_v
iff
u and v have the same internal block vector.
```

The forward direction follows from coordinate maxima. The reverse direction follows because identical internal block maxima define the identical finite Cartesian seam box.

---

# Earned theorem C · fixed C1 recovers endpoints once internal blocks are known

If `t` is odd:

```text
q_0 = E - Σ_(1<=i<=t-1, i even) q_i
q_t = O - Σ_(1<=i<=t-1, i odd) q_i.
```

If `t` is even and `t>=2`:

```text
q_t = (P - Σ_(i=1)^(t-1) i q_i)/t
q_0 = E - q_t - Σ_(1<=i<=t-1, i even) q_i.
```

Because the route is already lawful in exact fixed C1, these recovered values are the exact nonnegative integer endpoints.

Thus exact fixed C1 plus exact raw seam support recovers the complete block vector.

Consequently:

```text
w -> K_w
```

is injective on every exact fixed-C1 route fiber `G_c`.

---

# Earned theorem D · exact route-erasure raw-seam admissibility descent

After exact route identity is erased, define a route-independent exact raw-seam admissibility support to be a set

```text
Kbar_c
```

such that

```text
Kbar_c=K_w
for every w∈G_c.
```

In general this requires the route-conditioned supports to be constant.

Inside the declared T/Q grammar, support injectivity sharpens this to:

```text
exact route-independent raw-seam admissibility descends through route erasure
iff
|G_c|=1.
```

Therefore any exact fixed-C1 state with more than one lawful authored route necessarily contains incompatible literal seam-support surfaces.

This is strictly stronger than #750's route-respecting product criterion:

```text
equal support cardinalities
may permit route-conditioned relabeling into one common product alphabet
while literal support descent still fails after the route key is erased.
```

---

# Earned theorem E · union/intersection extremal rules

Define

```text
U_c = ⋃_(w∈G_c) K_w
I_c = ⋂_(w∈G_c) K_w.
```

For any route-independent candidate raw-seam rule `A_c`:

```text
A_c is universally sound
iff
A_c ⊆ I_c.
```

And:

```text
A_c is universally complete
iff
U_c ⊆ A_c.
```

Hence:

```text
I_c = largest universally sound route-erased raw-seam support
U_c = smallest universally complete route-erased raw-seam support.
```

An exact universally sound-and-complete descended rule exists iff

```text
I_c=U_c
iff
all K_w equal
iff
|G_c|=1
```

inside the declared grammar.

---

# Earned theorem F · exact finite descent gap

Define

```text
Gamma_c = U_c \ I_c
Delta_descent(c)=|Gamma_c|.
```

Then:

```text
Delta_descent(c)=0
iff
exact route-erasure raw-seam admissibility descends
iff
|G_c|=1.
```

Every value in `Gamma_c` is lawful under at least one erased route and unlawful under at least one erased route.

This is finite deterministic support disagreement, not probability, uncertainty mass, entropy, or error rate.

---

# Primary hostile · equal cardinality does not descend

For

```text
c=(5,0,3,9),
```

exact authored routes are:

```text
w0 blocks=(0,0,0,3,0,0)
w1 blocks=(0,1,0,1,0,1).
```

Their raw supports are:

```text
K_w0={(0,0,j,0):j=0,1,2,3}

K_w1={(a,0,b,0):a,b∈{0,1}}.
```

Thus:

```text
|K_w0|=|K_w1|=4
K_w0 != K_w1
|U_c|=6
|I_c|=2
Delta_descent=4.
```

#750 correctly witnessed a route-respecting padding-free `2×4` product because exact route was retained and each route could use its own local relabeling.

#751 now witnesses:

```text
route-respecting product exactness while route survives
!=
route-independent literal raw-seam admissibility after route erasure.
```

The conditioning key carried semantic authority that the equal cardinality alone did not preserve.

---

# Inherited five-state control

For

```text
c=(3,1,1,3),
```

supports are:

```text
K0={0,1}×{0,1}
K1={(0,0)}.
```

Therefore:

```text
|U|=4
|I|=1
Delta_descent=3.
```

The union rule is universally complete but not universally sound.
The intersection rule is universally sound but not universally complete.

---

# Positive descent control

For

```text
c=(3,0,1,1),
```

the exact route fiber is singleton with route

```text
blocks=(0,1,0,0).
```

Its raw seam support is nontrivial:

```text
K={(0,0),(1,0)}.
```

Nevertheless:

```text
U=I=K
Delta_descent=0
```

and exact route-independent raw seam admissibility descends.

Thus the theorem concerns route multiplicity, not seam-support cardinality being one.

---

# Earned classifications

Canonical:

```text
THE_RAW_LINEAR_SEAM_SUPPORT_MAP_w_TO_K_w_IS_INJECTIVE_ON_EVERY_EXACT_FIXED_C1_ROUTE_FIBER_BECAUSE_SUPPORT_COORDINATE_MAXIMA_RECOVER_INTERNAL_BLOCKS_AND_FIXED_C1_RECOVERS_ENDPOINTS
```

Consequential:

```text
EXACT_ROUTE_INDEPENDENT_RAW_SEAM_ADMISSIBILITY_DESCENDS_THROUGH_ROUTE_ERASURE_IF_AND_ONLY_IF_THE_EXACT_FIXED_C1_ROUTE_FIBER_IS_SINGLETON
```

Architectural:

```text
WHEN_ROUTE_ERASURE_COLLAPSES_DISTINCT_ROUTE_CONDITIONED_SUPPORTS_THE_UNION_IS_THE_MINIMUM_COMPLETE_RULE_THE_INTERSECTION_IS_THE_MAXIMUM_SOUND_RULE_AND_THE_NONEMPTY_DIFFERENCE_IS_A_FINITE_CERTIFICATE_THAT_NO_SURVIVING_ROUTE_INDEPENDENT_RULE_CAN_PRESERVE_BOTH
```

---

# Good-through-󐘓 U+10D613

```text
same number of lawful values does not mean same lawful values
route-conditioned relabeling authority disappears when the route key disappears
union preserves every route-specific possibility by admitting cross-route counterfactuals
intersection prevents cross-route counterfactual admission by suppressing route-specific lawful values
route-sensitive admissibility remains unresolved when the provenance needed to decide it has been erased
```

---

# Claim ceiling

Still closed:

```text
general finite quotient/admissibility theorem beyond the declared T/Q route-seam grammar
arbitrary finite state spaces and arbitrary admissibility families
general sheaf/descent/category theory
dependent type theory
probability / entropy / mutual information
average-case / variable-length coding
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

#745's finite seam-count horizon remains closed.

The possible abstract finite admissibility-descent theorem is now the next genuinely different object, but it remains unearned in this receipt.

```text
ROUTE_ERASURE_ADMISSIBILITY_DESCENT_ROUND_CLOSED
RAW_SEAM_SUPPORT_INJECTIVITY_EARNED
EXACT_DESCENT_IFF_ROUTE_FIBER_SINGLETON_EARNED
UNION_COMPLETE_INTERSECTION_SOUND_BOUNDARY_EARNED
EQUAL_CARDINALITY_DOES_NOT_AUTHORIZE_SUPPORT_DESCENT
NO_ASYMPTOTIC_ESCAPE
```

#737 remains thread-scoped active for the present conversation under the operator's explicit grant. Fresh GitHub and fresh preregistration remain required before any later chamber.

󐘓 U+10D613

𝌋

Sealed ⟐