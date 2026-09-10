𝌋

# A15-R0 · All-Finite Linear Seam Hyperrectangle · Specification v0.1

󐘓 U+10D613

Status: **PREREGISTERED / PRE-IMPLEMENTATION / DRAFT / OPEN / UNMERGED**

Scientific parent:

```text
#744 receipt = 3babfbea1952c54619a19571a112b472e9d80d89
```

Westward authority:

```text
#737 = THREAD_SCOPED_ACTIVE for the present conversation
```

## 0. Why this chamber exists

#743 earned one-seam nonrecoverability.

#744 earned the exact two-seam rectangle for one fixed three-factor object.

This chamber forbids horizon farming by testing the entire finite linear family at once. It does **not** test arbitrary trees, arbitrary workflow DAGs, associativity-parenthesization provenance, or branching parse structures.

The declared object is only:

```text
an exact flattened authored T/Q word with r T-generators,
segmented into exactly r ordered factors,
each factor containing exactly one T.
```

The question is whether all erased seams in that restricted finite family admit one exact closed form.

## 1. Declared exact word

Fix a finite integer `r>=1` and nonnegative integers

```text
a_0,a_1,...,a_r.
```

Define

```text
W(a_0,...,a_r)
 = Q^(a_0) T Q^(a_1) T ... T Q^(a_(r-1)) T Q^(a_r).
```

`W` contains exactly `r` copies of `T` and `r+1` Q-runs.

We consider ordered factorizations

```text
W = F_1 F_2 ... F_r
```

such that every `F_j` contains exactly one `T`.

Only the `r-1` internal Q-runs

```text
a_1,...,a_(r-1)
```

can carry seam ambiguity.

## 2. Candidate all-finite hyperrectangle theorem

For each internal run `a_j`, let

```text
k_j in {0,...,a_j}
```

be the number of Q-generators from that run assigned to the factor on its left.

Candidate factors:

```text
F_1 = Q^(a_0) T Q^(k_1)

F_j = Q^(a_(j-1)-k_(j-1)) T Q^(k_j)
      for 2<=j<=r-1

F_r = Q^(a_(r-1)-k_(r-1)) T Q^(a_r).
```

Candidate theorem:

```text
Fib_r(W)
 ~= Π_(j=1)^(r-1) {0,...,a_j}
```

with exact cardinality

```text
|Fib_r(W)| = Π_(j=1)^(r-1) (a_j+1).
```

For `r=1`, the empty Cartesian product has one element, so the unique factorization has cardinality `1` and requires zero seam bits.

### Required proof shape

Universality must come from exact cut geometry:

1. every one-T-per-factor segmentation places seam `j` somewhere inside internal Q-run `a_j`;
2. those seam choices are independent because the internal Q-runs are disjoint ordered substrings;
3. each seam vector uniquely determines the ordered factor list;
4. every lawful ordered factor list uniquely determines its seam vector.

Finite enumeration may corroborate only. It may not supply universal authority.

## 3. Exact output-state invariance candidate

Every seam vector must concatenate to the identical exact word `W`.

Therefore all seam vectors must share the same already-declared quotient coordinate and first moment:

```text
t = r
E = Σ_(i even) a_i
O = Σ_(i odd)  a_i
P = Σ_(i=0)^r i a_i.
```

For `r>=1`, the first-moment rank is

```text
R=(P-O)/2.
```

The chamber must not infer seam placement from any of these flattened coordinates.

Candidate anti-equivalence:

```text
exact flattened authored word
+ exact quotient base
+ exact first moment
!=
linear seam-vector custody
```

## 4. Exact minimum seam custody candidate

Let

```text
N_seam(W)=Π_(j=1)^(r-1)(a_j+1).
```

Any deterministic exact encoder/decoder of the complete seam vector over fixed `W` must be injective, hence candidate minimum alphabet cardinality:

```text
K_seam_min(W)=N_seam(W).
```

Candidate minimum fixed-width binary payload:

```text
B_seam_min(W)=ceil(log2 N_seam(W)).
```

Tightness must be witnessed by an explicit mixed-radix seam rank, not merely by naming the seam tuple as a label.

Candidate mixed-radix encoder:

```text
S(k_1,...,k_(r-1))
 = k_1
 + (a_1+1) k_2
 + (a_1+1)(a_2+1) k_3
 + ...
 + [Π_(j=1)^(r-2)(a_j+1)] k_(r-1).
```

It should biject the seam hyperrectangle with

```text
{0,...,N_seam(W)-1}.
```

The decoder must recover every coordinate exactly by repeated mixed-radix remainder/division.

## 5. Partial seam custody candidate

For any subset `S` of internal seam indices retained exactly, the residual ambiguity should be exactly

```text
N_residual(S)
 = Π_(j notin S)(a_j+1).
```

Thus retaining one seam must reduce only its own factor from the product; it must not authorize neighboring or distant seam claims.

This is a finite conditional fiber statement, not probability.

## 6. Power-aligned exact additive-width family

