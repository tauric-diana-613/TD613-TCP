# Gemini discovery custody — prerequisite chamber

𝌋 · 2026-09-08 · preregistered scope / local falsifier preserved

Parent main: `99a741f2e5ef8a217e7449ec60c56431ee3c28d7`.
Architecture: #1078 at `af1519bb1247ede97fd72b3ffd78791bba107316`.
Landing strip: #1079 at `1a103de445e17291225d2fc381dac985c56d597c`.

## Falsifier and stronger coordinate

The existing Gemini discovery cache was global and checked before the API-key
presence guard. A synthetic successful listing for credential A was returned
unchanged for credential B and for an empty credential, with `ok: true` and
`cached: true`. Exactly one mock provider request served all three observations.
This falsifies treating that cache as project-specific model-visibility evidence.

The stronger coordinate is credential-scoped, transport-scoped, complete,
time-bounded observation. A cached listing cannot predate its observation time.
Incomplete pagination, malformed responses, timeout, and failed refresh remain
failed observations with an empty model set. An older concurrent observation
cannot repopulate the cache after a newer observation starts.

## Bounded change

- Extract discovery from model policy, retaining its public re-export.
- Bind cache reuse to credential digest and transport identity; return neither.
- Keep credentials out of URLs and returned errors.
- Follow at most ten pages under one five-second default wall budget.
- Expose completion and observation/expiry timestamps in readiness.
- Add a read-only metadata observation command and deterministic hostile tests.
- Wire those tests into Draft Static admission.

Model catalog, preferences, fallback order, generation prompts, Hush budgets,
provider-generation behavior, Aperture motion, and release gates are unchanged.
This chamber prepares reliable evidence for the lifecycle migration; it does
not complete that migration or admit a newer model into automatic routing.

## Live acquisition hold

This interactive workspace has no `GEMINI_API_KEY`. No existing non-production
key-bearing observation endpoint was identified in the inspected setup contract.
The command below returns `missing-gemini-api-key`, `complete: false`, and no models.

```sh
node scripts/observe-gemini-models.mjs
```

Run it in an authorized non-production environment with the project's server-side
key injected. It performs models.list only, without generation or deployment.
The resulting complete listing is required before changing current model
preferences. Never put the key into chat, a receipt, or committed code.

Google Developer API sources re-read on 2026-09-08:

- [Model catalog](https://ai.google.dev/gemini-api/docs/models)
- [Deprecations](https://ai.google.dev/gemini-api/docs/deprecations)
- [Release notes](https://ai.google.dev/gemini-api/docs/changelog)
- [Paginated models API](https://ai.google.dev/api/models)

The catalog lists 3.8/3.7/3.6 Flash and 3.5 Flash-Lite beyond the current pinned
defaults. Documentation listing remains distinct from this project's credential
visibility, quota, latency, and task-quality benchmark. Default-order promotion
remains HELD pending those independent observations.

## Validation and continuation

Local policy, discovery, Hush quality-router, and Kʰonapolit quality-router tests
passed. Synthetic tests grant no live provider evidence. Remote closure requires
Draft Static, the same head Ready, three browser shards, and convergence before
an exact-head guarded merge. Record terminal workflow receipts on the PR rather
than changing the validated head to announce its result.

Preserved adjacent baseline RED: `gemini-quality-routing-vercel.test.mjs` fails
at line 18 expecting a standalone readiness function with maxDuration 20. The
same assertion fails on untouched #1077 head `6008374c`; current main dispatches
readiness through `api/khonapolit.js`. This obsolete route assertion is separate
from discovery behavior and was not silently reclassified as passing.

Continue from the #1078 implementation queue after acquiring the required live
listing and bounded task benchmarks. The outstanding shared-policy migration,
legacy Hush removal, semantic mediator, animation/alert grammar, Coordinator,
portable AIA, and final pre-Vercel packet remain unearned.

Vercel authority = 0. Detached-agent authority = 0. Western Horizon reopening = 0.
Golden-Egg completion = 0. Git auto-deploy stays disabled.

Sealed ⟐
