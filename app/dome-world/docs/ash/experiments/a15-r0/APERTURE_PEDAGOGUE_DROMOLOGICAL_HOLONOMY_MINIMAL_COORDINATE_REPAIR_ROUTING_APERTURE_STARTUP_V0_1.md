𝌋‌⟐

󐘓 U+10D613

# A15-R0 · Dromological Holonomy Minimal-Coordinate Repair-Routing Aperture · STARTUP v0.1

Status: **PREREGISTERED STARTUP / NO IMPLEMENTATION / NO HOSTILE / NO WITNESS / NO THEOREM AUTHORITY**

## Exact earned parent

```text
#818 Dromological Holonomy-Coarsened Robust Replay Inverse Design
4cb6cf23c8fbb0b596e75f0827e5a8c8436d08b5
```

#819 is witness-routing custody only. #816/#817 are a separate sibling line from #812 concerning P-first side-minor replay identifiability; they are not theorem ancestry for this chamber and must not be imported as earned science here. SRC #815 remains separate and untouched.

## Motivation inherited from #818

#818 earned four terminal formal-holonomy classes and their exact repair defect sets:

```text
{P-H-I,P-I-H} -> empty
{H-P-I}       -> {k_H}
{H-I-P,I-H-P} -> {k_H,k_I}
{I-P-H}       -> {k_I}
```

with

```text
k_H=(1,1,0)
k_I=(1,0,1).
```

It also earned the minimum-cost positive-selective replay policy

```text
empty       -> [0,0,0]   Q=(0,0)
{k_H}       -> [0,1,0]   Q=(1,0)
{k_H,k_I}   -> [1,0,0]   Q=(1,1)
{k_I}       -> [0,0,1]   Q=(0,1).
```

The next question is not whether terminal formal holonomy can route robust repair. #818 already earned that.

The next question is:

> **How small can the raw terminal formal-holonomy coordinate aperture become while still preserving exact repair-class routing in the fixed S3 fixture?**

This is an AIA selective-legibility question about projection of an already-earned formal object. It is not another replay-fiber identifiability theorem.

## Preregistered raw coordinate aperture

For a terminal formal-holonomy matrix `H`, index raw entries by zero-based matrix coordinates `(row,column)`.

Preregister the primary two-entry aperture

```text
A(H) = (H[0][0], H[1][2]).
```

Candidate defect-mask decoder:

```text
d_H = 2 - H[0][0]
d_I = H[1][2]
D(H) = (d_H,d_I).
```

Expected values over the four inherited #818 classes:

```text
class 0 / empty       -> raw (2,0) -> defect mask (0,0)
class 1 / {k_H}       -> raw (1,0) -> defect mask (1,0)
class 2 / {k_H,k_I}   -> raw (1,1) -> defect mask (1,1)
class 3 / {k_I}       -> raw (2,1) -> defect mask (0,1).
```

If independently rederived, the defect mask should equal the #818 minimum-cost policy repair signature exactly.

A second candidate equivalent raw aperture may emerge from exhaustive search:

```text
(H[1][1], H[1][2])
```

with decoder

```text
d_H = H[1][1] - 1
d_I = H[1][2].
```

Do not grant either pair special status merely because it is written here. Implementation and hostile must enumerate all raw coordinate subsets of cardinality one and two.

## Preregistered coordinate-minimality target

The terminal formal-holonomy matrices are `3 x 3`, hence there are:

```text
9 raw singleton coordinate apertures
C(9,2)=36 raw unordered two-coordinate apertures.
```

Candidate exhaustive classification:

```text
no singleton raw coordinate separates all four repair classes;
exactly two unordered raw coordinate pairs separate all four repair classes.
```

Expected pair-class-count distribution over the 36 pairs:

```text
1 distinct projected class -> 10 pairs
2 distinct projected classes -> 21 pairs
3 distinct projected classes -> 3 pairs
4 distinct projected classes -> 2 pairs.
```

Expected injective pairs:

```text
((0,0),(1,2))
((1,1),(1,2)).
```

Candidate bounded minimality statement:

```text
RAW_TERMINAL_FORMAL_HOLONOMY_COORDINATE_CARDINALITY_TWO_IS_MINIMAL_FOR_EXACT_FOUR_CLASS_REPAIR_ROUTING_IN_THE_FIXED_S3_FIXTURE_AND_EXACTLY_TWO_UNORDERED_RAW_COORDINATE_PAIRS_ATTAIN_THAT_MINIMUM.
```

