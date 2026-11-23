# 𝌋⟐ TD613 · THE SCREAMING GROVE
## R1 PROVIDER-NATIVE OBSERVATION — OPERATOR DECISION SHEET

> [!IMPORTANT]
> **DRAFT DECISION SHEET — ZERO AUTHORIZATION IMPLIED · PROVIDER CALLS HELD.**
> Resource policy override applied: **TD613 imposes ZERO caps on tokens, USD spending, attempts, repetitions, retries, duration, or SSE byte size.**
> However, live execution remains **HELD** until: (1) you provision an operator-owned offline Ed25519 key and pin its non-secret SPKI DER SHA-256 fingerprint in a reviewed commit (`R1_NATIVE_TRUSTED_OPERATOR_PUBLIC_KEY_SHA256`), (2) offline tests verify that pinned `HEAD`, and (3) you sign an explicit active-session grant bound to that final `HEAD`.

- **Commission:** `TD613-MARROWLINE-R1-NO-ARTIFICIAL-CEILINGS-20261122`
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
  - Note: Once live model metadata is observed, if omitting `maxOutputTokens` turns out to inherit a smaller provider default than `outputTokenLimit`, switching to `maxOutputTokens = <verified official outputTokenLimit>` is a separate renewed wire manifest rather than an unhashed edit.
- **Revocable Session Control:** Active runs continue as provider capability permits until requested episodes finish, an integrity failure occurs, or you trigger manual STOP / session revocation (`--revocation-file` / `AbortSignal`).

---

## 3. Explicit Human Operator Decisions Required Next

1. **Key Provisioning:** Generate an Ed25519 keypair on an operator-controlled offline device (private key strictly outside code, GitHub, agents, CI, and chat) and approve a commit pinning only the non-secret SPKI DER SHA-256 into `R1_NATIVE_TRUSTED_OPERATOR_PUBLIC_KEY_SHA256`.
2. **Choose Action:**
   - **`[ ] PROCEED_TO_KEY_PIN`** — Approve pinning your SPKI DER SHA-256 fingerprint on a reviewed successor commit, verify offline tests on that final `HEAD`, and subsequently issue a ceiling-free `td613.marrowline.r1-provider-native-authorization/v1-ed25519` grant bound to that `HEAD`.
   - **`[ ] AMEND_CONFIG`** — Request setting explicit `maxOutputTokens` to a separately verified official provider `outputTokenLimit` or revising episode design -> regenerates digests first.
   - **`[x] HOLD (CURRENT)`** — Keep trust anchor `null`, live generation at **`0`**, `:countTokens` at **`0`**, and `GET /v1beta/models` at **`0`**.

- **Human Artistic Acceptance:** Strictly **`RESERVED_HUMAN_ONLY`** (automated runs never award Grove restoration).

𝄐 `Khona‌lit-po` · `⟐SAC[X6ZNK5NO51]` · Zero Artificial Ceilings · Provider Calls HELD · Artistic Authority RESERVED ⟐
