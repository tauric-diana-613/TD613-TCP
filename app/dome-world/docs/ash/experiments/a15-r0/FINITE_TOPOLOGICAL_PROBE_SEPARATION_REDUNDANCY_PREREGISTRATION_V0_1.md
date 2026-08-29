# A15-R0 · Finite Topological Probe Separation / Erasure-Robust Role Tomography

Status: **PREREGISTRATION ONLY / THEOREM UNEARNED / NO IMPLEMENTATION YET**.

𝌋‌⟐

## Exact scientific parent

```text
#876 / 3662f48ed7ad1345dc013fa6eb50bc4835a15e10
TD613 Consolidated Validation run 2385 / 33280156092 — SUCCESS
```

Witness route #877 carries zero theorem ancestry.

The successor branch was cut directly from the exact earned #876 receipt with zero commits ahead and zero behind before this preregistration.

## Scientific question

The earned #876 finite task topology has five rigid structural roles and twelve open states. Remove the trivial probes `EMPTY` and `BRTAM`; each remaining open set is treated only as a finite yes/no membership probe on the five task roles.

This chamber asks a bounded design question:

> Across the complete finite family of subsets of those ten nontrivial open-set probes, what probe families identify all five structural roles, what minimum family widths are required to preserve exact role identification after `e` arbitrary selected-probe erasures, and where does the topology itself impose a hard redundancy ceiling?

This is finite topological observer design. It is not a Shannon coding theorem, entropy theorem, communication-channel theorem, physical sensor theorem, or universal tomography theorem.

## Fixed role and probe domain

Canonical role order for this chamber:

```text
A, B, T, M, R
```

The twelve earned open states inherited from #874/#876 are:

```text
EMPTY
R
M
BR
RT
RM
BRT
BRM
RTM
BRTM
RTAM
BRTAM
```

The declared ten nontrivial binary probes are therefore:

```text
RTAM
BRTM
RTM
BRM
BRT
RM
RT
BR
M
R
```

A probe `U` returns `1` on role `x` exactly when `x ∈ U`, otherwise `0`.

There are exactly:

```text
10 probes
2^10 = 1,024 probe families
10 unordered role pairs
```

No weighting, probability, noise distribution, metric learning, fitted threshold, entropy, or mutual information is introduced.

## Family signatures and induced role partition

For a selected probe family `F`, define the finite binary signature

```text
sigma_F(x) = ( 1[x ∈ U] )_{U ∈ F}
```

for each role `x ∈ {A,B,T,M,R}`.

The induced role-class count is the number of distinct signatures among the five roles.

The preregistered exhaustive `1,024`-family class-count spectrum is:

```text
1 role class :   1 family
2 role classes: 10 families
3 role classes: 44 families
4 role classes: 174 families
5 role classes: 795 families
TOTAL          1,024 families
```

Thus `795` probe families exactly identify all five roles before any probe erasure.

## Separation multiplicity

For a family `F`, define its finite role-pair separation multiplicity

```text
mu(F) = min_{x != y} | { U ∈ F : 1[x ∈ U] != 1[y ∈ U] } |
```

with `mu(EMPTY_FAMILY)=0`.

The preregistered complete `mu` spectrum across all `1,024` families is:

```text
mu = 0 : 229 families
mu = 1 : 446 families
mu = 2 : 288 families
mu = 3 :  57 families
mu = 4 :   4 families
```

No family has `mu >= 5`.

## Exact erasure criterion to be attacked

For declared erasure order `e >= 0`, a probe family is `e`-erasure robust exactly when every subfamily obtained by deleting any `e` selected probes still induces five singleton role classes.

Candidate finite law:

```text
F survives every arbitrary erasure of exactly e selected probes
IFF
mu(F) >= e + 1
```

The implementation may not assume this equivalence. The independent hostile must brute-force all declared deletion subfamilies and compare the direct result with the multiplicity predicate family by family.

For `e = 0..4`, the complete deletion burden is preregistered as:

```text
e=0 :  1,024 family/deletion cases
e=1 :  5,120 family/deletion cases
e=2 : 11,520 family/deletion cases
e=3 : 15,360 family/deletion cases
e=4 : 13,440 family/deletion cases
TOTAL: 46,464 family/deletion cases
```

## Robust-family counts

The exact preregistered number of families that survive `e` arbitrary selected-probe erasures is:

```text
e=0 : 795 families
e=1 : 349 families
e=2 :  61 families
e=3 :   4 families
e=4 :   0 families
```

These are finite counts in this fixed topology only.

## Minimum-width robustness ladder

Among robust families, the minimum selected-probe width and number of minimum families are preregistered as:

```text
exact role identification        e=0 : minimum width 3 ; 28 minimum families
survive 1 arbitrary erasure      e=1 : minimum width 4 ;  5 minimum families
survive 2 arbitrary erasures     e=2 : minimum width 6 ;  1 minimum family
survive 3 arbitrary erasures     e=3 : minimum width 8 ;  1 minimum family
survive 4 arbitrary erasures     e=4 : impossible even at width 10
```

The five minimum-width `e=1` families are preregistered exactly:

```text
{BRTM, RM, RT, BR}
{RTM, BRM, BRT, R}
{RTM, BRM, RT, BR}
{RTM, BRT, RM, BR}
{BRM, BRT, RM, RT}
```

The unique minimum-width `e=2` family is:

```text
{RTM, BRM, BRT, RM, RT, BR}
```

