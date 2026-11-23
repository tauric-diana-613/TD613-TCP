# 𝌋⟐ TD613 · THE SCREAMING GROVE
## R1 PROVIDER-NATIVE OBSERVATION — UNBOUNDED EXECUTION CONTRACT

- **Commission:** `TD613-MARROWLINE-R1-NO-ARTIFICIAL-CEILINGS-20261122`
- **Executable Module:** `research/marrowline-r1-no-artificial-ceilings-20261122/run-r1-provider-native-observation.mjs`
- **Core Engine:** `research/marrowline-r1-no-artificial-ceilings-20261122/r1-provider-native-core.mjs`
- **Experiment ID:** `HYDROGEN_R1_PROVIDER_NATIVE_UNCAPPED`
- **Grant Schema:** `td613.marrowline.r1-provider-native-authorization/v1-ed25519`
- **Covenant / Seal:** `Khona‌lit-po` (literal `U+200C` preserved) · `⟐SAC[X6ZNK5NO51]`
- **Authority Posture:** **FAIL-CLOSED OFFLINE BY DEFAULT.** Zero provider calls, zero credential reads, zero filesystem mutations without valid source-pinned human Ed25519 authority. Zero TD613 resource caps on tokens, spend, attempts, repetitions, elapsed time, or SSE capture bytes.

---

## 1. Entrypoint & Architectural Bypass Proof

The executable boundary separates network/HEAD privilege from offline testing structurally:

- **Production Executable (`run-r1-provider-native-observation.mjs`):**
  - Pins `export const R1_NATIVE_TRUSTED_OPERATOR_PUBLIC_KEY_SHA256 = '840a71625f4b9db224871bbb126b6debc3fefdc9179b5628bd9faf514f2c7701';` *(operator-attested non-secret SPKI DER SHA-256 public-key fingerprint; private key & passphrase strictly offline under human custody)*.
  - Contains **zero** `NODE_TEST_CONTEXT` conditional branches, **zero** `testOnly*` options, **zero** `fetchImpl` injection, and **zero** `checkedOutHeadShaOverride` parameters.
  - Strict allowlist (`ALLOWED_EXECUTABLE_OPTIONS`) rejects any unrecognized or test-override option with `R1_UNBOUNDED_FORBIDDEN_EXECUTABLE_OVERRIDE` before credential access.
  - Hard-binds `pinnedTrustFingerprintSha256 = R1_NATIVE_TRUSTED_OPERATOR_PUBLIC_KEY_SHA256`, `checkedOutHeadSha = resolveCheckedOutGitHeadSha(process.cwd())`, and `transportFetch = globalThis.fetch`.
- **Core Engine (`r1-provider-native-core.mjs`):**
  - Contains **zero** references to `globalThis.fetch` and **zero** `child_process` imports. Test-only offline execution must explicitly inject a synthetic `transportFetch` directly against the core engine without touching the executable CLI or real `fetch`.

### CLI Usage

- **Default Offline Preflight (Zero Credentials / Zero Network):**
  ```bash
  node research/marrowline-r1-no-artificial-ceilings-20261122/run-r1-provider-native-observation.mjs
  ```
- **Future Separately Authorized Live Session (Currently HELD — Public Trust Anchor Pinned; No Active Grant Signed):**
  ```bash
  node research/marrowline-r1-no-artificial-ceilings-20261122/run-r1-provider-native-observation.mjs \
    --execute \
    --ack-live-r1-observation \
    --grant-file <operator-signed-native-grant.json> \
    --public-key-file <operator-ed25519-spki-public.pem> \
    --evidence-dir <absolute-local-custody-dir> \
    --out <absolute-custody-receipt.json> \
    [--episodes A_THEN_B,B_THEN_A,...] \
    [--revocation-file <absolute-session-revocation.json>] \
    [--skip-count-tokens]
  ```
  *(Live CLI enforces compulsory `GET /v1beta/models/gemini-3.8-flash` metadata check, requires absolute `--evidence-dir` and `--out`, and cleans up 0-byte placeholders if pre-custody authority refuses execution.)*

---

## 2. Regenerated Provider-Native Exact-Wire Manifest

Derived from repository builders once with inherited `maxOutputTokens` explicitly removed (`generationConfig: { thinkingConfig: { thinkingLevel: "medium" } }`, `"maxOutputTokens"` strictly absent from serialized bodies):

