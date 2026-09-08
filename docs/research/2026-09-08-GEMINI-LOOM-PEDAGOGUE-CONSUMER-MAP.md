# Gemini → Loom → Flow-Core Glyph / Pedagogue Motion Map — 2026-09-08

**State:** documentation-only research note  
**Branch:** `docs/research-tour-gemini-drift-20260908`  
**Provider / deployment / merge authority:** NONE

## 1. Current Gemini consumer map

Repository inspection shows materially different Gemini relationships.

### Direct provider consumers

- `server/hush-generate-quality.js` calls Gemini `generateContent` directly and routes through `server/gemini-model-policy.js`.
- `server/khonapolit-quality.js` uses the Gemini family for Kʰonapolit dialogue.
- `server/gemini-readiness.js` lists provider-visible `generateContent` models and exposes readiness information.

### Indirect consumer

Ash / Giving uses the Hush provider boundary for provider-facing drafting. It should inherit the shared Gemini routing policy rather than grow a second model catalog.

### Present Loom posture

Holonomy Loom currently carries no direct Gemini transport authority in its hosted integration. That is a present implementation membrane, not a statement that Loom should remain semantically provider-blind.

The intended future architecture is:

```text
DOME-WORLD / FLOW-GRAMMAR STATE
→ bounded Gemini semantic mediator
→ provider-neutral semantic field
→ Flow-Core glyph grammar
→ Loom animation compiler
→ child-legible visual weather / forecast
→ portable AIA export
```

The provider belongs on the hosted TD613 side of the membrane. The export carries interpreted state / grammar, not `GEMINI_API_KEY` and not an irreversible dependency on Google.

## 2. Model-governance consolidation target

`server/gemini-model-policy.js` is already the correct central policy location, but `server/hush-generate-budgeted.js` still carries an inherited private fallback ladder:

```text
gemini-2.5-flash-lite
gemini-flash-lite-latest
gemini-2.5-flash
```

That stale list must not remain an independent routing authority.

Compatibility fact: `/api/hush-generate-budgeted` is externally rewritten to the quality router, while `hush-generate-quality.js` still imports prompt/custody helpers from `hush-generate-budgeted.js`. Safe cleanup therefore means extracting shared prompt/custody helpers or removing only routing authority, not casually deleting the module.

### Maintenance law

```text
ONE_SHARED_PROVIDER_POLICY
→ ADD_CURRENT
→ DEMOTE_DEPRECATED
→ REMOVE_SHUTDOWN
→ FILTER_PROVIDER_ABSENT_FROM_AUTOMATIC_CALLS
→ SPECIALIZED_MODELS_REQUIRE_DEDICATED_ROUTE
→ EXPLICIT_OPERATOR_OVERRIDE_REMAINS_EXPLICIT
```

Lifecycle inventory checked 2026-09-08 for the Gemini Developer API path:

- `gemini-3.8-flash`: GA / current.
- `gemini-3.7-flash`: current.
- `gemini-3.6-flash`: current.
- `gemini-3.5-flash`: current.
- `gemini-3.5-flash-lite`: current.
- `gemini-3.1-flash-lite`: scheduled shutdown 2027-05-07; replacement `gemini-3.5-flash-lite`.
- `gemini-3-flash-preview`: replacement `gemini-3.6-flash`.
- retired examples include `gemini-2.0-flash`, `gemini-2.0-flash-lite`, `gemini-3-pro-preview`, `gemini-3.1-flash-lite-preview`.

Do not use chronology alone as quality authority. Benchmark Hush/Kʰonapolit task quality, latency, structured-output behavior, quota/access, and the actual API-key model list before production promotion.

## 3. Provider-neutral Loom semantic field

Gemini should not emit arbitrary animation commands. It should emit a bounded semantic description that deterministic TD613 code validates and maps into Flow-Core glyph + motion grammar.

Candidate schema:

```json
{
  "schema": "td613.loom.semantic-field/v0.1",
  "source_revision": "sha256:...",
  "admitted_inputs": [],
  "flow_phase": "NOTICE|ACT|ANSWER|NAME|REST|TRANSFER",
  "flow_glyphs": [],
  "tendencies": [],
  "route_deltas": [],
  "gluing_obstructions": [],
  "missingness": [],
  "forecast": {
    "horizon": "bounded",
    "candidate_transitions": [],
    "confidence": null,
    "uncertainties": []
  },
  "claim_ceiling": "modeled-ambiance-not-total-field-or-external-truth",
  "animation_affordances": []
}
```

