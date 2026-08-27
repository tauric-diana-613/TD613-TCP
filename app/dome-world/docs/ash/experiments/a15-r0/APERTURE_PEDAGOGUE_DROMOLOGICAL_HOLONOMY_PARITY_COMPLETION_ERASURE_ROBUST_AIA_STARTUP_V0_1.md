𝌋‌⟐

󐘓 U+10D613

# A15-R0 · Dromological Holonomy Parity Completion / Erasure-Robust AIA · STARTUP v0.1

Status: **PREREGISTERED STARTUP / NO IMPLEMENTATION / NO HOSTILE / NO WITNESS / NO THEOREM AUTHORITY**

## Exact earned parent

```text
#822 Dromological Holonomy Raw-Aperture Cut / Anisotropic Redundancy
012024d9a0d7bdb21721ede40dfe9f029de09717
```

#823 remains witness-only routing custody. #816/#817 remain a separate sibling line and are not ancestry. SRC #815 remains separate and untouched.

## Earned parent facts

#820/#822 earned the exact repair-defect mask

```text
(d_H,d_I) in {(0,0),(0,1),(1,0),(1,1)}
```

from either minimal raw formal-holonomy aperture

```text
[H00,H12]
[H11,H12].
```

#822 then proved the complete raw-coordinate aperture law:

```text
raw exact repair routing
iff
H12 is retained AND at least one of H00 or H11 is retained.
```

Therefore no raw-coordinate aperture in the fixed S3 terminal-formal-holonomy matrix survives erasure of H12.

This chamber asks whether that raw-coordinate fragility can be repaired at the **receiver representation layer** by one derived binary witness while preserving source custody and zero authority.

## Preregistered systematic augmentation problem

Let

```text
x=(d_H,d_I) in {0,1}^2.
```

For every Boolean function

```text
f:{0,1}^2 -> {0,1},
```

form the three-coordinate receiver label

```text
E_f(x)=(d_H,d_I,f(d_H,d_I)).
```

Call `E_f` **one-coordinate-erasure robust for exact repair routing** iff deleting any one of its three coordinates leaves a two-coordinate projection that still distinguishes all four repair masks exactly.

There are exactly

```text
2^4 = 16
```

Boolean functions on the four repair masks.

### Preregistered systematic target

Exactly two of the sixteen functions should survive all three single-coordinate erasures:

```text
XOR : f(d_H,d_I)=d_H xor d_I
XNOR: f(d_H,d_I)=1-(d_H xor d_I).
```

Using lexicographic input order

```text
(0,0),(0,1),(1,0),(1,1)
```

the two truth tables are

```text
XOR  = [0,1,1,0]
XNOR = [1,0,0,1].
```

Do not trust these because they are written here. Implementation and hostile must enumerate all 16 truth tables independently.

## Preregistered unrestricted binary-representation problem

A general ordered `m`-bit receiver encoding of the four repair classes is an ordered tuple of Boolean coordinate functions

```text
F=(f_1,...,f_m),
```

with each `f_j` chosen from the 16 possible Boolean functions.

For `m=2` there are

```text
16^2 = 256
```

ordered binary receiver encodings.

For `m=3` there are

```text
16^3 = 4096.
```

Call an encoding **one-coordinate-erasure robust** iff deleting any one coordinate leaves an injective label on the four repair classes.

### Preregistered unrestricted targets

Two-bit case:

```text
0 of 256
```

should be one-coordinate-erasure robust.

Three-bit case:

```text
48 of 4096
```

should be one-coordinate-erasure robust.

Every successful three-bit encoding should have image exactly one of the two four-point parity subsets of `{0,1}^3`:

```text
EVEN = {000,011,101,110}
ODD  = {001,010,100,111}.
```

The class-to-label assignment may permute the four parity words; the theorem concerns the image geometry only.

This is a finite receiver-label classification. It is not a universal coding theorem.

## Candidate minimal-representation theorem

If the exhaustive classification survives:

