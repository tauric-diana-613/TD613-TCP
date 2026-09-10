# A15-R0 · Aperture × Pedagogue Branching Typed-Deficit Policy Gauntlet v0.1

Status: **PREREGISTERED / PRE-IMPLEMENTATION / SYNTHETIC / NON-PROMOTIONAL**  
Parent witness: `td613.a15-r0.aperture-pedagogue-adaptive-sequence-perturbation-consequence/v0.1`  
Authority: A2 derivational research only  
Production mutation: forbidden  
Installed Aperture mutation: forbidden  
Automatic question execution: forbidden

## 0. Question

The parent perturbation gauntlet established a bounded local result: an ordered sequence can preserve a terminal **disposition/consequence** distinction under a frozen finite transition-model perturbation grid even when the exact deficit subtype at one route endpoint is knife-edge.

The next question is narrower than active learning and narrower than optimal experiment design:

> In a finite authored route tree with two different post-first-step typed deficits, can a preregistered branch table select one declared second question per typed deficit so that both branches close, while either one-size-fits-all second question leaves one branch unresolved under the same two-step budget?

This is a **policy replay fixture**, not an autonomous policy installation.

## 1. Frozen starting state

```text
epsilon = 0.001
anchor row r_anchor = [1, 0]
initial responsive row r0 = [1, 0]
```

Aperture thresholds remain inherited and unchanged:

```text
sigma_min_floor = 0.25
condition_number_ceiling = 10
uncertainty_status = VALID_DECLARED
threshold_authority = A15_R0_SYNTHETIC_LOCAL
```

The initial two-row operator is structurally rank deficient.

## 2. Frozen first-step branch transitions

Two exogenously declared first questions create the route-tree branches.

### 2.1 Structural branch

```text
Q_BRANCH_STRUCTURAL =
[[2, 0],
 [0, 1]]
```

Applied to `r0`:

```text
r_structural = [2, 0]
```

Preregistered Aperture diagnosis:

```text
STRUCTURAL_RANK_DEFICIT / PROPOSE
```

### 2.2 Numerical branch

```text
Q_BRANCH_NUMERICAL =
[[1, 0],
 [epsilon, 1]]
```

Applied to `r0`:

```text
r_numerical = [1, epsilon]
```

Preregistered Aperture diagnosis:

```text
NUMERICAL_STABILITY_DEFICIT / PROPOSE
```

Expected condition number is approximately `2000.0005`, comfortably beyond the inherited ceiling `10`.

Neither first question is claimed optimal. They are authored branch generators.

## 3. Frozen second-question candidates

Exactly two second-question transitions are admitted.

### 3.1 Rank-repair question

```text
Q_RANK_REPAIR =
[[0,       1/epsilon],
 [1/2, -1/(2 epsilon)]]

=
[[0, 1000],
 [0.5, -500]]
```

Preregistered responses:

```text
Q_RANK_REPAIR * r_structural = [0, 1]
Q_RANK_REPAIR * r_numerical  = [1, 0]
```

Therefore:

```text
structural branch -> NO_DECLARED_LOCAL_IDENTIFIABILITY_DEFICIT / ASK_NOTHING
numerical branch  -> STRUCTURAL_RANK_DEFICIT / PROPOSE
```

### 3.2 Stability-repair question

```text
Q_STABILITY_REPAIR =
[[1/2, -1/(2 epsilon)],
 [0,        1/epsilon]]

=
[[0.5, -500],
 [0,    1000]]
```

Preregistered responses:

```text
Q_STABILITY_REPAIR * r_structural = [1, 0]
Q_STABILITY_REPAIR * r_numerical  = [0, 1]
```

Therefore:

```text
structural branch -> STRUCTURAL_RANK_DEFICIT / PROPOSE
numerical branch  -> NO_DECLARED_LOCAL_IDENTIFIABILITY_DEFICIT / ASK_NOTHING
```

The intentionally hostile cross-action geometry is part of the preregistration. Each repair question closes exactly one typed branch and fails on the other.

## 4. Frozen branch table

The counterfactual policy table is fixed before implementation:

```text
STRUCTURAL_RANK_DEFICIT
  -> Q_RANK_REPAIR

NUMERICAL_STABILITY_DEFICIT
  -> Q_STABILITY_REPAIR

NO_DECLARED_LOCAL_IDENTIFIABILITY_DEFICIT
  -> ASK_NOTHING

all other / missing / incomplete typed states
  -> ABSTAIN_POLICY_STATE_UNDECLARED
```

The selector may consult only the **post-first-step Aperture deficit class** in this fixture. It may not inspect terminal outcomes, future consequences, branch identity, latent route labels, or the result of trying both second questions before choosing.

This restriction is deliberate. A later assay may attack whether deficit class alone is a sufficient policy state.

## 5. Matched-budget fixed-sequence controls

Every continuing branch receives exactly one second transition. Thus the adaptive and fixed controls all use a maximum sequence length of two questions.

### 5.1 Fixed rank-repair control

```text
structural branch -> Q_RANK_REPAIR -> ASK_NOTHING
numerical branch  -> Q_RANK_REPAIR -> PROPOSE
```

Expected branch closures: `1 / 2`.

