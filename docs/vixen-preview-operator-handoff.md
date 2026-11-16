# TD613 · Vixen PR #1730 · GitHub-first Preview Preparation

**Status:** source preparation authorized; Vercel deployment and alias movement HELD pending future human adjudication.

## Canonical four-workflow architecture

The PREPARE and DEPLOY jobs are both inside `.github/workflows/vercel-relock-safety.yml`, preserving `tests/workflow-estate.test.mjs`'s four-authority-surface invariant. Their job IDs are `vixen-preview-prepare` and `vixen-preview-deploy`. The previous standalone preview workflow files were removed after consolidation. The original relock, SRC, Wendbine, production #405 and main CI owners remain distinct.

## Phase A — authorized GitHub source PREPARE

Retrieve the actual current PR #1730 HEAD SHA from GitHub, rather than trusting the stale PR description. Confirm PR remains open/unmerged on `research/vixen-dual-estate-encyclopedia-20261108` with base `main`, and successful exact-head consolidated CI with at least five successful active jobs (conditional skipped jobs allowed).

A trusted relay can post the exact top-level PR #1730 comment:

```text
/td613-vixen-preview PREPARE <CURRENT_40_CHARACTER_SHA>
```

This triggers the `Vercel Relock Safety` workflow's **Exact-source GitHub preflight — NO DEPLOY** job, using an isolated job-level gate. It verifies the source SHA, Git lock `git.deploymentEnabled=false`, CI, Vixen asset paths, dependency installation, and PR HEAD stability. It creates Actions artifact `vixen-preview-prepared-<SHA>` holding `receipt.txt` and `source-sha256.txt` (no credentials or build outputs).

The GitHub receipt explicitly states `github_source_preflight=SUCCESS`, `vercel_local_build=NOT_PERFORMED`, and `external_vercel_qualification=REQUIRED`.

## Provider access boundary

PREPARE run `43786830123` proved the original GitHub Vercel credential is unusable: Vercel CLI returned **User not found (404)** at `vercel whoami`. This is separate from and provides no evidence for a build-size problem. Consequently, the PREPARE gate is now credential-free; it does not attempt provider authentication, build, link, pull or deployment.

Kenough must independently use his working Antigravity/Vercel session to verify the **existing** project `td-613-tcp`, scope `tauric-diana-s-projects`, expected team `team_pX5L7AFivMzMU1lH28Y6RIhX`, and run a local PREVIEW build on the exact qualified PR SHA without uploading/deploying it. Do not create another project, unlock Git deployment, move aliases, or touch production. A local build receipt is independent from GitHub's source receipt; identify each explicitly.

Historical preview alias: `td-613-tcp-git-research-vixen-du-4ba43a-tauric-diana-s-projects.vercel.app`. Route: `/encyclopedia/vix-cyb.html`. Do not claim that current bytes are deployed there.

## Phase B — operator review

Return the GitHub PREPARE run URL/ID, artifact/hash inventory, exact SHA and CI run, independent Antigravity provider/local build results, visual and functional Chromium checks, fidelity gaps and HELD items. Preserve Candidate 3, Arc-Flash fox SVG, Synthesis Salon, Observatory and the full design commission.

## Phase C — later DEPLOY, expressly outside this commission

Only a **future explicit owner-authored top-level comment** on PR #1730 can trigger the Vixen preview deployment job:

```text
/td613-vixen-preview DEPLOY <REVIEWED_40_CHARACTER_SHA> <SUCCESSFUL_PREPARE_RUN_ID>
```

The owner-only job checks source, CI, run identity, qualified PREPARE job and receipt before any provider operation, then can target PREVIEW only. The GitHub Vercel token currently returns 404, so this job remains **provider readiness HELD** pending a valid authorized credential or a separate operator-approved Kenough deployment route. Never issue the DEPLOY comment during preparation. Never invoke production issue #405 as a workaround.

Constitution: OPERAHOUSE ≠ OPERA ≠ PERFORMER. Human closure RESERVED; protected Flight HELD.
