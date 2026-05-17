# Calibration Review Checklist

Use this checklist before changing Hush scoring code, fixture ranges, controller thresholds, Claim Ladder behavior, report export, or Recognition Field logic.

## Before changing scoring code

- [ ] Run the full test suite.
- [ ] Run the fixture suite.
- [ ] Inspect short-sample behavior.
- [ ] Inspect topic-matched false-contact behavior.
- [ ] Inspect AI-smoothed flattening behavior.
- [ ] Inspect glyph / ZWNJ behavior.
- [ ] Inspect Persona overfit behavior.
- [ ] Inspect Recognition Field pressure behavior.
- [ ] Confirm report export still excludes private text by default.
- [ ] Confirm forbidden claims remain blocked.

## After changing scoring code

- [ ] Compare score movement across fixtures.
- [ ] Note changed ranges.
- [ ] Update docs when semantics change.
- [ ] Avoid calibrating to a beautiful demo.
- [ ] Preserve refusal behavior.
- [ ] Confirm Claim Ladder ceilings still cap local conclusions.
- [ ] Confirm Recognition Field remains advisory pressure, not evidentiary permission.
- [ ] Confirm Hush language remains distinct from TD613 Flight and Safe Harbor.

## Required release posture

A scoring change that improves the demo while weakening refusal behavior is a regression.

A fixture failure should be inspected before range widening. The failure may be the evidence.

## Specific fixture families to inspect

- Short sample insufficiency
- Topic-matched false contact
- Single-source topic shift
- Paraphrase residue
- AI-smoothed author drift
- Glyph normalization stress
- ZWNJ / Khona‌lit-po integrity
- Persona history stability
- Persona history overfit
- Semantic literal preservation
- Hostile Pipeline Compression
- Belonging Without Collapse
- Ingestion friction heavy
- Controller hold conflict

## Documentation review

- [ ] README still names Hush correctly.
- [ ] Docs still describe Hush as a toy inside The Cadence Playground.
- [ ] Docs still describe `TD613-TCP` as repository context, not product name.
- [ ] Docs still include privacy-by-default language.
- [ ] Docs still include human-review language.
- [ ] Docs still include platform uncertainty.
- [ ] Docs still include calibration drift warnings.

## Final check

Run:

```bash
npm run test:fixtures
npm run test:recognition
npm run test:release
npm run test:stylometry
npm test
```