### 5.2 Fixed stability-repair control

```text
structural branch -> Q_STABILITY_REPAIR -> PROPOSE
numerical branch  -> Q_STABILITY_REPAIR -> ASK_NOTHING
```

Expected branch closures: `1 / 2`.

### 5.3 Typed branching policy

```text
structural branch -> Q_RANK_REPAIR      -> ASK_NOTHING
numerical branch  -> Q_STABILITY_REPAIR -> ASK_NOTHING
```

Expected branch closures: `2 / 2`.

No scalar utility crown follows from the count. The count is only a finite fixture receipt proving that neither admitted fixed second question reproduces the branch table across both authored branches.

## 6. Frozen consequence ledger

Reuse the parent consequence semantics exactly:

```text
If Aperture disposition = ASK_NOTHING:
  STOP loss = 0
  CONTINUE_ONE_DECLARED_QUESTION loss = 1

If Aperture disposition = PROPOSE:
  STOP loss = 5
  CONTINUE_ONE_DECLARED_QUESTION loss = 1
```

The policy selector itself may **not** use these losses. They are evaluated only after terminal Aperture re-audit.

Preregistered terminal consequences:

```text
Typed branching policy:
  structural -> STOP
  numerical  -> STOP

Fixed Q_RANK_REPAIR:
  structural -> STOP
  numerical  -> CONTINUE_ONE_DECLARED_QUESTION

Fixed Q_STABILITY_REPAIR:
  structural -> CONTINUE_ONE_DECLARED_QUESTION
  numerical  -> STOP
```

This is a consequence readout, not expected utility, Bayes risk, or policy optimization.

## 7. Required hostile controls

The executable assay must fail closed when any of the following occurs:

1. the branch table changes after any terminal route is evaluated;
2. an unknown or missing deficit class is mapped to either repair question;
3. the selector consults branch identity instead of the typed deficit class;
4. the selector evaluates both candidate terminal outcomes before choosing;
5. a fixed-sequence control receives a different question budget;
6. either repair matrix changes between adaptive and fixed controls;
7. `ASK_NOTHING` receives a second question anyway;
8. terminal consequences are computed before the final Aperture re-audit;
9. fixed-control failure is silently excluded from the branch denominator;
10. the 2/2 versus 1/2 closure count is promoted into expected-utility, active-learning, or optimal-design language.

An explicit unknown-state control must return:

```text
ABSTAIN_POLICY_STATE_UNDECLARED
```

with zero second-question transition applied.

A healthy-state control must return:

```text
ASK_NOTHING
```

with zero second-question transition applied.

## 8. Success and falsification

### 8.1 Full bounded success

The fixture earns:

```text
TYPED_DEFICIT_BRANCHING_POLICY_SEPARATES_AUTHORED_TWO_BRANCH_REPAIR_TASK
```

only if:

- both first-step diagnoses match §2;
- the branch selector maps solely by the frozen deficit-class table;
- both adaptive branches terminate `ASK_NOTHING / STOP`;
- fixed `Q_RANK_REPAIR` closes exactly one branch;
- fixed `Q_STABILITY_REPAIR` closes exactly one branch;
- all continuing routes use the same two-question budget;
- unknown and healthy controls stop before a second transition;
- no promotion authority appears.

### 8.2 Falsification

The bounded claim fails if either fixed second question closes both authored branches, if the typed branch table fails to close either branch, or if the policy requires information beyond the declared post-first-step deficit class.

If implementation discovers that the policy secretly needs route identity or latent operator orientation, it must report that dependency rather than widening `typed deficit` after the fact.

## 9. Anti-equivalences

```text
typed branch table != active learning
typed branch table != optimal experimental design
2/2 authored branch closure != global policy superiority
matched question count != matched information cost
deficit class != sufficient policy state by assumption
terminal consequence != selection criterion
counterfactual policy replay != autonomous experiment execution
repair matrix != universally good question
branch-conditioned repair != holonomy
route tree != connection
```

## 10. Claim ceiling

Forbidden promotions include:

- active-learning policy;
- reinforcement-learning policy;
- optimal experimental design;
- expected-utility or Bayes-risk theorem;
- general adaptive-design law;
- policy-state sufficiency beyond this finite fixture;
- connection, curvature, Berry structure, geometric phase, or holonomy;
- physical sensor feedback or physical tomography;
- quantum measurement disturbance;
- TD613-general AIA theorem;
- Proto-Loom promotion;
- production mutation, deployment, or Vercel authority.

## 11. Frozen next learning action

If the typed branch policy passes, the next hostile question becomes:

```text
TEST_TYPED_POLICY_STATE_ALIASING_WHERE_DISTINCT_POST_FIRST_STEP_OPERATORS_SHARE_THE_SAME_DEFICIT_CLASS_AND_MATCHED_CONDITIONING_BAND_TO_DETERMINE_WHETHER_DEFICIT_CLASS_ALONE_IS_AN_INSUFFICIENT_BRANCH_STATE_BEFORE_ANY_ACTIVE_LEARNING_OR_HOLONOMY_PROMOTION
```

That assay must intentionally remove the easy class separation used here.

---

Preregistration boundary: **frozen before executable implementation.**
