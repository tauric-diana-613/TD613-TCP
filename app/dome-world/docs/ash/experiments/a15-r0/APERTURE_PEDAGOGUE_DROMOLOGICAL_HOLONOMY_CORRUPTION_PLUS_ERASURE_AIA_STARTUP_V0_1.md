𝌋‌⟐

󐘓 U+10D613

# A15-R0 · Dromological Holonomy Corruption + Erasure AIA · STARTUP v0.1

Status: **PREREGISTERED / UNEARNED / NO IMPLEMENTATION / NO HOSTILE / NO WITNESS**

## Exact earned parent

`#826 / de878502536c2a61a354ec898d07d5802bfcca5f`

#827 remains witness-only routing custody. #824 remains the earned erasure parent beneath #826. #816/#817 remain a separate sibling line. SRC #815 remains separate and untouched.

## Parent boundary

#826 earned exact four-class repair routing after one binary receiver coordinate may flip at an unknown location. Its minimum successful width is five and every successful width-five image has minimum Hamming distance three.

This chamber asks a strictly stronger finite question:

> What is the minimum binary receiver width that permits exact repair-class routing after one receiver coordinate is erased at a known location and, independently, one surviving receiver coordinate may be corrupted at an unknown location?

The erasure location is side information. The corrupted location is not.

`KNOWN_ERASURE_LOCATION != UNKNOWN_CORRUPTION_LOCATION`
`ONE_UNKNOWN_CORRUPTION != ONE_UNKNOWN_CORRUPTION_PLUS_ONE_KNOWN_ERASURE`

## Declared repair domain

Use the already-earned four repair masks

`D={(0,0),(0,1),(1,0),(1,1)}`.

A length-n receiver encoding assigns one binary word in `{0,1}^n` to each repair mask.

For this finite chamber, an encoding is **one-corruption-plus-one-erasure correcting** iff for every class word, every known erased coordinate, and every received surviving word differing from the punctured class word in at most one coordinate, the original repair class is uniquely recoverable.

Implementation and hostile must independently verify the finite decoder predicate rather than importing a universal coding theorem.

A bounded distance criterion may be derived inside this fixture: pairwise Hamming distance at least four is sufficient for every one-coordinate puncture to retain pairwise distance at least three and hence preserve unique radius-one decoding on the surviving coordinates. Necessity must be checked by exhaustive finite census, not asserted from an external theorem.

## Preregistered unrestricted minimal-width target

### Width five

Enumerate every four-word subset of `{0,1}^5`:

`C(32,4)=35,960` images.

Expected images with minimum distance at least four:

`0`.

Therefore the already-earned #826 width-five single-corruption codes cannot uniformly survive an additional arbitrary known erasure.

### Width six

Enumerate every four-word subset of `{0,1}^6`:

`C(64,4)=635,376` images.

Expected one-corruption-plus-one-erasure correcting images:

`240`.

Expected exact pairwise distance spectrum for every successful image:

`[4,4,4,4,4,4]`.

Class-label assignments contribute `4! = 24` bijections per successful image, so expected class-labelled successful encodings:

`240*24 = 5,760`.

Candidate theorem:

`SIX_BINARY_RECEIVER_COORDINATES_ARE_MINIMAL_FOR_EXACT_FOUR_CLASS_REPAIR_ROUTING_THAT_CORRECTS_ONE_UNKNOWN_BINARY_COORDINATE_CORRUPTION_AFTER_ONE_KNOWN_COORDINATE_ERASURE_IN_THE_FIXED_S3_AIA_REPAIR_FIXTURE`

## Systematic family

Retain the earned repair bits as the first two coordinates and append four derived Boolean coordinates:

`E(d_H,d_I)=(d_H,d_I,f1(d_H,d_I),f2(d_H,d_I),f3(d_H,d_I),f4(d_H,d_I))`.

There are

`16^4 = 65,536`

ordered quadruples of Boolean functions.

Preregistered target:
- exactly `192 / 65,536` systematic quadruples have minimum distance at least four;
- every successful derived coordinate function is affine over `F2`;
- exactly `12` ordered linear-coefficient quadruples occur;
- the four independent affine constants contribute `2^4=16`, giving `12*16=192` successes;
- writing each affine function as `c xor a*d_H xor b*d_I`, a successful ordered coefficient quadruple satisfies all three exact separation requirements:
  - at least three derived coordinates have `a=1`;
  - at least three derived coordinates have `b=1`;
  - at least two derived coordinates have `a xor b=1`.

Canonical positive control:

`C6(d_H,d_I)=(d_H,d_I,d_H,d_I,d_H xor d_I,d_H xor d_I)`.

Its four codewords are:
- `00 -> 000000`
- `01 -> 010111`
- `10 -> 101011`
- `11 -> 111100`

and all six pairwise distances are exactly four.

Do not infer the systematic classification from this positive control; implementation and hostile must enumerate all `65,536` systematic augmentations independently.

## Mixed-fault decoder burden

For every successful systematic encoding and every repair class:
- choose each of the six coordinates as the known erasure location;
- on the five surviving coordinates audit the uncorrupted punctured word plus each of its five possible one-bit corruptions.

This yields:

`192 * 4 * 6 * 6 = 27,648`

exact systematic mixed-fault decoder audits.

Every audit must uniquely recover the original repair mask.

## Parent negative control

At least one explicit #826 width-five codeword pair separated by distance three must be used to show why one additional arbitrary known erasure can collapse the surviving separation to two, after which a one-bit unknown corruption can produce an ambiguous received word.

