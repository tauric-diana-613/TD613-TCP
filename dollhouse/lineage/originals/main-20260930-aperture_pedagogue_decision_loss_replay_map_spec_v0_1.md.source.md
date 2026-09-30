# Aperture × Pedagogue Decision-Loss Replay Map Gauntlet v0.1

Status: **AUTHORED / PRE-EXECUTION / A15-R0 SYNTHETIC RESEARCH ONLY**

## 0. Research question

The prior consequence-conditioned witness established:

```text
measurement admissibility != decision value
selected under declared loss != universally best
```

The next question is:

> If both the admitted measurement/noise model and the predeclared decision consequence are replayable assumptions, can their sensitivities be represented separately without collapsing either into a universal scalar utility?

This is a bounded synthetic decision-state replay assay. It is **not** human preference inference, value learning, optimal experimental design, information geometry, or autonomous experimentation.

---

## 1. Fixed candidate questions

Retain the already-witnessed structural candidate pair:

```text
P_ORTH = orthogonal y
P_DIAG = normalized diagonal x+y
```

Every replay point used for question comparison must preserve:

```text
rank_lift > 0
complete declared joint covariance
positive-definite covariance
candidate admissibility = true
```

A question-selection flip is not allowed to masquerade as a change in candidate admissibility.

---

## 2. Measurement/noise-model coordinate

Use the same declared covariance family:

```text
Sigma(rho) = [[1,rho],[rho,1]]
```

with replay neighborhood:

```text
rho in [0.50, 0.60]
```

All points in this neighborhood remain valid positive-definite covariance models.

This coordinate represents **measurement/noise-model specification**, not human value.

---

## 3. Decision-consequence coordinate

Define a predeclared one-parameter synthetic loss path:

```text
w_Y    = (1-s)/2
w_DIFF = (1-s)/2
w_SUM  = s
```

with:

```text
0 <= s <= 1
```

The weighted loss is:

```text
L_s(q,rho)
 = w_Y    * V(H_Y,q,rho)
 + w_DIFF * V(H_DIFF,q,rho)
 + w_SUM  * V(H_SUM,q,rho)
```

The weights are authored fixture values. They do not represent inferred human preference or natural law.

---

## 4. Analytic loss-selection boundary

For the two declared candidate questions, the held-out reconstruction variances are:

### P_ORTH

```text
V(H_Y)    = 1
V(H_DIFF) = 2 - 2rho
V(H_SUM)  = 2 + 2rho
```

### P_DIAG

```text
V(H_Y)    = 3 - 2sqrt(2)rho
V(H_DIFF) = 6 - 4sqrt(2)rho
V(H_SUM)  = 2
```

Along the predeclared loss path, equality occurs at:

```text
A(rho)   = 3 + rho - 3sqrt(2)rho
s*(rho)  = A(rho) / (A(rho) + 2rho)
```

Predeclared checkpoints:

```text
rho = 0.50               -> s* ~= 0.5795987083454195
rho = 0.546918160706758  -> s* ~= 0.5285954791769510
rho = 0.60               -> s* ~= 0.4677112744730746
```

The executed assay must independently recover these boundaries numerically from the consequence-conditioned selector rather than hard-coding the selected probe.

---

## 5. Two one-axis hostile replays

### A. Decision-specification replay with measurement model fixed

Fix:

```text
rho = 0.546918160706758
```

and numerically bracket the `P_ORTH -> P_DIAG` transition as `s` crosses the analytic `s*(rho)`.

Required result:

```text
measurement model unchanged
candidate admissibility unchanged
selected question flips
```

Classification target:

```text
DECISION_SPECIFICATION_SENSITIVE_WITH_MEASUREMENT_POSTURE_HELD
```

### B. Measurement-model replay with decision specification fixed

Fix:

```text
s = 0.55
```

The analytic measurement/noise boundary is:

```text
rho*(s)
 = 3(1-s) / [2s - (1-s)(1 - 3sqrt(2))]
 ~= 0.527511006183077
```

Numerically bracket the selected-question transition across that rho value.

