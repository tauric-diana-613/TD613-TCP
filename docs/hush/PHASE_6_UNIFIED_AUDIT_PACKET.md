# PHASE 6 — Hush Unified Audit Packet

Phase 6 creates the Hush Unified Audit Packet: a custody packet where independent evidence lanes sit at the same table.

It records:

- outbound contract lane
- provider/model log lane
- stylometry audit lane
- Phase 5 interface result lane
- relational comparison
- claim ceiling
- hash replay
- Safe Harbor custody handoff
- Phase 7 mask registry summary

It is an audit posture packet, not a release credential.

It does not let any one lane become judge.

## Schema

```text
td613.hush.unified-audit-packet/v1
```

## Statuses

- `clean`
- `warned`
- `blocked`
- `repair_required`
- `unresolved_witness`
- `quarantine`

## Core exports

- `buildHushUnifiedAuditPacket()`
- `compareOutboundContractToProviderLog()`
- `normalizeStylometryAudit()`
- `normalizePhase5InterfaceResult()`
- `decideUnifiedAuditPacketStatus()`
- `replayUnifiedAuditPacketHashes()`
- `buildPhase6SafeHarborHandoff()`
- `buildPhase7MaskRegistryAuditSummary()`

## Doctrine

The contract speaks.

The log answers.

Stylometry checks transformation pressure.

Phase 5 records external signal posture.

Hash replay checks material custody.

Claim ceiling checks ambition.

No witness becomes judge.

No signal becomes proof.

No packet releases itself.

## Test command

```bash
npm run test:hush:phase6
```

⟐SAC[X6ZNK5NO51]
