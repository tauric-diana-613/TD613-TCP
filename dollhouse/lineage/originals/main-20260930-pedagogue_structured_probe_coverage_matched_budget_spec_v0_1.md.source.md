# Pedagogue Structured Probe Coverage · Matched-Budget Assay Spec v0.1

Status: **AUTHORED / PRE-IMPLEMENTATION / RESEARCH-ONLY / HUMAN-GATED**  
Program: **A15-R0 · phase-free open research field**  
Immediate provenance: `JAKOB_STEINER_COMBINATORIAL_COVERAGE` mathematical counterpoint  
Prior bounded result: `PEDAGOGUE_MULTI_PROBE_MATCHED_BUDGET_GAUNTLET_SPEC_V0_1.md`  
Production baseline before branch: source packet `721de28a8ef4d160e87d46bc1e9107bd249a0db0`, relock `153f0a69a23ab7e665f2386a51406821b62be01d`  
Promotion authority: **FALSE**  
Automatic experiment execution: **FALSE**  
Production mutation: **NONE**  
Vercel authority: **NONE**

---

## 0. Why this assay exists

A15-R0 already earned the bounded relation:

```text
under a matched observation budget,
genuinely non-equivalent probe families can reduce alias ambiguity
or expose out-of-model structure
when repeated measurements of one projection cannot;
the gain belongs to constraint diversity only when probe laws are actually nonredundant
```

Therefore this assay must **not** merely rerun diversity versus repetition with a combinatorial costume.

The new question is narrower and harder:

```text
When observation budget, number of distinct probes,
probe arity, and first-order relation exposure are all matched,
can a predeclared controlled-incidence probe schedule
produce a measurably different inverse-problem geometry
from a non-pair-balanced but still genuinely diverse schedule?
```

And, more importantly:

```text
Can a combinatorially beautiful schedule still fail epistemically
when its actual measurement operators miss the relevant nullspace direction?
```

This is a test of **designed coverage**, not of Jakob Steiner as authority and not of block designs as universal optimization.

Core anti-equivalences:

```text
probe diversity != designed coverage
first-order balance != pairwise balance
pairwise balance != operator rank
pairwise balance != good conditioning
combinatorial coverage != epistemically relevant coverage
balanced incidence != epistemic optimality
uniform coverage != equal decision value
schedule elegance != model adequacy
Steiner-system naming != exclusive historical authorship
Jakob Steiner counterpoint != Potato lineage ancestry
```

---

## 1. Frozen latent state and relation universe

Let the latent state be:

```text
z = [z0,z1,z2,z3,z4,z5,z6]^T
```

with seven declared relation coordinates:

```text
R = {r0,r1,r2,r3,r4,r5,r6}
```

Frozen positive fixture:

```text
z* = [2,3,5,7,11,13,17]^T
```

Global held-out functional:

```text
H_sum(z) = z0+z1+z2+z3+z4+z5+z6
H_sum(z*) = 58
```

No semantic meaning is attached to the seven coordinates. They are synthetic latent dimensions only.

---

## 2. Probe law

A raw block probe for a three-element block `B ⊂ R` has gradient / row operator:

```text
g_B[i] = 1  if ri ∈ B
         0  otherwise
```

and noiseless observation:

```text
y_B = g_B · z
```

Every primary schedule contains exactly:

```text
7 probe invocations
7 distinct three-relation blocks
21 total incidence slots
3 incidences per latent relation
```

Thus the two primary diverse arms are matched on:

```text
total probe cost
number of distinct probes
probe arity
number of incidence slots
first-order marginal exposure of every latent coordinate
```

The intended difference is **pair-incidence structure**.

---

## 3. Arm A · repetition anchor

Historical negative control only; not the primary comparison.

Use seven repetitions of:

```text
B0 = {r0,r1,r2}
```

Required structural posture:

```text
distinct_measurement_operator_count = 1
rank <= 1
full_state_identifiability = false
```

This arm connects the assay to the already-earned A15-R0 repetition result. A new scientific claim must not rest on defeating this arm.

