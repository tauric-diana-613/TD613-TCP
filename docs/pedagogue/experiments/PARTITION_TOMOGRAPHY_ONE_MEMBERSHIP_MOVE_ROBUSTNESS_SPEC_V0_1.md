𝌋

# Partition Tomography · One-Membership-Move Robustness Assay v0.1

**Status:** PREREGISTERED / PRE-COMPUTATION / RESEARCH-ONLY  
**Technical identity:** `td613.aia.partition-tomography-one-membership-move-robustness/v0.1`  
**Parent co-design receipt:** `b06658465437d72bb2344a8b5dceb34241558327`  
**Branch:** `research/partition-tomography-one-edit-robustness-20260823`  
**Production mutation:** NONE  
**Vercel authority:** NONE

---

## 0. Question

The inherited co-designed instrument uses:

```text
primary probe = q3=[1,11]
held-out probe = q4=[1,19]
calibration ecology = ZERO + 7 kernel witnesses
state count = 8
```

and exactly identifies each of four preregistered loop hypotheses under clean unlabeled partitions.

This assay asks:

> What survives if one non-ZERO candidate identity is assigned to the wrong partition block, and how much robustness comes from the decoder versus from the partition geometry itself?

Efficiency under clean observations is not promoted into corruption robustness.

---

## 1. Frozen ecology and hypothesis table

Calibration states inherited without mutation:

```text
ZERO
D_12
D_13
D_16
D_17
D_18
D_19
D_24
```

Frozen hypotheses and projective predictions:

```text
       q3       q4
H0   [1,13]   [1,9]
H1   [1,12]   [1,20]
H2   [1,19]   [1,18]
H3   [1,20]   [1,29]
```

The hidden truth is rotated exhaustively across `H0..H3`.

---

## 2. Clean partition contract

For a projective readout direction `r`, the unlabeled partition of the eight-state ecology is:

```text
v ~_r w iff r v = r w
```

Only candidate-ID block membership is retained.

The named `ZERO` identity is a trusted calibration anchor and is never reassigned by the corruption operator in this assay.

No scalar bucket value survives into the decoder.

---

## 3. One-membership-move corruption family

Given a clean partition `Pi`:

1. choose one candidate ID `s != ZERO`;
2. let `B_source` be its clean block;
3. choose a different existing clean block `B_target`;
4. move `s` from `B_source` to `B_target`;
5. if `B_source` becomes empty, remove that empty block;
6. canonicalize membership blocks by sorted candidate IDs.

Exactly one candidate identity changes block.

No candidate is duplicated or deleted. `ZERO` remains present exactly once.

The exhaustive family contains every legal `(s,B_target)` move for every clean `q3` and `q4` partition under every hidden truth.

This corruption family does **not** include:

```text
ZERO-anchor corruption
two simultaneous membership moves
candidate deletion
duplicate candidate identity
scalar-label corruption
raw-vector corruption
```

Those require separate chambers.

---

## 4. Decoder A — ZERO-bucket kernel decoder

Inherited decoder:

```text
find block containing ZERO
```

Governed outputs:

```text
{ZERO, exactly one nonzero kernel state}
  -> recover that projective readout direction

{ZERO}
  -> KERNEL_DIRECTION_NOT_REPRESENTED_IN_OBSERVED_ZERO_BUCKET

{ZERO, two or more nonzero states}
  -> ZERO_BUCKET_AMBIGUOUS_UNDER_MEMBERSHIP_CORRUPTION
```

The decoder may not inspect other blocks.

For every corrupted partition freeze whether Decoder A returns:

```text
CORRECT_DIRECTION
WRONG_UNIQUE_DIRECTION
ABSTAIN_MISSING
ABSTAIN_AMBIGUOUS
```

No assumption is made that one membership move guarantees safety; the exhaustive ledger must decide.

---

## 5. Decoder B — full-partition consistency decoder

The stronger decoder knows:

```text
calibration state vectors
candidate IDs
F_31 linear-readout model
```

but receives only unlabeled partition membership.

Enumerate all 32 projective readout directions in `P^1(F_31)`.

For each direction `r`, generate its exact unlabeled partition on the same eight-state ecology.

Given an observed partition `Pi_obs`, define:

```text
compatible_directions(Pi_obs)
= { r : Pi(r) = Pi_obs }
```

Governed outputs:

```text
|compatible| = 1
  -> UNIQUE_MODEL_CONSISTENT_DIRECTION

|compatible| > 1
  -> MODEL_CONSISTENT_DIRECTION_AMBIGUITY

|compatible| = 0
  -> PARTITION_OUTSIDE_LINEAR_READOUT_MODEL_SUPPORT
```

No nearest partition, edit-distance repair, or oracle direction is permitted.

For every corrupted partition freeze whether Decoder B returns:

```text
CORRECT_UNIQUE
WRONG_UNIQUE
AMBIGUOUS
MODEL_DEFEAT
```

---

## 6. Clean-control obligations

Before corruption analysis:

```text
all eight inherited clean observation partitions
= four truths x {q3,q4}
```

must decode to the correct projective direction under both decoders.

If Decoder B finds multiple projective directions for any inherited clean partition, the current eight-state ecology is not cleanly identifiable under the stronger model and the downstream robustness assay must preserve that fact.

---

## 7. Structural distinction to measure

A corrupted partition can fall into at least three epistemically distinct classes:

```text
1. corrupted but target direction still recoverable
2. corrupted and detectable as model-inconsistent/ambiguous
3. corrupted and observationally identical to a different valid readout partition
```

Class 3 is the dangerous case: a corrupted observation may be perfectly lawful under the model while pointing to the wrong direction.

The assay must search exhaustively for such cases rather than assuming validation detects corruption.

Canonical anti-equivalence:

```text
correct decoded direction
!=
proof partition was uncorrupted
```

and:

```text
model-consistent partition
!=
historically correct partition
```

---

## 8. End-to-end primary corruption trials

For each hidden truth `Hj` and each one-move corruption of its `q3` partition:

1. decode corrupted primary partition;
2. classify surviving hypotheses using only the decoded primary direction if unique;
3. keep the true `q4` partition clean;
4. decode held-out direction independently;
5. compare selected hypothesis prediction to decoded held-out direction.

For each decoder strategy freeze:

```text
correct_primary_identification
wrong_primary_identification
primary_abstention_or_model_defeat
wrong_primary_then_heldout_rejected
wrong_primary_then_false_heldout_pass
```

A false held-out pass after a wrong primary identification is the highest-risk outcome in this one-move chamber.

---

## 9. End-to-end held-out corruption trials

For each hidden truth `Hj`:

1. keep its `q3` primary partition clean and classify the hypothesis correctly;
2. apply every one-move corruption to its `q4` partition;
3. decode corrupted held-out partition;
4. compare with the already-selected hypothesis prediction.

Freeze:

```text
heldout_correct_pass
heldout_corruption_detected_or_abstained
heldout_false_rejection
heldout_wrong_unique_but_accidentally_matching_prediction
```

A corrupted held-out observation may not overwrite the clean primary classification.

---

## 10. Comparative robustness metrics

For Decoder A and Decoder B freeze exact counts and rates over the same exhaustive corruption ledger:

```text
unique_correct
unique_wrong
abstain_or_model_defeat
ambiguous
undetected_corruption_with_correct_direction
```

For end-to-end primary-corruption trials also freeze:

```text
false_hypothesis_acceptance_rate_after_heldout
```

No scalar robustness score may collapse these classes unless a loss function is separately preregistered.

---

## 11. Falsifiers and claim ceilings

The assay fails if:

1. clean controls fail without preserving the failure;
2. any corruption count omits legal one-membership moves;
3. Decoder B receives scalar bucket labels;
4. Decoder B repairs to a nearest lawful partition rather than abstaining on zero compatible directions;
5. oracle truth is used to resolve a model-consistent wrong direction;
6. held-out `q4` is used during primary selection;
7. two-edit robustness is inferred from this one-edit family.

Possible bounded findings include:

```text
ZERO_BUCKET_DECODER_IS_FAIL_SAFE_UNDER_DECLARED_ONE_MEMBERSHIP_MOVE_FAMILY
```

only if exhaustive results show zero wrong-unique outputs;

```text
FULL_PARTITION_CONSISTENCY_REJECTS_ADDITIONAL_CORRUPTIONS_MISSED_BY_ZERO_BUCKET_DECODER
```

only if measured;

and, if present:

```text
SOME_ONE_MOVE_CORRUPTIONS_ALIAS_TO_OTHER_VALID_READOUT_PARTITIONS
```

which must remain visible rather than averaged away.

No physical robustness, adversarial security guarantee, arbitrary corruption tolerance, Proto-Loom, production, or Vercel authority follows.

𝌋

⟐
