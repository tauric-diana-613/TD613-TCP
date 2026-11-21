# Q1 Live Creative Discriminator — Complete 10-Point Provider Preflight Receipt

- **Commission:** `TD613-MARROWLINE-SCREAMING-GROVE-Q1`
- **Status:** **`PAID_EXECUTION_HELD_PENDING_OPERATOR_GESTURE`**
- **Paid Provider Calls Executed:** **`0`** (zero `generateContent` / `streamGenerateContent` / `POST` requests sent)
- **Verified Predecessor PR `#1759` Head:** `026ac4636eba782364eab46404dfcadd9414e9e0` (**exact-head CI Run `44873359129` GREEN** — `Static, constitutional, and release contracts`, `Offline Marrowline layout regression`, `Neon budget deployment ZIP startup`, and `Classify exact-head browser witness scope` all `success`)
- **Retained Deterministic Repair Ancestor:** `bc5467246f12b0598f89d681e4a4450c4733eace`
- **Immutable Historical Comparator:** `ffb98ac0050c99b07aef59ac3d200d8bee2e7e3a`
- **Preserved Preregistration:** [`../marrowline-screaming-grove-restoration-20261120/BOUNDED_PROVIDER_EXPERIMENT_PREREGISTRATION.md`](../marrowline-screaming-grove-restoration-20261120/BOUNDED_PROVIDER_EXPERIMENT_PREREGISTRATION.md) (no model substitution or amendment required)
- **Machine-Readable Preflight Artifact:** [`Q1_EFFECTIVE_REQUESTS_PREFLIGHT.json`](./Q1_EFFECTIVE_REQUESTS_PREFLIGHT.json)
- **Fail-Closed Dry-Run-Verified Harness:** [`run-q1-live-discriminator.mjs`](./run-q1-live-discriminator.mjs)

---

## 1. Live Provider Catalog Verification (Points 1–3 · Read-Only `GET`, `0` Paid Calls)

Executed one read-only metadata catalog query (`GET https://generativelanguage.googleapis.com/v1beta/models?pageSize=200`, HTTP `200`, zero generation tokens, using local `.env` `GEMINI_API_KEY` without exposing any credential):

- **Target Model Confirmed Callable:** **`models/gemini-3.8-flash`**
  - `thinking`: **`true`**
  - `inputTokenLimit`: **`1,048,576`**
  - `outputTokenLimit`: **`65,536`**
  - `supportedGenerationMethods`: `generateContent`, `countTokens`, `createCachedContent`, `batchGenerateContent`
- **Other Callable Frontier Models Observed (Not Substituted / Not Pooled):** `gemini-3.5-flash`, `gemini-3.6-flash`, `gemini-3.7-flash`, `gemini-3-flash-preview`, `gemini-4-argon` (`outLim: 32768`), `gemini-4-carbon`, `gemini-4-hydrogen`, `gemini-4-neon` (28 Gemini 3/4 catalog entries total).
- **Generation & Thinking Profile Verified (`GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE`):**
  - `maxOutputTokens`: **`65536`**
  - `thinkingConfig`: **`{ "thinkingLevel": "medium" }`** (matching Gemini 3+ `thinking_level` API specification; zero deprecated `thinking_budget`)
  - Identical `generationConfigSha256` across all 8 slots: `4785e46e91dfc32f5742dc9fc4ce7414142d62335c7a29e56c1e7e89a1d4ab34`.

---

## 2. Verified Effective Request Bodies, Digests & Aperture Routing (Points 4–6 & 9)

All 8 slots (`S01`–`S08`, counterbalanced A-C / C-A interleaved schedule: `4` Arm A + `4` Arm C = **`8` hard cap**) were assembled via the exact `api/khonapolit.js` pipeline (`buildInvocationPacket` → `classifyApertureDiscourseMode` → `buildApertureV3InvocationReceipt` → `buildGeminiRequest` → `withGeminiGenerationProfile` → `serializeGeminiRequest`) in `--dry-run` mode:

| Arm × Task | Aperture Primary Route / Discourse | System Bytes | Wire Bytes | `systemInstructionSha256` (prefix) | `contentsSha256` (prefix) | `bodySha256` | `modelAndBodySha256` (prefix) |
|---|---|---:|---:|---|---|---|---|
| **Arm A · T1 (`BLUE_ORANGE_WEATHER`)** | `OPEN_FIELD_CREATIVE_SYNTHESIS` / `CREATIVE` | `32,779` | `33,486` | `90421826b7c0` | `ba8299461d72` | `a3601b7bf598502b70e593491720751d5946c1c162b71cea8a31eb9d3f9b0293` | `68abd7fc57ef` |
| **Arm C · T1 (`BLUE_ORANGE_WEATHER`)** | `OPEN_FIELD_CREATIVE_SYNTHESIS` / `CREATIVE` | `32,658` | `33,365` | `6de6ae0c7ce2` | `ba8299461d72` *(identical)* | `cab2f10ed20ba154d9548ca96e70ebc0ad7e92204efe7cf00cfd9995a8cc64ae` | `83232498a73c` |
| **Arm A · T2 (`FORENSIC`)** | `REQUESTED_SYNTHESIS` / `GENERAL` | `33,528` | `34,435` | `4590ac8c73a6` | `23be3dd96f58` | `8c56a603c5820075138d8fb3dc4ce7f14e3198d47562cb5dc89e9b2f0dcab6a1` | `73fff3479de2` |
| **Arm C · T2 (`FORENSIC`)** | `REQUESTED_SYNTHESIS` / `GENERAL` | `33,407` | `34,314` | `745300c932a4` | `23be3dd96f58` *(identical)* | `dcab78f7758d663259804f211c3c693bd2dd09f0562f7c8372ad85f67c38e091` | `7224bbe8b503` |

