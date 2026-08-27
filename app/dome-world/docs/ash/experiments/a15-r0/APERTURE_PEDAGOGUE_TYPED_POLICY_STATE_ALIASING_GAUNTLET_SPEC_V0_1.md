# A15-R0 · Aperture × Pedagogue Typed Policy-State Aliasing Gauntlet v0.1

Status: **PREREGISTERED / PRE-IMPLEMENTATION / SYNTHETIC / NON-PROMOTIONAL**  
Parent witness: `td613.a15-r0.aperture-pedagogue-branching-typed-deficit-policy/v0.1`  
Authority: A2 derivational research only  
Production mutation: forbidden  
Installed Aperture mutation: forbidden  
Automatic question execution: forbidden

## 0. Question

The parent branching fixture showed that two **different** typed deficit classes can route to two different preregistered repair questions and close both authored branches under a matched two-question ceiling.

That result leaves an obvious loophole:

> What happens when two post-first-step operator states carry the **same deficit class and the same scalar conditioning geometry**, yet require incompatible second questions?

This gauntlet tests whether `deficit_class` alone becomes an aliased policy state in one finite deterministic fixture. It does **not** test a general Markov-state theorem, POMDP claim, active-learning policy, or optimal experimental design.

## 1. Frozen starting state and inherited first questions

Reuse the parent adaptive-sequence constants exactly:

```text
epsilon = 0.001
anchor row r_anchor = [1, 0]
initial responsive row r0 = [1, 0]

Q_A =
[[1, 0],
 [epsilon, 1]]

Q_B =
[[1, -1/epsilon],
 [-epsilon, (1+epsilon)/epsilon]]
```

Applied to `r0`:

```text
Q_A * r0 = [1, +epsilon]
Q_B * r0 = [1, -epsilon]
```

These two post-first-step operator states are the alias pair.

## 2. Frozen alias criteria

The pair qualifies as the preregistered alias only if all of the following hold after Aperture re-audit:

```text
A deficit_class = NUMERICAL_STABILITY_DEFICIT
B deficit_class = NUMERICAL_STABILITY_DEFICIT
A disposition   = PROPOSE
B disposition   = PROPOSE
A rank = B rank = 2
|sigma_min_A - sigma_min_B| <= 1e-12
|condition_A - condition_B| <= 1e-9
|sigma_max_A - sigma_max_B| <= 1e-12
```

The expected condition number is approximately `2000.0005` for both.

The scalar audit signature is frozen as:

```text
(deficit_class, disposition, rank, sigma_min, sigma_max, condition_number)
```

within the tolerances above.

The signed responsive orientation is **not** part of that scalar signature. The two rows remain different:

```text
[1, +epsilon] != [1, -epsilon]
```

Therefore:

```text
same scalar Aperture geometry != same oriented observation state
```

## 3. Frozen incompatible repair questions

Exactly two repair transitions are admitted.

### 3.1 Plus repair

```text
Q_PLUS_REPAIR =
[[1/2, -1/(2 epsilon)],
 [1/2,  1/(2 epsilon)]]

=
[[0.5, -500],
 [0.5,  500]]
```

Preregistered responses:

```text
Q_PLUS_REPAIR * [1, +epsilon] = [0, 1]
Q_PLUS_REPAIR * [1, -epsilon] = [1, 0]
```

Expected terminal Aperture states:

```text
A/plus branch  -> ASK_NOTHING
B/minus branch -> STRUCTURAL_RANK_DEFICIT / PROPOSE
```

### 3.2 Minus repair

```text
Q_MINUS_REPAIR =
[[1/2,  1/(2 epsilon)],
 [1/2, -1/(2 epsilon)]]

=
[[0.5,  500],
 [0.5, -500]]
```

Preregistered responses:

```text
Q_MINUS_REPAIR * [1, +epsilon] = [1, 0]
Q_MINUS_REPAIR * [1, -epsilon] = [0, 1]
```

Expected terminal Aperture states:

```text
A/plus branch  -> STRUCTURAL_RANK_DEFICIT / PROPOSE
B/minus branch -> ASK_NOTHING
```

Each repair closes exactly one member of the aliased pair and structurally collapses the other.

## 4. Exhaustive deficit-class-only action family

The class-only selector sees the same input on both branches:

```text
NUMERICAL_STABILITY_DEFICIT
```

Its entire admitted deterministic action family is frozen as:

```text
Q_PLUS_REPAIR
Q_MINUS_REPAIR
ASK_NOTHING
ABSTAIN_POLICY_STATE_UNDECLARED
```

Because the input is identical, a class-only deterministic selector must apply the **same action** to A and B.

Preregistered closure counts:

```text
class-only -> Q_PLUS_REPAIR  => 1 / 2 branches close
class-only -> Q_MINUS_REPAIR => 1 / 2 branches close
class-only -> ASK_NOTHING    => 0 / 2 branches close
class-only -> ABSTAIN        => 0 / 2 branches close
```

Therefore the preregistered maximum closure count over this finite class-only action family is:

```text
1 / 2
```

No probabilistic or randomized selector is in scope.

## 5. Route-custody disambiguation control

A richer comparator may consult only the **declared first-question route identity** in addition to the same terminal Aperture re-audit:

```text
Q_A route -> Q_PLUS_REPAIR
Q_B route -> Q_MINUS_REPAIR
```

It may not inspect future terminal outcomes, consequence losses, or try both repairs before choosing.

Preregistered result:

```text
route-custody comparator => 2 / 2 branches close
```

This control exists only to demonstrate that the two branches are separable once one extra non-class coordinate is admitted.

It does **not** establish that route provenance is uniquely necessary, minimally sufficient, or superior to signed operator orientation. Those questions remain open.

## 6. Matched budget and consequence ledger

Every route that applies a repair uses exactly two questions total:

```text
first branch-generating question + one second repair question
```

Reuse the inherited consequence semantics after terminal Aperture re-audit:

```text
ASK_NOTHING:
  STOP = 0
  CONTINUE_ONE_DECLARED_QUESTION = 1

PROPOSE:
  STOP = 5
  CONTINUE_ONE_DECLARED_QUESTION = 1
```

Expected route-aware terminal consequences:

```text
Q_A -> Q_PLUS_REPAIR  -> STOP
Q_B -> Q_MINUS_REPAIR -> STOP
```

Expected fixed/class-only repair consequences:

```text
one branch -> STOP
one branch -> CONTINUE_ONE_DECLARED_QUESTION
```

`ASK_NOTHING` and `ABSTAIN` class-only controls apply zero second transition and therefore leave both first-step deficits unresolved; neither counts as a closure.

The consequence ledger is a readout only, never a selector input.

## 7. Required hostile controls

The executable assay must fail closed if any of the following occurs:

1. the A/B scalar signatures differ beyond the preregistered tolerances;
2. either first-step branch leaves `NUMERICAL_STABILITY_DEFICIT / PROPOSE`;
3. a class-only selector receives branch identity, signed responsive orientation, or future terminal outcomes;
4. a class-only action differs across A and B despite identical class input;
5. the admitted action family is widened after observing results;
6. a repair matrix changes between class-only and route-custody controls;
7. the 0/2 outcomes for `ASK_NOTHING` or `ABSTAIN` are removed from the exhaustive class-only ledger;
8. route-custody selection consults consequence losses or terminal repair outcomes before choosing;
9. route-aware and class-only repair routes receive different question budgets;
10. signed responsive orientation is silently smuggled into the scalar Aperture signature;
11. the result is promoted to a general non-Markovian, active-learning, or optimal-design theorem.

An unknown route-custody input must return:

```text
ABSTAIN_ROUTE_STATE_UNDECLARED
```

with zero repair transition applied.

## 8. Success and falsification

### 8.1 Full bounded success

The fixture earns:

```text
DEFICIT_CLASS_POLICY_STATE_ALIASING_WITNESSED_IN_BOUNDED_SYNTHETIC_TWO_BRANCH_FIXTURE
```

only if:

- A and B satisfy every alias criterion in §2;
- the incompatible-repair predictions in §3 hold;
- exhaustive class-only maximum closure is exactly `1/2`;
- route-custody closure is exactly `2/2`;
- budgets remain matched;
- unknown route state abstains;
- consequence losses remain post-terminal readout only;
- no promotion authority appears.

### 8.2 Falsification

The aliasing claim fails if either repair closes both aliased branches, if a class-only action reaches `2/2`, if A and B do not actually match on the declared scalar signature, or if the route-custody comparator itself requires future-outcome peeking.

If the implementation needs signed orientation to establish that A and B differ at all, it must preserve that distinction explicitly rather than quietly widening the scalar signature.

## 9. Anti-equivalences

```text
same deficit class != same future-repair requirement
same singular spectrum != same oriented observation state
conditioning scalar != sufficient policy state
finite class-only aliasing != general non-Markovian theorem
route provenance useful here != route provenance uniquely necessary
route-custody comparator != active learning
2/2 route-aware closure != optimal policy
signed orientation != curvature
repair incompatibility != holonomy
route memory != connection
```

## 10. Claim ceiling

Forbidden promotions include:

- general Markov or non-Markov theorem;
- POMDP formulation claim;
- active-learning policy;
- reinforcement-learning policy;
- optimal experimental design;
- expected-utility or Bayes-risk theorem;
- globally sufficient policy-state representation;
- route-provenance optimality;
- connection, curvature, Berry structure, geometric phase, or holonomy;
- physical sensor feedback or physical tomography;
- quantum measurement disturbance;
- TD613-general AIA theorem;
- Proto-Loom promotion;
- production mutation, deployment, or Vercel authority.

## 11. Frozen next learning action

If aliasing is witnessed, the next hostile question becomes:

```text
TEST_MINIMAL_DISAMBIGUATING_POLICY_STATE_ACROSS_DEFICIT_CLASS_SCALAR_GEOMETRY_SIGNED_ORIENTATION_AND_ROUTE_PROVENANCE_UNDER_SMALL_PERTURBATIONS_WITHOUT_OPTIMALITY_ACTIVE_LEARNING_OR_HOLONOMY_PROMOTION
```

That assay must compare candidate state representations rather than assume route custody is the answer.

---

Preregistration boundary: **frozen before executable implementation.**
