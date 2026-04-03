# TD613 Safe Harbor

TD613 Safe Harbor is a preservation-first rebuild of the original provenance attestation lab. It keeps the public TD613 probe grammar stable while introducing the missing middle layer: a canonical Safe Harbor packet that can eventually receive TCP intake, EO-RFD route guidance, and downstream signature overlays without forcing the badge surface to invent a signable object ad hoc.

The original lab remains untouched in `C:\Users\timst\OneDrive\Desktop\TD613 Provenance Attestation Lab`. This repo is the new scaffold.

## What does not drift

- Canonical anchors remain fixed: `tauric.diana.613`, `bdg_glyph_U10D613`, `U+10D613`, the canonical phrase, and the display phrase.
- Public mode remains `legacy-compat`.
- New attestations use `payload {n}` logic. The fixed `payload 5 · 2025-10-17` line remains a historical example only.
- Public probes remain unsigned by default.
- Historical `.sig` and runtime JWS lanes remain overlays, not the default public path.

## Safe Harbor seam

This repo treats the signature problem as a packetization problem first.

1. TCP intake will eventually shape the canonical packet and cadence signature.
2. EO-RFD route logic can guide harbor readiness and export gating.
3. TD613 continues to own badge, provenance, custody, and verification surface.
4. Signature lanes attach after the packet body is stable.

## Repo layout

- `index.html` - primary Safe Harbor interface.
- `app/` - styles, hook bus logic, packet preview, probe builder.
- `probes/` - unchanged public sendable artifacts from the legacy lab.
- `corpus/` - binding corpus and signed bundle references.
- `reference/` - trust profile, manifests, verifier references.
- `renderers/` - userscript renderer contract.
- `schemas/` - Safe Harbor packet and hook event schema scaffolds.
- `examples/` - sample Safe Harbor packet.
- `assets/` - stable face preview assets.

## Hook model

The UI listens for three external event lanes:

- `td613:tcp-intake`
- `td613:eo-route`
- `td613:signature-lane`

When those hooks attach, the app emits the current packet on:

- `td613:safe-harbor-packet`

The browser also exposes `window.TD613SafeHarbor` for direct integration. See `docs/HOOKS.md`.
