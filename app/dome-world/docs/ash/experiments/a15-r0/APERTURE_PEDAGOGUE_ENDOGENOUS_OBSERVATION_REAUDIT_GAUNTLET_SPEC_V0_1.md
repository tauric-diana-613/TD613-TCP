𝌋

# Aperture × Pedagogue Endogenous Observation Re-Audit Gauntlet v0.1

**Status:** AUTHORED / PRE-EXECUTION / A15-R0 SYNTHETIC RESEARCH ONLY  
**Technical identity:** `td613.a15-r0.aperture-pedagogue-endogenous-observation-reaudit/v0.1`  
**Installed Aperture mutation:** NONE  
**Pedagogue promotion authority:** NONE  
**Production / Vercel authority:** NONE

---

## 0. Why this chamber exists

The current A15-R0 program has separately earned bounded synthetic results for:

- typed structural-rank versus numerical-stability deficits;
- nullspace-targeted candidate-question design;
- covariance-aware and consequence-conditioned widening;
- joint state–instrument reconstruction;
- projective holonomy reconstruction from observability motion;
- probe × ecology co-design under a frozen hypothesis prediction table.

Those results still leave one seam open.

A candidate question may be evaluated under the **current** observation operator even when the act of asking that question has a declared effect on the observation ecology or operator that will exist **after** the question is asked.

The central proposition is therefore:

> **A question that is admissible under the current aperture is not automatically admissible under the aperture produced by asking it.**

This is a synthetic endogeneity / intervention-dependent observation-operator assay. It is **not** quantum measurement disturbance, physical sensor feedback, performative-prediction theory, optimal experimental design, or autonomous experiment execution.

---

## 1. Companion division of labor

```text
Pedagogue
  receives the present deficit and a predeclared candidate-question family
  may propose/reframe candidate questions
  may not execute them

Aperture
  audits the current operator
  audits each declared counterfactual post-question operator
  keeps structural rank, numerical stability, uncertainty, and no-deficit states typed

Dome-World
  hosts the synthetic counterfactual experiment

Human
  controls promotion, consequential execution, release, and closure
```

Hard boundary:

```text
proposal
!=
counterfactual post-question audit
!=
executed observation
```

---

## 2. Frozen latent geometry

Use a two-dimensional latent state:

```text
S = [x,y]^T
latent_dimension = 2
```

The current declared observation operator is:

```text
A0 = [1,0]
```

so:

```text
rank(A0) = 1
nullity(A0) = 1
```

The present Aperture diagnosis must therefore be:

```text
STRUCTURAL_RANK_DEFICIT
PROPOSE
SEEK_PREDECLARED_NULLSPACE_CONTRACTING_OBSERVATION_THEN_AUDIT_STABILITY
```

The present blind direction is the y direction.

---

## 3. Candidate-question family

Every candidate is defined by two different objects:

```text
q_pre      = row the question appears to add in the current geometry
q_post     = row actually available after the candidate's declared ecology/operator response
```

The post-question row is a **declared synthetic transition rule**, not inferred physical behavior.

### Q_STABLE · survives its own intervention

```text
q_pre  = [1,1]
q_post = [0,1]

A_pre  = [[1,0],[1,1]]
A_post = [[1,0],[0,1]]
```

Expected:

```text
pre  rank = 2
post rank = 2
post sigma_min = 1
post condition_number = 1
post Aperture = NO_DECLARED_LOCAL_IDENTIFIABILITY_DEFICIT / ASK_NOTHING
```

### Q_COLLAPSE · pre-question glamour, post-question structural failure

```text
q_pre  = [0,1]
q_post = [1,0]

A_pre  = [[1,0],[0,1]]
A_post = [[1,0],[1,0]]
```

Expected:

```text
pre  rank = 2
post rank = 1
post Aperture = STRUCTURAL_RANK_DEFICIT / PROPOSE
```

This is the main self-invalidating control.

### Q_FRAGILE · pre-question stable, post-question numerically raggedy

```text
q_pre  = [0,1]
q_post = [1,0.001]

A_pre  = [[1,0],[0,1]]
A_post = [[1,0],[1,0.001]]
```

The post-question operator remains full rank but should reproduce the installed Aperture v3.2 fragile-control neighborhood:

```text
sigma_min ≈ 0.0007071065
condition_number ≈ 2000.0005
```

with local thresholds:

```text
sigma_min_floor = 0.25
condition_number_ceiling = 10
uncertainty_status = VALID_DECLARED
```

Expected Aperture result:

```text
NUMERICAL_STABILITY_DEFICIT
PROPOSE
SEEK_PREDECLARED_STABILIZING_OBSERVATION_WITHOUT_REQUIRING_RANK_LIFT
```

### Q_UNKNOWN · transition law withheld

```text
q_pre = [0,1]
q_post = UNDECLARED
```

The assay must refuse to pretend that the pre-question geometry is the post-question geometry.

Required research-only wrapper status:

```text
POST_QUESTION_OPERATOR_MODEL_INCOMPLETE
ABSTAIN_BEFORE_COUNTERFACTUAL_REAUDIT
```

