# Pedagogue Replay-Stable Task Code · One-Bit Corruption Assay v0.1

Status: **PREREGISTERED / PRE-IMPLEMENTATION / RESEARCH-ONLY / HUMAN-REOPENED**  
Technical identity: `td613.pedagogue.replay-stable-task-code-one-bit/v0.1`  
Parent task-conditioned ledger: `TASK_CONDITIONED_TRADEOFF_LEDGER_V0_1.json`  
Research branch: `research/pedagogue-structured-probe-coverage-20260823`  
Production baseline source packet: `721de28a8ef4d160e87d46bc1e9107bd249a0db0`  
Post-release relock baseline: `153f0a69a23ab7e665f2386a51406821b62be01d`  
Promotion authority: **FALSE**  
Production / Vercel authority: **NONE**

---

## 0. Why this assay exists

The B-centered task-conditioned holdout earned a bounded clean-signature result:

```text
U universal: 8 detected / 0 exact task-localized
C task-cycle: 8 detected / 8 exact task-localized
Q equal-exposure hostile: 8 detected / 4 exact task-localized
```

That result was obtained under a deterministic decoder whose 12-bit observation signature exactly reproduced the frozen incidence code.

The next question is therefore not another clean replay.

> Does the clean task-localization ordering survive a hostile but fully preregistered perturbation of the observation surface?

This assay treats replay stability as a separate property:

```text
clean task localization
!=
error-tolerant task localization
```

---

## 1. Frozen arms and task universe

Reuse without mutation:

```text
T_B = {AB,BC,BD,BE,BF,BG,BH,BI}
```

Arms:

```text
U = universal Steiner schedule
C = B-centered cycle-coded task schedule
Q = B-centered equal-exposure collision-prone hostile schedule
```

No schedule may be edited after this preregistration.

The A-centered development pilot remains excluded from confirmatory evidence.

---

## 2. Frozen corruption family

For every arm and every true target relation `q in T_B`:

1. start from the exact frozen 12-bit task signature `sigma(q)`;
2. choose each bit position `j in {0,...,11}` exactly once;
3. invert only that bit:

```text
0 -> 1
1 -> 0
```

This produces:

```text
8 target pairs
x 12 single-bit corruption positions
= 96 corrupted cases per arm
```

No RNG is permitted.

No corruption position may be omitted because it is inconvenient.

No two-bit or higher corruption is authorized in this assay.

Interpretation is limited to a deterministic one-block decoded-state error model.

---

## 3. Frozen decoder

The prior exact-match task decoder is not adequate once a signature is deliberately corrupted.

For each corrupted signature `s'`, compute Hamming distance to every frozen task codeword:

```text
d(r) = Hamming(s', sigma(r))
```

Let:

```text
d_min = min_r d(r)
N(s') = {r in T_B : d(r) = d_min}
```

Decoder outcome:

```text
|N(s')| = 1
  -> UNIQUE_NEAREST

|N(s')| > 1
  -> AMBIGUOUS_NEAREST_ABSTAIN
```

If the unique nearest candidate equals the true pair:

```text
UNIQUE_CORRECT
```

If the unique nearest candidate differs from the true pair:

```text
UNIQUE_WRONG
```

For an ambiguous nearest set, report separately whether the true pair is contained in the tie.

The decoder may not use the oracle pair identity to break ties.

---

## 4. Required case ledger

Every one of the 96 cases per arm must preserve:

```text
true_pair
clean_signature
corruption_bit_index
corruption_direction
corrupted_signature
nearest_distance
nearest_candidate_set
unique_nearest
selected_pair or NONE
true_pair_in_nearest_set
outcome_class
```

Allowed outcome classes:

```text
UNIQUE_CORRECT
UNIQUE_WRONG
AMBIGUOUS_WITH_TRUTH
AMBIGUOUS_WITHOUT_TRUTH
```

No case may be silently dropped.

---

## 5. Required arm-level vector

For each arm report:

```text
case_count = 96
unique_correct_count
unique_wrong_count
ambiguous_with_truth_count
ambiguous_without_truth_count
true_pair_in_nearest_set_count
mean_nearest_distance
maximum_nearest_distance
```

Also preserve the clean baseline:

```text
U clean exact = 0/8
C clean exact = 8/8
Q clean exact = 4/8
```

Do not combine clean and corrupted results into one score.

---

## 6. Primary research question

The clean task-localization ordering is:

```text
C > Q > U
```

The assay asks:

> Under the exhaustive single-bit corruption family and frozen nearest-Hamming decoder, does C retain a greater number of uniquely correct task localizations than Q and U?

Possible bounded outcomes include:

```text
CLEAN_TASK_PREFERENCE_SURVIVES_ONE_BIT_REPLAY_FAMILY

CLEAN_TASK_PREFERENCE_WEAKENS_UNDER_ONE_BIT_REPLAY_FAMILY

CLEAN_TASK_PREFERENCE_REVERSES_UNDER_ONE_BIT_REPLAY_FAMILY
```

No outcome is preselected.

---

## 7. Mandatory hostile interpretation

The task-cycle code has preregistered clean minimum Hamming distance:

```text
d_min(C) = 2
```

This does **not** grant one-bit error-correction capability by theorem.

Required anti-equivalence:

```text
positive minimum code distance
!=
one-bit correctability
```

A code with minimum distance 2 may detect separation at the clean surface while still produce nearest-neighbor ties after a one-bit corruption.

If C collapses substantially, preserve that collapse.

---

## 8. Falsifiers and failure conditions

The replay-stability candidate fails or weakens if:

1. C loses its clean localization advantage under the corrupted family;
2. C produces a substantial unique-wrong rate hidden by reporting only `true_pair_in_nearest_set`;
3. the implementation breaks ties using oracle truth;
4. any arm receives fewer than all 96 preregistered corruptions;
5. the decoder is changed after outcome inspection;
6. the clean task-conditioned receipt is rewritten to accommodate the corrupted result;
7. a corruption-robustness result is promoted into global schedule superiority;
8. Hamming-distance behavior is called physical noise calibration or empirical sensor robustness.

---

## 9. Claim ceiling

A passing result may speak only about:

```text
this exact B-centered task codebook
this exact exhaustive one-bit decoded-state corruption family
this exact nearest-Hamming decoder
```

It may not establish:

- stochastic channel robustness;
- empirical error rates;
- coding-theory optimality;
- adaptive error correction;
- optimal experimental design;
- universal replay stability;
- physical sensing;
- tomography;
- curvature / coverage curvature;
- Pedagogue law promotion;
- production / UI / browser / Vercel authority.

---

## 10. Implementation order

```text
1. freeze this preregistration
2. implement generic exhaustive one-bit corruption engine
3. execute all 96 cases per arm
4. freeze ONE_BIT_REPLAY_STABILITY_RECEIPT
5. compile contradiction ledger against clean task-conditioned ledger
6. stop before two-bit corruption, stochastic noise, optimization, adaptation, PR, browser, UI, or release
```

Human closure remains required.

𝌋

⟐
