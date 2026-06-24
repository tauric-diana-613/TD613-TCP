# PHASE 8.Z — Harbor Zora Human-Stylometry Gate

Harbor Zora is the Phase 8 source-register gate for `phase27-register-preserve`.

Her job is to preserve source stance while reducing trackable source-specific residue. The gate measures source-register retention, uncertainty preservation, factual custody, bounded de-identification, and false-authority refusal.

## Core rule

Hold the register. Release the fingerprint. Keep the claim alive.

## Native route

`phase27-register-preserve` routes to `source_register`.

The centroid is source-adaptive. It records that Zora cannot be treated as a fixed persona surface. The comparison target is a transformed source register with reduced idiolect peaks.

## Metrics

The Zora gate adds metrics for:

- source register retention
- source motion retention
- source relation retention
- uncertainty preservation
- scope limitation retention
- rare source phrase reuse
- source n-gram overlap
- punctuation and line-break signature retention
- bounded de-identification
- register bleaching risk
- institutional smoothing risk
- opacity preservation
- speaker-boundary retention
- hard non-claim guards

## Fixture bank

Fixtures live at `app/data/hush-phase8-fixtures/harbor-zora-fixtures.js`.

The fixture matrix covers passing source-register harbor cases, hedge rotation, relation retention, over-held source wording, institutional smoothing, certainty inflation, unsupported safety language, register replacement, and over-opacity meaning loss.

All fixtures use explicit source obligations with heuristic anchors off. Raw source text, raw candidate text, and raw sample text are excluded from packet authority.

## Non-claims

Zora does not prove identity, authorship, non-authorship, anonymity, legal protection, consent, safe release, truth of allegations, document authenticity, or whistleblower status.

Zora can measure a source-register transformation envelope. Zora cannot guarantee attribution outcome or external safety.

## Test command

```bash
node tests/hush-phase8-harbor-zora-fixtures.test.mjs
npm run test:hush
```

Sealed ⟐
