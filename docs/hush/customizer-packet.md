# TD613 Hush Customizer Packet v1

`td613.hush.customizer-packet/v1` is the Safe Harbor-derived packet spine for Hush Customizer.

It is not a Safe Harbor issuance packet and must not use SHI as the mask identifier.

## Identifier

Use a Hush-specific packet id:

```text
TD613-HUSH-CUSTOMIZER-YYYYMMDD-XXXXXXXX
```

Safe Harbor lineage may be recorded as development provenance, but Hush Customizer packets are local stylometric transformation profiles, not custody/replay credentials.

## Claim limit

A Hush Customizer Packet is a local stylometric transformation profile. It does not prove identity, authorship ownership, third-party consent, public/legal/institutional recognition, or permission to impersonate any person. It does not make raw corpus text safe to export.

## Redacted by default

Redacted packets include:

- sample hashes
- sample metrics
- discourse mode
- retrieval trigger
- corpus readiness
- routing profile
- ontology profile
- private text policy
- release discipline
- hash topology

Redacted packets must not include raw sample text.

## Release classes

- `empty`
- `corpus-building`
- `preview-only`
- `operational-local`
- `rigorous-local`
- `exportable-redacted`
- `operator-private`
- `blocked`

## Hash topology

Every packet-grade hash must use:

```text
sha256:<64_hex>
```

A hash-only Customizer packet is not enough to restore or import. Valid packets need hash topology plus corpus/readiness/release authority.

## Migration rule

Legacy Customizer fields migrate as follows:

- `sampleCategory` or `promptCategory` becomes `discourse_mode`
- `contextLabel` becomes `retrieval_trigger`

Do not flatten `discourseMode` back into sample category. Do not flatten `retrievalTrigger` back into context label.

## First implementation scope

The first pass adds builder, validator, docs, and tests. UI wiring belongs in the next pass.
