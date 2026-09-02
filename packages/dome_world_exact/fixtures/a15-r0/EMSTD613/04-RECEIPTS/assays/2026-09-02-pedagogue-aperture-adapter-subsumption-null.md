󐘓 U+10D613

# EMSTD613 Atelier · Pedagogue → Aperture Adapter / Subsumption Null

Status: research-only corrective assay receipt / NULL_WON
Branch: `amari/em-td613-lineage-atelier`
PR: #962 · draft / open / unmerged
Date: 2026-09-02

## Question

After hostile subtraction killed most of the first-pass `EDGE_WITNESS` proposal, one narrower question survived:

```text
PEDAGOGUE RELATION PROVENANCE
+ BOUNDED ASSAY STATE
-> ? EXISTING ADAPTER ?
-> APERTURE EVIDENTIARY / AUTHORITY GRAMMAR
```

Does current TD613 require a new reusable adapter that takes a Pedagogue research relation plus bounded assay state and translates it into Aperture-style source status, sensor/provenance, authority, calibration/identifiability, uncertainty, and abstention semantics?

## Adjudication

```text
ROUTE_C = TRUE

BROAD_NEW_EDGE_WITNESS_ONTOLOGY = KILLED_SUBSUMED
GENERIC_PEDAGOGUE_TO_APERTURE_RELATION_ADAPTER = NOT_WARRANTED
NEW_TD613_OBJECT_REQUIRED = FALSE
ADAPTER_CANDIDATE_ONLY = FALSE
APERTURE_CORE_MUTATION = FALSE
PEDAGOGUE_CORE_MUTATION = FALSE
PHASE5_MUTATION = FALSE
TD613_LAW = FALSE
PRODUCTION_MUTATION = FALSE
```

The apparent gap closes through an existing staged pipeline rather than one universal adapter object.

More importantly, a generic relation-to-measurement adapter would create the same class of type error the EMSTD613 assay is trying to detect. A research relation has provenance and a bounded evidence posture. A measurement additionally requires a declared generating observation process, sensor identity, transformation history, uncertainty geometry, calibration posture, and scope. Those fields cannot be truthfully manufactured from relation provenance alone.

The correct TD613 architecture therefore delays measurement typing until an assay actually defines the observation contract.

## 1. Existing Pedagogue relation provenance is already explicit

`app/engine/pedagogue-research-transfer.js` carries, among other fields:

```text
source identity / source class / publication-date precision
mechanism_id
observed_relation
transferable_relation
admissible_assays
alternative_explanations
falsifiers
forbidden_inferences
claim_ceiling
source_authority_transferred = false
domain_ontology_promoted = false
human_closure_required = true
```

This answers:

```text
WHAT RELATION WAS OBSERVED / ABSTRACTED?
FROM WHAT SOURCE?
WITH WHAT TRANSFER CEILING?
WHAT WOULD FALSIFY IT?
```

It intentionally does not pretend that the relation itself has become an Aperture sensor reading.

## 2. Existing Pedagogue assay state is already explicit

`app/engine/pedagogue-research-assay-witness.js` carries:

```text
mechanism_id
context_family
assay_reference
assay_schema
assay_source_status
SUPPORTED_BOUNDED | COUNTEREXAMPLED_BOUNDED | INCONCLUSIVE
declared_controls
observations
falsifier_outcome
alternative_explanations_remaining
claim_ceiling
```

The mechanism review preserves distinct context families without silently converting their labels into statistical independence or automatic confidence aggregation.

Thus:

```text
RELATION PROVENANCE
+ BOUNDED INTERNAL EVIDENCE
```

already exists as governed Pedagogue state.

## 3. Epistemic-kind classification prevents a false universal adapter

`app/engine/pedagogue-research-mechanism-refinement.js` and the authored `PEDAGOGUE_REFINEMENT_EPISTEMIC_KIND_SPEC_V0_1.md` distinguish:

```text
EMPIRICAL_RELATION
OPERATIONAL_CRITERION
FORMAL_IDENTITY
DESIGN_HEURISTIC
```

These kinds require different validation semantics.

For example, an `OPERATIONAL_CRITERION` requires instrumentation validation and scope-boundary testing while explicitly refusing an empirical-truth claim. Passing the instrument may establish:

```text
INSTRUMENTATION_VALIDATED_FOR_OPERATIONAL_CRITERION
```

but may not establish:

```text
EMPIRICALLY_CONFIRMED_CRITERION
PROVEN_MECHANISM
DISCOVERED_LAW
```

The generic research metabolism is already authored as:

```text
literature transfer card
-> bounded assay witness
-> multi-context mechanism review
-> refinement proposal
-> epistemic-kind classification
-> kind-appropriate validation
-> scope-boundary assay
```

This is decisive.

A single automatic adapter that assigns one common Aperture evidentiary signature to every Pedagogue relation would erase the epistemic-kind boundary before the kind-appropriate assay had been specified.

