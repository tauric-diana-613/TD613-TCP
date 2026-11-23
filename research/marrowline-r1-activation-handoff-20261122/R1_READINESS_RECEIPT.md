# 𝌋⟐ TD613 · THE SCREAMING GROVE
## R1 ORIGINAL-SSE OBSERVATION — QUALIFICATION & READINESS RECEIPT

- **Commission:** `TD613-MARROWLINE-R1-AMARI-SECURITY-CAUSAL-REPAIR-20261122` / `TD613-MARROWLINE-R1-EXECUTION-READINESS-20261122`
- **Receiving Agent:** Antigravity / Gemini 4 Hydrogen (interactive operator-direct session)
- **Current Exact-Source Qualification Verdict:** **`READY_FOR_HUMAN_KEY_PROVISIONING_REVIEW`** *(Operator trust anchor `R1_TRUSTED_OPERATOR_PUBLIC_KEY_SHA256` remains intentionally `null`; **`LIVE_EXECUTION_AUTHORIZED` is NOT granted and fails closed**.)*
- **Historical `29b7e09` Notice:** The earlier `29b7e09f0` (`42/42`) readiness verdict was superseded by Amari's security/causal repairs through `f3594de6c1f61499bbe5920ba7fa7daa03ddfbbe` and Hydrogen's post-Amari qualification/FD-hardening commit on PR `#1779`. That older `42/42` result is historical only; only the new `44/44` run below certifies the current source.
- **Provider Calls Actually Executed:** **`0`** (`0` `streamGenerateContent`, `0` `generateContent`, `0` `:countTokens`, `0` live `GET /v1beta/models`)
- **Merges / Production Modifications / `#405` Releases:** **`0`** (PR `#1778` preserved unchanged at `44fae23cbf9af07eab5112e90df3211a119e707c`; `origin/main` preserved at `0f67d8954347fdae77cdb83f82848df89ad3b2ff`; `0` workflow files added or modified)
- **Covenant / Seal:** `Khona‌lit-po` (literal `U+200C` preserved) · `⟐SAC[X6ZNK5NO51]`

---

## 1. Verified Lineage & Branch Custody