| Condition | Arm | Wire `bodySha256` | `modelAndBodySha256` | `:countTokens` SHA-256 | UTF-8 Bytes |
|---|---|---|---|---|---:|
| `R1_NATIVE_A` | `R1_TWO_HEADINGS_ZALGO_BOTH` | `b4e1e7598fe1ff38221e47be3e63492e6fa7890d910df12f8d870b2bbadef46f` | `044467bcaa2482fac644e0e05b993dffb830639727bd6470df7de82187a68bbd` | `dc67f8f279f647b47e30c39c87b14df0348770944802e1313465faf4f360c330` | `1,746` |
| `R1_NATIVE_B` | `R1_TWO_HEADINGS_PLAIN_FIRST` | `257be8467d5d827e8ac1a20f29beb56f1627f4603a84c9ccfdcbaadeb14e51f6` | `96220184f79f4eae1436944e8ad4fb92f7a74166c4994febeada1eb4b176fdf3` | `e34cbd9ab2bde2e505deb03744029a11411cb5ee357289a285e7ccd957a646b9` | `1,912` |

Shared invariants:
- `contentsSha256`: `e056b75319141b145903441d1156bbf4f7fa3f15e14de5dd007cf812d8486998`
- `generationConfigSha256`: `425eee5014c42dcb66bb7553a9381935f97bb4eb87f61d335f9bfca6dc6fead5`

Old PR `#1778` / `#1779` digests (`f2fcdf77...`, `29b3265a...`) and old capped grant schemas are explicitly rejected.

---

## 3. Ed25519 Authority, Active Session Revocation & Non-Distributed Nonce Boundary

