# Strategic Vercel Deployment Law

𝌋‌ U+10D613

Vercel deployment remains authorized. It is a governed release witness, not the default development loop.

```text
branch work ≠ deployment requirement
local CI ≠ public release
green packet ≠ automatic deployment
merge ≠ automatic deployment
cost control ≠ evidentiary weakening
```

## Canonical route

1. Develop and test without Vercel deployment.
2. Complete the packet and select the exact green `main` commit.
3. Receive one explicit operator release gesture in chat.
4. The assistant/Codex executes the bounded Vercel release route.
5. One deployment is attempted and its result is reported and sealed.

```text
operator authorization → assistant/Codex execution → one Vercel deployment
```

The operator is not required to operate Vercel, GitHub Actions, or deployment plumbing. The operator authorizes. The assistant/Codex executes, observes, and reports.

## Cost ceiling

The normal ceiling is one deliberate Vercel deployment per completed packet or release candidate. Additional deployments require a named deployment-specific defect, failed public-runtime observation, rollback verification, or a new explicit operator decision.

Ordinary branches, pull requests, and `main` pushes must not trigger Vercel.

```text
one authorization = one deployment ceiling
failed deployment ≠ automatic retry authorization
bookkeeping commit ≠ deployment reason
```

## Executable lock

`vercel.json` disables Git-triggered deployment for every branch:

```json
{
  "git": {
    "deploymentEnabled": false
  }
}
```

A merge, push, green workflow, release-candidate label, or branch name cannot create a Vercel deployment.

## Assistant/Codex release conduit

The permanent conduit is GitHub issue **#405, “TD613 Vercel Release Gate.”** After explicit operator authorization in chat, the assistant/Codex posts one exact release command to that issue:

```text
/td613-vercel-release PRODUCTION <40-character-current-main-sha>
```

The release workflow accepts only:

- issue #405;
- the repository-owner identity;
- the exact current `main` SHA;
- the named `PRODUCTION` target;
- one deployment invocation.

The issue comment is an execution mechanism used by the assistant/Codex. It is not a task transferred to the operator.

```text
merge ≠ deploy
main push ≠ operator gesture
workflow success ≠ operator gesture
operator authorization in chat = release authority
assistant/Codex gate invocation = permitted execution route
```

## Final-cut convergence guard

A public release candidate must be verified as the complete merge result, not merely as an older feature head.

```text
feature-head green ≠ final cut complete
newer main change ≠ permission to strand an older packet
merge-ref verification = required
exact deployed commit = required
partial surface success ≠ whole-product release success
```

The release witness must prove the intended surfaces together: TD613 Flight behavior, Ash ingress geometry, cache-epoch transition, local-custody preservation, profile hydration, and the deployment lock.

## Cache-epoch storage boundary

`td613.ash.cache-flush.epoch` is maintenance state used only to make one-time cache eviction idempotent across navigation. It remains outside Case Maps, receipts, Save Points, Capsules, source material, and user-authored content.

```text
cache epoch marker = permitted maintenance state
cache epoch marker ≠ case data
cache eviction ≠ IndexedDB deletion
cache eviction ≠ local-custody erasure
```

Sealed ⟐
