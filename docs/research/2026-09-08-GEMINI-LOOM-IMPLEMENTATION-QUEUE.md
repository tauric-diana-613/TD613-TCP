# Gemini / Loom / AIA Implementation Queue — 2026-09-08

**State:** documentation-only implementation prep  
**Branch:** `docs/research-tour-gemini-drift-20260908`  
**No provider, merge, deployment, Vercel, or production authority.**

## 1. Shared Gemini model-governance repair

Current repository reality:

- `server/gemini-model-policy.js` is the intended central routing policy.
- Provider discovery via `listGeminiGenerateContentModels()` is advisory only; automatic route planning still seeds from pinned defaults.
- `server/hush-generate-budgeted.js` retains independent model-routing authority through `DEFAULT_MODEL_ORDER`, a moving `gemini-flash-lite-latest` alias, `configuredModels()`, and sticky `preferredWorkingModel` behavior.

### Required repair

1. Make `gemini-model-policy.js` the sole automatic Gemini routing authority.
2. Preserve explicit operator overrides as explicit inputs, never silent defaults.
3. Add model lifecycle metadata with at least:
   - `current`
   - `deprecated`
   - `shutdown_scheduled`
   - `shutdown`
   - `specialized`
   - `unknown_operator_supplied`
4. Automatic routing law:

```text
provider_visible(generateContent)
AND lifecycle != shutdown
AND lifecycle != specialized_for_other_route
AND not operator_disabled
AND route_capability_match
→ callable candidate
```

5. Deprecated/shutdown-scheduled models may be demoted or excluded from defaults before their final date; shutdown models must be absent from automatic routing.
6. Moving `*-latest` aliases are never default routing authority.
7. Provider discovery does not by itself confer quality rank; quality order remains benchmarked and task-specific.

## 2. Consumer task classes

Define task classes explicitly instead of sharing one generic fallback ladder:

```text
hush-transform
khonapolit-dialogue
loom-semantic-mediator
readiness
```

Ash / Giving should continue to inherit Hush provider policy through the existing broker boundary rather than grow a second Gemini catalog.

`loom-semantic-mediator` must prioritize:

- reliable structured output;
- schema adherence;
- bounded uncertainty language;
- semantic classification consistency;
- enough context for admitted Flow-Grammar state;
- low hallucination pressure;
- latency appropriate to an alert/forecast instrument.

A newer model is not automatically better for this task until benchmarked.

## 3. `hush-generate-budgeted.js` migration

Do not casually delete the module because quality routing still imports prompt/custody helpers from it.

Preferred migration:

1. extract reusable non-routing helpers into a shared module;
2. remove `DEFAULT_MODEL_ORDER` as independent authority;
3. remove moving-latest default behavior;
4. replace private `configuredModels()` plan with `resolveGeminiModelPlan({ task: 'hush-transform' })`;
5. preserve strict request/wall budgets independently from model selection;
6. remove sticky provider selection when it conflicts with current shared policy/lifecycle state;
7. add contract tests proving shutdown/provider-absent models cannot re-enter through this legacy path.

## 4. Loom semantic mediator contract

Gemini produces semantic candidates; deterministic TD613 code owns admissibility.

Target schema family:

```text
td613.loom.semantic-field/v0.1
```

Required fields:

- source revision / receipt digest;
- admitted inputs;
- Flow-Core phase;
- Flow-Core glyph relations;
- tendencies / route deltas;
- gluing obstructions;
- missingness / contradiction;
- current ambiance state;
- forecast candidates + horizon + uncertainty;
- alert candidate + evidence basis + severity;
- claim ceiling;
- deterministic animation affordances.

Gemini may not directly issue arbitrary renderer commands.

## 5. Early-alert grammar

Loom is an early-alert instrument as well as DLP.

A bounded alert may precede `L` / latent-state reconstructibility when admitted evidence shows a declared trajectory change such as:

- increased V/C/P distinguishability pressure;
- route-memory anomaly;
- gluing obstruction growth;
- narrowing admissibility corridor;
- recurring probe/return geometry;
- modeled reconstructability pressure;
- ambiance regime transition.

Allowed alert classes:

```text
NONE
NOTICE
POTENTIAL_ENCROACHMENT
RECONSTRUCTABILITY_PRESSURE
AMBIANCE_SHIFT
CONTRADICTION
RECOVERY
REST
```

