# Flow-Core Pedagogue

This is the repository shortcut into the Flow-Core Pedagogue design program.

Use it when a product change alters consequence order, AIA route structure, route burden, route memory, custody/refusal sequencing, or human closure.

## Run the Design Gate

```bash
node scripts/run-pedagogue-design-gate.mjs <fixture.json>
```

The runner invokes the real shared engine:

- `app/engine/pedagogue-design-gate.js`
- `app/engine/flowcore-pedagogue-core.js`
- `app/engine/flowcore-pedagogue-aia.js`
- `app/engine/flowcore-pedagogue-route-memory.js`
- `app/engine/flowcore-route-burden.js`

Read the full contract in [`docs/PEDAGOGUE_DESIGN_GATE.md`](docs/PEDAGOGUE_DESIGN_GATE.md).

## What the gate protects

- consequence before ontology;
- child-legible NOW / WHY / EXACT;
- non-equivalent AIA routes with preserved governed invariants;
- route-history preservation even when endpoints match;
- rest and exit without penalty;
- comparative burden rather than user diagnosis;
- recommendation, never automatic redesign;
- bounded station authority and mandatory human closure.

## How products teach the engine

A product fixture may reveal a reusable mechanism. Promote that mechanism into shared core only when it is generic, tested independently from the product that revealed it, and does not widen authority.

Keep product names and business rules in fixtures or product adapters. The shared Pedagogue core should describe the mechanism, not the product that happened to teach it.

See root [`AGENTS.md`](AGENTS.md) for the agent-facing entry contract.
