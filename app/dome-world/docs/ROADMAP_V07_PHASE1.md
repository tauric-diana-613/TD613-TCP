# TD613 Ash Local Commitment v0.7 — Phase 1 Receipt

𝌋‌

## Implemented seam

The Ash intake route now has a true browser-local SHA-256 commitment path.

```text
selected file bytes
→ Web Crypto SHA-256 in the browser
→ td613.ash.local-commitment/v0.7
→ metadata-only custody request
→ L1_BROWSER_LOCAL_ARTIFACT_DIGEST receipt
```

No selected file produces `L0_METADATA_ONLY` with `artifact_digest: null`.
The server does not synthesize an artifact digest from metadata.

## Added surfaces

- `app/dome-world/ash/local-commitment.js` — canonical v0.7.1-hardened browser kernel
- `app/dome-world/ash/local-commitment-v071.js` — compatibility re-export only
- `app/dome-world/ash-custody-v07.html`
- `api/ash-local-commitment.py`
- `api/ash-local-commitment-guard.py`
- `api/dome-world-engine-guard.py`
- v0.7 custody manifest and receipt schemas
- browser and Python integration tests
- dedicated Dome-World Phase 1 and Phase 1 Hardening CI gates
- exact Vercel rewrites preserving the public `/dome-world/ash-custody.html` path while isolating registration and replay in the bounded commitment endpoint
- `app/dome-world/docs/PHASE_0_CONTRACT_LEDGER.md`

## Endpoint separation

The guarded Phase 1 endpoint owns only:

- `ash-custody-register`
- `ash-custody-replay`

All other Dome-World operations continue through the guarded legacy engine route. Public custody operations are rejected before that engine can dispatch them.
This keeps the first exact commitment primitive narrow instead of turning it into a new station crown.

## Preserved boundaries

- Raw file bytes do not enter the request envelope.
- The commitment module performs no network operation.
- The commitment module persists no raw bytes.
- Buffer overwrite is best-effort; memory erasure is not guaranteed.
- A digest does not prove possession, authorship, authenticity, identity, or time.
- L0 metadata-only registration may not carry an artifact digest.
- L1 registration requires a matching `td613.ash.local-commitment/v0.7` object.
- L1 requires explicit false declarations for module network operation and raw-byte persistence.
- The v0.5/v0.6 surfaces remain in the repository as lineage and compatibility artifacts.
- No new claim-ceiling mechanism is introduced.

## Verification

The Phase 1 workflows verify:

- the known SHA-256 values for `abc` and the empty byte string;
- one-byte mutation sensitivity;
- byte-exact Unicode divergence without normalization;
- the Phase 1 file-size hold;
- L0/L1 server validation;
- raw-content rejection;
- digest mismatch rejection;
- rejection of guaranteed memory-erasure claims;
- replay without artifact rehydration;
- direct-engine custody bypass closure;
- contradictory L1 flag rejection;
- stale file-selection race handling;
- canonical module / compatibility-alias non-divergence;
- Vercel route, cache, and configuration-schema hygiene.

## Deferred by design

- Canonical manifest and receipt digests
- Reciprocal Flow-Core API receipts
- Relation Envelope implementation
- Cinder transport redesign
- Independent timestamp/signature adapters
- Advanced privacy research

The stone is now exact enough for the next layer to stand on it.

⟐