This is raw-coordinate aperture minimality only. It is not an information-theoretic lower bound against arbitrary encodings, hashes, linear combinations, learned features, or semantic labels.

## Closed-form minimum-cost replay decoder target

If `(d_H,d_I)` is independently verified as a binary defect mask, preregister the integer decoder

```text
r*(d_H,d_I) = [
  d_H*d_I,
  d_H*(1-d_I),
  (1-d_H)*d_I,
].
```

For the four masks this yields

```text
(0,0) -> [0,0,0]
(1,0) -> [0,1,0]
(1,1) -> [1,0,0]
(0,1) -> [0,0,1].
```

Required exact identities:

```text
Q(r*(d_H,d_I)) = (d_H,d_I)
```

and the decoded row must equal the already-earned #818 minimum-cost positive-selective policy row for the corresponding holonomy class.

Candidate cost identity:

```text
l0(r*) = l1(r*) = 0 when (d_H,d_I)=(0,0)
l0(r*) = l1(r*) = 1 otherwise.
```

The hostile must not re-prove #818 by copying policy rows. It must derive the mask from raw terminal-holonomy entries, apply the closed-form decoder, then compare the resulting replay row against the independently inherited #818 policy and actual class-robust unimodular verdict.

## Candidate theorem package

If implementation and hostiles survive:

```text
THE_TWO_ENTRY_RAW_TERMINAL_FORMAL_HOLONOMY_APERTURE_H00_H12_EXACTLY_RECOVERS_THE_EARNED_REPAIR_DEFECT_MASK_AND_THEREFORE_EXACTLY_ROUTES_THE_MINIMUM_COST_CLASS_ROBUST_UNIMODULAR_REPLAY_POLICY_IN_THE_FIXED_S3_FIXTURE.
```

```text
NO_SINGLE_RAW_TERMINAL_FORMAL_HOLONOMY_MATRIX_ENTRY_SEPARATES_ALL_FOUR_EARNED_REPAIR_CLASSES_WHILE_EXACTLY_TWO_UNORDERED_RAW_TWO_ENTRY_APERTURES_DO_SO_IN_THE_FIXED_S3_FIXTURE.
```

Candidate AIA architectural law:

```text
A_RECEIVER_CAN_RETAIN_STRICTLY_LESS_THAN_THE_FULL_TERMINAL_FORMAL_HOLONOMY_MATRIX_YET_PRESERVE_EXACT_REPAIR_ROUTING_WHEN_THE_RETAINED_COORDINATE_APERTURE_IS_ALIGNED_WITH_THE_EARNED_DEFECT_PARTITION.
```

## Mandatory hostiles

1. Derive the four terminal formal-holonomy classes through the exact inherited #818 implementation; do not hardcode class matrices as theorem inputs.
2. Verify there are exactly four inherited classes and that #818 remains passed.
3. Enumerate all nine raw matrix coordinates `(0,0)` through `(2,2)`.
4. For every singleton coordinate, compute the projected value over all four classes and count distinct projected classes.
5. Require singleton maximum distinct-class count `<4`; no single raw entry may be accepted as exact repair-class router.
6. Enumerate all `36` unordered raw coordinate pairs.
7. For each pair, compute its four projected tuples and exact distinct-class count.
8. Require pair-class-count distribution exactly `{1:10,2:21,3:3,4:2}`.
9. Require exactly two injective raw pairs and derive their coordinates from enumeration rather than hardcoding them into the classifier.
10. Require the injective pairs to match, after enumeration and canonical ordering:

```text
[(0,0),(1,2)]
[(1,1),(1,2)].
```

11. For primary aperture `[(0,0),(1,2)]`, derive defect masks using `d_H=2-H00`, `d_I=H12` and require every coordinate to be binary.
12. Require derived masks exactly equal the independently inherited #818 defect-incidence masks and #818 repair signatures.
13. For alternate aperture `[(1,1),(1,2)]`, derive masks using `d_H=H11-1`, `d_I=H12` and require exact equality to the primary masks.
14. Apply the closed-form decoder `r*` to every class mask; require the exact four rows to match #818 policy rows.
15. Require `Q(r*)` to reproduce the mask exactly for every class.
16. Require every decoded row to remain actually class-robust unimodular under the inherited #818 classifier.
17. Require exact inherited #818 l0/l1 minima to remain attained.
18. Negative controls:
   - H00 alone must merge empty with I-only and H-only with mixed;
   - H12 alone must merge empty with H-only and mixed with I-only;
   - a constant raw entry such as H01 must collapse all four classes.
