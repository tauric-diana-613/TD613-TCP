# Pedagogue Structured Probe Design Gauntlet v0.1

Status: **CANONICAL PREREGISTRATION / PRE-IMPLEMENTATION / RESEARCH-ONLY / HUMAN-GATED**  
Technical identity: `td613.pedagogue.structured-probe-design-gauntlet/v0.1`  
Branch: `research/pedagogue-structured-probe-coverage-20260823`  
Production source packet: `721de28a8ef4d160e87d46bc1e9107bd249a0db0`  
Relocked baseline: `153f0a69a23ab7e665f2386a51406821b62be01d`  
Immediate mathematical counterpoint: `JAKOB_STEINER_COMBINATORIAL_COVERAGE`  
Parent bounded result: A15-R0 matched-budget probe-diversity gauntlet  
Implementation authority: **NONE UNTIL FUTURE SESSION**  
Promotion authority: **FALSE**  
Production / Vercel authority: **NONE**

---

## 0. Canonical question

A15-R0 already established that genuine constraint diversity can outperform repetition under a matched observation budget in a bounded synthetic fixture.

This gauntlet asks the next question:

> Once probe diversity is genuine, can the **design of that diversity** change what the system can observe, condition, detect, or localize—and can mathematically elegant incidence still miss the task-relevant geometry?

The gauntlet has two deliberately non-equivalent chambers.

```text
CHAMBER I  = incidence structure -> operator geometry
CHAMBER II = incidence structure -> target coverage / localization geometry
```

Neither chamber is a validation of the other.

A positive result in one chamber may not rescue a negative result in the other.

---

## 1. Why two chambers are required

A single block-design experiment risks replacing one scalar crown with another.

A design may be:

- perfectly pair balanced yet blind to an operator nullspace direction;
- perfectly target-covering yet poor at exact source localization;
- full row rank while leaving declared target coordinates entirely uncovered;
- beautifully conditioned in one representation while solving the wrong task.

Therefore the gauntlet preserves two receipts:

```text
COMBINATORIAL / COVERAGE RECEIPT
!=
OPERATOR / INVERSE-GEOMETRY RECEIPT
```

and two task families:

```text
DETECTION COVERAGE
!=
EXACT LOCALIZATION
```

---

## 2. Chamber I · Fano matched-first-order operator geometry

Subordinate component spec:

`app/dome-world/docs/ash/experiments/a15-r0/PEDAGOGUE_STRUCTURED_PROBE_COVERAGE_MATCHED_BUDGET_SPEC_V0_1.md`

### 2.1 Fixture

Seven synthetic latent coordinates and seven distinct three-coordinate probes per diverse arm.

Primary comparison:

```text
CYCLIC_LOCAL_DIVERSITY
vs
FANO_CONTROLLED_INCIDENCE S(2,3,7)
```

Matched:

```text
probe_count = 7
unique_probe_count = 7
block_size = 3
incidence_slots = 21
first_order_degree_each_coordinate = 3
```

Primary metrics:

```text
pair-incidence histogram
rank
nullity
singular values
sigma_min
kappa_2
perturbation amplification
held-out reconstruction error family
```

### 2.2 Chamber-I hostile control

Reuse the exact Fano blocks but center every measurement row:

```text
g'_B = 1_B - (3/7) * 1
```

so the global-offset direction is a declared candidate nullspace witness.

This chamber attacks:

```text
perfect combinatorial pair coverage
->
full epistemic operator coverage
```

Potential earned negative:

`COMBINATORIAL_COVERAGE_DOES_NOT_GUARANTEE_EPISTEMICALLY_RELEVANT_OPERATOR_COVERAGE`

### 2.3 Chamber-I claim ceiling

Chamber I may speak only about the exact authored linear operator family.

It may not establish universal optimal design, live sensor geometry, physical tomography, or any promoted TD613 ontology.

---

## 3. Chamber II · nine-point coverage/localization tradeoff

Subordinate component spec:

