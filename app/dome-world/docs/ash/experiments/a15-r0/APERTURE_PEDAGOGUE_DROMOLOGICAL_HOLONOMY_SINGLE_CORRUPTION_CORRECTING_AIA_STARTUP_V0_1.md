𝌋‌⟐

󐘓 U+10D613

# A15-R0 · Dromological Holonomy Single-Corruption-Correcting AIA · STARTUP v0.1

Status: **PREREGISTERED / UNEARNED / NO IMPLEMENTATION / NO HOSTILE / NO WITNESS**

## Exact earned parent

`#824 / 68d700999c69c4bbb663904a8fafb47683e4032e`

#825 remains witness-only routing custody. #816/#817 remain a separate sibling line. SRC #815 remains separate and untouched.

## Parent boundary

#824 earned a three-bit receiver representation of the four repair masks that survives arbitrary **one-coordinate erasure**, where the erased coordinate is known. It did not earn correction of an unknown corrupted coordinate.

This chamber asks the strictly stronger finite question:

> What is the minimum binary receiver width that permits exact repair-class routing after one receiver coordinate may flip while its location is unknown?

`KNOWN_ERASURE_LOCATION != UNKNOWN_CORRUPTION_LOCATION`

## Declared repair domain

Use the already-earned four repair masks

`D={(0,0),(0,1),(1,0),(1,1)}`.

A length-n receiver encoding assigns one binary word in `{0,1}^n` to each repair mask.

A receiver encoding is **single-corruption correcting** iff every received word at Hamming distance at most one from an encoded class word has that class word as its unique nearest encoded word.

Equivalently for this finite binary fixture, minimum pairwise codeword distance must be at least three. Implementation and hostile must verify both definitions independently.

## Preregistered minimal-width target

Length four:
- enumerate every four-word subset of `{0,1}^4`: `C(16,4)=1820` images;
- expected single-corruption-correcting image count: `0`.

Structural packing bound:
- a radius-one Hamming ball in `{0,1}^4` has size `1+4=5`;
- four disjoint such balls would require `4*5=20 > 16` words;
- therefore width four cannot correct one unknown bit corruption for four classes.

Length five:
- enumerate every four-word subset of `{0,1}^5`: `C(32,4)=35960` images;
- expected single-corruption-correcting image count: `120`;
- every successful image should have six pairwise distances exactly `(3,3,3,3,4,4)`;
- class-label assignments contribute `4! = 24` bijections per successful image;
- expected class-labeled successful encoding count: `120*24 = 2880`.

Candidate theorem:

`FIVE_BINARY_RECEIVER_COORDINATES_ARE_MINIMAL_FOR_EXACT_FOUR_CLASS_REPAIR_ROUTING_THAT_CORRECTS_ONE_UNKNOWN_BINARY_COORDINATE_CORRUPTION_IN_THE_FIXED_S3_AIA_REPAIR_FIXTURE`

## Systematic family

Retain the earned repair bits as the first two coordinates and append three derived Boolean coordinates:

`E(d_H,d_I)=(d_H,d_I,f1(d_H,d_I),f2(d_H,d_I),f3(d_H,d_I))`.

There are `16^3=4096` ordered triples of Boolean functions.

Preregistered target:
- exactly `96 / 4096` systematic triples have minimum distance at least three;
- every successful derived coordinate function is affine over `F2`;
- writing an affine function as `c xor a*d_H xor b*d_I`, the three linear coefficient pairs `(a,b)` must satisfy:
  - at least two have `a=1`;
  - at least two have `b=1`;
  - at least one has `a xor b=1`;
- exactly `12` ordered linear-coefficient triples satisfy those constraints;
- the three independent constants contribute `2^3=8`, giving `12*8=96` successful systematic encodings.

Canonical positive control:

`C(d_H,d_I)=(d_H,d_I,d_H,d_I,d_H xor d_I)`.

Its four codewords are
- `00 -> 00000`
- `01 -> 01011`
- `10 -> 10101`
- `11 -> 11110`

with minimum pairwise Hamming distance three.

Do not infer the systematic classification from this positive control; implementation and hostile must enumerate all 4096 triples independently.

