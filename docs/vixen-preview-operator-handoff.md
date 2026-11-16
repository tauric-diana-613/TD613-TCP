# TD613 · Vixen Cybernetics PR #1730 · GitHub-first preview gate

**Status:** staged / unexecuted. Operator custody: Tauric Diana. The PREPARE relay is safe to run before aesthetic adjudication; DEPLOY is withheld until an explicit later human gesture.

## Sources and fixed boundaries

- Repository: `tauric-diana-613/TD613-TCP`
- PR: `#1730` (must remain OPEN and unmerged)
- Source branch: `research/vixen-dual-estate-encyclopedia-20261108`
- Default branch contains only the deployment machinery: `main`
- Existing Vercel team: `tauric-diana-s-projects` (org ID `team_pX5L7AFivMzMU1lH28Y6RIhX`)
- Existing Vercel project: `td-613-tcp`; **never create a replacement**
- Existing stable preview alias: `td-613-tcp-git-research-vixen-du-4ba43a-tauric-diana-s-projects.vercel.app`
- Canonical Vixen route: `/encyclopedia/vix-cyb.html`
- Deployment lock: `vercel.json` → `git.deploymentEnabled=false`
- Production #405 workflow is independent. Do not touch its operation.
- The Vercel bundle-size hypothesis is out of scope. Previous GitHub-forward deployments did not establish a repeatable size blocker.

## Phase A: Operator/relay PREPARE — permitted before human adjudication

**Workflow:** `.github/workflows/vixen-preview-prepare.yml`

Read PR #1730's *current actual Git head SHA* through GitHub; ignore stale PR body SHAs. Confirm exact-head consolidated CI GREEN with five successful jobs. A trusted relay with the same credentials that work for issue #405 may post this **single, exact top-level comment on PR #1730**:

```text
/td613-vixen-preview PREPARE <CURRENT_40_CHARACTER_PR1730_SHA>
```

Alternatively the repository owner may dispatch `TD613 Vixen Preview Prepare` from GitHub Actions on `main`, with its `commit_sha` input. PREPARE runs from `main`, checks out only the PR's exact SHA, verifies the existing Git deployment lock and core Vixen paths, confirms the existing Vercel project **before attempting any CLI link**, pulls the preview build environment and runs a LOCAL `vercel build`. It never executes `vercel deploy`, `vercel alias`, production promotion, or PR merge.

Wait for the GitHub Actions run to complete and review its logs. Successful PREPARE yields a nonsecret Actions artifact named `vixen-preview-prepared-<SHA>`, containing `receipt.txt` and `source-sha256.txt`. Record the preparation run ID, artifact identity, exact PR SHA, CI run ID, and local build outcome. The build output `.vercel/` and all secrets remain **outside** the artifact. Do not publish tokens, resolved environment variables, or sensitive build logs.

If the trusted relay cannot post a PR comment, the workflow job is skipped, the GitHub secret is missing, a project is inaccessible, the exact-head CI is not GREEN, the build fails, or the PR HEAD moves, stop at **HELD** and report the real failure. Do not substitute a different repository, project, secret, preview alias, or Vercel account.

## Phase B: Human evaluation — HOLD

Kenough collects the successful PREPARE receipt and audits PR #1730's implementation and prepared source, comparing Candidate 3, fox Arc-Flash SVG, Synthesis Salon, Observatory, and the current Vixen design commission. Local screenshots or Chromium captures are admissible as local visual evidence only; **do not describe them as a newly deployed Vercel preview**.

Return a clear **PREPARED / HELD** handoff with the exact SHA, GitHub Actions run link, artifact and hashes, build log summary, and any errors or aesthetic uncertainties. The user adjudicates this packet before a live preview exists.

## Phase C: DEPLOY — forbidden until a later explicit operator gesture

**Workflow:** `.github/workflows/vercel-preview.yml`.

There are two later operator-only mechanisms, each requiring a successful nonexpired Phase A receipt whose artifact name matches the same SHA:

1. **Owner PR comment** on #1730 (this comment itself authorizes and triggers the actual Vercel deployment):
   ```text
   /td613-vixen-preview DEPLOY <REVIEWED_40_CHARACTER_SHA> <SUCCESSFUL_PREPARE_RUN_ID>
   ```
2. **Owner GitHub Actions workflow_dispatch** on `main` with the inputs `commit_sha` and `prepare_run_id` (the dispatch itself is the authorization).

Both paths revalidate the current open PR HEAD, successful consolidated CI and successful GitHub-side PREPARE artifact. The workflow then verifies the existing Vercel team/project, builds and deploys an immutable PREVIEW, validates served Vixen source bytes, rechecks the PR HEAD and current alias, and only afterward attempts to repoint the historic preview alias. Production is never a target.

**Kenough's current commission ends BEFORE Phase C.** No deploy comment, deploy workflow dispatch, alias operation, production release, or Git integration unlock during preparation. Do not use issue #405 as a preview workaround.

**Constitution:** OPERAHOUSE ≠ OPERA ≠ PERFORMER. Preserve all accepted Candidate 3 imagery and separate authorship/custody. Human closure RESERVED; protected Flight HELD.
