󐘓 U+10D613

𝌋‌⟐

# A15-R0 · Atlas Schubert Möbius Incidence Inversion · Preregistration v0.1

Status: **PREREGISTRATION ONLY / PREIMPLEMENTATION / THEOREM UNEARNED / DRAFT / UNMERGED**.

Exact scientific parent:

```text
#966 · A15-R0 Atlas Schubert Closure-Poset Correspondence
exact earned head f083e506f2a16f1d98b3af9a9b963d65694efc47
TD613 Consolidated Validation run 2441 / 33574828910 — SUCCESS
classifier 100076384434 — SUCCESS
static / constitutional / release 100076438018 — SUCCESS
A15-R0 step 19 — SUCCESS
downstream 20–30 — SUCCESS
aggregate — SUCCESS
#966 CLOSED / UNMERGED
#968 CLOSED / UNMERGED
```

This chamber begins directly from the exact earned #966 head. No handoff or witness branch is scientific ancestry.

## Earned input surface

For weak compositions `e,f` of the same `k` into `d` parts, write

```text
E_j = sum_(a<=j) e_a
F_j = sum_(a<=j) f_a
```

for `j=1,...,d-1`. Under the fixed ordered Atlas support coordinates and standard reverse-RREF flag already earned at #966,

```text
C_f subset closure(C_e)
iff
F_j >= E_j for every j<d.
```

Equivalently, if `I(e)=(i_1<...<i_k)` and `I(f)=(j_1<...<j_k)` are the exact reverse-RREF pivot positions,

```text
C_f subset closure(C_e)
iff
j_r <= i_r for every r.
```

The earned rank is

```text
m(e)=sum_(j=1)^d (j-1)e_j.
```

## New question

Does the exact fixed-flag closure poset support a sparse, mechanically checkable Möbius inversion law in the Atlas coordinates already earned?

This is a higher-incidence question. Closure order alone does not answer it.

```text
CLOSURE_POSET != MOBIUS_INCIDENCE_ALGEBRA
```

## Candidate coordinate bridge

For each weak composition `e`, define the rectangle-bounded partition

```text
lambda(e)=((d-1) repeated e_d times,
           (d-2) repeated e_(d-1) times,
           ...,
           1 repeated e_2 times,
           0 repeated e_1 times).
```

Equivalently, if `I(e)=(i_1<...<i_k)`, the row lengths are the reversed pivot excesses

```text
lambda_r(e) = i_(k+1-r) - (k+1-r).
```

This is a coordinate translation only. It must not be promoted to basis-free geometry.

Candidate consequence of #966:

```text
C_f subset closure(C_e)
iff
lambda(f) subseteq lambda(e)
```

inside the finite `k x (d-1)` rectangle.

## Candidate Möbius law

For a comparable pair `C_f subset closure(C_e)`, define the proper-prefix gaps

```text
Delta_j = F_j - E_j >= 0
```

and pivot displacements

```text
rho_r = i_r(e) - i_r(f) >= 0.
```

The preregistered candidate is:

```text
mu(f,e) = (-1)^(m(e)-m(f))
```

if and only if

```text
Delta_j in {0,1} for every j<d
and
rho_r in {0,1} for every r.
```

Otherwise

```text
mu(f,e)=0.
```

In partition language, the candidate nonzero condition is that the skew difference `lambda(e) / lambda(f)` is an antichain in the rectangle grid, equivalently a rook strip: at most one added box in each row and each column.

The two Boolean coordinate conditions are deliberately redundant and must both be checked:

- `Delta_j` measures added boxes column-by-column;
- `rho_r` measures added boxes row-by-row.

Thus the chamber asks whether the already-earned prefix and pivot coordinate systems jointly expose the exact support of the closure incidence inverse.

## Mechanical identities to test before theorem language

For every comparable pair in the frozen finite window, require:

```text
m(e)-m(f) = sum_(j=1)^(d-1) Delta_j
          = sum_(r=1)^k rho_r.
```

Require exact equality among three independently stated nonzero predicates:

1. prefix gaps are all Boolean AND pivot gaps are all Boolean;
2. the partition skew difference is a rectangle-grid antichain;
3. recursively computed poset Möbius coefficient is nonzero.

