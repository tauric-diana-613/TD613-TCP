# TD613 Safe Harbor Architecture

## Intent

TD613 Safe Harbor is the canonical intake membrane that sits between provenance ritual context and cryptographic signature lanes.

The goal is not to make TCP into a signer.

The goal is to let TCP and EO-RFD shape a stable packet body first so the signature layer has a clean object to seal.

## Role split

### TCP

TCP is the eventual intake and canonicalization engine.

- ingest text and badge context
- compute cadence signature
- shape canonical packet fields
- expose packet hash and packet lifecycle

### EO-RFD

EO-RFD is the route conscience and export guard surface.

- route state
- harbor recommendation
- packet hardening language
- export gating vocabulary

### TD613

TD613 remains the provenance and custody surface.

- badge claim
- canonical phrase and display phrase
- trust grammar
- verifier and public probe lane

### Signature overlays

Signature lanes attach only after packetization.

- Ed25519 / EdDSA detached `.sig` for durable badge-zone and registry lanes
- JWS for runtime or middleware request lanes

## Current Safe Harbor packet scaffold

The current packet schema is split into these layers:

1. `canon`
2. `intake`
3. `analysis`
4. `bridge`

That split preserves the boundary between:

- what is fixed
- what was ingested
- what the route engines concluded
- what downstream lanes are allowed to do

## Public contract stance

The public sendable probes are preserved from the old lab.

This repo does not silently change those outputs yet.

Instead, it builds the Safe Harbor packet in parallel so the future intake rollout can happen without ontology drift.


## Stabilization notes (0.5.0)

- The ingress membrane no longer auto-opens when the third lane fills. Operators must explicitly mint the staged packet.
- Boot-safe membrane state is now explicit: pending boot clears on success and remains sealed on runtime faults.
- Operator bypass is a distinct packetless shell state and must not be treated as equivalent to a staged packet.
- Principal assertion and operator witness are separate handshake records on the packet and must both exist before Covenant Export can clear the harbor gate.
- Signature lanes still attach after packetization; they do not mint or mutate the packet body.
- Canonical lifecycle names now prefer `staged`, `sealed`, `harbor-eligible`, `exported`, and `verified`.


## Public / operator / dev boundary

- Public mode ships with canonical intake, staged packet minting, and public-safe readouts only.
- Operator mode may inspect packet internals and attach signature-lane overlays after local authorization.
- Dev mode is reserved for local hook simulation and is disabled by default in public ship.


## Current stabilization pass — do later layer

This pass makes three structural changes:
- public probe building now derives packet context from the staged packet instead of helper values alone,
- placeholder badge-number minting is replaced with a deterministic badge assignment id derived from canonical intake context,
- operator signature overlays attach to the staged packet cleanly after packetization rather than floating beside it.

Public mode remains unsigned by default. Advanced signature sealing is operator-only and never changes the compact public footer.
