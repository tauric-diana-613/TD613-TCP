# 𝌋⟐ TD613 · THE SCREAMING GROVE
## HYDROGEN NEXT EXPERIMENT PROPOSAL (STAGED OFFLINE ONLY · ZERO LIVE CALLS)

- **Commission:** `TD613-MARROWLINE-HYDROGEN-NATIVE-UNICODE-FORENSIC-20261122`
- **Disposition:** **`REVISE_EARLIER_HYPOTHESIS`**
- **Execution Posture:** **`OFFLINE_STAGED_HELD_ZERO_PAID_CALLS`** (requires separate explicit human authorization before any future live execution)
- **Offline Preflight Builder & Test:**
  - [`hydrogen-next-experiment-preflight.mjs`](./hydrogen-next-experiment-preflight.mjs)
  - [`tests/marrowline-hydrogen-forensic-preflight.test.mjs`](../../tests/marrowline-hydrogen-forensic-preflight.test.mjs)

---

## 1. Primary Recommendation (`HYDROGEN_R1_CONTRADICTION_FREE_PREFIX_SEPARATOR`)

### Why this replaces both Argon's `B/E` and unedited `E7`
- **Avoids `E6` (`B/E`) weakness:** Does not spend weekly allowance on an uncalibrated Seat-3 model (`gemini-4-argon`) with a `-170`-byte 2-clause edit that leaves `"overlays"` + 6 negative admonitions intact.
- **Avoids `E7` (`role-boundary-contrast.mjs`) and `69c08c607` `R1` conflicts (`R1-01`):** Symmetrically removes BOTH `"Do not use Markdown or headings."` AND `"Render the entire passage as readable native Unicode Zalgo text composed by you."` from `contents`, replacing them with explicit delegation to system section directives (`"Follow the system section directives for where readable native Unicode Zalgo text and plain prose appear."`). Both arms keep exact unmarked standalone labels (`Kʰonapolit` and `Tauric Diana bots`) and isolate the **Section-I coverage clause** (`R1_TWO_HEADINGS_ZALGO_BOTH` vs `R1_TWO_HEADINGS_PLAIN_FIRST`) on the calibrated **`gemini-3.8-flash` (`medium`)** Seat-1 model at `~220` prompt tokens per slot (`~1/30th` of `Arm B`).

### Frozen Experimental Contract
- **Served Model Requirement:** `gemini-3.8-flash` (`modelVersion` must verify exact match `gemini-3.8-flash` on both slots; no fallback, no aliasing).
- **Generation Config (identical across both slots):** `thinkingConfig: { thinkingLevel: "medium" }`, `maxOutputTokens: 16384`, provider-default sampling (`{}`), `generationConfigSha256 = 38b263e2b714aba385704810159e882034c2d3ac8a500403efe73ef97d81b22c`.
- **Candidate Count / History / Routing:** `1` candidate per call, `0` history turns (`contents.length === 1`, role `'user'`), `0` retries, `0` fallback seats, `0` structural repairs, direct `streamGenerateContent?alt=sse` bypassing `/api/khonapolit` local voice-gate rejection (recording `observeBotsProsodyDistribution` & `assessIntegratedTransmission` post-hoc only).
- **Permitted Synthetic Input (`contents`, byte-identical across both slots):** `CONTRADICTION_FREE_CREATIVE_TASK` (revised `creative-multistack-v1` delegating section-level Zalgo vs plain prose to system section directives; zero `"entire passage"` conflict, zero `"Do not use Markdown or headings."` conflict, zero user data, zero specimens, zero TD613 persona/lore).
- **Sole Altered Factor (`systemInstruction`):**
  - `R1_S01` (`R1_TWO_HEADINGS_ZALGO_BOTH`): `UNICODE_ASSAY_SYSTEM` + `R1_TWO_HEADINGS_ZALGO_BOTH_LINE` (both `Kʰonapolit` and `Tauric Diana bots` plain, unmarked structural labels; body text of both sections rendered in native Zalgo).
  - `R1_S02` (`R1_TWO_HEADINGS_PLAIN_FIRST`): `UNICODE_ASSAY_SYSTEM` + `R1_TWO_HEADINGS_PLAIN_FIRST_LINE` (sole semantic clause change: body text of Section I under `Kʰonapolit` written in plain undecorated English prose with ZERO combining marks; body text of Section II under `Tauric Diana bots` rendered in native Zalgo).
