𝌋‌⟐

󐘓 U+10D613

# A15-R0 · P-First Side-Minor Replay Identifiability / Fiber Refinement · STARTUP v0.1

Status: **PREREGISTERED STARTUP / NO IMPLEMENTATION / NO HOSTILE / NO WITNESS / NO THEOREM AUTHORITY**

## Exact earned parent

```text
#812 Dromological Replay Repair Quotient / Canonical Section
2cc95613969951afc96c638c316ae70007560f16
```

#813 is witness-routing custody only and is not theorem ancestry. Closed #814 is abandoned collision provenance only.

## Motivation inherited from #812

#812 earned the exact repair quotient

```text
Q(a,b,c)=(q_H,q_I)=(a+b,a+c)
ker(Q)=Z*(1,-1,-1)
S(q_H,q_I)=(0,q_H,q_I)
```

for the repair determinant phenotype of the four historically nonidentifiable schedules.

It also earned the critical strictness scar:

```text
SAME_REPAIR_SIGNATURE != SAME_FULL_AUGMENTED_MINOR_ATLAS.
```

The next question is therefore not whether P-first side minors can differ inside one repair fiber. #812 already witnessed that they can.

The next question is:

```text
How much replay identity do the replay-dependent P-first side minors retain?
```

## Preregistered P-first side-minor coefficient targets

For each P-first schedule, take only the three `3 x 3` augmented minors that include the replay row.

Using zero-based augmented row indices, the preregistered coefficient targets for replay row `r=(a,b,c)` are:

```text
P-H-I
rows (0,1,3):  -c
rows (0,2,3):   b-c
rows (1,2,3):   a+2b

P-I-H
rows (0,1,3):   b
rows (0,2,3):   b-c
rows (1,2,3): -(a+b+c)
```

Equivalently, the candidate coefficient matrices are

```text
C_PHI =
[ 0  0 -1]
[ 0  1 -1]
[ 1  2  0]

C_PIH =
[ 0  1  0]
[ 0  1 -1]
[-1 -1 -1].
```

Do not trust these formulas merely because they are written here. Implementation and hostile must rederive every coefficient from the witnessed #810 determinant-linear-form machinery.

Preregistered determinant targets:

```text
det(C_PHI)=+1
det(C_PIH)=+1.
```

If these survive exact derivation, each P-first replay-side-minor triple is itself a unimodular integer coordinate system on replay space `Z^3`.

## Preregistered exact inverse targets

For P-H-I side-minor triple `(m1,m2,m3)` in the row order above:

```text
a =  2*m1 - 2*m2 + m3
b = -m1 + m2
c = -m1.
```

For P-I-H:

```text
a = -2*m1 + m2 - m3
b =  m1
c =  m1 - m2.
```

These are preregistered targets only. The implementation should derive exact adjugate inverses from the rederived coefficient matrices and compare against the formulas rather than use the formulas as its proof.

## Candidate theorem

If exact implementation and hostiles survive:

```text
EACH_P_FIRST_REPLAY_DEPENDENT_SIDE_MINOR_TRIPLE_IS_A_UNIMODULAR_INTEGER_COORDINATE_SYSTEM_ON_THE_DECLARED_REPLAY_LATTICE_AND_EXACTLY_IDENTIFIES_THE_REPLAY_ROW_IN_THE_FIXED_S3_FIXTURE.
```

Combined with #812:

```text
THE_P_FIRST_SIDE_MINOR_PARTITION_STRICTLY_REFINES_THE_REPAIR_QUOTIENT_PARTITION_BECAUSE_THE_FOUR_HISTORICALLY_SINGULAR_REPAIR_ATLASES_FACTOR_THROUGH_Q_WHILE_EITHER_P_FIRST_SIDE_MINOR_TRIPLE_IS_INJECTIVE_ON_INTEGER_REPLAY_ROWS.
```

Candidate architectural law:

```text
IN_THE_FIXED_S3_FIXTURE_A_REPLAY_FIBER_COORDINATE_CAN_BE_INVISIBLE_TO_THE_SINGULAR_SCHEDULE_REPAIR_PHENOTYPE_YET_EXACTLY_IDENTIFIABLE_FROM_EITHER_P_FIRST_REPLAY_SIDE_MINOR_TRIPLE_WITH_ZERO_AUTHORITY_WIDENING.
```

This is a minor-atlas identifiability theorem in the fixed integer fixture. It is not an operational replay inverse, live sensor route, or universal tomography theorem.

## Fiber-sensitivity target

Let the #812 primitive repair-fiber generator be

```text
g=(1,-1,-1).
```

For a replay-side minor linear form with coefficient row `v`, translating replay row by `n*g` changes the minor by

```text
n*(v·g).
```

Preregistered slope targets:

```text
P-H-I:  (+1, 0, -1)
P-I-H:  (-1, 0, +1).
```

Thus each P-first triple should contain:
- two fiber-sensitive minors with unit slope `+1` or `-1`;
- one fiber-blind minor with slope `0`;
- the blind minor in both schedules should be the same quotient function `b-c=q_H-q_I`.

Candidate bounded consequence:

```text
WITH_Q_ALREADY_KNOWN_ANY_ONE_UNIT_SLOPE_P_FIRST_SIDE_MINOR_IDENTIFIES_THE_INTEGER_FIBER_COORDINATE_T=A_EXACTLY_WHILE_THE_FIBER_BLIND_SIDE_MINOR_CANNOT_DISTINGUISH_ROWS_WITHIN_ONE_REPAIR_FIBER.
```

Again, this is a fixed-fixture mathematical reconstruction statement, not operational inverse authority.

## Mandatory hostiles

1. Select the two P-first schedules from the witnessed S3 atlas by inherited rank-three status; do not hardcode schedule verdicts.
2. Re-derive all six replay-dependent P-first minor coefficient rows from `deriveReplayMinorLinearForms` inherited through #810/#812.
3. Assemble the two `3 x 3` coefficient matrices in exact augmented-row order and require determinant exactly `+1` for each.
4. Derive each inverse by exact integer adjugate and require every inverse entry integral.
5. Compare derived inverse matrices against the preregistered formulas above.
6. Exhaustively audit every replay row in `[-4,4]^3` for each P-first schedule:
   - exact side-minor triple from the actual augmented determinants;
   - exact equality to coefficient-matrix multiplication;
   - exact inverse reconstruction of replay row.

Expected:

```text
729 replay rows x 2 schedules = 1458 exact replay reconstructions.
```

7. Pairwise injectivity hostile over the 729-row cube for each P-first schedule:

```text
C(729,2) x 2 = 530712 unordered pair checks.
```

Require different replay rows to produce different side-minor triples.

8. Compare against the #812 quotient partition on the same cube. For every distinct pair with the same repair signature, require both P-first side-minor triples to differ.

#812's witnessed finite cube contains:

```text
1296 same-signature unordered pairs.
```

Expected strict-refinement checks:

```text
1296 x 2 = 2592.
```

9. Independently derive each side-minor fiber slope as coefficient dot the inherited #812 null-fiber generator. Do not hardcode slopes.
10. Translation hostile over every base row in `[-3,3]^3`, every `n=-4..4`, every P-first schedule, and all three side minors. Require exact affine difference `n*slope`.

Expected side-minor translation checks:

```text
7^3 x 9 x 2 x 3 = 18522.
```

11. For every replay row in `[-4,4]^3`, and each of the four unit-slope side-minor coordinates, reconstruct the fiber coordinate `t=a` using only:
   - the already-earned quotient `Q(r)`;
   - that one side-minor value;
   - the independently derived coefficient row.

Expected:

```text
729 x 4 = 2916 exact fiber-coordinate reconstructions.
```

12. Fiber-blind hostile: use at least

```text
r0=(1,0,0)
r1=(2,-1,-1)
```

with the same #812 repair signature `(1,1)`. Require:
- both blind side minors equal;
- all four unit-slope side minors differ;
- both full P-first side-minor triples differ;
- quotient repair atlases remain equal.

