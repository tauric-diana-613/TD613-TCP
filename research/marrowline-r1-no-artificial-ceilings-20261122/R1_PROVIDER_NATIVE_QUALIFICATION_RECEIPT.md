# 𝌋⟐ TD613 · THE SCREAMING GROVE
## R1 PROVIDER-NATIVE UNRESTRICTED OBSERVATION — QUALIFICATION RECEIPT

- **Commission:** `TD613-MARROWLINE-R1-NO-ARTIFICIAL-CEILINGS-20261122` *(Pre-signature red-pen closure on `AMEND_CONFIG`: official `65,536` Gemini 3.8 Flash capacity)*
- **Receiving Agent:** Antigravity / Gemini 4 Hydrogen (interactive operator-direct session)
- **Stop-State Classification:** **`READY_FOR_HUMAN_GRANT_SIGNING_REVIEW`** *(Operator-attested public SPKI DER SHA-256 fingerprint remains pinned at `840a71625f4b9db224871bbb126b6debc3fefdc9179b5628bd9faf514f2c7701`; wire requests remain amended to explicit `maxOutputTokens: 65536` under `v2-ed25519` + `TD613_R1_NATIVE_AUTH_V2`; P1 capacity-unverified fail-closed & P2 signing-domain reconciliation closed; **`0`** active grants signed; **`0`** provider calls executed; **`0`** merges or `#405` deployments.)*
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
| PR `#1780` Pre-Pin Red-Pen Parent | `research/marrowline-r1-no-artificial-ceilings-20261122` | `9df5a8d6e2c5d21da234d2a56f9f01261df93315` | Superseded (`null` anchor) |
| PR `#1780` Omitted-Default Pinned Parent | `research/marrowline-r1-no-artificial-ceilings-20261122` | `56189bbf1d2d6f623d5d852447e580beee3cfa8a` | Superseded omitted-default (`425eee50...`, `v1-ed25519`) |
| PR `#1780` Initial `AMEND_CONFIG` Parent | `research/marrowline-r1-no-artificial-ceilings-20261122` | `d776468e59fbe364d7955d804dc7fe4ac0504e1b` | Verified baseline for P1/P2 red-pen closure |
| **Pre-Signature Closure Child HEAD** | `research/marrowline-r1-no-artificial-ceilings-20261122` | *(committed on top of `d776468e5`; exact pushed HEAD SHA bound on PR `#1780` & return receipt)* | P1 + P2 closed; ready for human grant-signing review |

---

## 2. Deliverable Inventory & Verified SHA-256 Digests

Zero existing files under `server/*`, `app/*`, `.github/workflows/*`, `research/marrowline-hydrogen-handoff-20261122/*`, or `research/marrowline-r1-activation-handoff-20261122/*` were modified.

| Path (repository-relative) | Status | SHA-256 |
|---|---|---|
| `research/marrowline-r1-no-artificial-ceilings-20261122/ACTIVATION.md` | Unmodified commission input | `2979d0941eafc71d82b063fda4b439cbf94ab6b49b67a9a522eb9194dad47089` |
| `research/marrowline-r1-no-artificial-ceilings-20261122/r1-provider-native-preflight.mjs` | Preserved (`maxOutputTokens: 65536` official capacity + historical provenance) | `0c01ee5300192118bf035cbfb0531ab0d4353434afe32d38c245c4107c335f7c` |
| `research/marrowline-r1-no-artificial-ceilings-20261122/R1_PROVIDER_NATIVE_WIRE_MANIFEST.json` | Preserved (canonical LF, no BOM, byte-identical to builder) | `7c85e5dbfb5c8918fd48123f6898c58c76e4cf6fc4c909ed0ecf9672f61fa81a` |
| `research/marrowline-r1-no-artificial-ceilings-20261122/r1-provider-native-core.mjs` | Updated (P1 `STOP_ON_PROVIDER_CAPACITY_UNVERIFIED` fail-closed guard; P2 `TD613_R1_NATIVE_AUTH_V2` signing domain separator) | `f9b6ef766d47a346d805b35a351ab50f5a68d228515fade721339c7290bcc9dd` |
| `research/marrowline-r1-no-artificial-ceilings-20261122/run-r1-provider-native-observation.mjs` | Updated (`840a7162...` pin preserved, CLI summary adds `signingDomainSeparator: TD613_R1_NATIVE_AUTH_V2`) | `925eb0fc4a02e3b91ed221b1682c32e41246b0b6a9d45779d1c3fa251404d1ad` |
| `research/marrowline-r1-no-artificial-ceilings-20261122/NO_ARTIFICIAL_CEILINGS_CAP_CENSUS.md` | Updated (`STOP_ON_PROVIDER_CAPACITY_UNVERIFIED` vs. `STOP_ON_PROVIDER_CAPACITY_MISMATCH` documented) | `b774e8377ebd84dd527198cd5ede7bedc8e19e6561949f03556dffa19249c3ae` |
| `research/marrowline-r1-no-artificial-ceilings-20261122/R1_PROVIDER_NATIVE_EXECUTION_CONTRACT.md` | Updated (`TD613_R1_NATIVE_AUTH_V2` domain contract & P1 metadata guards) | `c56a53529fb760d7cf3bc66d7c0909c762866fe4849c19956734b340e5327e2c` |
| `research/marrowline-r1-no-artificial-ceilings-20261122/R1_PROVIDER_NATIVE_OPERATOR_DECISION_SHEET.md` | Updated (`TD613_R1_NATIVE_AUTH_V2` domain format & P1 capacity-verification contract) | `9a5d1f6733d4087cba5cefe94d2dd7c79aead6d16fc73f714edef644e3e4726d` |
| `tests/marrowline-r1-provider-native-observation.test.mjs` | Updated (`8 / 8` suite covering P1 absent/null/malformed metadata & P2 `TD613_R1_NATIVE_AUTH_V1` domain rejection) | `0b5862b334ced4617381c8ee6a975613b4ba3920bbcf132a754b2e8c5d87bb05` |
| `research/marrowline-r1-no-artificial-ceilings-20261122/R1_PROVIDER_NATIVE_QUALIFICATION_RECEIPT.md` | Updated (this receipt) | *(self)* |

