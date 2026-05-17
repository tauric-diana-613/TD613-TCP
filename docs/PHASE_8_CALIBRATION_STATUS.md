# Phase 8 Status — Fixtures, Calibration, and Tests

Phase 8 adds local stylometry fixtures, calibration utilities, and regression tests for TD613-TCP.

The purpose is to make Escape Vector, Ingestion Friction, Controller, Persona Memory, Iteration Ledger, Claim Ladder, and Report Export behavior testable across known pressure cases.

Fixtures cover:

- same-author style contact
- different-author separation
- topic-matched false contact
- same-author topic shift
- paraphrase residue
- AI-smoothed flattening
- glyph and normalization stress
- ZWNJ / `Khona‌lit-po` integrity
- Persona continuity
- Persona overfit
- short sample insufficiency
- semantic literal preservation
- Hostile Pipeline Compression
- Belonging Without Collapse
- ingestion friction
- controller conflict

Fixtures do not prove identity. They test whether local measurements move in expected directions.

## New files

- `fixtures/stylometry/README.md`
- `fixtures/stylometry/manifest.json`
- `fixtures/stylometry/cases/*.json`
- `app/engine/calibration.js`
- `app/engine/fixture-runner.js`
- `tests/fixtures-calibration.test.mjs`
- `tests/fixture-runner.test.mjs`
- `tests/stylometry-regression.test.mjs`

## Calibration posture

Calibration is not authority. Calibration is discipline against beautiful-demo hallucination.

Phase 8 tests the system’s refusal behavior as seriously as its scoring behavior. The harness includes cases where the system should hesitate, hold, restore, cap its claim ceiling, or preserve limitations rather than reward a seductive metric surface.

## Fixture philosophy

Fixtures use ranges, not exact expected scores. Ranges keep the suite tolerant of small algorithmic changes while still catching silent scoring drift. The fixture suite tests movement and pressure, not identity truth.

## Privacy posture

Fixture reports exclude protected baseline, message draft, mask reference, and protected output text by default. Reports carry metrics, hashes, limitations, claim ceilings, and summaries, not private text.

## Next phase

Phase 9 — Recognition Field Simulator.

Phase 9 will model platform/context exposure as a local risk surface without claiming access to hidden platform classifiers. It will help operators reason about indexability, topic leakage, entity leakage, Persona continuity, mask overuse, and context-specific legibility while preserving the Claim Ladder’s refusal to issue platform guarantees.

Phase 8 is the stress lab. The system can now be made to sweat under known pressure rather than preen under a beautiful demo.
⟐
