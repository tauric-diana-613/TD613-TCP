# Flow-Core Pedagogue

This is the **canonical repository shortcut** into the Flow-Core Pedagogue program.

An agent should begin here rather than discovering Pedagogue by scattered imports. The implementation is intentionally distributed; the identity, reach rules, authority boundary, and current research metabolism are housed here.

Pedagogue has two related bodies:

1. **Design Gate / practice pedagogy** — consequence order, AIA route structure, route burden, route memory, custody/refusal sequencing, human closure, and harmless known-ground-truth practice routes.
2. **Research metabolism** — source-faithful research hydration, bounded assay authoring, criterion-family separation, mechanism refinement, falsifier preservation, and explicit non-promotion.

Neither body grants autonomous redesign, experiment execution, custody mutation, release, or production authority.

## Reach rule

Reach for Pedagogue when a product, workflow, ontology, research fixture, or proposed shared mechanism changes one or more of:

- the order in which a person encounters consequence, terminology, rest, or exit;
- AIA route structure or child/custodian/auditor/technical projections;
- route burden, dependencies, projection crossings, gluing obstruction, or route memory;
- custody, release, refusal, or human-closure sequencing;
- a high-consequence mutation path or Cistern Law boundary;
- a shared pattern that may deserve promotion from one context into reusable infrastructure;
- a consequential workspace that needs a harmless practice case;
- a research claim that needs a falsifier, negative control, model-scope boundary, or explicit forbidden inference;
- a repeated cross-domain relation that may be worth an independent assay but must not become ontology by repetition alone.

If the question is specifically about **observability, identifiability, reconstruction, conditioning, uncertainty geometry, widening, abstention, replay, or whether a proposed next observation is actually informative**, also reach for [`APERTURE.md`](APERTURE.md). Pedagogue may propose or reframe the question; Aperture audits whether the question addresses the admitted deficit under the declared observation geometry.

## Run the Design Gate

Preferred from repository root:

```bash
npm run pedagogue:design -- <fixture.json>
npm run test:pedagogue
```

Direct runner:

```bash
node scripts/run-pedagogue-design-gate.mjs <fixture.json>
```

The Design Gate invokes the real shared engine:

- `app/engine/pedagogue-design-gate.js`
- `app/engine/pedagogue-practice-fixture.js`
- `app/engine/flowcore-pedagogue-core.js`
- `app/engine/flowcore-pedagogue-aia.js`
- `app/engine/flowcore-pedagogue-route-memory.js`
- `app/engine/flowcore-route-burden.js`
- `app/engine/flowcore-aia-surface-binding.js`

Read the full design contracts in:

- [`docs/PEDAGOGUE_DESIGN_GATE.md`](docs/PEDAGOGUE_DESIGN_GATE.md)
- [`docs/CANONICAL_PRACTICE_FIXTURE.md`](docs/CANONICAL_PRACTICE_FIXTURE.md)

## Research metabolism

Research hydration is additive to the Design Gate. It does **not** turn Pedagogue into an autonomous scientist or promote external literature into TD613 ontology.

Canonical research implementation:

- `app/engine/pedagogue-research-transfer.js`
- `app/engine/pedagogue-research-assay-witness.js`
- `app/engine/pedagogue-research-criterion-family.js`
- `app/engine/pedagogue-research-mechanism-refinement.js`

Canonical research explanation:

- [`docs/PEDAGOGUE_RESEARCH_HYDRATION.md`](docs/PEDAGOGUE_RESEARCH_HYDRATION.md)
- [`docs/PEDAGOGUE_RESEARCH_ASSAY_WITNESSES.md`](docs/PEDAGOGUE_RESEARCH_ASSAY_WITNESSES.md)

Current research proving ground:

- `app/dome-world/docs/ash/experiments/a15-r0/`
- `app/dome-world/previews/a15-r0/`
- `tests/fixtures/pedagogue/pedagogue-research-literature-2026-v01-*.json`

The research-learning route is:

```text
primary source
→ source-faithful provenance precision
→ bounded research-transfer card
→ stripped generic relation
→ cross-domain review candidate
→ independent synthetic assay
→ hostile control / falsifier
→ bounded mechanism refinement
→ human closure
→ only then consider shared-core promotion
```

A repeated relation may become `CROSS_DOMAIN_REVIEW_CANDIDATE`. It may not become `PEDAGOGUE_LAW` merely because several papers rhyme.

## What the gate protects

- consequence before ontology;
- child-legible NOW / WHY / EXACT;
- non-equivalent AIA routes with preserved governed invariants;
- route-history preservation even when endpoints match;
- rest and exit without penalty;
- comparative burden rather than user diagnosis;
- recommendation, never automatic redesign;
- source class and source-date precision as evidence;
- model scope, alternatives, falsifiers, and forbidden inference;
- bounded station authority and mandatory human closure.

## Canonical Practice Fixture

A Canonical Practice Fixture is a manifestly fictional, authority-closed practice case that declares the expected route through a real workspace.

The operator sees a Practice case or another product-native label. Research/test architecture may call the same object a calibration phantom when its known route is used to measure reconstruction error.

The fixture is not a mock product and not a second demo route. Loading it changes fictional labels/inputs only. It must not fabricate records, run retrieval, write custody, mutate a domain system, or grant authority. Explicit later gestures may exercise admitted read-only retrieval or reversible practice-custody writes while evidentiary and consequence authority stay closed.

Example:

```bash
npm run pedagogue:design -- tests/fixtures/pedagogue/giving-bikini-bottom-practice.json
```

The Ash/Loom calibration fixture remains test/research-only and does not bind the generic practice machinery into live Ash.

## How products and research teach the engine

A product fixture or research assay may reveal a reusable mechanism. Promote that mechanism into shared core only when it is generic, tested independently from the context that revealed it, and does not widen authority.

Keep product names, paper-specific ontology, fixture labels, and business rules out of shared core. The shared Pedagogue core should describe the mechanism, not the product or paper that happened to teach it.

A nested surface can teach the architecture how to bind products into AIA without turning product names into new AIA routes. The generic `flowcore-aia-surface-binding.js` primitive binds a Dome-hosted surface to the four canonical non-equivalent AIA projections while preserving invariant verification, explicit route selection, bounded authority, rest/exit, and human closure.

Bikini Bottom may teach the generic practice-fixture mechanic; Bikini Bottom does not become Pedagogue ontology. Likewise, tomography, moiré, phasonics, stylometry, inverse design, or quantum-geometry papers may teach experimental relations; their physical ontology does not transfer into TD613 by analogy.

## Companion instrument · Aperture

Pedagogue and Aperture are complementary, not hierarchical.

```text
Pedagogue
  → consequence / route / learning / candidate-question grammar

Aperture
  → observation / reconstruction / identifiability / stability / uncertainty / abstention / replay audit
```

When both are implicated:

```text
Pedagogue proposes or reframes
→ Aperture audits the admitted observation geometry
→ Dome-World hosts any research assay
→ human closure remains required
```

Neither instrument becomes the crown. Neither may silently execute the other's recommendation.

See [`APERTURE.md`](APERTURE.md) for the companion shortcut and the installed Aperture roots.

See root [`AGENTS.md`](AGENTS.md) for the agent-facing entry contract.
