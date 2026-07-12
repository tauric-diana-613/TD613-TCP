# TD613 Hush Remote Provider Setup

Hush remains local-sovereign while using Gemini as an optional remote candidate generator. The remote model produces candidate rewrites; Hush still performs local proposition integrity, protected-literal retention, custody-collapse checks, source-residue checks, mask scoring, and release review.

## Keep the key server-side

Never put provider keys in browser fields, localStorage, committed JavaScript or JSON, screenshots, issues, or receipts.

The browser calls the TD613 API. Serverless endpoints read `process.env.GEMINI_API_KEY` and never return the key.

## Local setup

```bash
cp .env.example .env.local
```

Then set:

```bash
GEMINI_API_KEY=your_key_here
GEMINI_ROUTING_MODE=quality-first
```

Blank model overrides use the repository-wide pinned text order:

```text
gemini-3.5-flash
gemini-3-flash-preview
gemini-2.5-flash
gemini-3.1-flash-lite
gemini-2.5-flash-lite
```

The first eligible high-quality model is tried first. A fallback is used only after failure, timeout, quota pressure, or temporary cooldown. A successful fallback is not promoted above higher-quality models on later requests.

Moving `*-latest` aliases are not defaults. They may be supplied explicitly, but the routing receipt will warn that an operator configured a moving alias.

## Optional overrides

Global exact-model controls:

```bash
GEMINI_MODEL=
GEMINI_MODEL_FALLBACKS=
GEMINI_DISABLED_MODELS=
```

Route-specific controls take precedence:

```bash
HUSH_GEMINI_MODEL=
HUSH_GEMINI_FALLBACKS=
KHONAPOLIT_GEMINI_MODEL=
KHONAPOLIT_GEMINI_FALLBACKS=
```

Comma-separate fallback IDs. Do not put a model into the default lane merely because it appears in AI Studio: a `0 / 0` quota row cannot serve ordinary calls for that project, and image, audio, Live, embedding, robotics, and agent models require task-specific endpoints.

## Runtime routes

- `/api/hush-generate-strict` — Hush strict entrypoint.
- `/api/hush-generate` — quality-first Hush generation route.
- `/api/hush-generate-budgeted` — compatibility route to the same quality router.
- `/api/dome-world/khonapolit` — quality-first Kʰonapolit conversational route.
- `/api/gemini-readiness` — model policy and provider-listing readiness receipt.

The readiness route calls Gemini's model-list endpoint server-side, reports which configured IDs are currently listed for `generateContent`, and exposes no API key. A provider listing does not prove quota entitlement, latency, or response quality.

## Per-model cooldown

Quota, timeout, unavailable-model, and provider failures are recorded per model rather than against Gemini as one undifferentiated provider. This permits the next eligible model to run without allowing one exhausted model to freeze the entire repository.

Cooldown state is opportunistic server-instance memory. It reduces repeated failures on a warm instance; it does not claim globally synchronized quota accounting.

## What gets sent remotely

The Hush contract sends only the bounded candidate-generation payload required by the transform route, including source text, compact structural mask controls, protected literals, proposition obligations, layout-cadence constraints, and no-invention rules.

By default it does not send mask memory, iteration ledgers, local receipts, hidden provenance, the full AU ontology, or custom reference samples. The current strict prompt also quarantines mask lore, persona scenes, sample seed prose, and catchphrase material from the provider.

## Release law

```text
remote provider candidates
→ local Hush integrity and quarantine gates
→ local selection or hold
→ ledger receipt
→ operator review
```

Remote output is never final merely because a higher-capability model generated it. If no model returns a releasable candidate, the strict route remains held rather than promoting a diagnostic review map as transformed prose.
