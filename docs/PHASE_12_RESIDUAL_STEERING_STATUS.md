# Phase 12 Status — Residual-Driven Hush Steering

## Why Phase 12 exists

Phase 12 answers the Aperture v2.2.1 audit finding that Hush was becoming reviewable before it became sufficiently steering-aware.

The failure mode was not that Hush lacked metrics. The failure mode was that Hush could generate a set of candidates, score them, and select the best available candidate even when the entire candidate set remained weak.

Phase 12 adds residual-driven steering so Hush can name the surviving source-pressure dimension, target it, and refuse to treat the prettiest weak candidate as a success.

## What Phase 12 adds

Phase 12 adds five engines:

- `app/engine/hush-residual-vector.js`
- `app/engine/hush-protected-literal-lockbox.js`
- `app/engine/hush-steering-plan.js`
- `app/engine/hush-mask-lifecycle.js`
- `app/engine/hush-export-policy.js`

It also upgrades:

- `app/engine/hush-swap.js`
- `app/engine/hush-mask-studio.js`
- Hush tests
- package test scripts

## Residual Vector

The residual vector compares source, output, and mask profiles dimension by dimension. It surfaces the largest surviving source-residual feature and marks hot critical dimensions.

This changes Hush from post-hoc review into steering pressure.

## Protected Literal Lockbox

The lockbox detects and locks evidence-bearing literal strings such as exhibit markers, dates, filenames, quoted strings, glyphs, and operator-supplied manual literals.

Default exports use hashes and counts instead of raw literal values.

## Steering Plan

The steering plan takes residual vectors and lockbox verification and turns them into ordered rewrite targets.

If protected literals drop, restore-literals outranks style improvement.

## Mask Lifecycle

Mask lifecycle tracks local exposure pressure across fresh, warming, stable, overused, burned, quarantined, and retired states.

This creates a mask-governance layer instead of treating masks as endlessly reusable costumes.

## Export Policy

Export policy adds review, share, legal, and private-full modes.

Default Hush swap exports use share-export: low-detail, no raw text, no literal values, and no full candidate vectors.

## Candidate refusal

Phase 12 adds all-candidates-failed behavior. Hush may return no selected output when the best available candidate remains below viability or triggers vetoes.

Required principle:

> Every candidate failed. Do not pick the prettiest failed candidate.

## Current limits

Phase 12 adds the residual and governance spine, but candidate generation is still partly heuristic. A later phase can expand targeted candidate generation into per-dimension rewrite operators with stronger fixture coverage.

## Next work

Future work should add browser-visible residual panels, richer custom-mask variance, import/export controls for lockboxes, and fixture-driven thresholds for each context and operator mode.
