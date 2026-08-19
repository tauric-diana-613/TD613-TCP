# Pedagogue Stochastic Identifiability Criterion Family Spec v0.1

Status: **AUTHORED / PRE-IMPLEMENTATION / GENERIC / RESEARCH-ONLY / HUMAN-GATED**  
Trigger: Moss Lantern ML3.6 stochastic scope boundary  
Parent deterministic criterion: `ROUTE_ORDER_IDENTIFIABILITY_REQUIRES_SEPARATING_DYNAMICS_AND_OBSERVATION`  
Parent formal scope: `FINITE_DETERMINISTIC_TERMINAL_SIGNATURE_MODEL`  
New model family: `FINITE_ROUTE_CONDITIONED_DISCRETE_OBSERVATION_DISTRIBUTIONS`  
Pedagogue-law promotion: **NONE**  
Production mutation: **NONE**

## 0. Why Pedagogue needs a family rather than one new criterion

ML3.6 exits a deterministic inverse object:

```text
route r
→
one admitted terminal signature S(r)
```

and enters a stochastic inverse object:

```text
route r
→
P(Y | r)
```

Its bounded fixture establishes a scope boundary rather than a replacement theorem:

```text
same support
!=
same route-conditioned distribution

same route-conditioned distribution
→
indistinguishable under that complete admitted stochastic observation law

more samples
can improve finite-budget discrimination when distributions differ
but
cannot separate identical distributions
```

These statements belong to different epistemic and decision layers. Pedagogue therefore may not replace point-signature injectivity with a single privileged divergence.

The next object is a **criterion family** whose members must declare what question they answer.

## 1. Required question axes

Every stochastic identifiability statement must name at least:

```text
model_class
observation_object
equivalence_relation
candidate_family
sample_budget
prior_or_route_weighting
loss_or_decision_target
```

A statement omitting materially relevant axes may be useful shorthand in prose, but it cannot enter Pedagogue as a governed criterion.

The grammar:

```text
"identifiable"
without
model + observation + equivalence + decision scope
= INADMISSIBLY_UNDERSPECIFIED
```

## 2. Criterion-family roles

Initial role enum:

```text
POPULATION_EQUIVALENCE
FINITE_BUDGET_DECISION
FORMAL_DIAGNOSTIC
EMPIRICAL_VALIDATION
```

These roles are not ranked. They answer different questions.

### 2.1 POPULATION_EQUIVALENCE

Question:

```text
Which latent routes/processes are observationally the same object
under the complete declared observation law?
```

For the finite discrete route-conditioned model, define:

```text
r ~_P s
iff
P(Y | r) = P(Y | s)
for every admitted Y
```

This is an **OPERATIONAL_CRITERION** defining observational equivalence inside the declared model. It is not an empirical discovery.

Candidate id:

```text
STOCHASTIC_OBSERVATIONAL_EQUIVALENCE_BY_DISTRIBUTION
```

Population point-identifiability of a route within a finite candidate family means its equivalence class under `~_P` is a singleton.

Partial identifiability is preserved explicitly when the class contains multiple routes.

No sample budget enters this population equivalence definition.

### 2.2 FINITE_BUDGET_DECISION

Question:

```text
Given n admitted observations, a declared prior/route weighting,
and a declared loss, how well can an optimal decision rule
recover the latent route among the declared candidates?
```

Candidate id:

```text
STOCHASTIC_BAYES_DECISION_RECOVERABILITY_AT_BUDGET
```

Epistemic kind:

```text
OPERATIONAL_CRITERION
```

Required parameters:

```text
sample_budget = n
candidate_route_set
prior_or_route_weighting
loss_function
observation_law
acceptable_error_threshold = epsilon
```

Example bounded criterion:

```text
BayesRisk_n <= epsilon
```

means **decision-recoverable at the declared budget/weighting/loss threshold**, not population-identifiable in a universal sense.

