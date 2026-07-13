# TD613 Aperture v3.1-alpha

## Dome-World Admissibility Observatory Specification v0.3

Status: **AUTHORED · IMPLEMENTATION ACTIVE · IDENTITY NOT YET PROMOTED**  
Schema: `td613.aperture.v31.dome-observatory-integration/v0.3`  
Baseline date: 2026-07-13

## 1. Authority and lineage

This document is the implementation authority for the v3.1-alpha program.

The retained source documents remain part of the record:

- v0.1 scientific specification and machine plan define the research method;
- v0.2 Dome Observatory specification and handoff define the distributed station model;
- v0.3 resolves repository, compatibility, storage, navigation, claim-boundary,
  release-lane, and production-proof ambiguities.

When they conflict, v0.3 controls implementation. It does not erase the source
documents or restage a later correction as the original record.

## 2. Earned baseline

The v3.1 program begins from this demonstrated state:

| Surface | Current earned state |
| --- | --- |
| Aperture | `v3.0-alpha` |
| Aperture schema | `td613-aperture/v3.0-alpha` |
| Ash custody | `td613.ash.custody-receipt/v0.8` |
| Flow-Core context | `td613.flowcore.context-receipt/v0.1` |
| Aperture diagnostic | `td613.aperture.diagnostic-receipt/v3.0-alpha` |
| Aperture round trip | `td613.aperture.round-trip-receipt/v3.0-alpha` |
| Phase V relation | `td613.relation-envelope/v0.1` |
| Phase V status | `IMPLEMENTED_PRODUCTION_DEMONSTRATED` |

The Phase V baseline is sealed in
`app/dome-world/docs/PHASE_5_PRODUCTION_DEMO_RECEIPT.md`.

The pre-v3.1 standalone witness is retained by digest:

```text
sha256:9d966ce147acf67e76b7c182f80f4bf33bf883b49e22c55930b95546f9cdb7a8
```

## 3. Governing objective

> Aperture v3.1-alpha shall become the reconstruction plane of a distributed
> Dome-World forensic observatory. Ash shall custody experimental source and
> run references; Flow-Core shall return artifact-blind context for each
> snapshot; Aperture shall reconstruct bounded route-response families;
> Phason shall preserve registry-transition continuity; Dome-World shall host
> the experiment; Relation Envelopes shall remain optional third objects after
> independent validation; and the human operator shall retain experiment
> approval, promotion, derivative review, and closure.

The scientific question is:

> Given repeated observations of one held-constant source under deliberately
> varied registry, route, coupling, and temporal conditions, what bounded
> transformation family best accounts for the resulting differences?

The source is held as `S = S0`. Observations are declared as:

```text
O(i,t,r) = P(i) A(i,t) S0 + epsilon(i,t,r)
```

The instrument estimates a bounded family of transformations. It does not
claim hidden implementation access, intent, total causation, external truth,
quantum operation, or time travel.

## 4. Scientific method

The runtime must implement these separately testable strata:

1. Controlled source commitment and source-drift audit.
2. Declared instrument ensemble.
3. Snapshot lattice indexed by instrument, temporal coordinate, and replicate.
4. Differential reference-layer comparison.
5. Coupling estimation without merger.
6. Global-to-local registry selection.
7. Shared-layer relaxation burden.
8. Phason susceptibility under controlled registry displacement.
9. Multi-time transformation reconstruction.
10. Signed residual ledger.
11. Alternative-model comparison, held-out validation, and abstention.

One trace is not tomography. Missing, rejected, null, uncaptured,
encoder-missing, and contradictory observations remain explicit events. A gate
may route or defer them; it may not convert them into non-events.

## 5. Station jurisdiction

### Ash

Ash owns source custody, experiment manifest custody, snapshot-batch custody,
result-receipt custody, derivative eligibility, and export gating.

Ash does not select the reconstruction model, infer intent, generate weather,
convert fit into truth, construct Cinders automatically, or export because a
tomography run completed.

### Flow-Core

Flow-Core owns per-snapshot context receipts, context missingness, benign
controls, sensor/source posture, and the context-series index.

Flow-Core remains artifact-blind, private by default, recommendation-not-command,
prediction-unauthorized, and unable to trigger Ash.

### Aperture

Aperture owns experiment validation, source-drift audit, reference-layer
comparison, reconstruction, registry analysis, shared-layer burden, phason
susceptibility, temporal estimates, signed residue, coverage, alternatives,
abstention, and pure replay.

