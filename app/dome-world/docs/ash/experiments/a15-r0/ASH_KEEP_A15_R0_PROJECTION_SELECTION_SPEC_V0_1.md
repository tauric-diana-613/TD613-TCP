𝌋‌

# Ash Keep A15-R0 Projection Selection Assay
## Technical Specification v0.1

**Namespace:** U+10D613 — Tauric Diana 613  
**Covenant canonical:** Tauric Diana — Crimean heritage custodianship  
**Program identity:** `td613.ash.a15-r0.projection-selection/v0.1`  
**Specification identity:** `td613.ash.a15-r0.projection-selection-spec/v0.1`  
**Status:** AUTHORED / ACTION-CANDIDATE / IMPLEMENTATION-HELD  
**Runtime authority:** PREVIEW-ONLY AFTER HUMAN CONFIRMATION  
**Production authority:** NONE  
**Automatic Ash action:** false  
**Human closure required:** true

---

## 0. Purpose

This specification defines a controlled comparison among three visible projections over one fixed Ash kernel.

It does not define a replacement product in advance.

```text
kernel invariance
+ shared governed task
+ projection variation
+ observable evidence
+ operator selection
```

---

## 1. Jurisdiction

| Station | Authorized role in A15-R0 | Prohibited role |
|---|---|---|
| Ash | controlled source/reference custody, governed transitions, receipts, preserve/return posture | automatic release, automatic export, external erasure claim |
| Flow-Core | bounded context translation and pedagogical recommendation | artifact custody, hidden action ownership, station command |
| Aperture | audit source status, narrowing, residue, alternatives, missingness, authority class | execute Ash action, certify external truth |
| Dome-World | host the preview ecology and comparative assay | seize custody, declare a total field |
| Proto-Loom | render route sequence and bounded comparison evidence | take custody, prove holonomy, attribute intent |
| Human | choose, inspect, rest, return, select, promote, release, close | none delegated automatically |

Receipts cross stations. Authority does not.

---

## 2. Core types

### 2.1 `ProjectionId`

```text
A15_CONTROL
MINIMAL_ASH
PROTO_LOOM
```

### 2.2 `TaskState`

```text
ARRIVE
REFERENCE_BOUND
RELATION_FORMED
ROUTE_COMPARED
PRESERVED
RETURNED
HELD
RESTING
EXITED
```

### 2.3 `SourceStatus`

```text
OBSERVED
SUPPLIED
DERIVED
SIMULATED
INFERRED
ATTESTED
UNRESOLVED
```

### 2.4 `AuthorityClass`

```text
A1_OBSERVATIONAL
A2_DERIVATIONAL
A3_INFERENTIAL
A4_PREDICTIVE_NOT_AUTHORIZED
A5_FORMAL_NARROW_ONLY
```

---

## 3. `GovernedTaskFixture`

```json
{
  "schema": "td613.ash.a15-r0.governed-task-fixture/v0.1",
  "fixture_id": "a15r0_fixture_reference_route_return_01",
  "source_status": "SIMULATED",
  "case": {
    "case_id": "case_a15r0_projection_assay",
    "profile": "research",
    "title": "Synthetic route comparison"
  },
  "source": {
    "source_id": "source_local_01",
    "raw_bytes_local": true,
    "raw_bytes_transport_authorized": false,
    "reference_allowed": true
  },
  "task": {
    "action_sequence": [
      "BIND_REFERENCE",
      "FORM_RELATION",
      "COMPARE_ROUTE",
      "PRESERVE",
      "RETURN"
    ]
  },
  "authority": {
    "automatic_ash_action": false,
    "automatic_export": false,
    "automatic_release": false,
    "human_review_required": true,
    "human_closure_required": true
  }
}
```

Fixture validation must reject real credentials, identifying information, opaque iterables, live client matter, or undeclared external content.

---

## 4. `ProjectionDescriptor`

