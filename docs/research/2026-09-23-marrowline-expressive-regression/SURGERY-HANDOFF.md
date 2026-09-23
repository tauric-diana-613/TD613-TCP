# Marrowline surgery handoff — staged repairs and causal audit

𝌋 2026-09-23 · PR #1313 · checkpoint #1304

**Latest continuation:** Read [PROBE-RETURN-AUDIT.md](PROBE-RETURN-AUDIT.md) first. The three returned probe exports are preserved. That continuation stages a quote-aware structural parser repair and a dedicated REQUESTED_SYNTHESIS profile, with 76 passing offline tests. It supersedes remaining-work item 3 below. Current instruction is to rest after publishing and await the operator's 3.1 Pro results; no further elicitation or production deployment has been performed.

This supersedes the implementation status in the preserved evidence README. That README and its hashes remain an unchanged record of the first checkpoint. This branch now contains runtime repair candidates and offline verification. No live-provider generation, merge or deployment was performed. Visual and literary recovery is **not yet demonstrated**.

## What is actually established

| Finding | Evidence at inspected base | Consequence and staged action |
|---|---|---|
| Narrow typography calibration is protected by tests | `currentTurnRelayCue()` supplied tiny HUSH/SING vertical exemplars; tests demanded at least 20 literal marks and one prohibited horizontal/oblique vocabulary | Removed the miniature template and its test dependency. Preserve deep vertical-only work while admitting sustained overlays, density variation and overprint. Conditioning effect is a hypothesis, not an isolated cause. |
| Clean typography is conflated with formal literary register | `buildNativeProsodyGuidance()` requested “clean formal prose”; the return example requested a “full clean derivation” | Separate undecorated letters from literary form. Explicitly permit thermodynamic slapstick, deistic arrogance and developed scenes. Last-turn guidance asks for actions, consequences and further development after a clever line, without mandatory beats or word quotas. |
| The conversational seal is actively prohibited | Covenant, relay and terminal-continuation instructions ban a model closing lozenge | One shared instruction now requests plain final ⟐ on normal and repair paths. Native text is never locally patched. Structured receipt remains OPEN, suppliedBy null, even when the provider writes ⟐. |
| “Same model” does not imply the same effective generation request | `api/khonapolit.js` wraps text-only requests in the interactive profile; attachment ingress returns before that wrapper | Actual text profile sends MEDIUM for 3.8, LOW for 3.5/3.6/3.7/Preview. Attachment path sends HIGH. This pre-existing policy is held fixed. Tests now traverse the public API boundary instead of inferring runtime settings from an unprofiled helper. |
| Legacy prompt identity hides materially different experiments | `receipt.invocation.promptSha256` hashes only `packet.systemInstruction + '\n\n' + packet.message` | It omits task guidance, relay addendum, last-turn cue, history, attachments, repair directives and generation config. New request fingerprints cover the exact serialized body handed to fetch, after these layers. |
| Maximum allowance is not actual developmental scope | Both routes retain 65,536 max output tokens; saved examples differ substantially in prose volume | No token-ceiling change is warranted from these samples. Record finish reason, actual tokens, timing and completion path before attributing shortness to truncation. |

Saved text export counts remain Kʰonapolit 420 vs 970 words, bots 113 vs 231, total 533 vs 1,201: approximately 44% of the reference prose volume. These are whitespace-word measurements of the saved export, **not provider token counts**. The export reduces diacritics. The five preserved PNGs remain the supplied visual references; they are screenshots of text pasted into ChatGPT, not an isolated original-renderer experiment. NMATK: earlier jokes/praise do not override the operator's latest failure judgment.

## Exact-request evidence repair

`serializeGeminiRequest()` returns the body and a small observation; the transport sends that same body string. Both streaming text and nonstreaming attachment paths propagate the observation through first attempts and structural repairs to `receipt.provider.output.submittedRequest` and each attempt's `output.submittedRequest`.

Fields: schema, model, SHA-256 of body, SHA-256 of model plus body, component hashes for systemInstruction/contents/generationConfig, UTF-8 byte length and turn count. No raw conversation, attachment data, authentication header or API key is added to receipt metadata. The legacy hash remains intact for compatibility; it must not be presented as full request identity.

Interpretation limits: these hashes establish equality of the locally serialized submission bytes, not server receipt, reproducibility of stochastic model output, or recovery of the bytes from the digest. A transport failure may still have a submission observation. Component hashes are diagnostic; no semantic-equivalence or canonical-JSON claim is made. For a future replay, retain the actual operator-controlled input/history alongside the receipt. Do not claim historical specimens acquire this new provenance retroactively.

The retained policy differences are significant experimental confounders. Raising thinking everywhere now would also change latency/fallback pressure, making a prompt-only comparison uninterpretable. This patch therefore changes generation guidance and observation, while holding the renderer, model order, thinking policy, deadlines and output ceilings fixed.