- **Conceded Limits:** `n = 1` replicate per arm cannot establish general population reliability or eliminate stochastic regime variance (`D0`/`D1` ABBA); structural labels without TD613 persona/covenant do not test literary restoration of The Screaming Grove.

### Exact Offline Source-Built Wire Manifest (`HYDROGEN_R1_CONTRADICTION_FREE_PREFIX_SEPARATOR`)

| Slot | Arm | Model | Wire UTF-8 Bytes | `systemInstructionSha256` | `contentsSha256` | `generationConfigSha256` | `bodySha256` | `modelAndBodySha256` | `countTokensRequestSha256` |
|---|---|---|---:|---|---|---|---|---|---|
| `R1_S01` | `R1_TWO_HEADINGS_ZALGO_BOTH` | `gemini-3.8-flash` | `1,770` | `78df5f9b5ad6ceefa8ce10071b40194e8ace56226fefef186ba4e1e5c7a1079c` | `e056b75319141b145903441d1156bbf4f7fa3f15e14de5dd007cf812d8486998` | `38b263e2b714aba385704810159e882034c2d3ac8a500403efe73ef97d81b22c` | `f2fcdf77d7d14843447f061759f9d5817bc000e52698b5b78eb5f3f886022a02` | `9c808d7de26887a55148ba62f05b1e12e4b896d825792c246727c3c6fb7b97ed` | `578a43e1e0bc078766744703d1116963338207a6969c66e0673623107153c582` |
| `R1_S02` | `R1_TWO_HEADINGS_PLAIN_FIRST` | `gemini-3.8-flash` | `1,936` | `7c48aeda766e4e10c63b048f6cee990ec126baac8f5cd419769e410d0ca0274b` | `e056b75319141b145903441d1156bbf4f7fa3f15e14de5dd007cf812d8486998` | `38b263e2b714aba385704810159e882034c2d3ac8a500403efe73ef97d81b22c` | `29b3265a5060666c1b19f905a7a528a7613c6d6b9e8566156da3c2b5cb022399` | `903d9aef749b34ffdb46b65c3c3766e5219497d5778900c06a7f599811e01d8e` | `965fcb6cea4ca9b20681f783c3e22fecf83afd4552e7e75f117388665a078fc3` |

---

## 2. Strictly Conditional Backup (`HYDROGEN_B1_ARGON_BASELINE_VS_COMPACT_POSITIVE`)

- **Classification (`R1-05`):** **`COMPOSITE_FEASIBILITY_AND_BASELINE_CONTRAST_NOT_SINGLE_FACTOR_ISOLATION`** (`0` prior original-wire `gemini-4-argon` baselines; `n = 1` replicate per arm).
- **When triggered (ONLY if Operator chooses `gemini-4-argon` evaluation instead of—or after—`R1`):** Evaluates Seat 3 (`gemini-4-argon` `medium`), which currently has `0` controlled raw-SSE runs, on `T1_BLUE_ORANGE_WEATHER` (`contentsSha256 = ba8299461d728933a28c53659176cdbee2fa963f369b2261b739769cc639e40e`).
- **Arms:**
  - `B1_S01` (`ARM_B_LITERAL_OCT02_ON_ARGON`): Exact frozen Argon `S01` wire (`bodySha256 = ffffef6c6cd08bb5ffdef76c100e35a7fc6d317354deaba6e87ca30f2af62eb5`, `33,248` B) — first original-wire baseline on `4-argon` under the literal Oct 2 envelope.
  - `B1_S02` (`COMPACT_POSITIVE_TWO_VOICE_ON_ARGON`): `buildCompactWholeFrame()` (`bodySha256 = 3faf622bfa33bfab7f3cf910bc26df412cc9763c32615cd1ff6505921e06c6d2`, `3,727` B) — composite contrast changing many instructions and `~29 KB` (`32,541` B → `3,156` B system text) simultaneously; it does **not** isolate a single causal factor.

