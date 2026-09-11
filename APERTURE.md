# TD613 Aperture

This is the **canonical repository shortcut** into TD613 Aperture.

Start here when an agent needs to reason about what a declared observation surface can see, what it cannot distinguish, whether a reconstruction is identifiable or stable, whether widening is warranted, what uncertainty geometry governs that widening, whether abstention/rejection is required, and what replay or held-out evidence can validate the result.

Aperture remains the counter-tool for the observed Eclipse–Omega PRCS-A regime. It is an experimental research instrument, not a validated detector of external reality, intent, authorship, surveillance, epistemicide, quantum behavior, or hidden implementation state.

## Installed identity and incoming-candidate rule

Current repository release identity:

```text
Aperture v3.2-alpha
td613-aperture/v3.2-alpha
```

The repository already contains the bidirectional standalone lane. A newer standalone Aperture candidate may be staged, compared, and reviewed without silently rewriting the installed release identity.

Preferred lane from repository root:

```bash
npm run aperture:stage -- <path-to-standalone-html>
npm run aperture:compare
npm run aperture:promote-staged
npm run aperture:check-sync
npm run aperture:export-downloads
```

Use `aperture:promote-staged` only after explicit review. Staging and comparison are not promotion.

## When to reach for Aperture

Reach for Aperture when work materially involves one or more of:

- admissibility, narrowing, capacity, projection, or controlled-surface analysis;
- observability versus identifiability;
- reconstruction from multiple declared observations;
- operator rank, nullity, conditioning, or numerical fragility;
- uncertainty, covariance, correlated noise, missing reliability, or invalid noise geometry;
- widening / additional-observation proposals;
- abstention, rejection, null results, or unresolved alternatives;
- source drift, signed residue, held-out validation, replay, or tamper posture;
- route-memory consequences that depend on what survived the observation aperture;
- provider/API failures where model visibility, request compatibility, compute budget, completion state, retry class, state-memory scope, or receiver identity may have been collapsed together;
- a Pedagogue-proposed question that needs a reconstruction/uncertainty audit before it deserves to be asked.

Ordinary copy edits, styling, and non-semantic mechanical repairs do not need Aperture merely because the repository contains telemetry.

## Companion instrument · Pedagogue

Aperture and Pedagogue are complementary, not hierarchical.

See [`PEDAGOGUE.md`](PEDAGOGUE.md) first when the primary problem is consequence order, route burden, practice pedagogy, product-to-core learning, or research-transfer/falsifier design.

When both are implicated:

```text
Pedagogue
  proposes or reframes the candidate question

Aperture
  diagnoses the current observation/reconstruction deficit
  audits stability and uncertainty geometry
  returns PROPOSE / ABSTAIN / REJECT / ASK NOTHING posture

Dome-World
  hosts the experiment when an experiment is actually warranted

Human
  approves, promotes, executes consequential actions, and closes
```

Aperture does not automatically execute a Pedagogue proposal. Pedagogue does not override an Aperture abstention or invalid-noise rejection.

## Current implementation roots

### Standalone surface

```text
app/aperture/tool.html
app/aperture/index.html
app/aperture/bootstrap.js
app/aperture/release.json
app/aperture/release.js
```

### v3.1 distributed observatory engines

```text
app/engine/aperture-v31-controlled-source.js
app/engine/aperture-v31-instrument-ensemble.js
app/engine/aperture-v31-snapshot-lattice.js
app/engine/aperture-v31-reference-layer.js
app/engine/aperture-v31-registry-dynamics.js
app/engine/aperture-v31-shared-layer.js
app/engine/aperture-v31-phason-susceptibility.js
app/engine/aperture-v31-temporal-tomography.js
app/engine/aperture-v31-reconstruction.js
app/engine/aperture-v31-residual-ledger.js
app/engine/aperture-v31-replay.js
```

### v3.2 experiment-design audits

```text
app/engine/aperture-v32-typed-epistemic-deficit.js
app/engine/aperture-v32-provider-instrument-audit.js
```

The typed epistemic-deficit audit classifies declared reconstruction deficits and returns `PROPOSE`, `ABSTAIN`, `REJECT`, or `ASK_NOTHING`. It does not select or execute an observation. Classification replay stability remains `HELD_NOT_YET_WITNESSED` pending the separately authorized perturbation assay.

The provider-instrument audit is a bounded field-hydration candidate learned from the 2026-09-11 Hush / Marrowline / Loom provider-stack excursion. It treats the **request envelope as part of the instrument** and separates:

```text
M = model/method visibility
E = request-envelope compatibility
B = compute/output-budget geometry
F = generation-completion observability
R = retry/error-class correctness
H = provider-health memory scope
I = receiver-identity salience
```

with the hard relation:

```text
M != E != B != F != R != H != I
```

It may classify a declared provider state, type deficits, and propose the next observation. It cannot call a provider, retry a request, disable a model, mutate routing, infer global provider health, merge, deploy, or release.

