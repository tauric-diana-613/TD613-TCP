󐘓 U+10D613

𝌋‌⟐

# A15-R0 · Atlas Schubert Gaussian–Delannoy Deformation · Preregistration v0.1

Status: **PREREGISTRATION ONLY / PREIMPLEMENTATION / THEOREM UNEARNED**.

Exact scientific parent:

```text
#971 · Atlas Schubert Möbius–Delannoy Path Correspondence
00b3772c46181747dbb5f7101a5a11f7bf4ba6b9
TD613 Consolidated Validation run 2446 / 33580185534 — SUCCESS
classifier 100092630315 — SUCCESS
static / constitutional / release 100092666644 — SUCCESS
A15-R0 step 19 — SUCCESS
downstream 20–30 — SUCCESS
aggregate — SUCCESS
CLOSED / UNMERGED
```

No witness or continuity branch is scientific ancestry.

## Question fixed before implementation

Can the earned #963 Gaussian Schubert rank grading and the earned #971 Delannoy/Möbius-support grading be carried by one exact two-variable finite polynomial, with independent word, recurrence, and q-multinomial constructions agreeing on the inherited finite Atlas window?

Fix

```text
a = d - 1
b = k
r(e) = earned Schubert cell dimension of e.
```

For every earned #969 nonzero Möbius interval `f <= e`, preregister

```text
G_(a,b)(q,t) = sum_{mu(f,e) != 0} q^r(f) t^(r(e)-r(f)).
```

By the earned #971 marked-descent bijection, if `w` ranges over binary pivot words with `a` zeros and `b` ones and `des10(w)` counts adjacent `10` descents, the candidate equivalent word surface is

```text
G_(a,b)(q,t) = sum_w q^r(w) (1+t)^des10(w).
```

Here `r(w)` is the earned #963/#971 Schubert rank, equivalently the number of `01` pairs in `w`.

## Candidate closed form

For `0 <= s <= min(a,b)`, preregister the exact t-slice

```text
[t^s] G_(a,b)(q,t)
 = q^(s(s-1)/2)
   * GaussianMultinomial_q(a+b-s; a-s, b-s, s).
```

Equivalent product forms:

```text
= q^(s(s-1)/2)
  * GaussianBinomial_q(a+b-s, a)
  * GaussianBinomial_q(a, s)

= q^(s(s-1)/2)
  * GaussianBinomial_q(a+b-s, b)
  * GaussianBinomial_q(b, s).
```

Thus the candidate full polynomial is

```text
G_(a,b)(q,t)
 = sum_(s=0..min(a,b))
   q^(s(s-1)/2)
   GaussianMultinomial_q(a+b-s; a-s,b-s,s)
   t^s.
```

This is a finite formal q-polynomial identity. `q` remains formal unless separately specialized.

## Candidate scalar recurrence

Preregister the boundary conditions

```text
G_(0,b)=1
G_(a,0)=1
```

and for `a,b > 0`

```text
G_(a,b)
 = G_(a-1,b)
 + q^a G_(a,b-1)
 + t q^(a-1) G_(a-1,b-1).
```

The three terms correspond to terminal unmarked `0`, terminal `1`, and a marked terminal `10` collapsed to the diagonal step. Implementation must derive this from the marked-word/path surface rather than merely restating the candidate q-multinomial formula.

## Frozen specializations

Require, cell by cell:

```text
G_(a,b)(q,0)
 = GaussianBinomial_q(a+b,b)
```

which must reproduce the exact earned #963 Schubert composition polynomial.

Require

```text
G_(a,b)(1,t)
 = M_(d,k)(t)
```

where `M` is the exact earned #971 Delannoy/Möbius-support polynomial.

Require the two incidence-algebra cancellation specializations

```text
G_(a,b)(q,-1) = q^(ab)
G_(a,b)(q,-q) = 1.
```

These extremal cancellations are expected consequences of finite Möbius inversion with unique top and bottom elements; they are controls on the deformation, not claims of a new universal Möbius theorem.

```text
EXTREMAL_CANCELLATION != NEW_GENERAL_MOBIUS_THEOREM
```

## Candidate q-reciprocity

For every t-degree `s`, let `C_s(q)=[t^s]G_(a,b)(q,t)`. Preregister

```text
C_s(q) = q^(ab-s) C_s(q^-1).
```

Equivalently, coefficient arrays padded over q-degrees `0..ab-s` are palindromic.

At the whole-polynomial level this is the Laurent identity

```text
G_(a,b)(q,t)
 = q^(ab) G_(a,b)(q^-1,t/q).
```

This is formal q-reciprocity, not temporal reversal, causal reversal, or a physical duality.

## Candidate finite transpose symmetry

The q-multinomial candidate is symmetric in rectangle dimensions:

```text
G_(a,b)(q,t)=G_(b,a)(q,t).
```

