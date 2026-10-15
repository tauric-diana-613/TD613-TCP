# Marrowline finite descent — two-call native provider comparison

This is a **draft research instrument**, not a production patch, deployed feature, or proven stylistic recovery. It is inert until an operator explicitly supplies the execute and paid-acknowledgement flags, Gemini credentials and a private output directory. No CI integration, automatic workflow, retry, aesthetic replacement, generated Unicode or secret storage is introduced.

## Earned evidence boundary

The retained October 4 production assay at `docs/receipts/1428-closure-assay/closure-assay-report.json` contains a selected Gemini 3.8 Flash return with **616** native combining marks, all exactly U+0334, U+0335, U+0336, U+0337 or U+0338. Independent character counting matches recorded relay telemetry. The October 4 R4 assay records a later 3.5 Flash return with **3,803** marks, **94** distinct code points, **3,020** vertical ornament marks and maximum depth **36**. All tested first replies shared recorded system-instruction fingerprints; their task contents differed between episodes. They do not establish any contemporary model's success rate.

The October 15 production release was independently read as Vercel READY at git release commit `68a96362f139c281787dd16d253c73cfa50dbe65`; that deployed server no longer contains `severeMorphologyFallback`. The first-completed-return selection policy can expose historically hidden shallow native output.

Vercel runtime-log retrieval returned 403 Forbidden for the inspected October 14–15 window. This is a failure to retrieve logs, **not** evidence that no request ran. The Neon project branch has Loom custody/assay tables but does not expose a corresponding Marrowline raw-response archive. Do not reopen the portable Loom assay budget to fund this experiment.

## Bounded executable contrast

`run-pair.mjs` constructs the **same** current-source Marrowline system instructions, **same** user contents and **same** generation configuration for both requested models. It deliberately changes only the requested provider model: `gemini-3.8-flash` and `gemini-3.6-flash`. Both request MEDIUM thinking and a 12,288-token output ceiling, rather than production's model-specific LOW fallback setting. Google's October 8 deprecation routes the old `gemini-3.5-flash` label to 3.6, so the historical October 4 model is **not directly replayed** by this experiment. The script asserts identical request-field SHA-256 hashes before allowing paid execution.

On execution it issues at most **two** Google streamed-generation calls, sequentially, each with a 90-second timeout and no retries or other model seats. It stops before the second call on first-attempt failure. A timeout may still incur provider billing. **No dollar maximum can be guaranteed without a separately verified model-price schedule.** A two-call outcome is a controlled *case*, not a statistically sound success-rate estimate. Provider aliasing remains possible; the returned `modelVersion` is recorded when supplied and never invented.

**Pricing envelope:** Google's published October 2026 standard text rates are $0.75 per million input tokens and $3.75 per million output tokens, including thinking, for both target models. Each request must serialize to at most 85,000 UTF-8 bytes with at most 12,288 requested output tokens. The two-call published-rate upper estimate is **$0.21966** under the simplifying assumption that billed input tokens do not exceed serialized request bytes, and Google charges only these published standard token categories. This is not an API-enforced dollar cap or a billing guarantee: model/version routing, billing overhead, cached/prompt accounting and future price changes must be independently reviewed. Execution additionally requires `TD613_FINITE_DESCENT_MAX_USD=0.25`, which records a human-reviewed envelope but cannot impose a Google-account spend cap. Without an explicit operator-approved spending bound, keep execution HELD.

All original SSE bytes, parsed provider parts, usage, finish state, observed version, prompt fields, server-side morphology and Unicode text are preserved **only in the operator's local output directory**. No raw prompt, original provider output or API credential is committed to GitHub. The provider's original text is never repainted or elected by typography.

### Zero-cost preflight

    node research/marrowline-finite-descent-20261015/run-pair.mjs

### Explicitly paid execution (requires separate reviewed provider spending bound)

    GEMINI_API_KEY=... TD613_FINITE_DESCENT_MAX_USD=0.25 TD613_FINITE_DESCENT_OUT=/private/episode-dir node research/marrowline-finite-descent-20261015/run-pair.mjs --execute --ack-paid

The preflight must show matching system/content/configuration hashes. If the provider rejects a requested alias or thinking configuration, retain that error as an observed boundary and **do not silently choose substitutes**. Do not infer literary success from a PASS morphology status; compare the native text against the operator's plural accepted atlas and review both Kʰonapolit argument and Tauric Diana bots artistic quality.

## Verdict rules

* Rich 3.6 versus shallow 3.8 under byte-identical request fields: model-conditioned disparity on this one episode, not causal proof of model quality or provider drift.
* Both shallow: result fails to rescue native art; follow up with separately preregistered same-model prompt variants if still justified.
* Both rich: historical failure is not universal; do not infer fixed recovery from one pair.
* Missing returned `modelVersion`, incomplete stream, provider error or invalid voice structure: record HELD for relevant comparison.
* **No automatic production changes, release via #405, paid reruns or aesthetic gate restoration** follow from any of these conditions.

