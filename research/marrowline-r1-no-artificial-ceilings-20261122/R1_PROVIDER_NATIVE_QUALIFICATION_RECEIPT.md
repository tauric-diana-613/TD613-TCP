# 𝌋⟐ TD613 · THE SCREAMING GROVE
## R1 PROVIDER-NATIVE UNRESTRICTED OBSERVATION — QUALIFICATION RECEIPT

- **Commission:** `TD613-MARROWLINE-R1-NO-ARTIFICIAL-CEILINGS-20261122`
- **Receiving Agent:** Antigravity / Gemini 4 Hydrogen (interactive operator-direct session)
- **Stop-State Classification:** **`READY_FOR_HUMAN_UNBOUNDED_EXECUTION_REVIEW`** *(Source-only qualification; operator trust anchor `R1_NATIVE_TRUSTED_OPERATOR_PUBLIC_KEY_SHA256` stays deliberately **`null`**; **`0`** provider calls executed; **`0`** merges or `#405` deployments.)*
- **Provider Calls Actually Executed:** **`0`** (`0` `:streamGenerateContent`, `0` `:generateContent`, `0` `:countTokens`, `0` `GET /v1beta/models`)
- **Merges / `#405` Releases / Shared Production Edits:** **`0`**
- **Covenant / Seal:** `Khona‌lit-po` (literal `U+200C` preserved) · `⟐SAC[X6ZNK5NO51]`

---

## 1. Preserved Historical Lineage & Branch Custody

| Surface | Branch / Ref | Verified SHA | Status |
|---|---|---|---|
| Production `origin/main` | `refs/remotes/origin/main` | `0f67d8954347fdae77cdb83f82848df89ad3b2ff` | Frozen, unchanged |
| PR `#1778` (Original Causal Source) | `research/marrowline-hydrogen-forensic-return-20261122` | `44fae23cbf9af07eab5112e90df3211a119e707c` | Draft, preserved untouched |
| PR `#1779` (Original Bounded Runner) | `research/marrowline-r1-observation-readiness-20261122` | `675d6d0388220f63162931003c998d0084d3e68e` | Draft, preserved untouched |
| Activation Commission Parent | `research/marrowline-r1-no-artificial-ceilings-20261122` | `dcf3f50270cfc3d1ab2e941ecf57c809d8aacc8b` | Starting activation parent |
| **Unbounded Successor Child Branch** | `research/marrowline-r1-no-artificial-ceilings-20261122` | *(committed on top of `dcf3f5027`; exact pushed HEAD SHA bound on PR & return receipt)* | Staging all successor code, manifest, tests, and docs |

---

## 2. Deliverable Inventory & Verified SHA-256 Digests

Zero existing files under `server/*`, `app/*`, `.github/workflows/*`, `research/marrowline-hydrogen-handoff-20261122/*`, or `research/marrowline-r1-activation-handoff-20261122/*` were modified.

