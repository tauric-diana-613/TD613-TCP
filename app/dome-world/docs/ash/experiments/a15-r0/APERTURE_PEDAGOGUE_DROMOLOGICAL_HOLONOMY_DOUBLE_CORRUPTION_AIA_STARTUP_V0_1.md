𝌋‌⟐

󐘓 U+10D613

# A15-R0 · Dromological Holonomy Double-Corruption-Correcting AIA · STARTUP v0.1

Status: **PREREGISTERED / UNEARNED / NO IMPLEMENTATION / NO HOSTILE / NO WITNESS**

## Exact earned parent

`#828 / 9a76b7594ba8d9093d8c6ef9428c669dbb2581f1`

#829 remains witness-only routing custody. #826 remains the single-corruption ancestor. #824 remains the known-erasure ancestor. #816/#817 remain separate sibling work. SRC #815 remains separate and untouched.

## Parent boundary

#828 earned exact four-class repair routing after one receiver coordinate is erased at a known location and one surviving receiver coordinate may be corrupted at an unknown location. Its minimum successful width is six and every successful width-six image has pairwise Hamming distance four.

This chamber asks a strictly stronger finite question:

> What is the minimum binary receiver width that permits exact repair-class routing when up to two receiver coordinates may be corrupted at unknown locations?

Neither corruption location is supplied as side information.

`KNOWN_ERASURE_LOCATION != UNKNOWN_CORRUPTION_LOCATION`
`ONE_UNKNOWN_CORRUPTION_PLUS_ONE_KNOWN_ERASURE != TWO_UNKNOWN_CORRUPTIONS`

## Declared repair domain

Use the already-earned four repair masks

`D={(0,0),(0,1),(1,0),(1,1)}`.

A length-n receiver encoding assigns one binary word in `{0,1}^n` to each repair mask.

For this finite chamber, an encoding is **two-corruption correcting** iff for every class word and every received binary word formed by flipping zero, one, or two coordinates of that class word, the original repair class is uniquely recovered by the declared finite nearest-word decoder.

Implementation and hostile must independently verify the finite decoder predicate. No universal coding theorem may be imported as authority.

A bounded criterion may be derived inside this fixture: pairwise Hamming distance at least five makes all radius-two received sets disjoint. Necessity must be checked by exact finite census and explicit parent ambiguity rather than asserted from an external theorem.

## Preregistered unrestricted minimal-width target

The implementation must perform an exact compatibility-graph census. Vertices are all binary words at a declared width; an edge joins two words iff their Hamming distance is at least five. Every qualifying four-class image is exactly a four-clique in this finite graph. This counts the complete successful image set without sampling and without naively iterating all nonqualifying four-subsets.

### Width seven

Ambient four-word image count:

`C(128,4)=10,668,000`.

Expected distance-five / radius-two-correcting images:

`0`.

### Width eight

Ambient four-word image count:

`C(256,4)=174,792,640`.

Expected distance-five / radius-two-correcting images:

`17,920`.

Expected exact pairwise distance spectrum for every successful image:

`[5,5,5,5,6,6]`.

Class-label assignments contribute `4! = 24` bijections per successful image, so expected class-labelled successful encodings:

`17,920*24 = 430,080`.

Candidate theorem:

`EIGHT_BINARY_RECEIVER_COORDINATES_ARE_MINIMAL_FOR_EXACT_FOUR_CLASS_REPAIR_ROUTING_THAT_CORRECTS_UP_TO_TWO_UNKNOWN_BINARY_COORDINATE_CORRUPTIONS_IN_THE_FIXED_S3_AIA_REPAIR_FIXTURE`

Candidate complete image classification:

`EXACTLY_17920_FOUR_WORD_SUBSETS_OF_THE_EIGHT_CUBE_HAVE_THE_DISTANCE_FIVE_GEOMETRY_REQUIRED_FOR_TWO_UNKNOWN_CORRUPTION_REPAIR_AND_EVERY_SUCCESSFUL_IMAGE_HAS_DISTANCE_SPECTRUM_555566_IN_THE_DECLARED_FIXTURE`