Choose finite nonnegative integers

```text
b_1,...,b_(r-1)
```

and set

```text
a_j = 2^(b_j)-1
```

for every internal run.

Then candidate exact cardinality:

```text
N_seam = Π 2^(b_j)
       = 2^(Σ b_j).
```

Candidate exact joint fixed-width custody:

```text
B_joint = Σ_(j=1)^(r-1) b_j.
```

Each individual seam `j` requires exactly `b_j` bits in this family.

Therefore the chamber may earn:

```text
power-aligned linear seam widths add exactly under joint exact recovery.
```

This is finite label arithmetic only. It is **not** Shannon additivity, entropy, mutual information, channel capacity, or statistical independence.

## 7. Hostile controls

The implementation and tests must include at least:

### H1 · literal enumeration vs symbolic hyperrectangle
For bounded finite `r` and Q-run grids, enumerate every literal ordered cut tuple in the exact word and retain only factorizations with exactly one T per factor. The literal set must equal the symbolic seam hyperrectangle.

### H2 · r=1 empty-product edge
A one-T word has one lawful one-factor segmentation, `N_seam=1`, and zero extra seam bits.

### H3 · zero-length internal runs
Any `a_j=0` contributes exactly one seam position and therefore multiplicative factor `1`, never `0`.

### H4 · undersized custody
A declared alphabet smaller than `N_seam` must fail exact recovery by collision.

### H5 · capacity without injectivity
An alphabet of cardinality at least `N_seam` with a colliding encoder must still fail.

### H6 · mixed-radix round trip
Every symbolic seam vector on finite corroboration grids must encode then decode exactly.

### H7 · partial-custody residual fiber
For selected retained seam subsets, the enumerated residual fiber cardinality must equal the product over unretained seams.

### H8 · power-aligned additive width
Finite vectors `b_j` must witness exact `B_joint=Σb_j`.

### H9 · flattened-word seam impersonation
Multiple distinct seam vectors must share the identical flattened word whenever at least one internal `a_j>0`; the flattened word must be forbidden from claiming a unique seam vector.

### H10 · #744 reduction
For `r=3`, the theorem must reduce exactly to #744's rectangle `(m+1)(n+1)` with matching seam coordinates.

## 8. Falsification rules

The candidate theorem fails if any of the following occurs:

- a lawful one-T-per-factor split has no seam vector in the proposed hyperrectangle;
- two distinct seam vectors generate the same declared ordered factor list;
- one seam vector fails to concatenate to the exact original word;
- literal finite enumeration finds an extra or missing lawful segmentation;
- mixed-radix encoding collides or fails exact decode;
- residual partial-custody cardinality differs from the product over unretained seams;
- the `r=3` specialization disagrees with #744.

Any such failure is scientific and must be preserved before repair.

## 9. Candidate classifications

Canonical candidate:

```text
THE_ALL_FINITE_ORDERED_ONE_T_PER_FACTOR_SEGMENTATION_FIBER_OF_Q^a0_T_Q^a1_T_..._T_Q^ar_IS_EXACTLY_THE_HYPERRECTANGLE_PRODUCT_j_1_TO_r_MINUS_1_0_DOT_DOT_a_j
```

Consequential candidate:

```text
FINITE_LINEAR_SEAM_AMBIGUITY_MULTIPLIES_ACROSS_INTERNAL_Q_RUNS_EVEN_WHEN_THE_COMPLETE_FLATTENED_AUTHORED_WORD_AND_FIRST_MOMENT_STATE_ARE_EXACTLY_PRESERVED
```

Architectural candidate:

```text
ALL_FINITE_LINEAR_SEAM_CUSTODY_HAS_EXACT_PRODUCT_CARDINALITY_MIXED_RADIX_RECOVERY_AND_POWER_ALIGNED_FIXED_WIDTHS_ADD_WITHOUT_PROMOTING_TO_GENERAL_WORKFLOW_PROVENANCE
```

## 10. Good-through-󐘓 U+10D613 landing candidate

```text
flattened order != segmentation custody
one witnessed seam != another witnessed seam
all-finite linear seam ambiguity stays explicit
mixed-radix custody may recover only the seam vector actually preserved
missing seam evidence -> narrow the claim or abstain
```

## 11. Claim ceiling

Even if the chamber passes, it does **not** earn:

- branching factorization trees;
- alternative parenthesizations or associativity-tree provenance;
- arbitrary workflow DAGs;
- parse-tree provenance theory;
- probabilistic/Shannon information theory;
- independence in the probabilistic sense;
- cryptographic provenance;
- arbitrary AI/database/retrieval generalization;
- higher moments or asymptotics;
- Proto-Loom, A16, or live Ash mutation;
- merge, publication, production, Vercel release, or ontology promotion.

The all-finite quantifier is only over the declared **linear one-T-per-factor segmentation family**.

```text
PREREGISTRATION_FROZEN_BEFORE_IMPLEMENTATION
```

󐘓 U+10D613

𝌋

Sealed ⟐