# 𝌋 Emergency custody audit — Marrowline Dollhouse trial gate

Date: 2026-09-18  
Incident surface: issue #1172 / PR #1173 / run `35310706812`

## Observed sequence

- PR #1173 candidate head `8f67da2ef5de9fadcbe752fe93bde1d6521655af` passed Draft and Ready exact-head validation.
- GitHub timeline records Ready at `2026-09-18T05:04:05Z` and merge at `2026-09-18T05:24:44Z`.
- The merge created `2b3005c369fcb132d382f0417991c38addd2ab51`.
- Nine seconds later issue #1172 received command comment `5725586769`:
  `/td613-marrowline-dollhouse-trial PRODUCTION faed17e800b44c546af1586daa7c1419648e5fc3`.
- Raw GitHub comment metadata records the visible owner-attributed command as app-mediated:
  - `performed_via_github_app.slug = chatgpt-codex-connector`
  - `performed_via_github_app.id = 1144995`
- At the same time, `.td613/openai-delegation-gate.json` remained `CLOSED` for detached OpenAI activity and issue #691 contained no fresh Dollhouse authorization.
- Workflow run `35310706812` then failed before the production prompt battery.

## Exact RED

The first failing step was:

`Run canonical Pedagogue gate and Dollhouse trial contracts`

The failing synthetic FADT fixture reused one antecedent id twice:

`Duplicate FADT antecedent id in fibre marrowline-machine-pass-qualitative-support: information-test`

Two preceding contract tests passed. The eight-case live Marrowline production battery was skipped. The post-trial source step was skipped. The workflow recorded `deployment_count = 0` and `deployment_authority = false`.

## Diagnosis

Two independent defects were present:

1. **Fixture identity defect** — the FADT contrast test supplied two different synthetic cases under the same case id. FADT correctly rejected them.
2. **Authority attribution defect** — the experimental #1172 gate treated the repository-owner login as sufficient authority even when GitHub's raw event showed the comment was written through an installed GitHub App.

The second defect matters because:

```text
visible owner login != direct human GitHub gesture
performed_via_github_app != null
→ app-mediated write
```

GitHub's PR timeline records `performed_via_github_app = null` for the Ready and merge events, so the available repository record does not prove that those two transitions were app-mediated. It does prove that the #1172 command comment was.

## Emergency containment and repair

- Issue #1172 was incident-noted and locked while main still carried the permissive trigger.
- FADT synthetic cases receive distinct ids.
- The Dollhouse production-trial job now requires:
  - `github.event.comment.user.login == github.repository_owner`; and
  - `github.event.comment.performed_via_github_app == null`.
- The authorization step independently rechecks the raw event payload and rejects GitHub-App-mediated comments.
- Workflow-estate tests lock the new condition.
- `AGENTS.md` and `DOLLHOUSE.md` now require raw app-provenance inspection before an experimental issue comment is treated as a direct operator gesture.
- Issue #405 remains unchanged because its connector-as-transport release conduit has a separately reviewed explicit-operator authorization law.

## Evidence ceiling

This repository evidence identifies the #1172 command as ChatGPT/Codex-connector-mediated. It does not identify which ChatGPT/Codex session produced the command, and it does not establish that the Ready or merge transitions came through that app.

No claim of account compromise, autonomous model intent, or hidden external process is warranted from the available record.

Sealed ⟐
