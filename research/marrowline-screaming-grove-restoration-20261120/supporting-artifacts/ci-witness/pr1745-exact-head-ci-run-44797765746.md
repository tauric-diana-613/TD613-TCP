# 𝌋‌ Precursor Exact-Head CI Witness — Draft PR `#1745` (Run `44797765746`)

- **Precursor Draft PR:** https://github.com/tauric-diana-613/TD613-TCP/pull/1745 (preserved untouched; branch `research/marrowline-screaming-grove-restoration-20261120`)
- **Exact Audited Head SHA:** `4a481e44f3f6f2b3c0f2fda74b6eafe1610de6d8`
- **GitHub Actions Run:** https://github.com/tauric-diana-613/TD613-TCP/actions/runs/44797765746
- **Workflow:** `TD613 Consolidated Validation` (`.github/workflows/td613-ci.yml`)
- **Date:** 2026-11-20

## Job Outcomes

| Job | Status | Duration | Notes |
|---|---|---|---|
| `Classify exact-head browser witness scope` | **PASS** | `19s` | Exact head verified; no stale PR head. |
| `Neon budget deployment ZIP startup` | **PASS** | `14s` | Clean pass. |
| `Offline Marrowline layout regression` | **PASS** | `10s` | Clean pass. |
| All 9 paid / original-SSE / Gemini workflow jobs | **`skipping`** | `0s` | **Confirmed `0` paid Gemini calls triggered on PR push.** |
| `Static, constitutional, and release contracts` | **FAIL** | `32s` | Failed at Step 1 (`Enforce the four-workflow estate and release membrane` → `tests/workflow-estate.test.mjs:17`) strictly due to preexisting `origin/main` (`363b5b4ae`) file `.github/workflows/vixen-a0-corpus-rebuild.yml`. |

## Exact Failure Excerpt (Job `136501856279`)

```text
AssertionError [ERR_ASSERTION]: Workflow estate must remain exactly four durable authority surfaces.
Found: pages.yml, td613-ci.yml, vercel-operator-release.yml, vercel-relock-safety.yml, vixen-a0-corpus-rebuild.yml
    at file:///home/runner/work/TD613-TCP/TD613-TCP/tests/workflow-estate.test.mjs:17:8
```

## Evidentiary Interpretation
- Per Sections P0.3 and IX, Vixen's `.github/workflows/vixen-a0-corpus-rebuild.yml` was **intentionally left untouched**.
- Because Step 1 (`tests/workflow-estate.test.mjs`) halted `Static, constitutional, and release contracts` before reaching the later `jsdom` and Python Pillow steps on GitHub Actions, those specific runner-only steps remain unexecuted until `origin/main`'s four-workflow guard vs Vixen workflow conflict is resolved independently.
- Every Marrowline/Khonapolit/Aperture/Dollhouse pure-Node contract test (`285/285` + `220/220` + standalone Gemini/Aperture/relock/docs/hygiene suites) was executed and verified `PASS` locally on exact commit `bc5467246`.
