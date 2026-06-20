# TD613 Hush Packet Roadmap

This document records the current Hush packet-transfer state and next implementation boundaries.

It is inventory and release-discipline guidance. It does not add runtime behavior, provider dispatch behavior, UI wiring, Mask Studio packet sealing, or EO-RFD firmware claims.

## Covenant and lane

- Covenant display: Blood Rite 613
- Route posture: containment on, mirror logic off
- Writerly lane: 𝌋
- Filing mark: ⟐SAC[X6ZNK5NO51]

## Packet discipline ancestor

Safe Harbor is treated as the packet discipline ancestor for Hush work:

- Phase 9.1 maintenance seal
- Phase 9.1B UI/export surface wiring
- Phase 9.1C SHI + packet restore gate
- Phase 9.1C hash guard via PR #147 / commit `d82808ba424944a881314db024bb0fdef85f2040`
- Cleanup note via PR #148

Safe Harbor restore doctrine remains distinct from Hush: Safe Harbor uses SHI + Safe Harbor packet semantics; Hush must not use SHI as a mask, contract, provider-log, pair, stylometry-audit, adversarial-audit, or release/default identifier.

## Hush seated foundation

Customizer packetization created the first Hush packet-transfer landing:

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

## Phase 4 stylometry audit foundation

Phase 4 is the first chamber that formalizes where the stylometry engine's audit surfaces belong.

But Phase 4 is not yet the full execution engine.

Current Phase 4 foundation:

- packet builder
- validator
- docs
- tests
- release recommendation law
- risk posture
- claim limits
- hash replay
- local-private-raw release discipline

Not yet implemented in Phase 4 foundation:

- pair bridge
- feature extraction runner
- direct stylometry execution
- adversarial stylometry packet
- adversarial runner
- UI integration
- Mask Studio packet integration
- EO-RFD interface integration

This distinction matters. The Phase 4 packet can hold and validate stylometric audit surfaces. It can enforce claim limits, replay hashes, inspect raw-text exposure, block proof overclaims, and route local-private-raw audits away from silent acceptance. It does not yet run the deeper stylometry measurement engine itself.

The next technical step is therefore not more packet decoration. The next step is direct wiring:

```text
contract-log pair -> stylometry audit input -> bounded feature extraction -> metric profile -> release recommendation -> adversarial audit route where needed
```

## Phase 4 merged PR trail

- PR #160 — Add Hush Stylometry Audit Packet v1 foundation
- PR #161 — Hotfix Hush stylometry audit defaults
- PR #162 — Respect explicit stylometry release actions
- PR #163 — Hotfix Hush stylometry local-private-raw release action

PR #163 completed the remaining Phase 4 fallback repair.

When a caller explicitly supplies:

```text
audit_input_profile.audit_mode = "local-private-raw"
release_recommendation.release_class = "release-safe"
```

but omits `release_recommendation.next_action`, the fallback now routes to:

```text
run-adversarial-audit
```

rather than `accept`.

The corrected fallback order is now:

```text
block-release -> block
revise-before-release -> revise
insufficient / response-hash-only -> collect-more-evidence
local-private-raw -> run-adversarial-audit
release-safe -> accept
default -> run-adversarial-audit
```

Explicit caller-provided `next_action` / `nextAction` remains respected.

This repair matters because `local-private-raw` audit mode may involve sensitive text or private cadence material. A `release-safe` class alone should not silently convert that audit into acceptance. The system now treats `local-private-raw` as a review/adversarial-audit route unless an explicit operator action says otherwise.

## Roadmap order

Do not invert the event chain.

```text
Phase 0: Inventory and surface map
Phase 1: Hush Outgoing Contract Packet v1
Phase 2: Hush API Provider Log Packet v1
Phase 3: Contract-Log Pair Packet v1
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

## Current Implementation Status

### Complete Enough for Current Layer

Phase 0:
  Surface inventory and roadmap complete.

Phase 1:
  Outgoing contract packet complete with validator and hash replay hardening.

Phase 2:
  Provider log packet complete with validator regression expansion.

Phase 3:
  Contract-log pair packet complete with comparator and chain-of-custody repair.

Phase 4 foundation:
  Stylometry audit packet builder/validator/docs/tests are structurally seated, including the local-private-raw release-action hotfix. This layer can now hold and validate stylometric audit surfaces, enforce claim limits, replay hashes, inspect raw-text exposure, and route sensitive audit modes toward review/adversarial audit.

### Still Pending

Phase 4 pair bridge:
  Convert contract-log pair packets into stylometry audit inputs.

Phase 4 runner:
  Execute bounded stylometry measurements from feature vectors, redacted summaries, or local-private raw mode.

Phase 4 adversarial packet:
  Counterfeit / overfit / style-laundering / reconstruction-risk packet.

Phase 4 adversarial runner:
  Run adversarial stylometry pressure tests.

UI bridge:
  Not yet.

Mask Studio packet integration:
  Not yet.

EO-RFD interface:
  Not yet.

Hush packet release/default gate:
  Not yet.

## Hush packet release/default gate note

Safe Harbor's public-default gate already exists in the Safe Harbor test surface. What remains pending here is the Hush-side release/default gate: a unified Hush export and public-release discipline covering Customizer packets, outgoing contracts, provider logs, contract-log pairs, stylometry audits, future adversarial audits, EO-RFD interface packets, and Mask Studio packets.

## Next entry condition

The next Phase 4 PR should wire the pair bridge:

```text
hush-stylometry-pair-bridge-v1
```

Goal:

- Convert contract-log pair packets into stylometry audit inputs.
- Preserve pair comparison status, audit routes, provider response hashes, redacted summary hashes, privacy comparison, release comparison, stylometry seeds, and adversarial seeds.
- Block or route review when pair status is blocked, privacy comparison shows raw leak, provider log release is private-text-review, pair release is breach-review, no response evidence exists, or stylometry audit route is absent.
- Avoid pulling raw response text, raw Customizer samples, or invented profile references.

⟐SAC[X6ZNK5NO51]