## Systematic family

Retain the earned repair bits as the first two coordinates and append six derived Boolean coordinates:

`E(d_H,d_I)=(d_H,d_I,f1(d_H,d_I),f2(d_H,d_I),f3(d_H,d_I),f4(d_H,d_I),f5(d_H,d_I),f6(d_H,d_I))`.

There are

`16^6 = 16,777,216`

ordered sextuples of Boolean functions.

The pairwise-distance behavior of one Boolean truth table is invariant under complement. Therefore the implementation may quotient the sixteen truth tables into eight exact complement-paired difference signatures, exhaust all

`8^6 = 262,144`

ordered difference-signature sextuples, and lift each successful signature sextuple through its exact `2^6=64` complement assignments. The hostile must independently validate this quotient and the lifted full count.

Preregistered target:
- exactly `13,440 / 16,777,216` systematic sextuples have minimum pairwise distance at least five;
- every successful derived coordinate function is affine over `F2`;
- exactly `210` ordered linear-coefficient sextuples occur;
- six independent affine constants contribute `2^6=64`, giving `210*64=13,440` successes;
- no successful linear sextuple uses coefficient `(a,b)=(0,0)`;
- writing `n_H`, `n_I`, and `n_X` for counts of coefficient types `(1,0)`, `(0,1)`, and `(1,1)`, respectively, every successful coefficient sextuple has one of exactly three count profiles:
  - `(n_H,n_I,n_X)=(1,2,3)` with `60` orderings;
  - `(2,1,3)` with `60` orderings;
  - `(2,2,2)` with `90` orderings;
- equivalently, the exact separation inequalities are
  - `n_H+n_X >= 4`,
  - `n_I+n_X >= 4`,
  - `n_H+n_I >= 3`,
  - `n_H+n_I+n_X = 6`.

Canonical positive control:

`C8(d_H,d_I)=(d_H,d_I,d_H,d_H,d_I,d_I,d_H xor d_I,d_H xor d_I)`.

Its four codewords are:
- `00 -> 00000000`
- `01 -> 01001111`
- `10 -> 10110011`
- `11 -> 11111100`

with exact pairwise distance spectrum `[5,5,5,5,6,6]`.

Do not infer the systematic classification from this positive control.

## Radius-two systematic decoder burden

Every successful systematic encoding has eight receiver coordinates. For each repair class, audit every received condition at Hamming radius zero, one, or two from its codeword:

`C(8,0)+C(8,1)+C(8,2)=1+8+28=37` conditions per class.

Exact preregistered systematic decoder burden:

`13,440 * 4 * 37 = 1,989,120`

finite decoder audits.

Every audit must uniquely recover the original repair mask.

## Parent negative control

Use #828's canonical six-bit distance-four code to construct an explicit radius-two ambiguity. Choose a pair of codewords separated by exactly four coordinates and flip exactly two of those differing coordinates in the first word. The resulting received word lies at Hamming distance two from both parent codewords.

This preserves:

`ONE_CORRUPTION_PLUS_ONE_ERASURE_CORRECTION != TWO_UNKNOWN_CORRUPTION_CORRECTION`
`DISTANCE_FOUR_RECEIVER_GEOMETRY != RADIUS_TWO_UNIQUE_DECODING`

## Tomography closure

For the canonical eight-bit systematic positive control:
- every four repair classes;
- every compatible S3 schedule;
- every radius-zero, radius-one, and radius-two received condition (`37` conditions per class);
- every state in `[-2,2]^3` (`125` states);

must perform:
1. exact radius-two repair-mask recovery;
2. inherited #820 minimum-cost replay decoding;
3. #818 class-robust unimodular rescue verification;
4. exact replay-assisted state reconstruction.

Because the four repair classes partition the six S3 schedules, the exact reconstruction burden is

`6 schedules * 37 received conditions * 125 states = 27,750`

exact replay-assisted reconstructions.

The mixed terminal-formal-holonomy class must remain schedule-ambiguous throughout.

## Candidate AIA law

