𝌋‌⟐

# A15-R0 · Dromological Prospective Replay Policy / Pointwise-Minimal Observation Budget AIA

Status: **PREREGISTRATION ONLY / THEOREM UNEARNED / DRAFT / OPEN / UNMERGED**.

## Exact scientific parent

```text
#845 · Safe-Authority Closure / Orbit-Custody Correspondence AIA
receipt 8048a3986e2e583f59cc84500ec13caa49f0a52d
TD613 Consolidated Validation run 2357 / 33132594980 — SUCCESS
```

#846 is witness routing only and carries zero theorem ancestry.

## Inherited earned instruments used by this chamber

```text
#802 complete S3 schedule atlas / first-stratum gate
#804 schedule/state identifiability lag
#807 baseline replay rescue
#845 latest exact Western custody parent
```

No theorem in this chamber rewrites those results.

## Major question

The inherited replay theorem proves that the fixed baseline replay row

```text
b = [1,0,0]
```

rescues all six complete three-row schedules when appended after the original history. That protocol always materializes four scalar rows per schedule.

This chamber asks a different finite question:

> If the original S3 schedule order remains fixed, the baseline replay row remains fixed, and at most one replay measurement may be inserted or skipped, what is the exact pointwise-minimal scalar-observation count required for three-coordinate latent-state reconstruction?

The policy may observe original strata sequentially and may stop as soon as an exact unimodular rank-three observation set is available.

This is **not** unrestricted optimal experimental design. It does not choose arbitrary new sensing rows, mutate the observation operators, reorder the source schedule, or run #699's endogenous question-transition model.

## Preregistered two-prefix rank census

The chamber must independently rederive the original two-stratum prefix ranks:

```text
P-H-I : 2
P-I-H : 2
H-P-I : 1
H-I-P : 2
I-P-H : 1
I-H-P : 2
```

Thus four schedules have rank deficit `3-2 = 1` after two original strata, while two schedules have deficit `3-1 = 2`.

## Prospective replay-requirement authority at the first stratum

Define the schedule property:

```text
REPLAY_REQUIRED_FOR_EXACT_STATE = false  iff first stratum is P
REPLAY_REQUIRED_FOR_EXACT_STATE = true   iff first stratum is H or I
```

Under the first-stratum schedule quotient, the six schedules form three two-element fibres:

```text
{P-H-I, P-I-H}
{H-P-I, H-I-P}
{I-P-H, I-H-P}
```

The replay-required support is preregistered to be constant on every such fibre. Therefore its FADT wound is predicted to be empty after one registered stratum:

```text
Gamma_replay_requirement(t1) = empty
```

By contrast, exact schedule identity is not constant on any first-stratum fibre. With support `K_s={schedule_id}`:

```text
|Gamma_exact_schedule(t1)| = 2 on each first-stratum fibre
Gamma_exact_schedule(t2) = empty
```

Candidate horizon separation:

```text
tau_replay_policy = 1
tau_schedule_identity = 2
```

Hence this chamber tests whether **measurement-policy authority can descend before exact process identity** without implying latent-state knowledge.

## Preregistered sequential policy

After first original stratum:

```text
if first == P:
    skip baseline replay
    continue inherited originals until rank 3

if first == H or first == I:
    baseline replay is already authorized as required
    replay may be acquired immediately or deferred
    continue inherited originals until rank 3
```

For the canonical executed policy, the replay row is acquired immediately after the first H/I stratum.

Expected acquisition traces:

```text
P-H-I : original1, original2, original3                     -> 3 rows
P-I-H : original1, original2, original3                     -> 3 rows
H-P-I : original1, replay, original2, original3             -> 4 rows
H-I-P : original1, replay, original2                        -> 3 rows
I-P-H : original1, replay, original2, original3             -> 4 rows
I-H-P : original1, replay, original2                        -> 3 rows
```

Expected pointwise-minimal observation counts:

```text
[3,3,4,3,4,3]
```

Expected complete-atlas scalar-measurement burden:

```text
adaptive policy = 20
unconditional inherited 3-original-plus-replay protocol = 24
exact rows avoided across the six-schedule atlas = 4
```

No probability distribution is assumed. `20 < 24` is a complete finite census comparison, not an expected-value claim.

## Rank-deficit lower bound

Every exact reconstruction of a three-coordinate state from scalar linear observations requires observation rank 3.

Within this chamber's fixed policy class:

```text
- original source schedule order is fixed;
- at most one copy of the declared baseline replay row [1,0,0] may be added;
- no arbitrary replacement sensing row is authorized.
```

For the four rank-two prefix schedules, one additional independent scalar row can in principle close rank 3, so three total observations is the absolute lower bound and must be attained by the candidate policy.

For `H-P-I` and `I-P-H`, the first two original rows are identical. Therefore, after two originals plus at most one replay row, there are at most two independent rows:

```text
rank <= 2.
```

Exact state reconstruction in three scalar observations is therefore impossible for those two schedules inside the declared one-replay protocol. A fourth row is a strict lower bound and must be attained by the candidate policy.

Candidate pointwise optimality law:

```text
minimum_rows(schedule) = [3,3,4,3,4,3]
```

## Preregistered early-stop geometry

The independent assay must show:

