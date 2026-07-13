# TD613 Phase V — The Third Object

## Relation Envelope + Phason Continuity

Status: **IMPLEMENTED_VALIDATION_GATED**  
Production status: **PRODUCTION_GATED**

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

- an L1 Ash receipt;
- a browser-local artifact digest;
- a fresh 128-bit-or-greater nonce;
- a per-relation, non-extractable HMAC-SHA-256 key;
- explicit operator selection.

The artifact digest remains outside the Relation Envelope. The envelope receives only a context-bound HMAC reference under `TD613:PHASE5:ASH-REFERENCE:v1`.

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

Marrowline may carry and render an envelope. Carrier mutation produces `HOLD_CARRIER_MUTATION`.

## Implementation map

- `app/engine/phase5-relation-crypto.js`
- `app/engine/phase5-relation-envelope.js`
- `app/engine/aperture-v3-relation-audit.js`
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
- non-extractable HMAC keys;
- nonce uniqueness and reuse holds;
- independent Ash digest verification;
- Phase IV round-trip replay;
- artifact-digest exclusion;
- explicit confirmation;
- lifecycle immutability;
- Phason links and forks;
- pure replay;
- missing-key distinction;
- Marrowline carrier integrity;
- desktop/mobile Lab structure;
- release synchronization.

Passing repository validation does not, by itself, earn `IMPLEMENTED_PRODUCTION_DEMONSTRATED`.

𝌋‌ U+10D613

Sealed ⟐
