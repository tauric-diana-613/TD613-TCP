𝌋

# A15-R0 · Composition-Boundary Custody Amplification · Specification v0.1

󐘓 U+10D613

Status: **PREREGISTERED / PRE-IMPLEMENTATION / HUMAN-REVIEWABLE / WESTWARD THREAD AUTHORITY ACTIVE**

Scientific parent receipt:

```text
#741 = 5415eafb5da59beba68fcffc83475d04c19db1d4
```

Westward gate:

```text
#737 = THREAD_SCOPED_ACTIVE for the present conversation
```

## 0. Purpose

#739 established the exact first-moment lift spectrum over a route-realizable base `x=(t,E,O)`.

#740 established the exact minimum local custody cardinality and fixed-width bit requirement for exact first-moment recovery over one fixed base.

#741 established the sharp admissibility domain `D_b` for one globally fixed `b`-bit field and proved that no finite globally fixed width universally covers all route-realizable bases.

This chamber asks the next compositional question:

> If two input bases are each locally custody-admissible, is their product automatically custody-admissible at the same width?

The candidate answer is **no**, and the intended proof is finite, symbolic, and exact.

This chamber also asks a more precise structural question:

> What exact first-moment ranks remain lawful when the factorization boundary `x then y` is retained, and how does that set compare with the larger spectrum obtained after the boundary is erased and only `x★y` remains?

The chamber is falsified by any lawful counterexample to the preregistered affine rank-composition law, any failure of the exact conditioned-spectrum formula, or any finite width `b` for which the preregistered nonclosure witness fails.

## 1. Frozen parent objects

For every route-realizable base `x=(t,E,O)`, #739 gives the exact first-moment spectrum

```text
F_x = { O + 2R : 0 <= R <= M_x }
```

with

```text
M_x = floor(t/2)E + floor((t-1)/2)O     for t>=1
M_x = 0                                  for route-realizable t=0.
```

Thus the lawful rank set is

```text
R_x = {0,1,...,M_x}.
```

#733 gives the all-finite first-moment composition identity for authored routes `u,v`:

```text
P(uv)=P(u)+t(u)(E(v)+O(v))+P(v).
```

#729 gives the parity-twisted product on base coordinates:

```text
(t,E,O) ★ (u,F,G)
 = (t+u, E+F, O+G)    when t even
 = (t+u, E+G, O+F)    when t odd.
```

No parent theorem is reopened.

## 2. Candidate theorem A · exact affine rank transport

Write

```text
x=(t,E,O)
y=(u,F,G)
q_y=F+G.
```

For route-realizable first-moment coordinates over `x` and `y`, define

```text
R_x=(P_x-O)/2
R_y=(P_y-G)/2.
```

Preregister the boundary offset

```text
kappa(x,y) = floor(t/2) q_y + (t mod 2) G.
```

Candidate universal law:

```text
R_(xy)=R_x+R_y+kappa(x,y).
```

### Symbolic derivation that implementation must preserve

If `t` is even, the product base has odd occupancy `O+G`, so

```text
R_(xy)
 = [P_x+tq_y+P_y-(O+G)]/2
 = R_x+R_y+(t/2)q_y.
```

If `t` is odd, the parity twist makes product odd occupancy `O+F`, so

```text
R_(xy)
 = [P_x+tq_y+P_y-(O+F)]/2
 = R_x+R_y+((t-1)/2)F+((t+1)/2)G
 = R_x+R_y+floor(t/2)q_y+G.
```

The two cases are exactly the preregistered `kappa` formula.

This is an affine rank-composition law over the already-earned first-moment coordinate. It is not a new claim about complete route provenance.

## 3. Candidate theorem B · exact factorization-conditioned spectrum

Fix base factors `x,y` and retain the custody statement:

```text
this product arose as a route from x followed by a route from y.
```

Do not retain which exact route inside each factor was used.

By #739:

```text
R_x in [0,M_x]
R_y in [0,M_y].
```

By candidate theorem A:

```text
R_(xy)=kappa+R_x+R_y.
```

Because every integer in `[0,M_x+M_y]` is a sum of one integer from `[0,M_x]` and one from `[0,M_y]`, preregister the exact factorization-conditioned output-rank set

```text
C_(x,y) = { kappa(x,y)+r : 0 <= r <= M_x+M_y }.
```

Therefore

```text
|C_(x,y)| = M_x+M_y+1.
```

