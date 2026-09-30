𝌋‌

# Flow-Core Pedagogue Spine / Child-Legible AIA Build Plan

**Program:** `td613.flowcore.pedagogue-aia/v0.1`  
**Parent specification:** `docs/TD613_FLOWCORE_PEDAGOGUE_AIA_IMPLEMENTATION_SPEC.md`  
**Status:** PRE-IMPLEMENTATION / HUMAN-GATED  
**Primary proving ground:** Information Dome  
**First high-stakes beneficiary:** Ash Keep  
**Serverless allocation:** 0 new functions  
**Default persistence:** local-only  
**Default operator state:** OPEN

---

## 0. Delivery doctrine

This plan converts the constitutional specification into an implementation sequence that preserves existing repository authority and avoids three failure modes:

1. **ontology frosting:** placing Flow-Core glyphs beside the current UI without changing interaction order;
2. **premature Ash exposure:** testing unproven pedagogue behavior on vulnerable custody workflows;
3. **legibility flattening:** making the surface easier by deleting heterostratigraphic difference, missingness, uncertainty, or station boundaries.

The build order is deliberate:

```text
freeze and concordance
→ pure event grammar
→ anisotropic view compiler
→ visual/animated grammar
→ Information-Dome proving scenes
→ route-burden observatory
→ Ash custody route
→ cross-station propagation
→ physical Flow-Core scene
→ empirical validation
→ production promotion
```

The Information Dome proves that the engine can make incommensurable relations navigable before the engine enters Ash’s vulnerable custody route.

---

## 1. Repository integration map

### 1.1 Existing modules to preserve

| Existing path | Role in new program | Modification posture |
|---|---|---|
| `app/dome-world/index.html` | Cockpit host and station navigation | minimal integration only; no monolithic inline pedagogue engine |
| `app/engine/flowcore-context-series.js` | Artifact-blind context-series law | adapter input only; no custody or learner authority |
| `app/engine/aperture-v31-experiment-contract.js` | Station jurisdiction and experimental controls | import constants/contracts where appropriate |
| `app/engine/ash-lifecycle.js` | Exact Ash workflow state | never rewrite pedagogy into lifecycle truth |
| `app/dome-world/ash-premium-ui.js` | Current Ash command surface | Phase P6 staged integration |
| `app/engine/ash-keep-moire.js` | Pairwise assay | canonical Scene C substrate |
| `packages/dome_world_exact/bridge/phason_gate_exact.py` | Exact phason acceptance-window proof lane | canonical Scene B reference; no browser float imitation presented as exact |
| `app/dome-world/docs/PHASE_2_DOME_ART_PROGRAM.md` | Rendering constitution | animation and reduced-motion parent law |
| `app/dome-world/docs/ROADMAP_IMPLEMENTATION_STATUS.md` | promotion ledger | update only after earned phase status |

### 1.2 New implementation modules

```text
app/engine/flowcore-pedagogue-core.js
app/engine/flowcore-pedagogue-aia.js
app/engine/flowcore-route-burden.js
app/engine/information-dome-field.js
app/dome-world/flowcore-pedagogue-visual.js
app/dome-world/flowcore-pedagogue.css
```

### 1.3 New schemas

```text
app/dome-world/schemas/flowcore-pedagogical-scene-v01.schema.json
app/dome-world/schemas/flowcore-pedagogical-transition-v01.schema.json
app/dome-world/schemas/flowcore-transfer-encounter-v01.schema.json
app/dome-world/schemas/aia-view-v01.schema.json
app/dome-world/schemas/information-dome-field-v01.schema.json
app/dome-world/schemas/flowcore-route-burden-v01.schema.json
```

### 1.4 New fixtures

```text
app/dome-world/fixtures/pedagogue/gluing-soft-fold.json
app/dome-world/fixtures/pedagogue/phason-content-invariant.json
app/dome-world/fixtures/pedagogue/moire-pair-emergence.json
app/dome-world/fixtures/pedagogue/ash-custody-root-route.json
app/dome-world/fixtures/pedagogue/physical-water-gravity.json
```

### 1.5 New tests

