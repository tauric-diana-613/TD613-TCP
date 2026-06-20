# TD613 Safe Harbor UI Export Surface Policy

Phase 9.1 treats every export, copy, paste, verifier readout, and offline capsule as a release-adjacent surface.

## Rule

Every export must be classified before it leaves the UI.

Allowed classes:

- public-readable
- verification-ready
- operator-only
- sealed-private
- blocked

Every public or verification export must carry:

- public root: v2
- Phase 8 public display mode
- Phase 9 release class
- claim limits
- raw_text_exported: false

## Surfaces

The policy covers packet JSON export, Open .txt preview, packet preview copy, forensic schema copy, probe output copy, canonical footer copy, SVG attestation copy, signature overlay copy, operator receipt copy, public summary copy, verification summary copy, and offline capsule export.

## Forbidden release language

UI export surfaces must not present v3 as public default, SH3 as replacing SHI, Blood Rite 613 as a public credential, or any packet as civil identity, legal identity, public law approval, or authorship ownership proof.

## Covenant note

Blood Rite 613 may appear as covenant display. Khona‌lit-po is ZWNJ-sensitive and must not be flattened.

## EO-RFD note

EO means EO-RFD route firmware / hook lane in this project, not executive-order authority.
