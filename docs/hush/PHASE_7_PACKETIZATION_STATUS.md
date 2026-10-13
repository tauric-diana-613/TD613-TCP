# Phase 7 Packetization Status

Phase 7 tracks packetization posture. It does not perform per-mask packetization.

Allowed statuses:

- `unpacketized`
- `ready_for_phase8`
- `packetized`
- `blocked`
- `deferred`
- `retired`

Canonical masks begin as `unpacketized` and may appear in the Phase 8 handoff when the registry record is valid or warning-only.

Extension masks are recorded but deferred.

Target-register masks carry additional policy fields and require careful review before Phase 8 selection.

Phase 8 must packetize one mask per PR.

⟐SAC[X6ZNK5NO51]
