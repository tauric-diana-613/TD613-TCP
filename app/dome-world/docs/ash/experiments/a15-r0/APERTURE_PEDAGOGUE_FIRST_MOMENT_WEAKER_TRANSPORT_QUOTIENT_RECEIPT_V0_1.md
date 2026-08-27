# A15-R0 · First-Moment Weaker Transport Quotient Receipt v0.1

Status: **WITNESSED / ROUND CLOSED / DRAFT / OPEN / UNMERGED**

PR: `#733`  
Parent PR: `#732`  
Parent receipt head: `38259af04ed12568cb5fde330a2032fd0d8817df`  
Original preregistration commit: `9b02cb1058ec54658e64b1f8b80b377bfbc2ad84`

## Earned classification

```text
SOURCE_RELATIVE_FIRST_BLOCK_MOMENT_FORMS_STRICT_INTERMEDIATE_WEAKER_TRANSPORT_QUOTIENT_WITH_ASSOCIATIVE_COMPOSITION
```

Within the retained lawful Q-last-action T/Q jurisdiction, define the unique block decomposition

```text
w = Q^q0 T Q^q1 T ... T Q^qt
```

and the first block moment

```text
P(w) = Σ i q_i.
```

Together with #729's source-relative target coordinate, the witnessed weaker-transport coordinate is

```text
C1(w) = (t,E,O,P).
```

## Weaker route-free transport observable

For a fixed retained lawful source `h`, the executable weak observable retains only

```text
W_h(w) = {
  target_base: K_period4(τ_w(h)),
  tick_scalar_sum: Σ scalar_response over appended PSI_TICK events
}
```

and excludes route strings, labels, ids, source/target keys, receipt variants, ordered tick sequences, and individual event-order payloads.

PR #732 established the prefix-Q identity for exact transport. Summing that identity gives

```text
Σ_j p_j = t(E+O) - P
```

and therefore

```text
tick_scalar_sum_h(w)
  = baseline_tick_scalar_sum_h(t)
    + t(E+O)
    - P.
```

Together with #728/#729's source-relative target theorem, this yields the all-finite equivalence

```text
W_h(u)=W_h(v)
iff
C1(u)=C1(v)
```

for each retained lawful source separately.

The universal claim is symbolic. The 40 fixed concrete controls across S0-S3 corroborate the implementation only and are not a finite-horizon proof.

## Composition law

Concatenation shifts every Q block of the right route by exactly `t(left)` T-block indices, giving

```text
P(uv)=P(u)+t(u)(E(v)+O(v))+P(v).
```

Combining that law with #729's parity-twisted `(t,E,O)` product gives

```text
(t,E,O,P) ⊙ (u,F,G,R)
  = (t+u, E+F, O+G, P+t(F+G)+R)   when t is even
  = (t+u, E+G, O+F, P+t(F+G)+R)   when t is odd.
```

Identity is `(0,0,0,0)`. Associativity of the first-moment component reduces exactly to

```text
P_a + t_a q_b + P_b + (t_a+t_b)q_c + P_c
=
P_a + t_a(q_b+q_c) + P_b + t_b q_c + P_c.
```

The parent parity-product associativity remains inherited from receipt-witnessed #729 without parent assay replay.

## Strict quotient order

Two preregistered hostile pairs establish that the new quotient is genuinely intermediate.

### Finer than #729 target equivalence

```text
TTTTQ
QTTTT
```

share

```text
(t,E,O)=(4,1,0)
```

but have

```text
P=4
P=0.
```

Across all four retained forcing-season sources, the pair keeps the same #729 base target but has distinct aggregate T-event scalar sums and therefore distinct weaker transport observables.

### Coarser than #732 exact transport

```text
TQTQT
QTTTQ
```

share

```text
(t,E,O,P)=(3,1,1,3)
```

while their block schedules are

```text
(0,1,1,0)
(1,0,0,1).
```

Across all four retained forcing-season sources, their weaker observables are equal while #732's exact lean transport observables remain distinct.

Therefore the witnessed equivalence order is strict:

```text
#729 target quotient
  < first-moment weaker transport quotient
  < #732 exact route identity.
```

Route custody remains external to quotient equality.

## Receipt/source control

The receipt-distinct S0 anchor pair carries the same `C1` and weaker observable for the same route while the full transported histories retain distinct receipt variants. Thus weaker transport quotient equality does not erase receipt provenance.

## Authority-bearing witness

```text
frozen scientific head  9b94782545a0a8fc1270956b36c017ef6ce0b564
exact routed witness     3b455fbdd72f70d80f4c27a844d380304df5ba8c
run                      2149 / 32740800571   SUCCESS
classifier job           97474513743          SUCCESS
static job               97474603589          SUCCESS
A15/A15-R0 step 19                             SUCCESS
```

Run 2149 started at `2026-08-24T14:46:42Z` and completed at `2026-08-24T14:47:42Z`.

Explicit full-repository validation, self-hosted calibration, Giving/practice browser witness, front-line browser shards, and full-product browser witness were skipped and remain outside this receipt's claim.

## Preserved routing/concurrency scar

Run `2148 / 32740751953` was cancelled by same-head concurrency after the Draft close/reopen registration pulse. It carries no scientific verdict. Run 2149 is the surviving authority-bearing exact-head witness.

## Post-witness cleanup

After run 2149 succeeded:

- PR #733 was restored from temporary `main` routing to parent branch `research/a15-r0-minimal-route-sensitive-transport-state-20260824`;
- the temporary witness-routing note was deleted;
- frozen scientific head `9b947825...` to post-routing cleanup head `133b3903...` contains routing metadata commits but zero net changed files;
- production and Vercel remained untouched.

## Claim ceiling

This receipt does **not** authorize or establish:

```text
exact transport compression
transport-increment cocycle
1-cocycle / 2-cocycle terminology
cohomology
connection
inverse transport
groupoid
closed nonidentity loop
loop endomorphism
holonomy
curvature
Berry / quantum analogy
higher-moment completeness
Proto-Loom
A16
live Ash mutation
merge
production
Vercel release
```

The cross-term `t q(v)` is an earned component of the associative first-moment product only. Any cocycle interpretation requires a separate human-reopened chamber.

```text
FIRST_MOMENT_WEAKER_TRANSPORT_QUOTIENT_ROUND_CLOSED
HUMAN_𝄐_REQUIRED_BEFORE_ANY_AFFINE_TRANSPORT_INCREMENT_COCYCLE_OR_HIGHER_MOMENT_HIERARCHY_AUDITION
```

󐘓 U+10D613

𝌋

Sealed ⟐