`docs/pedagogue/experiments/STRUCTURED_PROBE_COVERAGE_SPEC_V0_1.md`

### 3.1 Fixture

Nine synthetic channels create 36 unordered target-pair coordinates.

Every primary arm has:

```text
12 distinct three-channel probes
25 replicates per probe
300 micro-observations per isolated perturbation case
```

Arms:

```text
S = controlled-incidence Steiner triple system on 9 points
A = arbitrary genuine-diversity schedule
H = hostile perfectly point-balanced but pair-incomplete schedule
```

### 3.2 Structural expectations

```text
pair_coverage(S) = 36/36
pair_coverage(A) = 31/36
pair_coverage(H) = 26/36

point_degree_variance(S) = 0
point_degree_variance(H) = 0

row_rank(S) = row_rank(A) = row_rank(H) = 12
```

Arm H therefore prevents:

```text
perfect point marginals
+
full row rank
->
complete task-relevant pair coverage
```

### 3.3 Detection/localization tradeoff

The 12-bit incidence signature of each pair becomes the bounded single-pair perturbation signature.

Preregistered outcomes for the authored schedules:

```text
S: detect 36/36, exactly localize 0/36
A: detect 31/36, exactly localize 8/36
H: detect 26/36, exactly localize 14/36
```

Thus the controlled schedule is not allowed to acquire a global-optimality crown merely for complete coverage.

This chamber attacks:

```text
complete target coverage
->
exact source localization
```

and:

```text
balanced incidence
->
global epistemic optimality
```

---

## 4. Cross-chamber anti-crown

The gauntlet is successful only if the implementation preserves contradictions across chambers.

The following are **not errors to be smoothed away**:

- controlled incidence can improve pair coverage while reducing exact localization;
- perfect combinatorial coverage can coexist with operator nullspace;
- full row rank can coexist with uncovered task-relevant columns;
- a schedule can be excellent for detection and poor for localization;
- a schedule can provide richer localization signatures while missing part of the target universe.

No scalar may combine:

```text
coverage
conditioning
rank
localization
ambiguity
redundancy
detection
held-out error
```

unless a later human-authorized decision problem declares a loss function **before** outcome inspection.

---

## 5. Required implementation order

Future Amari must implement in this order:

### Stage 0 · baseline check

```text
fetch main fresh
verify relock state
verify this branch ancestry
read both component specs
read JAKOB_STEINER_COMBINATORIAL_COVERAGE counterpoint
```

### Stage 1 · Chamber I exact combinatorics

Compute Fano and cyclic-local block incidence from declarations.

No scientific verdict yet.

### Stage 2 · Chamber I operator geometry

Construct raw and centered measurement matrices; compute exact/numerically stable rank, nullity, singular geometry, perturbation family, and held-out validation.

Freeze Chamber-I receipt.

### Stage 3 · Chamber II exact combinatorics

Construct all three 9-point schedules; compute point degrees, pair multiplicities, uncovered pairs, incidence matrices, and pair-signature ledgers.

Freeze structural receipt before perturbation sweep.

### Stage 4 · Chamber II deterministic perturbation sweep

Run all 36 isolated pair cases per arm under the frozen 20/5 pseudo-count law and 0.5 threshold.

Freeze detection/localization receipt.

### Stage 5 · cross-chamber synthesis

Only after both chamber receipts exist, compare which candidate relations survived.

The synthesis must preserve disagreement.

### Stage 6 · Pedagogue/Aperture postmortem

Optional and separate from the mathematical verdict.

Pedagogue may route inherited questions through the lineage second pass.

Aperture may audit rank, conditioning, identifiability, uncertainty geometry, or proposal relevance.

Neither may retroactively alter a frozen chamber receipt.

---

## 6. Exact initial implementation boundary

The next session may add:

```text
synthetic engine(s)
focused tests
exact fixture definitions
receipt compiler(s)
component receipts
cross-chamber synthesis receipt
```

