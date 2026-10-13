# Pedagogue Structured Probe Coverage Assay v0.1

Status: **AUTHORED / PRE-IMPLEMENTATION / RESEARCH-ONLY / HUMAN-GATED**  
Technical identity: `td613.pedagogue.structured-probe-coverage/v0.1`  
Research branch: `research/pedagogue-structured-probe-coverage-20260823`  
Deployed baseline source packet: `721de28a8ef4d160e87d46bc1e9107bd249a0db0`  
Post-release relock baseline: `153f0a69a23ab7e665f2386a51406821b62be01d`  
Parent result: `td613.ash.a15-r0.multi-probe-matched-budget/v0.1`  
Mathematical counterpoint: `JAKOB_STEINER_COMBINATORIAL_COVERAGE`  
Promotion authority: **FALSE**  
Production mutation: **NONE**  
Vercel authorization: **NOT REQUESTED**

---

## 0. Why this assay exists

A15-R0 already established a bounded synthetic relation:

```text
under a matched observation budget,
genuinely non-equivalent probe families can reduce alias ambiguity
or expose out-of-model structure
when repeated measurements of one projection cannot
```

This assay must **not** rerun that question with prettier labels.

The new question is:

> Once probe diversity is already genuine and the number of distinct probes is held fixed, can the **incidence structure of that diversity** change what relations remain observable, detectable, or localizable?

The experiment therefore compares:

```text
arbitrary genuine diversity
vs
predeclared controlled-incidence diversity
vs
a hostile marginally balanced schedule
```

while matching:

```text
same total micro-observation budget
same number of distinct probes
same probe cardinality
same target relation universe
same deterministic observation law
same decoder
```

No arm may win merely because it has more probes, more samples, or more differently named probes.

---

## 1. Core anti-equivalences

```text
probe diversity
!=
relation coverage

point-marginal balance
!=
pairwise relation coverage

full row rank
!=
complete target-space coverage

coverage completeness
!=
exact source localization

balanced incidence
!=
epistemic optimality

conditioning gain
!=
global identifiability

uniform coverage
!=
equal decision value

coverage improvement
!=
reconstruction improvement

Steiner-system naming
!=
exclusive historical authorship

Jakob Steiner
!=
Rudolf Steiner
```

No scalar crown is permitted.

---

## 2. Frozen target universe

Define nine synthetic observation channels:

```text
U = {A,B,C,D,E,F,G,H,I}
```

The declared target relation universe is the set of all unordered channel pairs:

```text
R = {{u,v} : u,v in U, u != v}
|R| = C(9,2) = 36
```

Each target relation is a distinct synthetic pair coordinate.

This is a combinatorial observability fixture. It does not claim that real TD613 relations decompose into independent pair coordinates.

---

## 3. Probe definition

A probe is a three-channel block:

```text
B = {u,v,w}
```

A block touches exactly three target pair coordinates:

```text
pairs(B) = {{u,v},{u,w},{v,w}}
```

For a schedule with 12 distinct blocks, define the binary incidence matrix:

```text
M[b,r] = 1 if target pair r is contained in block b
       = 0 otherwise
```

Thus:

```text
M has shape 12 x 36
```

Each target pair r has a 12-bit observation signature:

```text
sigma(r) = column_r(M)
```

Interpretation:

```text
sigma(r) = 0
→ pair direction is completely unobserved by that schedule

sigma(r) != 0
→ pair perturbation is detectable in at least one declared probe

sigma(r) unique among nonzero pair signatures
→ single-pair perturbation is exactly localizable in this bounded incidence model
```

---

## 4. Matched budget

Every primary arm contains:

```text
distinct_probe_count = 12
probe_cardinality = 3
replicates_per_probe = 25
total_micro_observations = 12 * 25 = 300
```

Therefore:

```text
budget_control = MATCHED
probe_diversity_cardinality = MATCHED
probe_size = MATCHED
```

The 25 within-probe replicates do not create new incidence rank or relation coverage.

```text
replication within one block
!=
additional relation geometry
```

---

## 5. Arm S · controlled-incidence Steiner triple system on nine points

Use the 3x3 affine-plane construction:

```text
A B C
D E F
G H I
```

Frozen blocks:

```text
S01 = ABC
S02 = DEF
S03 = GHI
S04 = ADG
S05 = BEH
S06 = CFI
S07 = AEI
S08 = CDH
S09 = BFG
S10 = AFH
S11 = BDI
S12 = CEG
```

Required structural facts:

```text
unique_blocks = 12
point_degree(A..I) = [4,4,4,4,4,4,4,4,4]
covered_pairs = 36
uncovered_pairs = 0
pair_duplicate_excess = 0
maximum_pair_multiplicity = 1
```

