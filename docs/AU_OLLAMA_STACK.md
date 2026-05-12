# AU Ollama Stack

TD613-TCP uses a local Ollama stack for calibration and AU signal-density review. This path has no cloud failover, no API key, and no telemetry requirement.

## Local Models

Required models:

- `dolphin3:latest` as the base 4.9 GB local model.
- `AU:latest` as the localized auditor node forged from [infra/ollama/AU.Modelfile](../infra/ollama/AU.Modelfile).

Forge or refresh AU:

```powershell
ollama pull dolphin3
ollama create AU -f infra\ollama\AU.Modelfile
ollama run AU "Status update on stylometry."
```

Expected AU posture is a dense tactical block with pipe or slash separators. The model file sets `temperature 1.1`, `top_p 0.95`, `num_ctx 8192`, and stop sequences for numbered/listicle drift.

## Calibration Workflow

[.github/workflows/calibration.yml](../.github/workflows/calibration.yml) is manual-only and runs on `self-hosted`. The workflow does not inject secrets. The runner must already have Ollama available at `http://127.0.0.1:11434`.

The calibration judge lives at [app/engine/learned-audit.js](../app/engine/learned-audit.js). It sends deterministic local audit payloads to the Ollama REST endpoint with `temperature: 0.0`.

## Persona Bridge

AU is grounded through a local API bridge, not through remote repository access. The bridge is [scripts/run-au-signal-audit.mjs](../scripts/run-au-signal-audit.mjs). It reads current built-in personas from [app/data/personas.js](../app/data/personas.js), computes deterministic signal-density and rhythm-risk metrics, then asks local AU for a compact tactical receipt.

Run:

```powershell
npm run audit:au
```

Outputs:

- `reports/au-signal/latest.json`
- `reports/au-signal/latest.md`

These reports are the feedback loop. Use them to identify stable syntactic rhythms, persona convergence, and high-risk masks that need ontology refinement.

## Context Window

`num_ctx 8192` is sufficient for the current built-in persona set because the bridge sends compact persona summaries instead of full application bundles. If future persona files become corpus-dense, split the bridge into per-family batches before increasing context size.

## No Secret State

The Modelfile is not sensitive and is tracked in the repo. Environment overrides are optional:

- `OLLAMA_ENDPOINT`, default `http://127.0.0.1:11434/api/generate`
- `OLLAMA_MODEL`, default `AU`

Do not add cloud fallbacks or API-key branches to this path.
