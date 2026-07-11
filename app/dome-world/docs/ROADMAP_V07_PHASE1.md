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

- `app/dome-world/ash/local-commitment.js`
- `app/dome-world/ash-custody-v07.html`
- `api/ash-local-commitment.py`
- v0.7 custody manifest and receipt schemas
- browser and Python integration tests
- a dedicated Dome-World Phase 1 CI gate
- exact Vercel rewrites preserving the public `/dome-world/ash-custody.html` path while isolating registration and replay in the bounded commitment endpoint

## Endpoint separation

The Phase 1 endpoint owns only:

- `ash-custody-register`
- `ash-custody-replay`

All other Dome-World operations continue through `api/dome-world-engine.py`.
This keeps the first exact commitment primitive narrow instead of turning it into a new station crown.

## Preserved boundaries

- Raw file bytes do not enter the request envelope.
- The commitment module performs no network operation.
- Buffer overwrite is best-effort; memory erasure is not guaranteed.
- A digest does not prove possession, authorship, authenticity, identity, or time.
- L0 metadata-only registration may not carry an artifact digest.
- L1 registration requires a matching `td613.ash.local-commitment/v0.7` object.
- The v0.5/v0.6 surfaces remain in the repository as lineage and compatibility artifacts.
- No new claim-ceiling mechanism is introduced.

## Verification

The Phase 1 workflow verifies:

- the known SHA-256 values for `abc` and the empty byte string;
- one-byte mutation sensitivity;
- byte-exact Unicode divergence without normalization;
- the Phase 1 file-size hold;
- L0/L1 server validation;
- raw-content rejection;
- digest mismatch rejection;
- rejection of guaranteed memory-erasure claims;
- replay without artifact rehydration;
- Vercel route and cache hygiene.

## Deferred by design

- Canonical manifest and receipt digests
- Reciprocal Flow-Core API receipts
- Relation Envelope implementation
- Cinder transport redesign
- Independent timestamp/signature adapters
- Advanced privacy research

The stone is now exact enough for the next layer to stand on it.

⟐
