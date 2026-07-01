# Phase 10 Release Status Model

Status enum:

- draft
- local-pass
- fixture-provider-pass
- runtime-flight-pending
- runtime-flight-pass
- release-candidate
- harbor-eligible
- sealed
- blocked
- revoked

`sealed` is never assigned by the recommendation algorithm. It requires an explicit seal action.

`fixture-provider-pass` is not live provider validation.

`harbor-eligible` is not public release permission.

`runtime-flight-pass` requires deployed runtime evidence.

Sealed ⟐
