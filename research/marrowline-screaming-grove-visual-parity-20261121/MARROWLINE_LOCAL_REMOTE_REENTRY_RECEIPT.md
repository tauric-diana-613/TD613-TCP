# Marrowline / Screaming Grove — Local and Remote Reentry Receipt (`2026-11-21`)

- **Commission:** `TD613-MARROWLINE-SCREAMING-GROVE-RESTORATION` (Expanded Operator-Accepted Visual Corpus Edition `2026-11-21`)
- **Repository:** `tauric-diana-613/TD613-TCP` · Remote `origin` → `https://github.com/tauric-diana-613/TD613-TCP.git`
- **Sync Command:** `git fetch --all --prune --tags` (exit `0`; zero resets, zero rebases, zero forced updates, zero cleanups of preexisting worktrees or stashes)
- **Active Isolated Worktree:** `C:/td613-worktrees/marrowline-screaming-grove-visual-parity-20261121`
- **New Isolated Branch:** `research/marrowline-screaming-grove-visual-parity-restoration-20261121`
- **Selected Base Commit:** Current `origin/main` **`f1288ec690c5d440a356f9db413a289e404f40b3`** (includes merged PR `#1751` four-workflow governance repair `627d0a5ce`, merged PR `#1752` mobile Focus/Capture reader `⛶`, and merged PRs `#1753`–`#1756` Vercel production release fixes)
- **Retained Deterministic Fixes:** Cleanly ported all 7 non-CI runtime/test files + 1 CI line + offline discriminator from verified deterministic ancestor **`bc5467246f12b0598f89d681e4a4450c4733eace`** / immutable PR `#1746` (`fe2e8bed3bd0923ae7c146524d8832531cbe837e`), with **zero** runtime file conflict against `origin/main` (`f1288ec69`).
- **Immutable Comparators & Preserved Precursors:**
  - October 2, 2026 historical comparator: **`ffb98ac0050c99b07aef59ac3d200d8bee2e7e3a`** (held strictly read-only)
  - PR `#1745` (`DRAFT`): **`4a481e44f3f6f2b3c0f2fda74b6eafe1610de6d8`** (preserved immutable)
  - PR `#1746` (`OPEN · DO NOT MERGE`): **`fe2e8bed3bd0923ae7c146524d8832531cbe837e`** (preserved immutable; Stage I + Stage II Dollhouse & custody receipts never reauthored)

---

## 1. Pre-Fetch Local Worktree & Stash Custody (All Preserved Untouched)

All **12** preexisting local Git worktrees (11 from prior sessions + the `#1751` governance worktree) and all **4** local stashes (`stash@{0}`–`stash@{3}`) were inventoried prior to fetching and preserved completely untouched:

| Preexisting Local Asset | Branch / State | Exact HEAD | Status |
|---|---|---|---|
| Primary user checkout (`tcp-repository`) | `research/rulefield-counterworld-loom-lab-20261108` | `f1928fcafd359f071cc9ded5750fe00b22bb8b02` | Dirty (`79` tracked/untracked lines); **untouched** |
| Local `refs/heads/main` | `main` | `e6f2533612deed73ae2c5bee57d3062dec0fded4` | Behind `origin/main`; **untouched** |
| `#1746` dossier worktree | `research/marrowline-screaming-grove-emergence-hq-dossier-20261120` | `fe2e8bed3bd0923ae7c146524d8832531cbe837e` | **Preserved immutable** |
| `#1745` precursor worktree | `research/marrowline-screaming-grove-restoration-20261120` | `4a481e44f3f6f2b3c0f2fda74b6eafe1610de6d8` | **Preserved immutable** |
| `#1751` governance worktree | `chore/governance-retire-vixen-a0-corpus-rebuild-20261120` | `627d0a5ce85c0200b7baa033e4ed5e6912c46894` | Merged in `#1751`; **untouched** |
| 8 other sibling worktrees (`vixen-pr1730-frontispiece`, `a-pfr0`, `ag01`, `em-e00-1a`, `src-first`, `tcp-custodian-postreview`, `tcp-operational-1623`, `tcp-atlas-integration`) | Various | Recorded in pre-fetch log | **All 8 untouched** |
| Local stashes `stash@{0}`–`stash@{3}` | Vixen UX / D04 / PR `#1624` backups | Retained | **All 4 untouched** |

---

## 2. Refreshed Remote Landscape (`2026-11-21`)

| PR / Ref | State | Exact Refreshed SHA | Relation / Jurisdiction Isolation |
|---|---|---|---|
| `origin/main` | Default | `f1288ec690c5d440a356f9db413a289e404f40b3` | **Base of new fork**; advances past Nov 20 `363b5b4ae` via `#1751`–`#1756` |
| **PR `#1751`** | **MERGED** (`2026-11-20T23:43:38Z`) | `627d0a5ce85c0200b7baa033e4ed5e6912c46894` | Four-workflow governance repair merged; `tests/workflow-estate.test.mjs` & `tests/release-plumbing.test.mjs` now **PASS GREEN** on `origin/main` |
| **PR `#1752`** | **MERGED** (`2026-11-20T23:56:16Z`) | `21040f2a6a12...` (merge `67d15bdc5`) | Mobile fullscreen Focus / Capture reader `⛶` (`app/dome-world/marrowline-mobile-reader.js`); exercised in our Section VIII mobile Capture browser witness |
| **PRs `#1753`–`#1756`** | **MERGED** (`2026-11-21`) | `a6b23b4d6` .. `f1288ec69` | Vercel production `uv` / Python bundle / prebuilt archive fixes; zero conflict with Marrowline |
| **PR `#1746`** | OPEN (`DO NOT MERGE`) | `fe2e8bed3bd0923ae7c146524d8832531cbe837e` | Immutable predecessor evidence estate; deterministic ancestor `bc5467246` cleanly retained |
| **PR `#1745`** | OPEN (`DRAFT`) | `4a481e44f3f6f2b3c0f2fda74b6eafe1610de6d8` | Immutable earlier draft precursor |
| **PR `#1730`** | OPEN | `8754cd72b7fd6ae334f08e2edcc0ad5d87f93a97` | Vixen dual-estate encyclopedia; **isolated, zero edits** |
| **PRs `#1734`–`#1735`** | OPEN | `110a20d6115f` / `bfd8901e48a8` | Living Rulefield / Atlas After Hours; **isolated, zero edits** |
| **PRs `#1747`–`#1750`, `#1757`–`#1758`** | OPEN (`DRAFT`) | `0d87a5acd` .. `7406e8245` | Vixen BRAID G1–G7 stacked drafts; **isolated, zero edits** |

---

## 3. Base Selection Rationale & Cross-Branch Dependencies

Basing the new isolated recovery worktree on `origin/main` (`f1288ec69`) and porting the verified deterministic fixes from `bc5467246` achieves three clean invariants simultaneously:
1. Inherits merged `#1751` so full exact-head CI runs all 47 steps without weakening `tests/workflow-estate.test.mjs` or `tests/release-plumbing.test.mjs`.
2. Inherits merged `#1752` so our Section VIII mobile browser witness exercises the exact same fullscreen `Reading` / `CAPTURE` reader UI visible in the Operator's 10 newly supplied accepted screenshots (`accepted-04`..`accepted-13`).
3. Preserves PR `#1745`, PR `#1746`, PR `#1730`, `#1734`–`#1735`, and `#1747`–`#1758` completely untouched.