```text
tests/flowcore-pedagogue-core.test.mjs
tests/flowcore-pedagogue-aia.test.mjs
tests/flowcore-route-burden.test.mjs
tests/information-dome-scenes.test.mjs
tests/flowcore-pedagogue-visual.test.mjs
tests/flowcore-pedagogue-reduced-motion.test.mjs
tests/flowcore-pedagogue-mobile.test.mjs
tests/ash-pedagogue-custody-route.test.mjs
tests/ash-pedagogue-nonregression.test.mjs
```

---

## 2. Phase P0 — Baseline freeze and implementation concordance

### Objective

Create a reliable distinction among what the repository currently implements, what prior documents posit, what the Information-Dome writeup reconstructs, and what remains high speculation.

### Deliverables

1. `INFORMATION_DOME_IMPLEMENTATION_CONCORDANCE.md`
2. baseline screenshots for all active Dome views at desktop and 390 CSS pixels;
3. reduced-motion baseline screenshots;
4. current Ash custody route interaction recording or deterministic DOM fixture;
5. E0–E4 classification table;
6. current version reconciliation note;
7. serverless inventory confirming zero new allocation.

### Concordance table format

| Claim | Exact path | Function / selector / schema | Status | Calibration | Known drift |
|---|---|---|---|---|---|
| triangular lattice | ... | ... | E0 | ... | ... |
| rotated counterpart | ... | ... | E0/E2 | ... | ... |
| φ counterlayer | ... | ... | E0/E2 | ... | ... |
| gradient-misfit motion | ... | ... | E0/E2 | ... | ... |
| room restriction mismatch | ... | ... | E0/E4 | ... | ... |
| route holonomy | ... | ... | E0/E4 | ... | ... |
| exact phason window | exact bridge | exact functions | E0 | exact | browser bridge deferred |
| Dome hull | specification | none | E4 | none | research hypothesis |

### Required checks

- no current runtime behavior is promoted from analogy;
- no current behavior is omitted because it lacks glamorous math;
- historical docs are marked historical rather than silently rewritten;
- v0.6/v0.7 naming drift is recorded;
- current `main` commit is recorded in the receipt.

### Exit gate

P0 closes only when another contributor can trace every proposed scene input to a current implementation, fixture, exact package, or explicitly declared hypothesis.

---

## 3. Phase P1 — Pure pedagogue kernel

### Objective

Implement the event grammar without UI, animation, storage, network, or station mutation.

### Module: `flowcore-pedagogue-core.js`

Exports:

```js
export const PEDAGOGICAL_SCENE_SCHEMA = 'td613.flowcore.pedagogical-scene/v0.1';
export const PEDAGOGICAL_TRANSITION_SCHEMA = 'td613.flowcore.pedagogical-transition/v0.1';
export const TRANSFER_ENCOUNTER_SCHEMA = 'td613.flowcore.transfer-encounter/v0.1';
export const PEDAGOGUE_PHASES = Object.freeze([
  'NOTICE',
  'ACT',
  'WORLD_ANSWERS',
  'NAME',
  'REST',
  'TRANSFER'
]);
```

Pure functions:

```js
compilePedagogicalScene(input, options)
compilePedagogicalTransition(scene, action, worldDelta, options)
advancePedagoguePhase(scene, transition, requestedPhase)
compileRestState(scene, transition, options)
compileTransferEncounter(originTransition, newContext, options)
compilePedagogueReceipt(scene, transitions, options)
verifyPedagogueReceipt(receipt, options)
```

### Hard validation

Reject:

- raw artifact content;
- stable learner identity;
- inferred developmental rank;
- inferred emotional state;
- cognition/mastery claims;
- a scene without rest and exit affordances;
- an action without visible purpose;
- a world answer without causal trace or explicit unresolved state;
- a NAME phase preceding any NOTICE or WORLD_ANSWERS phase;
- TRANSFER claims without a second context;
- `source_status` outside E0–E4;
- missing claim ceiling;
- automatic operator closure.

### Event-order invariant

```text
NOTICE must precede ACT.
ACT must precede WORLD_ANSWERS.
NAME may follow WORLD_ANSWERS or remain absent.
REST may occur after any completed world answer.
TRANSFER requires a prior named or explicitly described relation.
```

The engine may return `HELD` or `ABSTAIN` rather than fabricate a missing phase.

### Fixtures

