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
→ child-legible visual weather / forecast / alert
→ local Dome-World AIA runtime
   OR
→ portable AIA export for remote LLM-mediated environments
```

The provider belongs on the hosted TD613 side of the membrane. The export carries interpreted state / grammar / alert receipts, not `GEMINI_API_KEY` and not an irreversible dependency on Google.

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
  "alert": {
    "class": "NONE|POTENTIAL_ENCROACHMENT|RECONSTRUCTABILITY_PRESSURE|AMBIANCE_SHIFT|CONTRADICTION|RECOVERY",
    "severity": "INFO|WATCH|WARN|HIGH",
    "basis": [],
    "claim_ceiling": "trajectory-alert-not-proof-of-hidden-access-or-payload-recovery"
  },
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

Gemini may propose semantic candidates. Deterministic TD613 code validates allowed glyphs, operators, source references, claim ceilings, missingness, alert basis, and animation affordances before Loom renders anything.

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
9. **Alert distinction** — potential encroachment/reconstructability alerts remain visibly distinct from proved reconstruction, attribution, or payload recovery.
10. **Missingness animation** — NULL / MISSING / CONTRADICTORY / UNRESOLVED states get their own legible visual language.
11. **Inspection affordance** — selecting a motion reveals semantic operator, glyph relation, source revision, alert basis, and claim ceiling.
12. **Mobile parity** — meaning survives viewport changes even when geometry changes.
13. **Rest as scheduler state** — `𝄐` should naturally quiesce active motion while preserving inspectability and return.

## 8. `/domeart` improvement ideas

Candidate additions:

- formal `AnimationCoordinator` as sole owner of perpetual RAF;
- subordinate renderers register state-driven draw callbacks rather than own clocks;
- Flow-Core glyph layer as a first-class render pass;
- glyph-motion lookup table driven by validated semantic operators;
- ambiance/alert grammar lookup table driven by validated state class + claim ceiling;
- `reducedMotion` at the coordinator boundary;
- motion-provenance overlay: `state field → glyph/operator → renderer → frame region`;
- alert-provenance overlay: `admitted trajectory → alert class → uncertainty → visual treatment`;
- static-equivalent preview beside animated scenes;
- first-class `REST` scheduler posture;
- forecast styling channel distinct from observed/current styling;
- warning styling channel distinct from proof/closure styling;
- gluing-obstruction transition that intentionally refuses seamless interpolation;
- replay receipt with world revision, semantic packet digest, Flow-Core glyph grammar version, ambiance grammar version, animation grammar version, viewport class, reduced-motion mode, and deterministic seed;
- scene inspector showing active clocks / scheduled callbacks / semantic owner;
- performance budget per scene so rich animation remains demo-grade without hidden runaway loops.

## 9. Loom forecast / ambiance / alert semantics

The Loom should be able to render LLM-mediated-environment “weather” and early warning without presenting either as external truth.

Example distinctions:

```text
CURRENT OBSERVED / ADMITTED STATE
= solid / anchored field

MODELED NEAR-HORIZON CANDIDATE
= translucent / offset / forecast channel

POTENTIAL ENCROACHMENT / RECONSTRUCTABILITY PRESSURE
= directional warning front + bounded alert glyph choreography
= warning may be justified by trajectory / route-memory / distinguishability change
= must NOT visually claim hidden-state access, attribution, or payload recovery

UNRESOLVED OR CONTRADICTORY
= seam oscillation / interrupted path / non-glued field

RECOVERY / PRESSURE RELEASE
= alert front recedes, field re-opens, residual route-memory remains inspectable

