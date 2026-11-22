# TD613 · Issue #1744 · Vixen PR #1730 GitHub-first Preview Operator Gate

**Standing status:** Permanent operator invocation via [GitHub issue #1744](https://github.com/tauric-diana-613/TD613-TCP/issues/1744). PREPARE creates no deployment; DEPLOY requires its own explicit, owner-authorized gesture. Issue creation, green CI and previous deployments convey no new deployment authorization.

## Canonical four-workflow architecture

The PREPARE and DEPLOY jobs are both inside `.github/workflows/vercel-relock-safety.yml`, preserving `tests/workflow-estate.test.mjs`'s four-authority-surface invariant. Their job IDs are `vixen-preview-prepare` and `vixen-preview-deploy`. The previous standalone preview workflow files were removed after consolidation. The original relock, SRC, Wendbine, production #405 and main CI owners remain distinct.

## Phase A — authorized GitHub source PREPARE

Retrieve the actual current PR #1730 HEAD SHA from GitHub, rather than trusting the stale PR description. Confirm PR remains open/unmerged on `research/vixen-dual-estate-encyclopedia-20261108` with base `main`, and successful exact-head consolidated CI with at least five successful active jobs (conditional skipped jobs allowed).

A trusted relay can post the exact gesture as a **top-level comment directly to issue #1744** (canonical operator gate) or the original PR #1730 conversation (legacy-compatible):

```text
/td613-vixen-preview PREPARE <CURRENT_40_CHARACTER_SHA>
```

This triggers the `Vercel Relock Safety` workflow's **Exact-source GitHub preflight — NO DEPLOY** job, using an isolated job-level gate. It verifies the source SHA, Git lock `git.deploymentEnabled=false`, CI, Vixen asset paths, dependency installation, and PR HEAD stability. It creates Actions artifact `vixen-preview-prepared-<SHA>` holding `receipt.txt` and `source-sha256.txt` (no credentials or build outputs).

The GitHub receipt explicitly states `github_source_preflight=SUCCESS`, `vercel_local_build=NOT_PERFORMED`, and `external_vercel_qualification=REQUIRED`.

## Provider access boundary

The GitHub PREPARE job is deliberately **credential-free and deployment-free**. The historical PREPARE run `43786830123` recorded an earlier Vercel `User not found (404)` credential failure; that result was time-specific, not a permanent claim about token availability. [PREPARE #44005150779](https://github.com/tauric-diana-613/TD613-TCP/actions/runs/44005150779) and owner-gesture [DEPLOY #44005213805](https://github.com/tauric-diana-613/TD613-TCP/actions/runs/44005213805) subsequently completed **SUCCESS** through the actual GitHub workflow, including the dedicated preview build and served-byte/alias gates.

The **DEPLOY** job (rather than Vercel's automatic Git-triggered builds) verifies the existing project `td-613-tcp`, scope `tauric-diana-s-projects`, team `team_pX5L7AFivMzMU1lH28Y6RIhX`, and pinned project ID `prj_Zb6g9tqAr5iJSAFWGU4u4lof6oF7`. It builds PREVIEW only, verifies immutable served bytes, and updates only the existing alias after all safeguards. A current credential/project failure must be logged as HELD; a previous successful run cannot be substituted for a new receipt.

Antigravity can use this same GitHub issue/PR-gated protocol, or independently diagnose provider access. Do not create another project, unlock `vercel.json`, use issue #405, touch `main` production deployment, or claim a failed `vixen-pr1730-frontispiece` Git-triggered project disproves success of the separate canonical `td-613-tcp` dedicated preview pipeline.

Established preview alias: `td-613-tcp-git-research-vixen-du-4ba43a-tauric-diana-s-projects.vercel.app`. Route: `/encyclopedia/vix-cyb.html`. An old alias resolving alone never proves that latest source bytes were deployed.

## Phase B — operator review

Return the GitHub PREPARE run URL/ID, artifact/hash inventory, exact SHA and CI run, independent Antigravity provider/local build results, visual and functional Chromium checks, fidelity gaps and HELD items. Preserve Candidate 3, Arc-Flash fox SVG, Synthesis Salon, Observatory and the full design commission.

## Phase C — separate owner-authorized DEPLOY, exclusively PREVIEW

After PREPARE completes and the operator explicitly authorizes DEPLOY, the repository owner posts a top-level comment on **issue #1744** or the original **PR #1730**:

```text
/td613-vixen-preview DEPLOY <REVIEWED_40_CHARACTER_SHA> <SUCCESSFUL_PREPARE_RUN_ID>
```

The owner-only job checks source, CI, run identity, qualified PREPARE job and receipt before any provider operation, then targets PREVIEW only. It checks project identity, readiness and served source bytes before alias reassignment. If authorization, build, source-byte verification, PR-HEAD stability or alias checks fail, treat the run as **HELD**, leave the existing alias unchanged and report the exact logs/receipt. Never issue DEPLOY during preparation, never automatically retry, and never invoke production issue #405 as a workaround.

### Fresh-chat operator invocation

A request such as **“Deploy Vixen PR #1730 preview using #1744”** tells ChatGPT / Antigravity to fetch issue #1744, verify the latest PR HEAD and GREEN exact-head CI, execute PREPARE, inspect its run and receipt, and execute the owner-only DEPLOY step **only when the current user explicitly authorized deployment**. A user asking to inspect/prepare is not authorizing DEPLOY. This issue number is the permanent workflow-routing identity; neither assistant memory nor outdated PR-description SHAs are authoritative.

Constitution: OPERAHOUSE ≠ OPERA ≠ PERFORMER. Human closure RESERVED; protected Flight HELD.
