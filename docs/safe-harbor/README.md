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

## Core docs

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

## Run before editing Safe Harbor authority surfaces

```bash
npm run test:safe-harbor:current
```

For restore-gate work, also run:

```bash
npm run test:safe-harbor:phase9.1c
```

## Claim ceiling

A TD613 Safe Harbor packet is a custody and replay instrument. It does not prove civil identity, legal identity, public law approval, state recognition, authorship ownership, or v3 supremacy.

## Covenant key handling

Khona‌lit-po is ZWNJ-sensitive. Do not normalize it in covenant-sensitive contexts.
