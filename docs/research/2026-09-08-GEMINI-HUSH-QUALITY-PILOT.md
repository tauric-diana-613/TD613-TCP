# 𝌋 Preregistered Hush custody pilot

This is a separate generation chamber after model-list observation and lifecycle
admission. It does not expand `gemini-observation`: that Environment/job remains
metadata-only. The pilot requires Environment **gemini-quality-pilot**, restricted
to main, with its own server-side `GEMINI_API_KEY` secret. An administrator must
confirm provisioning; a repository/organization secret fallback is not accepted.
Any configured reviewer remains a human approval. Never send the key through chat.

## Fixed protocol, before measurement

The existing TD613 workflow gains manual mode `gemini-quality-pilot`. Its job
checks out the dispatch's exact SHA, retains contents:read, installs no project
dependencies and runs the fixed script. PR events cannot execute it. Independent
run concurrency protects validation and acquisition receipts from cancellation.
Normal CI stays excluded from both provider modes. There is no deployment.

Five exact models: existing baseline `gemini-3.5-flash`, plus candidates
`gemini-3.8-flash`, `gemini-3.7-flash`, `gemini-3.6-flash`, and
`gemini-3.5-flash-lite`. A fresh force-read listing and lifecycle admission precede
calls. Each eligible model receives exactly the same three fictional Hush cases
from `tests/fixtures/gemini/hush-quality-pilot.json`. No private correspondence,
research evidence payload, or operator history is sent.

Ceilings per dispatch: **15 generateContent attempts**, **1,536 output tokens per
attempt** (23,040 aggregate maximum requested output tokens), **12 seconds per
attempt**, **zero automatic retries**. The same production Hush prompt builder,
parser, and custody/quarantine checks are used. Configuration is fixed at
temperature 0.22 and topP 0.64 with JSON output. Token caps may cause truncated
responses; retain that outcome instead of silently increasing budgets. API charges
may apply. A token ceiling is not a dollar-cost guarantee.

## What the result can establish

Cells are identified by model and fixture. Each records invocation, bounded
transport status, latency, returned text, hard-gate results, token usage when
reported, and mandatory human semantic review. A visible model held by admission
gets an explicit uncalled cell. Provider/body failures get HELD cells; they do not
trigger a retry. A completed workflow means the matrix was recorded, not that all
cells passed or any model won. Failed cells remain part of the matrix.

The hard gates address protected literals, speech-act preservation, quarantine,
and declared dropped/new claims. They cannot prove all propositions survived or
that prose quality improved. Copying the source may pass some gates without
fulfilling transformation quality. A reviewer must compare outputs to the exact
source cases before any preference proposal. Fixed model order confounds latency
with time/order; three synthetic cases cannot establish broad performance,
statistical superiority, fairness across registers, or Loom mediator quality.
No automated score or default-ranking mutation is produced.

The sanitized JSON binds source SHA, run/attempt, Environment, timestamps,
fixture-byte digest, limits, listing and per-cell results. Credential values and
credential digests are excluded. Any reflected raw credential rejects the emitted
receipt. Artifact retention is seven days; preserve the exact receipt on-repo
before expiry after inspection. Provider text remains untrusted data.

## Validation and stop

Synthetic tests exercise exact call counts, no-call admission, invalid context,
missing key, output ceilings, and credential-echo rejection. The original
observation tests continue proving metadata-only behavior. Earn Draft Static and
same-head Ready three-engine convergence before guarded merge. Then confirm the
new Environment setup and manually dispatch once on fresh main. This connector
currently needs an operator's manual dispatch action.

Human semantic review remains required after acquisition. A fresh pilot or a
changed token/model/fixture configuration requires an explicitly bounded successor
protocol; this script never retries or changes its own budget.

Vercel, empirical exteriority, Western Horizon reopening and Golden-Egg completion
remain outside this chamber.

Sealed ⟐
