# TD613 Hush Customizer Packet v1

The Hush Customizer packet is a Safe Harbor-derived packet discipline for local stylometric mask formation.

It is not a Safe Harbor SHI packet.

It is not a credential.

It is not identity proof.

It is a local stylometric transformation profile with corpus provenance, sample hashes, readiness, routing, private-text policy, and release discipline.

## Schema

```text
schema_version: td613.hush.customizer-packet/v1
packet_version: hush-customizer-packet/v1-safe-harbor-derived
packet_class: local-stylometric-mask-corpus
```

## Identifier

Customizer packets use:

```text
TD613-HUSH-CUSTOMIZER-YYYYMMDD-XXXXXXXX
```

They must not use SHI as the mask identifier.

## Core rule

Redacted Customizer packet exports include hashes, metrics, readiness, routing summaries, surface cadence, warnings, release class, claim limits, and packet hash topology.

They do not include raw reference samples by default.

## Claim limits

A Hush Customizer packet is a stylometric transformation profile. It does not prove identity, authorship ownership, third-party consent, public/legal/civil recognition, or authorization to impersonate. It does not make raw corpus text safe to export.

## Restore rule

Normal restore requires more than a hash. A packet must provide schema, packet id, valid `sha256:<64_hex>` hashes, sample ledger, corpus readiness, private-text policy, release discipline, and mode/trigger routing structure.

Hash-only packets are blocked.

Malformed hashes are blocked.

Raw samples in a redacted import are blocked.

## Event-chain note

This is the first Hush packetization step after Safe Harbor Phase 9.1C. Mask Studio packets should come later. The Customizer is upstream: it is where fabric enters the fitting room, so the packet law starts here.

## Run

```bash
npm run test:hush:customizer-packet
```

⟐SAC[X6ZNK5NO51]
