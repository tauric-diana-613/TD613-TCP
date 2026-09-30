# Pedagogue Multi-Probe Matched-Budget Gauntlet Spec v0.1

Status: **AUTHORED / PRE-IMPLEMENTATION / RESEARCH-ONLY / HUMAN-GATED**  
Parent noisy open-set assay: `td613.ash.a15-r0.noisy-open-set-near-miss/v0.1`  
Research question family: `MEASUREMENT_DIVERSITY_VS_RAW_REPETITION`  
Promotion authority: **FALSE**  
Production mutation: **NONE**

## 0. Research question

The previous assay established that noisy open-set rejection must be earned from a predeclared finite-budget criterion rather than from oracle knowledge.

The next question returns to a central TD613 research hypothesis:

```text
Under the same total observation budget,
can genuinely different probe families constrain a latent candidate family
more strongly than repeated observations from one probe family?
```

The comparison must not smuggle in more samples.

Core anti-equivalences:

```text
more probe labels
!=
more measurement diversity

same total observation budget
+
different probe allocation
!=
more data in the diverse arm

repeated precision on one projection
!=
constraint diversity across projections

smaller survivor set in one authored fixture
!=
universal superiority of heterogeneous sensing

multi-probe constraint intersection
!=
tomography already earned
```

## 1. Frozen candidate family and probe laws

Candidate family:

```text
C = {RX,RY,RZ}
```

Three Bernoulli probe families are declared before any observations:

```text
             P1     P2     P3
RX          0.70   0.70   0.30
RY          0.70   0.30   0.70
RZ          0.30   0.70   0.70
```

Each row gives `P(B=1 | route, probe)`.

Within each route/probe cell, observations are IID Bernoulli for this synthetic fixture.

No cross-probe independence theorem is required by the adequacy rule: probe cells are tested separately and combined by set intersection with a Bonferroni familywise bound.

### 1.1 Probe-induced alias classes

At the population-law level:

```text
P1:
  {RX,RY} alias at 0.70
  {RZ}    at 0.30

P2:
  {RX,RZ} alias at 0.70
  {RY}    at 0.30

P3:
  {RY,RZ} alias at 0.70
  {RX}    at 0.30
```

Thus no claim is made that each probe is individually sufficient.

For target `RX`, the exact population alias intersection is:

```text
{RX,RY} ∩ {RX,RZ} ∩ {RX} = {RX}
```

The experimental question is whether the finite-budget diagnostic preserves that relational advantage under matched observation cost.

## 2. Matched observation budget

Total observation budget for every arm:

```text
B_total = 300 Bernoulli observations
```

### 2.1 Repetition arm

```text
P1: n=300
P2: n=0
P3: n=0
```

### 2.2 Genuine-diversity arm

```text
P1: n=100
P2: n=100
P3: n=100
```

### 2.3 Redundant-label control arm

Three nominal probes `Q1,Q2,Q3` each reproduce the exact `P1` law:

```text
Q1 ≡ P1
Q2 ≡ P1
Q3 ≡ P1
```

Budget:

```text
Q1: n=100
Q2: n=100
Q3: n=100
```

This control tests whether implementation confuses probe count with information-distinct measurement structure.

Required budget receipt:

```text
repetition_total = 300
diversity_total = 300
redundant_total = 300
matched_total_budget = true
```

## 3. Predeclared adequacy criterion

Familywise diagnostic budget:

```text
alpha_family = 0.01
```

The same rule is used in every arm:

```text
candidate survives an arm
iff
it survives every observed probe-cell adequacy test in that arm
```

For each observed candidate/probe cell, use the two-sided Hoeffding bound:

```text
P(|p_hat - p| >= epsilon) <= 2 exp(-2 n epsilon^2)
```

### 3.1 Repetition arm correction

There are:

```text
3 candidates × 1 observed probe = 3 cells
```

So:

```text
alpha_cell_repetition = 0.01/3
                      = 0.0033333333333333335

epsilon_repetition
= sqrt(log(2/alpha_cell_repetition)/(2*300))
= sqrt(log(600)/600)
≈ 0.103254779188957
```

### 3.2 Diversity and redundant-control correction

There are:

```text
3 candidates × 3 observed probes = 9 cells
```

So:

```text
alpha_cell_multi = 0.01/9
                 = 0.0011111111111111111

epsilon_multi
= sqrt(log(2/alpha_cell_multi)/(2*100))
= sqrt(log(1800)/200)
≈ 0.193591605498331
```

