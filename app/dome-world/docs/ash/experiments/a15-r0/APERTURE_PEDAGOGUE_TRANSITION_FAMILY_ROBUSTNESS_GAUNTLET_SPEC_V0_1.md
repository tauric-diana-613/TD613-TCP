𝌋

# Aperture × Pedagogue Transition-Family Robustness Gauntlet v0.1

**Status:** PREREGISTERED / PRE-IMPLEMENTATION / A15-R0 SYNTHETIC RESEARCH ONLY  
**Technical identity:** `td613.a15-r0.aperture-pedagogue-transition-family-robustness/v0.1`  
**Parent research seam:** endogenous post-question operator re-audit under declared point transitions  
**Western docket:** `WESTERN_HORIZON_EPISTEMIC_TRANSPORT_RESEARCH_DOCKET_V0_1.md`  
**Installed Aperture mutation:** NONE  
**Pedagogue promotion authority:** NONE  
**A16:** HELD  
**Production / Vercel authority:** NONE

---

## 0. Research question

The parent assay established a bounded synthetic failure mode:

```text
pre-question admissibility != post-question admissibility
```

when a question has a declared point-valued effect on the observation operator.

This gauntlet asks the next narrower question:

> **When the post-question operator is not known as one declared point but is constrained to a declared compatible transition family, does the candidate remain admissible for every compatible transition, fail for every compatible transition, or remain decision-unresolved across the family?**

The experiment introduces a strict distinction:

```text
transition uncertainty != transition ignorance
```

No unknown transition operator is inferred in this chamber.

---

## 1. Frozen local geometry

Reuse the parent synthetic latent dimension:

```text
latent_dimension = 2
```

Current operator:

```text
A0 = [
  [1,0]
]
```

Required current diagnosis:

```text
rank = 1
STRUCTURAL_RANK_DEFICIT
PROPOSE
```

Reuse the same local Aperture thresholds:

```text
sigma_min_floor = 0.25
condition_number_ceiling = 10
uncertainty_status = VALID_DECLARED
threshold_authority = A15_R0_SYNTHETIC_LOCAL
```

A post-question operator member is **healthy** only when the installed pure Aperture v3.2 typed-deficit audit returns:

```text
deficit_class = NO_DECLARED_LOCAL_IDENTIFIABILITY_DEFICIT
disposition = ASK_NOTHING
```

Full rank alone does not count as healthy.

---

## 2. Frozen transition-status grammar

Every candidate must have exactly one transition knowledge status:

```text
DECLARED
SET_IDENTIFIED
UNMODELED
```

### DECLARED

One exact synthetic post-question row is declared.

Required posture:

```text
ordinary point post-question re-audit
```

### SET_IDENTIFIED

A finite compatible family of synthetic post-question rows is declared.

Required posture:

```text
evaluate every declared compatible family member
never replace the family by its nominal member
never average members into a synthetic point transition
```

### UNMODELED

No admissible post-question transition law or compatible family is declared.

Required posture:

```text
TRANSITION_MODEL_UNDECLARED
ABSTAIN_BEFORE_ROBUST_COUNTERFACTUAL_REAUDIT
```

The implementation may not install an identity transition by default.

---

## 3. Frozen family outcome grammar

For `SET_IDENTIFIED` candidates, classify only from the complete declared family.

### ROBUSTLY_ADMISSIBLE

Every family member is healthy:

```text
healthy_member_count = family_size
```

### ROBUSTLY_INADMISSIBLE

No family member is healthy:

```text
healthy_member_count = 0
```

### TRANSITION_FAMILY_DECISION_UNRESOLVED

At least one family member is healthy and at least one is not:

```text
0 < healthy_member_count < family_size
```

This is not a probability statement.

No member weights, priors, confidence scalar, majority vote, averaging, or expected utility are admitted in v0.1.

---

## 4. Frozen candidate family

Every candidate receives the same pre-question row:

```text
q_pre = [0,1]
```

Therefore every candidate appears perfectly conditioned under the pre-question point geometry:

```text
A_pre = [
  [1,0],
  [0,1]
]

rank = 2
sigma_min = 1
condition_number = 1
NO_DECLARED_LOCAL_IDENTIFIABILITY_DEFICIT
ASK_NOTHING
```

The candidate differences exist only in the declared post-question transition knowledge.

### Q_DECLARED_STABLE

```text
transition_knowledge = DECLARED
q_post = [0,1]
```

Required:

