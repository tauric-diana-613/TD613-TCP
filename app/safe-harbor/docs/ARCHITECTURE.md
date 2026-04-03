# TD613 Safe Harbor Architecture

## Stack

1. Ingress membrane collects the ritual triad.
2. Safe Harbor canonicalizes the packet.
3. Cadence credentials are derived from ingress and optional TCP overlays.
4. EO-RFD contributes route conscience and harbor posture.
5. Detached cryptographic signature lanes wrap the packet after canonicalization.
6. Public TD613 surfaces publish the compact compat footer without exposing operator-only fields.

## Canonical JSON

`canonical_json(value)` lives in `safe_harbor/canonicalize.js` and is the only serializer Safe Harbor uses for:

- `packet_hash_sha256`
- detached signature payload generation
- verification
- canonical JSON preview

Contract:

- UTF-8
- sorted object keys
- arrays preserve order
- no extra whitespace
- stable escaping
- no comments

## Packet model

Required packet fields:

- `schema_version`
- `packet_id`
- `packet_hash_sha256`
- `receipt`
- `canon`
- `intake`
- `cadence_credentials`
- `provenance`
- `signature`
- `rules`

Compatibility mirrors (`canonicalization`, `analysis`, `bridge`, `issuance`) remain in the packet for annex continuity, but the doctrinal packet contract is the field set above.

## Signature rule

Safe Harbor mints:

- packet body
- packet hash
- receipt state
- cadence credentials

Detached signature lanes add:

- `sig`
- `sig_type`
- `kid`
- wrapper status

They attach after canonicalization and they do not mutate the packet body.

## Lifecycle

Lifecycle is read across the packet plus the detached signature wrapper:

- `staged`
- `sealed`
- `exported`
- `verified`

The canonical packet body itself stays stable through signature attachment. Exported and verified are wrapper-layer states, not permission to rewrite the packet body.

## Cadence vs cryptographic signature

- Cadence signature = stylometric credential from the triad and optional TCP overlays
- Cryptographic signature = detached seal over `canonical_json(packet)`

These are stacked, never merged.
