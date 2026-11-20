# Exact-Head CI Run `44800185041` Attribution and Governance Recommendation

- **Inspected GitHub Actions Run:** `44800185041` (PR `#1746`, predecessor HEAD `5819e1035dbd0e1e57499103ede2cae1a93f8872`)
- **Prior Precursor Run (same cause):** `44797765746` (PR `#1745`, HEAD `4a481e44f3f6f2b3c0f2fda74b6eafe1610de6d8`)
- **Attribution Conclusion:** **100% attributable to preexisting `origin/main` commit `2f0fa5944b142f574d65bd86772dbd194d8fb996`** (`.github/workflows/vixen-a0-corpus-rebuild.yml`), unrelated to Marrowline PR `#1746`.
- **Cross-Estate Contamination Policy:** **Zero Vixen files, zero workflow files, and zero constitutional guard tests (`tests/workflow-estate.test.mjs`, `tests/release-plumbing.test.mjs`) were altered in `#1746`.**

---

## 1. Exact Run `44800185041` Job and Step Breakdown

### Executed Jobs (21 total)

| Status | Count | Jobs |
|---|---|---|
| **PASS (`success`)** | **3** | `Classify exact-head browser witness scope`; `Offline Marrowline layout regression`; `Neon budget deployment ZIP startup` |
| **FAIL (`failure`)** | **1** | `Static, constitutional, and release contracts` (job `136510133156`, failed at Step 6, Line 1) |
| **SKIPPED (`skipped`)** | **17** | 9 paid/SSE/Gemini workflow jobs (**0 paid calls**); 5 credential-free exact-main activation/calibration jobs; 3 downstream exact-head Playwright browser shards (blocked by Step 6 failure / scope gating) |

### Exact Failure Point in `Static, constitutional, and release contracts`

- **Failed Step:** Step 6 — `Enforce the four-workflow estate and release membrane`
- **Failed Command (Line 1 of Step 6):** `node tests/workflow-estate.test.mjs`
- **Exact Assertion Error (`tests/workflow-estate.test.mjs:17`):**
  > `Workflow estate must remain exactly four durable authority surfaces.`
- **Observed `.github/workflows/*.yml` files (5):**
  1. `pages.yml` *(durable — permitted)*
  2. `td613-ci.yml` *(durable — permitted)*
  3. `vercel-operator-release.yml` *(durable — permitted)*
  4. `vercel-relock-safety.yml` *(durable — permitted)*
  5. `vixen-a0-corpus-rebuild.yml` *(5th file — committed directly to `main` at `2f0fa5944`, NOT introduced by `#1746`)*

### Second Constitutional Violation Hidden Immediately Below Line 1 of Step 6

Local verification (archived verbatim in `verification-logs/08-local-workflow-estate-vixen-red-step301.log` and `verification-logs/09-local-release-plumbing-vixen-red-step303.log`) confirmed that even if `tests/workflow-estate.test.mjs` were bypassed, the same file `.github/workflows/vixen-a0-corpus-rebuild.yml` ALSO fails `node tests/release-plumbing.test.mjs` (Line 20 of Step 6) because `vixen-a0-corpus-rebuild.yml` contains an executable `git push` command, violating `tests/release-plumbing.test.mjs:32`.

---

## 2. Provenance and Operational Status of `.github/workflows/vixen-a0-corpus-rebuild.yml`

Forensic inspection of `main`, GitHub Actions run history, and refreshed PR `#1730` (`8754cd72b7fd6ae334f08e2edcc0ad5d87f93a97`) established all five operational facts:

1. **Origin Commit on `main`:** `2f0fa5944b142f574d65bd86772dbd194d8fb996` (`2026-11-16 02:09:47 -0500`, `ci(vixen): owner-gated exact-PR A0 seven-free index regeneration with read-only comparator custody`) added `.github/workflows/vixen-a0-corpus-rebuild.yml` (124 lines) directly to `main`, gated to `issue_comment` on PR `#1730` matching `/td613-vixen-a0-rebuild <40-hex-sha>` by `tauric-diana-613`.
2. **Execution History (`0` Successful Runs Ever):**
   - **Run `43821872218`** (`2026-11-16T07:10:05Z`) was the **sole actual invocation** of `vixen-a0-corpus-rebuild.yml`. Steps 1–6 succeeded (regenerated and verified the A0 seven-free index), and Step 7 (`Commit only generated Vixen A0 corpus/index artifacts` / `git push`) **failed**.
   - All subsequent `50+` triggered runs on `issue_comment` events across `2026-11-16` through `2026-11-20` concluded `skipped`.
