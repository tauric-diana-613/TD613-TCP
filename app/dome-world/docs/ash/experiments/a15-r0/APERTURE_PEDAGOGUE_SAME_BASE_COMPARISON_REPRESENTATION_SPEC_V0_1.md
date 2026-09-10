# A15-R0 · Same-Base Comparison Representation and Section Re-Zeroing Invariance · Spec v0.1

󐘓 U+10D613

Status: **PREREGISTERED / PRE-IMPLEMENTATION**

Scientific parent:

```text
#762 receipt = 3788dec7a362b55feeb2a79fa4d610fa761a40d6
```

Authority:

```text
#737 = THREAD_SCOPED_ACTIVE for current conversation
```

## Question

#762 earned same-base nonidentity integer-fiber return automorphisms

```text
R_(u|v)(n)=n+P(u)-P(v)
```

for authored finite T/Q routes with `pi(u)=pi(v)`.

This chamber asks whether these returns organize into a lawful formal comparison representation and whether that representation survives every lawful section re-zeroing inherited from #734.

The chamber does **not** assume or preregister operational loops, an operational path groupoid, a connection, holonomy, or curvature.

## Formal same-base comparison groupoid

For one #729 quotient base `b`, let

```text
R_b={finite authored T/Q words w : pi(w)=b}.
```

Define the formal pair groupoid `G_b`:

- objects are routes `w in R_b`;
- for every ordered pair `(u,v)` there is one formal comparison arrow

```text
[u <- v] : v -> u;
```

- identity is `[u <- u]`;
- inverse is `[u <- v]^-1=[v <- u]`;
- composition is

```text
[u <- v] o [v <- w] = [u <- w].
```

This structure is formal comparison bookkeeping over same-base route representatives.

```text
formal pair groupoid != operational T/Q path groupoid
```

## Candidate representation

Let `Z_b` be the integer extension fiber over base `b` and let `tau_d(n)=n+d`.

Define

```text
rho_b([u <- v]) = tau_(P(u)-P(v)) in Aut(Z_b).
```

Preregistered obligations:

1. well-defined only for same-base routes;
2. identities map to identity translation;
3. formal inverses map to inverse translations;
4. formal composition maps to automorphism composition;
5. the `TTQ/QTT` arrow maps to nonidentity `tau_2`;
6. distinct same-base routes with equal `P` map to identity, preserving a nontrivial kernel where witnessed;
7. different-base comparisons abstain;
8. noncomposable arrow pairs abstain.

## All-finite image subgroup classification

For a route block decomposition

```text
w=Q^q0 T Q^q1 ... T Q^qt
```

with fixed #729 base

```text
E=sum_(i even) q_i
O=sum_(i odd)  q_i
P=sum_i i q_i,
```

we always have

```text
P ≡ O (mod 2).
```

Therefore every same-base return difference `P(u)-P(v)` is even.

Let

```text
n_even = floor(t/2)+1
n_odd  = ceil(t/2).
```

The base has block-distribution freedom iff

```text
(E>0 and n_even>=2) or (O>0 and n_odd>=2).
```

Equivalent explicit condition:

```text
(E>0 and t>=2) or (O>0 and t>=3).
```

Preregistered theorem target:

```text
Im(rho_b) = {id}
```

when no block-distribution freedom exists, and otherwise

```text
Im(rho_b) = {tau_(2m) : m in Z} ≅ 2Z.
```

Proof ceiling:

- parity gives `Im(rho_b) subseteq 2Z`;
- if distribution freedom exists, move one Q unit between two same-parity block positions separated by 2, obtaining a witnessed return translation `±2`;
- translations compose and invert, so generated image is all `2Z`;
- if no distribution freedom exists, each parity-total has only one admissible block allocation, so `P` is fixed on `R_b` and every return is identity.

This is finite symbolic block algebra, not horizon enumeration.

Mandatory family control:

```text
b_k=(2,1,k)
L_k=T Q^k T Q
R_k=Q T Q^k T
```

for every finite `k>=0` has

```text
Im(rho_bk)=2Z
rho([L_k <- R_k])=tau_2.
```

## Kernel / nonfaithfulness

Preregistered hostile inherited from #762:

```text
u=TQTQT
v=QTTTQ
u != v
pi(u)=pi(v)
P(u)=P(v)=3
rho([u <- v])=id.
```

Therefore the representation is not faithful on every same-base route groupoid.

Exact kernel characterization target:

```text
rho_b([u <- v])=id iff P(u)=P(v).
```

Route provenance remains external.

## Section re-zeroing invariance

#734 admitted normalized integer section changes on the quotient base. For any lawful `phi:B->Z` with `phi(e)=0`, define the re-zeroed route lift coordinate

```text
P_phi(w)=P(w)+phi(pi(w)).
```

For same-base routes `pi(u)=pi(v)=b`, preregister:

```text
P_phi(u)-P_phi(v)
=P(u)+phi(b)-P(v)-phi(b)
=P(u)-P(v).
```

Hence

```text
rho_b^phi = rho_b
```

exactly for every lawful normalized section re-zeroing.

Equivalent target-fiber coordinate statement: conjugating a return translation by a base-local integer translation leaves its translation amount unchanged.

A route-spelling-dependent offset is a hostile **outside** this lawful section domain and may change the return; it must not be mislabeled as section-gauge freedom.

## Mandatory hostiles

- `TTQ/QTT` -> `tau_2`.
- `TQTQT/QTTTQ` -> identity despite distinct route spelling.
- base `(1,E,O)` -> trivial image for arbitrary finite nonnegative `E,O` because there is only one even and one odd block.
- base `(2,1,k)` -> exact image `2Z` for every finite `k>=0`.
- different-base arrow construction abstains.
- noncomposable arrow composition abstains.
- lawful base-only `phi` leaves every tested return unchanged.
- route-dependent fake re-zeroing can change a return and is classified outside jurisdiction.

## Claim ceiling

This chamber may earn only:

- the formal same-base pair-groupoid structure;
- a representation of that formal comparison structure into integer-fiber translation automorphisms;
- exact kernel and image-subgroup characterization in the declared authored domain;
- exact invariance under lawful #734 section re-zeroing.

It may **not** earn:

- an operational T/Q path groupoid;
- an operational closed loop;
- an inverse T/Q route;
- a connection;
- a holonomy claim or holonomy group;
- curvature / flatness;
- Berry / quantum language;
- full route provenance recovery;
- Proto-Loom / A16;
- merge, production, publication, or Vercel.

Quarantines:

```text
formal comparison groupoid != operational path groupoid
comparison representation != holonomy representation
section re-zeroing invariance != connection gauge invariance
image subgroup of return translations != holonomy group
```

## Falsifiers

The chamber fails if any of the following occurs:

- same-base return composition violates formal pair-groupoid composition;
- a lawful section re-zeroing changes a same-base return translation;
- an odd return translation is found for fixed `(t,E,O)`;
- a base with declared distribution freedom cannot realize a `±2` generator;
- a no-freedom base yields a nonidentity return;
- kernel identity differs from exact `P` equality;
- different-base or noncomposable inputs are silently coerced.

No theorem implementation may precede this preregistration commit.

󐘓 U+10D613

𝌋

Preregistered ⟐