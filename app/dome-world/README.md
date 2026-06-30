# Dome-World / Flow-Core v0.4.3

`/dome-world` is a non-public TD613 station that combines:

- the full browser cockpit and room system;
- Aperture v2.9.4 one-way route-weather translation;
- exact residual capture and proposal/confirmation training;
- opt-in lambda=2c emission-gap closure;
- readiness-only Ash metadata posture.

## Boundaries

Modeled weather never enters the exact gate. Exact execution does not activate
EO-RFD firmware. Ash accepts metadata only. Trainer checkpoints remain
client-held and HMAC-signed; server persistence is intentionally absent.

The primary navigation contains Weather, Aperture, Phason, Substrate, Ash,
Rooms, Receipts, and Dev. Legacy Math, Tomography, Live Lattice, Loom,
Stewardship, Patterns, Repo Weather, Lore, Accident, and API surfaces remain
inside the Dev hierarchy.

## API

One Python function serves `/api/dome-world/*`:

- `GET ping`, `GET readiness`, and compatibility `GET step2-readiness`
- `POST aperture-bridge`, `phason-gate`, `ash-readiness`
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