This is **not** a new installed Aperture deficit class in v0.1.

---

## 4. Required geometry calculations

For every declared 2×2 operator, compute independently from its rows:

```text
rank
sigma_min
sigma_max
condition_number = sigma_max / sigma_min
```

For rank-deficient operators:

```text
sigma_min = 0
condition_number = finite declared sentinel >= local ceiling
```

No candidate may copy authored expected sigma/condition values into the result.

---

## 5. Aperture coupling

Use the installed pure engine:

```text
app/engine/aperture-v32-typed-epistemic-deficit.js
```

For each candidate with a declared transition model:

```text
current operator
→ Aperture current audit
→ Pedagogue candidate family
→ candidate-specific pre-question geometry
→ declared post-question transition
→ recompute post-question rank/stability
→ Aperture post-question re-audit
```

A candidate is classified:

```text
POST_QUESTION_HEALTHY
```

only when its post-question audit returns:

```text
NO_DECLARED_LOCAL_IDENTIFIABILITY_DEFICIT / ASK_NOTHING
```

A pre-question `ASK_NOTHING` never substitutes for the post-question audit.

---

## 6. Hostile decision controls

### H1 · Static pre-audit trap

A naive selector that ranks only `A_pre` may prefer `Q_COLLAPSE` or `Q_FRAGILE` because each appears perfectly conditioned before the declared transition.

The gauntlet must prove that static pre-question admissibility can disagree with post-question admissibility.

### H2 · Numerical fragility is not structural collapse

`Q_FRAGILE` must remain:

```text
rank = 2
```

while receiving:

```text
NUMERICAL_STABILITY_DEFICIT
```

It may not be relabeled `STRUCTURAL_RANK_DEFICIT` merely because its conditioning is awful.

### H3 · Missing transition law is not neutral transition

`Q_UNKNOWN` may not inherit `q_pre` as `q_post`, may not receive a fabricated condition number, and may not enter the healthy-candidate ranking.

### H4 · Candidate availability does not manufacture a question

A separate no-deficit current operator:

```text
A_control = [[1,0],[0,1]]
```

must produce:

```text
NO_DECLARED_LOCAL_IDENTIFIABILITY_DEFICIT
ASK_NOTHING
```

and Pedagogue must not rank candidate questions merely because the library exists.

### H5 · Observability motion is not automatically information gain

A declared operator change after a question may alter rows/partitions while preserving or worsening identifiability. Motion itself is never scored as improvement.

---

## 7. Expected bounded result

The gauntlet passes only if all of the following hold:

1. the current operator is diagnosed as `STRUCTURAL_RANK_DEFICIT / PROPOSE`;
2. all three declared candidates appear rank-restoring in their pre-question geometry;
3. `Q_STABLE` remains full-rank and locally stable after its declared transition;
4. `Q_COLLAPSE` becomes rank-deficient after its declared transition;
5. `Q_FRAGILE` remains full-rank but becomes numerically unstable after its declared transition;
6. `Q_UNKNOWN` abstains before post-question audit because its transition model is undeclared;
7. the no-deficit control returns `ASK_NOTHING` and no candidate ranking;
8. no scalar score collapses the typed outcomes;
9. no question is automatically executed;
10. no installed Aperture class, public UI, Pedagogue law, AIA theorem, holonomy law, or production surface is mutated.

If witnessed, the allowed statement is:

> **In this bounded synthetic fixture, candidate-question admissibility can be endogenous to the declared observation/operator transition induced by the question. A pre-question audit can therefore be insufficient: post-question counterfactual re-audit distinguishes a healthy candidate from post-intervention structural collapse, numerical fragility, and an undeclared-transition abstention.**

---

## 8. Anti-equivalence ledger

```text
pre-question admissibility != post-question admissibility
operator motion != information gain
full rank != sufficient stability
rank deficit != numerical fragility
missing transition law != identity transition
candidate available != question needed
counterfactual re-audit != experiment execution
synthetic intervention dependence != quantum measurement disturbance
post-question operator drift != physical sensor drift
```

---

## 9. Claim ceiling

A positive witness does **not** establish:

```text
performative prediction theorem
causal intervention law
optimal experimental design
active-learning optimality
physical sensor feedback
physical tomography
blind tomography
operator tomography
quantum measurement disturbance
Berry phase / Berry curvature
physical or continuum holonomy
TD613-general AIA theorem
Proto-Loom
production authority
Vercel authority
autonomous experiment execution
```

Installed Aperture v3.2 remains unchanged.

---

## 10. Frozen next learning question

If this single-step endogenous re-audit survives, the next research question becomes:

```text
TEST_MULTI_STEP_ADAPTIVE_QUESTION_SEQUENCE_WHERE
QUESTION_ORDER_CHANGES_THE_FUTURE_OBSERVATION_OPERATOR
BEFORE_ANY_PATH_DEPENDENT_DESIGN_OR_HOLONOMY_PROMOTION
```

That future question must distinguish ordinary accumulated drift, irreversible mutation, and sequence dependence before any transport or holonomy grammar is entertained.

𝌋

⟐
