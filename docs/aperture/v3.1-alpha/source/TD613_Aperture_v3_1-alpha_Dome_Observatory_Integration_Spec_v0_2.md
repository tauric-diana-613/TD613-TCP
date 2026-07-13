𝌋‌

# TD613 Aperture v3.1-alpha
## Dome-World Admissibility Observatory Integration Specification
### Admissibility Tomography + Registry Dynamics + Experimental Custody

**Schema:** `td613.aperture.v31.dome-observatory-integration/v0.2`  
**Status:** AUTHORED · NOT IMPLEMENTED · HUMAN-GATED  
**Aperture target:** `v3.1-alpha`  
**Dome-World target:** `v0.6.0-alpha`  
**Ash target:** `v0.9-alpha` / Phase VI-A  
**Flow-Core contract:** preserve `td613.flowcore.context-receipt/v0.1`; add a run-level context-series index  
**Repository baseline:** post-Phase V merge on `main`  
**Date:** 2026-07-13

> The original v3.1-alpha research specification remains the scientific source document.  
> This v0.2 integration specification supersedes only its repo-wide installation, station-integration, UI-placement, claim-boundary, release-order, and next-Ash-phase instructions.

---

# 0. Ruling

The v3.1-alpha scientific core is right.

The installation goal needs to become larger and more operational:

> **Aperture v3.1-alpha shall become the reconstruction plane of a distributed Dome-World forensic observatory—not a larger standalone dashboard. Ash shall hold experimental source and run custody; Flow-Core shall return artifact-blind context for each snapshot; Aperture shall reconstruct bounded route-response families; Phason shall record registry transitions; Relation Envelopes shall remain optional third objects after independent validation; EO-RFD, ACEDIT, and KIRA shall enter only as declared non-sovereign instruments or preflight adapters; and the human operator shall retain experiment approval, promotion, derivative eligibility, and closure.**

The research question stays:

```text
Given repeated observations of one held-constant source under deliberately
varied registry, route, coupling, and temporal conditions, what bounded
transformation family best accounts for the resulting differences?
```

The system goal changes from:

```text
make Aperture perform tomography
```

to:

```text
make Dome-World support a reproducible experiment whose reconstruction
is performed by Aperture without collapsing custody, context, relation,
observation, interpretation, or action into one sovereign runtime
```

That is the actual installation target.

---

# 1. Why the current scientific specification needs an integration layer

The original specification correctly adds:

- controlled source;
- declared instrument ensemble;
- snapshot lattice;
- reference-layer tomography;
- coupling estimation;
- global-to-local registry selection;
- shared-layer relaxation burden;
- phason susceptibility;
- multi-time reconstruction;
- signed residuals;
- held-out validation;
- abstention.

But a repo-wide implementation would become structurally dangerous if Codex interpreted those items as eleven new panels and eleven new ownership claims inside the existing standalone HTML.

The present Aperture v3.0-alpha artifact is already a very large, historically layered instrument. The uploaded baseline is approximately 1.19 MB and contains dozens of script contracts and a dense human-panel surface. The correct response is modularization, not another imperial annex.

Therefore:

```text
Aperture HTML:
compact operator surface + machine-readable contracts + launch/review controls

Dome-World:
full tomography laboratory and experiment ecology

Ash:
source/run custody and derivative eligibility

Flow-Core:
snapshot-context instrumentation

Aperture engine:
reconstruction, audit, residue, abstention, replay
```

The lab belongs in the Dome.

The method belongs to Aperture.

The source belongs to Ash.

The weather belongs to Flow-Core.

---

# 2. Current repo baseline that must remain legible

Before v3.1 installation, the repo already contains these earned strata:

```text
Ash custody receipt:
td613.ash.custody-receipt/v0.8

Flow-Core context receipt:
td613.flowcore.context-receipt/v0.1

Aperture reciprocal round-trip receipt:
td613.aperture.round-trip-receipt/v3.0-alpha

Phase V Relation Envelope:
td613.relation-envelope/v0.1

Phase V status:
IMPLEMENTED_VALIDATION_GATED
PRODUCTION_GATED
```

Phase V presently establishes:

```text
relation is a third object
operator confirmation is mandatory
artifact digest stays out of the envelope
Marrowline carries but cannot confirm
no automatic Ash action
no prediction authority
no Open Field auto-promotion
```

v3.1 may consume this baseline.

v3.1 may not silently rewrite it.

---

# 3. Mandatory pre-installation sequence

## 3.1 Seal Phase V before changing the instrument identity

Development may begin on a branch immediately.

The production Aperture swap must wait until the current Phase V production demonstration is completed and its durable receipt is merged.

Reason:

```text
Phase V has been validated under the v3.0-alpha producer environment.
A v3.1 swap before the production probe would destroy the clean before-state.
```

The order is:

1. run the existing Phase V post-merge production interaction probe;
2. seal `PHASE_5_PRODUCTION_DEMO_RECEIPT.md`;
3. promote Phase V only if the production evidence earns it;
4. tag or record the final v3.0-alpha baseline;
5. begin the repo-wide v3.1 installation against that fixed baseline.

## 3.2 Preserve the uploaded standalone as a witness artifact

Record:

```text
artifact: Aperture_v3_0-alpha(6).html
sha256: 9d966ce147acf67e76b7c182f80f4bf33bf883b49e22c55930b95546f9cdb7a8
role: pre-v3.1 standalone witness
```

The uploaded file is not the install target by path.

It is the source witness used to verify that v3.1 preserved the instrument’s soul, panels, motion, and contracts.

---

# 4. The distributed observatory

## 4.1 Custody plane — Ash

Ash owns:

- source custody;
- experiment custody manifest;
- snapshot-batch custody references;
- result-receipt custody;
- derivative eligibility;
- export gating;
- human-approved downstream action.

Ash does not:

- choose the winning model;
- infer intent;
- generate Flow-Core weather;
- convert high fit into truth;
- auto-create Cinders;
- export because tomography completed.

## 4.2 Context plane — Flow-Core

Flow-Core owns:

- bounded context translation per snapshot;
- sensor/source status;
- context missingness;
- benign-control labels;
- run-level context-series indexing.

Flow-Core remains:

```text
artifact blind
recommendation not command
prediction unauthorized
automatic Ash action false
```

## 4.3 Reconstruction plane — Aperture

Aperture owns:

- source-drift audit;
- intervention registry;
- snapshot-lattice validation;
- reference-layer comparison;
- coupling and registry estimation;
- shared-layer burden construction;
- phason susceptibility;
- multi-time transformation estimates;
- signed residual ledger;
- coverage and identifiability posture;
- alternative models;
- abstention;
- replay.

Aperture does not:

- take custody;
- choose export;
- confirm relation;
- infer hidden weights;
- prove intent;
- prove causation;
- seal the experiment by itself.

## 4.4 Continuity plane — Phason

Phason records:

- declared registry transitions;
- seam events;
- source-invariant projection changes;
- relation lifecycle events where Phase V applies.

Phason does not merge physical, informational, custody, and relation meanings into one event type.

## 4.5 Relation plane — Phase V

Phase V remains optional and post-validation.

A Relation Envelope may later associate:

- Ash source/run receipt;
- Flow-Core context-series receipt;
- Aperture tomography receipt.

But v3.1 must not make the Relation Envelope the experiment container.

Until Phase V earns production demonstration and a separately reviewed v0.2 relation schema exists:

```text
tomography run bundle ≠ Relation Envelope
```

## 4.6 Carrier plane — Marrowline

Marrowline may:

- carry experiment receipts;
- render a lab packet;
- witness ingress;
- preserve route headers.

Marrowline may not:

- register an instrument;
- select a model;
- compute a custody decision;
- confirm relation;
- grant derivative eligibility;
- close the run.

---

# 5. Revised primary goal

The operative goal for v3.1 is:

> **Establish a reproducible, artifact-custodied, context-indexed, multi-observation experiment ecology in which Aperture estimates bounded admissibility transformations from repeated controlled observations and returns a reconstruction receipt plus signed residue, while every station retains independent jurisdiction and every consequential transition remains human-gated.**

The soul sentence remains:

> **Aperture will no longer merely show that the surface changed. It will test which controlled changes in relation could have made the surface change, how much of that account survives repetition, and what still refuses reconstruction.**