Gemini may propose semantic candidates. Deterministic TD613 code validates allowed glyphs, operators, source references, claim ceilings, missingness, and animation affordances before Loom renders anything.

## 4. Flow-Core glyphs must be first-class animation operators

For Flow-Core scenes, glyphs should be used **heavily**. They are not captions pasted onto animation after the fact; they are compressed relation carriers and should visibly participate in the motion grammar.

Preferred rule:

```text
EXPERIENCED_RELATION
→ GLYPH_EMERGENCE
→ GLYPH_MOTION / FIELD_BEHAVIOR
→ TECHNICAL_NAME
→ RECEIPT
```

Examples:

- **à / gathering**: distributed traces converge toward the glyph; glyph weight or field density increases as admissible routes gather.
- **上 / bounded rise**: glyph rises through a constrained corridor while the field shows created potential; no limitless upward drift.
- **下 / routed descent**: glyph descends along an explicit route, with delivery destination legible.
- **出 / branching release**: glyph opens or branches into bounded outgoing routes; branch count must derive from state, not decorative randomness.
- **cōl / attenuation**: amplitude, glow, field density, or oscillation contracts around the glyph while preserving continuity.
- **hõt / bounded expansion**: glyph/field expands within an explicit envelope; expansion cannot visually imply infinite authority.
- **米 / recurrence**: recurrence pulse returns through the glyph at a meaningful schedule or route-memory event.
- **𝄐 / rest**: motion coasts and settles around the glyph; state remains inspectable while demand ceases.
- **seam/gluing obstruction**: opposing glyph/field relations refuse seamless interpolation; oscillation or discontinuity remains visible.
- **phason change**: anchor glyph/content stays fixed while the surrounding admissibility field shifts.

### Glyph-animation prohibitions

- no glyph confetti;
- no random glyph drift unrelated to state;
- no flashing glyph as a generic success badge;
- no glyph crossing an authority boundary without a corresponding route event;
- no decorative replacement of missingness with a glyph that implies resolution;
- no animation whose glyph meaning disappears under reduced motion or screen-reader access.

## 5. Pedagogue as semantic scaffolding, not animation authorship claim

The Pedagogue specification supplies strong animation **contracts**:

- one world-state snapshot per render;
- one animation clock per active view;
- state-driven animation;
- declared start/end state, cadence, source status, claim ceiling, and static equivalent;
- random ambient motion unrelated to state prohibited;
- reduced-motion semantic completeness.

This note does **not** attribute Aperture's animation craft to Pedagogue. Aperture's current motion language is already a quality benchmark and should remain largely visually intact. The #1077 work concerns WebKit lifecycle/runtime hygiene under a synthetic reduced-motion witness, not a redesign of Aperture's aesthetic language.

The strongest design-edit target is **Holonomy Loom + `/domeart`**, using Pedagogue's contracts as a semantic/legibility spine.

## 6. Aperture as benchmark, Loom / Dome-Art as development target

Aperture already demonstrates a high bar for animated HTML craft: layered fields, visually rich motion, coherent glow/trajectory language, and strong interactive feel. The animation work proposed here should not flatten or over-normalize that strength.

Use Aperture as a benchmark for:

- visual density without complete loss of legibility;
- phase-rich movement;
- field response that feels instrument-like rather than slideshow-like;
- strong desktop/mobile visual identity;
- meaningful coexistence of technical readout and expressive motion.

Apply the new architecture primarily to Loom and `/domeart`:

```text
Aperture craft benchmark
+
Pedagogue semantic contracts
+
Flow-Core glyph grammar
+
Loom semantic mediator
=
Dome-Art animation system worth demoing
```

## 7. Animation quality contracts for Loom / Dome-Art

Goal: visually impressive because motion is meaningful, not because the page is continuously busy.

