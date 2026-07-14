# Ash Keep v1.0 Production Demonstration Receipt

## Status

```text
NOT_YET_EARNED
IMPLEMENTATION_IN_PROGRESS
PREVIEW_PENDING
```

This document is a promotion gate, not evidence that promotion has occurred.

Ash Keep v1.0 may be recorded as `IMPLEMENTED_PRODUCTION_DEMONSTRATED` only after a post-merge probe observes the deployed public artifact and a separate promotion commit records immutable evidence identifiers.

## Instrument and fixture separation

The canonical probe remains `scripts/ash-keep-production-probe.mjs`.

The executable entrypoint is `scripts/run-ash-keep-production-probe.mjs`. The runner creates an ephemeral runtime copy and injects one declared synthetic operator-selected excerpt after reload. This is required because an unkept draft correctly does not survive as Ash custody merely because it once appeared in the demo interface.

The runner must emit `td613.ash-keep.production-probe-fixture-manifest/v0.1` containing:

- canonical probe SHA-256;
- ephemeral runtime probe SHA-256;
- selected-excerpt SHA-256 and character count;
- fixture class `SYNTHETIC_OPERATOR_SELECTED_EXCERPT`;
- `source_mutated = false`;
- `runtime_copy_ephemeral = true`;
- `promotion_authorized = false`.

Instrument source, operator-selected test material, and resulting observation remain separate objects.

## Post-deployment observer route

The automatic deployed observation begins only after the repository workflow named `Test and deploy static app` completes successfully on `main`.

The `workflow_run` event supplies the deployed commit SHA and upstream deployment workflow-run ID. The Ash Keep observer must check out that exact commit, wait until `https://td613.com/dome-world/ash-keep.html` exposes the Ash Keep runtime, and then run the canonical probe through the declared fixture runner.

The observer must emit `td613.ash-keep.deployment-observer-context/v0.1` containing:

- observed base URL;
- observed runtime commit SHA;
- upstream deployment workflow-run ID;
- observer workflow-run ID and attempt;
- triggering event class;
- source status `DEPLOYED_OBSERVATION`;
- `promotion_authorized = false`;
- observer-context SHA-256.

A deployment workflow success is a trigger condition, not production evidence by itself. A deployed probe `PASS` is evidence eligible for later operator closure, not authority to alter the release manifest. The observer therefore reasserts `PREVIEW_PENDING` and `NOT_YET_EARNED` even after preserving a successful deployed evidence bundle.

Manual dispatch remains available only when an operator supplies both a deployed base URL and the exact confirmation phrase `RUN_DEPLOYED_OBSERVATION`. Manual and automatic observer lanes share the same non-promotion boundary.

## Required deployed observations

The production probe must observe all of the following against the deployed runtime:

1. a clean browser profile creates no Case Map, local pointer, or recipient request before operator action;
2. demo or operator-created Case Map data persists in IndexedDB and restores after reload with the same Case Map digest;
3. localStorage contains only the current-case pointer and compact interface preferences, never Case Map content, Room keys, Route Memory, private chronology, aliases, or raw records;
4. multiple Rooms and at least one cross-Room relationship remain locally inspectable;
5. Route Memory appends an exact `WHAT_ACTUALLY_LEFT` successor entry;
6. a browser-worker Rebuild Test preserves benign control, held-out observation, componentwise exposure, null real-surveillance probability, and `automatic_hold = false`;
7. Rebuild Test replay verifies without making a network call or reconstructing graph content;
8. exact release binding verifies while changed version and changed route remain ineligible;
9. local provider screening receives the declared selected excerpt, performs no provider call, and creates no recipient transport;
10. Save Point sealing succeeds;
11. Ash Capsule export, authenticated import, wrong-passphrase hold, and ciphertext-tamper hold succeed;
12. a declared 250-node / approximately 400-edge synthetic Case Map compiles and verifies within the recorded performance threshold;
13. desktop, mobile portrait, mobile landscape, rotation return, and reduced-motion layouts show zero horizontal overflow and no unreachable clipped visible controls; intentionally scrollable navigation lanes remain separately recorded;
14. the exercised closure path emits no non-read request and no recipient-transport request;
15. browser console and page errors remain empty;
16. screenshots, JSON observation, fixture manifest, deployment observer context, capsule fixtures, and evidence manifest receive SHA-256 digests;
17. the probe records whether it observed local validation, protected preview, or deployed production;
18. the probe, fixture runner, and deployment observer keep `promotion_authorized = false`.

## Required promotion record

A later promotion commit must record:

- deployed base URL;
- deployed runtime commit SHA;
- upstream deployment workflow-run ID;
- deployed observer workflow-run ID and attempt;
- deployment observer-context SHA-256;
- evidence artifact ID;
- evidence artifact SHA-256;
- canonical probe SHA-256;
- runtime probe SHA-256;
- selected-excerpt SHA-256;
- production observation JSON SHA-256;
- desktop screenshot SHA-256;
- mobile portrait screenshot SHA-256;
- mobile landscape screenshot SHA-256;
- probe outcome `PASS`;
- explicit operator closure;
- release-manifest synchronization across generated copies.

The promotion commit must be separate from the implementation, probe-harness, observer-routing, or deployed-observation commits. A preview deployment, deployment workflow success, local browser run, green unit test, or successful static build cannot satisfy the production stratum.

## Boundaries

Even after a successful production demonstration, the receipt cannot establish:

- identity;
- authorship;
- ownership;
- permission;
- possession beyond the declared local observation;
- confidentiality at an external provider;
- resistance to every possible Reader;
- real surveillance probability;
- trusted time;
- final-recipient delivery;
- deletion from any external system;
- universal privacy or anonymity.

The probe grants no release, transport, prediction, automatic hold, automatic Ash action, or Open Field promotion authority.

## Canonical invocation

```bash
TD613_BASE_URL=https://td613.com \
TD613_ARTIFACT_DIR=artifacts/ash-keep-production-closure \
TD613_PROBE_RUNTIME_DIR=artifacts/ash-keep-probe-runtime \
node scripts/run-ash-keep-production-probe.mjs
```

## Current ruling

```text
CLOSURE_HARNESS_IMPLEMENTED_VALIDATION_GATED
POST_DEPLOYMENT_OBSERVER_DESIGNED
PRODUCTION_EVIDENCE_ABSENT
PROMOTION_WITHHELD
```

𝌋‌ U+10D613

Marked ⟐
