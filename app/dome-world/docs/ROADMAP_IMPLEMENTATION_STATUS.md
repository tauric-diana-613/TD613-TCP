# Roadmap Implementation Status

This ledger separates **planned**, **designed**, **implemented**, **hardened**, and **production-demonstrated** work so a pull request cannot silently promote an architectural aspiration into an operational claim.

| Phase | Status | Repository evidence | Remaining gate |
|---|---|---|---|
| 0 · Baseline / contracts | **Implemented + hardened** | contract ledger, split endpoint inventory, Vercel routes, regression tests, deployment probe | rerun live probe after each custody release |
| 1 · Local Commitment | **Implemented + hardened** | browser SHA-256 kernel, L0/L1 endpoint, strict server validation, stale-selection guard | continuing regression coverage |
| 2 · Digest / receipt spine | **Implemented + production-demonstrated** | TD613-CJ-1, v0.8 schemas, register/replay/migrate runtime, tamper and mobile production demo | continuing regression coverage |
| 3 · Flow-Core instrumentation | **Implemented + production-demonstrated** | v0.1 context endpoint, sensor registry, benign controls, abstention, private artifact-blind lab, production receipt | continuing regression and calibration coverage |
| 4 · Reciprocal bridge | **Implemented; validation-gated** | v0.1 bridge adoption, formal diagnostic validation, returned-context audit, round-trip digest/replay, explicit-send lab, vNext migration, shared guarded endpoint | Phase IV CI, preview/mobile demonstration, post-merge live probe, durable production receipt |
| 5 · Relation Envelope | **Landing zone designed; runtime deferred** | Aperture relation contract / Phason jurisdiction | route-scoped HMAC, nonce lifecycle, local-only runtime |
| 6 · Human-gated derivatives | **Held** | Cinder UI disabled; plaintext fragment aliases rejected | client-side/destination-bound Cinder transport and shared human gate |
| 7 · Provenance adapters | **Planned** | none operational | independent signature/time/inclusion adapters |
| 8 · Privacy research | **Open Field only** | no operational authority | narrow predicates and formal threat models |
| 9 · Validation / release | **Partially instantiated** | phase-specific CI, deploy hygiene, bounded probes | continuing mobile parity and release/rollback receipts |

## Phase IV implementation boundary

Phase IV adopts `td613.flowcore.context-receipt/v0.1` into the reciprocal Aperture bridge. A validated diagnostic receipt becomes named Phase III measurements; missing or invalid required metrics produce ABSTAIN rather than defaults or clamping. The returned receipt is audited locally, then placed inside a deterministic round-trip envelope with domain-separated digests and pure replay.

```text
Aperture diagnostic receipt
→ explicit operator send
→ guarded validation
→ Flow-Core v0.1
→ returned-context audit
→ round-trip receipt
→ optional operator save/export
```

Implementation does not equal production demonstration. The durable `PHASE_4_PRODUCTION_DEMO_RECEIPT.md` remains a PENDING template until the preview and production gates are completed.

## Phase IV hard boundaries

```text
reciprocal_receipts = true
reciprocal_authority = false
artifact_relation = false
artifact_blind = true
automatic_ash_action = false
prediction_authorized = false
operator_closure_required = true
open_field_auto_promotion = false
runtime_default = BACKGROUND
```

The bridge shares the existing guarded Dome-World function. No Phase IV serverless function is added.

## vNext compatibility

`td613.flowcore.context-receipt/vNext` is no longer the canonical public bridge return. It is accepted only through an explicitly labeled migration wrapper:

```text
LEGACY_PROVISIONAL_NORMALIZED
native_v01 = false
```

Legacy provenance may be preserved. It may not impersonate a native v0.1 receipt.

## No silent promotion

- Phases 0–3 retain their earned status.
- Phase IV remains validation-gated until the production receipt passes.
- Phase IV does not create a Relation Envelope or artifact relation.
- Phase IV does not activate prediction, Ash, Cinder, or Phason relation lifecycle.
- Legal routing remains routing; substantive legal synthesis belongs to the host model.
- Open Field context remains unpromoted unless the operator explicitly requests promotion.
- Runtime remains quiet unless material or dispositive.
- No new claim-ceiling mechanism is introduced; legacy vocabulary remains frozen for separate review.

The diagnostic receipt remembers departure. The context receipt remembers weather. The audit remembers the boundary. The round-trip receipt remembers that something returned.

Only the human closes the seam.
