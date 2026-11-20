# RGI19–21 · Composer custody, human verification, and seven-source reconciliation

**Scope:** PR #1730, user-submitted synthesis consequences only. Engineering changes remain under code review/CI. Protected Flight, production release, automatic corpus admission and irreversible substitutions remain **HELD**.

## RGI19 · Independent human Compose

- `scripts/vixen-compose-human-webauthn.mjs` verifies WebAuthn P-256 assertions against a trusted **host-side** credential registry, RP ID and exact origin, with user presence and user verification required.
- Challenge binds exact Score digest, source revision, full consequences, 24-byte nonce, and expiry. Replays require a monotonic counter and an atomic nonce consumption through the custody ledger.
- `scripts/vixen-compose-host-session.mjs` joins the existing Podium gate, trusted human verifier, and durable ledger for a **local preview only**. It cannot write corpus/index or release.
- **Outstanding infrastructure requirement:** independently verify and enroll the operator's WebAuthn credential, configure trusted RP ID/origin and persistent host ledger, and add a trusted authentication service/route. No credentials, secrets, real human receipts or host service have been created by this PR.

## RGI20 · Durable ledger and recovery

- `scripts/vixen-compose-custody-ledger.mjs` records consecutive SHA-256 hash-linked receipts on an externally provisioned persistent host filesystem. Single-writer atomic lock, per-file flush, contiguous prefix verification, nonce/counter replay rejection; no automatic stale-lock override.
- Baselines record exact Git revision, manifest hash, search-index hash, and restoration reference. Transaction records require before/after identities; rollback outputs a **proposal**, not a write.
- **Outstanding infrastructure requirement:** deploy a persistent host service and independently anchor each head digest off-box. A hash chain alone cannot prove external origin or prevent deletion of all files. The ledger cannot claim external custody until independently witnessed.

## RGI21 · Seven historical identities

- `SEVEN_SOURCE_RECONCILIATION_HELD.json` records seven exact metadata-only PDF registrations from historical commit `7824615fedc1ec333dc38edb692e399e2a216bf4` (pre-exclusion).
- Exclusion commit `18cd2305ec069f9f672f0c8af2dbf6ea6d7ed7e4`; seven-free index regeneration `e32b82f0d657f7b20b2dd6b86c164ad2a8e5d380`.
- **Historical:** 32 Works, 53 Works manifestations, 7 prospective Batch-B metadata registrations. **A0:** 32 Works, 53 manifestations, 0 prospective Batch-B registrations.
- Filename/size/hash declarations do **not** verify binary PDFs. Corruption remains unproven. Current-index before/after SHA and source identity presence are reported through read-only `node scripts/reconcile-vixen-seven.mjs`.
- The eighth blind material remains unacquired; no hydration, recipient installation, source mutation or experimental promotion was performed.

## Operational hold

These commits install **bounded source and host-side verification primitives**, not a public human-authentication app and not a production evidence service. Integration must be tested with independently provisioned enrollment and genuinely persistent storage before any claim of end-to-end readiness. All present results remain **preview-only or HELD**.

**Human closure RESERVED. ⟐**
