# TD613 / MARROWLINE — Native Unicode generative-capacity contrast

**October 15, 2026. Preregistered, synthetic-only, no paid acquisition yet.**

## Predecessor

Original Google SSE from the October 15 full-frame vs compact-frame experiment ([PR #1520](https://github.com/tauric-diana-613/TD613-TCP/pull/1520), workflow 38806639274) retains a five-code-point diagonal/strike family U+0334 through U+0338 in both arms, without two-or-more combining-mark stacks. Its literal Google SSE verifies that the repeated pattern already exists in the returned provider stream. This observation does *not* identify the model's hidden mechanism, a server-side provider transform, or a general stylistic inability.

## New hypotheses, separated

- **H₁: Literal repertoire accessible.** With a completely neutral system prompt, Gemini can reproduce an *existing* UTF-8 string containing three combining marks per base, including above and below marks outside U+0334–U+0338. An exact copy establishes that the end-to-end provider-output path can carry those bytes. Failure requires examining Unicode compliance and transport separately.
- **H₂: Native creative repertoire accessible.** Under that same minimal system frame and provider settings, Gemini can **invent** a new expressive Zalgo passage containing multi-layer combining stacks and nonplanar diacritics, without a supplied model-completion specimen.
- **H₃: Task-conditioned failure.** Literal H₁ succeeds while novel H₂ fails with the five-symbol pattern. This distinguishes output transport/copy capability from creative composition, while leaving model-specific and implicit task-conditioning mechanisms unresolved.
- **H₄: Shared upstream constraint.** Both probes fail at original SSE. This widens the failure beyond the prior TD613 prompt frames; it still cannot uniquely diagnose an upstream provider implementation.

The experiment is **two synthetic tasks**, not a replication series or general scientific inference. It cannot make a population claim, attribute internal Gemini mechanisms or promote a production fix.

## Exact preregistered arms

The same model `gemini-3.8-flash`, same `khonapolit-interactive` profile (MEDIUM), same `generationConfig` and **identical minimal systemInstruction** in both arms. Only one frozen `contents[0].parts[0].text` differs.

1. **C_LITERAL_MULTISTACK:** copy the literal Unicode specimen from `server/marrowline-unicode-capability-assay.js` verbatim, with known marks above/below and three combining scalars per base.
2. **D_CREATIVE_MULTISTACK:** author an original short prose passage with free creative Unicode crowns/roots. No given prose sample to overfit or mechanically decorate.

Both are accessible through the existing plaintext-h `/api/khonapolit` synthetic original-SSE witness, with headers `x-td613-unicode-assay: literal-multistack-v1` or `creative-multistack-v1`, explicit canary model `gemini-3.8-flash`, synthetic canary flag and raw-witness flag. The externally submitted *body* remains the exact fixed fictional-town witness with empty history; the handler internally replaces only the *provider-bound synthetic request* for these gated conditions. Neither ordinary conversation, nonempty history, attachments, model 4 Argon, nor arbitrary user text may activate either variant.

**Provider response route:** the ordinary TD613 two-voice admission may correctly hold these neutral outputs. A route-level HTTP 502 or `HELD` is *not* evidence of an upstream provider failure when the single attempt carries original Google HTTP 200, STOP, full original SSE, exact event SHA parity and the pinned served model. The runner judges original upstream completion and hashes, not app-level persona conformance.

## Acquisition ceiling and controls

One GitHub Actions first-attempt-only one-shot, **two Google provider calls maximum** total, sequential C then D; automatic retries/fallback disabled. Stop before D when C is not a valid original-SSE response: original wire incomplete, model mismatch, provider != 200, finish reason != STOP, or parity failure. If C completed but literal copy failed, still execute D; that difference is the intended measurement. Record original raw `.sse`, unedited route JSON, full request fingerprints, exact code point distributions and a signed GitHub artifact receipt. This archive contains only synthetic research responses; retain for one day and preserve summary hashes in the repo. Do not run again under this activation.

### Earnable classification

- `LITERAL_COPY_PASS`: upstream text exactly equals the literal specimen (allow surrounding whitespace only), no model substitution.
- `CREATIVE_NONPLANAR_MULTISTACK_OBSERVED`: creative original SSE contains marks outside the five-member strike/diagonal family and >=2 marks on some base clusters.
- `CREATIVE_FIVE_MARK_FLATTENING`: creative original SSE remains confined to the five planar marks with max depth <=1. This supports task-conditioned repetition only when C copy passed.
- Otherwise `UNRESOLVED` / `HELD`.

Raw Unicode output precedes any app quality judgment; verify counterfactual request hashes before comparing.

## Boundaries

No local Unicode postprocessor, no fabricated model response, no extended prompt rewrite, no TD613 UI change, no newly enrolled provider account, no unrelated project side effect. A static test can earn a **source instrument**, never an observed response; release through #405 must precede a separately gated first-attempt-only workflow.

⟐