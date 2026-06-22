# TD613 Hush Surface Map

Phase 0 surface map for the Hush packet-transfer chain.

This document is descriptive inventory. It does not change runtime behavior.

## Current seated packet surfaces

### Customizer packet spine

- `app/engine/hush-customizer-packet.js`
- `app/engine/hush-customizer-packet-validator.js`
- `docs/hush/customizer-packet.md`
- `tests/hush-customizer-packet.test.mjs`
- `tests/hush-customizer-packet-validator.test.mjs`
- package script: `npm run test:hush:customizer-packet`

Observed boundary:

- Customizer packet governs corpus formation and local mask state.
- Customizer packet is not a provider contract.
- Customizer packet is not a provider log.
- Customizer packet is not a Mask Studio packet.

## Hush application surfaces

Potential Hush chamber and UI surfaces identified for later packet bridge review:

- `app/hush.html`
- `app/hush.js`
- `app/hush-phase31-1-original.js`
- `app/hush-persona-gallery.js`
- `app/hush-pr123-strict-undefined-fallback.js`
- `app/hush-patch38.js`

These should be treated as candidate dispatch, UI, mask-selection, fallback, or bridge surfaces until Phase 1/Phase 2 review proves their exact role.

## Hush engine surfaces

Known or suspected engine surfaces relevant to packet transfer:

- `app/engine/hush-custom-mask.js`
- `app/engine/hush-customizer-packet.js`
- `app/engine/hush-customizer-packet-validator.js`
- `app/engine/hush-style-diversity.js`
- `app/engine/release-manifest.js`

Potential future engine surfaces:

- `app/engine/hush-outgoing-contract-packet.js`
- `app/engine/hush-outgoing-contract-validator.js`
- `app/engine/hush-provider-log-packet.js`
- `app/engine/hush-provider-log-validator.js`
- `app/engine/hush-contract-provider-comparator.js`
- `app/engine/hush-stylometry-contract-auditor.js`
- `app/engine/hush-adversarial-stylometry-auditor.js`
- `app/engine/hush-eo-rfd-interface.js`
- `app/engine/hush-mask-gallery-registry.js`
- `app/engine/hush-mask-studio-packet.js`

## Mask Studio / Gallery surfaces

Identified Gallery and Mask Studio-related surfaces:

- `app/hush-persona-gallery.js`
- `app/data/hush-mask-studio-audit-pr150.json`
- `tests/hush-persona-gallery.test.mjs`
- `tests/hush-phase31-visual-system-report.test.mjs`
- `docs/PHASE_11_HUSH_MASK_STUDIO_STATUS.md`

Boundary:

- Gallery registry may list all thirteen masks later.
- Per-mask packetization should be one mask per PR.
- Do not batch-seal all thirteen masks in Phase 0 or Phase 1.

## Stylometry and adversarial surfaces

Identified stylometry/adversarial surfaces:

- `app/hush-pr106-stylometry-ontology-release-guard.js`
- `app/adversarial-bench.mjs`
- `tests/adversarial-bench.test.mjs`
- `tests/hush-phase34-expressive-generation.test.mjs`
- `app/aperture/aperture-hush-bridge.js`
- `app/hush-pr98-aperture-intake.js`
- `app/hush-pr110-recovered-output-rehydrator.js`
- `app/hush-pr111-review-candidate-bridge.js`

Phase 4 should determine which surfaces are direct stylometry engines, which are harnesses, which are bridge layers, and which are historical patches.

Boundary:

- Base stylometry measures intended/observed cadence and mask alignment.
- Adversarial stylometry should function as audit, counterfeit detection, overfit detection, style-laundering detection, and provider-drift detection.
- Adversarial stylometry should not silently rewrite output.

## EO-RFD surfaces

Current repo-visible EO-RFD references appear in Safe Harbor documentation and surface wiring, not as a verified Hush firmware adapter:

- `docs/safe-harbor/eo-rfd-glossary-note.md`
- `docs/safe-harbor/maintenance-map.md`
- `docs/safe-harbor/verify-room-policy.md`
- `docs/safe-harbor/offline-capsule-policy.md`
- `docs/safe-harbor/ui-export-surface-policy.md`
- `app/safe-harbor/app/safe-harbor-surface-registry.js`
- `app/safe-harbor/reference/TD613_verify.html`
- `app/safe-harbor/reference/TD613_offline_capsule.html`

Boundary:

- Hush Phase 5 may create `hush-eo-rfd-interface.js` as a socket/interface.
- Do not claim EO-RFD firmware execution inside Hush until an actual adapter is attached and verified.
- EO means EO-RFD route conscience / context lane in this context, not government authority.

## Safe Harbor non-edit zone for Hush work

Hush packet work should not casually edit:

- Safe Harbor public default root
- Safe Harbor v3 public role
- Safe Harbor raw-text sealing rules
- Safe Harbor claim ceilings
- Safe Harbor Step 1 refusal conditions
- Safe Harbor Phase 5 quarantine conditions
- Safe Harbor Phase 8 public gate decisions
- Safe Harbor Phase 9 release classes
- Safe Harbor Phase 9.1C restore hash guard
- Khona‌lit-po ZWNJ spelling
- EO-RFD meaning

## Test gates currently relevant

Known focused gates:

```bash
npm run test:hush:customizer-packet
npm run test:hush
npm run test:safe-harbor:current
```

Phase 1 should add:

```bash
npm run test:hush:outgoing-contract
```

Do not wire new packet gates into top-level `test` until stable.

## Phase 0 conclusion

The next implementation room is `Hush Outgoing Contract Packet v1`.

The main surface risk is that provider/outgoing request seams are not yet packet-governed. Phase 1 should start there before provider logs, stylometry audits, EO-RFD interface work, or Mask Studio packetization.
