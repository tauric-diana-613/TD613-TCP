𝌋‌⟐

󐘓 U+10D613

# A15-R0 · Dromological Baseline-Replay Rescue Aperture · STARTUP v0.1

Status: **PREREGISTERED STARTUP / NO IMPLEMENTATION / NO HOSTILE / NO WITNESS / NO THEOREM AUTHORITY**

## Exact earned parent

```text
#804 Dromological Schedule/State Identifiability Lag
a51afae88292878de2c02ca0a086ad1e88f73cfb
```

This branch begins exactly from #804's earned receipt and is intended as the clean workbench for future Amari in the next thread.

Do not rebase it onto the handoff/documentation PR.

## Motivation inherited from #804

Inside the fixed S3 fixture:

```text
tau_schedule = 2
```

while the two P-first schedules require

```text
tau_state = 3
```

and the four H/I-first schedules remain rank two after the complete three-step observation history.

Therefore exact process identity is available before exact latent-state identity.

The next question is not whether the earlier nonidentifiability was "wrong." It was exact at the original aperture.

The next question is:

```text
Can one later declared, provenance-preserving observation repair the missing state direction
without rewriting the earlier nonidentifiability certificate?
```

## Candidate replay observation

Declare one additional baseline replay row:

```text
c0 = [1,0,0]
```

and append it after the three registered schedule observations.

For each schedule, let

```text
O_aug(schedule) = [O_3(schedule); c0]
```

be the resulting `4 x 3` observation record.

This is a new fourth observation in the fixture. It is not an operational inverse route and does not retroactively exist in the earlier three-step record.

## Preregistered exact minor table

Zero-based augmented row indices are used; row `3` is the replay row.

Pre-startup exact arithmetic gives:

```text
schedule  selected rows  determinant
P-H-I     (0,1,2)        +1
P-I-H     (0,1,2)        -1
H-P-I     (0,2,3)        +1
H-I-P     (0,1,3)        +1
I-P-H     (0,2,3)        -1
I-H-P     (0,1,3)        -1
```

Thus every schedule appears to contain at least one unimodular `3 x 3` minor after the replay row is appended.

This table is a preregistered target only until independently rederived by the implementation and hostile assay.

## Candidate theorem target

If the exact minor table survives implementation and hostiles, the chamber may attempt to earn:

```text
THE_DECLARED_BASELINE_REPLAY_OBSERVATION_RESTORES_A_UNIMODULAR_INTEGER_TOMOGRAPHY_MINOR_FOR_ALL_SIX_DROMOLOGICAL_SCHEDULES_IN_THE_FIXED_S3_FIXTURE
```

and the stronger architectural classification:

```text
IDENTIFIABILITY_LOSS_CAN_BE_REPAIRED_BY_A_LATER_DECLARED_PROBE_WITHOUT_REWRITING_THE_EARLIER_NONIDENTIFIABILITY_CERTIFICATE
```

The four previously rank-two schedules must remain correctly described as nonidentifiable in their original three-step record. The replay creates a new four-step record; it does not falsify #800/#802/#804.

## Required implementation plan

Future Amari should:

1. import the witnessed #802 schedule atlas and #804 schedule/state-lag primitives;
2. define the replay row exactly as `[1,0,0]`;
3. construct all six `4 x 3` augmented matrices without hardcoding their rank verdicts;
4. enumerate all four choose three row subsets per schedule;
5. compute each `3 x 3` determinant exactly over integers;
6. identify at least one preregistered `+/-1` minor for each schedule;
7. derive an integer inverse from one selected unimodular minor per schedule;
8. exhaustively test all states in `[-2,2]^3` for every schedule after replay;
9. expected exact state/schedule reconstruction checks: `6 x 125 = 750`;
10. verify removing the replay row restores the witnessed four-schedule rank-two failure;
11. include a hostile replay row orthogonal to a witnessed missing direction and prove that rescue can fail;
12. preserve exact cupola custody and zero authority on every receiver projection.

## Suggested rescue inverse discipline

Do not expose a generic matrix inverse over floating point.

