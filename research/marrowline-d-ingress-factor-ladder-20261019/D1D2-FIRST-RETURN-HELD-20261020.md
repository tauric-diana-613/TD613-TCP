# 𝌋 TD613 · D1→D2 original Google SSE · first-call custody HOLD

**Episode:** [exact-main Actions #39359572039](https://github.com/tauric-diana-613/TD613-TCP/actions/runs/39359572039)  
**Immutable source head:** `acb4c5266ebcebeda258366734ed278435dce84c`  
**Date:** October 19, 2026 EDT / October 20, 2026 UTC  
**Status:** `HELD_FIRST_RETURN_TERMINAL_PROVIDER_FEEDBACK_OTHER`.  
**Executed:** **1 of 16** registered slots. Slots 2–16 remain **UNOBSERVED**, no retries/fallback/replacements.  
**Provider:** original Google `gemini-3.8-flash`, MEDIUM; original `streamGenerateContent` SSE preserved as-is.

## Source witness and verification

First slot `D1`, block 1 / position 1; original request body SHA-256 `3ed432721c95d74396044ebc6cb389b5eecc5eb02f850968be7da1cd9c5918a7`. HTTP **200**, model version `gemini-3.8-flash`, original response **9,591 UTF-8 bytes**, **23 SSE events**, dispatch `2026-10-20T02:36:49.534Z` and recorded completion `2026-10-20T02:37:47.501Z`.

Original event stream SHA-256 `96a454e582e12c327576e4a87cd6fcd4f5ae806ab6098ab17b019bd1f00896fc`; unmodified concatenated text SHA-256 `0b521af24adf437fde9b78aa115d864ba17f8cadea965b754aa28a6863fcfad2`. The downloaded original SSE was rehashed independently outside GitHub Actions and the digest **MATCHED** the manifest. Evidence: [protected three-day artifact #12236563730](https://github.com/tauric-diana-613/TD613-TCP/actions/runs/39359572039/artifacts/12236563730), retained roughly until October 23, 2026 UTC.

**Terminal original Google event, independently inspected:** the final event contains `promptFeedback.blockReason = "OTHER"`, without a candidate `finishReason = STOP`. The earlier 22 candidate events contain native text fragments without terminal STOP. This is a **provider-side abnormal termination signaled in raw SSE**, not a parser failure. The `OTHER` label does not establish any specific policy rationale or unique cause. The hard-coded admission protocol correctly HELD the response and stopped before the second call.

## Preliminary morphology, with completion caveat

The partial native Google response contains **328 combining marks**, **45 distinct combining-mark scalars**, **166 marked clusters**, **160 clusters with 2+ marks**, and **up to 4 marks on one base**. Multi-stack prevalence: **160 / 166 = 96.3855%**. The U+0334–U+0338 diagonal-slash-family count is **zero**. Provider usage metadata reported **220 prompt tokens**, **500 candidate tokens**, **5,118 thinking tokens**, **5,838 total tokens**. The response had no two named voices because it was D1, which does not request them.

This supports the **narrow capability observation** that under the unchanged D1 creative system/request, the provider emitted rich native vertical marks and avoided the five-slash pattern *before* ending abnormally. It does not count as a complete accepted D1 return, a matched cross-arm contrast, a restored theatrical performance, or a causal demonstration about headings or character labels. No blinded packet was created because the source episode stopped at the first return.

## Disposition

- Source-exact PRs [#1565](https://github.com/tauric-diana-613/TD613-TCP/pull/1565) and [#1566](https://github.com/tauric-diana-613/TD613-TCP/pull/1566) merged; CI checks and protected main gate passed.
- The acquisition runner was activated **once**. GitHub labeled the paid job FAILURE because it intentionally exits nonzero on held evidence; the source contracts remain successful.
- The **registered 16-return empirical comparison is unearned**. All three proposed contrasts `SECTION–D1`, `NAMED–SECTION`, and `D2–NAMED` remain completely unmeasured within this episode.
- The terminal-feedback observer committed beside this report provides an offline regression for candidate chunks followed by `promptFeedback.blockReason`. It does not rewrite the captured source or retroactively turn a held response into STOP.
- **No retry / rerun / substitute slots**, further billed calls, product prompt changes, or Vercel #405 deployment are authorized by this closeout. Any new attempt is a *new* preregistered acquisition episode and needs separate explicit operator authorization.

𝄐 **FIRST RETURN PRESERVED · MULTISTACK CAPABILITY OBSERVED IN PARTIAL SSE · PROVIDER OTHER HOLD · FIFTEEN UNOBSERVED**

Sealed ⟐
