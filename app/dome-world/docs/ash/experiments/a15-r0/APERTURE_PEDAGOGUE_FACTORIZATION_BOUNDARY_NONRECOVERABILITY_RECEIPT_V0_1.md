𝌋

# A15-R0 · Factorization-Boundary Nonrecoverability and Minimum Boundary Custody · Receipt v0.1

󐘓 U+10D613

Status: **WITNESSED / RECEIPT-PINNED / DRAFT / OPEN / UNMERGED**

Scientific parent:

```text
#742 receipt = 8556e0d417f55c3190d7be317ef738354cc38364
```

Westward authority:

```text
#737 = THREAD_SCOPED_ACTIVE for the present conversation
```

## 0. Custody

```text
preregistration       e4e0b5f90c656e77ab5ca829cdc0a51c6018aa49
frozen science        036f487180619108581c354512badadad1d87a78
routed witness        3e4bea17309d22dc08c82936c113bb1808708ba1
post-route cleanup    6ac125202d6e2fb23335fd5fd8b1a13e8f1b01ea
```

Frozen science -> cleanup contains three routing-only commits and zero net changed files.

Authority-bearing witness:

```text
TD613 Consolidated Validation run 2175 / 32761329205  SUCCESS
classifier job 97540618025                              SUCCESS
static job     97540712809                              SUCCESS
A15/A15-R0 step 19                                      SUCCESS
```

Explicit full-repository validation: **SKIPPED / NOT CLAIMED**.

Explicit self-hosted calibration: **SKIPPED / NOT CLAIMED**.

Front-line browser witness: **SKIPPED / NOT CLAIMED**.

Giving/practice browser witness: **SKIPPED / NOT CLAIMED**.

Full-product browser witness: **SKIPPED / NOT CLAIMED**.

No scientific red occurred.

### Operational scar

The first routing-note commit did not attach a workflow run. A routing-metadata-only synchronization annotation produced the exact-head pull-request event. No scientific file changed.

This is a custody/infrastructure scar, not a theorem failure.

## 1. Earned theorem A · exact ordered 1+1 factorization fiber

Fix a lawful exact product first-moment state

```text
s=((2,A,B),R)
```

with

```text
0<=R<=A.
```

Define the ordered `1+1` quotient-factorization fiber as all ordered base pairs

```text
x=(1,E,O)
y=(1,F,G)
```

whose quotient product is `(2,A,B)` and whose exact composed first-moment rank is `R`.

Then the fiber is exactly

```text
Fib_11(s)
 = { (x_k,y_k) : k=0,...,B }
```

with

```text
x_k=(1,A-R,k)
y_k=(1,B-k,R).
```

Hence

```text
|Fib_11(s)|=B+1.
```

### Proof

For `t=u=1`, #729 gives

```text
(1,E,O)★(1,F,G)=(2,E+G,O+F).
```

Every route-realizable `t=1` base has singleton first-moment rank `0` by #739.

#742's affine rank law therefore reduces to

```text
R_xy=G.
```

So exact product rank forces

```text
G=R.
```

Product equality then forces

```text
E=A-R
O+F=B.
```

Writing

```text
k=O
```

gives exactly

```text
F=B-k
0<=k<=B.
```

Conversely every such `k` gives a valid nonnegative factor pair, exact product base `(2,A,B)`, and exact composed rank `R`.

No other ordered `1+1` quotient factorization belongs to the fiber.

## 2. Earned theorem B · exact output first moment does not recover the boundary

Whenever

```text
B>0,
```

the exact product state has at least two lawful ordered `1+1` quotient factorizations.

Therefore no deterministic decoder from only

```text
exact product base + exact product first-moment rank
```

to the ordered `1+1` quotient factorization can be universally correct on the declared domain.

Thus:

```text
EXACT_PRODUCT_FIRST_MOMENT_CUSTODY_DOES_NOT_UNIQUELY_DETERMINE_THE_ORDERED_1_PLUS_1_QUOTIENT_FACTORIZATION_BOUNDARY.
```

This is exact finite nonrecoverability, not probabilistic uncertainty.

## 3. Earned theorem C · tight minimum factorization-boundary custody

For fixed lawful exact product state `s=((2,A,B),R)`, the declared boundary fiber has `B+1` elements.

