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
- observer workflow-run URL;
- observer status context;
- triggering event class;
- source status `DEPLOYED_OBSERVATION`;
- `promotion_authorized = false`;
- observer-context SHA-256.

A deployment workflow success is a trigger condition, not production evidence by itself. A deployed probe `PASS` is evidence eligible for later operator closure, not authority to alter the release manifest.

The observer now preserves the release posture declared by the exact checked-out commit. It does not hardcode preview as the only lawful state. The release-posture verifier admits exactly two coherent states:

1. `IMPLEMENTATION_IN_PROGRESS / PREVIEW_PENDING`, paired with `NOT_YET_EARNED` and `PROMOTION_WITHHELD`;
2. `IMPLEMENTED_PRODUCTION_DEMONSTRATED / PRODUCTION_DEMONSTRATED`, paired with a durable production receipt and explicit operator closure.

Every hybrid or unrecognized state holds for repair. Both coherent states require `transport = false` and `automaticCinder = false`.

Manual dispatch remains available only when an operator supplies both a deployed base URL and the exact confirmation phrase `RUN_DEPLOYED_OBSERVATION`. Manual and automatic observer lanes share the same non-promotion boundary.

## Discoverable observer status

The observer publishes one fixed legacy commit status context on the exact observed commit:

```text
Ash Keep Deployed Observation
```

The status may be:

- `pending` while the deployed assay is running;
- `success` after the deployed assay and posture verification complete;
- `failure` when any observer or evidence-preservation step holds for repair;
- `error` only for an explicit status-publication error class.

The status target URL points to the observer workflow run. This makes the deployed evidence route discoverable without guessing run identifiers or granting the observer write access to repository contents.

The bounded publisher is `scripts/publish-ash-keep-observer-status.mjs`. It receives only the GitHub token, repository, observed commit SHA, observer workflow-run URL, bounded status state, optional receipt path, and a description limited to GitHub’s 140-character field.

Each publication may emit a durable **status-publication receipt** under `td613.ash-keep.observer-status-publication/v0.2` containing:

- fixed status context;
- terminal or pending state;
- bounded description;
- observer workflow-run target URL;
- exact observed commit SHA;
- GitHub status ID;
- GitHub-created and updated timestamps when returned;
- source status `OBSERVED_GITHUB_COMMIT_STATUS`;
- `promotion_authorized = false`;
- receipt SHA-256.

Receipt paths must remain inside `artifacts/`. The workflow preserves pending, success, or failure status-publication receipts inside the deployed evidence artifact, together with the observer context, probe output, screenshots, fixture manifest, and release-posture verification.

A commit status is a navigational receipt and outcome signal. It is not a production receipt, promotion act, trusted timestamp, identity proof, or substitute for the preserved evidence artifact. Status publication receives `statuses: write`; repository contents remain read-only.

## Release-posture verification

The executable posture contract is `scripts/assert-ash-keep-release-posture.mjs`.

It emits `td613.ash-keep.release-posture-verification/v0.1` with:

- Ash version and phase;
- release status and production status;
- resolved posture;
- transport and Cinder boundaries;
- durable receipt SHA-256;
- `posture_preserved = true`;
- `promotion_authorized = false`;
- verification SHA-256.

The deployed observer preserves this receipt in its evidence artifact. This allows the same observer to audit both pre-promotion and post-promotion deployments without laundering one posture into the other.

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
16. screenshots, JSON observation, fixture manifest, deployment observer context, status-publication receipt, release-posture verification, capsule fixtures, and evidence manifest receive SHA-256 digests;
17. the probe records whether it observed local validation, protected preview, or deployed production;
18. the probe, fixture runner, deployment observer, status publisher, and posture verifier keep `promotion_authorized = false`.

## Required promotion record

A later promotion commit must record:

- deployed base URL;
- deployed runtime commit SHA;
- upstream deployment workflow-run ID;
- deployed observer workflow-run ID and attempt;
- deployed observer workflow-run URL;
- observer status context, terminal state, and status ID;
- terminal status-publication receipt SHA-256;
- deployment observer-context SHA-256;
- release-posture verification SHA-256;
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

The promotion commit must be separate from the implementation, probe-harness, observer-routing, status-publication, posture-verification, or deployed-observation commits. A preview deployment, deployment workflow success, commit status, local browser run, green unit test, or successful static build cannot satisfy the production stratum.

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
POST_DEPLOYMENT_OBSERVER_IMPLEMENTED_TRIGGER_GATED
OBSERVER_STATUS_RECEIPTS_IMPLEMENTED_VALIDATION_GATED
RELEASE_POSTURE_VERIFIER_IMPLEMENTED_VALIDATION_GATED
PRODUCTION_EVIDENCE_OBSERVED_PENDING_STATUS_RECEIPT_REPLAY
PRODUCTION_PROMOTION_WITHHELD
```

𝌋‌ U+10D613

Marked ⟐
