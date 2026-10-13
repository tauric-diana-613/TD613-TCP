# Ash Keep v1.0-alpha

Ash Keep is a browser-local workspace for preserving a case's structure while testing what a purpose-shaped disclosure could make recoverable through a declared route.

## Product Language

- **Case Map:** people, records, events, claims, hypotheses, evidence gaps, sources, intended actions, and their relationships.
- **Rooms:** local compartments whose linking keys do not leave by default.
- **Route Memory:** an exact record of what actually left, separate from controlled test results, operator assumptions, and unknowns.
- **Readers:** named local, synthetic, or imported reconstruction procedures.
- **Rebuild Test:** componentwise before/after recovery testing.
- **Exposure Weather:** the tested vector of entity, relationship, Room bridge, linkage, chronology, hypothesis, and next-action exposure.
- **Ash Draft:** a selected derivative prepared for review.
- **Release Receipt:** local-export approval bound to one exact draft, route, recipient class, purpose, version, nonce, and operator gesture.
- **Save Point / Ash Capsule:** continuity receipt and optional authenticated encrypted copy.

## Vulnerable Investigators And Hush API Use

The default workflow keeps the complete Case Map, Rooms, Route Memory, private chronology, local aliases, raw records, and protected notes in IndexedDB. `localStorage` holds only the current-case pointer and compact interface preferences.

For AI-assisted work:

1. Open or paste a selected text excerpt locally in **Draft**.
2. Use Rooms and structural surrogates to remove joining keys that are not needed for the task.
3. Run **Test this draft** and **Link Check** locally.
4. Enter protected names or phrases and run **Screen provider packet**.
5. Review copied-instruction, protected-literal, and internal-reference findings.
6. Confirm the exact selected text and task.
7. Ash Keep creates `td613.ash.provider-packet/v0.1` with a fresh consent nonce and digest.
8. The existing Hush provider endpoint verifies packet parity before invoking Gemini.
9. Ash Keep records the exact sent text, returned text, provider, model, and provider-response digest locally.

The API accepts Ash Keep modes `synthetic-reader` and `provider-draft`. A provider draft requires explicit confirmation and a valid packet. The endpoint rejects complete maps, graph bodies, Room keys, Route Memory, route histories, private aliases, private chronology, stable cross-route IDs, attachments, attachment-like payloads, and packet/source mismatches.

Provider provenance records the transition. It does not turn an external provider into local custody or a confidential recipient. A provider-generated draft returns as an unkept successor and must pass a new local review. Final-recipient transport is absent from this release.

## Storage And Cryptography

Ash Capsules use WebCrypto AES-256-GCM with a unique 96-bit IV, 128-bit salt, and PBKDF2-HMAC-SHA-256 with at least 600,000 iterations. Passphrases and derived keys are never persisted. Capsule metadata is authenticated as AES-GCM additional data; schema, digest, metadata, or ciphertext tampering fails before import.

## Station Ownership

- Ash owns local case custody, drafts, continuity, and local release approval.
- Aperture owns Rebuild Tests, residue, alternatives, replay, and tamper checks.
- Hush owns local text screening and the existing provider route.
- Flow-Core receives only tested vector summaries and receipt references.
- Phason records source-invariant route or projection changes.
- Marrowline and Kʰonapolit remain carrier, ingress, provenance, and lineage surfaces.
- EO-RFD, ACEDIT, and KIRA remain bounded signals or test-design helpers.

Recipient transport remains deferred.
