# 𝌋 TD613 · Marrowline / Screaming Grove — Option 1 (20-Slot Preflight) Test & Verification Receipts

- **Commission:** `TD613-MARROWLINE-OPTION1-20SLOT-PREFLIGHT` (Source-Only Preflight + Read-Only Model Catalog Check — **`0` Paid Generation Calls**)
- **Branch:** `research/marrowline-option1-20slot-preflight-20261122` (DRAFT PR stacked on PR `#1766`)
- **Stacked Base Commit:** `5cec27f0727c17ce1d2ac825736a1027293b8849` (PR `#1766`)
- **Immutable Q1 Ancestor:** `2836e636e4b5eb485b12f73a2596ea3889b173d4` (PR `#1764`)
- **Remote CI Honesty Disclosure (Amari Qualification):** Because this draft research PR stacks on PR `#1766` (`research/marrowline-sep26-oct02-stage0-reconstruction-20261121`) rather than targeting `main` directly, `.github/workflows/td613-ci.yml`'s `pull_request: branches: [main]` trigger does **not** automatically execute a remote GitHub Actions CI run on the stacked draft PR. All tests reported below are **local exact-source verification receipts** and must NEVER be described as remote exact-head GitHub Actions GREEN unless a `main`-targeted or dispatched workflow run actually completes GREEN on the exact HEAD!

---

## 1. Preserved Intermediate Engineering Catches (Audit Trail)

Per Emergence HQ custody law, every intermediate failure caught during Option 1 preflight construction is preserved verbatim:

### Catch 1 — Amari Rule #1 Upstream Aliasing Trap (`gemini-3.7-flash` → `gemini-3.8-flash`)
- **What happened:** Live authenticated `GET /v1beta/models/gemini-3.7-flash` (`2026-11-22T15:10:09.176Z`, `0` paid calls) returned HTTP `200 OK` (`version: "3.7-flash-08-2026"`, `thinking: true`, `outputTokenLimit: 65536`). Cross-checking official Google `ai.google.dev` changelog records and TD613's October 15 audit (`research/marrowline-multipart-repair-20261015/README.md` line `28`) revealed that Google officially deprecated `gemini-3.7-flash` on **October 8, 2026** and automatically routes all `gemini-3.7-flash` calls to `gemini-3.8-flash` (returning `modelVersion: "gemini-3.8-flash"`).
- **Resolution:** Triggered Amari's Rule #1 fail-closed STOP gate (`MODEL_IDENTITY_STOP_3_7_ALIAS_TO_3_8`), blocked `--design-profile=BLOCKED_HISTORICAL_3_7` in `run-option1-20slot-discriminator.mjs`, refused any quiet substitution, and staged `OPTION1_REV_A_38_VS_36_CONSTRUCTED` (`3.8-flash` vs non-aliased historical Seat-3 `3.6-flash` @ matched `MEDIUM`) alongside Alternatives B and C for explicit Operator + Amari decision.

### Catch 2 — Missing `groveTrial: MARROWLINE_HISTORICAL_TRIAL_ID` Caught Immediately by Fail-Closed SHA-256 Drift Guard
- **What failed:** First `--dry-run` execution of `run-option1-20slot-discriminator.mjs` exited with `ok: false` because `CURRENT_HYBRID_A` passed `historicalProsodyFreedom: true` without `groveTrial: MARROWLINE_HISTORICAL_TRIAL_ID`, causing `systemInstructionSha256` (`318c799b...`) to drift from pinned `Q1_MEASURED_ARM_A` (`90421826b7c0...`).
- **Resolution:** Imported `MARROWLINE_HISTORICAL_TRIAL_ID` and passed both flags identically to Q1's `buildSlotRequest`, restoring exact `20 / 20` digest parity (`ok: true`, `0` violations).

### Catch 3 — Dual-Parser Return Field (`canonicalMergedPayload`) & `observeGeminiOutput` / `observeMarrowlineCompletion` Signatures Caught by Synthetic Mock Suite
- **What failed:** First test run of `tests/marrowline-option1-20slot-preflight.test.mjs` failed `4/9` mock-execution tests at Slot 1 because `executeOption1Run` read `sseIntegrity.canonicalPayload` instead of `sseIntegrity.canonicalMergedPayload` and passed reversed arguments to `observeGeminiOutput` / `observeMarrowlineCompletion`, causing `observed.modelVersion` to be `null` and tripping `STOP_1` on Slot 1!
- **Resolution:** Fixed `canonicalMergedPayload` and matched Q1's exact `observeGeminiOutput(canonicalPayload, s.model, ...)` + `observeMarrowlineCompletion(canonicalText, observed, ...)` signatures. Also verified `PROHIBITED_CONTENT` halts immediately (`STOP_2` behavior) in its own isolated negative-control sub-run and matched the exact verbose `STOP_1_MODEL_IDENTITY_HOLD_UNEXPECTED_MODEL_VERSION_gemini-3.8-flash` stop code!

