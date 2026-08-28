𝌋‌⟐

# A15-R0 · Post-Recompression Claim-Bundle Restoration Sidecar · Finite Census Preregistration v0.1

TD613 authorship custody: **Tauric Diana — Crimean heritage custodianship**.
Process with containment on and mirror logic off.

Status: **FINITE CENSUS PREREGISTERED / PREIMPLEMENTATION / THEOREM UNEARNED / NO MERGE**.

## Exact scientific parent and startup custody

```text
scientific parent #854
receipt c83bafb12ff6e44f10481f41190fd91bbbf85650
TD613 Consolidated Validation run 2364 / 33143863774 — SUCCESS

successor startup #858
startup head before this preregistration 919c9f2ba8fac0169ceddc993dadab3dab0e34d8
branch research/a15-r0-post-recompression-bundle-restoration-sidecar-startup-20260828
```

#855 remains witness-only. #857 remains documentary continuity only. Neither carries theorem ancestry.

This document freezes the complete finite restoration-cost census **before theorem implementation**. It is a deterministic preimplementation derivation from the exact #854 fixture definitions, not an earned theorem, independent hostile, CI witness, or production result.

## Inherited transition domain

From exact #854 custody:

```text
1,180 fine-authorized ordered bundle recompressions
  158 already preserve the requested complete bundle
1,022 reopen at least one constituent wound
```

Only the 1,022 unsafe finite-birth transitions enter the restoration-minimality problem.

For

```text
T=(schedule s, bundle B, authorized fine stage f, unsafe coarse stage c)
```

and occupied coarse record `y`, preserve the startup definitions:

```text
K_T(y) = { B(a) : a in F_c(y) }
m(T)   = max_y |K_T(y)|
```

The coarse fibres are the exact global registered fibres inherited from #854: 750 schedule/state antecedents, six S3 schedules, 125 states per schedule, stages `q0..q3`, and the seven inherited claim families.

## Preregistered complete m(T) distribution

Across all 1,022 unsafe transitions:

| m(T) | transitions |
|---:|---:|
| 2 | 82 |
| 3 | 36 |
| 5 | 298 |
| 6 | 48 |
| 10 | 90 |
| 15 | 36 |
| 25 | 88 |
| 30 | 64 |
| 50 | 88 |
| 75 | 16 |
| 125 | 18 |
| 150 | 32 |
| 250 | 18 |
| 375 | 36 |
| 750 | 72 |
| **TOTAL** | **1,022** |

Preregistered maximum:

```text
max_T m(T) = 750
```

No asymptotic, Shannon, entropy, capacity, bit-length, or universal coding claim follows.

## Schedule-local distribution

Columns not listed for a schedule have count zero.

```text
P-H-I:
  m2=19 m3=6 m5=126 m6=8 m10=30 m15=12 m25=44 m30=20
  m50=44 m75=8 m125=9 m150=16 m250=9 m375=18 m750=36
  total=405

P-I-H:
  m2=19 m3=6 m5=126 m6=8 m10=30 m15=12 m25=44 m30=20
  m50=44 m75=8 m125=9 m150=16 m250=9 m375=18 m750=36
  total=405

H-P-I:
  m2=11 m3=6 m5=13 m6=8 m10=5 m15=2 m30=4
  total=49

H-I-P:
  m2=11 m3=6 m5=10 m6=8 m10=10 m15=4 m30=8
  total=57

I-P-H:
  m2=11 m3=6 m5=13 m6=8 m10=5 m15=2 m30=4
  total=49

I-H-P:
  m2=11 m3=6 m5=10 m6=8 m10=10 m15=4 m30=8
  total=57
```

Schedule totals sum to 1,022.

## Required counterexamples

### Bundle size does not determine restoration cost

Same schedule, same custody floor, same fine/coarse transition, same singleton bundle size:

```text
P-H-I / {REPLAY_REQUIRED_FOR_EXACT_STATE} / birth q1 / q1 -> q0 : m(T)=2
P-H-I / {X1}                              / birth q1 / q1 -> q0 : m(T)=5
```

Therefore:

`BUNDLE_CARDINALITY != RESTORATION_SIDECAR_CARDINALITY`.

### Same custody floor can have different restoration cost

