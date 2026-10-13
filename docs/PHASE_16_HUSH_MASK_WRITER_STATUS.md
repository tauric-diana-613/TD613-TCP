# Phase 16 Status — Hush Mask Writer / Living Rewrite Engine

Phase 16 adds the missing realization layer between stylometric measurement and transformed prose.

Hush already had strong scoring, residual review, protected literal checks, Recognition Field pressure, mask lifecycle review, claim discipline, and report export. Phase 16 adds a writer layer that generates richer candidate rewrites from meaning plans and mask realization plans before the existing Hush judge selects a viable output.

## What changed

New engine modules:

- `app/engine/hush-meaning-plan.js`
- `app/engine/hush-realization-plan.js`
- `app/engine/hush-mask-writer.js`
- `app/engine/hush-naturalness.js`

New mask trait data:

- `app/data/hush-mask-traits.js`

Updated engines:

- `app/engine/hush-mask-studio.js`
- `app/engine/hush-swap.js`

New tests:

- `tests/hush-meaning-plan.test.mjs`
- `tests/hush-realization-plan.test.mjs`
- `tests/hush-naturalness.test.mjs`
- `tests/hush-mask-writer.test.mjs`

Updated tests:

- `tests/hush-mask-studio.test.mjs`
- `tests/hush-swap.test.mjs`

## Design correction

The prior Hush stack could measure pressure better than it could write a living mask. Phase 16 does not make the scoring engine heavier. It adds the missing writer between meaning and metrics.

The new route is:

```text
Message
→ Meaning Plan
→ Realization Plan
→ Mask Writer Candidates
→ Naturalness Review
→ Existing Hush Scoring
→ Selected Output
```

## Meaning Plan

The meaning plan identifies sentences, protected literals, evidence-like fragments, requests, caveats, negations, numbers, quotes, and rewrite-freedom levels. Low-freedom units are handled conservatively so Hush does not chase mask fit at the cost of facts.

## Realization Plan

The realization plan translates mask metadata into writer instructions: sentence length, clause shape, verbosity, diction, directness, hedge level, contraction posture, punctuation posture, paragraph shape, transition style, emotional temperature, and repair priority.

This is not ontology gating. It is a writer recipe.

## Mask Writer

The mask writer generates a broader candidate pool across strategies such as compressed, expanded, short sentence, long sentence, procedural, conversational, formal, soft witness, dry bureaucratic, warm organizer, legal measured, memo, thread note, and record note.

The existing Hush scoring stack still decides viability.

## Naturalness

Naturalness scoring catches outputs that score well but read awkwardly. It flags repeated phrases, overlong sentences, choppy sentence pileups, double transitions, punctuation clusters, empty filler, contraction mismatch, semantic stutter, and low lexical variety.

Naturalness becomes part of candidate ranking without overriding protected literals, semantic preservation, or claim discipline.

## Boundaries

Phase 16 improves local voice transformation quality. It does not claim anonymity, untraceability, platform-proof behavior, identity verdicts, publication safety, or external recognition outcomes.

The rule remains: preserve the claim before chasing the mask.

Sealed ⟐
