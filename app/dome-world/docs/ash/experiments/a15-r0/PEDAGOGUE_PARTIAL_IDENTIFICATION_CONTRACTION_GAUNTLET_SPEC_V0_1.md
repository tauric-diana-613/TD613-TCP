# Pedagogue Partial-Identification Contraction Gauntlet Spec v0.1

Status: **AUTHORED / PRE-IMPLEMENTATION / RESEARCH-ONLY / HUMAN-GATED**  
Parent: `td613.flowcore.pedagogue-research-criterion-family/v0.1`  
Parent hostile assay: `td613.ash.a15-r0.stochastic-criterion-hostile-assay/v0.1`  
Model family: `FINITE_ROUTE_CONDITIONED_DISCRETE_OBSERVATION_DISTRIBUTIONS`  
Promotion authority: **FALSE**  
Production mutation: **NONE**

## 0. Research question

The stochastic criterion family can already preserve a non-singleton observational-equivalence class. The next question is harder:

```text
When an identified set contracts,
what caused the contraction?
```

Pedagogue must distinguish at least three operations:

```text
A. adding a predeclared model restriction
B. adding a genuinely new observation channel
C. adding a post-hoc target-selected restriction
```

All three can make a candidate set numerically smaller. They do not carry the same epistemic meaning.

Core anti-equivalence:

```text
identified-set contraction
!=
point identification automatically earned

more observation
!=
stronger assumption

predeclared restriction
!=
post-hoc target selection

singleton under a restricted model
!=
unconditional unique identification
```

## 1. Fixed synthetic candidate family

Candidate routes:

```text
R0
R1
R2
R3
```

Synthetic target route, declared before evaluation:

```text
target = R0
```

This declaration exists only so the finite fixture has a known reference truth. It grants no live-TD613 claim.

### 1.1 Baseline observation channel Y

Binary alphabet:

```text
Y ∈ {0,1}
```

Route-conditioned laws:

```text
P(Y|R0) = [0.5, 0.5]
P(Y|R1) = [0.5, 0.5]
P(Y|R2) = [0.5, 0.5]
P(Y|R3) = [0.8, 0.2]
```

Target admitted law:

```text
P(Y|target) = [0.5, 0.5]
```

Baseline identified set:

```text
I_Y = {R0,R1,R2}
|I_Y| = 3
```

Interpretation:

```text
R0 is not point-identified from Y.
```

R3 is excluded by observation-law mismatch. R0/R1/R2 remain observationally equivalent under Y.

## 2. Case A · predeclared structural restriction contracts the model class

Before inspecting the target observation result, the synthetic fixture declares one structural restriction:

```text
H_pre admits {R0,R1,R3}
H_pre excludes {R2}
provenance = PREDECLARED_SYNTHETIC_STRUCTURAL_RESTRICTION
independent_empirical_support = false
```

The restriction carries no new Y information.

Assumption-conditioned identified set:

```text
I_(Y,H_pre)
= I_Y ∩ H_pre
= {R0,R1}

|I_Y| = 3
|I_(Y,H_pre)| = 2
```

Required classification:

```text
ASSUMPTION_CONDITIONED_PARTIAL_IDENTIFICATION
```

Required language:

```text
identified_set_contracted = true
point_identified = false
new_observation_added = false
model_class_narrowed = true
```

Forbidden inference:

```text
R2 was empirically disproved by Y
```

The fixture only says R2 is outside the *declared restricted model*.

## 3. Case B · auxiliary observation contracts observational equivalence

Add a second binary channel Z without changing the candidate set or baseline Y laws.

```text
Z ∈ {0,1}
```

Route-conditioned laws:

```text
P(Z|R0) = [0.9, 0.1]
P(Z|R1) = [0.1, 0.9]
P(Z|R2) = [0.9, 0.1]
P(Z|R3) = [0.5, 0.5]
```

For this finite fixture, Y and Z are declared conditionally independent given route, so the joint observation law is:

```text
P(Y,Z|r) = P(Y|r) P(Z|r)
```

Target joint law is the R0 joint law.

With the unrestricted four-route candidate family:

```text
I_(Y,Z) = {R0,R2}
|I_(Y,Z)| = 2
```

The contraction is:

```text
{R0,R1,R2}
→
{R0,R2}
```

Required classification:

```text
OBSERVATION_CONDITIONED_PARTIAL_IDENTIFICATION
```

Required language:

```text
identified_set_contracted = true
point_identified = false
new_observation_added = true
model_class_narrowed = false
```

R1 is excluded by a newly admitted observation-law mismatch, not by assumption.

## 4. Case C · nested observation plus predeclared restriction earns a conditional singleton

Now combine the *same predeclared* `H_pre` with the expanded observation `(Y,Z)`.

```text
I_(Y,Z,H_pre)
= I_(Y,Z) ∩ H_pre
= {R0}
```

Required classification:

```text
POINT_IDENTIFIED_WITHIN_DECLARED_OBSERVATION_AND_MODEL_SCOPE
```

Required output:

```text
identified_set = {R0}
point_identified = true
unconditional_point_identification = false
observation_scope = {Y,Z}
assumption_scope = H_pre
```

The singleton is valid only inside the explicitly combined scope.

Forbidden language:

```text
R0 uniquely identified without qualification
```

Required qualified language:

```text
R0 is point-identified inside the declared finite candidate family,
under observation channels Y+Z and predeclared restriction H_pre.
```

## 5. Case D · post-hoc target-selected restriction must not earn identification

After the target is known, define:

```text
H_post admits {R0}
H_post excludes {R1,R2,R3}
provenance = POSTHOC_TARGET_SELECTED_RESTRICTION
independent_empirical_support = false
```

Numerically:

