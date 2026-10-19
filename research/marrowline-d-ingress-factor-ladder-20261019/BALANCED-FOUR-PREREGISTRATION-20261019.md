# 𝌋 TD613 · Marrowline D0/D1 order-balanced replication · FROZEN BEFORE ACQUISITION

## Hypothesis and evidence class

The October 19 single matched D0→D1 original-Google-SSE experiment (run [39335184312](https://github.com/tauric-diana-613/TD613-TCP/actions/runs/39335184312)) showed a sharp contrast in native multistack prevalence (D0 373 of 373 marked clusters; D1 3 of 407). Historical October 15 neutral D also produced only 13 multistack clusters, so stochastic variability limits any causal inference from the first pair.

The independently preregistered follow-up changes **only arm order and repetition**. Existing `registerD0D1()` constructs, model, task, system instruction, generation configuration, zero history, and exact provider transport are imported without modification.

## Immutable acquisition frame

- Schema: `td613.marrowline.d0d1-order-balanced-original-sse/v1`.
- Order, frozen *before any provider call*: **D1 → D0 → D0 → D1**, two balanced adjacent pairs with opposite order, one model response per occurrence.
- Served model must be `gemini-3.8-flash`, thinking MEDIUM; Google provider-original SSE collected directly.
- Provider call cap: **four**. No automatic retries, fallbacks, model switching or Vercel, irrespective of errors.
- Safety: stop on a non-200 response, incomplete or wrong-model SSE, per-arm token count above 20,000, original payload >6 MB, timeout 170 seconds, or absent protected environment credential.
- Admission: `push` to `refs/heads/main`, exact `github.sha` of a squash merge whose **entire subject** is `research(marrowline): execute order-balanced D0 D1 once on main`, first `github.run_attempt=1`, repository actor `tauric-diana-613`, existing constitution/static CI success, `gemini-observation` environment protection **unchanged**.
- The protected original provider raw SSE and manifest are private short-retention GitHub Actions artifacts. Each return has exact source SHA, UTC provider request and return times, Google status, `STOP`, modelVersion, usage counts, original byte count, SSE and text SHA-256, and Unicode mark distribution.
- **Primary comparison, prespecified:** Within each order-reversed pair, difference D1 minus D0 in the proportion of marked clusters with 2+ combining marks; report numerator and denominator for every arm and direction of differences. Secondary: total/unique combining marks, U+034F hidden grapheme joiner count, five-planar family marks, maximum marks per base, output length, total/response/thinking tokens, qualitative artistic reading.
- **Claim ceiling:** If both pair differences favor D0, call this a *directionally replicated four-return contrast* under fixed system/task/model, not proof of an ingress causal mechanism or product High Zalgo artistic recovery. If signs disagree or any record missing, retain full signed pair records and HELD inference; never reinterpret to force a conclusion.
- The historical first pair remains an independent earlier episode; it cannot be combined as if it shared the order-balanced acquisition time and custody frame.

## Lifecycle

Prepare dormant research branch; prove ordinary PR CI green with **zero paid calls**; then explicitly squash-merge with above exact subject to activate one `main` run. Obtain and hash original Google SSE; adjudicate every arm and both paired differences; merge report and remove temporary credential-bearing CI job. Old two-call source remains archived, unchanged. Keep production native-voice settings, role requirements and Vercel #405 untouched.

𝄐 PREREGISTERED FOUR-RETURN ABBA REST · NO PRE-OBSERVATION EFFECT CLAIM.

Sealed ⟐