```text
P-H-I original rows 1..3                         unimodular
P-I-H original rows 1..3                         unimodular
H-I-P {original1,replay,original2}               unimodular
I-H-P {original1,replay,original2}               unimodular
H-P-I {original1,replay,original2}               rank 2 only
I-P-H {original1,replay,original2}               rank 2 only
H-P-I {original1,replay,original2,original3}     contains a unimodular 3-row minor
I-P-H {original1,replay,original2,original3}     contains a unimodular 3-row minor
```

The policy must stop at the first acquired rank-three unimodular set and must not count unacquired third-original rows on the two early-stop mixed schedules.

## Exact state reconstruction burden

The implementation and hostile must independently reconstruct every state in

```text
[-2,2]^3
```

for every one of the six schedules using only the rows actually acquired by the adaptive policy.

Exact executed burden:

```text
125 states * 6 schedules = 750 state reconstructions
```

The inherited #807 750-state four-row reconstruction battery remains separate provenance and may not be silently added to this chamber's executed count.

## Required hostiles

At minimum fail closed on:

1. always-replay policy represented as pointwise minimal;
2. never-replay policy represented as exact on all six schedules;
3. replay-required support claimed nonconstant inside a first-stratum fibre;
4. exact schedule identity claimed at the first stratum;
5. `H-P-I` claimed reconstructible in three rows under one baseline replay;
6. `I-P-H` claimed reconstructible in three rows under one baseline replay;
7. all-six-three-row claim;
8. counting unacquired third originals on the two early-stop schedules as executed evidence;
9. counting the inherited #807 24-row baseline as this chamber's adaptive execution;
10. arbitrary new replay/sensing row introduced without preregistration;
11. source schedule reordering;
12. latent-state mutation;
13. receiver-authority widening;
14. schedule-identity backfill into t1;
15. replay-policy authority confused with latent-state authority;
16. #699 endogenous observation/operator mutation imported into this fixed-row theorem;
17. physical active-sensing / sensor-control / universal optimal-experiment claim;
18. Ash leakage of matrices, inverse coefficients, latent state, or schedule internals.

## Candidate laws — UNEARNED UNTIL GREEN

`IN_THE_FIXED_S3_AIA_FIXTURE_THE_EXACT_NEED_FOR_THE_DECLARED_BASELINE_REPLAY_PROBE_DESCENDS_AFTER_THE_FIRST_REGISTERED_STRATUM_BEFORE_EXACT_SCHEDULE_IDENTITY_DESCENDS_AFTER_TWO_STRATA`

`A_FIXED_SEQUENTIAL_POLICY_USING_THE_FIRST_STRATUM_GATE_AND_AT_MOST_ONE_DECLARED_BASELINE_REPLAY_MEASUREMENT_ACHIEVES_POINTWISE_MINIMAL_EXACT_STATE_RECONSTRUCTION_COUNTS_3_3_4_3_4_3_ACROSS_THE_COMPLETE_SIX_SCHEDULE_ATLAS`

`THE_COMPLETE_ATLAS_ADAPTIVE_SCALAR_OBSERVATION_BURDEN_IS_20_RATHER_THAN_THE_UNCONDITIONAL_FOUR_ROW_REPLAY_PROTOCOLS_24_WITH_FOUR_ROWS_AVOIDED_WITHOUT_WEAKENING_EXACT_RECONSTRUCTION`

`MEASUREMENT_POLICY_AUTHORITY_CAN_PRECEDE_EXACT_PROCESS_IDENTITY_WITHOUT_IMPLYING_LATENT_STATE_POSSESSION_IN_THE_FIXED_FINITE_FIXTURE`

`THE_TWO_RANK_ONE_SECOND_PREFIX_SCHEDULES_H_P_I_AND_I_P_H_HAVE_AN_IRREDUCIBLE_FOUR_SCALAR_OBSERVATION_LOWER_BOUND_INSIDE_THE_DECLARED_ONE_BASELINE_REPLAY_PROTOCOL`

## Mandatory scars

`POLICY_IDENTIFIABILITY != SCHEDULE_IDENTIFIABILITY`
`POLICY_IDENTIFIABILITY != LATENT_STATE_IDENTIFIABILITY`
`EARLY_REPLAY_AUTHORIZATION != EARLY_STATE_POSSESSION`
`FIRST_STRATUM_GATE != UNIVERSAL_CAUSAL_PRIORITY`
`POINTWISE_MINIMAL_IN_FIXED_ONE_REPLAY_PROTOCOL != UNIVERSAL_OPTIMAL_EXPERIMENT_DESIGN`
`FIXED_BASELINE_REPLAY != ARBITRARY_SENSOR_DESIGN`
`REPLAY_INSERTION != SOURCE_SCHEDULE_REORDERING`
`SCALAR_MEASUREMENT_BUDGET != SHANNON_CAPACITY`
`FINITE_RANK_LOWER_BOUND != CONTINUUM_TOMOGRAPHY_LIMIT`
`ADAPTIVE_POLICY != AUTONOMOUS_EXPERIMENT_EXECUTION`
`THIS_CHAMBER != PR_699_ENDOGENOUS_OPERATOR_REAUDIT`
`ROWS_AVOIDED != PROBABILISTIC_EXPECTED_SAVINGS`
`RECONSTRUCTIBLE_NOW != POSSESSED_EARLIER`

No merge, deployment, publication, production, release, Vercel, physical active sensing, physical sensor control, universal optimal design, Shannon theorem, continuum tomography, source-state mutation, arbitrary experiment execution, Proto-Loom/A16, or #788 promotion authority follows. #718 remains alive.

**THEOREM_EARNED = FALSE**

Sealed ⟐