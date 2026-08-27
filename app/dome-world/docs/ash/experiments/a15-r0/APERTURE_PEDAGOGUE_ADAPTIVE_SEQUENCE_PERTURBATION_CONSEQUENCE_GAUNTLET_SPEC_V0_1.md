# A15-R0 · Aperture × Pedagogue Adaptive Sequence Perturbation + Consequence Gauntlet v0.1

Status: **PREREGISTERED / PRE-IMPLEMENTATION / SYNTHETIC / NON-PROMOTIONAL**  
Parent witness: `td613.a15-r0.aperture-pedagogue-adaptive-sequence-order/v0.1`  
Authority: A2 derivational research only  
Production mutation: forbidden  
Installed Aperture mutation: forbidden  
Automatic experiment execution: forbidden

## 0. Question

The parent bounded fixture showed that the same two declared question transitions can leave the first step in `PROPOSE` while the ordered compositions terminate differently. That result does **not** establish that the terminal distinction survives transition-model error.

This gauntlet asks a narrower question:

> When the authored `Q_A` transition is perturbed by small predeclared coefficient error, does the **order-conditioned need for another question** survive even if the exact terminal deficit subtype changes?

A second, separately declared question asks whether the surviving typed distinction reaches a predeclared consequence rule without converting that rule into an optimal-design claim.

## 1. Frozen parent geometry

Let

```text
epsilon = 0.001
anchor row r_anchor = [1, 0]
initial responsive row r0 = [1, 0]

M_A(0) = [[1, 0],
          [epsilon, 1]]

M_B    = [[1, -1/epsilon],
          [-epsilon, (1+epsilon)/epsilon]]
```

The installed parent thresholds remain unchanged:

```text
sigma_min_floor = 0.25
condition_number_ceiling = 10
uncertainty_status = VALID_DECLARED
threshold_authority = A15_R0_SYNTHETIC_LOCAL
```

No new threshold may be chosen after observing the perturbation results.

## 2. Frozen perturbation family

Only the lower-left coefficient of `M_A` may move:

```text
M_A(delta) = [[1, 0],
              [epsilon + delta, 1]]
```

`M_B`, the anchor row, the initial responsive row, Aperture thresholds, and the decision-consequence table remain fixed.

### 2.1 Local replay grid

The local grid is frozen as:

```text
delta / epsilon ∈ {
  -0.10,
  -0.01,
  -0.001,
   0,
  +0.001,
  +0.01,
  +0.10
}
```

Equivalently:

```text
delta ∈ {
  -1e-4,
  -1e-5,
  -1e-6,
   0,
  +1e-6,
  +1e-5,
  +1e-4
}
```

This finite grid is the entire confirmatory local replay set. No adaptive insertion of friendlier perturbation points is permitted.

### 2.2 Out-of-envelope stress control

One farther negative perturbation is frozen as a falsifier/control:

```text
delta_stress = -0.0007 = -0.70 * epsilon
```

This point is **not** part of the local-robustness envelope. It exists to demonstrate that the order-conditioned consequence must be allowed to fail outside the predeclared local grid.

## 3. Analytic expectations frozen before implementation

For the responsive row alone:

```text
AB(delta) = M_B * M_A(delta) * r0
          = [-delta/epsilon,
             1 + ((1+epsilon)/epsilon) * delta]

BA(delta) = M_A(delta) * M_B * r0
          = [1, delta]
```

Therefore the parent `BA(0) = [1,0]` structural rank collapse is predicted to be a **knife-edge subtype** under generic nonzero delta. The confirmatory question is not whether that subtype survives. The confirmatory question is whether `BA(delta)` remains typed by Aperture as requiring further work across the frozen local grid while `AB(delta)` remains healthy.

### 3.1 Frozen local predictions

For every `delta` in the local replay grid:

1. the first step after `Q_A(delta)` remains `NUMERICAL_STABILITY_DEFICIT / PROPOSE`;
2. the first step after `Q_B` remains `NUMERICAL_STABILITY_DEFICIT / PROPOSE`;
3. `AB(delta)` terminates `NO_DECLARED_LOCAL_IDENTIFIABILITY_DEFICIT / ASK_NOTHING`;
4. `BA(0)` terminates `STRUCTURAL_RANK_DEFICIT / PROPOSE`;
5. every nonzero local `BA(delta)` terminates `NUMERICAL_STABILITY_DEFICIT / PROPOSE`;
6. the terminal **disposition contrast** (`AB = ASK_NOTHING`, `BA = PROPOSE`) survives all seven local perturbation points;
7. the terminal **deficit subtype contrast** is not called robust, because `BA` changes from structural at zero to numerical off zero.

### 3.2 Frozen stress prediction

At `delta_stress = -0.0007`:

