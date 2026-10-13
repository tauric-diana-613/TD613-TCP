# Phase 6 Safe Harbor Handoff

The Safe Harbor handoff lane carries custody facts only.

Schema:

```text
td613.safeharbor.phase6-custody-handoff/v1
```

Allowed handoff facts:

- unified audit packet ID
- packet hash
- packet status
- claim ceiling status
- hash replay status
- release allowed flag
- raw private text posture
- custody-facts-only flag
- excluded-forbidden-claims flag

The handoff does not carry raw private text by default.

It does not treat Phase 6 as release approval.

It does not turn stylometry, topology, residual, ACEDIT, KIRA, or EO-RFD lanes into a public credential.

⟐SAC[X6ZNK5NO51]