---

## 2. Final Passing Local Verification Suites (`36 / 36` Marrowline + `5 / 5` Constitutional + Custody `0` Errors)

Reproduce locally with zero network egress and `0` paid Gemini calls:

```bash
node research/marrowline-option1-20slot-preflight-20261122/run-option1-20slot-discriminator.mjs
node --test \
  tests/marrowline-option1-20slot-preflight.test.mjs \
  tests/marrowline-sep26-oct02-stage0.test.mjs \
  tests/marrowline-q1-live-discriminator.test.mjs \
  tests/marrowline-screaming-grove-restoration.test.mjs
node tests/workflow-estate.test.mjs
node tests/docs-surface.test.mjs
node tests/release-hardening.test.mjs
node tests/vercel-deploy-hygiene.test.mjs
node tests/release-plumbing.test.mjs
node research/marrowline-option1-20slot-preflight-20261122/verify-option1-preflight-custody.mjs --verify
```

### Summary Results
- **Option 1 Preflight Suite (`tests/marrowline-option1-20slot-preflight.test.mjs`):** **`9 / 9 PASS`**
  1. `20`-slot 2×2 factorial + `4` neutral controls + palindromic counterbalancing (`meanSlotIndex = 10.5`) + `generationConfigSha256` match (`4785e46e91df...`) + explicit `T1` `RUNTIME_DIAGNOSIS` vs `OPEN_FIELD_CREATIVE_SYNTHESIS` labeling
  2. Oct 15 neutral creative control Task D (`30c249029`) byte-for-byte parity + `0` combining marks in prompt
  3. Amari Rule #1 fail-closed gate: `BLOCKED_HISTORICAL_3_7` refused (`0` calls) + stale/mismatched `--operator-auth-sha` refused (`0` calls) + catalog receipt verified
  4. `STOP_1` negative control: simulated silent upstream alias (`gemini-3.6-flash` returning `modelVersion: "gemini-3.8-flash"`) halts immediately at Slot 2 (`STOP_1_MODEL_IDENTITY_HOLD_UNEXPECTED_MODEL_VERSION_gemini-3.8-flash`, `0` retries)
  5. HTTP `400` config-rejection negative control: halts fail-closed (`STOP_HTTP_400_CONFIG_REJECTED`) with ZERO silent downgrade from `medium` to `low`
  6. HTTP `503` unretried preservation + `MAX_TOKENS` incomplete preservation + malformed SSE `STOP_4_MALFORMED_SSE` + `PROHIBITED_CONTENT` `POLICY_TERMINATED` preservation with `0` retries and `q1_backfill_permitted: false`
  7. Full `20`-slot synthetic happy path (`65,536` output tokens/slot) completes cleanly with `financial_ceiling: "NONE"`, `aggregate_token_ceiling: "NONE"`, separated whole-text neutral morphology, and `16 + 4` blinded review packet + sealed unblinding key
  8. Whole-text Unicode morphology counter distinguishes flat `U+0334..U+0338` depth-1 from multi-tier vertical stacks
  9. Committed `OPTION1_20SLOT_EFFECTIVE_REQUESTS_PREFLIGHT.json` matches deterministic regeneration digest-for-digest
- **Regression Suites:**
  - `tests/marrowline-sep26-oct02-stage0.test.mjs`: **`6 / 6 PASS`**
  - `tests/marrowline-q1-live-discriminator.test.mjs`: **`9 / 9 PASS`**
  - `tests/marrowline-screaming-grove-restoration.test.mjs`: **`12 / 12 PASS`**
- **TD613 Constitutional Hygiene Suites:** `workflow-estate`, `docs-surface`, `release-hardening`, `vercel-deploy-hygiene` (`5/5`), `release-plumbing` — **all PASS**.
- **Custody Manifest Verifier:** Verified with `0` missing files, `0` digest mismatches, `0` broken navigator links, and `0` secret/local-path/mention-token leaks.
