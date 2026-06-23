# Phase 5 Dirty Packet Refusal

A dirty Phase 5 packet is any signal or packet surface that tries to enter Hush without the receiving law.

## Dirty conditions

Phase 5 refuses signals that:

- lack the Phase 5 signal envelope
- lack source family
- lack signal class
- lack or leave unresolved the foundation lane for routing use
- claim authority beyond signal-source-only
- request forbidden effects
- skip or fail replay when replay is required
- include raw private writing without custody path
- treat constants without namespace declaration
- attempt EO-RFD, ACEDIT, or KIRA runtime import
- claim validator override
- claim Safe Harbor override
- claim Hush override
- claim Aperture override

## Refusal record

Refusals use:

```text
td613.hush.phase5.refusal-receipt/v1
```

Refusal receipts record timestamp, source family, signal class, foundation lane, refusal reasons, payload pointer hash when available, authority ceiling confirmation, and runtime posture.

Refusal receipts do not include raw private text by default.

## Attachment law

`attachPhase5Signal()` returns a sidecar attachment result. It does not mutate the original sealed packet body.

- pass: sidecar `phase5.eorfdInterface.signals[]`
- warn: sidecar `phase5.unresolvedWitnessSignals[]`
- block: sidecar `phase5.refusalReceipts[]`

No sealed packet receives a silent Phase 5 overlay.

⟐SAC[X6ZNK5NO51]
