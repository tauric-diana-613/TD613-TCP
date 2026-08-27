𝌋

# A15-R0 · Factorization-Boundary Nonrecoverability and Minimum Boundary Custody · Spec v0.1

󐘓 U+10D613

Status: **PREREGISTERED / PRE-IMPLEMENTATION / FALSIFIABLE**

Scientific parent:

```text
#742 receipt = 8556e0d417f55c3190d7be317ef738354cc38364
```

Westward authority:

```text
#737 = THREAD_SCOPED_ACTIVE for the present conversation
```

## 0. Research question

#742 proved that retaining a declared factorization can sharply constrain the lawful composed first-moment spectrum, while erasing that boundary can expand admissible histories.

The next consequential question is stricter:

```text
If the product base and the exact product first moment are both preserved,
can the quotient-level composition boundary be reconstructed uniquely?
```

This chamber tests whether exact first-moment custody subsumes factorization-boundary custody.

The candidate answer is **no**, with an exact finite fiber formula and a tight minimum side-channel bound.

The object under test is deliberately narrow:

```text
ordered pair of quotient bases (x,y)
```

for a two-factor composition with one T in each factor.

This is not complete authored-route provenance, event identity, timestamps, actor identity, workflow identity, or hidden model state.

## 1. Parent algebra carried forward

From #729, for quotient bases

```text
x=(t,E,O)
y=(u,F,G),
```

if `t` is odd,

```text
x★y=(t+u, E+G, O+F).
```

From #739, every route-realizable `t=1` base has singleton first-moment rank spectrum

```text
R=0.
```

From #742, rank composition is

```text
R_xy=R_x+R_y+kappa(x,y)
```

with

```text
kappa(x,y)=floor(t/2)(F+G)+(t mod 2)G.
```

Therefore for `t=u=1`,

```text
R_xy=G.
```

## 2. Exact candidate theorem · 1+1 factorization fiber

Fix an exact product first-moment state

```text
s=(z,R)
z=(2,A,B)
```

with lawful first-moment rank

```text
0<=R<=A.
```

Define the ordered `1+1` quotient-factorization fiber

```text
Fib_11(s)
 = { (x,y) :
     x=(1,E,O),
     y=(1,F,G),
     x★y=z,
     exact composed rank is R }.
```

Candidate exact parameterization:

For every integer

```text
k in {0,...,B},
```

let

```text
x_k=(1, A-R, k)
y_k=(1, B-k, R).
```

Then candidate theorem:

```text
Fib_11((2,A,B),R)
 = { (x_k,y_k) : 0<=k<=B }
```

and hence

```text
|Fib_11((2,A,B),R)| = B+1.
```

### 2.1 Candidate proof · sufficiency

For every `k` in `[0,B]`:

```text
x_k★y_k
 = (2,
    (A-R)+R,
    k+(B-k))
 = (2,A,B).
```

Each `t=1` factor has `R_x=R_y=0`.

Because the left factor has odd `t`, #742 gives

```text
R_xy=G=R.
```

Thus each displayed pair belongs to the fiber.

### 2.2 Candidate proof · necessity

Take any `(x,y)` in the declared `1+1` fiber:

```text
x=(1,E,O)
y=(1,F,G).
```

Product equality gives

```text
E+G=A
O+F=B.
```

Exact rank equality gives

```text
G=R.
```

Therefore

```text
E=A-R.
```

and with `k=O`,

```text
F=B-k.
```

Nonnegativity forces

```text
0<=k<=B.
```

So every fiber element is exactly one of the displayed `(x_k,y_k)`.

## 3. Immediate nonrecoverability consequence

Whenever

```text
B>0,
```

the exact product state `(2,A,B,R)` has at least two distinct lawful `1+1` quotient factorizations.

Therefore no deterministic decoder of the form

```text
D : exact_product_first_moment_state -> ordered_1+1_factorization
```

can be universally correct on the declared domain.

The proposed classification is:

```text
EXACT_PRODUCT_FIRST_MOMENT_CUSTODY_DOES_NOT_UNIQUELY_DETERMINE_THE_ORDERED_1_PLUS_1_QUOTIENT_FACTORIZATION_BOUNDARY
```

