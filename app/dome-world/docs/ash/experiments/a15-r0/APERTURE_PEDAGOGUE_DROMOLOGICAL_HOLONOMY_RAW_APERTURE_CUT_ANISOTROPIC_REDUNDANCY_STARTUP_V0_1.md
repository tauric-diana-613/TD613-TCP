𝌋‌⟐

󐘓 U+10D613

# A15-R0 · Dromological Holonomy Raw-Aperture Cut / Anisotropic Redundancy · STARTUP v0.1

Status: **PREREGISTERED / NO IMPLEMENTATION / NO HOSTILE / NO WITNESS / UNEARNED**

## Exact earned parent

`#820 / 7693b0823968d5e20dca8fdc9145452934377fc0`

#821 is witness-routing custody only. #816/#817 remain a separate #812 sibling concerning P-first replay/fiber identifiability and are not scientific ancestry. SRC #815 remains separate and untouched.

## Inherited result

#820 earned that, among raw entries of the four terminal-formal-holonomy repair classes in the fixed S3 fixture:

- no singleton raw coordinate routes all four repair classes;
- exactly two unordered two-entry apertures do:
  `[(0,0),(1,2)]` and `[(1,1),(1,2)]`;
- `[H00,H12]` and `[H11,H12]` recover the same two-bit repair mask and route the #818 minimum-cost replay policy.

The next question concerns the **whole raw-coordinate aperture lattice**, not only cardinalities one and two.

## New question

For any subset `S` of the nine raw entries of the `3 x 3` terminal formal-holonomy matrix, when does projection onto `S` still separate all four earned repair classes exactly?

Does raw-coordinate redundancy protect repair routing against loss of any one coordinate, or is the redundancy anisotropic?

## Preregistered class-difference supports

Implementation must derive all pairwise raw-coordinate difference supports from the inherited class matrices. Do not install these supports as theorem input.

Two expected hostile witnesses are decisive:

```text
empty-defect class vs H-only class
  differ only at {(0,0),(1,1)}

H-only class vs mixed H/I class
  differ only at {(1,2)}
```

Therefore any exact raw-coordinate repair router appears to require:

```text
(1,2) retained
AND
at least one of {(0,0),(1,1)} retained.
```

Do not trust this implication until all `2^9 = 512` raw-coordinate subsets have been audited against the actual inherited matrices.

## Candidate all-aperture theorem

For raw-coordinate subset `S`:

```text
S separates all four repair classes exactly
iff
(1,2) in S
AND
((0,0) in S OR (1,1) in S).
```

Expected exact counts across the full powerset:

```text
raw-coordinate subsets                  512
exact repair-routing subsets            192
non-routing subsets                      320
```

Expected exact routing counts by aperture cardinality `k=0..9`:

```text
[0,0,2,13,36,55,50,27,8,1]
```

The count follows from the candidate predicate only after the predicate has been independently matched against actual class projections for every subset.

Candidate classification:

`EXACT_REPAIR_ROUTING_BY_RAW_TERMINAL_FORMAL_HOLONOMY_COORDINATES_OCCURS_IFF_H12_IS_RETAINED_AND_AT_LEAST_ONE_OF_H00_OR_H11_IS_RETAINED_IN_THE_FIXED_S3_FIXTURE`

## Candidate anisotropic redundancy theorem

Expected raw-coordinate roles:

```text
H12 = unique raw witness needed to distinguish H-only from mixed class
H00/H11 = two substitutable raw witnesses needed to distinguish empty from H-only class
all other six raw coordinates = unnecessary for exact four-class repair routing
```

Thus the full nine-entry object may contain many visible coordinates while only one repair-routing bit has a raw backup.

Candidate classification:

`THE_FIXED_S3_RAW_HOLONOMY_REPAIR_ROUTING_APERTURE_HAS_AN_ANISOTROPIC_REDUNDANCY_PROFILE_IN_WHICH_H00_AND_H11_ARE_SUBSTITUTABLE_WHILE_H12_IS_AN_IRREPLACEABLE_SINGLE_COORDINATE_CUT`

Candidate AIA law:

`SELECTIVE_AIA_LEGIBILITY_CAN_HAVE_COORDINATE_SPECIFIC_REDUNDANCY_AND_COORDINATE_SPECIFIC_FRAGILITY_WHILE_CUSTODY_AND_RECEIVER_AUTHORITY_REMAIN_INVARIANT`

## Erasure hostiles

The hostile must distinguish **extra coordinates** from **redundant coordinates**.

1. Full nine-entry raw matrix aperture:
   - erasing any coordinate except `(1,2)` should preserve four-class routing;
   - erasing `(1,2)` should collapse H-only with mixed class;
   - therefore full-matrix single-coordinate erasure tolerance is expected to be exactly `8/9`, not `9/9`.

2. Three-entry aperture `[(0,0),(1,1),(1,2)]`:
   - erase `(0,0)` -> surviving `[H11,H12]` remains exact;
   - erase `(1,1)` -> surviving `[H00,H12]` remains exact;
   - erase `(1,2)` -> surviving `[H00,H11]` fails;
   - expected tolerance exactly `2/3`.