The diverse arm therefore pays a *more conservative* multiplicity penalty than the repetition arm.

Required criterion metadata:

```text
criterion_role = FORMAL_DIAGNOSTIC
criterion_predeclared = true
budget_matched = true
multiplicity_correction_explicit = true
universal_optimality_claim = false
empirical_validation_claim = false
```

## 4. Experiment A · admitted target RX

Fixture oracle:

```text
true_route = RX
truth_in_candidate_family = true
```

### 4.1 Repetition arm observation

Freeze:

```text
P1: 210 ones, 90 zeros
p_hat_P1 = 0.70
```

Distances:

```text
RX: |0.70-0.70| = 0.00
RY: |0.70-0.70| = 0.00
RZ: |0.70-0.30| = 0.40
```

With `epsilon_repetition ≈ 0.103254779188957`:

```text
survivors_repetition = [RX,RY]
```

Required classification:

```text
MATCHED_BUDGET_REPETITION_REMAINS_PARTIALLY_IDENTIFIED
```

### 4.2 Genuine-diversity arm observation

Freeze:

```text
P1: 70 ones, 30 zeros   -> p_hat=0.70
P2: 70 ones, 30 zeros   -> p_hat=0.70
P3: 30 ones, 70 zeros   -> p_hat=0.30
```

Candidate cell discrepancies:

```text
RX: [0.00,0.00,0.00]
RY: [0.00,0.40,0.40]
RZ: [0.40,0.00,0.40]
```

With `epsilon_multi ≈ 0.193591605498331`:

```text
survivors_diversity = [RX]
```

Required classification:

```text
MATCHED_BUDGET_PROBE_DIVERSITY_CONTRACTS_TO_SINGLETON
```

Required qualification:

```text
point_identified_within_declared_probe_and_candidate_scope = true
unconditional_truth_identification = false
```

### 4.3 Redundant-label control

Freeze all three nominally different controls at the same empirical law:

```text
Q1: 70 ones, 30 zeros
Q2: 70 ones, 30 zeros
Q3: 70 ones, 30 zeros
```

Because all three are exact `P1` copies:

```text
survivors_redundant = [RX,RY]
```

Required classification:

```text
REDUNDANT_PROBE_LABELS_DO_NOT_REPRODUCE_DIVERSITY_GAIN
```

Core lesson under test:

```text
probe-count increase without measurement-law diversity
must not be credited as constraint diversity
```

## 5. Experiment B · outside generator RU

A separate hostile generator is declared:

```text
true_route = RU
RU ∉ C
```

Probe laws:

```text
             P1     P2     P3
RU          0.70   0.95   0.95
```

All admitted candidates still assign nonzero likelihood to every finite binary sequence.

### 5.1 Repetition arm

Freeze:

```text
P1: 210 ones, 90 zeros
p_hat_P1 = 0.70
```

This is observationally identical on `P1` to the admitted `RX/RY` law.

Therefore:

```text
survivors_repetition_outside = [RX,RY]
open_set_rejection_repetition = false
```

Required classification:

```text
REPETITION_ARM_FAILS_TO_EARN_OPEN_SET_REJECTION
```

The oracle may not override this result.

### 5.2 Genuine-diversity arm

Freeze:

```text
P1: 70 ones, 30 zeros   -> p_hat=0.70
P2: 95 ones, 5 zeros    -> p_hat=0.95
P3: 95 ones, 5 zeros    -> p_hat=0.95
```

Candidate discrepancies:

```text
RX: [0.00,0.25,0.65]
RY: [0.00,0.65,0.25]
RZ: [0.40,0.25,0.25]
```

Every candidate violates at least one observed cell by more than `epsilon_multi ≈ 0.193591605498331`.

Therefore:

```text
survivors_diversity_outside = []
open_set_rejection_diversity = true
```

Required classification:

```text
MATCHED_BUDGET_PROBE_DIVERSITY_EARNS_OPEN_SET_REJECTION
```

Required output:

```text
selected_route = NONE
open_set_state = OPEN_SET_UNRESOLVED
truth_identified = false
```

### 5.3 Redundant-label control

The redundant controls `Q1,Q2,Q3` observe only copies of the `P1` law:

```text
Q1: 70 ones, 30 zeros
Q2: 70 ones, 30 zeros
Q3: 70 ones, 30 zeros
```

