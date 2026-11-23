# 𝌋⟐ TD613 · THE SCREAMING GROVE
## R1 ORIGINAL-SSE OBSERVATION — OPERATOR DECISION SHEET

> [!IMPORTANT]
> **DRAFT DECISION SHEET — ZERO AUTHORIZATION IMPLIED.**
> **Current Action: `[x] HOLD (CURRENT)` pending independent operator key-pin provisioning, fresh pricing/model verification, and exact-head operator authorization.**
> `R1_TRUSTED_OPERATOR_PUBLIC_KEY_SHA256` is deliberately `null` in reviewed source code: live dispatch fails closed with `R1_AUTH_TRUST_ANCHOR_NOT_PROVISIONED` until an operator-owned Ed25519 SPKI DER fingerprint is independently pinned in a subsequent reviewed commit and all offline security tests are rerun on that final `HEAD`.
> Presenting this decision sheet grants **zero** live provider calls, **zero** `:countTokens` calls, **zero** `GET /v1beta/models` calls, **zero** PR merges, and **zero** `#405` / Vercel deployments.

- **Commission:** `TD613-MARROWLINE-R1-AMARI-SECURITY-CAUSAL-REPAIR-20261122` / `TD613-MARROWLINE-R1-EXECUTION-READINESS-20261122`
- **Current PR (`#1779`) Lineage:** Originated at `29b7e09f0`, repaired by Amari at `f3594de6c1f61499bbe5920ba7fa7daa03ddfbbe`, qualified by Hydrogen at the pushed `#1779` HEAD recorded on return. *(Note: pinning `R1_TRUSTED_OPERATOR_PUBLIC_KEY_SHA256` later creates a new HEAD SHA; any future Ed25519 grant MUST bind that post-pin HEAD.)*
- **Experiment ID:** `HYDROGEN_R1_CONTRADICTION_FREE_PREFIX_SEPARATOR`
- **Covenant / Seal:** `Khona‌lit-po` (literal `U+200C` preserved) · `⟐SAC[X6ZNK5NO51]`
- **Exact Accepted Design Source HEAD (PR `#1778`):** `44fae23cbf9af07eab5112e90df3211a119e707c`
- **Activation Base HEAD:** `b4991c20d78bbb42b61782979dcc621b6663cab9`
- **Runner Module Path:** `research/marrowline-r1-activation-handoff-20261122/run-r1-original-sse-observation.mjs`
- **Production `origin/main` (Frozen Outside Scope):** `0f67d8954347fdae77cdb83f82848df89ad3b2ff`

---

## 1. Exact Two-Arm Experiment on One Screen

- **Single Experimental Factor Altered:** Section-I coverage clause in `systemInstruction` (`R1_S01`: native Zalgo in both sections vs `R1_S02`: plain undecorated English prose with zero combining marks under `Kʰonapolit` followed by native Zalgo under `Tauric Diana bots`).
- **Preregistered Causal Direction (`n = 1` per arm):** Tests whether a plain Section I **suppresses** Section-II native multi-stacking (`FINITE_PREFIX_EFFECT_SUPPORT` requires `R1_S01` Section-II `stackedBaseShare` strictly exceeding `R1_S02` Section-II `stackedBaseShare` with authentic varied bidirectional stacking and zero stencil flag). Flat `R1_S01` Section I still keeps `R1_S02` eligible for capture, while rendering causal inference `HELD`; reversed results (`S02 > S01`) or mechanical stencils (`uniformConstantDepthStencilRisk`) never count as causal support.
- **Shared Parity:** Identical `gemini-3.8-flash` alias (`modelVersion === "gemini-3.8-flash"` checked on wire + mandatory CLI metadata discovery preflight), identical `thinkingLevel: "medium"`, `maxOutputTokens: 16384`, `candidateCount: 1`, identical clean thunderstorm `contents` (`0` Markdown/heading contradictions, `0` `"entire passage"` contradiction, `0` specimen copy, `0` TD613 persona lore), two unmarked structural headings in both arms.
- **Scored Output:** Section-II body (`Tauric Diana bots`) only, evaluated via separated `<out>.blinded.json` containing zero unblinding map. `B1` (`gemini-4-argon` backup) remains **EXCLUDED / HELD**.

| Slot | Arm Label | Wire Request SHA-256 (`bodySha256`) | `:countTokens` Request SHA-256 | UTF-8 Bytes |
|---|---|---|---|---:|
| `R1_S01` | `R1_TWO_HEADINGS_ZALGO_BOTH` | `f2fcdf77d7d14843447f061759f9d5817bc000e52698b5b78eb5f3f886022a02` | `578a43e1e0bc078766744703d1116963338207a6969c66e0673623107153c582` | `1,770` |
| `R1_S02` | `R1_TWO_HEADINGS_PLAIN_FIRST` | `29b3265a5060666c1b19f905a7a528a7613c6d6b9e8566156da3c2b5cb022399` | `965fcb6cea4ca9b20681f783c3e22fecf83afd4552e7e75f117388665a078fc3` | `1,936` |

