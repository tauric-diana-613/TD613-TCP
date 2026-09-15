𝌋

# Aperture provider-stack field trip — Dollhouse excursion

Date: 2026-09-11  
Branch: `research/aperture-provider-stack-field-trip-20260911`  
Base: `a59426cefd49a51650e2f9638da92235f39dcd44` (relocked main after Release 1103)  
Instrument: TD613 Aperture v3.2-alpha, used here as an audit posture rather than a production mutation.

## Authority and stop condition

This is a repository/software/API-contract observation. No provider call, deployment, merge, release, secret access, external-reality inference, Western Horizon reopening, or Golden Egg credit occurs here.

The field trip asks a narrow question:

> What provider-state dimensions are currently collapsed together in Hush, Marrowline, Loom, their shared Gemini policy, and their measurement receipts, such that availability or answer quality can change without becoming legible at the user-facing aperture?

Aperture may diagnose, separate coordinates, propose candidate deficit classes, and recommend successor experiments. Human closure remains required.

## Evidence inspected

Repository surfaces:

- `DOLLHOUSE.md`
- `APERTURE.md`
- `server/gemini-model-policy.js`
- `server/gemini-model-registry.js`
- `server/gemini-model-discovery.js`
- `server/khonapolit-quality.js`
- `server/hush-generate-quality.js`
- `server/hush-generate-strict.js`
- `server/loom-task.js`
- `api/khonapolit.js`
- `scripts/loom-production-canary.mjs`
- `docs/research/2026-09-08-GEMINI-HUSH-QUALITY-PILOT.md`
- `docs/research/2026-09-10-MARROWLINE-LIVING-CHAT-HANDOFF.md`
- Release 1103 production-canary receipt: `gemini-3.8-flash -> 503`, `gemini-3.5-flash -> 503`, `gemini-2.5-flash -> 400`, three calls, no admitted answer.
- PR #1115 candidate `570668339a587cf7fdbdb546ad0a21fd059e104a`, which repairs Gemini 2.5 thinking-control compatibility in Loom only.

Fresh external contract surfaces consulted on 2026-09-11:

- Google Gemini thinking guide: `thinkingLevel` for Gemini 3; `thinkingBudget` for Gemini 2.5; high-effort 2.5 mapping 24,576.  
  https://ai.google.dev/gemini-api/docs/generate-content/thinking
- Google Gemini thinking guide: `max_output_tokens` includes thought tokens and can terminate reasoning with `MAX_TOKENS` before useful output.  
  https://ai.google.dev/gemini-api/docs/generate-content/thinking
- Google Gemini 3.5 guidance: remove explicit `temperature`, `topP` and `topK` controls for Gemini 3.x; use model defaults plus `thinkingLevel` for complex work.  
  https://ai.google.dev/gemini-api/docs/whats-new-gemini-3.5
- Google troubleshooting guide: retry transient 408/429/5xx classes with bounded exponential backoff and jitter; do not retry 400/403 client failures.  
  https://ai.google.dev/gemini-api/docs/troubleshooting
- Google API reference: REST authentication uses `x-goog-api-key`; model/request capabilities vary by model.  
  https://ai.google.dev/api

## Field finding 1 — listed model != request-envelope compatibility

Release 1103 is the decisive falsifier.

The shared runtime provider listing admitted Gemini 2.5 Flash as a callable `generateContent` model. Loom then reached it after two 503 responses and received HTTP 400. Source inspection showed the Loom quality envelope emitted Gemini-3-style `thinkingLevel: high` to Gemini 2.5. PR #1115 repairs that one route with `thinkingBudget: 24576`.

Therefore:

```text
MODEL_LISTED
!= MODEL_CALLABLE_WITH_ARBITRARY_GENERATION_CONFIG
!= REQUEST_ENVELOPE_COMPATIBLE
```

Fresh listing evidence establishes method visibility. It cannot establish that the route's model-specific request controls are valid.

This is a new Aperture field lesson: the provider request envelope itself is part of the observation instrument.

## Field finding 2 — one `qualityEnvelope` boolean collapses orthogonal API capabilities

On the field-trip base, Marrowline's Kʰonapolit request builder uses one `qualityEnvelope(model)` decision for at least two independent facts:

1. large output-token allowance; and
2. `thinkingLevel: high`.

Gemini 2.5 belongs in the large-output quality family but uses a different thinking-control grammar. The abstraction therefore couples non-equivalent capabilities.

PR #1115 separates these in Loom, but Marrowline still carries the coupled form on this base.

Candidate anti-equivalence:

```text
QUALITY_TIER
!= OUTPUT_WINDOW
!= THINKING_CONTROL_GRAMMAR
!= SAMPLING_CONTROL_GRAMMAR
!= STRUCTURED_OUTPUT_CAPABILITY
```

