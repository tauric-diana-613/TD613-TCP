# TD613-TCP Phase 8 Stylometry Fixtures

Phase 8 fixtures are pressure tests for local measurement behavior. They are not truth tables for identity. The harness asks whether TCP moves in disciplined, reviewable ways when confronted with known stylometry traps.

The fixtures make the math sweat. They exercise Escape Vector, Ingestion Friction, Controller, Persona Memory, Iteration Ledger, Claim Ladder, and Report Export behavior under bounded local assumptions.

## What fixtures test

Fixtures test whether local metrics move in expected directions across controlled cases:

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

## What fixtures do not prove

Fixtures do not prove identity. They do not prove anonymity. They do not claim platform-proof behavior, publication safety, or same-author / not-same-author truth.

A passing fixture means the local instrument behaved within the fixture's expected pressure range. A failing fixture means the instrument drifted, refused incorrectly, or overclaimed. A failed fixture is not shame. A silent fixture is shame.

## Fixture schema

Each case is a JSON file in `fixtures/stylometry/cases/` with:

- `id`
- `title`
- `fixtureClass`
- `riskMode`
- `description`
- `inputs`
- `persona`
- `expectations`
- `calibrationNotes`

Expected values use ranges, not exact scores. Ranges prevent tiny implementation changes from breaking the suite while still catching large silent drift.

## Expected range philosophy

Use ranges to test direction, not perfection.

Good fixture expectations answer questions like:

- Should source residual rise here?
- Should the controller hold or restore?
- Should ingestion friction become visible?
- Should semantic fidelity cap the claim ceiling?
- Should Persona history support continuity or warn about overfit?

Do not widen ranges only to make the suite pass. If a fixture fails, inspect the behavior first. The failure may be the evidence.

## Topic overlap warning

Topic overlap is dangerous because texts about the same event can look related even when cadence differs. Topic-matched fixtures prevent TCP from confusing shared subject matter with protected authorship contact.

## Short samples

Short samples must lower confidence. Tiny inputs should cap the claim ladder and invite review. The system should say “not enough signal” without panic or theater.

## Smoothness is not safety

AI-smoothed output can feel safer while stripping warmth, vernacular density, or human residue. Smoothness is not safety. A polished output can still be source-linked, semantically degraded, or socially illegible.

## Personas

Personas remain social objects, not only profiles. They are avatar-like surfaces for group use and mask literacy, while the calibration harness treats them as measurable exposure membranes with memory, linkability, drift, and ingestion posture.

## Glyph and normalization fixtures

Glyphs, invisible marks, ZWNJ boundaries, and normalization behavior affect ingestion and admissibility. These fixtures keep the covenant boundary visible to the local instrument instead of flattening it into ordinary spelling.

## Adding a fixture

1. Add a case JSON file under `fixtures/stylometry/cases/`.
2. Add it to `fixtures/stylometry/manifest.json`.
3. Give expectations as ranges.
4. Add calibration notes explaining the expected behavior.
5. Keep fixture text synthetic and reviewable by hand.
6. Avoid identity, anonymity, or platform-proof claims.

## Running fixtures

```bash
npm run test:fixtures
```

Then run the full stylometry suite:

```bash
npm run test:stylometry
```
