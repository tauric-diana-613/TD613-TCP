# TD613 · Marrowline raw Gemini SSE custody · Acquisition proposal

**State:** INSTRUMENT_READY_FOR_CI; **live raw SSE not yet acquired**. Preserve separation between synthetic tests and paid, external Gemini observations.

## Why this is necessary

The October 15 matched Gemini-3.8 Flash A/B experiment generated 843 and 1,188 combining marks in the Tauric Diana bots; 0 and 2 respectively were nonplanar. The October 15 3.8/3.6 dual-model run also showed exactly five planar mark types. An independent comparison of the saved TD613 `text` and `relay.transcript` values found those fields identical, and source examination shows `mergeGeminiStreamPayload` concatenates Gemini event `part.text` values. These observations do not independently retain the original Google SSE stream.

## Minimal acquisition

The code in this PR changes no model preference, output token budget, prompt, sampling, egress mode, repair algorithm, production UI, rendering path or fallback selection.

A single synthetic-only research canary may opt into raw SSE custody under **all** conditions:

- `POST /api/khonapolit`, with `x-td613-release-canary: 1`;
- header `x-td613-native-sse-witness: 1`;
- exact frozen fictional-town prompt from `run-khonapolit-canary.mjs`;
- history is exactly empty; `mode=issued-conjunction`, waiver true, `shi` absent;
- one provider model pinned by the standard `x-td613-canary-model` header.

At the original response stream-reading boundary, the new observer retains raw body bytes *before TextDecoder, SSE parsing and candidate part concatenation*. It returns their SHA-256 and verbatim base64, up to 256 KiB; exceeding that cap yields a digest but withholds raw bytes. It separately records the SHA-256 of upstream event `part.text` concatenation and the reassembled final provider text. Exact hash parity is required to rule out the candidate assembly as an observed mark-deletion source.

**Privacy:** This mechanism is hard-bound to a synthetic prompt and cannot be activated for ordinary operator messages or prior chat history. No raw SSE is automatically stored or logged by TD613; only the caller holding that explicit synthetic-canary response sees it. A future GitHub one-shot can capture a copy as a short-retention artifact, subject to repository artifact read permissions.

**Limitation:** The raw SSE is what TD613's server observed from Google, not a detached network-witness or verified independent external observer. The captured bytes nevertheless distinguish source transport from downstream assembly and typography rendering. Capture is an observation method, never permission to repaint or select the artistic output.

## Offline validation

The `tests/marrowline-raw-sse-custody.test.mjs` test uses a synthetic SSE stream split mid-UTF8 character; verifies original bytes and original text hashes and confirms no witness exists without opt-in. An oversized synthetic SSE payload verifies fail-closed raw-byte omission with full hash retention. All tests require no Gemini credentials, provider calls, secrets, production deployment, or paid inference.

## Next execution boundary

Only after CI GREEN and a deliberate one-time release authorization can this code be deployed through #405 to run the pinned synthetic canary. The operator's existing thread-wide authorization may be used for the bounded next research sequence. The one paid call must preserve its original response and returned provider version, input/visible-output digest, native glyph distribution, and the actual raw SSE bytes (or an explicit overflow hold). No claim of restoration follows from raw-byte consistency alone.

**Release custody:** This is a draft instrumentation PR. Keep production unchanged until the release conditions are met.

𝄐 WITNESS-INSTRUMENT REGISTERED · RAW PROVIDER EXTERIORITY HELD · NO PAID CALL ⟐