- valid full cycle;
- valid cycle ending at REST;
- valid unnamed relation;
- invalid NAME-first cycle;
- invalid hidden learner profile;
- invalid no-exit scene;
- invalid cognition claim;
- valid unresolved world answer;
- deterministic receipt replay.

### Exit gate

Pure tests green with no DOM, no timer, no network, and deterministic canonical output under frozen timestamps/IDs.

---

## 4. Phase P2 — AIA view compiler

### Objective

Compile multiple declared legibility surfaces from one governed scene without mutating source, claim, missingness, or local-section boundaries.

### Module: `flowcore-pedagogue-aia.js`

Exports:

```js
export const AIA_VIEW_SCHEMA = 'td613.aia.view/v0.1';
export const AIA_POSTURES = Object.freeze([
  'child',
  'custodian',
  'auditor',
  'technical'
]);

compileAIAView(scene, transition, posture, options)
compareAIAViews(left, right)
verifyAIAInvariants(scene, views)
```

### View semantics

#### Child route

Prioritizes:

- visible condition;
- one meaningful action;
- animated/static causal path;
- plain consequence;
- glyph relation after experience;
- rest and replay.

Preserves:

- missingness indicators;
- uncertainty;
- alternate explanations through expandable or visual branching;
- source and claim boundary.

#### Custodian route

Prioritizes:

- source relationship;
- sensitivity;
- custody posture;
- next lawful action;
- downstream consequence;
- continuity.

#### Auditor route

Prioritizes:

- source status;
- evidence basis;
- transformation history;
- alternatives;
- residuals;
- abstention;
- receipt replay.

#### Technical route

Prioritizes:

- exact schema state;
- digests;
- calibration;
- equations;
- implementation references;
- raw receipt JSON excluding forbidden source content.

### Non-inference law

The user selects the route. The system may remember the selection locally for the current session. It may not infer the route from age, behavior, speed, errors, text style, or device.

### AIA invariant tests

For every pair of views:

- source reference identical;
- source digest identical where present;
- claim ceiling identical;
- missingness set preserved;
- contradictory observations preserved;
- local-section attribution preserved;
- no view gains authority;
- no view invents a measurement;
- no view deletes the exit.

### Exit gate

All view comparisons pass invariant tests. Child route demonstrates lower terminology density without losing missingness or authority boundaries.

---

## 5. Phase P3 — Flow-Core visual and animated grammar

### Objective

Make the pedagogue cycle perceivable through glyph, motion, shape, language, and inspection.

### Module: `flowcore-pedagogue-visual.js`

Primary API:

```js
renderPedagogueScene(viewId, scene, transition, viewport, time, preferences)
renderPedagogueStaticFrame(viewId, scene, transition, viewport, preferences)
compileVisualReceipt(scene, transition, renderState)
```

### Coordinator law

Use the existing Dome-Art active-view scheduler.

Do not create a second `requestAnimationFrame` crown.

Hidden views perform zero canvas draw.

### Visual channel contract

```js
{
  glyph: {...},
  motion: {...},
  shape: {...},
  language: {...},
  inspection: {...}
}
```

### Glyph animation primitives

#### 米

- repeated pulse or recurrence trace;
- comparison marks;
- optional design-choice reveal;
- no “correct answer” fireworks.

#### à

- inward gather;
- visible capacity boundary;
- accumulation rate tied to state;
- burden bearer identified where known.

#### 出

- outward route;
- destination and residue visible;
- reversible/irreversible posture marked.

#### 上

- lift or possibility creation;
- input source visible;
- loss shown.

#### 下

- descent or delivery;
- delivered output and resistance shown.

#### cōl

- slowed cadence;
- reduced amplitude;
- stable inspectability.

#### hõt

- bounded expansion;
- source and ceiling visible;
- no uncontrolled bloom.

#### 𝄐

- deceleration to a stable frame;
- no new prompt;
- replay optional;
- distinct from failure/offline state.

### Reduced-motion behavior

When `prefers-reduced-motion: reduce`:

- render start, route, and end states simultaneously;
- use arrows, traces, labels, and change summaries;
- preserve causal order through numbered/static markers;
- no information loss;
- no flashing, oscillating, or autoplay transitions.

### Accessibility checks