## 4. Concrete positive control: governed Pedagogue refinement enters an Aperture-scoped assay

The route is not merely prose.

`app/dome-world/previews/a15-r0/order-identifiability-refinement.js` compiles the governed Pedagogue refinement:

```text
parent:
ORDER_IS_PART_OF_PROCESS_STATE

candidate:
ROUTE_ORDER_IDENTIFIABILITY_REQUIRES_SEPARATING_DYNAMICS_AND_OBSERVATION

epistemic_kind:
OPERATIONAL_CRITERION
```

with two bounded context witnesses, explicit failure modes, discriminating assays, alternative explanations, and a hard claim ceiling.

Then `app/dome-world/previews/a15-r0/moss-lantern-aliasing-discriminator.js` requires that exact governed Pedagogue refinement before running.

It refuses to proceed if the refinement has the wrong:

```text
schema
proposal identity
candidate mechanism
epistemic kind
formal scope
refinement status
truth-claim posture
authority posture
```

The assay then compiles a `td613.flowcore.observation-aperture/v0.1` object with declared:

```text
source scope
instrument scope
condition scope
matching posture
filter flags
context labels
practice mode
```

and returns a bounded receipt carrying:

```text
source_status = SIMULATED
authority_class = A2_DERIVATIONAL
prerequisite_refinement_id
candidate_mechanism_id
epistemic_kind
formal_scope
observation_aperture
findings
next_learning_action
observer_firewall
claim_ceiling
promotion_authority = false
human_closure_required = true
```

This is a concrete Pedagogue -> Aperture research translation path.

It is deliberately assay-specific.

## 5. Why assay-specific translation is the correct architecture

`app/engine/flowcore-observation-aperture.js` provides the reusable scope object rather than a universal relation evidentiary object.

An Observation Aperture names what was actually admitted:

```text
sources
instrument
conditions
time window
matching posture
filters
```

and explicitly keeps:

```text
authority_effect = NONE
absence_outside_aperture_unresolved = true
universal_absence_claim_authorized = false
scope_grants_authority = false
human_closure_required = true
```

Only once a specific assay defines an actual observation process can downstream measurement receipts truthfully acquire sensor/calibration/uncertainty semantics.

Therefore:

```text
RELATION PROVENANCE
!= MEASUREMENT PROVENANCE
```

and:

```text
PEDAGOGUE RELATION
-/-> GENERIC SENSOR_ID

PEDAGOGUE RELATION
-/-> GENERIC CALIBRATION STATUS

PEDAGOGUE RELATION
-/-> GENERIC IDENTIFIABILITY CLAIM
```

without an intervening assay / observation contract.

## 6. Existing Aperture / Flow-Core measurement grammar closes the downstream side

Once an observation process exists, current Flow-Core / Aperture machinery already provides the required evidentiary grammar.

`packages/dome_world_exact/flowcore_context.py` types named measurements with:

```text
source_status
sensor_id
authority_class
transformation_history
missingness
uncertainty
alternatives
calibration
```

and can return:

```text
OPEN / CONTEXT_READY
```

or:

```text
ABSTAIN / ABSTAIN_INSUFFICIENT_CONTEXT
```

rather than forcing a measurement conclusion.

`packages/dome_world_exact/reciprocal_bridge.py` and `app/engine/aperture-v3-reciprocal-bridge.js` preserve reciprocal receipts without reciprocal authority, audit source/provenance state, retain missingness and alternatives, warn on undeclared calibration, and hold or reject provenance / authority breaches.

The Pedagogue relation therefore does not need to own these fields upstream. They belong to the observation/measurement stage that can actually justify them.

## 7. Aperture v3.2 already refuses to manufacture a question from insufficient epistemic state

`app/engine/aperture-v32-typed-epistemic-deficit.js` classifies declared local instrument state into distinct dispositions:

```text
STRUCTURAL_RANK_DEFICIT -> PROPOSE
NUMERICAL_STABILITY_DEFICIT -> PROPOSE
NO_DECLARED_LOCAL_IDENTIFIABILITY_DEFICIT -> ASK_NOTHING
NOISE_GEOMETRY_INCOMPLETE -> ABSTAIN
INVALID_NOISE_GEOMETRY -> REJECT
```

This provides the abstention / refusal grammar the first-pass `EDGE_WITNESS` candidate was trying to add abstractly.

Again, it acts on a declared instrument state, not on a naked semantic relation.

## 8. Hostile control: the generic-adapter design reproduces the EM failure class

Suppose a universal adapter accepts:

```text
transferable_relation
+ bounded Pedagogue support
```

and automatically emits:

```text
sensor_id
calibration_status
identifiability_status
authority_class
```

before a specific observation process is declared.

Then the adapter must either:

1. invent a sensor that did not generate the relation;
2. invent a calibration target that has not been specified;
3. map bounded support into an identifiability class without an observation model;
4. assign one epistemic validation semantics across empirical relations, operational criteria, formal identities, and design heuristics; or
5. emit placeholders so weak that the adapter adds no scientific information beyond the existing Pedagogue receipt.