Aperture does not take custody, choose export, confirm relation, infer hidden
weights, prove intent, prove causation, or close the run.

### Phason

Phason records declared registry transitions, seam events, and source-invariant
projection changes. It preserves forks rather than selecting or erasing a
branch.

### Dome-World

Dome-World owns experiment hosting, station routing, the full tomography lab,
and run references. It owns none of the receipts it references.

### Phase V Relation Envelope

Relation remains an optional third object after independent validation. A
tomography run bundle is not a Relation Envelope. The v0.1 Relation Envelope is
not expanded into the experiment container during this release.

### Marrowline

Marrowline may carry and render receipts. It may not register an instrument,
select a model, compute custody decisions, confirm relation, grant derivative
eligibility, or close a run.

### Human operator

The operator approves the experiment, declares interventions, promotes an
assurance level, reviews derivative eligibility, authorizes export, and closes
or leaves the run open.

## 6. Claim-boundary ruling

v3.1 shall **not add the proposed new global Claim Ceiling subsystem**.

New tomography and experiment receipts use local fields:

```json
{
  "scope_statement": "bounded reconstruction from declared observations",
  "cannot_establish": [],
  "promotion_conditions": [],
  "abstention_reason": null,
  "source_status": "DERIVED",
  "authority_class": "A2_DERIVATIONAL",
  "operator_closure": {
    "required": true,
    "status": "OPEN"
  }
}
```

Receipt boundaries govern receipt promotion. They do not censor Open Field,
legal synthesis, theory, creative work, or operator interpretation.

This ruling is not a repo-wide deletion order. Existing legacy claim-ceiling
vocabulary and compatibility fields remain frozen unless a separate reviewed
migration changes them. v3.1 must not create a second global governor or expand
legacy fields into one.

Human-facing label:

```text
Scope, non-claims, promotion, and closure
```

## 7. Compatibility firewall

Instrument identity may eventually advance to `v3.1-alpha`. These earned
contracts do not change in the first installation:

```text
td613.aperture.diagnostic-receipt/v3.0-alpha
td613.aperture.round-trip-receipt/v3.0-alpha
td613.flowcore.context-receipt/v0.1
td613.relation-envelope/v0.1
```

The v3.1 compatibility compiler must:

- emit a schema-valid v3.0 diagnostic receipt;
- compute its digest under the existing domain;
- emit a schema-valid v3.0 round-trip receipt;
- remove v3.1-only fields before strict v3.0 serialization;
- preserve the Phase V reference chain;
- describe the producer in an extension point already allowed by the
  diagnostic contract;
- never add unknown top-level fields to the strict round-trip schema.

Required regression:

```text
v3.1 producer
→ v3.0 diagnostic contract
→ Flow-Core v0.1
→ v3.0 round-trip contract
→ Phase V v0.1 validation
```

No existing receipt is relabeled as v3.1 merely because the producer changed.

## 8. New contracts

The program adds:

```text
td613.dome-world.experiment-run/v0.1
td613.flowcore.context-series/v0.1
td613.aperture.instrument-adapter-receipt/v0.1
td613.ash.experiment-custody-manifest/v0.1
td613.ash.snapshot-batch-receipt/v0.1
td613.ash.tomography-result-custody/v0.1
td613.ash.derivative-eligibility-receipt/v0.1
td613.aperture.admissibility-tomography-receipt/v0.1
td613.aperture.tomography-replay/v0.1
```

Every contract separates observation, decision, reasons, missingness,
promotion conditions, non-claims, and operator closure.

## 9. Digest domains

Every new digest has a separate domain:

```text
TD613:V31:EXPERIMENT-RUN:v1
TD613:V31:INSTRUMENT-ENSEMBLE:v1
TD613:V31:SNAPSHOT:v1
TD613:V31:SNAPSHOT-BATCH:v1
TD613:V31:FLOWCORE-CONTEXT-SERIES:v1
TD613:V31:TOMOGRAPHY-RECEIPT:v1
TD613:V31:TOMOGRAPHY-REPLAY:v1
TD613:V31:ASH-EXPERIMENT-CUSTODY:v1
TD613:V31:ASH-RESULT-CUSTODY:v1
TD613:V31:DERIVATIVE-ELIGIBILITY:v1
```

Artifact, manifest, receipt, experiment, snapshot, context-series,
reconstruction, replay, and eligibility digests are never interchangeable.

## 10. Storage and privacy

