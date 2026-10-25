# 𝌋 TD613 · MARROWLINE SYSTEM-LEVEL PROSODY A/B · EMPIRICAL REST
**Date:** October 15, 2026  
**Status:** OBSERVED_LIVE · BOTH_COMPLETE · SAME_PROVIDER_AND_SETTINGS · TARGET_PARAGRAPH_ABLATION_INSUFFICIENT · ROOT_CAUSE_UNPROVEN

## Custody

- **Original API:** `https://td613.com/api/khonapolit` (plain h), credential-scoped native canary, exact synthetic fictional-town prompt, empty history, no attachments.
- **Trusted server source:** PR #1514 merged as `e21af574ad372ef07c9669280545109b5b449954` and released with #405 [workflow 38789113259](https://github.com/tauric-diana-613/TD613-TCP/actions/runs/38789113259), exact-source / application-byte / stale-deploy and relock checks PASS; relock commit `4590e89eb1ac57644aeaad0e1a239228c551f558`.
- **Execution:** PR #1516 first-attempt [run 38793557040](https://github.com/tauric-diana-613/TD613-TCP/actions/runs/38793557040), activation commit `72dfe04115dab97eb84444793ea1f3b49cc730a2`.
- **Original source archive:** [artifact 12001171673](https://github.com/tauric-diana-613/TD613-TCP/actions/runs/38793557040/artifacts/12001171673), one-day retention. It contains **both original Google SSE byte streams**, original TD613 API JSON returns and the intact executable manifest. It contains only a synthetic prompt, not user/private documents. Archive access is governed by GitHub repository artifact permissions.
- **Provider calls:** exactly **two**, both `gemini-3.8-flash`, both HTTP 200 / Gemini `STOP`, one provider attempt each, no retries, fallback or post-generation typography alteration. No dollar-level billing cap is asserted.
- **Source-side intervention:** remove exactly one systemInstruction paragraph starting `- HIGH ZALGO IS THEIR SCREAM-SING WRITING SYSTEM, NOT DECORATION:`. No replacement instructions; the other native-prosody instructions remain untouched. A retained it, B omitted it.

## Complete original-response results

| Surface | A: Full system | B: One paragraph omitted |
|---|---:|---:|
| Returned provider model | `gemini-3.8-flash` | `gemini-3.8-flash` |
| Provider finish | `STOP` | `STOP` |
| Outer API | HTTP 200 | HTTP 200 |
| Provider requests in condition | 1 | 1 |
| Prompt input tokens | 6,732 | 6,634 |
| Candidate-output tokens | 3,309 | 2,324 |
| Thinking tokens | 652 | 521 |
| Total billed token count in receipt | 10,693 | 9,479 |
| Original raw Google SSE bytes | **61,436** | **44,883** |
| Google SSE events / text parts | 129 / 129 | 93 / 93 |
| Bots movement code points | 2,504 | 1,679 |
| Bots combining marks | **1,241** | **829** |
| Distinct combining code points | **5** | **5** |
| Marks outside U+0334–U+0338 | **0** | **0** |
| Clusters with 2+ marks | **0** | **0** |
| Maximum marks on any single base | **1** | **1** |
| Raw event-text ↔ merged TD613 text | Exact parity | Exact parity |

Combining-mark histograms (from independent Python `json` SSE re-parsing and `unicodedata.category`):

- A: U+0334 **243**, U+0335 **238**, U+0336 **263**, U+0337 **249**, U+0338 **248**.
- B: U+0334 **145**, U+0335 **162**, U+0336 **187**, U+0337 **169**, U+0338 **166**.

Original Google raw-SSE SHA-256:

- A: `771d91b5bfc3b27a2d818c8b5fd7d261ad3b67db9d2eea997c0f8f8be7effa5d`.
- B: `c2dc4a6d44f45050a2ea864d6dc736fad37a67e863738f8265eee6abb867383f`.

Original provider-text SHA-256:

- A: `223990f3261bffa2dd5be7a48944bf0af4f5ad60ee2fa4144b3279a39dd2a818`.
- B: `1736dac85a7991571b8f4746917d8815fc65fe270a58d95a8c4f6a2564f90465`.

## Exact comparison

The returned request-observation fields were independently re-checked from the original API JSON:

- `systemInstructionSha256`: A `2e9be934fa9e38babbf2710b56ae68781fbdb4b8f2bafd7d46d84e050ceafc40`; B `4a8f4c6be904d5edeee715fef801f82a04bd65cd894b3e3bc402d587eef020df`.
- `contentsSha256`: **identical** on both, `0c995bcc616325a4662c97ea294ad9e1004cb7879329d82a693c76dcd3a4a36c`.
- `generationConfigSha256`: **identical** on both, `4785e46e91dfc32f5742dc9fc4ce7414142d62335c7a29e56c1e7e89a1d4ab34`.
- Same returned provider model, same empty history, same synthetic message. The special ablation handler is inaccessible to ordinary user messages or uploads.
- All 6 comparability flags passed: sameServedModel, identicalContents, identicalGenerationConfig, distinctSystemParagraph, originalWireParityBoth, completeBoth; `isolatedRequestChange = true`.

## Adjudication

The tested repeated system-level paragraph **is not a necessary cause** of the planar, mechanically one-mark-per-base style in these observed cases: removing it still yielded only U+0334–U+0338 with zero stacks, from the original Gemini upstream SSE. This is a live negative **case study**, not a population-frequency or unique-cause theorem. Prompt sampling remains stochastic, and B was shorter; comparing absolute mark counts alone has no artistic significance.

The result converges with the previous same-model **user-level** vertical-cue A/B: stronger instructions did not recover stacked High Zalgo, and merely deleting one system-level paragraph likewise did not. Both observe the failure upstream of TD613's SSE parser and renderer. Do not impose glyph quotas, synthetic Zalgo postfilters, mandatory style transitions, paid aesthetic model election, or assume reverting the paragraph will fix real Marrowline.

**Remaining diagnostic problem:** Determine how the upstream Gemini process construes the broader structured Marrowline prosody contract, including interactions with the large standing mission and repeated references to combining marks. A meaningful next experiment would independently pre-register a different, single provider-bound instruction frame (under strict same-model/request conditions) before spending more; not simply repeat louder “deep crowns” wording. Any restoration claim requires complete provider returns showing natural literary High Zalgo over multiple representative tasks, judged across the operator's plural atlas of accepted styles.

**Current production:** ordinary Marrowline experience unchanged; the optional synthetic-only assay switch is deployed but requires an impossible-to-trigger-with-normal-chat precise synthetic header and prompt. One-shot job to be removed from the research PR after the run. No additional paid experiment authorized merely by this negative finding.

𝄐 EXACT-SYSTEM ABLATION OBSERVED · ORIGINAL-GOOGLE-SSE PARITY PASS · FIVE-MARK MECHANICAL PHENOTYPE PERSISTS · ART RESTORATION HELD ⟐