Changing `n`, the prior, loss, candidate set, or observation law changes the decision problem and may change the result without contradiction.

### 2.3 FORMAL_DIAGNOSTIC

Question:

```text
Which formal quantity summarizes a declared aspect of separation
inside a specified mathematical scope?
```

Initial diagnostic candidates:

```text
TOTAL_VARIATION
PAIRWISE_EQUAL_PRIOR_BAYES_ERROR_IDENTITY
SUPPORT_EQUALITY
```

Roles:

#### TOTAL_VARIATION

```text
TV(P,Q) = 1/2 * Σ_y |P(y)-Q(y)|
```

Epistemic kind:

```text
FORMAL_IDENTITY / FORMAL_DIAGNOSTIC
```

TV may define an epsilon-separation condition in a particular theorem or assay. It is not automatically the universal definition of stochastic identifiability.

#### Equal-prior binary Bayes error identity

For two fully specified simple hypotheses, equal priors, and 0-1 loss:

```text
BayesError(P,Q) = (1 - TV(P,Q)) / 2
```

This is a formal identity inside that declared decision problem. Passing numerical tests validates implementation; it does not empirically confirm the identity.

#### Support equality

```text
support(P) = support(Q)
```

Support equality is a deliberately weak diagnostic. ML3.6 demonstrates that equal support can coexist with substantial distributional separation.

Pedagogue therefore must never promote support equality into distribution equality.

### 2.4 EMPIRICAL_VALIDATION

Question:

```text
Does an implemented finite-sample decoder achieve its declared
held-out performance under an independently generated sample process?
```

Candidate id:

```text
HELDOUT_STOCHASTIC_DECODER_RECOVERABILITY
```

Epistemic kind:

```text
DESIGN_HEURISTIC
```

or, when a contingent relationship is explicitly being estimated:

```text
EMPIRICAL_RELATION
```

A held-out decoder result may validate practical utility, calibration, or robustness. It cannot by itself prove population identifiability because finite success depends on model class, data generation, training, prior, loss, sample budget, and decoder class.

## 3. Candidate-family object

Proposed generic schema:

```text
td613.flowcore.pedagogue-research-criterion-family/v0.1
```

Family fields:

```text
family_id
research_question
parent_scope_boundary_reference
model_class
observation_object
equivalence_relation
members[]
forbidden_collapses[]
claim_ceiling
authority
```

Each member requires:

```text
criterion_id
role
epistemic_kind
question_answered
formal_scope
required_assumptions[]
required_parameters[]
criterion_statement
success_language
failure_language
forbidden_inferences[]
next_validation
```

## 4. Family-level anti-collapse law

The following equivalences are forbidden:

```text
population_identifiability
!=
finite_sample_accuracy

pairwise_distribution_separation
!=
multiclass_recoverability

support_equality
!=
distribution_equality

positive_divergence
!=
practical recoverability at arbitrary n

heldout_decoder_success
!=
population point-identifiability

partial_identifiability
!=
failed_identifiability

identified_up_to_equivalence
!=
uniquely identified
```

## 5. Why no divergence is crowned

Current statistics and learning theory use different separation notions for different tasks: total variation for distribution testing/estimation, KL-family quantities for likelihood/information analyses, task-specific Bayes risk for decision problems, and identified sets/equivalence classes for partial identification.

Pedagogue therefore refuses:

```text
"the stochastic distance"
```

as an unscoped noun.

A divergence or distance may enter only with:

```text
what theorem/decision problem uses it
what assumptions make it relevant
what sample regime is being discussed
what equivalence class it respects
```

## 6. First family members to implement

### C0 · STOCHASTIC_OBSERVATIONAL_EQUIVALENCE_BY_DISTRIBUTION

```text
role = POPULATION_EQUIVALENCE
epistemic_kind = OPERATIONAL_CRITERION
formal_scope = FINITE_DISCRETE_ROUTE_CONDITIONED_OBSERVATION_LAWS
sample_budget = NOT_APPLICABLE
```