Executable symmetry controls are restricted to the inherited square `0 <= a,b <= 5`; no extrapolation beyond the frozen science window follows.

## Prime evaluation interpretation ceiling

For a field prime `p`, #963 earned that a lower Schubert/HNF stratum of rank `r(f)` contains `p^r(f)` Atlas HNF representatives. Therefore the formal evaluation

```text
G_(a,b)(p,t)
```

may be read, on the inherited finite surface, as the nonzero Möbius-support enumerator weighted by the cardinality of the lower HNF stratum. This does not turn formal `q` into a field, and composite evaluation remains arithmetic only.

```text
FORMAL_Q != FIELD_PRIME_P
POLYNOMIAL_EVALUATION_AT_COMPOSITE_Q != FINITE_FIELD_REALIZATION
```

## Frozen finite burden

Inherited exact window:

```text
d=1..7
k=0..5
a=d-1=0..6
42 (d,k) cells
1715 binary pivot words / diagonal intervals
9912 marked-descent objects / earned nonzero Möbius intervals
112 t-degree q-polynomial slices
1428 rectangular (q-degree,t-degree) coefficient slots before trimming
36 finite transpose controls in 0<=a,b<=5
```

Required zero-failure comparisons:

1. marked-word enumeration versus interval definition;
2. marked-word enumeration versus scalar recurrence;
3. marked-word enumeration versus q-multinomial closed form;
4. all 112 closed-form t-slices;
5. all 42 `t=0` Gaussian specializations against #963;
6. all 42 `q=1` Delannoy specializations against #971;
7. all 42 `t=-1` top-cancellation controls;
8. all 42 `t=-q` bottom-cancellation controls;
9. all 112 q-reciprocity slice controls;
10. all 36 bounded transpose controls.

Expected failures: `0`.

## Frozen anchor · d=7, k=3

Here `a=6`, `b=3`, `ab=18`.

The `t^0` row must be the exact earned #963 Gaussian histogram:

```text
[1,1,2,3,4,5,7,7,8,8,8,7,7,5,4,3,2,1,1]
```

The remaining t-slices are preregistered as:

```text
[t^1]: [1,2,4,6,9,12,15,17,18,18,17,15,12,9,6,4,2,1]
[t^2]: [0,1,2,4,6,9,11,13,13,13,11,9,6,4,2,1]
[t^3]: [0,0,0,1,1,2,3,3,3,3,2,1,1]
```

At `q=1` this gives the exact earned #971 support polynomial

```text
84 + 168 t + 105 t^2 + 20 t^3.
```

At `q=2` preregister the arithmetic anchors

```text
G(2,0)  = 788035
G(2,1)  = 1644634
G(2,-1) = 262144 = 2^18
G(2,-2) = 1.
```

## Hostile controls

The executable chamber must reject:

- forgetting the `q^(s(s-1)/2)` shift in the closed form;
- using ordinary multinomials in place of Gaussian q-multinomials;
- weighting the upper rank `r(e)` where the definition requires lower rank `r(f)`;
- replacing `des10` by the total number of inversions;
- replacing marked descents by arbitrary adjacent pairs;
- reversing the `q^a` and `q^(a-1)` recurrence weights;
- treating `t=-1` cancellation as deletion of intervals;
- treating `t=-q` as a probability or physical weighting;
- promoting finite transpose symmetry to basis-free Atlas duality.

## Mandatory membranes

```text
GAUSSIAN_GRADING != MOBIUS_SUPPORT_GRADING
TWO_VARIABLE_DEFORMATION != TWO_PHYSICAL_DIMENSIONS
FORMAL_Q != FIELD_PRIME_P
FORMAL_T != TIME_PARAMETER
Q_RECIPROCITY != TEMPORAL_REVERSAL
T_MINUS_ONE_CANCELLATION != DELETION_OF_EVIDENCE
T_MINUS_Q_CANCELLATION != PHYSICAL_ANNIHILATION
EXTREMAL_CANCELLATION != NEW_GENERAL_MOBIUS_THEOREM
GAUSSIAN_MULTINOMIAL != PROBABILITY_DISTRIBUTION
FINITE_TRANSPOSE_SYMMETRY != ATLAS_PHYSICAL_DUALITY
FINITE_Q_POLYNOMIAL != ASYMPTOTIC_GEOMETRY
ORDERED_FIXED_FLAG_MODEL != BASIS_FREE_CANONICAL_GEOMETRY
ORDER_ISOMORPHISM != FUNCTORIAL_EQUIVALENCE
SUCCESSFUL_EXACT_HEAD_GREEN != MERGE_AUTHORITY
ATLAS_REGISTRATION != LIVE_RUNTIME_STATE
```

No merge, deploy, release, publication, production, Vercel, physical geometry, continuum geometry, causal interpretation, probability model, basis-free canonicality, or runtime scheduling authority follows from this preregistration.

Sealed ⟐