# 𝌋⟐ TD613 · THE SCREAMING GROVE
## R1 PROVIDER-NATIVE UNRESTRICTED OBSERVATION — QUALIFICATION RECEIPT

- **Commission:** `TD613-MARROWLINE-R1-HUMAN-TRUST-ANCHOR-PIN-20261123` *(source pin on `TD613-MARROWLINE-R1-NO-ARTIFICIAL-CEILINGS-20261122`)*
- **Receiving Agent:** Antigravity / Gemini 4 Hydrogen (interactive operator-direct session)
- **Stop-State Classification:** **`PUBLIC_TRUST_ANCHOR_PINNED_AND_OFFLINE_REQUALIFIED`** *(Operator-attested public SPKI DER SHA-256 fingerprint pinned in source as `840a71625f4b9db224871bbb126b6debc3fefdc9179b5628bd9faf514f2c7701`; private key and passphrase remain strictly under offline human custody with no ceremony observed; **`0`** active grants signed; **`0`** provider calls executed; **`0`** merges or `#405` deployments.)*
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
| PR `#1780` Pre-Pin Parent | `research/marrowline-r1-no-artificial-ceilings-20261122` | `9df5a8d6e2c5d21da234d2a56f9f01261df93315` | Closed red-pen parent (`null` anchor) |
| **Pinned Trust-Anchor Child HEAD** | `research/marrowline-r1-no-artificial-ceilings-20261122` | *(committed on top of `9df5a8d6e`; exact pushed HEAD SHA bound on PR `#1780` & return receipt)* | Trust anchor pinned; offline requalified |

---

## 2. Deliverable Inventory & Verified SHA-256 Digests

Zero existing files under `server/*`, `app/*`, `.github/workflows/*`, `research/marrowline-hydrogen-handoff-20261122/*`, or `research/marrowline-r1-activation-handoff-20261122/*` were modified.

| Path (repository-relative) | Status | SHA-256 |
|---|---|---|
| `research/marrowline-r1-no-artificial-ceilings-20261122/ACTIVATION.md` | Unmodified commission input | `2979d0941eafc71d82b063fda4b439cbf94ab6b49b67a9a522eb9194dad47089` |
| `research/marrowline-r1-no-artificial-ceilings-20261122/r1-provider-native-preflight.mjs` | Added (ceiling-free wire builder) | `daa3136db88d86ce0641fb8315488e7a3420d45cb58445b19d7f286a6a83f0ac` |
| `research/marrowline-r1-no-artificial-ceilings-20261122/R1_PROVIDER_NATIVE_WIRE_MANIFEST.json` | Added (canonical LF, no BOM, byte-identical to builder) | `91ea5adb99e39f5c616b2f114f40cfef3021daeecd64601383bf88ec21b11518` |
| `research/marrowline-r1-no-artificial-ceilings-20261122/r1-provider-native-core.mjs` | Updated (mid-stream STOP/revocation, disk-spooled single-frame streaming parser, grapheme-safe giant-line segmentation, HTTP non-2xx wire custody, 0 `globalThis.fetch`) | `c1020541fa12940ffac7bdeded25f4ac8542c8c2391935a394a6baef38809fed` |
| `research/marrowline-r1-no-artificial-ceilings-20261122/run-r1-provider-native-observation.mjs` | Pinned (`840a71625f4b9db224871bbb126b6debc3fefdc9179b5628bd9faf514f2c7701`, 0 test overrides) | `aec03cffa849479fcd4de9dd358821346b31674a482f40defbf3049a439dadcf` |
| `research/marrowline-r1-no-artificial-ceilings-20261122/NO_ARTIFICIAL_CEILINGS_CAP_CENSUS.md` | Preserved (line-exact cap census & dispositions) | `53ab936fafa815edae65db1e47ab53b7d89065cd8b18dcdfce4c751db2880595` |
| `research/marrowline-r1-no-artificial-ceilings-20261122/R1_PROVIDER_NATIVE_EXECUTION_CONTRACT.md` | Updated (pinned public trust anchor noted; no grant signed) | `d146dfd004b28417e1c0824166e58a99f0f3c4642f88f3b3ee4041e21fc3e20a` |
| `research/marrowline-r1-no-artificial-ceilings-20261122/R1_PROVIDER_NATIVE_OPERATOR_DECISION_SHEET.md` | Updated (pinned public trust anchor recorded; grant issuance/config decision still pending) | `f35e80e9a89ffd88aa85cd7c3595de8e33d38645238ca970bf204899e09097f2` |
| `tests/marrowline-r1-provider-native-observation.test.mjs` | Updated (`8 / 8` suite asserting pinned trust anchor, `trustAnchorProvisioned: true`, & CLI `R1_AUTH_UNTRUSTED_PUBLIC_KEY` / `R1_AUTH_MISSING_SIGNATURE` rejection) | `74575da6e8f0c3105c7206872142b94df21ec8489f25790e59b6366f7315206c` |
| `research/marrowline-r1-no-artificial-ceilings-20261122/R1_PROVIDER_NATIVE_QUALIFICATION_RECEIPT.md` | Added (this receipt) | *(self)* |