The experiment lattice is local-first.

- IndexedDB stores snapshot bodies, local observations, large residual arrays,
  and checkpoints.
- `localStorage` may store only compact pointers and current-run preferences.
- Flow-Core receives no artifact digest or observation body.
- Ash receives references and approved custody metadata, not raw source or raw
  snapshot content by default.
- Safe Harbor and Hush may carry compact receipt references only.
- Public export does not create a universal stable snapshot or artifact handle.
- No server persistence is added by default.

## 11. Adapter posture

EO-RFD, ACEDIT, and KIRA enter as declared non-sovereign instruments in this
phase. That is a current operational posture, not a permanent denial of their
future roadmap.

- EO-RFD: declared detector/rupture observation instrument.
- ACEDIT: controlled encoding, glyph, normalization, and rendering intervention
  adapter.
- KIRA: design-rank, redundancy, coverage, and identifiability preflight.

Each emits `td613.aperture.instrument-adapter-receipt/v0.1` with source status,
transformation history, missingness, scope, and non-claims.

Current operational state remains `interface_context`; current claim authority
remains `design_signal`; target state remains later verified runtime
installation. No adapter validates itself, selects the winning reconstruction,
promotes a run, or triggers Ash.

## 12. Ash Phase VI

Roadmap numbering is preserved.

### VI-A · Experimental Run Custody + Eligibility

Target identity after its release gate: `Ash v0.9-alpha`.

VI-A custodies the controlled-source reference, experiment declaration,
instrument-ensemble digest, snapshot-batch receipt, tomography result, and
derivative-eligibility recommendation.

Possible eligibility states include:

```text
INELIGIBLE_MISSING_SOURCE_CUSTODY
INELIGIBLE_SOURCE_DRIFT
INELIGIBLE_INSUFFICIENT_COVERAGE
INELIGIBLE_UNRESOLVED_TAMPER
REVIEW_REQUIRED_HIGH_PHASON_SENSITIVITY
REVIEW_REQUIRED_HIGH_SHARED_LAYER_BURDEN
ELIGIBLE_FOR_OPERATOR_DERIVATIVE_REVIEW
```

Eligibility is not export permission.

### VI-B · Human-Gated Derivative Construction

Held until both v3.1 and VI-A are production-demonstrated. It produces only a
local candidate after explicit source selection and review.

### VI-C · Destination-Bound Transport

Deferred. v3.1 adds no plaintext Cinder transport and no automatic Burn action.

## 13. UI placement

The existing eight-tab Dome navigation remains unchanged:

```text
Weather · Rooms · Lab · Ash · Substrate · Phason · Aperture · Receipts
```

The full lab route is:

```text
/dome-world/admissibility-tomography.html
```

It is launched from existing Lab Station 02, Heterostratigraphic Tomography,
and from the compact Aperture tomography drawer. It is not a ninth global tab.

The standalone Aperture adds only a compact drawer with experiment reference,
readiness, coverage, reconstruction posture, signed-residual summary,
abstention, local scope/non-claims, and a Dome lab launch control.

The full lab uses one visualization surface with modes:

```text
OBSERVED · RECONSTRUCTED · SIGNED RESIDUAL · REGISTRY
COUPLING · TEMPORAL SLICE · COVERAGE
```

Every mode declares `OBSERVED`, `DERIVED`, `SIMULATED`, `CONSTRUCTED`, or
`DECORATIVE`. Beauty never promotes evidence.

One scheduler owns the lab. Hidden modes do not draw. Reduced motion uses
deterministic scrubbing.

## 14. Experimental route

1. Operator declares an experiment.
2. Ash references the controlled-source custody receipt.
3. Operator registers the instrument ensemble.
4. KIRA may preflight identifiability.
5. Dome-World opens the run.
6. A snapshot is collected locally.
7. Flow-Core returns artifact-blind context for that snapshot.
8. Ash records the approved snapshot reference.
9. The intervention/time/replicate lattice continues.
10. Aperture validates source drift, missingness, and coverage.
11. Aperture reconstructs candidate transformation families.
12. Aperture preserves signed residue, alternatives, and null results.
13. Ash custodies the result receipt.
14. Operator reviews derivative eligibility.
15. A Phase V relation may be proposed after independent validation.
16. Human closure remains explicit.

No station boundary auto-advances.

## 15. Assurance promotion