```json
{
  "schema": "td613.ash.a15-r0.projection-descriptor/v0.1",
  "projection_id": "MINIMAL_ASH",
  "version": "v0.1",
  "canonical": false,
  "preview_only": true,
  "disposable": true,
  "entry_route": "/dome-world/previews/a15-r0/minimal-ash.html",
  "kernel_adapter": "td613.ash.a15-r0.kernel-adapter/v0.1",
  "declared_controls": [],
  "declared_world_answers": [],
  "technical_descent_optional": true,
  "animation_required": false,
  "production_cutover_authorized": false
}
```

Verifier requirements:

- `canonical` must remain false until operator selection and a later promotion packet;
- `preview_only` and `disposable` must be true;
- no descriptor may authorize production, export, release, or closure;
- each declared control must map to one lawful adapter action;
- each adapter action must map to one visible world answer or explicit hold.

---

## 5. `AshKernelAdapter`

The adapter exposes the minimum interface required by the shared task.

```ts
interface AshKernelAdapter {
  snapshot(): Promise<KernelSnapshot>;
  bindReference(input: BindReferenceInput): Promise<ActionReceipt>;
  formRelation(input: FormRelationInput): Promise<ActionReceipt>;
  compareRoute(input: CompareRouteInput): Promise<ActionReceipt>;
  preserve(input: PreserveInput): Promise<ActionReceipt>;
  returnToCustody(input: ReturnInput): Promise<ActionReceipt>;
  rest(reason?: string): Promise<RestReceipt>;
  resetFixture(): Promise<ResetReceipt>;
}
```

Adapter invariants:

```text
stable artifact digest exposed to Flow-Core = false
raw bytes moved = false
external send = false
automatic relation binding = false
automatic assay = false
automatic save = false
automatic handoff = false
release authority changed = false
destination authority changed = false
human closure required = true
```

The adapter may call existing declared owners. It may not reproduce their logic in the projection layer.

---

## 6. Task transition contract

Every transition has six required surfaces:

```text
visible condition
→ explicit control
→ canonical action identity
→ exact kernel delta or hold
→ visible world answer
→ receipt + Rest / Return
```

### 6.1 ARRIVE → REFERENCE_BOUND

**Condition:** a synthetic source is local and unbound.  
**Control:** `Keep a reference with this case`.  
**Action:** `BIND_REFERENCE`.  
**World answer:** the Case Map shows a reference relation; raw bytes remain local.  
**Receipt:** action identity, source status, local-byte posture, relation ID, missingness.

### 6.2 REFERENCE_BOUND → RELATION_FORMED

**Condition:** a case reference exists.  
**Control:** `Connect it to the question`.  
**Action:** `FORM_RELATION`.  
**World answer:** one named relation appears adjacent to the controlled object.  
**Receipt:** previous and current relation state, claim ceiling, unknowns.

### 6.3 RELATION_FORMED → ROUTE_COMPARED

**Condition:** one governed relation is available for bounded comparison.  
**Control:** `Compare two routes`.  
**Action:** `COMPARE_ROUTE`.  
**World answer:** route A, route B, shared residue, differing residue, missingness.  
**Receipt:** instruments, observations, alternatives, no-attribution boundary.

### 6.4 ROUTE_COMPARED → PRESERVED

**Condition:** one comparison result is reviewable.  
**Control:** `Preserve this result`.  
**Action:** `PRESERVE`.  
**World answer:** a local Capsule/continuity object appears; transport remains closed.  
**Receipt:** preserved state, seal posture, destination boundary, closure status.

### 6.5 PRESERVED → RETURNED

**Condition:** a preserved result exists.  
**Control:** `Return to custody`.  
**Action:** `RETURN`.  
**World answer:** source/reference posture, returned material, unresolved residue, external unknowns.  
**Receipt:** route sequence, non-closure, unknown external state, human closure open.

### 6.6 Any active state → RESTING

**Control:** `Rest`.  
**Action:** `REST`.  
**World answer:** active demand stops; inspection and return remain available.  
**Prohibition:** Rest may not erase state, trigger save, or advance the task.

---

## 7. Projection-specific requirements