13. Re-removing replay preserves #802/#804 historical facts and #812 quotient facts.
14. Schedule identity remains separately inherited at `tau_schedule=2`.
15. Ash receives only bounded child-legible truth; Loom may receive the technical side-minor atlas and exact finite inverse formulas.
16. Custody remains receiver-invariant and every authority coordinate remains false.

## AIA projection

Ash may receive only bounded truths such as:

```text
TWO_GOOD_ORDERS_KEEP_ENOUGH_EXTRA_DETAIL_TO_TELL_WHICH_EXTRA_CHECK_WAS_USED
THE_REPAIR_EFFECT_ALONE_CAN_FORGET_A_DETAIL_THAT_THE_GOOD_ORDER_SIDE_CLUES_STILL_KEEP
ONE_KIND_OF_SIDE_CLUE_STAYS_THE_SAME_ALONG_A_REPAIR_FAMILY_WHILE_OTHER_SIDE_CLUES_CHANGE
```

Ash must not receive:
- replay vectors;
- coefficient matrices;
- determinant formulas;
- inverse formulas;
- fiber vector;
- quotient matrix;
- latent coordinates.

Loom may receive the bounded exact coefficient/inverse atlas and finite hostile counts with zero runtime, production, physical, or release authority.

## Mandatory scars

```text
P_FIRST_SIDE_MINOR_IDENTIFIABILITY != OPERATIONAL_REPLAY_INVERSE_ROUTE
UNIMODULAR_SIDE_MINOR_COORDINATES != UNIVERSAL_SENSOR_COORDINATES
SIDE_MINOR_PARTITION_REFINEMENT != SEMANTIC_HIERARCHY
FIBER_SENSITIVE_MINOR != PHYSICAL_FIBER_SENSOR
FIBER_BLIND_MINOR != INFORMATION_ABSENCE_FROM_THE_FULL_RECORD
SAME_REPAIR_SIGNATURE != SAME_P_FIRST_SIDE_MINOR_TRIPLE
REPLAY_ROW_IDENTIFIED_FROM_DECLARED_MINORS != LATENT_STATE_OR_SOURCE_IDENTITY
FINITE_INTEGER_INVERSE != CONTINUUM_TOMOGRAPHY_INVERSE
```

## Constitutional footprint

Keep the theorem-bearing net footprint to four paths:

```text
this preregistration
new implementation JS
new hostile test
A15-R0 review-hardening sentinel
```

Hardening must pivot its immediate parent to exact #812 receipt

```text
2cc95613969951afc96c638c316ae70007560f16
```

and preserve ancestry

```text
#812 -> #810 -> #807 -> #804 -> #802 -> #800 -> #798 -> #796 -> #794 -> #792 -> #790/#752.
```

At freeze require exact merge base #812 receipt, zero commits behind, only four declared paths, and no inherited #812 scientific-source mutation outside the hardening declaration.

Then open:

```text
canonical stacked draft PR -> #812 branch
witness-only draft PR       -> main
```

Do not call 𝄐 until exact-head TD613 Consolidated Validation has classifier SUCCESS, contracts SUCCESS, Dome-World static step 9 SUCCESS, A15-R0 constitutional step 19 SUCCESS, and aggregate run SUCCESS.

If step 19 reds, the red is scientific feedback. Do not weaken the hostile.

## Hard ceilings

Still false / unearned:
- universal replay theorem;
- universal side-minor/sensor theorem;
- universal minimal sufficient statistic;
- operational replay inverse route;
- live sensor or runtime reconstruction;
- physical gauge/fiber/sensor claim;
- physical quasicrystal/moiré claim;
- physical/Berry/gauge holonomy;
- continuum tomography;
- semantic equivalence/causation;
- live Ash/Loom runtime;
- Proto-Loom/A16;
- #788 promotion by implication;
- merge/publication/production/release/Vercel authority.

#718 remains alive.

𝌋‌⟐

**WESTERN-HORIZON P-FIRST SIDE-MINOR REPLAY IDENTIFIABILITY STARTUP — PREREGISTERED / UNEARNED.**

Sealed ⟐
