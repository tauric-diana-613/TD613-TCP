# Ash Keep v1.0 Production Demonstration Receipt

## Status

```text
NOT_YET_EARNED
IMPLEMENTATION_IN_PROGRESS
PREVIEW_PENDING
```

This document is a promotion gate, not evidence that promotion has occurred.

Ash Keep v1.0 may be recorded as `IMPLEMENTED_PRODUCTION_DEMONSTRATED` only after a post-merge probe observes the deployed public artifact and a separate promotion commit records immutable evidence identifiers.

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
9. local provider screening performs no provider call and creates no recipient transport;
10. Save Point sealing succeeds;
11. Ash Capsule export, authenticated import, wrong-passphrase hold, and ciphertext-tamper hold succeed;
12. a declared 250-node / approximately 400-edge synthetic Case Map compiles and verifies within the recorded performance threshold;
13. desktop, mobile portrait, mobile landscape, rotation return, and reduced-motion layouts show zero horizontal overflow and no clipped visible controls;
14. the exercised closure path emits no non-read request and no recipient-transport request;
15. browser console and page errors remain empty;
16. screenshots, JSON observation, capsule fixtures, and evidence manifest receive SHA-256 digests;
17. the probe records whether it observed local validation, protected preview, or deployed production;
18. the probe itself keeps `promotion_authorized = false`.

## Required promotion record

A later promotion commit must record:

- deployed base URL;
- deployed runtime commit SHA;
- GitHub Actions workflow run ID;
- evidence artifact ID;
- evidence artifact SHA-256;
- production observation JSON SHA-256;
- desktop screenshot SHA-256;
- mobile portrait screenshot SHA-256;
- mobile landscape screenshot SHA-256;
- probe outcome `PASS`;
- explicit operator closure;
- release-manifest synchronization across generated copies.

The promotion commit must be separate from the implementation or probe-harness commit. A preview deployment, local browser run, green unit test, or successful static build cannot satisfy the production stratum.

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
node scripts/ash-keep-production-probe.mjs
```

## Current ruling

```text
CLOSURE_HARNESS_DESIGNED
PRODUCTION_EVIDENCE_ABSENT
PROMOTION_WITHHELD
```

𝌋‌ U+10D613

Marked ⟐
