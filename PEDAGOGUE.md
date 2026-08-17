# Flow-Core Pedagogue

This is the repository shortcut into the Flow-Core Pedagogue design program.

Use it when a product change alters consequence order, AIA route structure, route burden, route memory, custody/refusal sequencing, human closure, or when a consequential workspace needs a harmless known-ground-truth practice route.

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
- `app/engine/pedagogue-practice-fixture.js`
- `app/engine/flowcore-pedagogue-core.js`
- `app/engine/flowcore-pedagogue-aia.js`
- `app/engine/flowcore-pedagogue-route-memory.js`
- `app/engine/flowcore-route-burden.js`
- `app/engine/flowcore-aia-surface-binding.js`

Read the full contracts in:

- [`docs/PEDAGOGUE_DESIGN_GATE.md`](docs/PEDAGOGUE_DESIGN_GATE.md)
- [`docs/CANONICAL_PRACTICE_FIXTURE.md`](docs/CANONICAL_PRACTICE_FIXTURE.md)

## What the gate protects

- consequence before ontology;
- child-legible NOW / WHY / EXACT;
- non-equivalent AIA routes with preserved governed invariants;
- route-history preservation even when endpoints match;
- rest and exit without penalty;
- comparative burden rather than user diagnosis;
- recommendation, never automatic redesign;
- bounded station authority and mandatory human closure.

## Canonical Practice Fixture

A Canonical Practice Fixture is a manifestly fictional, authority-closed practice case that declares the expected route through a real workspace.

The operator sees a Practice case or another product-native label. Research/test architecture may call the same object a calibration phantom when its known route is used to measure reconstruction error.

The fixture is not a mock product and not a second demo route. Loading it changes fictional labels/inputs only. It must not fabricate records, run retrieval, write custody, mutate a domain system, or grant authority. Explicit later gestures may exercise admitted read-only retrieval or reversible practice-custody writes while evidentiary and consequence authority stay closed.

A known-ground-truth practice observation begins only after the host workspace publishes its own settlement boundary. A visible endpoint or the presence of one early shell control is not enough: the practice baseline must be taken after the route-owning application has declared the relevant shell and background bootstrap settled. This keeps later route or zero-effect comparison from measuring ordinary hydration as if it were phantom residue.

Example:

```bash
npm run pedagogue:design -- tests/fixtures/pedagogue/giving-bikini-bottom-practice.json
```

The Ash/Loom calibration fixture remains test/research-only and does not bind the generic practice machinery into live Ash.

## How products teach the engine

A product fixture may reveal a reusable mechanism. Promote that mechanism into shared core only when it is generic, tested independently from the product that revealed it, and does not widen authority.

Keep product names and business rules in fixtures or product adapters. The shared Pedagogue core should describe the mechanism, not the product that happened to teach it.

A nested surface can also teach the architecture how to bind products into AIA without turning product names into new AIA routes. The generic `flowcore-aia-surface-binding.js` primitive binds a Dome-hosted surface to the four canonical non-equivalent AIA projections while preserving invariant verification, explicit route selection, bounded authority, rest/exit, and human closure.

A product-specific practice case follows the same promotion law: Bikini Bottom may teach the generic practice-fixture mechanic, but Bikini Bottom does not become Pedagogue ontology.

See root [`AGENTS.md`](AGENTS.md) for the agent-facing entry contract.
