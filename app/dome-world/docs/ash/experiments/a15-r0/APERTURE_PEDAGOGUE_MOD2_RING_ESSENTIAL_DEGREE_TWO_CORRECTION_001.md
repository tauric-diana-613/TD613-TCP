# A15-R0 · Mod-Two Ring Essential Degree-Two · Correction 001

Status: **PRE-WITNESS CORRECTION / NO THEOREM PROMOTION**

Parent preregistration:

```text
56abc629d0f795347159689000c0646d0eb804ef
```

First implementation:

```text
c7e1c89b07008b56a521a533dda3a6b22b59dbf1
```

## Defect caught before witness

The first implementation attempted to evaluate inherited `primitiveIntegralCocycle` on the full fraction-group fiber `N=Z^2`, including `o=(0,0,1)`.

The inherited explicit cochain is authored on reachable bar-monoid coordinates. At `t=0`, reachable bar coordinates require `O=0`; therefore `o` is outside that literal cochain domain.

JavaScript `mod2(null)` would coerce `null` numerically and could falsely report a zero restriction. That is prohibited.

Preserved scar:

```text
OUT_OF_DOMAIN_COCHAIN_EVALUATION
!=
ZERO_COCHAIN_VALUE.
```

## Correction scope

Remove from the chamber:

```text
kappa_bar|_N=0 as a literal cochain restriction
[v][kappa_bar]=Omega
[u][beta]=[v][kappa_bar]
```

unless a future chamber separately extends/certifies the parent cochain on the fraction group.

Retain, unchanged:

```text
H^1(G;F2)=F2<u,v>
u^2=v^2=uv=0
H^2(G;F2)=F2<kappa_bar,beta> by UCT + inherited pairings
beta is not in the integral-reduction image
Dec^2=0
both H^2 basis classes are indecomposable
at least two essential degree-two algebra generators are required
H^3(G;F2)=F2 by LHS
beta|_N is the nonzero fiber H^2 class (beta is independently defined on the finite quotient of G)
[u][beta]=Omega !=0 by multiplicative LHS
```

The central classification is unchanged:

```text
THE_MOD_TWO_COHOMOLOGY_ALGEBRA_IS_NOT_GENERATED_IN_DEGREE_ONE_AND_REQUIRES_TWO_ESSENTIAL_DEGREE_TWO_GENERATORS.
```

No witness has been attempted.

𝌋‌⟐