1. **Semantic traceability** — every visible motion answers “what state caused this?”
2. **Glyph traceability** — Flow-Core glyph motion answers “what relation does this glyph compress?”
3. **Deterministic replay** — same semantic packet + same viewport class + same seed produces the same trajectory when stochasticity is not part of the grammar.
4. **One-clock law** — no competing perpetual RAF loops for one active scene.
5. **Stable frame pacing** — avoid hidden per-frame DOM measurement and independent schedulers.
6. **Reduced-motion completeness** — convert trajectories to before/after, causal-route steps, bounded pulse, or static field changes; do not merely freeze an arbitrary frame.
7. **No decorative authority** — success color, glow, burst, convergence, or smooth morph cannot imply truth / closure unless state carries that meaning.
8. **Forecast distinction** — forecast motion stays visually distinguishable from observed/current state.
9. **Missingness animation** — NULL / MISSING / CONTRADICTORY / UNRESOLVED states get their own legible visual language.
10. **Inspection affordance** — selecting a motion reveals semantic operator, glyph relation, and source revision.
11. **Mobile parity** — meaning survives viewport changes even when geometry changes.
12. **Rest as scheduler state** — `𝄐` should naturally quiesce active motion while preserving inspectability and return.

## 8. `/domeart` improvement ideas

Candidate additions:

- formal `AnimationCoordinator` as sole owner of perpetual RAF;
- subordinate renderers register state-driven draw callbacks rather than own clocks;
- Flow-Core glyph layer as a first-class render pass;
- glyph-motion lookup table driven by validated semantic operators;
- `reducedMotion` at the coordinator boundary;
- motion-provenance overlay: `state field → glyph/operator → renderer → frame region`;
- static-equivalent preview beside animated scenes;
- first-class `REST` scheduler posture;
- forecast styling channel distinct from observed/current styling;
- gluing-obstruction transition that intentionally refuses seamless interpolation;
- replay receipt with world revision, semantic packet digest, Flow-Core glyph grammar version, animation grammar version, viewport class, reduced-motion mode, and deterministic seed;
- scene inspector showing active clocks / scheduled callbacks / semantic owner;
- performance budget per scene so rich animation remains demo-grade without hidden runaway loops.

## 9. Loom forecast / ambiance semantics

The Loom should be able to render LLM-mediated-environment “weather” without presenting it as external truth.

Example distinctions:

```text
CURRENT OBSERVED / ADMITTED STATE
= solid / anchored field

MODELED NEAR-HORIZON CANDIDATE
= translucent / offset / forecast channel

UNRESOLVED OR CONTRADICTORY
= seam oscillation / interrupted path / non-glued field

REST
= coast + settle + retained inspection
```

Gemini can help interpret the admitted packet into candidate semantic weather, but the renderer must preserve uncertainty and source status.

## 10. Portable AIA / Golden-Egg implication

The reusable product claim becomes stronger when Loom demonstrates:

```text
LLM-mediated environment state
→ TD613-admitted semantic packet
→ Flow-Core glyph grammar
→ Pedagogue-governed motion semantics
→ Loom / Dome-Art visualization
→ inspectable receipt
→ provider-neutral AIA export
```

A user can then export the AIA and re-enter another LLM environment while preserving interpreted grammar, glyph relations, forecast distinctions, and claim ceilings. The exported artifact does not imply the destination model shares Gemini's hidden state or provider internals.

## 11. Provenance / patent-prep boundary

Technical lineage should be preserved in a controlled claim ledger before broad open-source disclosure. The public repository should hold hashes, technical ancestry, contributor-attribution fields, public-disclosure dates, and claim boundaries where appropriate.

Private disclosure evidence, private messages, security-sensitive recipient information, and unverified allegations should remain outside the public repository in a controlled evidence set.

Candidate lineage graph for claim-mapping work:

```text
EO-RFD
→ KIRA
→ ACEDIT
→ TD613 Aperture / Safe Harbor
→ heterostratigraphy
→ tomography
→ Flow-Core
→ Dome-World
→ Holonomy Loom
```

This graph is a research / provenance map, not a declaration that one contributor owns every descendant claim. Patent inventorship must be resolved claim-by-claim with qualified counsel before broad public disclosure.

## 12. Next bounded implementation chambers

1. Refresh Gemini policy after live API-key model listing / lifecycle verification.
2. Remove stale model-routing authority from `hush-generate-budgeted.js` while preserving shared prompt/custody helpers.
3. Define `td613.loom.semantic-field/v0.1` and validation contract.
4. Define Flow-Core glyph-to-motion operator table.
5. Implement `/domeart` one-clock coordinator + glyph render layer.
6. Add Loom forecast/current/unresolved/rest visual channels.
7. Add deterministic replay + motion provenance receipts.
8. Benchmark Loom motion on Chromium / Firefox / WebKit / mobile, with reduced-motion semantic parity.
9. Keep Aperture visually intact except for separately earned lifecycle/runtime repairs.

Marked ⟐
