# Phase 1 Commitment Contract Ledger

## Version plurality

- Aperture: `v3.0-alpha`
- Dome-World: `v0.5.0`
- Ash local commitment: `v0.7`
- Ash derivative lineage: `v0.6`
- Exact substrate: `v0.4.3`

These versions describe different station lineages and are not flattened into one firmware number.

## Endpoint ownership

| Operation | Owner | Public route | Raw artifact bytes |
|---|---|---|---|
| `ash-custody-register` | Ash Local Commitment v0.7 | `/api/dome-world/ash-custody-register` → guarded commitment function | prohibited |
| `ash-custody-replay` | Ash Local Commitment v0.7 | `/api/dome-world/ash-custody-replay` → guarded commitment function | unavailable |
| other Dome-World operations | Dome-World engine | guarded engine route | metadata/projection only |

The legacy engine rejects Phase 1 custody operations even when called internally or through an unexpected route.

## L0 / L1

- `L0_METADATA_ONLY`: no artifact digest; no local commitment object; metadata-route artifact identifier only.
- `L1_BROWSER_LOCAL_ARTIFACT_DIGEST`: exact picker bytes hashed in the browser; strict lowercase SHA-256; commitment flags validated; client generation remains independently unattested.

## Explicit nonclaims

A Phase 1 receipt does not establish possession, authorship, authenticity, identity, permission, truth, or trusted time. Buffer overwrite remains best-effort, not guaranteed erasure.

## Deferred seams

Canonical manifest/receipt digests, Flow-Core reciprocal API receipts, Relation Envelope runtime, Cinder transport, provenance adapters, and advanced privacy research remain outside Phase 1.