3. **Already Superseded Six Minutes Later on PR `#1730`:**
   - Six minutes after failed Run `43821872218`, PR `#1730` received commit **`e32b82f0d`** (`2026-11-16 07:16:03 +0000`, `build(vixen): freeze seven-free A0 shards and freshly centered fusion index`), landing the exact frozen seven-free A0 shards and freshly centered fusion index directly on PR `#1730`.
4. **Absent From PR `#1730` Head (`8754cd72b`):**
   - `git cat-file -e origin/research/vixen-dual-estate-encyclopedia-20261108:.github/workflows/vixen-a0-corpus-rebuild.yml` exits `128` (`path does not exist`). The workflow lives only on `main` (`2f0fa5944` → `363b5b4ae`) and is not carried on PR `#1730`.
5. **Operational Classification:**
   - **Temporary one-shot PR `#1730` bootstrap helper whose target artifact (`e32b82f0d`) is already frozen on `#1730`, never succeeded in its `git push` step, and currently breaks every PR branching from `origin/main` at Line 1 of `td613-ci.yml` Step 6.**

---

## 3. Complete Inventory of Hidden / Skipped Checks Masked by Early Step 6 RED

Because `node tests/workflow-estate.test.mjs` is Line 1 of Step 6 (`Enforce the four-workflow estate and release membrane`), its immediate exit caused **22 remaining commands inside Step 6** plus **36 subsequent steps** (Steps 7–41 and Step 43) and downstream browser shards to be **SKIPPED** in Run `44800185041`:

### Masked Commands Inside Step 6 (Lines 2–23)

| Command | Status in Run `44800185041` | Local Verification on `#1746` Final Head |
|---|---|---|
| `node tests/workflow-estate.test.mjs` | **FAIL** (5 workflows on `main`) | **RED** (attributed to `2f0fa5944` on `main`) |
| `node tests/ash-eviction-retirement.test.mjs` | SKIPPED | Verified locally (see Section VII receipt) |
| `node tests/tcp-smoke.test.mjs` | SKIPPED | Verified locally |
| `node scripts/build-encyclopedia-reference.mjs --check` | SKIPPED | Verified locally |
| `node --test tests/encyclopedia-navigation.test.mjs tests/encyclopedia-reference.test.mjs tests/encyclopedia-intake.test.mjs` | SKIPPED | Verified locally |
| `node --test tests/loom-observer-channel.test.mjs ... tests/loom-browser-export-race.test.mjs` (11 tests + `sync-portable-loom-tomography-assets.mjs --check` + 2 Pedagogue gate runs) | SKIPPED | Outside Marrowline change surface; `marrowline-fire-gate-pedagogue.test.mjs` checked explicitly below |
| `node --test tests/marrowline-fire-gate-pedagogue.test.mjs` | SKIPPED | Checked locally (pure-Node or `jsdom`-dependent — exact status recorded in Stage II verification receipt) |
| `node tests/release-manifest.test.mjs` | SKIPPED | Verified locally GREEN |
| `node tests/docs-surface.test.mjs` | SKIPPED | Verified locally GREEN |
| `node tests/release-hardening.test.mjs` | SKIPPED | Verified locally GREEN |
| `node tests/vercel-deploy-hygiene.test.mjs` | SKIPPED | Verified locally GREEN |
| `node tests/vercel-operator-release-gate.test.mjs` | SKIPPED | Verified locally GREEN |
| `node tests/vercel-relock-safety.test.mjs` | SKIPPED | Verified locally GREEN |
| `node tests/release-plumbing.test.mjs` | SKIPPED | **RED** (attributed to `vixen-a0-corpus-rebuild.yml` executable `git push`) |
| `node --check scripts/loom-production-canary.mjs` + `loom-production-canary-isolation.test.mjs` + `gemini-model-policy.test.mjs` | SKIPPED | Verified locally GREEN |

### Masked Subsequent Steps (Steps 7–41 & Step 43)