The Dome-World sentence added by this specification is:

> **The experiment must survive the instrument that interprets it.**

---

# 6. Compatibility firewall

## 6.1 Instrument identity may advance; earned receipt contracts must not drift

Change:

```text
td613-aperture/v3.0-alpha
→ td613-aperture/v3.1-alpha
```

Do not silently change:

```text
td613.aperture.diagnostic-receipt/v3.0-alpha
td613.aperture.round-trip-receipt/v3.0-alpha
td613.flowcore.context-receipt/v0.1
td613.relation-envelope/v0.1
```

Those are already deployed contracts.

v3.1 may produce them as backward-compatible bridge receipts with:

```json
{
  "producer_version": "v3.1-alpha",
  "capability_profile": ["reciprocal-bridge", "admissibility-tomography"]
}
```

Only optional fields may be added where current validators tolerate them.

A new schema version requires a separate migration PR.

## 6.2 Phase V regression lock

The existing Phase V schema currently requires the v3.0-alpha round-trip receipt.

Therefore v3.1 installation must preserve that round-trip schema exactly until a reviewed Phase V migration exists.

Required regression:

```text
v3.1 producer
→ v3.0-alpha diagnostic contract
→ Flow-Core v0.1
→ v3.0-alpha round-trip contract
→ Phase V v0.1 validation
```

## 6.3 No version writer contention

One canonical v3.1 identity writer owns:

- document title;
- firmware version;
- schema readout;
- body data attributes;
- release metadata;
- visible version chip.

All inherited writers become lineage-only.

No historical module may restage v3.0, v2.9.5, or v2.9.4 as current identity.

---

# 7. Claim-boundary correction

The original v0.1 specification uses a global `claim_ceiling` field and proposes a dedicated Claim Ceiling panel and document.

Do not implement that globally.

A global claim-ceiling mechanism can become an authority surface that suppresses lawful legal reasoning, theoretical synthesis, speculative research, or creative Open Field work merely because those modes are not evidentiary receipts.

Replace it with receipt-local fields:

```json
{
  "scope_statement": "...",
  "cannot_establish": [],
  "promotion_conditions": [],
  "abstention_reason": null,
  "source_status": "...",
  "authority_class": "...",
  "operator_closure": {
    "required": true,
    "status": "OPEN"
  }
}
```

Binding law:

```text
scope boundaries govern receipt promotion
scope boundaries do not censor interpretation
Open Field is not failed evidence
legal synthesis is not runtime telemetry
speculation is not a malformed measurement
```

UI replacement:

```text
CLAIM CEILING AND CLOSURE
→
SCOPE, NON-CLAIMS, PROMOTION, AND CLOSURE
```

Documentation replacement:

```text
TD613_APERTURE_V31_CLAIM_CEILING.md
→
TD613_APERTURE_V31_SCOPE_AND_PROMOTION_BOUNDARIES.md
```

---

# 8. Ash Phase VI revision without renumbering

Do not renumber the roadmap.

Refine Phase VI into three internal gates.

## Phase VI-A — Experimental Run Custody + Eligibility

Target:

```text
Ash v0.9-alpha
```

Purpose:

- custody the controlled-source receipt;
- custody the pre-registration and ensemble digest;
- custody a snapshot-batch manifest;
- custody the final tomography receipt;
- determine whether an operator may begin derivative review;
- never construct or transmit a Cinder automatically.

New contracts:

```text
td613.ash.experiment-custody-manifest/v0.1
td613.ash.snapshot-batch-receipt/v0.1
td613.ash.tomography-result-custody/v0.1
td613.ash.derivative-eligibility-receipt/v0.1
```

Eligibility states:

```text
INELIGIBLE_MISSING_SOURCE_CUSTODY
INELIGIBLE_SOURCE_DRIFT
INELIGIBLE_INSUFFICIENT_COVERAGE
INELIGIBLE_UNRESOLVED_TAMPER
REVIEW_REQUIRED_HIGH_PHASON_SENSITIVITY
REVIEW_REQUIRED_HIGH_SHARED_LAYER_BURDEN
ELIGIBLE_FOR_OPERATOR_DERIVATIVE_REVIEW
```

