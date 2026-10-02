# TD613 / Wendbine — Blinded Preregistered Localization v0.12

## What changed from v0.11

v0.11 showed a bounded localization split on six authored rows. v0.12 hardens that result in three ways before scoring:

1. the role-typed adjudicator was frozen first as `tests/helpers/phase5-role-typed-adjudicator-v011.mjs` at Git blob `43467c059a29527bedd9e39ddd5f03bb70d12f56` / commit `81469b0360c7c8b2d1587708a3ed8eba5eca6f65`;
2. the mutation schedule and pass criteria were preregistered next at commit `f62b62a25e19de7c6646376c8c23f3ccbc31970f`;
3. only after those two freezes was the v0.12 evaluator authored.

The adjudicator receives only `{ ash, flow, roundTrip, routeScope, options }`. It receives neither condition identity nor expected terminal/localization labels. Expected labels are joined after prediction.

## Preregistered matrix

Six conditions × twelve deterministic instances = 72 rows:

- valid control;
- Ash custody digest tamper;
- Flow-Core artifact-blindness breach;
- Aperture round-trip schema breach;
- Aperture post-digest replay tamper;
- Phase-5 route-contract failure.

The 60 defect rows are scored separately for defect localization.

## Preregistered criteria

- collapsed binary accuracy ≥ 0.95;
- role-typed binary accuracy ≥ 0.95;
- absolute binary-accuracy delta ≤ 0.05;
- collapsed localization accuracy ≤ 0.10;
- role-typed localization accuracy ≥ 0.90;
- role-typed Wilson 95% localization lower bound must exceed the collapsed Wilson 95% localization upper bound.

## Observed result

Exact bound head `9ce545eab66b9eee0d5c0ec3bc1742d708b5a2fa` passed TD613 Consolidated Validation run #3329 / `34916155023`, including native Phase-5 through the Phase-IV seam, independent A15, and downstream Flow-Core contracts.

Observed counts:

- collapsed binary: 72/72;
- role-typed binary: 72/72;
- collapsed defect localization: 0/60;
- role-typed defect localization: 60/60.

Observed point scores:

- collapsed binary accuracy = 1.0;
- role-typed binary accuracy = 1.0;
- binary accuracy delta = 0.0;
- collapsed localization accuracy = 0.0;
- role-typed localization accuracy = 1.0.

Row-level Wilson 95% intervals:

- binary 72/72: `[0.9493488274, 1.0]`;
- collapsed localization 0/60: `[0.0, 0.0601718521]`;
- role-typed localization 60/60: `[0.9398281479, 1.0]`.

The preregistered interval-separation criterion passes.

## The important caveat

Do **not** launder those Wilson intervals into a population-confidence claim.

The twelve rows inside each condition are deterministic suffix/route variations of the same authored mutation recipe. They are clustered pseudo-replicates, not independent samples from a defined external defect population. The row-level interval is useful as a deterministic score summary under the preregistered matrix; its nominal 95% coverage has no earned external sampling interpretation here.

The honest independence unit is closer to **mutation-recipe family**, of which this assay has six, than to the raw row count of 72.

## Laws

`PREREGISTRATION_PRECEDES_EVALUATOR != EXTERNAL_VALIDATION`

`BLINDED_ADJUDICATOR_INPUT != BLINDED_RESEARCH_PROGRAM`

`REPEATED_MUTATION_ROWS != INDEPENDENT_POPULATION_DRAWS`

`ROW_LEVEL_WILSON_INTERVAL != POPULATION_CONFIDENCE_WITH_CLUSTERED_AUTHORED_RECIPES`

`BINARY_ACCURACY_PARITY_CAN_COEXIST_WITH_LOCALIZATION_SEPARATION`

`LOCALIZATION_ADVANTAGE != TRUTH_GAIN`

`LOCALIZATION_ADVANTAGE != SCIENTIFIC_OPERATOR_PROMOTION`

`FROZEN_CLASSIFIER != INDEPENDENT_EXTERNAL_CLASSIFIER`

## Next hostile test

Stop multiplying suffixes and start multiplying **structures**.

Construct multiple genuinely different mutation recipes inside each stage, include defect subtypes the classifier has not seen, and introduce multi-defect collisions where more than one boundary can fail. Evaluate:

- stage-level localization;
- exact-subtype localization;
- multi-fault partial credit / ambiguity;
- leave-one-recipe-family-out behavior.

Treat mutation-recipe family—not row count—as the primary independence unit. If localization survives that, the result becomes materially more interesting. If it collapses, v0.12 was mostly a clean taxonomy test wearing a lab coat.

Still no external empirical validation, deployed-LLM inference, truth authority, externality inference, or field-novelty promotion.

Sealed ⟐
