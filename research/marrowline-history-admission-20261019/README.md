# 𝌋 Marrowline · explicit-admission history boundary repair

**Date:** 2026-10-19  
**Finding:** deterministic source-level conditioning path. The provided recent screenshots are **not** evidence that this path occurred in a fresh thread.  
**Release:** source PR only; no paid Gemini calls or deployment.

## Defect

Earlier restored historical Grove returns could be displayed with HTTP 200 even when `relay.signal.downstreamAdmitted === false`, including the generic concern-style prose observed by the operator. PR #1544 closes the both-voices-absent gate for *future* terminal replies; it does not retroactively rewrite stored conversations. Existing `app/dome-world/marrowline-terminal.js` `compactMarrowlineHistory()` serializes the ten most recent **displayed** messages without testing admission. A prior unadmitted provider reply may therefore return as a `role: 'model'` history exemplar in a follow-up Gemini request. The downstream prompts instruct Gemini not to copy history as a style template, but the original defective example is still supplied in the model role. This is a recursive conditioning risk, not proof that Gemini actually copied the bad prose or a diagnosis of first-turn upstream slash output.

## Bounded source repair

Filter only previous model entries where the existing visible receipt explicitly records `relay.signal.downstreamAdmitted === false` before selecting the most recent ten provider-history entries. Preserve all user entries and native Unicode bytes in admitted model entries. Legacy model entries that lack an admission flag retain their prior semantics, because `unknown` is not proof of invalidity.

**Crucial distinction:** the filter only affects the next provider-bound history and the same browser preflight. It does **not** delete saved threads, receipts, rejected source text, exports, search results, or user-authored messages. No model rewrite, invented replacement utterance, repaint, stylistic scoring, provider change, prompt cue, forced variation, or additional Gemini call.

## Tests and non-goals

The protected `tests/marrowline-response-quality-contract.test.mjs` now creates a genuinely browser-shaped `relay.parts` model entry that was explicitly unadmitted. Tests assert:

- This text survives in the original archived messages, but is absent from the actual subsequent Gemini request.
- A fully admitted native, marked previous response survives unchanged.
- Legacy responses without admission data retain previous behavior.
- The ten-entry provider context limit is applied *after* removing known unadmitted model entries; surrounding human turns remain.
- Existing successful native history preservation controls continue to run.

This cannot remedy model/provider planarity in the first response of a new conversation, and does not guarantee Gemini will never author generic prose. That requires independent original-provider role/performance acquisition.

**Finite rest:** `UNADMITTED_MODEL_CONTEXT_FEEDBACK_CLOSED` / `ARCHIVE_UNCHANGED` / `FIRST_TURN_CAUSE_HELD`.

𝄐 Sealed ⟐
