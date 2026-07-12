# Dome-World / Flow-Core v0.5.0

`/dome-world` is a non-public TD613 station that combines:

- the full browser cockpit and room system;
- one active-view sovereign-perspective scheduler with machine-facing art receipts;
- Aperture v3.0-alpha compatibility context for bounded route-weather translation;
- exact residual capture and proposal/confirmation training;
- opt-in lambda=2c emission-gap closure;
- Ash v0.7 browser-local exact-byte commitment;
- Ash v0.8 canonical manifest and receipt digest spine;
- inherited Ash v0.6 projection leakage and derivative research surfaces.

## Ash custody v0.8

`/dome-world/ash-custody.html` opens the canonical Ash Custody surface:

- browser-local exact-byte SHA-256 through `app/dome-world/ash/local-commitment.js`;
- explicit `L0_METADATA_ONLY` and `L1_BROWSER_LOCAL_ARTIFACT_DIGEST` postures;
- separate `artifact_digest`, `manifest_digest`, and `receipt_digest` strata;
- TD613-CJ-1 canonical JSON implemented in browser and Python with frozen parity vectors;
- `td613.ash.custody-manifest/v0.8` and `td613.ash.custody-receipt/v0.8` receipts;
- guarded migration from v0.5 and v0.7 without promoting metadata-derived legacy hashes into L1;
- custody replay that verifies the v0.8 digest spine without rehydrating artifact material;
- Phason custody diff and receipt indexing under their inherited station jurisdictions;
- inherited Leak Challenge, Ash Veil, Compare, Recall, Grade Gate, HCC adapter, and Flow-Core weather-controller surfaces;
- plaintext Cinder transport held until Phase 6.

The v0.7 page and schemas remain historical compatibility artifacts. The canonical public route resolves to v0.8. The Phase 1 byte commitment module remains v0.7 because Phase 2 builds above it rather than rewriting exact-byte identity.

## Digest strata

```text
artifact_digest = SHA-256(exact selected bytes)
manifest_digest = SHA-256(manifest domain || canonical manifest subject)
receipt_digest  = SHA-256(receipt domain  || canonical receipt subject)
```

The manifest digest excludes its own field and the volatile Aperture interface context. The receipt digest excludes its own field and the receipt ID. A receipt ID is only a local prefix derived from the receipt digest; it carries no independent authority.

A digest supports equality comparison only under its declared input and canonicalization profile. None of the three digests establishes possession, authorship, authenticity, identity, permission, truth, or trusted time. Stable digests remain local-receipt-only by default and are not automatically published.

## Boundaries

Modeled weather never enters the exact gate. Exact execution does not activate EO-RFD firmware. Ash server operations accept metadata/projection packets only. Optional local text analysis stays browser-local and clears after scoring. Trainer checkpoints remain client-held and HMAC-signed; server persistence is intentionally absent.

The primary navigation contains Weather, Rooms, Lab, Ash, Substrate, Phason, Aperture, and Receipts. Legacy Math, Tomography, Live Lattice, Loom, Stewardship, Patterns, Repo Weather, Lore, Accident, and API surfaces remain inside the Lab hierarchy.

Ash remains outside the v0.5.0 art scheduler.

## Sovereign perspectives

Weather, Rooms, Lab, Substrate, Phason, Aperture, and Receipts each render a mathematically constrained active perspective. One coordinator owns animation, pauses hidden views, preserves stable canvas dimensions, and exposes `window.DOME_WORLD_ART` for machine inspection. Live Lattice uses the same coordinator and provides a compact station rail, keyboard routing, ordinary vertical mobile scrolling, and horizontal field interaction.

## API architecture

Public API traffic is split by jurisdiction rather than served by one undifferentiated function.

### Guarded Dome-World route

`api/dome-world-engine-guard.py` serves public `/api/dome-world-engine` and `/api/dome-world/*` traffic for readiness, ping, and inherited non-custody operations. Custody register/replay remain excluded from the legacy engine; migration is also unavailable there and receives an explicit rewrite to the Ash endpoint.

Inherited non-custody operations include:

- `aperture-bridge`, `phason-gate`, `ash-readiness`;
- `phason-custody-diff`, `receipt-index`;
- `ash-leak-challenge`, `ash-veil`, `ash-cinder`, `ash-compare`, `ash-recall`;
- `ash-grade-gate`, `ash-hcc-adapter`, `ash-projection-simulate`;
- `exact-capture`, `exact-closure`, `trainer-step`.

### Guarded Ash canonical-digest route

`api/ash-local-commitment-guard.py` exclusively serves:

- `GET ping` / `GET readiness`;
- `POST ash-custody-register`;
- `POST ash-custody-replay`;
- `POST ash-custody-migrate`.

The guard preserves strict L1 network/persistence declarations. The internal v0.8 function performs strict duplicate-key JSON parsing, rejects floating-point and unsafe-integer ambiguity, constructs the manifest and receipt digests, verifies v0.8 replay, and applies explicit v0.5/v0.7 migration rules. L0 never receives a synthetic artifact digest.

Trainer proposal/confirmation requires `DOME_WORLD_TRAINER_ENABLED=1`, `DOME_WORLD_OPERATOR_TOKEN`, and `DOME_WORLD_CHECKPOINT_SECRET`. The cockpit accepts the operator token only in the Substrate station, keeps it in `sessionStorage` for the current browser tab, and sends it only as the `Authorization` header on `trainer-step` requests. It never enters packets, receipts, checkpoints, localStorage, or repository files.

## Provenance and contracts

The exact package and verification artifacts are under `packages/dome_world_exact/`. See its `PROVENANCE.md` and original specifications.

Ash custody design notes live in `app/dome-world/docs/ASH_CUSTODY_LAYER.md` and `app/dome-world/docs/RECEIPT_JURISDICTION.md`.

Phase 0 and Phase 1 records live in `PHASE_0_CONTRACT_LEDGER.md`, `ROADMAP_V07_PHASE1.md`, and `PHASE_1_HARDENING_RECEIPT.md`. Phase 2 is specified in `CANONICAL_JSON_PROFILE.md` and `PHASE_2_CANONICAL_DIGEST_RECEIPT.md`; implementation state remains explicit in `ROADMAP_IMPLEMENTATION_STATUS.md` and `.json`.