Required alert receipt:

```text
alert_class
severity
basis[]
source_revision
observed_vs_modeled
uncertainty
claim_ceiling
triggered_glyph_relations[]
```

Never inflate these alerts into proof of provider hidden-state access, attribution, payload recovery, external origin, or demonstrated causal effect.

## 6. AIA dual-runtime packaging

AIA must support both:

### Local Dome-World

Hosted/private TD613.com Loom can consume local admitted state, hosted Gemini mediation, Flow-Core grammar, ambiance state, alert receipts, and local custody information.

### Portable remote

Export carries a provider-neutral packet containing:

- semantic field;
- Flow-Core glyph relations;
- ambiance/current/forecast/alert state;
- alert logic/version;
- claim ceilings;
- admitted route-memory needed for interpretation;
- provenance/replay receipt;
- optional deterministic animation affordances.

Export excludes provider credentials and does not require shared hidden provider state.

The remote environment may generate new alerts from its own admitted surface under the same bounded grammar.

## 7. Loom / `/domeart` animation compiler target

Pedagogue provides semantic constraints; Loom and `/domeart` own the design work.

### Core animation law

```text
ADMITTED_STATE
→ FLOW-CORE RELATION / GLYPH
→ AMBIANCE OR ALERT OPERATOR
→ DETERMINISTIC MOTION AFFORDANCE
→ /DOMEART RENDER
→ CHILD-LEGIBLE EXPLANATION
→ RECEIPT
```

### One-clock architecture

Create one `AnimationCoordinator` per active scene. Subsystems register state-driven callbacks; they do not own competing perpetual RAF clocks.

Coordinator owns:

- frame cadence;
- viewport state;
- reduced-motion posture;
- rest/quiescence;
- active semantic packet;
- glyph-motion layer;
- ambiance/alert layer;
- performance budget;
- deterministic replay seed.

### Flow-Core glyphs

Glyphs are motion primitives, not labels. Their trajectories must visually encode the relation they compress.

### Ambiance / alert weather

Current state, forecast, warning, contradiction, recovery, and rest each receive distinct visual semantics.

Alert choreography must visually reveal *why* the warning exists, preferably through the implicated Flow-Core glyph relation / route geometry rather than generic red flashing.

## 8. Pedagogue feedback threshold

Update Pedagogue itself only when Loom/Aperture comparison produces an unusually strong generalizable result:

- **extraordinarily good:** a motion-semantic pattern materially improves child-legible causal understanding and should become a reusable contract;
- **extraordinarily bad:** a failure exposes a missing semantic/animation invariant worth institutionalizing.

Do not edit Pedagogue merely to mirror every Loom iteration.

Potential future Pedagogue additions if earned:

- alert-state explanation grammar;
- observed vs modeled vs forecast distinction;
- glyph-caused-motion explanation receipt;
- early-alert claim-ceiling vocabulary;
- rest/quiescence explanation for animation clocks.

## 9. Provenance / patent-prep queue

Public repository work should preserve technical lineage and dated hashes without publishing private communications or unverified allegations.

Create a controlled claim ledger outside public GitHub for each candidate inventive unit:

```text
unit_id
working_title
first_known_artifact
artifact_hash / commit
contributor(s)
contribution description
predecessor concepts
novel combination / conception notes
public disclosure dates
private disclosure dates / recipients (controlled evidence only)
implementation status
test status
related claim families
open questions for patent counsel
```

Candidate ancestry to investigate claim-by-claim:

```text
EO-RFD
KIRA
ACEDIT
TD613 Aperture
TD613 Safe Harbor
heterostratigraphy
formal-holonomy tomography
Flow-Core
Dome-World
AIA
Holonomy Loom
```

This is provenance architecture, not an ownership conclusion.

## 10. Suggested chamber order after #1077 closes

1. **Gemini capability registry + lifecycle cleanup**
2. **Legacy Hush routing-authority removal**
3. **`loom-semantic-mediator` schema + validator**
4. **early-alert / ambiance grammar**
5. **Flow-Core glyph-motion table**
6. **`/domeart` AnimationCoordinator**
7. **local + portable AIA packaging**
8. **three-engine/mobile Loom motion benchmark**
9. **Pedagogue update only if extraordinary evidence earns it**
10. **controlled provenance/claim ledger + patent-counsel preparation**

Marked ⟐