A future shared model profile should encode those dimensions independently instead of using a single quality-family bit.

## Field finding 3 — Hush has a hidden compute-budget geometry problem

`server/hush-generate-quality.js` hard-caps every provider response at 3,072 output tokens.

Current Gemini documentation states that `max_output_tokens` includes thought tokens. Thinking-capable models can therefore spend a material share of that hard ceiling on reasoning before answer production completes.

Hush currently does not observe and gate provider `finishReason` in its normal quality route and does not preserve token usage in the normal success receipt. It accepts a response when HTTP succeeds and at least one parsed candidate survives local quarantine.

Therefore:

```text
MAX_OUTPUT_TOKENS
!= ANSWER_TOKEN_BUDGET

HTTP_200
!= COMPLETE_GENERATION

PARSEABLE_JSON_PREFIX
!= FULL_REQUESTED_CANDIDATE_SET
```

A reasoning model can consume much of a small ceiling before transformed prose completes. If syntactically usable provider text survives local checks, Hush lacks the explicit `MAX_TOKENS` hold now present in Marrowline/Loom.

This is a plausible contributor to historical quality whiplash and silent fallback pressure. It is not yet a quantified frequency claim.

## Field finding 4 — old sampling controls are generation-specific debt

Marrowline currently sends:

```text
temperature = 0.7 / 0.78
topP = 0.9
topK = 40
```

Hush currently sends:

```text
temperature = 0.22 / 0.56
topP = 0.64 / 0.88
```

Google's current Gemini 3.5 migration guidance recommends removing these legacy sampling controls for Gemini 3.x because the reasoning stack is optimized around model defaults.

Loom's current task request is cleaner on this coordinate: it does not set those sampling knobs.

The same request policy should therefore not be projected unchanged across Gemini generations.

Candidate anti-equivalence:

```text
SAME_PROVIDER_FAMILY
!= SAME_GENERATION_CONTROL_SURFACE
```

## Field finding 5 — process-local cooldown is not durable provider state

`server/gemini-model-policy.js` keeps model outcomes in an in-process `Map`.

Consequences:

- a warm invocation can demote a model after a failure;
- a Vercel cold start can erase that memory;
- the same provider can therefore produce different route order after identical public evidence;
- HTTP 400 and 404 are both assigned a one-hour cooldown;
- a route-authored request-shape error can therefore masquerade as temporary model-health state.

`api/khonapolit.js` dispatches both Marrowline and Loom through one Vercel function. Within a warm instance, their imported model-policy singleton can condition both routes. Hush is a separate function boundary and receives its own process-local copy.

Therefore:

```text
PROCESS_LOCAL_COOLDOWN
!= DURABLE_PROVIDER_STATE

HTTP_400_REQUEST_REJECTION
!= MODEL_UNAVAILABLE

ROUTE_AUTHORED_INCOMPATIBILITY
!= PROVIDER_HEALTH_DEGRADATION
```

A future policy should record request-contract rejection separately from model-health cooldown. Provider health evidence and route-envelope compatibility must not share one state variable.

## Field finding 6 — successful receiver substitution is recorded but under-salient

The APIs preserve substantial routing evidence:

- Hush success payloads carry selected model, model order and attempts;
- Marrowline receipts carry selected model and attempt history;
- Loom failure receipts carry bounded provider-attempt history.

Yet the answer experience makes that information much more salient during diagnostics than during ordinary successful use. Historical browser evidence demonstrates a concrete consequence: a Marrowline vendor task fell through three timeouts to `gemini-3.1-flash-lite`, returned HTTP 200, and produced incorrect annual totals plus an unsupported throughput inference.

The relay classification did not certify analytical quality.

Therefore:

```text
RECEIVER_IDENTITY_RECORDED
!= RECEIVER_IDENTITY_SALIENT

SUCCESSFUL_FALLBACK
!= QUALITY_EQUIVALENT_FALLBACK
```

For interactive products, successful receiver substitution should be visible near the answer, not discoverable mainly through forensic receipts. A compact form such as `Gemini 3.1 Flash Lite · fallback 4/4` would expose the fact without turning the UI into a log console.

## Field finding 7 — the Release 1103 canary catches failure but discards useful safe diagnostics

`scripts/loom-production-canary.mjs` preserves model/status attempt pairs, final model, provider status and elapsed time. It does not retain the server's bounded diagnostic stage/code, stage elapsed times, output-token budget, or generation-specific thinking observation.

That omission is why the 2.5 HTTP 400 proved a client/request rejection but did not identify the malformed field from the machine receipt alone; source inspection plus the API contract was required.

Candidate widening:

- retain allowlisted `diagnostic.stage` and `diagnostic.code`;
- retain bounded per-attempt elapsed time;
- retain the declared output-token budget and declared thinking-control family;
- retain whether the final response stopped normally, hit token limit, or never reached generation;
- never retain provider prose solely to diagnose routing.

## Field finding 8 — the 2026-09-08 Hush quality pilot is transport/hard-gate evidence, not a clean quality ruler

The preregistered pilot fixed all compared models to:

```text
maxOutputTokens = 1536
temperature = 0.22
topP = 0.64
```

That was a defensible bounded acquisition protocol at the time, but current Gemini documentation exposes two measurement problems:

1. 1,536 is a hard ceiling over thinking plus answer tokens for thinking-capable models; and
2. explicit legacy sampling controls are no longer recommended for Gemini 3.x.

Therefore the matrix remains valid evidence for the exact calls, transport outcomes, parser/quarantine behavior and those exact constrained outputs. It should not be promoted into broad comparative model-quality evidence without a successor protocol using generation-compatible controls and enough completion budget.

```text
FIXED_REQUEST_BYTES
!= FAIR_COMPUTE_ENVELOPE_ACROSS_MODEL_GENERATIONS

COMPLETED_PILOT_CELL
!= CLEAN_MODEL_QUALITY_MEASUREMENT
```

This is not retroactive deletion. It is a higher-resolution claim ceiling on what the old pilot can support.

## Field finding 9 — model removal requires model-attributable evidence

The immediate question was whether Gemini 2.5 should simply be removed from the stack.

Current evidence does not earn that action.

Release 1103's 2.5 failure was HTTP 400 under a request envelope that source inspection shows was incompatible with the model's thinking-control grammar. That event is evidence against the route envelope, not evidence that Gemini 2.5 was unavailable or analytically poor on the task.

Therefore:

```text
ROUTE_AUTHORED_400
!= MODEL_QUALITY_FAILURE

REQUEST_ENVELOPE_INCOMPATIBILITY
!= MODEL_REMOVAL_EVIDENCE
```

Recommended posture:

```text
REPAIR_COMPATIBILITY
-> RETEST EXACT TASK
-> OBSERVE COMPLETION + QUALITY
-> THEN CONSIDER DEMOTION OR DISABLEMENT
```

2.5 may remain a last-resort stable-generation fallback, but only behind an explicit generation-compatible profile and visible receiver identity. A future compatible 2.5 run that repeatedly fails declared quality/reliability criteria could support demotion or disablement. Release 1103 alone cannot.

## Field finding 10 — Aperture needs a provider-instrument deficit grammar

The existing v3.2 typed-deficit engine distinguishes rank, numerical stability, and uncertainty geometry. Provider routing reveals an analogous but distinct class of observation deficits that should not be collapsed into one scalar 'API health' score.

Candidate provider-instrument coordinates:

```text
M = model/method visibility
E = request-envelope compatibility
B = compute/output-budget geometry
F = generation completion observability
R = retry/error-class correctness
H = health-memory scope
I = receiver-identity salience
```

Hard anti-equivalences:

```text
M != E != B != F != R != H != I
```

Examples:

- `M=visible, E=rejected` — Release 1103's 2.5 seam.
- `E=valid, F=unobserved` — HTTP 200 without finish-state observation.
- `B=truncation-risk, F=unobserved` — small shared thinking/output ceiling without completion telemetry.
- `R=client-error, H=cooling-down` — route bug incorrectly written into provider-health memory.
- `I=receipt-only` — successful fallback changes receiver without adequate answer-level salience.

This grammar is now being hydrated into a bounded executable Aperture audit on the same research branch. It receives no provider authority and cannot disable a model, mutate routing, or release code.

## Successor experiment family

Aperture's recommended next measurements, in order:

1. finish #1115's Loom generation-compatible 2.5 witness and perform the single governed production canary already required by release law;
2. build a generation-profile table that separates output window, thinking grammar, sampling posture and structured-output support;
3. add completion/usage telemetry to Hush before using Hush outputs for quality comparison;
4. rerun a bounded Hush comparison under generation-compatible controls and sufficient completion budget;
5. make successful receiver substitution salient in Hush/Marrowline/Loom at answer level;
6. separate request-envelope rejection from provider-health cooldown state;
7. only then adjudicate model demotion/disablement from model-attributable evidence.

## New Aperture lesson

The field trip adds one durable methodological relation:

```text
provider model
+ request envelope
+ budget geometry
+ completion observation
+ retry classification
+ state-memory scope
+ receiver-identity surface
= the actual provider instrument presented to the user
```

A model ID alone is not the instrument.

This is software/API epistemology, not external-world ontology. The dog learned a trick; it did not become a veterinarian.

Sealed ⟐