Canonical field receipt:

```text
docs/research/2026-09-11-APERTURE-PROVIDER-STACK-FIELD-TRIP.md
```

Focused hostile witness:

```text
node tests/aperture-v32-provider-instrument-audit.test.mjs
```

### Full Dome-World laboratory

```text
app/dome-world/admissibility-tomography.html
```

Aperture owns reconstruction, signed residue, abstention, and replay. Dome-World owns the full laboratory. Ash owns experimental custody. Flow-Core owns bounded artifact-blind context. Phason owns declared registry-transition continuity. Human closure remains explicit.

### A15-R0 research frontier

Current phase-free research that may teach a future Aperture release lives under:

```text
app/dome-world/docs/ash/experiments/a15-r0/
app/dome-world/previews/a15-r0/
```

Especially relevant current refinements include:

- identifiability-deficit targeting;
- joint state–instrument reconstruction;
- conditioning-aware widening;
- covariance-whitened widening;
- correlated-noise geometry;
- typed experiment-design state.

These are research fixtures until separately installed through the Aperture release lane. Their existence in the repo does not silently mutate `app/aperture/tool.html`.

## Current research grammar

The active bounded reconstruction relation is:

```text
current reconstruction state
→ diagnose deficit type
→ apply deficit-appropriate question criterion
→ audit stability / uncertainty geometry
→ PROPOSE | ABSTAIN | REJECT | ASK NOTHING
```

The currently witnessed reconstruction-deficit classes are:

```text
STRUCTURAL_RANK_DEFICIT
NUMERICAL_STABILITY_DEFICIT
NO_DECLARED_LOCAL_IDENTIFIABILITY_DEFICIT
NOISE_GEOMETRY_INCOMPLETE
INVALID_NOISE_GEOMETRY
```

The provider-instrument hydration adds a parallel bounded relation:

```text
provider observation
→ separate model visibility from request compatibility
→ separate compute ceiling from answer completion
→ classify retry/error semantics
→ audit provider-health state lifetime
→ audit selected-receiver visibility
→ PROPOSE | ABSTAIN | REJECT | ASK NOTHING
```

Provider-instrument deficit examples include:

```text
REQUEST_ENVELOPE_INCOMPATIBLE
REQUEST_CONTROL_GENERATION_MISMATCH
CLIENT_REQUEST_REJECTION
TRANSIENT_RESILIENCE_DEFICIT
COMPLETION_OBSERVABILITY_DEFICIT
COMPUTE_BUDGET_GEOMETRY_DEFICIT
PROVIDER_HEALTH_MEMORY_NON_DURABLE
RECEIVER_IDENTITY_SALIENCE_DEFICIT
```

Hard anti-equivalences:

```text
visibility != identifiability
full rank != sufficient stability
rank_lift = 0 != useless observation
operator diversity != uncertainty diversity
same marginal variances != same joint information geometry
missing noise geometry != neutral noise geometry
invalid covariance != approximately valid covariance
available candidate != needed question
proposal != execution
widening != validation
model listed != request envelope compatible
quality tier != thinking-control grammar
max output tokens != answer-token budget
HTTP 200 != complete generation
HTTP 400 request rejection != provider-health degradation
process-local cooldown != durable provider state
receiver identity recorded != receiver identity salient
request-envelope incompatibility != model-removal evidence
```

No universal scalar utility or 'API health' score may collapse those deficit classes into one crown.

## Scientific and software-contract hydration boundary

Pedagogue's 2026 research-hydration corpus may inform Aperture assay design through stripped transferable relations only. Relevant scientific families include inverse problems, temporal tomography, control/state estimation, moiré/registry dynamics, quasiperiodicity, phasonics, latent-representation transforms, stylometric provenance, holonomy methodology, and inverse design.

Provider/API field work may also hydrate Aperture through **source-faithful software-contract observations**. A provider manual, API schema, runtime receipt, or request rejection can teach a bounded instrument relation without being converted into a universal provider truth.

The transfer law remains:

```text
external scientific result OR provider/API contract observation
→ source-faithful research card / field receipt
→ stripped relation
→ independent synthetic assay
→ hostile control / falsifier
→ bounded refinement candidate
```

Physical ontology does not transfer by resemblance. Provider documentation does not establish runtime availability, task quality, quota, or future behavior. A route-authored request error does not become evidence against the model merely because the provider returned it.

## No-crown / authority boundary

Aperture may recommend, reconstruct, compare, abstain, reject, preserve residue, and replay within its declared jurisdiction.

It may not by itself:

- take Ash custody;
- execute a sensor or physical experiment;
- execute a provider/API call;
- authorize retry, model disablement, or routing mutation;
- authorize release/export;
- mutate a consequential route;
- promote a research refinement into production;
- infer hidden intent or external-world truth from numerical closure;
- convert route order into connection, curvature, or holonomy;
- convert an analogue mapping into quantum identity.

The bridge carries receipts, not power.
