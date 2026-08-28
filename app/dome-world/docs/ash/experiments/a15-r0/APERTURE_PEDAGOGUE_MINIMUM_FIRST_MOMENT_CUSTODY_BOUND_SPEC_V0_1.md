𝌋

# A15-R0 · Minimum First-Moment Custody Bound

󐘓 U+10D613

Status: **PREREGISTERED / PRE-IMPLEMENTATION / FALSIFIABLE / THREAD-SCOPED WESTWARD LIBERTIES ACTIVE**

Parent receipt:

```text
#739 = ffa5756d63f10fa6dc211e4cb07f38fbdc4bee0a
```

Gate:

```text
#737 = THREAD_SCOPED_ACTIVE for the present ChatGPT thread
```

## 0. Purpose

#739 earned the exact set of route-realizable first-moment lifts above each operational quotient base `x=(t,E,O)`:

```text
F_x = {O+2r : 0<=r<=M_x}
M_x = floor(t/2)E + floor((t-1)/2)O   for t>=1
|F_x| = M_x+1
```

with the `t=0` route-realizable case `O=0`, `F_x={0}`.

This chamber asks the next consequential finite question:

> If a system has already retained the operational base `x`, what is the minimum additional discrete custody required so that the original first-moment lift `P in F_x` can still be recovered exactly for every lawful lift above that base?

The target is not an entropy estimate, average-case code length, probabilistic reconstruction score, or a complete-route theorem. It is a deterministic local exact-decoding lower bound.

## 1. Frozen objects

For one fixed route-realizable base `x`, let

```text
F_x = route-realizable first-moment lift set from #739
N_x = |F_x|
```

A deterministic custody scheme over `x` consists of:

```text
A_x      finite set of distinguishable custody labels
enc_x    F_x -> A_x
dec_x    A_x -> F_x
```

Exact first-moment custody means

```text
dec_x(enc_x(P)) = P   for every P in F_x.
```

Because the base `x` is already retained, it is treated as fixed side information and is not counted again in the local custody alphabet.

## 2. Preregistered theorem candidate

### 2.1 Necessity

Any exact deterministic custody scheme over fixed base `x` must satisfy

```text
|A_x| >= |F_x| = N_x.
```

Reason to be proved symbolically: exact decoding forces `enc_x` to be injective. A map from an `N_x`-element set into fewer than `N_x` labels cannot be injective.

### 2.2 Tightness

The bound is achievable.

For `t>=1`, #739 gives

```text
F_x={O+2r : 0<=r<=M_x}.
```

Define the rank coordinate

```text
R_x(P) = (P-O)/2.
```

Then

```text
R_x : F_x -> {0,1,...,M_x}
```

is a bijection, and

```text
P = O + 2R_x.
```

Thus exactly `N_x=M_x+1` labels suffice.

For the `t=0,O=0` case, `F_x={0}` and a one-label alphabet suffices; when the base itself is already retained and zero additional payload is permitted as a singleton implicit state, this is operationally zero additional binary bits.

### 2.3 Fixed-width binary corollary

If the custody label is represented by a fixed-width binary word of length `b_x`, exact deterministic recovery requires

```text
2^(b_x) >= N_x
```

and hence

```text
b_x >= ceil(log2 N_x).
```

This is tight by binary encoding of the rank `R_x` using `ceil(log2 N_x)` bits.

For `N_x=1`, the minimum fixed-width binary payload is `0` bits.

This is a finite cardinality corollary only.

```text
ceil(log2 N_x) fixed-width bits != Shannon entropy
ceil(log2 N_x) fixed-width bits != average code length
ceil(log2 N_x) fixed-width bits != information content of a complete route
```

## 3. Closed form inherited from #739

For `t>=1`, set

```text
a=floor(t/2)
b=floor((t-1)/2)
M_x=aE+bO
N_x=aE+bO+1.
```

The candidate minimum local custody alphabet size is therefore

```text
K_min(x)=aE+bO+1.
```

The candidate minimum fixed-width binary payload is

```text
B_min(x)=ceil(log2(aE+bO+1)).
```

At `t=0,O=0`:

```text
K_min(x)=1
B_min(x)=0.
```

## 4. Exact zero-custody locus

This chamber inherits #739's unique-recoverability locus.

Zero additional binary custody is sufficient exactly when `N_x=1`:

```text
t=0,O=0  : all E
t=1      : all E,O
t=2      : iff E=0
t>=3     : iff E=O=0
```

Every other route-realizable base requires at least one additional binary bit, with larger local minima determined exactly by `ceil(log2 N_x)`.

## 5. Consequential architecture claim under test

If the theorem survives, TD613 may classify the adequacy of a claimed first-moment custody channel locally:

```text
alphabet cardinality < N_x
-> exact universal first-moment recovery is impossible over x
-> unique recovery claim must be rejected

alphabet cardinality >= N_x
-> exact recovery is not automatic
-> encoder injectivity / decoder left-inverse must still be witnessed

explicit rank scheme with N_x labels
-> exact first-moment recovery is achieved
```

Therefore alphabet capacity is a necessary lower bound, while an explicit injective scheme supplies tight sufficiency.

