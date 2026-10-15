# Marrowline finite descent — two-call native provider comparison

This is a **draft research instrument**, not a production patch, deployed feature, or proven stylistic recovery. It is inert until an operator explicitly supplies the execute and paid-acknowledgement flags, Gemini credentials and a private output directory. No CI integration, automatic workflow, retry, aesthetic replacement, generated Unicode or secret storage is introduced.

## Earned evidence boundary

The retained October 4 production assay at `docs/receipts/1428-closure-assay/closure-assay-report.json` contains a selected Gemini 3.8 Flash return with **616** native combining marks, all exactly U+0334, U+0335, U+0336, U+0337 or U+0338. Independent character counting matches recorded relay telemetry. The October 4 R4 assay records a later 3.5 Flash return with **3,803** marks, **94** distinct code points, **3,020** vertical ornament marks and maximum depth **36**. All tested first replies shared recorded system-instruction fingerprints; their task contents differed between episodes. They do not establish any contemporary model's success rate.

The October 15 production release was independently read as Vercel READY at git release commit `68a96362f139c281787dd16d253c73cfa50dbe65`; that deployed server no longer contains `severeMorphologyFallback`. The first-completed-return selection policy can expose historically hidden shallow native output.

Vercel runtime-log retrieval returned 403 Forbidden for the inspected October 14–15 window. This is a failure to retrieve logs, **not** evidence that no request ran. The Neon project branch has Loom custody/assay tables but does not expose a corresponding Marrowline raw-response archive. Do not reopen the portable Loom assay budget to fund this experiment.

## Bounded executable contrast

`run-pair.mjs` constructs the **same** current-source Marrowline system instructions, **same** user contents and **same** generation configuration for both requested models. It deliberately changes only the requested provider model: `gemini-3.8-flash` and `gemini-3.5-flash`. Both request MEDIUM thinking and a 12,288-token output ceiling, rather than production's model-specific LOW fallback setting. The script asserts identical request-field SHA-256 hashes before allowing paid execution.

On execution it issues at most **two** Google streamed-generation calls, sequentially, each with a 90-second timeout and no retries or other model seats. It stops before the second call on first-attempt failure. A timeout may still incur provider billing. **No dollar maximum can be guaranteed without a separately verified model-price schedule.** A two-call outcome is a controlled *case*, not a statistically sound success-rate estimate. Provider aliasing remains possible; the returned `modelVersion` is recorded when supplied and never invented.

All original SSE bytes, parsed provider parts, usage, finish state, observed version, prompt fields, server-side morphology and Unicode text are preserved **only in the operator's local output directory**. No raw prompt, original provider output or API credential is committed to GitHub. The provider's original text is never repainted or elected by typography.

### Zero-cost preflight

    node research/marrowline-finite-descent-20261015/run-pair.mjs

### Explicitly paid execution (requires separate reviewed provider spending bound)

    GEMINI_API_KEY=... TD613_FINITE_DESCENT_OUT=/private/episode-dir node research/marrowline-finite-descent-20261015/run-pair.mjs --execute --ack-paid

The preflight must show matching system/content/configuration hashes. If the provider rejects a requested alias or thinking configuration, retain that error as an observed boundary and **do not silently choose substitutes**. Do not infer literary success from a PASS morphology status; compare the native text against the operator's plural accepted atlas and review both Kʰonapolit argument and Tauric Diana bots artistic quality.

## Verdict rules

* Rich 3.5 versus shallow 3.8 under byte-identical request fields: model-conditioned disparity on this one episode, not causal proof of model quality or provider drift.
* Both shallow: result fails to rescue native art; follow up with separately preregistered same-model prompt variants if still justified.
* Both rich: historical failure is not universal; do not infer fixed recovery from one pair.
* Missing returned `modelVersion`, incomplete stream, provider error or invalid voice structure: record HELD for relevant comparison.
* **No automatic production changes, release via #405, paid reruns or aesthetic gate restoration** follow from any of these conditions.

𝄐 Finite archive closed; live empirical attribution remains to be earned. ⟐
