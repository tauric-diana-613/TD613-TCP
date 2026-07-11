# Dome-World / Flow-Core v0.5.0

`/dome-world` is a non-public TD613 station that combines:

- the full browser cockpit and room system;
- one active-view sovereign-perspective scheduler with machine-facing art receipts;
- Aperture v3.0-alpha compatibility context for bounded route-weather translation;
- exact residual capture and proposal/confirmation training;
- opt-in lambda=2c emission-gap closure;
- Ash v0.7 browser-local commitment and guarded custody registration/replay;
- inherited Ash v0.6 projection leakage and derivative research surfaces.

## Ash custody v0.7

`/dome-world/ash-custody.html` adds the Ash Custody Layer:

- browser-local exact-byte SHA-256 through `app/dome-world/ash/local-commitment.js`;
- explicit `L0_METADATA_ONLY` and `L1_BROWSER_LOCAL_ARTIFACT_DIGEST` postures;
- source-environment adapters for local files, repositories, cloud/local drives, spreadsheets/lists, LLM chat/session artifacts, and manual metadata;
- `td613.ash.custody-manifest/v0.7` and `td613.ash.custody-receipt/v0.7` receipts;
- Ash custody replay that re-renders custody state without rehydrating artifact material;
- Phason custody diff for content-invariant projection/custody changes;
- receipt indexing that keeps Receipts as a witness index rather than the custody owner;
- inherited Leak Challenge, Ash Veil, Cinder, Compare, Recall, Grade Gate, HCC adapter, and Flow-Core weather-controller surfaces.

The route remains an Ash station. Receipts index it; Ash owns the artifact custody boundary. The canonical local commitment module performs no network operation, transmits no raw bytes, and makes no memory-erasure claim. The retained `local-commitment-v071.js` URL re-exports the canonical kernel rather than maintaining a second implementation.

## Boundaries

Modeled weather never enters the exact gate. Exact execution does not activate
EO-RFD firmware. Ash server operations accept metadata/projection packets only.
Optional local text analysis stays browser-local and clears after scoring. Trainer
checkpoints remain client-held and HMAC-signed; server persistence is intentionally absent.

A local digest establishes recomputable byte equality only. It does not establish
possession, authorship, authenticity, identity, permission, truth, or time.

The primary navigation contains Weather, Rooms, Lab, Ash, Substrate, Phason,
Aperture, and Receipts. Legacy Math, Tomography, Live Lattice, Loom,
Stewardship, Patterns, Repo Weather, Lore, Accident, and API surfaces remain
inside the Lab hierarchy.

Ash is intentionally outside the v0.5.0 art scheduler.

## Sovereign perspectives

Weather, Rooms, Lab, Substrate, Phason, Aperture, and Receipts each render a
mathematically constrained active perspective. One coordinator owns animation,
pauses hidden views, preserves stable canvas dimensions, and exposes
`window.DOME_WORLD_ART` for machine inspection. Live Lattice uses the same
coordinator and provides a compact station rail, keyboard routing, ordinary
vertical mobile scrolling, and horizontal field interaction.

## API architecture

Public API traffic is split by jurisdiction rather than served by one undifferentiated function.

### Guarded Dome-World route

`api/dome-world-engine-guard.py` serves public `/api/dome-world-engine` and
`/api/dome-world/*` traffic for readiness, ping, and inherited non-custody operations.
It rejects `ash-custody-register` and `ash-custody-replay` before the legacy engine can dispatch them.

Inherited non-custody operations include:

- `aperture-bridge`, `phason-gate`, `ash-readiness`;
- `phason-custody-diff`, `receipt-index`;
- `ash-leak-challenge`, `ash-veil`, `ash-cinder`, `ash-compare`, `ash-recall`;
- `ash-grade-gate`, `ash-hcc-adapter`, `ash-projection-simulate`;
- `exact-capture`, `exact-closure`, `trainer-step`.

### Guarded Ash commitment route

`api/ash-local-commitment-guard.py` exclusively serves:

- `GET ping` / `GET readiness`;
- `POST ash-custody-register`;
- `POST ash-custody-replay`.

It rejects missing or contradictory L1 network/persistence declarations before the internal commitment function can normalize the receipt. L0 never receives a synthetic artifact digest.

Trainer proposal/confirmation requires `DOME_WORLD_TRAINER_ENABLED=1`,
`DOME_WORLD_OPERATOR_TOKEN`, and `DOME_WORLD_CHECKPOINT_SECRET`.
The cockpit accepts the operator token only in the Substrate station, keeps it
in `sessionStorage` for the current browser tab, and sends it only as the
`Authorization` header on `trainer-step` requests. It never enters packets,
receipts, checkpoints, localStorage, or repository files.

## Provenance and contracts

The exact package and verification artifacts are under
`packages/dome_world_exact/`. See its `PROVENANCE.md` and original specifications.

Ash custody design notes live in `app/dome-world/docs/ASH_CUSTODY_LAYER.md` and
`app/dome-world/docs/RECEIPT_JURISDICTION.md`.

The Phase 0 compatibility and route ledger lives in
`app/dome-world/docs/PHASE_0_CONTRACT_LEDGER.md`. Phase 1 implementation and
hardening receipts live in `ROADMAP_V07_PHASE1.md` and
`PHASE_1_HARDENING_RECEIPT.md`.
