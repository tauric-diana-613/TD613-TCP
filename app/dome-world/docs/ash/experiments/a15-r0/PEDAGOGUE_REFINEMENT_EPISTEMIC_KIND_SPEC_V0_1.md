# Pedagogue Research Refinement · Epistemic-Kind Spec v0.1

Status: **AUTHORED / PRE-IMPLEMENTATION / GENERIC / RESEARCH-ONLY / HUMAN-GATED**  
Trigger: ML3.5 alias-location discriminator  
Parent relation: `ORDER_IS_PART_OF_PROCESS_STATE`  
Current candidate: `ROUTE_ORDER_IDENTIFIABILITY_REQUIRES_SEPARATING_DYNAMICS_AND_OBSERVATION`  
Pedagogue-law promotion: **NONE**  
Production mutation: **NONE**

## 0. The category error this amendment repairs

The current refinement object treats every proposed narrower statement as though it were one epistemic species: a mechanism that internal assays may support, counterexample, or refine.

ML3.5 exposes a category error in that design.

For a finite deterministic terminal-state inverse problem with declared candidate routes `R`, initial state `x0`, route-indexed forward maps `F_r`, and admitted observation map `O`, define:

```text
S(r) = O(F_r(x0))
```

Exact route recovery from the admitted terminal signature requires `S` to separate the declared route candidates. In the exact finite setting, saying that the route-signature map must be injective on `R` is an **operational identifiability criterion**. It is not an empirical law discovered because ML3.5 produced the expected 2×2 pattern.

ML3.5 can validate that:

- the implementation realizes the declared forward and observation factors;
- the metrics distinguish pre-observation collapse from post-observation collapse;
- the predeclared aperture produces the observed collision structure;
- the observer firewall remains intact.

ML3.5 cannot transform the injectivity criterion into an empirical discovery.

Pedagogue therefore needs an explicit epistemic-kind field before a research refinement can be reviewed correctly.

## 1. Epistemic-kind vocabulary

Initial generic enum:

```text
EMPIRICAL_RELATION
OPERATIONAL_CRITERION
FORMAL_IDENTITY
DESIGN_HEURISTIC
```

The enum is intentionally small. New kinds require an authored amendment rather than free-text proliferation.

### 1.1 EMPIRICAL_RELATION

A contingent relation whose support depends on observation or experiment and could have been otherwise under the same declared conceptual vocabulary.

Examples of allowed posture:

```text
bounded support
bounded counterexample
mixed evidence
inconclusive
```

Experiment may alter evidentiary status.

### 1.2 OPERATIONAL_CRITERION

A declared rule specifying what counts as success, distinguishability, observability, admissibility, reconstruction, or another assay property inside an explicit model/aperture.

Experiment validates implementation, calibration, scope, or applicability. It does not empirically discover the criterion merely by satisfying it.

Allowed posture:

```text
criterion specified
instrumentation validated against criterion
criterion scope boundary tested
criterion insufficient outside declared scope
```

### 1.3 FORMAL_IDENTITY

A statement that follows from definitions, algebra, or the declared formal system rather than contingent observation.

Tests may detect implementation errors or assumption violations. Passing tests do not provide empirical support for the identity as though it were a scientific hypothesis.

### 1.4 DESIGN_HEURISTIC

A practical intervention rule that may improve design, search, debugging, or experimental efficiency without claiming a necessary or universal relation.

Tests evaluate utility, robustness, and failure conditions rather than truth in the same sense as an empirical relation.

## 2. Required refinement metadata

`td613.flowcore.pedagogue-research-mechanism-refinement/v0.1` must gain:

```text
epistemic_kind
formal_scope
empirical_truth_claim
instrumentation_validation_applicable
boundary_testing_required
```

All fields are explicit. No default may silently classify a refinement.

Generic invariants:

```text
parent_mechanism_replaced = false
pedagogue_law_promoted = false
automatic_confidence_aggregation = false
product_mutation_authorized = false
production_mutation_authorized = false
human_closure_required = true
```

## 3. Kind-specific law

### EMPIRICAL_RELATION

```text
empirical_truth_claim = bounded/contingent only
instrumentation_validation_applicable = true
boundary_testing_required = true
```

Assay outcomes may change support posture.

### OPERATIONAL_CRITERION

```text
empirical_truth_claim = false
instrumentation_validation_applicable = true
boundary_testing_required = true
```

A passing assay may emit:

```text
INSTRUMENTATION_VALIDATED_FOR_OPERATIONAL_CRITERION
```

It may not emit:

```text
EMPIRICALLY_CONFIRMED_CRITERION
PROVEN_MECHANISM
DISCOVERED_LAW
```

### FORMAL_IDENTITY

```text
empirical_truth_claim = false
instrumentation_validation_applicable = true
boundary_testing_required = assumption-dependent
```

Passing execution may establish implementation consistency only.

### DESIGN_HEURISTIC

