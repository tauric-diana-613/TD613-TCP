# Q1 Hardening & Qualification — Complete Successful, Failed, and Pre-Existing Test & CI Receipts Log

- **Commission:** `TD613-MARROWLINE-SCREAMING-GROVE-Q1`
- **Active PR:** `#1764` (`research/marrowline-screaming-grove-q1-preflight-20261121`)
- **Date:** `2026-11-21`
- **Paid Provider Calls Executed Across All Runs:** **`0`**

Per Section IV of the Operator Authorization, this log preserves **both** successful and failed test/CI receipts encountered during this hardening pass without concealing defects or manufacturing green states.

---

## 1. GitHub Actions Exact-Head CI Receipts

| PR | Commit SHA | Workflow | Run ID | Status / Conclusion | URL |
|---|---|---|---|---|---|
| `#1759` (parent visual-parity estate) | `026ac4636eba782364eab46404dfcadd9414e9e0` | `TD613 Consolidated Validation` | `44873359129` | `completed / success` (100% GREEN) | https://github.com/tauric-diana-613/TD613-TCP/actions/runs/44873359129 |
| `#1764` (initial Q1 preflight) | `67339318d5a430541a572c19833817271d69c5f3` | `TD613 Consolidated Validation` | `44942964461` | `completed / success` (100% GREEN) | https://github.com/tauric-diana-613/TD613-TCP/actions/runs/44942964461 |

*(Exact-head GitHub Actions CI run for the newly hardened commit on `#1764` will execute automatically on push and be verified before closing this turn.)*

---

## 2. Intermediate Failed Test Runs Caught & Resolved During Hardening (Preserved Truthfully)

1. **Production Observer Signature Defects Caught by Static Inspection (Predecessor `67339318d`):**
   - `run-q1-live-discriminator.mjs` @ `67339318d` called `observeGeminiOutput(parsed.text, opts)` instead of `observeGeminiOutput(mergedPayload, PINNED_MODEL, opts)` and `observeMarrowlineCompletion({ text, ... })` instead of `observeMarrowlineCompletion(canonicalText, observed, { streamed: true, parseErrors, creative })`.
   - **Resolution:** Fixed both call sites to match `server/khonapolit-quality.js` and `server/marrowline-completion.js` exactly, verified across all 9 zero-network negative controls.
2. **Intermediate Failure #1 — `EXPECTED_ARM_TASK_DIGESTS` Constant Mismatch (`1/9 pass, 8/9 fail`):**
   - `assertQ1RequestEquivalence` immediately caught a hand-transcribed tail-hex mismatch on `systemInstructionSha256` and `contentsSha256` before any synthetic fetch could execute (`Q1_PREFLIGHT_REQUEST_EQUIVALENCE_FAILED`).
   - **Resolution:** Loaded exact verbatim 64-hex digests from `67339318d:research/marrowline-screaming-grove-q1-20261121/Q1_EFFECTIVE_REQUESTS_PREFLIGHT.json` (plus `modelAndBodySha256`) and re-ran; confirmed 100% byte-for-byte digest parity with `67339318d` and `#1759`.
3. **Intermediate Failure #2 — Synthetic Test Helper Default-Parameter Bug (`7/9 pass, 2/9 fail`):**
   - In `tests/marrowline-q1-live-discriminator.test.mjs`, passing `{ modelVersion: undefined }` and `{ finishReason: undefined }` to `makeValidGeminiSse` triggered JavaScript destructuring defaults (`PINNED_MODEL` and `'STOP'`), causing the missing-`modelVersion` and missing-`finishReason` negative controls to fail.
   - **Resolution:** Updated `makeValidGeminiSse` to omit fields on `null` and updated both tests to pass `null`. Re-run passed **`9/9`**.

---

## 3. Final Passing Local Verification Receipts (Zero Paid Calls)