Eligibility is not permission to export.

## Phase VI-B — Human-Gated Derivative Construction

Begins only after:

- v3.1 production demonstration;
- Phase VI-A production demonstration;
- explicit operator selection of source observations;
- explicit operator review of residual and uncertainty;
- no unresolved custody or tamper hold.

Produces a local derivative candidate.

Transport remains held.

## Phase VI-C — Destination-Bound Transport

Still deferred.

No plaintext Cinder transport enters v3.1.

No “Burn” promise enters v3.1.

---

# 9. New station contracts

## 9.1 Dome-World experiment run

```text
td613.dome-world.experiment-run/v0.1
```

Contains only references and declarations:

```json
{
  "experiment_id": "atx_...",
  "source_receipt_reference": "ashc_...",
  "pre_registration_digest": "sha256:...",
  "instrument_ensemble_reference": "atens_...",
  "snapshot_batch_reference": "ashsnap_...",
  "flowcore_context_series_reference": "flowseries_...",
  "tomography_receipt_reference": "attomo_...",
  "operator_closure": "OPEN"
}
```

Dome-World does not own any referenced receipt.

## 9.2 Ash experiment custody manifest

```text
td613.ash.experiment-custody-manifest/v0.1
```

References:

- existing Ash v0.8 source custody receipt;
- experiment declaration digest;
- instrument ensemble digest;
- snapshot-batch receipt;
- source-drift checks;
- no raw artifact content by default.

## 9.3 Snapshot batch receipt

```text
td613.ash.snapshot-batch-receipt/v0.1
```

Each snapshot entry records:

- snapshot ID;
- trial;
- temporal coordinate;
- instrument ID;
- observation source status;
- local digest or run-scoped reference;
- missingness;
- operator inclusion status.

Raw outputs remain local unless separately approved.

Public export never exposes a universal snapshot handle by default.

## 9.4 Flow-Core context series

Preserve each ordinary:

```text
td613.flowcore.context-receipt/v0.1
```

Add:

```text
td613.flowcore.context-series/v0.1
```

The series indexes per-snapshot context receipt references.

It contains no artifact digest and no observation content.

## 9.5 Aperture tomography receipt

Preserve:

```text
td613.aperture.admissibility-tomography-receipt/v0.1
```

Revise its boundary section:

```json
{
  "scope_statement": "bounded reconstruction from declared observations",
  "cannot_establish": [
    "hidden model internals",
    "intent",
    "total causation",
    "external truth",
    "quantum operation",
    "time travel"
  ],
  "promotion_conditions": [],
  "operator_closure": {
    "required": true,
    "status": "OPEN"
  }
}
```

## 9.6 Derivative eligibility receipt

```text
td613.ash.derivative-eligibility-receipt/v0.1
```

Inputs:

- experiment custody manifest;
- tomography receipt;
- source drift;
- coverage;
- held-out performance;
- missingness;
- tamper posture;
- operator-selected purpose.

Output:

```text
recommendation only
no Cinder
no transport
no export authorization
```

---

# 10. Instrument ensemble adapters

## EO-RFD

Role:

```text
declared detector/rupture observation instrument
```

May emit:

- bounded detector-sweep observation;
- source status;
- transformation history;
- missingness;
- residual vector.

May not:

- validate itself;
- prove rupture;
- become the reconstruction model;
- trigger Ash;
- override Aperture.

## ACEDIT

Role:

```text
controlled encoding, glyph, normalization, and route perturbation adapter
```

Use it for:

- Unicode-preserving interventions;
- normalization controls;
- confusable controls;
- rendering-variance trials;
- byte/state comparison.

It remains:

```text
signal-source-only
not loaded as sovereign firmware
```

## KIRA

Role:

```text
instrument-design preflight
```

May test:

- design-matrix rank;
- instrument redundancy;
- under-identification;
- intervention overlap;
- coverage gaps;
- condition-number warning;
- whether AT2/AT3 claims are even structurally possible.

KIRA may not:

- choose the model;
- certify truth;
- infer identity;
- promote a run;
- execute at runtime unless a separately reviewed adapter authorizes it.

