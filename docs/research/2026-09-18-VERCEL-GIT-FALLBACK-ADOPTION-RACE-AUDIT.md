# 𝌋 Git-fallback Vercel adoption race audit

Date: 2026-09-18
Held release: Vercel Operator Release #1161 / run `35391242831`
Authorized source packet: `4bf431dfee2f709118b2cd353994be2061ff5675`

## Preserved release facts

The release gate:

- validated the authorized source and release law;
- materialized the exact-source receipt;
- created one deploy-open fallback commit `990e73504234a6fae538aab18c881124dae3a9e5`;
- pushed an immediate relock commit `c3bbb3861503b0d31f6218784d0e17ef93ef8888`;
- kept `deployment_count` bounded by one;
- left the Git deployment lock closed.

Production never adopted the new source. All 72 exact-source probes observed the prior production packet:

```text
observed source = 44d14b0cff76815abecfdfed53eb9443238c9d26
expected source = 4bf431dfee2f709118b2cd353994be2061ff5675
```

No exact-byte, stale-queue, browser, Ash, or live-provider witness ran after that hold.

## Adoption evidence

GitHub combined-status comparison:

```text
successful prior deploy-open afebfc227576fe5501a90ef407c3176201e43bfc
→ Vercel context present / success

successful prior deploy-open 986994c07115c2458ca8bb484c1b28ccbf5158b0
→ Vercel context present / success

failed deploy-open 990e73504234a6fae538aab18c881124dae3a9e5
→ no Vercel status context
```

The failed transient commit was therefore pushed but never visibly adopted by the Git integration.

## Root cause

The fallback membrane treated `git push succeeded` as equivalent to `Vercel adopted this exact transient commit` and relocked immediately.

Those states are non-equivalent. When the relock push outruns Vercel's Git ingestion, Vercel may never observe the deploy-enabled commit.

## Repair

The release workflow now inserts one bounded pre-relock handshake:

```text
push one deploy-open transient commit
→ poll GitHub combined status for context == "Vercel"
→ any non-error Vercel status = exact transient commit adopted
→ immediately relock
→ served-source acquisition remains the release authority
```

The handshake is bounded to 45 attempts × 2 seconds.

If no Vercel status appears, or Vercel reports FAILURE/ERROR:

```text
relock anyway
→ HOLD
→ no production-success claim
```

The Vercel status does not prove production bytes, source identity, or application correctness. Those remain downstream exact-source and exact-byte observations.

## Anti-equivalences

```text
git push success != Vercel adoption
Vercel adoption != deployment success
Vercel deployment success != exact served source
exact served source != human qualitative closure
```

Sealed ⟐
