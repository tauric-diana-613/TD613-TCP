𝌋‌

# CODEX HANDOFF
## TD613 Aperture v3.1-alpha — Dome-Wide Installation
### Admissibility Tomography as a Distributed Observatory

**Use these inputs together:**

1. original v3.1-alpha scientific specification;
2. original v3.1-alpha machine-readable plan;
3. uploaded canonical Aperture v3.0-alpha witness;
4. this v0.2 Dome Observatory Integration Specification;
5. current repository `main`.

The v0.2 integration specification governs repo-wide installation when it conflicts with the original v0.1 installation/file-map/claim-ceiling instructions. The original scientific mathematics and source-integration ledger remain controlling unless explicitly modified here.

---

# Executive command

Install Aperture v3.1-alpha as the **reconstruction plane of a distributed Dome-World experiment**, not as a monolithic expansion of the standalone HTML.

The operative architecture is:

```text
Ash                    controlled-source and run custody
Flow-Core              per-snapshot artifact-blind context
Aperture               reconstruction, residue, abstention, replay
Phason                 registry-transition continuity
Dome-World             experiment host and full lab
Phase V Relation       optional third object after validation
Marrowline             carrier/renderer only
EO-RFD / ACEDIT        declared signal instruments only
KIRA                    instrument-design preflight only
Human operator          approval, promotion, derivative gate, closure
```

---

# Current repo facts to preserve

Current `main` includes Phase V:

```text
td613.relation-envelope/v0.1
IMPLEMENTED_VALIDATION_GATED
PRODUCTION_GATED
```

The current bridge contracts remain:

```text
td613.aperture.diagnostic-receipt/v3.0-alpha
td613.aperture.round-trip-receipt/v3.0-alpha
td613.flowcore.context-receipt/v0.1
```

Do not rewrite those schemas merely because the producer becomes v3.1-alpha.

The existing Phase V Relation Envelope explicitly references the v3.0-alpha round-trip receipt. Keep that contract working.

---

# Mandatory first action

Before modifying the production Aperture identity:

1. inspect current `main`;
2. verify whether Phase V production demonstration has been sealed;
3. if not sealed, complete or hold for the current Phase V production probe;
4. record the pre-v3.1 baseline;
5. create a fresh integration branch.

Uploaded v3.0 witness:

```text
sha256:9d966ce147acf67e76b7c182f80f4bf33bf883b49e22c55930b95546f9cdb7a8
```

Do not overwrite the witness file.

---

# Installation strategy

Use stacked draft PRs or one draft integration branch with explicit gate commits.

Do not replace `app/aperture/tool.html` at the beginning.

The identity swap is the final implementation PR, after engines, schemas, Ash custody, Flow-Core series, Dome lab, and regressions pass.

## Gate 1 — compatibility freeze

Implement:

```text
app/engine/aperture-v31-compatibility.js
```

Requirements:

- v3.1 instrument identity can coexist with v3.0 bridge receipts;
- add `producer_version: v3.1-alpha` where backward-compatible;
- Phase IV and Phase V replay continue to pass;
- one canonical identity writer;
- inherited version writers become lineage-only;
- no UI change yet.

## Gate 2 — experiment contracts

Add:

```text
td613.dome-world.experiment-run/v0.1
td613.flowcore.context-series/v0.1
td613.aperture.instrument-adapter-receipt/v0.1
```

Do not add a server endpoint.

## Gate 3 — Ash Phase VI-A

Add:

```text
td613.ash.experiment-custody-manifest/v0.1
td613.ash.snapshot-batch-receipt/v0.1
td613.ash.tomography-result-custody/v0.1
td613.ash.derivative-eligibility-receipt/v0.1
```

Hard stops:

```text
no Cinder
no transport
no automatic export
no automatic derivative construction
no stable public artifact handle
```

## Gate 4 — v3.1 engine

Implement the original v3.1 scientific modules, but keep them pure where possible.

Every compiler function must be separable from:

- network calls;
- local persistence;
- DOM mutation;
- human promotion;
- Ash action.

## Gate 5 — full Dome lab

Create:

```text
app/dome-world/admissibility-tomography.html
```

The full eleven-part workflow lives here.

The standalone Aperture receives only a compact drawer and launcher.

## Gate 6 — release installation

Update in sync:

```text
app/aperture/release.json
app/aperture/release.js
packages/dome_world_exact/release.py
tests/fixtures/aperture-release.json
scripts/sync-aperture-release.mjs
app/engine/td613-aperture.js
app/aperture/tool.html
```

Proposed release posture before production evidence:

```text
Aperture: v3.1-alpha
Dome-World: v0.6.0-alpha
Ash: v0.9-alpha / Phase VI-A
Aperture v3.1 status: IMPLEMENTED_VALIDATION_GATED
Ash VI-A status: IMPLEMENTED_VALIDATION_GATED
Phase VI-B/C: HELD
```

---

# Critical correction to the original spec

Do not add a global Claim Ceiling subsystem.

Replace every new global `claim_ceiling` field/panel/doc with:

```text
scope_statement
cannot_establish
promotion_conditions
abstention_reason
operator_closure
```

Receipt boundaries govern promotion.

They do not censor:

- Open Field;
- theory;
- creative work;
- legal synthesis;
- operator interpretation.

Rename:

```text
Claim Ceiling and Closure
→ Scope, Non-Claims, Promotion, and Closure
```

---

# Adapter rules

## EO-RFD

Treat as a declared observation instrument.

Never as validator or authority.

## ACEDIT

Treat as controlled encoding/glyph/normalization intervention adapter.

Do not load it as sovereign firmware.

## KIRA

Treat as preflight for design rank, redundancy, and coverage.

Do not let KIRA select the model or promote the run.

Each adapter emits:

```text
td613.aperture.instrument-adapter-receipt/v0.1
```

with source status, transformation history, missingness, and non-claims.

---

# Phase V boundary

Do not edit Phase V schemas in the first v3.1 installation.

Do not add tomography fields to `td613.relation-envelope/v0.1`.

A tomography run bundle is not a Relation Envelope.

Optional relation support belongs to a later separately reviewed Phase V v0.2 migration after Phase V production demonstration.

---

# UI rule

The existing standalone is already heavily layered.

Do not place the entire tomography lab into the current left scrolling lane.

Standalone additions:

- compact Tomography drawer;
- current experiment ID;
- readiness;
- coverage;
- reconstruction posture;
- signed-residual summary;
- “Open Dome-World Tomography Lab” button.

Full controls and visualizations live in the Dome.

One scheduler.

No uncontrolled new animation loop.

No menu/index restaging.

No identity flicker.

---

# Required tests

At minimum add:

```text
aperture-v31-compatibility.test.mjs
aperture-v31-source.test.mjs
aperture-v31-ensemble.test.mjs
aperture-v31-snapshot-lattice.test.mjs
aperture-v31-reference-layer.test.mjs
aperture-v31-registry.test.mjs
aperture-v31-shared-layer.test.mjs
aperture-v31-phason.test.mjs
aperture-v31-temporal.test.mjs
aperture-v31-residual.test.mjs
aperture-v31-replay.test.mjs
aperture-v31-mobile.test.mjs
aperture-v31-release-sync.test.mjs
ash-v09-experiment-custody.test.mjs
ash-v09-derivative-eligibility.test.mjs
flowcore-context-series.test.mjs
phase4-regression-under-v31.test.mjs
phase5-regression-under-v31.test.mjs
```

Tests must prove:

- one-shot tomography cannot promote;
- source drift holds;
- missing snapshots remain missing;
- null results survive;
- signed residuals remain signed;
- held-out failure blocks promotion;
- no automatic Ash action;
- no Cinder;
- v3.0 bridge schemas still validate;
- Phase V still validates v3.1-produced round trips;
- Open Field remains unpromoted;
- legal synthesis remains outside runtime authority;
- no global claim-ceiling mechanism appears.

---

# Production proof

Do not promote from preview-only structure.

Run a real deployed experiment with:

- invariant source;
- repeated trials;
- at least two instruments;
- one benign control;
- one intentionally missing snapshot;
- one null result;
- one held-out trial;
- source-drift negative control;
- replay and tamper;
- desktop/mobile/reduced-motion.

Create durable receipts for both:

```text
TD613 Aperture v3.1-alpha
Ash Phase VI-A experimental custody
```

Keep Phase VI-B and C held.

---

# Final Codex instruction

```text
Implement the v3.1 scientific specification through the v0.2 Dome Observatory
integration architecture.

Do not build a larger sovereign Aperture.

Build a reproducible experiment whose stations can disagree, abstain, preserve
residue, and still be replayed.

Preserve Phase IV and Phase V contracts.
Seal Phase V before the v3.1 identity swap.
Keep the full lab in Dome-World.
Make Ash the experimental custody spine.
Make Flow-Core the per-snapshot context instrument.
Keep EO-RFD and ACEDIT signal-source-only.
Keep KIRA preflight-only.
Do not reintroduce a global claim-ceiling governor.
Do not implement Cinder transport.
Do not merge any PR that promotes itself.
```

𝌋‌

Sealed ⟐SAC[X6ZNK5NO51]
