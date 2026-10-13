# Phase 5 Signal Envelope

Every external Phase 5 signal enters Hush through:

```text
td613.phase5.eorfd-interface-signal/v1
```

The envelope forces a signal to declare its source family, signal class, foundation lane, receipt class, constants namespace, register/layer translation state, replay posture, claim ceiling, allowed effects, forbidden effects, payload reference, and raw-payload posture.

## Source families

- `EO-RFD`
- `ACEDIT`
- `KIRA`
- `VECTOR_RESIDUAL`
- `TOPOLOGY`
- `UNKNOWN`

## Signal classes

- `rupture`
- `layer`
- `encoding`
- `substrate`
- `residual`
- `topology`
- `unknown`

## Foundation lanes

- `admissibility`
- `projection`
- `capacity`
- `naming`
- `rupture`
- `temporal`
- `geometry`
- `residual`
- `route`
- `witness`
- `harbor`
- `packet`
- `unresolved`

Signals with `unresolved` foundation lanes route as warning/witness material, not active routing authority.

## Claim ceiling

Every signal must accept that it is not identity proof, authorship proof, legal authority, semantic truth proof, consciousness proof, release permission, validator override, Safe Harbor override, Hush override, or Aperture override.

## Effects

Allowed effects:

- `warn`
- `route_pressure`
- `witness_note`
- `adapter_preflight`
- `audit_priority`

Forbidden effects:

- `release`
- `validate`
- `prove`
- `identify`
- `authorize`
- `override`
- `publish`

## Raw payload rule

`raw_payload_included` must remain false.

Payloads should be represented by hash or pointer, not embedded private content.

⟐SAC[X6ZNK5NO51]
