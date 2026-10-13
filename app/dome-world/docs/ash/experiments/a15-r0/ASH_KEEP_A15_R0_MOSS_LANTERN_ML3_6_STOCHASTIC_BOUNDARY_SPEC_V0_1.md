# Ash Keep A15-R0 · Moss Lantern ML3.6 Stochastic Identifiability Boundary Spec v0.1

Status: **AUTHORED / PRE-IMPLEMENTATION / RESEARCH-ONLY / NON-RUNTIME / HUMAN-GATED**  
Prerequisite epistemic kind: `OPERATIONAL_CRITERION`  
Prerequisite formal scope: `FINITE_DETERMINISTIC_TERMINAL_SIGNATURE_MODEL`  
Purpose: **SCOPE-BOUNDARY TEST**  
Sequence authority: **FALSE**  
Promotion authority: **FALSE**  
Production mutation: **NONE**  
Connection / curvature / holonomy claim: **NONE**

## 0. Why ML3.6 exists

ML3.5 validates instrumentation for the deterministic terminal-signature criterion:

```text
S(r) = O(F_r(x0))
```

with exact route recovery over a finite declared candidate family requiring an injective admitted signature map.

That criterion has an explicit formal scope:

```text
FINITE_DETERMINISTIC_TERMINAL_SIGNATURE_MODEL
```

ML3.6 intentionally exits that scope.

Instead of one route producing one admitted terminal signature, each route produces a probability distribution over admitted observations:

```text
r
→
P(Y | r)
```

The scientific question is therefore not whether the deterministic criterion is false. The question is whether its object remains sufficient once stochasticity replaces a point signature with a route-conditioned distribution.

## 1. Literature hydration constraint

Recent identifiability work on stochastic and partially observed systems reinforces a methodological boundary:

```text
identifiability
must be scoped to
model class + observation object + equivalence relation
```

The hydration motivating ML3.6 includes current work where identifiability changes with the type of available observation, and work where identifiability guarantees depend on explicit structural assumptions or are available only up to declared equivalence classes.

Those external results motivate the boundary test. They do not supply TD613 ontology or prove ML3.6's authored fixture.

## 2. Stochastic observation alphabet

Use a binary admitted observation alphabet:

```text
Y ∈ {0,1}
```

No hidden route identity enters the observation.

## 3. Distinguishable stochastic route pair

Two route labels are used only as latent candidate identifiers:

```text
R_A
R_B
```

Route-conditioned distributions:

```text
P(Y=0 | R_A) = 0.9
P(Y=1 | R_A) = 0.1

P(Y=0 | R_B) = 0.1
P(Y=1 | R_B) = 0.9
```

Properties authored before implementation:

```text
support(R_A) = support(R_B) = {0,1}
distributions equal = false
```

Therefore a support-only representation aliases the routes even though the full distributions differ.

The point-signature object from ML3.5 is not applicable:

```text
deterministic_point_signature_applicable = false
```

## 4. Stochastic null pair

Null routes:

```text
R_C
R_D
```

with identical admitted distributions:

```text
P(Y=0 | R_C) = P(Y=0 | R_D) = 0.5
P(Y=1 | R_C) = P(Y=1 | R_D) = 0.5
```

The null asks whether the assay falsely manufactures stochastic identifiability when the complete admitted distributions are identical.

## 5. Declared distributional diagnostics

For two finite discrete distributions `P,Q`, define total variation distance:

```text
TV(P,Q) = 1/2 * Σ_y |P(y)-Q(y)|
```

For the authored two-route, equal-prior classification problem, report the Bayes-optimal error using:

```text
BayesError(P,Q) = (1 - TV(P,Q)) / 2
```

This formula is used as a formal diagnostic for this finite two-hypothesis fixture. Passing arithmetic does not constitute an empirical discovery of the identity.

For repeated independent observations, construct the product distributions:

```text
P^n
Q^n
```

and report the same diagnostics for:

```text
n = 1
n = 3
```

No Monte Carlo estimate is required; enumerate the finite binary observation sequences exactly.

## 6. Authored expected values

### Distinguishable pair R_A / R_B

For one observation:

```text
TV_1 = 0.8
BayesError_1 = 0.1
```

For three independent observations:

```text
TV_3 = 0.944
BayesError_3 = 0.028
```

The support remains identical even as repeated samples improve probabilistic discrimination.

### Null pair R_C / R_D

For both `n=1` and `n=3`:

```text
TV = 0
BayesError = 0.5
```

Repeated observations do not distinguish identical route-conditioned distributions.

## 7. Decision law

### H_DETERMINISTIC_CRITERION_SCOPE_BOUNDARY

The stochastic scope boundary is demonstrated inside this fixture if:

```text
deterministic_point_signature_applicable = false

R_A/R_B:
  equal support = true
  equal distributions = false
  TV_1 = 0.8
  BayesError_1 = 0.1
  TV_3 = 0.944
  BayesError_3 = 0.028
  BayesError_3 < BayesError_1

R_C/R_D:
  equal distributions = true
  TV_1 = 0
  BayesError_1 = 0.5
  TV_3 = 0
  BayesError_3 = 0.5
```

The admitted interpretation is:

```text
FINITE_DETERMINISTIC_TERMINAL_SIGNATURE_MODEL
= scope exited

point-signature injectivity
= insufficient grammar for this stochastic fixture

distribution + observation budget
= required new inverse object
```

This does not falsify the deterministic criterion inside its declared scope.

## 8. New question, not new law

ML3.6 may motivate a later candidate operational criterion for stochastic route identifiability, but it does not author one automatically.

The next research question becomes:

```text
What distribution-level equivalence/separation rule should govern
probabilistic route identifiability under a declared sample budget?
```

Possible later diagnostics include total variation, likelihood-ratio error, divergence measures, or held-out classification performance. No one metric is granted universal authority by ML3.6.

## 9. Pedagogue consequence

If ML3.6 passes:

```text
previous operational criterion:
ROUTE_ORDER_IDENTIFIABILITY_REQUIRES_SEPARATING_DYNAMICS_AND_OBSERVATION

status:
VALID_INSIDE_DECLARED_DETERMINISTIC_SCOPE

scope-boundary status:
DETERMINISTIC_POINT_SIGNATURE_GRAMMAR_INSUFFICIENT_FOR_STOCHASTIC_OBSERVATION_MODEL
```

Pedagogue's next action becomes:

```text
AUTHOR_STOCHASTIC_IDENTIFIABILITY_CRITERION_CANDIDATES
```

The old criterion remains preserved rather than rewritten.

## 10. Claim ceiling

A passing ML3.6 fixture establishes only that the deterministic point-signature criterion is not the appropriate complete inverse object for the declared stochastic route-conditioned observation model, and that the authored finite distributional diagnostics reproduce their declared values.

It does not establish:

- a universal stochastic identifiability theorem;
- an optimal divergence measure;
- asymptotic consistency for arbitrary stochastic processes;
- hidden-Markov identifiability;
- causal identification;
- live TD613 stochastic behavior;
- quantum measurement;
- connection;
- curvature;
- holonomy;
- Berry structure;
- phasons;
- D3 physical geometry;
- A16 admission;
- Proto-Loom;
- production authority.

## 11. UI / release posture

```text
Moss Lantern dedicated UI = NOT REQUIRED
Pedagogue research UI = NOT REQUIRED
Giving UI mutation = NONE
Ash UI mutation = NONE
Holonomy Loom UI mutation = NONE
TD613.com deployment = HELD
PR remains Draft
```
