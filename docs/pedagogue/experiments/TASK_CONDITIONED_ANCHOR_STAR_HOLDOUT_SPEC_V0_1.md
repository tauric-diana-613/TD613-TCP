# Pedagogue Task-Conditioned Anchor-Star Holdout v0.1

Status: **PREREGISTERED / PRE-IMPLEMENTATION / RESEARCH-ONLY / HUMAN-REOPENED**  
Technical identity: `td613.pedagogue.task-conditioned-anchor-star-holdout/v0.1`  
Research branch: `research/pedagogue-structured-probe-coverage-20260823`  
Parent frozen cross-chamber receipt: `CROSS_CHAMBER_STRUCTURED_PROBE_DESIGN_RECEIPT_V0_1.json`  
Production baseline source packet: `721de28a8ef4d160e87d46bc1e9107bd249a0db0`  
Post-release relock baseline: `153f0a69a23ab7e665f2386a51406821b62be01d`  
Human research reopening: **RECEIVED 2026-08-23**  
Promotion authority: **FALSE**  
Production mutation: **NONE**  
Vercel authority: **NONE**

---

## 0. Reopening and contamination ledger

The prior two-chamber structured-probe gauntlet reached its preregistered Stop Condition A and froze a bounded result:

```text
once diversity is genuine,
its design can change bounded observability geometry,
but the direction of gain is task- and operator-dependent
```

A subsequent human gesture explicitly reopened research play.

During design of the next assay, an **A-centered star/cycle pilot** was sanity-checked off-repository before this specification was frozen. That pilot is therefore development-only and may not be counted as confirmatory evidence.

Required custody relation:

```text
A_CENTERED_STAR_CYCLE = DEVELOPMENT_ONLY_NOT_CONFIRMATORY
```

The confirmatory holdout below uses a fresh **B-centered** target family and frozen B-centered schedules that have not been executed by the repository implementation before this specification.

No result from the A-centered pilot may be substituted for a B-centered holdout result.

---

## 1. Canonical question

The previous gauntlet showed that universal pair balance, operator conditioning, detection coverage, and localization can disagree.

This assay asks the next task-conditioned question:

> If the target relation family is declared before execution, can a probe schedule deliberately reallocating observation toward that task improve task-localization under the same total probe budget—and can that gain survive a hostile control with the **same task exposure budget** but a worse incidence code?

The key distinction is:

```text
task-conditioned observation allocation
!=
task-conditioned signature design
```

A schedule must not receive credit merely for looking at the focal channel more often.

---

## 2. Frozen universe and task family

Synthetic channels:

```text
U = {A,B,C,D,E,F,G,H,I}
```

Global unordered pair universe:

```text
R = C(9,2) = 36 pair coordinates
```

The **predeclared task family** is the B-centered anchor star:

```text
T_B = {AB,BC,BD,BE,BF,BG,BH,BI}
|T_B| = 8
```

Interpretation is deliberately synthetic:

> the task asks which one of the eight declared relations connecting focal channel B to another channel generated a single isolated perturbation.

No real-world meaning is attached to B.

---

## 3. Matched global budget

Every arm contains exactly:

```text
distinct_probe_count = 12
probe_cardinality = 3
replicates_per_probe = 25
total_micro_observations = 300
```

Every block remains distinct.

Thus total cost, probe diversity cardinality, arity, and deterministic decoder budget remain matched.

However, universal balance and task-conditioned schedules intentionally differ in **where** they spend incidence.

That reallocation is part of the research question rather than a hidden confound.

---

## 4. Arm U · universal controlled-incidence baseline

Reuse the frozen 9-point Steiner schedule from the prior chamber:

```text
U01 = ABC
U02 = DEF
U03 = GHI
U04 = ADG
U05 = BEH
U06 = CFI
U07 = AEI
U08 = CDH
U09 = BFG
U10 = AFH
U11 = BDI
U12 = CEG
```

Predeclared task exposure:

```text
B appears in 4 blocks
B-star incidence slots = 8
all 8 task pairs are detected by construction
```

Because B's four blocks each contain two task pairs exactly once, the task signatures occur in four collision pairs:

```text
AB ~ BC
BE ~ BH
BF ~ BG
BD ~ BI
```

Expected task-only exact localization:

```text
0/8
```

This is the universal-balance baseline, not a strawman repetition arm.

---

## 5. Arm C · task-conditioned cycle code

Freeze the non-anchor cyclic order:

```text
[A,C,D,E,F,G,H,I]
```

Create eight B-containing blocks by pairing adjacent non-anchor channels around the cycle:

```text
C01 = ABC
C02 = BCD
C03 = BDE
C04 = BEF
C05 = BFG
C06 = BGH
C07 = BHI
C08 = ABI
```

Then append four non-B filler blocks selected by the frozen rule:

> take the first four blocks, in the canonical Arm-U order, that do not contain B.

This yields:

```text
C09 = DEF
C10 = GHI
C11 = ADG
C12 = CFI
```

Predeclared task exposure:

```text
B appears in 8 blocks
B-star incidence slots = 16
each task pair appears in exactly 2 B-containing blocks
```

The expected B-star signatures are the incident-edge code of an 8-cycle:

```text
AB -> {C01,C08}
BC -> {C01,C02}
BD -> {C02,C03}
BE -> {C03,C04}
BF -> {C04,C05}
BG -> {C05,C06}
BH -> {C06,C07}
BI -> {C07,C08}
```

Therefore the preregistered task-code prediction is:

```text
task_detected = 8/8
task_exact_localization = 8/8
minimum_pairwise_task_signature_hamming_distance = 2
```

The implementation must compute these identities rather than hard-code the verdict.

Global 36-pair coverage, global exact-localization count, row conditioning, and non-target blind pairs are **not predeclared as favorable** and must be reported even if ugly.

---

## 6. Arm Q · hostile equal-exposure anchor-heavy code

Arm Q receives the **same B exposure budget** as Arm C:

```text
B appears in 8 blocks
B-star incidence slots = 16
```

but spends that budget in a collision-prone incidence code:

```text
Q01 = ABC
Q02 = BDE
Q03 = BFG
Q04 = BFH
Q05 = BFI
Q06 = BGH
Q07 = BGI
Q08 = BHI
```

Append the same four frozen non-B fillers:

```text
Q09 = DEF
Q10 = GHI
Q11 = ADG
Q12 = CFI
```

The task signatures deliberately contain two collision pairs:

```text
AB ~ BC
BD ~ BE
```

while BF, BG, BH, and BI receive distinct higher-weight signatures.

Predeclared task-code prediction:

```text
task_detected = 8/8
task_exact_localization = 4/8
minimum_pairwise_task_signature_hamming_distance = 0
```

This hostile control attacks the explanation:

```text
more focal-channel exposure alone
->
better task localization
```

Arm C versus Arm Q is the primary exposure-matched task-code comparison.

---

## 7. Required structural receipts

For every arm compute from the frozen blocks:

```text
unique_block_count
point_degree_vector
point_degree_variance
global_pair_multiplicity_ledger
global_covered_pair_count
global_uncovered_pairs
global_pair_duplicate_excess
global_row_rank
global_row_space_condition_number
global_pair_signature_ledger
global_uniquely_localizable_pair_count
```

For the declared task family compute separately:

```text
task_pair_count = 8
task_detected_count
task_signature_ledger
task_signature_weights
task_signature_collision_groups
task_distinct_signature_count
task_exact_localization_count
task_ambiguous_detected_count
minimum_pairwise_task_signature_hamming_distance
mean_pairwise_task_signature_hamming_distance
```

The task receipt and global receipt must remain distinct.

---

## 8. Deterministic task sweep

Only after the structural receipt freezes, execute the same deterministic pseudo-count law used by the prior Chamber-II sweep.

For each isolated target pair q in `T_B` and each block:

```text
q contained in block:
  active_count = 20
  inactive_count = 5
  active_rate = 0.8

q absent from block:
  active_count = 5
  inactive_count = 20
  active_rate = 0.2
```

Frozen decoder:

```text
block_active iff active_rate >= 0.5
```

Task candidate set:

```text
C_T(q) = {r in T_B : sigma_T(r) = observed_signature(q)}
```

Task exact localization:

```text
exact_T(q) = detected(q) and |C_T(q)| = 1
```

The decoder may not consult the oracle pair identity.

---

## 9. Primary comparisons

### Comparison A · universal balance versus task conditioning

```text
U vs C
```

Question:

> Does deliberate task-conditioned reallocation improve B-star exact localization under the same total probe budget?

This comparison includes an intentional change in focal-channel exposure and therefore may not identify signature design alone as causal.

### Comparison B · exposure-matched code design

```text
C vs Q
```

Matched:

```text
total probe count
unique probe count
probe arity
B-containing probe count = 8
B-star incidence slots = 16
same four non-B fillers
same task universe
same decoder
```

Question:

> With focal-task exposure held constant, does the incidence code itself change task localization?

This is the primary confirmatory mechanism comparison.

---

## 10. Falsifiers

The task-conditioned candidate relation fails or materially weakens if any occur:

1. Arm C or Arm Q violates the frozen 12-block / distinct-block / arity-3 budget.
2. Arm C and Q differ in B-containing block count or B-star incidence slots.
3. Arm C fails to detect all eight B-star relations.
4. Arm C fails to uniquely localize all eight B-star relations under the declared task candidate set.
5. Arm Q unexpectedly matches Arm C on task exact localization under the same exposure budget.
6. The deterministic sweep disagrees with the frozen incidence signatures.
7. A global metric is silently substituted for the declared task metric.
8. A task metric is silently promoted into universal schedule superiority.
9. The A-centered development pilot is counted as confirmatory replication.
10. Any scalar winner is produced without a separately preregistered loss function.

---

## 11. Allowed bounded outcomes

Possible earned statements include:

```text
TASK_CONDITIONED_REALLOCATION_IMPROVES_DECLARED_TASK_LOCALIZATION_IN_AUTHORED_HOLDOUT

EXPOSURE_MATCHED_INCIDENCE_CODE_CHANGES_DECLARED_TASK_LOCALIZATION

FOCAL_EXPOSURE_ALONE_DOES_NOT_EXPLAIN_TASK_LOCALIZATION_GAIN

TASK_SPECIALIZATION_TRADES_AGAINST_GLOBAL_PAIR_COVERAGE

TASK_CONDITIONED_DESIGN_FAILS_TO_SURVIVE_HOLDOUT
```

No outcome is preselected as the mandatory scientific verdict.

---

## 12. Anti-crown and claim ceiling

The assay must preserve:

```text
task-specific gain != universal gain
more focal exposure != better coding
better task localization != better global coverage
better task localization != better conditioning
universal balance != universal decision value
task-conditioned design != optimal experimental design
```

No passing result establishes:

- universal superiority of task-conditioned schedules;
- optimal experimental design;
- mutual-information optimality;
- adaptive sensing authority;
- learned probe selection;
- physical sensor geometry;
- tomography;
- curvature or coverage curvature;
- Holonomy Loom or Proto-Loom authority;
- Pedagogue law promotion;
- UI/browser authority;
- production authority;
- Vercel authority.

---

## 13. Implementation order

```text
1. freeze this specification
2. implement exact task/global structural compiler
3. run focused deterministic structural tests
4. freeze TASK_CONDITIONED_STRUCTURAL_HOLDOUT_RECEIPT
5. only then implement the 8-case deterministic task sweep
6. freeze TASK_CONDITIONED_DETECTION_LOCALIZATION_HOLDOUT_RECEIPT
7. compile a contradiction/tradeoff ledger
8. stop before random ensembles, optimization, adaptation, UI, browser, PR, or release
```

Human closure remains required.

𝌋

⟐
