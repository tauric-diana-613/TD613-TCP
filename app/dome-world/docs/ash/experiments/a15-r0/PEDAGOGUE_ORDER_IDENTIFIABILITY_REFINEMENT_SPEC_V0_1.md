# Pedagogue Order-Identifiability Mechanism Refinement Spec v0.1

Status: **AUTHORED / PRE-IMPLEMENTATION / RESEARCH-ONLY / HUMAN-GATED**  
Parent hydrated relation: `ORDER_IS_PART_OF_PROCESS_STATE`  
Candidate refinement: `ROUTE_ORDER_IDENTIFIABILITY_REQUIRES_SEPARATING_DYNAMICS_AND_OBSERVATION`  
Pedagogue law promotion: **NONE**  
Parent relation replacement: **FORBIDDEN**  
Automatic redesign: **FALSE**  
Production mutation: **NONE**

## 0. Why refinement follows two supported contexts

Pedagogue currently holds:

```text
external literature:
ORDER_IS_PART_OF_PROCESS_STATE
= CROSS_DOMAIN_REVIEW_CANDIDATE

internal bounded witnesses:
ASH_CALIBRATION = SUPPORTED_BOUNDED
GIVING_PRACTICE = SUPPORTED_BOUNDED

internal context-family count = 2
statistical independence claim = false
pedagogue law status = NOT_PROMOTED
```

Two supported contexts do not justify promotion. They justify a harder mechanistic question:

```text
What structural conditions make route order recoverable at all?
```

The two internal contexts expose different failure locations. Moss Lantern's commuting null erases route order inside the forward dynamics. Giving's coarse endpoint can erase order only at the observation aperture even when the richer terminal state differs.

Therefore Pedagogue should propose a narrower operational mechanism and then try to defeat it.

## 1. Finite route-signature formalism

For a finite candidate route family `R`, initial state `x0`, route-indexed forward maps `F_r`, and observation map `O`, define the admitted route signature:

```text
S(r) = O(F_r(x0))
```

Exact route-order identifiability over `R` means only:

```text
S : R → Y
is injective on the declared candidate family R
```

Equivalently:

```text
r != s
→
S(r) != S(s)
```

for every distinct `r,s` in the finite assay family.

This is an operational finite inverse-problem criterion. It is not a universal law of time, causality, geometry, information, or physics.

## 2. Two distinct aliasing failures

### 2.1 Dynamic aliasing

Dynamic aliasing occurs when different routes already collapse before observation:

```text
r != s
and
F_r(x0) = F_s(x0)
```

Then no downstream observation map can recover the lost distinction from terminal state alone.

Moss Lantern's matched commuting operator null is the current bounded witness:

```text
24 route permutations
→ 1 terminal state
```

The forward process itself erased order.

### 2.2 Observational aliasing

Observational aliasing occurs when terminal states differ but the admitted observation collapses them:

```text
F_r(x0) != F_s(x0)

but

O(F_r(x0)) = O(F_s(x0))
```

Giving supplies the current bounded example:

```text
PREPARE → SUBMIT
terminal prepared-route state:
searched = true

SUBMIT → PREPARE
terminal prepared-route state:
searched = false
```

while a deliberately coarse endpoint-only observation maps both to:

```text
INDIVIDUAL_CONTRIBUTOR_PREPARED
```

The process retained an order distinction; the aperture discarded it.

## 3. Candidate refined mechanism

Pedagogue may author the following candidate mechanism identifier:

```text
ROUTE_ORDER_IDENTIFIABILITY_REQUIRES_SEPARATING_DYNAMICS_AND_OBSERVATION
```

Operational reading:

```text
For a declared finite route family and terminal-state inverse problem,
route order is exactly identifiable only when:

1. the forward route dynamics preserve enough route distinctions
   on the declared initial condition; and
2. the admitted observation map preserves enough of those surviving
   terminal distinctions to keep route signatures injective.
```

This is deliberately stated as an assay-design criterion rather than an ontology claim.

## 4. Refinement proposal object

Pedagogue needs a generic research object that can say:

```text
parent mechanism
→ multi-context bounded evidence
→ proposed narrower operational mechanism
```

without changing shared law.

Proposed schema:

```text
td613.flowcore.pedagogue-research-mechanism-refinement/v0.1
```

Required fields:

```text
proposal_id
parent_mechanism_id
candidate_mechanism_id
proposal_posture
operational_definition
scope_conditions[]
failure_modes[]
supporting_witness_ids[]
supporting_context_families[]
distinct_context_family_count
discriminating_assays[]
counterexample_conditions[]
alternative_explanations_remaining[]
claim_ceiling
```

Authority membrane:

```text
parent_mechanism_replaced = false
pedagogue_law_promoted = false
relation_identity_claim = false
statistical_independence_claim = false
automatic_redesign = false
product_mutation_authorized = false
production_mutation_authorized = false
external_transmission_authorized = false
human_closure_required = true
```

## 5. Admission gate for a multi-context refinement proposal

A refinement proposal sourced from internal bounded assay evidence requires:

```text
parent mechanism exists in governed research hydration
internal supported bounded witnesses >= 2
distinct declared context families >= 2
all supporting witnesses target the same parent mechanism
supporting witness ids unique
context-family distinctness explicitly NOT statistical independence
parent relation remains NOT_PROMOTED
```

A proposal may still be authored from mixed evidence, but it must retain the counterexample and set its next action to a discriminating assay rather than presenting convergence.

## 6. Evidence presently available

### ASH_CALIBRATION · Moss Lantern ML3

Positive:

```text
24 hidden route permutations
24 terminal signatures
95.3125% exact noisy recovery
```

Dynamic alias control:

```text
commuting operator family
24 routes
1 terminal signature
```

Interpretation ceiling:

```text
ordinary finite classical operator algebra only
```

### GIVING_PRACTICE · prepared contributor handoff

Positive source-contract-derived simulation:

```text
same {PREPARE,SUBMIT} multiset
same coarse prepared endpoint
2 richer terminal prepared-route states
```

Observation aperture contrast:

```text
full prepared-route state
→ 2 terminal signatures

coarse endpoint only
→ 1 signature
```

Interpretation ceiling:

```text
fictional Giving practice source contract only
no browser/retrieval execution
```

## 7. Required discriminating assay

The proposed refinement must not advance merely because the two examples can be narrated in its language.

The next assay should form a controlled 2×2 discriminator:

```text
                    rich observation    lossy observation
order-separating
forward dynamics          A                    B

order-erasing
forward dynamics          C                    D
```

Expected bounded pattern if the refinement is useful:

```text
A: route signatures remain injective
B: observational aliasing appears
C: dynamic aliasing appears even under rich observation
D: aliasing remains or worsens
```

The lossy observation must be specified before results are calculated. It may not be selected post hoc to manufacture collisions.

The assay should report independently:

```text
forward_terminal_state_count
observed_signature_count
forward_alias_count
observation_alias_count
exact_route_recovery_rate
```

## 8. Counterexample conditions

The candidate refinement must be revised or abandoned if any of the following survives a valid assay:

1. route order is recovered when distinct routes have already collapsed to the same complete terminal state and no intermediate/history measurement is admitted;
2. route order is recovered when the observation map assigns identical admitted signatures to distinct surviving terminal states and no other information enters the decoder;
3. the proposed forward/observation decomposition fails to predict which controlled condition aliases routes;
4. the mechanism requires route labels, timestamps, hidden intermediates, or authored candidate identity to leak into the observer;
5. changing only an irrelevant representation causes the claimed alias class to change without changing admitted information.

## 9. Important category boundaries

The words `dynamics`, `state`, `map`, `injective`, and `noncommuting` are mathematical/computational language here.

This refinement does not establish:

- quantum state or quantum process tomography;
- physical noncommutativity;
- indefinite causal order;
- non-Markovian quantum memory;
- information curvature;
- connection;
- geometric curvature;
- holonomy;
- Berry phase or Berry curvature;
- phasons;
- D3 physical geometry;
- a universal theorem that meaningful history always leaves terminal residue.

## 10. Pedagogue consequence if the discriminator passes

Even a passing discriminator yields only:

```text
parent:
ORDER_IS_PART_OF_PROCESS_STATE
= retained as hydrated review candidate

candidate refinement:
ROUTE_ORDER_IDENTIFIABILITY_REQUIRES_SEPARATING_DYNAMICS_AND_OBSERVATION
= INTERNALLY_SUPPORTED_REFINEMENT_CANDIDATE

pedagogue law status:
NOT_PROMOTED
```

Pedagogue's next move would remain adversarial:

```text
SEEK_EXTERNAL_OR_INDEPENDENT_COUNTEREXAMPLE_TO_REFINED_MECHANISM
```

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
