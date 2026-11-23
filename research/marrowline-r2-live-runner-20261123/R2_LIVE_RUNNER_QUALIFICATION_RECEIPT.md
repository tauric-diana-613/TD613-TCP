# 𝌋⟐ TD613 · KENOUGH HYDROGEN
## MARROWLINE R2 LIVE-RUNNER OFFLINE QUALIFICATION RECEIPT

- **Commission:** `TD613-MARROWLINE-R2-LIVE-RUNNER-20261123`
- **Covenant / Seal:** `Khona‌lit-po` (literal `U+200C` preserved) · `⟐SAC[X6ZNK5NO51]`
- **Status:** **`R2_LIVE_READY_HUMAN_AUTHORIZATION_REQUIRED`**
- **Base Design Commit (PR `#1781`, untouched):** `7ff3a13f7e991e51ca7c3e032266fcd436f6d9ae` (`research/marrowline-r2-dual-estate-20261123`)
- **Base R1 Commit (PR `#1780`, untouched):** `d75618e6dfd6d51e0b8f268579d8192238cf6783`
- **Production Baseline (`origin/main`, untouched):** `0f67d8954347fdae77cdb83f82848df89ad3b2ff`
- **Isolated R2 Live-Runner Branch:** `research/marrowline-r2-live-runner-20261123`

---

## 1. Execution & Boundary Verification

| Invariant | Verified Value |
|---|---|
| Live Gemini / provider calls executed | `0` |
| Private keys / passphrases accessed | `false` (`0` real grants signed) |
| Local `wx` nonces claimed on disk | `0` |
| Edits to PR `#1780` (`R1`), PR `#1781` (`R2 design`), `origin/main` | `0` |
| Edits to concurrent Vixen branches / files | `0` |
| Source-pinned operator SPKI SHA-256 trust anchor | `840a71625f4b9db224871bbb126b6debc3fefdc9179b5628bd9faf514f2c7701` |

### Concurrent Vixen Synchronization Summary
- Remote refs synchronized via `git fetch origin --prune`: concurrent Vixen Cybernetics engineering on `origin/research/vixen-eighth-variable-prereg-20261122` (`0221b49f0`, Draft PR `#1777`) and `origin/research/vixen-seven-source-dev-review-20261123` (`36aa12c55`, Draft PR `#1782`) modifies `docs/research/vixen-eighth-variable-20261122/*` only — **zero shared files, zero integration dependencies, zero conflicts**, and zero edits to Vixen work.

---

## 2. Architecture & Requirement Coverage Summary

1. **R1 Architecture Reused Untouched:** Imports `geminiModelMetadataUrl`, `geminiCountTokensUrl`, `isSessionRevokedOnDisk`, `streamAndDualParseProviderSseToDisk`, `STREAM_READBACK_CHUNK_BYTES`, `FORBIDDEN_CEILING_GRANT_FIELDS`, and `R1_NATIVE_TRUSTED_OPERATOR_PUBLIC_KEY_SHA256` directly from the frozen R1 estate plus `geminiRequestHeaders`/`geminiStreamGenerateContentUrl` from `server/gemini-provider-transport.js`.
2. **Estate Isolation (`run-r2-u-observation.mjs` & `run-r2-w-observation.mjs`):**
   - `R2-U`: `td613.marrowline.r2-u-observation-authorization/v1-ed25519` (`TD613_R2_U_AUTH_V1`, `--ack-live-r2-u-observation`, `r2-u-*` nonces/journals/counters, all 5 frozen arms).
   - `R2-W`: `td613.marrowline.r2-w-observation-authorization/v1-ed25519` (`TD613_R2_W_AUTH_V1`, `--ack-live-r2-w-observation`, `r2-w-*` nonces/journals/counters, all 4 civic + noncivic conditions, blind Section-II packet `<out>.blinded.json`).
   - Enforces directory isolation (`R2_CROSS_ESTATE_EVIDENCE_DIR_CONTAMINATION`) and rejects cross-estate grants/ack flags/slot IDs before credential reads.