Criterion:

```text
r ~_P s iff P(Y|r)=P(Y|s) for all admitted Y
```

Output:

```text
equivalence classes over candidate routes
singleton classes
non-singleton classes
partial-identifiability class sizes
```

### C1 · STOCHASTIC_BAYES_DECISION_RECOVERABILITY_AT_BUDGET

```text
role = FINITE_BUDGET_DECISION
epistemic_kind = OPERATIONAL_CRITERION
formal_scope = FINITE_DECLARED_HYPOTHESIS_DECISION_PROBLEM
```

Criterion:

```text
BayesRisk_n <= epsilon
```

with prior, loss, candidate set, sample budget, and observation law all explicit.

### D0 · TOTAL_VARIATION_PAIRWISE_DIAGNOSTIC

```text
role = FORMAL_DIAGNOSTIC
epistemic_kind = FORMAL_IDENTITY
```

No promotion to family-wide criterion.

### D1 · EQUAL_PRIOR_BINARY_BAYES_ERROR_DIAGNOSTIC

```text
role = FORMAL_DIAGNOSTIC
epistemic_kind = FORMAL_IDENTITY
```

Only for two simple hypotheses, equal priors, 0-1 loss.

### V0 · HELDOUT_STOCHASTIC_DECODER_RECOVERABILITY

```text
role = EMPIRICAL_VALIDATION
epistemic_kind = DESIGN_HEURISTIC
```

Used to test practical implementation against the governed population/decision objects; never used to define those objects post hoc.

## 7. First hostile assay for the family

A family is useless if all members agree on every authored example. The first implementation assay should therefore include cases where the layers diverge.

### Case A · distinct distributions, weak one-sample decision

Choose two close but unequal binary route-conditioned distributions.

Expected posture:

```text
population equivalence: distinct singleton classes
finite-budget Bayes error at n=1: high
```

This demonstrates:

```text
population distinguishability
can coexist with
poor finite-budget recoverability
```

### Case B · distinct distributions, stronger multi-sample decision

Use the same population laws with larger `n`.

Expected posture:

```text
population equivalence classes unchanged
finite-budget decision risk improves
```

### Case C · identical distributions

Expected posture:

```text
same population equivalence class
Bayes error remains prior-limited under every n
```

### Case D · multiclass candidate family

Include at least three route-conditioned distributions so pairwise diagnostics cannot silently stand in for the multiclass Bayes decision problem.

The exact distributions, priors, loss, budgets, and thresholds must be authored before implementation.

## 8. Literature-hydration lessons incorporated

Current 2026 primary literature motivates several restrictions:

- distribution-testing sample complexity depends on separation, domain, and task structure;
- multi-distribution learning can have sample costs that change with source count, noise, and benchmark;
- partial identification is a legitimate result when assumptions do not support point identification;
- observation design can alter information and estimability without changing the latent process itself.

These observations motivate the criterion family. They do not grant any single metric universal authority.

## 9. Pedagogue next action

If the family compiler and hostile assay preserve the anti-collapse law:

```text
next_learning_action = TEST_STOCHASTIC_CRITERION_FAMILY_ON_MULTICLASS_AND_PARTIAL_IDENTIFICATION_CASES
```

Only after that should Pedagogue revisit whether a generic stochastic-identifiability abstraction belongs in shared research core.

## 10. Claim ceiling

This specification does not establish a universal stochastic identifiability theorem or a complete taxonomy of statistical decision theory.

It grants no claim of:

- optimality of total variation;
- universal optimality of Bayes risk as a research metric;
- asymptotic consistency outside declared finite models;
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
Pedagogue research UI = NOT REQUIRED
Moss Lantern dedicated UI = NOT REQUIRED
Giving UI mutation = NONE
Ash UI mutation = NONE
Holonomy Loom UI mutation = NONE
TD613.com deployment = HELD
PR remains Draft
```
