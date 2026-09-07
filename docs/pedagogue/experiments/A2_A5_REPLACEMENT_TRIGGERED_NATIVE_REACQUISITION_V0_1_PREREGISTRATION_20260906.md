𝌋‌⟐

# A2–A5 REPLACEMENT-TRIGGERED NATIVE REACQUISITION v0.1

**State:** PREREGISTERED / UNIMPLEMENTED — **NO 𝄐 YET**  
**Exact scientific parent:** PR #1065 earned head `08ebfbacd5e39f3b7d05f02ffa3720b60008f576`  
**Mechanistic precursor:** PR #1046 · bounded replaceable native route-control settlement  
**Merge / production release / Vercel / live-provider authority:** CLOSED

## Why this chamber exists

PR #1046 established a bounded route-activation observer architecture that reacquires the current visible canonical AIA route control on every attempt, binds focus + trace + native Enter to one concrete ElementHandle, allows at most four attempts, records whether the traced node remains the canonical instance after dispatch, and forbids direct Live-AIA route setter bypass.

Its successful browser episodes all settled on attempt 1. Therefore the recovery branch exists in source but has not been observed recovering from an actual replacement-induced stale first handle.

This is a mechanism-path gap, not a packet/schedule enumeration gap.

```text
RECOVERY_BRANCH_PRESENT != RECOVERY_BRANCH_EXERCISED
SAME_SELECTOR != SAME_DOM_INSTANCE
STALE_HANDLE != CANONICAL_ROUTE_OWNER
REPLACEMENT_TRIGGER != DIRECT_ROUTE_MUTATION
```

## Preregistered question

Under a witness-only controlled replacement of the canonical visible route-control node after attempt-1 handle acquisition and trace binding but before native Enter dispatch, can the existing bounded observer:

1. preserve the replacement as the new canonical visible route owner;
2. fail to settle the route through the now-stale first handle;
3. record the failed first attempt rather than silently erasing it;
4. reacquire the replacement on attempt 2;
5. dispatch native Enter through that newly acquired concrete handle;
6. settle the canonical Live-AIA route without invoking a private/direct route setter;
7. preserve product/runtime source bytes and the surrounding A2–A5/A15 authority membrane?

## Frozen hostile episode

Exactly one canonical route activation per browser engine receives one deliberate replacement injection.

The injection is observer-local only and opt-in. It must occur after attempt-1 control validation/trace binding and before attempt-1 native Enter.

Required replacement semantics:

```text
old = traced attempt-1 canonical control
new = DOM replacement carrying the same canonical route identity and native onclick owner
old is detached before attempt-1 Enter
old native onclick is disabled after transfer
new becomes the sole visible canonical control for that route
product/runtime repository bytes remain unchanged
```

No product source may be changed to manufacture replacement. No private route API may be called by the injection.

## Required observations

For the injected route in Chromium, Firefox, and WebKit:

### Attempt 1 — forced stale owner

- handle acquired: true;
- pre-injection control connected: true;
- pre-injection control owns native onclick: true;
- replacement injection performed exactly once;
- traced attempt-1 control disconnected after replacement;
- canonical visible control after replacement is a different DOM instance;
- attempt-1 native Enter is dispatched through the stale concrete handle or fails because that handle is detached;
- attempt 1 does **not** settle the requested Live-AIA route;
- no direct/private route setter is invoked;
- the failed attempt remains present in the receipt.

### Attempt 2 — reacquisition

- canonical visible control is reacquired from the same canonical selector;
- a new concrete ElementHandle owns focus, trace binding, and native Enter;
- the attempt-2 handle is connected and is the canonical visible route instance at dispatch;
- native Enter produces the canonical route event path;
- Live-AIA settles to the requested route within the inherited 4-second per-attempt settlement budget;
- `attempt_count === 2` for the injected route;
- `replacement_retry_observed === true`;
- `canonical_route_settled === true`;
- final settled route equals the requested route.

### Surrounding invariants

- no source/compiler/product runtime mutation is required to obtain GREEN;
- no timeout budget is widened merely to obtain GREEN;
- no direct `__td613AshLiveAIA.setRoute(...)` or equivalent private route bypass appears;
- non-injected route activations retain ordinary canonical behavior;
- A2–A5/A15 calibration and inherited browser estate remain non-regressed;
- source authority, release posture, provider posture, and human-closure requirements remain unchanged;
- browser authority remains local witness only.

## Immediate falsifiers

Any of the following is RED:

- attempt 1 settles despite the stale owner because the injection accidentally preserves executable authority on the detached node;
- the replacement loses canonical route identity or native onclick ownership;
- attempt 2 reacquires the stale node rather than the replacement;
- route settlement requires direct/private route mutation;
- the observer suppresses the failed first attempt;
- more than two attempts are required in the frozen injected episode;
- the injected replacement persists as hidden portable/product state;
- product/runtime source is modified merely to create the replacement race;
- timeout inflation is used as repair;
- cross-engine disagreement;
- inherited A2–A5/A15 regression;
- merge, production release, Vercel mutation, provider call, or authority widening.

## Implementation membrane

If this preregistration survives exact-source review, implementation may modify only observer/test/CI-contract surfaces needed to:

1. expose an opt-in witness-only replacement injection in the existing `ash-a2-a5-browser-probe.mjs` adapter;
2. produce an exact hostile browser receipt that verifies the attempt transition;
3. bind that hostile receipt into the existing Static/A15 and browser calibration estate.

The production AIA route-control owner, Live-AIA route implementation, Carry Case/Marrowline source, provider code, and release membranes remain untouched absent a direct RED originating from inherited behavior.

Draft Static first. Same-head Ready only after Static admission. Chromium + Firefox + WebKit + full exact-head convergence required before any 𝄐 claim.

## Claim ceiling

A GREEN result may establish only **bounded controlled replacement-triggered recovery of the existing native A2–A5 route activation observer** for the frozen one-replacement/two-attempt episode in three Playwright engines.

It would not establish universal DOM-race safety, arbitrary replacement counts, arbitrary mutation schedules, production incidence of route-control replacement, concurrency/thread safety, browser correctness outside the tested engines, human/operator evidence, external origin, empirical exteriority, Western Horizon reopening, Golden Egg credit, merge/release authority, deployment authority, or provider behavior.

## Finite stop law

If the exact one-replacement/two-attempt hostile episode closes GREEN across all three engines and convergence, stop. Do not construct replacement-count or retry-count ladders merely because the bounded observer permits four attempts.

```text
ONE_CONTROLLED_REPLACEMENT != UNIVERSAL_RACE_SAFETY
ATTEMPT_2_RECOVERY != ENTITLEMENT_TO_ATTEMPT_3_ENUMERATION
BOUNDED_RECOVERY_WITNESS != PRODUCTION_INCIDENCE
```

Western Horizon remains at official empirical-shore research rest. This chamber carries zero exogenous-witness or Golden Egg credit.

**NO 𝄐 YET.**

Marked ⟐