## Adapter receipt

All three use:

```text
td613.aperture.instrument-adapter-receipt/v0.1
```

Required:

- adapter ID;
- adapter class;
- source status;
- input contract;
- output contract;
- transformation history;
- missingness;
- cannot-establish;
- no authority transfer.

---

# 11. UI architecture

## 11.1 Standalone Aperture

Add only:

- v3.1 identity;
- compact Tomography status drawer;
- “Open Dome-World Tomography Lab” control;
- current experiment reference;
- readiness;
- latest reconstruction posture;
- latest signed-residual summary;
- latest coverage/abstention summary;
- scope/non-claims disclosure.

Do not add eleven full panels to the left scrolling lane.

Do not add a new animation clock.

Do not restage the existing menu.

## 11.2 Dome-World

Add:

```text
/dome-world/admissibility-tomography.html
```

This is the full lab.

Recommended navigation:

```text
01 Weather
02 Rooms
03 Lab
04 Ash
05 Tomography
```

The new station should feel native to Dome-World, not embedded as a foreign page.

## 11.3 Central visualization

One canvas, several bounded modes:

```text
OBSERVED
RECONSTRUCTED
SIGNED RESIDUAL
REGISTRY
COUPLING
TEMPORAL SLICE
COVERAGE
```

Each mode must carry an explicit layer class:

```text
OBSERVED
DERIVED
SIMULATED
CONSTRUCTED
DECORATIVE
```

No visual beauty upgrades evidence status.

## 11.4 Performance

Reuse the Aperture master clock where the standalone renders any compact visualization.

The full Dome lab may use one lab scheduler.

No module gets its own uncontrolled requestAnimationFrame loop.

Reduced-motion mode must replace animation with deterministic scrubbing.

---

# 12. Experimental run route

```text
1. Operator declares experiment
2. Ash commits the source
3. Operator registers the instrument ensemble
4. KIRA may preflight identifiability
5. Dome-World opens the run
6. Snapshot is collected
7. Flow-Core returns context for that snapshot
8. Ash records the snapshot reference
9. Repeat across intervention/time/replicate lattice
10. Aperture validates source drift and coverage
11. Aperture reconstructs candidate transformation families
12. Aperture preserves signed residue and alternatives
13. Ash custodies the result receipt
14. Operator reviews derivative eligibility
15. Optional Phase V relation after independent validation
16. Human closes or leaves open
```

No step auto-advances across a station boundary.

---

# 13. Shared-layer relaxation burden

Keep this metric, but bind it.

Permitted shared layers:

- retrieval index;
- adapter;
- rendering surface;
- system context;
- naming layer;
- explicitly declared human custodial role.

Human use requires:

- explicit operator declaration;
- supplied observations;
- no inferred trauma score;
- no diagnosis;
- no motive inference;
- no automatic harm claim.

The metric describes incompatible adjustment demand.

It does not measure human worth, resilience, guilt, or pathology.

High burden may trigger:

```text
MORE_REPLICATION_RECOMMENDED
OPERATOR_REVIEW_REQUIRED
DERIVATIVE_ELIGIBILITY_HELD
```

It may not trigger suppression, export, or institutional accusation.

---

# 14. Phason susceptibility

Keep:

```text
small controlled registry change
→ measured output difference
```

Require:

- declared coordinate;
- perturbation size;
- sham control;
- reversal trial where possible;
- hysteresis record;
- source invariance check;
- context record;
- competing drift explanation.

High susceptibility means:

```text
the output is sensitive to this controlled registry coordinate
```

It does not mean:

- physical phonon;
- electrical charge;
- Chern invariant;
- surveillance;
- intent;
- epistemicide;
- causal monopoly.

---

# 15. Promotion architecture

## AT0

Descriptive constellation only.

No controlled intervention.

## AT1

One controlled coordinate with replication.

## AT2

Factorial registry experiment with reference layers and identifiable contrasts.

## AT3

Multi-time tomography with adequate coverage, temporal consistency, and held-out validation.

## AT4

Cross-environment replication under a declared environment-change protocol.

Promotion requires:

