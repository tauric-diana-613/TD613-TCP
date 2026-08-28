𝌋

# A15-R0 · First-Moment Lift Spectrum and Quotient Irreversibility Audition

Specification status: **PREREGISTERED / PRE-IMPLEMENTATION / OPERATOR-AUTHORIZED**
Date: 2026-08-24
Parent receipt: #738 `ae6c66113954fc9083815eef8dbc7b06b54180f7`
Westward gate: #737 activation 002

󐘓 U+10D613

## 0. Scientific purpose

This chamber asks a consequential finite question created by #733-#738:

> After route words are quotiented to the operational base `B=(t,E,O)`, exactly which first-moment lifts `P` remain possible above one base state, and exactly where can the base no longer recover that lifted coordinate?

The target is not another name for the cocycle. The target is an exact recoverability boundary.

If the proposed closed form fails on any lawful authored route, preserve the failure and close/supersede the chamber. No horizon growth, curve fitting, or asymptotic repair is permitted.

## 1. Frozen parent objects

Retain the free authored route monoid

```text
W={T,Q}*
```

and the unique block decomposition from #733:

```text
w = Q^q0 T Q^q1 T ... T Q^qt,
qi in N.
```

Retain the quotient coordinate

```text
π(w)=(t,E,O)
```

with

```text
E = Σ_{i even} qi
O = Σ_{i odd} qi.
```

Retain the first moment

```text
P(w)=Σ_{i=0}^t i qi.
```

Retain #738's homomorphic lifted map into the declared cocycle extension:

```text
L(w)=(P(w),π(w)).
```

No parent theorem is to be re-proved as an authority substitute. Receipt ancestry plus exact imported functions are sufficient custody.

## 2. Route-realizable base states

A base coordinate `(t,E,O)` is called route-realizable when at least one authored word maps to it.

Preregistered characterization:

```text
t=0: route-realizable iff O=0; E may be arbitrary.
t>=1: every E,O in N is route-realizable.
```

For `t=0`, the unique route class is represented by `Q^E` and necessarily has `P=0`.

For `t>=1`, `Q^E T Q^O T^(t-1)` supplies a constructive witness for every `(t,E,O)`.

## 3. Candidate exact lift spectrum

For a route-realizable base `x=(t,E,O)`, define the first-moment lift spectrum

```text
F_x = { P(w) in N : π(w)=x }.
```

For `t=0` preregister:

```text
F_(0,E,0) = {0}.
```

For `t>=1`, define

```text
a = floor(t/2)
b = floor((t-1)/2).
```

The candidate theorem is

```text
F_(t,E,O)
=
{ O + 2r : 0 <= r <= aE+bO }.
```

Equivalently:

```text
P_min = O
P_max = O + 2(aE+bO)
P ≡ O (mod 2)
```

and every parity-compatible integer between the bounds is realized by at least one authored route.

No gaps are allowed.

## 4. Symbolic proof obligation

For `t>=1`, rewrite

```text
P
= Σ_i i qi
= O + 2R
```

where

```text
R
= Σ_{i=2r} r q_i
+ Σ_{i=2r+1} r q_i.
```

The even-index contribution must range over every integer

```text
0,...,aE
```

and the odd-index contribution must range over every integer

```text
0,...,bO.
```

Acceptance requires a constructive all-integer interval proof, not finite enumeration.

A permitted construction for a weighted occupancy sum is:

For `A,N in N`, every `s` with `0<=s<=AN` is expressible as a sum of `N` terms from `{0,...,A}`. For `A>0`, write

```text
s = kA+r,
0<=r<A.
```

Use `k` terms equal to `A`, one term equal to `r` when `r>0`, and the remaining terms equal to zero. If `k=N`, then necessarily `r=0`.

This must be translated back into lawful block occupancies `qi`.

Then the Minkowski sum of the two complete integer intervals must give

```text
R in {0,...,aE+bO}
```

with no missing value.

## 5. Exact cardinality

If the spectrum theorem passes, the exact number of route-realizable first-moment lifts above a route-realizable base is

```text
|F_(0,E,0)| = 1
```

and for `t>=1`

```text
|F_(t,E,O)| = aE+bO+1.
```

This is a count of distinct first-moment coordinates, not a count of route spellings.

```text
lift multiplicity != route multiplicity
```

## 6. Exact quotient-loss irreversibility locus

Define first-moment recoverability from the base at `x` to mean `|F_x|=1`.

Define first-moment quotient-loss irreversibility at `x` to mean `|F_x|>1`: the map from the route-realizable first-moment quotient to `B` is many-to-one at `x`, so no deterministic decoder depending only on `x` can recover which first-moment class was present before projection.

This is information-loss irreversibility under the declared quotient. It is not temporal irreversibility, entropy production, operational noninvertibility, or a physical arrow of time.

Candidate exact locus:

```text
t=0, O=0: recoverable for every E.
t=1: recoverable for every E,O.
t=2: recoverable iff E=0; irreversible iff E>0.
t>=3: recoverable iff E=O=0; irreversible iff E+O>0.
```

Acceptance requires derivation from the cardinality formula, not case enumeration.

## 7. Canonical extremal route witnesses

For `t>=1`, the minimum first moment must be realized by

```text
w_min = Q^E T Q^O T^(t-1)
```

with

```text
P(w_min)=O.
```

