# Ash Lifecycle Legacy-Bypass Observer Repair

Status: OBSERVER-ONLY / PRE-MERGE / NO DEPLOYMENT

Production application source `7c455b656a158887ea97d626ffd1483577af54e0` passed the bounded Vercel release and stale-client browser matrix. The automatic `Ash Lifecycle Deployed Observation` held because its compiled probe required `window.__td613AshLiveAIA.current().route === IMPLEMENTATION` while deliberately opening `?presentation=legacy`.

The repaired legacy contract requires:

- `presentation=legacy` remains selected;
- `window.__td613AshAia3PreflightReceipt.legacy_bypass === true`;
- `data-ash-cache-preflight = complete`;
- lifecycle state remains `READINESS_OBSERVED`;
- the political-campaign profile registry and ingress controls are available;
- AIA3 route ownership and cache reload are not required inside the rollback presentation.

This packet changes observer compilation and observer tests only. It changes no application asset, Vercel configuration, Ash lifecycle semantics, Case Map behavior, storage law, transport boundary, or release authority.

A successful rerun may replace the false-negative commit status on the already deployed source. It cannot authorize another deployment, promotion, child study, or program closure.
