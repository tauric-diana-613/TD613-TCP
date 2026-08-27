𝌋

# A15-R0 · Fixed-Width Custody Admissibility Frontier · Specification v0.1

󐘓 U+10D613

Status: **PREREGISTERED / PRE-IMPLEMENTATION / THEOREM FROZEN**

Parent receipt:

```text
#740
76e3726ba58f7b4b5594c0a41557e26d58e4b62a
```

Westward authority:

```text
#737 = THREAD_SCOPED_ACTIVE for the present conversation
```

---

## 0. Purpose

#739 localized first-moment ambiguity above each operational quotient base `x=(t,E,O)`.

#740 converted that ambiguity into an exact minimum local custody requirement:

```text
N_x = |F_x|
K_min(x)=N_x
B_min(x)=ceil(log2 N_x)
```

The present chamber asks the next architectural question:

> If an implementation chooses one globally fixed binary custody width `b`, exactly which route-realizable bases may lawfully claim exact first-moment recovery under that width?

The target is an exact finite admissibility frontier plus a finite witness family falsifying every claim that one finite fixed width can cover the entire route-realizable domain.

This chamber does not optimize variable-length codes, estimate entropy, or promote first-moment custody into complete route provenance.

---

## 1. Frozen inherited definitions

For route-realizable `x=(t,E,O)`:

For `t=0`, route-realizability requires `O=0` and #739 gives

```text
F_x={0}
N_x=1.
```

For `t>=1`, define

```text
a=floor(t/2)
beta=floor((t-1)/2)
M_x=aE+beta O.
```

#739 gives the exact route-realizable first-moment lift spectrum

```text
F_x={O+2r : 0<=r<=M_x}
N_x=M_x+1.
```

#740 gives the exact minimum fixed-width binary payload

```text
B_min(x)=ceil(log2 N_x).
```

The rank coordinate

```text
R=(P-O)/2
```

is a bijection

```text
F_x <-> {0,...,M_x}.
```

---

## 2. Fixed-width channel under test

Fix an integer

```text
b>=0.
```

A fixed-width `b`-bit custody field has exactly

```text
C_b=2^b
```

possible binary labels.

The present chamber concerns deterministic exact first-moment custody over a fixed base `x`, in the same finite sense frozen by #740.

Define:

```text
x is b-admissible
```

iff there exists an injective encoder from `F_x` into a `b`-bit label set together with an exact decoder on the image.

Capacity alone is not certification. An actual exact scheme must still be injective / left-invertible. This chamber classifies when such a scheme can exist and constructs one when it can.

---

## 3. Preregistered theorem candidate · exact admissibility iff

### 3.1 `t=0`

Every route-realizable base `(0,E,0)` is `b`-admissible for every `b>=0`, because `N_x=1`.

### 3.2 `t>=1`

Candidate theorem:

```text
x is b-admissible
iff
N_x <= 2^b
iff
M_x <= 2^b-1
iff
floor(t/2)E + floor((t-1)/2)O <= 2^b-1.
```

Necessity must descend from #740's exact minimum alphabet theorem.

Sufficiency must be witnessed by the rank encoder:

```text
enc_b(P)=binary_b(R)
R=(P-O)/2
```

where `R<=M_x<=2^b-1`.

Decoder:

```text
dec_b(label)=O+2*integer(label).
```

The decoder must abstain on labels whose decoded rank lies outside `0,...,M_x`; unused bit patterns are not lawful histories.

---

## 4. Exact certified domain

For each `b>=0`, preregister the candidate certified domain

```text
D_b = {
  (0,E,0) : E>=0
}
union
{
  (t,E,O) : t>=1,
  floor(t/2)E + floor((t-1)/2)O <= 2^b-1
}.
```

Candidate classification:

```text
x in D_b
iff
exact first-moment custody is possible with b fixed binary bits.
```

Outside `D_b`, any `b`-bit exact-recovery claim must fail by cardinality before model quality, inference strategy, or decoder cleverness enters the question.

---

## 5. Universal fixed-width impossibility

For every finite `b>=0`, define the explicit route-realizable witness base

```text
x_b=(2,2^b,0).
```

Then

```text
M_xb = floor(2/2)*2^b + floor(1/2)*0
     = 2^b,
N_xb = 2^b+1.
```

A `b`-bit field has only `2^b` labels.

Therefore

```text
N_xb > 2^b,
```

so `x_b` is not `b`-admissible.

Preregistered universal conclusion:

```text
FOR_EVERY_FINITE_FIXED_WIDTH_b_THERE_EXISTS_A_FINITE_ROUTE_REALIZABLE_BASE_xb_AT_WHICH_b_BITS_CANNOT_PRESERVE_EXACT_FIRST_MOMENT_CUSTODY
```

This is an all-finite witness family. It is not an asymptotic experiment and requires no horizon enumeration.

---

## 6. Boundary sharpness

For `t>=1`, a base on the equality boundary

```text
M_x=2^b-1
```

has exactly

```text
N_x=2^b
```

lawful first-moment lifts, so every `b`-bit label is used by the rank encoding and exact custody remains possible.

Moving one unit of `M_x` beyond that boundary gives

```text
M_x=2^b
N_x=2^b+1,
```