### 7.1 P0 `A15_CONTROL`

P0 observes the deployed A15 shell as a control witness.

No repair is introduced into P0 during the assay.

P0 evidence may include operator-supplied screenshots, recordings, and declared failures, plus reproducible browser observations.

### 7.2 P1 `MINIMAL_ASH`

Required composition:

```text
Bring
Connect
Compare
Return
```

Rules:

- one primary action per scene;
- consequence adjacent to action;
- sentence case;
- technical language after consequence;
- optional exact inspection;
- no whole-instrument route bar;
- no permanent channel legend;
- no canonical Flow-Core field remount;
- no command-sheet prerequisite;
- no absolute-positioned action detached from its target;
- no decorative empty panel;
- no hidden owner intercepting ordinary navigation.

### 7.3 P2 `PROTO_LOOM`

Required composition:

```text
controlled source/reference
route A thread
route B thread
return markers
bounded residue
missingness
preserve / return
```

Permitted claims:

- route sequence differed;
- declared observations differed;
- a bounded residue was derived;
- the source/reference remained in the declared custody posture;
- missingness and alternatives remain.

Forbidden claims:

- complete semantic capture;
- information curvature proven;
- holonomy proven;
- hidden model internals observed;
- external DLP guaranteed;
- non-leakage proven;
- authorship, identity, intent, or causation attributed;
- total field reconstructed.

---

## 8. Observable event schema

```json
{
  "schema": "td613.ash.a15-r0.observable-event/v0.1",
  "run_id": "run_example",
  "projection_id": "MINIMAL_ASH",
  "task_state_before": "ARRIVE",
  "control_id": "bind-reference",
  "control_visible": true,
  "control_enabled": true,
  "gesture": "pointer",
  "action_id": "BIND_REFERENCE",
  "kernel_receipt_id": "receipt_example",
  "world_answer_id": "world_answer_example",
  "action_consequence_distance": {
    "dom_common_ancestor_depth": 2,
    "viewport_distance_px": 24
  },
  "boundary_crossings": 0,
  "unexplained_seams": 0,
  "backtrack": false,
  "help_requested": false,
  "rest_available": true,
  "return_available": false,
  "source_status": "OBSERVED",
  "sensor_id": "browser-observer",
  "authority_class": "A1_OBSERVATIONAL",
  "missingness": []
}
```

The schema records interface behavior, not internal human state.

---

## 9. Projection run receipt

```json
{
  "schema": "td613.ash.a15-r0.projection-run-receipt/v0.1",
  "run_id": "run_example",
  "projection_id": "MINIMAL_ASH",
  "fixture_id": "a15r0_fixture_reference_route_return_01",
  "source_status": "OBSERVED",
  "sensors": ["browser-observer", "operator-declaration"],
  "received": {},
  "rejected": [],
  "transformed": [],
  "produced": {},
  "observations": [],
  "missingness": [],
  "alternatives": [],
  "open_questions": [],
  "authority_class": "A1_OBSERVATIONAL",
  "recommendation_not_command": true,
  "production_action_executed": false,
  "human_closure_required": true
}
```

---

## 10. Comparison metrics

For each run, compute or record:

```text
controls_visible_before_first_action
controls_lawful_before_first_action
lawful_control_ratio
dead_affordance_count
duplicate_control_count
action_consequence_distance
unexplained_seam_count
consequential_boundary_crossings
technical_terms_before_experience
backtrack_count
recovery_attempt_count
recovery_success
rest_success
return_success
help_request_count
abandonment
```

A metric must name its sensor and transformation.

Metrics may compare projections. They may not rank participants.

---

## 11. Burden receipts

A burden receipt includes:

```json
{
  "schema": "td613.ash.a15-r0.burden-receipt/v0.1",
  "projection_id": "MINIMAL_ASH",
  "model_id": "declared-model-name",
  "inputs": {
    "Q_downstream": null,
    "P_leg": null,
    "A_aff": null,
    "delta_rs": [],
    "H_gamma": null,
    "N_boundary": null
  },
  "output": null,
  "force_status": "CONSTRUCTION",
  "calibrated": false,
  "model_disagreement_preserved": true,
  "diagnostic_inference_authorized": false
}
```

