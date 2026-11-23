# 𝌋⟐ TD613 · THE SCREAMING GROVE
## R1 PROVIDER-NATIVE OBSERVATION — OPERATOR DECISION SHEET

> [!IMPORTANT]
> **DRAFT DECISION SHEET (`AMEND_CONFIG: 65,536`) — PUBLIC TRUST ANCHOR PINNED · NO GRANT SIGNED · PROVIDER CALLS HELD.**
> Resource policy preserved: **TD613 imposes ZERO artificial caps on tokens, USD spending, attempts, repetitions, retries, duration, or SSE byte size.**
> Operator-attested public trust anchor `R1_NATIVE_TRUSTED_OPERATOR_PUBLIC_KEY_SHA256` is pinned in source (`840a71625f4b9db224871bbb126b6debc3fefdc9179b5628bd9faf514f2c7701`; private key and passphrase remain strictly under offline human custody).
> Under **`AMEND_CONFIG`**, `generationConfig.maxOutputTokens` is explicitly set to the **official Gemini 3.8 Flash published output capacity (`65,536` tokens)** so Google's API cannot silently substitute a lower model-dependent omitted default. Live execution remains **HELD** until offline verification & exact-head CI pass and you approve this configuration and independently sign a `v2-ed25519` grant bound to that final `HEAD`.

- **Commission:** `TD613-MARROWLINE-R1-NO-ARTIFICIAL-CEILINGS-20261122` (`AMEND_CONFIG`: official `65,536` provider output capacity)
- **Experiment ID:** `HYDROGEN_R1_PROVIDER_NATIVE_UNCAPPED` (`td613.marrowline.r1-provider-native-authorization/v2-ed25519`)
- **Covenant / Seal:** `Khona‌lit-po` (literal `U+200C` preserved) · `⟐SAC[X6ZNK5NO51]`
- **Historical Superseded Sources (Preserved Untouched):** Production `origin/main` (`0f67d8954347fdae77cdb83f82848df89ad3b2ff`), PR `#1778` (`44fae23cbf9af07eab5112e90df3211a119e707c`), PR `#1779` (`675d6d0388220f63162931003c998d0084d3e68e`), Prior PR `#1780` Omitted-Default Baseline (`56189bbf1d2d6f623d5d852447e580beee3cfa8a`)
- **Successor Executable:** `research/marrowline-r1-no-artificial-ceilings-20261122/run-r1-provider-native-observation.mjs`

---

## 1. Exact Provider-Native Wire Configuration (`AMEND_CONFIG`: Published `65,536` Capacity)

- **Experimental Contrast:** `R1_NATIVE_A` (native Zalgo in both sections) vs `R1_NATIVE_B` (plain undecorated `Kʰonapolit` Section I with 0 combining marks, native Zalgo `Tauric Diana bots` Section II). Same task, headings, model (`gemini-3.8-flash`), `thinkingLevel: "medium"`, provider-default sampling, and **explicit provider-published capacity `maxOutputTokens: 65536`** (`generationConfigSha256: 4785e46e91dfc32f5742dc9fc4ce7414142d62335c7a29e56c1e7e89a1d4ab34`).
- **Repetition / Attempts:** Paired A/B unit (`A_THEN_B` or preregistered `B_THEN_A`); **unbounded** number of operator-authorized repetitions; all attempts retained in the denominator; blinded Section-II sidecars isolated from condition labels.

| Condition | Wire Request SHA-256 (`bodySha256`) | `:countTokens` SHA-256 | UTF-8 Bytes | `generationConfig.maxOutputTokens` |
|---|---|---|---:|---|
| `R1_NATIVE_A` | `eec7a1a36b042f410e2c7eb9cd914cfd10ba529b59df556120cb061b298bac8d` | `5a721fc5a7565b2ae7a29da4635b3f884ee0c5b38b1880b81a0148175cf397f5` | `1,770` | **`65,536` (Provider Capacity)** |
| `R1_NATIVE_B` | `b4a0ce028a96bcc6a971d68bcb5eaa2f8e6118d3bbfa6c60a33bdd8c05a60e85` | `670efc88dd98a2b50dbe92f4c6a37f6363a74522569fdaa34fc6ccdae8c6e64c` | `1,936` | **`65,536` (Provider Capacity)** |

