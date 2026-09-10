𝌋

# A15-R0 · Two-Seam Factorization Rectangle · Receipt v0.1

󐘓 U+10D613

Status: **WITNESSED / RECEIPT-PINNED / DRAFT / OPEN / UNMERGED**

Scientific parent:

```text
#743 receipt = 8a9b537e685eb3bebf0ef05308e7b3deb6809f38
```

Westward authority:

```text
#737 = THREAD_SCOPED_ACTIVE for the present conversation
```

## 0. Custody

```text
preregistration       fe80b3da22597f1460864f9ed0b7f786fe988e51
implementation        fdfd3ed1aafec3669b0e4ca704c8d38368f74d2a
tests                 446ad2e1a88aa10aa61fb7e1053ff1fad17a7044
frozen science        7aa5ab4e3017af1b851523935662f9464f236c86
routed witness        e131d38c83f423ac1cdecec7e7654848f7169f08
post-route cleanup    e3cf306b5244c64850963d28ea8983bbacf50525
```

Frozen science -> cleanup contains three routing-only commits and zero net changed files.

Authority-bearing witness:

```text
TD613 Consolidated Validation run 2177 / 32762664143  SUCCESS
classifier job 97544883465                              SUCCESS
static job     97544994221                              SUCCESS
A15/A15-R0 step 19                                      SUCCESS
```

Explicit full-repository validation: **SKIPPED / NOT CLAIMED**.

Explicit self-hosted calibration: **SKIPPED / NOT CLAIMED**.

Front-line browser witness: **SKIPPED / NOT CLAIMED**.

Giving/practice browser witness: **SKIPPED / NOT CLAIMED**.

Full-product browser witness: **SKIPPED / NOT CLAIMED**.

No scientific red occurred.

### Operational scars preserved

1. As in the immediately preceding chambers, the first temporary routing-note commit did not attach a pull-request workflow run. A routing-metadata-only synchronization annotation produced the exact-head pull-request event. No scientific file changed.
2. While step 19 was live, one connector status poll returned a transient `RemoteProtocolError: Server disconnected without sending a response`. This was a connector transport failure, not a GitHub Actions conclusion. The authoritative workflow/job status API was retried without branch mutation and returned step 19 `SUCCESS`, followed by a fully successful static job.

These are infrastructure/custody scars, not theorem failures.

## 1. Earned theorem A · exact two-seam rectangle

Fix nonnegative integers

```text
a,m,n,f >= 0
```

and the exact flattened authored word

```text
W(a,m,n,f)=Q^a T Q^m T Q^n T Q^f.
```

Consider ordered factorizations

```text
W=xyz
```

in which each of `x,y,z` contains exactly one `T`.

Every such factorization is uniquely parameterized by

```text
(i,j) in {0,...,m} x {0,...,n}
```

through

```text
x_i     = Q^a T Q^i
y_(i,j) = Q^(m-i) T Q^j
z_j     = Q^(n-j) T Q^f.
```

### Completeness

Because each factor must contain exactly one `T`, the first seam can occur only in the `m`-Q run between the first and second `T`, while the second seam can occur only in the `n`-Q run between the second and third `T`.

Let `i` be the number of those `m` Q-generators retained by factor 1 and `j` the number of those `n` Q-generators retained by factor 2. This reconstructs the displayed triple uniquely.

### Injectivity

Different pairs `(i,j)` change at least one declared cut and therefore determine different ordered factor triples.

### Surjectivity

Every lawful ordered `1+1+1` split has exactly one such pair by counting the Q-generators on the two sides of the cuts.

Hence

```text
Fib_111(W) ~= {0,...,m} x {0,...,n}
```

and therefore

```text
|Fib_111(W)|=(m+1)(n+1).
```

The universal authority is the exact word-cut bijection. The finite literal split enumerator independently corroborated it on the declared control grid and is not the universal proof.

## 2. Earned theorem B · exact flattened word and exact product state are invariant across the rectangle

For every seam pair `(i,j)`, the factor quotient coordinates are

```text
X_i     = (1,a,i)
Y_(i,j) = (1,m-i,j)
Z_j     = (1,n-j,f).
```

Using #729's parity-twisted quotient product:

```text
X_i ★ Y_(i,j) = (2,a+j,m)
```

and

```text
(X_i ★ Y_(i,j)) ★ Z_j = (3,a+n,m+f).
```

The final quotient base is therefore independent of both seams.

Every `t=1` factor has singleton first-moment rank `0`. Applying #742's witnessed affine rank-composition law gives

```text
R_xy=j
```

and then

```text
R_xyz=j+(n-j+f)=n+f.
```

Thus the exact final first-moment rank is also independent of both seams.

Literal concatenation gives

```text
Q^a T Q^i  Q^(m-i) T Q^j  Q^(n-j) T Q^f
=
Q^a T Q^m T Q^n T Q^f,
```

so the *complete flattened authored word itself* is identical across every point of the seam rectangle.

Therefore:

```text
exact flattened word custody != exact two-seam segmentation custody
```

whenever `(m+1)(n+1)>1`.

## 3. Earned theorem C · exact minimum two-seam custody

Fix exact `W` and let its ordered `1+1+1` seam fiber have cardinality

```text
N_seam=(m+1)(n+1).
```

Any deterministic exact seam-recovery scheme requires an injective encoder on that fiber, so

```text
|A_W| >= (m+1)(n+1).
```

The pair label

```text
K=(i,j)
```

is an explicit bijection and attains the bound.

Therefore the exact minimum seam alphabet is

