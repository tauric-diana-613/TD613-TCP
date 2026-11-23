# 𝌋⟐ TD613 · THE SCREAMING GROVE
## R1 PROVIDER-NATIVE UNRESTRICTED OBSERVATION — QUALIFICATION RECEIPT

- **Commission:** `TD613-MARROWLINE-R1-NO-ARTIFICIAL-CEILINGS-20261122` *(`AMEND_CONFIG`: official Gemini 3.8 Flash `65,536` published output capacity)*
- **Receiving Agent:** Antigravity / Gemini 4 Hydrogen (interactive operator-direct session)
- **Stop-State Classification:** **`AMEND_CONFIG_65536_STAGED_AND_OFFLINE_REQUALIFIED`** *(Operator-attested public SPKI DER SHA-256 fingerprint remains pinned at `840a71625f4b9db224871bbb126b6debc3fefdc9179b5628bd9faf514f2c7701`; wire requests amended from omitted-default to explicit `maxOutputTokens: 65536` under `v2-ed25519`; **`0`** active grants signed; **`0`** provider calls executed; **`0`** merges or `#405` deployments.)*
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
| **`AMEND_CONFIG` (`65,536`) Child HEAD** | `research/marrowline-r1-no-artificial-ceilings-20261122` | *(committed on top of `56189bbf1`; exact pushed HEAD SHA bound on PR `#1780` & return receipt)* | Published capacity staged; offline requalified |

---

## 2. Deliverable Inventory & Verified SHA-256 Digests

Zero existing files under `server/*`, `app/*`, `.github/workflows/*`, `research/marrowline-hydrogen-handoff-20261122/*`, or `research/marrowline-r1-activation-handoff-20261122/*` were modified.

| Path (repository-relative) | Status | SHA-256 |
|---|---|---|
| `research/marrowline-r1-no-artificial-ceilings-20261122/ACTIVATION.md` | Unmodified commission input | `2979d0941eafc71d82b063fda4b439cbf94ab6b49b67a9a522eb9194dad47089` |
| `research/marrowline-r1-no-artificial-ceilings-20261122/r1-provider-native-preflight.mjs` | Updated (`maxOutputTokens: 65536` official capacity + preserved historical omitted & bounded provenance) | `0c01ee5300192118bf035cbfb0531ab0d4353434afe32d38c245c4107c335f7c` |
| `research/marrowline-r1-no-artificial-ceilings-20261122/R1_PROVIDER_NATIVE_WIRE_MANIFEST.json` | Regenerated (canonical LF, no BOM, byte-identical to builder) | `7c85e5dbfb5c8918fd48123f6898c58c76e4cf6fc4c909ed0ecf9672f61fa81a` |
| `research/marrowline-r1-no-artificial-ceilings-20261122/r1-provider-native-core.mjs` | Updated (`65536` frozen digests, `v2-ed25519` grant schema, `R1_AUTH_OMITTED_DEFAULT_GRANT_SUPERSEDED`, `STOP_ON_PROVIDER_CAPACITY_MISMATCH`) | `92e5f068ff4bb8132d0604def698adca5041ef4aa60d3a4fb564fad5d80d1f68` |
| `research/marrowline-r1-no-artificial-ceilings-20261122/run-r1-provider-native-observation.mjs` | Updated (`840a7162...` pin preserved, CLI summary adds `grantSchema` & `publishedOutputCapacityTokens: 65536`) | `8854b60527faf524241fb2617c2a954d1508fd2ae485603249fabd7551944d6a` |
| `research/marrowline-r1-no-artificial-ceilings-20261122/NO_ARTIFICIAL_CEILINGS_CAP_CENSUS.md` | Updated (`PROVIDER_PUBLISHED_CAPACITY_65536` disposition & omitted baseline history noted) | `36dd473084ff89ac7bf6f4bdcc57f0b10634c6cb0a6fd7c2b87c3c022f8cbd73` |
| `research/marrowline-r1-no-artificial-ceilings-20261122/R1_PROVIDER_NATIVE_EXECUTION_CONTRACT.md` | Updated (`65536` wire digests, `v2-ed25519`, capacity-mismatch stop condition) | `29115198be08b6dc8f8edc39d7bc4342e821470256f305c50fdc767fb60ee02e` |
| `research/marrowline-r1-no-artificial-ceilings-20261122/R1_PROVIDER_NATIVE_OPERATOR_DECISION_SHEET.md` | Updated (`AMEND_CONFIG: 65,536` configuration, delta vs. `56189bbf1`, approval pending) | `15563dbc80976203bc2516daf7e41adca43f451412f8b440eec6fa8d810bb7c3` |
| `tests/marrowline-r1-provider-native-observation.test.mjs` | Updated (`8 / 8` suite covering `65536` manifest parity, superseded `v1`/omitted/capped rejection, & `STOP_ON_PROVIDER_CAPACITY_MISMATCH`) | `8153cabc8da5d4a5d56bcbf97faef75764e065d19750737ca16cb749443ce25f` |
| `research/marrowline-r1-no-artificial-ceilings-20261122/R1_PROVIDER_NATIVE_QUALIFICATION_RECEIPT.md` | Updated (this receipt) | *(self)* |

All files verified canonical UTF-8 without BOM, LF line endings (`\n`), zero local machine paths, and zero executable mention tokens.