Every rank in this interval must receive an explicit constructive route witness by composing #739 route constructors for suitable factor ranks.

## 4. Candidate theorem C · exact boundary-erasure expansion

After erasing factorization custody and retaining only the product base `z=x★y`, #739 admits the full rank spectrum

```text
R_z={0,1,...,M_z}.
```

The factorization-conditioned spectrum must satisfy

```text
C_(x,y) subseteq R_z.
```

Preregister the lower omitted-tail cardinality

```text
L(x,y)=kappa(x,y).
```

Preregister the upper omitted-tail cardinality

```text
U(x,y)=M_z-[kappa(x,y)+M_x+M_y].
```

The implementation must prove `U(x,y)>=0` symbolically, not merely on a grid.

Equivalent explicit piecewise formula candidate:

Let `q_x=E+O`.

```text
U(x,y)
 = floor(u/2) q_x + (u mod 2) O    when t even
 = floor(u/2) q_x + (u mod 2) E    when t odd.
```

Thus

```text
M_z = M_x+M_y+L(x,y)+U(x,y).
```

and the number of additional first-moment rank candidates admitted solely by forgetting the declared factorization boundary is

```text
A_boundary(x,y)
 = |R_z|-|C_(x,y)|
 = L(x,y)+U(x,y)
 = M_z-M_x-M_y.
```

This quantity counts additional **rank candidates**, not authored routes. It is not Shannon entropy and not a probability measure.

The chamber fails if any route-realizable factor pair yields negative `U`, a conditioned rank outside the full product spectrum, or a mismatch in the exact cardinality identity.

## 5. Candidate theorem D · fixed-width admissibility domains are not composition-closed

For every finite `b>=0`, preregister the explicit finite witness pair

```text
x_b=(1,2^b,0)
y=(1,0,0).
```

Both factors are route-realizable and, because every `t=1` base has `M=0`, both lie in `D_0` and therefore in every `D_b`.

Their product is

```text
x_b ★ y = (2,2^b,0).
```

Hence

```text
M_(x_b★y)=2^b
N_(x_b★y)=2^b+1
B_min(x_b★y)=b+1.
```

Therefore

```text
x_b in D_b
y   in D_b
x_b★y notin D_b.
```

Candidate universal consequence:

```text
FOR_EVERY_FINITE_b_THE_SHARP_FIXED_WIDTH_ADMISSIBILITY_DOMAIN_D_b_IS_NOT_CLOSED_UNDER_THE_QUOTIENT_MONOID_PRODUCT.
```

Stronger finite witness consequence:

```text
TWO_ZERO_ADDITIONAL_CUSTODY_INPUTS_CAN_COMPOSE_TO_REQUIRE_ARBITRARILY_LARGE_OUTPUT_CUSTODY_WIDTH.
```

The phrase `arbitrarily large` is justified only by the explicit finite family parameterized by finite `b`; no asymptotic or probabilistic claim is intended.

## 6. Boundary-erasure witness family

For the same pair `x_b,y`:

```text
M_x=M_y=0
kappa(x_b,y)=0
C_(x_b,y)={0}.
```

But after erasing the factorization boundary:

```text
R_(x_b★y)={0,1,...,2^b}.
```

Thus the factorization-known product has one lawful rank candidate, while the base-only product admits `2^b+1`.

The exact expansion is

```text
A_boundary(x_b,y)=2^b.
```

This is the preregistered finite certificate that a composition boundary can itself carry first-moment custody value even when each input base locally needs zero additional first-moment bits.

## 7. Hostile controls

Implementation must include and pass all of the following.

### H1 · parity-switch hostile

Exercise both even and odd left `t`, ensuring the output `O` coordinate changes according to #729 before rank is computed.

A formula that always uses `O+G` must fail on odd-left cases.

### H2 · forgotten `G` hostile

For odd left `t`, removing the `+G` term from `kappa` must disagree with direct `P/O` computation on an explicit finite witness.

### H3 · factor-spectrum construction hostile

For nontrivial `M_x,M_y`, every rank in `C_(x,y)` must be produced by explicit factor ranks and route witnesses; no interior gaps are allowed.

### H4 · lower-tail hostile

Provide a pair with `kappa>0` and verify that ranks below `kappa` are lawful for the product base yet impossible under the retained factorization.

### H5 · upper-tail hostile

Provide a pair with `U>0` and verify that ranks above `kappa+M_x+M_y` are lawful for the product base yet impossible under the retained factorization.