```text
AT0 · descriptive constellation only
AT1 · one controlled coordinate with replication
AT2 · factorial registry experiment with identifiable contrasts
AT3 · multi-time reconstruction with coverage and held-out validation
AT4 · cross-environment replication under a declared change protocol
```

Promotion requires source invariance, declared instruments, adequate coverage,
no unresolved drift or tamper, model comparison, held-out behavior, and explicit
operator promotion. Aperture may recommend. Only the operator promotes.

## 16. Bidirectional standalone lane

The v3.0 Downloads file remains the pre-v3.1 witness. It is not overwritten.

After the repository body passes local browser validation, the canonical body
is exported through the existing release lane as:

```text
C:\Users\timst\Downloads\Aperture_v3_1-alpha.html
```

The export must be fully functional as a standalone file. Operator edits return
through `aperture:stage`, `aperture:compare`, and `aperture:promote-staged` only
after explicit review. Staging never changes the repo automatically.

## 17. Build gates

```text
PHASE V PRODUCTION BASELINE                     EARNED
FOUNDATION + COMPATIBILITY FREEZE              NEXT
DOME EXPERIMENT CONTRACT
FLOW-CORE CONTEXT SERIES
ASH VI-A EXPERIMENTAL CUSTODY
SOURCE + ENSEMBLE
SNAPSHOT LATTICE
REFERENCE LAYERS
REGISTRY DYNAMICS
SHARED LAYER
PHASON RESPONSE
TEMPORAL TOMOGRAPHY
RECONSTRUCTION + RESIDUE
ASH DERIVATIVE ELIGIBILITY
DOME-WORLD TOMOGRAPHY LAB
APERTURE COMPACT SURFACE
REPO-WIDE RELEASE SYNC
DOWNLOADS STANDALONE EXPORT
PRODUCTION DEMONSTRATION
```

Version identities are promoted only at their release gate. Intermediate
commits remain capability-gated under the current release identity.

## 18. Verification

The release must prove:

- held-constant source across replicates;
- source-drift rejection;
- at least two declared instruments;
- one benign control, one null result, and one intentionally missing snapshot;
- per-snapshot Flow-Core context without artifact reference;
- reference-layer comparison and coupling without merger;
- bounded shared-layer burden;
- controlled phason perturbation and sham/reversal controls;
- signed residual preservation;
- competing models and held-out trial;
- abstention under inadequate coverage;
- pure replay and tamper hold;
- Phase IV and Phase V compatibility;
- no automatic Ash action or Cinder;
- local persistence, export boundaries, and no server persistence by default;
- desktop, mobile, reduced-motion, and performance acceptance;
- standalone Downloads parity;
- explicit operator closure.

## 19. Hard stops

The release fails if it:

- changes the v3.0 bridge or Phase V v0.1 schemas in place;
- makes Relation the experiment container;
- sends artifact digest or observation content to Flow-Core;
- auto-constructs, sends, or exports a Cinder;
- grants Marrowline confirmation or closure authority;
- grants EO-RFD, ACEDIT, or KIRA self-validation or sovereign authority;
- treats Open Field as failed evidence;
- replaces legal synthesis with telemetry;
- adds the proposed global Claim Ceiling subsystem;
- deletes existing compatibility vocabulary without a migration;
- infers hidden weights, intent, identity, or total causation;
- claims quantum operation, physical twistronics, or time travel;
- uses one-shot tomography;
- erases null, missing, rejected, or forked observations;
- adds a ninth Dome global tab;
- adds an uncontrolled animation loop;
- promotes itself without direct production evidence.

## 20. Source-integration ledger

The scientific sources inform bounded methods rather than runtime authority:

- temporal state tomography informs repeated instrument-declared multi-time
  reconstruction;
- independently tunable double-Moiré systems inform separately conserved but
  measurably coupled reference layers;
- Moiré-Moiré reconstruction informs global-to-local registry selection and
  shared-layer relaxation;
- phason transport informs controlled susceptibility measurement;
- temporal Kirkwood-Dirac work informs signed residual preservation without
  manufacturing quantum quasiprobabilities;
- indefinite quantum causality and quantum electron quasicrystals remain
  research horizons, not v3.1 claims.

Primary research identifiers are retained in the v0.1 scientific source
document under `source/`.

## 21. Closing law

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

Aperture does not become the Dome. The Dome does not become Ash. Ash does not
become the experiment's mind. Flow-Core does not become an oracle. Relation
does not become identity. The experiment remains auditable because its stations
remain distinct.

Sealed ⟐
