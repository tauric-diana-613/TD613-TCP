# A15-R0 · Aperture × Pedagogue Minimal Policy-State Perturbation Gauntlet v0.1

Status: **PREREGISTERED / PRE-IMPLEMENTATION / SYNTHETIC / NON-PROMOTIONAL**  
Parent witness: `td613.a15-r0.aperture-pedagogue-typed-policy-state-aliasing/v0.1`  
Authority: A2 derivational research only  
Production mutation: forbidden  
Installed Aperture mutation: forbidden  
Automatic question execution: forbidden

## 0. Question

The parent aliasing fixture established a finite exact pair in which:

- two post-first-step states share the same deficit class and scalar singular-spectrum geometry;
- the two states require incompatible second questions;
- every deterministic class-only action closes at most one branch;
- adding route custody separates the pair.

That exact pair may still be brittle. This gauntlet asks:

> Across a frozen small symmetric perturbation envelope, which candidate policy-state representations continue to separate the two authored repair requirements, and does the apparent need for the extra coordinate disappear at a preregistered farther stress point?

The word **minimal** here refers only to **code cardinality inside this two-state finite fixture**. It does not mean globally minimal sufficient statistic, Markov state, information bottleneck optimum, or universally best representation.

## 1. Frozen starting geometry

```text
epsilon = 0.001
anchor row = [1, 0]
initial responsive row = [1, 0]
```

Inherited Aperture thresholds remain unchanged:

```text
sigma_min_floor = 0.25
condition_number_ceiling = 10
uncertainty_status = VALID_DECLARED
threshold_authority = A15_R0_SYNTHETIC_LOCAL
```

## 2. Frozen symmetric perturbation family

Only the lower-left first-step transition coefficients move.

For each declared `delta`:

```text
Q_A(delta) =
[[1, 0],
 [epsilon + delta, 1]]

Q_B(delta) =
[[1, -1/epsilon],
 [-(epsilon + delta), (1+epsilon)/epsilon]]
```

Applied to the fixed initial row:

```text
A(delta) = [1, +(epsilon + delta)]
B(delta) = [1, -(epsilon + delta)]
```

### 2.1 Confirmatory local grid

The entire local confirmatory grid is frozen as:

```text
delta ∈ {
  -1e-4,
  -1e-5,
   0,
  +1e-5,
  +1e-4
}
```

or:

```text
delta / epsilon ∈ {-0.10, -0.01, 0, +0.01, +0.10}
```

No adaptive insertion of friendlier points is allowed.

### 2.2 Out-of-envelope stress point

The stress control is frozen as:

```text
delta_stress = -0.0007 = -0.70 * epsilon
```

It is excluded from the local robustness count.

## 3. Frozen scalar-alias expectations

At every local grid point, A(delta) and B(delta) must satisfy:

```text
deficit_class = NUMERICAL_STABILITY_DEFICIT
disposition = PROPOSE
rank = 2
```

and their scalar geometry must match within:

```text
|sigma_min_A - sigma_min_B| <= 1e-12
|sigma_max_A - sigma_max_B| <= 1e-12
|condition_A - condition_B| <= 1e-9
```

The signed responsive coordinate remains opposite:

```text
sign(A_y) = +1
sign(B_y) = -1
```

throughout the local grid.

The stress point also retains opposite signs and matched scalar geometry; the stress control targets **repair consequence**, not whether the two states are numerically distinct.

## 4. Frozen repair matrices

The repair questions remain exactly the parent matrices. They may not be retuned as delta changes.

```text
Q_PLUS_REPAIR =
[[0.5, -500],
 [0.5,  500]]

Q_MINUS_REPAIR =
[[0.5,  500],
 [0.5, -500]]
```

### 4.1 Local prediction

For every local delta:

```text
Q_PLUS_REPAIR  on A(delta) -> ASK_NOTHING
Q_PLUS_REPAIR  on B(delta) -> PROPOSE
Q_MINUS_REPAIR on A(delta) -> PROPOSE
Q_MINUS_REPAIR on B(delta) -> ASK_NOTHING
```

At nonzero local delta, the wrong repair may lift from exact structural collapse to numerical instability. The only confirmatory requirement is that it remains `PROPOSE`.

### 4.2 Stress prediction

At `delta_stress = -0.0007`:

```text
Q_PLUS_REPAIR  on A(stress) -> ASK_NOTHING
Q_PLUS_REPAIR  on B(stress) -> ASK_NOTHING
Q_MINUS_REPAIR on A(stress) -> ASK_NOTHING
Q_MINUS_REPAIR on B(stress) -> ASK_NOTHING
```

Thus the stress point must eliminate the class-only disadvantage. If class-only still tops out at 1/2 there, the preregistered stress prediction fails.

## 5. Frozen candidate state representations

Exactly four representation families are compared.

### R0 · DEFICIT_CLASS

```text
code = deficit_class
```

Expected unique code count across {A,B}: `1`.

### R1 · DEFICIT_CLASS_PLUS_SCALAR_GEOMETRY

```text
code = (
  deficit_class,
  disposition,
  rank,
  sigma_min,
  sigma_max,
  condition_number
)
```

using the frozen tolerances in §3 and with **no signed orientation coordinate**.

Expected unique code count across {A,B}: `1`.

### R2 · DEFICIT_CLASS_PLUS_SIGNED_ORIENTATION

```text
code = (deficit_class, sign(responsive_y))
```

Expected unique code count across {A,B}: `2` throughout the local grid.

Frozen action map:

```text
positive -> Q_PLUS_REPAIR
negative -> Q_MINUS_REPAIR
zero     -> ABSTAIN_ORIENTATION_UNRESOLVED
```