The next session may **not** add without a new explicit research decision:

```text
random schedule ensembles
adaptive schedule optimization
greedy search
Bayesian design
mutual-information optimization
learned probe selection
live data
human/child studies
UI mutation
browser witnesses
production binding
Vercel release
```

---

## 7. Optional future ensemble · held

A future reopening may sample or enumerate matched arbitrary schedules to locate the authored controlled schedules inside a broader distribution of:

```text
coverage
redundancy
conditioning
signature uniqueness
localization
detection completeness
```

That would test whether the authored comparisons generalize beyond the frozen controls.

It is deliberately **not authorized** by this gauntlet.

---

## 8. Failure conditions

The gauntlet fails if implementation:

1. changes any preregistered block after seeing results;
2. gives one primary arm more probe budget or diversity cardinality than its matched comparator;
3. uses the historical repetition arm as the main evidence for the new claim;
4. equates pair-incidence balance with operator geometry;
5. equates row rank with task-space coverage;
6. equates target coverage with exact localization;
7. hides a hostile negative because the designed schedule is mathematically elegant;
8. creates a scalar winner;
9. changes the perturbation law after seeing the incidence signatures;
10. lets a Pedagogue lineage postmortem alter the mathematical result;
11. lets Aperture rescue an underperforming combinatorial design by changing the question post hoc;
12. promotes Jakob Steiner into Potato's ancestry;
13. conflates Jakob Steiner with Rudolf Steiner;
14. mutates prior A15-R0 historical receipts;
15. touches production or Vercel.

---

## 9. Required cross-chamber receipt

The final bounded receipt must preserve at minimum:

```text
schema
science_head
baseline_source_packet
baseline_relock_sha
component_spec_ids
component_receipt_ids
matched-budget assertions
frozen blocks
coverage receipts
operator geometry receipts
nullspace witnesses
perturbation families
pair-signature ledgers
detection counts
localization counts
contradiction ledger
no-scalar-crown assertion
claim ceiling
promotion_authority = false
production_mutated = false
human_closure_required = true
```

The contradiction ledger is mandatory.

Example form:

```text
CONTROLLED_COVERAGE_GAIN_PRESENT
EXACT_LOCALIZATION_GAIN_ABSENT
HOSTILE_NULLSPACE_PRESENT
GLOBAL_WINNER = NONE
```

---

## 10. Dream features after the first gauntlet · not current authority

If the two-chamber assay earns continuation, the most interesting future toys are:

1. **Task-conditioned block design** — design incidence against an explicitly declared target relation family instead of universal pair balance.
2. **Loss-declared schedule selection** — allow a human to preregister detection-vs-localization loss, then see which schedule is preferred without a hidden scalar crown.
3. **Open-set schedule inadequacy** — ask whether a probe design can recognize that the target relation family itself is misspecified.
4. **Replay-stable design choice** — perturb measurement/noise assumptions and test whether the preferred schedule changes.
5. **Adaptive design with custody** — each new probe must preserve why it was selected and what previous observation justified it.
6. **Projective counterpoint chamber** — separately test Jakob Steiner's projective-dependence card against AIA non-equivalent projections.
7. **Pedagogue self-critique** — after a design choice, run the lineage second pass over its own route burden, timing, provenance, and interpretive labor.
8. **Aperture co-design audit** — Pedagogue proposes a probe family; Aperture audits whether it actually addresses the admitted deficit; neither may silently execute.

These are wishlist items, not implementation authority.

---

## 11. Exit condition for the next play session

A good next session stops when one of these occurs:

```text
A. both chamber receipts are frozen and a bounded cross-chamber verdict exists;
B. one chamber falsifies the design premise strongly enough that the second becomes scientifically unnecessary;
C. implementation reveals the two chambers are not actually matched as preregistered;
D. a new conceptual distinction is earned that requires a fresh preregistration before proceeding.
```

Do not continue by inertia.

The toybox is considered properly played with only when the favorite toy is allowed to lose.
