# TD613 Safe Harbor

TD613 Safe Harbor is a preservation-first rebuild of the original provenance attestation lab. It keeps the public TD613 probe grammar stable while introducing the missing middle layer: a canonical Safe Harbor packet that can eventually receive TCP intake, EO-RFD route guidance, and downstream signature overlays without forcing the badge surface to invent a signable object ad hoc.

The original lab remains untouched in `C:\Users\timst\OneDrive\Desktop\TD613 Provenance Attestation Lab`. This repo is the new scaffold.

## Current stabilization pass (0.4.1)

This pass does five things first: remove auto-unvault, require explicit staged-packet minting, move operator bypass to a distinct packetless shell state, remove the hardcoded bypass secret from the client ship, normalize packet lifecycle naming, and rename `packet_checksum` to `packet_hash_sha256`.

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


## Operator bypass

Operator bypass is no longer protected by a hardcoded client-side password. Public ship now supports a session-local operator token setup inside the UI: set a local token for the current session, then use the same token to open the packetless operator shell. This keeps bypass off by default while remaining usable without dev-console surgery.


## Current stabilization pass — do next layer

This pass patches canon drift in the reference verifier surfaces, removes `.git` from the shipped archive, aligns Safe Harbor internal version labels to `0.4.0`, and sharpens the boundary between:
- public mode
- operator mode
- dev/demo mode

Public mode remains the default shipping lane. Operator and dev affordances are intentionally narrower and must not be mistaken for canon or public workflow.

## Boundary policy

- **Public mode**: ingress triad, staged packet minting, canonical footer preview, public-safe packet summary.
- **Operator mode**: packet preview, advanced signature-lane overlays, packetless operator shell, controlled export transitions.
- **Dev mode**: local demo hook buttons and simulation helpers only; disabled by default in public ship.


## Current stabilization pass — do later layer

This pass makes three structural changes:
- public probe building now derives packet context from the staged packet instead of helper values alone,
- placeholder badge-number minting is replaced with a deterministic badge assignment id derived from canonical intake context,
- operator signature overlays attach to the staged packet cleanly after packetization rather than floating beside it.

Public mode remains unsigned by default. Advanced signature sealing is operator-only and never changes the compact public footer.

## Membrane boot behavior
- Only Question 1 is visible by default in raw HTML. Questions 2 and 3 unlock sequentially after JS boot and lane completion.
- The membrane only dissolves after a successful staged-packet mint.
- If packet minting fails, the membrane re-seals and the ingress note surfaces the failure message.
- Public ship disables bypass and mint controls until JS boot completes.
