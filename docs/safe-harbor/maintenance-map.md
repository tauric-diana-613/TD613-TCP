# TD613 Safe Harbor Maintenance Map

Phase 9.1 exists so future work can patch the right room without making PR169 swallow another chandelier.

## Authority chain

- Phase 5: replay hardening and quarantine
- Phase 6: native spine, hash topology, compose purity
- Phase 7: outside witnesses and Step 1
- Phase 8: public-default gate
- Phase 9: release discipline
- Phase 9.1: maintenance seal, export/clipboard/UI surface discipline

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

## Edit rule

Before changing any Safe Harbor authority surface, run:

```bash
npm run test:safe-harbor:current
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
- Khona‌lit-po ZWNJ spelling
- EO-RFD meaning

## EO-RFD

`EO` means EO-RFD route firmware / route-conscience hook lane. It is not executive-order authority.