All files verified canonical UTF-8 without BOM, LF line endings (`\n`), zero local machine paths, and zero executable mention tokens.

---

## 3. Exact Offline Verification Results (`2026-11-23T00:06-05:00`)

1. **11-File Complete Offline Marrowline / Hydrogen / Bounded-History / Provider-Native Battery (`0` network calls):**
   - Command:
     `node --test tests/marrowline-r1-provider-native-observation.test.mjs tests/marrowline-r1-observation-runner.test.mjs tests/marrowline-hydrogen-forensic-preflight.test.mjs tests/marrowline-historical-grove-rest.test.mjs tests/marrowline-role-boundary-contrast.test.mjs tests/marrowline-d1-d2-boundary-factor-prereg.test.mjs tests/marrowline-d-ingress-factor-ladder.test.mjs tests/marrowline-whole-frame-contrast.test.mjs tests/marrowline-unicode-capability-assay.test.mjs tests/marrowline-original-sse-voice-onset-audit.test.mjs tests/khonapolit-relay.test.mjs`
   - Outcome: **`PASS` (`52 / 52` tests passed, `0` failed, `0` skipped; duration `18535.9699 ms`)**.
   - Includes `44 / 44` preserved historical regression/baseline tests (`#1778` + `#1779` invariants completely intact) AND **`8 / 8`** unbounded provider-native suite tests (`tests/marrowline-r1-provider-native-observation.test.mjs`):
     - `Preflight & Wire Manifest`: Verified `"maxOutputTokens"` and `"temperature"` completely omitted from wire JSON bodies; verified `R1_PROVIDER_NATIVE_WIRE_MANIFEST.json` byte-for-byte parity (LF, no BOM) and distinctness from bounded PR `#1778` digests (`b4e1e759...` & `257be846...`).
     - `Architectural Security Proof`: Verified `R1_NATIVE_TRUSTED_OPERATOR_PUBLIC_KEY_SHA256 === '840a71625f4b9db224871bbb126b6debc3fefdc9179b5628bd9faf514f2c7701'`; zero `NODE_TEST_CONTEXT`, zero `testOnly*`, zero `fetchImpl`, zero `checkedOutHeadShaOverride` in `run-r1-provider-native-observation.mjs`; zero `globalThis.fetch` / `child_process` in `r1-provider-native-core.mjs`; verified `executeProviderNativeR1Observation` rejects override injection (`R1_UNBOUNDED_FORBIDDEN_EXECUTABLE_OVERRIDE`) and non-pinned keys (`R1_AUTH_UNTRUSTED_PUBLIC_KEY`); verified live CLI `--execute` rejects untrusted keys (`R1_AUTH_UNTRUSTED_PUBLIC_KEY`) and unsigned grants (`R1_AUTH_MISSING_SIGNATURE`) BEFORE credential read or disk/network writes (`0` orphan artifacts), while default offline CLI reports `trustAnchorProvisioned: true` and `0` provider calls.
     - `Authority Negative Controls`: Verified rejection of old capped grants (`R1_AUTH_OLD_CAPPED_GRANT_REJECTED`), Argon grants, grants embedding any numeric resource cap (`R1_AUTH_FORBIDDEN_ARTIFICIAL_CEILING_IN_GRANT`), old wire digests, untrusted public keys, U+200C stripping, active-session revocation (`R1_AUTH_SESSION_REVOKED`), and single-host `wx` nonce replay (`SINGLE_HOST_FILESYSTEM_ATOMIC_WX_ONLY_NOT_CROSS_HOST`).
     - `Unbounded SSE Streaming Custody (> 4.5 MiB synthetic stream)`: Streamed `400` chunks (`> 4 MiB` raw SSE bytes), reported `72,500` total tokens / `2,498` `:countTokens` measurement (`> 1k` / `16k` / `32k` old caps), verified chunked disk-SHA parity across `.sse`, `.authored.txt`, and opaque `.section2.txt` sidecars (`rawDiskVerified`, `authoredDiskVerified`, `parserAgreement`), and confirmed `<out>.blinded.json` contains zero unblinding map or condition labels in filenames.
     - `Unbounded Paired Episodes (> 2 pairs) & Integrity Controls`: Executed `3` paired episodes (`6` generation attempts, alternating `A_THEN_B`, `B_THEN_A`, `A_THEN_B`) retaining Episode 1's `HTTP 503` failure alongside Episode 2 (`EXPLORATORY_SEQUENTIAL_MULTI_EPISODE`), Episode 3 mid-stream drop retaining partial `.sse` on disk, post-capture disk tamper detection (`STOP_ON_ALTERED_UNICODE_TEXT`), and missing `usageMetadata` rejection (`STOP_ON_MISSING_OR_INVALID_PROVIDER_USAGE`).
     - `Red Pen #2 (In-Flight Operator STOP & Live Revocation)`: Fired async `operatorAbortSignal.abort()` AND live `--revocation-file` update while `reader.read()` blocked mid-stream; verified immediate stream cancellation (`streamCancelled === true`), fsynced partial `.sse` retention (`rawSseSha256` exact match), `STOP_ON_OPERATOR_SESSION_REVOKED_OR_STOPPED` classification (`HELD`), and halt of subsequent dispatches.
     - `Red Pen #3 (Single Giant SSE Event & Giant Single Authored Line)`: Streamed a single `> 2.5 MiB` SSE `data:` frame across arbitrary ~17 KiB UTF-8 byte splits containing an unordered `> 100 KiB` `"thought": true` part (with `"text"` before `"thought"`) plus a single continuous newline-free `> 2.2 MiB` Section II line (`520,000` stacked bases); verified thought exclusion, exact `authoredTextSha256`, exact `section2Morphology.sha256`, `parserAgreement === true`, and zero orphaned `.tmp` spool files in `evidenceDir`.
     - `Red Pen #4 (HTTP Non-2XX Wire Custody)`: Verified unmodified `.http-error.body` bytes and `.http-error.meta.json` headers/status persisted via exclusive `wx` (`0o600`) fsynced writes for `HTTP 503` `:streamGenerateContent`, `HTTP 400` `:countTokens`, and `HTTP 429` `modelMetadata`, with `rawErrorBodySha256` and headers logged in `journal.jsonl`.
