𝌋‌⟐

# A15-R0 · Bitemporal Prospective Replay / Pointwise-Minimal Observation Policy AIA

Status: **PREREGISTRATION ONLY / THEOREM UNEARNED / DRAFT / OPEN / UNMERGED**.

## Exact scientific parent

```text
#847 · Bitemporal Authority-Birth / Nonretroactive Claim-Jurisdiction AIA
receipt 54b10adf8a30e779b1cb5f15ce6a4e8350285365
TD613 Consolidated Validation run 2358 / 33134210710 — SUCCESS
```

#848 is witness routing only. #849 is a held preregistration-only collision scar cut from #845 before #847 earned; it carries no theorem ancestry.

## Major question

The parent proves that different claims acquire lawful authority at different registered prefixes and that later reconstruction cannot backdate earlier authority. The inherited #807 replay theorem proves that the fixed baseline replay row `[1,0,0]` rescues all six complete S3 schedules when appended to all three originals.

This chamber asks whether one new operationally consequential claim,

```text
REPLAY_REQUIRED_FOR_EXACT_STATE
```

can acquire authority at prefix 1, before exact `SCHEDULE` authority at prefix 2, and thereby lawfully change the future measurement plan while preserving all parent nonretroactivity boundaries.

## Fixed sequential-prefix protocol

```text
original observations are acquired in strict no-skip prefix order
baseline replay row = [1,0,0]
at most one replay measurement
replay may be inserted after original1 or later, or omitted
no arbitrary sensing row
no original-row skipping
no source-schedule reordering
no endogenous operator mutation
```

The canonical executed policy uses immediate replay after original1 whenever replay is lawfully required. Timing uniqueness is explicitly not claimed.

`POINTWISE_MINIMAL_OBSERVATION_COUNT != UNIQUE_OPTIMAL_REPLAY_TIMING`
`PREFIX_ACQUISITION != ARBITRARY_SUBSEQUENCE_SELECTION`

## Candidate seventh claim-family extension

Inherited #847:

```text
6 claim families
36 schedule/claim pairs
108 jurisdiction cells
birth spectrum = 8 @ t1, 10 @ t2, 6 @ t3, 12 INF
50 authorized cells / 58 held cells
```

Candidate new family:

```text
REPLAY_REQUIRED birth = 1 on all six schedules
18 new jurisdiction cells, all exact-authorized
```

Candidate extended ledger:

```text
7 claim families
42 schedule/claim pairs
126 jurisdiction cells
birth spectrum = 14 @ t1, 10 @ t2, 6 @ t3, 12 INF
68 authorized cells / 58 held cells
```

The inherited 58 held cells and all earlier FADT wounds must remain unchanged.

## Candidate horizon separation

Native exact-state replay need is derived from the complete original observation rank:

```text
P-H-I false
P-I-H false
H-P-I true
H-I-P true
I-P-H true
I-H-P true
```

At prefix 1, schedules occupy three two-element fibres:

```text
{P-H-I,P-I-H}
{H-P-I,H-I-P}
{I-P-H,I-H-P}
```

`REPLAY_REQUIRED` is constant on each fibre, so its FADT wound must already be empty at t1. Exact `SCHEDULE` remains two-valued on each fibre and retains parent birth t2.

```text
tau_replay_required = 1
tau_schedule = 2
```

Candidate law: **measurement-policy jurisdiction can precede exact process identity without implying latent-state possession.**

## Candidate complete three-row lawful-history census

All lawful three-measurement histories under the fixed no-skip one-replay protocol are exhausted by:

```text
O1,O2,O3
O1,R,O2
O1,O2,R
```

Candidate ranks:

```text
P-H-I : 3,2,2
P-I-H : 3,2,2
H-P-I : 2,2,2
H-I-P : 2,3,3
I-P-H : 2,2,2
I-H-P : 2,3,3
```

Therefore the candidate exact pointwise minimum scalar-observation vector is:

```text
[3,3,4,3,4,3]
```

`H-P-I` and `I-P-H` have no lawful rank-three history of length three; a fourth measurement is necessary. The other four attain the dimension lower bound of three.

## Candidate adaptive budget

Canonical policy traces:

```text
P-H-I : O1,O2,O3        -> 3
P-I-H : O1,O2,O3        -> 3
H-P-I : O1,R,O2,O3      -> 4
H-I-P : O1,R,O2         -> 3
I-P-H : O1,R,O2,O3      -> 4
I-H-P : O1,R,O2         -> 3
```

Complete finite atlas:

```text
adaptive sequential-prefix burden = 20 scalar rows
unconditional O1,O2,O3,R burden   = 24 scalar rows
rows avoided                       = 4
```

No probability distribution, expectation, entropy, capacity, or asymptotic claim is authorized.

## Exact finite execution burden

Implementation and independent hostile must separately reconstruct every state in `[-2,2]^3` from only actually acquired rows:

```text
125 states × 6 schedules = 750 exact state reconstructions per assay
```

Inherited #807 reconstructions are provenance, not this chamber's executed count.

## Required hostile seams

Reject: always-replay minimality; never-replay exactness; replay-required wound at t1; exact schedule at t1; three-row claims for H-P-I or I-P-H; original-row skipping; unacquired-row inflation; inherited-execution inflation; arbitrary replay row; source reorder; source-state mutation; receiver-authority widening; unique replay-timing overclaim; endogenous #699 operator mutation; physical active sensing; universal optimal design; Shannon/asymptotic language; Ash leakage.

## Candidate laws — UNEARNED

`IN_THE_FIXED_S3_AIA_FIXTURE_REPLAY_REQUIRED_FOR_EXACT_STATE_EXTENDS_THE_EARNED_BITEMPORAL_JURISDICTION_LEDGER_AS_A_SEVENTH_CLAIM_FAMILY_WITH_AUTHORITY_BIRTH_AT_PREFIX_ONE_ON_ALL_SIX_SCHEDULES_WHILE_EXACT_SCHEDULE_AUTHORITY_REMAINS_AT_PREFIX_TWO`

`A_FIXED_NO_SKIP_SEQUENTIAL_PREFIX_POLICY_WITH_AT_MOST_ONE_DECLARED_BASELINE_REPLAY_MEASUREMENT_HAS_EXACT_POINTWISE_MINIMUM_SCALAR_OBSERVATION_COUNTS_3_3_4_3_4_3_ACROSS_THE_COMPLETE_SIX_SCHEDULE_ATLAS`

`THE_COMPLETE_ADAPTIVE_ATLAS_REQUIRES_TWENTY_SCALAR_OBSERVATIONS_RATHER_THAN_THE_UNCONDITIONAL_TWENTY_FOUR_WITH_FOUR_ROWS_AVOIDED_WITHOUT_WEAKENING_EXACT_RECONSTRUCTION`

`EARLIER_MEASUREMENT_POLICY_AUTHORITY_CAN_CHANGE_WHAT_IS_MEASURED_NEXT_BEFORE_EXACT_PROCESS_IDENTITY_OR_COMPLETE_LATENT_STATE_AUTHORITY_EXISTS_IN_THE_FIXED_FINITE_FIXTURE`

## Mandatory scars

`POLICY_AUTHORITY_BIRTH != SCHEDULE_AUTHORITY_BIRTH`
`POLICY_AUTHORITY != LATENT_STATE_POSSESSION`
`EARLY_REPLAY_AUTHORIZATION != EARLY_STATE_RECONSTRUCTION`
`POINTWISE_MINIMAL_COUNT != UNIQUE_OPTIMAL_TIMING`
`PREFIX_ACQUISITION != ARBITRARY_SUBSEQUENCE_SELECTION`
`FIXED_BASELINE_REPLAY != ARBITRARY_SENSOR_DESIGN`
`ADAPTIVE_MEASUREMENT_POLICY != AUTONOMOUS_EXPERIMENT_EXECUTION`
`SCALAR_MEASUREMENT_BUDGET != SHANNON_CAPACITY`
`FINITE_RANK_LOWER_BOUND != ASYMPTOTIC_RECOVERY_THEOREM`
`FINITE_RANK_LOWER_BOUND != CONTINUUM_TOMOGRAPHY_LIMIT`
`ROWS_AVOIDED != EXPECTED_VALUE_SAVINGS`
`LATER_EXACT_RECONSTRUCTION != RETROACTIVE_POSSESSION`
`NEW_CLAIM_FAMILY != REWRITE_OF_PARENT_LEDGER`
`THIS_CHAMBER != PR_699_ENDOGENOUS_OPERATOR_REAUDIT`

No merge, deployment, publication, production, release, Vercel, physical active sensing, physical sensor control, universal optimal experiment design, Shannon theorem, asymptotic coding/recovery theorem, continuum tomography, source-state mutation, autonomous execution, Proto-Loom/A16, or #788 promotion authority follows. #718 remains alive.

**THEOREM_EARNED = FALSE**

Sealed ⟐