Every pair appears exactly once.

For the pair-incidence matrix:

```text
row_rank(M_S) = 12
M_S M_S^T = 3 I_12
row_space_condition_number = 1
```

This perfect row-space conditioning is a property of the authored incidence geometry only.

### 5.1 Predeclared localization limitation

Because each block contains three pair coordinates and every pair appears in exactly one block, the three pair columns inside each block share the same one-hot signature.

Therefore:

```text
distinct_nonzero_pair_signatures = 12
uniquely_localizable_pairs = 0
ambiguous_detected_pairs = 36
```

This limitation is preregistered before implementation.

The controlled design is therefore **not allowed** to acquire a global-optimality label merely because it covers all pairs.

---

## 6. Arm A · arbitrary genuine diversity control

Freeze 12 distinct three-channel probes:

```text
A01 = CDH
A02 = BGH
A03 = AHI
A04 = BEF
A05 = ABE
A06 = ACF
A07 = EFG
A08 = CGI
A09 = DFH
A10 = ADG
A11 = BDI
A12 = DEG
```

Required structural facts:

```text
unique_blocks = 12
point_degree(A..I) = [4,4,3,5,4,4,5,4,3]
covered_pairs = 31
uncovered_pairs = 5
pair_duplicate_excess = 5
maximum_pair_multiplicity = 2
row_rank(M_A) = 12
```

Frozen uncovered pairs:

```text
BC
CE
EH
EI
FI
```

Expected signature structure:

```text
distinct_nonzero_pair_signatures = 17
uniquely_localizable_pairs = 8
ambiguous_detected_pairs = 23
```

This arm is genuinely diverse: all 12 blocks are distinct. Its deficit is therefore not a duplicate-label failure.

---

## 7. Arm H · hostile marginal-balance / target-nullspace control

Freeze 12 distinct probes whose **point marginals are perfectly balanced**, matching Arm S at four appearances per point, while pair coverage remains incomplete:

```text
H01 = CGH
H02 = ACD
H03 = FGH
H04 = ABD
H05 = BFI
H06 = ADG
H07 = BCD
H08 = CEF
H09 = BEI
H10 = EFH
H11 = GHI
H12 = AEI
```

Required structural facts:

```text
unique_blocks = 12
point_degree(A..I) = [4,4,4,4,4,4,4,4,4]
covered_pairs = 26
uncovered_pairs = 10
pair_duplicate_excess = 10
maximum_pair_multiplicity = 3
row_rank(M_H) = 12
```

Frozen uncovered pairs:

```text
AF
AH
BG
BH
CI
DE
DF
DH
DI
EG
```

For every uncovered pair r:

```text
sigma_H(r) = 0
```

so the corresponding pair-basis perturbation lies in the schedule's declared observation nullspace.

Expected signature structure:

```text
distinct_nonzero_pair_signatures = 20
uniquely_localizable_pairs = 14
ambiguous_detected_pairs = 12
```

This arm is the central hostile control:

```text
perfect marginal balance
+
full row rank
+
12 genuinely distinct probes
```

still fails to guarantee target relation coverage.

Required lesson under attack:

```text
BALANCED_MARGINALS_DO_NOT_ESTABLISH_TARGET_SPACE_COVERAGE
```

---

## 8. Phase I · exact incidence-geometry assay

No stochastic observation is required for the first phase.

For each arm compute exactly:

```text
unique_block_count
point_degree_vector
point_degree_variance
pair_multiplicity_ledger
covered_pair_count
uncovered_pair_count
pair_duplicate_excess
maximum_pair_multiplicity
incidence_matrix
row_rank
row_gram_matrix
nonzero singular values
row_space_condition_number
pair_signature_ledger
distinct_nonzero_signature_count
uniquely_localizable_pair_count
ambiguous_detected_pair_count
```

### 8.1 Required authored expectations

```text
coverage(S) = 36/36
coverage(A) = 31/36
coverage(H) = 26/36

point_marginal_variance(S) = 0
point_marginal_variance(H) = 0

row_rank(S) = row_rank(A) = row_rank(H) = 12

condition_number(S) = 1
condition_number(A) > 1
condition_number(H) > 1

exact_localization_count(S) = 0
exact_localization_count(A) = 8
exact_localization_count(H) = 14
```

The assay **must fail** if implementation attempts to turn those multidimensional outcomes into one scalar score.

---

## 9. Phase II · frozen single-pair perturbation sweep

Phase II translates incidence geometry into an observation consequence without RNG.

