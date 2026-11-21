# Q1 Live Creative Discriminator — Hardened Preflight & Execution-Readiness Receipt (v2.0)

- **Commission:** `TD613-MARROWLINE-SCREAMING-GROVE-Q1`
- **Status:** **`PAID_Q1_EXECUTION_READY_PENDING_EXACT_HEAD_AUTHORIZATION`**
- **Paid Provider Calls Executed:** **`0`** (zero `generateContent` / `streamGenerateContent` / `POST` requests sent)
- **Active Research PR:** `#1764` (`research/marrowline-screaming-grove-q1-preflight-20261121`)
- **Superseded Preflight Predecessor Commit:** `67339318d5a430541a572c19833817271d69c5f3` (reviewed in GitHub Reviews `#6007790469` & `#6007792790`; CI Run `44942964461` GREEN)
- **Parent Visual-Parity Estate:** PR `#1759` @ `026ac4636eba782364eab46404dfcadd9414e9e0` (exact-head CI Run `44873359129` GREEN)
- **Retained Deterministic Repair Ancestor:** `bc5467246f12b0598f89d681e4a4450c4733eace`
- **Immutable Historical Comparator:** `ffb98ac0050c99b07aef59ac3d200d8bee2e7e3a`
- **Preserved Preregistration:** [`../marrowline-screaming-grove-restoration-20261120/BOUNDED_PROVIDER_EXPERIMENT_PREREGISTRATION.md`](../marrowline-screaming-grove-restoration-20261120/BOUNDED_PROVIDER_EXPERIMENT_PREREGISTRATION.md) (**ZERO request/design amendment required**)
- **Machine-Readable Preflight Artifact:** [`Q1_EFFECTIVE_REQUESTS_PREFLIGHT.json`](./Q1_EFFECTIVE_REQUESTS_PREFLIGHT.json)
- **Hardened Zero-Spend-By-Default Runner:** [`run-q1-live-discriminator.mjs`](./run-q1-live-discriminator.mjs)
- **Zero-Network Negative-Control Suite:** [`../../tests/marrowline-q1-live-discriminator.test.mjs`](../../tests/marrowline-q1-live-discriminator.test.mjs)
- **Emergence HQ Custody & Retrieval Navigator:** [`Q1_EMERGENCE_HQ_RETRIEVAL_NAVIGATOR.md`](./Q1_EMERGENCE_HQ_RETRIEVAL_NAVIGATOR.md)

---

## 1. Technical Redpen & Financial Correction Applied (Reviews `#6007790469` & `#6007792790`)

Every engineering defect identified by Amari in Review `#6007790469` has been resolved, while applying the Human Operator's financial correction in Review `#6007792790`:

1. **No Dollar Spending Ceiling & No Aggregate Token-Budget Ceiling (Review `#6007792790`):**
   - Removed all `$1.00 hard cap` language from the harness, preflight JSON, preflight receipt, and Operator Authorization Statement.
   - No runtime spending guard, no worst-case dollar reservation, no billing-usage refusal, and no response truncation exist in `run-q1-live-discriminator.mjs`.
   - `maxOutputTokens: 65536` is preserved strictly as the historically matched provider generation profile (`GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE`), **not** an economy cap.
   - The **8 registered Q1 slots** (`4` Arm A + `4` Arm C; `1` first-return call/slot; `0` retries, `0` fallbacks, `0` structural repair) are preserved as a **scientific sampling and first-return integrity contract**, not a cost cap.
2. **Independent Dual-Parser SSE Integrity (`STOP_4`):**
   - Original raw SSE bytes are persisted to `live-acquisition/raw-sse/<slot>.sse` **before any parsing**.
   - Every 200 SSE stream is verified independently by TWO zero-shared-code parsers:
     - **Parser A (Canonical Production):** `readGeminiSse` + `extractGeminiText` from `server/khonapolit-quality.js`.
     - **Parser B (Independent Strict WHATWG State Machine):** `parseSseIndependently` (fatal UTF-8 decoding, line-by-line WHATWG EventSource state machine, strict field validation, JSON object validation, inline stream-error detection, separate thought/visible extraction).
   - Verifies UTF-8 validity, zero parse/framing/protocol errors in both parsers, `eventCountMatch`, `textEquivalent` (exact string + SHA-256 + byte buffer equality), `finishReasonEquivalent`, `modelVersionEquivalent`, and `promptBlockEquivalent`.
   - Any malformed stream or cross-parser mismatch halts fail-closed (`STOP_4_MALFORMED_SSE` / `STOP_4_SSE_RECONSTRUCTION_MISMATCH`), preserves raw SSE bytes, and writes an atomic terminal failure receipt.