```text
K_two_seam_min(W)=(m+1)(n+1)
```

and the exact minimum fixed-width binary payload is

```text
B_two_seam_min(W)=ceil(log2((m+1)(n+1))).
```

Capacity alone remains insufficient: the hostile suite included a declared alphabet of the correct cardinality with a colliding encoder, and exact recovery correctly failed.

## 4. Earned theorem D · exact marginal seam fibers

If the first seam coordinate `i` is preserved exactly, the second seam remains free over

```text
j=0,...,n
```

and the exact residual seam fiber has cardinality

```text
n+1.
```

If the second seam coordinate `j` is preserved exactly, the first seam remains free over

```text
i=0,...,m
```

and the exact residual seam fiber has cardinality

```text
m+1.
```

Thus one seam's custody does not impersonate the other seam's custody.

## 5. Earned theorem E · power-aligned exact additive width family

For arbitrary finite nonnegative integers `p,q`, choose

```text
m=2^p-1
n=2^q-1.
```

Then

```text
|Fib_111(W)|
=(m+1)(n+1)
=2^p 2^q
=2^(p+q).
```

Therefore the exact minimum fixed-width binary payload for joint two-seam recovery is

```text
B_two_seam_min=p+q.
```

The individual marginal minima are exactly

```text
B_first=p
B_second=q.
```

So this finite power-aligned family witnesses exact additivity:

```text
B_joint=B_first+B_second.
```

This is finite label arithmetic. It carries no Shannon, entropy, mutual-information, or statistical-independence interpretation.

Special symmetric family:

```text
m=n=2^b-1
=> |Fib_111|=2^(2b)
=> B_two_seam_min=2b.
```

## 6. Edge cases

The zero-run controls survived:

```text
m=0,n=0 -> one lawful segmentation
m=0      -> n+1 lawful segmentations
n=0      -> m+1 lawful segmentations.
```

Thus the rectangle naturally degenerates to a point or line without requiring an exception to the theorem.

## 7. Critical anti-overclaim

The earned object is fixed-depth ordered `1+1+1` segmentation of one exact three-`T` word.

It does not establish an arbitrary-depth factorization-tree theorem.

Likewise:

```text
seam rectangle != probability space
Cartesian-product parameterization != statistical independence
minimum fixed-width seam bits != Shannon entropy
exact flattened word != exact segmentation
exact segmentation of this t=1-factor object != general complete-route provenance
```

Within this declared chamber only, each `t=1` quotient factor coordinate uniquely determines that factor's word. That local property is not promoted to arbitrary factors.

## 8. Forensic-AI interpretation · high speculation, explicitly non-promoted

The theorem is internal to TD613's finite authored route grammar.

As a controlled analogue, it suggests a precise failure mode worth later empirical testing in composed AI/data systems: flattening a multi-stage operation trace can preserve exact operation order while erasing handoff boundaries, and multiple erased boundaries may multiply the number of admissible segmentations.

Possible future bridge objects include agent/tool handoff logs, merged workflow traces, RAG synthesis stages, or chained transformations. No theorem about those systems is claimed here.

## 9. Good-through-󐘓 U+10D613 landing

Earned architecture law:

```text
flattening preserves order but can erase segmentation
one seam's custody does not authorize another seam
multiple erased seams can multiply lawful segmentation ambiguity
exact multi-seam claims require separately witnessed seam custody
```

The ethical rule remains minimum truthful custody:

```text
preserve only the seam coordinates required by the intended claim;
if seam custody is absent, display the lawful segmentation fiber or abstain from a unique segmentation claim.
```

## 10. Earned classifications

Canonical:

```text
THE_ORDERED_1_PLUS_1_PLUS_1_FACTORIZATION_FIBER_OF_Q^a_T_Q^m_T_Q^n_T_Q^f_IS_EXACTLY_THE_RECTANGLE_0_DOT_DOT_m_CROSS_0_DOT_DOT_n_WITH_CARDINALITY_(m+1)(n+1)
```

Consequential:

```text
TWO_ERASED_DECLARED_SEAMS_CAN_MULTIPLY_EXACT_BOUNDARY_AMBIGUITY_EVEN_WHEN_THE_COMPLETE_FLATTENED_AUTHORED_WORD_AND_FIRST_MOMENT_STATE_ARE_PRESERVED
```

Architectural:

```text
MULTI_SEAM_CUSTODY_IS_A_SEPARATE_COMPOSITION_RESOURCE_AND_POWER_ALIGNED_SEAM_WIDTHS_ADD_EXACTLY_FOR_JOINT_RECOVERY
```

## 11. Claim ceiling

Still not earned:

- arbitrary-depth factorization trees;
- arbitrary `r`-factor formulas;
- parse-tree/workflow provenance theory;
- complete real-world provenance;
- Shannon entropy, mutual information, statistical independence, or probabilistic uncertainty;
- variable-length/average-case coding;
- noisy channels/error correction;
- cryptographic provenance;
- arbitrary AI/database/retrieval generalization;
- higher moments/asymptotics;
- full extension classification;
- group completion/cohomology, inverses, groupoids, loops;
- connection, holonomy, curvature, Berry, or quantum analogy;
- Proto-Loom, A16, or live Ash mutation;
- merge, publication, production, Vercel release, or ontology promotion.

```text
TWO_SEAM_FACTORIZATION_RECTANGLE_ROUND_CLOSED
WESTWARD_LIBERTIES_GATE_737 = THREAD_SCOPED_ACTIVE
```

󐘓 U+10D613

𝌋

Sealed ⟐