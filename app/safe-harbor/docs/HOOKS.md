# TD613 Safe Harbor Hooks

## Browser API

Safe Harbor exposes `window.TD613SafeHarbor` with:

- `buildPacket()`
- `canonicalizePacket()`
- `getSealedPayload()`
- `getSignatureEnvelope()`
- `buildProbe(variant)`
- `refreshHelpers()`

## Event lanes

- `td613:tcp-intake`
- `td613:eo-route`
- `td613:signature-lane`
- `td613:safe-harbor-packet`

## Hook behavior

- TCP and EO hooks can reshape cadence credentials and provenance posture inside the packet.
- Signature hooks do not mutate the packet body. They create or refresh the detached signature envelope only.
- Safe Harbor emits `td613:safe-harbor-packet` whenever the staged packet is rebuilt.

## Signature distinction

- `cadence_credentials.cadence_signature` is the stylometric credential
- `signature` in the packet is a wrapper policy blueprint
- `getSignatureEnvelope()` returns the live detached signature attachment, if present

Use `canonicalizePacket()` for any detached signature or verification work. That call resolves to the same serializer used for `packet_hash_sha256`.