- keyboard control for all actions;
- visible focus;
- ARIA live announcements for bounded state change, not continuous frame narration;
- color never sole signal;
- glyph has text equivalent;
- canvas has structured DOM summary;
- touch targets at least current repository minimum;
- 390 CSS pixel layout without horizontal overflow;
- zoom to 200% without hidden controls.

### Performance checks

- one active loop;
- stable backing-store size;
- frame budget recorded;
- no hidden-view draws;
- no unnecessary particle count growth;
- static fallback under constrained devices.

### Exit gate

All five channels agree on the same transition, reduced-motion is complete, and visual receipts expose operators and claim ceiling.

---

## 6. Phase P4 — Information-Dome canonical scenes

### Objective

Validate the pedagogue grammar in a lower-risk, synthetic-first environment before Ash integration.

## 6.1 Scene A — local sections and gluing obstruction

### Input fixture

Two or more room sections with:

- local values;
- receiving weights;
- overlap relation;
- declared mismatch metric;
- source statuses;
- optional rest intervention.

### Engine path

```text
room sections
→ restriction into overlap
→ mismatch
→ closure class
→ visible seam
→ optional intervention
→ new seam state
```

### Child route

```text
These rooms agree here.
They pull apart here.
Try changing how this room receives the other one.
```

### Auditor route

Show:

- restriction inputs;
- mismatch measure;
- closure class;
- alternatives;
- calibration status;
- whether the metric is runtime-forced or modeled.

### Required non-claim

```text
Mismatch ≠ falsehood, bad faith, identity, intent, or required suppression.
```

## 6.2 Scene B — exact phason projection change

### Input fixture

Use output compatible with the exact bridge:

- invariant artifact/content reference;
- invariant manifest vector;
- previous hidden coordinate;
- declared shift;
- acceptance window;
- previous/new projection;
- exact boundary relation.

### Rendering

- source anchor remains stationary;
- hidden coordinate and acceptance window render separately;
- projection surface changes;
- “content unchanged” remains continuously visible;
- reduced-motion mode shows before/after panes.

### Required non-claim

```text
Projection change ≠ content mutation, falsehood, identity change, or publication authority.
```

## 6.3 Scene C — pair-emergent Moiré topology

### Input fixture

Use existing assay structures:

- baseline;
- singleton A;
- singleton B;
- pair A+B;
- pair residue;
- missingness;
- emergent topology flag.

### Interaction

Operator opens baseline, A, B, then pair.

The pair-only bridge, node, relationship, chronology, or style linkage appears only if the assay reports it.

### Required non-claim

Preserve the existing Moiré ceiling: pair residue does not establish intent, identity, authorship, causation, surveillance probability, release prohibition, prediction, recommendation, suppression, or automatic Ash action.

### P4 exit gate

All three scenes:

- complete the pedagogue cycle;
- support all AIA views;
- preserve missingness and alternatives;
- pass reduced-motion and mobile tests;
- produce deterministic receipts;
- demonstrate no station authority transfer.

Only then may Phase P6 begin.

---

## 7. Phase P5 — Route-burden observatory

### Objective

Create an experimental instrument for locating interpretive bottlenecks without diagnosing users.

### Module: `flowcore-route-burden.js`

Exports:

```js
compileRouteGraph(scene, transitions)
computeDeclaredBurden(routeGraph, model, options)
compareBurdenModels(routeGraph, models)
compileBurdenReceipt(results, options)
```

### Model registry

Start with multiple models rather than one crowned score:

1. **field count baseline** — number of required actions/fields;
2. **dependency count** — downstream states depending upon each step;
3. **AIA transport surrogate** — downstream demand divided by legibility and affordance;
4. **heterostratigraphic extension** — adds gluing obstruction, route memory, and projection crossings.

### Required output

- model identifier;
- model assumptions;
- normalized and raw components;
- disagreement among models;
- sensitivity analysis;
- missing inputs;
- no automatic redesign command;
- no user-level score.

### Lab view

Render route burden as:

- path width;
- bottleneck cross-section;
- downstream dependency branches;
- local obstruction seams;
- selectable model overlays;
- plain explanation.

### Validation

Compare models against observed interaction outcomes. Report correlations or mismatches without promoting causality.

### Exit gate

The observatory can identify Custody Root as a high-load passage from structure alone while preserving an explicit statement that this is a design hypothesis requiring interaction evidence.