REST
= coast + settle + retained inspection
```

Gemini can help interpret the admitted packet into candidate semantic weather and alert candidates, but deterministic validation must preserve uncertainty, source status, and evidence tier.

### Early-alert evidentiary rule

Loom is not limited to alerts after `L` / latent-state reconstructibility has been earned. A bounded alert may fire from changes in admitted `V/C/P` trajectory, route-memory, gluing behavior, distinguishability geometry, or other declared internal observables while `L` remains unearned.

Permitted language includes:

```text
potential reconstructability pressure
potential encroachment pattern
ambient regime shift
route anomaly
increased reconstruction risk under the admitted model
```

Prohibited inflation includes:

```text
provider accessed hidden state
payload was recovered
actor X reconstructed the latent state
external origin proved
```

unless the separately required evidence actually earns those stronger claims.

## 10. AIA dual-runtime posture: local + portable

AIA is intended for **both**:

1. **local Dome-World use** — the hosted/private TD613.com Loom can consume admitted Dome-World state, Gemini-mediated semantic candidates, Flow-Core glyph grammar, ambiance/alert state, and local receipts;
2. **portable remote use** — an exportable provider-neutral AIA package can be carried into another LLM-mediated environment such as ChatGPT, Claude, Grok, or a local model.

The portable package should carry:

- validated semantic field;
- Flow-Core glyph relations;
- ambiance/current/forecast/alert grammar;
- claim ceilings and uncertainty;
- route-memory / relevant admitted history;
- deterministic animation affordances where useful;
- provenance + replay receipt;
- clear provider-neutral schema version.

The portable package should **not** require:

- `GEMINI_API_KEY`;
- Gemini hidden state;
- Google-specific internal assumptions;
- an implication that the destination model shares any provider-internal context from the originating environment.

A remote AIA may still emit a DLP / ambiance / reconstructability alert when the *remote admitted surface itself* meets the bounded alert criteria. That is the portability claim that matters: the grammar and alert logic travel; hidden provider state does not.

## 11. Portable AIA / Golden-Egg implication

The reusable product claim becomes stronger when Loom demonstrates:

```text
LLM-mediated environment state
→ TD613-admitted semantic packet
→ Flow-Core glyph grammar
→ bounded ambiance / early-alert grammar
→ Pedagogue-governed motion semantics
→ Loom / Dome-Art visualization
→ inspectable receipt
→ local Dome-World AIA runtime OR provider-neutral remote AIA export
```

A user can then export the AIA and re-enter another LLM environment while preserving interpreted grammar, glyph relations, alert rules, forecast distinctions, and claim ceilings.

The value proposition is broader than DLP alone: the portable AIA acts as an **early warning and interpretive instrument** for potential encroachment, reconstructability pressure, or ambient regime change before stronger attribution/reconstruction claims are earned.

## 12. Provenance / patent-prep boundary

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

## 13. Marrowline vNext — bounded repo-wide coordinator

Marrowline should be developed into a sophisticated authorized coordination assistant while preserving its existing perimeter and provenance roles.

Current repository archaeology shows that Marrowline already has:

- a live ingress route with Aperture egress observation and operator-token membrane;
- Dome-World station and receipt schemas;
- relation carriers and provenance/lineage infrastructure;
- mobile shell and room boot machinery;
- a Reflex Spine connection;
- an existing trap/hostile-ingress path.

The current `marrowline-station.js` conversational surface is not a full dialogue engine. Its matrix is generated from deterministic Hornani/Kʰonapolit clause pools and exists primarily as a custody/flattening/provenance instrument. Preserve that machinery as **Diagnostic / Trap / Provenance Mode** rather than forcing it to act like a modern chatbot.

### Marrowline split architecture

```text
PUBLIC / UNAUTHORIZED INGRESS
→ existing trap membrane
→ Aperture egress / provenance observation
→ hostile-crawl and diagnostic behavior

