# Ash Custody Layer v0.5

𝌋‌⟐

## Thesis

Ash is the artifact threshold for Dome-World. Receipts may index events, but Ash owns artifact custody. The next phase therefore routes artifact registration, custody replay, privacy boundaries, credential references, and provenance adapters through Ash first.

## Placement

- **Ash** registers artifacts and issues custody manifests / custody receipts.
- **Receipts** indexes station receipts and routes replay back to the owning station.
- **Phason** compares two Ash custody receipts when content is invariant but projection, route, credential, revision, or export posture changes.
- **Aperture** receives bounded route-weather / claim-ceiling posture only.
- **Substrate** remains exact-coordinate only until the encoder seam exists.

## Source environments

Ash v0.5 recognizes these source environments:

- `local_file`
- `repo`
- `cloud_drive`
- `local_drive`
- `spreadsheet`
- `llm_chat`
- `manual`

Every source environment resolves to metadata and custody posture, not server-side raw content custody.

## Register Artifact, not Upload Artifact

The human-facing action is **Register Artifact**. The system may expose a file picker for local hashing, but the semantic operation is registration, not upload. Browser-local bytes are read only long enough to compute metadata and SHA-256, then discarded. Server calls receive manifests only.

## Custody replay

Custody replay re-renders an Ash custody receipt without rehydrating the artifact. It is not fresh execution, proof, content access, or permission validation.

## Phason custody diff

A Phason custody diff compares two Ash custody states. When the content hash remains fixed and custody/projection posture changes, the system emits a seam event. That seam is a receipt lane, not external enforcement.

## Claim ceilings

- `ash-custody-receipt-not-content-custody-or-permission-proof`
- `ash-custody-replay-not-fresh-execution-or-content-access`
- `phason-custody-diff-not-external-enforcement-or-permission-proof`
- `receipt-index-not-custody-owner-or-universal-authority`

## Hard stops

- No server persistence of raw content.
- No credential secrets in receipts.
- No identity-proof or permission-proof claim.
- No summary before custody.
- No arrival-as-consent logic.
- No messy artifact to exact-coordinate encoding until the E6 encoder front is explicitly designed.

Sealed ⟐
