# Phase 17 Status — Hush Release Policy / Admissibility Gate

Phase 17 corrects the over-contained Hush release path surfaced by the post-Phase 16 audit.

The audit showed that Hush could generate natural, semantic, literal-preserving candidates, but then suppressed every output because residual pressure was treated as a hard veto. Phase 17 separates hard release blocks from review warnings.

## What changed

New modules:

- `app/engine/hush-release-policy.js`
- `app/engine/hush-candidate-cleanroom.js`

Updated modules:

- `app/engine/hush-steering-plan.js`
- `app/engine/hush-swap.js`

New tests:

- `tests/hush-release-policy.test.mjs`
- `tests/hush-candidate-cleanroom.test.mjs`

Updated tests:

- `tests/hush-steering-plan.test.mjs`
- `tests/hush-swap.test.mjs`

## Release policy

Phase 17 introduces a release policy object:

```js
{
  hardBlocked: false,
  releaseStatus: "emit | needs-review | blocked",
  hardBlockReasons: [],
  reviewWarnings: [],
  operatorMessage: "",
  mayPopulateOutput: true,
  maySeal: false
}
```

Hard blocks are reserved for failures that should prevent output population:

- empty output;
- semantic fidelity below the mode floor;
- protected literal score below the mode floor;
- protected literal drop;
- catastrophic naturalness failure;
- forbidden positive claim language.

Residual pressure is now a review warning unless another hard block is present. Critical residual pressure means the operator should review the output; it no longer means Hush should hide otherwise viable text.

## Cleanroom

The candidate cleanroom repairs common writer artifacts before scoring:

- duplicate protected literal appends;
- stacked transitions;
- procedural marker leakage outside procedural masks;
- missing negation cues from low-freedom meaning units;
- repeated phrase loops;
- missing caveat cues.

This is output hygiene, not ontology gating.

## Steering plan update

`scoreCandidateWithSteering()` no longer pushes residual pressure into hard vetoes. It still applies a residual pressure score penalty and exposes residual warnings for review.

## Boundary

Phase 17 does not claim anonymity, untraceability, platform-proof behavior, publication safety, or identity outcomes. It only controls local output population and review routing.

The rule becomes:

```text
If meaning holds, protected literals hold, naturalness holds, and claim discipline holds, Hush may show the output with review warnings.
```

Sealed ⟐
