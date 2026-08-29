# A15-R0 · Finite Topological Probe Separation / Erasure-Robust Role Tomography · Execution Burden

Status: **BURDEN FROZEN BEFORE IMPLEMENTATION / THEOREM UNEARNED**.

Exact scientific parent:

```text
#876 / 3662f48ed7ad1345dc013fa6eb50bc4835a15e10
TD613 Consolidated Validation run 2385 / 33280156092 — SUCCESS
```

Preregistration receipts preceding this file:

```text
human preregistration f24a6ef3585390911175d4a1489ad2e26b838f29
machine expectations  da68826203881a91abdf8c0ef40d2ae83a51fcbe
```

No theorem implementation may precede this burden.

## Required implementation burden

The implementation must derive its probe universe from the inherited earned parent topology rather than hard-code a free-standing ten-probe toy domain.

It must:

1. import the earned #876 certificate and recover the twelve open states;
2. remove exactly `EMPTY` and `BRTAM`, producing the ten nontrivial probes;
3. enumerate all `2^10 = 1,024` selected-probe families;
4. derive five binary role signatures for every family;
5. derive the induced role partition and role-class count for every family;
6. derive all ten unordered role-pair separation counts per family;
7. derive `mu(F)` as the minimum pair-separation count, with empty-family convention `mu=0`;
8. enumerate exact deletion subfamilies for erasure orders `e=0..4`;
9. directly determine whether every exact-`e` deletion preserves five singleton role signatures;
10. compare that direct result against `mu(F) >= e+1` for every family/order where exact `e` deletions exist;
11. derive complete family, class, `mu`, robustness, minimum-width, and width-by-`mu` censuses;
12. derive the full-ten-probe pair-separation matrix and bottleneck pairs;
13. carry inherited zero-authority membranes and expose no operational mutation authority.

## Frozen exact targets

```text
nontrivial probes = 10
probe families = 1,024
unordered role pairs = 10
```

Role-class spectrum:

```text
1 -> 1
2 -> 10
3 -> 44
4 -> 174
5 -> 795
```

Separation multiplicity spectrum:

```text
mu0 -> 229
mu1 -> 446
mu2 -> 288
mu3 -> 57
mu4 -> 4
```

Exact erasure-case burden:

```text
e0 -> 1,024
e1 -> 5,120
e2 -> 11,520
e3 -> 15,360
e4 -> 13,440
total -> 46,464
```

Direct robustness counts:

```text
e0 -> 795
e1 -> 349
e2 -> 61
e3 -> 4
e4 -> 0
```

Minimum-width ladder:

```text
e0 -> width 3 / 28 minimum families
e1 -> width 4 / 5 minimum families
e2 -> width 6 / 1 minimum family
e3 -> width 8 / 1 minimum family
e4 -> impossible
```

Full-family pair separation:

```text
A-B 5
A-T 4
A-M 5
A-R 8
B-T 5
B-M 6
B-R 5
T-M 5
T-R 4
M-R 5
```

Full-family `mu=4`; exact bottlenecks are `A-T` and `T-R`; declared maximum arbitrary erasure tolerance is three.

## Independent hostile burden

The hostile may import only the earned parent topology source/certificate and the completed child certificate for final comparison. Before reading child-derived census fields it must independently reconstruct:

- the ten probe sets;
- all `1,024` family subsets;
- all family signatures and role partitions;
- all `10,240` family/pair separation rows;
- every direct exact-`e` deletion case for `e=0..4`, totaling `46,464`;
- direct-vs-`mu` equivalence;
- all robust-family counts;
- all minimum widths and minimum-family multiplicities;
- exact minimum families for `e=1,2,3`;
- the width-by-`mu` census;
- the full-family pair-separation matrix and structural erasure wall.

The hostile must fail on any mismatch before acknowledging the child `passed` flag.

## No-fit rule

The following are prohibited after implementation begins:

