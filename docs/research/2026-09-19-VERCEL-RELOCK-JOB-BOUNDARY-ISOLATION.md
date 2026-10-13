# 𝌋 Vercel relock job-boundary isolation

Date: 2026-09-18 / 2026-09-19 UTC boundary

## Production wound

Release #1168 showed that separating the ordinary release and recovery command verbs was necessary but insufficient when both workflows retained the same workflow-level concurrency group.

An ordinary `/td613-vercel-release` issue comment could still awaken the Relock Safety workflow wrapper. GitHub evaluates workflow-level concurrency before the relock job's command guard, so the empty wrapper could reserve the shared `td613-vercel-production-release` lane even though its job would later skip.

## Repair

- Operator Release keeps workflow-level `td613-vercel-production-release` serialization.
- Relock Safety has no workflow-level concurrency stanza.
- The admitted `relock-safety` job alone acquires `td613-vercel-production-release`.
- Relock Safety remains gated by the distinct `/td613-vercel-relock` verb.
- Explicit recovery remains serialized against an active deployment.
- Ordinary release comments no longer reserve relock concurrency before command admission.

## Dependency closure

PR #1183 is authoritative for the Marrowline five-seat Gemini 3 cascade and merged as `c495b39726d27757c092bc2dc2ff9ba4b5a182a1`.

PR #1184 was reconstructed on that merged main before final validation. Its earlier alternate Marrowline provider-order experiment was deliberately removed rather than stacked over #1183. This chamber carries only the #405 release/relock scheduler repair plus its documentation and regression contracts.

```text
release command != relock command
workflow dispatch != admitted recovery job
empty relock wrapper != release concurrency participant
explicit relock job == serialized recovery participant
#1184 release delta != alternate Marrowline provider policy
```

No deployment occurs from this PR. Deployment remains a separate exact-current-main #405 action after exact-head validation and merge.

Sealed ⟐
