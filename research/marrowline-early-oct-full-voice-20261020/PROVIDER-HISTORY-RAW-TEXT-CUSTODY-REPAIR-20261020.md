# 𝌋 TD613 · Marrowline · Provider-History Raw-Text Custody Boundary

**Date:** 2026-10-20. **Finding:** demonstrable model-history reserialization defect in live browser source. **Scope:** browser-only provider-bound history serialization; no change to native generation, creativity instruction or provider policy. **Status:** source repair candidate; artistic causal effect and external runtime outcome HELD.

## How this defect escaped the October assays

All D1/D2 Unicode capability and subsequent full-voice real-request original Google SSE assays in the October 20 finite sequence used **empty history**. They tested model first-turn output, not the full longitudinal conversational attractor. The app's ordinary source path is different: browser `compactMarrowlineHistory()` selects the last ten eligible transcript entries, then server `buildInvocationPacket()` normalizes and `geminiContents()` transmits those previous `role:'model'` entries to Google. The client therefore controls which prior native speech is presented as model history.

Before the repair, `compactMarrowlineHistory()` called `entryText(entry)` even for model history. When a model message has an admitted `relay`, that presentation/export function creates:

`(part.label || part.id) + "\n" + part.text`

The normal integrated relay part has label **`Kʰonapolit ∴ Tauric Diana bots`** and `part.text` equal to the already separately saved complete provider-authored text, which itself normally starts with `Kʰonapolit` and includes the `Tauric Diana bots` heading. Thus the previous model speech was fed back to the next provider turn preceded by an **extra display label that Gemini never authored**. The original `state.messages[].text` was independently retained, so this was an **egress-to-next-ingress mutation**, not proof that the original source had been lost.

Example with synthetic content (illustrative; NOT a captured live conversation):

```
Provider actually authored: "Kʰonapolit\nArgument.\nTauric Diana bots\nG\u0334\u0315\u032c"
Previous next-turn model history: "Kʰonapolit ∴ Tauric Diana bots\nKʰonapolit\nArgument.\nTauric Diana bots\nG\u0334\u0315\u032c"
Correct next-turn model history: "Kʰonapolit\nArgument.\nTauric Diana bots\nG\u0334\u0315\u032c"
```

Repeated artificial stage labels are a **candidate feedback-conditioning signal**, not proven to cause the October first-turn planar/single-mark outputs. No existing assay with history was controlled for that effect, and the observed first-turn morphology collapse remains independently unexplained.

## The bounded source repair

A separate `providerAuthoredHistoryText()` is used **only for provider-bound history**. If `entry.text` is a nonempty native provider string, it passes through exactly, including outer whitespace and all Unicode combining marks. If that field is absent in an older local entry, a retained `relay.transcript` or original `khonapolit` integrated part's `text` can provide the native text **without inventing a display label**. User messages keep their existing `entryText` path. The `entryText()` presenter and transcript exporter remain unchanged.

The October 19 history-admission repair remains active: reject only model messages explicitly carrying `relay.signal.downstreamAdmitted === false` from future provider conditioning; leave the saved local archive and old explicit-unknown messages in place; apply the ten-message context limit *after* that exclusion.

## Regression tests and boundaries

The existing mandatory `tests/marrowline-response-quality-contract.test.mjs` now requires the next Gemini model-history text to be **exactly** the archived native provider content. New cases cover mismatched presentation text, UTF-8 digest equality for multi-mark original Unicode, retention of leading/trailing whitespace, legacy transcript and integrated-part fallback, and exclusion of a known unadmitted reply. A previous assertion that a presentation label must be prefixed on the *provider wire* is deliberately corrected; this was the mistaken historical contract.

No local diacritic transformation, structural retry, altered user-history framing, new model selection, provider call or workflow deployment is introduced. The source tests prove exact transformations in JavaScript, not that a real model will produce more varied Zalgo as a consequence.

## Remaining scientific questions

- Does an actual multi-turn Screaming Grove conversation recover/maintain artistic differentiation when **original model-history text** rather than presentation-wrapped text conditions the next turn? This requires an original provider observation with real continuity; the old zero-history experiments cannot answer it.
- Does context eviction under the ten-entry history window correlate with artistic changes? That is a separate bounded acquisition, and the current policy deliberately limits history for performance/privacy.
- Can any historical reference be used as a matched genuine Marrowline conversation witness? The September native-text exports and accepted screenshots have **different** evidence classes, and cannot be silently promoted into historical model-history receipts.

𝄐 **DETERMINISTIC LABEL-INJECTION BOUNDARY IDENTIFIED · RAW MODEL-HISTORY TEXT RESTORED IN SOURCE · FIRST-TURN TYPOGRAPHY CAUSE STILL HELD**

Sealed ⟐