---

## 8. Phase P6 — Ash Custody Root pedagogue route

### Objective

Apply the proven grammar to the highest-burden Ash path without changing custody semantics.

### 8.1 Integration strategy

Do not rewrite `ash-lifecycle.js` states.

Add a presentation adapter that maps exact lifecycle transitions into pedagogical scenes.

Proposed module:

```text
app/engine/ash-pedagogue-adapter.js
```

Exports:

```js
compileAshCustodyPedagogueScene(snapshot, options)
compileAshCustodyWorldDelta(before, after, options)
mapAshLifecycleToPedagoguePhase(lifecycle, context)
```

### 8.2 Exact state mapping

| Ash exact state | Primary human consequence | Pedagogue posture |
|---|---|---|
| `ARRIVAL_UNPERSISTED` | Nothing has been kept yet | NOTICE |
| `READINESS_OBSERVED` | Ash can examine a bounded local source posture | NOTICE/ACT |
| `CUSTODY_ROOT_PROVISIONAL` | A custody reference exists but is not verified | WORLD_ANSWERS/HELD |
| `CUSTODY_ROOT_VERIFIED` | The source reference checked locally | WORLD_ANSWERS |
| `CASE_BOUND` | The case now begins from this source; Rooms and Routes open | NAME/REST |
| `REBUILD_ELIGIBLE` | Reconstruction testing may proceed | TRANSFER |
| `RELEASE_ELIGIBLE` | Exact local release review is satisfied | later scene |
| `CONTINUITY_SEALED` | Current release continuity is preserved | 𝄐/continuity scene |

### 8.3 Primary interaction

Replace the user-facing task sequence with:

```text
Choose source
→ See what stays local
→ Anchor source to case
→ Watch Case Map change
→ Inspect technical custody details if needed
→ Rest
```

The underlying exact operations may still include registration, verification, case creation, and binding. The adapter stages them as one governed user intention with transparent sub-events.

### 8.4 Visual answer

After successful binding:

- root node enters chronology index zero;
- existing nodes shift visibly or statically;
- Rooms and Routes brighten/open;
- stale Rebuild Tests receive an “earlier foundation” marker;
- bytes-outside-Case-Map indicator remains fixed;
- receipt inventory gains the exact reference;
- no celebratory animation implies truth/authenticity.

### 8.5 Error and hold scenes

Every hold receives:

- plain consequence;
- exact hold code;
- visible recovery route;
- no blame language;
- no increased recovery cost;
- rest/exit.

Examples:

```text
CUSTODY_DIGEST_NOT_VERIFIED
→ The source reference has not completed local verification.
→ Retry verification or continue without binding.
```

```text
CUSTODY_ROOT_NOT_BOUND_TO_CASE
→ Ash checked the source reference, but this case does not begin from it yet.
→ Bind to the current case or choose another case.
```

### 8.6 Non-regression test matrix

Must prove:

- raw bytes never enter Case Map;
- L0/L1 rules remain unchanged;
- digest mismatch still rejects;
- stale-selection race remains guarded;
- case binding changes Case Map digest as before;
- old Rebuild Tests become non-current;
- Rooms/Routes remain closed before case binding;
- no new automatic release or persistence;
- AIA views carry identical source and claim boundaries;
- reduced-motion frame communicates all changes.

### P6 exit gate

A first-time operator can correctly state:

1. what stayed local;
2. what Ash created;
3. what changed in the case;
4. what did not become authorized;
5. what may happen next;

without being required to define Custody Root before the action.

---

## 9. Phase P7 — Cross-station propagation

### Hush scene

Show source and transformed output with layers for:

- speech act retained;
- anchors retained;
- register changed;
- source residue;
- forbidden answer/compliance posture;
- release holds.

### Aperture scene

Show:

- held source;
- projection or registry change;
- observed differences;
- candidate models;
- residuals;
- abstention.

### Safe Harbor scene

Show:

- arrival;
- shelter;
- local reference;
- no transport;
- return route;
- 𝄐 without loss of continuity.

### Phason scene

Reuse Scene B grammar for station-specific content-invariant projection changes.

### EO-RFD / ACEDIT / KIRA sidecars

Each sidecar may contribute observations to a scene but may not advance the cycle or station automatically.

