# PHASE 8.0C — Phase 8.1 Gate Hardening

Phase 8.0C hardens the metric passport layer before the first individual mask packet.

The gate now requires:

- wrapper-only entry through `buildHushPerMaskPacketWithMetricPassport()`
- candidate presence
- candidate hash
- source/candidate separation
- candidate gate in numeric decision
- candidate gate in metric hash replay
- generic baseline fixture bank
- Glitching Pixie pass/fail fixture bank

Phase 8.1 must not treat `buildHushPerMaskPacket()` alone as sufficient.

No candidate means no Phase 8.1 packet.

The source text produces source obligations. The candidate text produces the candidate realization vector.

The two cannot collapse into each other.

⟐SAC[X6ZNK5NO51]
