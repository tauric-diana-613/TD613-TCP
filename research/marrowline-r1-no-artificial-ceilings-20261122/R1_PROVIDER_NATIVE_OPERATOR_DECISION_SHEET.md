# 𝌋⟐ TD613 · THE SCREAMING GROVE
## R1 PROVIDER-NATIVE OBSERVATION — OPERATOR DECISION SHEET

> [!IMPORTANT]
> **DRAFT DECISION SHEET — PUBLIC TRUST ANCHOR PINNED · NO GRANT SIGNED · PROVIDER CALLS HELD.**
> Resource policy override applied: **TD613 imposes ZERO caps on tokens, USD spending, attempts, repetitions, retries, duration, or SSE byte size.**
> Operator-attested public trust anchor `R1_NATIVE_TRUSTED_OPERATOR_PUBLIC_KEY_SHA256` is now pinned in source (`840a71625f4b9db224871bbb126b6debc3fefdc9179b5628bd9faf514f2c7701`; private key and passphrase remain strictly under offline human custody, with no private ceremony observed).
> Live execution remains **HELD** until: (1) offline verification & exact-head CI pass on the pinned commit `HEAD`, (2) the pre-execution `GenerationConfig` default vs. full `outputTokenLimit` decision below is confirmed (`HOLD` / keep omitted vs. `AMEND_CONFIG`), and (3) you independently sign an active-session grant bound to that final `HEAD`.

- **Commission:** `TD613-MARROWLINE-R1-HUMAN-TRUST-ANCHOR-PIN-20261123` (pinning `TD613-MARROWLINE-R1-NO-ARTIFICIAL-CEILINGS-20261122`)
- **Experiment ID:** `HYDROGEN_R1_PROVIDER_NATIVE_UNCAPPED`
- **Covenant / Seal:** `Khona‌lit-po` (literal `U+200C` preserved) · `⟐SAC[X6ZNK5NO51]`
- **Historical Superseded Sources (Preserved Untouched):** Production `origin/main` (`0f67d8954347fdae77cdb83f82848df89ad3b2ff`), PR `#1778` (`44fae23cbf9af07eab5112e90df3211a119e707c`), PR `#1779` (`675d6d0388220f63162931003c998d0084d3e68e`)
- **Successor Executable:** `research/marrowline-r1-no-artificial-ceilings-20261122/run-r1-provider-native-observation.mjs`

---

## 1. Exact Provider-Native Wire Configuration (Zero Artificial Caps)

- **Experimental Contrast:** `R1_NATIVE_A` (native Zalgo in both sections) vs `R1_NATIVE_B` (plain undecorated `Kʰonapolit` Section I with 0 combining marks, native Zalgo `Tauric Diana bots` Section II). Same task, headings, model (`gemini-3.8-flash`), `thinkingLevel: "medium"`, provider-default sampling, and **omitted `maxOutputTokens`** (`generationConfigSha256: 425eee5014c42dcb66bb7553a9381935f97bb4eb87f61d335f9bfca6dc6fead5`).
- **Repetition / Attempts:** Paired A/B unit (`A_THEN_B` or preregistered `B_THEN_A`); **unbounded** number of operator-authorized repetitions; all attempts retained in the denominator; blinded Section-II sidecars isolated from condition labels.

| Condition | Wire Request SHA-256 (`bodySha256`) | `:countTokens` SHA-256 | UTF-8 Bytes | Client `maxOutputTokens` |
|---|---|---|---:|---|
| `R1_NATIVE_A` | `b4e1e7598fe1ff38221e47be3e63492e6fa7890d910df12f8d870b2bbadef46f` | `dc67f8f279f647b47e30c39c87b14df0348770944802e1313465faf4f360c330` | `1,746` | **None (omitted)** |
| `R1_NATIVE_B` | `257be8467d5d827e8ac1a20f29beb56f1627f4603a84c9ccfdcbaadeb14e51f6` | `e34cbd9ab2bde2e505deb03744029a11411cb5ee357289a285e7ccd957a646b9` | `1,912` | **None (omitted)** |

