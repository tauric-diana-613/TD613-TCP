# Pedagogue · Jakob Steiner Matched-Budget Coverage Assay Spec v0.1

Status: **AUTHORED / PRE-IMPLEMENTATION / RESEARCH-ONLY / HUMAN-GATED**  
Research branch: `research/pedagogue-structured-probe-coverage-20260823`  
Branch basis: release-relocked `main` descendant `153f0a69a23ab7e665f2386a51406821b62be01d`  
Counterpoint card: `JAKOB_STEINER_COMBINATORIAL_COVERAGE`  
Parent result: `MATCHED_BUDGET_PROBE_DIVERSITY_GRAMMAR_VALIDATED_IN_BOUNDED_SYNTHETIC_FIXTURE`  
Promotion authority: **FALSE**  
Production mutation: **NONE**  
Automatic experiment execution: **FALSE**

---

## 0. Why this assay exists

A15-R0 has already shown a narrower fact:

```text
under a matched observation budget,
genuinely non-equivalent probe families can reduce alias ambiguity
or expose out-of-model structure
when repeated measurements of one projection cannot.
```

That result does **not** answer the next question.

The next question is not:

```text
diversity vs repetition
```

It is:

```text
under the same total budget,
the same number of genuinely distinct probe blocks,
and the same superficial point-incidence balance,
can predeclared controlled relation coverage produce a stronger
observation operator than arbitrary genuine diversity?
```

This is a probe-*design* assay, not another probe-count assay.

Core advance sought:

```text
genuine diversity
!=
coverage-complete diversity
```

and, more specifically:

```text
matched budget
+ matched block count
+ matched block size
+ matched point marginals
!=
matched relation-space coverage
```

No claim of universal optimal experimental design is admissible from this fixture.

---

## 1. Historical / naming provenance

This assay is routed through the Pedagogue counterpoint:

```text
JAKOB_STEINER_COMBINATORIAL_COVERAGE
```

The mathematical object used below is a modern `2-(7,3,1)` Steiner triple system, equivalently the seven 3-point lines of the Fano plane.

Required provenance caveat:

```text
modern_name = STEINER_TRIPLE_SYSTEM
exclusive_historical_authorship_claim = false
Jakob_Steiner_is_Potato_lineage_ancestor = false
Jakob_Steiner_equals_Rudolf_Steiner = false
name_equals_complete_provenance = false
```

The historical counterpoint supplies a question and a falsifier family. It supplies no ontology, authority transfer, or automatic redesign mandate.

---

## 2. Declared relation universe

Let the point set be:

```text
V = {1,2,3,4,5,6,7}
```

The target relation universe is the set of unordered pairs:

```text
R = {{i,j} : 1 <= i < j <= 7}
|R| = C(7,2) = 21
```

Define a latent pair-relation field:

```text
z in R^21
```

with one coordinate `z_ij` for each pair `{i,j}`.

A 3-point probe block:

```text
B = {i,j,k}
```

returns the three declared local relation coordinates:

```text
O_B = [z_ij, z_ik, z_jk]
```

Thus every block consumes exactly three relation-coordinate observations.

This is an intentionally transparent synthetic forward model. It is not a physical sensor claim, not a semantic relation theorem, and not a statement that real TD613 relations are pairwise decomposable.

---

## 3. Matched resource covenant

Every central arm receives:

```text
block_count = 7
block_size = 3
relation_reads_per_block = 3
total_relation_reads = 21
unique_block_labels = 7
```

The two central arms must additionally satisfy:

```text
every point appears in exactly 3 blocks
all 7 blocks are genuinely distinct
```

Therefore neither arm may win by:

- receiving more blocks;
- receiving more raw relation reads;
- using a larger block size;
- using more point-incidence mass;
- using duplicate labels disguised as diversity.

The intended contrast is **incidence geometry under matched resources**.

---

## 4. Arm S · controlled-incidence schedule

Freeze the following `2-(7,3,1)` schedule:

```text
S1 = {1,2,3}
S2 = {1,4,5}
S3 = {1,6,7}
S4 = {2,4,6}
S5 = {2,5,7}
S6 = {3,4,7}
S7 = {3,5,6}
```

Required incidence receipt:

