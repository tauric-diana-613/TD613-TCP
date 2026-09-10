𝌋‌⟐

󐘓 U+10D613

# A15-R0 · Dromological Holonomy Fault-Budget Stratigraphy / Factored Tomography AIA · STARTUP v0.1

Status: **PREREGISTERED / UNEARNED / NO IMPLEMENTATION / NO HOSTILE / NO WITNESS**

## Exact earned parent

`#830 / 3877139365041453bab85741eb09ba2f5839eed6`

#831 remains witness-only routing custody. #828 remains the corruption-plus-erasure ancestor; #826 the single-corruption ancestor; #824 the erasure ancestor. #816/#817 remain a separate sibling line. SRC #815 remains separate and untouched.

## Question

Across the four already-earned canonical binary receiver representations, what exact finite combinations of known coordinate erasures and unknown coordinate corruptions retain exact four-class repair routing?

This chamber does **not** ask for a universal coding theorem. It exhausts only the four earned canonical representations and their finite fault-profile lattices.

A fault profile is `(e,t)` where:
- `e` receiver coordinates are erased and their indices are supplied as receiver-side information;
- after erasure, up to `t` surviving receiver coordinates may be corrupted at unknown positions.

`KNOWN_ERASURE_POSITION != UNKNOWN_CORRUPTION_POSITION`
`RECEIVER_FAULT_PROFILE != PHYSICAL_SENSOR_FAULT_MODEL`

## Earned canonical ladder to re-audit

Use only already-earned receiver representations:

1. #824 width 3 parity representation
   - canonical even-parity image
   - earned minimum pairwise Hamming distance `2`

2. #826 width 5 single-corruption representation
   - `(d_H,d_I,d_H,d_I,d_H xor d_I)`
   - earned minimum distance `3`

3. #828 width 6 corruption-plus-erasure representation
   - `(d_H,d_I,d_H,d_I,d_H xor d_I,d_H xor d_I)`
   - earned minimum distance `4`

4. #830 width 8 double-corruption representation
   - `(d_H,d_I,d_H,d_H,d_I,d_I,d_H xor d_I,d_H xor d_I)`
   - earned minimum distance `5`

No ancestor theorem may be rewritten. This chamber re-audits only new mixed fault profiles against those frozen representations.

## Exact finite profile lattice

For a width-`n` representation enumerate every feasible pair

`0 <= e <= n`
`0 <= t <= n-e`.

For every profile:
1. enumerate every erased-coordinate set of cardinality `e`;
2. puncture all four receiver labels on exactly that set;
3. for every class label enumerate every surviving received word at Hamming radius `0..t` from the punctured class word;
4. nearest-word decode against the four punctured class labels;
5. require a unique exact repair-mask result for every case.

No distance theorem may substitute for the finite decoder audit. Distance is a derived summary only.

## Preregistered fault-budget target

For these four fixed canonical representations only, expected exact profile rule:

`EXACT_REPAIR_ROUTING(e,t) iff 2*t + e <= d_min - 1`.

Expected finite budgets:

- width 3 / `d_min=2`: budget `1`
- width 5 / `d_min=3`: budget `2`
- width 6 / `d_min=4`: budget `3`
- width 8 / `d_min=5`: budget `4`

Expected exact positive/failing profile counts:

- width 3: `2` positive / `8` failing
- width 5: `4` positive / `17` failing
- width 6: `6` positive / `22` failing
- width 8: `9` positive / `36` failing

Expected width-eight positive profiles:

`(0,0) (0,1) (0,2) (1,0) (1,1) (2,0) (2,1) (3,0) (4,0)`.

Expected maximal width-eight positive profiles under coordinatewise fault domination:

`(0,2) (2,1) (4,0)`.

Expected first boundary failures at budget cost `5`:

`(1,2) (3,1) (5,0)`.

Every boundary failure must carry an explicit finite ambiguity witness. Do not infer failure from a slogan about distance.

Candidate bounded law:

`IN_THE_FOUR_EARNED_CANONICAL_AIA_RECEIVER_REPRESENTATIONS_ONE_KNOWN_ERASURE_CONSUMES_ONE_UNIT_AND_ONE_UNKNOWN_CORRUPTION_CONSUMES_TWO_UNITS_OF_THE_FINITE_REPAIR_BUDGET_DMIN_MINUS_ONE`.

This wording remains fixture-specific.

## Width-eight exhaustive decoder burden

For the nine expected positive profiles, exact receiver-case count per class is expected to sum to:

`469`.

Therefore the complete width-eight positive-profile decoder atlas should contain:

`4 * 469 = 1,876`

exact receiver-fault decoding cases.

For the three maximal profiles only:

- `(0,2)`: `37` cases per class
- `(2,1)`: `196` cases per class
- `(4,0)`: `70` cases per class

Total maximal-profile cases per class: `303`.

All four classes: `1,212` exact maximal-profile decoder cases.

## Factored tomography target

The prior chambers repeatedly crossed every receiver-fault realization with every latent state. This chamber asks whether that combinatorial multiplication can be proven unnecessary in the fixed architecture because downstream replay/tomography depends only on the recovered repair mask.

