# Roadmap Implementation Status

This ledger separates **planned**, **designed**, **implemented**, **hardened**, and **held** work so a merged pull request cannot silently promote a roadmap aspiration into an operational claim.

| Phase | Status | Repository evidence | Remaining gate |
|---|---|---|---|
| 0 · Baseline / contracts | **Implemented + hardened** | roadmap, contract ledger, split endpoint inventory, Vercel routes, regression tests, probe | live post-deploy probe after merge |
| 1 · Local Commitment | **Implemented + hardened** | browser SHA-256 kernel, L0/L1 endpoint, schemas, strict server validation, stale-selection guard, replay tests | live post-deploy probe after merge |
| 2 · Digest / receipt spine | **Planned** | dependency named only | canonical JSON, manifest digest, receipt digest, migration tests |
| 3 · Flow-Core instrumentation | **Planned** | current weather remains modeled one-way context | sensor/source registry, uncertainty, controls, abstention |
| 4 · Reciprocal bridge | **Designed in Aperture; API deferred** | Aperture v3 reciprocal receipt contracts | server operations and replayable round-trip receipts |
| 5 · Relation Envelope | **Landing zone designed; runtime deferred** | Aperture relation contract / Phason jurisdiction | route-scoped HMAC, nonce lifecycle, local-only runtime |
| 6 · Human-gated derivatives | **Held** | Cinder UI disabled; plaintext fragment aliases rejected | client-side/destination-bound Cinder transport and shared human gate |
| 7 · Provenance adapters | **Planned** | none operational | independent signature/time/inclusion adapters |
| 8 · Privacy research | **Open Field only** | no operational authority | narrow predicates and formal threat models |
| 9 · Validation / release | **Partially instantiated** | Phase 1 CI, deploy hygiene, regression receipts | live probes, mobile parity, release/rollback receipt |

## Post-merge audit finding

The first Phase 0–1 merge established the core local-commitment path, but three review findings remained unresolved: direct legacy-engine bypass, contradictory L1 boundary normalization, and stale file-selection races. A later merge recorded those repairs in prose but did not implement all of them. This repair lane closes the code seams and updates the status ledger accordingly.

## No silent promotion

- Phase 0 and Phase 1 are the only completed phases.
- Aperture’s reciprocal bridge and Relation Envelope are design/runtime landing zones, not deployed Dome-World API authority.
- Cinder transport is held rather than represented as safe.
- No new claim-ceiling mechanism is introduced; legacy vocabulary remains frozen for separate review.