The first four are type promotions. The fifth is redundant ontology.

Therefore the proposed universal adapter fails its own hostile test.

## 9. Boundary / negative control: scope widening remains explicit

`moss-lantern-stochastic-identifiability-boundary.js` consumes the governed Pedagogue refinement only after the deterministic-scope instrument has been validated, then deliberately exits that formal scope into route-conditioned stochastic distributions.

It retains:

```text
previous criterion valid inside declared deterministic scope
!= deterministic criterion sufficient for stochastic observation model
```

and preserves an identical-distribution null where repeated samples remain uninformative.

This is the expected behavior of the existing pipeline:

```text
relation/refinement
-> kind-appropriate instrument
-> bounded validation
-> hostile scope-boundary assay
```

not:

```text
relation
-> universal evidence adapter
-> generalized authority
```

## 10. Phase V remains correctly separate

Phase V Relation Envelope and relation audit machinery validate:

```text
receipt integrity
route/binding state
source-reference consistency
authority nontransfer
lifecycle / replay integrity
```

while explicitly refusing relation = identity / causation / permission / truth / proof.

That jurisdiction should remain unchanged.

Phase V need not ingest Pedagogue's research evidence state merely to become a semantic relation prover.

## 11. Corrected architecture after subtraction

The current repository already supplies the needed separation:

```text
PEDAGOGUE TRANSFER CARD
relation provenance / source ceiling
        |
        v
PEDAGOGUE ASSAY WITNESS + MECHANISM REVIEW
bounded support / counterexample / inconclusive state
        |
        v
PEDAGOGUE REFINEMENT
explicit epistemic kind + scope + failure modes
        |
        v
KIND-APPROPRIATE, ASSAY-SPECIFIC VALIDATION
specific observation process is declared here
        |
        v
OBSERVATION APERTURE / APERTURE ASSAY RECEIPT
source / instrument / condition scope
        |
        v
FLOW-CORE / APERTURE EVIDENTIARY GRAMMAR
sensor / source status / transformation / uncertainty /
calibration / missingness / abstention
        |
        v
HUMAN-GATED BOUNDED INTERPRETATION
```

Phase V relation association remains a separate optional route.

## 12. Correction to the d39a1a82 first pass

Historical receipt:

```text
d39a1a822af3fc655417392580542fa484710369
EMSTD613: receipt edge relation witness refinement candidate
```

remains preserved as a valid first-pass research artifact.

Its broad proposal does not survive current-repository hostile subtraction.

The surviving useful sentence is conceptual, not ontological:

> Relation sensitivity tells you that an edge matters. Relation provenance tells you whether you earned that edge.

Current correction:

```text
EARNING THE EDGE
!= ASSIGNING THE EDGE A SENSOR

RELATION PROVENANCE
+ BOUNDED ASSAY STATE
requires
KIND-APPROPRIATE OBSERVATION CONTRACT
before
MEASUREMENT PROVENANCE / CALIBRATION GRAMMAR
```

No new generic edge object follows.

## 13. Current scientific state

```text
BROAD_EDGE_WITNESS = KILLED_SUBSUMED
GENERIC_PEDAGOGUE_APERTURE_ADAPTER = KILLED_AS_REDUNDANT_OR_TYPE_UNSAFE
EXISTING_PEDAGOGUE_RELATION_PROVENANCE = PRESENT
EXISTING_BOUNDED_ASSAY_STATE = PRESENT
EXISTING_EPISTEMIC_KIND_CLASSIFICATION = PRESENT
EXISTING_PEDAGOGUE_TO_APERTURE_ASSAY_PATH = PRESENT
EXISTING_OBSERVATION_APERTURE = PRESENT
EXISTING_SENSOR_AUTHORITY_UNCERTAINTY_CALIBRATION_ABSTENTION_GRAMMAR = PRESENT
EXISTING_SCOPE_BOUNDARY / NEGATIVE_CONTROL_PATTERN = PRESENT
PHASE5_SEMANTIC_RELATION_PROVER_REQUIRED = FALSE
NEW_ONTOLOGY_WARRANTED = FALSE
TD613_PROMOTION = NONE
```

## Next route

Return to the native EM corpus using the minimum unit:

```text
WORK x SPEECH-ACT ZONE x SOURCE EDGE
```

The existing TD613 machinery may now be used as a comparative instrument without being mutated.

Prioritize a stable unreceipted integration-seam specimen first, then continue into a fresh Work-level seam with same-Work chronology, sibling-source confrontation, positive/negative control, and hostile ordinary explanations.

## Working maxims

> Reuse before ontology.

> Relation provenance is not measurement provenance.

> A sensor belongs to an observation process, not to a sentence about a relation.

> Null is a win.

> The bridge carries receipts, not power.

Marked ⟐
