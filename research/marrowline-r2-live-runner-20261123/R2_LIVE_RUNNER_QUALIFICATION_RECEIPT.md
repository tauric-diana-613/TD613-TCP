# 𝌋⟐ TD613 · KENOUGH HYDROGEN
## MARROWLINE R2 LIVE-RUNNER OFFLINE QUALIFICATION RECEIPT

- **Commission:** `TD613-MARROWLINE-R2-LIVE-RUNNER-20261123` (PR `#1783` Review `#6019546753` Pre-Dispatch Closure)
- **Covenant / Seal:** `Khona‌lit-po` (literal `U+200C` preserved) · `⟐SAC[X6ZNK5NO51]`
- **Status:** **`R2_LIVE_READY_HUMAN_AUTHORIZATION_REQUIRED`**
- **Draft PR:** `https://github.com/tauric-diana-613/TD613-TCP/pull/1783`
- **Preserved Prior PR `#1783` HEAD:** `7551116291436ac71ffe95ed936a25ea4a5c75bf`
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
| Edits to concurrent Vixen branches (`0221b49f0`, `36aa12c55`) | `0` |
| Source-pinned operator SPKI SHA-256 trust anchor | `840a71625f4b9db224871bbb126b6debc3fefdc9179b5628bd9faf514f2c7701` |

---

## 2. Review `#6019546753` Bounded Pre-Dispatch Corrections Implemented

1. **Shared Host-Wide Estate-Scoped Single-Use Nonce Registry (No Cross-Directory Replay):**
   - `claimR2SingleHostNonceAtomically()` (`r2-live-core.mjs`) now atomically claims (`flag: 'wx', mode: 0o600`) `<hostNonceRegistryDir>/${prefix}-nonce-${nonce}.json` inside a fixed non-relocatable host registry (`resolveFixedHostNonceRegistryDir`: `%LOCALAPPDATA%\TD613\marrowline-r2\host-nonce-registry\<estate>` on Windows; `$XDG_STATE_HOME/td613/marrowline-r2/host-nonce-registry/<estate>` on POSIX), independent of per-session `--evidence-dir`.
   - Each session directory receives an immutable pointer receipt (`${prefix}-nonce-ref-${nonce}.json`) verified alongside the shared host registry in `verifyPhysicalR2CustodyAndEvaluateGate()`. CLI relocation flags (`--host-nonce-registry*`) and executable option overrides fail closed (`R2_UNBOUNDED_FORBIDDEN_REGISTRY_RELOCATION` / `R2_UNBOUNDED_FORBIDDEN_EXECUTABLE_OVERRIDE`).
   - Cross-host / distributed replay guarantee remains explicitly `false` (`SINGLE_HOST_SHARED_ESTATE_REGISTRY_WX_ONLY_NOT_CROSS_HOST`).
2. **Signed Human Grant Binds Exact Plan Consent (`planId`, `episodeCount`, Ordered `episodes`, `planDigestSha256`):**
   - `computeR2PlanConsentScope()` (`r2-custody-gate-verifier.mjs`) computes the canonical plan digest:
     - `R2-U` `INITIAL_PILOT`: `c9d360e58fbb0c0bad3ffd2a6a09e2f2cf2e39f9f2558ff72a26b2e72687b788` (`1` episode, `['R2_U_GUIDED_RULES', 'R2_U_GUIDED_CONTRAST']`)
     - `R2-W` `INITIAL_PILOT`: `b8c64c2d070014ca2d156109b68184c21bb6155e35725df911718d8089c2c897` (`2` episodes across civic tribunal & noncivic orchard)
   - `buildUnsignedR2GrantPayload()` embeds `planId`, `episodeCount`, ordered `episodes`, and `planDigestSha256`. `verifyR2OperatorAuthorization()` verifies grant plan fields and compares against runtime `requestedPlanId` / `requestedEpisodes` BEFORE any nonce claim, metadata discovery, or `GEMINI_API_KEY` resolution (`R2_AUTH_PLAN_SCOPE_MISMATCH` / `R2_AUTH_MISSING_PLAN_SCOPE`). `Launch-R2Observation.ps1` forwards `-Plan` / `-EpisodesJsonPath` to `sign-r2-grant-interactive.mjs`. Episode consent scope does not impose output-token, byte, spend, or retry ceilings.
3. **Actual Measured Calibrated Monotonic Phase Timestamps & Honest Timebase Labeling:**
   - Removed all `1, 2, 3` placeholder phase integers and removed the `SINGLE_HOST_MONOTONIC_EPOCH_MS` label from raw `Date.now()` intervals.
   - `r2-live-core.mjs` now anchors single-process `process.hrtime.bigint()` monotonic offsets to startup epoch (`SINGLE_PROCESS_HRTIME_MONOTONIC_CALIBRATED_MS`), sets `actAt` only on actual generation dispatch and `worldAnswersAt` only on actual completed generation response (`null` if halted earlier, `nameAt: null`), and records raw OS wall-clock `Date.now()` snapshots separately in `wallClockSamplesMs`. `verifyPhysicalR2CustodyAndEvaluateGate()` rejects `MISLEADING_MONOTONIC_WALL_CLOCK_CLAIM` and preserves `preemptionGapMs: null` when unvalidated.