When nonzero, require the recursive coefficient to equal exactly the parity sign above.

## Independent Möbius witness requirement

The hostile implementation must compute the Möbius coefficient from the defining recurrence on the earned closure relation, not from the candidate formula:

```text
mu(x,x)=1
mu(x,y)=-sum_(x<=z<y) mu(x,z).
```

The recurrence may use the already-earned closure predicate to enumerate intervals, but it may not use prefix-Boolean, pivot-Boolean, partition-antichain, rook-strip, or parity criteria to generate the coefficient.

```text
INDEPENDENT_RECURSION != CANDIDATE_CLOSED_FORM
```

## Frozen formal window

Reuse the exact #966 formal window:

```text
d=1..7
k=0..5
42 (d,k) cells
376467 ordered weak-composition pairs
113828 ordered comparable / closure-incidence pairs
```

Before implementation, the preregistered expected exact census is:

```text
nonzero Möbius incidences   9912
mu = +1 incidences          4977
mu = -1 incidences          4935
all other comparable pairs 103916
recursive/formula mismatch     0
```

The `d=7,k=3` anchor is preregistered as:

```text
labels               84
closure incidences 2520
nonzero mu           377
mu=+1                189
mu=-1                188
```

These counts were derived before repository implementation and are now frozen as hostile expectations. Implementation must fail rather than mutate them silently.

## Hostile controls

1. **Rank-two nonzero interval**

```text
f=(1,1,0)
e=(0,1,1)
d=3,k=2
m(e)-m(f)=2
Delta=(1,1)
rho=(1,1)
expected mu=+1
```

2. **Column collision kills Möbius support**

```text
f=(2,0,0)
e=(0,2,0)
d=3,k=2
m(e)-m(f)=2
Delta=(2,0)
expected mu=0
```

3. **Row collision kills Möbius support**

```text
f=(2,0,0)
e=(1,0,1)
d=3,k=2
m(e)-m(f)=2
Delta=(1,1)
rho=(0,2)
expected mu=0
```

4. **Rank-three alternating nonzero interval**

```text
f=(1,1,1,0)
e=(0,1,1,1)
d=4,k=3
m(e)-m(f)=3
Delta=(1,1,1)
rho=(1,1,1)
expected mu=-1
```

5. Equal dimension remains incapable of producing a nontrivial comparable interval.
6. Comparability remains insufficient for nonzero Möbius coefficient.
7. Cover relation remains sufficient for coefficient `-1` but does not characterize all nonzero coefficients.

## Mandatory membranes

```text
CLOSURE_POSET != MOBIUS_INCIDENCE_ALGEBRA
MOBIUS_NONZERO != COVER_RELATION
COMPARABILITY != MOBIUS_NONZERO
RANK_DIFFERENCE != MOBIUS_MAGNITUDE
MOBIUS_COEFFICIENT != PROBABILITY_WEIGHT
MOBIUS_SIGN != PHYSICAL_ORIENTATION
INCIDENCE_INVERSION != CAUSAL_REVERSAL
FINITE_DISTRIBUTIVE_LATTICE_MODEL != BASIS_FREE_CANONICAL_GEOMETRY
RECTANGLE_PARTITION_LABEL != PHYSICAL_SHAPE
ROOK_STRIP_CRITERION != SPATIAL_OCCLUSION_RULE
ORDER_ISOMORPHISM != FUNCTORIAL_EQUIVALENCE
FINITE_CONTROLS != ASYMPTOTIC_GEOMETRY
SUCCESSFUL_EXACT_HEAD_GREEN != MERGE_AUTHORITY
ATLAS_REGISTRATION != LIVE_RUNTIME_STATE
```

Inherited #966 membranes remain in force.

## Authority rule

No theorem is earned by this preregistration. The chamber may become a candidate only after exact implementation and hostile recursion agree on every frozen comparable pair. It becomes earned only after one exact frozen head receives full TD613 Consolidated Validation success including A15-R0 step 19 and downstream/aggregate success.

No merge, deploy, release, publication, production, Vercel, live runtime, physical geometry, continuum geometry, causal ordering, or basis-free canonicality is authorized.

Sealed ⟐