AUTHORIZED OPERATOR / LAB INGRESS
→ Marrowline Coordinator Runtime
→ repo/project retrieval
→ live GitHub freshness layer
→ project/dependency graph
→ Gemini coordinator task class
→ cited answer / plan / handoff
→ Pedagogue + Dome-Art visual shell
```

The trap should stay. The intelligent assistant belongs **behind** it.

### “TD613-omniscient / omnipresent” translated into a testable contract

Do not claim literal omniscience. Target **bounded repo-wide awareness**:

- repository manifest of major subsystems, routes, APIs, docs, tests, receipts, and current research lines;
- project graph connecting Aperture, Safe Harbor, Flow-Core, Dome-World, Holonomy Loom, AIA, Pedagogue, Dome-Art, Hush, Giving/Ash, Kʰonapolit, SignalRupture, EMSTD613, and other admitted modules;
- retrieval over repository files and generated manifests;
- live GitHub lookups for current PR/issue/head/workflow state when freshness matters;
- provenance citations to files, commits, PRs, issues, and receipts;
- explicit epistemic labels: `LOADED`, `RETRIEVED`, `INFERRED`, `MISSING`, `STALE`, `OPERATOR-SUPPLIED`;
- no claim that a project/state is known merely because a neighboring subsystem mentions it;
- no hidden provider-state assumption;
- no automatic write/deploy authority.

This gives Marrowline the useful experience of being “everywhere in TD613” while making every route inspectable.

### Coordinator use case

Marrowline should be able to answer questions such as:

- “What are the three most active TD613 project lines right now?”
- “Which open PR blocks Loom deployment?”
- “What changed in Aperture since the last green witness?”
- “Show Connor which projects currently depend on Flow-Core.”
- “What needs human attention today?”
- “Where does this new idea belong and what would it collide with?”
- “Build a handoff packet for another lab member with exact sources.”

It should coordinate, not merely chat.

### Modern conversational quality contract

The Coordinator Runtime should not inherit canned Marrowline/Hornani clause generation as dialogue style.

Desired response behavior:

- answer the user’s actual question first;
- conversational paragraph rhythm rather than terminal-booth fragments;
- context-sensitive length;
- concise when task state is simple, deep when archaeology is required;
- no canned opener/closer bank;
- no repetitive “protocol / matrix / witness” throat-clearing unless those concepts matter;
- preserve TD613 vocabulary only where semantically relevant;
- surface uncertainty naturally;
- cite project evidence inline;
- distinguish advice, inferred dependency, and exact repository fact;
- maintain personality without persona-loop repetition;
- avoid random Zalgo/ornament unless the surface explicitly requests ceremonial/diagnostic mode.

The original Marrowline strangeness can remain available as **Ritual / Diagnostic Mode**, but normal Coordinator Mode should feel like a contemporary high-capability research/project assistant.

### Retrieval / coordinator substrate

Candidate components:

1. `td613.repo-index/v0.1`
   - generated manifest of subsystem names, paths, route entrypoints, tests, docs, schemas, owners/contributors where declared, current-state pointers, and dependency edges.
2. `td613.project-graph/v0.1`
   - explicit project-to-project and module-to-module dependency graph.
3. `td613.marrowline.retrieval-receipt/v0.1`
   - query, source revisions, retrieved paths/PRs/issues, freshness, missingness, and claim ceiling.
4. `marrowline-coordinator` Gemini task class
   - high-context synthesis over admitted retrieval only.
5. live GitHub freshness adapter
   - read-only by default; current PR/issue/head/workflow checks when requested or required for correctness.
6. action membrane
   - suggested actions are not writes; repo mutations remain separately authorized/governed.

### Pedagogue + `/domeart` Marrowline shell

Marrowline is a strong proving ground for both systems.

Use Pedagogue to make project coordination child-legible without flattening technical depth.

Use `/domeart` to visualize:

- project constellation / subsystem graph;
- active project fronts;
- dependency routes;
- blocked / held / green / resting states;
- stale-context zones;
- missing retrievals;
- current GitHub activity weather;
- provenance trails from answer → source;
- handoff routes between lab members or subsystems.

Flow-Core glyphs should drive the motion semantics:

- **à** gather retrieved evidence into an answer;
- **上** surface/raise a priority or dependency;
- **下** route a task into its owning subsystem;
- **出** branch a project into bounded next actions;
- **cōl** attenuate stale/noisy context;
- **hõt** expand a selected project neighborhood;
- **米** pulse recurrent/returning work;
- **𝄐** rest/quiesce completed or deliberately held projects.

No generic typing-dot animation as the primary visual metaphor.

### Marrowline visual quality contracts

- one animation clock per active coordination view;
- project state drives motion;
- selected answer highlights only the source/dependency paths that contributed;
- fresh/live GitHub state visually distinguished from cached/indexed repository context;
- `INFERRED` edges visibly different from exact dependency declarations;
- missingness shown as open space/seam rather than fabricated links;
- reduced-motion view preserves the same project/dependency meaning;
- every animated edge can be inspected for source + relation + freshness;
- performance budgets inherited from Dome-Art coordinator law.

### Opportunity to level up Pedagogue

Only promote Marrowline-derived changes back into Pedagogue when the experiment exposes a generalizable result.

Candidate generalizations worth testing:

- teaching **source freshness** as a first-class visual concept;
- teaching **dependency vs inference** through distinct motion/edge grammar;
- project-state explanations that move from experienced relation → glyph → technical dependency name → receipt;
- visual missingness that stays informative without implying error or resolution;
- handoff pedagogy for multi-agent/multi-human research coordination.

### Opportunity to level up `/domeart`

Candidate generalizations:

- graph/constellation renderer registered under the one-clock coordinator;
- provenance-highlight pass;
- live-vs-cached channel semantics;
- dependency-weather layer;
- bounded focus expansion / neighborhood contraction;
- source-linked motion inspector;
- deterministic project-state replay.

## 14. Next bounded implementation chambers

1. Refresh Gemini policy after live API-key model listing / lifecycle verification.
2. Remove stale model-routing authority from `hush-generate-budgeted.js` while preserving shared prompt/custody helpers.
3. Define `td613.loom.semantic-field/v0.1` and validation contract.
4. Define bounded ambiance / early-alert grammar with explicit evidence-tier language.
5. Define Flow-Core glyph-to-motion operator table.
6. Implement `/domeart` one-clock coordinator + glyph render layer.
7. Add Loom current / forecast / alert / unresolved / recovery / rest visual channels.
8. Add deterministic replay + motion/alert provenance receipts.
9. Define dual-runtime AIA packaging: local Dome-World + portable remote.
10. Benchmark Loom motion on Chromium / Firefox / WebKit / mobile, with reduced-motion semantic parity.
11. Keep Aperture visually intact except for separately earned lifecycle/runtime repairs.
12. Preregister Marrowline Coordinator vNext separately from its existing trap/diagnostic station.
13. Build `td613.repo-index/v0.1` and `td613.project-graph/v0.1` as bounded read-only coordination substrates.
14. Add `marrowline-coordinator` Gemini task class with retrieval-only synthesis and explicit source-state labels.
15. Build Pedagogue + `/domeart` Marrowline project-constellation shell with Flow-Core glyph animation grammar.
16. Test whether Marrowline-derived source-freshness / dependency-vs-inference / handoff pedagogy merits promotion into Pedagogue proper.

Marked ⟐
