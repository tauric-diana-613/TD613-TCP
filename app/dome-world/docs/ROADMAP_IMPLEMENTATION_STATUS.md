# Roadmap Implementation Status

This ledger separates **planned**, **designed**, **implemented**, **hardened**, and **held** work so a merged pull request cannot silently promote a roadmap aspiration into an operational claim.

| Phase | Status | Repository evidence | Remaining gate |
|---|---|---|---|
| 0 · Baseline / contracts | **Implemented + hardened** | contract ledger, split endpoint inventory, Vercel routes, regression tests, deployment probe | rerun live probe after each custody release |
| 1 · Local Commitment | **Implemented + hardened** | browser SHA-256 kernel, L0/L1 endpoint, strict server validation, stale-selection guard | continuing regression coverage |
| 2 · Digest / receipt spine | **Implemented; hardening gated by Phase 2 CI** | TD613-CJ-1 browser/Python modules, frozen vectors, v0.8 schemas, register/replay/migrate runtime, canonical UI | green Phase 2 CI and post-merge live probe |
| 3 · Flow-Core instrumentation | **Planned** | current weather remains modeled one-way context | sensor/source registry, uncertainty, controls, abstention |
| 4 · Reciprocal bridge | **Designed in Aperture; API deferred** | Aperture v3 reciprocal receipt contracts | server operations and replayable round-trip receipts |
| 5 · Relation Envelope | **Landing zone designed; runtime deferred** | Aperture relation contract / Phason jurisdiction | route-scoped HMAC, nonce lifecycle, local-only runtime |
| 6 · Human-gated derivatives | **Held** | Cinder UI disabled; plaintext fragment aliases rejected | client-side/destination-bound Cinder transport and shared human gate |
| 7 · Provenance adapters | **Planned** | none operational | independent signature/time/inclusion adapters |
| 8 · Privacy research | **Open Field only** | no operational authority | narrow predicates and formal threat models |
| 9 · Validation / release | **Partially instantiated** | phase-specific CI, deploy hygiene, bounded probes | mobile parity and release/rollback receipt |

## Phase 2 promotion boundary

Phase 2 may be called operational only after its pull-request gates pass. Until then, the code is implemented on the repair branch while the status remains validation-gated.

The implementation introduces three separate comparison strata:

```text
artifact_digest ≠ manifest_digest ≠ receipt_digest
```

The relation means non-equivalence, not hierarchy. None of the three establishes identity, authorship, possession, authenticity, permission, truth, or trusted time.

## No silent promotion

- Phases 0 and 1 remain completed and hardened.
- Phase 2 adds only canonical digest and migration machinery.
- Flow-Core instrumentation, reciprocal server receipts, and Relation Envelope runtime remain deferred.
- Cinder transport remains held.
- No new claim-ceiling mechanism is introduced; legacy vocabulary remains frozen for separate review.
