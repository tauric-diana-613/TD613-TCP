# 𝌋⟐ TD613 · THE SCREAMING GROVE
## R1 ORIGINAL-SSE OBSERVATION — OPERATOR DECISION SHEET

> [!IMPORTANT]
> **DRAFT DECISION SHEET — ZERO AUTHORIZATION IMPLIED.**
> **Amari re-review supersedes the earlier READY label: current action = HOLD pending verification of the corrected runner and independent operator-key trust pin.** The originally stated ~$0.13 ceiling uses historical repository rates rather than verified current account pricing.
> Presenting this decision sheet grants **zero** live provider calls, **zero** `:countTokens` calls, **zero** `GET /v1beta/models` calls, **zero** PR merges, and **zero** `#405` / Vercel deployments. Execution requires a separate explicit human gesture and an offline-signed Ed25519 grant bound to the final pushed runner `HEAD`.

- **Commission:** `TD613-MARROWLINE-R1-EXECUTION-READINESS-20261122`
- **Corrected runner:** PR #1779 successor source commits after `29b7e09`; HEAD MUST be reverified after all changes, then all offline tests independently run. Live trust anchor currently `null` and deliberately fails closed.
- **Experiment ID:** `HYDROGEN_R1_CONTRADICTION_FREE_PREFIX_SEPARATOR`
- **Covenant / Seal:** `Khona‌lit-po` (literal `U+200C` preserved) · `⟐SAC[X6ZNK5NO51]`
- **Exact Accepted Design Source HEAD (PR `#1778`):** `44fae23cbf9af07eab5112e90df3211a119e707c`
- **Activation Base HEAD:** `b4991c20d78bbb42b61782979dcc621b6663cab9`
- **Runner Module Path:** `research/marrowline-r1-activation-handoff-20261122/run-r1-original-sse-observation.mjs`
- **Production `origin/main` (Frozen Outside Scope):** `0f67d8954347fdae77cdb83f82848df89ad3b2ff`

---

## 1. Exact Two-Arm Experiment on One Screen

- **Single Experimental Factor Altered:** Section-I coverage clause in `systemInstruction` (`R1_S01`: native Zalgo in both sections vs `R1_S02`: plain undecorated English prose with zero combining marks under `Kʰonapolit` followed by native Zalgo under `Tauric Diana bots`).
- **Shared Parity:** Identical `gemini-3.8-flash` alias, identical `thinkingLevel: "medium"`, `maxOutputTokens: 16384`, `candidateCount: 1`, identical clean thunderstorm `contents` (`0` Markdown/heading contradictions, `0` `"entire passage"` contradiction, `0` specimen copy, `0` TD613 persona lore), two unmarked structural headings in both arms.
- **Scored Output:** Section-II body (`Tauric Diana bots`) only; Section I supplies the prefix coverage manipulation and compliance check. `B1` (`gemini-4-argon` backup) remains **EXCLUDED / HELD**.

| Slot | Arm Label | Wire Request SHA-256 (`bodySha256`) | `:countTokens` Request SHA-256 | UTF-8 Bytes |
|---|---|---|---|---:|
| `R1_S01` | `R1_TWO_HEADINGS_ZALGO_BOTH` | `f2fcdf77d7d14843447f061759f9d5817bc000e52698b5b78eb5f3f886022a02` | `578a43e1e0bc078766744703d1116963338207a6969c66e0673623107153c582` | `1,770` |
| `R1_S02` | `R1_TWO_HEADINGS_PLAIN_FIRST` | `29b3265a5060666c1b19f905a7a528a7613c6d6b9e8566156da3c2b5cb022399` | `965fcb6cea4ca9b20681f783c3e22fecf83afd4552e7e75f117388665a078fc3` | `1,936` |

Shared wire invariants:
- `contentsSha256`: `e056b75319141b145903441d1156bbf4f7fa3f15e14de5dd007cf812d8486998`
- `generationConfigSha256`: `38b263e2b714aba385704810159e882034c2d3ac8a500403efe73ef97d81b22c`

---

