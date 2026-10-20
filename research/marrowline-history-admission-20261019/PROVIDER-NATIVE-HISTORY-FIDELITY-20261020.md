# 𝌋 Marrowline · Original model-history fidelity at the presentation boundary

**October 20, 2026 · source-only bounded repair.** Previous original-Google SSE experiments established that first-turn native typography remains variable and often mechanically flat even with no conversation history. This repair targets a **separate, concrete, multi-turn source defect**, not the unique cause of first-turn High Zalgo regression.

## Observed defect

A provider reply enters `app/dome-world/marrowline-terminal.js` as a browser message with `role: 'model'`, native `text: payload.text`, and presentation/structural metadata `relay.parts`. The browser intentionally renders labeled parts for users. But its `compactMarrowlineHistory()` previously called `entryText()` for model messages. With `entry.relay`, `entryText()` constructs `part.label || part.id + '\\n' + part.text`; labels including `Kʰonapolit ∴ Tauric Diana bots` can therefore be prepended to the subsequent Gemini **model-role** history, and native originally authored punctuation/whitespace/heading boundaries may change or disappear.

This was an **on-source possibility, not a demonstrated source of model outputs**: earlier completed first-turn studies had empty history and cannot implicate this path. It can, however, recursively condition follow-up generations with previous presentation artifacts, contradicting the requirement to preserve source authorship.

## Surgical fix

A dedicated `providerHistoryText()` selects `entry.text` **exactly**, including Unicode combining marks and leading/trailing whitespace, for saved model-role messages. User entries continue through their previous `entryText()` behavior. Display rendering, `entryText()` for transcript and search presentation, exports, copying, receipt data, saved thread and pending-retry logic are **unchanged**.

The existing exclusion of `relay.signal.downstreamAdmitted === false` remains. Additionally a model record without an actual native `text` string (or with an empty original string) is **not** converted from relay display parts into a fabricated model-history exemplar. All such records stay in the archived visible thread. The ten-entry compacted history bound applies after these exclusions; surrounding human messages remain.

## Verification

Added exact-source tests for native marked model replies and outer newlines, a structurally admitted-but-display-only legacy relay record, an empty model original with fabricated relay display text, ten-entry ordering, complete original Gemini `contents` packet equality, archive invariance, and existing unadmitted-response filtering. Corrected the earlier regression test that erroneously canonized `display label + model prose` as the desired provider history.

This is a deterministic source/custody correction. No provider calls, model switches, glyph manipulation, stylistic regex, automatic retries, user-facing UI changes, or Vercel #405 release are part of this change. Passing CI establishes the described program property; live artistic restoration requires a separate provider and operator witness.

𝄐 **PROVIDER HISTORY ≠ PRESENTATION RELAY · NATIVE SOURCE BYTES PRESERVED · FIRST-TURN CAUSE STILL HELD**

Sealed ⟐