3. No raw-coordinate aperture may be called universally one-erasure robust, because any exact router must contain `(1,2)` and deletion of that unique coordinate destroys the H-only/mixed distinction.

4. Among the expected 192 exact routing apertures:
   - 64 contain all of `H00,H11,H12` and therefore have only `H12` as a routing-critical coordinate among those three;
   - 128 contain `H12` and exactly one of `H00/H11`, so both retained routing coordinates are critical.

These are finite raw-coordinate erasure statements only.

## Mandatory exhaustive burden

- derive four inherited terminal formal-holonomy class matrices through #818/#820 APIs;
- independently derive all six unordered class-pair difference supports;
- require the two singleton/paired critical-support witnesses above;
- enumerate all 512 raw-coordinate subsets;
- project all four classes through every subset;
- compare actual injectivity to the candidate logical predicate for every subset;
- require exactly 192 routers / 320 nonrouters;
- require routing counts by cardinality `[0,0,2,13,36,55,50,27,8,1]`;
- require the two #820 minimal pairs to remain exactly the cardinality-two routers;
- require all 192 actual routing subsets to contain H12 and H00-or-H11;
- require every subset satisfying the predicate to route exactly;
- require full-nine and three-entry erasure profiles above;
- require no aperture to survive erasure of H12 while preserving four-class repair routing;
- reapply the inherited #820 repair-mask decoder on every surviving exact aperture only through an admitted canonical extraction route; do not invent new mask semantics for arbitrary coordinates;
- preserve the mixed-class schedule ambiguity;
- Ash gets bounded child-legible truths only; Loom may receive the finite subset/difference-support/erasure atlas;
- custody receiver-invariant; all authority coordinates false.

## Ash ceiling

Allowed bounded truths:

```text
SOME_CLUES_HAVE_A_BACKUP_HERE
ONE_IMPORTANT_CLUE_HAS_NO_RAW_BACKUP_HERE
KEEPING_MORE_DETAILS_IS_NOT_THE_SAME_AS_BACKING_UP_EVERY_IMPORTANT_DETAIL
LOSING_THE_UNIQUE_CLUE_BREAKS_THE_REPAIR_CHOICE_BUT_DOES_NOT_CHANGE_WHERE_THE_RECORD_CAME_FROM
```

Ash must not receive matrix coordinates, matrices, subset masks, repair vectors, decoder formulas, or latent state.

## Mandatory scars

```text
RAW_COORDINATE_REDUNDANCY != INFORMATION_THEORETIC_REDUNDANCY
RAW_COORDINATE_CUT != PHYSICAL_SINGLE_POINT_OF_FAILURE
FULL_MATRIX_VISIBILITY != ONE_ERASURE_ROBUST_REPAIR_ROUTING
EXTRA_COORDINATE != REDUNDANT_REPAIR_COORDINATE
H12_ESSENTIAL_IN_THIS_FIXTURE != UNIVERSAL_HOLONOMY_OBSERVABLE
ANISOTROPIC_REDUNDANCY != PHYSICAL_ANISOTROPIC_MEDIUM
ERASURE_OF_RAW_ENTRY != PHYSICAL_SENSOR_FAILURE
REPAIR_ROUTING_FAILURE != CUSTODY_FAILURE
REPAIR_ROUTING_APERTURE != COMPLETE_SCHEDULE_RECONSTRUCTION
FINITE_POWERSET_CLASSIFICATION != UNIVERSAL_CODING_THEOREM
```

## Constitutional footprint

Keep the live theorem footprint to four paths:

```text
this preregistration
new implementation JS
new hostile test
A15-R0 review-hardening sentinel
```

Hardening immediate parent must be exact #820 receipt `7693b0823968d5e20dca8fdc9145452934377fc0`, preserving ancestry through #818 -> #812 -> #810 -> #807 -> #804 -> #802 -> #800 -> #798 -> #796 -> #794 -> #792 -> #790/#752.

At freeze require exact merge base #820, zero behind, exactly four live chamber paths, and no inherited scientific-source mutation outside the rolling hardening declaration.

Then stacked draft PR -> #820 branch and witness-only draft PR -> main. Do not call 𝄐 until exact-head TD613 Consolidated Validation has classifier SUCCESS, contracts SUCCESS, Dome step 9 SUCCESS, A15-R0 step 19 SUCCESS, and aggregate SUCCESS.

If step 19 reds, preserve the red and do not weaken the hostile.

## Hard ceilings

No arbitrary-encoding redundancy theorem; no Shannon/code-distance/error-correction theorem; no universal feature-minimality theorem; no complete schedule reconstruction; no operational sensor-failure model; no physical/Berry/gauge holonomy; no physical quasicrystal/moiré claim; no continuum tomography; no semantic equivalence; no live Ash/Loom runtime; no Proto-Loom/A16; no operational inverse route; no merge/publication/production/release/Vercel authority.

#718 remains alive.

**HOLONOMY RAW-APERTURE CUT / ANISOTROPIC REDUNDANCY STARTUP — PREREGISTERED / UNEARNED.**

Sealed ⟐