## 2. Hard Token Ceilings & Descriptive Cost Arithmetic

| Budget Control | Hard Runtime Limit | Notes |
|---|---:|---|
| Live `:streamGenerateContent?alt=sse` calls | **2** (`R1_S01`, then `R1_S02`) | `0` retries, `0` fallbacks, `0` structural repairs |
| Live `:countTokens` preflight calls | **<= 2** (`1` per slot prior to generation) | Required fail-closed check before each generation dispatch |
| Per-slot prompt token ceiling | **1,000** tokens | Un-clamped; fails closed if `:countTokens` > 1,000 |
| Combined prompt planning cap | **2,000** tokens | Observed prompt + next `:countTokens` ceiling |
| Per-slot output + thinking limit | **16,384** tokens | Request `maxOutputTokens` ceiling (observed usage expected lower) |
| Combined output + thinking ceiling | **32,768** tokens | Hard maximum across both arms |
| Grant lifetime (`expiresAt - issuedAt`) | **<= 30 minutes** | Single-host `wx` nonce claim; bound to checked-out runner `HEAD` |

**Potential Dollar Ceiling (HISTORICAL PLANNING REFERENCE, NOT VERIFIED CURRENT ACCOUNT PRICE):**
- Under previously repo-verified Google Gemini Developer API rates for `gemini-3.8-flash` valid through `2026-12-31` (`research/portable-loom-assay-activation-20261009/AUTHORIZATION.json`: **`$0.75 / 1M` input tokens**, **`$3.75 / 1M` output+thinking tokens**):
  - Worst-case input cost (`2,000` tokens): `$0.00150`
  - Worst-case output+thinking cost (`32,768` tokens): `$0.12288`
  - **Worst-case total planning ceiling (intro rate):** **`$0.12438`** (~**`$0.13`** across both calls; `$0.24876` if evaluated at `2x` non-intro reference rates).
- **Explicit Pre-Execution Disclosure:** Live account-specific billable rates, current `models/gemini-3.8-flash` availability, and live `:countTokens` availability were **not** queried during this zero-network preparation commission (`0` `GET /v1beta/models` calls made). Independently verify live availability and current account rates before executing. Lowering `maxOutputTokens` below `16,384` changes `generationConfigSha256` and both frozen slot digests and therefore requires a renewed frozen artifact and operator decision rather than an inline override.

---

## 3. Explicit Human Operator Decision (`AUTHORIZE` / `AMEND` / `HOLD`)

Select exactly one course in a separate explicit operator instruction **only after** an independently human-owned signing key is provisioned and its SPKI DER fingerprint pinned in reviewed source, the resulting runner HEAD has passed new focused offline tests, and current official account pricing/endpoint availability have been verified. The previous authorization template is INFORMATIONAL and not yet executable:

- **`[ ] AUTHORIZE`** — Only after closing the presently outstanding operator key-pin, fresh runner tests and live pricing/model-availability gates, proceed with preparing/signing a `<= 30`-minute Ed25519 R1 authorization grant (`td613.marrowline.r1-live-observation-authorization/v1-ed25519`) bound to the final verified runner `HEAD` SHA, capped at `2` live `gemini-3.8-flash` generation calls and `32,768` combined output+thinking tokens under `$0.13` worst-case intro planning arithmetic (`0` retries, `0` repairs, `0` `#405` releases), and collect raw SSE evidence for blinded adjudication.
- **`[ ] AMEND`** — Revise experiment parameters (e.g., smaller `maxOutputTokens` cap, metadata discovery check flag, or updated wording) -> triggers a **new** frozen preflight, renewed digests, and fresh qualification before execution.
- **`[x] HOLD (CURRENT)`** — Keep all live provider generation, `:countTokens`, and model discovery calls at **`0`**; hold `R1` for further offline engineering, account pricing verification, or physical-device UI inspection first.

𝄐 `Khona‌lit-po` · `⟐SAC[X6ZNK5NO51]` · Draft Decision Sheet Only · Provider HELD · Artistic Acceptance RESERVED ⟐