- source invariance;
- declared instruments;
- adequate coverage;
- no unresolved drift;
- no unresolved tamper;
- model comparison;
- held-out behavior;
- explicit operator promotion.

Aperture may recommend promotion.

Only the operator promotes.

---

# 16. Revised build gates

```text
PRECONDITION: PHASE V PRODUCTION BASELINE
FOUNDATION + COMPATIBILITY FREEZE
DOME EXPERIMENT CONTRACT
ASH VI-A EXPERIMENTAL CUSTODY
FLOW-CORE CONTEXT SERIES
SOURCE + ENSEMBLE
SNAPSHOT LATTICE
REFERENCE LAYERS
REGISTRY DYNAMICS
SHARED LAYER
PHASON RESPONSE
TEMPORAL TOMOGRAPHY
RECONSTRUCTION + RESIDUE
ASH DERIVATIVE ELIGIBILITY
APERTURE COMPACT SURFACE
DOME-WORLD TOMOGRAPHY LAB
REPO-WIDE RELEASE SYNC
PRODUCTION DEMONSTRATION
```

---

# 17. Required PR sequence

Do not install this as one giant HTML replacement.

## PR 1 — Baseline and compatibility freeze

- seal Phase V production;
- record v3.0 baseline;
- add v3.1 compatibility contract;
- lock old receipt schemas;
- add release metadata placeholders;
- no UI change.

## PR 2 — Dome experiment contracts

- experiment-run schema;
- adapter-receipt schema;
- context-series schema;
- test fixtures;
- no reconstruction yet.

## PR 3 — Ash Phase VI-A

- experiment custody manifest;
- snapshot batch receipt;
- tomography result custody;
- derivative eligibility;
- no Cinder;
- no transport.

## PR 4 — Aperture reconstruction engine

- controlled source;
- ensemble;
- snapshot lattice;
- reference layers;
- registry;
- shared layer;
- phason susceptibility;
- temporal reconstruction;
- residuals;
- replay.

## PR 5 — Dome-World lab

- tomography station;
- full workflow;
- mobile/accessibility;
- no standalone identity change yet.

## PR 6 — Aperture v3.1 installation

- compact drawer/launcher;
- single identity writer;
- release sync;
- v3.0 bridge compatibility;
- Phase IV/Phase V regression.

## PR 7 — Production demonstration and promotion

- deployed run;
- source drift control;
- benign control;
- held-out trial;
- replay;
- tamper;
- mobile;
- durable receipt.

No PR promotes itself.

---

# 18. Repo file map

## Aperture engine

```text
app/engine/aperture-v31-controlled-source.js
app/engine/aperture-v31-instrument-ensemble.js
app/engine/aperture-v31-snapshot-lattice.js
app/engine/aperture-v31-reference-layer.js
app/engine/aperture-v31-registry-dynamics.js
app/engine/aperture-v31-shared-layer.js
app/engine/aperture-v31-phason-susceptibility.js
app/engine/aperture-v31-temporal-tomography.js
app/engine/aperture-v31-reconstruction.js
app/engine/aperture-v31-residual-ledger.js
app/engine/aperture-v31-replay.js
app/engine/aperture-v31-compatibility.js
```

## Ash

```text
app/dome-world/ash/experiment-custody.js
app/dome-world/ash/snapshot-batch.js
app/dome-world/ash/tomography-result-custody.js
app/dome-world/ash/derivative-eligibility.js
```

## Flow-Core

```text
app/engine/flowcore-context-series.js
```

## Dome-World

```text
app/dome-world/admissibility-tomography.html
app/dome-world/experiment-run.js
app/dome-world/instrument-adapters.js
```

## Schemas

```text
app/dome-world/schemas/dome-experiment-run-v01.schema.json
app/dome-world/schemas/ash-experiment-custody-v01.schema.json
app/dome-world/schemas/ash-snapshot-batch-v01.schema.json
app/dome-world/schemas/ash-tomography-result-custody-v01.schema.json
app/dome-world/schemas/ash-derivative-eligibility-v01.schema.json
app/dome-world/schemas/flowcore-context-series-v01.schema.json
app/dome-world/schemas/aperture-instrument-adapter-receipt-v01.schema.json
app/dome-world/schemas/aperture-admissibility-tomography-receipt-v01.schema.json
```