All files verified canonical UTF-8 without BOM, LF line endings (`\n`), zero local machine paths, and zero executable mention tokens.

---

## 3. Exact Offline Verification Results (`2026-11-23T00:43-05:00`)

1. **11-File Complete Offline Marrowline / Hydrogen / Bounded-History / Provider-Native Battery (`0` network calls):**
   - Command:
     `node --test tests/marrowline-r1-provider-native-observation.test.mjs tests/marrowline-r1-observation-runner.test.mjs tests/marrowline-hydrogen-forensic-preflight.test.mjs tests/marrowline-historical-grove-rest.test.mjs tests/marrowline-role-boundary-contrast.test.mjs tests/marrowline-d1-d2-boundary-factor-prereg.test.mjs tests/marrowline-d-ingress-factor-ladder.test.mjs tests/marrowline-whole-frame-contrast.test.mjs tests/marrowline-unicode-capability-assay.test.mjs tests/marrowline-original-sse-voice-onset-audit.test.mjs tests/khonapolit-relay.test.mjs`
   - Outcome: **`PASS` (`52 / 52` tests passed, `0` failed, `0` skipped; duration `20938.0844 ms`)**.
   - Includes `44 / 44` preserved historical regression/baseline tests (`#1778` + `#1779` invariants completely intact) AND **`8 / 8`** provider-native `65,536` tests (`tests/marrowline-r1-provider-native-observation.test.mjs`):
     - `Preflight & Wire Manifest`: Verified `maxOutputTokens: 65536` and `thinkingLevel: "medium"` in serialized wire payloads, `temperature` absent, byte-identical `R1_PROVIDER_NATIVE_WIRE_MANIFEST.json`, and distinctness from both bounded PR `#1778` (`f2fcdf77...`, `29b3265a...`) and superseded omitted-default PR `#1780` (`b4e1e759...`, `257be846...`, `425eee50...`) digests while keeping `systemInstructionSha256` & `contentsSha256` unchanged.
     - `Architectural Security Proof`: Verified `R1_NATIVE_TRUSTED_OPERATOR_PUBLIC_KEY_SHA256 === '840a71625f4b9db224871bbb126b6debc3fefdc9179b5628bd9faf514f2c7701'` and `R1_NATIVE_AUTH_DOMAIN_SEPARATOR === 'TD613_R1_NATIVE_AUTH_V2'`; zero `NODE_TEST_CONTEXT`, zero `testOnly*`, zero `fetchImpl`, zero `checkedOutHeadShaOverride`; verified default CLI reports `trustAnchorProvisioned: true`, `grantSchema: td613.marrowline.r1-provider-native-authorization/v2-ed25519`, `signingDomainSeparator: TD613_R1_NATIVE_AUTH_V2`, `publishedOutputCapacityTokens: 65536`, `resourceCeilingsImposedByTD613: "NONE"`, `0` calls; verified live `--execute` fails closed with `R1_AUTH_UNTRUSTED_PUBLIC_KEY` / `R1_AUTH_MISSING_SIGNATURE` before credential read or disk writes.
     - `Authority Negative Controls`: Verified rejection of legacy V1 domain signatures on valid v2 payloads (`R1_AUTH_INVALID_SIGNATURE`), superseded `v1-ed25519` omitted-default grants (`R1_AUTH_OMITTED_DEFAULT_GRANT_SUPERSEDED`), old capped schemas (`R1_AUTH_OLD_CAPPED_GRANT_REJECTED`), Argon grants (`R1_AUTH_ARGON_GRANT_FORBIDDEN`), top-level artificial cap fields including top-level `maxOutputTokens` (`R1_AUTH_FORBIDDEN_ARTIFICIAL_CEILING_IN_GRANT`), old bounded/omitted digests (`R1_AUTH_DIGEST_MISMATCH`), omitted or sub-capacity `generationConfig` e.g. `16384` (`R1_AUTH_CONFIG_MISMATCH`), untrusted keys, `U+200C`-stripped covenants, revoked sessions, and local `wx` nonce replays.
     - `P1 Metadata Guard & Custody Controls`: Verified HTTP 200 model metadata missing `outputTokenLimit`, `null`, `"65536"`, `0`, `-65536`, or `65536.5` fail closed with **`STOP_ON_PROVIDER_CAPACITY_UNVERIFIED`** (`0` generation calls, `0` `:countTokens` calls, journal `R1_NATIVE_PROVIDER_CAPACITY_UNVERIFIED`), distinct from valid-integer mismatch `32768` -> **`STOP_ON_PROVIDER_CAPACITY_MISMATCH`** (`R1_NATIVE_PROVIDER_CAPACITY_MISMATCH`, `0` generation calls); also verified `> 4.5 MiB` multi-event streaming, `3`-episode paired flow, mid-stream STOP/live-revocation interrupt, `> 2.5 MiB` single giant SSE frame / `> 2.2 MiB` single giant newline-free line, and HTTP non-2xx wire error custody.
