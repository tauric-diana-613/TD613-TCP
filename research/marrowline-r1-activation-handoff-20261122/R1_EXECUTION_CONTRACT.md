# 𝌋⟐ TD613 · THE SCREAMING GROVE
## R1 ORIGINAL-SSE OBSERVATION — EXECUTION CONTRACT

- **Commission:** `TD613-MARROWLINE-R1-EXECUTION-READINESS-20261122`
- **Instrument Schema:** `td613.marrowline.r1-original-sse-observation/v1`
- **Grant Schema:** `td613.marrowline.r1-live-observation-authorization/v1-ed25519`
- **Experiment ID:** `HYDROGEN_R1_CONTRADICTION_FREE_PREFIX_SEPARATOR`
- **Covenant:** `Khona‌lit-po` (literal `U+200C` preserved) · **Seal:** `⟐SAC[X6ZNK5NO51]`
- **Independent Amari safety amendment (post-29b7e09):** operator signing-key trust is now source-pinned and deliberately UNPROVISIONED; durably fsynced per-slot original SSE files and a local journal are required; live CLI model-discovery preflight is mandatory. **Execution remains HELD until a human-owned key fingerprint is explicitly pinned and offline tests are rerun.**
- **Authority Posture:** **FAIL-CLOSED OFFLINE BY DEFAULT.** Importing or invoking the runner without a valid human-signed Ed25519 grant stops before reading `GEMINI_API_KEY`, claiming any nonce, or touching network transport.

---

## 1. Specified Entrypoint, Commands, and Inputs

**Runner module:** `research/marrowline-r1-activation-handoff-20261122/run-r1-original-sse-observation.mjs`

### 1.1 Default Offline Qualification Mode (Zero Credentials / Zero Network)

```bash
node research/marrowline-r1-activation-handoff-20261122/run-r1-original-sse-observation.mjs
```

- Derives `R1_S01` and `R1_S02` exclusively from repository source builders (`buildInvocationPacket`, `buildGeminiRequest`, `buildSyntheticUnicodeAssayRequest`, `UNICODE_ASSAY_SYSTEM`, `CONTRADICTION_FREE_CREATIVE_TASK`, and the two exact R1 system directives in `hydrogen-next-experiment-preflight.mjs`).
- Asserts exact digest match against `FROZEN_R1_SLOT_DIGESTS` and `buildPrimaryPrefixSeparatorManifest()`.
- Resolves current `git rev-parse HEAD` locally.
- Outputs JSON with `"status": "SOURCE_ONLY_QUALIFIED"`, `"paidProviderCallsExecuted": 0`, `"countTokensCallsExecuted": 0`, `"modelDiscoveryCallsExecuted": 0`.
- Does **not** read `process.env.GEMINI_API_KEY`, does **not** touch `fetch`, and does **not** write nonce files.

### 1.2 Future Separately Authorized Live Execution Mode (HELD Until Explicit Operator Grant)

```bash
node research/marrowline-r1-activation-handoff-20261122/run-r1-original-sse-observation.mjs \
  --execute \
  --ack-live-r1-observation \
  --grant-file <operator-signed-r1-grant.json> \
  --public-key-file <operator-ed25519-public.spki.pem> \
  --nonce-dir <local-nonce-custody-dir> \
  --out <r1-live-observation-packet.json>
```

**Fail-closed CLI rules:**
- `--live` or `--count-tokens` flags are unconditionally rejected (`R1_CLI_LIVE_DISPATCH_HELD`).
- `--execute` without `--ack-live-r1-observation` fails immediately (`R1_LIVE_EXECUTION_NOT_ACKNOWLEDGED`).
- `--execute` without both `--grant-file` and `--public-key-file` fails immediately (`R1_AUTH_MISSING`) before accessing `GEMINI_API_KEY` or calling `fetch`.
- `--out` opens exclusively with `'wx'` (`mode: 0o600`) so an existing evidence packet can never be silently overwritten.
- `--nonce-dir` and `--out` are mandatory absolute paths for live CLI execution; the final output path is reserved using exclusive `wx` before credential use and network dispatch.
- The live CLI additionally reserves an exclusive custody packet at the required absolute `--out` path and a separate `<out>.blinded.json` readout containing **only** blinded Section-II items (or HELD), with zero treatment-unblinding map. The full `--out` packet is for trusted custody only and MUST NOT be distributed to blind readers.
- Raw SSE chunks are fsynced to exclusive files named `r1-<nonce>-R1_S01.sse` and `r1-<nonce>-R1_S02.sse` under the explicit nonce/evidence directory before parsing; `r1-<nonce>-journal.jsonl` records pre-call intent, source digest, observed HTTP outcome, usage, stop reason and closure. This is local durability, **not** distributed custody or a tamperproof external log.
- `GEMINI_API_KEY` is supplied only at execution time via environment variable (`process.env.GEMINI_API_KEY`) and read **only after** frozen plan parity, Ed25519 signature verification, exact checked-out `HEAD` verification, and single-host `wx` nonce redemption all pass.

