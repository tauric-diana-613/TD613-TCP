# 𝌋 Issue #405 connector duplicate-delivery and release-concurrency audit

Date: 2026-09-18  
Release source under test: `31b66dec8254663ec9e62323984bfb044a6d60c3`

## Observable incident

One explicit ChatGPT-side #405 release transport produced comment `5726110725`:

```text
/td613-vercel-release PRODUCTION 31b66dec8254663ec9e62323984bfb044a6d60c3
```

A second byte-identical owner-attributed comment, `5726111863`, appeared seven seconds later.

Raw GitHub metadata binds both comments to the same installed app:

```text
visible user.login = tauric-diana-613
performed_via_github_app.id = 1144995
performed_via_github_app.slug = chatgpt-codex-connector
performed_via_github_app.name = ChatGPT Codex Connector
performed_via_github_app.owner = openai
```

The repository record therefore establishes duplicate connector delivery. It does not establish which connector retry, client session, or upstream delivery mechanism produced the second copy, and it does not support a claim of autonomous model intent.

## Scheduler failure exposed by the duplicate

At the time of the incident, both durable workflows subscribed to the same ordinary release command:

```text
Vercel Operator Release
  trigger = /td613-vercel-release ...

Vercel Relock Safety
  trigger = /td613-vercel-release ...

shared concurrency group
  = td613-vercel-production-release
```

For the first comment, Vercel Operator Release #1157 / run `35315043170` was cancelled before receiving a job while Relock Safety #1030 / run `35315043142` consumed the shared concurrency slot.

Relock Safety then sealed:

```text
source_packet_commit = 31b66dec8254663ec9e62323984bfb044a6d60c3
safety_relock_changed_main = false
relock_commit = 31b66dec8254663ec9e62323984bfb044a6d60c3
git_auto_deploy = disabled
deployment_count = 0
```

No deployment occurred from that gesture.

## Root cause

The safety workflow's subscription to the ordinary release verb was unnecessary. The Operator Release workflow already closes the Git deployment lock immediately after a bounded fallback admission.

The separate safety workflow exists for interruption recovery, but co-triggering it on every release converts a recovery membrane into a scheduler competitor.

```text
independent recovery authority != automatic co-trigger authority
shared serialization != shared trigger
duplicate transport != duplicate release authority
```

## Repair

Ordinary release remains:

```text
/td613-vercel-release PRODUCTION <exact-current-main-sha>
```

Independent recovery becomes:

```text
/td613-vercel-relock PRODUCTION <authorized-source-sha>
```

Both retain the same shared concurrency group. The recovery job cannot deploy and remains idempotent when the lock is already closed.

The exact ChatGPT/Codex connector remains an allowed #405 transport after explicit in-chat human authorization under the existing deployment law. The repair does not convert #405 into a direct-browser-only gate.

## Duplicate-release ceiling

A duplicate `/td613-vercel-release` delivery does not create a second release authority. The release workflow binds the selected SHA to exact current `main`. A successful fallback release advances `main` through its deployable commit and immediate relock commit; a later queued duplicate naming the older source therefore cannot satisfy the exact-current-main precondition.

This protects deployment cardinality, although duplicate delivery may still create a later non-deploying held run. That transport-noise problem is distinct from the fixed scheduler race and should not be confused with a second deployment.

## Evidence ceiling

This audit establishes:

- duplicate issue-comment transport through the ChatGPT Codex Connector;
- a release/relock workflow co-trigger race;
- zero deployment from the raced gesture;
- a bounded workflow repair.

It does not establish account compromise, hidden background authority, or the internal cause of the connector's duplicate delivery.

Sealed ⟐
