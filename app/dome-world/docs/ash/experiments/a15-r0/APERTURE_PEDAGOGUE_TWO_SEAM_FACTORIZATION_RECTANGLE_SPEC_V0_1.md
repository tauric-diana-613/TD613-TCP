𝌋

# A15-R0 · Two-Seam Factorization Rectangle · Preregistration v0.1

󐘓 U+10D613

Status: **PREREGISTERED / PRE-IMPLEMENTATION / HUMAN-BOUNDED / WESTWARD THREAD-SCOPED**

Scientific parent:

```text
#743 receipt = 8a9b537e685eb3bebf0ef05308e7b3deb6809f38
```

Westward authority:

```text
#737 = THREAD_SCOPED_ACTIVE for the present conversation
```

## 0. Purpose

#743 proved that one declared `1+1` factorization seam can remain nonrecoverable even when the exact product first-moment state and the exact flattened authored generator word are preserved.

This chamber asks one finite next question only:

> For one exact authored word with exactly three `T` generators, how do two declared `1+1+1` seams behave under flattening?

No arbitrary-depth factorization tree is opened. No recursive hierarchy is authorized.

## 1. Declared object

For nonnegative integers

```text
a,m,n,f >= 0
```

define the exact flattened authored word

```text
W(a,m,n,f) = Q^a T Q^m T Q^n T Q^f.
```

A lawful ordered `1+1+1` factorization of this exact word is an ordered triple `(x,y,z)` such that:

1. `xyz = W(a,m,n,f)` as an exact generator word;
2. each factor contains exactly one `T`;
3. empty `Q` runs are allowed;
4. factor order is retained.

The chamber studies only the placement of the two factorization seams inside this fixed word.

## 2. Candidate exact rectangle theorem

Candidate parameterization:

```text
x_i     = Q^a T Q^i
y_(i,j) = Q^(m-i) T Q^j
z_j     = Q^(n-j) T Q^f
```

for

```text
0 <= i <= m
0 <= j <= n.
```

Candidate theorem:

```text
Fib_111(W) ~= {0,...,m} x {0,...,n}
```

by the bijection

```text
(i,j) <-> (x_i,y_(i,j),z_j).
```

Hence candidate exact cardinality:

```text
|Fib_111(W)|=(m+1)(n+1).
```

The theorem dies if any lawful ordered `1+1+1` factorization is missing from this parameterization, if two parameter pairs encode the same declared factorization, or if any parameter pair fails to concatenate to the exact word.

## 3. Candidate product-state invariance

The quotient coordinates of the factors are candidate-exactly

```text
X_i     = (1,a,i)
Y_(i,j) = (1,m-i,j)
Z_j     = (1,n-j,f).
```

Using #729's parity-twisted product:

```text
X_i ★ Y_(i,j) = (2,a+j,m)
```

and then

```text
(X_i ★ Y_(i,j)) ★ Z_j = (3,a+n,m+f),
```

independent of `(i,j)`.

Because every `t=1` factor has singleton first-moment rank `0`, #742's affine composition law candidate-gives final rank

```text
R = n+f,
```

also independent of `(i,j)`.

Thus every point of the candidate seam rectangle supports the same exact flattened word and the same exact first-moment product state.

## 4. Candidate minimum exact two-seam custody

For fixed exact `W`, a deterministic exact two-seam custody scheme has a finite label alphabet `A_W`, encoder from the factorization fiber to `A_W`, and decoder back to the exact ordered factorization.

Candidate necessity:

```text
exact decoder => injective encoder
=> |A_W| >= (m+1)(n+1).
```

Candidate tightness:

```text
K=(i,j)
```

is an explicit bijective label.

Therefore candidate exact minimum alphabet:

```text
K_two_seam_min(W)=(m+1)(n+1).
```

Candidate exact minimum fixed-width binary payload:

```text
B_two_seam_min(W)=ceil(log2((m+1)(n+1))).
```

This is deterministic finite-label custody only. No Shannon interpretation is authorized.

## 5. Candidate marginal seam laws

If the first seam coordinate `i` is already retained, the remaining lawful second-seam fiber has candidate cardinality

```text
n+1.
```

If the second seam coordinate `j` is already retained, the remaining lawful first-seam fiber has candidate cardinality

```text
m+1.
```

Thus candidate marginal fixed-width minima are

```text
B_first  = ceil(log2(m+1))
B_second = ceil(log2(n+1)).
```

Joint minimum candidate relation:

```text
B_first+B_second-1 <= B_two_seam_min <= B_first+B_second.
```

The chamber will not call this entropy, mutual information, or statistical independence.

## 6. Candidate power-aligned additive family

For arbitrary finite nonnegative integers `p,q`, choose