Expected:

```text
survivors_redundant_outside = [RX,RY]
open_set_rejection_redundant = false
```

Required classification:

```text
REDUNDANT_MULTI_PROBE_CONTROL_FAILS_TO_EARN_OPEN_SET_REJECTION
```

## 6. Matched-budget gain ledger

For Experiment A:

```text
survivor_count_repetition = 2
survivor_count_diversity = 1
survivor_count_redundant = 2
```

For Experiment B:

```text
survivor_count_repetition = 2
survivor_count_diversity = 0
survivor_count_redundant = 2
```

Required bounded statements:

```text
identifiability_gain_in_authored_fixture = true
open_set_rejection_gain_in_authored_fixture = true
raw_sample_count_gain = false
probe_label_count_sufficient = false
```

No mutual-information or universal sample-efficiency claim is granted by these finite fixtures.

## 7. Probe provenance contract

Every probe must declare:

```text
probe_id
measurement_law_by_candidate
sample_count
observed_counts
whether_measurement_law_is_duplicate_of_another_probe
```

The redundant-control probes must explicitly declare:

```text
Q1.duplicate_of = P1
Q2.duplicate_of = P1
Q3.duplicate_of = P1
```

A system that credits `Q1,Q2,Q3` as three independent constraint families merely because they have different names fails the gauntlet.

## 8. Failure conditions

The gauntlet fails if implementation:

1. gives any arm more than 300 observations;
2. credits the diverse arm with a smaller multiple-testing penalty than the repetition arm without declaration;
3. calls `Q1,Q2,Q3` genuinely diverse despite identical measurement laws;
4. reports a singleton in Experiment A repetition or redundant control;
5. fails to contract Experiment A diversity to `[RX]` under the authored criterion;
6. rejects the outside generator in the repetition arm merely because the oracle knows `RU ∉ C`;
7. fails to reject the outside generator in the genuine-diversity arm;
8. calls diversity-arm open-set rejection identification of `RU`;
9. promotes the finite fixture into a universal theorem that heterogeneous probes are always superior;
10. calls the set-intersection exercise tomography, connection, curvature, holonomy, or quantum behavior.

## 9. Epistemic posture

A pass may establish only:

```text
MATCHED_BUDGET_PROBE_DIVERSITY_GRAMMAR_VALIDATED_IN_BOUNDED_SYNTHETIC_FIXTURE
```

Research refinement candidate:

```text
under a matched observation budget,
genuinely non-equivalent probe families can reduce alias ambiguity
or expose out-of-model structure
when repeated measurements of one projection cannot;
the gain belongs to constraint diversity only when probe laws are actually nonredundant
```

This remains a **research refinement candidate**, not a promoted Pedagogue law.

## 10. Relation to the inverse-problem program

This assay still does not perform tomography.

It establishes a narrower prerequisite:

```text
multiple non-equivalent observations
can carry jointly stronger latent-state constraints
than repeated observations of one projection
```

Tomography would require an explicit forward operator and reconstruction problem of the form:

```text
O_i = F_i(S) + noise_i
{O_i} -> S_hat
```

The present fixture only asks whether the probe family has earned the right to become input to that future reconstruction grammar.

## 11. Next action if the gauntlet survives

```text
next_learning_action = TEST_RELATIONAL_PROBE_RECONSTRUCTION_WITH_KNOWN_FORWARD_OPERATORS
```

That next assay should stop treating each probe as merely a classifier constraint and instead define a small latent state `S`, explicit known forward maps `F1,F2,F3`, partial observations, and a reconstruction objective.

Only then may A15-R0 begin using tomography as an *experimental grammar* rather than as an analogy.

## 12. Claim ceiling

No passing result establishes:

- universal measurement-diversity superiority;
- mutual-information gain in live systems;
- universal sample-efficiency gain;
- empirical live-data calibration;
- tomography;
- blind tomography;
- connection;
- curvature;
- holonomy;
- Berry structure;
- physical phasons;
- quantum behavior;
- A16 admission;
- Proto-Loom;
- production authority.

## 13. UI / release posture

```text
Pedagogue research UI = NOT REQUIRED
Moss Lantern UI = NONE
Giving UI mutation = NONE
Ash Keep production UI mutation = NONE
Holonomy Loom UI mutation = NONE
TD613.com deployment = HELD
Vercel authorization = NOT REQUESTED
PR remains Draft
```

Human closure remains required.
