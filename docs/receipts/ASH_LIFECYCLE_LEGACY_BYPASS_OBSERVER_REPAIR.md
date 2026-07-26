# Ash Lifecycle Legacy-Bypass Observer Repair

Status: OBSERVER-ONLY / PRE-MERGE / NO DEPLOYMENT

Production application source `7c455b656a158887ea97d626ffd1483577af54e0` passed the bounded Vercel release and stale-client browser matrix. The automatic `Ash Lifecycle Deployed Observation` originally held because its compiled probe required `window.__td613AshLiveAIA.current().route === IMPLEMENTATION` while deliberately requesting `?presentation=legacy`.

The first observer repair correctly replaced that stale AIA3 route requirement with the cache-preflight receipt, but it retained one incompatible assumption: that the visible URL would continue to expose `presentation=legacy` after the shell accepted the request.

A14 exact-head run #532 attempt 2 established the actual shell contract:

1. the incoming request contains `presentation=legacy`;
2. the shell captures that request as `legacyPresentation = true`;
3. the shell publishes `window.__td613AshAia3PreflightReceipt.legacy_bypass === true`;
4. the shell immediately canonicalizes the visible URL to `/dome-world/ash-threshold.html` with no query string;
5. cache preflight completes and the canonical module graph becomes ready without requiring an AIA3 route or reload.

The corrected legacy contract therefore requires:

- the requested source route remains `/dome-world/ash-keep.html?presentation=legacy`;
- the published preflight receipt records `legacy_bypass === true`;
- the receipt records `visible_url === /dome-world/ash-threshold.html`;
- the browser-visible URL is `/dome-world/ash-threshold.html` with an empty query string;
- `data-ash-cache-preflight = complete` and `data-ash-module-graph = ready`;
- lifecycle state remains `READINESS_OBSERVED`;
- the political-campaign profile registry and ingress controls are available;
- AIA3 route ownership and cache reload remain unnecessary inside the compatibility request.

This packet changes observer compilation, observer contracts, and this receipt only. It changes no application asset, Vercel configuration, Ash lifecycle semantics, Case Map behavior, storage law, transport boundary, custody authority, release authority, or deployment posture.

A successful exact-head packet may replace the false-negative PR status. It cannot authorize deployment, promotion, child study, custody transfer, or program closure.