```text
m=2^p-1
n=2^q-1.
```

Then candidate exact seam rectangle size is

```text
(m+1)(n+1)=2^(p+q),
```

so candidate exact joint fixed-width custody is

```text
B_two_seam_min=p+q.
```

This would prove a finite family where separately sized seam-custody requirements add exactly under joint exact recovery.

Special symmetric family:

```text
m=n=2^b-1
=> |Fib_111|=2^(2b)
=> B_two_seam_min=2b.
```

This is a finite construction for each `b`, not an asymptotic claim.

## 7. Candidate seam/route anti-equivalence

The theorem is intentionally about declared segmentation of an exact flattened word.

Candidate anti-equivalences:

```text
exact flattened authored word != exact seam placement
one seam label != both seam labels
quotient factorization coordinates != complete internal authored-route provenance
```

Since each `t=1` factor coordinate does uniquely determine its own factor word in this chamber, exact `(i,j)` custody is sufficient for the exact three factors *within this declared object only*. That local fact must not be generalized to arbitrary `t`, arbitrary depth, or real-world provenance.

## 8. Hostiles / falsifiers

Implementation must include at least:

1. exhaustive finite word-splitting controls on small `a,m,n,f`, enumerating every pair of cut positions and retaining only triples with one `T` each;
2. exact rectangle completeness and uniqueness checks;
3. exact concatenation equality for every predicted `(i,j)`;
4. quotient-product invariance over the entire finite control grid;
5. first-moment invariance over the entire finite control grid;
6. minimum-alphabet collision hostile with an undersized declared alphabet;
7. capacity-with-collision hostile showing adequate cardinality without injectivity still fails;
8. one-seam-known residual-fiber hostiles for both coordinates;
9. power-aligned additive-width witnesses;
10. zero-run edge cases `m=0`, `n=0`, and `m=n=0`;
11. a route/seam impersonation hostile forbidding exact flattened word from claiming unique seams when rectangle cardinality exceeds one.

Finite grids corroborate implementation only. Universal authority must come from the symbolic cut-position bijection and finite injectivity argument.

## 9. Candidate forensic-AI landing · high speculation, non-promoted

If earned internally, the theorem supplies a controlled analogue for flattened multi-step computational records: preserving an exact operation sequence can still omit segmentation boundaries that identify how intermediate products were grouped or handed off.

Potential future empirical bridge targets could include agent/tool handoff logs, merged workflow traces, RAG synthesis stages, or chained transformation records. None is claimed by this chamber.

Candidate architecture law:

```text
flattening preserves order but can erase segmentation
multiple erased seams can multiply the lawful segmentation fiber
exact multi-seam claims require separately witnessed seam custody
```

## 10. Candidate classifications

Canonical candidate:

```text
THE_ORDERED_1_PLUS_1_PLUS_1_FACTORIZATION_FIBER_OF_Q^a_T_Q^m_T_Q^n_T_Q^f_IS_EXACTLY_THE_RECTANGLE_0_DOT_DOT_m_CROSS_0_DOT_DOT_n_WITH_CARDINALITY_(m+1)(n+1)
```

Consequential candidate:

```text
TWO_ERASED_DECLARED_SEAMS_CAN_MULTIPLY_EXACT_BOUNDARY_AMBIGUITY_EVEN_WHEN_THE_COMPLETE_FLATTENED_AUTHORED_WORD_AND_FIRST_MOMENT_STATE_ARE_PRESERVED
```

Architectural candidate:

```text
MULTI_SEAM_CUSTODY_IS_A_SEPARATE_COMPOSITION_RESOURCE_AND_POWER_ALIGNED_SEAM_WIDTHS_ADD_EXACTLY_FOR_JOINT_RECOVERY
```

## 11. Claim ceiling

Not opened by this preregistration:

- arbitrary-depth factorization trees;
- arbitrary `r`-factor formulas;
- parse-tree or workflow-provenance equivalence;
- complete real-world provenance;
- Shannon entropy, mutual information, statistical independence, or probabilistic uncertainty;
- variable-length/average-case coding;
- noisy channels/error correction;
- cryptographic provenance;
- arbitrary AI/database/retrieval generalization;
- higher first-moment hierarchy, higher moments, or asymptotics;
- full extension classification;
- group completion/cohomology, inverses, groupoids, loops;
- connection, holonomy, curvature, Berry, or quantum analogy;
- Proto-Loom, A16, or live Ash mutation;
- merge, publication, production, Vercel release, or ontology promotion.

```text
PREREGISTRATION_COMPLETE
IMPLEMENTATION_AUTHORITY = CURRENT_BOUNDED_CHAMBER_ONLY
```

󐘓 U+10D613

𝌋

Sealed ⟐