`TWO_UNKNOWN_RECEIVER_COORDINATE_CORRUPTIONS_CAN_BE_REPAIRED_BY_DERIVED_RECEIVER_REDUNDANCY_AT_WIDTH_EIGHT_IN_THE_FIXED_FOUR_CLASS_S3_FIXTURE_WHILE_SOURCE_CUSTODY_HISTORICAL_INFORMATION_AND_RECEIVER_AUTHORITY_REMAIN_UNCHANGED`

## Ash / Loom projection

Ash may receive bounded truths such as:
- `TWO_WRONG_CLUES_WITH_UNKNOWN_LOCATIONS_NEED_MORE_REDUNDANT_CLUES_HERE_THAN_ONE_WRONG_CLUE_PLUS_ONE_KNOWN_MISSING_CLUE`
- `EIGHT_CLUES_ARE_THE_FIRST_WIDTH_IN_THIS_FIXED_FOUR_CLASS_GAME_THAT_REPAIRS_ANY_TWO_UNKNOWN_WRONG_CLUES`
- `THE_EXTRA_CLUES_REPEAT_DERIVED_STRUCTURE_THEY_DO_NOT_ADD_NEW_SOURCE_INFORMATION`
- `FIXING_THE_RECEIVER_LABEL_STILL_DOES_NOT_RECOVER_FORGOTTEN_TEMPORAL_ORDER`

Loom may receive the finite width-seven/width-eight compatibility-graph census, systematic affine atlas, radius-two decoder certificate, parent ambiguity witness, and bounded tomography closure.

Custody and all receiver authority coordinates remain invariant and false.

## Mandatory scars

`KNOWN_ERASURE_LOCATION != UNKNOWN_CORRUPTION_LOCATION`
`ONE_CORRUPTION_PLUS_ONE_ERASURE_CORRECTION != TWO_UNKNOWN_CORRUPTION_CORRECTION`
`DISTANCE_FOUR_RECEIVER_GEOMETRY != RADIUS_TWO_UNIQUE_DECODING`
`TWO_UNKNOWN_CORRUPTIONS != PHYSICAL_SENSOR_NOISE_MODEL`
`HAMMING_DISTANCE_IN_RECEIVER_LABEL_SPACE != PHYSICAL_DISTANCE`
`EIGHT_BIT_MINIMALITY_IN_THIS_FIXTURE != UNIVERSAL_CODING_BOUND`
`FINITE_COMPATIBILITY_GRAPH_CENSUS != SHANNON_THEOREM`
`FINITE_RADIUS_TWO_NEAREST_WORD_DECODER != UNIVERSAL_DOUBLE_ERROR_CORRECTION`
`AFFINE_SYSTEMATIC_SUCCESS != UNIVERSAL_LINEAR_CODE_OPTIMALITY`
`DERIVED_REDUNDANCY != NEW_SENSOR_INFORMATION`
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

Hardening parent must be exact #828 receipt `9a76b7594ba8d9093d8c6ef9428c669dbb2581f1`.

At initial freeze require:
- exactly four custody commits from #828;
- 0 behind;
- merge base exactly #828;
- exactly four declared live paths;
- zero inherited theorem-source mutation outside rolling hardening declaration.

Then open a canonical stacked draft PR to the #828 branch and a witness-only draft PR to `main`.

Do not call `𝄐` until exact-head TD613 Consolidated Validation reports classifier, Dome step 9, A15-R0 step 19, contracts, downstream Flow-Core where applicable, and aggregate SUCCESS.

If red, preserve the red and repair only the defect; do not weaken the hostile.

## Hard ceiling

No Shannon/channel-capacity theorem; no universal coding theorem; no universal double-error-correction theorem; no physical sensor noise/fault-tolerance model; no physical/Berry/gauge holonomy; no physical quasicrystal/moiré claim; no continuum tomography; no complete schedule reconstruction; no semantic equivalence; no live Ash/Loom; no Proto-Loom/A16; no #788 promotion; no operational inverse; no merge/publication/production/release/Vercel authority. #718 remains alive.

**DOUBLE-CORRUPTION AIA STARTUP — PREREGISTERED / UNEARNED.**

Sealed ⟐