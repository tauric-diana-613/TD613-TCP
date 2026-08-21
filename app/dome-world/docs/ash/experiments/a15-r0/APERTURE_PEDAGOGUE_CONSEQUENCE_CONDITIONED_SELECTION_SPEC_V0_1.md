# Aperture × Pedagogue Consequence-Conditioned Question Selection Gauntlet v0.1

Status: **AUTHORED / PRE-EXECUTION / A15-R0 SYNTHETIC RESEARCH ONLY**

## 0. Why this experiment exists

The replay-envelope witness established that two admissible candidate questions can cross a categorical selection boundary while their underlying candidate consequence surfaces remain smooth, and that different held-out consequences can prefer different questions.

Therefore the phrase:

```text
best next question
```

is not admissible without answering:

```text
best for which declared consequence?
```

The central authored proposition is:

> **best next question is undefined without a declared decision consequence once admissible downstream consequences disagree.**

This is not a promotion to optimal experimental design, decision theory, active learning, preference learning, or value inference.

---

## 1. Companion division of labor

The assay preserves the installed repo sequence:

```text
Pedagogue / human-declared research fixture
  names the consequence or loss object before selection

Aperture
  audits whether candidate observations remain structurally and uncertainty-admissible

bounded selector
  ranks only the admitted candidate questions under the predeclared consequence

held-out audit
  inspects consequences not used by that loss card

human
  retains closure and all consequential execution authority
```

Neither companion invents a human preference.

---

## 2. Fixed candidate questions

The structural inverse problem and candidate question family remain the previously witnessed pair:

```text
P_ORTH = orthogonal y
P_DIAG = normalized diagonal x+y
```

Both must retain:

```text
rank_lift > 0
valid declared full covariance
complete joint uncertainty geometry
```

or no consequence-conditioned selection is permitted.

---

## 3. Boundary fixture

Use the already localized question-selection neighborhood:

```text
rho = 0.546918160706758
```

The downstream reconstruction-risk object is the exact linear covariance:

```text
C_q = A_q^-1 Sigma A_q^-T
```

with the same three declared linear consequence functionals:

```text
H_Y    = [0, 1]
H_DIFF = [1,-1]
H_SUM  = [1, 1]
```

The expected local disagreement is predeclared:

```text
H_Y    prefers P_ORTH
H_DIFF prefers P_ORTH
H_SUM  prefers P_DIAG
```

If the experiment does not reproduce that disagreement, the gauntlet fails.

---

## 4. Predeclared loss cards

### Single-functional cards

```text
L_Y    -> H_Y
L_DIFF -> H_DIFF
L_SUM  -> H_SUM
```

Expected selections:

```text
L_Y    -> P_ORTH
L_DIFF -> P_ORTH
L_SUM  -> P_DIAG
```

### Explicit weighted cards

Two synthetic weighted cards are predeclared before execution:

```text
L_EQUAL:
  H_Y    = 1/3
  H_DIFF = 1/3
  H_SUM  = 1/3

L_SUM_HEAVY:
  H_Y    = 0.1
  H_DIFF = 0.1
  H_SUM  = 0.8
```

Expected selections:

```text
L_EQUAL     -> P_ORTH
L_SUM_HEAVY -> P_DIAG
```

The weights are authored synthetic fixture values, not natural law or inferred human preferences.

---

## 5. Refusal controls

### No declared consequence

If no loss card is supplied:

```text
NO_SELECTION_UNDECLARED_DECISION_LOSS
selected_probe_id = null
```

### Conflicting unaggregated consequences

If the selector is given multiple consequence functionals whose preferred candidates conflict, but no aggregation rule:

```text
NO_SELECTION_CONFLICTING_LOSSES_WITHOUT_AGGREGATION_RULE
selected_probe_id = null
```

It may not silently average, lexicographically order, or otherwise manufacture a utility.

### Post-hoc value mutation

Changing the loss card after observing which candidate wins must produce:

```text
POSTHOC_DECISION_LOSS_MUTATION_NOT_CONFIRMATORY
selected_probe_id = null
```

The selector may not repaint an exploratory result as confirmatory by changing the prize category after seeing the contestant.

---

## 6. Bounded dominance hostile control

A separate declared covariance posture is used:

```text
rho = 0.9
```

For the **declared subset**:

```text
{H_Y, H_SUM}
```

`P_DIAG` is expected to beat `P_ORTH` on both consequences. Therefore the selector may record:

```text
DECLARED_SET_DOMINANCE_WITHIN_UNAGGREGATED_FAMILY
```

But the excluded consequence:

```text
H_DIFF
```

is predeclared to prefer `P_ORTH` at the same rho.

Therefore:

```text
declared-subset dominance != universal dominance
```

The dominance control fails if the excluded counterexample disappears.

---

## 7. Relationship to unresolved PR #677

Draft PR #677 holds:

```text
H1 · Consequence Conservation
```

This assay may create additional bounded synthetic evidence relevant to H1, but:

```text
#686 evidence != #677 hypothesis promotion
```

The assay may not accept, reject, rewrite, merge, close, or otherwise mutate H1/H2/H3 or PR #677.

---

## 8. Relationship to unresolved PR #684

Draft PR #684 remains an unresolved Aperture ingress/history reconciliation surface. This assay consumes the installed contract on current `main`; it does not merge from, overwrite, resolve, or close #684.

---

## 9. Authored expectations / falsifiers

The gauntlet passes only if:

1. both candidates remain Aperture-admissible in the declared fixture;
2. `L_Y` and `L_DIFF` select `P_ORTH`;
3. `L_SUM` selects `P_DIAG`;
4. `L_EQUAL` selects `P_ORTH`;
5. `L_SUM_HEAVY` selects `P_DIAG`;
6. no declared loss returns `NO_SELECTION_UNDECLARED_DECISION_LOSS`;
7. conflicting unaggregated losses refuse selection;
8. post-hoc loss mutation is not confirmatory;
9. the bounded dominance control selects `P_DIAG` for `{H_Y,H_SUM}` while excluded `H_DIFF` still selects `P_ORTH`;
10. held-out consequences not named by the current loss card do not participate in that card's selection;
11. no universal-best, universal-utility, value-inference, preference-learning, or execution authority is created;
12. sibling PRs #677 and #684 remain untouched;
13. installed Aperture replay status remains held.

---

## 10. Intended anti-equivalences

```text
measurement admissibility != decision value
selected under declared loss != universally best
predeclared aggregation != natural law
declared-subset dominance != universal dominance
posthoc loss switch != confirmatory evidence
#686 evidence != #677 hypothesis promotion
```

---

## 11. Claim ceiling

A positive witness can support only:

> In this bounded synthetic fixture, admissible candidate questions can reverse ordering when the predeclared downstream consequence or aggregation changes. When consequences conflict and no aggregation rule is declared, the selector can correctly refuse a universal question ranking. Dominance over a declared consequence subset does not transfer to an excluded consequence.

It does not establish:

```text
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

## 12. Frozen next learning question

If witnessed, the next question becomes:

```text
TEST_DECISION_LOSS_REPLAY_STABILITY_AND_MULTI_AXIS_ENVELOPE_INTERSECTIONS_BEFORE_ANY_DECISION_THEORY_OR_OPTIMAL_DESIGN_PROMOTION
```

The loss card itself must then be subjected to replay scrutiny rather than treated as metaphysically fixed.
