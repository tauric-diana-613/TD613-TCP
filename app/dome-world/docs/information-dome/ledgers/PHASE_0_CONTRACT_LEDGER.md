# TD613 Dome-World / Ash Phase 0 Contract Ledger

𝌋‌

**Status:** Baseline frozen after Phase 1 hardening.  
**Scope:** Dome-World and Ash repository surfaces only. Aperture v3.0-alpha remains an external compatibility context and is not promoted or rewritten by this ledger.

## Compatibility matrix

| Surface | Current repository posture | Jurisdiction |
|---|---|---|
| Aperture | v3.0-alpha compatibility context | audits and returns recommendations; does not take custody or execute Ash |
| Dome-World | v0.5.0 cockpit and bounded non-custody engine | room/station ecology and existing modeled operations |
| Ash local commitment | v0.7 schema with v0.7.1 race hardening | browser-local exact-byte commitment, custody registration, custody replay |
| Ash projection runtime | v0.6 inherited operations | Leak Challenge, Veil, Cinder, Compare, Recall, Grade Gate, HCC, projection simulation |
| Phason | v0.5 custody/projection diff | records content-invariant change; does not create permission or custody |
| exact substrate | v0.4.3 lineage package | exact-coordinate execution and verification |

Version plurality records lineage. It must not be flattened into one number or allowed to rewrite the current route owner.

## Public route ledger

### Static surfaces

| Public route | Repository destination | Side-effect posture |
|---|---|---|
| `/dome-world` | `app/dome-world/index.html` | cockpit only |
| `/dome-world/ash-custody.html` | `app/dome-world/ash-custody-v07.html` | browser UI; localStorage receipts only after operator action |
| `/dome-world/ash/local-commitment.js` | `app/dome-world/ash/local-commitment.js` through the generic Dome-World static rewrite | browser-local hashing module; no network operation |

`app/dome-world/ash/local-commitment-v071.js` remains a compatibility alias and re-exports the canonical implementation. It may not fork behavior.

### API surfaces

| Route family | Public function | Permitted operations | Prohibited shortcut |
|---|---|---|---|
| `/api/dome-world-engine` and `/api/dome-world/*` | `api/dome-world-engine-guard.py` | readiness, ping, and inherited non-custody Dome operations | public custody registration or replay through the legacy engine |
| `/api/ash-local-commitment` | `api/ash-local-commitment-guard.py` | readiness, ping, `ash-custody-register`, `ash-custody-replay` | contradictory L1 boundary declarations or raw artifact bytes |
| `/api/dome-world/ash-custody-register` | `api/ash-local-commitment-guard.py` | guarded registration | metadata-derived artifact digest |
| `/api/dome-world/ash-custody-replay` | `api/ash-local-commitment-guard.py` | receipt/manifest replay without content rehydration | fresh execution or raw-content recovery claim |

The guarded functions import the internal lineage functions. The internal functions remain implementation surfaces, not alternate public custody routes.

## Frozen Phase 1 invariants

```text
no selected file
→ L0_METADATA_ONLY
→ artifact_digest: null

selected exact bytes
→ browser Web Crypto SHA-256
→ L1_BROWSER_LOCAL_ARTIFACT_DIGEST
→ metadata-only request envelope
```

- `sha256:manual-placeholder` may not return.
- Metadata, path, label, revision, or route state may not become an artifact digest.
- Exact bytes remain outside every request envelope.
- The canonical kernel performs no network operation and persists no raw bytes.
- Buffer overwrite remains best effort and carries no memory-erasure claim.
- A digest proves only equality when the same bytes are recomputed; it does not prove possession, authorship, authenticity, identity, permission, truth, or time.
- L1 registration requires explicit `network_operation_performed_by_module: false` and `raw_bytes_persisted_by_module: false`.
- A stale hash job may not overwrite a newer file selection.

## Baseline validation ledger

The Phase 1 and hardening workflows cover:

- known SHA-256 fixtures, empty bytes, one-byte mutation, and Unicode byte divergence;
- finite file-size hold;
- L0/L1 API validation and digest mismatch rejection;
- raw-content denial and replay without artifact rehydration;
- direct-engine custody bypass closure;
- contradictory L1 flag rejection;
- file-selection generation binding;
- Vercel rewrite order, cache posture, and `includeFiles` / `excludeFiles` string validation;
- guarded readiness jurisdiction;
- the operator-runnable live deployment probe contract.

## Live deployment probe

Run the bounded probe against a deployed base URL:

```bash
node scripts/dome-world-deployment-probe.mjs https://your-deployment.example
```

or:

```bash
DOME_WORLD_BASE_URL=https://your-deployment.example \
  node scripts/dome-world-deployment-probe.mjs
```

The probe performs five checks:

1. guarded Dome-World ping;
2. guarded Dome-World readiness;
3. guarded Ash readiness;
4. one L0 metadata-only custody registration with `artifact_digest: null`;
5. a negative bypass test proving the public legacy engine rejects custody registration.

The probe sends no artifact bytes, raw document text, credential secret, or artifact digest. Its PASS receipt establishes route behavior observed during that run only; it does not establish possession, authorship, authenticity, identity, permission, external-world truth, or trusted time.

## Deferred by roadmap order

The following remain outside Phase 0–1 and must not be smuggled into this ledger:

- canonical manifest and receipt digests;
- Flow-Core sensor instrumentation and reciprocal receipt operations;
- Relation Envelope and Phason relation lifecycle;
- Cinder transport redesign;
- independent timestamp, signature, Merkle, or witness adapters;
- advanced privacy research.

## Claim-ceiling freeze

This ledger introduces no new claim-ceiling mechanism. Existing Dome/Ash vocabulary remains inherited and separately reviewable; it gains no additional authority from Phase 0–1.

⟐