---

## 3. Exact Offline Verification Results (`2026-11-23T00:28-05:00`)

1. **11-File Complete Offline Marrowline / Hydrogen / Bounded-History / Provider-Native Battery (`0` network calls):**
   - Command:
     `node --test tests/marrowline-r1-provider-native-observation.test.mjs tests/marrowline-r1-observation-runner.test.mjs tests/marrowline-hydrogen-forensic-preflight.test.mjs tests/marrowline-historical-grove-rest.test.mjs tests/marrowline-role-boundary-contrast.test.mjs tests/marrowline-d1-d2-boundary-factor-prereg.test.mjs tests/marrowline-d-ingress-factor-ladder.test.mjs tests/marrowline-whole-frame-contrast.test.mjs tests/marrowline-unicode-capability-assay.test.mjs tests/marrowline-original-sse-voice-onset-audit.test.mjs tests/khonapolit-relay.test.mjs`
   - Outcome: **`PASS` (`52 / 52` tests passed, `0` failed, `0` skipped; duration `23156.1087 ms`)**.
   - Includes `44 / 44` preserved historical regression/baseline tests (`#1778` + `#1779` invariants completely intact) AND **`8 / 8`** provider-native `65,536` capacity tests (`tests/marrowline-r1-provider-native-observation.test.mjs`):
     - `Preflight & Wire Manifest`: Verified `maxOutputTokens: 65536` and `thinkingLevel: "medium"` in serialized wire payloads, `temperature` absent, byte-identical `R1_PROVIDER_NATIVE_WIRE_MANIFEST.json`, and distinctness from both bounded PR `#1778` (`f2fcdf77...`, `29b3265a...`) and superseded omitted-default PR `#1780` (`b4e1e759...`, `257be846...`, `425eee50...`) digests while keeping `systemInstructionSha256` & `contentsSha256` unchanged.
     - `Architectural Security Proof`: Verified `R1_NATIVE_TRUSTED_OPERATOR_PUBLIC_KEY_SHA256 === '840a71625f4b9db224871bbb126b6debc3fefdc9179b5628bd9faf514f2c7701'`; zero `NODE_TEST_CONTEXT`, zero `testOnly*`, zero `fetchImpl`, zero `checkedOutHeadShaOverride`; verified default CLI reports `trustAnchorProvisioned: true`, `grantSchema: td613.marrowline.r1-provider-native-authorization/v2-ed25519`, `publishedOutputCapacityTokens: 65536`, `resourceCeilingsImposedByTD613: "NONE"`, `0` calls; verified live `--execute` fails closed with `R1_AUTH_UNTRUSTED_PUBLIC_KEY` / `R1_AUTH_MISSING_SIGNATURE` before credential read or disk writes.
     - `Authority Negative Controls`: Verified rejection of old capped schemas (`R1_AUTH_OLD_CAPPED_GRANT_REJECTED`), superseded `v1-ed25519` omitted-default grants (`R1_AUTH_OMITTED_DEFAULT_GRANT_SUPERSEDED`), Argon grants (`R1_AUTH_ARGON_GRANT_FORBIDDEN`), top-level artificial cap fields including top-level `maxOutputTokens` (`R1_AUTH_FORBIDDEN_ARTIFICIAL_CEILING_IN_GRANT`), old bounded/omitted digests (`R1_AUTH_DIGEST_MISMATCH`), omitted or sub-capacity `generationConfig` e.g. `16384` (`R1_AUTH_CONFIG_MISMATCH`), untrusted keys, `U+200C`-stripped covenants, revoked sessions, and local `wx` nonce replays.
     - `Streaming, Paired Episodes, STOP/Revocation, Giant Frame/Line & HTTP Non-2XX Controls`: All `> 4.5 MiB` multi-event streaming, `3`-episode paired flow, mid-stream STOP/live-revocation interrupt, `> 2.5 MiB` single giant SSE frame / `> 2.2 MiB` single giant newline-free line, HTTP non-2xx wire error custody, AND live `outputTokenLimit: 32768 !== 65536` metadata mismatch halt (`STOP_ON_PROVIDER_CAPACITY_MISMATCH`, `0` generation calls) passed.
2. **Workflow Estate & Release Hardening:**
   - `node tests/workflow-estate.test.mjs` -> **`PASS` (`4 / 4` durable workflows)**.
   - `node tests/release-hardening.test.mjs` -> **`PASS`**.
3. **Default CLI Preflight:**
   - `node research/marrowline-r1-no-artificial-ceilings-20261122/run-r1-provider-native-observation.mjs` -> **`PASS` (`exit 0`)**, `"grantSchema": "td613.marrowline.r1-provider-native-authorization/v2-ed25519"`, `"publishedOutputCapacityTokens": 65536`, `"trustAnchorProvisioned": true`, `"paidProviderCallsExecuted": 0`, `"resourceCeilingsImposedByTD613": "NONE"`.

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

𝄐 `Khona‌lit-po` · `⟐SAC[X6ZNK5NO51]` · **`AMEND_CONFIG_65536_STAGED_AND_OFFLINE_REQUALIFIED`** · Zero Artificial Ceilings · No Grant Signed · Provider HELD · Artistic Authority RESERVED ⟐