For each target pair q in R, run one isolated synthetic case per arm.

Each block receives 25 deterministic micro-observations.

If q is contained in block b:

```text
active_count = 20
inactive_count = 5
empirical_active_rate = 0.8
```

If q is absent from block b:

```text
active_count = 5
inactive_count = 20
empirical_active_rate = 0.2
```

The decoder threshold is frozen before execution:

```text
block_active iff empirical_active_rate >= 0.5
```

No random draw occurs. These fixed pseudo-counts are a deterministic perturbation fixture, not an estimated probability model.

For each q:

```text
observed_signature(q)
= binary vector of active blocks
```

Detection rule:

```text
detected(q) = true iff observed_signature(q) != 0
```

Localization candidate set:

```text
C(q) = {r in R : sigma(r) = observed_signature(q)}
```

Exact localization:

```text
exact(q) = detected(q) and |C(q)| = 1
```

### 9.1 Expected sweep outcomes

Arm S:

```text
detected = 36/36
exactly_localized = 0/36
ambiguous_detected = 36/36
missed = 0/36
```

Arm A:

```text
detected = 31/36
exactly_localized = 8/36
ambiguous_detected = 23/36
missed = 5/36
```

Arm H:

```text
detected = 26/36
exactly_localized = 14/36
ambiguous_detected = 12/36
missed = 10/36
```

The conditional localization fraction among detected cases may be reported separately, but it may not be substituted for full-universe detection coverage.

---

## 10. Primary questions and candidate verdicts

### Q1 · Does controlled incidence improve target relation coverage under matched diversity?

If the exact authored facts survive:

```text
CONTROLLED_INCIDENCE_MAXIMIZES_DECLARED_PAIR_COVERAGE_IN_AUTHORED_FIXTURE
```

Claim ceiling:

```text
not universal optimality
not empirical superiority on live data
not proof that Steiner systems are best probe designs
```

### Q2 · Does marginal point balance guarantee target pair coverage?

Expected falsification:

```text
POINT_MARGINAL_BALANCE_IS_INSUFFICIENT_FOR_TARGET_PAIR_COVERAGE
```

### Q3 · Does full row rank guarantee target relation coverage?

Expected falsification:

```text
FULL_ROW_RANK_IS_INSUFFICIENT_FOR_COMPLETE_TARGET_RELATION_COVERAGE
```

### Q4 · Does complete target coverage guarantee exact pair localization?

Expected falsification:

```text
COMPLETE_COVERAGE_DOES_NOT_GUARANTEE_EXACT_SOURCE_LOCALIZATION
```

### Q5 · Is there one globally best schedule across all declared metrics?

The authored fixture intentionally supplies no such result.

If implementation produces a scalar winner, the assay fails.

Required posture:

```text
MULTI_OBJECTIVE_DESIGN_TRADEOFF_PRESERVED
```

---

## 11. No-scalar-crown result vector

Every arm must return a typed vector rather than an aggregate score:

```text
V = {
  target_pair_coverage,
  point_marginal_balance,
  pair_redundancy,
  row_rank,
  row_space_conditioning,
  detection_completeness,
  exact_localization,
  ambiguity,
  null_pair_count
}
```

Forbidden:

```text
best_schedule_score
combined_epistemic_score
overall_robustness
confidence_crown
weighted_winner
```

unless a later human-authorized decision problem declares a loss function before seeing outcomes.

---

## 12. Why the hostile arm matters

Arm H is deliberately attractive to a shallow optimizer.

It has:

```text
12 unique probes
perfect point marginals
full row rank
same observation budget
```

A system watching only probe count, marginal balance, or row rank could call it excellent.

Yet ten declared pair coordinates are completely invisible.

This is the target lesson:

```text
surface balance can coexist with structured blindness
```

The experiment therefore tests whether Pedagogue/Aperture can preserve the distinction between:

```text
balanced representation of components
and
coverage of the relations the task actually depends on
```

---

## 13. Relation to A15-R0

This assay inherits A15-R0 as evidence, not as a mutation target.

A15-R0 already earned:

```text
repeated precision along one probe law
cannot substitute for missing constraint diversity
```

This assay asks the next question:

```text
once diversity is genuine,
does the geometry of how diversity covers the target relation space matter?
```

No A15-R0 receipt is rewritten.

No previous verdict is reopened.

---

## 14. Relation to Jakob Steiner

The mathematical inspiration is the later family of block designs known as Steiner systems and the controlled-incidence idea preserved in the existing TD613 counterpoint card.

Required provenance:

```text
Jakob Steiner = mathematical counterpoint
Jakob Steiner != Potato lineage ancestor
modern Steiner-system terminology != exclusive authorship claim
mathematical counterpoint != ontology promotion
```

This assay does not depend on Rudolf Steiner and must not treat surname recurrence as evidence of relation.

---

## 15. Pedagogue / Aperture post-assay route

If the structural assay survives, the receipt may be presented to Pedagogue's research metabolism and Aperture as a **candidate question source**.

Potential follow-up questions include:

```text
Which target relation family should determine the incidence design?

When does maximizing detection coverage damage localization?

Can candidate probe schedules be selected under a declared loss function
without collapsing coverage, conditioning, and localization into one crown?

Can Aperture distinguish
observation-family rank
from task-relevant relation coverage?
```

No automatic core promotion follows.

No lineage lens receives additional authority merely because the assay was inspired by a mathematical counterpoint.

---

## 16. Optional ensemble robustness extension · NOT YET AUTHORIZED

A later human-reopened phase may compare Arm S against a preregistered deterministic ensemble of arbitrary 12-block schedules sampled from the 84 possible three-element blocks on nine points.

That future extension may ask where the controlled design lies in the distribution of:

```text
pair coverage
pair redundancy
point-degree variance
signature uniqueness
row conditioning
```

This v0.1 spec does **not** authorize that ensemble run.

The three frozen arms above are the complete initial assay.

---

## 17. Failure conditions

The assay fails if implementation:

1. gives one arm more than 12 distinct blocks;
2. gives one arm more than 25 replicates per block;
3. changes any frozen block after seeing results;
4. relabels duplicate or overlapping pair incidence as new relation coverage;
5. treats point-marginal balance as pairwise balance;
6. treats full row rank as complete target relation coverage;
7. reports uncovered pair directions as detected;
8. reports Arm S pair localization as exact when three pairs share each one-hot signature;
9. reports the hostile arm as globally superior because it uniquely localizes more covered pairs;
10. reports Arm S as globally superior because it covers all pairs;
11. creates a scalar winner without a preregistered decision loss;
12. treats the deterministic 20/5 pseudo-count fixture as an empirical noise model;
13. promotes a synthetic result into live Ash, Giving, Holonomy Loom, or production behavior;
14. mutates A15-R0 historical receipts;
15. conflates Jakob Steiner with Rudolf Steiner;
16. rewrites Potato's lineage to include Jakob Steiner;
17. triggers a Vercel release.

---

## 18. Required receipt

A future implementation receipt must preserve at minimum:

```text
schema
science_head
baseline_relock_sha
source_status = SIMULATED
authority_class
manifestly_fictional
universe
relation_universe
arm_ids
blocks_by_arm
budget_by_arm
point_degree_by_arm
pair_multiplicity_by_arm
pair_coverage_by_arm
uncovered_pairs_by_arm
incidence_matrix_by_arm
row_rank_by_arm
row_conditioning_by_arm
pair_signature_ledger_by_arm
unique_signature_count_by_arm
perturbation_sweep_by_arm
detection_count_by_arm
exact_localization_count_by_arm
ambiguity_count_by_arm
null_pair_count_by_arm
claim_ceiling
promotion_authority = false
production_mutated = false
human_closure_required = true
```

Canonical custody should prefer safe integers, exact rational/count representations, or explicitly typed derived values. Floating summaries may not become the sole evidence surface.

---

## 19. Claim ceiling

No passing result establishes:

- universal superiority of Steiner systems;
- optimal experimental design;
- empirical sample-efficiency gains;
- mutual information gains in live systems;
- universal identifiability;
- live TD613 relation coverage;
- physical tomography;
- quantum tomography;
- medical tomography;
- blind tomography;
- connection;
- curvature;
- holonomy;
- Berry structure;
- physical phasons;
- quantum behavior;
- source metaphysics;
- Rudolf/Jakob intellectual relation;
- automatic Pedagogue redesign authority;
- automatic Aperture proposal authority;
- public-route promotion;
- child-study authority;
- production authority.

---

## 20. Initial implementation boundary

The next thread may implement only:

```text
frozen arm definitions
exact incidence compiler
structural metrics
single-pair deterministic sweep
receipt compiler
hostile tests
```

Before adding random ensembles, adaptive probe selection, optimization, live data, or decision-theoretic weighting, stop for a separate research decision.

Expected initial next action:

```text
IMPLEMENT_STRUCTURED_PROBE_COVERAGE_V0_1_AS_BOUNDED_SYNTHETIC_ASSAY
```

No PR has been opened by this preregistration.

No implementation has been executed by this preregistration.

No deployment is authorized.