```text
POINT_ADMISSIBLE
ranking_eligible = true
```

### Q_ROBUST_FAMILY

```text
transition_knowledge = SET_IDENTIFIED
nominal q_post = [0.2,1]
family = [
  [0,1],
  [0.2,1],
  [-0.2,1]
]
```

Every family member must remain healthy.

Required:

```text
ROBUSTLY_ADMISSIBLE
healthy_member_count = 3
ranking_eligible = true
```

### Q_MIXED_FAMILY

```text
transition_knowledge = SET_IDENTIFIED
nominal q_post = [0,1]
family = [
  [0,1],
  [1,0],
  [1,0.001]
]
```

The nominal member is maximally healthy under the local geometry.

But the family also contains:

```text
[1,0]      -> STRUCTURAL_RANK_DEFICIT
[1,0.001]  -> NUMERICAL_STABILITY_DEFICIT
```

Required:

```text
TRANSITION_FAMILY_DECISION_UNRESOLVED
healthy_member_count = 1
ranking_eligible = false
```

This is the primary hostile against point-estimate laundering.

### Q_BAD_FAMILY

```text
transition_knowledge = SET_IDENTIFIED
nominal q_post = [1,0]
family = [
  [1,0],
  [2,0],
  [1,0.001]
]
```

Required:

```text
ROBUSTLY_INADMISSIBLE
healthy_member_count = 0
ranking_eligible = false
```

### Q_UNMODELED

```text
transition_knowledge = UNMODELED
nominal q_post = null
family = null
```

Required:

```text
TRANSITION_MODEL_UNDECLARED
ABSTAIN_BEFORE_ROBUST_COUNTERFACTUAL_REAUDIT
ranking_eligible = false
```

---

## 5. Nominal-only hostile selector

Author a deliberately naive selector that:

1. ignores transition-family width;
2. evaluates only the nominal post-question row;
3. ranks nominally healthy candidates by local condition number;
4. resolves ties lexically by candidate id.

Because `Q_MIXED_FAMILY` has nominal row `[0,1]`, it must appear perfectly conditioned.

Preregistered hostile expectation:

```text
nominal-only selector -> Q_MIXED_FAMILY
```

The selector is not evidence for a recommended design rule.

It exists to demonstrate that a point estimate can hide adverse compatible transitions.

---

## 6. Robust-family selector

The robust selector may rank only:

```text
POINT_ADMISSIBLE
ROBUSTLY_ADMISSIBLE
```

It must exclude:

```text
ROBUSTLY_INADMISSIBLE
TRANSITION_FAMILY_DECISION_UNRESOLVED
TRANSITION_MODEL_UNDECLARED
```

Ranking among robustly eligible candidates may use the **worst family-member condition number** under the local bounded fixture.

For a point-declared candidate, the one member is its worst member.

Required winner:

```text
Q_DECLARED_STABLE
```

because its exact post-question identity geometry has condition number `1`, while the robust family has a strictly larger worst-case condition number.

This ranking is a local deterministic fixture rule only.

It is not maximin Bayesian experimental design, robust-control optimality, active-learning optimality, or a general utility theorem.

---

## 7. Family completeness hostile controls

### H1 — drop adverse member from mixed family

Remove `[1,0]` or `[1,0.001]` from `Q_MIXED_FAMILY` while claiming to validate against the original preregistered family.

Required:

```text
REJECT_FAMILY_MEMBERSHIP_MISMATCH
```

### H2 — duplicate healthy member

Duplicate `[0,1]` in the mixed family.

Required:

```text
REJECT_DUPLICATE_FAMILY_MEMBER
```

Raw member multiplicity may not manufacture evidence weight.

### H3 — average family into one row

Replace the family by its arithmetic mean or another synthetic representative.

Required:

```text
REJECT_FAMILY_COLLAPSE
```

### H4 — majority vote

Mark a mixed family admissible because more members are healthy than unhealthy, or inadmissible because more members are unhealthy than healthy.

Required:

```text
REJECT_MAJORITY_VOTE
```

The v0.1 grammar is set-wise, not probabilistic.

---

## 8. Transition-knowledge laundering controls

### H5 — set-identified -> declared laundering

Take `Q_MIXED_FAMILY` and relabel it `DECLARED` while retaining only its nominal member.

Required:

```text
REJECT_TRANSITION_KNOWLEDGE_LAUNDERING
```

### H6 — unmodeled -> identity laundering

Take `Q_UNMODELED` and insert `[0,1]` or any other default transition.