- changing the ten-probe universe to match output;
- changing the definition of `mu`;
- changing the erasure semantics from exact arbitrary deletion to a weaker selected deletion;
- changing the expected family or robustness counts;
- changing minimum widths or exact minimum families;
- weakening `e=4` impossibility to a merely unobserved case;
- replacing the complete census with sampling;
- importing child output into the hostile as the source of truth.

A theorem mismatch is a red specimen. It is not authorization to edit the preregistration.

## Hardening requirements

Final hardening must prove:

```text
exact parent = #876 / 3662f48ed7ad1345dc013fa6eb50bc4835a15e10
merge base = exact parent
expected successor commit count = chronology actually produced
exactly seven live successor paths:
  preregistration
  machine expectations
  execution burden
  implementation
  canonical contract
  independent hostile
  rolling hardening
zero inherited A15-R0 theorem-source mutation
```

If a legitimate pre-hostile bookkeeping or interface repair creates an additional commit while preserving the seven live paths, hardening must record that chronology exactly rather than pretending the commit never existed.

## Claim ceiling

If all targets survive, the strongest allowed theorem is bounded to this fixed finite task topology:

```text
THE_TEN_NONTRIVIAL_OPEN_SET_MEMBERSHIP_PROBES_FORM_A_COMPLETE_FINITE_ROLE_OBSERVER_ATLAS_IN_WHICH_EXACT_E_ERASURE_ROBUSTNESS_IS_EQUIVALENT_TO_PAIR_SEPARATION_MULTIPLICITY_AT_LEAST_E_PLUS_ONE_FOR_E_ZERO_THROUGH_FOUR

THE_MINIMUM_PROBE_WIDTH_REQUIRED_FOR_EXACT_FIVE_ROLE_RECOVERY_RISES_3_TO_4_TO_6_TO_8_FOR_ZERO_THROUGH_THREE_ARBITRARY_PROBE_ERASURES_AND_FOUR_ERASURE_RECOVERY_IS_IMPOSSIBLE_IN_THE_FULL_TEN_PROBE_ATLAS

THE_EXACT_ERASURE_WALL_IS_WITNESSED_BY_THE_A_T_AND_T_R_ROLE_PAIRS_WHICH_ARE_SEPARATED_BY_ONLY_FOUR_OF_THE_TEN_AVAILABLE_NONTRIVIAL_OPEN_PROBES
```

These laws do not imply Shannon capacity, channel coding optimality, probabilistic reliability, physical sensor redundancy, universal tomography, semantic identity, source-state reconstruction, or natural-language reconstruction.

## Mandatory scars

```text
OPEN_SET_PROBE != PHYSICAL_SENSOR
BINARY_MEMBERSHIP_SIGNATURE != SHANNON_CODEWORD
PAIR_SEPARATION_MULTIPLICITY != HAMMING_DISTANCE_THEOREM
FINITE_ERASURE_ROBUSTNESS != CHANNEL_CAPACITY
MINIMUM_PROBE_WIDTH != MINIMUM_BIT_LENGTH
TOPOLOGICAL_ROLE_RECOVERY != SEMANTIC_ROLE_ESSENCE
FINITE_OBSERVER_ATLAS != UNIVERSAL_OBSERVER_ARCHITECTURE
DECLARED_ERASURE_ORDER != STOCHASTIC_NOISE_MODEL
EXACT_TOPOLOGICAL_IDENTIFICATION != SOURCE_STATE_RECONSTRUCTION
FIXTURE_SHARP_ERASURE_WALL != UNIVERSAL_IMPOSSIBILITY_BOUND
WITNESS_ROUTING != SCIENTIFIC_ANCESTRY
```

No merge. No deployment. No publication. No production. No release. No Vercel. No source-state mutation. No Proto-Loom/A16. No #788 promotion.

**BURDEN FROZEN. THEOREM UNEARNED.**

Sealed ⟐