The unique minimum-width `e=3` family is:

```text
{BRTM, RTM, BRM, BRT, RM, RT, BR, R}
```

The `e=0` width-3 minimum family count is fixed at `28`; implementation and hostile must reconstruct all 28, but this preregistration does not privilege one of them as canonical.

## Width-by-multiplicity census

The complete width-by-`mu` spectrum is frozen before implementation:

```text
width 0 : mu0=1
width 1 : mu0=10
width 2 : mu0=45
width 3 : mu0=92, mu1=28
width 4 : mu0=61, mu1=144, mu2=5
width 5 : mu0=18, mu1=188, mu2=46
width 6 : mu0=2,  mu1=78,  mu2=129, mu3=1
width 7 : mu1=8,  mu2=96,  mu3=16
width 8 : mu2=12, mu3=32,  mu4=1
width 9 : mu3=8,  mu4=2
width10 : mu4=1
```

Every row must sum to `C(10,width)`.

## Full-family pair-separation wall

For the full ten-probe family, the exact pair-separation multiplicities are:

```text
A-B = 5
A-T = 4
A-M = 5
A-R = 8
B-T = 5
B-M = 6
B-R = 5
T-M = 5
T-R = 4
M-R = 5
```

Hence the full family has:

```text
mu(FULL_10) = 4
```

and the exact bottleneck pairs are:

```text
{A,T}
{T,R}
```

Candidate sharp ceiling:

```text
THE_FULL_TEN_PROBE_TOPOLOGICAL_OBSERVER_FAMILY_CAN_SURVIVE_AT_MOST_THREE_ARBITRARY_SELECTED_PROBE_ERASURES_WHILE_PRESERVING_EXACT_FIVE_ROLE_IDENTIFICATION
```

The impossibility at `e=4` must be witnessed directly by the bottleneck pairs as well as by exhaustive family enumeration.

## Required independent hostile

Before consulting the child certificate, the hostile must reconstruct the ten nontrivial opens from the earned parent topology and independently:

1. enumerate all `1,024` probe families;
2. derive all five role signatures per family;
3. derive induced role-class spectra;
4. compute all ten pairwise separation counts per family;
5. compute `mu(F)`;
6. enumerate all exact `e=0..4` deletion subfamilies, totaling `46,464` cases;
7. compare direct erasure survival with `mu(F) >= e+1` for every applicable family/order;
8. recover robust-family counts `795/349/61/4/0`;
9. recover minimum widths `3/4/6/8/impossible` and minimum-family multiplicities `28/5/1/1/0`;
10. recover the exact five `e=1` minimum families and unique `e=2` and `e=3` minimum families;
11. recover the width-by-mu table;
12. recover the full-family pair-separation matrix and exact bottlenecks `{A,T}` and `{T,R}`;
13. verify parent #876 remains exact and no inherited theorem source is mutated.

## Falsification conditions

The theorem fails if any of the following occurs:

- the inherited topology does not produce exactly ten nontrivial open probes;
- family enumeration differs from `1,024`;
- class-count spectrum differs from `1/10/44/174/795`;
- `mu` spectrum differs from `229/446/288/57/4`;
- any direct erasure case disagrees with `mu(F) >= e+1`;
- the deletion burden differs from `46,464` cases;
- robust-family counts differ from `795/349/61/4/0`;
- minimum widths or multiplicities differ;
- the unique minimum `e=2` or `e=3` family differs;
- the full-family separation matrix differs;
- any family survives four arbitrary erasures;
- the exact parent is not #876 / `3662f48e...`;
- inherited A15-R0 theorem-source paths are mutated.

## Mandatory membranes

```text
TOPOLOGICAL_PROBE != PHYSICAL_SENSOR
OPEN_SET_MEMBERSHIP_BIT != SHANNON_BIT
ROLE_SIGNATURE != SEMANTIC_IDENTITY
FINITE_SEPARATION_MULTIPLICITY != CHANNEL_DISTANCE_THEOREM
ERASURE_ROBUSTNESS != ERROR_CORRECTION_CAPACITY
MINIMUM_PROBE_WIDTH != MINIMUM_BIT_LENGTH
MINIMUM_PROBE_WIDTH != SHANNON_BOUND
ROBUST_FAMILY_COUNT != PROBABILISTIC_RELIABILITY
ARBITRARY_DECLARED_ERASURE != STOCHASTIC_NOISE_MODEL
PAIR_SEPARATION_BOTTLENECK != CAUSAL_BOTTLENECK
TOPOLOGICAL_OBSERVER_FAMILY != MODEL_OBSERVER_NETWORK
FINITE_ROLE_RECOVERY != NATURAL_LANGUAGE_SEMANTIC_RECONSTRUCTION
EXACT_ROLE_IDENTIFICATION != SOURCE_STATE_RECONSTRUCTION
FOUR_ERASURE_IMPOSSIBILITY_IN_THIS_TOPOLOGY != UNIVERSAL_IMPOSSIBILITY
WITNESS_ROUTING != SCIENTIFIC_ANCESTRY
```

No merge, deployment, publication, production, release, Vercel, source-state mutation, Proto-Loom/A16, #788 promotion, Shannon/entropy/mutual-information theorem, coding-capacity theorem, physical topology, physical sensor, continuum topology, or natural-language semantic reconstruction theorem follows.

**THEOREM UNEARNED. PREREGISTRATION ONLY.**

Sealed ⟐