### R3 · DEFICIT_CLASS_PLUS_ROUTE_PROVENANCE

```text
code = (deficit_class, declared_first_question_id)
```

Expected unique code count across {A,B}: `2`.

Frozen action map:

```text
Q_A -> Q_PLUS_REPAIR
Q_B -> Q_MINUS_REPAIR
unknown -> ABSTAIN_ROUTE_STATE_UNDECLARED
```

Neither R2 nor R3 may inspect future terminal outcomes or consequence losses.

## 6. Finite code-cardinality lower bound

Inside this authored pair, the two local branches require incompatible actions. Therefore any representation assigning the **same code** to both branches cannot deterministically choose different repairs.

The finite pair therefore has a preregistered disambiguation lower bound:

```text
required code cardinality >= 2
```

This is a combinatorial statement about this two-state action-conflict fixture only.

Preregistered local code counts:

```text
R0 -> 1
R1 -> 1
R2 -> 2
R3 -> 2
```

R2 and R3 meet the pairwise cardinality lower bound. No global minimal-sufficient-state claim follows.

## 7. Frozen action-family evaluation

For R0 and R1, because A and B receive the same code, exhaust the same deterministic action family:

```text
Q_PLUS_REPAIR
Q_MINUS_REPAIR
ASK_NOTHING
ABSTAIN_POLICY_STATE_UNDECLARED
```

Preregistered local maximum closure:

```text
R0 max closure = 1 / 2
R1 max closure = 1 / 2
```

For R2 and R3, apply the frozen maps in §5:

```text
R2 closure = 2 / 2
R3 closure = 2 / 2
```

for every local perturbation point.

At the stress point:

```text
R0 max closure = 2 / 2
R1 max closure = 2 / 2
R2 closure = 2 / 2
R3 closure = 2 / 2
```

Therefore the extra-coordinate advantage must collapse at stress.

## 8. Matched question budget and consequence readout

Every repair route uses exactly two questions total. `ASK_NOTHING` and abstention controls apply zero second repair transition.

Reuse the inherited consequence semantics only after terminal Aperture re-audit:

```text
ASK_NOTHING -> STOP loss 0; CONTINUE loss 1
PROPOSE     -> STOP loss 5; CONTINUE loss 1
```

The consequence ledger never selects the representation or repair.

## 9. Required hostile controls

The executable assay must fail closed if any of the following occurs:

1. the local delta grid changes after implementation begins;
2. the stress point is counted as local robustness evidence;
3. either repair matrix changes with delta;
4. R1 silently incorporates signed orientation or route identity;
5. R2 receives route identity;
6. R3 receives signed orientation;
7. R0 or R1 apply different actions to A and B despite identical representation codes;
8. R2 or R3 inspect future terminal outcomes or consequence losses;
9. class/scalar max closure exceeds 1/2 at any local point;
10. orientation or route closure falls below 2/2 at any local point;
11. the stress point fails to eliminate the class/scalar disadvantage;
12. question budgets differ across comparable repair routes;
13. a zero orientation is silently coerced to positive or negative;
14. an unknown route is silently mapped to a repair;
15. pairwise code-cardinality minimality is promoted to a global sufficient-statistic theorem.

## 10. Success and falsification

### 10.1 Full bounded success

The fixture earns:

```text
LOCAL_TWO_CODE_POLICY_STATE_DISAMBIGUATION_WITH_STRESS_COLLAPSE_WITNESSED_IN_BOUNDED_FIXTURE
```

only if all five local points satisfy:

```text
R0 max closure = 1/2
R1 max closure = 1/2
R2 closure = 2/2
R3 closure = 2/2
```

with code counts `1,1,2,2`, matched budgets, and all alias criteria held; and the stress point satisfies `2/2` for all four representations.

### 10.2 Falsification

The bounded result fails if one scalar-only code unexpectedly separates the local pair, if either two-code comparator fails locally, or if the extra-coordinate advantage survives the stress point contrary to preregistration.

## 11. Anti-equivalences

```text
pairwise code cardinality 2 != global minimal sufficient state
signed orientation useful locally != orientation universally necessary
route provenance useful locally != route provenance universally necessary
scalar aliasing != information loss theorem
local perturbation survival != global robustness
stress collapse != prior local result invalid
same singular spectrum != same oriented state
representation comparison != active learning
representation comparison != optimal experimental design
signed orientation != curvature
route provenance != connection
disambiguation != holonomy
```

## 12. Claim ceiling

Forbidden promotions include:

- global minimal sufficient statistic;
- information bottleneck optimum;
- general Markov/non-Markov theorem;
- POMDP formulation;
- active-learning or reinforcement-learning policy;
- optimal experimental design;
- expected-utility or Bayes-risk theorem;
- orientation or route-provenance universal necessity;
- connection, curvature, Berry structure, geometric phase, or holonomy;
- physical sensor feedback or physical tomography;
- quantum measurement disturbance;
- TD613-general AIA theorem;
- Proto-Loom promotion;
- production mutation, deployment, or Vercel authority.

## 13. Frozen next learning action

If the local two-code comparison survives and the stress control collapses the advantage, the next hostile question becomes:

```text
TEST_DISAMBIGUATOR_FAILURE_MODES_UNDER_SIGNED_ORIENTATION_DEADZONE_AND_ROUTE_PROVENANCE_CORRUPTION_WITH_EXPLICIT_ABSTENTION_BEFORE_ANY_MEMORY_CONNECTION_ACTIVE_LEARNING_OR_HOLONOMY_PROMOTION
```

That assay must attack both candidate disambiguators rather than crown either one.

---

Preregistration boundary: **frozen before executable implementation.**