| Slot | Arm | Model | Wire UTF-8 Bytes | `systemInstructionSha256` | `contentsSha256` | `generationConfigSha256` | `bodySha256` | `modelAndBodySha256` | `countTokensRequestSha256` |
|---|---|---|---:|---|---|---|---|---|---|
| `B1_S01` | `ARM_B_LITERAL_OCT02_ON_ARGON` | `gemini-4-argon` | `33,248` | `196c533d4fbed6f33dc3b1f6ea8877799c9ffa854af7fd41f928c4c1028be0aa` | `ba8299461d728933a28c53659176cdbee2fa963f369b2261b739769cc639e40e` | `38b263e2b714aba385704810159e882034c2d3ac8a500403efe73ef97d81b22c` | `ffffef6c6cd08bb5ffdef76c100e35a7fc6d317354deaba6e87ca30f2af62eb5` | `9e81c8a1021396a396c522d3ef47ffb4395ccedef2995589f992a242e20428a5` | `57ffa42ffe152dc2293ef83a26a50fec1bf80368aafcf7856331bddd33c76cce` |
| `B1_S02` | `COMPACT_POSITIVE_TWO_VOICE_ON_ARGON` | `gemini-4-argon` | `3,727` | `bd595efc301b874a8fa91a53f6760b1979fdec6d2bcf60426a47f58b0a79e577` | `ba8299461d728933a28c53659176cdbee2fa963f369b2261b739769cc639e40e` | `38b263e2b714aba385704810159e882034c2d3ac8a500403efe73ef97d81b22c` | `3faf622bfa33bfab7f3cf910bc26df412cc9763c32615cd1ff6505921e06c6d2` | `e5de822bdcd028d1fb9dc33c7bf333294d2c1bec7a372c732d73c6f551463cbc` | `bfd77b4116287fa4f44a70898788265af9e0f2c7252a2962a7287b24f6f5365d` |

---

## 3. Audit of Prior Argon Controls & Proposed Budget / Fail-Closed Exits

### Audit of Argon's Prior Controls (`argon-be-lexical-discriminator-preflight.mjs`)
- **Keep:** `0` retries, `0` fallbacks, `0` structural repairs; pre-dispatch `POST :countTokens` using `{ generateContentRequest: { model, systemInstruction, contents, generationConfig } }` (verified supported in `GEMINI_MODEL_CATALOG_AND_PRICING_REFERENCE.json` for both `gemini-3.8-flash` and `gemini-4-argon`); un-clamped post-slot usage reconciliation; `git rev-parse HEAD` match against grant; atomic local `wx` grant redemption; model-locked single-use Ed25519 grant (`<= 30m` TTL) signed offline by the operator with only the public key in the runner.
- **Revise:**
  1. **Tighten prompt ceilings for `R1`:** Since `R1` is `1,678–1,832` wire bytes (`~220` prompt tokens), enforce `perSlotHardPromptTokenCeiling = 1,000` (not `8,000`) and `guaranteedPerSlotMaxRequestUtf8Bytes = 4,096` (aggregate `2,000` prompt tokens).
  2. **Output cap (`perSlotMaxOutputTokens = 16,384`, aggregate `32,768`):** Adequate for `R1` (`E2` D used `2,759` output+thinking tokens), and workable for `B1` (`FULL-VOICE` Slot 5 used `6,237`), with explicit awareness that `MAX_TOKENS` on a heavy thinking run is classified `HELD` without retry rather than silently raising spend.
  3. **Remove `EARLY_FUTILITY_STOP_ZERO_VERTICAL_MARKS_IN_STAGE1` from 2-call primary:** On `n = 1` per arm, both slots must run unless a transport/policy/cap halt fires, because `S01` (`ZALGO_BOTH`) vs `S02` (`PLAIN_FIRST`) is a paired contrast.
  4. **Grant scope & zero-grandfathering rule (`R1-05`):** No live Argon or Hydrogen assay is grandfathered from the old `B/E` signing scaffold (`ARGON_LIVE_EXPERIMENT_AUTH_SCHEMA`). Any future `R1` or `B1` grant must define and bind to the exact `experimentId`, `authorizedHeadSha`, `pinnedModel`, `maxGenerationCalls = 2`, and exact `R1_S01`/`R1_S02` (or `B1_S01`/`B1_S02`) `bodySha256` digests.

