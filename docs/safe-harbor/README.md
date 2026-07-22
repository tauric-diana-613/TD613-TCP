# TD613 Safe Harbor Docs Index

This folder tracks the current Safe Harbor release doctrine.

## Current chain

1. Phase 5 replay hardening
2. Phase 6 native spine and compose purity
3. Phase 7 outside witnesses
4. Phase 8 public-default gate
5. Phase 9 release discipline
6. Phase 9.1 maintenance seal and UI/export discipline
7. Phase 9.1B UI surface wiring
8. Phase 9.1C SHI + packet restore gate and hash guard
9. Gen3 Stage 1 report constitution and evidence contract
10. Gen3 Stage 2 authorship maturity and null-control engine

## Core docs

- [Gen3 forensic authorship maturity, Blind Custody, Restorative Stylodynamics, and Temporal Bloom specification](./forensic-authorship-maturity-temporal-bloom-spec.md)
- [Gen3 implementation and release traceability ledger](./gen3-implementation-ledger.md)
- [Gen3 Stage 1 validation receipt](./gen3-stage1-validation-receipt.md)
- [Gen3 Stage 2 validation receipt](./gen3-stage2-validation-receipt.md)
- [Blind Custody Challenge specification](./blind-custody-challenge-spec-v0.1.md)
- [Restorative Stylodynamics and Perturbation Invariance Mapping research annex](./restorative-stylodynamics-perturbation-invariance-annex-v0.1.md)
- [Claim limits](./claim-limits.md)
- [Operator protocol](./operator-protocol.md)
- [Verification guide](./verification-guide.md)
- [Replay guide](./replay-guide.md)
- [UI copy policy](./ui-copy-policy.md)
- [Failure modes](./failure-modes.md)
- [Release checklist](./release-checklist.md)
- [UI export surface policy](./ui-export-surface-policy.md)
- [Clipboard policy](./clipboard-policy.md)
- [Verify room policy](./verify-room-policy.md)
- [Offline capsule policy](./offline-capsule-policy.md)
- [EO-RFD glossary note](./eo-rfd-glossary-note.md)
- [Maintenance map](./maintenance-map.md)

## Landing note

Phase 9.1C hash-guard landed through PR #147 / commit `d82808ba424944a881314db024bb0fdef85f2040` after PR #146 was closed as a duplicate because the normal merge endpoint was blocked by the platform/tool safety layer.

Future agents should treat PR #147 as the canonical sealed hash-guard landing.

Gen3 Stage 1 landed through PR #492 / commit `c7d26b86a167c9901cd6ab4de4d3d9b5e6a66718`.

Gen3 Stage 2 is governed by PR #499 and validation run `29956080946`; Release Wave A remains separately gated until the exact merged Stage 2 source commit receives and passes production release review.

## Run before editing Safe Harbor authority surfaces

```bash
npm run test:safe-harbor:current
```

For restore-gate work, also run:

```bash
npm run test:safe-harbor:phase9.1c
```

For the complete Gen3 Wave A core, run:

```bash
npm run test:safe-harbor:gen3:wave-a
```

## Claim ceiling

A TD613 Safe Harbor packet is a custody and replay instrument. It does not prove civil identity, legal identity, public law approval, state recognition, authorship ownership, or v3 supremacy.

The Gen3 research annex may strengthen packet-internal evidence through blinded holdouts, declared controls, controlled perturbations, null models, and entrant countersignature. Those additions do not erase the claim ceiling or convert the PUA glyph into independent proof of identity or universal authorship.

## Covenant key handling

Khona‌lit-po is ZWNJ-sensitive. Do not normalize it in covenant-sensitive contexts.