3. **Closed Gate Boundary (`r2-custody-gate-verifier.mjs`):** `verifyPhysicalR2CustodyAndEvaluateGate` refuses caller booleans as proof; verifies physical Ed25519 signature, SPKI fingerprint, HEAD, frozen manifest digests, `wx` nonce file, `.jsonl` journal, chunked `.sse` SHA-256 + independent on-disk `.sse` re-parse + `.authored.txt` SHA-256, and documented clock timebase before permitting `EMPIRICALLY_QUALIFIED`.
4. **Windows PowerShell Operator UX (`Launch-R2Observation.ps1` + `sign-r2-grant-interactive.mjs`):** Interactive masked passphrase & API key handling with automatic `finally` cleanup, default offline preflight, single-use grant signing, progress reporting, Ctrl+C / revocation STOP, and non-secret `.summary.txt`.
5. **Initial Preregistered Acquisition Plans & Limited-Run Guard (`r2-acquisition-plans.mjs`):** Separate R2-U and R2-W `INITIAL_PILOT`, single-slot/pair, and `FULL_PREREGISTERED_*` presets classifying partial/single pilots honestly (`LIMITED_INITIAL_SINGLE_OBSERVATION` / `SINGLE_COUNTERBALANCED_PAIR_ONLY`) rather than `MULTI_EPISODE_COUNTERBALANCED_COMPLETE`.
6. **Healthy Production Baseline Correlation (`r2-healthy-baseline-correlation.mjs` & `R2_HEALTHY_BASELINE_CORRELATION.json`):** Correlates R2-W civic and noncivic whole frames directly against the restored Oct 2 literal source baseline (`MARROWLINE_HISTORICAL_TRIAL_ID` = `historical-20261002-v1`, source commit `ffb98ac0050c99b07aef59ac3d200d8bee2e7e3a`; `+118` UTF-8 bytes delta, `142` exact shared lines, identical `generationConfigSha256: 4785e46e...`) and archived Sep/Oct comparison specimens while preserving `humanArtisticAuthority: 'RESERVED_HUMAN_ONLY'`.

---

## 3. Deliverable Inventory (`LF`, Zero BOM, Zero Local-Path Leakage)

All new modules, manifests, PowerShell launcher, documentation, and `tests/marrowline-r2-live-runner.test.mjs` are committed under `research/marrowline-r2-live-runner-20261123/` and `tests/marrowline-r2-live-runner.test.mjs` cleanly on branch `research/marrowline-r2-live-runner-20261123`. Exact pre-commit SHA-256 digests and post-commit offline verification results are recorded in the Draft PR overview and below.

---

## 4. Remaining Material Blockers Before Live Execution

1. **No Live Operator Grant Signed (Intentional Hold):** `0` signed R2-U or R2-W Ed25519 grants exist (`privateKeysAccessed: false`).
2. **GitHub Actions CI Trigger Scope (`NO_CI_RUN_TRIGGERED_ON_STACKED_PR`):** `.github/workflows/td613-ci.yml:1-9` only triggers `pull_request` on `main` / listed Vixen branches, so stacked R2 Draft PRs run zero automatic GitHub Actions checks (offline local/node test runs remain non-equivalent to hosted CI).
3. **`jsdom`-Dependent Restoration Test:** Isolated git worktrees lack `node_modules` (`tests/marrowline-screaming-grove-restoration.test.mjs` remains unexecuted due to missing `jsdom`, unchanged from R1/R2 base).
4. **Provider-Side Unqueried Reality:** Live availability of `models/gemini-3.8-flash`, live `outputTokenLimit === 65536` confirmation, `:countTokens`, and Gemini 3.8 hosted checkpoint behavior are intentionally unqueried (`0` network calls).

𝄐 `Khona‌lit-po` · `⟐SAC[X6ZNK5NO51]` · Stopped at R2 LIVE-READY / HUMAN AUTHORIZATION REQUIRED ⟐