2. **Workflow Estate & Release Hardening:**
   - `node tests/workflow-estate.test.mjs` -> **`PASS` (`4 / 4` durable workflows)**.
   - `node tests/release-hardening.test.mjs` -> **`PASS`**.
3. **Default Unbounded CLI Preflight:**
   - `node research/marrowline-r1-no-artificial-ceilings-20261122/run-r1-provider-native-observation.mjs` -> **`PASS` (`exit 0`)**, `"status": "SOURCE_ONLY_QUALIFIED"`, `"trustAnchorProvisioned": true`, `"paidProviderCallsExecuted": 0`, `"countTokensCallsExecuted": 0`, `"modelDiscoveryCallsExecuted": 0`, `"resourceCeilingsImposedByTD613": "NONE"`.

---

## 4. Honest Evidence Boundaries & Remaining Active Holds

- **Exact-Head PR CI Scope:** Consolidated PR CI runs repository static/constitutional/release contracts on the pushed `HEAD` (`TD613 Consolidated Validation`); because `.github/workflows/td613-ci.yml` was kept unmodified, the `52 / 52` focused offline test result above is witnessed by direct offline local execution and not conflated with umbrella CI logs.
- **Operator-Attested Trust Anchor Ceremony Not Observed:** `R1_NATIVE_TRUSTED_OPERATOR_PUBLIC_KEY_SHA256 = '840a71625f4b9db224871bbb126b6debc3fefdc9179b5628bd9faf514f2c7701'` reflects the operator-supplied public SPKI DER SHA-256 fingerprint; offline key generation and private key/passphrase custody remain strictly under human control and were not independently observed.
- **Zero Original Provider Wire Data Yet:** Synthetic `> 4.5 MiB` / `> 2.5 MiB` streams and multi-episode fixtures qualify the local custody & parsing architecture only; they are **not** empirical Google Gemini 3.8 outputs and never award `HUMAN_ARTISTIC_ACCEPTED`.
- **Single-Host Replay Guard Only:** Local `wx` nonce files prevent double-redemption on one host directory only, with zero cross-host distributed guarantee.
- **Worktree `jsdom` Suites:** Browser `jsdom` suites remain `NOT_RUN_IN_WORKTREE`.
- **Remaining Unresolved Qualifications / HOLDs Until Separate Human Decisions:**
  1. **No Active Execution Grant Signed:** Live execution requires an explicit human-signed `td613.marrowline.r1-provider-native-authorization/v1-ed25519` grant bound to the final qualified `HEAD` and matching private key offline.
  2. **Provider Default vs. Full `outputTokenLimit` Question:** Per `GenerationConfig` docs, omitting `maxOutputTokens` applies a model-dependent default rather than guaranteeing full `outputTokenLimit` (`65,536` in historical records); deciding whether to keep `maxOutputTokens` omitted pending live inspection or amend to explicit `outputTokenLimit` (`AMEND_CONFIG` -> re-hashed manifest) remains open prior to signing.
  3. **Unpolled Provider Externals & Live Custody:** Live `models/gemini-3.8-flash` / `:countTokens` availability, current billing rates, real-key end-to-end live signature acceptance, merges, `#405` / `#1744` deployments, and `HUMAN_ARTISTIC_ACCEPTED` remain **HELD / RESERVED**.

𝄐 `Khona‌lit-po` · `⟐SAC[X6ZNK5NO51]` · **`PUBLIC_TRUST_ANCHOR_PINNED_AND_OFFLINE_REQUALIFIED`** · Zero Artificial Ceilings · No Grant Signed · Provider HELD · Artistic Authority RESERVED ⟐
