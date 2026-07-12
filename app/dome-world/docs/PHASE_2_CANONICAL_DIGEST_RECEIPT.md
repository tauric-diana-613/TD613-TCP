# TD613 Ash Phase 2 Canonical Digest and Receipt Spine

𝌋‌

## Scope

Phase 2 builds above the Phase 1 exact-byte commitment. It does not rewrite the browser-local SHA-256 kernel and does not widen server custody.

## Implemented strata

1. `artifact_digest` — SHA-256 over exact file-picker bytes, present only for validated L1 intake.
2. `manifest_digest` — domain-separated SHA-256 over the TD613-CJ-1 canonical manifest subject.
3. `receipt_digest` — domain-separated SHA-256 over the TD613-CJ-1 canonical receipt subject.

The three values remain structurally distinct. `content_hash` no longer appears in v0.8 manifests; it survives only inside explicit legacy migration provenance when needed for audit.

## Canonical profile

Browser and Python implementations share:

- safe integers only;
- duplicate-key rejection at the Python HTTP boundary;
- printable ASCII object keys;
- exact Unicode scalar values without NFC/NFD normalization;
- deterministic object-key sorting;
- explicit manifest and receipt domain separators;
- frozen cross-language vectors.

## Receipt construction

- `artifact_id` no longer derives from a stable artifact digest by default. An absent operator identifier receives a random receipt-local identifier.
- `manifest_digest` excludes `manifest_digest` and volatile Aperture interface context.
- `receipt_digest` excludes `receipt_digest` and `receipt_id`.
- `receipt_id` is a local prefix derived from `receipt_digest`, not an independent proof object.
- all three digest exports remain `local-receipt-only` by default.

## Migration rules

### v0.5

A v0.5 `content_hash` remains a quarantined legacy reference. Migration produces L0 unless an independently validated Phase 1 local commitment exists elsewhere. The legacy hash never becomes `artifact_digest` merely because it resembles SHA-256.

### v0.7

A v0.7 L1 artifact digest survives only after the complete local-commitment boundary validates. The migrated v0.8 receipt then adds manifest and receipt digests around that preserved exact-byte commitment.

### v0.8

A current receipt verifies its manifest digest, embedded manifest-digest reference, receipt digest, and receipt-ID prefix before replay. Tampered receipts fail closed.

## Operational routes

The guarded Ash endpoint owns:

- `ash-custody-register`;
- `ash-custody-replay`;
- `ash-custody-migrate`.

The legacy Dome engine remains unable to execute custody operations. Plaintext Cinder transport remains held for Phase 6.

## Verification gates

- frozen Python/JavaScript canonicalization parity;
- exact digest vectors;
- duplicate-key, float, negative-zero, unsafe-integer, non-ASCII-key, and surrogate rejection;
- artifact/manifest/receipt digest separation;
- metadata-change and receipt-change semantics;
- L0 non-promotion;
- v0.5 and v0.7 migration fixtures;
- replay verification and tamper rejection;
- canonical route and Vercel function-bundle checks;
- bounded post-deployment probe.

## Nonclaims

The Phase 2 spine establishes deterministic comparison under declared inputs. It does not establish possession, authorship, authenticity, identity, permission, truth, trusted time, or universal public identity.

The crayon line now has three labeled layers. None of them gets to impersonate the whole map.

⟐
