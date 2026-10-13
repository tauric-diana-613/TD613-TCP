# Pedagogue Stochastic Identifiability Criterion Family · Hostile Assay Spec v0.1

Status: **AUTHORED / PRE-IMPLEMENTATION / GENERIC / RESEARCH-ONLY / HUMAN-GATED**  
Parent family spec: `PEDAGOGUE_STOCHASTIC_IDENTIFIABILITY_CRITERION_FAMILY_SPEC_V0_1`  
Model family: `FINITE_ROUTE_CONDITIONED_DISCRETE_OBSERVATION_DISTRIBUTIONS`  
Sequence authority: **FALSE**  
Promotion authority: **FALSE**  
Production mutation: **NONE**

## 0. Purpose

The criterion family must survive examples where its members disagree for principled reasons. A family in which population equivalence, finite-budget decision risk, pairwise diagnostics, and held-out validation always collapse to the same number has not demonstrated why those roles deserve separate governance.

This hostile assay therefore predeclares four cases before implementation.

## 1. Global decision contract

Unless a case says otherwise:

```text
loss = 0-1 classification loss
candidate prior = uniform over declared candidate routes
observations = independent conditional on latent route
all probabilities = exact authored finite distributions
Monte Carlo = forbidden for formal expected values
```

The assay must report separately:

```text
population equivalence classes
sample budget n
Bayes-optimal error under declared prior/loss
pairwise total-variation diagnostics where applicable
pairwise equal-prior binary Bayes errors where applicable
multiclass Bayes error where applicable
```

No pairwise diagnostic may be substituted for a multiclass decision calculation.

## 2. Case A · population-distinct but weak one-sample decision

Binary observation alphabet:

```text
Y ∈ {0,1}
```

Routes:

```text
A0: [0.6, 0.4]
A1: [0.4, 0.6]
```

Population equivalence:

```text
[A0]
[A1]
```

because the complete route-conditioned distributions differ.

At sample budget:

```text
n = 1
```

authored formal diagnostics:

```text
TV(A0,A1) = 0.2
equal-prior binary Bayes error = 0.4
```

Interpretation:

```text
population point-identifiable within the declared two-route family
!=
strong finite-budget decision recoverability at n=1
```

## 3. Case B · same population laws, larger sample budget

Reuse exactly the Case A route-conditioned population laws and priors.

Change only:

```text
n = 3
```

Enumerate all eight binary sequences exactly.

Authored expected values:

```text
population equivalence classes unchanged:
[A0]
[A1]

TV(A0^3,A1^3) = 0.296
equal-prior binary Bayes error = 0.352
```

Required relation:

```text
0.352 < 0.4
```

Interpretation:

```text
finite-budget decision risk improved
while
population equivalence did not change
```

This is the central anti-collapse witness between C0 and C1.

## 4. Case C · identical distributions

Routes:

```text
C0: [0.5, 0.5]
C1: [0.5, 0.5]
```

Population equivalence:

```text
[C0,C1]
```

At both:

```text
n = 1
n = 3
```

expected:

```text
TV = 0
Bayes error = 0.5
```

Interpretation:

```text
more samples do not separate identical complete observation laws
```

The non-singleton equivalence class is an explicit partial/non-point-identifiability result, not a decoder failure to be cosmetically renamed.

## 5. Case D · multiclass decision cannot be replaced by pairwise summaries

Observation alphabet:

```text
Y ∈ {0,1,2}
```

Three routes:

```text
D0: [0.8, 0.1, 0.1]
D1: [0.1, 0.8, 0.1]
D2: [0.1, 0.1, 0.8]
```

Uniform route prior:

```text
π(D0)=π(D1)=π(D2)=1/3
```

Sample budget:

```text
n = 1
```

Population equivalence:

```text
[D0]
[D1]
[D2]
```

Every pair has:

```text
TV = 0.7
binary equal-prior pairwise Bayes error = 0.15
```

But the declared three-way Bayes decision problem has:

```text
multiclass Bayes accuracy = 0.8
multiclass Bayes error = 0.2
```

The implementation must calculate multiclass Bayes risk directly:

```text
BayesAccuracy = Σ_y max_r π(r) P(y|r)
BayesError = 1 - BayesAccuracy
```

It may not infer `0.2` from the pairwise `0.15` values.

Interpretation:

```text
pairwise distribution separation
!=
multiclass decision recoverability
```

## 6. Criterion-family expected verdicts

### C0 · STOCHASTIC_OBSERVATIONAL_EQUIVALENCE_BY_DISTRIBUTION

Must return:

```text
Case A: 2 singleton classes
Case B: same 2 singleton classes
Case C: 1 class of size 2
Case D: 3 singleton classes
```

No sample-budget dependence is allowed in C0 output.

### C1 · STOCHASTIC_BAYES_DECISION_RECOVERABILITY_AT_BUDGET

Must require explicit:

```text
sample budget
prior
loss
candidate set
observation laws
```

and report the authored risks for A-D.

C1 may not rewrite C0 equivalence classes when `n` changes.

### D0 · TOTAL_VARIATION_PAIRWISE_DIAGNOSTIC

Must remain labeled:

```text
FORMAL_DIAGNOSTIC
```

and pairwise only.

### D1 · EQUAL_PRIOR_BINARY_BAYES_ERROR_DIAGNOSTIC

Must refuse or mark **NOT_APPLICABLE** for Case D's three-way problem as a multiclass criterion. Pairwise D0/D1 calculations may still be reported as diagnostics.

### V0 · HELDOUT_STOCHASTIC_DECODER_RECOVERABILITY

Not executed in this formal hostile assay.

Its status must remain:

```text
UNEXECUTED_EMPIRICAL_VALIDATION
```

The absence of an empirical decoder result must not block formal population/decision calculations, and formal calculations must not masquerade as held-out decoder validation.

## 7. Family anti-collapse decision law

The family passes this hostile assay only if all of the following remain true:

```text
population equivalence unchanged between Cases A and B
finite-budget risk improves from A to B
Case C remains one non-singleton population equivalence class at both budgets
Case D pairwise Bayes error = 0.15
Case D multiclass Bayes error = 0.2
binary pairwise diagnostic marked NOT_APPLICABLE as the multiclass decision criterion
held-out empirical validation remains unexecuted
```

and the implementation retains every forbidden collapse from the family spec.

## 8. Failure conditions

The assay fails if implementation:

1. changes population equivalence classes merely because sample budget changes;
2. calls Case C uniquely identified because a decoder arbitrarily picks one route;
3. uses support equality instead of distribution equality for C0;
4. treats positive TV as sufficient for a user-independent finite-budget recovery claim;
5. substitutes pairwise binary Bayes errors for Case D's multiclass Bayes risk;
6. reports formal exact enumeration as empirical held-out validation;
7. changes any authored distribution, prior, loss, budget, or threshold after seeing results.

## 9. Epistemic posture

This assay validates whether the criterion family keeps distinct mathematical/decision questions distinct.

It does not empirically discover:

- the definition of distribution equality;
- the total-variation formula;
- the equal-prior binary Bayes error identity;
- the multiclass Bayes decision identity.

Those calculations are formal inside their declared scopes.

The hostile assay may establish only that the implementation and governance correctly separate population equivalence, finite-budget decision risk, pairwise diagnostics, and unexecuted empirical validation on the authored fixtures.

## 10. Claim ceiling

No passing result establishes:

- a universal stochastic identifiability theorem;
- total variation as the privileged metric of TD613;
- Bayes risk as a universal research objective;
- asymptotic consistency;
- causal identification;
- hidden-Markov identifiability;
- live TD613 stochastic behavior;
- information curvature;
- connection;
- geometric curvature;
- holonomy;
- Berry structure;
- physical phasons;
- D3 physical geometry;
- A16 admission;
- Proto-Loom;
- production authority.

## 11. UI / release posture

```text
Pedagogue research UI = NOT REQUIRED
Moss Lantern UI = NONE
Giving UI mutation = NONE
Ash Keep production UI mutation = NONE
Holonomy Loom UI mutation = NONE
TD613.com deployment = HELD
PR remains Draft
```