```text
THREE_BINARY_RECEIVER_COORDINATES_ARE_MINIMAL_FOR_EXACT_FOUR_CLASS_REPAIR_ROUTING_THAT_SURVIVES_ARBITRARY_ONE_COORDINATE_ERASURE_IN_THE_FIXED_S3_AIA_REPAIR_FIXTURE.
```

The lower bound must be established both structurally and by exhaustive enumeration of all 256 ordered two-bit encodings.

Structural bound:

```text
with only two binary coordinates,
a one-coordinate erasure leaves one binary coordinate,
which can carry at most two distinct labels,
strictly fewer than the four repair classes.
```

## Candidate parity-completion theorem

Within the systematic family retaining the already-earned defect bits as the first two coordinates:

```text
ONE_DERIVED_BOOLEAN_WITNESS_COMPLETES_THE_TWO_BIT_REPAIR_MASK_TO_ARBITRARY_ONE_COORDINATE_ERASURE_ROBUSTNESS_IFF_THE_DERIVED_WITNESS_IS_PARITY_OR_COMPLEMENT_PARITY_IN_THE_FIXED_S3_FIXTURE.
```

The positive XOR representation is

```text
P(d_H,d_I)=(d_H,d_I,d_H xor d_I).
```

Any two surviving coordinates reconstruct the original repair mask:

```text
erase parity -> keep (d_H,d_I)
erase d_H    -> d_H = parity xor d_I
erase d_I    -> d_I = parity xor d_H.
```

XNOR must work analogously under complement parity.

## Tomography closure burden

This chamber must not stop at label recovery.

For each of the two successful systematic derived witnesses, for each of the three possible erased coordinates, and for each of the four earned holonomy repair classes:

1. recover the exact defect mask from the two surviving receiver coordinates;
2. decode the already-earned minimum-cost class-robust replay row using #820's closed-form replay decoder;
3. verify that decoded row equals the inherited #818 class-conditioned policy row;
4. verify exact class-robust unimodular rescue for every schedule compatible with that holonomy class;
5. execute exact replay-assisted state reconstruction for every compatible schedule and all `125` states in `[-2,2]^3`.

There are six total S3 schedules across the four classes, so the minimum reconstruction burden is

```text
2 successful systematic witnesses
x 3 single-coordinate erasures
x 6 schedules
x 125 states
= 4500 exact reconstructions.
```

The old three-observation nonidentifiability certificates remain historical facts. Derived receiver parity must not be narrated as retroactive information existence.

## Required hostiles

The hostile suite must independently establish:

- all 16 Boolean truth tables enumerated;
- exactly 2 systematic successes;
- exact XOR/XNOR truth tables;
- named failing controls:
  - constant 0;
  - constant 1;
  - duplicate `d_H`;
  - duplicate `d_I`;
- all 256 ordered two-bit encodings enumerated;
- zero one-erasure-robust two-bit encodings;
- all 4096 ordered three-bit encodings enumerated;
- exactly 48 one-erasure-robust three-bit encodings;
- every successful 3-bit encoding image equals EVEN or ODD parity subset;
- both parity subsets actually occur;
- every successful encoding has minimum pairwise Hamming distance at least 2 on its four class labels;
- no unsuccessful image may be silently promoted by relabeling the classes;
- both #820 minimal raw apertures normalize to the same defect mask and therefore support the same parity completion;
- erasure recovery retains exact #818/#820 policy rows;
- 4500 exact replay-assisted state reconstructions;
- schedule identity remains separate and mixed-class ambiguity remains real;
- #822 raw-coordinate impossibility remains true: derived parity is not a raw holonomy entry;
- Ash receives bounded child-legible truth only;
- Loom may receive the technical finite truth-table/encoding/erasure atlas;
- custody remains receiver-invariant;
- every authority coordinate remains false.

## Ash projection ceiling

Ash may receive truths such as:

```text
THREE_SMALL_CLUES_CAN_BE_ARRANGED_SO_ANY_TWO_STILL_TELL_US_WHICH_REPAIR_TO_USE
THE_THIRD_CLUE_IS_DERIVED_FROM_THE_TWO_REPAIR_CLUES
LOSING_ONE_OF_THE_THREE_DOES_NOT_ERASE_THE_REPAIR_CHOICE_IN_THIS_FIXTURE
THIS_EXTRA_CLUE_DOES_NOT_RECOVER_THE_FORGOTTEN_TEMPORAL_ORDER
```

Ash must not receive:
- raw holonomy matrices;
- parity truth tables;
- Boolean enumeration atlas;
- erasure decoder formulas;
- replay vectors;
- inverse matrices;
- latent state coordinates.

## Mandatory scars

```text
DERIVED_PARITY_WITNESS != RAW_HOLONOMY_COORDINATE
REPRESENTATIONAL_REDUNDANCY != NEW_SENSOR_INFORMATION
PARITY_COMPLETION_IN_THIS_FIXTURE != UNIVERSAL_ERROR_CORRECTING_CODE
FINITE_BINARY_ENCODING_CLASSIFICATION != SHANNON_THEOREM
ONE_COORDINATE_ERASURE != PHYSICAL_SENSOR_FAILURE
ERASURE_ROBUST_REPAIR_ROUTING != COMPLETE_SCHEDULE_RECONSTRUCTION
DERIVED_RECEIVER_LABEL != SOURCE_CUSTODY_MUTATION
REPAIR_MASK_RECOVERY != RETROACTIVE_INFORMATION_EXISTENCE
MINIMAL_THREE_BIT_REPRESENTATION != UNIVERSAL_MINIMAL_SUFFICIENT_STATISTIC
PARITY_SUBSET_OF_BINARY_CUBE != PHYSICAL_TOPOLOGICAL_CODE
EXACT_REPLAY_RECONSTRUCTION_AFTER_ROUTING != OPERATIONAL_INVERSE_ROUTE
```

## Constitutional footprint

Keep the theorem-bearing net footprint to four paths:

```text
this preregistration
new implementation JS
new hostile test
A15-R0 review-hardening sentinel
```

Hardening parent must be exact #822 receipt

```text
012024d9a0d7bdb21721ede40dfe9f029de09717.
```

Exact ancestry must preserve

```text
#822 -> #820 -> #818 -> #812 -> #810 -> #807 -> #804 -> #802 -> #800 -> #798 -> #796 -> #794 -> #792 -> #790/#752.
```

At freeze require:
- exactly 4 commits from #822;
- 0 behind;
- merge base exactly #822 receipt;
- exactly four declared live chamber paths;
- zero inherited theorem-source mutation beyond rolling hardening declaration.

Then open:

```text
canonical stacked draft PR -> #822 branch
witness-only draft PR       -> main
```

Do not call 𝄐 until exact-head TD613 Consolidated Validation has:

```text
classifier SUCCESS
Dome-World static step 9 SUCCESS
A15-R0 constitutional step 19 SUCCESS
contracts SUCCESS
aggregate SUCCESS.
```

If step 19 reds, preserve the red and diagnose it. Do not weaken the hostile.

## Hard ceilings

Still false / unearned:
- universal coding theorem;
- Shannon/entropy/channel-capacity claim;
- universal error-correction theorem;
- physical sensor redundancy/failure model;
- physical/Berry/gauge holonomy;
- physical quasicrystal or moire claim;
- continuum tomography;
- semantic-equivalence claim;
- complete schedule reconstruction from the repair label;
- live Ash/Loom runtime;
- Proto-Loom/A16;
- #788 promotion by implication;
- operational inverse route;
- merge / publication / production / release / Vercel authority.

#718 remains alive.

𝌋‌⟐

**HOLONOMY PARITY COMPLETION / ERASURE-ROBUST AIA STARTUP — PREREGISTERED / UNEARNED.**

Sealed ⟐