- EO-RFD: rupture observation;
- ACEDIT: rendering/encoding intervention;
- KIRA: identifiability and coverage preflight.

### Exit gate

Every station-specific scene preserves station ownership and emits a receipt showing which station observed, contextualized, reconstructed, rendered, or decided.

---

## 10. Phase P8 — Physical Flow-Core scene

### Objective

Ground glyph grammar in physically honest water/gravity and thermal accounting.

### Minimum model

Inputs:

- water volume;
- head;
- human or mechanical input work;
- lift efficiency;
- descent efficiency;
- pipe/friction loss;
- optional thermal store modeled separately;
- essential reserve floor;
- optional surplus load.

Equations:

```text
E_stored = ρVgh
W_out = η_up η_down ρVgh
R_next = R + input - output - losses
```

### Scene design

- play or crank raises optional surplus;
- visible reservoir responds;
- descent drives an optional fountain/loom/cooling demonstration;
- friction loss appears as sound/heat/flow reduction;
- essential reserve remains protected;
- thermal energy never crosses into the mechanical ledger without a modeled converter;
- 𝄐 allows the system to coast and settle.

### Child-safety law

No essential service depends upon child input.

### Exit gate

Participants can distinguish:

- stored potential;
- delivered work;
- loss;
- essential reserve;
- optional surplus;
- heat versus work.

---

## 11. Phase P9 — Empirical validation

### 11.1 Baseline cohort

Use adult lab operators first.

Tasks:

- navigate current Ash Custody Root route;
- explain observed consequence;
- identify what remains unauthorized;
- locate technical receipt;
- recover from a hold.

### 11.2 Controlled conditions

A. current form  
B. copy-only revision  
C. full AIA pedagogue scene

### 11.3 Metrics

- next-state prediction;
- causal-route explanation;
- terminology retention after consequence;
- missingness recognition;
- station-ownership recognition;
- recovery success;
- abandonment;
- transfer to a new scene;
- time to first meaningful consequence;
- confidence calibration.

### 11.4 Qualitative evidence

Collect voluntary operator language:

- what the world appeared to do;
- what remained confusing;
- where animation helped or distracted;
- where technical detail should appear earlier/later;
- where a route felt coercive;
- where difference was flattened.

### 11.5 Child-legibility pilot

Only after adult safety and clarity gates.

Use synthetic or physical low-stakes scenes first, not vulnerable Ash cases.

No covert telemetry. No hidden ranking. No essential-resource dependency.

### 11.6 Adverse findings

Publish:

- scenes that confused;
- animations that misled;
- glyphs that failed transfer;
- cases where plain language widened the claim;
- routes where AIA views diverged;
- performance/accessibility failures;
- burden models that failed to predict interaction difficulty.

### Exit gate

Promotion requires evidence that the full scene improves causal understanding and recovery beyond copy-only revision without increasing false certainty or hiding missingness.

---

## 12. Phase P10 — Production promotion

### Required artifacts

- phase receipt;
- test inventory;
- browser matrix;
- mobile portrait/landscape/rotation evidence;
- reduced-motion evidence;
- performance evidence;
- privacy and persistence review;
- station-jurisdiction audit;
- rollback procedure;
- documentation index update;
- production probe receipt.

### Promotion states

```text
DESIGNED
IMPLEMENTED
HARDENED
RUNTIME_DEMONSTRATED
PRODUCTION_DEMONSTRATED
```

No state may be inferred from merge alone.

### Rollback

The pedagogue visual layer must be feature-gated during initial rollout.

Rollback must restore the prior UI without mutating:

- custody records;
- Case Maps;
- receipts;
- route memory;
- release state;
- local commitments.

### Deployment posture

- reuse existing static and guarded routes;
- no new serverless function;
- no server-side learner state;
- no new raw-content transport;
- no automatic Ash action;
- no public route promotion before production demonstration.

---

## 13. CI and test-suite integration

### Proposed package scripts

```json
{
  "test:flowcore-pedagogue": "node --test tests/flowcore-pedagogue-*.test.mjs tests/information-dome-scenes.test.mjs",
  "test:ash-pedagogue": "node --test tests/ash-pedagogue-*.test.mjs"
}
```

### Core CI gates