```text
AB(delta_stress) => PROPOSE
BA(delta_stress) => PROPOSE
```

The declared terminal disposition contrast must therefore collapse at the stress point. If implementation instead reports a continuing `AB = ASK_NOTHING` / `BA = PROPOSE` split there, the preregistered stress prediction fails.

## 4. Declared consequence rule

This gauntlet uses a deliberately small **consequence ledger**, not a general utility function and not an optimal-design objective.

Available terminal actions:

```text
STOP
CONTINUE_ONE_DECLARED_QUESTION
```

Frozen losses:

```text
If Aperture disposition = ASK_NOTHING:
  STOP loss = 0
  CONTINUE_ONE_DECLARED_QUESTION loss = 1

If Aperture disposition = PROPOSE:
  STOP loss = 5
  CONTINUE_ONE_DECLARED_QUESTION loss = 1
```

Interpretation is local and literal:

- loss `1` represents the burden of one additional declared question;
- loss `5` represents prematurely stopping while the installed typed audit still carries an unresolved local deficit;
- the lower-loss action may be reported **only inside this authored table**;
- no expected utility, Bayes risk, global policy, active-learning optimum, or optimal experimental design inference follows.

Frozen consequence prediction on the local grid:

```text
AB(delta) -> STOP
BA(delta) -> CONTINUE_ONE_DECLARED_QUESTION
```

At the stress point both routes are predicted to select `CONTINUE_ONE_DECLARED_QUESTION` under the same table.

## 5. Required hostile controls

The executable assay must fail closed when any of the following occurs:

1. a perturbation outside the frozen finite list is silently inserted into confirmatory results;
2. `M_B` changes while claiming to test the declared one-axis perturbation;
3. a non-finite delta appears;
4. the consequence ledger is missing or mutated after route evaluation;
5. the action recommendation is produced without consulting the terminal Aperture disposition;
6. a missing transition model is treated as identity;
7. a local nonzero `BA(delta)` is relabeled structural solely to preserve the parent narrative;
8. the stress point is counted as evidence of local robustness.

## 6. Success, partial success, and falsification

### 6.1 Full bounded success

The fixture earns the label

```text
LOCAL_ORDER_CONSEQUENCE_ROBUSTNESS_WITH_KNIFE_EDGE_DEFICIT_SUBTYPE
```

only if every local-grid prediction in §3.1 and the consequence predictions in §4 hold, while the stress point collapses the disposition contrast as preregistered.

### 6.2 Partial result

If the disposition contrast survives only a strict subset of the local grid, the receipt must enumerate the surviving points and report

```text
PARTIAL_LOCAL_ORDER_CONSEQUENCE_ENVELOPE
```

with no post-hoc widening or contraction of the confirmatory grid.

### 6.3 Falsification

If `AB` and `BA` share the same terminal disposition at any point in the frozen local grid, the full local-robustness claim is falsified.

If the exact `STRUCTURAL_RANK_DEFICIT` label survives all nonzero local perturbations only because numerical tolerance swallows the perturbation, the implementation must expose the rank tolerance interaction rather than call the subtype robust.

## 7. Anti-equivalences

```text
robust terminal disposition != robust deficit subtype
rank lift under perturbation != recovered stability
noncommuting transition products != holonomy
local perturbation envelope != global robustness
lower declared loss != optimal design
question burden ledger != decision theory theorem
counterfactual transition replay != real intervention
operator-model perturbation != physical sensor noise
path-conditioned action != autonomous experiment policy
```

## 8. Claim ceiling

Forbidden promotions include:

- general path-dependent design law;
- active-learning optimality;
- optimal experimental design;
- expected-utility or Bayes-risk theorem;
- connection, curvature, Berry structure, geometric phase, or holonomy;
- physical sensor feedback or physical tomography;
- quantum measurement disturbance;
- TD613-general AIA theorem;
- Proto-Loom promotion;
- production mutation, deployment, or Vercel authority.

## 9. Frozen next learning action

If the local consequence distinction survives while the subtype proves knife-edge, the next research question is:

```text
TEST_BRANCHING_ADAPTIVE_POLICY_REPLAY_WHERE_THE_SECOND_QUESTION_IS_SELECTED_FROM_THE_POST_FIRST_STEP_TYPED_DEFICIT_AND_COMPARE_ROUTE_TREE_CONSEQUENCES_WITH_FIXED_SEQUENCE_CONTROLS_BEFORE_ANY_ACTIVE_LEARNING_OR_HOLONOMY_PROMOTION
```

If the local disposition contrast fails, the next action instead becomes identifying the smallest authored perturbation neighborhood in which any order-conditioned consequence remains reproducible, without retroactively redefining this gauntlet’s success criterion.

---

Preregistration boundary: **frozen before executable implementation.**
