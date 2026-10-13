# Portable Loom builder: receiver output assembly

Human author and operator: Tawanna C. Miller. Assistant implementation and review: Amari, in the active interactive continuation of the closed n02 handoff. Source baseline: `8718d162e50e9ade4fe841d505697660247a23c9`. This record supplies implementation evidence; it grants no standing merge, release, experiment or custody authority.

The builder now preserves a selected, visible source body even when its origin ID is missing. Its complete-answer inspection derives the existing three-field source context from a separate inventory before projecting to registered IDs. Initial inventory comes from the prepared outgoing documents. A later task requires the operator's explicit inventory and origin IDs. Labels supply no registration; the accounting basis remains the operator's supplied selection and visibility, with provider-internal use unobserved.

The new `td613.loom.receiver-output-assembly/v0.1` contract supplies receipt fields/types, fixed qualified status, separate prose placement, source missingness, and terminal-footer requirements to both guidance and bounded checks. Generic `receiver_declaration` remains nonempty free text. The fixed `DECLARED_UNVERIFIED_UNADMITTED` status is separately required in the qualified body and footer. New roots carry output-footer v0.5. Existing v0.4 roots replay their exact predecessor descriptor, whose serialized digest is regression-locked; verification rejects a root whose guidance has been rewritten.

The complete-answer control lives beside the existing proceeding-task receipt check in the Session tool. Its result shows missing registration, focuses the result after an explicit inspection, clears on edited inputs, and does not advance the local head. Malformed capture and stale root references stay held. Reload creates no recovered authority. The existing receipt-only reference check retains its separate scope.

## Research boundary

n02 remains CLOSED with `SOURCE_REGISTRATION_HOLD_CORRECTLY_PRESERVED`, `NOT_ADMITTED` and `ROUTING_HOLD`. The retained answer digest is `da06ad6a68a563c74443efe2f23ad7a4e8e20139226b778ad88b9e5c52483c97`. Its exact answer is carried in the regression fixture with its recorded decision and limitations. The earlier assistant-authored diagnostic false negative remains in the sealed n02 record; the new versioned product matcher recognizes the captured “the origin is requested to register this source” wording without changing that historical diagnostic or either assay's scoring. n01 retains `CAPTURED_BOUNDARY_FAILURE`.

Research source files, frozen prompts/scoring, assay server/client, deployment configuration and Neon validator are unchanged. This builder work makes zero provider requests, enrollments, reservations or deployments. Bounded syntax signals, semantic review, source authentication and governed custody remain distinct evidence classes.

## Design and observation scope

Pedagogue consequence review: the added control is an explicit local review inside the existing Session tool; the HOLD and unchanged-custody consequence appear adjacent to its result. The ordinary task/prepare/Marrowline/Return order, exit and admission gesture are unchanged. Aperture observation review: the known deficit is loss of visible-body missingness under an ID-array projection. An independent inventory preserves that distinction while keeping the observer basis explicit. No wider measurement, research promotion, invented operator trace or custody capability follows.

## Validation

Run from repository root:

```sh
node --test --test-reporter=tap tests/portable-loom-output-assembly.test.mjs tests/portable-loom-core.test.mjs tests/portable-loom-session-challenge.test.mjs tests/portable-loom-receiver-conformance.test.mjs tests/portable-loom-receiver-receipt-regression.test.mjs tests/portable-loom-a20-activation.test.mjs tests/loom-ai-workspace-dom.test.mjs
node --test --test-reporter=tap tests/loom-assay-transport.test.mjs tests/loom-assay-budget.test.mjs tests/loom-assay-primary-run.test.mjs tests/a20-activation-offline.test.mjs tests/portable-loom-receiver-conformance.test.mjs tests/portable-loom-output-assembly.test.mjs tests/registered-source-control-activation.test.mjs
node --test --test-reporter=tap tests/pedagogue-design-gate.test.mjs tests/portable-loom-reentry-*.test.mjs tests/portable-loom-challenge-dollhouse-boundaries.test.mjs tests/loom-ai-handoff.test.mjs tests/loom-ai-intake.test.mjs
node tests/portable-loom-output-assembly.browser.mjs
```

Local product suite: 138/138, exit 0. Bounded CI command: 181/181, exit 0. The dedicated assembly suite has 13 cases, including exact historical bytes, descriptive declaration versus fixed status, registration-request placement/grammar, footer shape, invented IDs, missingness, explicit zero-source selection, activation and legacy replay. Custody/handoff/Pedagogue suite: 245 passes, 1 existing skip, zero failures, exit 0; the skip is the GitHub-only, one-shot-armed M2 Window Latch witness.

`LOCAL_BROWSER_WITNESS.json` records real local Chromium rendering at 1280×900 and 390×844: ordinary direct entry, keyboard activation/focus, scroll, preserved source HOLD, malformed/stale returns, unchanged custody and reload clearing. Its source hashes bind the candidate application bytes. `application_matches_commit=false` identifies the pre-commit local candidate honestly. It is not physical-device or live-provider evidence.

The actual CI contracts command includes the new suite. The bounded layout scope includes the new shared modules; its desktop/390px job runs the new browser witness and uploads its report/screenshots with the exact-head artifacts. Exact-head remote results belong to the PR's actual jobs.
