# Hush quota-scope repair handoff — 2026-09-20

## Chamber purpose

This Draft chamber preserves a bounded repair path for the Hush quota-scope regression family discovered while repairing Marrowline. It is intentionally not a runtime rewrite yet.

The operator asked for a later operator/agent to inherit enough hooks that the next move can be either:

- a **staple**: one or two surgical functions plus regression tests; or
- a **rabbit hole**: a bounded cross-layer repair across server, browser broker, and held-receipt semantics.

Do not restart Hush architecture.

## Historical lineage that must remain visible

The June repair train matters because this family has already recurred once:

- `1adefa5050c5d55fc3c9255812a05ca9de2500c7` — **fix(hush): expose provider quota diagnostics in held receipts**
- `6b5455266bb331af726725373e917d883603daad` — **fix(hush): stop treating single-model 429 as provider quota exhaustion**
- `a844d987b033f20ea80a91275a8102d067074cef` — **fix(hush): rotate strict Gemini models on quota**
- `f20a9153e4d12bfe12a071743fb57c10dd0461e3` — **fix(hush): skip quota-blocked models during repair retry**

The regression family is therefore not hypothetical. Hush previously learned that:

```
ONE MODEL 429 != PROVIDER-WIDE EXHAUSTION
```

and later code can still erase that distinction.

## Draft progress already completed

This chamber has moved beyond a pure handoff. The first bounded repair pass now:

- preserves `model_quota_exhausted` in the browser broker instead of promoting every HTTP 429 to provider scope;
- leaves a bare/ambiguous 429 callable rather than freezing `auto-quality`;
- permits explicit provider/shared scope to create route-wide cooldown;
- adds an explicit `unknown` quota state to PR123 rather than defaulting missing scope evidence to provider-wide exhaustion;
- preserves that unknown state through PR141 as `unknown-diagnostic`;
- updates Hush setup documentation and the synthetic quality pilot to the current 3.x family: 3.8, 3.7, 3.6, 3.5, Preview.

The remaining major runtime gap is server-side structured quota observation and cross-layer consistency after Marrowline #1209 lands.

## Current contradiction

### Surface A — client transform still contains the good repair

`app/hush-pr123-stable-transform.js` currently includes:

- `attemptModels(...)`
- `quotaModels(...)`
- `quotaScope(...)`
- `model_quota_exhausted`
- `provider_quota_exhausted`

That client can distinguish a single-model quota event from a genuinely exhausted attempted set.

### Surface B — browser provider broker promotion seam — CLOSED IN THIS DRAFT

`app/engine/hush-provider-broker.js` currently contains:

```js
export function writeProviderStateFromReceipt(input = {}, receipt = {}, at = nowMs()) {
  const reason = safe(receipt.reason || receipt.error || '').toLowerCase();
  const status = Number(receipt.httpStatus || receipt.status || 0);
  if (reason === 'provider_quota_exhausted' || status === 429) {
    return writeProviderCooldown(
      input,
      { ...receipt, reason: 'provider_quota_exhausted', httpStatus: 429 },
      at
    );
  }
  ...
}
```

That exact promotion seam was repaired in this Draft: model scope is stored under the concrete model, explicit provider/shared scope may cool the route, and a bare 429 stays unpromoted.

This was the **staple**. Keep the tests; do not re-open it unless a new falsifier appears.

### Surface C — server Hush router has no quota-scope semantics

`server/hush-generate-quality.js` currently:

- calls `classifyGeminiTransport(...)`;
- records every 429 through the same generic `rate-limited` transport class;
- reads only the coarse `Retry-After` header;
- records the event into shared Gemini model-health state;
- carries no bounded quota metric / quota ID / model dimension / shared-project scope in the attempt receipt.

Its current synthetic 429 fixture in `tests/hush-gemini-quality-router.test.mjs` is only:

```json
{"error":{"status":"RESOURCE_EXHAUSTED","code":429,"message":"quota"}}
```

and proves failover, but not quota scope.

This is the most likely **rabbit-hole entrance** if fixing the broker alone does not close the regression.

## Shared transport hook to reuse after Marrowline lands

