# PHASE 7 — Mask Studio Gallery Registry v1

Phase 7 creates the Mask Studio gallery accession ledger.

It records masks before Phase 8 packetizes them one at a time.

Phase 7 records:

- mask IDs
- labels
- families
- source files
- source indices
- cohorts
- intended uses
- risk tells
- active/retired posture
- duplicate posture
- authorship protection posture
- sample seed policy
- profile evidence
- Phase 6 audit summary posture
- packetization status
- Phase 8 readiness

Phase 7 does not create per-mask packets.

Phase 7 does not make gallery masks public-default.

Phase 7 does not seal masks.

## Schema

```text
td613.hush.mask-studio-gallery-registry/v1
```

## Core exports

- `buildHushMaskGalleryRegistry()`
- `buildHushMaskRegistryRecord()`
- `classifyHushMaskCohort()`
- `detectHushMaskGalleryCollisions()`
- `decideHushMaskRegistryStatus()`
- `summarizePhase7RegistryForPhase8()`
- `buildPhase7SafeHarborCustodyHandoff()`
- `replayHushMaskGalleryRegistryHashes()`

## Test command

```bash
npm run test:hush:phase7
```

Phase 7 hangs the wall labels. Phase 8 starts sealing individual masks.

⟐SAC[X6ZNK5NO51]