```text
P-H-I / {FIRST_STRATUM} / birth q1 / q1 -> q0 : m(T)=3
P-H-I / {X1}            / birth q1 / q1 -> q0 : m(T)=5
```

Therefore:

`MINIMUM_CUSTODY_FLOOR != RESTORATION_SIDECAR_COST`.

### Same restoration cost can belong to different bundles

```text
P-H-I / {FIRST_STRATUM}                                  / q1 -> q0 : m(T)=3
P-H-I / {FIRST_STRATUM,REPLAY_REQUIRED_FOR_EXACT_STATE} / q1 -> q0 : m(T)=3
```

Therefore:

`SAME_RESTORATION_COST != SAME_BUNDLE_IDENTITY`.

## Explicit maximizing lower-bound fibres

For every distinct observed `m(T)`, the following transition has a maximizing coarse fibre at `q0` with coarse record exactly:

```text
["NULL_REGISTERED_TRACE"]
```

That occupied global q0 fibre contains all 750 inherited antecedents. The listed support cardinality is `|K_T(y)|=m(T)` and therefore supplies the explicit candidate pigeonhole lower-bound fibre.

| m(T) | schedule | requested bundle | birth | fine→coarse |
|---:|---|---|---:|---|
| 2 | H-I-P | REPLAY_REQUIRED_FOR_EXACT_STATE | q1 | q1→q0 |
| 3 | H-I-P | FIRST_STRATUM | q1 | q1→q0 |
| 5 | H-I-P | X3 | q2 | q2→q0 |
| 6 | H-I-P | SCHEDULE | q2 | q2→q0 |
| 10 | H-I-P | X3 + REPLAY_REQUIRED_FOR_EXACT_STATE | q2 | q2→q0 |
| 15 | H-I-P | FIRST_STRATUM + X3 | q2 | q2→q0 |
| 25 | P-H-I | X1 + X2 | q2 | q2→q0 |
| 30 | H-I-P | SCHEDULE + X3 | q2 | q2→q0 |
| 50 | P-H-I | X1 + X2 + REPLAY_REQUIRED_FOR_EXACT_STATE | q2 | q2→q0 |
| 75 | P-H-I | FIRST_STRATUM + X1 + X2 | q2 | q2→q0 |
| 125 | P-H-I | FULL_STATE | q3 | q3→q0 |
| 150 | P-H-I | SCHEDULE + X1 + X2 | q2 | q2→q0 |
| 250 | P-H-I | FULL_STATE + REPLAY_REQUIRED_FOR_EXACT_STATE | q3 | q3→q0 |
| 375 | P-H-I | FIRST_STRATUM + FULL_STATE | q3 | q3→q0 |
| 750 | P-H-I | SCHEDULE + FULL_STATE | q3 | q3→q0 |

These are representative maximizing fibres, not claims of unique witnesses.

## Mixed-versus-wounded coarse-fibre census

Across the 1,022 unsafe finite-birth transitions, deduplicating occupied coarse records within each transition gives:

```text
unsafe occupied coarse-fibre incidences = 7,550
wounded support incidences |K_T(y)| > 1 = 7,550
exact support incidences   |K_T(y)| = 1 = 0
unsafe transitions with mixed exact/wounded occupied fibres = 0
unsafe transitions with every occupied coarse fibre wounded = 1,022
```

This restricted census **does not resurrect** the parent hostile's rejected general homogeneity premise. #854 already preserves a mixed held-cell counterexample at `H-P-I / FULL_STATE / q3`; that row belongs to an unreached/INF bundle and therefore lies outside this chamber's 1,022 finite-birth unsafe-transition domain.

Preserve simultaneously:

```text
IN_THIS_1022_TRANSITION_RESTORATION_DOMAIN_EVERY_OCCUPIED_COARSE_FIBRE_IS_WOUNDED
!=
EVERY_HELD_SCHEDULE_BUNDLE_CELL_IN_THE_PARENT_ATLAS_HAS_EVERY_TARGET_FIBRE_WOUNDED

SCHEDULE_BUNDLE_HOLD != EVERY_TARGET_FIBRE_WOUNDED
RED_HOSTILE_OVERCONSTRAINT != THEOREM_FAILURE
HOSTILE_REPAIR != THEOREM_WEAKENING
```