| Path (repository-relative) | Status | SHA-256 |
|---|---|---|
| `research/marrowline-r1-no-artificial-ceilings-20261122/ACTIVATION.md` | Unmodified commission input | `2979d0941eafc71d82b063fda4b439cbf94ab6b49b67a9a522eb9194dad47089` |
| `research/marrowline-r1-no-artificial-ceilings-20261122/r1-provider-native-preflight.mjs` | Added (ceiling-free wire builder) | `daa3136db88d86ce0641fb8315488e7a3420d45cb58445b19d7f286a6a83f0ac` |
| `research/marrowline-r1-no-artificial-ceilings-20261122/R1_PROVIDER_NATIVE_WIRE_MANIFEST.json` | Added (canonical LF, no BOM, byte-identical to builder) | `91ea5adb99e39f5c616b2f114f40cfef3021daeecd64601383bf88ec21b11518` |
| `research/marrowline-r1-no-artificial-ceilings-20261122/r1-provider-native-core.mjs` | Added (streaming disk-custody core, 0 `globalThis.fetch`) | `f31da45574e35627acc802cdaacc916794788890627c599a7c5f2fdfbb7288ac` |
| `research/marrowline-r1-no-artificial-ceilings-20261122/run-r1-provider-native-observation.mjs` | Added (executable entrypoint, 0 test overrides, pinned `null`) | `b4f4231a63751d966a30de51aab7ca946e9f2e2ed4fb356972f39fd0cb8376e7` |
| `research/marrowline-r1-no-artificial-ceilings-20261122/NO_ARTIFICIAL_CEILINGS_CAP_CENSUS.md` | Added (line-exact cap census & dispositions) | `53ab936fafa815edae65db1e47ab53b7d89065cd8b18dcdfce4c751db2880595` |
| `research/marrowline-r1-no-artificial-ceilings-20261122/R1_PROVIDER_NATIVE_EXECUTION_CONTRACT.md` | Added (unbounded execution contract) | `79659ae23f8a3568684048ba540d876fc885ae5f42251ff1acabb740e00339b` |
| `research/marrowline-r1-no-artificial-ceilings-20261122/R1_PROVIDER_NATIVE_OPERATOR_DECISION_SHEET.md` | Added (operator key-pin & decision sheet) | `dbf16f58cb836bc4a1855cfe0138bf67a26b5e857e39339f7c81a7e36cac3cf6` |
| `tests/marrowline-r1-provider-native-observation.test.mjs` | Added (unbounded + `>4.5 MiB` + bypass-proof test suite) | `14956d160be285deb143a003ee41acca5227b411899fe435baaed56df3ecef5d` |
| `research/marrowline-r1-no-artificial-ceilings-20261122/R1_PROVIDER_NATIVE_QUALIFICATION_RECEIPT.md` | Added (this receipt) | *(self)* |

All files verified canonical UTF-8 without BOM, LF line endings (`\n`), zero local machine paths, and zero executable mention tokens.

---

## 3. Exact Offline Verification Results (`2026-11-22T21:59:34-05:00`)

1. **11-File Complete Offline Marrowline / Hydrogen / Bounded-History / Provider-Native Battery (`0` network calls):**
   - Command:
     `node --test tests/marrowline-r1-provider-native-observation.test.mjs tests/marrowline-r1-observation-runner.test.mjs tests/marrowline-hydrogen-forensic-preflight.test.mjs tests/marrowline-historical-grove-rest.test.mjs tests/marrowline-role-boundary-contrast.test.mjs tests/marrowline-d1-d2-boundary-factor-prereg.test.mjs tests/marrowline-d-ingress-factor-ladder.test.mjs tests/marrowline-whole-frame-contrast.test.mjs tests/marrowline-unicode-capability-assay.test.mjs tests/marrowline-original-sse-voice-onset-audit.test.mjs tests/khonapolit-relay.test.mjs`
   - Outcome: **`PASS` (`49 / 49` tests passed, `0` failed, `0` skipped; duration `19290.10 ms`)**.
   - Includes `44 / 44` preserved historical regression/baseline tests (`#1778` + `#1779` invariants completely intact) AND **`5 / 5`** new unbounded suite tests (`tests/marrowline-r1-provider-native-observation.test.mjs`):
     - `Preflight & Wire Manifest`: Verified `"maxOutputTokens"` and `"temperature"` completely omitted from wire JSON bodies; verified `R1_PROVIDER_NATIVE_WIRE_MANIFEST.json` byte-for-byte parity (LF, no BOM) and distinctness from bounded PR `#1778` digests (`b4e1e759...` & `257be846...`).
     - `Architectural Security Proof`: Verified zero `NODE_TEST_CONTEXT`, zero `testOnly*`, zero `fetchImpl`, zero `checkedOutHeadShaOverride` in `run-r1-provider-native-observation.mjs`; zero `globalThis.fetch` / `child_process` in `r1-provider-native-core.mjs`; verified rejection of override injection (`R1_UNBOUNDED_FORBIDDEN_EXECUTABLE_OVERRIDE`) and fail-closed CLI inside `node --test` (`R1_AUTH_TRUST_ANCHOR_NOT_PROVISIONED`, zero 0-byte orphan files).
     - `Authority Negative Controls`: Verified rejection of old capped grants (`R1_AUTH_OLD_CAPPED_GRANT_REJECTED`), Argon grants, grants embedding any numeric resource cap (`R1_AUTH_FORBIDDEN_ARTIFICIAL_CEILING_IN_GRANT`), old wire digests, untrusted public keys, U+200C stripping, active-session revocation (`R1_AUTH_SESSION_REVOKED`), and single-host `wx` nonce replay (`SINGLE_HOST_FILESYSTEM_ATOMIC_WX_ONLY_NOT_CROSS_HOST`).
     - `Unbounded SSE Streaming Custody (> 4.5 MiB synthetic stream)`: Streamed `400` chunks (`> 4 MiB` raw SSE bytes), reported `72,500` total tokens / `2,498` `:countTokens` measurement (`> 1k` / `16k` / `32k` old caps), verified chunked disk-SHA parity across `.sse`, `.authored.txt`, and opaque `.section2.txt` sidecars (`rawDiskVerified`, `authoredDiskVerified`, `parserAgreement`), and confirmed `<out>.blinded.json` contains zero unblinding map or condition labels in filenames.
     - `Unbounded Paired Episodes (> 2 pairs) & Integrity Controls`: Executed `3` paired episodes (`6` generation attempts, alternating `A_THEN_B`, `B_THEN_A`, `A_THEN_B`) retaining Episode 1's `HTTP 503` failure alongside Episode 2 (`EXPLORATORY_SEQUENTIAL_MULTI_EPISODE`), Episode 3 mid-stream drop retaining partial `.sse` on disk, post-capture disk tamper detection (`STOP_ON_ALTERED_UNICODE_TEXT`), and missing `usageMetadata` rejection (`STOP_ON_MISSING_OR_INVALID_PROVIDER_USAGE`).