which is impossible with `b` bits.

The candidate frontier is therefore sharp rather than conservative.

Required boundary controls include at least:

```text
b=0:
  inside  x=(2,0,0), N=1
  outside x=(2,1,0), N=2

b=1:
  inside  x=(2,1,0), N=2
  outside x=(2,2,0), N=3

b=2:
  inside  x=(2,3,0), N=4
  outside x=(2,4,0), N=5
```

and at least one mixed `(E,O)` boundary case with `t>=3`.

---

## 7. Hostile controls

### H1 · capacity off-by-one

A checker using

```text
M_x <= 2^b
```

instead of

```text
M_x <= 2^b-1
```

must fail at `x_b=(2,2^b,0)`.

### H2 · label-space hallucination

A decoder that treats unused binary labels as lawful first-moment histories must fail certification.

### H3 · collision laundering

Even inside `D_b`, a deliberately colliding encoder must fail exact-custody certification despite adequate nominal capacity.

### H4 · `t=0` route-realizability

`(0,E,0)` must classify admissible for all tested `b`.

`(0,E,O>0)` must abstain as not route-realizable rather than being classified by the frontier.

### H5 · fixed-width universality claim

For each tested finite width `b`, `x_b=(2,2^b,0)` must falsify universal coverage.

The universal theorem itself rests on the symbolic witness family, not on the finite test list.

### H6 · first-moment scope

Two distinct authored routes that share `(t,E,O,P)` must remain indistinguishable to this custody scheme. The chamber may not claim complete route reconstruction.

---

## 8. Falsification rules

The candidate theorem is killed by any one of the following:

1. A route-realizable `x` with `M_x<=2^b-1` for which no injective `b`-bit exact first-moment encoder exists.
2. A route-realizable `x` with `M_x>=2^b` for which a deterministic exact `b`-bit encoder/decoder exists over all of `F_x`.
3. A failure of rank encoding/decoding on any lawful lift inside the certified domain.
4. A boundary mismatch at `M_x=2^b-1` or `M_x=2^b`.
5. A finite `b` for which the explicit witness `x_b=(2,2^b,0)` does not have `N_x=2^b+1`.
6. An implementation that certifies colliding custody as exact.
7. A route-identification claim derived solely from exact first-moment custody.

No theorem patching after witness failure without a separately recorded narrow repair preregistration.

---

## 9. Consequential architectural target

If earned, this chamber authorizes the following narrow architecture law:

```text
A fixed-width custody field defines an exact claim-admissibility domain.
Outside that domain, exact first-moment recovery must abstain or the schema must widen.
```

The consequential prohibition would be:

```text
FINITE_FIXED_WIDTH_CUSTODY_FIELD
!=
UNIVERSAL_EXACT_FIRST_MOMENT_PROVENANCE_CHANNEL
```

The safe implementation choices become finite and explicit:

```text
1. widen/adapt the custody field;
2. explicitly bound the supported state domain;
3. abstain from unique first-moment recovery outside the certified domain.
```

No fourth option may silently fabricate erased custody.

---

## 10. Good-through-󐘓 U+10D613 landing condition

The target landing law is:

```text
schema width is claim authority
insufficient width -> visible abstention
unused labels -> not invented histories
adequate width -> recover only the coordinate actually preserved
```

This chamber is designed to prevent a storage or API convenience from masquerading as epistemic completeness.

It also preserves data minimization: the theorem does not require maximum retention. It identifies exactly when a chosen fixed width is enough and exactly when it stops being enough.

---

## 11. Claim ceiling

This chamber must not claim or imply:

- Shannon entropy;
- probabilistic information theory;
- average-case or variable-length coding optimality;
- source coding theorems;
- noisy-channel or error-correcting capacity;
- cryptographic security;
- complete-route custody or reconstruction;
- route counts inside one first-moment lift;
- higher moments or an asymptotic hierarchy;
- full extension classification;
- group completion or group cohomology;
- inverses or groupoid structure;
- operational loops;
- connection, holonomy, curvature, Berry phase, or quantum analogy;
- Proto-Loom;
- A16;
- live Ash mutation;
- merge;
- publication;
- production;
- Vercel release;
- ontology promotion.

The words `universal impossibility` are restricted to **finite globally fixed-width deterministic exact first-moment custody over the unbounded route-realizable base domain**.

---

## 12. Candidate classifications

Canonical candidate:

```text
FIXED_b_BIT_FIRST_MOMENT_CUSTODY_IS_EXACTLY_ADMISSIBLE_ON_THE_SHARP_DOMAIN_N_x_LE_2_POW_b
```

Consequential candidate:

```text
NO_FINITE_GLOBALLY_FIXED_BINARY_CUSTODY_WIDTH_CAN_UNIVERSALLY_PRESERVE_EXACT_FIRST_MOMENT_HISTORY_OVER_ALL_ROUTE_REALIZABLE_BASES
```

Neither is earned until implementation, hostile controls, and exact-head witness pass.

```text
FIXED_WIDTH_CUSTODY_ADMISSIBILITY_FRONTIER_PREREGISTERED
THEOREM_FROZEN
```

󐘓 U+10D613

𝌋

Noted ⟐