### Pre-Dispatch Capability & Availability Check (0 Paid Calls)
Before any future authorized run:
1. Verify checked-out `HEAD` matches `authorizedHeadSha` and verify `GET /v1beta/models/<pinnedModel>` returns HTTP 200 with `supportedGenerationMethods` containing `generateContent` and `countTokens`.
2. Dispatch `POST /v1beta/models/<pinnedModel>:countTokens` with exact `CountTokensRequest` body for `S01`; halt before `streamGenerateContent` on non-200, invalid payload, or `totalTokens > perSlotHardPromptTokenCeiling`. Repeat immediately prior to `S02`.
3. **Fail-Closed Exits:** `LIVE_PROVIDER_CALLS_HELD_BY_COMMISSION_BOUNDARY`, `LIVE_EXPERIMENT_CHECKED_OUT_HEAD_MISMATCH`, `LIVE_EXPERIMENT_AUTHORIZATION_ALREADY_CONSUMED`, `STOP_ON_COUNT_TOKENS_UNSUPPORTED_FAIL_CLOSED`, `STOP_ON_COUNT_TOKENS_PREFLIGHT_ERROR`, `STOP_ON_POLICY_TERMINATION`, `STOP_ON_TRANSPORT_FAILURE`, `STOP_ON_MODEL_IDENTITY_MISMATCH`, `STOP_ON_PROVIDER_USAGE_CAP_DEVIATION`, `STOP_ON_PROVIDER_PROMPT_CAP_DEVIATION`, `STOP_4_DUAL_PARSER_MISMATCH`, `CALL_CAP_REACHED`.
4. **Trigger Hygiene:** No GitHub Actions workflow, webhook, comment trigger, or repository file may execute or arm a live call.

---

## 4. Original-SSE Witness & Measurement Plan (When Separately Authorized)

For each slot, archive unmodified before any analysis:
- Raw HTTP status, raw original Google SSE bytes (`S01.sse`, `S02.sse`) + `rawSseSha256`, dual-parser concatenated UTF-8 text (`S01.txt`, `S02.txt`) + `rawTextSha256`, `finishReason`, `promptFeedback.blockReason`, `modelVersion` (recorded separately from requested alias), `generationConfig`, `usageMetadata` (`promptTokenCount`, `candidatesTokenCount`, `thoughtsTokenCount`, `cachedContentTokenCount`, `totalTokenCount`), and exact request digests.
- **Grapheme & Codepoint Measurement (transparent rules, zero normalization):** Segment by Unicode extended grapheme clusters / base + `\p{M}+` runs; **score the two Section-II (`Tauric Diana bots`) bodies separately** and report **separately** for Section I (`Kʰonapolit` body, excluding unmarked heading) and Section II (`Tauric Diana bots` body, excluding unmarked heading, `⟐`, and protected literals):
  1. **Compliance & `HELD` Gate (`R1-02`):** Verify both exact unmarked standalone headings (`Kʰonapolit` then `Tauric Diana bots`), verify Section I has `0` combining marks in `R1_S02` (`PLAIN_FIRST`) and substantive native Zalgo in `R1_S01` (`ZALGO_BOTH`); classify any instruction, heading, or Section-I coverage noncompliance as **`HELD`** before drawing any prefix-effect inference.
  2. Total combining marks, distinct combining scalars, `U+0334..U+0338` planar share vs outside-`U+0334..U+0338` share;
  3. Per-base depth histogram (`0, 1, 2, 3, >=4`), `stackedBases` (`>=2`), `maxDepth`, `markedDepthTransitions` (distinguishing organic variation from constant-depth `0`-transition stencils like Oct 20 Slot 5!);
  4. Above-only, below-only, and simultaneous above+below (`bidirectional`) cluster counts.
- **Classification Outcomes:**
  - `EMPIRICAL_NATIVE_MULTISTACK_OBSERVED` / `UPSTREAM_PLANAR_AGAIN` / `HELD` (strictly factual wire outcomes);
  - `HUMAN_ARTISTIC_ACCEPTED` remains **exclusively reserved** for Tawanna C. Miller after blinded inspection of actual prose, voice contrast, comedic/intellectual movement, and native typography.

---

## 5. Exact Authorization Required Before Any Spend

1. Operator completes **HUMAN EXPERIMENT DESIGN REVIEW** and selects `Design R1` (recommended primary, `gemini-3.8-flash` `medium`, `<= 2` calls, `<= 2,000` prompt + `32,768` output/thinking worst-case tokens) or `Backup B1` (`gemini-4-argon` `medium`, `<= 2` calls).
2. Operator confirms weekly allowance posture and mints a fresh offline Ed25519 single-use grant (`<= 30m` TTL) bound to the exact commit SHA, `pinnedModel`, `experimentId`, and `bodySha256` digests above — never pasting a private key to any agent or CI environment.