- **Pure Controlled Isolation Verified:** Within each task, `contentsSha256`, `generationConfigSha256`, `model` (`gemini-3.8-flash`), and `aperture` routing are **100% byte-identical** between Arm A (`CURRENT_RESTORED_DEFAULT_PR1549`) and Arm C (`OCT02_DRAMATURGY_CANDIDATE_PR1545_RECONCILED`); **only** `systemInstruction` varies.
- **No Preregistration Drift:** `#1759` (`026ac4636`) preserved `bc5467246` runtime/Aperture/telemetry/policy-hold fixes intact (`CI Run 44873359129 GREEN`) without modifying Arm A or Arm C constructors. Candidate B remains a historical source comparator only (`0` live calls). Q2 multi-turn remains `HELD`.

---

## 3. Verified Gemini API Pricing & Monetary Exposure (Points 7–8)

Verified against official Google Gemini Developer API pricing (`ai.google.dev`) on `2026-11-21`:

- **`gemini-3.8-flash` Introductory Rate (active through December 31, 2026):**
  - Input: **`$0.75 / 1M` tokens** (`$0.075 / 1M` cached input)
  - Output **including thinking tokens** (billed at flat output rate): **`$3.75 / 1M` tokens**
- **`gemini-3.8-flash` Standard Rate (effective January 1, 2027, shown for conservative upper reference):**
  - Input: `$1.50 / 1M` tokens · Output (including thinking): `$7.50 / 1M` tokens
- **Honest Prompt-Token Refinement:** Exact assembled wire bytes across 8 slots total `271,200` UTF-8 bytes → conservative estimate **`~79,768` prompt tokens** (slightly higher than the earlier `~65,000` rough estimate in `BOUNDED_PROVIDER_EXPERIMENT_PREREGISTRATION.md`, still under `$0.06` total input cost).

| Cost Scenario (`8` Calls Max on `gemini-3.8-flash`) | Prompt Tokens | Output + Thinking Tokens | Input USD | Output + Thinking USD | **Total Estimated USD** |
|---|---:|---:|---:|---:|---:|
| **Expected Preregistered Budget (Nov 2026 intro rate)** | `79,768` | `40,000` | `$0.05983` | `$0.15000` | **`$0.21`** (`$0.20983`) |
| **Generous 2× Headroom Ceiling (Nov 2026 intro rate)** | `100,000` | `80,000` | `$0.07500` | `$0.30000` | **`$0.38`** (`$0.37500`) |
| **Standard 2027 Rate Upper Reference (if intro inapplicable)** | `79,768` | `40,000` | `$0.11965` | `$0.30000` | **`$0.42`** (`$0.41965`) |
| **Recommended Operator Authorization Ceiling** | Hard cap `8` calls | Hard cap `1` call/slot | — | — | **`$1.00 USD` hard cap** |

---

## 4. Hard Zero-Extra-Call Guarantee & Fail-Closed Guard (Point 10)

Standard `api/khonapolit.js` contains a 5-seat fallback cascade and `runStructuralRepair()`, which could trigger unregistered extra calls. Therefore `run-q1-live-discriminator.mjs` bypasses those cascades completely and enforces:
- **Hard call ceiling:** `HARD_MAX_CALLS = 8` (`1` single `streamGenerateContent?alt=sse` call per slot; `automatic_retries = 0`, `second_seat_fallbacks = 0`, `structural_repair_calls = 0`, `morphology_chasing_reruns = 0`).
- **Dual CLI Lock Verified:** Running `node run-q1-live-discriminator.mjs --execute-live` without an exact matching `--operator-auth-sha=<40-hex-head>` immediately exited with code **`2`** (`REFUSED_LIVE_EXECUTION`) and `0` network calls.
- **All 4 Preregistered Stop Rules Enforced:** Immediate `HELD` halt on (1) `modelVersion` mismatch, (2) any `PROHIBITED_CONTENT`/`SAFETY`/`RECITATION`/`BLOCKLIST`/`SPII`/`promptBlockReason` (raw SSE preserved verbatim without retry), (3) two consecutive `429`/`503` transport rejections or spending-cap error, or (4) any SSE-to-text reconstruction mismatch.

---

## 5. Exact Operator Authorization Statement Needed to Unlock Q1 Live Execution

To authorize execution of the **8-call Q1 study** (`Arm A` vs `Arm C` on `gemini-3.8-flash` `MEDIUM`, `Q2` still `HELD`), reply with an explicit Operator gesture matching the template below (referencing the exact Q1 preflight commit SHA reported in this turn):

```text
AUTHORIZE Q1 LIVE EXECUTION:
- Source HEAD SHA: <EXACT_Q1_PREFLIGHT_HEAD_SHA> (inheriting PR #1759 @ 026ac4636eba782364eab46404dfcadd9414e9e0)
- Model: gemini-3.8-flash (thinkingLevel: medium, maxOutputTokens: 65536)
- Design: Q1 ONLY (4 Arm A + 4 Arm C across T1 BLUE_ORANGE_WEATHER & T2 FORENSIC; Q2 remains HELD)
- Hard Call Ceiling: 8 paid provider calls maximum (1 call/slot, 0 retries, 0 fallbacks, 0 structural repair)
- Hard Spending Ceiling: $1.00 USD (estimated ~$0.21 at Nov 2026 intro rate / ~$0.38 at 2x headroom)
- Post-Acquisition: Full raw SSE + raw UTF-8 + Chrome visual packet + blinded 8-specimen Operator review; human artistic closure RESERVED; no merge/deploy.
```