- **Exact Delta vs. Superseded Omitted-Default Baseline (`56189bbf1d2d6f623d5d852447e580beee3cfa8a`):** `systemInstructionSha256` (`78df5f9b...`, `7c48aeda...`) and `contentsSha256` (`e056b753...`) remain **100% identical**. Only `generationConfig` changed from `{"thinkingConfig":{"thinkingLevel":"medium"}}` (`425eee50...`) to `{"maxOutputTokens":65536,"thinkingConfig":{"thinkingLevel":"medium"}}` (`4785e46e...`, `+24` UTF-8 bytes per body). Legacy omitted-default (`b4e1e759...`, `257be846...`, `v1-ed25519`) and bounded (`f2fcdf77...`, `29b3265a...`) grants/digests are explicitly rejected.

---

## 2. Factual Provider Context (Disclosure Only — NOT Stopping Caps)

- **TD613 Code Limits Imposed:** **None** (`0` artificial token budgets, `0` USD spend caps, `0` call/attempt quotas, `0` duration timeouts, `0` SSE capture byte ceilings). Setting `maxOutputTokens: 65536` matches Gemini 3.8 Flash's published `outputTokenLimit`, not an artificial research ceiling.
- **External Provider Reality (Non-Zero Unqueried Externals):**
  - During this offline commission (`0` `GET /v1beta/models` calls made), live availability of `models/gemini-3.8-flash`, live `outputTokenLimit` confirmation, live `:countTokens`, account tier rate limits (`RPM`/`TPM`/`RPD`), and current official Google billing prices were **not** polled. At live startup, compulsory `GET /v1beta/models/gemini-3.8-flash` verifies `outputTokenLimit` (`STOP_ON_PROVIDER_CAPACITY_MISMATCH` if live metadata deviates from `65,536`).
  - Prior repo-archived `AUTHORIZATION.json` (`2026-10-09`) recorded Gemini Developer API intro pricing for `gemini-3.8-flash` (`$0.75 / 1M` input, `$3.75 / 1M` output+thinking through `2026-12-31`), and `outputTokenLimit = 65,536` (`KHONAPOLIT_INTERACTIVE_MAX_OUTPUT_TOKENS`). Historical rates are context only and **never a TD613 spend limit**.
- **Revocable Session Control & Non-2XX Custody:** Active runs continue until requested episodes finish, a wire/custody failure occurs, or you trigger manual STOP (`SIGINT`/`SIGTERM` or `AbortSignal`) or update `--revocation-file` (monitored live during open SSE streams to abort mid-flight and fsync partial `.sse` bytes under `STOP_ON_OPERATOR_SESSION_REVOKED_OR_STOPPED`). Any non-2xx HTTP response also preserves exact unmodified error bytes and headers on disk (`.http-error.body` + `.http-error.meta.json`).

---

## 3. Explicit Human Operator Decisions Required Next

1. **Public Trust-Anchor Pin (`COMPLETED — OPERATOR-ATTESTED`):** `R1_NATIVE_TRUSTED_OPERATOR_PUBLIC_KEY_SHA256 = '840a71625f4b9db224871bbb126b6debc3fefdc9179b5628bd9faf514f2c7701'` (operator-supplied non-secret SPKI DER SHA-256 fingerprint; private key and passphrase remain strictly under offline human custody outside code, GitHub, agents, CI, and chat).
2. **Choose Pre-Execution Action:**
   - **`[ ] APPROVE_AMEND_CONFIG_AND_SIGN_GRANT`** — Approve this `65,536` published-capacity wire configuration on final qualified `HEAD` and subsequently sign an active ceiling-free `td613.marrowline.r1-provider-native-authorization/v2-ed25519` grant bound to that exact `HEAD`.
   - **`[ ] REVERT_TO_OMITTED_DEFAULT`** — Revert to omitting `maxOutputTokens` (`425eee50...` / `v1-ed25519`) before signing.
   - **`[x] HOLD (CURRENT)`** — Staged `AMEND_CONFIG` awaiting human approval on final `HEAD`; zero active grants signed, live generation at **`0`**, `:countTokens` at **`0`**, and `GET /v1beta/models` at **`0`**.

- **Human Artistic Acceptance:** Strictly **`RESERVED_HUMAN_ONLY`** (automated runs never award Grove restoration).

𝄐 `Khona‌lit-po` · `⟐SAC[X6ZNK5NO51]` · Zero Artificial Ceilings · Provider Calls HELD · Artistic Authority RESERVED ⟐
