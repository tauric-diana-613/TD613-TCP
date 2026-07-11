# TD613 Ash Phase 1 Hardening Receipt

𝌋‌

## Purpose

Close three post-merge seams identified during review of the browser-local commitment kernel without widening Phase 1 jurisdiction.

## Required repairs

1. **Direct-engine custody bypass**
   - `api/dome-world-engine.py` must reject `ash-custody-register` and `ash-custody-replay`.
   - Those operations remain owned exclusively by `api/ash-local-commitment.py` through the exact Vercel rewrites.
   - A direct POST to `/api/dome-world-engine` using either custody operation must fail closed and must never issue a legacy metadata-derived receipt.

2. **Contradictory L1 boundary flags**
   - L1 validation must require:
     - `network_operation_performed_by_module === false`
     - `raw_bytes_persisted_by_module === false`
   - The server may not normalize contradictory client assertions into safer values.

3. **Stale file-hash race**
   - The Ash UI must bind an in-flight commitment to the exact current file-selection generation.
   - Selecting or clearing another file invalidates all earlier in-flight commitments.
   - A stale promise may not overwrite commitment state or re-enable registration for the wrong file.

## Required regression coverage

- direct legacy-engine custody operations are rejected;
- contradictory L1 network/persistence flags are rejected;
- rapid file reselection retains only the newest file commitment;
- existing L0/L1 fixture, route, deployment-hygiene, and no-raw-byte tests continue to pass.

## Preserved boundaries

- no new claim-ceiling mechanism;
- no Cinder transport redesign in this patch;
- no reciprocal Flow-Core expansion;
- no authorship, possession, identity, authenticity, truth, or trusted-time claim;
- Ash remains custody-only and the human remains the consequential decision point.

⟐