This is factorization-boundary nonrecoverability at quotient-coordinate resolution.

It is not complete-route nonrecoverability, which was already separately quarantined.

## 4. Tight minimum factorization-boundary custody

For fixed lawful exact product state

```text
s=((2,A,B),R),
```

the declared `1+1` factorization fiber has `B+1` elements.

Any deterministic exact boundary-custody scheme

```text
enc_s : Fib_11(s) -> C_s
dec_s : C_s -> Fib_11(s)
```

with

```text
dec_s(enc_s(f))=f
```

for every `f` in the fiber forces `enc_s` to be injective.

Candidate lower bound:

```text
|C_s| >= B+1.
```

Candidate tight scheme:

```text
boundary label K = k = O_x
```

with inverse

```text
x=(1,A-R,K)
y=(1,B-K,R).
```

Therefore candidate exact minimum local boundary alphabet:

```text
K_boundary_min(s)=B+1.
```

Candidate exact minimum fixed-width binary side channel:

```text
B_boundary_min(s)=ceil(log2(B+1)).
```

This bit count is additional to the already-preserved exact product first-moment state. It does not count storage for the base coordinates themselves.

## 5. Unbounded finite witness family

For every integer `n>=0`, define

```text
s_n = ((2,0,n), R=0).
```

Then

```text
Fib_11(s_n)
 = { ((1,0,k),(1,n-k,0)) : 0<=k<=n }
```

and

```text
|Fib_11(s_n)|=n+1.
```

Thus exact product first-moment custody can coexist with arbitrarily large finite quotient-boundary ambiguity.

For every finite bit width `b>=0`, choose

```text
n=2^b.
```

Then

```text
|Fib_11(s_n)|=2^b+1,
```

so a `b`-bit boundary side channel is insufficient.

Candidate universal consequence:

```text
NO_FINITE_GLOBALLY_FIXED_BINARY_SIDE_CHANNEL_CAN_UNIVERSALLY_RECOVER_THE_ORDERED_1_PLUS_1_QUOTIENT_FACTORIZATION_BOUNDARY_FROM_EXACT_PRODUCT_FIRST_MOMENT_STATE_OVER_THE_FULL_DECLARED_FAMILY.
```

The universal authority is the explicit finite witness family, not asymptotic or horizon enumeration.

## 6. Strong anti-equivalence

This chamber is designed to earn:

```text
exact product first moment != factorization boundary
factorization boundary != complete route provenance
boundary multiplicity != route multiplicity
boundary side-channel bits != Shannon entropy
```

A first-moment-perfect system can still be provenance-incomplete at the composition-boundary layer.

## 7. Falsification rules

The chamber fails if any one of the following is found:

1. a lawful exact `t=2` first-moment state with `0<=R<=A` whose declared `1+1` factorization fiber contains a pair outside the proposed `k` parameterization;
2. a proposed `k in [0,B]` whose factor pair does not multiply to `(2,A,B)` with exact rank `R`;
3. two different `k` values that produce the same ordered factor pair;
4. a lawful fiber with cardinality not equal to `B+1`;
5. a deterministic exact boundary decoder using fewer than `B+1` labels on a fiber of size `B+1`;
6. failure of the `K=k` encoder/decoder round trip;
7. any implementation that silently promotes an exact product first moment to recovered factorization without a boundary label.

One finite counterexample kills the corresponding universal claim.

## 8. Hostile controls required before witness

Implementation must include at least:

### H1 · Smallest ambiguous wound

```text
s=((2,0,1),R=0)
```

must have exactly two factorizations:

```text
((1,0,0),(1,1,0))
((1,0,1),(1,0,0)).
```

### H2 · General mixed coordinate

For a state such as

```text
((2,3,4),R=2),
```

the fiber must contain exactly five ordered pairs.

### H3 · Rank out of lawful range

For

```text
R>A,
```

the chamber must abstain from declaring a lawful exact product first-moment state.

### H4 · Off-by-one label hostile

A fiber of size three must reject a two-label exact boundary scheme.

### H5 · Capacity-with-collision hostile

