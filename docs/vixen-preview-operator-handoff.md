# TD613 · Vixen PR #1730 · Single-Gesture Preview Gate

**Jurisdiction:** Vixen PR #1730 PREVIEW only. Production release issue #405 and all existing closure, corpus, merge and protected-Flight authorities are unchanged.

## One operator gesture, one preview attempt

The existing consolidated `.github/workflows/vercel-relock-safety.yml` owns both jobs. No fifth workflow is created. The operator may authorize one exact current PR #1730 source commit by a single trusted top-level PR comment:

```text
/td613-vixen-preview DEPLOY <CURRENT_40_CHARACTER_PR_HEAD_SHA>
```

As with the reviewed issue #405 connector-as-transport pattern, either the repository owner or the configured `chatgpt-codex-connector[bot]` relay may carry the operator's *contemporaneous, direct request*. A bot's ability to post a comment grants no independent standing authorization.

That **same comment and workflow run** first invokes `vixen-preview-prepare` (credential-free exact-HEAD PR, source, locked Git deployment and consolidated GREEN CI validation). Its successful preparation receipt and exact SHA are consumed directly by `vixen-preview-deploy` through `needs`. This removes the unnecessary second owner-authored `DEPLOY` command and separate preparation-run argument. The source preflight must succeed before the provider job begins.

A separate optional source-only command remains for inspection:

```text
/td613-vixen-preview PREPARE <CURRENT_40_CHARACTER_PR_HEAD_SHA>
```

This PREPARE-only gesture **does not** cause a deployment. An actual DEPLOY gesture performs source preparation automatically in its own run; no earlier PREPARE gesture or outside written approval is required.

## Retained constraints

- PR #1730 must remain open/unmerged with the exact same-repository `research/vixen-dual-estate-encyclopedia-20261108` HEAD and base `main`.
- The exact HEAD needs a completed, fully passing consolidated CI result; a green job subset or prior SHA never suffices.
- `vercel.json` must keep `git.deploymentEnabled=false`. The project, team ID, preview environment, CLI version and historical preview alias are pinned; create-project or production fallback is forbidden.
- The provider path builds and attempts at most one PREVIEW deployment for the gesture, compares served source bytes, then rechecks PR HEAD and the established alias before any alias reassignment. No automatic retry is authorized if it holds.
- The optional GitHub `PREPARE` result is strictly source evidence. Neither source preflight nor a preview receipt claims visual/design acceptance, scientific validation, corpus admission, publication, production or human closure.

## Provider readiness and exact bytes

The prior GitHub Vercel credential failed with **User not found (404)** in workflow run `43786830123`. A changed authorization gesture cannot repair a revoked provider identity. A PREVIEW deployment is therefore conditional on a valid existing Vercel project/token bridge. The established preview alias is `td-613-tcp-git-research-vixen-du-4ba43a-tauric-diana-s-projects.vercel.app`, route `/encyclopedia/vix-cyb.html`. Its current bytes must be verified from an actual new deployment receipt, never inferred from a code commit.

**Constitution:** OPERAHOUSE ≠ OPERA ≠ PERFORMER. Issue #405 remains the sole production-release jurisdiction; human closure RESERVED and Experiment B Flight HELD.