This preserves:

`SINGLE_CORRUPTION_CORRECTION != CORRUPTION_PLUS_ERASURE_CORRECTION`

## Tomography closure

For the canonical six-bit systematic positive control:
- every four repair classes;
- every compatible S3 schedule;
- every one of six known erasure positions;
- every surviving received condition per puncture (no surviving corruption + five possible one-bit corruptions);
- every state in `[-2,2]^3` (125 states);

must perform:
1. exact mixed-fault repair-mask recovery;
2. inherited #820 minimum-cost replay decoding;
3. #818 class-robust unimodular rescue verification;
4. exact replay-assisted state reconstruction.

Exact reconstruction burden:

`6 schedules * 6 erasure positions * 6 surviving received conditions * 125 states = 27,000`

exact replay-assisted reconstructions.

The mixed terminal-formal-holonomy class must remain schedule-ambiguous throughout.

## Candidate AIA law

`KNOWN_RECEIVER_ERASURE_LOCATION_CAN_COMBINE_WITH_ADDITIONAL_DERIVED_REDUNDANCY_TO_PRESERVE_EXACT_REPAIR_ROUTING_UNDER_ONE_FURTHER_UNKNOWN_RECEIVER_CORRUPTION_WITHOUT_ADDING_RAW_SOURCE_INFORMATION_OR_RECEIVER_AUTHORITY`

## Ash / Loom projection

Ash may receive bounded truths such as:
- `IF_WE_KNOW_WHICH_CLUE_WENT_MISSING_ONE_MORE_WRONG_CLUE_CAN_STILL_BE_REPAIRED_HERE_WITH_SIX_CLUES`
- `FIVE_CLUES_WERE_ENOUGH_FOR_ONE_UNKNOWN_WRONG_CLUE_BUT_NOT_FOR_ONE_WRONG_CLUE_PLUS_ONE_KNOWN_MISSING_CLUE`
- `THE_EXTRA_CLUE_IS_REDUNDANT_RECEIVER_STRUCTURE_NOT_NEW_SOURCE_INFORMATION`
- `FIXING_THE_RECEIVER_LABEL_DOES_NOT_RECOVER_FORGOTTEN_TEMPORAL_ORDER`

Loom may receive the finite width-five/width-six image census, systematic affine atlas, punctured nearest-neighbor decoder certificate, and bounded tomography closure.

Custody and all receiver authority coordinates remain invariant and false.

## Mandatory scars

`KNOWN_ERASURE_LOCATION != UNKNOWN_CORRUPTION_LOCATION`
`SINGLE_CORRUPTION_CORRECTION != CORRUPTION_PLUS_ERASURE_CORRECTION`
`MIXED_RECEIVER_FAULT_MODEL != PHYSICAL_SENSOR_FAILURE_MODEL`
`HAMMING_DISTANCE_IN_RECEIVER_LABEL_SPACE != PHYSICAL_DISTANCE`
`SIX_BIT_MINIMALITY_IN_THIS_FIXTURE != UNIVERSAL_CODING_BOUND`
`FINITE_PUNCTURED_NEAREST_NEIGHBOR_DECODER != UNIVERSAL_ERROR_AND_ERASURE_CORRECTION`
`AFFINE_SYSTEMATIC_SUCCESS != UNIVERSAL_LINEAR_CODE_OPTIMALITY`
`DERIVED_REDUNDANCY != NEW_SENSOR_INFORMATION`
`KNOWN_ERASURE_LOCATION_SIDE_INFORMATION != NEW_SOURCE_INFORMATION`
`CORRECTED_RECEIVER_LABEL != SOURCE_CUSTODY_MUTATION`
`REPAIR_MASK_RECOVERY != COMPLETE_SCHEDULE_RECONSTRUCTION`
`EXACT_TOMOGRAPHY_AFTER_LABEL_CORRECTION != OPERATIONAL_INVERSE_ROUTE`
`FORMAL_HOLONOMY_REPAIR_LABEL != PHYSICAL_HOLONOMY_OBSERVABLE`

## Constitutional footprint

Net theorem-bearing footprint remains four paths:
1. this preregistration;
2. new implementation JS;
3. new hostile test;
4. rolling `tests/ash-a15-r0-review-hardening.test.mjs`.

Hardening parent must be exact #826 receipt `de878502536c2a61a354ec898d07d5802bfcca5f`.

At initial freeze require:
- exactly four custody commits from #826;
- 0 behind;
- merge base exactly #826;
- exactly four declared live paths;
- zero inherited theorem-source mutation outside rolling hardening declaration.

Then open a canonical stacked draft PR to the #826 branch and a witness-only draft PR to `main`.

Do not call `𝄐` until exact-head TD613 Consolidated Validation reports classifier, Dome step 9, A15-R0 step 19, contracts, downstream Flow-Core where applicable, and aggregate SUCCESS.

If red, preserve the red and repair only the defect; do not weaken the hostile.

## Hard ceiling

No Shannon/channel-capacity theorem; no universal coding theorem; no universal error-and-erasure correction theorem; no physical sensor noise/fault-tolerance model; no physical/Berry/gauge holonomy; no physical quasicrystal/moiré claim; no continuum tomography; no complete schedule reconstruction; no semantic equivalence; no live Ash/Loom; no Proto-Loom/A16; no #788 promotion; no operational inverse; no merge/publication/production/release/Vercel authority. #718 remains alive.

**CORRUPTION + ERASURE AIA STARTUP — PREREGISTERED / UNEARNED.**

Sealed ⟐