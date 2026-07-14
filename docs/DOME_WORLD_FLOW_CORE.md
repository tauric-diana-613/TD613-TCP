# Dome-World / Flow-Core

Current release: Dome-World `v0.6.0-alpha`, Flow-Core context instrumentation `v0.1`, coupled to TD613 Aperture `v3.1-alpha` through reciprocal receipts without reciprocal authority.

The v0.6.0-alpha cockpit adds the Admissibility Tomography observatory while preserving the v0.5.0 active-view art scheduler, machine-facing art receipts, mathematically constrained perspectives, and accessible Lab station navigation. Exact-engine and API receipt contracts retain their compatible v0.4.3 schemas.

## Phase III context station

`POST /api/flowcore-context` accepts named measurements and returns `td613.flowcore.context-receipt/v0.1`. Every measurement carries source status, sensor identity, transformation history, missingness, uncertainty, alternatives, and calibration posture.

The public route shares `api/dome-world-engine-guard.py` rather than allocating another Vercel function. Sharing deployment capacity does not transfer custody, doctrine, artifact relation, prediction, or Ash authority.

The station returns either `CONTEXT_READY` or `ABSTAIN_INSUFFICIENT_CONTEXT`. Unknown sensors remain `UNRESOLVED`; simulated fixtures cannot present as observed; absent or invalid required metrics withhold modeled weather. Outage, latency, drift, noise, and retrieval gaps remain benign controls rather than automatic suppression or surveillance findings.

The context station is artifact-blind and private by default. It rejects stable artifact identifiers, raw bytes, and non-null artifact references; cannot write Aperture doctrine; cannot activate Ash; and does not authorize prediction. The standalone research surface remains at `/dome-world/flow-core-context.html` and continues to identify its bridge posture as `PHASE_4_DEFERRED` because a standalone context receipt has not traversed the reciprocal route.

## Phase IV reciprocal receipt circle

Phase IV adopts the production-demonstrated v0.1 context contract into the reciprocal Aperture bridge.

```text
Aperture diagnostic receipt
→ explicit operator send
→ guarded validation
→ Flow-Core v0.1 context receipt
→ local Aperture returned-context audit
→ local round-trip receipt
→ optional operator save/export
```

The public bridge route is:

```text
GET/POST /api/aperture-bridge
```

It shares `api/dome-world-engine-guard.py`; Phase IV adds no serverless function. The compatibility route `/api/dome-world/aperture-bridge` lands on the same guard.

A bridge-produced v0.1 receipt carries:

```text
bridge_integration_status = PHASE_4_ACTIVE
bridge_contract = td613.phase4.reciprocal-bridge/v0.1
reciprocal_receipts = true
reciprocal_authority = false
operator_closure_required = true
```

The bridge accepts a complete Aperture diagnostic receipt rather than a loose metrics object. Declared metrics become named measurements using the DERIVED-only `aperture-diagnostic-receipt` sensor. Missing required metrics remain missing. Invalid values remain invalid. The bridge does not default coherence, manufacture zeros, or clamp out-of-range declarations.

## Returned-context audit and replay

Aperture audits the v0.1 return under `td613.aperture.returned-context-audit/v0.1`. The audit distinguishes bounded review, bounded review with warnings, repair holds, and authority breaches. Both OPEN and ABSTAIN may be valid returns.

The local `td613.aperture.round-trip-receipt/v3.0-alpha` envelope carries separate domain-separated digests for the diagnostic, context, audit, and complete round trip. Replay is local and pure: it performs no network call, regenerates no weather, mutates no storage, and triggers no Ash action.

Persistence remains explicit. The operator may save or export a receipt; arrival alone causes no local write.

## Legacy vNext window

`td613.flowcore.context-receipt/vNext` is no longer the canonical public bridge return. It may enter only through the explicit migration contract `td613.flowcore.context-receipt-migration/v0.1`, which records:

```text
LEGACY_PROVISIONAL_NORMALIZED
native_v01 = false
```

Legacy provenance remains visible. It cannot impersonate native v0.1 instrumentation.

## Station law

Dome-World preserves three layers without collapsing them:

1. Modeled weather describes bounded route pressure.
2. Exact substrate receipts decide capture, capacity, and opt-in closure over rational/integer inputs.
3. Aperture audits the exchange but is not executed by Flow-Core or Dome-World.

```text
context ≠ custody
weather ≠ prediction
receipt ≠ command
reciprocity ≠ reciprocal authority
```

Phase IV remains validation-gated until its production demonstration receipt passes. Relation Envelope runtime, Phason relation lifecycle, Cinder transport, Ash execution, prediction, and legal adjudication remain deferred.