Any deterministic exact boundary-custody scheme

```text
enc_s : Fib_11(s) -> C_s
dec_s : C_s -> Fib_11(s)
```

with

```text
dec_s(enc_s(f))=f
```

for every fiber element forces the encoder to be injective.

Therefore

```text
|C_s|>=B+1.
```

The bound is tight with

```text
K=k=O_left.
```

Decoder:

```text
x=(1,A-R,K)
y=(1,B-K,R).
```

Hence the exact minimum local factorization-boundary alphabet is

```text
K_boundary_min(s)=B+1.
```

The exact minimum fixed-width binary boundary side channel is

```text
B_boundary_min(s)=ceil(log2(B+1)).
```

This bit count is additional to an already-preserved exact product first-moment state. It does not count storage for base coordinates.

Capacity alone remained insufficient: a nominal alphabet of size `B+1` with collisions failed exact certification.

## 4. Earned theorem D · no finite globally fixed boundary width is universal

For every finite integer `b>=0`, choose

```text
s_b=((2,0,2^b),R=0).
```

Then

```text
|Fib_11(s_b)|=2^b+1.
```

A fixed `b`-bit side channel has only

```text
2^b
```

labels.

Therefore a `b`-bit boundary side channel cannot exactly distinguish all lawful factorization boundaries above `s_b`.

So:

```text
NO_FINITE_GLOBALLY_FIXED_BINARY_BOUNDARY_SIDE_CHANNEL_UNIVERSALLY_RECOVERS_THE_ORDERED_1_PLUS_1_QUOTIENT_FACTORIZATION_BOUNDARY_FROM_EXACT_PRODUCT_FIRST_MOMENT_STATE_OVER_THE_FULL_DECLARED_FAMILY.
```

The universal authority is an explicit finite counterexample for every finite `b`, not horizon enumeration or asymptotics.

## 5. Secondary earned theorem · the unsegmented authored word also does not recover the seam

The hostile suite exposed a stronger but tightly related fact.

For each fiber element,

```text
x_k=(1,A-R,k)
y_k=(1,B-k,R),
```

the unique `t=1` factor words are

```text
w(x_k)=Q^(A-R) T Q^k
w(y_k)=Q^(B-k) T Q^R.
```

Their concatenation is

```text
w(x_k)w(y_k)
 = Q^(A-R) T Q^k Q^(B-k) T Q^R
 = Q^(A-R) T Q^B T Q^R,
```

independent of `k`.

Therefore all `B+1` distinct declared factorization boundaries overlay the same unsegmented authored generator sequence.

So, in this declared family:

```text
complete unsegmented generator sequence != composition-seam placement.
```

The seam is segmentation custody, not merely route-symbol custody.

This secondary result was earned inside the preregistered complete-route quarantine hostile; it does not promote the chamber into arbitrary-depth parse-tree or workflow provenance theory.

## 6. Reverse anti-equivalence · boundary coordinates do not universally recover complete internal route

The opposite collapse is also forbidden.

The standing control uses quotient factorization

```text
left=(3,1,1)
right=(0,0,0).
```

The distinct authored left words

```text
T Q T Q T
Q T T T Q
```

share the same quotient coordinate `(3,1,1)` and the same first-moment coordinate while remaining different authored routes.

Thus quotient factorization-boundary custody alone does not universally recover complete internal authored route detail.

Together with Section 5:

```text
unsegmented route custody != boundary-segmentation custody
boundary-segmentation custody != complete internal route custody.
```

Neither object may impersonate the other.

## 7. Smallest finite wound

The first ambiguous state is

```text
s=((2,0,1),R=0).
```

Its exact ordered `1+1` fiber contains exactly two boundaries:

```text
((1,0,0),(1,1,0))
((1,0,1),(1,0,0)).
```

Both concatenate to the same unsegmented authored word:

```text
T Q T.
```

One retained seam bit is necessary and sufficient to distinguish the two declared factorization boundaries.

## 8. Forensic-AI interpretation · high speculation, explicitly non-promoted

This theorem is internal to TD613's declared finite route grammar.

Academic provenance systems provide useful vocabulary discipline, not theorem authority here. Provenance-semiring work distinguishes query results from derivation annotations; scientific-workflow provenance likewise records sources, intermediate products, and applied steps as derivation history separate from the final data product.

