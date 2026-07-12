# Roadmap Implementation Status

This ledger separates **planned**, **designed**, **implemented**, **hardened**, and **held** work so a merged pull request cannot silently promote a roadmap aspiration into an operational claim.

| Phase | Status | Repository evidence | Remaining gate |
|---|---|---|---|
| 0 · Baseline / contracts | **Implemented + hardened** | contract ledger, split endpoint inventory, Vercel routes, regression tests, deployment probe | rerun live probe after each custody release |
| 1 · Local Commitment | **Implemented + hardened** | browser SHA-256 kernel, L0/L1 endpoint, strict server validation, stale-selection guard | continuing regression coverage |
| 2 · Digest / receipt spine | **Implemented + production-demonstrated** | TD613-CJ-1, v0.8 schemas, register/replay/migrate runtime, tamper and mobile production demo | continuing regression coverage |
| 3 · Flow-Core instrumentation | **Implemented; validation gated** | dedicated context endpoint, v0.1 schema, sensor registry, benign fixtures, abstention, private artifact-blind lab | green Phase III CI, preview inspection, post-merge live probe |
| 4 · Reciprocal bridge | **Preview receipt path active; v0.1 adoption deferred** | Aperture v3 diagnostic receipt and provisional Flow-Core `vNext` return | adopt Phase III v0.1 receipt, round-trip replay, returned-receipt audit |
| 5 · Relation Envelope | **Landing zone designed; runtime deferred** | Aperture relation contract / Phason jurisdiction | route-scoped HMAC, nonce lifecycle, local-only runtime |
| 6 · Human-gated derivatives | **Held** | Cinder UI disabled; plaintext fragment aliases rejected | client-side/destination-bound Cinder transport and shared human gate |
| 7 · Provenance adapters | **Planned** | none operational | independent signature/time/inclusion adapters |
| 8 · Privacy research | **Open Field only** | no operational authority | narrow predicates and formal threat models |
| 9 · Validation / release | **Partially instantiated** | phase-specific CI, deploy hygiene, bounded probes | mobile parity and release/rollback receipt |

## Phase III promotion boundary

Phase III may be called operational only after its pull-request gates pass, the preview lab is inspected, and the post-merge live probe returns a v0.1 receipt from production. Until then, the implementation remains validation-gated.

The station preserves:

```text
source status ≠ sensor identity ≠ transformation ≠ inference
```

Every required metric must resolve before modeled weather is returned. Unknown sensors, conflicting source declarations, missing required metrics, and unreported derived transformations produce abstention rather than synthetic confidence.

## No silent promotion

- Phases 0–2 remain completed at their earned status.
- Phase III adds context instrumentation only; it does not finalize Phase IV.
- The existing reciprocal preview keeps its provisional `vNext` return until Phase IV deliberately adopts `td613.flowcore.context-receipt/v0.1`.
- Relation Envelope runtime remains deferred.
- Cinder transport remains held.
- No new claim-ceiling mechanism is introduced; legacy vocabulary remains frozen for separate review.
