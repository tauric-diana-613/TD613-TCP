# Ash production observer · A9–A11 stage-import settlement repair · 2026-09-11

Status: CANDIDATE / validation required

## Preserved production RED

The authorized production release of product source packet `88ee4a1c789d769598040847b4409a82050dda54` acquired exact source, passed byte parity, passed the 10/10 stale-rollback stability window, and passed the deployed A14 registry/archive witness. The deployed Ash lifecycle observation then HELD on one request failure:

```text
net::ERR_ABORTED script https://td613.com/dome-world/ash-a10-choir-recompilation.js?v=20260724-a12-release-v1
```

The same observation otherwise reached `CONTINUITY_SEALED` across desktop, mobile portrait, and mobile landscape with no HTTP errors, no console errors, no provider/transport requests, and no raw-artifact request-body leakage. Because Ash lifecycle did not pass, the governed release correctly skipped the one-real-AI Loom Demo 1 production canary.

Held release workflow: `34592555975`
Held release artifact: `td613-bounded-production-release-evidence` · artifact `10196327138` · SHA-256 `2657976c862d5f3e8ead14f28add984be347624fb637234cdaa47b93b5a765cf`

## Root-cause classification

A9, A10, and A11 are sibling application-owned dynamic imports scheduled from the canonical module-graph-ready transition. The existing production observer waited for A11 exact module identity before initiating specialist navigation, but did not wait for A9 or A10. Therefore the observer could navigate after A11 settled while A10 remained in flight, allowing navigation to supersede the A10 request.

This matches the repository's prior repair principle for application-owned JavaScript imports: settle declared dependencies before observer-driven navigation rather than teaching the request-failure classifier to ignore their aborts.

## Candidate repair

The production lifecycle observer now requires, before specialist navigation:

- `__td613AshA9ModulePromise` plus exact `td613.ash.a9-work-recompilation/v0.2` identity;
- `__td613AshA10ModulePromise` plus exact `td613.ash.a10-choir-recompilation/v0.1` identity;
- the already-required `__td613AshA11ModulePromise` plus exact `td613.ash.a11-capsule-recompilation/v0.1` identity.

The observation receipt records A9 and A10 request/version surfaces and an explicit `stage_imports_settled:true` fact. The generated observer refuses expected-abort exemptions for A9, A10, and A11 script paths. Application/product behavior, provider routing, timeouts, release authority, and Vercel policy remain unchanged.

## Claim ceiling

```text
LIFECYCLE_REACHED_CONTINUITY_SEALED != RELEASE_WITNESS_PASS
APPLICATION_OWNED_IMPORT_ABORT != AUTOMATICALLY_EXPECTED_TRANSITION_ABORT
A9_A10_A11_SETTLEMENT != APPLICATION_BEHAVIOR_MUTATION
OBSERVER_SETTLEMENT_REPAIR != PROVIDER_SUCCESS
HELD_RELEASE != LOOM_MACHINE_CANARY
MACHINE_CANARY_SKIPPED != HUMAN_OPERATOR_AUTHORIZED
PRODUCT_RELEASE_ENGINEERING != WESTERN_HORIZON_REOPENING
PRODUCT_RELEASE_ENGINEERING != GOLDEN_EGG
```

Required sequence:

`DRAFT_STATIC -> SAME_HEAD_READY -> CHROMIUM_FIREFOX_WEBKIT -> CONVERGENCE -> GUARDED_MERGE -> FRESH_GOVERNED_RELEASE -> ASH_PASS -> ONE_LOOM_MACHINE_CANARY -> HUMAN_OPERATOR_ONLY_AFTER_CANARY_SUCCESS`

Sealed ⟐
