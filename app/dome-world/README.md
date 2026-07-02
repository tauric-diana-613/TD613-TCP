# Dome-World / Flow-Core v0.4.3

`/dome-world` is a non-public TD613 station that combines:

- the full browser cockpit and room system;
- Aperture v2.9.4 one-way route-weather translation;
- exact residual capture and proposal/confirmation training;
- opt-in lambda=2c emission-gap closure;
- Ash metadata custody, replay, and v0.6 projection leakage testing.

## Ash custody v0.6

`/dome-world/ash-custody.html` adds the Ash Custody Layer:

- local-only **Register Artifact** flow for browser file metadata and SHA-256 hashing;
- source-environment adapters for local files, repositories, cloud/local drives, spreadsheets/lists, LLM chat/session artifacts, and manual metadata;
- `td613.ash.custody-manifest/v0.5` and `td613.ash.custody-receipt/v0.5` receipts;
- Ash custody replay that re-renders custody state without rehydrating artifact material;
- Phason custody diff for content-invariant projection/custody changes;
- receipt indexing that keeps Receipts as a witness index rather than the custody owner;
- Leak Challenge / Reconstruction Pressure Lab for metadata-only projection analysis;
- Ash Veil, Cinder, Compare, Recall, Grade Gate, HCC adapter, and Flow-Core weather controller surfaces.

The route is intentionally an Ash station. Receipts index it; Ash owns the artifact custody boundary.

## Boundaries

Modeled weather never enters the exact gate. Exact execution does not activate
EO-RFD firmware. Ash server operations accept metadata/projection packets only.
Optional local text analysis stays browser-local and clears after scoring. Trainer
checkpoints remain client-held and HMAC-signed; server persistence is intentionally absent.

The primary navigation contains Weather, Aperture, Phason, Substrate, Ash,
Rooms, Receipts, and Dev. Legacy Math, Tomography, Live Lattice, Loom,
Stewardship, Patterns, Repo Weather, Lore, Accident, and API surfaces remain
inside the Dev hierarchy.

## API

One Python function serves `/api/dome-world/*`:

- `GET ping`, `GET readiness`, and compatibility `GET step2-readiness`
- `POST aperture-bridge`, `phason-gate`, `ash-readiness`
- `POST ash-custody-register`, `ash-custody-replay`, `phason-custody-diff`, `receipt-index`
- `POST ash-leak-challenge`, `ash-veil`, `ash-cinder`, `ash-compare`, `ash-recall`
- `POST ash-grade-gate`, `ash-hcc-adapter`, `ash-projection-simulate`
- `POST exact-capture`, `exact-closure`, `trainer-step`

Trainer proposal/confirmation requires `DOME_WORLD_TRAINER_ENABLED=1`,
`DOME_WORLD_OPERATOR_TOKEN`, and `DOME_WORLD_CHECKPOINT_SECRET`.
The cockpit accepts the operator token only in the Substrate station, keeps it
in `sessionStorage` for the current browser tab, and sends it only as the
`Authorization` header on `trainer-step` requests. It never enters packets,
receipts, checkpoints, localStorage, or repository files.

## Provenance

The exact package and verification artifacts are under
`packages/dome_world_exact/`. See its `PROVENANCE.md` and original specifications.

Ash custody design notes live in `app/dome-world/docs/ASH_CUSTODY_LAYER.md` and
`app/dome-world/docs/RECEIPT_JURISDICTION.md`.
