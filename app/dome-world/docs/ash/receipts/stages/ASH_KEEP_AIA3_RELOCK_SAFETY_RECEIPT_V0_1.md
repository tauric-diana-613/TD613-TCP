# Ash Keep AIA3 Relock Safety Receipt v0.1

𝌋‌ U+10D613

## Status

```text
packet: ASH_KEEP_AIA3_RELOCK_SAFETY
status: IMPLEMENTED / PRE-MERGE / CI-GATED
application source changed: false
Vercel deployment invoked by packet: false
Git auto-deploy at rest: disabled
Ash lifecycle changed: false
canonical digest law changed: false
Case Map changed: false
persistence changed: false
serverless allocation changed: false
human closure required: true
closure: OPEN
```

## Observed failure class

A bounded Git-fallback deployment succeeded for source `eef583bd28e1d3baf93e3208818bbc1fb5279272`. Concurrent observer-only commits advanced `main` before the primary release workflow could fast-forward its local relock commit. The lock was subsequently restored on current `main` by `eee4f6fb948d472b19a84b946887dd3caf4db041`.

```text
successful deployment ≠ permission to leave Git auto-deploy open
concurrent main advancement ≠ permission to overwrite or strand work
```

## Permanent repair

`.github/workflows/vercel-relock-safety.yml` shares the release concurrency group and runs after the primary release lane. It:

1. validates the same owner-issued release command;
2. fetches and resets onto live `origin/main`;
3. verifies that current `main` descends from the authorized source packet;
4. exits without mutation when the lock is already closed;
5. otherwise changes only `vercel.json` from `deploymentEnabled: true` to `false`;
6. creates no Vercel deployment and grants no retry authority.

The safety membrane is governed by `tests/vercel-relock-safety.test.mjs` and the Vercel Deployment Law workflow.

No second deployment is authorized or required by this packet.

Sealed ⟐