| Suite / Command | Result | Exact Counts / Exit | Notes |
|---|---|---|---|
| `node --test tests/marrowline-q1-live-discriminator.test.mjs` | **PASS** | `9/9 pass`, `0 fail`, `1040ms` | Proves malformed SSE (5 modes), canonical-vs-independent mismatch (`STOP_4`), unexpected & missing `modelVersion` (`STOP_1`), policy holds (`STOP_2`), `MAX_TOKENS`/unwitnessed non-promotion, mid-run parser/stream exception survival, exact-HEAD CLI refusal, zero extra calls, and 8×65k-token no-cap completion. |
| `node research/marrowline-screaming-grove-q1-20261121/run-q1-live-discriminator.mjs --dry-run` | **PASS** | `exit 0`, `paid_provider_calls_executed: 0` | `request_equivalence_ok: true`, `financial_ceiling: NONE_PER_OPERATOR_REVIEW_6007792790`. |
| `node research/marrowline-screaming-grove-q1-20261121/run-q1-live-discriminator.mjs --execute-live --operator-auth-sha=000...000` | **PASS (Fail-Closed Refusal)** | `exit 2`, `REFUSED_LIVE_EXECUTION` | Zero network calls. |
| Active CI Pure-Node Marrowline Suites (16 suites: `marrowline-q1-live-discriminator`, `marrowline-screaming-grove-restoration`, `marrowline-discovery-fragment-recovery`, `gemini-provider-quota-scope`, `marrowline-quota-evidence`, `marrowline-five-seat-frontier-cascade`, `marrowline-user-envelope`, `marrowline-episode-witness`, `marrowline-native-prosody`, `marrowline-response-quality-contract`, `khonapolit-relay`, `marrowline-terminal-continuation`, `marrowline-attachment-quality`, `marrowline-emergency-completion`, `marrowline-raw-sse-custody`, `marrowline-dollhouse-trial-contract`) | **PASS** | **`172/172 pass`**, `0 fail` | All pure-Node Marrowline CI contracts green. |
| `node tests/khonapolit-gemini-quality-router.test.mjs` | **PASS** | `exit 0` | Router contract green. |
| `npm run test:dollhouse:audits` (12 active CI Dollhouse audit suites) | **PASS** | **`134/134 pass`**, `0 fail`, `exit 0` | Complete Dollhouse source lineage, Pedagogue, Atlas, FADT, Aperture, continuity, export-kit, and claim-ceiling contracts green. |
| Additional Dollhouse Specialist Suites (`dollhouse-orchestration-invariants`, `dollhouse-closure-auditor`, `dollhouse-claim-ceilings`, `dollhouse-temporal-custodian`) + `khonapolit-api-contract` | **PASS** | **`29/29 pass`**, `0 fail` | Verified during combined regression sweep. |

---

## 4. Non-Passing Local / Legacy Observations Recorded Honestly (Not Weakened or Hidden)

1. **`tests/marrowline-fire-gate-pedagogue.test.mjs` (Worktree Dependency Boundary Only):**
   - Failed locally in the isolated Git worktree (`ERR_MODULE_NOT_FOUND: Cannot find package 'jsdom'`) because fresh Git worktrees do not carry a local `node_modules` directory.
   - Runs and passes cleanly in GitHub Actions `TD613 Consolidated Validation` after `npm ci` (verified GREEN in Run `44873359129` on `#1759` and Run `44942964461` on `#1764`).
2. **Two Pre-Existing Historical Tests Outside `.github/workflows/td613-ci.yml`:**
   - `tests/khonapolit-covenant.test.mjs` (expects legacy `/ADDRESS: Kʰonapolit/` text) and `tests/marrowline-attractor-quality-contract.test.mjs` (expects legacy `khonapolit-frontier-only-rejected-non-3x-or-lite-models` warning).
   - Both predate this commission (last touched at `eb90d7074` / `#1501`), are excluded from `.github/workflows/td613-ci.yml`, and were **not** altered or weakened by Q1 hardening.