Shared wire invariants:
- `contentsSha256`: `e056b75319141b145903441d1156bbf4f7fa3f15e14de5dd007cf812d8486998`
- `generationConfigSha256`: `38b263e2b714aba385704810159e882034c2d3ac8a500403efe73ef97d81b22c`

---

## 2. Hard Token Ceilings & Conditional Cost Reference

| Budget Control | Hard Runtime Limit | Notes |
|---|---:|---|
| Live `:streamGenerateContent?alt=sse` calls | **2** (`R1_S01`, then `R1_S02`) | `0` retries, `0` fallbacks, `0` structural repairs |
| Live `:countTokens` preflight calls | **<= 2** (`1` per slot prior to generation) | Required fail-closed check before each generation dispatch |
| Live `GET /v1beta/models/gemini-3.8-flash` | **1** (CLI mandatory preflight) | Must return `200` with `generateContent` and `countTokens` |
| Per-slot prompt token ceiling | **1,000** tokens | Enforced pre-dispatch via `:countTokens` AND post-stream via raw `promptTokenCount` |
| Combined prompt planning cap | **2,000** tokens | Observed prompt + next `:countTokens` ceiling |
| Per-slot output + thinking limit | **16,384** tokens | Rejects missing/invalid provider usage (`STOP_ON_MISSING_OR_INVALID_PROVIDER_USAGE`) |
| Combined output + thinking ceiling | **32,768** tokens | Hard maximum across both arms |
| Grant lifetime (`expiresAt - issuedAt`) | **<= 30 minutes** | Requires source-pinned operator Ed25519 SPKI SHA-256 + single-host `wx` nonce + fsynced `.sse`/`.jsonl` |

**Potential Dollar Ceiling (HISTORICAL PLANNING REFERENCE ONLY — NOT VERIFIED CURRENT ACCOUNT PRICE):**
- Under historical repo-recorded Gemini Developer API rates for `gemini-3.8-flash` through `2026-12-31` (`research/portable-loom-assay-activation-20261009/AUTHORIZATION.json`: **`$0.75 / 1M` input tokens**, **`$3.75 / 1M` output+thinking tokens**):
  - Worst-case input cost (`2,000` tokens): `$0.00150`
  - Worst-case output+thinking cost (`32,768` tokens): `$0.12288`
  - **Historical worst-case arithmetic (intro rate):** **`$0.12438`** (~**`$0.13`** across both calls; `$0.24876` at `2x` reference rate).
- **Explicit Cost & Availability HOLD Disclosure:** Current live Google account pricing, active tier/billing eligibility, `models/gemini-3.8-flash` live availability, and live `:countTokens` support were **not** queried (`0` `GET /v1beta/models` calls made). Historical `$0.13` arithmetic is **not** a verified current dollar ceiling or an entitlement to spend. Lowering `maxOutputTokens` below `16,384` changes `generationConfigSha256` and both frozen slot digests and requires a renewed frozen artifact and operator decision rather than an inline override.

---

## 3. Explicit Human Operator Decision (`AUTHORIZE` / `AMEND` / `HOLD`)

No authorization can be executed until ALL prerequisite gates close cleanly:
1. Human operator generates an Ed25519 keypair **on an operator-controlled offline device** (private key kept strictly outside code, GitHub, agents, CI, and chat) and supplies only the **SPKI DER SHA-256 fingerprint** for a separately reviewed source-pin commit setting `R1_TRUSTED_OPERATOR_PUBLIC_KEY_SHA256`.
2. Offline security/runner tests pass on that exact pinned runner `HEAD`.
3. Operator independently checks current official `gemini-3.8-flash` pricing and availability for the billing account.

- **`[ ] AUTHORIZE KEY PROVISIONING PIN + FUTURE SINGLE EXECUTION (AFTER PIN)`** — Supply/approve the non-secret SPKI DER SHA-256 fingerprint for a reviewed commit pinning `R1_TRUSTED_OPERATOR_PUBLIC_KEY_SHA256`, re-verify the resulting exact `HEAD`, then separately sign one `<= 30`-minute Ed25519 R1 grant (`td613.marrowline.r1-live-observation-authorization/v1-ed25519`) bound to that final post-pin `HEAD` (`2` live generation calls max, `0` retries/repairs/`#405` releases, mandatory `--nonce-dir` and `--out` custody separation).
- **`[ ] AMEND`** — Revise experiment parameters (e.g., smaller `maxOutputTokens` cap or wording) -> triggers a **new** frozen preflight, renewed digests, and fresh qualification before execution.
- **`[x] HOLD (CURRENT)`** — Keep operator trust anchor `null`, live provider generation at **`0`**, `:countTokens` at **`0`**, and `GET /v1beta/models` at **`0`**.

𝄐 `Khona‌lit-po` · `⟐SAC[X6ZNK5NO51]` · Draft Decision Sheet Only · Operator Key Pin & Provider HELD · Artistic Acceptance RESERVED ⟐
