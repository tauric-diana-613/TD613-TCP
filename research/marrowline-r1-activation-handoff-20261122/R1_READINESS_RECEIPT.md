# 𝌋⟐ TD613 · THE SCREAMING GROVE
## R1 ORIGINAL-SSE OBSERVATION — QUALIFICATION & READINESS RECEIPT

- **Commission:** `TD613-MARROWLINE-R1-EXECUTION-READINESS-20261122`
- **Receiving Agent:** Antigravity / Gemini 4 Hydrogen (interactive operator-direct session)
- **Historical Hydrogen qualification verdict at HEAD `29b7e09`:** `READY_FOR_OPERATOR_EXECUTION_AUTHORIZATION` (NOW SUPERSEDED by Amari's targeted source corrections and HOLD pending fresh focused offline tests, an independent key trust anchor, and current billing checks). This document preserves Hydrogen's original local test receipt; do not transplant its `42/42` claim to the new commit.
- **Provider Calls Actually Executed:** **`0`** (`0` `streamGenerateContent`, `0` `generateContent`, `0` `:countTokens`, `0` live `GET /v1beta/models`)
- **Merges / Production Modifications / `#405` Releases:** **`0`** (PR `#1778` preserved unchanged at `44fae23cbf9af07eab5112e90df3211a119e707c`; `origin/main` preserved at `0f67d8954347fdae77cdb83f82848df89ad3b2ff`; `0` workflow files added or modified)
- **Covenant / Seal:** `Khona‌lit-po` (literal `U+200C` preserved) · `⟐SAC[X6ZNK5NO51]`

---

## 1. Starting Baseline & Branch Custody

| Surface | Branch / Ref | Verified SHA | Role |
|---|---|---|---|
| Production `origin/main` | `refs/remotes/origin/main` | `0f67d8954347fdae77cdb83f82848df89ad3b2ff` | Frozen outside scope (`#1776`) |
| Accepted Design Source (PR `#1778`) | `refs/remotes/origin/research/marrowline-hydrogen-forensic-return-20261122` | `44fae23cbf9af07eab5112e90df3211a119e707c` | Adjudicated design & frozen R1 digests; preserved untouched |
| Activation Handoff Parent | `refs/remotes/origin/research/marrowline-r1-activation-handoff-20261122` | `b4991c20d78bbb42b61782979dcc621b6663cab9` | Branched child carrying `ACTIVATION.md`; starting parent of this branch |
| Readiness Child Branch | `research/marrowline-r1-observation-readiness-20261122` | *(new commit created from `b4991c20d`; exact pushed HEAD SHA bound on PR & chat receipt prior to any operator grant)* | Isolated research-only staging branch & Draft PR targeting `main` |

---

## 2. Files Added & Pre-Commit SHA-256 Inventory

Zero existing tracked files (`server/*`, `app/*`, `.github/workflows/*`, `research/marrowline-hydrogen-handoff-20261122/*`) were modified.

| Path (repository-relative) | Status | SHA-256 |
|---|---|---|
| `research/marrowline-r1-activation-handoff-20261122/ACTIVATION.md` | Unmodified parent input | `e3a6a0a7584c8414a466661fb6fc15d0d42a09f60e0abbe0eb12bccfcad05c3a` |
| `research/marrowline-r1-activation-handoff-20261122/run-r1-original-sse-observation.mjs` | Added (R1 observation runner) | `241acc66fc5506b0ac03d83e985dc14389deea2e0be91865ac88a88dc2ae557d` |
| `research/marrowline-r1-activation-handoff-20261122/R1_EXECUTION_CONTRACT.md` | Added (Deliverable 2) | `eb5b0420d599fa9e6fc7f5612d257399ec7d3df1e70352be48916fce09c178ff` |
| `research/marrowline-r1-activation-handoff-20261122/R1_OPERATOR_DECISION_SHEET.md` | Added (Deliverable 3) | `fe8b442f9d2ac20b0c935f0a3cf60bb8a3af2be8922d229cf31d92fd3d5d2b06` |
| `research/marrowline-r1-activation-handoff-20261122/R1_BLINDED_WITNESS_PLAN.md` | Added (Deliverable 4) | `44570b524acb99c9287995b78f0c48471b2125ff929651a33e5c87f5e0ac0024` |
| `tests/marrowline-r1-observation-runner.test.mjs` | Added (Adversarial Gate B/C/D suite) | `36aa506f1bf0932efbdc9fb158bee6a270f35fb9e1b6e0a4a05df12602ec6c5a` |
| `research/marrowline-r1-activation-handoff-20261122/R1_READINESS_RECEIPT.md` | Added (Deliverable 1 — this file) | *(self)* |

All new files verified canonical UTF-8 without BOM, LF line endings (`\n`), zero local machine paths, and zero executable mention tokens.

---

## 3. Exact Offline Verification Commands & Results (`2026-11-22T20:55:13-05:00`)

All commands ran strictly offline inside the isolated research worktree with **`0`** live network requests:

1. **Combined Offline Marrowline/Hydrogen + R1 Runner Qualification Battery (`10` test files):**
   - Command:
     `node --test tests/marrowline-r1-observation-runner.test.mjs tests/marrowline-hydrogen-forensic-preflight.test.mjs tests/marrowline-historical-grove-rest.test.mjs tests/marrowline-role-boundary-contrast.test.mjs tests/marrowline-d1-d2-boundary-factor-prereg.test.mjs tests/marrowline-d-ingress-factor-ladder.test.mjs tests/marrowline-whole-frame-contrast.test.mjs tests/marrowline-unicode-capability-assay.test.mjs tests/marrowline-original-sse-voice-onset-audit.test.mjs tests/khonapolit-relay.test.mjs`
   - Outcome: **`PASS` (`42 / 42` tests passed, `0` failed, `0` skipped; duration `2579.76 ms`)**.
   - Breakdown: `7 / 7` tests in `tests/marrowline-r1-observation-runner.test.mjs` covering Gates B, C, and D (`0` calls default CLI, poisoned `fetch`, trapped `GEMINI_API_KEY` getter, absent/malformed/unsigned/tampered/wrong-key/wrong-HEAD/expired/`>30m`-TTL/covenant-stripped/Argon grants, changed request/contents/config/B1/hidden-3rd-slot, atomic `wx` nonce replay, `:countTokens` `404`/`invalid`/`>1000`/`>2000`, HTTP `503`, `>16384` output ceiling, policy finish `PROHIBITED_CONTENT`, wrong served `modelVersion`, partial/truncated/duplicate SSE, timeout, transport error, altered Unicode text, and valid complete flat `S01` leaving `S02` eligible + `S02` Section-I combining-mark `HELD` + depth-3 stencil `NOT_ESTABLISHED`).
   - Included byte-for-byte JSON parity verification for `HYDROGEN_NEXT_EXPERIMENT_PREFLIGHT.json` (`3 / 3` tests in `tests/marrowline-hydrogen-forensic-preflight.test.mjs`).
2. **Workflow Estate Contract:**
   - Command: `node tests/workflow-estate.test.mjs`
   - Outcome: **`PASS` (`4 / 4` durable workflows unchanged)**.
3. **Release Hardening Contract:**
   - Command: `node tests/release-hardening.test.mjs`
   - Outcome: **`PASS`**.
4. **R1 Default Runner CLI Offline Verification:**
   - Command: `node research/marrowline-r1-activation-handoff-20261122/run-r1-original-sse-observation.mjs`
   - Outcome: **`PASS` (`exit 0`)**, emitted `"status": "SOURCE_ONLY_QUALIFIED"`, `"paidProviderCallsExecuted": 0`, and exact frozen digests (`f2fcdf77...`, `29b3265a...`).
5. **Hydrogen Preflight CLI Check:**
   - Command: `node research/marrowline-hydrogen-handoff-20261122/hydrogen-next-experiment-preflight.mjs`
   - Outcome: **`PASS` (`exit 0`)**.

---

## 4. Honest CI Scope, Limitations, and Explicit `HOLD` List

- **CI Evidence Distinction:** Pushing this child Draft PR triggers `TD613 Consolidated Validation` (`Static, constitutional, and release contracts`) on the exact pushed `HEAD` SHA, which independently validates `workflow-estate`, `release-hardening`, and existing repository contracts in CI logs. Because Gate A forbids adding or altering GitHub workflow files, CI's fixed test manifest does not separately execute the newly staged `tests/marrowline-r1-observation-runner.test.mjs` or `tests/marrowline-hydrogen-forensic-preflight.test.mjs` files; those offline test executions are locally witnessed here (`42 / 42` pass) and **never** misattributed as CI steps.
- **No Original Google SSE Acquisition Yet:** Offline GREEN establishes instrument correctness and fail-closed custody only. It never constitutes original-Google-SSE empirical data or artistic restoration.
- **Single-Host Replay Guard Only:** Local `wx` nonce redemption protects against replay on the same host filesystem (`--nonce-dir`); it provides **zero** cross-host distributed exclusion.
- **Worktree `jsdom` Scope:** Browser/DOM `jsdom` suites remain `NOT_RUN_IN_WORKTREE` because isolated worktrees intentionally omit `npm ci` `node_modules`.
- **Unverified Live Pricing & Endpoint Availability:** Live Google account pricing and live `models/gemini-3.8-flash` / `:countTokens` endpoint availability were not polled (`0` `GET /v1beta/models` calls). The `~$0.13` worst-case figure in `R1_OPERATOR_DECISION_SHEET.md` is arithmetic over prior repo-recorded Gemini Developer API rates.

### Additional Amari independent red-pen HOLDs (subsequent source)

- **Operator trust anchor:** code now defaults to `R1_TRUSTED_OPERATOR_PUBLIC_KEY_SHA256 = null` and will refuse actual live authorization until an independent human-controlled key fingerprint is source-pinned and reviewed.
- **Corrected source:** the runner's causal scoring, SSE custody, token usage validation, and offline fixtures have changed since the original SHA inventory. Its old `42/42` result belongs to its historical HEAD only. Run the revised suite and capture a new exact-head receipt before human authorization.
- **Blinded literary review:** the corrected CLI now separates custodian `--out` from `<out>.blinded.json`; do not expose the unblinding map before independent scoring.
- **Original provider bytes:** now written and fsynced incrementally to exclusive local per-slot `.sse` files with a journal; protect and collect this directory even on a failed attempt.
- **Live price/model:** current official provider rates and model availability are unverified; historical arithmetic is conditional.

### Explicit HOLDs Remaining in Effect

- **`HELD`:** Live `gemini-3.8-flash` generation calls (`R1_S01`, `R1_S02`) — awaiting separate explicit operator `AUTHORIZE` gesture and offline Ed25519 grant bound to final pushed `HEAD`.
- **`HELD`:** Live `:countTokens` calls and live `GET /v1beta/models` calls (`0` executed).
- **`HELD`:** Backup `B1` (`gemini-4-argon`) and legacy Argon `B/E` Stage 1.
- **`HELD`:** PR `#1778` untouched at `44fae23cbf9af07eab5112e90df3211a119e707c`; production `main` untouched at `0f67d8954347fdae77cdb83f82848df89ad3b2ff`.
- **`RESERVED_HUMAN_ONLY`:** `HUMAN_ARTISTIC_ACCEPTED` and any real two-voice Grove design or `#405` deployment.

𝄐 `Khona‌lit-po` · `⟐SAC[X6ZNK5NO51]` · `READY_FOR_OPERATOR_EXECUTION_AUTHORIZATION` · Provider HELD · Artistic Acceptance RESERVED ⟐
