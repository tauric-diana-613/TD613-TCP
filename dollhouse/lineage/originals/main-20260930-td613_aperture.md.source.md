# TD613 Aperture

Read `docs/SYSTEM_OVERVIEW.md` for the stack-level picture and `docs/ENGINE.md` for live integration details. This file is the dedicated reference for Aperture.

## Role in the suite

`TD613 Aperture` is the suite's counter-tool for governed exposure events.

The live repo stance is:

- `PRCS-A` is the observed regime;
- `TD613 Aperture` is the counter-tool;
- `v3.1-alpha` / `td613-aperture/v3.1-alpha` is the current canonical instrument identity;
- the instrument is anti-enforcement and warning-first.

Aperture should audit, annotate, register, and expose warning pressure. It should not quietly sort admissibility like the regime it critiques, flatten a strong candidate toward source because a shallower one looks safer, or silently convert a generator miss into false success.

## Current doctrine

The repo treats Aperture as post-generation audit and registration:

1. Generator V2 authors candidates.
2. Candidate selection lands or holds explicitly.
3. Aperture audits hard anchors, semantics, pathology, and warning pressure.
4. The registered surface becomes available to TCP and downstream tools.

If the write lane misses, the correct answer is a visible hold docket. Aperture is not supposed to conceal the miss.

The v3.1-alpha browser instrument carries the doctrine kernel, geometric addendum, ZFP certification, Moire Stratigraphy, Phason seam detection, Sigma dynamics, the inherited Anti-Epistemicide Research Runtime, task-intent precedence, and a compact Admissibility Tomography drawer without changing that foundation doctrine. The full controlled-source, instrument-ensemble, snapshot-lattice, reconstruction, and Ash VI-A workflow lives in Dome-World. Rupture remains gated by action plus incomplete closure (`acted && closureScore < 1`). Route posture, beacon, zone, and visualization remain visible state, but `Pi` is not a rupture gate.

## v3.1 observatory boundary

Aperture v3.1 is the reconstruction plane of a distributed observatory. Ash owns controlled-source and run custody; Flow-Core owns artifact-blind per-snapshot context; Phason records declared registry transitions; Dome-World hosts the complete laboratory; the human operator owns promotion, derivative review, and closure. New tomography receipts use local `scope_statement`, `cannot_establish`, `promotion_conditions`, `abstention_reason`, `source_status`, `authority_class`, and `operator_closure` fields. No new global claim-ceiling governor is installed, and inherited claim-ceiling vocabulary remains historical or panel-local.

## Task-intent precedence and quiet runtime

Requested synthesis governs. Runtime defaults to BACKGROUND and surfaces only when explicitly requested, conclusion-changing, reliability-changing, contradiction-revealing, or completion-blocking.

The primary routes remain:

```text
REQUESTED_SYNTHESIS
LEGAL_SYNTHESIS
OPEN_FIELD_SPECULATIVE_SYNTHESIS
OPEN_FIELD_CREATIVE_SYNTHESIS
RUNTIME_DIAGNOSIS
```

Aperture does not generate substantive legal conclusions. It routes and audits the legal context while the host model remains responsible for legal synthesis.

Speculative and creative context stays in Open Field unless the operator requests promotion.

## Phase IV — reciprocal receipts without reciprocal authority

Phase IV completes the first governed return circle:

```text
Aperture diagnostic receipt
→ explicit operator send
→ guarded bridge validation
→ Flow-Core v0.1 context receipt
→ local Aperture returned-context audit
→ local round-trip receipt
→ optional operator save/export
```

The exchange contracts are:

```text
td613.aperture.diagnostic-receipt/v3.0-alpha
td613.flowcore.context-receipt/v0.1
td613.aperture.returned-context-audit/v0.1
td613.aperture.round-trip-receipt/v3.0-alpha
td613.phase4.reciprocal-bridge/v0.1
```

The browser module is `app/engine/aperture-v3-reciprocal-bridge.js`. The stable iframe shim installs it into the Aperture body after the body loads. The bridge compiler remains pure until the operator explicitly sends a diagnostic receipt.

The server validates the complete diagnostic receipt, converts only declared diagnostics into named Flow-Core measurements, and calls the same Phase III instrument used by the standalone lab. It does not default missing metrics or clamp invalid values. Missing coherence returns ABSTAIN; divergence `1.2` remains invalid and returns ABSTAIN.