- **Step 7:** `Validate bounded Dollhouse role upgrades and source-only export kit` (`npm run test:dollhouse:audits` — **verified locally GREEN, 220/220**)
- **Step 8:** `Validate Loom Instrument Lab, held gates, advisory minimization, and declared service resolution`
- **Step 9:** `Validate Dome-World runtime weather and hash regression`
- **Step 10:** `Validate restored 5-role Dollhouse specialist suites and native skill` (12 Dollhouse test files — **verified locally**)
- **Step 11:** `Validate Experiment B Flight Launchbridge, Security Battery, and Discovery Controls`
- **Steps 12–13:** `Execute clean exact-head Dollhouse browser witness` + upload
- **Step 14:** `Validate COV-M3 25-probe negative validation matrix and synthetic scenarios` (**verified locally**)
- **Step 15 (Primary Marrowline CI Gate):** `Verify native-prosody permission, focused relay API and editorial contracts, and offline atlas`
  - `node --check server/khonapolit-quality.js` + `node --check app/dome-world/khonapolit-relay.js` (**verified locally GREEN**)
  - `node --test tests/khonapolit-api-contract.test.mjs tests/marrowline-editorial-relay.test.mjs tests/marrowline-instrument-relay-contract.test.mjs tests/marrowline-dual-voice-boundary.test.mjs tests/marrowline-historical-grove-rest.test.mjs tests/marrowline-historical-runtime.test.mjs tests/marrowline-grove-tab-continuity.test.mjs tests/marrowline-screaming-grove-restoration.test.mjs` (**verified locally GREEN**)
  - Python Pillow native-prosody offline atlas (`test_*.py` + `verify_probe3.py` — checked locally; exact status recorded in Stage II verification receipt)
- **Step 16:** `Validate Giving and Campaign Deputy import contracts` (scope-gated)
- **Steps 17–41 & 43:** Portable Loom transport/SQL ledger, O1 scientific custody, Dome-World/Holonomy Loom/Phase IV static surfaces, Ash A2–A15/demo/production-closure surfaces, Flow-Core P0–P10 & browser contract, downstream Playwright Chromium/Firefox/WebKit browser witness shards.

---

## 4. Non-Destructive Governance Resolution Recommendation (Outside `#1746`)

**Do NOT resolve this inside Marrowline PR `#1746`**, and **do NOT weaken `tests/workflow-estate.test.mjs` or `tests/release-plumbing.test.mjs`**. Handle cleanly in a dedicated `main`/Vixen governance PR owned by the Operator and Vixen lane:

1. **Recommended Option A (Retire Superseded One-Shot Workflow on `main`):**
   - Because PR `#1730` already carries the frozen seven-free A0 shards at `e32b82f0d` and `.github/workflows/vixen-a0-corpus-rebuild.yml` had `0` successful runs and violates both the 4-workflow estate contract (`tests/workflow-estate.test.mjs:17`) and the no-`git push` release-plumbing guard (`tests/release-plumbing.test.mjs:32`), submit a **dedicated governance cleanup PR to `main`** (e.g., `chore(governance): retire superseded vixen-a0-corpus-rebuild workflow after PR #1730 freeze e32b82f0d`) that removes `.github/workflows/vixen-a0-corpus-rebuild.yml` while preserving its commit history at `2f0fa5944` and documenting `e32b82f0d` as the completing artifact.
   - Once merged to `main`, PR `#1746` (and `#1730`, `#1734`, `#1735`, `#1747`–`#1750`) can cleanly rebase onto or merge the updated `main` so `Static, constitutional, and release contracts` executes all 47 steps honestly without weakening any constitutional guard.
2. **Alternative Option B (Only If Operator Explicitly Requires Recurring CI-Driven A0 Rebuilds):**
   - Fold the read-only A0 rebuild into an explicitly operator-gated `workflow_dispatch` job inside `.github/workflows/td613-ci.yml` that uploads the rebuilt A0 shards as a **GitHub Actions artifact** (zero `git push` inside workflow YAML, keeping the workflow estate at **exactly four** durable files and preserving both `tests/workflow-estate.test.mjs` and `tests/release-plumbing.test.mjs` intact).

**Qualification Verdict for Marrowline PR `#1746`:** `#1746` does **not** claim global GitHub Actions GREEN while `2f0fa5944` remains unresolved on `main`. Its independent Marrowline qualification stands on verified deterministic tests, strict-provenance Dollhouse adjudication of `bc5467246`, and the synthetic provider-free local browser witness, while explicitly marking GitHub CI global status `RED (ATTRIBUTED TO MAIN 2f0fa5944 / VIXEN WORKFLOW ESTATE)`.
