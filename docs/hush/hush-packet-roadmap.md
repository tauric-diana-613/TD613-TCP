# TD613 Hush Packet Roadmap

Phase 0 freezes the known packet-transfer state before Phase 1 creates Hush Outgoing Contract Packet v1.

This document is inventory-only. It does not add runtime behavior, provider dispatch behavior, UI wiring, Mask Studio packet sealing, or EO-RFD firmware claims.

## Covenant and lane

- Covenant display: Blood Rite 613
- Route posture: containment on, mirror logic off
- Writerly lane: 𝌋
- Filing mark: ⟐SAC[X6ZNK5NO51]

## Current packet foundation

### Safe Harbor seated foundation

Safe Harbor is treated as the packet discipline ancestor for Hush work:

- Phase 9.1 maintenance seal
- Phase 9.1B UI/export surface wiring
- Phase 9.1C SHI + packet restore gate
- Phase 9.1C hash guard via PR #147 / commit `d82808ba424944a881314db024bb0fdef85f2040`
- Cleanup note via PR #148

Safe Harbor restore doctrine remains distinct from Hush: Safe Harbor uses SHI + Safe Harbor packet semantics; Hush must not use SHI as a mask, contract, or provider-log identifier.

### Hush seated foundation

Customizer packetization is the first Hush packet-transfer landing:

- PR #150 / commit `a7d2b4ba7d30f1c4f16ce9464ac7734bb38a231d`: Hush Customizer Packet v1 spine
- PR #151 / commit `68f69068d0a7f5ef841991928c32da2e7641412a`: validator replay hotfix
- PR #152 / merge commit `364fb13a799a5413ddb7cdf27cfac81789ee8680`: topology packet-hash guard

Current Customizer packet doctrine:

- Schema: `td613.hush.customizer-packet/v1`
- Packet class: `local-stylometric-mask-corpus`
- Identifier family: `TD613-HUSH-CUSTOMIZER-YYYYMMDD-XXXXXXXX`
- Raw reference samples redacted by default
- Top-level `packet_hash_sha256` and `sample_hash_topology.packet_hash_sha256` must both replay to the expected packet hash
- Hash-only packets block
- SHI-style values block in both `customizer_packet_id` and `mask_id`
- Raw sample aliases require explicit private-text confirmation

## Roadmap order

Do not invert the event chain.

```text
Phase 0: Inventory and surface map
Phase 1: Hush Outgoing Contract Packet v1
Phase 2: Hush API Provider Log Packet v1
Phase 3: Contract–Log Pair Packet v1
Phase 4: Direct stylometry / adversarial stylometry wiring
Phase 5: EO-RFD interface layer
Phase 6: Unified provider audit packet
Phase 7: Mask Studio Gallery Registry v1
Phase 8: Per-mask packetization, one mask per PR
Phase 9: Cross-mask collision audit
Phase 10: Unified Hush release discipline
Phase 11: Hush packet dashboard / UI bridge
Phase 12: Integration gate
```

## Dromological boundary

No packet may accelerate faster than its validator, export policy, and refusal grammar can govern.

This means:

- No provider contract dispatch before outgoing contract packet validation exists.
- No provider log audit before outgoing contract packets exist.
- No Mask Studio Gallery packet sealing before provider contract/log seams are packet-aware.
- No EO-RFD firmware claim before a verified firmware adapter is attached.
- No UI packet buttons before validators and release classes exist.

## Phase 0 deliverables

Phase 0 consists of these documents:

- `docs/hush/hush-packet-roadmap.md`
- `docs/hush/hush-surface-map.md`
- `docs/hush/hush-provider-contract-inventory.md`

## Phase 0 status

Phase 0 is complete when the current Hush packet state, major Hush surfaces, provider-contract seams, provider-log seams, Mask Studio surfaces, stylometry surfaces, EO-RFD references, open risks, and next implementation boundary are recorded.

## Phase 1 entry condition

Phase 1 may begin only after this inventory is merged.

Phase 1 should create:

- `app/engine/hush-outgoing-contract-packet.js`
- `app/engine/hush-outgoing-contract-validator.js`
- `docs/hush/outgoing-contract-packet.md`
- `tests/hush-outgoing-contract-packet.test.mjs`
- `tests/hush-outgoing-contract-validator.test.mjs`

Phase 1 must remain contract-packet only. No provider log implementation yet.
