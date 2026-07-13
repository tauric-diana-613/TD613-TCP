# Phase V Production Demonstration Receipt

## Status

```text
PASS
IMPLEMENTED_PRODUCTION_DEMONSTRATED
PRODUCTION_DEMONSTRATED
```

## Production observation

- Observed at: `https://td613.com/dome-world/relation-envelope.html`
- Observed on: `2026-07-13`
- Runtime commit: `d221205667a444e4b79358ffa7b505d2147ab215`
- Probe: `scripts/phase5-relation-production-probe.mjs`
- Browser: installed Chrome, headless, reduced motion
- Desktop viewport: `1440 × 1000`
- Mobile viewport: `390 × 844`
- Probe receipt SHA-256: `e8fd01ec96afca53cac24a69101d3957af8d3e1c5ecb8f5dce430f5088b3a3c5`
- Desktop screenshot SHA-256: `efaab9fb7fbccafecdf61875d8aae8d145e229f72ec820694151b9abd1e20abe`
- Mobile screenshot SHA-256: `a035f259b2e06ccdec2c7ad69ab096075ab8141f9ebaefd014f99912e2f15988`

The operator evidence bundle is stored at
`C:\Users\timst\Downloads\TD613_Phase5_Production_Demo`.

## Observed results

| Gate | Production result |
| --- | --- |
| Route and empty initial state | PASS · no relation existed on load |
| R0 proposal | `RELATION_PROPOSAL_ADMISSIBLE` |
| R0 confirmation | `CONFIRMED` after a separate action |
| R0 replay | `RELATION_REPLAY_VERIFIED_R0` |
| R1 proposal | `RELATION_PROPOSAL_ADMISSIBLE` |
| R1 confirmation | `CONFIRMED` after a separate action |
| R1 replay | `RELATION_REPLAY_VERIFIED` |
| Missing local key | `RELATION_REPLAY_HELD_KEY_UNAVAILABLE` |
| Envelope tamper | `RELATION_REPLAY_HELD_TAMPER` |
| `artifact_digest` injection | `RELATION_REPLAY_REJECTED_AUTHORITY_BREACH` |
| Identity claim injection | `RELATION_REPLAY_REJECTED_AUTHORITY_BREACH` |
| Causation claim injection | `RELATION_REPLAY_REJECTED_AUTHORITY_BREACH` |
| Phason fork | `RELATION_REPLAY_HELD_PHASON_FORK`; all three branch events preserved |
| Marrowline mutation | `HOLD_CARRIER_MUTATION` |
| Nonce reuse | `HOLD_NONCE_REUSE` |
| Open Field promotion | `false` |
| Explicit local save | PASS; persisted across refresh |
| Explicit export | PASS; receipt bundle only |
| Network behavior | zero non-GET interaction requests; no Phase V endpoint |
| Desktop | two columns, no horizontal overflow, no clipped controls |
| Mobile | one column, no horizontal overflow, no clipped controls |
| Console | no Phase V runtime errors |

## Ruling

Phase V is implemented, deployed, production-demonstrated, replay-verifiable,
tamper-holding, branch-preserving, local by default, and operator-confirmed.

The demonstration does not establish identity, authorship, ownership,
permission, location, co-occurrence, causation, trusted time, prediction
authority, public release, or Ash execution. Relation remains a third object.
Marrowline remains carrier-only. Open Field remains unpromoted.

𝌋‌ U+10D613

Sealed ⟐