---

## 2. Factual Provider Context (Disclosure Only — NOT Stopping Caps)

- **TD613 Code Limits Imposed:** **None** (`0` token ceilings, `0` USD spend caps, `0` call/attempt quotas, `0` duration timeouts, `0` SSE capture byte ceilings).
- **External Provider Reality (Non-Zero Unqueried Externals):**
  - During this offline commission (`0` `GET /v1beta/models` calls made), live availability of `models/gemini-3.8-flash`, live `:countTokens`, account tier rate limits (`RPM`/`TPM`/`RPD`), and current official Google billing prices were **not** polled.
  - Prior repo-archived `AUTHORIZATION.json` (`2026-10-09`) recorded Gemini Developer API intro pricing for `gemini-3.8-flash` (`$0.75 / 1M` input, `$3.75 / 1M` output+thinking through `2026-12-31`), and prior `outputTokenLimit` was `65,536` — both are informational historical context only and **neither is a TD613 stop condition or verified current account rate**.
  - **Provider Default vs. `outputTokenLimit` (`GenerationConfig` Note):** Per official Google `GenerationConfig` documentation, omitting `maxOutputTokens` causes the Gemini API to apply a **model-dependent default** output limit rather than guaranteeing the model's maximum `outputTokenLimit` (`65,536` in historical records). During future authorized live observation (`GET /v1beta/models/gemini-3.8-flash` + `:streamGenerateContent`), inspect whether omitting `maxOutputTokens` hits a lower provider default than `outputTokenLimit`; if explicit `maxOutputTokens = <verified official outputTokenLimit>` is needed, select `[ ] AMEND_CONFIG` below so a separate re-hashed wire manifest is reviewed rather than mutating hashes unreviewed.
- **Revocable Session Control & Non-2XX Custody:** Active runs continue until requested episodes finish, a wire/custody failure occurs, or you trigger manual STOP (`SIGINT`/`SIGTERM` or `AbortSignal`) or update `--revocation-file` (monitored live during open SSE streams to abort mid-flight and fsync partial `.sse` bytes under `STOP_ON_OPERATOR_SESSION_REVOKED_OR_STOPPED`). Any non-2xx HTTP response also preserves exact unmodified error bytes and headers on disk (`.http-error.body` + `.http-error.meta.json`).

---

## 3. Explicit Human Operator Decisions Required Next

1. **Public Trust-Anchor Pin (`COMPLETED — OPERATOR-ATTESTED`):** `R1_NATIVE_TRUSTED_OPERATOR_PUBLIC_KEY_SHA256 = '840a71625f4b9db224871bbb126b6debc3fefdc9179b5628bd9faf514f2c7701'` (operator-supplied non-secret SPKI DER SHA-256 fingerprint; private key and passphrase remain strictly under offline human custody outside code, GitHub, agents, CI, and chat).
2. **Choose Pre-Execution Action:**
   - **`[ ] ISSUE_HEAD_BOUND_GRANT`** — Once offline verification & exact-head CI confirm the final pinned `HEAD` (and if omitted `maxOutputTokens` is retained pending live inspection), sign an active ceiling-free `td613.marrowline.r1-provider-native-authorization/v1-ed25519` grant bound to that exact `HEAD`.
   - **`[ ] AMEND_CONFIG`** — Request setting explicit `maxOutputTokens` to a separately verified official provider `outputTokenLimit` (avoiding model-dependent omitted default) or revising episode design -> regenerates and re-reviews manifests before signing.
   - **`[x] HOLD (CURRENT)`** — Keep pinned public trust anchor only, zero active grants signed, live generation at **`0`**, `:countTokens` at **`0`**, and `GET /v1beta/models` at **`0`**.

- **Human Artistic Acceptance:** Strictly **`RESERVED_HUMAN_ONLY`** (automated runs never award Grove restoration).

𝄐 `Khona‌lit-po` · `⟐SAC[X6ZNK5NO51]` · Zero Artificial Ceilings · Provider Calls HELD · Artistic Authority RESERVED ⟐