For the maximum:

If `t` is even,

```text
w_max = T^(t-1) Q^O T Q^E
P(w_max)=tE+(t-1)O.
```

If `t` is odd,

```text
w_max = T^(t-1) Q^E T Q^O
P(w_max)=(t-1)E+tO.
```

These must agree exactly with

```text
O+2(aE+bO).
```

## 8. Consequential decoder-impossibility theorem

Let `C1_real` denote the route-realizable first-moment quotient coordinates `(t,E,O,P)` from #733, and let

```text
r : C1_real -> B
r(t,E,O,P)=(t,E,O).
```

On every base in the irreversibility locus, acceptance requires an explicit pair

```text
c1 != c2
r(c1)=r(c2).
```

Therefore no function

```text
D : B -> C1_real
```

can satisfy

```text
D(r(c))=c
```

for every `c in C1_real`.

This is the precise global recovery impossibility: once `C1_real` is projected to `B`, a base-only decoder cannot universally reconstruct the pre-projection first-moment class.

A set-theoretic section choosing one preferred lift is not a decoder of the original lift and must not be misrepresented as recovery.

```text
choosing a representative != reconstructing the lost representative
```

## 9. Required hostile controls

Implementation/test must include at minimum:

1. `t=0,O>0` rejected as non-route-realizable.
2. `t=0,E>=0,O=0` yields spectrum `{0}`.
3. `t=1` arbitrary controls yield singleton `{O}`.
4. `t=2,E=1,O=0` yields `{0,2}` and recovers the `QTT/TTQ` parent witness.
5. `t=2,E=0,O=3` yields singleton `{3}`.
6. `t=3,E=1,O=1` yields `{1,3,5}`.
7. `t=4,E=2,O=1` yields `{1,3,5,7,9,11}`.
8. Wrong-parity `P` values inside numeric bounds are rejected.
9. Out-of-bound parity-compatible `P` values are rejected.
10. Every predicted interior spectrum value receives a constructive block witness.
11. Exhaustive small-grid corroboration over bounded `(t,E,O)` coordinates may be used only as implementation hostile, never as the universal proof basis.
12. Ambient `E_ω=Z×B` fiber remains larger than the route-realizable lift spectrum; do not identify all integer fibers with authored-route realizability.
13. Distinct first-moment lifts do not imply complete route distinction is captured; #733's known same-`C1`/different-route pair must remain a counter-hostile.
14. Receipt identity remains external.
15. Source-season custody remains external.

## 10. Falsification policy

The theorem is falsified if any one of the following occurs:

- a lawful authored route produces `P` outside the predicted spectrum;
- a predicted spectrum value lacks a lawful block witness;
- a route-realizable base violates the route-realizability characterization;
- the cardinality formula disagrees with the exact spectrum;
- the claimed recoverability/irreversibility locus disagrees with the cardinality formula;
- the decoder-impossibility hostile fails on a base predicted to be many-to-one.

A mathematical red is preserved and the branch closes/supersedes. No widening of a horizon or post-hoc weakening of the formula is allowed inside the same witnessed hypothesis.

## 11. Candidate classifications — not yet earned

Primary candidate:

```text
ROUTE_REALIZABLE_FIRST_MOMENT_LIFTS_FORM_EXACT_PARITY_INTERVAL_WITH_CLOSED_FORM_CARDINALITY_AND_SHARP_BASE_RECOVERABILITY_BOUNDARY
```

Consequential candidate:

```text
FIRST_MOMENT_QUOTIENT_LOSS_IS_EXACTLY_LOCALIZED_BY_LIFT_MULTIPLICITY_AND_FORBIDS_UNIVERSAL_BASE_ONLY_RECOVERY_ON_THE_IRREVERSIBILITY_LOCUS
```

Secondary candidate:

```text
AMBIENT_INTEGER_COCYCLE_EXTENSION_FIBER_STRICTLY_EXCEEDS_ROUTE_REALIZABLE_FIRST_MOMENT_SPECTRUM_IN_GENERAL
```

## 12. Claim ceiling

Even if green, this chamber does not earn:

- complete route reconstruction from first moment;
- route-count formula inside each lift;
- entropy/information-theory numerical interpretation;
- asymptotic growth theorem;
- higher-moment hierarchy;
- full extension classification;
- group completion or group cohomology;
- inverses/groupoid;
- operational loop;
- connection, holonomy, curvature, Berry/quantum analogy;
- Proto-Loom or A16;
- live Ash mutation;
- merge, publication, production, or Vercel release.

The word `irreversibility` in this chamber is restricted to **many-to-one quotient-loss irreversibility at first-moment resolution**.

## 13. Landing ethic

The landing must preserve the distinction between what the system still knows and what the quotient has discarded.

A state with multiple lawful lifts must never be presented to a downstream child/operator as though the canonical base uniquely determines its erased first-moment history.

The safe interface consequence, if earned, is epistemic honesty:

```text
one base state
may admit several lawful first-moment lifts
therefore display ambiguity rather than fabricate a unique past
```

This is the required good-through-󐘓 U+10D613 landing condition for this chamber.

```text
PREREGISTRATION_FROZEN_BEFORE_IMPLEMENTATION
NO_HORIZON_FARMING
NO_MIRROR_RECOVERY
```

𝌋

Sealed ⟐