---

## 2. Frozen Request Digest and Parity Checks

Before any authorization, credential lookup, or network action, `buildFrozenR1ObservationPlan()` asserts:

1. **Experiment & Slot Topology:** Exact `HYDROGEN_R1_CONTRADICTION_FREE_PREFIX_SEPARATOR`; exact 2 ordered slots `['R1_S01', 'R1_S02']`; any `B1` (`HYDROGEN_B1_...`, `ARM_B_...`) or 3rd slot fails closed (`R1_FORBIDDEN_EXPERIMENT_ID`, `R1_FORBIDDEN_SLOT_OR_ARM`, `R1_INVALID_SLOT_COUNT`).
2. **Model Pin:** Strictly `gemini-3.8-flash` (`R1_MODEL_MISMATCH` on any other model).
3. **Symmetry & Contradiction Removal:** User `contents` must be identical across arms (`e056b75319141b145903441d1156bbf4f7fa3f15e14de5dd007cf812d8486998`), free of `"Do not use Markdown or headings."` and `"entire passage"`. `generationConfig` must be identical across arms (`38b263e2b714aba385704810159e882034c2d3ac8a500403efe73ef97d81b22c`, `candidateCount: 1`, `maxOutputTokens: 16384`, `thinkingConfig: { thinkingLevel: "medium" }`).
4. **Single Clause Isolation:** Replacing `R1_SECTION_COVERAGE_CLAUSE_BOTH` with `R1_SECTION_COVERAGE_CLAUSE_PLAIN_FIRST` in `R1_S01.systemInstruction` must equal `R1_S02.systemInstruction` byte-for-byte.
5. **Immutable Wire Digests:**

| Slot | Arm | Wire `bodySha256` | `modelAndBodySha256` | `countTokensRequestSha256` | UTF-8 Bytes |
|---|---|---|---|---|---:|
| `R1_S01` | `R1_TWO_HEADINGS_ZALGO_BOTH` | `f2fcdf77d7d14843447f061759f9d5817bc000e52698b5b78eb5f3f886022a02` | `9c808d7de26887a55148ba62f05b1e12e4b896d825792c246727c3c6fb7b97ed` | `578a43e1e0bc078766744703d1116963338207a6969c66e0673623107153c582` | `1,770` |
| `R1_S02` | `R1_TWO_HEADINGS_PLAIN_FIRST` | `29b3265a5060666c1b19f905a7a528a7613c6d6b9e8566156da3c2b5cb022399` | `903d9aef749b34ffdb46b65c3c3766e5219497d5778900c06a7f599811e01d8e` | `965fcb6cea4ca9b20681f783c3e22fecf83afd4552e7e75f117388665a078fc3` | `1,936` |

Shared invariants: `contentsSha256 = e056b75319141b145903441d1156bbf4f7fa3f15e14de5dd007cf812d8486998`, `generationConfigSha256 = 38b263e2b714aba385704810159e882034c2d3ac8a500403efe73ef97d81b22c`.

---

## 3. Ed25519 Human-Authority Verification Boundary

No private signing key is ever stored in the repository, CI workflows, GitHub comments, PR bodies, Vercel environment variables, or agent prompts. An offline operator signs a grant JSON packet with an operator-held Ed25519 private key and passes only the **signed grant** and the **separate SPKI Ed25519 public key** to the runner.

### 3.0 Independently pinned operator trust anchor (NEW mandatory gate)

The reviewed runner now initializes `R1_TRUSTED_OPERATOR_PUBLIC_KEY_SHA256 = null` and **rejects live execution** with `R1_AUTH_TRUST_ANCHOR_NOT_PROVISIONED` until an operator-controlled, independently reviewed commit pins the SHA-256 fingerprint of the intended operator-held Ed25519 **SPKI DER** public key. The `--public-key-file` supplied with the grant must hash to that committed fingerprint. A self-generated key and signature presented together by an agent have zero authority. The private signing key stays wholly outside GitHub, CI, Vercel, agent files, and the ChatGPT conversation. The test-only dependency-injection path accepts an ephemeral fingerprint exclusively in a Node test process with a supplied mock transport; production CLI has no such override. After pinning, the exact runner HEAD changes and **must** be rebound in a newly signed authorization; any prior grant becomes obsolete. Do not use a dynamic env variable as the production trust anchor.