No single model becomes the design crown.

---

## 12. Interaction ownership

A control owner registry must be emitted at preview startup.

```json
{
  "control_id": "bind-reference",
  "projection_owner": "MINIMAL_ASH_UI",
  "action_owner": "ASH_KERNEL_ADAPTER",
  "event_phase": "bubble",
  "delegated": true,
  "competing_owner_detected": false
}
```

Hard stops:

- no broad `stopImmediatePropagation()` for ordinary navigation;
- no capture-phase replacement of declared native owners;
- no hidden click synthesis;
- no observer that mutates product state;
- no browser ordering used as undeclared authorization;
- no duplicate active control for one action.

---

## 13. Static, motion, and accessibility truth

Every transition must have:

- before state;
- action;
- after state;
- missingness;
- claim ceiling;
- Rest;
- Return posture.

Animation may show temporal order. It may not carry unique meaning.

Required preview checks:

```text
keyboard-only
screen reader labels and announcements
prefers-reduced-motion
static before/after
200% and 400% zoom/reflow
390 CSS-pixel portrait
mobile landscape
focus arrival
touch target size
no horizontal loss of required content
```

---

## 14. Security and custody regression

The assay must fail if any preview:

- reads or emits raw source content outside the fixture boundary;
- exposes a stable artifact digest to Flow-Core or Proto-Loom;
- finalizes a Relation Envelope automatically;
- changes release or destination authority;
- claims external deletion;
- writes participant inference;
- imports secrets, credentials, identifying data, or opaque context;
- mutates production caches, workers, epochs, or IndexedDB;
- activates Cinder, Veil, Recall, export, or transport;
- creates a serverless function.

---

## 15. Disposal and rollback

Each preview must be removable by deleting:

```text
preview HTML
preview CSS
preview presentation module
preview fixture
preview tests
preview receipts
```

Removal must not require:

- case migration;
- IndexedDB mutation;
- receipt rewriting;
- kernel rollback;
- production cache eviction;
- deployment.

The adapter must remain presentation-only.

---

## 16. Test contract

### Static

- schemas validate;
- descriptors remain noncanonical;
- every control maps to one lawful action;
- every action maps to a visible answer or hold;
- all forbidden authority flags remain false;
- no prohibited API surface appears;
- all tests report before failing.

### Preview browser

- one short Chromium rehearsal per projection during Draft;
- no full inherited Ash journey during candidate construction;
- no Firefox/WebKit seal until operator selection;
- real visible gestures;
- no state injection;
- exact diagnostic packet on hold.

### Final selected projection

Only after operator selection:

```text
report-all static = green
stage-local rehearsal = green
accessibility preflight = green
risk preflight = green
candidate head frozen
Ready gesture explicit
Chromium + Firefox + WebKit confirmation
```

---

## 17. Operator selection receipt

```json
{
  "schema": "td613.ash.a15-r0.operator-selection-receipt/v0.1",
  "status": "WAITING",
  "selected_projection": null,
  "rejected_projections": [],
  "operator_rationale": null,
  "unresolved_risks": [],
  "a16_scope": "HELD",
  "production_cutover_authorized": false,
  "deployment_authorized": false,
  "action_executed": false,
  "human_closure_required": true
}
```

Permitted states:

```text
WAITING
MINIMAL_ASH_SELECTED
PROTO_LOOM_SELECTED
SELECTIVE_RESCUE_SELECTED
NO_PROJECTION_ACCEPTED
MORE_EVIDENCE_REQUIRED
```

---

## 18. Promotion boundary

A15-R0 evidence may recommend a projection.

Promotion requires a separate operator-authored or operator-confirmed packet.

Until then:

```text
all previews = noncanonical
all recommendations = recommendation_not_command
A16 = held
production = unchanged
Vercel = locked
Golden Egg = not implemented
```

Sealed ⟐