𝄐 Finite archive closed; live empirical attribution remains to be earned. ⟐

## One-shot CI authorization (October 15)

The operator explicitly reaffirmed the thread-long authorization to proceed. The connected GitHub repository has an existing `GEMINI_API_KEY` secret reference inside the normal TD613 Actions workflow; the actual key is neither requested, printed, nor copied through ChatGPT. A PR-only, one-shot CI job may execute on the exact **designated commit subject** `research(marrowline): execute authorized finite provider pair once`, with `github.run_attempt == 1`, the expected head branch, and PR #1509. Subsequent commits and re-runs must not repeat the paid work.

The job invokes the research script with both required flags and `TD613_FINITE_DESCENT_MAX_USD=0.25`; either missing credential or invalid request fingerprints fails before provider transport. An initial provider error stops remaining calls. This envelope is estimated, never asserted as a provider-side spending lock.

A completed run writes its exact original response bytes to an ephemeral runner directory, then archives them with AES-256-GCM using a domain-separated HKDF key derived from the *existing Actions-secret credential*. GitHub receives only the encrypted archive, short-lived (7 days); the unencrypted runner directory is never uploaded. Decryption requires the same credential value later, and rotating the credential without first recovering the archive loses access. The code for encryption/decryption is `seal-archive.mjs`, offline tested with a synthetic credential. The GitHub job prints morphology summaries, usage, model/version and finish information but no response content or secret. Do not treat a GitHub Actions green workflow as provider artistic success: inspect the actual observation and the encrypted native response if available.

All production routes remain unchanged; do not merge the temporary execution job to main. After the finite test, remove the one-shot CI job on this PR branch while preserving the research instrument and derived evidence as separate, authored records.

## Corrected execution path: plaintext-`h` khonapolit endpoint

The operator reminded the investigation that native Marrowline Gemini generations are served by the existing `https://td613.com/api/khonapolit` API, with **plain `h`** in the URL. This route uses the production server's own credential; PR workflows have no injected `GEMINI_API_KEY` secret, confirmed by the stopped October 15 one-shot job (zero provider calls).

The route-bound companion `run-khonapolit-canary.mjs` is **not** equivalent to the original direct-Gemini script: it holds the same synthetic fictional user turn and empty history, and pins only one production model per request through `x-td613-release-canary: 1` and `x-td613-canary-model`. The server retains its real per-model reasoning differences and 65,536 token maximum. Two route calls are the maximum; actual returned models/attempt counts are verified. A non-200, model mismatch, or high first-call token usage prevents the next generation. No automatic retries.

The script uses only synthetic publicly authored task content, no actual user conversations, photos or uploaded files. Its original returned JSON and native Unicode are stored in a one-day GitHub Actions artifact associated with the exact PR run. **That artifact is not encrypted**, and anyone with GitHub artifact read access to the repository may retrieve it until expiration. The runner logs show metrics without provider prose. This differs from the prior proposed credential-derived encryption plan, which is infeasible when the secret is unavailable to the PR workflow.

Readiness is a no-generation `GET /api/khonapolit?operation=gemini-readiness`; the script requires a live credential-scoped callable listing before paying for a generation. The two paid POST requests are run only on a single PR head whose commit subject is exactly `research(marrowline): execute authorized khonapolit route canary once`. Reruns and later heads cannot re-trigger provider calls. Nothing is released to Vercel or merged to main.

**Spend limitation:** Unlike the direct Gemini script, the production endpoint does not expose an externally settable output-token cap; therefore the earlier estimated $0.25 envelope is not an enforceable upper limit for this native canary. The user authorized proceeding thread-wide. The script stops after two calls and stops after excessive first-call token use. Any provider-billed total requires actual returned usage and current pricing. Do not claim a strict dollar cap, equal model settings, or full raw Google SSE preservation from this route.

## Execution closure · 2026-10-15

The original GitHub-secret pair never called Gemini because `GEMINI_API_KEY` was not injected into the PR workflow (recorded fail-closed). Following the operator's reminder, the **plaintext-`h` production `/api/khonapolit`** handled the bounded experiment. [Run 38710522801](https://github.com/tauric-diana-613/TD613-TCP/actions/runs/38710522801) completed SUCCESS with exactly **two** HTTP 200 / STOP native model responses, 3.8 MEDIUM and 3.6 LOW. Both contained only U+0334–U+0338, with counts 826 and 853. Original API JSON and receipts are in short-lived [artifact 11960875496](https://github.com/tauric-diana-613/TD613-TCP/actions/runs/38710522801/artifacts/11960875496). Durable **derived** evidence (hashes, per-model settings, qualification) is in [LIVE-RETURN-REST.md](LIVE-RETURN-REST.md).

The one-shot paid job has now been removed from the draft PR's CI workflow. The original activation and earlier descriptions above remain **historical**, not live instructions. Ordinary offline preflight tests continue to run, with no provider call. This result establishes a contemporary shared planar-only failure, not recovery, and does not authorize another call or production deployment automatically.