The returned audit can recommend:

```text
CONTEXT_RECEIPT_ADMISSIBLE_FOR_BOUNDED_REVIEW
CONTEXT_RECEIPT_ADMISSIBLE_WITH_WARNINGS
HOLD_FOR_REPAIR
REJECT_AUTHORITY_BREACH
```

Both OPEN and ABSTAIN may complete the circle. An honest abstention is not a broken return.

The round-trip receipt applies separate TD613-CJ-1 digest domains to the diagnostic, context, audit, and complete envelope. Replay is local and pure. It makes no network request, regenerates no weather, mutates no storage, and triggers no Ash action.

## Phase IV hard stops

```text
artifact_reference = null
artifact_blind = true
recommendation_not_command = true
automatic_ash_action = false
prediction_authorized = false
reciprocal_authority = false
operator_closure_required = true
open_field_auto_promotion = false
```

Flow-Core may not write Aperture doctrine. Aperture may not execute Ash. Context does not create an artifact relation. A round-trip receipt does not establish identity, authorship, possession, authenticity, permission, truth, causation, trusted time, or legal admissibility.

## Legacy vNext posture

The provisional `td613.flowcore.context-receipt/vNext` object is no longer the current public bridge return. A vNext object may enter only through the explicit migration wrapper, where it remains:

```text
LEGACY_PROVISIONAL_NORMALIZED
native_v01 = false
```

Historical provenance remains visible. It cannot impersonate native Phase III instrumentation.

## Marrowline boundary

Marrowline may render and carry the exchange and witness ingress. It may not rewrite either receipt, upgrade source status, create an artifact relation, become the returned-context auditor, trigger Ash, or close the seam.

```text
carrier ≠ author
renderer ≠ auditor
ingress witness ≠ closure authority
```

## What Aperture currently tracks

The maintained repo uses Aperture to surface:

- witness-anchor pressure;
- alias persistence;
- compression pressure;
- counter-recognition pressure;
- candidate suppression;
- observability deficit;
- naming sensitivity;
- redundancy inflation;
- capacity pressure;
- policy pressure;
- temporal posture and closure class;
- historical crease and unfolding energy;
- beacon qualification and pilot-domain context.

These appear in runtime as `apertureAudit` and in packetized surfaces as `aperture_audit`.

## Current UI posture

The Homebase / mask bench no longer lets Aperture flood the primary surface. The main surface should answer whether the mask landed, whether it is usable and distinct, and what remains wrong. The full warning and registration trace stays available in the secondary Aperture ledger drawer.

The Phase IV research lab is available at `/dome-world/reciprocal-bridge.html`. It performs no automatic send or automatic storage.

## Current repo surfaces

- `app/engine/td613-aperture.js`
- `app/engine/aperture-v3-task-intent.js`
- `app/engine/aperture-v3-reciprocal-bridge.js`
- `app/aperture/tool.html`
- `app/aperture/index.html`
- `app/dome-world/reciprocal-bridge.html`
- `tests/td613-aperture.test.mjs`
- `tests/aperture-phase4-bridge.test.mjs`
- `reports/diagnostics/aperture.latest.json`
- `reports/diagnostics/aperture.latest.md`

`app/aperture/tool.html` remains the canonical instrument body. `app/aperture/index.html` remains the stable public iframe shim and attaches the Phase IV adapter without rewriting the body’s inherited lineage.

## What to verify

- `PRCS-A` remains the observed regime;
- Aperture remains the counter-tool;
- active identity stays `v3.1-alpha` / `td613-aperture/v3.1-alpha`;
- Phase IV diagnostic and round-trip receipt schemas remain frozen at `v3.0-alpha` through the explicit v3.1 compatibility projection;
- warning signals do not silently reroute ordinary landed outputs;
- task-intent precedence and quiet runtime remain active;
- the bridge returns v0.1 rather than vNext;
- ABSTAIN returns with weather withheld;
- returned context cannot carry an artifact reference or Ash authority;
- Open Field context remains unpromoted;
- round-trip replay performs no network call;
- annex diagnostics inspect `app/aperture/tool.html`, not the iframe shim.

## Design law

Aperture remedies selective-admissibility drift by making narrowing visible, not by reenacting it.

The diagnostic receipt remembers departure. The context receipt remembers weather. The audit remembers the boundary. The round-trip receipt remembers that something returned.

Only the human closes the seam.