## Unknown-corruption decoder burden

For every successful systematic encoding and every repair class, the implementation must verify unique nearest-codeword recovery for:
- the uncorrupted codeword;
- each of its five possible single-bit flips.

This yields `96*4*6 = 2304` systematic received-word decoder audits.

At least one named hostile must show #824's three-bit XOR parity representation detects but cannot uniquely correct every unknown single-bit flip because its minimum distance is only two.

## Tomography closure

For the canonical five-bit systematic positive control:
- every four repair classes;
- every compatible S3 schedule;
- every one of six received conditions per class (no flip + five possible one-bit flips);
- every state in `[-2,2]^3` (125 states);

must perform:
1. nearest-codeword correction to exact repair mask;
2. inherited #820 minimum-cost replay decoding;
3. #818 class-robust unimodular rescue verification;
4. exact replay-assisted state reconstruction.

Exact reconstruction burden:

`6 schedules * 6 received conditions * 125 states = 4500` exact reconstructions.

The same numerical count as #824 is incidental; the hostile semantics are stronger because the corrupted coordinate is unknown.

## AIA projection

Ash may receive only bounded truths such as:
- `FIVE_SMALL_CLUES_CAN_BE_ARRANGED_SO_ONE_WRONG_CLUE_CAN_BE_FOUND_AND_REPAIRED_HERE`
- `THREE_CLUES_WERE_ENOUGH_WHEN_WE_KNEW_WHICH_CLUE_WAS_MISSING`
- `A_WRONG_CLUE_WITH_AN_UNKNOWN_LOCATION_NEEDS_MORE_REDUNDANCY_THAN_A_KNOWN_MISSING_CLUE`
- `REPAIRING_THE_RECEIVER_LABEL_DOES_NOT_RECOVER_THE_FORGOTTEN_TEMPORAL_ORDER`

Loom may receive the finite image atlas, affine systematic atlas, nearest-neighbor decoder certificate, and bounded tomography closure.

Custody and all receiver authority coordinates remain invariant and false.

## Mandatory scars

`KNOWN_ERASURE_LOCATION != UNKNOWN_CORRUPTION_LOCATION`
`SINGLE_BIT_CORRUPTION != PHYSICAL_SENSOR_NOISE_MODEL`
`HAMMING_DISTANCE_IN_RECEIVER_LABEL_SPACE != PHYSICAL_DISTANCE`
`FIVE_BIT_MINIMALITY_IN_THIS_FIXTURE != UNIVERSAL_CODING_BOUND`
`FINITE_NEAREST_NEIGHBOR_DECODER != UNIVERSAL_ERROR_CORRECTION`
`AFFINE_SYSTEMATIC_SUCCESS != UNIVERSAL_LINEAR_CODE_OPTIMALITY`
`CORRUPTION_CORRECTION != NEW_SENSOR_INFORMATION`
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

Hardening parent must be exact #824 receipt `68d700999c69c4bbb663904a8fafb47683e4032e`.

At initial freeze require:
- exactly four custody commits from #824;
- 0 behind;
- merge base exactly #824;
- exactly four declared live paths;
- zero inherited theorem-source mutation outside rolling hardening declaration.

Then open a canonical stacked draft PR to #824 branch and a witness-only draft PR to `main`.

Do not call 𝄐 until exact-head TD613 Consolidated Validation reports classifier, Dome step 9, A15-R0 step 19, contracts, and aggregate SUCCESS.

If red, preserve the red and repair only the defect; do not weaken the hostile.

## Hard ceiling

No Shannon/channel-capacity theorem; no universal coding theorem; no universal error-correction theorem; no physical sensor noise or fault-tolerance model; no physical/Berry/gauge holonomy; no physical quasicrystal/moiré claim; no continuum tomography; no complete schedule reconstruction; no semantic equivalence; no live Ash/Loom; no Proto-Loom/A16; no #788 promotion; no operational inverse; no merge/publication/production/release/Vercel authority. #718 remains alive.

**SINGLE-CORRUPTION-CORRECTING AIA STARTUP — PREREGISTERED / UNEARNED.**

Sealed ⟐