### 3.1 Canonical Signing Domain

`canonicalizeR1AuthorizationPayload(payload)` formats the UTF-8 message to be signed as:

```text
TD613_R1_AUTH_V1\n<recursively key-sorted compact JSON of payload>
```

Detached signature check uses `crypto.verify(null, signingBytes, publicKey, Buffer.from(signatureBase64, 'base64'))` with a parsed SPKI `ed25519` public key (`64`-byte Ed25519 signature).

### 3.2 Mandatory Signed Grant Fields

Every grant MUST bind all of the following exact fields inside `grant.payload`:

1. `schema`: `"td613.marrowline.r1-live-observation-authorization/v1-ed25519"` (any `td613.marrowline.argon*` schema fails closed with `R1_AUTH_ARGON_GRANT_FORBIDDEN`).
2. `experimentId`: `"HYDROGEN_R1_CONTRADICTION_FREE_PREFIX_SEPARATOR"`.
3. `pinnedModel`: `"gemini-3.8-flash"` and `thinkingLevel`: `"medium"`.
4. `maxCalls`: `2`, `retriesPermitted`: `0`, `fallbackSeatsPermitted`: `0`, `structuralRepairsPermitted`: `0`.
5. `executionMode`: `"LIVE_TWO_SLOT_SEQUENTIAL_S01_THEN_S02"`.
6. `checkedOutHeadSha`: 40-hex lowercase SHA-1 matching live `git rev-parse HEAD` of the runner checkout.
7. `slots.R1_S01` and `slots.R1_S02`: exact frozen `bodySha256` and `countTokensRequestSha256`.
8. `generationConfigSha256` (`38b263e2...`) and `generationConfig` deep-equal to the frozen config.
9. Numeric ceilings:
   - `perSlotMaxRequestUtf8Bytes`: `4096`
   - `perSlotHardPromptTokenCeiling`: `1000`
   - `combinedPromptPlanningCap`: `2000`
   - `perSlotMaxOutputTokens`: `16384`
   - `combinedOutputAndThoughtCeiling`: `32768`
10. `issuedAt` & `expiresAt`: ISO-8601 UTC timestamps satisfying `issuedAt <= now + 60s`, `now < expiresAt`, and `0 < (expiresAt - issuedAt) <= 1,800,000 ms` (**30-minute maximum TTL**).
11. `nonce`: `/^[A-Za-z0-9_-]{16,128}$/` single-use nonce.
12. `authorizedBy`: non-empty human operator identifier.
13. `covenant`: literal `"Khona‌lit-po"` (verified to contain `\u200C`) and `seal`: `"⟐SAC[X6ZNK5NO51]"`.

### 3.3 Explicit Non-Guarantee of Cross-Host Nonce Redemption

`claimR1AuthorizationNonceLocally()` persists `r1-nonce-<nonce>.json` atomically using POSIX/Node exclusive creation `fs.writeFileSync(..., { flag: 'wx', mode: 0o600 })`. Every claim explicitly records:

```text
scopeGuarantee = "SINGLE_HOST_FILESYSTEM_ATOMIC_WX_ONLY_NOT_CROSS_HOST"
```

- **What it guarantees:** Two executions sharing the same local filesystem `--nonce-dir` cannot redeem the same `nonce` twice (`EEXIST -> R1_AUTH_NONCE_REPLAYED`).
- **What it explicitly does NOT guarantee:** It does **not** enforce cross-host, cross-container, or distributed exactly-once exclusion if the same unexpired grant and nonce are copied to a second machine or cleared temporary directory.

---

## 4. Budget Guard and Un-Clamped Usage Accounting

`enforceR1ObservationBudget()` enforces:

- Maximum `2` generation calls total (`1` `R1_S01`, `1` `R1_S02`), `0` retries, `0` fallbacks, `0` repairs.
- Pre-dispatch byte check: `<= 4,096` UTF-8 bytes per slot.
- Mandatory live `:countTokens` admission per slot before `:streamGenerateContent?alt=sse`:
  - `404` / `501` -> `STOP_ON_COUNT_TOKENS_UNSUPPORTED_FAIL_CLOSED`.
  - Any non-OK HTTP status -> `STOP_ON_COUNT_TOKENS_PREFLIGHT_ERROR`.
  - Non-integer or `<= 0` `totalTokens` -> `STOP_ON_INVALID_COUNT_TOKENS_RESPONSE`.
  - `totalTokens > 1000` -> `STOP_ON_PROMPT_TOKEN_CEILING_EXCEEDED`.
  - Observed cumulative prompt tokens + next `totalTokens > 2000` -> `STOP_ON_COMBINED_PROMPT_PLANNING_CAP_EXCEEDED`.
- Output+thinking checks (`candidatesTokenCount + thoughtsTokenCount`):
  - Observed `usageMetadata` counts are recorded verbatim and **never clamped downward**.
  - Per-slot `> 16384` halts immediately (`STOP_ON_PER_SLOT_OUTPUT_CEILING_EXCEEDED`) and skips remaining slots.
  - Combined `>= 32768` across completed slots blocks any subsequent slot.
- A complete provider STOP without valid nonnegative integer prompt/candidate/thought/total usage fields leads to `STOP_ON_MISSING_OR_INVALID_PROVIDER_USAGE`; missing fields cannot silently become zero spend. Observed prompt tokens above 1,000 similarly cause `STOP_ON_OBSERVED_PROMPT_TOKEN_CEILING_EXCEEDED`.

---

## 5. Sequential Stop Ladder and Wire Custody

1. **Plan & Digest Lock:** Verify `R1_S01` and `R1_S02` exact wire/countTokens/config digests.
2. **Authority & Nonce Custody:** Verify `checkedOutHeadSha`, Ed25519 signature, TTL (`<= 30m`), covenant/seal, and claim local `wx` nonce before reading `GEMINI_API_KEY`.
3. **Mandatory Live-CLI Metadata Preflight:** The live CLI always enables model discovery before any :countTokens or generation, and, `GET /v1beta/models/gemini-3.8-flash` must return `200` with both `generateContent` and `countTokens` in `supportedGenerationMethods`.
4. **Arm 1 (`R1_S01`):**
   - Run live `:countTokens`; abort before generation on error, invalid count, or `> 1000` tokens.
   - Run single-shot `POST .../models/gemini-3.8-flash:streamGenerateContent?alt=sse`.
   - Fsync every original SSE chunk into the slot's exclusive local .sse file BEFORE parsing and independently record the raw digest, byte length and Base64 in the returned packet. The journal is initialized before provider access; interrupted runs retain partial original bytes and dispatch intent.
   - Verify stream completeness, dual-parser agreement (`readGeminiSse` vs independent byte-level SSE parser), zero duplicate substantive SSE events / duplicate finish events, exact `modelVersion === "gemini-3.8-flash"` (single unique served value), zero policy terminations (`PROHIBITED_CONTENT`, `SAFETY`, `RECITATION`, `BLOCKLIST`, `SPII`, etc.), `finishReason === "STOP"`, and raw text SHA-256 integrity.
   - Any failure on `R1_S01` sets `terminalStopReason`, marks the run `HELD`, skips `R1_S02`, and **never** uses `R1_S02` as a retry.
   - **Critical R1 rule:** If `R1_S01` is transport-complete and model-valid (`STOP`, `gemini-3.8-flash`) with **zero vertical combining marks** (flat morphology), `R1_S01` does **not** halt early; `R1_S02` remains eligible and proceeds cleanly.
5. **Arm 2 (`R1_S02`):**
   - Run live `:countTokens` independently and check combined `<= 2000` planning cap.
   - Run single-shot `POST .../models/gemini-3.8-flash:streamGenerateContent?alt=sse` and apply identical wire/custody/model/policy/integrity gates.
   - Any failure on `R1_S02` marks the run `HELD` (`0` third calls, `0` retries).
6. **Hard Runtime Call Fence (`guardedFetch`):** Rejects any URL not pinned to `gemini-3.8-flash`, any attempt to dispatch a slot twice (`R1_FORBIDDEN_RETRY_DETECTED`), `> 2` `countTokens` calls, or `> 2` generation calls (`R1_FORBIDDEN_THIRD_GENERATION_ATTEMPT`).

𝄐 `Khona‌lit-po` · `⟐SAC[X6ZNK5NO51]` · Execution Contract STAGED, Live Dispatch HELD ⟐