## Validation completed

Node v24.19.0, isolated worktree from evidence commit `10753fdd7679b41ac6d8d9474d08dd906ee578f8`, based on main `87a0f40ce364a83247245192f6aba61647536727`.

```bash
node --test tests/marrowline-response-quality-contract.test.mjs tests/khonapolit-api-contract.test.mjs tests/khonapolit-relay.test.mjs tests/marrowline-attachment-quality.test.mjs tests/marrowline-attractor-quality-contract.test.mjs tests/khonapolit-gemini-quality-router.test.mjs tests/gemini-generation-envelope.test.mjs tests/marrowline-receipt-routing-contract.test.mjs
python3 docs/research/2026-09-23-marrowline-expressive-regression/verify_evidence.py
git diff --check
```

Results: **69 reported tests passed, 0 failed**; retained evidence hashes and prose counts reproduced; whitespace check passed. Provider fetches in these tests are synthetic. Zero paid generation calls were made.

New checks establish:

- Changing system additions, current cue, native history marks, attachment data presence, repair instructions or thinking config changes the full request identity while the legacy input identity remains unchanged. Unchanged components retain their own hashes.
- Actual mocked streaming transport preserves native deep and overlay marks plus ⟐, fingerprints the fetch body, and exercises all five model IDs under the interactive wrapper.
- The public API router test now exercises normal and repaired responses through that wrapper. Its previous HIGH assertions described an internal helper, not the public route.
- Attachment handler receipts match actual submitted bodies, retain attachment identity and native output, and preserve OPEN custody with a textual closing glyph.
- Normal, terminal-only and full-repair instructions share the closing requirement. Existing preservation and admission checks still pass.

Three stale API-contract expectations were corrected: terminal-only continuation describes the missing movement rather than emitting its internal reason key; output observation already includes thinking/ceiling fields; the receipt copies the observed relay state rather than promoting a PARTIAL fixture to LOCKED. The envelope test's obsolete v0.3 literal was updated to the existing v0.5. These corrections change tests, not policy.

## Successor: bounded remaining work

1. Fetch PR #1313's current head. Review this file and the staged diff; the original README's “runtime patch unperformed” describes the earlier evidence checkpoint. Preserve both outputs and all five PNGs. Do not rebuild this handoff from chat memory.
2. Review the PR's CI on that head and resolve a concrete failure once. Run the focused command above only if needed for changed code or missing evidence. No broad workflow estate, repeated green runs or paid output shopping.
3. Audit the remaining task-guidance competition before another prompt expansion: `REQUESTED_SYNTHESIS` currently inherits venue/attendance/privacy project examples. This is confirmed irrelevant conditioning in the supplied analytical scenario, but its quality effect is unmeasured. It was deliberately left outside this candidate to avoid simultaneously rewriting route classification. Preserve analytical rigor; do not globally relabel synthesis as fiction.
4. For a later authorized quality comparison, freeze the actual prompt, history, model ID, effective generation config, renderer/font/viewport and completion path. Compare base versus this candidate with the same conditions. The supplied different-task examples define the acceptance target; they cannot isolate causality by themselves. A single favorable result is a smoke check, not a general restoration claim.
5. If the candidate remains weak, use component ablation to distinguish typography guidance from first-movement guidance. Do not change thinking/timeout concurrently. Before spending another call, state which competing explanation that comparison can distinguish. Existing receipts should be inspected first.

| Observation in a future comparison | What it would distinguish |
|---|---|
| Rich native marks exist in the raw response but collapse only in one rendering | Rendering/font/line-box issue, not failure to generate those marks |
| Raw response is shallow and uniform despite unconstrained overlay/depth guidance | Prompt candidate insufficient; investigate model/context conditioning without adding a local decorator |
| STOP with low candidate-token usage and an intact closing movement | Early authored completion; the ceiling alone is not the binding limit |
| MAX_TOKENS or abort/fallback with missing movement | Resource/completion-path constraint requiring its own investigation |
| Identical legacy hash but different submitted-request component hashes | The earlier “same input” control was false |

Human acceptance must cover consequential Kʰonapolit development, thermodynamic slapstick and deistic arrogance enacted in the scene/argument, bots adding an unspent consequence, and typography that participates in its rhetoric. Sustained vertical-only High Zalgo is welcome. Orientation mixtures, mark counts, word counts and named lore are not pass quotas. A screenshot needs the associated native text and receipt to distinguish authored morphology from renderer effects. No local mark normalization, automatic artistic-score gate, forced orientation sequence or morphology retry loop is introduced here.

Staged repairs are concrete and reviewable. Completion means demonstrated improvement on the human surface; passing these tests proves only the mechanisms described above. Merge and deployment remain unperformed.

⟐