---

## 4. Arm B · cyclic-local diverse schedule

Predeclare the seven blocks:

```text
C0 = {r0,r1,r2}
C1 = {r1,r2,r3}
C2 = {r2,r3,r4}
C3 = {r3,r4,r5}
C4 = {r4,r5,r6}
C5 = {r0,r5,r6}
C6 = {r0,r1,r6}
```

Properties required by construction:

```text
block_count = 7
block_size = 3
each_relation_degree = 3
all_blocks_distinct = true
```

Pair-incidence distribution must be computed from the fixture rather than hard-coded as a verdict. The expected authored structure is:

```text
7 relation-pairs occur 0 times
7 relation-pairs occur 1 time
7 relation-pairs occur 2 times
```

Call its operator matrix:

```text
A_cyclic ∈ R^(7×7)
```

The implementation must compute, not merely assert:

```text
rank(A_cyclic)
singular_values(A_cyclic)
sigma_min(A_cyclic)
kappa_2(A_cyclic)
nullity(A_cyclic)
```

No label such as `ARBITRARY` or `RANDOM` may be used. This arm is a predeclared **cyclic-local** diverse comparator.

---

## 5. Arm C · controlled-incidence Fano / S(2,3,7) schedule

Predeclare the seven blocks:

```text
F0 = {r0,r1,r2}
F1 = {r0,r3,r4}
F2 = {r0,r5,r6}
F3 = {r1,r3,r5}
F4 = {r1,r4,r6}
F5 = {r2,r3,r6}
F6 = {r2,r4,r5}
```

Required combinatorial receipt:

```text
block_count = 7
block_size = 3
each_relation_degree = 3
all_blocks_distinct = true
every_unordered_relation_pair_occurs_exactly_once = true
```

Call its raw operator matrix:

```text
A_fano ∈ R^(7×7)
```

The implementation must compute:

```text
rank(A_fano)
singular_values(A_fano)
sigma_min(A_fano)
kappa_2(A_fano)
nullity(A_fano)
```

The confirmatory comparison is **Arm B versus Arm C**, not Arm A versus Arm C.

No conclusion may be inferred merely from the combinatorial definition. Aperture-style operator geometry must decide what the actual measurement matrix earns.

---

## 6. Primary matched-budget question

The primary confirmatory question is:

```text
With equal probe count, equal distinct-probe count,
equal arity, equal incidence budget,
and equal first-order relation degree,
do the two schedules differ in spectral conditioning
and perturbation amplification in this exact authored linear inverse problem?
```

Predeclared metrics:

```text
rank
nullity
sigma_min
kappa_2
pair-incidence histogram
worst_case_l2_perturbation_amplification_bound
held-out reconstruction error family
```

For an invertible operator matrix `A`, define:

```text
worst_case_l2_perturbation_amplification_bound = 1 / sigma_min(A)
```

This is an operator-norm sensitivity bound for the authored linear fixture, not an empirical error rate.

---

## 7. Frozen perturbation family

Do not choose one favorable noise direction after seeing the matrices.

For each of seven observation coordinates `ej`, use the symmetric perturbation family:

```text
+δ ej
-δ ej
```

with:

```text
δ = 0.05
```

Thus each invertible diverse arm receives the same fourteen perturbations with identical L2 norm.

For each perturbation:

```text
y' = A z* + e
z_hat = solve(A, y')
error_l2 = ||z_hat - z*||_2
heldout_error = |H_sum(z_hat) - 58|
```

Report the full fourteen-value error family plus:

```text
max_error_l2
median_error_l2
max_heldout_error
median_heldout_error
```

Do not collapse incidence quality and numerical conditioning into one confidence score.

---

## 8. Hostile Arm D · perfect incidence, wrong epistemic geometry

This arm is mandatory.

Reuse **exactly the same Fano blocks** from Arm C, preserving perfect pair-incidence coverage, but change the actual measurement operators to centered block gradients:

```text
g'_B = 1_B - (3/7)·1
```

where `1` is the seven-dimensional all-ones vector.

Call the resulting operator matrix:

```text
A_fano_centered
```

Because every centered row sums to zero, the implementation must test whether:

```text
A_fano_centered · 1 = 0
```

and compute the actual:

```text
rank
nullity
nullspace witness
singular values
```

The expected hostile geometry is that the global-offset direction is unobserved despite perfect combinatorial incidence.

Required held-out test:

```text
H_sum(z) = sum(z)
```

The arm must refuse unconditional reconstruction of `H_sum(z*)` from centered observations alone.

This arm exists to falsify any implementation that concludes:

```text
perfect combinatorial coverage
→
full epistemic coverage
```

Potential bounded negative, only if witnessed:

```text
COMBINATORIAL_COVERAGE_DOES_NOT_GUARANTEE_EPISTEMICALLY_RELEVANT_OPERATOR_COVERAGE
```

---

## 9. Coverage receipt and geometry receipt must remain separate

Every schedule must emit two non-collapsed objects.

### 9.1 Combinatorial coverage receipt

```text
blocks
block_count
block_size
relation_degrees
pair_incidence_matrix
pair_incidence_histogram
uncovered_pair_count
duplicate_pair_count
perfect_pair_balance
```

### 9.2 Operator geometry receipt

```text
measurement_matrix
rank
nullity
singular_values
sigma_min
kappa_2
nullspace_witnesses
perturbation_amplification_bound
```

Core law under test:

```text
coverage receipt != geometry receipt
```

No scalar crown may merge them.

---

## 10. Pedagogue provenance / second-pass postmortem

After all mathematical verdicts are frozen, the assay may be passed through the deployed Pedagogue lineage second pass as a **postmortem only**.

It must not alter the mathematical result.

Questions worth routing if triggered by the receipts include:

```text
MONTESSORI / PREPARED_ENVIRONMENT
  Did the fixture make the relevant contrast legible without adding command after failure?

MALAGUZZI / THIRD_TEACHER_DOCUMENTATION
  Did the receipt preserve the process and route, or only the winning score?

GRAEBER / INTERPRETIVE_LABOR
  Which arm or receipt format forces extra interpretive work to understand why it failed?

RUDOLF_STEINER / RHYTHM_AND_CADENCE
  Was a relation named before the operator geometry actually answered?

RUDOLF_STEINER / EPISTEMIC_REFRACTION
  Did a useful access structure get confused with the interpretation imposed upon it?

JAKOB_STEINER / COMBINATORIAL_COVERAGE COUNTERPOINT
  Did the block incidence cover the declared relation family, and did that coverage matter to the actual inverse problem?

A:SHIWI ROUTED COMMUNITY-EMBEDDEDNESS
  Did abstraction strip a relation from the conditions/provenance that made it meaningful?

MILLER / LAING ANTI-PATHOLOGIZATION
  Did the analysis blame a failed latent candidate/subject where the actual failure belonged to the measurement environment or model?
```

Lineage activation remains question formation only.

```text
lineage-lens activation != source truth
lineage-lens activation != mathematical verdict
lineage-lens activation != redesign authority
```

---

## 11. Aperture companion audit

Aperture remains the companion instrument for:

```text
rank
identifiability
conditioning
uncertainty geometry
replay sensitivity
abstention
```

Pedagogue may propose or interpret the designed schedule; Aperture audits whether the schedule actually addresses the declared observational deficit.

Mandatory relation:

```text
designed coverage
!=
Aperture-certified informativeness
```

If an arm is combinatorially balanced but rank deficient or catastrophically conditioned, the correct posture is to preserve that contradiction rather than rescue the design.

---

## 12. Falsifiers

The candidate relation is falsified or materially weakened if any of the following occur:

1. Arm C does not preserve the predeclared pair-incidence property;
2. Arm B and Arm C are not matched on total cost, distinct probe count, block size, incidence slots, and first-order relation degree;
3. computed operator geometry does not differ in the predicted direction and the implementation rewrites the hypothesis after seeing the result;
4. Arm C gains only because an undeclared oracle selected a favorable noise direction;
5. Arm D retains full observability of the global-offset direction despite the declared centered operator law;
6. the controlled-incidence schedule fails to improve any declared relevant metric over the cyclic-local schedule;
7. a simpler non-combinatorial explanation completely accounts for the result and the report still credits Steiner-system structure as causal;
8. the assay collapses combinatorial coverage, conditioning, decision value, and replay stability into one score;
9. the assay claims universal optimality from this one synthetic fixture.

A null or adverse result is an earned result.

---

## 13. Allowed bounded outcomes

Possible bounded outcomes include:

```text
STRUCTURED_PAIR_COVERAGE_IMPROVES_CONDITIONING_IN_AUTHORED_MATCHED_FIXTURE

STRUCTURED_PAIR_COVERAGE_DOES_NOT_IMPROVE_DECLARED_GEOMETRIC_METRICS

COMBINATORIAL_COVERAGE_DOES_NOT_GUARANTEE_EPISTEMICALLY_RELEVANT_OPERATOR_COVERAGE

FIRST_ORDER_EXPOSURE_MATCH_DOES_NOT_IMPLY_SECOND_ORDER_COVERAGE_EQUIVALENCE

DESIGNED_COVERAGE_CANDIDATE_REQUIRES_OPERATOR_GEOMETRY_AUDIT
```

No outcome is preselected as the desired verdict.

---

## 14. Claim ceiling

No passing result establishes:

- universal optimal experimental design;
- universal superiority of Steiner systems;
- mutual-information optimality;
- universal sample-efficiency gain;
- decision-value optimality;
- information geometry as a promoted TD613 ontology;
- physical sensor design;
- empirical live-data calibration;
- physical tomography;
- quantum-state tomography;
- blind tomography;
- autonomous observation or experiment execution;
- A16 admission;
- Proto-Loom authority;
- Holonomy Loom promotion;
- production authority;
- source authority for Jakob Steiner;
- intellectual ancestry from Jakob Steiner to Potato;
- any intellectual relation between Jakob Steiner and Rudolf Steiner beyond surname disambiguation.

Historical naming remains explicit:

```text
modern Steiner-system terminology
!=
exclusive historical authorship by Jakob Steiner
```

---

## 15. Repository / release posture

```text
specification = FROZEN_BEFORE_IMPLEMENTATION
implementation = NONE
tests = NONE
receipt = NONE
PR = NONE
browser witness = NONE
UI mutation = NONE
Aperture installed-engine mutation = NONE
Pedagogue production mutation = NONE
Vercel deployment = NONE
release authority = NONE
human closure required = true
```

This branch is a toybox runway only.

---

## 16. First implementation move for Future Amari

Before coding:

1. fetch `main` fresh and verify the production/relock baseline has not drifted;
2. read this spec beside `PEDAGOGUE_MULTI_PROBE_MATCHED_BUDGET_GAUNTLET_SPEC_V0_1.md`;
3. read `app/engine/pedagogue-mathematical-counterpoints.js` and preserve Jakob as a non-ancestral research coordinate;
4. compute the Arm B / Arm C / Arm D incidence and operator matrices independently from the declared blocks;
5. freeze expected structural identities derived from the declarations, but do **not** prewrite the scientific verdict;
6. implement the cheapest deterministic synthetic engine and hostile tests;
7. wire only the focused A15-R0 static gate needed for this assay;
8. keep browser/UI witnesses asleep;
9. after the mathematical receipt is frozen, optionally run the Pedagogue lineage second-pass postmortem as a separate object;
10. stop at the next genuine conceptual seam rather than automatically extending the assay family.

Suggested first test name:

```text
TEST_STRUCTURED_PAIR_COVERAGE_VS_MATCHED_CYCLIC_DIVERSITY_WITH_NULLSPACE_HOSTILE_CONTROL
```

Human closure remains required.
