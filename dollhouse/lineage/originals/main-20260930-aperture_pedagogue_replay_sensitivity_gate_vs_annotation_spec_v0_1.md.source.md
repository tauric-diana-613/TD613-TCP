# Aperture × Pedagogue Replay Sensitivity Gate vs Annotation Gauntlet v0.1

Status: **AUTHORED / PRE-EXECUTION / A15-R0 SYNTHETIC RESEARCH ONLY**

## 0. Why this experiment exists

The witnessed decision-loss replay map established two independent replay axes:

```text
measurement-model replay != decision-specification replay
```

Either axis can flip the selected question while the other remains fixed, even when both candidate questions remain measurement-admissible and stable interiors exist away from the boundary.

The next unresolved question is therefore not whether replay sensitivity exists. It is:

> **When should replay sensitivity block a question proposal, and when should it merely travel with the proposal as an annotation?**

The central anti-collapse rule is:

```text
value-contingent question choice != epistemic insufficiency
```

A system must not convert uncertainty about *which declared consequence matters* into an assertion that the measurement itself is invalid, underidentified, or unavailable.

---

## 1. Companion division of labor

```text
Pedagogue
  proposes/reframes a predeclared candidate question
  and carries the declared consequence/loss object

Aperture
  audits structural identifiability, numerical stability,
  uncertainty geometry, and replay posture

Dome-World
  hosts the synthetic replay envelope

Human
  retains consequence declaration, promotion, execution, and closure
```

No companion may infer a human preference from replay behavior.

---

## 2. Required typed outcomes

The assay must preserve at least four distinct postures.

### A. Stable proposal

When candidate admissibility and selected question remain invariant throughout the declared replay envelope:

```text
PROPOSE_STABLE_WITHIN_DECLARED_REPLAY_ENVELOPE
```

This means local stability only. It does not establish universal robustness.

### B. Replay-sensitive proposal

When candidate admissibility remains valid throughout the envelope but the selected question flips because a declared measurement-model or decision-specification coordinate moves:

```text
PROPOSE_WITH_REPLAY_SENSITIVITY_ANNOTATION
```

The proposal remains available, but its receipt must identify:

```text
sensitivity_axis
boundary_or_switch_region
stable_interiors_if_any
candidate_admissibility_preserved
selected_question_not_universal
```

Replay sensitivity alone may not manufacture `ABSTAIN`.

### C. Admissibility-instability hold

When at least one candidate question ceases to satisfy the declared measurement-admissibility requirements inside the replay envelope:

```text
ABSTAIN_CANDIDATE_ADMISSIBILITY_NOT_STABLE
```

This is a measurement/instrument-posture failure, not a value-contingency label.

### D. Undeclared/conflicting consequence refusal

Existing consequence-selection refusals remain authoritative:

```text
NO_SELECTION_UNDECLARED_DECISION_LOSS
NO_SELECTION_CONFLICTING_LOSSES_WITHOUT_AGGREGATION_RULE
POSTHOC_DECISION_LOSS_MUTATION_NOT_CONFIRMATORY
```

These may not be relabeled as numerical instability or structural rank deficit.

---

## 3. Hostile factorial

The gauntlet must contain independently authored fixtures for:

### F1 · Stable interior

- candidate admissibility valid across the envelope;
- selected question invariant;
- expected posture: `PROPOSE_STABLE_WITHIN_DECLARED_REPLAY_ENVELOPE`.

### F2 · Measurement-model selection sensitivity

- declared decision specification fixed;
- candidate admissibility valid across the envelope;
- measurement/noise-model coordinate crosses the witnessed question-selection surface;
- selected question flips;
- expected posture: `PROPOSE_WITH_REPLAY_SENSITIVITY_ANNOTATION`;
- sensitivity axis: `MEASUREMENT_MODEL`.

### F3 · Decision-specification selection sensitivity

- measurement model fixed;
- candidate admissibility valid across the envelope;
- declared synthetic loss coordinate crosses the witnessed question-selection surface;
- selected question flips;
- expected posture: `PROPOSE_WITH_REPLAY_SENSITIVITY_ANNOTATION`;
- sensitivity axis: `DECISION_SPECIFICATION`.

