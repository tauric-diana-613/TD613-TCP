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
- expose packet checksum and packet lifecycle

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

1. `receipt`
2. `canon`
3. `ingress`
4. `intake`
5. `analysis`
6. `issuance`
7. `bridge`

That split preserves the boundary between:

- what is fixed
- what receipt identity was minted
- what ingress was held
- what was ingested
- what the route engines concluded
- what downstream lanes are allowed to do

## Canonical JSON contract

Safe Harbor now treats canonicalization as an explicit contract rather than an implied implementation detail.

`canonical_json(packet)` means:

- UTF-8 encoding
- sorted object keys
- array order preserved
- no whitespace variance
- `undefined` fields omitted
- self-hash fields excluded before hashing or signature wrapping

The current canonicalization id is:

- `td613.safe-harbor.c14n/v1`

The signable body is therefore:

- the full packet
- minus `packet_hash_sha256`
- minus `packet_checksum`

That body is serialized once, hashed once, and then handed to any signature wrapper lane.

## Packet hash anchor

The canonical packet body now emits:

- `packet_hash_sha256`

`packet_checksum` is retained as a compatibility alias for older readouts and downstream surfaces that still expect a prefixed checksum string. New integrations should prefer `packet_hash_sha256` as the audit anchor and signature handshake field.

## Lifecycle stance

Safe Harbor distinguishes route posture from packet lifecycle.

The current lifecycle vocabulary is:

- `staged`
- `sealed`
- `exported`
- `verified`

The current browser chamber implements:

- `staged` after the ingress triad opens the vault and mints a packet
- `sealed` after `Covenant Export` confirms the packet for signature-ready harbor handling

`exported` and `verified` remain future downstream states once real emit and verification lanes are attached.

## Public contract stance

The public sendable probes are preserved from the old lab.

This repo does not silently change those outputs yet.

Instead, it builds the Safe Harbor packet in parallel so the future intake rollout can happen without ontology drift.

## Signature rule

JWS, `.sig`, or any future signature lane wraps the Safe Harbor packet.

It does not define the packet.
It does not mutate the packet shape.
It does not inject missing canon retroactively.