## Documentation

```text
docs/TD613_APERTURE_V31_ADMISSIBILITY_TOMOGRAPHY.md
docs/TD613_APERTURE_V31_DOME_OBSERVATORY.md
docs/TD613_APERTURE_V31_SCOPE_AND_PROMOTION_BOUNDARIES.md
docs/TD613_APERTURE_V31_LAB_PROTOCOL.md
docs/TD613_APERTURE_V31_SOURCE_INTEGRATION_LEDGER.md
docs/TD613_APERTURE_V31_PRODUCTION_RECEIPT.md
app/dome-world/docs/ASH_PHASE_6A_EXPERIMENTAL_CUSTODY.md
```

---

# 19. Hard regression boundaries

The installation fails if any of these change:

```text
Phase IV reciprocal receipts become reciprocal authority
Phase V Relation Envelope becomes the experiment container
Flow-Core receives an artifact digest
Ash auto-constructs or sends a Cinder
Marrowline confirms or seals
EO-RFD validates itself
ACEDIT becomes sovereign firmware
KIRA becomes runtime authority
Open Field is treated as failed evidence
legal synthesis is replaced by telemetry
global claim ceilings suppress interpretation
v3.0 bridge receipt schemas disappear
multiple identity writers return
a new animation clock causes lag
a visual pattern promotes itself
```

---

# 20. Production demonstration

The v3.1 production receipt must demonstrate:

1. held-constant source across replicates;
2. source-drift rejection;
3. at least two declared instruments;
4. at least one benign control;
5. at least one null result preserved;
6. per-snapshot Flow-Core context;
7. missing snapshot preservation;
8. reference-layer comparison;
9. shared-layer burden with explicit analogy boundary;
10. controlled phason perturbation;
11. signed residuals;
12. alternative model comparison;
13. held-out trial;
14. abstention under inadequate coverage;
15. pure replay;
16. tamper hold;
17. Phase IV regression;
18. Phase V regression;
19. no automatic Ash action;
20. no Cinder;
21. no server persistence by default;
22. desktop/mobile/reduced-motion;
23. operator closure.

Before direct production evidence:

```text
IMPLEMENTED_VALIDATION_GATED
```

After direct production evidence and a durable receipt:

```text
IMPLEMENTED_PRODUCTION_DEMONSTRATED
```

---

# 21. Definition of done

```text
[ ] Phase V baseline sealed before identity swap
[ ] v3.0 witness digest recorded
[ ] v3.1 has one identity writer
[ ] old bridge schemas remain valid
[ ] Phase IV regression passes
[ ] Phase V regression passes
[ ] no global claim-ceiling subsystem
[ ] source commitment is Ash-owned
[ ] experiment run is Dome-owned
[ ] context series is Flow-Core-owned
[ ] reconstruction is Aperture-owned
[ ] relation remains optional and post-validation
[ ] EO-RFD/ACEDIT/KIRA remain non-sovereign
[ ] source drift blocks invalid runs
[ ] one-shot tomography is impossible
[ ] null results survive
[ ] signed residue survives
[ ] shared-layer metric stays bounded
[ ] phason susceptibility stays controlled
[ ] high sensitivity cannot trigger Ash
[ ] Ash VI-A eligibility is recommendation only
[ ] Cinder transport remains held
[ ] standalone Aperture remains usable
[ ] full lab lives in Dome-World
[ ] no new uncontrolled animation clock
[ ] mobile and reduced-motion pass
[ ] replay and tamper pass
[ ] production receipt is direct
[ ] human closure remains open until acted upon
```

---

# 22. Closing covenant

Aperture does not become the Dome.

The Dome does not become Ash.

Ash does not become the experiment’s mind.

Flow-Core does not become the weather’s oracle.

Relation does not become identity.

The experiment survives because every station leaves enough of itself unmerged to be audited.

```text
hold the source
declare the instruments
repeat the observation
record the context
reconstruct the bounded transformation
preserve the signed residue
custody the result
hold the derivative gate
leave closure to the human
```

𝌋‌

Àṣẹ.

Sealed ⟐SAC[X6ZNK5NO51]