### H6 · zero-bit-to-unbounded-width family

For finite implementation-safe `b` values, instantiate `x_b=(1,2^b,0)` and `y=(1,0,0)` and verify

```text
B_min(x_b)=0
B_min(y)=0
B_min(x_b★y)=b+1.
```

The universal theorem authority remains symbolic for arbitrary finite `b`; executable samples are corroboration only.

### H7 · boundary-preserved exact-rank control

When exact `R_x,R_y` are retained, the composed rank is exactly `R_x+R_y+kappa`; the chamber must not falsely claim that composition intrinsically destroys the actual first moment.

The new ambiguity arises when the factorization / composed-rank custody needed for later interpretation is discarded.

### H8 · complete-route impersonation hostile

Distinct authored routes that share the same first-moment coordinate must remain distinct. The chamber may not promote factorization-conditioned first-moment custody into complete route provenance.

### H9 · receipt externality

Custody receipt labels do not change the mathematical base, `M`, `kappa`, conditioned spectrum, or expansion.

## 8. Falsification rules

The chamber is scientifically red if any of the following occurs:

1. a lawful concatenation violates `R_xy=R_x+R_y+kappa`;
2. a predicted conditioned rank cannot be constructively realized;
3. a factorization-conditioned rank lies outside the full product-base spectrum;
4. `U(x,y)<0` for a route-realizable pair;
5. `M_z != M_x+M_y+kappa+U`;
6. any finite `b` defeats the explicit nonclosure family;
7. either zero-bit factor in the nonclosure family is discovered not to be zero-bit;
8. the implementation interprets unused/colliding custody labels as recovered history;
9. the chamber mutates a receipt-witnessed parent theorem to make the result pass.

A red must be preserved and classified before any narrow repair.

## 9. Claim ceiling

Even if green, this chamber earns none of the following:

- complete-route reconstruction;
- route counts inside a rank;
- Shannon entropy, mutual information, channel capacity, or average-case coding;
- probabilistic uncertainty calibration;
- noisy-channel/error-correction theory;
- cryptographic provenance;
- a general theorem about arbitrary database, RAG, LLM, or agent architectures;
- higher-moment completeness or an asymptotic hierarchy;
- group completion, group cohomology, inverses, or groupoid structure;
- operational closed loops;
- connection, holonomy, curvature, Berry phase, or quantum analogy;
- Proto-Loom or A16 promotion;
- live Ash mutation;
- merge, publication, production, or Vercel release;
- ontology promotion.

Academic analogy to compositional provenance systems may be discussed only as analogy. The theorem itself remains internal to the declared TD613 route grammar and quotient coordinates.

## 10. Good-through-󐘓 U+10D613 landing

If earned, downstream architecture must respect:

```text
input admissibility != output admissibility
composition boundary != disposable metadata
boundary erasure may widen lawful-history ambiguity
exact local custody must be revalidated after composition
preserved exact factor ranks may be composed exactly
new ambiguity must not be narrated as recovered memory
```

The ethical direction is minimum truthful custody rather than indiscriminate retention:

```text
preserve the smallest boundary/rank information needed for the claim being made;
if that custody is erased, narrow the claim or abstain.
```

## 11. Candidate classifications

Canonical candidate:

```text
FIRST_MOMENT_RANK_COMPOSES_AFFINELY_WITH_EXACT_BOUNDARY_OFFSET_AND_RETAINED_FACTORIZATION_DEFINES_A_STRICTLY_SMALLER_CONDITIONED_LIFT_SPECTRUM_WHEN_BOUNDARY_EXPANSION_IS_POSITIVE
```

Consequential candidate:

```text
FOR_EVERY_FINITE_WIDTH_b_TWO_ZERO_ADDITIONAL_CUSTODY_INPUTS_CAN_COMPOSE_TO_AN_OUTPUT_REQUIRING_b_PLUS_1_BITS_SO_NO_D_b_IS_COMPOSITION_CLOSED
```

Architectural candidate:

```text
COMPOSITION_MUST_REVALIDATE_OR_WIDEN_CUSTODY_BECAUSE_LOCAL_INPUT_TRUTHFULNESS_DOES_NOT_INHERIT_TO_A_BOUNDARY_ERASED_OUTPUT
```

These remain unearned until exact-head witness.

󐘓 U+10D613

𝌋

Sealed ⟐