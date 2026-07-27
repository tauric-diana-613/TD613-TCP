𝌋‌

# Ash Keep A15 Production Release and Relock Receipt v0.1

**Namespace:** U+10D613 — Tauric Diana 613  
**Status:** PRODUCTION-DEPLOYED / RELOCKED / ZERO-DRIFT / HUMAN-REVIEW-OPEN  
**Date:** 2026-07-27  
**Release gate:** issue `#405` · `TD613 Vercel Release Gate`

## Exact tested source

```text
A15 postclosure PR = #601
exact tested PR head = 4f5bacb3a318366e6574f619ed8bd753998e46d3
exact-head validation run = 30284961304
browser evidence artifact = 8661472994
browser evidence digest = sha256:5bbd25124cb75073ace955e6363b843cb66efd6be1e62bba9f7e5fc11e995551
merge commit = 69fead5b874cbd9425d2fd1cd18d7813a826479a
```

The exact-head packet passed:

- all static, constitutional, stage, production-closure, and Flow-Core contracts;
- the all-engine A8 + A12 changed-risk chamber;
- lifecycle closure preflight;
- complete Ash A2–A15 journeys in Chromium, Firefox, and WebKit;
- complete standalone Flow-Core runtime evidence in the same browser installation;
- bounded constitutional convergence;
- Phase IV live and browser evidence;
- preservation of one exact-head evidence packet.

## One bounded production release

The explicit operator gesture posted to issue `#405` was:

```text
/td613-vercel-release PRODUCTION 69fead5b874cbd9425d2fd1cd18d7813a826479a
```

The gate created exactly one transient release commit:

```text
release commit = 6feb0af3d6955514fa0ce522af39c8bafe539cef
changed file = vercel.json
git.deploymentEnabled = false → true
application-tree mutation = none
```

GitHub’s Vercel status for the release commit reached:

```text
context = Vercel
state = success
status target = https://vercel.com/tauric-diana-s-projects/td-613-tcp/DKPVHJvHgHeiSc4iwA983C1rCs4Q
deployment attempts authorized = 1
```

The issue-gate record indexes the final receipt for source packet `69fead5b874cbd9425d2fd1cd18d7813a826479a`, including:

```text
vercel_status = SUCCESS
ash_lifecycle_deployed_observation = SUCCESS
ash_custodian_return_local_observation = SUCCESS
ash_custodian_return_deployed_observation = SUCCESS
git_auto_deploy = disabled
application_tree_drift = none
```

The release workflow run identifier is preserved on issue `#405`. The current connector does not expose that issue-comment field through commit association; this receipt deliberately leaves the numeric run unresolved rather than fabricating it.

## Immediate relock

The release gate created the relock commit:

```text
relock commit = 593958eda459d7800e4c7ba4867ed0a169334082
changed file = vercel.json
git.deploymentEnabled = true → false
```

The relock commit has no Vercel deployment status, so it did not create a second production deployment.

A direct comparison of the tested merge to the relocked tree proves:

```text
base = 69fead5b874cbd9425d2fd1cd18d7813a826479a
head = 593958eda459d7800e4c7ba4867ed0a169334082
commits between = 2
net changed files = 0
application tree drift = none
```

## Mass-eviction boundary

The deployed A15 postclosure epoch is:

```text
lifecycle asset epoch = 20260727-a15-postclosure-v1
cache epoch = td613.ash.cache-flush/2026-07-27-a15-postclosure-v1
```

The graph-wide eviction admits:

- canonical shell and lifecycle asset refresh;
- HTTP and CacheStorage eviction;
- same-origin service-worker unregistration;
- cross-scope recovery;
- bounded cache and recovery receipts.

It does not admit:

```text
IndexedDB deletion = false
local custodial-state erasure = false
active local case reset = false
raw-content transport = false
custody authority change = false
release authority widening = false
profile inference = false
automatic consequential action = false
```

## Non-equivalences

```text
green packet ≠ deployment
merge ≠ deployment
release-gate commit ≠ application mutation
relock commit ≠ second deployment
mass eviction ≠ local-custody erasure
present-state admission ≠ temporal-stability claim
recovered Play control ≠ new explanation clock
browser evidence ≠ operator visual review
```

## Remaining human observation

The production instrument is available for operator visual review. No operator review finding is recorded by this receipt.

```text
operator visual review = OPEN
A16 implementation authority = HELD
human closure required = true
```

Production-relocked ⟐
