# Ash Custody Layer v0.6

𝌋‌⟐

## Thesis

Ash is the artifact threshold for Dome-World. Receipts may index events, but Ash owns artifact custody. Ash v0.6 keeps the v0.5 metadata-only custody spine and adds a Leak Challenge / Reconstruction Pressure Lab for testing whether permitted projections leak beyond their claim ceilings before they enter public, model-facing, or third-party routes.

## Placement

- **Ash** registers artifacts, issues custody manifests / custody receipts, runs Leak Challenge, builds Veils and Cinders, compares projection pressure, and issues Recall notices.
- **Receipts** indexes station receipts and routes replay back to the owning station.
- **Phason** compares two Ash custody receipts when content is invariant but projection, route, credential, revision, or export posture changes.
- **Aperture** receives bounded route-weather / claim-ceiling posture only. Aperture is bridge and seam detector, not the Ash crown.
- **Substrate** remains exact-coordinate only until the encoder seam exists.

## Source environments

Ash recognizes these source environments:

- `local_file`
- `repo`
- `cloud_drive`
- `local_drive`
- `spreadsheet`
- `llm_chat`
- `manual`

Every source environment resolves to metadata and custody posture, not server-side raw content custody.

## Register Artifact, not Upload Artifact

The human-facing action is **Register Artifact**. The system may expose a file picker for local hashing, but the semantic operation is registration, not upload. Browser-local bytes are read only long enough to compute metadata and SHA-256, then discarded. Server calls receive manifests and projections only.

## Leak Challenge / Reconstruction Pressure Lab

The Lab asks: given only the permitted projection, what can a model, analyst, hostile reader, or linkage system infer that the projection was not supposed to reveal?

Server mode is metadata-only. It rejects raw content keys and evaluates receipts, public weather cards, Veils, Cinders, Compare results, Phason diffs, and receipt index rows. Client-local mode may inspect raw text in the browser, never sends that text to the server, and clears it after scoring.

Leakage metrics:

- reconstruction pressure
- entity inference pressure
- chronology leakage
- stylometric heat
- linkage pressure
- custody category leakage
- authority drift
- anti-equivalence collapse

Verdicts:

- `OPEN`
- `WATCH`
- `COOL_ROUTE`
- `BLOCK_EXPORT`
- `QUARANTINE`
- `RECALL_RECOMMENDED`

## Veil, Cinder, Compare, Recall

- **Ash Veil** is a structural surrogate, not a content summary.
- **Ash Cinder** is an operator-approved minimal fragment, not a full document or summary. It remains held until a Leak Challenge passes.
- **Ash Compare** reports pressure deltas without certifying legal redaction.
- **Ash Recall** marks a receipt, Veil, Cinder, or index row stale or recalled without claiming deletion from external systems.

## Grade Gate and HCC

Grade Gate records constrained acquisition context without claiming third-party enforcement. Lower-force grades win when provenance is ambiguous.

Human Coordinate Coupling preserves functional context without administrative identity inference:

- WHAT ↔ WHO
- WHERE ↔ HOW
- WHEN ↔ WHY

WHO remains self-provided or withheld. HOW is non-diagnostic. WHY is non-predictive.

## Custody replay

Custody replay re-renders an Ash custody receipt without rehydrating the artifact. It is not fresh execution, proof, content access, or permission validation.

## Phason custody diff

A Phason custody diff compares two Ash custody states. When the content hash remains fixed and custody/projection posture changes, the system emits a seam event. That seam is a receipt lane, not external enforcement.

## Claim ceilings

- `ash-custody-receipt-not-content-custody-or-permission-proof`
- `ash-leak-challenge-risk-estimate-not-anonymity-certification`
- `ash-reconstruction-pressure-not-proof-of-external-leakage`
- `ash-veil-structure-not-content-summary`
- `ash-cinder-fragment-not-full-document`
- `ash-compare-delta-not-legal-redaction-certification`
- `ash-recall-not-erasure-proof`
- `ash-grade-gate-context-record-not-third-party-enforcement`
- `hcc-context-routing-not-identity-proof`
- `phason-custody-diff-not-external-enforcement-or-permission-proof`
- `receipt-index-not-custody-owner-or-universal-authority`

## Hard stops

- No server persistence of raw content.
- No credential secrets in receipts.
- No identity-proof or permission-proof claim.
- No summary before custody.
- No arrival-as-consent logic.
- No anonymity certification.
- No crawler or outside-system defeat claims.
- No legal compliance certification.
- No beauty-as-verification.
- No receipt-as-proof.
- No module becomes the crown.

Sealed ⟐