```text
block_count = 7
point_degree = 3 for every point
pair_classes_total = 21
pair_classes_covered = 21
pair_classes_uncovered = 0
pair_duplicate_excess = 0
every_pair_incidence = 1
```

Because each block emits its three pair coordinates, the assembled observation matrix `M_S` is a row permutation of the 21-dimensional identity matrix.

Required linear-algebra receipt:

```text
rows = 21
columns = 21
rank(M_S) = 21
nullity(M_S) = 0
```

This is **complete coverage only within the declared pair-relation field**.

---

## 5. Arm A · arbitrary genuine diversity with matched marginals

Freeze this seven-block schedule:

```text
A1 = {3,5,6}
A2 = {3,4,7}
A3 = {1,2,6}
A4 = {1,2,4}
A5 = {1,4,5}
A6 = {3,5,7}
A7 = {2,6,7}
```

It is deliberately not a cheap straw control.

Required superficial-balance receipt:

```text
block_count = 7
block_size = 3
all_blocks_unique = true
point_degree = 3 for every point
total_relation_reads = 21
nominal_probe_diversity = 7 distinct blocks
```

Yet its pair-incidence ledger is different.

Required duplicate pair classes:

```text
{1,2} x2
{1,4} x2
{2,6} x2
{3,5} x2
{3,7} x2
```

Required uncovered pair classes:

```text
{1,3}
{1,7}
{2,3}
{2,5}
{4,6}
```

Therefore:

```text
pair_classes_covered = 16
pair_classes_uncovered = 5
pair_duplicate_excess = 5
```

The assembled observation matrix `M_A` contains five repeated canonical-basis rows and omits five relation coordinates.

Required linear-algebra receipt:

```text
rows = 21
columns = 21
rank(M_A) = 16
nullity(M_A) = 5
```

The point marginals are perfectly matched while the declared relation-space aperture is not.

---

## 6. Orientation arm R · repetition baseline

A repetition baseline may be retained only as historical orientation to the earlier A15 result:

```text
R1..R7 = seven copies of one 3-point block
```

Its purpose is **not** to carry the new inference.

The new inference must survive even if Arm R is deleted entirely.

Required anti-regression statement:

```text
this assay passes only by discriminating Arm S from Arm A;
beating pure repetition is insufficient because A15-R0 already earned that distinction.
```

---

## 7. Experiment 1 · structural coverage before any candidate story

Before supplying a target state, compute only the schedule geometry.

Required outputs for each central arm:

```text
point_degree_vector
pair_incidence_histogram
covered_pair_set
uncovered_pair_set
duplicate_pair_set
observation_matrix_rank
observation_matrix_nullity
```

Required comparison:

```text
same_budget = true
same_block_count = true
same_block_size = true
same_point_marginals = true
same_unique_block_count = true
same_pair_coverage = false
same_operator_rank = false
```

The implementation fails if it describes Arm A as "less diverse" merely because its pair coverage is poorer. Its blocks are genuinely distinct. The distinction under test is **diversity versus designed coverage**, not genuine versus fake diversity.

---

## 8. Experiment 2 · bounded identifiability witness

Freeze the target state:

```text
z* = 0 in R^21
```

Freeze three hostile alternatives:

```text
H_46 = z* + e_{4,6}
H_13 = z* + e_{1,3}
H_12 = z* + e_{1,2}
```

where `e_{i,j}` changes only the declared pair coordinate `{i,j}`.

### 8.1 Controlled-incidence expected result

Because Arm S covers every pair exactly once:

```text
z* distinguishable from H_46 = true
z* distinguishable from H_13 = true
z* distinguishable from H_12 = true
survivors_S = [z*]
```

Required bounded classification:

```text
CONTROLLED_INCIDENCE_ELIMINATES_DECLARED_PAIR_RELATION_NULLSPACE_IN_FIXTURE
```

### 8.2 Arbitrary-diverse expected result

Because Arm A never observes `{4,6}` or `{1,3}`:

```text
z* observationally aliased with H_46 = true
z* observationally aliased with H_13 = true
```

Because Arm A observes `{1,2}` twice:

```text
z* distinguishable from H_12 = true
```

Required survivor set:

```text
survivors_A = [z*, H_46, H_13]
```