Marrowline PR #1209 is introducing a shared Gemini quota observer in `server/gemini-provider-transport.js` that preserves:

- quota metric
- quota ID
- model dimension
- RetryInfo / Retry-After
- bounded `model | shared | unknown` scope

When #1209 is merged, rebase this chamber and reuse that shared observer instead of creating a Hush-only parser.

Do not duplicate quota parsing unless #1209 is abandoned.

## Bounded hypotheses

### H1 — staple

The runtime regression is entirely caused by `writeProviderStateFromReceipt()` promoting any 429 to provider scope.

Repair:

1. preserve `model_quota_exhausted`;
2. key model-scoped cooldown to the actual model;
3. reserve provider-wide cooldown for explicit provider/shared scope;
4. preserve unknown scope as unknown rather than escalating it.

If hostile tests close here, stop.

### H2 — server/browser semantic mismatch

The browser client distinguishes scope, but `server/hush-generate-quality.js` and the broker speak a coarser ontology.

Repair:

1. import the shared quota observer from `gemini-provider-transport.js`;
2. add bounded `rateLimit` evidence to Hush attempts;
3. make model-local health state health-bearing only for model-scoped quota;
4. avoid writing five model cooldowns for one shared project bucket;
5. preserve the strict no-local-fallback / quality-admission posture.

Stop when server and browser receipts agree.

### H3 — persistent cooldown amplification

`hush-provider-broker.js` has a 120-second quota floor plus strike backoff. A short provider RetryInfo window can therefore become a much longer local hold.

Audit:

- `QUOTA_FLOOR_SECONDS`
- `QUOTA_GRACE_SECONDS`
- `quotaCooldownSeconds()`
- `writeProviderCooldown()`
- `providerMayCall()`

Do not remove cooldown safety wholesale. Determine whether the policy should differ for model-scoped, shared short-burst, daily, and unknown quota.

## Acceptance law

The repair should make all of these simultaneously true:

1. A single model-scoped 429 cannot headline as provider-wide exhaustion.
2. A model-scoped 429 may cool or skip only that model.
3. A shared/project-scoped 429 is represented as shared, not five independent model failures.
4. An ambiguous 429 remains ambiguous/unknown.
5. Short RetryInfo windows are not inflated into unrelated long provider outages without an explicit local policy reason.
6. Hush still preserves:
   - strict provider-only generation;
   - no local fallback release;
   - candidate integrity checks;
   - mask/cadence custody;
   - quality-first model order;
   - no sticky-success promotion;
   - moving-latest aliases disabled by default.
7. Existing June model-specific quota behavior remains covered.
8. Repair receipts never expose credentials or raw unbounded provider payloads.

## Regression fixture

Use:

`tests/fixtures/hush/hush-quota-scope-regression-family.json`

It contains synthetic:

- model-scoped 429;
- shared-project 429;
- ambiguous 429.

These fixtures are protocol tests, not empirical provider evidence.

## Suggested files to inspect in order

1. `app/engine/hush-provider-broker.js`
2. `tests/hush-provider-broker.test.mjs` or nearest broker tests
3. `tests/hush-gemini-quality-router.test.mjs`
4. `server/hush-generate-quality.js`
5. `app/hush-pr123-stable-transform.js`
6. shared `server/gemini-provider-transport.js` after #1209 lands

## Explicit non-goals

Do not:

- reintroduce Gemini 2.5;
- change Hush mask semantics;
- rewrite authorship/cadence logic;
- weaken candidate quarantine;
- turn unknown quota into provider exhaustion merely because multiple calls return 429;
- merge this Draft merely because the handoff tests are green.

## Stop condition

If the broker scope rewrite plus hostile regression tests closes the family, call it a **staple** and stop.

If server receipts cannot preserve the same scope without shared transport changes, treat it as a bounded **rabbit hole** across only:

1. shared quota observation;
2. Hush server attempt receipts;
3. browser broker persistence;
4. hostile tests.

Anything beyond those four surfaces requires a new chamber and a new operator decision.

𝄐 HUSH QUOTA-SCOPE REPAIR HANDOFF — DRAFT / NOT RUNTIME-COMPLETE
