𝌋

# Partition Tomography · Two-Move Kernel Substitution Assay v0.1

**Status:** PREREGISTERED / PRE-COMPUTATION / RESEARCH-ONLY  
**Technical identity:** `td613.aia.partition-kernel-substitution-two-move/v0.1`  
**Parent one-move receipt:** `1fd3004dfcf864bbf3ac84387bd43b548be3a42c`  
**Branch:** `research/partition-kernel-substitution-20260823`  
**Production mutation:** NONE  
**Vercel authority:** NONE

---

## 0. Purpose

The one-membership-move assay earned a narrow fail-safety result for the ZERO-bucket decoder:

```text
one non-ZERO membership move
-> no wrong unique decoded direction
```

because one move can remove the true kernel witness or add an extra witness, but cannot simultaneously replace the true witness with one false witness while preserving a two-member ZERO bucket.

This chamber attacks that exact combinatorial boundary.

> Can two coordinated membership moves transform a clean partition into another perfectly lawful-looking partition whose ZERO bucket contains a wrong unique kernel witness?

---

## 1. Frozen ecology and observations

Inherited eight-state ecology:

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

Inherited clean projective predictions:

```text
       q3       q4
H0   [1,13]   [1,9]
H1   [1,12]   [1,20]
H2   [1,19]   [1,18]
H3   [1,20]   [1,29]
```

Each clean partition must first verify:

```text
ZERO bucket = {ZERO, one true kernel witness}
all other non-ZERO calibration states occupy singleton blocks
```

If this preflight fails, the substitution operator must not silently assume it.

---

## 2. Exact two-move substitution operator

For one clean partition with true kernel witness `K_true`:

1. choose any wrong non-ZERO calibration state `W != K_true`;
2. move `K_true` out of the ZERO block into the clean block containing `W`;
3. move `W` out of that block into the ZERO block;
4. canonicalize blocks.

Under the clean singleton preflight, this swaps `K_true` and `W` between their observational roles while preserving all candidate identities exactly once.

The resulting ZERO block is:

```text
{ZERO, W}
```

There are exactly six wrong-witness choices per clean observation if the seven non-ZERO calibration states remain distinct.

Across:

```text
4 hypotheses x 2 probes
```

the expected corruption family size is:

```text
8 x 6 = 48
```

This family is intentionally narrower than arbitrary two-move corruption.

---

## 3. Decoder A — ZERO-bucket kernel decoder

Apply the inherited decoder literally.

Because the corrupted ZERO block retains exactly one nonzero witness, the decoder must return a unique projective direction.

Freeze whether it is:

```text
CORRECT_UNIQUE
WRONG_UNIQUE
```

Do not predeclare the count.

If the decoder ever returns the original direction despite `W != K_true`, materialize why.

---

## 4. Decoder B — full-partition model consistency

Enumerate all 32 projective linear-readout partitions on the same ecology.

For each substituted partition freeze:

```text
0 compatible directions -> MODEL_DEFEAT
1 compatible direction  -> UNIQUE_MODEL_CONSISTENT_DIRECTION
>1 compatible directions -> AMBIGUOUS
```

Crucial hostile possibility:

```text
substituted partition = exact clean partition of another lawful readout direction
```

If that occurs, full-partition consistency cannot detect the history of corruption from the final partition alone.

Required anti-equivalence:

```text
lawful final partition
!=
uncorrupted provenance
```

---

## 5. Partition-distance ledger

For every clean/substituted pair freeze:

```text
moved_candidate_count = 2
original_kernel_id
substitute_kernel_id
clean_partition_signature
substituted_partition_signature
```

Also compare the substituted partition against every clean projective readout partition in `P^1(F_31)`.

If it equals another lawful partition, freeze the corresponding projective direction.

This chamber uses candidate-reassignment count as a bookkeeping distance only. It does not claim a metric geometry over all partitions.

---

## 6. Primary-corruption end-to-end trials

For each true hypothesis and every substitution of its `q3` partition:

1. decode the substituted primary partition;
2. compare decoded direction to the frozen `q3` hypothesis prediction table;
3. if exactly one hypothesis matches, select it provisionally;
4. decode the true clean held-out `q4` partition independently;
5. compare selected hypothesis's held-out prediction with the clean decoded `q4` direction.

Freeze:

```text
wrong_primary_hypothesis_selected_then_heldout_rejects
wrong_primary_hypothesis_selected_then_false_heldout_pass
primary_direction_outside_hypothesis_signature_table
```

The held-out direction may not participate in primary selection.

---

## 7. Held-out-corruption end-to-end trials

For each true hypothesis:

1. classify it correctly from its clean `q3` partition;
2. substitute every wrong witness into its `q4` ZERO bucket using the exact two-move operator;
3. decode the substituted held-out partition;
4. compare against the selected true hypothesis's frozen `q4` prediction.

Freeze:

```text
heldout_wrong_unique_direction
heldout_disagreement_with_correct_primary
heldout_accidental_false_pass
```

Governance note:

A held-out disagreement after a clean primary classification must be recorded as an **evidence conflict**. This assay does not authorize automatic rejection of the primary hypothesis, because the experiment does not identify which observation packet was corrupted.

Allowed safety relation if warranted:

```text
validation disagreement
!=
proof primary inference was wrong
```

---

## 8. Decoder-comparison interpretation

If both Decoder A and Decoder B return the same wrong unique direction for a substituted partition, the failure belongs to the **observation equivalence class**, not merely to the cheap ZERO-bucket decoder.

That result would establish, only for this fixture:

```text
full model consistency cannot distinguish two histories that terminate at the same lawful partition
```

This is a provenance limitation, not a failure of finite-field algebra.

---

## 9. Falsifiers / ceilings

The assay fails if:

1. the two-move operator duplicates or drops candidate identities;
2. clean singleton preflight is assumed rather than verified;
3. scalar bucket labels leak into either decoder;
4. oracle truth resolves a lawful wrong partition;
5. clean held-out q4 is used during primary selection;
6. a held-out conflict automatically overwrites the clean primary inference;
7. arbitrary two-move or multi-packet attack tolerance is inferred from this narrow substitution family.

Possible bounded outcomes include:

```text
TWO_MOVE_KERNEL_SUBSTITUTION_CAN_CREATE_LAWFUL_WRONG_PARTITION
```

and, if measured:

```text
CLEAN_HELDOUT_PACKET_REJECTS_WRONG_PRIMARY_HYPOTHESIS_SELECTION
```

No adversarial security guarantee, arbitrary corruption theorem, physical robustness, Proto-Loom, production, or Vercel authority follows.

𝌋

⟐
