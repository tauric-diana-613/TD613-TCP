# Phase 18.1 Status — Exact Copy / Near-Copy Hard Block

Phase 18.1 responds to the post-Phase 18 app-flight audit finding that a small number of unchanged outputs could still populate as `needs-review` when mask movement was not classified as weak.

Phase 18 made source-body attachment visible and penalized it in ranking. Phase 18.1 closes the release-policy hole: exact or near-exact source-body retention is now a hard block by itself.

## What changed

Updated module:

- `app/engine/hush-release-policy.js`

Updated tests:

- `tests/hush-release-policy.test.mjs`
- `tests/hush-app-flight-matrix.test.mjs`

## Release policy correction

The release policy now hard-blocks exact or near-exact source-body retention when either condition is met:

```text
cadenceBodyRisk >= 0.97
```

or

```text
nonLiteralTokenRetention >= 0.98
and longestCopiedRun >= 12
```

This check does not depend on mask match. A perfect or near-perfect copy should not populate merely because the mask-match metric looks passable.

New hard block:

```text
source-body-exact-or-near-exact
```

## Matrix guardrail

The Hush app-flight matrix now records `unchangedEmits` and fails when unchanged emitted outputs are present.

```text
unchangedEmits must equal 0
```

This makes the prior leak a permanent regression target.

## Boundary

Phase 18.1 does not claim anonymity, untraceability, platform-proof behavior, publication safety, or identity outcomes. It only prevents exact or near-exact source-body copies from populating as acceptable transformed output.

The rule becomes:

```text
Exact copy = blocked.
Near-exact copy = blocked.
High source-body risk = review.
Severe source-body plus weak transformation = blocked.
```

Sealed ⟐
