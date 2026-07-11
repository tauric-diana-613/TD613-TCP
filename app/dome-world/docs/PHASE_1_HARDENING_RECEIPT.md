# TD613 Ash Phase 1 Hardening Receipt

𝌋‌

## Status

**Implemented on the guarded public route; pending merge validation.**

## Purpose

Close three post-merge seams identified during review of the browser-local commitment kernel without widening Phase 1 jurisdiction.

## Implemented repairs

1. **Direct-engine custody bypass**
   - Public `/api/dome-world-engine` traffic now routes through `api/dome-world-engine-guard.py`.
   - The guard rejects `ash-custody-register` and `ash-custody-replay` before the legacy engine can dispatch them.
   - Friendly custody routes and the direct commitment path route exclusively through `api/ash-local-commitment-guard.py`.
   - The legacy engine remains internal sediment for non-custody operations; it cannot issue a public metadata-derived custody receipt through the guarded route.

2. **Contradictory L1 boundary flags**
   - The public commitment guard requires:
     - `network_operation_performed_by_module === false`
     - `raw_bytes_persisted_by_module === false`
   - Missing or contradictory values fail closed before the internal receipt function can normalize them.

3. **Stale file-hash race**
   - The served local commitment module is now `local-commitment-v071.js` behind the stable `local-commitment.js` route.
   - Concurrent commitment jobs are generation-bound.
   - An older job resolves to the newest active commitment rather than overwriting it.
   - Clearing the file selection invalidates every in-flight commitment and returns the intake to L0 posture.

## Regression coverage

- direct legacy-engine custody operations fail closed;
- contradictory or missing L1 network/persistence flags fail closed;
- rapid file reselection retains only the newest file commitment;
- clearing an in-flight commitment raises an `AbortError` rather than restoring stale bytes;
- existing L0/L1 fixture, API integration, browser-contract, and Vercel deployment-hygiene tests remain in the hardening gate.

## Preserved boundaries

- no new claim-ceiling mechanism;
- no Cinder transport redesign in this patch;
- no reciprocal Flow-Core expansion;
- no authorship, possession, identity, authenticity, truth, or trusted-time claim;
- Ash remains custody-only and the human remains the consequential decision point.

⟐