---

## 3. File Inventory & Exact UTF-8 / SHA-256 Digests (`LF`, Zero BOM, Zero Local-Path Leakage)

| File | UTF-8 Bytes | SHA-256 (verified pre-commit) |
|---|---:|---|
| `research/marrowline-r2-live-runner-20261123/Launch-R2Observation.ps1` | `9367` | `1222d17f04ef7ce829dc27248789312bffb1f957d7f828029236b5d66f63d5eb` |
| `research/marrowline-r2-live-runner-20261123/R2_ACQUISITION_PLANS.md` | `4090` | `7483eafd7a6294eee01bc351578a44f67429705a8374737f7c2898fdd741bd3f` |
| `research/marrowline-r2-live-runner-20261123/R2_HEALTHY_BASELINE_CORRELATION.json` | `3847` | `a71c46dda77bda783fb6d6cde6a56eebfaa9b9ffc847c9dce7eff7f142c990cc` |
| `research/marrowline-r2-live-runner-20261123/R2_LIVE_RUNNER_OPERATOR_CONTRACT.md` | `4507` | `2a50d1e098aa089cd2917db5b284b98f9d4ab1d0e07b6d75a025ef6896bf18cc` |
| `research/marrowline-r2-live-runner-20261123/r2-acquisition-plans.mjs` | `13347` | `df4344be6f4f545142f71b1e6060a07b8f8c01a4bb44b3f22beb468c412a0943` |
| `research/marrowline-r2-live-runner-20261123/r2-custody-gate-verifier.mjs` | `39972` | `b1f014920f7be998bec0be823b70ff8706581b8958f3a8369d6be39dfc7b5171` |
| `research/marrowline-r2-live-runner-20261123/r2-healthy-baseline-correlation.mjs` | `8275` | `6bebd74f4be328fc5a834c713ab976007d843ddbcafaa7b30a7ecded1c613013` |
| `research/marrowline-r2-live-runner-20261123/r2-live-core.mjs` | `39352` | `b0a8188b7119f6d3caa4edbde72874759cf8f4015e1c3e655500641f3ede5f9e` |
| `research/marrowline-r2-live-runner-20261123/r2-runner-cli-common.mjs` | `14110` | `b2022f47c45784d2e76195352c1716af13917770e25241aa03d2c320ecc8817a` |
| `research/marrowline-r2-live-runner-20261123/run-r2-u-observation.mjs` | `1055` | `03c317f72fe07f34c95a88838acc350cfd13455f9aba90afe57240d14ad305cc` |
| `research/marrowline-r2-live-runner-20261123/run-r2-w-observation.mjs` | `1061` | `3377dfa9f3287c89f5f0989990fb03079c5c50aa105b861cd3ad3bce96d36de4` |
| `research/marrowline-r2-live-runner-20261123/sign-r2-grant-interactive.mjs` | `8129` | `91c688d23b3684f1bc8156adb4d2851d67299d7cf6e694c0b293425054b0eb7f` |
| `research/marrowline-r2-live-runner-20261123/verify-r2-live-runner-offline.mjs` | `5663` | `76a5eb9da2c2b1ce9670175d75ea295624c857b37bb4a516d2448df620db4847` |
| `tests/marrowline-r2-live-runner.test.mjs` | `33324` | `7cdb6b5ab121a38407842ca0a19a5cdccf28e2b31483d0b65a898c0b26c23f9e` |
| `research/marrowline-r2-live-runner-20261123/R2_LIVE_RUNNER_QUALIFICATION_RECEIPT.md` | — | `COMMIT_OBJECT` |

---

## 4. Remaining Boundaries & Material Blockers

- **No Signed Live Grant:** `0` grants signed (`privateKeysAccessed: false`).
- **GitHub Actions CI Trigger Scope (`NO_CI_RUN_TRIGGERED_ON_STACKED_PR`):** `.github/workflows/td613-ci.yml:1-9` only triggers `pull_request` on `main` and listed Vixen branches (`gh run list` returns `[]` on stacked PR `#1783`).
- **`jsdom` Restoration Suite:** `tests/marrowline-screaming-grove-restoration.test.mjs` remains unexecuted in this `node_modules`-free git worktree.
- **Live Gemini API:** Unqueried (`0` network calls).

𝄐 `Khona‌lit-po` · `⟐SAC[X6ZNK5NO51]` · Review #6019546753 Fixed · Stopped at R2 LIVE-READY / HUMAN AUTHORIZATION REQUIRED ⟐