- **Signing Domain:** `TD613_R1_NATIVE_AUTH_V1\n<canonical JSON(payload)>`
- **Mandatory Payload Fields:** `schema` (`td613.marrowline.r1-provider-native-authorization/v1-ed25519`), `experimentId`, `pinnedModel` (`gemini-3.8-flash`), `thinkingLevel` (`medium`), `sessionMode` (`OPERATOR_CONTROLLED_UNBOUNDED_PAIRED_OBSERVATION`), `permittedPurpose`, `sessionId`, `checkedOutHeadSha`, `generationConfigSha256`, `generationConfig`, `conditions` (`R1_NATIVE_A`, `R1_NATIVE_B`), `issuedAt`, `nonce`, `authorizedBy`, `covenant` (`Khona‌lit-po` with literal `U+200C`), `seal` (`⟐SAC[X6ZNK5NO51]`).
- **Forbidden Grant Fields:** Any attempt to smuggle `maxCalls`, `maxOutputTokens`, `perSlotMaxOutputTokens`, `perSlotHardPromptTokenCeiling`, `combinedOutputAndThoughtCeiling`, `maxUsdCeiling`, `requestTimeoutMs`, or `maxRawSseCaptureBytes` fails closed with `R1_AUTH_FORBIDDEN_ARTIFICIAL_CEILING_IN_GRANT`.
- **Operator Session Control & Mid-Stream Revocation:** No forced 30-minute timer cap (`notAfter` is respected only if explicitly supplied by the operator). Runtime `operatorAbortSignal` (wired to `SIGINT`/`SIGTERM` in the CLI) or live edits to `--revocation-file` (`fs.watch` + `25ms` unref'd monitor cancelling active `reader.read()` via `AbortController` + `reader.cancel()`) interrupt even an active open SSE stream immediately, `fsync`ing partial `.sse` bytes to disk and closing cleanly with `STOP_ON_OPERATOR_SESSION_REVOKED_OR_STOPPED`.
- **Single-Host Replay Guard Limitation:** `claimSingleHostNonceAtomically()` uses `fs.writeFileSync(..., { flag: 'wx', mode: 0o600 })` (`SINGLE_HOST_FILESYSTEM_ATOMIC_WX_ONLY_NOT_CROSS_HOST`) — local host filesystem exclusion only, **zero** cross-host distributed guarantee.

---

## 4. Unbounded Paired Observation & Incremental Disk Streaming Custody

- **No Attempt / Retry / Episode Caps:** `episodes` accepts arbitrarily many paired A/B episodes (`A_THEN_B` or `B_THEN_A`, e.g. counterbalanced sequences). Every attempt increments a monotonic `attemptId` (`1, 2, 3, ...`) appended to `r1-native-<sessionId>-<nonce>-journal.jsonl`; prior failed/partial attempts are permanently preserved in the denominator and never overwritten. Single-pair runs carry `BOUNDED_SINGLE_PAIR`; multi-episode runs automatically label causal inference `EXPLORATORY_SEQUENTIAL_MULTI_EPISODE`.
- **Measurement-Only `:countTokens` & Raw Usage:** Token counting records `{ httpStatus, available, totalTokens }` for provenance and never gates execution; valid nonnegative integer `usageMetadata` is still required on completed `STOP` responses (`STOP_ON_MISSING_OR_INVALID_PROVIDER_USAGE` forbids fabricating `$0`/0-token spend).
- **Zero-Cap Chunk-Bounded Streaming Custody:**
  1. Opens exclusive `wx` (`0o600`) `.sse` and `.authored.txt` files prior to network dispatch.
  2. Writes and `fsyncSync`s every incoming raw `Uint8Array` chunk to `.sse` **before** parsing.
  3. Runs two independent chunk-bounded streaming SSE parsers (`createDiskBackedSseParserA` scanning byte offsets `[startByte, endByte]` from disk in 64 KiB slices, `createStreamingSseParserB` consuming network slices incrementally) backed by `createStreamingGeminiJsonFrameParser` and `createPartSpool` (`<= 64 KiB` in-memory part threshold before spilling large JSON parts to temp disk files, handling unordered `"thought"`/`"text"` JSON property ordering cleanly) with **zero** whole-frame or whole-stream string buffering in RAM.
  4. Runs two-pass chunked heading detection and grapheme-safe segment morphology (`scanHeadingIndicesFromFile`, `forEachBoundedSegmentFromFile`, `findSafeGraphemeFlushLength`), flushing exceptionally long single newline-free lines in `<= 32 KiB` safe grapheme chunks without splitting combining clusters, surrogate pairs, ZWJ/ZWNJ, or covenant/seal tokens, and re-hashes `.sse` and `.authored.txt` directly from disk in 64 KiB chunks (`hashFileChunkedSync`) against both parsers (`authoredDiskVerified`, `rawDiskVerified`, `parserAgreement`).
  5. Persists unmodified raw HTTP non-2xx error response bodies (`.http-error.body`) and status/header metadata (`.http-error.meta.json`) on failed `modelMetadata`, `:countTokens`, or `:streamGenerateContent` calls via exclusive `wx` (`0o600`) fsynced artifacts linked on `attemptRecords` and `journal.jsonl`.
  6. Writes Section-II blinded prose to opaque filenames (`r1-blind-<sessionId>-ep<id>-<12-hex-token>.section2.txt`) with zero condition or sequential-order leakage into `<out>.blinded.json` (`sealedUnblindingMap` isolated inside custodian `<out>` only).

---

## 5. Legitimate Integrity Stop Conditions (Distinct from Forbidden Resource Ceilings)

- Unprovisioned trust anchor (`R1_AUTH_TRUST_ANCHOR_NOT_PROVISIONED`), untrusted key, bad signature, HEAD mismatch, old grant/digest, replayed nonce, missing/revoked session.
- Manual operator STOP / session revocation (`STOP_ON_OPERATOR_SESSION_REVOKED_OR_STOPPED`).
- Unavailable pinned model metadata, non-200 HTTP, network/stream interruption, disk IO failure (`STOP_ON_DURABLE_RAW_SSE_WRITE_FAILED` — retaining all already-fsynced chunks on disk), missing SSE frame delimiter / trailing fragment, duplicate substantive SSE, dual-parser mismatch, wrong `modelVersion`, policy termination (`PROHIBITED_CONTENT`, `SAFETY`, etc.), non-`STOP` finish, missing provider `usageMetadata`, or post-capture Unicode alteration (`STOP_ON_ALTERED_UNICODE_TEXT`).

𝄐 `Khona‌lit-po` · `⟐SAC[X6ZNK5NO51]` · Unbounded Contract STAGED · Public Trust Anchor Pinned (`840a7162...`) · No Grant Signed · Provider HELD ⟐