3. **Seven-Class Finish-State Integrity & Specimen Eligibility (`classifySlotOutcome`):**
   - Mutually exclusive classification:
     1. `COMPLETED_STOP` (`eligibleArtisticSpecimen: true`)
     2. `POLICY_TERMINATED` (`eligibleArtisticSpecimen: false`, `STOP_2_POLICY_HALT_*`)
     3. `INCOMPLETE_NONSTOP` (`eligibleArtisticSpecimen: false`, e.g. `MAX_TOKENS`, `OTHER` — retained with original slot identity, never promoted or retried)
     4. `UNWITNESSED_COMPLETION` (`eligibleArtisticSpecimen: false`, missing `finishReason` or empty visible text)
     5. `TRANSPORT_FAILURE` (`eligibleArtisticSpecimen: false`, HTTP non-2xx, network error, or mid-stream read interruption; `STOP_3` on 2 consecutive transport failures or unrecoverable HTTP `401`/`402`/`403`/`404`)
     6. `MALFORMED_OR_UNRECONSTRUCTABLE_SSE` (`eligibleArtisticSpecimen: false`, `STOP_4_*`)
     7. `MODEL_IDENTITY_MISMATCH` (`eligibleArtisticSpecimen: false`, `STOP_1_MODEL_IDENTITY_HOLD_*` on missing OR unexpected `modelVersion`)
4. **Two Production-Observer Call-Signature Bugs Fixed During Hardening:**
   - In predecessor commit `67339318d`, `run-q1-live-discriminator.mjs` had invoked `observeGeminiOutput(text, opts)` and `observeMarrowlineCompletion({ text, ... })` instead of the canonical signatures `observeGeminiOutput(mergedPayload, model, opts)` and `observeMarrowlineCompletion(text, observedOutput, { streamed, parseErrors, creative })`. Both call sites are now fixed and covered by zero-network negative controls.
5. **Exact Model & Request Equivalence Enforcement (`STOP_1`):**
   - `assertQ1RequestEquivalence` runs before any network call and verifies `gemini-3.8-flash`, `thinkingLevel: medium`, `maxOutputTokens: 65536`, `generationConfigSha256`, paired Arm A/C `contentsSha256` & Aperture identity, and exact preregistered `bodySha256` / `modelAndBodySha256` digests.
6. **Crash-Safe Atomic Per-Slot Partial Receipt Survival:**
   - `Q1_LIVE_ACQUISITION_RECEIPT.json` is written atomically after every slot and inside `finally`, guaranteeing prior first-return records and terminal failure receipts survive parser exceptions or mid-stream aborts.

---

## 2. Live Provider Catalog Verification (Read-Only `GET`, `0` Paid Calls)

- **Endpoint:** `GET https://generativelanguage.googleapis.com/v1beta/models?pageSize=200` (HTTP `200`, `0` generation tokens)
- **Target Model Confirmed Callable:** **`models/gemini-3.8-flash`** (`thinking: true`, `inputTokenLimit: 1,048,576`, `outputTokenLimit: 65,536`, methods: `generateContent`, `countTokens`, `createCachedContent`, `batchGenerateContent`)
- **Matched Generation Profile (`GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE`):** `maxOutputTokens: 65536`, `thinkingConfig: { "thinkingLevel": "medium" }`, `generationConfigSha256 = 4785e46e91dfc32f5742dc9fc4ce7414142d62335c7a29e56c1e7e89a1d4ab34`.

---

## 3. Effective Request Digests — Byte-for-Byte Identical to Preregistration & `67339318d`

Zero request-construction, prompt, task, Aperture, or generation-config changes occurred during hardening:

| Arm × Task | Aperture Route / Discourse | System Bytes | Wire Bytes | `systemInstructionSha256` (prefix) | `contentsSha256` (prefix) | `bodySha256` |
|---|---|---:|---:|---|---|---|
| **Arm A · T1 (`BLUE_ORANGE_WEATHER`)** | `OPEN_FIELD_CREATIVE_SYNTHESIS` / `CREATIVE` | `32,779` | `33,486` | `90421826b7c0` | `ba8299461d72` | `a3601b7bf598502b70e593491720751d5946c1c162b71cea8a31eb9d3f9b0293` |
| **Arm C · T1 (`BLUE_ORANGE_WEATHER`)** | `OPEN_FIELD_CREATIVE_SYNTHESIS` / `CREATIVE` | `32,658` | `33,365` | `6de6ae0c7ce2` | `ba8299461d72` *(identical)* | `cab2f10ed20ba154d9548ca96e70ebc0ad7e92204efe7cf00cfd9995a8cc64ae` |
| **Arm A · T2 (`FORENSIC`)** | `REQUESTED_SYNTHESIS` / `GENERAL` | `33,528` | `34,435` | `4590ac8c73a6` | `23be3dd96f58` | `8c56a603c5820075138d8fb3dc4ce7f14e3198d47562cb5dc89e9b2f0dcab6a1` |
| **Arm C · T2 (`FORENSIC`)** | `REQUESTED_SYNTHESIS` / `GENERAL` | `33,407` | `34,314` | `745300c932a4` | `23be3dd96f58` *(identical)* | `dcab78f7758d663259804f211c3c693bd2dd09f0562f7c8372ad85f67c38e091` |

---

## 4. Descriptive Pricing Reference Only (No Runtime Cap)

Verified against `ai.google.dev` (`2026-11-21`): `gemini-3.8-flash` introductory rate through Dec 31, 2026 is `$0.75 / 1M` input (`$0.075 / 1M` cached), `$3.75 / 1M` output including thinking tokens (standard Jan 1, 2027 rate: `$1.50 / 1M` in, `$7.50 / 1M` out).

| Descriptive Scenario (`8` Registered Slots · **Not Enforced as a Cap**) | Prompt Tokens | Output + Thinking Tokens | Descriptive USD Estimate |
|---|---:|---:|---:|
| Typical expected observation budget (Nov 2026 intro rate) | `79,768` | `40,000` | `$0.21` (`$0.20983`) |
| 2× headroom observation budget (Nov 2026 intro rate) | `100,000` | `80,000` | `$0.38` (`$0.37500`) |
| Theoretical maximal `8 × 65,536` output allowance (Nov 2026 intro rate) | `79,768` | `524,288` | `$2.03` (`$2.02591`) |
| Typical expected observation budget (Standard 2027 rate reference) | `79,768` | `40,000` | `$0.42` (`$0.41965`) |

---

## 5. Copy-Ready Final Operator Authorization Statement (Exact-HEAD Bound)

> Do **not** reuse predecessor SHA `67339318d5a430541a572c19833817271d69c5f3`. Bind the final live authorization to the exact hardened commit SHA reported on PR `#1764`:

```text
AUTHORIZE Q1 LIVE EXECUTION:
- Active PR & Exact Source HEAD SHA: PR #1764 @ <EXACT_HARDENED_Q1_HEAD_SHA> (inheriting PR #1759 @ 026ac4636eba782364eab46404dfcadd9414e9e0)
- Model & Matched Profile: gemini-3.8-flash (thinkingLevel: medium, maxOutputTokens: 65536)
- Experimental Scope: Q1 ONLY — 8 registered counterbalanced observations (4 Arm A + 4 Arm C across T1 BLUE_ORANGE_WEATHER & T2 FORENSIC; 1 first-return acquisition per slot; 0 retries, 0 fallbacks, 0 structural repair; Q2 remains HELD)
- Financial & Token Policy: NO dollar spending ceiling and NO aggregate token-budget ceiling (per Operator Review #6007792790)
- Post-Acquisition Custody: Full raw SSE + raw UTF-8 + independent dual-parser parity + 7-class completion receipt + desktop & mobile browser visual custody + blinded 8-specimen Operator review packet published to GitHub for Emergence HQ; human artistic closure RESERVED; no merge/deploy; Experiment B CLOSED.
```