```text
empirical_truth_claim = false
instrumentation_validation_applicable = true
boundary_testing_required = true
```

Evaluation language is utility/robustness language, never theorem language.

## 4. Reclassification of the current order-identifiability refinement

Current candidate:

```text
ROUTE_ORDER_IDENTIFIABILITY_REQUIRES_SEPARATING_DYNAMICS_AND_OBSERVATION
```

New classification:

```text
epistemic_kind = OPERATIONAL_CRITERION
formal_scope = FINITE_DETERMINISTIC_TERMINAL_SIGNATURE_MODEL
empirical_truth_claim = false
instrumentation_validation_applicable = true
boundary_testing_required = true
```

Its core route-signature condition remains:

```text
S(r) = O(F_r(x0))

exact route recovery over finite declared R
requires S to be injective on R
```

Dynamic and observational aliasing remain useful diagnostic names:

```text
DYNAMIC_ALIASING:
F_r(x0) = F_s(x0) for distinct routes before observation

OBSERVATIONAL_ALIASING:
F_r(x0) != F_s(x0)
but
O(F_r(x0)) = O(F_s(x0))
```

These definitions locate collision stages inside the model. Their usefulness may be tested; their definitional content must not be presented as an empirically discovered physical law.

## 5. ML3.5 reinterpretation

Existing exact-head ML3.5 result remains valid as an instrument-calibration result.

The result must be re-described from:

```text
refinement_evaluation = DISCRIMINATED_IN_BOUNDED_FACTORIAL_FIXTURE
```

to:

```text
refinement_evaluation = INSTRUMENTATION_VALIDATED_FOR_OPERATIONAL_CRITERION
```

And the assay must explicitly emit:

```text
criterion_empirically_discovered = false
criterion_empirical_truth_claim = false
alias_location_instrument_validated = true
```

`H_ALIAS_LOCATION_DISCRIMINATOR` may remain as the identifier of the bounded **instrument-validation assay**, not as a scientific hypothesis about the truth of injectivity.

## 6. The next research question changes

Once an operational criterion is correctly classified, asking for an "external counterexample to the criterion" inside its own exact deterministic scope becomes malformed. The productive question is:

```text
Where does this criterion stop being sufficient as the model class widens?
```

Pedagogue's next action must therefore become:

```text
TEST_SCOPE_BOUNDARY_OUTSIDE_DETERMINISTIC_TERMINAL_SIGNATURE_MODEL
```

Candidate boundary families:

1. **stochastic forward maps** — routes induce distributions over observations rather than one terminal signature;
2. **history-bearing observation** — intermediate or multi-time measurements remain admitted even when terminal states coincide;
3. **partial observability** — the admitted measurement is a stochastic or many-to-one channel;
4. **probabilistic identifiability** — exact injectivity is replaced by statistical separability/error bounds;
5. **latent mixtures** — multiple hidden route/process classes can produce overlapping observation distributions.

These are research directions, not current TD613 claims.

## 7. First boundary assay recommendation

The cleanest next assay is a stochastic extension because it preserves the current finite route grammar while breaking the one-route → one-signature assumption.

Proposed question:

```text
If each route r induces an observation distribution P(Y|r)
rather than a deterministic signature S(r),
what replaces exact injectivity as the useful identifiability criterion?
```

Candidate diagnostics may include, after separate specification:

- distributional collision/equality;
- Bayes-optimal classification error under declared priors;
- total-variation or another declared separation measure;
- held-out reconstruction accuracy under finite samples.

No metric is admitted until separately authored with alternatives and failure modes.

## 8. Pedagogue architecture consequence

Research metabolism becomes:

```text
literature transfer card
→ bounded assay witness
→ multi-context mechanism review
→ refinement proposal
→ epistemic-kind classification
→ kind-appropriate validation
→ scope-boundary assay
```

This prevents three failure modes:

```text
definition laundering → empirical discovery
useful heuristic → scientific law
formal identity → confidence score
```

## 9. Backward compatibility

Historical research-transfer cards and assay witnesses remain unchanged by this amendment.

Only **mechanism refinement proposals** acquire the required epistemic-kind fields in v0.1 implementation. A later amendment may classify transfer cards themselves if the research program demonstrates that this is necessary.

The current parent relation remains visible and unchanged:

```text
ORDER_IS_PART_OF_PROCESS_STATE
= hydrated CROSS_DOMAIN_REVIEW_CANDIDATE
```

The refinement does not rewrite its parent.

## 10. Claim ceiling

This amendment establishes an internal research-governance taxonomy. It does not establish that the four epistemic kinds exhaust philosophy of science, scientific ontology, or epistemology.

It grants no authority for:

- TD613 physical claims;
- quantum behavior;
- connection, curvature, or holonomy;
- Berry structure;
- phasons;
- D3 physical geometry;
- A16 admission;
- Proto-Loom;
- production deployment.

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
