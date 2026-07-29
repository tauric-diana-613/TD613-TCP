# TD613 Ash Phase 1 Hardening Receipt

𝌋‌

## Audit origin

The first Phase 0–1 merge established the local SHA-256 kernel, but post-merge review found three unresolved implementation seams:

1. the legacy Dome-World engine could still accept custody register/replay operations directly;
2. contradictory L1 network/persistence flags could be normalized into false rather than rejected;
3. an older slow hash promise could overwrite a newer file selection.

A subsequent merge documented those repairs but did not change the code. This receipt records their actual implementation.

## Implemented repairs

### Legacy-engine bypass closed

- `api/dome-world-engine.py` excludes `ash-custody-register` and `ash-custody-replay` from its operation registry;
- direct dispatch of either operation fails closed;
- readiness lists them only as delegated operations owned by `api/ash-local-commitment.py`;
- the public guard remains as defense in depth.

### Contradictory L1 assertions rejected

The v0.7 endpoint now rejects conflicting digest/assurance aliases and requires explicit false values for:

- `network_operation_performed_by_module`;
- `raw_bytes_transmitted`;
- `raw_bytes_returned`;
- `raw_bytes_persisted_by_module`;
- `memory_erasure_guaranteed`.

It also validates byte length, media type, digest algorithm, browser-local execution, and strict lowercase SHA-256.

### Stale file-selection race closed

The canonical browser module now contains a latest-selection coordinator. A commitment result becomes `CURRENT` only while its generation token and File object remain active; earlier promises resolve as `STALE` and cannot update the UI or re-enable registration for the wrong file.

## Additional seam repairs

- Removed the duplicate v0.7.1 browser implementation and made `local-commitment.js` canonical.
- Replaced the stale v0.6 `ash-custody.html` copy with a compatibility route to v0.7.
- Removed new v0.7 claim-ceiling fields; legacy v0.5/v0.6 vocabulary remains frozen for separate review.
- Replaced receipt-list `innerHTML` with DOM/text construction.
- Held the Cinder transport surface and rejected `fragment` / `candidateFragment` at the engine boundary until Phase 6.
- Hardened legacy replay so a v0.5 metadata hash cannot be promoted to v0.7 L1 assurance.
- Instantiated the roadmap, contract ledger, and implementation-status receipts in the repository.

## Verification gates

- JavaScript syntax and exact-byte vectors;
- empty file and one-byte mutation;
- Unicode byte divergence;
- file-size hold;
- stale-selection ordering;
- L0/L1 API validation;
- direct-engine custody rejection;
- contradictory-boundary rejection;
- legacy replay non-promotion;
- raw fragment rejection;
- schema parsing;
- Vercel route and cache hygiene.

## Remaining roadmap boundary

Phases 2–9 are not silently implemented by this repair. Reciprocal Flow-Core API receipts, Relation Envelope runtime, Cinder transport redesign, provenance adapters, and advanced privacy research remain governed future work.

The stone is exact. The floor is now bolted down.

⟐
