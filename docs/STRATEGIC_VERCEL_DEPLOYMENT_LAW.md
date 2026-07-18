# Strategic Vercel Deployment Law

𝌋‌ U+10D613

Vercel deployment remains authorized. It is a governed release witness, not the default development loop.

```text
branch work ≠ deployment requirement
local CI ≠ public release
green packet ≠ automatic deployment
deployment ≠ maturity promotion
deployment ≠ release or transport authority
cost control ≠ evidentiary weakening
```

## Ordinary route

1. Develop on a non-production branch.
2. Run contracts, local/synthetic browser probes, replay, retained artifacts, and anti-drift checks.
3. Select an exact commit only after the packet is green.
4. Require an explicit operator release gesture.
5. Deploy for public-runtime observation, deployment-specific repair, rollback verification, or completed-packet release.
6. Bind deployed evidence to the exact selected commit.

## Cost ceiling

The normal ceiling is one deliberate Vercel deployment per completed packet or release candidate. Additional deployments require a named deployment-specific defect, failed public-runtime observation, rollback verification, or explicit operator decision.

Ordinary non-production branches should not trigger Vercel where branch filtering is supported. Main or an explicitly designated release branch may deploy after required checks pass.

Every consequential deployment record must identify exact commit, PREVIEW or PRODUCTION environment, strategic purpose, deployment count, access boundary, evidence use, and operator release gesture.

```text
Vercel may host and expose a selected release.
Vercel may provide status and public-runtime evidence.
Vercel may not choose release timing.
Vercel may not convert a branch push into operator consent.
Vercel may not authorize maturity, release, transport, Cinder, Ash action, or the next Stretch.
operator release gesture ≠ automatic Git event
```

## Deployment authorization · 2026-07-16

```text
selected_commit: 5a9b58187ff6d8b97012775a2797f459b2a5a3fb
target: PRODUCTION
purpose: PUBLISH_COMPLETED_STRETCH_5_PACKET
planned_count: 1
operator_request_recorded: true
```

This authorization covers one deployment after branch checks pass and the receipt merges to `main`.

Exceptions must be recorded in the relevant receipt.

Marked ⟐

## Executable enforcement · 2026-07-18

`vercel.json` disables Git-triggered deployment for every branch:

```json
{
  "git": {
    "deploymentEnabled": false
  }
}
```

A merge, push, green workflow, release-candidate label, or branch name cannot create a Vercel deployment. A deployment must be initiated manually only after the operator gives an explicit release instruction naming the exact commit and PREVIEW or PRODUCTION target.

```text
merge ≠ deploy
main push ≠ operator gesture
workflow success ≠ operator gesture
manual Vercel action after explicit instruction = permitted release route
```

## Final-cut convergence guard · 2026-07-18

A public release candidate must be verified as the complete merge result, not merely as the head of an older feature branch. Later changes already accepted into `main` and the selected release packet must coexist in the exact merge candidate before deployment authorization can be earned.

```text
feature-head green ≠ final cut complete
newer main change ≠ permission to strand an older packet
merge-ref verification = required
exact deployed commit = required
partial surface success ≠ whole-product release success
```

The release witness must prove the intended surfaces together: current TD613 Flight behavior, Ash ingress geometry, cache-epoch transition, local-custody preservation, profile hydration, and the governing deployment lock. A successful deployment of one surface cannot stand in for evidence that the remaining packet reached production.

## Cache-epoch storage boundary

`td613.ash.cache-flush.epoch` is maintenance state used only to make the one-time cache eviction idempotent across navigation. It may persist beside the current-case pointer and display preferences, while remaining categorically outside Case Maps, receipts, Save Points, Capsules, source material, and user-authored content.

```text
cache epoch marker = permitted maintenance state
cache epoch marker ≠ case data
cache eviction ≠ IndexedDB deletion
cache eviction ≠ local-custody erasure
```