Required:

```text
REJECT_UNMODELED_IDENTITY_LAUNDERING
```

### H7 — undeclared family member

Add a post-question row that was not in the frozen compatible family.

Required:

```text
REJECT_FAMILY_MEMBERSHIP_MISMATCH
```

---

## 9. Source immutability

Evaluation may not mutate:

```text
current operator
candidate definitions
transition families
local thresholds
installed Aperture engine
```

All returned receipts must be recursively frozen or otherwise immutable under the fixture's ordinary JavaScript mutation surface.

---

## 10. No experiment execution

All transitions are counterfactual synthetic rows.

Required:

```text
automatic_observation = false
automatic_experiment_execution = false
sequence_authority = false
promotion_authority = false
human_closure_required = true
```

No question is actually asked of a person, model, network, sensor, or production route.

---

## 11. Success criterion

The gauntlet passes only if:

1. the current operator remains `STRUCTURAL_RANK_DEFICIT / PROPOSE`;
2. every candidate has the same healthy pre-question geometry;
3. `Q_DECLARED_STABLE` is point-admissible;
4. every `Q_ROBUST_FAMILY` member is healthy;
5. `Q_ROBUST_FAMILY` is `ROBUSTLY_ADMISSIBLE`;
6. `Q_MIXED_FAMILY` contains exactly one healthy, one structurally deficient, and one numerically fragile member;
7. `Q_MIXED_FAMILY` is `TRANSITION_FAMILY_DECISION_UNRESOLVED`;
8. `Q_BAD_FAMILY` has zero healthy members and is `ROBUSTLY_INADMISSIBLE`;
9. `Q_UNMODELED` abstains without inventing a transition;
10. the nominal-only hostile selector chooses `Q_MIXED_FAMILY`;
11. the robust selector excludes mixed/bad/unmodeled candidates and chooses `Q_DECLARED_STABLE`;
12. family membership hostile controls reject;
13. duplicate-member and majority-vote laundering reject;
14. transition-knowledge laundering rejects;
15. source objects remain unchanged;
16. installed Aperture remains unchanged;
17. no observation, experiment, sequence, promotion, production, or Vercel authority is created.

---

## 12. Allowed bounded statement

If witnessed, the maximum warranted refinement candidate is:

> **In this finite synthetic fixture, post-question admissibility can be evaluated over a declared compatible transition family without collapsing that family to a nominal point: a candidate may be robustly admissible when every compatible post-question operator remains healthy, robustly inadmissible when none do, or decision-unresolved when compatible transitions straddle typed Aperture outcomes. The fixture therefore distinguishes transition uncertainty from transition ignorance and shows that nominal post-question geometry can be insufficient for robust candidate admission.**

---

## 13. Kill criterion

The chamber fails if it cannot preserve all of the following simultaneously:

```text
complete declared transition family
point-vs-family knowledge distinction
structural-vs-numerical Aperture typing
mixed-family unresolved status
unmodeled abstention
no majority vote
no family averaging
no automatic execution
no authority widening
```

A failed preregistered family must remain failed.

Post hoc family edits do not count as confirmatory evidence.

---

## 14. Claim ceiling

A passing result does not establish:

```text
robust Bayesian experimental-design theorem
maximin optimality
robust-control theorem
active-learning optimality
POMDP theorem
dual-control theorem
transition probability model
transition distribution calibration
system identification
operator identification
operator tomography
path category theorem
path-dependent transport theorem
loop endomorphism
holonomy
curvature
Berry structure
quantum measurement disturbance
physical sensing law
physical tomography
blind tomography
TD613-general AIA theorem
Proto-Loom
live Ash recovery
production authority
Vercel authority
```

Installed Aperture v3.2 remains unchanged.

A16 remains held.

---

## 15. Frozen next learning action

Only if this transition-family assay is witnessed may the western frontier consider:

```text
TEST_TRANSITION_OPERATOR_IDENTIFIABILITY_FROM_PARTIAL_INPUT_OUTPUT_PROBES_WITH_EXPLICIT_OPERATOR_COMPATIBLE_FAMILY_NULLSPACE_CONDITIONING_HELDOUT_PREDICTION_AND_OPEN_SET_OPERATOR_CONTROLS_BEFORE_ANY_OPERATOR_TOMOGRAPHY_PATH_TRANSPORT_OR_HOLONOMY_PROMOTION
```

That future chamber is not implemented by this preregistration.

𝌋

Sealed ⟐