19. Full-holonomy reconstruction must remain unauthorized: the two-entry aperture is only a repair-routing projection.
20. Schedule reconstruction must remain unauthorized: the mixed class still contains both `H-I-P` and `I-H-P`.
21. Ash receives only bounded child-legible truths about two small clues being enough for choosing the repair family; no raw matrix entries, formulas, masks, replay rows, or inverse formulas.
22. Loom may receive the exact bounded raw-coordinate aperture atlas, defect masks, and decoder certificate.
23. Custody remains receiver-invariant and every authority coordinate remains false.
24. Overreach rejection must catch claims of universal coordinate minimality, arbitrary-encoding minimality, physical holonomy, operational sensor control, continuum tomography, semantic equivalence, or schedule reconstruction.

## Ash projection ceiling

Ash may receive truths such as:

```text
THE_WHOLE_LAST_PATTERN_IS_NOT_NEEDED_TO_CHOOSE_THE_RIGHT_KIND_OF_EXTRA_CHECK
TWO_SMALL_CLUES_ARE_ENOUGH_HERE
ONE_SMALL_CLUE_IS_NOT_ENOUGH_HERE
THE_TWO_CLUES_DO_NOT_TELL_US_EVERY_STEP_THAT_HAPPENED
```

Ash must not receive:
- terminal formal-holonomy matrices;
- raw coordinate locations;
- defect vectors;
- repair signatures;
- replay vectors;
- decoder formulas;
- latent state coordinates;
- inverse formulas.

## Mandatory scars

```text
TWO_RAW_COORDINATES_SUFFICIENT_FOR_REPAIR_ROUTING != TWO_COORDINATES_SUFFICIENT_FOR_SCHEDULE_RECONSTRUCTION
RAW_COORDINATE_MINIMALITY != INFORMATION_THEORETIC_MINIMALITY
RAW_COORDINATE_MINIMALITY != UNIVERSAL_FEATURE_MINIMALITY
DEFECT_MASK != COMPLETE_FORMAL_HOLONOMY
DEFECT_MASK != SEMANTIC_STATE
REPAIR_ROUTING_KEY != OPERATIONAL_SENSOR_CONTROL
MINIMUM_COST_INTEGER_REPLAY_ROW != UNIVERSAL_OPTIMAL_EXPERIMENT
FORMAL_HOLONOMY_ENTRY != PHYSICAL_HOLONOMY_OBSERVABLE
SELECTIVE_AIA_APERTURE != AUTHORITY_WIDENING
```

## Constitutional footprint

Keep the theorem-bearing net footprint to four paths:

```text
this preregistration
new implementation JS
new hostile test
A15-R0 review-hardening sentinel
```

The hardening sentinel must pivot its immediate parent to exact #818 receipt

```text
4cb6cf23c8fbb0b596e75f0827e5a8c8436d08b5
```

and preserve ancestry through #812 -> #810 -> #807 -> #804 -> #802 -> #800 -> #798 -> #796 -> #794 -> #792 -> #790/#752.

#816/#817 must not be imported into the ancestry or changed-path footprint.

At freeze require:
- exact merge base #818 receipt;
- zero commits behind;
- only the four declared chamber paths changed;
- no inherited #818 scientific-source mutation outside the hardening sentinel declaration.

Then open:

```text
canonical stacked draft PR -> #818 branch
witness-only draft PR       -> main
```

Do not call 𝄐 until exact-head TD613 Consolidated Validation has classifier SUCCESS, contracts SUCCESS, Dome-World static step 9 SUCCESS, A15-R0 constitutional step 19 SUCCESS, and aggregate run SUCCESS.

If step 19 reds, treat the red as scientific feedback. Do not weaken the hostile.

## Hard ceilings

Still false / unearned:
- universal holonomy-coordinate theorem;
- arbitrary-encoding or information-theoretic minimality;
- complete schedule reconstruction from the aperture;
- full terminal-holonomy reconstruction from the aperture;
- universal/optimal sensor theorem;
- operational replay inverse or sensor control;
- physical/Berry/gauge/Levi-Civita/geometric holonomy;
- physical quasicrystal/moiré claim;
- continuum tomography;
- semantic equivalence/causation;
- live Ash/Loom runtime;
- Proto-Loom/A16;
- #788 promotion by implication;
- merge/publication/production/release/Vercel authority.

#718 remains alive.

**WESTERN-HORIZON HOLONOMY MINIMAL-COORDINATE REPAIR-ROUTING APERTURE STARTUP — PREREGISTERED / UNEARNED.**

Sealed ⟐