Required bounded classification:

```text
POINT_BALANCED_ARBITRARY_DIVERSITY_RETAINS_DECLARED_RELATION_NULLSPACE
```

This result must be attributed to the five uncovered pair coordinates, not to mystical properties of the named block design.

---

## 9. Experiment 3 · permutation replay

Reorder the seven blocks in each arm without changing membership.

Expected:

```text
coverage ledger unchanged
rank unchanged
nullity unchanged
candidate survivor sets unchanged
```

Then apply a common bijective relabeling of points `1..7` to every object in an arm and its candidate coordinates.

Expected:

```text
incidence-count multiset preserved
rank preserved
nullity preserved
qualitative verdict preserved
```

Required relation:

```text
presentation order != experiment geometry
point naming != experiment geometry under consistent relabeling
```

This replay is not a universal invariance theorem. It is a guard against accidentally coding schedule meaning into labels or array order.

---

## 10. Experiment 4 · target-geometry mismatch hostile control

The strongest hostile control must attack the design assumption itself.

Introduce a separate latent coordinate:

```text
tau_124
```

representing an atomic 3-way relation for `{1,2,4}` that is explicitly **not defined as a function of the pair coordinates**.

Neither central arm's pair-coordinate forward model observes `tau_124` merely by covering its constituent pairs.

Required hostile comparison:

```text
T0: tau_124 = 0
T1: tau_124 = 1
all z_ij coordinates identical
```

Expected:

```text
Arm S distinguishes T0/T1 = false
Arm A distinguishes T0/T1 = false
```

Required classification:

```text
COVERAGE_COMPLETE_FOR_DECLARED_PAIR_SPACE_DOES_NOT_LICENSE_UNDECLARED_HIGHER_ORDER_IDENTIFICATION
```

This hostile control is mandatory. Without it, a pretty full-rank receipt could be overread as general epistemic optimality.

Core lesson:

```text
combinatorial balance
+ complete coverage of one declared relation family
!=
problem alignment for every latent relation family
```

---

## 11. Optional finite-noise extension · held until structural assay passes

Do **not** begin here.

Only after Experiments 1-4 pass may a later commit add a matched finite-noise extension.

If opened, it must preserve:

```text
same total micro-observation budget
same per-read noise law
same declared decision criterion
explicit multiplicity handling
```

The finite-noise question would be:

```text
does complete relation coverage trade precision on duplicated coordinates
for robustness against nullspace aliases under a fixed noisy budget?
```

That tradeoff is not settled by the structural rank result.

No noisy extension may silently convert:

```text
rank advantage
```

into:

```text
universal risk advantage
```

---

## 12. Falsifiers

The Jakob counterpoint is useful only if the assay can lose.

The central hypothesis is weakened or bounded further if any of the following holds under a correctly implemented matched fixture:

1. Arm A has the same declared pair coverage as Arm S after canonical incidence accounting.
2. `rank(M_A)` is not 16 or `nullity(M_A)` is not 5.
3. Arm S fails to distinguish a candidate differing only on one declared pair coordinate.
4. Arm A distinguishes candidates that differ only on its truly uncovered pair coordinates without an additional observation source.
5. A matched arbitrary, greedy, or random schedule achieves equal declared relation coverage and equal downstream criterion under the same constraints.
6. The downstream inverse problem depends on a relation family not represented by the pair-incidence design.
7. Any apparent gain vanishes once cost, multiplicity, conditioning, or declared consequence is modeled honestly in a later noisy extension.

A passing fixture therefore earns no monopoly for Steiner systems.

---

## 13. Required anti-equivalences

```text
block count != relation coverage

genuine probe diversity != coverage completeness

point balance != pair balance

pair balance != universal experiment optimality

full rank in declared relation coordinates != truth identification beyond those coordinates

controlled redundancy != epistemic optimality

uniform coverage != equal decision value

design symmetry != problem alignment

Steiner-system naming != exclusive historical authorship

Jakob Steiner counterpoint != Rudolf Steiner lineage

historical counterpoint != source-authority transfer

research assay != automatic experiment execution

research result != production authority
```

---

## 14. Receipt shape if implemented

Any implementation receipt must keep distinct fields rather than collapse them into one confidence scalar:

```text
resource_budget:
  blocks
  relation_reads

marginal_incidence:
  point_degree_vector

relation_coverage:
  covered_classes
  uncovered_classes
  duplicate_classes
  duplicate_excess

operator_geometry:
  rank
  nullity

candidate_identifiability:
  survivor_set
  alias_coordinates

problem_alignment:
  declared_relation_family
  undeclared_relation_controls

provenance:
  counterpoint_card
  historical_caveat
  source_authority_transferred = false
```

Forbidden receipt compression:

```text
confidence = 0.xx
quality_score = 0.xx
coverage_score_as_epistemic_crown = 0.xx
```

A scalar may be used for a specifically declared local metric only if its semantics remain local and the typed ledger remains primary.

---

## 15. Passing claim ceiling

A complete pass may establish only a bounded refinement candidate such as:

```text
under a matched block and observation budget,
and even with matched marginal point incidence,
a predeclared controlled-incidence schedule can eliminate relation-space
null directions that remain under an arbitrary genuinely diverse schedule
when the controlled incidence is aligned to the declared relation family.
```

A shorter form may be:

```text
diversity cardinality != coverage geometry
```

and:

```text
design value is conditional on the relation family the design actually covers
```

No pass establishes:

- universal superiority of Steiner systems;
- universal optimal design;
- universal sample-efficiency gain;
- mutual-information optimality;
- decision-theoretic optimality;
- semantic or causal pairwise decomposability;
- live TD613 measurement calibration;
- physical tomography;
- blind tomography;
- connection, curvature, holonomy, Berry structure, physical phasons, or quantum behavior;
- A16 admission;
- Proto-Loom authority;
- automatic Pedagogue redesign;
- production mutation authority.

---

## 16. Pedagogue × Aperture routing if implemented

Pedagogue should own:

```text
question formation
counterpoint provenance
falsifier declaration
relation-family declaration
candidate survivor interpretation
```

Aperture should own or audit:

```text
observation-operator rank/nullity
coverage-induced blind coordinates
conditioning if a noisy extension opens
replay stability
uncertainty accounting
```

Neither instrument becomes the other's superior.

Required routing relation:

```text
Pedagogue proposes/reframes
Aperture audits observability/identifiability/conditioning/uncertainty/replay
Dome-World hosts
human closes
```

---

## 17. Preferred implementation order

If Future Amari elects to execute this toy:

```text
1. refetch fresh main + branch head
2. verify branch still descends from relock baseline or reconcile explicitly
3. implement canonical block/pair incidence utilities
4. witness exact pair ledger for Arm S and Arm A
5. witness rank/nullity before candidate interpretation
6. run bounded candidate alias assay
7. run permutation/relabel replay
8. run higher-order target-mismatch hostile control
9. only then author a receipt
10. cheap/static validation only unless UI is intentionally added later
```

Do not open the finite-noise extension in the same science commit unless the structural result is already independently witnessed and the extension receives its own frozen amendment/spec.

---

## 18. Next learning fork if this survives

Do not pre-author the answer.

Two admissible forks are especially interesting:

```text
A. STATIC_DESIGN_VS_GREEDY_ADAPTIVE_COVERAGE_UNDER_MATCHED_BUDGET
```

or:

```text
B. CONSEQUENCE_WEIGHTED_RELATION_COVERAGE_WITH_REPLAY_ANNOTATION
```

Fork B is scientifically sharper if the current result survives, because A15-R0 already learned that:

```text
selected question != globally best question without declared consequence
```

The next mature question may therefore become:

```text
when full uniform coverage is impossible,
which relation classes deserve scarce coverage under a declared consequence,
and can that decision remain auditable without becoming a scalar crown?
```

Human closure remains required.

---

## 19. UI / release posture

```text
Pedagogue research UI = NONE
Aperture UI mutation = NONE
Moss Lantern UI = NONE
Giving UI mutation = NONE
Ash Keep production UI mutation = NONE
Holonomy Loom UI mutation = NONE
TD613.com deployment = NOT AUTHORIZED
Vercel release gesture = NONE
PR = NOT YET OPENED
branch = SPEC-ONLY TOYBOX
```

The existence of this specification authorizes no experiment by itself.

Sealed ⟐