### F4 · Admissibility instability

- declared consequence fixed;
- replay envelope crosses a validly authored measurement-admissibility boundary such that at least one candidate ceases to be admissible;
- expected posture: `ABSTAIN_CANDIDATE_ADMISSIBILITY_NOT_STABLE`.

### F5 · Consequence missing/conflicting

- measurement posture remains otherwise admissible;
- no declared loss, conflicting unaggregated losses, or post-hoc loss rewrite;
- preserve existing refusal classes exactly.

---

## 4. What must remain separate in the receipt

The replay receipt must carry separate fields for:

```text
deficit_class
disposition
measurement_admissibility
measurement_model_coordinate
decision_specification_coordinate
replay_sensitivity_axis
selection_stability
selected_probe_id
proposal_annotation
refusal_reason
```

No scalar replay score, robustness score, or universal confidence value may replace these typed objects.

---

## 5. Authored expectations / falsifiers

The gauntlet fails if any of the following occurs:

1. F1 is labeled replay-sensitive or abstaining despite stable admissibility and stable selection;
2. F2 or F3 is automatically converted to abstention solely because the preferred question changes;
3. F2 measurement-model sensitivity is relabeled as decision-specification sensitivity;
4. F3 decision-specification sensitivity is relabeled as measurement-model sensitivity;
5. F4 remains an ordinary proposal after candidate admissibility fails somewhere inside its declared envelope;
6. undeclared/conflicting/post-hoc consequence cases are converted into epistemic-deficit classes;
7. a selected question is called universally best;
8. replay sensitivity is collapsed into one scalar;
9. the selector infers or learns a human preference;
10. any proposal executes automatically;
11. PR #677 H1/H2/H3 are promoted, accepted, rejected, or rewritten;
12. PR #684 is merged from, overwritten, resolved, or closed;
13. installed `APERTURE_V32_REPLAY_STABILITY` is mutated;
14. production or standalone Aperture UI is mutated.

---

## 6. Intended anti-equivalences

```text
replay-sensitive selection != invalid measurement
replay-sensitive selection != automatic abstention
value contingency != epistemic deficit
admissibility instability != value contingency
annotation != execution authority
stable interior != universal robustness
measurement-model sensitivity != decision-specification sensitivity
selected under declared loss != universally best
#686 evidence != #677 hypothesis promotion
```

---

## 7. Relationship to unresolved sibling PRs

### PR #677

This assay may create additional bounded synthetic evidence relevant to:

```text
H1 · Consequence Conservation
H2 · Aperture Before Absence
H3 · Role Before Repetition
```

but may not mutate their HELD status or human-closure queue.

### PR #684

PR #684 remains an unresolved historical/ingress reconciliation surface. This assay consumes current installed `main` contracts only and does not depend on #684 merging.

---

## 8. Claim ceiling

A positive witness may support only:

> In this bounded synthetic fixture, replay sensitivity can be typed separately from measurement admissibility and from missing/conflicting decision consequence. A question whose preferred identity changes across an admissible replay envelope can remain proposal-eligible with an explicit sensitivity annotation, while instability of measurement admissibility can justify a stronger hold. These distinctions do not establish universal robustness, utility, preference, or optimal design.

It does not establish:

```text
universal replay radius
universal best question
universal utility
human preference inference
preference learning
optimal experimental design
decision-theory promotion
active-learning optimality
information geometry
physical sensor design
physical tomography
blind/operator tomography
autonomous experiment execution
connection
curvature
holonomy
Berry structure
quantum behavior
Proto-Loom
production authority
release authority
```

---

## 9. Frozen next learning question

If witnessed:

```text
TEST_WHETHER_MULTI_AXIS_REPLAY_ANNOTATIONS_CAN_BE_COMPOSED_WITHOUT_COLLAPSING_MEASUREMENT_UNCERTAINTY_DECISION_CONTINGENCY_AND_ROUTE_PROVENANCE_INTO_ONE_CONFIDENCE_OBJECT
```

That question is held until this gate-vs-annotation distinction survives execution.