2. **Workflow Estate & Release Hardening:**
   - `node tests/workflow-estate.test.mjs` -> **`PASS` (`4 / 4` durable workflows)**.
   - `node tests/release-hardening.test.mjs` -> **`PASS`**.
3. **Default Unbounded CLI Preflight:**
   - `node research/marrowline-r1-no-artificial-ceilings-20261122/run-r1-provider-native-observation.mjs` -> **`PASS` (`exit 0`)**, `"status": "SOURCE_ONLY_QUALIFIED"`, `"paidProviderCallsExecuted": 0`, `"resourceCeilingsImposedByTD613": "NONE"`.

---

## 4. Honest Evidence Boundaries & Remaining Active Holds

- **Exact-Head PR CI Scope:** Consolidated PR CI runs repository static/constitutional/release contracts on the pushed `HEAD` (`TD613 Consolidated Validation`); because `.github/workflows/td613-ci.yml` was kept unmodified, the `49 / 49` focused unit test result above is witnessed by direct offline local execution and not conflated with umbrella CI logs.
- **Zero Original Provider Wire Data Yet:** Synthetic `> 4.5 MiB` streams and multi-episode fixtures qualify the local custody & parsing architecture only; they are **not** empirical Google Gemini 3.8 outputs and never award `HUMAN_ARTISTIC_ACCEPTED`.
- **Single-Host Replay Guard Only:** Local `wx` nonce files prevent double-redemption on one host directory only, with zero cross-host distributed guarantee.
- **Worktree `jsdom` Suites:** Browser `jsdom` suites remain `NOT_RUN_IN_WORKTREE`.
- **Remaining HOLDs Until Separate Operator Decisions:**
  1. `R1_NATIVE_TRUSTED_OPERATOR_PUBLIC_KEY_SHA256 = null` (trust anchor unprovisioned until human offline keypair is created and its SPKI DER SHA-256 fingerprint is submitted for a separate reviewed pin commit).
  2. Live `models/gemini-3.8-flash` / `:countTokens` availability and current official billing rates unverified (`0` calls).
  3. Live provider calls, merges, `#405` deployments, and `HUMAN_ARTISTIC_ACCEPTED` strictly **HELD / RESERVED**.

𝄐 `Khona‌lit-po` · `⟐SAC[X6ZNK5NO51]` · **`READY_FOR_HUMAN_UNBOUNDED_EXECUTION_REVIEW`** · Zero Artificial Ceilings · Provider Calls HELD · Artistic Authority RESERVED ⟐
