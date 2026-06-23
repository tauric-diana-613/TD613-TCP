# Phase 8 Test Matrix

Phase 8.0 tests cover the bench and packet machinery before any individual mask PR begins.

Covered by:

- `tests/hush-phase8-step0-human-stylometric-bench.test.mjs`
- `tests/hush-phase8-per-mask-packet.test.mjs`

Test surfaces:

1. Phase 7 ready queue requires one-mask-per-PR posture.
2. Ready queue blocks raw sample text and public release permission.
3. Calibration includes prompt bench and feature hash.
4. Imperfection ledger preserves allowed asymmetry and forbidden noise.
5. Anti-slop audit flags generic helper voice and stores no candidate text.
6. Per-mask packet builds from exactly one registry record.
7. Packet excludes raw sample text.
8. Packet keeps public-default false.
9. Packet preserves sample seed hash and no-reuse policy.
10. Packet preserves authorship protection and claim ceiling.
11. Packet emits Phase 9 handoff without release permission.
12. Packet hash replay passes.
13. Hash-only packet blocks.
14. Blocked Phase 6 summary blocks packet status.
15. Collision review routes repair.

⟐SAC[X6ZNK5NO51]