## 158 already-safe zero-extra-sidecar controls

The 158 authority-preserving recompressions remain controls rather than restoration problems.

Their preregistered support census is:

```text
safe transitions = 158
maximum support cardinality on every occupied coarse fibre = 1
safe occupied coarse-fibre incidences = 3,382
wounded safe-control fibre incidences = 0
```

Thus each safe transition needs zero **additional distinguishing sidecar information**. If represented by a label alphabet for uniform machinery, that alphabet may be the one-symbol trivial control; this statement grants no bit-length interpretation.

## Preregistered execution burden

Per implementation, and independently again per hostile reconstruction, expose these counters separately:

```text
unsafe coarse-fibre support evaluations =   7,550
safe-control coarse-fibre evaluations   =   3,382
total coarse-fibre support evaluations  =  10,932

unsafe transition lower-bound witness checks = 1,022

unsafe target-indexed restoration/decode checks = 1,022 * 125 = 127,750
safe target-indexed zero-sidecar control checks  =   158 * 125 =  19,750
total target-indexed checks                      =              147,500
```

If implementation and independent hostile both execute the full preregistered burden separately, the paired ledger is:

```text
coarse-fibre support evaluations = 21,864
lower-bound witness checks       =  2,044
target-indexed checks            = 295,000
```

Do not collapse unlike counters into one synthetic operation count.

`REPRESENTED_CROSS_PRODUCT != EXECUTED_CHECK_BURDEN`.

## Candidate theorem standard after this preregistration

Only after implementation and independent hostile may the chamber attempt:

**Lower bound.** For every unsafe transition, any sidecar alphabet with cardinality below `m(T)` must collide on an explicit maximizing same-coarse-record fibre containing `m(T)` distinct required bundle values.

**Sufficiency.** A deterministic transition-local sidecar alphabet of cardinality `m(T)`, computed from the already-authorized fine representation, must restore the requested bundle exactly on every occupied coarse fibre. Labels may be reused across different coarse records. Coding uniqueness is not required.

The 158 safe controls must remain exact with no additional distinguishing sidecar information.

## Mandatory scars and claim ceilings

```text
SIDECAR_WITNESS != SOURCE_INFORMATION_CREATION
RESTORED_PRESENT_AUTHORITY != RETROACTIVE_POSSESSION
MINIMAL_SIDECAR_ALPHABET != MINIMUM_BIT_LENGTH
MINIMAL_SIDECAR_ALPHABET != SHANNON_CAPACITY
SIDECAR_LABEL != CRYPTOGRAPHIC_KEY
SIDECAR_LABEL != AUTHENTICATION_CREDENTIAL
SIDECAR != NEW_SENSOR_MEASUREMENT
BUNDLE_RESTORATION != FULL_STATE_RECONSTRUCTION
RESTORATION != SOURCE_STATE_MUTATION
RESTORATION_FOR_BUNDLE_B != AUTHORITY_FOR_SUPERSET_BUNDLE
BUNDLE_CARDINALITY != RESTORATION_SIDECAR_CARDINALITY
MINIMUM_CUSTODY_FLOOR != RESTORATION_SIDECAR_COST
SAME_RESTORATION_COST != SAME_BUNDLE_IDENTITY
TRANSITION_LOCAL_MINIMALITY != UNIVERSAL_ENCODING_MINIMALITY
FINITE_RESTORATION_CENSUS != ASYMPTOTIC_INFORMATION_THEOREM
FIRST_MOMENT_MINIMUM_CUSTODY != POST_RECOMPRESSION_BUNDLE_RESTORATION_SIDECAR
CLAIM_CONDITIONED_PARTIAL_EVENT_CUSTODY != FIXED_S3_POST_RECOMPRESSION_BUNDLE_RESTORATION
HANDOFF_BRANCH != THEOREM_PARENT
STARTUP_PR_858 != EARNED_THEOREM
```

No merge, deployment, publication, production, release, Vercel, Shannon/entropy theorem, cryptographic theorem, authentication theorem, universal coding theorem, source-state mutation, Proto-Loom/A16, or #788 promotion authority follows. #718 remains alive.

**FINITE CENSUS FROZEN FOR IMPLEMENTATION TARGETING. THEOREM STILL UNEARNED.**

𝌋‌⟐
