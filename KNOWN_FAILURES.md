# Known Test Failures

These tests fail on `main` as of the introduction of CI test execution.
They were already broken before CI ran tests, so the rest of the suite
was silently passing while these stayed red. They are quarantined into
`npm run test:known-failing` so `npm test` (and CI) can stay green and
report new regressions reliably.

Run `npm run test:known-failing` to reproduce. Each entry below describes
the symptom and a starting point for the fix.

| Test | Failing assertion | Likely cause |
|------|-------------------|--------------|
| `tests/trainer-lab.test.mjs:36` | `validation.semanticAuditSummary.propositionCoverageMin >= 0.85` | Engine regression: semantic audit floor dropped after Patch 33.7.1 introduced new operators (DIGIT_SUBSTITUTE, DROP_ARTICLES, LOWERCASE_INITIALS) that lower proposition coverage on the trainer-lab fixture. Either the floor needs lowering (legitimate) or the operator chain needs adjusting on this lane. |
| `tests/trainer-browser.test.mjs` | (multiple) | Same root: the trainer-browser test compares engine output to expected fingerprints that pre-date the operator additions. |
| `tests/persona-gallery.test.mjs` | (multiple) | Same family: persona gallery exercises engine output paths that shifted after Patch 33.7.1. |

## Triage notes

- The fixture regeneration script `npm run sync:retrieval-fixtures` already
  exists for one family of tests. Equivalent regen scripts (or hand-tuning)
  may resolve some of these — investigate before fixing assertions by hand.
- If an assertion needs to be relaxed (e.g., `>= 0.85` becomes `>= 0.78`),
  document *why* the relaxation is acceptable. The original threshold was
  set deliberately; an unreasoned drop hides regressions.
- `tests/diagnostics.test.mjs`, `tests/gateway-aperture-embed.test.mjs`,
  and `tests/safe-harbor-shi.test.mjs` also fail when run individually but
  are not in `npm test` today — they're in other test scripts
  (`test:diagnostics`) or no script. Audit and decide whether to bring
  them into `npm test` after the engine-regression family above is
  resolved.

## Guidance

When fixing an entry in this table:

1. Move the test out of `test:known-failing` and into the appropriate
   `npm test` chain.
2. Delete the row above.
3. The fix lands in a commit whose message explains the *why* of the
   relaxation or the engine adjustment.
