𝌋

# A15-R0 · Fixed-C1 Authored-Route Fiber · Gaussian-Polynomial Receipt v0.1

󐘓 U+10D613

Status: **WITNESSED / RECEIPT-PINNED / DRAFT / OPEN / UNMERGED**

Parent:

```text
#745 receipt
0b123f0d94ad28b73f31f9cb80603042dc7881b2
```

## 1. Custody

```text
preregistration       413bd5ba3a295a6e1ada8cf6c529cc9a4fa82ed8
pre-freeze t=0 repair c6ba69f2cc912a57a0461d759c165e7bb3be3b67
repair hostile test   2d6329fe5ab5fc7c6b6db899cdb39dac171fa94a
frozen science        8a492313885c7239444669d81ec8543c2ad6764c
routed witness        d7be2bf97573769062bdd9e5619f4222f9a664ca
post-route cleanup    7c726c695cd7593990d881cda73b4ae941c3ad9c
```

Frozen science -> cleanup:

```text
8a492313885c7239444669d81ec8543c2ad6764c
..
7c726c695cd7593990d881cda73b4ae941c3ad9c
```

is eleven commits ahead with **zero net changed files**. Those commits preserve routing metadata plus several accidental post-freeze paperwork add/delete pairs. They are operational custody scars, not scientific mutations.

## 2. Authority-bearing witness

```text
TD613 Consolidated Validation run 2179 / 32765197447   SUCCESS
classifier job 97552970861                               SUCCESS
static job     97553089923                               SUCCESS
A15/A15-R0 step 19                                       SUCCESS
```

Full-repository validation, self-hosted calibration, front-line browser, Giving/practice browser, and full-product browser scopes were skipped and are not claimed.

No scientific red occurred.

## 3. Exact authored-route fiber

Every authored T/Q word with exactly `t` T-generators has a unique block vector

```text
q=(q_0,...,q_t)
```

through

```text
w=Q^q0 T Q^q1 T ... T Q^qt.
```

Its first-moment state is

```text
C1(w)=(t,E,O,P)
E=sum_(i even) q_i
O=sum_(i odd) q_i
P=sum_i i q_i.
```

For fixed lawful `c=(t,E,O,P)`, define

```text
G_c={w : C1(w)=c}.
```

This is an authored-generator-word fiber only. It does not stand for real-world provenance, actor identity, causal history, or probability.

## 4. Exact finite Gaussian-polynomial theorem

For `t>=1`, set

```text
a=floor(t/2)
b=floor((t-1)/2)
R=(P-O)/2.
```

Split the block vector into

```text
e_j=q_(2j),     j=0,...,a
o_j=q_(2j+1),   j=0,...,b.
```

Then

```text
sum_j e_j=E
sum_j o_j=O
R=sum_j j e_j + sum_j j o_j.
```

The even allocation maps bijectively to a partition fitting in an `E x a` rectangle by repeating part `j` exactly `e_j` times. The odd allocation maps bijectively to a partition fitting in an `O x b` rectangle by repeating part `j` exactly `o_j` times. Inverse part multiplicities recover the allocations exactly.

Therefore, with Gaussian polynomials,

```text
H_(t,E,O)(q)
 = [E+a choose E]_q [O+b choose O]_q,
```

the exact fixed-C1 authored-route multiplicity is

```text
|G_(t,E,O,P)| = [q^R] H_(t,E,O)(q).
```

The universal authority is the finite block-vector/partition bijection. Bounded enumeration is corroboration only.

## 5. Lawful state

For `t>=1`, the imported #739 first-moment spectrum yields

```text
M=aE+bO.
```

A state is lawful only when

```text
E,O,P are nonnegative integers
P-O is even
0 <= R <= M.
```

For `t=0`, lawfulness requires

```text
O=0
P=0,
```

and the unique authored word is `Q^E`.

The initial implementation returned this zero-T word in an inconsistent enumeration row shape. That defect was repaired before science freeze and directly hostile-tested. It changed no counting theorem.

## 6. Inherited #733 wound closes exactly

At

```text
(t,E,O,P)=(3,1,1,3),
a=b=1,
R=1,
```

we obtain

```text
H(q)=(1+q)^2=1+2q+q^2.
```

Hence

```text
[q^1]H(q)=2.
```

The exact route fiber contains precisely

```text
T Q T Q T
Q T T T Q
```

and no third route.

Thus

```text
exact C1 != exact authored route.
```

## 7. Exact minimum authored-route custody

Given exact C1 already retained, let

```text
N_route(c)=|G_c|.
```

Exact deterministic recovery of the complete authored generator word requires

```text
K_route_min(c)=N_route(c)
B_route_min(c)=ceil(log2 N_route(c)).
```

Necessity follows from injectivity on the finite route fiber.

Tightness is witnessed by a deterministic lexicographic rank of the unique block vectors. That rank is an exact decoder label only; it carries no historical priority, chronology, probability, or significance.

A large enough alphabet with a colliding encoder still fails exact recovery.

## 8. Fixed-base consistency sum

Summing the first-moment strata recovers the complete block-allocation count at fixed `(t,E,O)`:

```text
sum_R [q^R]H(q)
 = H(1)
 = binom(E+a,E) binom(O+b,O).
```

This consistency law counts authored words in the declared grammar only.

## 9. Separation from seam custody

#743-#745 establish that a complete unsegmented authored generator word may still fail to determine declared composition seams.

#746 establishes that exact C1 may fail to determine the complete authored generator word.

Therefore the following remain separate custody layers:

```text
C1 custody
!=
complete authored-route custody
!=
composition-seam custody.
```

No hierarchy of moral importance is implied. The relation is non-equivalence of recoverable claims.

## 10. Classifications

Canonical:

```text
THE_FIXED_C1_AUTHORED_ROUTE_WORD_FIBER_HAS_EXACT_CARDINALITY_EQUAL_TO_THE_q^R_COEFFICIENT_OF_[E+a_CHOOSE_E]_q_[O+b_CHOOSE_O]_q
```

Consequential:

```text
EXACT_FIRST_MOMENT_CUSTODY_CAN_LEAVE_NONTRIVIAL_FINITE_COMPLETE_ROUTE_MULTIPLICITY_WITH_AN_EXACT_GAUSSIAN_POLYNOMIAL_COUNT
```

Architectural:

```text
COMPLETE_AUTHORED_ROUTE_CUSTODY_IS_A_SEPARATE_FINITE_RESOURCE_ABOVE_C1_AND_BELOW_ANY_CLAIM_OF_REAL_WORLD_PROVENANCE
```

## 11. Good-through-󐘓 U+10D613 landing

```text
exact first moment != exact authored route
route multiplicity stays visible
route count != probability
route rank != historical priority
seam custody != route custody
missing route evidence -> preserve the fiber or abstain
```

## 12. Claim ceiling

Still closed:

- real-world provenance reconstruction;
- actor identity and causal claims;
- probability, entropy, mutual information, average-case coding;
- asymptotic route growth, limit shapes, thermodynamic limits;
- higher moments;
- arbitrary workflow DAGs or parse trees;
- branching factorization theory;
- unrestricted joint route/seam theorem;
- group completion, inverses, loops, connection, holonomy, curvature, Berry, or quantum analogy;
- Proto-Loom / A16 promotion;
- live Ash mutation;
- merge, publication, production, Vercel release, or ontology promotion.

```text
FIXED_C1_ROUTE_FIBER_QBINOMIAL_ROUND_CLOSED
WESTWARD_LIBERTIES_GATE_737 = THREAD_SCOPED_ACTIVE
```

󐘓 U+10D613

𝌋

Sealed ⟐