For every one of the `1,212` maximal-profile receiver cases:
1. recover the exact repair mask;
2. recover the inherited #820 minimum-cost replay row;
3. require that every receiver realization belonging to one repair class yields the same replay row for that class;
4. require #818 class-robust unimodular rescue.

Then, independently of damaged receiver words, for each of the six S3 schedules and every state in `[-2,2]^3`:
1. use that schedule's earned class replay row;
2. observe the replay-assisted state;
3. invert exactly.

Expected factored state-reconstruction burden:

`6 schedules * 125 states = 750`.

The brute-force cross-product cardinality represented by the same three maximal profiles is:

`6 schedules * 303 receiver cases per compatible class * 125 states = 227,250`.

The implementation must **not** claim that all 227,250 reconstructions were executed. It may earn only a finite compositional factorization if:
- all `1,212` receiver cases decode to the class repair row exactly;
- all `750` independent schedule/state reconstructions succeed;
- the replay/state functions receive the recovered replay row and never the damaged receiver word.

Candidate factorization law:

`EXHAUSTIVE_RECEIVER_FAULT_DECODING_CAN_FACTOR_FROM_EXACT_REPLAY_ASSISTED_STATE_RECONSTRUCTION_WHEN_THE_DOWNSTREAM_REPLAY_ROUTE_DEPENDS_ONLY_ON_THE_RECOVERED_REPAIR_MASK_IN_THIS_FIXED_S3_AIA_FIXTURE`.

`FACTORED_TOMOGRAPHY_CLOSURE != EXECUTION_OF_THE_FULL_RECEIVER_BY_STATE_CROSS_PRODUCT`

## Required hostiles

- independently recompute all four canonical codeword atlases;
- independently recompute all six pairwise distances for each representation;
- exhaust every feasible `(e,t)` profile for each width;
- independently enumerate every erasure set and every radius-`t` received condition;
- require exact decoder agreement with the preregistered budget predicate for every profile;
- require exact positive/failing profile counts `2/8`, `4/17`, `6/22`, `9/36`;
- require explicit ambiguity witnesses for every first boundary profile;
- require the width-eight positive-profile atlas to contain exactly `1,876` receiver cases;
- require the maximal-profile atlas to contain exactly `1,212` receiver cases;
- require the recovered replay row to be invariant across all receiver realizations within one repair class;
- execute exactly `750` independent replay-assisted state reconstructions;
- require mixed terminal-formal-holonomy schedule ambiguity to remain intact;
- Ash receives bounded child-legible budget truths only;
- Loom may receive the technical profile lattice, ambiguity atlas, and factorization certificate;
- custody receiver-invariant;
- every authority coordinate remains false.

## Child-legible AIA projection

Ash may receive bounded truths such as:

- `IN_THIS_EIGHT_CLUE_GAME_A_KNOWN_MISSING_CLUE_COSTS_ONE_REPAIR_MARK_AND_AN_UNKNOWN_WRONG_CLUE_COSTS_TWO`
- `THE_EIGHT_CLUE_REPRESENTATION_HAS_FOUR_REPAIR_MARKS`
- `FIX_THE_CLUE_LABEL_FIRST_THEN_THE_SAME_REPAIR_ROUTE_CAN_BE_USED_FOR_THE_STATE`
- `WE_DO_NOT_HAVE_TO_REDO_THE_WHOLE_STATE_CALCULATION_FOR_EVERY_DIFFERENT_DAMAGED_CLUE_PATTERN`

No physical sensor semantics follow.

## Mandatory scars

`FINITE_REPAIR_BUDGET != SHANNON_OR_CHANNEL_CAPACITY`
`ONE_ERASURE_COST_ONE_IN_THIS_LADDER != UNIVERSAL_ERASURE_METRIC`
`ONE_CORRUPTION_COST_TWO_IN_THIS_LADDER != UNIVERSAL_ERROR_METRIC`
`KNOWN_ERASURE_POSITION != UNKNOWN_CORRUPTION_POSITION`
`RECEIVER_FAULT_PROFILE != PHYSICAL_SENSOR_FAULT_MODEL`
`HAMMING_DISTANCE_IN_RECEIVER_LABEL_SPACE != PHYSICAL_DISTANCE`
`FACTORED_TOMOGRAPHY_CLOSURE != EXECUTED_FULL_CROSS_PRODUCT`
`DECODED_REPAIR_MASK != COMPLETE_SCHEDULE_IDENTITY`
`REPLAY_ROUTE_FACTOR != OPERATIONAL_SENSOR_CONTROL`
`EXACT_STATE_RECONSTRUCTION != CONTINUUM_TOMOGRAPHY`
`FORMAL_HOLONOMY_REPAIR_LABEL != PHYSICAL_HOLONOMY_OBSERVABLE`

No Shannon/capacity/universal coding theorem, universal error-and-erasure theorem, physical sensor fault model, physical/Berry/gauge holonomy, physical quasicrystal/moiré claim, continuum tomography, complete schedule reconstruction, semantic equivalence, live Ash/Loom, Proto-Loom/A16, #788 promotion, operational inverse, merge/publication/production/release/Vercel authority. #718 remains alive.

Sealed ⟐