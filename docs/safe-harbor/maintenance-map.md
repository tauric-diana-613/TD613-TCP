# TD613 Safe Harbor Maintenance Map

Phase 9.1 exists so future work can patch the right room without making PR169 swallow another chandelier.

## Authority chain

- Phase 5: replay hardening and quarantine
- Phase 6: native spine, hash topology, compose purity
- Phase 7: outside witnesses and Step 1
- Phase 8: public-default gate
- Phase 9: release discipline
- Phase 9.1: maintenance seal, export/clipboard/UI surface discipline
- Phase 9.1B: policy wiring into PR169, verify room, offline capsule, manifests, and UI surfaces
- Phase 9.1C: SHI + packet restore gate with hash guard

## Landing trail

- PR #143 seated the Phase 9.1 maintenance foundation.
- PR #144 seated Phase 9.1B UI surface wiring.
- PR #145 seated the first Phase 9.1C SHI + packet restore validator.
- PR #146 was opened as the restore hash-guard hotfix, but the normal merge endpoint was blocked by the platform/tool safety layer; it was closed unmerged as a duplicate after the equivalent fix landed.
- PR #147 / commit `d82808ba424944a881314db024bb0fdef85f2040` is the canonical Phase 9.1C hash-guard landing on `main`.

Future agents should treat PR #147, not PR #146, as the sealed hash-guard source of truth.

## Module map

- `safe-harbor-rich-stylometry-adapter.js`: rich lane stylometry
- `safe-harbor-stylometry-v3.js`: v3 / SH3 forensic credential
- `safe-harbor-authority-verifier.js`: v2, v3, hash, and authority replay
- `safe-harbor-phase5-replay-hardening.js`: contradiction and quarantine battery
- `safe-harbor-native-finalizer.js`: native/export/legacy finalization
- `safe-harbor-step1-countersignature.js`: Step 1 refusal grammar
- `safe-harbor-outside-witness-alignment.js`: outside witness roll call
- `safe-harbor-public-default-gate.js`: Phase 8 public display gate
- `safe-harbor-release-discipline.js`: Phase 9 release class and claim limits
- `safe-harbor-policy-constants.js`: shared claim, UI, covenant, and status constants
- `safe-harbor-raw-text-policy.js`: shared raw-text sealing inspection
- `safe-harbor-export-policy.js`: export and public-safe envelope policy
- `safe-harbor-clipboard-policy.js`: clipboard class labels and checks
- `safe-harbor-surface-registry.js`: user surface and copy/export control registry
- `safe-harbor-packet-pipeline.js`: Phase 9.1 pipeline orchestration
- `safe-harbor-pr169-packet-vault-direct.js`: UI/session/export bridge
- `safe-harbor-reopen-validator.js`: Phase 9.1C SHI + packet restore validator and hash guard
- `safe-harbor-session-gate.js`: ingress restore shim for SHI + packet validation

## Restore gate rule

Normal user restore requires a minted SHI # plus an uploaded Safe Harbor packet. The packet SHI must match `issuance.badge_number` and any hash-bearing restore must use `sha256:<64_hex>` format. A hash-only packet is not enough to restore Safe Harbor.

Legacy v1 sealed packets remain a compatibility path through the `TD613-SH-SEAL-HANDSHAKE/v1:` marker, but current restore should prefer valid hash plus stronger Safe Harbor authority such as Phase 8 public gate and Phase 9 release discipline.

## Edit rule

Before changing any Safe Harbor authority surface, run:

```bash
npm run test:safe-harbor:current
```

For restore-gate work, also run:

```bash
npm run test:safe-harbor:phase9.1c
```

## Do not casually edit

- public default root
- v3 public role
- raw-text sealing rules
- claim ceilings
- Step 1 refusal conditions
- Phase 5 quarantine conditions
- Phase 8 public gate decisions
- Phase 9 release classes
- Phase 9.1C restore hash guard
- Khona‌lit-po ZWNJ spelling
- EO-RFD meaning

## EO-RFD

`EO` means the EO-RFD route conscience / context lane. Current state is
`interface_context`; current claim authority is `design_signal`. It is not
government authority.
