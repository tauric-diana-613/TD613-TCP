# TD613 Ash Phase 1 Hardening Receipt

𝌋‌

## Status

**Implemented on the guarded public routes, merged to `main`, and reconciled with the canonical repository source.**

## Purpose

Close the post-merge seams identified during review of the browser-local commitment kernel without widening Phase 1 jurisdiction.

## Implemented repairs

1. **Direct-engine custody bypass**
   - Public `/api/dome-world-engine` traffic routes through `api/dome-world-engine-guard.py`.
   - The guard rejects `ash-custody-register` and `ash-custody-replay` before the legacy engine can dispatch them.
   - Friendly custody routes and the direct commitment path route exclusively through `api/ash-local-commitment-guard.py`.
   - The legacy engine remains internal sediment for non-custody operations; it cannot issue a public metadata-derived custody receipt through the guarded route.

2. **Contradictory L1 boundary flags**
   - The public commitment guard requires:
     - `network_operation_performed_by_module === false`
     - `raw_bytes_persisted_by_module === false`
   - Missing or contradictory values fail closed before the internal receipt function can normalize them.
   - The v0.7 manifest schema now carries those fields as required `false` invariants and binds L1 to an object-valued local commitment while binding L0 to `null`.

3. **Stale file-hash race**
   - `app/dome-world/ash/local-commitment.js` is the canonical v0.7.1-hardened implementation.
   - Concurrent commitment jobs are generation-bound.
   - An older job resolves to the newest active commitment rather than overwriting it.
   - Clearing the file selection invalidates every in-flight commitment and returns the intake to L0 posture.
   - `local-commitment-v071.js` remains only as a compatibility re-export, preventing a second live implementation from drifting.

4. **Vercel configuration seam**
   - The abandoned coupled `api/dome-world-engine-v07.py` adapter remains absent.
   - Every configured `includeFiles` and `excludeFiles` value is validated as a string.
   - The canonical Ash kernel now resolves through the ordinary Dome-World static route rather than a versioned shadow rewrite.

5. **Phase 0 documentation seam**
   - `PHASE_0_CONTRACT_LEDGER.md` now records compatibility versions, public route ownership, side-effect posture, frozen Phase 1 invariants, validation coverage, and deferred roadmap work.
   - The Dome-World README now reflects the guarded multi-function architecture rather than the obsolete one-function / Ash v0.6 description.

## Regression coverage

- direct legacy-engine custody operations fail closed;
- contradictory or missing L1 network/persistence flags fail closed;
- rapid file reselection retains only the newest file commitment;
- clearing an in-flight commitment raises an `AbortError` rather than restoring stale bytes;
- canonical and versioned module routes cannot fork into separate implementations;
- v0.7 schema invariants require the local no-network / no-persistence declarations;
- every Vercel file-inclusion field remains schema-valid;
- existing L0/L1 fixture, API integration, browser-contract, and deployment-hygiene tests remain in the hardening gate.

## Preserved boundaries

- no new claim-ceiling mechanism;
- no Cinder transport redesign in this patch;
- no reciprocal Flow-Core expansion;
- no Aperture source promotion or rewrite;
- no authorship, possession, identity, authenticity, truth, or trusted-time claim;
- Ash remains custody-only and the human remains the consequential decision point.

⟐