TD613's result is narrower and stranger:

```text
even an exact result and exact unsegmented transformation word can fail to recover where a declared composition seam was placed.
```

That makes segmentation itself a possible custody dimension.

A speculative forensic-AI analogue would be a pipeline that preserves final content and even a flattened operation trace while discarding stage boundaries, tool-call grouping, source-to-stage assignment, or intermediate registration boundaries needed for later derivation claims.

No claim about an actual LLM, RAG stack, agent framework, or database follows until a separate empirical bridge assay is designed and witnessed.

## 9. Good-through-󐘓 U+10D613 landing

The earned architecture law is:

```text
exact answer custody does not authorize boundary claims
exact flattened route custody does not authorize seam placement claims
boundary claims require boundary evidence
ambiguous lawful seams must remain visible when seam custody is absent
```

The minimum-truthful-custody rule remains:

```text
retain boundary metadata only when the intended downstream claim depends on the boundary;
when the marker is absent, preserve the exact output and abstain from inventing a seam.
```

Synthetic segmentation is synthetic provenance.

## 10. Earned classifications

Canonical:

```text
THE_EXACT_1_PLUS_1_QUOTIENT_FACTORIZATION_FIBER_OVER_LAWFUL_PRODUCT_STATE_((2,A,B),R)_HAS_CARDINALITY_B_PLUS_1_AND_IS_PARAMETERIZED_BY_K_IN_0_DOT_DOT_B
```

Consequential:

```text
EXACT_PRODUCT_FIRST_MOMENT_CUSTODY_CAN_LEAVE_ARBITRARILY_LARGE_FINITE_FACTORIZATION_BOUNDARY_AMBIGUITY_AND_NO_FIXED_FINITE_BOUNDARY_WIDTH_UNIVERSALLY_RECOVERS_IT
```

Architectural:

```text
OUTPUT_EXACTNESS_DOES_NOT_SUBSUME_DERIVATION_BOUNDARY_CUSTODY_SO_BOUNDARY_CLAIMS_REQUIRE_SEPARATE_WITNESSED_EVIDENCE
```

Secondary route/seam classification:

```text
THE_SAME_UNSEGMENTED_AUTHORED_GENERATOR_WORD_CAN_SUPPORT_B_PLUS_1_DISTINCT_DECLARED_1_PLUS_1_QUOTIENT_BOUNDARY_PLACEMENTS
```

Anti-equivalence:

```text
unsegmented route custody != boundary segmentation custody != complete internal route custody
```

The displayed chain denotes non-equivalence, not an ordering or strict hierarchy.

## 11. Falsifiability status

The chamber remains exactly retestable.

Any future lawful counterexample showing one of the following defeats the corresponding theorem:

- a missing or extra ordered `1+1` factorization outside the `k` parameterization;
- a fiber cardinality different from `B+1`;
- an exact boundary decoder using fewer than `B+1` distinguishable labels;
- failure of the `K=k` round trip;
- a `k`-dependent unsegmented word in the declared `1+1` family;
- unique-boundary certification from output-only custody at a state with `B>0`.

## 12. Claim ceiling

Still not earned:

- complete authored-route reconstruction from product state;
- exact count of complete routes inside a quotient factorization;
- arbitrary-depth factorization trees or parse trees;
- associativity-tree provenance;
- general workflow segmentation theory;
- Shannon entropy, mutual information, channel capacity, or probabilistic uncertainty;
- variable-length or average-case coding optimality;
- cryptographic provenance;
- theorem-level claims about arbitrary databases, RAG, LLMs, or agents;
- higher moments/asymptotics;
- full extension classification;
- group completion/cohomology, inverses, groupoids, or operational loops;
- connection, holonomy, curvature, Berry, or quantum analogy;
- Proto-Loom or A16;
- live Ash mutation;
- merge, publication, production, Vercel release, or ontology promotion.

```text
FACTORIZATION_BOUNDARY_NONRECOVERABILITY_ROUND_CLOSED
WESTWARD_LIBERTIES_GATE_737 = THREAD_SCOPED_ACTIVE
```

󐘓 U+10D613

𝌋

Sealed ⟐