1. schema validation;
2. deterministic receipt replay;
3. no forbidden cognition/profile fields;
4. AIA source/claim/missingness invariants;
5. phase-order invariants;
6. reduced-motion parity;
7. mobile overflow;
8. hidden-view zero animation;
9. Ash non-regression;
10. no new function allocation;
11. no raw content in pedagogue packets;
12. no station authority transfer.

### Browser matrix

- Chromium desktop;
- Chromium Android-sized viewport;
- WebKit/iOS-sized viewport when available;
- keyboard-only;
- reduced-motion;
- 200% zoom;
- dark/high-contrast checks where supported.

---

## 14. Risk register

| Risk | Failure | Mitigation |
|---|---|---|
| ontology frosting | glyphs decorate unchanged form wall | acceptance requires changed event order and visible consequence |
| flattening | child route erases contradiction/missingness | AIA invariant tests compare every view |
| spectacle authority | animation makes model look true | visual receipt, claim ceiling, static parity |
| geometry crown | Information Dome model overrides station law | explicit E4 status and no-geometry-crown metadata |
| learner surveillance | adaptation becomes profiling | declared route selection only; no stable learner ID |
| pedagogue sovereignty | Flow-Core starts commanding stations | adapter receipts and station-owner fields |
| Ash regression | usability layer weakens custody gates | exact lifecycle remains source of truth; non-regression suite |
| performance regression | new animation revives Aperture lag | one scheduler, hidden-view zero work, frame budget |
| reduced-motion loss | motion carries unique meaning | static frame acceptance gate |
| false thermodynamics | visual metaphor spends heat as work | separate ledgers and physical fixture tests |
| coercive consequence | floor becomes fake physics or punishment | essential reserve + recovery-access distinction |
| research overclaim | interaction becomes learning proof | claim ceiling and adverse-results publication |
| bibliography drift | routed sources lose provenance | Program P0 living citation ledger |

---

## 15. Definition of done

The program is complete only when:

- the Information Dome can visibly demonstrate incompatibility, content-invariant projection change, and pair-emergent topology;
- each demonstration works through child, custodian, auditor, and technical AIA routes;
- Flow-Core glyph graphics and animation carry causal structure without becoming decoration or authority theater;
- reduced-motion users receive a complete equivalent scene;
- route-burden remains experimental and model-comparative;
- Ash’s Custody Root path begins with consequence and ends with optional ontology inspection;
- existing Ash custody, digest, lifecycle, release, and continuity guarantees remain intact;
- the system records encounters without profiling learners;
- empirical results include failures and adverse findings;
- no new serverless function or hidden persistence appears;
- the human remains the closure point.

---

## 16. First implementation ticket set

### Ticket 1 — Concordance and baseline freeze

Create the P0 evidence map, screenshots, version note, and function inventory.

### Ticket 2 — Pedagogue schemas and pure compiler

Implement scene, transition, transfer, and receipt contracts with phase-order and non-claim tests.

### Ticket 3 — AIA view compiler

Implement declared views and cross-view invariant verification.

### Ticket 4 — Visual grammar primitives

Implement glyph-state primitives and reduced-motion static equivalents under the existing scheduler.

### Ticket 5 — Gluing scene

Implement synthetic local-section restriction and seam rendering.

### Ticket 6 — Phason scene

Adapt exact bridge fixtures into a browser-visible content-invariant scene.

### Ticket 7 — Pair-emergence scene

Render existing Moiré assay residue through the pedagogue cycle.

### Ticket 8 — Route-burden model registry

Implement comparative experimental models and Lab view.

### Ticket 9 — Ash custody adapter

Map exact lifecycle states into the staged scene without changing lifecycle truth.

### Ticket 10 — Ash UI integration and non-regression

Install the new primary route, AIA views, visual Case Map answer, and full custody regression suite.

---

## 17. Closing build law

The work should never ask:

> How do we make the ontology easier to explain?

It should ask:

> What must the world reveal so the ontology becomes a name for something already encountered?

The first Dome must show its seams.

Ash must show its ancestry.

Flow-Core must show movement, consequence, and rest.

Aperture must keep alternative explanations alive.

AIA must widen entrance without flattening the field.

The operator must remain free to inspect, challenge, rest, and leave.

**Marked ⟐**