A declared alphabet of size `B+1` with duplicate boundary labels must fail exact certification.

### H6 · Tight `k` round trip

For several nontrivial `(A,B,R)` controls, every `k` must encode and decode exactly.

### H7 · First-moment impersonation hostile

A function receiving only exact product `(2,A,B,R)` must be unable to certify one unique boundary when `B>0`.

### H8 · Complete-route quarantine

At least one declared quotient factor pair should still admit more than one complete authored-route realization at some later-capable coordinate, or the implementation must otherwise preserve the standing statement that quotient-factorization recovery is weaker than complete route recovery. No complete-route claim may be inferred from boundary custody.

### H9 · Receipt externality

Custody labels/receipt identifiers external to the declared mathematical input must not change the fiber theorem.

## 9. Forensic-AI interpretation · high speculation, explicitly quarantined

The theorem, if earned, remains internal to TD613's finite route grammar.

A disciplined analogy exists with provenance-aware database and scientific-workflow systems, where derivation annotations are represented separately from output values because an output can admit multiple derivations. Green, Karvounarakis, and Tannen's provenance-semiring framework is relevant background for the distinction between result and derivation annotation; scientific-workflow provenance literature similarly treats sources, intermediate products, and processing steps as separately queryable derivation history.

This chamber does **not** identify TD613's quotient monoid with provenance semirings, relational algebra, OPM, PROV, RAG, agent traces, or arbitrary LLM internals.

The permitted speculative bridge is narrower:

```text
an exact output-level state may fail to identify the derivation boundary that produced it;
therefore systems making derivation claims need custody dimensions not guaranteed by output exactness alone.
```

Any empirical claim about deployed AI systems requires a separate bridge assay.

## 10. Good-through-󐘓 U+10D613 landing

If the chamber earns, downstream claim law becomes:

```text
exact answer custody does not authorize derivation-boundary claims
boundary claims require boundary evidence
multiple lawful boundaries must remain visible when boundary custody is absent
minimum truthful boundary custody should be retained only when the intended claim needs it
```

A system may retain the exact product first moment while explicitly abstaining from saying which quotient factorization occurred.

That is preferred to synthetic provenance.

## 11. Candidate classifications

Canonical candidate:

```text
THE_EXACT_1_PLUS_1_QUOTIENT_FACTORIZATION_FIBER_OVER_LAWFUL_PRODUCT_STATE_((2,A,B),R)_HAS_CARDINALITY_B_PLUS_1_AND_IS_PARAMETERIZED_BY_K_IN_0_DOT_DOT_B
```

Consequential candidate:

```text
EXACT_PRODUCT_FIRST_MOMENT_CUSTODY_CAN_LEAVE_ARBITRARILY_LARGE_FINITE_FACTORIZATION_BOUNDARY_AMBIGUITY_AND_NO_FIXED_FINITE_BOUNDARY_WIDTH_UNIVERSALLY_RECOVERS_IT
```

Architectural candidate:

```text
OUTPUT_EXACTNESS_DOES_NOT_SUBSUME_DERIVATION_BOUNDARY_CUSTODY_SO_BOUNDARY_CLAIMS_REQUIRE_SEPARATE_WITNESSED_EVIDENCE
```

## 12. Claim ceiling

This chamber does not authorize:

- complete authored-route reconstruction;
- exact count of complete routes inside a quotient factorization;
- arbitrary-depth factorization trees;
- associativity-tree provenance;
- Shannon entropy, mutual information, channel capacity, or probabilistic uncertainty;
- variable-length/average-case coding optimality;
- cryptographic provenance;
- a theorem about arbitrary databases, RAG, LLMs, or agents;
- higher moments/asymptotics;
- full extension classification;
- group completion/cohomology, inverses, groupoids, or operational loops;
- connection, holonomy, curvature, Berry, or quantum analogy;
- Proto-Loom or A16;
- live Ash mutation;
- merge, publication, production, Vercel release, or ontology promotion.

```text
FACTORIZATION_BOUNDARY_NONRECOVERABILITY_CHAMBER_PREREGISTERED
```

󐘓 U+10D613

𝌋

Sealed ⟐