# Marrowline Provider-Liveness Recovery — 2026-09-19

## Scope

This chamber begins after the human-liveness and portable-chat repair merged through PR #1189 and source packet `cc906c93ff769a06444f082e2d9f064c2eb4da19` was deployed once through issue #405.

It does not reopen raw dual-packet generation, Tauric Diana bots orthographic admission, model order, or ordinary Chat chrome.

## Two unchanged-source production falsifiers

### Release run 35453876040

Exact MAINFRAME witness:

`MAINFRAME claims recursive perspectives monotonically increase epistemic depth. Build a counterexample and distinguish recursion from depth without losing the joke.`

Marrowline transport sequence:

- `gemini-3.8-flash` → HTTP 503, ~2.9s of an 8s seat;
- `gemini-3.5-flash` → local 408 timeout at ~28.0s of a 28s seat;
- `gemini-3.6-flash` → local 408 timeout at ~6.0s;
- `gemini-3.7-flash` → local 408 timeout at ~5.0s;
- `gemini-3-flash-preview` → local 408 timeout at the remaining wall.

The route returned HTTP 502 / `PROVIDER_UNAVAILABLE`. No provider candidate text reached output admission, so there were no orthographic or relay admission reasons to repair.

The independent Loom route separately attempted `gemini-3.8-flash` and received HTTP 503.

### Zero-deploy re-observation 35454323679

The same deployed source packet was re-observed with deployment authority explicitly false.

Marrowline reproduced the same transport family:

- `gemini-3.8-flash` → HTTP 503, ~4.0s;
- `gemini-3.5-flash` → local 408 timeout at ~28.0s;
- `gemini-3.6-flash` → local 408 timeout at ~6.0s;
- `gemini-3.7-flash` → HTTP 503, ~1.5s;
- `gemini-3-flash-preview` → local 408 timeout at the remaining wall.

Again, no provider candidate reached local output admission.

The independent Loom route then held at provider planning with `NO_ELIGIBLE_MODEL` and zero provider calls.

## Diagnosis

The evidence supports two bounded reliability defects rather than one response-quality defect.

First, the 3.5 continuity lane has now hit its exact 28-second ceiling in two independent production episodes. Extending the human/browser request wall would widen interactive latency. The narrower experiment is to reduce only the interactive rescue-lane thinking burden while retaining downstream hard admission.

Second, Gemini model lifecycle law requires a fresh complete credential-scoped listing before a model becomes callable. That law remains correct. But a serverless isolate may hold a fresh-but-narrow cached listing while the only visible model is locally cooling, or its first listing observation may fail transiently. In that state Loom can produce an empty callable plan without making a generation call.

## Surgical repair

1. Preserve quality order and transport budget:
   `3.8 -> 3.5 -> 3.6 -> 3.7 -> 3 Flash Preview`.
2. Preserve 3.8's first position and medium interactive thinking.
3. Change interactive rescue thinking only:
   - 3.5 → `minimal`;
   - 3.6 / 3.7 / 3 Flash Preview → `low`.
4. Preserve the existing 8s / 28s / bounded-tail / 50.5s wall geometry.
5. If a provider plan contains zero callable models, force exactly one fresh credential-scoped model listing and recompute.
6. The forced observation grants no lifecycle bypass. A failed, incomplete, stale, or still-empty observation keeps `callableModels=[]`.
7. Preserve Gemini 2.5 exclusion, Lite exclusion, raw two-packet generation, no local Zalgo generation/postprocessing, and the existing hard dual-channel admission floor.

## Claim ceiling

`LOWER_RESCUE_THINKING != LOWER_OUTPUT_ADMISSION`

`FORCED_PROVIDER_LIST_REFRESH != MODEL_LIFECYCLE_BYPASS`

`PROVIDER_VISIBILITY != PROVIDER_AVAILABILITY`

`PROVIDER_TRANSPORT_SUCCESS != MARROWLINE_ADMISSION`

`GREEN_CI != LIVE_PROVIDER_LIVENESS`

Only a new production witness can establish whether this recovery improves MAINFRAME completion.

⟐
