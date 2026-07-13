# TD613 Phase V — The Third Object

## Relation Envelope + Phason Continuity

Status: **IMPLEMENTED_PRODUCTION_DEMONSTRATED**
Production status: **PRODUCTION_DEMONSTRATED**

Phase V introduces a local third object among three independently valid receipts:

1. `td613.ash.custody-receipt/v0.8`
2. `td613.flowcore.context-receipt/v0.1`
3. `td613.aperture.round-trip-receipt/v3.0-alpha`

The relation does not merge the stations, inherit their authority, or convert proximity into proof.

> Relation is a third object: derived from independently valid receipts, operator-confirmed, locally bounded, lifecycle-bearing, and replayable without becoming identity, custody, causation, co-occurrence, permission, or proof.

## Contracts

- `td613.relation-envelope/v0.1`
- `td613.relation-confirmation-receipt/v0.1`
- `td613.aperture.relation-audit/v0.1`
- `td613.phason.relation-event/v0.1`
- `td613.phason.relation-chain/v0.1`
- `td613.relation-replay-receipt/v0.1`
- `td613.phase5.relation-runtime/v0.1`

## Runtime route

```text
independent receipt validation
→ pure relation proposal
→ Aperture relation audit
→ explicit operator confirmation
→ local Relation Envelope
→ Phason relation event
→ optional explicit local persistence or export
```

## Assurance classes

### R0 — receipt references only

`R0_RECEIPT_REFERENCES_ONLY` binds validated receipt references, route scope, purpose, and a fresh context nonce. It carries no byte-derived artifact relation.

### R1 — route-scoped artifact reference

`R1_ROUTE_SCOPED_ARTIFACT_REFERENCE` requires:

- an L1 Ash receipt with a digest-valid browser-local artifact commitment;
- the same browser-local artifact digest that the Ash receipt commits;
- a fresh 128-bit-or-greater nonce;
- a per-relation, non-extractable HMAC-SHA-256 key;
- explicit operator selection.

The compiler rejects a local digest that does not equal the commitment inside the validated Ash receipt. The artifact digest remains outside the Relation Envelope. The envelope receives only a context-bound HMAC reference under `TD613:PHASE5:ASH-REFERENCE:v1`.

## Confirmation integrity

Confirmation recomputes and verifies both the proposal digest and the Aperture audit digest. The audit must name the same relation and proposal digest. Every confirmation claims the relation nonce through a bounded local registry, including callers that do not provide their own registry. Reconfirming the same nonce returns `HOLD_NONCE_REUSE`.

The generic lifecycle snapshot export cannot create a confirmed, revised, withdrawn, or superseded state. Those transitions remain reachable only through the dedicated operator-confirmation and lifecycle operations.

## Lifecycle

```text
PROPOSED
CONFIRMED
REVISED
WITHDRAWN
SUPERSEDED
```

Confirmed envelopes remain immutable. Revision creates a new relation, nonce, and R1 key. Withdrawal never mutates source receipts. Supersession preserves the predecessor and its Phason events.

## Authority boundaries

The runtime adds:

- no server endpoint;
- no new serverless function;
- no server persistence;
- no automatic relation creation;
- no automatic confirmation;
- no automatic Ash action;
- no prediction authority;
- no Open Field auto-promotion;
- no identity, authorship, ownership, permission, location, co-occurrence, or causation proof;
- no Marrowline confirmation or closure authority.

Marrowline may carry and render only a sealed envelope packet. Missing or mutated carrier digests produce `HOLD_CARRIER_MUTATION`.

## Implementation map

- `app/engine/phase5-relation-crypto.js`
- `app/engine/phase5-relation-contract.js`
- `app/engine/phase5-relation-lifecycle.js`
- `app/engine/phase5-relation-envelope.js` — stable public facade
- `app/engine/phase5-relation-audit-core.js`
- `app/engine/aperture-v3-relation-audit.js` — stable Aperture facade
- `app/engine/phase5-phason-relation-ledger.js`
- `app/engine/phase5-relation-replay.js`
- `app/dome-world/marrowline-relation-carrier.js`
- `app/dome-world/relation-envelope.html`
- `app/dome-world/schemas/*relation*`
- `tests/phase5-third-object.test.mjs`
- `.github/workflows/dome-world-phase5.yml`

## Validation posture

The Phase V CI gate covers:

- R0/R1 non-equivalence;
- non-extractable, per-relation HMAC keys;
- nonce validation, uniqueness, and reuse holds;
- independent Ash receipt digest verification;
- equality between the R1 local digest and the Ash-committed digest;
- Phase IV round-trip replay;
- proposal and audit digest binding before confirmation;
- artifact-digest exclusion;
- explicit confirmation and blocked generic state-transition bypasses;
- fresh relation ID, nonce, and key on revision;
- Phason links and forks;
- pure replay and cross-receipt reference binding;
- missing-key distinction;
- sealed Marrowline carrier integrity;
- desktop/mobile Lab structure;
- release synchronization.

Repository validation is supplemented by the direct deployed probe sealed in
`PHASE_5_PRODUCTION_DEMO_RECEIPT.md`. That probe exercises R0/R1 proposal,
confirmation, replay, tamper holds, Phason fork preservation, Marrowline carrier
integrity, local persistence/export, and desktop/mobile layout against
`https://td613.com`.

𝌋‌ U+10D613

Sealed ⟐