## 6. Falsification rules

This chamber fails if any one of the following is demonstrated within the declared domain:

1. an exact deterministic decoder exists over some fixed `x` using fewer than `N_x` distinguishable labels;
2. the rank map `(P-O)/2` is not a bijection on a #739 lawful spectrum;
3. the rank decoder `O+2R` fails to recover a lawful `P`;
4. the binary lower bound disagrees with finite exhaustive controls;
5. a base on the inherited unique locus requires nonzero binary payload under the declared fixed-base model;
6. a many-lift base is classified as exactly recoverable with an undersized custody alphabet.

One counterexample kills the theorem as preregistered.

## 7. Hostile controls

Implementation must include at least these hostiles.

### H1 · Pigeonhole collision hostile

Use a base with `N_x=3`, for example `x=(2,2,0)` where

```text
F_x={0,2,4}.
```

Any two-label encoder must collide on at least two lawful lifts. The hostile must produce or detect such a collision and refuse exact-recovery certification.

### H2 · Off-by-one bit hostile

For the same `N_x=3` base:

```text
floor(log2 3)=1
ceil(log2 3)=2.
```

A one-bit alphabet has only two labels and is insufficient. A two-bit fixed-width representation is sufficient with unused code space allowed.

### H3 · Capacity-is-not-injectivity hostile

An alphabet of size `N_x` whose encoder deliberately maps two lawful lifts to one label must fail exact-custody certification.

```text
sufficient cardinality != witnessed exact scheme
```

### H4 · Rank tightness hostile

For a nontrivial base with multiple lifts, encode every lawful `P` by `R=(P-O)/2` and require exact round-trip recovery.

### H5 · Zero-bit locus hostile

On a singleton spectrum, require an empty binary payload to round-trip because the retained base already selects the unique lawful first moment.

### H6 · Full-route impersonation hostile

Reuse or reconstruct a witnessed pair of distinct authored routes sharing the same `(t,E,O,P)` coordinate. The chamber must preserve:

```text
minimal first-moment custody != complete route custody
exact P recovery != exact route recovery
```

### H7 · Raw-P overspecification control

Storing raw `P` can recover `P`, but the implementation must not mistake that for the proved minimum cardinality result. The rank alphabet is the tight local cardinality witness.

### H8 · Receipt externality

Changing a custody receipt label without changing `x`, `F_x`, or the encoder must not change the mathematical lower bound.

## 8. Universal proof obligations

The universal theorem must rest on symbolic finite-set reasoning, not horizon enumeration:

```text
exact decoder => enc_x injective
injective finite map F_x -> A_x => |A_x|>=|F_x|
#739 spectrum => rank R=(P-O)/2 is bijective
bijection => tight N_x-label scheme
binary alphabet size 2^b => b>=ceil(log2 N_x)
```

Enumeration may corroborate implementation only.

## 9. Good-through-󐘓 U+10D613 landing condition

The purpose of the lower bound is not to maximize retention.

It establishes the **minimum truthful custody** needed for an exact first-moment claim.

A downstream TD613 surface that possesses less than the witnessed minimum must not fabricate uniqueness. A surface that possesses the minimum under a witnessed exact scheme may recover `P`, while remaining barred from promoting that result to complete-route provenance.

```text
preserve enough to tell the truth
retain no theoremically unnecessary claim authority
undersized custody -> abstain from unique recovery
adequate witnessed custody -> recover only the coordinate actually preserved
```

This chamber therefore binds exactness to data minimization rather than to indiscriminate archival accumulation.

## 10. Claim ceiling

Even if green, this chamber earns none of the following without separate preregistration and witness:

- Shannon entropy or probabilistic information-theory claims;
- average-case or variable-length coding optimality;
- noisy-channel or error-correcting coding theorems;
- complete-route reconstruction or minimum complete-route custody;
- route counts inside one first-moment lift;
- higher-moment hierarchy;
- asymptotic growth claims;
- full extension classification;
- group completion/cohomology;
- inverses/groupoid;
- operational closed loops;
- connection, holonomy, curvature, Berry, quantum analogy;
- Proto-Loom or A16 promotion;
- live Ash mutation;
- merge, publication, production, or Vercel release.

## 11. Candidate classifications

Unearned until exact-head witness:

```text
EXACT_FIRST_MOMENT_RECOVERY_OVER_FIXED_BASE_REQUIRES_AND_ADMITS_A_MINIMUM_CUSTODY_ALPHABET_EQUAL_TO_THE_ROUTE_REALIZABLE_LIFT_MULTIPLICITY
```

Consequential candidate:

```text
UNDERSIZED_CUSTODY_CHANNELS_ARE_FINITE_CERTIFICATES_OF_NONRECOVERABILITY_WHILE_THE_RANK_COORDINATE_GIVES_A_TIGHT_DATA_MINIMIZING_RECOVERY_SCHEME
```

## 12. Stop rule

After implementation, exact-head witness, scar classification, routing cleanup, and receipt, stop at the earned boundary. Thread-scoped Westward Liberties remain active for the present conversation, but this chamber may not silently expand its own scope.

󐘓 U+10D613

𝌋

Shut ⟐