| Surface | Branch / Ref | Verified SHA | Role |
|---|---|---|---|
| Production `origin/main` | `refs/remotes/origin/main` | `0f67d8954347fdae77cdb83f82848df89ad3b2ff` | Frozen outside scope (`#1776`) |
| Accepted Design Source (PR `#1778`) | `refs/remotes/origin/research/marrowline-hydrogen-forensic-return-20261122` | `44fae23cbf9af07eab5112e90df3211a119e707c` | Adjudicated design & frozen R1 digests; preserved untouched |
| Activation Handoff Parent | `refs/remotes/origin/research/marrowline-r1-activation-handoff-20261122` | `b4991c20d78bbb42b61782979dcc621b6663cab9` | Branched child carrying `ACTIVATION.md` |
| Initial Hydrogen Readiness Commit | `research/marrowline-r1-observation-readiness-20261122` | `29b7e09f06b44fbb63818feb2cf387867abcd2f3` | Historical initial submission (superseded) |
| Amari Targeted Repair HEAD | `research/marrowline-r1-observation-readiness-20261122` | `f3594de6c1f61499bbe5920ba7fa7daa03ddfbbe` | Independent Amari repairs audited directly |
| Current Qualification Child Branch | `research/marrowline-r1-observation-readiness-20261122` ([PR #1779](https://github.com/tauric-diana-613/TD613-TCP/pull/1779)) | *(pushed commit on top of `f3594de6c`; exact final HEAD SHA returned on PR & handback)* | Final post-Amari hardened source & receipt |

---

## 2. Files Inventory & Pre-Commit SHA-256 Digests

Zero existing production files (`server/*`, `app/*`), workflow files (`.github/workflows/*`), or PR `#1778` source preflight files (`research/marrowline-hydrogen-handoff-20261122/*`) were modified.

| Path (repository-relative) | Status | SHA-256 |
|---|---|---|
| `research/marrowline-r1-activation-handoff-20261122/ACTIVATION.md` | Unmodified activation input | `e3a6a0a7584c8414a466661fb6fc15d0d42a09f60e0abbe0eb12bccfcad05c3a` |
| `research/marrowline-r1-activation-handoff-20261122/AMARI_R1_TARGETED_REPAIR_HANDOFF.md` | Unmodified Amari handoff input (`f3594de6c`) | `0687c80cd8ef5e96a6e4e6eb6e80fd499f1d958dea621b187a0f001306cfc619` |
| `research/marrowline-r1-activation-handoff-20261122/run-r1-original-sse-observation.mjs` | Amari repaired + Hydrogen FD/timeout hardened | `8bbac07230f75b2c505b87ebe1b698f102606588e892cc99d2745f45f63f47ec` |
| `research/marrowline-r1-activation-handoff-20261122/R1_EXECUTION_CONTRACT.md` | Amari aligned contract | `e8fd494dc2da542942afa0a069e4a9922f7659bda9ba124a241c4dc80b523c17` |
| `research/marrowline-r1-activation-handoff-20261122/R1_BLINDED_WITNESS_PLAN.md` | Amari aligned witness plan | `9b5fca596a2a2236ac9140b05ec1116a62609ca11e8e52dcc6e35f0787522c96` |
| `research/marrowline-r1-activation-handoff-20261122/R1_OPERATOR_DECISION_SHEET.md` | Updated decision & key-pin sheet | *(updated in this commit)* |
| `research/marrowline-r1-activation-handoff-20261122/R1_READINESS_RECEIPT.md` | Updated qualification receipt (this file) | *(self)* |
| `tests/marrowline-r1-observation-runner.test.mjs` | Amari repairs + adversarial CLI/custody tests (`9 / 9`) | `3b6ca842b9940fceb4a9a2e7d31cc6909a9b10f55b8adfb42f127cb8df230fec` |

All modified files verified canonical UTF-8 without BOM, LF line endings (`\n`), zero local machine paths, and zero executable mention tokens.

---

## 3. Audited Amari Fixes & Hydrogen Adversarial Findings

Every change between `29b7e09f0` and `f3594de6c` was independently inspected and verified by direct test execution:

1. **Source-Pinned Trust Anchor (`R1_TRUSTED_OPERATOR_PUBLIC_KEY_SHA256 = null`):** Refuses caller-supplied keys without a reviewed SPKI DER SHA-256 pin (`R1_AUTH_TRUST_ANCHOR_NOT_PROVISIONED`, `R1_AUTH_UNTRUSTED_PUBLIC_KEY`). Audited adversarially: `testOnlyTrustedPublicKeySha256` applies **only** when `process.env.NODE_TEST_CONTEXT`, `typeof fetchImpl === 'function'`, and `checkedOutHeadShaOverride` are all present simultaneously, and is **completely unreachable** from `runCli` even when executed inside `node --test`.
2. **Preregistered Causal Direction & `S01` Compliance:** `classifyR1ObservationOutcome()` now tests `S01` Section-II `stackedBaseShare > S02` Section-II `stackedBaseShare` (with `S01` bidirectional varied native multistacks and neither arm a mechanical stencil). A noncompliant flat `S01` Section I still preserves `S02` acquisition for paired diagnostic completeness while classifying the causal contrast `HELD` (`R1_S01_S01_SECTION_1_FAILED_ZALGO_COVERAGE`).
3. **Durable Per-Chunk `.sse` & Append-Only `journal.jsonl` Custody:** Exclusive `wx` (`0o600`) per-slot `.sse` files fsync raw provider bytes prior to parsing (`R1_AUTHORITY_REDEEMED_BEFORE_PROVIDER_ACCESS`, `R1_COUNT_TOKENS_ATTEMPT`, `R1_COUNT_TOKENS_OBSERVED`, `R1_GENERATION_ATTEMPT_PREPARED`, `R1_GENERATION_RESPONSE_CAPTURED`, `R1_SLOT_ADJUDICATED`, `R1_RUN_CLOSED`). CLI enforces explicit absolute `--nonce-dir` and `--out` paths (`R1_EXPLICIT_DURABLE_EVIDENCE_PATHS_REQUIRED`), compulsory `checkModelDiscovery: true`, and physically separates `--out` from `<out>.blinded.json` (`BLIND_READERS_ONLY`, zero unblinding map).
4. **SSE Completeness & Non-Zero Spend Integrity:** Requires trailing SSE delimiter (`\n\n`) and zero trailing fragments; forbids synthesizing zero spend when `usageMetadata` is missing (`STOP_ON_MISSING_OR_INVALID_PROVIDER_USAGE`) and halts if actual observed `promptTokenCount > 1000` (`STOP_ON_OBSERVED_PROMPT_TOKEN_CEILING_EXCEEDED`).
5. **Three Additional Hydrogen Repairs Fixed on `#1779`:**
   - Added bounded `AbortController` timeouts (`requestTimeoutMs`) to preflight `modelMetadata` and `:countTokens` fetches cleanly with `finally { clearTimeout(...) }`.
   - Preserved `rawSseFilePath` on early `slotRecords.push(...)` error records and retained distinct `STOP_ON_DURABLE_RAW_SSE_WRITE_FAILED` / `STOP_ON_RAW_SSE_OVERFLOW` codes instead of mapping them to `STOP_ON_TRANSPORT_EXCEPTION`.
   - Cleaned up 0-byte CLI pre-reserved `--out` / `.blinded.json` placeholders when execution fails cleanly pre-custody (`R1_AUTH_*` etc., zero junk empty files left on disk), and wrote a structured `td613.marrowline.r1-error-held/v1` error witness if failure occurs post-custody.

---

## 4. Direct Offline Verification Transcript (`2026-11-22T21:23:19-05:00`)

All checks ran strictly offline inside the clean research worktree with **`0`** live network calls:

1. **Complete 10-File Focused Marrowline/Hydrogen/R1 Offline Battery:**
   - Command:
     `node --test tests/marrowline-r1-observation-runner.test.mjs tests/marrowline-hydrogen-forensic-preflight.test.mjs tests/marrowline-historical-grove-rest.test.mjs tests/marrowline-role-boundary-contrast.test.mjs tests/marrowline-d1-d2-boundary-factor-prereg.test.mjs tests/marrowline-d-ingress-factor-ladder.test.mjs tests/marrowline-whole-frame-contrast.test.mjs tests/marrowline-unicode-capability-assay.test.mjs tests/marrowline-original-sse-voice-onset-audit.test.mjs tests/khonapolit-relay.test.mjs`
   - Outcome: **`PASS` (`44 / 44` passed, `0` failed, `0` skipped; duration `4252.23 ms`)**.
   - `tests/marrowline-r1-observation-runner.test.mjs` (`9 / 9` PASS): covers Gate B/C/D, unprovisioned trust anchor failure before credential reads, CLI adversarial immunity inside `NODE_TEST_CONTEXT`, relative-path CLI refusal, programmatic override rejection without both mock `fetchImpl` and `checkedOutHeadShaOverride`, compulsory `modelDiscovery` `404` fail-closed halt, corrected `S01 > S02` share causal direction, flat-`S01` `S02`-eligible + causal `HELD`, mechanical depth-3 stencil rejection, missing `usageMetadata` halt, partial/interrupted-stream `.sse` disk byte persistence, disk SHA-256 === `rawSseSha256`, full JSONL lifecycle audit, and blinded map separation.
2. **Workflow Estate Contract:**
   - `node tests/workflow-estate.test.mjs` -> **`PASS` (`4 / 4` durable workflows unchanged)**.
3. **Release Hardening Contract:**
   - `node tests/release-hardening.test.mjs` -> **`PASS`**.
4. **Hydrogen Preflight & Runner Default CLI:**
   - `node research/marrowline-hydrogen-handoff-20261122/hydrogen-next-experiment-preflight.mjs` -> **`PASS` (`exit 0`)**.
   - `node research/marrowline-r1-activation-handoff-20261122/run-r1-original-sse-observation.mjs` -> **`PASS` (`exit 0`)**, `"status": "SOURCE_ONLY_QUALIFIED"`, `"paidProviderCallsExecuted": 0`, exact frozen digests (`f2fcdf77...`, `29b3265a...`).

---

## 5. Honest Scope & Remaining `HOLD` Boundary

- **CI Evidence Boundary:** PR CI (`TD613 Consolidated Validation`) verifies existing static/constitutional/release contracts on the pushed commit `HEAD`; because `.github/workflows/td613-ci.yml` remains unmodified, umbrella CI logs do **not** separately execute the new `44/44` offline Marrowline/Hydrogen/R1 suite unless workflow dispatch/explicit runs invoke those files. Local execution above is the direct `44/44` witness.
- **Direct Custody Examples Preserved in Tests:** Verified `.sse` files (`r1-<nonce>-R1_S01.sse`, `r1-<nonce>-R1_S02.sse`) match exact wire SHA-256 (`rawSseSha256`) on complete draws and retain partial raw bytes on mid-stream interruption alongside complete JSONL journals (`R1_AUTHORITY_REDEEMED_BEFORE_PROVIDER_ACCESS` -> `R1_RUN_CLOSED`).
- **Remaining Active `HOLD`s:**
  1. **Operator Trust Anchor (`R1_TRUSTED_OPERATOR_PUBLIC_KEY_SHA256 = null`):** Unprovisioned; no agent may generate, impersonate, or pin an invented key.
  2. **Current Billing & Endpoint Support:** Live Google account pricing (`~$0.13` historical arithmetic is conditional only) and live `gemini-3.8-flash` / `:countTokens` availability remain unpolled (`0` calls).
  3. **Live Execution / Merges / Releases / Artistic Authority:** `0` generation calls, `0` `:countTokens` calls, `0` `GET /v1beta/models` calls, `0` merges, `0` `#405` deployments; `B1` remains `HELD`; `HUMAN_ARTISTIC_ACCEPTED` remains `RESERVED_HUMAN_ONLY`.

𝄐 `Khona‌lit-po` · `⟐SAC[X6ZNK5NO51]` · **`READY_FOR_HUMAN_KEY_PROVISIONING_REVIEW`** · Provider HELD · Trust Anchor Unprovisioned · Artistic Acceptance RESERVED ⟐