Required result:

```text
decision specification unchanged
candidate admissibility unchanged
selected question flips
```

Classification target:

```text
MEASUREMENT_MODEL_SENSITIVE_WITH_DECISION_SPECIFICATION_HELD
```

---

## 6. Stable interiors

The assay must include at least one replay point sufficiently far from the decision surface on each side where small local perturbations of the *other* coordinate do not alter the selected question.

This prevents the research grammar from treating every declared loss or covariance model as inherently unstable.

Required distinction:

```text
boundary sensitivity != universal instability
```

---

## 7. Joint replay map

Evaluate a small predeclared grid over:

```text
rho in {0.50, 0.546918160706758, 0.60}
s   in {0.40, 0.55, 0.70}
```

At every grid point:

1. verify both questions remain candidate-admissible;
2. record the selected question under the declared `L_s` card;
3. record no scalar value beyond the explicitly declared weighted loss;
4. preserve rho and s as separate provenance fields.

The grid must contain both `P_ORTH` and `P_DIAG` selections.

No metric may collapse `(rho,s)` into one synthetic “uncertainty” number.

---

## 8. Constitutional distinction

The intended state object is therefore at least:

```text
measurement_posture
+ decision_consequence_specification
+ question_selection
+ replay_sensitivity
```

with anti-equivalences:

```text
measurement-model sensitivity != decision-specification sensitivity
stable measurement admissibility != stable question selection
stable declared loss != stable question selection under changed measurement model
boundary sensitivity != universal instability
loss replay != human preference inference
joint replay map != information geometry
```

---

## 9. Relationship to unresolved PR #677

Draft PR #677 keeps H1/H2/H3 held for human closure.

This assay may create bounded evidence relevant to H1 · Consequence Conservation because it explicitly preserves the consequence specification as an independent input rather than letting a narrower measurement criterion inherit decision value.

But:

```text
#686 evidence != #677 hypothesis promotion
```

No status in #677 may be mutated.

---

## 10. Relationship to unresolved PR #684

Draft PR #684 remains a separate unresolved Aperture ingress/history reconciliation surface. This assay consumes current installed `main` behavior only and does not resolve, merge, rewrite, or close #684.

---

## 11. Authored falsifiers

The gauntlet fails if any of the following occurs:

1. either candidate loses admissibility inside the declared replay neighborhood;
2. the numerical `s` boundary disagrees materially with the analytic `s*(rho)`;
3. the numerical `rho` boundary at fixed `s=0.55` disagrees materially with the analytic `rho*(s)`;
4. selected question fails to flip across either predeclared boundary;
5. a replay result collapses measurement/noise and loss specification into one scalar coordinate;
6. every local replay is labeled unstable despite stable interior controls;
7. value or preference is inferred rather than declared by fixture;
8. held sibling PRs are mutated;
9. installed Aperture replay status is promoted;
10. any execution, production, Vercel, physical tomography, optimal-design, information-geometry, connection, curvature, holonomy, Berry, quantum, or Proto-Loom authority is created.

---

## 12. Claim ceiling

A positive result can support only:

> In this bounded synthetic linear/covariance fixture, selected-question sensitivity has at least two separable declared coordinates: measurement/noise-model specification and decision-consequence specification. Holding either coordinate fixed while perturbing the other can cross the same candidate-selection boundary while candidate admissibility remains unchanged. Stable interiors also exist. The two coordinates must remain separately replayable in the receipt.

It does not establish universal decision theory, optimal experimental design, value learning, or information geometry.

---

## 13. Frozen next learning question

If witnessed:

```text
TEST_WHETHER_REPLAY_SENSITIVITY_ITSELF_SHOULD_GATE_QUESTION_PROPOSAL_OR_ONLY_ANNOTATE_IT,
WITHOUT_CONVERTING_DECLARED_VALUE_CONTINGENCY_INTO_ABSTENTION_BY_DEFAULT
```

The research must not automatically turn sensitivity into refusal; it must first determine what consequence such a gate would preserve.