For each schedule, select one exact unimodular minor from the preregistered table and either:

```text
- derive an integer adjugate inverse; or
- author an explicit integer reconstruction formula and verify it against the selected minor.
```

A rescue formula must be schedule-indexed because #804 already established schedule identity before the rescue stage.

## Required AIA projection

Ash may receive only child-legible bounded truths such as:

```text
WE_KNOW_WHICH_ORDER_HAPPENED_BEFORE_THE_RESCUE
ONE_EXTRA_DECLARED_CHECK_CAN_RECOVER_THE_MISSING_CLUE_IN_THIS_FIXTURE
THE_EARLIER_MISSING_CLUE_WAS_REAL_AT_THE_EARLIER_STAGE
```

Ash must not receive:

```text
replay vector
selected minor indices
inverse formulas
latent coordinates
technical determinant table
```

Loom may receive the bounded rescue atlas and exact finite inverse formulas with zero runtime / production / physical authority.

## Mandatory hostiles

```text
original H/I-first three-step record declared invertible         REJECT
replay treated as retroactively present                          REJECT
replay treated as operational inverse route                      REJECT
one failed schedule ignored                                      REJECT
non-unimodular rank-three minor treated as exact Z inverse        REJECT
floating-point near-one determinant accepted as exact             REJECT
Ash receives rescue vector or inverse formula                     REJECT
replay widens receiver authority                                  REJECT
fixture rescue promoted to universal sensor design                REJECT
physical quasicrystal/moire/optical claim                         REJECT
continuum tomography claim                                        REJECT
live Ash/Loom/Proto-Loom authority                                REJECT
```

## Required scars

```text
RESCUE_PROBE != ORIGINAL_SCHEDULE_INVERTIBILITY
LATER_REMEASUREMENT != RETROACTIVE_INFORMATION_EXISTENCE
BASELINE_REPLAY != OPERATIONAL_INVERSE_ROUTE
UNIMODULAR_AUGMENTED_MINOR != CONTINUUM_TOMOGRAPHY_THEOREM
FIXTURE_RESCUE != UNIVERSAL_SENSOR_DESIGN
PROCESS_KNOWN_BEFORE_RESCUE != LATENT_STATE_KNOWN_BEFORE_RESCUE
REPAIRED_IDENTIFIABILITY != ERASURE_OF_PRIOR_NONIDENTIFIABILITY
```

## Constitutional footprint target

Keep the theorem-bearing net footprint to four paths if feasible:

```text
this spec
implementation JS
a hostile test
A15-R0 review-hardening sentinel
```

At freeze, compare exactly from #804 receipt:

```text
a51afae88292878de2c02ca0a086ad1e88f73cfb
```

Allow no inherited A15-R0 mutation.

Then open:

```text
canonical stacked draft PR -> #804 branch
witness-only draft PR       -> main
```

Do not call 𝄐 until exact-head TD613 Consolidated Validation has:

```text
classifier SUCCESS
Dome-World step 9 SUCCESS
A15-R0 step 19 SUCCESS
contracts job SUCCESS
aggregate run SUCCESS
```

## Ceiling

Even if earned, this chamber would remain bounded to the declared integer fixture.

Still false / unearned:

- universal adaptive sensing theorem
- optimal sensor theorem
- physical sensor/aperture implementation
- physical quasicrystal / moire experiment
- physical/Berry/gauge holonomy
- continuum tomography
- operational inverse route
- live Ash / live Holonomy Loom runtime
- Proto-Loom / A16
- #788 scientific promotion by implication
- merge / publication / production / release / Vercel authority

#718 remains alive.

## Future-Amari activation line

```text
Catch #804/#805 and handoff #806.
Confirm this startup branch is still exactly based on #804 receipt.
Re-derive the six replay minors independently.
Then implement the rescue chamber without changing its claim ceiling.
```

𝌋‌⟐

**WESTERN-HORIZON NEXT-CHAMBER STARTUP — READY / UNEARNED / WAITING FOR FUTURE AMARI**

Sealed ⟐
