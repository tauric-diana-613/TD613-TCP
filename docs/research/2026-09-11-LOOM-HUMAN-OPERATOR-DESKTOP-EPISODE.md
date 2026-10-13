# Holonomy Loom — human-operator desktop episode

**Date:** 2026-09-11  
**Surface:** deployed production Holonomy Loom  
**Operator class:** human operator  
**Episode:** one desktop inspection, fictional Demo 1, one explicit live Run  
**Evidence posture:** observed user experience; narrow, non-generalizing

## Observed experience

The operator reported a substantially more coherent entrance and route experience:

1. The Holonomy Loom title and purple/indigo/gold geometry made the page legible as one place rather than a stack of instruments.
2. `Try a live AI demo` supplied an obvious entry point into three numbered fictional projects.
3. Demo 1 populated the task and supporting documents; three documents were selected while the identity ledger remained local.
4. The new Room / Live Route made the governed journey materially more intelligible than the superseded sliding-glyph presentation: selected papers, local/private pocket, rule gate and AI receiver could be read as one route.
5. On Run, the button entered a working state, elapsed-time feedback appeared, Stop remained available and the room moved into the submitted state.

## Observed blocker

The live request did not produce a usable answer. The operator observed a failed Gemini request after approximately 1.4 seconds. The request receipt identified:

- provider HTTP status: `503`;
- provider calls: `1`;
- selected model: `gemini-3.8-flash`;
- outcome: provider transport failure / no usable answer.

The room simultaneously displayed `Unknown source references reported`. That caption was semantically false for the observed episode: a bounded failure receipt returned to the browser, but no AI answer had returned from which a source-use claim could be reported.

## Human UX findings

The operator additionally reported:

- entrance and document controls were substantially clearer;
- the room itself was much more meaningful than the former sliding glyph;
- room labels remained too small;
- several captions repeated overlapping information;
- the long document column pushed Run farther down the desktop page than desirable;
- the resulting experience communicated a governed journey but did **not** yet merit an `effortlessly child-legible` claim.

## Repair obligations derived from this episode

1. Preserve the non-equivalence:

```text
SERVER_FAILURE_RECEIPT_OBSERVED != AI_ANSWER_OBSERVED
```

A provider-plan/transport failure must never manufacture source-reference or model-missingness copy.

2. A transient HTTP failure on the first already-eligible model may use one bounded failover to the next already-eligible model under the same total deadline. The failover ceiling is two provider calls total. Output-admission failures are not retryable by model shopping.

3. Preserve finite provider-attempt receipts as model/status pairs without provider body, credential, header or exception text.

4. Increase Room label/caption legibility and reduce the desktop distance to the Run action without changing custody semantics.

## Claim ceiling

```text
ONE_HUMAN_DESKTOP_EPISODE != GENERAL_USABILITY_PROOF
ONE_FAILED_LIVE_RUN != SUCCESSFUL_RESPONSE_TRIAL
DESKTOP_INSPECTION != MOBILE_VALIDATION
CLEARER_ROUTE != CHILD_LEGIBILITY_ESTABLISHED
FAILOVER_IMPLEMENTATION != PROVIDER_AVAILABILITY_PROOF
```

This episode is admissible evidence that the deployed route became more coherent to one human operator and that a real production failure exposed concrete UI and availability-path defects. It grants no mobile, successful-answer, child-study, general-usability, provider-availability or quality-ranking conclusion.

Marked ⟐
