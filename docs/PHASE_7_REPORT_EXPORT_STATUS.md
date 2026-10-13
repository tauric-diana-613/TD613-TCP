# Phase 7 Status — Claim Ladder + Report Export

`app/engine/claim-ladder.js` implements the enforceable claim ceiling for local TD613-TCP stylometry reports.

`app/engine/report-export.js` builds disciplined JSON and Markdown reports from Escape Vector metrics, Ingestion Friction, Controller decisions, Persona memory summaries, and Iteration Ledger history.

Reports exclude private text by default. They summarize measured authorship-recognition pressure under bounded local assumptions and refuse identity-verdict or platform-guarantee conclusions.

The Claim Ladder is the ceiling on permitted language, not a confidence trophy.

## What Phase 7 adds

- Eight-level Claim Ladder from `No reliable signal` through `Requires external corroboration`.
- Forbidden-claim detection for overstatements such as anonymity guarantees, platform certainty, and identity verdicts.
- JSON report export with claim ceiling, Escape Vector metrics, semantic preservation, Ingestion Friction, Persona / mask use, Iteration Ledger summary, reproducibility metadata, limitations, and forbidden-conclusion disclaimers.
- Markdown report export for reviewable local reports.
- Adversarial Bench report controls that keep ledger export and report export separate.
- Test coverage for the claim ladder, report exporter, and bench wiring.

## Privacy posture

Report export excludes protected baseline, message draft, mask reference, and protected output text by default. Reports include metrics, hashes, summaries, limitations, and bounded local conclusions, not private text.

## Claim posture

Reports summarize local authorship-recognition pressure under bounded assumptions. They do not prove identity, anonymity, platform outcome, publication safety, same-author status, or not-same-author status.

## Next phase

Phase 8 — Fixtures, Calibration, and Tests.

Phase 8 will add stylometry fixtures for same-author, different-author, topic-matched, paraphrased, AI-smoothed, glyph/normalization stress, and mask-history samples. It will define expected Escape Vector ranges and regression checks so scoring drift becomes visible.

This phase makes the math sweat: no fantasy confidence from short samples, no beautiful-demo dependency, and no silent scoring regressions.
