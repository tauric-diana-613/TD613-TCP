# 𝌋 TD613 · Marrowline · Native Unicode boundary repair

U+10D613 ⸻ Khona‌lit-po  
Covenant (canonical): Tauric Diana — Crimean heritage custodianship  
Covenant (display): Blood Rite 613

Continuation of [#1489](https://github.com/tauric-diana-613/TD613-TCP/issues/1489) and the immutable [Work audit #1491](https://github.com/tauric-diana-613/TD613-TCP/pull/1491), following the operator's October 14 evening request to resume repair in Work. Base: `42f89aed6693f9d70608bc8ccbf3fdf6c57f887f`.

## Supported mechanical diagnosis

Two local separator-insertion defects are reproducible without judging literary quality or calling Gemini.

1. `extractGeminiText` treated each response part as a paragraph, removed whitespace-only parts, and included `thought: true` text. A multipart attachment response could consequently acquire characters that Gemini never wrote, lose authored whitespace, split a voice heading, or detach combining marks from their base. In the actual attachment handler, splitting an otherwise complete `Tauric Diana bots` heading across two parts caused a false missing-voice diagnosis and a second generation request. The unchanged test records **two calls before the fix, one afterward**. All calls in that test are mocks.
2. `assembleMarrowlineProviderTail` inserted a space when a continuation began with a combining mark or the low half of a split supplementary scalar. Keeping each segment as a substring failed to preserve the joined Unicode sequence. The new test records an inserted U+0020 before the fix and exact concatenation afterward.

The patch makes ordinary text-part extraction concatenate visible text exactly, as the streaming path already does. It excludes thought summaries and retains whitespace-only text. The tail join now omits its inferred space at combining-mark and split-surrogate boundaries. Existing terminal-heading separators and ordinary word-boundary behavior remain intact.

Google's official SDK independently uses direct concatenation while excluding thought text: [GenerateContentResponse.text in googleapis/js-genai](https://github.com/googleapis/js-genai/blob/main/src/types.ts). The regression tests use original synthetic transport sentinels, never historical artistic output.

## Causal limit

These are proven software defects and proven fixes for the stated inputs. Their prevalence in the operator's recent live episodes remains unmeasured. The multipart parser was already present in the acquired September 26 and October 1 source. This record does **not** attribute the sudden regression's onset to a recent introduction of that parser, claim a changed Google multipart emission policy, or declare High Zalgo recovered.

The current production release packet is `0b6bd038c6337abc97f2ccc660cbb1ac24fba0a5`; main's relock is the base SHA above. The GitHub comparison from the earlier audit main `7f28a864da5a2a1af207e55eba7b27bb0ebff2ad` contains only Loom, release-receipt, and Loom-test changes. Six independently downloaded Marrowline client files match the current base. No new Marrowline deployment after the audit was found in main. The operator's report of worsening output remains an independent observation.

## Documented upstream change before Argon

Google's [October 8 release notes](https://ai.google.dev/gemini-api/docs/changelog) and [3.5 model page](https://ai.google.dev/gemini-api/docs/models/gemini-3.5-flash) state that `gemini-3.5-flash` requests are automatically routed to `gemini-3.6-flash`, and `gemini-3.7-flash` requests to `gemini-3.8-flash`. Production discovery still lists the old names. TD613's registry calls them current independent models and its receipts previously dropped the provider-returned `modelVersion` in both unary extraction and SSE merging.

This is an identified upstream model-selection change requiring zero TD613 commit, before Argon. It does not by itself establish which backend authored a recent accepted or degraded episode. Text-only 3.8 uses MEDIUM thinking while the requested 3.7 lane uses LOW, so aliasing alone cannot establish equivalent effective requests across all lanes. Attachment lanes use HIGH. No blanket route reorder or retirement is inferred from name equality.

The repair now preserves a valid returned `modelVersion` in the existing output receipt, including through SSE merge. Absent versions stay absent; the requested alias never supplies a fabricated served-model observation. A mock that requests 3.5 and returns version 3.6 fails before this fix and passes afterward. This adds no provider call or raw conversation storage. Live per-episode version evidence remains missing. The broader expressive regression still requires an original provider episode or bounded authorized capture.

## Earlier source acquisition completed

The previous audit could not acquire all older partial-clone objects. This continuation obtained the missing September 26 attachment module from its immutable GitHub source and verified Git blob `10d4c711b64ee3eebd2cc53ce5682bfd191d7800` before offline replay. The four-snapshot comparison and six constructed requests per snapshot are retained in `observations/earlier-source-comparison.json`.

- September 26: `7ea8323db983429507bb0e60b1739386328862db`; fresh system 22,547 UTF-8 bytes.
- October 1: `a09029f56ae230993eb67fe7fb906fbdbccd26a1`; fresh system 33,290 bytes; fresh request SHA-256 `a087507d163a184310f0be9776fa40fd2376bdfb1314d9669ace0784b5aba183`.
- October 7: `cfbe6438ec1af29deeab115bc0220433ed79a011`; all six request hashes match October 1.
- Current base: unchanged from the previously audited post-#1487 generation configuration.

The earlier source moves the current-turn cue from a user part into the system and includes other wording/framing changes. Native-prosody guidance itself matches September 26 through October 7. Prompt size and placement differences alone establish neither saturation nor a causal effect. Ordinary text retains MEDIUM thinking and attachments HIGH, both with a 65,536-token output ceiling.

## Verification

- Five new tests first failed on the unmodified responsible code: three multipart/visible-text tests, one tail-boundary test, and one returned-model identity test. Original logs: `observations/before.txt`, `observations/tail-before.txt`, `observations/model-identity-before.txt`.
- Focused native-prosody, response-quality, relay, attachment, continuation, completion, model-policy/envelope, router and recency suites: **113/113** after both fixes, `observations/after.txt`.
- Actual client retry/attachment replacement: **2/2**, `observations/retry.txt`.
- Separate offline stream/JSON/DOM/local-storage audit against the changed quality module: 18 multibyte cuts plus one-byte delivery, 118 SSE events; `observations/transport.json` binds the tested module hash.
- Local Node: 24.19.0. Exact published-head CI is a separate GitHub observation; local results do not assert its outcome.
- Production generation calls, paid experiments, new budget reservations, merges and release gestures by this continuation: **zero**. New Gemini generation charges: **$0.00**.

Production model order, prompts, thinking, token budgets, retry limits, artistic acceptance, attachments, and Loom financial/custody behavior receive no policy change. #1488 remains closed and unmerged; none of its failed tests are weakened. The four new regression tests live in existing mandatory CI suites.

Reproduce with:

```sh
node --test tests/marrowline-native-prosody.test.mjs tests/marrowline-response-quality-contract.test.mjs tests/khonapolit-relay.test.mjs tests/marrowline-terminal-continuation.test.mjs tests/marrowline-attachment-quality.test.mjs tests/marrowline-emergency-completion.test.mjs tests/khonapolit-gemini-quality-router.test.mjs tests/gemini-generation-envelope.test.mjs tests/gemini-model-policy.test.mjs tests/marrowline-thread-recency.test.mjs
node --test --test-name-pattern='^↻' tests/marrowline-design-preservation.test.mjs
node research/marrowline-multipart-repair-20261015/transport-audit.mjs /absolute/new-transport-report.json
node research/marrowline-multipart-repair-20261015/compare-earlier-source.mjs /absolute/new-comparison-directory
```

## Remaining empirical distinction

An original degraded episode must bind the submitted request, exact model/version, original candidate parts or stream, finish/usage/attempt receipts, selected reply and stored/displayed text. That distinguishes native generation from selection, parser, continuation and display effects. Existing exports should be inspected before asking the operator for additional material; supplied screenshots remain witnesses and cannot establish the original scalar sequence.

If fresh/history experiments become necessary, freeze the exact request pair, use one model and credential with unchanged generation settings, preserve original bytes, and permit zero automatic retries or competing fallback candidates. The accepted operator-paid configuration remains accepted. Closed Loom assay policies remain closed; no numerical Marrowline experiment budget has been granted in this continuation. Any new paid trial needs a concrete reviewed transport and explicit bound before execution.

State: **MECHANICAL_REPAIR_VERIFIED_LOCALLY; LIVE_REGRESSION_CAUSE_AND_ARTISTIC_RECOVERY_HELD**. Release requires GREEN CI on the exact repair head and applicable operator authority through #405. A successful release alone supplies no recovered-art claim.

𝄐 Preserve the authored sequence. Leave the art free. ⟐