```text
I_Y ∩ H_post = {R0}
```

But the required Pedagogue verdict is:

```text
ASSUMPTION_LAUNDERING_REJECTED
```

and:

```text
point_identification_earned = false
identified_set_for_governed_inference = I_Y = {R0,R1,R2}
```

The post-hoc restriction may be displayed as a counterfactual bookkeeping operation, but it must not modify the governed identification verdict.

Core law:

```text
a restriction selected because it preserves the known target
cannot be used as evidence that the target was identified
```

## 6. Contraction-source ledger

Every contraction receipt must declare one and only one primary source:

```text
OBSERVATION_EXPANSION
PREDECLARED_MODEL_RESTRICTION
COMBINED_OBSERVATION_AND_PREDECLARED_RESTRICTION
POSTHOC_RESTRICTION_REJECTED
```

Pedagogue must not compress them into:

```text
MORE_INFORMATION
```

because model restrictions are not observations.

## 7. Monotonicity checks inside the nested finite fixture

The assay should verify two bounded monotonicity properties.

### 7.1 Nested observation monotonicity

Because `(Y,Z)` appends Z rather than replacing Y:

```text
I_(Y,Z) ⊆ I_Y
```

Expected:

```text
{R0,R2} ⊆ {R0,R1,R2}
```

### 7.2 Nested model-restriction monotonicity

Because `H_pre` removes candidates without changing the observation law:

```text
I_(Y,H_pre) ⊆ I_Y
```

Expected:

```text
{R0,R1} ⊆ {R0,R1,R2}
```

These are formal consequences of the nested construction in this fixture. They are not universal claims about arbitrary model replacement or arbitrary changes of observation design.

## 8. Assumption-provenance contract

A model restriction must declare:

```text
restriction_id
admitted_candidates
excluded_candidates
provenance_class
predeclared_before_target_evaluation
independent_empirical_support
justification_reference
```

Initial provenance classes:

```text
PREDECLARED_SYNTHETIC_STRUCTURAL_RESTRICTION
POSTHOC_TARGET_SELECTED_RESTRICTION
```

A post-hoc target-selected restriction is never silently promoted into the predeclared class.

## 9. Expected exact receipt

```text
baseline:
  identified_set = [R0,R1,R2]
  size = 3
  classification = PARTIALLY_IDENTIFIED

case_A_predeclared_restriction:
  identified_set = [R0,R1]
  size = 2
  contraction_source = PREDECLARED_MODEL_RESTRICTION
  classification = ASSUMPTION_CONDITIONED_PARTIAL_IDENTIFICATION
  point_identified = false

case_B_auxiliary_observation:
  identified_set = [R0,R2]
  size = 2
  contraction_source = OBSERVATION_EXPANSION
  classification = OBSERVATION_CONDITIONED_PARTIAL_IDENTIFICATION
  point_identified = false

case_C_combined_scope:
  identified_set = [R0]
  size = 1
  contraction_source = COMBINED_OBSERVATION_AND_PREDECLARED_RESTRICTION
  classification = POINT_IDENTIFIED_WITHIN_DECLARED_OBSERVATION_AND_MODEL_SCOPE
  point_identified = true
  unconditional_point_identification = false

case_D_posthoc_restriction:
  arithmetic_intersection = [R0]
  governed_identified_set = [R0,R1,R2]
  contraction_source = POSTHOC_RESTRICTION_REJECTED
  classification = ASSUMPTION_LAUNDERING_REJECTED
  point_identification_earned = false
```

## 10. Failure conditions

The gauntlet fails if implementation:

1. calls any two-element set point identification;
2. says Case A added observational evidence;
3. says Case B narrowed the model class;
4. reports Case C as unconditional unique identification;
5. lets `H_post` replace the governed baseline identified set;
6. hides assumption provenance;
7. labels a post-hoc target-selected restriction as predeclared;
8. allows an identified set to expand under these explicitly nested constructions;
9. changes any authored route law, target, candidate set, or restriction after implementation begins;
10. treats this synthetic fixture as evidence about live TD613, Ash, or physical systems.

## 11. Epistemic posture

This assay tests whether Pedagogue can preserve the provenance of *why* an identified set became smaller.

It may establish only:

```text
PARTIAL_IDENTIFICATION_CONTRACTION_GRAMMAR_VALIDATED_IN_BOUNDED_SYNTHETIC_FIXTURE
```

A pass does not empirically discover the formal set-intersection identities used by the fixture.

The likely reusable relation under review is narrower:

```text
an identification verdict is inseparable from
its observation scope + candidate model + assumption provenance
```

That sentence remains a **research refinement candidate**, not a promoted Pedagogue law.

## 12. Next action if the gauntlet survives

If the implementation preserves all four contraction sources and rejects post-hoc assumption laundering:

```text
next_learning_action = TEST_IDENTIFICATION_UNDER_MODEL_MISSPECIFICATION_AND_HELDOUT_OBSERVATION
```

That next assay should ask whether an apparently clean singleton can survive when the true synthetic route lies outside the declared candidate family.

## 13. Claim ceiling

No passing result establishes:

- a universal theorem of partial identification;
- causal identification;
- econometric identification outside the declared finite fixture;
- live TD613 stochastic behavior;
- empirical truth of any synthetic restriction;
- connection;
- curvature;
- holonomy;
- Berry structure;
- physical phasons;
- quantum behavior;
- A16 admission;
- Proto-Loom;
- production authority.

## 14. UI / release posture

```text
Pedagogue research UI = NOT REQUIRED
Moss Lantern UI = NONE
Giving UI mutation = NONE
Ash Keep production UI mutation = NONE
Holonomy Loom UI mutation = NONE
TD613.com deployment = HELD
PR remains Draft
```
