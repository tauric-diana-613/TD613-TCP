# Flow-Core Pedagogue

This is the repository shortcut into the Flow-Core Pedagogue design program.

Use it when a product change alters consequence order, AIA route structure, route burden, route memory, custody/refusal sequencing, or human closure.

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

The runner invokes the real shared engine:

- `app/engine/pedagogue-design-gate.js`
- `app/engine/flowcore-pedagogue-core.js`
- `app/engine/flowcore-pedagogue-aia.js`
- `app/engine/flowcore-pedagogue-route-memory.js`
- `app/engine/flowcore-pedagogue-practice-fixture.js`
- `app/engine/flowcore-route-burden.js`
- `app/engine/flowcore-aia-surface-binding.js`

Read the full contracts in [`docs/PEDAGOGUE_DESIGN_GATE.md`](docs/PEDAGOGUE_DESIGN_GATE.md) and [`docs/CANONICAL_PRACTICE_FIXTURE.md`](docs/CANONICAL_PRACTICE_FIXTURE.md).

## What the gate protects

- consequence before ontology;
- child-legible NOW / WHY / EXACT;
- non-equivalent AIA routes with preserved governed invariants;
- route-history preservation even when endpoints match;
- rest and exit without penalty;
- comparative burden rather than user diagnosis;
- recommendation, never automatic redesign;
- bounded station authority and mandatory human closure.

## Canonical Practice Fixture / calibration phantom

A consequential workspace may opt into a manifestly fictional known-ground-truth practice case when that case can inhabit the real operator route without fabricating evidence or widening authority.

The shared assay compares expected and observed Pedagogue route memory and reports a bounded route reconstruction error. It is a calibration surrogate only: it does not claim literal differential-geometric tomography, transport, curvature, or holonomy.

Practice fixtures remain authority-closed by default: no evidence authority, no external write authority, no production mutation, no automatic retrieval, no automatic release, and no authority crossing. Products may explicitly bound reversible local practice-state writes without converting them into real-world authority.

## How products teach the engine

A product fixture may reveal a reusable mechanism. Promote that mechanism into shared core only when it is generic, tested independently from the product that revealed it, and does not widen authority.

Keep product names and business rules in fixtures or product adapters. The shared Pedagogue core should describe the mechanism, not the product that happened to teach it.

A nested surface can also teach the architecture how to bind products into AIA without turning product names into new AIA routes. The generic `flowcore-aia-surface-binding.js` primitive binds a Dome-hosted surface to the four canonical non-equivalent AIA projections while preserving invariant verification, explicit route selection, bounded authority, rest/exit, and human closure.

Giving's Bikini Bottom sample is the first proving fixture for the practice-case law; Bikini Bottom itself remains test/product vocabulary and does not enter shared core.

See root [`AGENTS.md`](AGENTS.md) for the agent-facing entry contract.