2. **Workflow Estate & Release Hardening:**
   - `node tests/workflow-estate.test.mjs` -> **`PASS` (`4 / 4` durable workflows)**.
   - `node tests/release-hardening.test.mjs` -> **`PASS`**.
3. **Default CLI Preflight:**
   - `node research/marrowline-r1-no-artificial-ceilings-20261122/run-r1-provider-native-observation.mjs` -> **`PASS` (`exit 0`)**, `"grantSchema": "td613.marrowline.r1-provider-native-authorization/v2-ed25519"`, `"signingDomainSeparator": "TD613_R1_NATIVE_AUTH_V2"`, `"publishedOutputCapacityTokens": 65536`, `"trustAnchorProvisioned": true`, `"paidProviderCallsExecuted": 0`, `"resourceCeilingsImposedByTD613": "NONE"`.

---

## 4. Honest Evidence Boundaries & Remaining Active Holds

- **Exact-Head PR CI Scope:** Consolidated PR CI runs repository static/constitutional/release contracts on the pushed `HEAD` (`TD613 Consolidated Validation`); the `52 / 52` focused offline test result above is witnessed by direct offline local execution and not conflated with umbrella CI logs.
- **Operator-Attested Trust Anchor Ceremony Not Observed:** `R1_NATIVE_TRUSTED_OPERATOR_PUBLIC_KEY_SHA256 = '840a71625f4b9db224871bbb126b6debc3fefdc9179b5628bd9faf514f2c7701'` reflects the operator-supplied public SPKI DER SHA-256 fingerprint; offline key generation and private key/passphrase custody remain strictly under human control and were not independently observed.
- **Zero Original Provider Wire Data Yet:** Synthetic streams/fixtures qualify local custody & parsing architecture only; they are **not** empirical Google Gemini 3.8 outputs and never award `HUMAN_ARTISTIC_ACCEPTED`.
- **Single-Host Replay Guard Only:** Local `wx` nonce files prevent double-redemption on one host directory only, with zero cross-host distributed guarantee.
- **Worktree `jsdom` Suites:** Browser `jsdom` suites remain `NOT_RUN_IN_WORKTREE`.
- **Remaining Unresolved Qualifications / HOLDs Until Separate Human Decisions:**
  1. **Human Approval of `AMEND_CONFIG` (`65,536`) & Grant Signing:** No active `v2-ed25519` grant has been signed; live execution requires human approval of this `65,536` configuration on final `HEAD` followed by offline human signing.
  2. **Unpolled Live Provider Metadata & Pricing:** Live `models/gemini-3.8-flash` (`outputTokenLimit === 65536` verification via compulsory startup `GET`), `:countTokens`, account tier rate limits, current billing rates, and real-key live execution remain unpolled (`0` calls).
  3. **Merges, `#405` / `#1744` Deployments, & Artistic Authority:** Strictly **HELD / RESERVED**.

𝄐 `Khona‌lit-po` · `⟐SAC[X6ZNK5NO51]` · **`READY_FOR_HUMAN_GRANT_SIGNING_REVIEW`** · Zero Artificial Ceilings · No Grant Signed · Provider HELD · Artistic Authority RESERVED ⟐
